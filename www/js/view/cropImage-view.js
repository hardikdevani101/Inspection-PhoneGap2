var CropImagePage = function(app, image64) {
	this.app = app;
	this.image64 = image64;
}

CropImagePage.prototype.init = function(width, height) {
	var _self = this;

	$(document).on(
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
					_self.saveImage();
				});

				$('#cropage_edit').on('click', function(event) {

				});

				$('#cropage_cpNedit').on('click', function(event) {

				});

				$('#cropImage').html(
						[
								'<img src="',
								_self.image64,
								'" width="' + width + '" height="' + height
										+ '" />' ].join(''));
				if (_self.app.appCache.waterMarkImgs.length > 0) {
					$('select[name="select-waterMark"]').empty();
					$.each(_self.app.appCache.waterMarkImgs, function() {
						$('select[name="select-waterMark"]').append(
								$("<option></option>").val(this.url).html(
										this.name));
					});
				}
				$('select[name="select-waterMark"]').selectmenu('refresh');
			});
};

CropImagePage.prototype.saveImage = function() {
	
	var watermark = new Image();
    watermark.src = "img/Velocity_Watermark.png";
	
	var img = $('#cropImage img')[0];
	var canvas = document.createElement("canvas");
	canvas.width = 1024;
	canvas.height = 768;
	// Copy the image contents to the canvas
	gctx = gcanvas.getContext("2d");
	gcanvas.width = 1024;
	gcanvas.height = 768;
	gctx.drawImage(origImg, 0, 0, origImg.width, origImg.height, 0, 0, 1024, 768);
	x = (gcanvas.width - 20) - (watermark.width);
	y = (gcanvas.height - 20) - (watermark.height);
	gctx.drawImage(watermark, x, y);
	
	
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 1024, 768);
	var encoder = new JPEGEncoder();
	var img64 = encoder.encode(ctx.getImageData(0, 0, 1024, 768), 100).replace(
			/data:image\/(png|jpg|jpeg);base64,/, '');
	var imageURI = Base64Binary.decodeArrayBuffer(img64);
	app.appFS.saveVISFile(imageURI);
}
