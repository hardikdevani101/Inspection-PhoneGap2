var CropImagePage = function(app, image64) {
	this.app = app;
	this.image64 = image64;
}

CropImagePage.prototype.init = function(width, height) {
	var _self = this;

	$(document)
			.on(
					"pagebeforeshow",
					"#pg_cropView",
					function() {
						$('#btn_zoom-out').on('ontouchstart', function(event) {
							console.log(event.pageX);
						});

						$('#btn_zoom-out').on('ontouchend', function(event) {
							console.log(event.pageX);
						});

						$('#btn_zoom-in').on('ontouchstart', function(event) {
							console.log(event.pageX);
						});

						$('#btn_zoom-in').on('ontouchend', function(event) {
							console.log(event.pageX);
						});

						$('#cropage_cpNsave').on('click', function(event) {

						});

						$('#cropage_save').on('click', function(event) {
							_self.saveImage($('#cropImage img')[0]);
						});

						$('#cropage_edit').on('click', function(event) {

						});

						$('#cropage_cpNedit').on('click', function(event) {
							_self.cropImage(_self.onEditPage);
						});

						$('#cropImage').html(
								[
										'<img src="',
										_self.image64,
										'" width="' + width + '" height="'
												+ height + '" />' ].join(''));

						_self.crop_img = $('#cropImage img')[0];
						var xsize, ysize, totH;
						if (_self.crop_img.width * 3 / 4 > _self.crop_img.height) {
							ysize = _self.crop_img.height;
							xsize = _self.crop_img.height * 4 / 3;
						} else {
							xsize = _self.crop_img.width;
							ysize = _self.crop_img.width * 3 / 4;
						}
						_self.scrollHeight = ysize;
						$('#cropImage img')
								.Jcrop(
										{
											bgColor : 'black',
											bgOpacity : .3,
											onSelect : function(selection) {
												_self
														.cropAreaChanged(selection);
											},
											onChange : function(selection) {
												_self
														.cropAreaChanged(selection);
											},
											aspectRatio : 4 / 3,
											allowResize : false,
											setSelect : [
													(_self.crop_img.width - xsize) / 2,
													(_self.crop_img.height - ysize) / 2,
													xsize, ysize ]
										}, function() {
											// Use the API to get the real image
											// size
											var bounds = this.getBounds();
											_self.boundx = bounds[0];
											_self.boundy = bounds[1];
											// Store the API in the jcrop_api
											// variable
											jcrop_api = this;
										});

						// document.getElementById("slider-vertical")
						// .setAttribute(
						// "style",
						// "height:" + (cropImageH - 50)
						// + "px;margin:35% 0px 25% 0px;");
						// $('#slider-vertical').slider(
						// {
						// orientation : "vertical",
						// min : 5,
						// max : ysize,
						// value : ysize,
						// change : function(event, ui) {
						// selectCropArea(ui.value, ui.value * 100
						// / ysize);
						// },
						// slide : function(event, ui) {
						// clearInterval(myVar);
						// selectCropArea(ui.value, ui.value * 100
						// / ysize);
						// }
						// });

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
			var srcData = this.data;
			var watermark = new Image();
			watermark.src = srcData;
			watermark.onload = function() {
				var canvas = document.createElement("canvas");
				canvas.width = 1024;
				canvas.height = 768;
				// Copy the image contents to the canvas
				var ctx = canvas.getContext("2d");
				ctx.drawImage(originalImage, 0, 0, originalImage.width,
						originalImage.height, 0, 0, 1024, 768);
				x = (canvas.width - 20) - (watermark.width);
				y = (canvas.height - 20) - (watermark.height);
				ctx.drawImage(watermark, x, y);
				var encoder = new JPEGEncoder();
				var img64 = encoder.encode(ctx.getImageData(0, 0, 1024, 768),
						_self.app.appCache.settingInfo.img_quality).replace(
						/data:image\/(png|jpg|jpeg);base64,/, '');
				var imageURI = Base64Binary.decodeArrayBuffer(img64);
				app.appFS.saveVISFile(imageURI);
			}
		}
	});

}
