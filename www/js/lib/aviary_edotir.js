var AviaryEditor = function(app) {
	this.app = app;

}

AviaryEditor.prototype.init = function() {
	console.log("Edit called");
	var _self = this;
	_self.tools = cordova.plugins.Aviary.Tools;
	_self.toolList = [ _self.tools.SHARPNESS, _self.tools.BRIGHTNESS,
			_self.tools.CONTRAST, _self.tools.SATURATION, _self.tools.EFFECTS,
			_self.tools.RED_EYE, _self.tools.CROP, _self.tools.WHITEN,
			_self.tools.DRAWING, _self.tools.STICKERS, _self.tools.TEXT,
			_self.tools.BLEMISH, _self.tools.MEME, _self.tools.ADJUST,
			_self.tools.ENHANCE, _self.tools.COLORTEMP, _self.tools.BORDERS,
			_self.tools.COLOR_SPLASH, _self.tools.TILT_SHIFT,
			_self.tools.ORIENTATION, _self.tools.FRAMES ];
}

AviaryEditor.prototype.setup = function(options) {
	var _self = this;
	_self.param = options.sourceInfo;
	_self.imageURI = options.imageURI;
	_self.selectedWM = options.watermark;
}

AviaryEditor.prototype.edit = function() {
	var _self = this;
	cordova.plugins.Aviary.show({
		imageURI : _self.imageURI,
		outputFormat : cordova.plugins.Aviary.OutputFormat.JPEG,
		quality : 90,
		toolList : _self.toolList,
		hideExitUnsaveConfirmation : false,
		enableEffectsPacks : true,
		enableFramesPacks : true,
		enableStickersPacks : true,
		disableVibration : false,
		folderName : "VISion_Aviary",
		success : function(result) {
			// var editedImageFileName = result.name;
			// var editedImageURI = result.src;
			// console.log("File name: " + editedImageFileName + ", Image URI: "
			// + editedImageURI);
			_self.param['oldURI'] = _self.imageURI;
			_self.param['name'] = result.name;
			_self.param['fileURI'] = result.src;
			_self.addWaterMark();
			// sucessCallback(_self.param);
		},
		error : function(message) {
			console.log(message);
		}
	});
}

AviaryEditor.prototype.addWaterMark = function() {
	var _self = this;
	_self.app.appFS.getFileByURL(_self.param, function(options) {
		_self.param = options;
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
			origImg.src = _self.param.data;
			origImg.onload = function() {
				nGcanvas = document.createElement('canvas');
				nGctx = nGcanvas.getContext("2d");
				nGcanvas.width = 1024;
				nGcanvas.height = 768;
				nGctx.drawImage(origImg, 0, 0, origImg.width, origImg.height,
						0, 0, 1024, 768);

				x = (nGcanvas.width - 20) - (watermark.width);
				y = (nGcanvas.height - 20) - (watermark.height);
				nGctx.drawImage(watermark, x, y);
				_self.app.galleryview.onEditFinish(_self.param, nGcanvas
						.toDataURL());
			}
		}
	});
}