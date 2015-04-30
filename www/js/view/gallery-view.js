var GalleryPage = function(app) {
	this.app = app;
}

GalleryPage.prototype.init = function(m_insp_id) {
	var _self = this;
	var visGallery = Tbl_VISGallery(_self.app);
	$('#btn_pic_camera').on('click', function() {
		_self.getCameraImage();
	});

	$('#btn_pic_gallery').on('click', function() {
		_self.getGalleryImage();
	});

}

GalleryPage.prototype.getCameraImage = function() {
	var _self = this;
	navigator.camera.getPicture(_self.onPhotoDataSuccess, _self.onFail, {
		quality : 100,
		destinationType : Camera.DestinationType.DATA_URL,
		encodingType : Camera.EncodingType.JPEG
	});
}

GalleryPage.prototype.getGalleryImage = function() {
	var _self = this;
	navigator.camera.getPicture(_self.onPhotoDataSuccess, _self.onFail, {
		quality : 100,
		sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
		destinationType : Camera.DestinationType.DATA_URL,
		encodingType : Camera.EncodingType.JPEG
	});
}

GalleryPage.prototype.onPhotoDataSuccess = function(imageData) {
	var _self = this;
	var image64 = "data:image/jpeg;base64," + imageData;
	var tmpImg = new Image();
	tmpImg.onload = function() {
		var randerHeight = window.innerHeight * 0.70;
		var cropImageW, cropImageH;
		if (this.height < this.width && !((this.height / this.width) > .70)) {
			cropImageW = (randerHeight * 4) / 3;
			cropImageH = (cropImageW / this.width) * this.height;
		} else {
			cropImageH = randerHeight;
			cropImageW = (cropImageH / this.height) * this.width;
		}
		var cropImage = new CropImagePage(_self.app, image64);
		cropImage.init(cropImageW, cropImageH);
		tmpImg = null;
	}
	tmpImg.src = image64;
}

GalleryPage.prototype.onFail = function(message) {
	console.log(message);
}