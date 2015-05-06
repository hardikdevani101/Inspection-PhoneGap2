var CropImagePage = function(app, image64) {
	this.app = app;
	this.image64 = image64;
}

CropImagePage.prototype.init = function(width, height) {
	var _self = this;

	$(document).on("pagebeforeshow", "#pg_gallery", function() {
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
				[ '<img src="', _self.image64,
						'" width="' + width + '" height="' + height + '" />' ]
						.join(''));
	});	
};

CropImagePage.prototype.saveImage = function() {
	var img = $('#cropImage img')[0];
	console.log(img);
	var canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	// Copy the image contents to the canvas
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	var encoder = new JPEGEncoder();
	var img64 = encoder.encode(ctx.getImageData(0, 0, 1024, 768), 100).replace(
			/data:image\/(png|jpg|jpeg);base64,/, '');
	var imageURI = Base64Binary.decodeArrayBuffer(img64);
	app.appFS.saveVISFile(imageURI);
}
