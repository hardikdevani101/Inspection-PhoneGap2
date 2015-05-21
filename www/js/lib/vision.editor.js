(function($) {
	var methods = {

		init : function(options) {
			return this
					.each(function() {

						var $this = $(this), data = $this.data('veditor');
						if (!data) {
							var handleImage = function() {
								var width = $this.width(), height = $this
										.height(), pos = $this.offset(), $canvas = $('<canvas/>'), canvas = $canvas
										.get(0), size = (options && options.size) ? options.size
										: 40, completeRatio = (options && options.completeRatio) ? options.completeRatio
										: .7, completeFunction = (options && options.completeFunction) ? options.completeFunction
										: null, progressFunction = (options && options.progressFunction) ? options.progressFunction
										: null, zIndex = $this.css('z-index') == "auto" ? 1
										: $this.css('z-index'), parts = [], colParts = Math
										.floor(width / size), numParts = colParts
										* Math.floor(height / size), n = numParts, ctx = canvas
										.getContext('2d'), that = $this[0];

								// replace target with canvas
								$this.after($canvas);
								canvas.id = that.id;
								canvas.className = that.className;

								canvas.height = $(window).height();
								if (options && options.canvasHeight) {
									canvasHeight = options.canvasHeight;
								}

								if (options && options.heightReduction) {
									canvas.height = canvasHeight
											- options.heightReduction;
								}

								canvas.width = $(window).width();
								if (options && options.canvasWidth) {
									canvasWidth = options.canvasWidth;
								}

								if (options && options.widthReduction) {
									canvas.width = canvasWidth
											- options.widthReduction;
								}

								canvas.height = canvasHeight;
								canvas.width = canvasWidth;

								ctx.drawImage(that, 0, 0, that.width,
										that.height, 0, 0, canvasWidth,
										canvasHeight);

								$this.remove();

								// prepare context for drawing operations
								// ctx.globalCompositeOperation =
								// 'destination-out';
								ctx.strokeStyle = 'rgba(255,255,255,255)';
								ctx.lineWidth = size;
								ctx.lineCap = 'round';

								// bind events
								$canvas.bind('mousedown.veditor',
										methods.mouseDown);
								$canvas.bind('touchstart.veditor',
										methods.touchStart);
								$canvas.bind('touchmove.veditor',
										methods.touchMove);
								$canvas.bind('touchend.veditor',
										methods.touchEnd);

								// reset parts
								while (n--)
									parts.push(1);

								// store values
								data = {
									previewImgId : (options && options.previewImgId) ? options.previewImgId
											: null,
									posX : pos.left,
									posY : pos.top,
									touchDown : false,
									touchID : -999,
									touchX : 0,
									touchY : 0,
									ptouchX : 0,
									ptouchY : 0,
									canvas : $canvas,
									ctx : ctx,
									w : canvasWidth,
									h : canvasHeight,
									source : that,
									size : size,
									parts : parts,
									colParts : colParts,
									numParts : numParts,
									ratio : 0,
									complete : false,
									completeRatio : completeRatio,
									completeFunction : completeFunction,
									progressFunction : progressFunction,
									zIndex : zIndex
								};
								$canvas.data('veditor', data);

								// listen for resize event to update offset
								// values
								$(window).resize(function() {
									var pos = $canvas.offset();
									data.posX = pos.left;
									data.posY = pos.top;
								});
							}

							if (this.complete && this.naturalWidth > 0) {
								handleImage();
							} else {
								// this.onload = handleImage;
								$this.load(handleImage);
							}
						}
					});
		},

		touchStart : function(event) {

			var $this = $(this), data = $this.data('veditor');

			if (!data.touchDown) {
				var t = event.originalEvent.changedTouches[0], tx = t.pageX
						- data.posX, ty = t.pageY - data.posY;
				methods.evaluatePoint(data, tx, ty);
				data.touchDown = true;
				data.touchID = t.identifier;
				data.touchX = tx;
				data.touchY = ty;
				event.preventDefault();
			}
		},

		touchMove : function(event) {

			var $this = $(this), data = $this.data('veditor');

			if (data.touchDown) {
				var ta = event.originalEvent.changedTouches, n = ta.length;
				while (n--) {
					if (ta[n].identifier == data.touchID) {
						var tx = ta[n].pageX - data.posX, ty = ta[n].pageY
								- data.posY;
						methods.evaluatePoint(data, tx, ty);
						data.ctx.beginPath();
						data.ctx.moveTo(data.touchX, data.touchY);
						data.touchX = tx;
						data.touchY = ty;
						// data.ctx.strokeStyle = "#FF0000";
						data.ctx.lineTo(data.touchX, data.touchY);
						data.ctx.stroke();
						// data.ctx.arc(data.touchX, data.touchY, 20, 0, 2 *
						// Math.PI);
						// data.ctx.fillStyle="#FF0000";
						// data.ctx.fill();
						// data.ctx.lineCap = "round";
						$this
								.css({
									"z-index" : $this.css('z-index') == data.zIndex ? parseInt(data.zIndex) + 1
											: data.zIndex
								});
						event.preventDefault();
						break;
					}
				}
			}
		},

		touchEnd : function(event) {

			var $this = $(this), data = $this.data('veditor');

			if (data.touchDown) {
				var ta = event.originalEvent.changedTouches, n = ta.length;
				while (n--) {
					if (ta[n].identifier == data.touchID) {
						data.touchDown = false;
						event.preventDefault();
						break;
					}
				}
			}
			if (data.previewImgId != null) {
				$('#' + data.previewImgId).attr('src', $this[0].toDataURL());
			}
		},

		evaluatePoint : function(data, tx, ty) {
			var p = Math.floor(tx / data.size) + Math.floor(ty / data.size)
					* data.colParts;

			if (p >= 0 && p < data.numParts) {
				data.ratio += data.parts[p];
				data.parts[p] = 0;
				if (!data.complete) {
					p = data.ratio / data.numParts;
					if (p >= data.completeRatio) {
						data.complete = true;
						if (data.completeFunction != null)
							data.completeFunction();
					} else {
						if (data.progressFunction != null)
							data.progressFunction(p);
					}
				}
			}

		},

		mouseDown : function(event) {

			var $this = $(this), data = $this.data('veditor'), tx = event.pageX
					- data.posX, ty = event.pageY - data.posY;

			methods.evaluatePoint(data, tx, ty);
			data.touchDown = true;
			data.touchX = tx;
			data.touchY = ty;
			data.ctx.beginPath();
			data.ctx.moveTo(data.touchX - 1, data.touchY);
			data.ctx.lineTo(data.touchX, data.touchY);
			data.ctx.stroke();
			$this.bind('mousemove.veditor', methods.mouseMove);
			$(document).bind('mouseup.veditor', data, methods.mouseUp);
			event.preventDefault();
		},

		mouseMove : function(event) {
			var $this = $(this), data = $this.data('veditor'), tx = event.pageX
					- data.posX, ty = event.pageY - data.posY;

			methods.evaluatePoint(data, tx, ty);
			data.ctx.beginPath();
			data.ctx.moveTo(data.touchX, data.touchY);
			data.touchX = tx;
			data.touchY = ty;
			data.ctx.lineTo(data.touchX, data.touchY);
			data.ctx.stroke();
			$this
					.css({
						"z-index" : $this.css('z-index') == data.zIndex ? parseInt(data.zIndex) + 1
								: data.zIndex
					});
			event.preventDefault();
		},

		mouseUp : function(event) {

			var data = event.data, $this = data.canvas;

			data.touchDown = false;
			$this.unbind('mousemove.veditor');
			$(document).unbind('mouseup.veditor');
			event.preventDefault();
			if (data.previewImgId != null) {
				$('#' + data.previewImgId).attr('src', $this[0].toDataURL());
			}
		},

		clear : function() {
			var $this = $(this), data = $this.data('veditor');

			if (data) {
				data.ctx.clearRect(0, 0, data.w, data.h);
				var n = data.numParts;
				while (n--)
					data.parts[n] = 0;
				data.ratio = data.numParts;
				data.complete = true;
				if (data.completeFunction != null)
					data.completeFunction();
			}
		},

		size : function(value) {
			var $this = $(this), data = $this.data('veditor');

			if (data && value) {
				data.size = value;
				data.ctx.lineWidth = value;
			}
		},

		reset : function() {
			var $this = $(this), data = $this.data('veditor');

			if (data) {
				data.ctx.globalCompositeOperation = 'source-over';
				// data.ctx.drawImage( data.source, 0, 0 );
				data.ctx.clearRect(0, 0, data.w, data.h);
				data.ctx.drawImage(data.source, 0, 0, data.source.width,
						data.source.height, 0, 0, data.w, data.h);
				// data.ctx.globalCompositeOperation = 'destination-out';
				if (data.previewImgId != null) {
					$('#' + data.previewImgId).attr('src', data.source.src);
				}
				var n = data.numParts;
				while (n--)
					data.parts[n] = 1;
				data.ratio = 0;
				data.complete = false;
				data.touchDown = false;
			}
		},
		setPreviewImageData : function() {
			var $this = $(this), data = $this.data('veditor');

			if (data) {
				data.ctx.globalCompositeOperation = 'source-over';
				// data.ctx.drawImage( data.source, 0, 0 );
				if ($("#" + data.previewImgId)) {
					img = $("#" + data.previewImgId)[0];
					data.ctx.clearRect(0, 0, data.w, data.h);
					data.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0,
							data.w, data.h);
				}
				// data.ctx.globalCompositeOperation = 'destination-out';
				var n = data.numParts;
				while (n--)
					data.parts[n] = 1;
				data.ratio = 0;
				data.complete = false;
				data.touchDown = false;
			}
		},
		progress : function() {
			var $this = $(this), data = $this.data('veditor');

			if (data) {
				return data.ratio / data.numParts;
			}
			return 0;
		}

	};

	$.fn.veditor = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(
					arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method
					+ ' does not yet exist on jQuery.veditor');
		}
	};
})(jQuery);
