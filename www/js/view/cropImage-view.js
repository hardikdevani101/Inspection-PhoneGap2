var CropImagePage = function(app) {
	this.app = app;
	this.image64 = app.image64;
	this.fileURI = '';
	this.canWidth = '';
	this.canHeight = '';
	this.isCropEnable = false;
	this.isEditEnable = true;
	this.currentImgSrc = this.image64;
	this.gcanvas = $('#edit-canvase');
	this.editCtx = '';
}

CropImagePage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#pg_cropView #btn_user').html(
			$(_self.app.appCache.loginInfo.username).val());
};

CropImagePage.prototype.setup = function(options) {
	this.canWidth = options.width;
	this.canHeight = options.height;
	this.image64 = options.img64;
}

CropImagePage.prototype.drowRect = function(x, y, w, h) {
	var _self = this;
	_self.editCtx.beginPath();
	_self.editCtx.fillStyle = "#ffffff";
	_self.editCtx.fillRect(x, y, w, h);
	_self.editCtx.closePath();
	_self.editCtx.stroke();
}

CropImagePage.prototype.saveEditedImage = function() {
	var _self = this;
	var img = new Image();
	img.src = _self.gcanvas.toDataURL();
	img.onload = function() {
		applyWatermark(origImg);
	}
}

CropImagePage.prototype.enableEditMode = function() {
	$("#crop-image-container").hide();
	$("#edit-canvase").show();
	
	var _self = this;
	_self.gcanvas = $("#edit-canvase")[0];
	_self.bValue = 50, _self.cValue = 50;
	if (_self.gcanvas && _self.gcanvas.getContext) {
		_self.editCtx = _self.gcanvas.getContext("2d");
		var img = $('.img-container img')[0];
		_self.gcanvas.height = img.height;
		_self.gcanvas.width = img.width;
		_self.editCtx.drawImage(img, 0, 0, img.width,
				img.height);
		_self.gcanvas.addEventListener("touchmove", function(e) {
			_self.canX1 = e.targetTouches[0].pageX - 10;//- _self.gcanvas.offsetLeft;
			_self.canY1 = e.targetTouches[0].pageY - 50;_self.gcanvas.offsetTop;
			_self.editCtx.clearRect(0, 0, img.width,
					img.hight);
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
		}, false);

	}
}

// CropImagePage.prototype.onPhotoEdit = function(param) {
// var _self = this;
// var image64 = param.data;
// var tmpImg = new Image();
// tmpImg.onload = function() {
// var randerHeight = window.innerHeight * 0.70;
// var cropImageW, cropImageH;
// if (this.height < this.width && !((this.height / this.width) > .70)) {
// cropImageW = (randerHeight * 4) / 3;
// cropImageH = (cropImageW / this.width) * this.height;
// } else {
// cropImageH = randerHeight;
// cropImageW = (cropImageH / this.height) * this.width;
// }
// var cropImage = new CropImagePage(_self.app, image64, param.fileURI);
// cropImage.init(cropImageW, cropImageH);
// $.mobile.changePage("#pg_cropView");
// tmpImg = null;
// }
// tmpImg.src = image64;
// }

