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
	this.gcanvas = '';
	this.editCtx = '';
	this.isCropperOn = false;
	this.cValue = 0;
	this.bValue = 0;
	this.context = "#pg_img_editor";
}

ImageEditorPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#btn_user', _self.context).html(_self.app.appCache.settingInfo.username);
};

ImageEditorPage.prototype.setup = function(options, isGallery) {
	var _self = this;
	_self.image64 = options.img64;
	_self.sourceInfo = options.sourceInfo;
	_self.selectedWM = options.watermark;
	_self.isGallery = isGallery;
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
	var _self = this;
	_self.el_cropToolbar.hide();
	_self.el_editToolbar.show();
	_self.el_cropImgContainer.hide();
	_self.el_editImgContainer.show();
	setTimeout(function() {
		var el_editImg = $('#edit_img_src', _self.context);
		el_editImg.css("z-index", 2000000);
		el_editImg.veditor({
			previewImgId : "crop_img_src",
			canvasWidth : _self.cropImageW,
			canvasHeight : _self.cropImageH
		});
	}, 10);
}

ImageEditorPage.prototype.cropFinished = function() {
	var _self = this;
	_self.croppedCanvas = _self.corpperImage.cropper("getCroppedCanvas");
	_self.currentImage = _self.croppedCanvas.toDataURL();
	_self.isEditEnable = true;
	_self.isCropEnable = false;
	_self.el_cropToolbar.hide();
	_self.el_editToolbar.show();
	$('#crop_img_src', _self.context).attr('src', _self.currentImage);
	$('#edit_img_src', _self.context).veditor('setPreviewImageData')
	_self.enableEditMode();
}

ImageEditorPage.prototype.reload = function() {
	var _self = this;
	_self.rederBreadCrumb();
	_self.cValue = 0;
	_self.bValue = 0;
	_self.canHeight = $(window).height() - (17 * $(window).height() / 100);
	_self.canWidth = $(window).width() - 20;
}

ImageEditorPage.prototype.loadEditableImage = function() {
	var _self = this;
	_self.el_editImgContainer.html([ '<img id="edit_img_src" src="'
			+ _self.image64 + '" />' ].join(''));
	setTimeout(function() {
		// console.log("load edit_img_src");
		img = $("#edit_img_src", _self.context)[0];
		var randerHeight = window.innerHeight * 0.70;
		if (img.height < img.width && !((img.height / img.width) > .70)) {
			_self.cropImageW = (randerHeight * 4) / 3;
			_self.cropImageH = (_self.cropImageW / img.width) * img.height;
		} else {
			_self.cropImageH = randerHeight;
			_self.cropImageW = (_self.cropImageH / img.height) * img.width;
		}
		// _self.cropImageH = _self.cropImageH - 32;
		// _self.cropImageW = _self.cropImageW - 32;

		_self.enableEditMode();
	}, 10);
}

ImageEditorPage.prototype.loadCropableImage = function() {
	var _self = this;

	$('.img-container', _self.context).html(
			[ '<img id="crop_img_src" src="' + _self.image64 + '" />' ]
					.join(''));
	setTimeout(function() {
		if (!_self.isCropperOn)
			_self.initCropMode();
	}, 10);
}

ImageEditorPage.prototype.reset = function() {
	var _self = this;
	_self.el_sliderBrightness.val(0).slider("refresh");
	_self.el_sliderContrast.val(0).slider("refresh");
	$('#edit_img_src').veditor('reset');
	_self.enableEditMode();
	_self.isCropEnable = false;
	_self.isEditEnable = true;
	_self.el_cropToolbar.hide();
	_self.el_editToolbar.show();

	_self.corpperImage.cropper("destroy");
	_self.corpperImage.cropper("reset");
}

