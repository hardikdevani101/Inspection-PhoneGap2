var ImageEditorPage = function(app) {
	this.app = app;
	this.image64 = app.image64;
	this.fileURI = '';
	this.canWidth = '';
	this.canHeight = '';
	this.sourceInfo = '';
	this.contrast = '';
	this.brightness = '';
	this.isCropEnable = false;
	this.isEditEnable = true;
	this.curentImage = this.image64;
	this.gcanvas = $('#edit-canvase');
	this.editCtx = '';
	this.isCropperOn = false;
}

ImageEditorPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#pg_cropView #btn_user').html(_self.app.appCache.settingInfo.username);
};

ImageEditorPage.prototype.setup = function(options) {
	this.canWidth = options.width;
	this.canHeight = options.height;
	this.image64 = options.img64;
	this.sourceInfo = options.sourceInfo;
	this.selectedWM = options.watermark;
}

ImageEditorPage.prototype.drowRect = function(x, y, w, h) {
	var _self = this;
	_self.editCtx.beginPath();
	_self.editCtx.fillStyle = "#ffffff";
	_self.editCtx.fillRect(x, y, w, h);
	_self.editCtx.closePath();
	_self.editCtx.stroke();
}

ImageEditorPage.prototype.saveEditedImage = function() {
	var _self = this;
	var img = new Image();
	img.src = _self.gcanvas.toDataURL();
	img.onload = function() {
		applyWatermark(origImg);
	}
}

ImageEditorPage.prototype.enableEditMode = function() {
	$("#crop-image-container").hide();
	$("#edit-canvase").show();
	var _self = this;
	_self.gcanvas = $("#edit-canvase")[0];
	_self.bValue = 50;
	_self.cValue = 50;
	if (_self.gcanvas && _self.gcanvas.getContext) {
		_self.editCtx = _self.gcanvas.getContext("2d");
		var img = $('#img_editable').get(0);

		if (img.height < img.width && !((img.height / img.width) > .70)) {
			// if (img.height < img.width ) {
			_self.cropImageW = (_self.canHeight * 4) / 3;
			_self.cropImageH = (_self.cropImageW / img.width) * img.height;
		} else {
			_self.cropImageH = _self.canHeight;
			_self.cropImageW = (_self.cropImageH / img.height) * img.width;
		}

		// _self.gcanvas.height = _self.canHeight;
		// _self.gcanvas.width = _self.canWidth;
		_self.gcanvas.height = _self.cropImageH;
		_self.gcanvas.width = _self.cropImageW;
		_self.editCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0,
				_self.cropImageW, _self.cropImageH);

		var distanceBetween = function(point1, point2) {
			return Math.sqrt(Math.pow(point2.x - point1.x, 2)
					+ Math.pow(point2.y - point1.y, 2));
		}
		var angleBetween = function(point1, point2) {
			return Math.atan2(point2.x - point1.x, point2.y - point1.y);
		}
		var ctx = _self.editCtx;
		ctx.lineJoin = ctx.lineCap = 'round';
		var isDrawing, lastPoint;
		$(document).on("vmousemove", "#edit-canvase", function(e) {
			if (!isDrawing)
				return;
			var currentPoint = {
				x : e.clientX,
				y : e.clientY - 20
			};
			var dist = distanceBetween(lastPoint, currentPoint);
			var angle = angleBetween(lastPoint, currentPoint);
			for (var i = 0; i < dist; i += 5) {
				x = lastPoint.x + (Math.sin(angle) * i);
				y = lastPoint.y + (Math.cos(angle) * i);
				var radgrad = ctx.createRadialGradient(x, y, 10, x, y, 20);
				radgrad.addColorStop(0, '#FFF');
				radgrad.addColorStop(0.5, '#FFF');
				radgrad.addColorStop(1, '#FFF');

				_self.editCtx.fillStyle = radgrad;
				_self.editCtx.fillRect(x - 20, y - 20, 40, 40);
			}
			lastPoint = currentPoint;
		});
		$(document).on("vmousedown", "#edit-canvase", function(e) {
			isDrawing = true;
			lastPoint = {
				x : e.clientX,
				y : e.clientY - 20
			};
		});
		$(document).on("vmouseup", "#edit-canvase", function(e) {
			isDrawing = false;
			console.log(">>>>>>>>>>>>>vmouseup");
			$('#img_editable').attr('src', _self.gcanvas.toDataURL());
		})
	}
}

