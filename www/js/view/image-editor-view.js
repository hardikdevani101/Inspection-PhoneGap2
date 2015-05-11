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
	$('#pg_cropView #btn_user').html(
			$(_self.app.appCache.loginInfo.username).val());
};

ImageEditorPage.prototype.setup = function(options) {
	this.canWidth = options.width;
	this.canHeight = options.height;
	this.image64 = options.img64;
	this.sourceInfo = options.sourceInfo;
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
	_self.bValue = 50, _self.cValue = 50;
	if (_self.gcanvas && _self.gcanvas.getContext) {
		_self.editCtx = _self.gcanvas.getContext("2d");
		var img = $('#img_editable').get(0);
		_self.gcanvas.height = img.height;
		_self.gcanvas.width = img.width;
		_self.editCtx.drawImage(img, 0, 0, img.width, img.height);
		_self.gcanvas.addEventListener("touchmove", function(e) {
			_self.canX1 = e.targetTouches[0].pageX - 10;
			_self.canY1 = e.targetTouches[0].pageY - 50;
			_self.gcanvas.offsetTop;
			_self.editCtx.clearRect(0, 0, img.width, img.height);
			_self.editCtx.putImageData(_self.editedCanvase, 0, 0);
			_self.drowRect(_self.canX, _self.canY, _self.canX1 - _self.canX,
					_self.canY1 - _self.canY);
		}, true);
		_self.gcanvas.addEventListener("touchstart", function(e) {
			_self.canX = e.targetTouches[0].pageX - _self.gcanvas.offsetLeft;
			_self.canY = e.targetTouches[0].pageY - _self.gcanvas.offsetTop;
			_self.editedCanvase = _self.editCtx.getImageData(0, 0,
					_self.gcanvas.width, _self.gcanvas.height);
		}, false);
		_self.gcanvas.addEventListener("touchend", function(e) {
			_self.editedCanvase = _self.editCtx.getImageData(0, 0,
					_self.gcanvas.width, _self.gcanvas.height);
			$('#img_editable').attr('src', _self.gcanvas.toDataURL());

		}, false);
	}
}

ImageEditorPage.prototype.cropFinished = function() {
	var _self = this;
	_self.croppedCanvas = _self.corpperImage.cropper("getCroppedCanvas");
	_self.currentImage = _self.croppedCanvas.toDataURL();
	_self.isEditEnable = true;
	_self.isCropEnable = false;
	$("#crop-toolbar").hide();
	// _self.corpperImage
	$('#img_editable').attr('src', _self.currentImage);
	// .cropper("destroy");
	_self.enableEditMode();
}

ImageEditorPage.prototype.init = function(width, height, img64) {
	var _self = this;
	$(document)
			.on(
					"pagebeforeshow",
					"#pg_img_editor",
					function() {
						_self.rederBreadCrumb();
						_self.brightness = $("#slider-brightness").val();
						console.log("Init Brightness>>>  " + _self.brightness);
						$("#slider-brightness").on("change", function(event) {
							_self.brightness = event.target.value;
							console.log("Brightness>>>  " + _self.brightness);
						});
						_self.contrast = $("#slider-contrast").val();
						console.log("Init Contrast>>>>>  " + _self.contrast);
						$("#slider-contrast").on("change", function(event) {
							_self.contrast = event.target.value;
							console.log("Contrast>>>>>  " + _self.contrast);
						});
						$('.img-container').html(
								[ '<img id="img_editable" src="',
										_self.image64, '" />' ].join(''));
						_self.initCropMode()
						_self.enableEditMode();

						$("#crop-toolbar").hide();
						$("#btn_skip_edit").on("tap", function() {
							$.mobile.changePage("#pg_gallery");
						});

						$("#btn_add_watermark").on("tap", function() {
							_self.applyWatermark();
						});

						$("#btn_reset").on(
								"tap",
								function() {
									var img = $('#img_editable').attr('src',
											_self.image64);
									_self.enableEditMode();
								});

						$("#btn_edit_finished").on(
								"tap",
								function() {
									_self.applyWatermark()
									_self.app.galleryview.onEditFinish(
											_self.sourceInfo, _self.gcanvas
													.toDataURL());
									$.mobile.changePage("#pg_gallery");
								});
						$("#btn_crop").on(
								"tap",
								function() {
									console.log("btn_crop >>> Taped");
									if (_self.isCropEnable) {
										$("#crop-image-container").hide();
										$("#edit-canvase").show();
										$("#crop-toolbar").hide();
										_self.isCropEnable = false;
										_self.isEditEnable = true;
										// _self.corpperImage.cropper("destroy");
										_self.enableEditMode();
									} else {
										_self.isCropEnable = true;
										_self.isEditEnable = false;
										$("#crop-image-container").show();
										$("#edit-canvase").hide();
										$("#crop-toolbar").show();
										_self.enableCropMode();
										_self.corpperImage.cropper(
												"setDragMode", "crop");

									}
								});

						if (_self.app.appCache.waterMarkImgs.length > 0) {
							$('select[name="select-crop-waterMark"]').empty();
							$
									.each(
											_self.app.appCache.waterMarkImgs,
											function() {
												$(
														'select[name="select-crop-waterMark"]')
														.append(
																$(
																		"<option></option>")
																		.val(
																				this.url)
																		.html(
																				this.name));
											});
						}
						$('select[name="select-crop-waterMark"]').selectmenu(
								'refresh');
					});
};

