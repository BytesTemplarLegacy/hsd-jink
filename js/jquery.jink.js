(function(jQuery) {
	var jinkusecount = 0;
	var c2i_loaded = false;

	jQuery.getScript("js/canvas2image.js", function(){c2i_loaded = true;});

	jQuery.fn.ink = function(options)
	{
		var defaults = {
			//width:	undefined
			//, height:	undefined
			pen_color:	"#000070"
			, pen_size: 	1
			, cursor:	"crosshair"
			, mode:		"bitmap"	// bitmap, points
		};


		var options = jQuery.extend(defaults, options);

		jQuery(document).mouseup(function(){
			jQuery(".jink").data('penUp')();
		});

		return this.each(function()
		{
			var target = jQuery(this);

			// TODO: transparent loading div

			target[0].onload = function()
			{
				jinkusecount++;

				/*-------------------------------------*/
				// Create a new <canvas> element, matching width, height, and position
				var ct = jQuery("<canvas width="+target.width()+" height="+target.height()+">Sorry, your browser does not support HTML5's canvas tag.</canvas>");

				// Give it an ID
				ct.attr("id",		"jink-"+jinkusecount);

				//position it on top of the target element
				ct.css("position", 	"absolute");
				ct.addClass("jink");
				ct.css("top", 		target[0].offsetTop);
				ct.css("left", 		target[0].offsetLeft);
				//ct.css("border", 	"1px solid black"); // for debugging
				ct.css("cursor", 	options.cursor);

				// Insert the new element after the target element
				target.after(ct);

				// Store our objects for later use
				jQuery.data(target[0], "vars", {
					context:	ct[0].getContext('2d')
					,pendown:	false
					,canvas_el:	ct[0]
					,oldx:		undefined
					,oldy:		undefined
				});

				// Store options for later use
				jQuery.data(target[0], "options", options);
				
				// Handle mouse events across the canvas
				ct.mousedown(function(e){

					var vars = jQuery.data(target[0], "vars");
					vars.pendown = true;
					
					// Record the initial pendown location
					vars.oldx = e.pageX - this.offsetLeft;
					vars.oldy = e.pageY - this.offsetTop;
					
					jQuery.data(target[0], "vars");
					return false;

				})
				.mouseup(function(e){
					var vars = jQuery.data(target[0], "vars");
					var x = e.pageX - this.offsetLeft;
					var y = e.pageY - this.offsetTop;

					// If the pen didn't actually move, make a mark anyway (for individual points)
					if (x == vars.oldx && y == vars.oldy) {
						drawLine(x, y, x+1, y+1, target[0]);
					}
					
					penUp();
					jQuery.data(target[0], "vars");
				})
				.mousemove(function(e){
					var vars = jQuery.data(target[0], "vars");
					
					// Only draw when we're holding down with a mouse click
					if (vars.pendown) {
						var x = e.pageX - this.offsetLeft;
						var y = e.pageY - this.offsetTop;

						drawLine(x, y, vars.oldx, vars.oldy, target[0]);

						vars.oldx = x;
						vars.oldy = y;
						jQuery.data(target[0], "vars");
					}
					return false;
				})
				.mouseover(function(e) {
					target.addClass('inkActive');
					console.log(this.previousElementSibling);
					//console.log(target[0].nextElementSibling);
					this.previousElementSibling.focus();
					this.previousElementSibling.onkeydown = function(e) {
						alert("hi");	
					};
				})
				.mouseout(function(e) {
					target.removeClass('inkActive');
				})
				// Providing this hook so I can reset the pen on all the jink surfaces globally
				.data('penUp', function() {
					penUp();
				});
				
				function penUp()
				{
					var vars = jQuery.data(target[0], "vars");
					vars.pendown = false;
					jQuery.data(target[0], "vars");
				}				

				function drawLine(x,y,xx,yy,target)
				{
					var options = jQuery.data(target, "options");
					var vars = jQuery.data(target, "vars");

					vars.context.beginPath();

					vars.context.strokeStyle = options.pen_color;
					vars.context.lineWidth = options.pen_size;
					//vars.context.lineCap  = "round";
					vars.context.lineJoin = "round";

					vars.context.moveTo(x,y);
					vars.context.lineTo(xx, yy);
					vars.context.closePath();

					vars.context.stroke();
				}
				/*-------------------------------------*/
			};

		});
		return this;
	};

	/* -----------------------------------------------------------------*/
	jQuery.fn.inkOption = function(key, value)
	{
		var target = jQuery(this);
		var options = jQuery.data(target[0], "options");

		options[key] = value;

		jQuery.data(target[0], "options", options);

		return this;
	};


	/* -----------------------------------------------------------------*/
	jQuery.fn.inkSave = function(options)
	{
		var defaults = {
			format:	"png"
		};
		var options = jQuery.extend(defaults, options);

		if (c2i_loaded == false) {
			alert("SAVE FAILED: External library was not loaded (canvas2image).");
			return;
		}

		return this.each(function()
		{
			var target = jQuery(this);

			var options = jQuery.data(target[0], "vars");

			return this;
		});

		return this;
	};

	/* -----------------------------------------------------------------*/
	jQuery.fn.inkDataURL = function(options)
	{
		var defaults = {
			format:	"png"
		};
		var options = jQuery.extend(defaults, options);


		var target = jQuery(this);
		var canv = jQuery.data(target[0], "vars");

		return canv.canvas_el.toDataURL();
	};

}) (jQuery);