ImageEditorPage.prototype.cropFinished = function() {
	var _self = this;
	_self.croppedCanvas = _self.corpperImage.cropper("getCroppedCanvas", {
		width : 1024,
		height : 769
	});
	_self.currentImage = _self.croppedCanvas.toDataURL();
	_self.isEditEnable = true;
	_self.isCropEnable = false;
	$("#crop-toolbar").hide();
	$("#edit-toolbar").show();
	// _self.corpperImage
	$('#img_editable').attr('src', _self.currentImage);
	$('#img_editable').load(function() {
		_self.enableEditMode();
	});
	// .cropper("destroy");
}

ImageEditorPage.prototype.init = function() {
	var _self = this;
	$(document).on(
			"pagebeforeshow",
			"#pg_img_editor",
			function() {
				_self.rederBreadCrumb();
				_self.cValue = 0;
				_self.bValue = 0;
//				$("#txt_prefix").val($('#prefixInpectLine').html());
//				$('#btn_filter_ok')
//						.on(
//								'click',
//								function() {
//									$("#prefixInpectLine").html(
//											$('#txt_prefix').val());
//									if ($("#prefixInpectLine").data('id'))
//										_self.app.appCache.prefixCache[$(
//												"#prefixInpectLine").data('id')
//												.toString()] = $('#txt_prefix')
//												.val();
//								});

				$("#slider-brightness").on("slidestop", function(event) {
					_self.brightness = event.target.value;
					_self.onBrightnessChange(event);
				});

				$("#slider-contrast").on("slidestop", function(event) {
					_self.contrast = event.target.value;
					_self.onContrastChange(event);
				});

				$('.img-container').html(
						[ '<img id="img_editable" src="' + _self.image64
								+ '" />' ].join(''));
				$("#img_editable").load(function() {
					console.log(">>>>>>>>>>img_editable ");
					_self.initCropMode();
					_self.enableEditMode();
				});

				$("#crop-toolbar").hide();
				$("#edit-toolbar").show();
				$("#btn_skip_edit").on("tap", function() {
					$.mobile.changePage("#pg_gallery");
				});

				$("#btn_add_watermark").on("tap", function() {
					_self.applyWatermark();
				});

				$("#btn_reset").on("tap", function() {
					$("#slider-brightness").val(0).slider("refresh");
					$("#slider-contrast").val(0).slider("refresh");
					_self.cValue = 0;
					_self.bValue = 0;
					var img = $('#img_editable').attr('src', _self.image64);
					_self.enableEditMode();
					_self.isCropEnable = false;
					_self.isEditEnable = true;
					$("#crop-toolbar").hide();
					$("#edit-toolbar").show();
					_self.corpperImage.cropper("destroy");
				});

				$("#btn_edit_finished").on("tap", function() {
					_self.onEditFinish();
				});
				$("#btn_crop").on("tap", function() {
					if (_self.isCropEnable) {
						$("#crop-image-container").hide();
						$("#edit-canvase").show();
						$("#crop-toolbar").hide();
						$("#edit-toolbar").show();
						_self.isCropEnable = false;
						_self.isEditEnable = true;
						// _self.corpperImage.cropper("destroy");
						_self.enableEditMode();
					} else {
						_self.isCropEnable = true;
						_self.isEditEnable = false;
						$("#crop-image-container").show();
						$("#edit-canvase").hide();
						$("#edit-toolbar").hide();
						$("#crop-toolbar").show();
						_self.enableCropMode();
						_self.corpperImage.cropper("setDragMode", "crop");

					}
				});
			});
};

