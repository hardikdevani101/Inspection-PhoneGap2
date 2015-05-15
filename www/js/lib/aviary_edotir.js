var AviaryEditor = function(app) {
	this.app = app;

}

AviaryEditor.prototype.init = function() {
	console.log("Edit called");
	var _self = this;
	_self.tools = cordova.plugins.Aviary.Tools;
	_self.toolList = [ _self.tools.SHARPNESS, _self.tools.BRIGHTNESS, _self.tools.CONTRAST,
	                   _self.tools.SATURATION, _self.tools.EFFECTS, _self.tools.RED_EYE, _self.tools.CROP,
	                   _self.tools.WHITEN, _self.tools.DRAWING, _self.tools.STICKERS, _self.tools.TEXT,
	                   _self.tools.BLEMISH, _self.tools.MEME, _self.tools.ADJUST, _self.tools.ENHANCE,
	                   _self.tools.COLORTEMP, _self.tools.BORDERS, _self.tools.COLOR_SPLASH,
	                   _self.tools.TILT_SHIFT, _self.tools.ORIENTATION, _self.tools.FRAMES ];
}

AviaryEditor.prototype.setup = function(param, imageURI) {
	var _self = this;
	_self.param = param;
	_self.imageURI = imageURI;
}

AviaryEditor.prototype.edit = function(sucessCallback) {
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
			_self.param['name'] = result.name;
			_self.param['fileURI'] = result.src;
			sucessCallback(param);
		},
		error : function(message) {
			console.log(message);
		}
	});
}