ImageEditorPage.prototype.viewToggle = function() {
	var _self = this;
	if (_self.isCropEnable) {
		_self.el_cropImgContainer.hide();
		$("#edit-canvase").show();
		_self.el_cropToolbar.hide();
		_self.el_editToolbar.show();
		_self.isCropEnable = false;
		_self.isEditEnable = true;
		// _self.corpperImage.cropper("destroy");
		_self.enableEditMode();
	} else {
		_self.isCropEnable = true;
		_self.isEditEnable = false;
		_self.el_cropImgContainer.show();
		$("#edit-canvase").hide();
		_self.el_editToolbar.hide();
		_self.el_cropToolbar.show();
		_self.enableCropMode();
		_self.corpperImage.cropper("setDragMode", "crop");
	}
}

ImageEditorPage.prototype.init = function() {
	var _self = this;
	_self.el_cropToolbar = $("#crop-toolbar", _self.context);
	_self.el_editToolbar = $("#edit-toolbar", _self.context);
	_self.el_btnSkipEdit = $("#btn_skip_edit", _self.context);
	_self.el_btnAddWatermark = $("#btn_add_watermark", _self.context);
	_self.el_btnReset = $("#btn_reset", _self.context);
	_self.el_btnEditFinish = $("#btn_edit_finished", _self.context);
	_self.el_btnCrop = $("#btn_crop", _self.context);
	_self.el_btnZoomPlus = $("#btn_zoom_plus", _self.context);
	_self.el_btnZoomMinus = $("#btn_zoom_minus", _self.context);
	_self.el_btnCropZoomPlus = $("#btn_crop_zoom_plus", _self.context);
	_self.el_btnCropMove = $("#btn_crop_move", _self.context);
	_self.el_btnCropZoomMinus = $("#btn_crop_zoom_minus", _self.context);
	_self.el_btnRotateLeft = $("#btn_rotate_left", _self.context);
	_self.el_btnRotateRight = $("#btn_rotate_right", _self.context);
	_self.el_btnCropFinish = $("#btn_crop_finished", _self.context);
	_self.el_cropImgContainer = $("#crop-image-container", _self.context);
	_self.el_editImgContainer = $("#edit-image-container", _self.context);
	_self.el_contextPage = $("#pg_img_editor");

	_self.el_contextPage.on("pagebeforeshow", function(event) {
		_self.reload();
		_self.loadEditableImage();
		_self.loadCropableImage();

		_self.el_sliderBrightness = $("#slider-brightness", _self.context);
		_self.el_sliderContrast = $("#slider-contrast", _self.context);
		_self.el_sliderCrop = $("#slider-crop", _self.context);
		
		_self.el_sliderBrightness.on("slidestop", function(event, ui) {
			_self.brightness = event.target.value;
			_self.onBrightnessChange(event);
			event.preventDefault();
			return false;
		});

		_self.el_sliderContrast.off("slidestop");
		_self.el_sliderContrast.on("slidestop", function(event, ui) {
			_self.contrast = event.target.value;
			_self.onContrastChange(event);
			event.preventDefault();
			return false;
		});

		_self.el_sliderCrop.off("slidestop");
		_self.el_sliderCrop.on("slidestop", function(event, ui) {
			_self.currentCropSize = event.target.value;
			_self.onCropSizeChange(event);
			event.preventDefault();
			return false;
		});

		event.preventDefault();
		return false;
	});

	_self.el_btnSkipEdit.on("tap", function(event) {
		$.mobile.changePage("#pg_gallery", {
			'reverse' : true
		});
		event.preventDefault();
		return false;
	});

	_self.el_btnAddWatermark.on("tap", function(event) {
		_self.applyWatermark();
		event.preventDefault();
		return false;
	});

	_self.el_btnReset.on("tap", function(event) {
		_self.reset();
		event.preventDefault();
		return false;
	});

	_self.el_btnEditFinish.off("tap")
	_self.el_btnEditFinish.on("tap", function(event) {
		_self.onEditFinish();
		event.preventDefault();
		return false;
	});

	_self.el_btnCrop.on("tap", function(event) {
		_self.viewToggle();
		event.preventDefault();
		return false;
	});

	_self.el_btnZoomPlus.on("tap", function(event) {
		_self.corpperImage.cropper("zoom", 0.1);
		event.preventDefault();
		return false;
	});

	_self.el_btnZoomMinus.on("tap", function(event) {
		_self.corpperImage.cropper("zoom", -0.1);
		event.preventDefault();
		return false;
	});

	_self.el_btnCropZoomPlus.on("tap", function(event) {
		_self.cropResize = true;
		var data = _self.corpperImage.cropper("getCropBoxData");
		data.width = data.width + 15;
		_self.corpperImage.cropper("setCropBoxData", data);
		e.preventDefault();
		return false;
	});

	_self.el_btnCropZoomMinus.on("tap", function(event) {
		_self.cropResize = true;
		var data = _self.corpperImage.cropper("getCropBoxData");
		data.width = data.width - 15;
		_self.corpperImage.cropper("setCropBoxData", data);
		e.preventDefault();
		return false;
	});

	_self.el_btnRotateLeft.on("tap", function(event) {
		_self.corpperImage.cropper("rotate", -45);
		event.preventDefault();
		return false;
	});

	_self.el_btnRotateRight.on("tap", function(event) {
		_self.corpperImage.cropper("rotate", 45);
		event.preventDefault();
		return false;
	});

	_self.el_btnCropMove.on("tap", function(event) {
		_self.corpperImage.cropper("setDragMode", "move");
		event.preventDefault();
		return false;
	});

	_self.el_btnCropFinish.on("tap", function(event) {
		_self.cropFinished();
		event.preventDefault();
		return false;
	});

};