ImageEditorPage.prototype.enableCropMode = function() {
	var _self = this;
	if (_self.isCropperOn) {
		_self.initCropMode();
	}
	if (_self.gcanvas) {
		URL = window.URL || window.webkitURL;
		_self.corpperImage.one('built.cropper', function() {
			URL.revokeObjectURL(_self.gcanvas.toDataURL());
		}).cropper('reset').cropper('replace', _self.gcanvas.toDataURL());
	}
}

ImageEditorPage.prototype.onContrastChange = function(event) {
	var _self = this;

	var _self = this;
	var contraValue = event.target.value - _self.cValue;
	var contraImageData = _self.editCtx.getImageData(0, 0, _self.gcanvas.width,
			_self.gcanvas.height);
	var data = contraImageData.data;
	var factor = (259 * (contraValue + 255)) / (255 * (259 - contraValue));
	for (var i = 0; i < data.length; i += 4) {
		data[i] = factor * (data[i] - 128) + 128;
		data[i + 1] = factor * (data[i + 1] - 128) + 128;
		data[i + 2] = factor * (data[i + 2] - 128) + 128;
	}
	_self.editCtx.putImageData(contraImageData, 0, 0);
	_self.cValue = event.target.value;
}

ImageEditorPage.prototype.onBrightnessChange = function(event) {
	var _self = this;

	var brightValue = event.target.value - _self.bValue;
	var brightImageData = _self.editCtx.getImageData(0, 0, _self.gcanvas.width,
			_self.gcanvas.height);
	var pixels = brightImageData.data;
	for (var i = 0; i < pixels.length; i += 4) {
		pixels[i] += brightValue;
		pixels[i + 1] += brightValue;
		pixels[i + 2] += brightValue;
	}
	_self.editCtx.putImageData(brightImageData, 0, 0);
	_self.bValue = event.target.value;
}