CropImagePage.prototype.init = function(width, height, img64) {
	var _self = this;

	$(document)
			.on(
					"pagebeforeshow",
					"#pg_img_cropper",
					function() {
						_self.rederBreadCrumb();
						// Load Image
						// initialize Cropper
						$('.img-container').html([ '<img src="', _self.image64, '" />' ].join(''));
						_self.enableEditMode();

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

CropImagePage.prototype.enableCropMode = function() {
	var _self = this;
	$("#crop-image-container").show();
	$("#edit-canvase").hide();

	var $image = $('.img-container > img'), $dataX = $('#dataX'), $dataY = $('#dataY'), $dataHeight = $('#dataHeight'), $dataWidth = $('#dataWidth'), $dataRotate = $('#dataRotate'), options = {
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
			console.log(e.type);
		},
		'built.cropper' : function(e) {
			console.log(e.type);
		},
		'dragstart.cropper' : function(e) {
			console.log(e.type, e.dragType);
		},
		'dragmove.cropper' : function(e) {
			console.log(e.type, e.dragType);
		},
		'dragend.cropper' : function(e) {
			console.log(e.type, e.dragType);
		},
		'zoomin.cropper' : function(e) {
			console.log(e.type);
		},
		'zoomout.cropper' : function(e) {
			console.log(e.type);
		}
	}).cropper(options);

	_self.corpperImage = $image;

	$image.cropper("destroy");
	$("#crop-toolbar").hide();
	$("#btn_reset").on("tap", function() {
		_self.corpperImage.cropper("reset");
	});

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

	$("#btn_crop_finished").on(
			"tap",
			function() {
				_self.croppedCanvas = _self.corpperImage
						.cropper("getCroppedCanvas");
				_self.isCropEnable = false;
				_self.isEditEnable = true;
				$("#crop-toolbar").hide();
				_self.currentImgSrc = _self.croppedCanvas.toDataURL();
				URL = window.URL || window.webkitURL
				// blobURL = URL.createObjectURL(_self.currentImgSrc);
				_self.corpperImage.one('built.cropper', function() {
					URL.revokeObjectURL(_self.croppedCanvas.toDataURL());
					_self.corpperImage.cropper("destroy");
				}).cropper('reset').cropper('replace',
						_self.croppedCanvas.toDataURL());
				_self.corpperImage.cropper("destroy");
			});

	$("#btn_edit_finished").on("tap", function() {
		_self.corpperImage.cropper("reset");
	});
	$("#crop-toolbar").hide();

	$("#btn_crop").on("tap", function() {
		console.log("btn_crop >>> Taped");
		if (_self.isCropEnable) {
			_self.isCropEnable = false;
			_self.isEditEnable = true;
			_self.corpperImage.cropper("destroy");
			$("#crop-toolbar").hide();
		} else {
			_self.isCropEnable = true;
			_self.isEditEnable = false;
			$("#crop-toolbar").show();
			_self.enableCropMode();
			_self.corpperImage.cropper("setDragMode", "crop");
		}
	});
}

CropImagePage.prototype.applyWatermark = function() {

	var gctx;
	var watermark = new Image();
	var selectedWM = $('select[name="select-crop-waterMark"]').val();
	// TODO: getWatermark image data from appCache.
	watermark.onload = function() {
		gcanvas = document.createElement('canvas');
		if (!gcanvas) {
			alert('Error: I cannot create a new canvas element!');
			return;
		}
		gctx = gcanvas.getContext("2d");
		gcanvas.width = 1024;
		gcanvas.height = 768;
		gctx.drawImage(_self.currentImg, 0, 0, _self.canWidth, _self.canHeight,
				0, 0, 1024, 768);
		x = (gcanvas.width - 20) - (watermark.width);
		y = (gcanvas.height - 20) - (watermark.height);
		gctx.drawImage(watermark, x, y);
		var encoder = new JPEGEncoder();
		var img64 = encoder.encode(gctx.getImageData(0, 0, 1024, 768),
				parseInt(vis_img_qulty))
				.replace(/data:image\/jpeg;base64,/, '');
		var imageURI = Base64Binary.decodeArrayBuffer(img64);
		if (!isEditableImage)
			imgUploadCount = 1;
	}
}

CropImagePage.prototype.cropAreaChanged = function(selection) {
	var _self = this;
	if (selection.w > 0 && selection.h > 0) {
		console.log("Crop Selection");
		_self.finalSelection = selection;
	}
}

CropImagePage.prototype.onEditPage = function(_self, imageObj) {
	console.log(_self.cropImageW + ">>>>>>>>>>>>" + _self.cropImageH);
	var editImage = new EditImagePage(_self.app, imageObj);
	editImage.init(_self.cropImageW, _self.cropImageH);
	$.mobile.changePage("#pg_editView");
}

CropImagePage.prototype.cropperCropImage = function(callBack) {
	var _self = this;
	var $image = $('.img-container > img');
	result = $image.cropper("getCroppedCanvas");
	var origImg = new Image();
	origImg.src = result.toDataURL();
	origImg.onload = function() {
		var randerHeight = window.innerHeight * 0.70;
		if (this.height < this.width && !((this.height / this.width) > .70)) {
			_self.cropImageW = (randerHeight * 4) / 3;
			_self.cropImageH = (_self.cropImageW / this.width) * this.height;
		} else {
			_self.cropImageH = randerHeight;
			_self.cropImageW = (_self.cropImageH / this.height) * this.width;
		}
		console.log(_self.cropImageW + " >>>>>>>>> " + _self.cropImageH);
		callBack(_self, origImg);
	};
}

CropImagePage.prototype.cropImage = function(callBack) {
	var _self = this;
	var origImg = new Image();
	var xsize, ysize;
	var canvas = document.createElement('canvas');
	var tempImage = new Image();
	tempImage.src = _self.crop_img.src;
	tempImage.onload = function() {
		var xsize = tempImage.width;
		var ysize = tempImage.height;

		var rx = xsize / _self.boundx;
		var ry = ysize / _self.boundy;
		console.log(_self.boundx + " >>>>>> " + _self.boundy);
		canvas.width = Math.round(rx * _self.finalSelection.w);
		canvas.height = Math.round(ry * _self.finalSelection.h);
		var x1 = Math.round(rx * _self.finalSelection.x);
		var y1 = Math.round(ry * _self.finalSelection.y);
		var w = canvas.width;
		var h = canvas.height;
		console.log(w + " >>>>>> " + h);
		var ctx = canvas.getContext('2d');
		ctx.drawImage(_self.crop_img, x1, y1, w, h, 0, 0, w, h);
		origImg.src = canvas.toDataURL();
		origImg.onload = function() {
			var randerHeight = window.innerHeight * 0.70;
			if (this.height < this.width && !((this.height / this.width) > .70)) {
				_self.cropImageW = (randerHeight * 4) / 3;
				_self.cropImageH = (_self.cropImageW / this.width)
						* this.height;
			} else {
				_self.cropImageH = randerHeight;
				_self.cropImageW = (_self.cropImageH / this.height)
						* this.width;
			}
			console.log(_self.cropImageW + " >>>>>>>>> " + _self.cropImageH);
			callBack(_self, origImg);
		};
	}
}

CropImagePage.prototype.saveImage = function(originalImage) {
	var _self = this;
	var sel_url = $('select[name="select-crop-waterMark"] :selected').val();
	$.each(_self.app.appCache.waterMarkImgs, function() {
		if ($.trim(this.url) === $.trim(sel_url)) {
			console.log("On Croping image");
			var srcData = this.data;
			console.log(srcData);
			var watermark = new Image();
			watermark.onload = function() {
				console.log("WaterMark loaded");
				var canvas = document.createElement("canvas");
				canvas.width = 1024;
				canvas.height = 768;
				// Copy the image contents to the canvas
				var ctx = canvas.getContext("2d");
				ctx.drawImage(originalImage, 0, 0, originalImage.width,
						originalImage.height, 0, 0, 1024, 768);
				console.log("Originakl Image loaded");
				x = (canvas.width - 20) - (watermark.width);
				y = (canvas.height - 20) - (watermark.height);
				ctx.drawImage(watermark, x, y);
				var encoder = new JPEGEncoder();
				var img64 = encoder.encode(ctx.getImageData(0, 0, 1024, 768),
						_self.app.appCache.settingInfo.img_quality).replace(
						/data:image\/(png|jpg|jpeg);base64,/, '');
				img64 = Base64Binary.decodeArrayBuffer(img64);
				app.appFS.saveVISFile(img64, _self.fileURI);
			}
			watermark.src = srcData;
		}
	});

}
