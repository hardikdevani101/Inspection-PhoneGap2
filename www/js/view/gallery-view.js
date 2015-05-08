var GalleryPage = function(app) {
	this.app = app;
	this.selFiles = [];
}
GalleryPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#pg_gallery #btn_user').html(
			$(_self.app.appCache.loginInfo.username).val());
};

GalleryPage.prototype.init = function(x_instructionline_id) {
	var _self = this;
	$(document).on("pagebeforeshow", "#pg_gallery", function() {
		_self.rederBreadCrumb();
		_self.line_id = x_instructionline_id;
		_self.visGallery = new Tbl_VISGallery(_self.app);
		_self.loadInspFile();
//		 _self.line_id=152452;
//		 _self.app.appCache.inspFiles[152452]=[];
//		 for (var i = 0; i < 15; i++) {
//		 var item = {};
//		 item['filePath'] = '/file/path';
//		 item['data'] = _self.app.image64;
//		 _self.app.appCache.inspFiles[152452].push(item);
//		 }
//		 _self.renderInspFiles();

		$('#btn_pic_camera').on('click', function() {
			_self.onPhotoDataSuccess(_self.tempImage);
		});

		$('#btn_pic_gallery').on('click', function() {
			_self.getGalleryImage();
		});

	});

}

GalleryPage.prototype.loadInspFile = function() {
	var _self = this;
	if (!(typeof _self.app.appCache.inspFiles[_self.line_id] === 'undefined')
			&& _self.app.appCache.inspFiles[_self.line_id].length > 0) {
		_self.renderInspFiles();
	} else {
		var success = function(tx, result) {
			_self.app.appCache.inspFiles[_self.line_id] = [];
			for (var i = 0; i < result.rows.length; i++) {
				var item = {};
				item['filePath'] = result.rows.item(i).file;
				if (_self.app.dataTypes.indexOf(_self.app.appFS
						.getExtention(result.rows.item(i).file.toUpperCase())) >= 0) {
					item['data'] = _self.app.image64;
				} else {
					item['data'] = _self.app.file64;
				}
				_self.app.appCache.inspFiles[_self.line_id].push(item);
			}
			_self.renderInspFiles();
			_self.loadInspFileData(_self.line_id);
		};
		_self.visGallery.getFilesByInspInfo({
			M_InOutLine_ID : _self.app.appCache.session.m_inoutline_id,
			X_INSTRUCTIONLINE_ID : _self.line_id
		}, success, null);
	}
}

GalleryPage.prototype.loadInspFileData = function(inspID) {
	var _self = this;
	if (!(typeof _self.app.appCache.inspFiles[inspID] === 'undefined')) {
		$.each(_self.app.appCache.inspFiles[inspID], function() {
			_self.app.appFS.getVISFile(this.filePath, inspID,
					_self.updateInspFileThumb);
		});
	}
}

GalleryPage.prototype.updateInspFileThumb = function(filePath, inspID, result) {
	var _self = this;
	if (!(typeof _self.app.appCache.inspFiles[inspID] === 'undefined')) {
		$.each(_self.app.appCache.inspFiles[inspID], function() {
			if (this.filePath == filePath) {
				this.data = result;
				var fileName = _self.app.appFS.getFileName(filePath);
				$(
						'#ls_inspFiles li[data-id="' + inspID + '_' + fileName
								+ '"] img').removeAttr("src").attr('src',
						result);
			}
		});
	}
}

GalleryPage.prototype.renderInspFiles = function() {
	var _self = this;
	var items = '';
	if (!(typeof _self.app.appCache.inspFiles[_self.line_id] === 'undefined')) {
		$
				.each(
						_self.app.appCache.inspFiles[_self.line_id],
						function() {
						    //var fileName = this.fileName;
							var fileName = _self.app.appFS
									.getFileName(this.filePath);
							var line = '<li id="'
									+ _self.line_id
									+ '_'
									+ fileName
									+ '" data-id="'
									+ _self.line_id
									+ '_'
									+ fileName
									+ '" class="file-placeholder"><a href="#">'
									+ '<img class="ui-li-thumb" src="'
									+ this.data
									+ '" /><h2>'
									+ fileName
									+ '</h2><p class="ui-li-aside"><a class="ui-btn ui-corner-all ui-icon-arrow-u ui-btn-icon-notext ui-btn-inline"></a></p></a></li>';
							items = items + line;
						});
	}

	$('#ls_inspFiles').html(items);

	$(".file-placeholder").bind("tap", function(event) {
		var selected = $(event.delegateTarget).data('id')
		console.log('Tap >> ' + selected);

		var findResult = jQuery.grep(_self.selFiles, function(item, index) {
			return item.id == selected;
		});

		if (!findResult.length > 0) {
			_self.selFiles.push({
				id : selected
			});
			$(event.delegateTarget).addClass("selected-file");
		} else {
			_self.selFiles = jQuery.grep(_self.selFiles, function(item, index) {
				return item.id != selected;
			});
			$(event.delegateTarget).removeClass("selected-file");
		}
	});

	$(".file-placeholder").bind("taphold", function(event) {
		var selected = $(event.delegateTarget).data('id')
		console.log('Taphold >> ' + selected);
	});
	// $('#ls_inspFiles').enhanceWithin();
	$('#ls_inspFiles').listview("refresh");
}

GalleryPage.prototype.getCameraImage = function() {
	var _self = this;
	navigator.camera.getPicture(_self.onPhotoDataSuccess, _self.onFail, {
		quality : 100,
		allowEdit : true,
		destinationType : Camera.DestinationType.DATA_URL,
		encodingType : Camera.EncodingType.JPEG
	});
}

GalleryPage.prototype.getGalleryImage = function() {
	var _self = this;
	navigator.camera.getPicture(_self.onPhotoDataSuccess, _self.onFail, {
		quality : 100,
		allowEdit : true,
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
		$.mobile.changePage("#pg_cropView");
		tmpImg = null;
	}
	tmpImg.src = image64;
}

GalleryPage.prototype.onFail = function(message) {
	console.log(message);
}