ImageEditorPage.prototype.initCropMode = function() {
	var _self = this;
	var $image = $('#img_editable'), $dataX = $('#dataX'), $dataY = $('#dataY'), $dataHeight = $('#dataHeight'), $dataWidth = $('#dataWidth'), $dataRotate = $('#dataRotate');
	var options = {
		highlight : true,
		rotatable : true,
		zoomable : true,
		touchDragZoom : true,
		// minCanvasWidth : _self.canWidth,
		// minCanvasHeight : _self.canHeight,
		// minCropBoxWidth: '160',
		// minCropBoxHeight: '90',
		maxContainerWidth : _self.cropImageW,
		maxContainerHeight : _self.cropImageH,
		// build: null,
		// built: null,
		// dragstart: null,
		// dragmove: null,
		// dragend: null,
		// zoomin: null,
		// zoomout: null,
		aspectRatio : 4 / 3,
		crop : function(data) {
			$dataX.val(Math.round(data.x));
			$dataY.val(Math.round(data.y));
			$dataHeight.val(Math.round(data.height));
			$dataWidth.val(Math.round(data.width));
			$dataRotate.val(Math.round(data.rotate));
		}
	};

	$image.on({
		'build.cropper' : function(e) {
			// console.log(e.type);
		},
		'built.cropper' : function(e) {
			// console.log(e.type);
		},
		'dragstart.cropper' : function(e) {
			// console.log(e.type, e.dragType);
		},
		'dragmove.cropper' : function(e) {
			// console.log(e.type, e.dragType);
		},
		'dragend.cropper' : function(e) {
			// console.log(e.type, e.dragType);
		},
		'zoomin.cropper' : function(e) {
			// console.log(e.type);
		},
		'zoomout.cropper' : function(e) {
			// console.log(e.type);
		}
	}).cropper(options);

	_self.corpperImage = $image;

	$("#btn_zoom_plus").on("tap", function() {
		_self.corpperImage.cropper("zoom", 0.1);
	});

	$("#btn_zoom_minus").on("tap", function() {
		_self.corpperImage.cropper("zoom", -0.1);
	});

	$(document).on("vmouseup", "#btn_crop_zoom_plus", function(e) {
		_self.cropResize = false;
	});

	$(document).on("taphold", "#btn_crop_zoom_plus", function(e) {
		_self.cropResize = true;
		_self.setCropBoxData(10);
	});

	$(document).on("vmouseup", "#btn_crop_zoom_minus", function(e) {
		_self.cropResize = false;
		console.log("vmouseup>>>>>>>>>>>>>>")
	});

	$(document).on("taphold", "#btn_crop_zoom_minus", function(e) {
		_self.cropResize = true;
		//_self.setCropBoxData(-10);
		console.log("taphold>>>>>>>>>>>>>>")
	});

	/*
	 * $("#btn_crop_zoom_plus").on("touchstart", function() { _self.cropResize =
	 * true; _self.setCropBoxData(10); });
	 * 
	 * $("#btn_crop_zoom_minus").on("touchstart", function() { _self.cropResize =
	 * true; _self.setCropBoxData(-10); });
	 * 
	 * $("#btn_crop_zoom_plus").on("touchstop", function() { _self.cropResize =
	 * false; });
	 * 
	 * $("#btn_crop_zoom_minus").on("touchstop", function() { _self.cropResize =
	 * false; });
	 */

	$("#btn_rotate_left").on("tap", function() {
		_self.corpperImage.cropper("rotate", -45);
	});

	$("#btn_rotate_right").on("tap", function() {
		_self.corpperImage.cropper("rotate", 45);
	});

	$("#btn_crop_move").on("tap", function() {
		_self.corpperImage.cropper("setDragMode", "move");
	});

	$("#btn_crop_finished").on("tap", function() {
		_self.cropFinished();
	});

	_self.isCropperOn = true;
}

ImageEditorPage.prototype.setCropBoxData = function(param) {
	var _self = this;
	while (true) {
		if (!_self.cropResize) {
			break;
		} else {
			var data = _self.corpperImage.cropper("getCropBoxData");
			data.width = data.width + param;
			_self.corpperImage.cropper("setCropBoxData", data);
		}
	}
}

ImageEditorPage.prototype.onEditFinish = function() {
	var _self = this;
	// this selectedWM = $('select[name="select-crop-waterMark"]').val();
	// TODO: getWatermark image data from appCache.
	var watermarkImage = _self.app.watermark64;
	if (_self.selectedWM) {
		var findResult = jQuery.grep(_self.app.appCache.waterMarkImgs,
				function(item, index) {
					return item.url == _self.selectedWM;
				});
		if (findResult.length > 0) {
			watermarkImage = findResult[0].data;
		}
	}

	var watermark = new Image();
	watermark.src = watermarkImage;
	// var sourceImage = $('#img_editable').get(0);
	watermark.onload = function() {
		// _self.gcanvas = document.createElement('canvas');

		var origImg = new Image();
		origImg.src = _self.gcanvas.toDataURL();
		origImg.onload = function() {

			nGcanvas = document.createElement('canvas');
			nGctx = nGcanvas.getContext("2d");
			nGcanvas.width = 1024;
			nGcanvas.height = 768;
			nGctx.drawImage(origImg, 0, 0, origImg.width, origImg.height, 0, 0,
					1024, 768);

			x = (nGcanvas.width - 20) - (watermark.width);
			y = (nGcanvas.height - 20) - (watermark.height);
			nGctx.drawImage(watermark, x, y);
			_self.app.galleryview.onEditFinish(_self.sourceInfo, nGcanvas
					.toDataURL());
			$.mobile.changePage("#pg_gallery");
		}
	}
}