ImageEditorPage.prototype.enableCropMode = function() {
	var _self = this;
	_self.el_cropImgContainer.show();
	_self.el_editImgContainer.hide();
	if (!_self.isCropperOn) {
		_self.initCropMode();
	}
	_self.corpperImage.cropper('destroy');
	_self.corpperImage.cropper('reset');
}

ImageEditorPage.prototype.onCropSizeChange = function(event) {
	var _self = this;
	var data = _self.corpperImage.cropper("getCropBoxData");
	data.width = data.width + event.target.value * 10;
	_self.corpperImage.cropper("setCropBoxData", data);
}

ImageEditorPage.prototype.onContrastChange = function(event) {
	var _self = this;
	var contraValue = event.target.value - _self.cValue;
	_self.gcanvas = $("#edit_img_src", "#edit-image-container")[0];
	_self.editCtx = _self.gcanvas.getContext('2d');
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
	_self.gcanvas = $("#edit_img_src", "#edit-image-container")[0];
	_self.editCtx = _self.gcanvas.getContext('2d');
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
	var $image = $('#crop_img_src', "#crop-image-container"), $dataX = $('#dataX'), $dataY = $('#dataY'), $dataHeight = $('#dataHeight'), $dataWidth = $('#dataWidth'), $dataRotate = $('#dataRotate');
	_self.el_cropImgContainer.css('max-width', _self.cropImageW);
	_self.el_cropImgContainer.css('max-height', _self.cropImageH);
	var options = {
		rotatable : true,
		zoomable : true,
		touchDragZoom : true,
		minCanvasWidth : $image[0].width,
		minCanvasHeight : $image[0].height,
		maxContainerWidth : _self.cropImageW,
		maxContainerHeight : _self.cropImageH,
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
		},
		'built.cropper' : function(e) {
			$image.cropper('setCropBoxData', $image.cropper('getCropBoxData'));
			$image.cropper('setCanvasData', $image.cropper('getCanvasData'));
			_self.corpperImage = $image;
			e.preventDefault();
			return false;
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
	_self.gcanvas = $("#edit_img_src", "#edit-image-container")[0];
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
	watermark.onload = function() {
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

			if (_self.isGallery == 'Y') {
				_self.app.galleryview.onEditFinish(_self.sourceInfo, nGcanvas
						.toDataURL());
				$.mobile.changePage("#pg_gallery");
			} else {
				_self.app.fileExplorer.onEditFinish(_self.sourceInfo, nGcanvas
						.toDataURL(), "Y");
				$.mobile.changePage("#pg_file_explorer");
			}
		}
	}
}