ImageEditorPage.prototype.enableCropMode = function() {
	var _self = this;
	if (_self.isCropperOn) {
		_self.initCropMode();
	}
	if (_self.gcanvas) {
		URL = window.URL || window.webkitURL
		_self.corpperImage.one('built.cropper', function() {
			URL.revokeObjectURL(_self.gcanvas.toDataURL());
		}).cropper('reset').cropper('replace', _self.gcanvas.toDataURL());
	}
}

ImageEditorPage.prototype.initCropMode = function() {
	var _self = this;
	var $image = $('#img_editable'), $dataX = $('#dataX'), $dataY = $('#dataY'), $dataHeight = $('#dataHeight'), $dataWidth = $('#dataWidth'), $dataRotate = $('#dataRotate'), options = {
		highlight : true,
		rotatable : true,
		zoomable : true,
		touchDragZoom : true,
		minCanvasWidth : _self.canWidth,
		minCanvasHeight : _self.canHeight,
		// minCropBoxWidth: '160',
		// minCropBoxHeight: '90',
		minContainerWidth : _self.canWidth,
		minContainerHeight : _self.canHeight,
		// build: null,
		// built: null,
		// dragstart: null,
		// dragmove: null,
		// dragend: null,
		// zoomin: null,
		// zoomout: null,
		aspectRatio : 16 / 9,
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

ImageEditorPage.prototype.applyWatermark = function() {
	var _self = this;
	var selectedWM = $('select[name="select-crop-waterMark"]').val();
	// TODO: getWatermark image data from appCache.
	var watermarkImage = _self.app.watermark64;
	if (selectedWM) {
		var findResult = jQuery.grep(_self.app.appCache.waterMarkImgs,
				function(item, index) {
					return item.url == selectedWM;
				});
		if (findResult.length > 0) {
			watermarkImage = findResult[0].data;
		}
	}

	var watermark = new Image();
	watermark.src = watermarkImage;
	var sourceImage = $('#img_editable').get(0);
	watermark.onload = function() {
		_self.gcanvas = document.createElement('canvas');
		x = (_self.gcanvas.width - 20);
		y = (_self.gcanvas.height - 20);
		_self.editCtx.drawImage(watermark, x, y);
		var encoder = new JPEGEncoder();
		// var img64 = encoder.encode(_self.editCtx.getImageData(0, 0, 1024,
		// 768),
		// parseInt(80)).replace(/data:image\/jpeg;base64,/, '');
		// _self.curentImage = Base64Binary.decodeArrayBuffer(img64);
		// $('#img_editable').attr('src', _self.gcanvas.);
		// _self.editedCanvase = _self.editCtx.getImageData(0, 0,
		// _self.gcanvas.width, _self.gcanvas.height);
		$('#img_editable').attr('src', _self.gcanvas.toDataURL());
	}
}
