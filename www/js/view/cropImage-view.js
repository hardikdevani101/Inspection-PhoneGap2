var CropImagePage = function(app, image64, fileURI) {
	this.app = app;
	this.image64 = image64;
	this.fileURI = fileURI;
}
CropImagePage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#pg_cropView #btn_user').html(
			$(_self.app.appCache.loginInfo.username).val());
};
CropImagePage.prototype.init = function(width, height) {
	var _self = this;

	$(document)
			.on(
					"pagebeforeshow",
					"#pg_cropView",
					function() {
						_self.rederBreadCrumb();
						$('.img-container').html(
								[ '<img src="', _self.image64, '" />' ]
										.join(''));

						_self.initCropper();
						
						$('#cropage_cpNsave').on('click', function(event) {

						});

						$('#cropage_save').on('click', function(event) {
							_self.saveImage($('.img-container > img')[0]);
						});

						$('#cropage_edit').on('click', function(event) {

						});

						$('#cropage_cpNedit').on('click', function(event) {
							_self.cropperCropImage(_self.onEditPage);
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

CropImagePage.prototype.initCropper = function() {
	var $image = $('.img-container > img'), $dataX = $('#dataX'), $dataY = $('#dataY'), $dataHeight = $('#dataHeight'), $dataWidth = $('#dataWidth'), $dataRotate = $('#dataRotate'), options = {
		highlight : true,
		rotatable : true,
		zoomable : true,
		touchDragZoom : true,
		// minCanvasWidth: window.innerWidth,
		// minCanvasHeight:window.innerHeight,
		// minCropBoxWidth: '160',
		// minCropBoxHeight: '90',
		// minContainerWidth: $('.img-container').width(),
		// minContainerHeight: $('.img-container').height(),
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

CropImagePage.prototype.cropperCropImage = function(callBack){
	var _self = this;
	var $image = $('.img-container > img');
	result = $image.cropper("getCroppedCanvas");
	var origImg = new Image();
	origImg.src = result.toDataURL();
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
