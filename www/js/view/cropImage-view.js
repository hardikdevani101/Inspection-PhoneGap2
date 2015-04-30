var CropImagePage = function(app, image64) {
	this.app = app;
	this.image64 = image64;
}

CropImagePage.prototype.init = function(width, height) {
	var _self = this;
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

	$('#cropImage').html(
			[ '<img src="', _self.image64,
					'" width="' + width + '" height="' + height + '" />' ]
					.join(''));
	$.mobile.changePage("#pg_cropView");
};
