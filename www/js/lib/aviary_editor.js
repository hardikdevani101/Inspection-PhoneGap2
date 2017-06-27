var AviaryEditor = function(app) {
	this.app = app;
}

AviaryEditor.prototype.init = function() {
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
	_self.skipimgidit = options.skipImgEdit;
	_self.isIMR = options.isIMR;
	_self.skipautorotate = options.skipAutoRotate;
}

AviaryEditor.prototype.edit = function(callBack) {
	var _self = this;
	if (_self.imageURI.startsWith("ftp")) {
		var sel_inoutline_id = _self.app.appCache.session.m_inoutline;
		var uuID = sel_inoutline_id.m_inoutline_id + ""
				+ sel_inoutline_id.lineType;
		var prefix = "PS";
		if (_self.app.appCache.prefixCache[uuID]) {
			prefix = _self.app.appCache.prefixCache[uuID];
		}

		var arrINsp = _self.app.appCache.inspLines[uuID];
		var insLabel = "";
		$
				.each(
						arrINsp,
						function(i, item) {
							if ((item.x_instructionline_id) == (_self.app.appCache.session.x_instructionline_id)) {
								insLabel = item.name;
							}
						});
		insLabel = insLabel.replace(/\s+/g, '');
		prefix += "_" + insLabel;
		var date = new Date;
		var milSec = Math.floor(Math.random() * date.getMilliseconds());
		var sec = date.getSeconds();
		var mi = date.getMinutes();
		var hh = date.getHours();
		var yy = date.getFullYear();
		var mm = date.getMonth() + 1;
		var dd = date.getDate();
		var fileName = prefix + "_" + mm + dd + yy + "_" + hh + mi + sec
				+ milSec + ".jpg";
		console.log("File Name ===> " + fileName);

		_self.app.ftpClient.get(_self.app.appFS.vis_dir.fullPath + "/"
				+ fileName, _self.imageURI, {}, function(result) {
			_self.param.actualURI = _self.imageURI;
			_self.imageURI = result[0].localPath;
			console.log(">>> Image URI ----> " + _self.imageURI);
			_self.openEditor(callBack);
		}, function(msg) {
			console.log('Error Getting File >>> ' + dataid);
		});
	} else {
		_self.openEditor(callBack);
	}
}

AviaryEditor.prototype.openEditor = function(callBack) {
	var _self = this;
	if (_self.skipimgidit) {
		_self.param['oldURI'] = _self.imageURI;
		var filename = _self.imageURI
				.substring(_self.imageURI.lastIndexOf('/') + 1);
		_self.param['name'] = filename;
		_self.param['fileURI'] = _self.imageURI;
		_self.addWaterMark(callBack);
	} else {
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
				// console.log("File name: " + editedImageFileName + ", Image
				// URI: "
				// + editedImageURI);
				_self.param['oldURI'] = _self.imageURI;
				_self.param['name'] = result.name;
				_self.param['fileURI'] = result.src;
				_self.addWaterMark(callBack);
				// sucessCallback(_self.param);
			},
			error : function(message) {
				console.log(">>>>>>>>>>>>>>>>>>>" + message);
			}
		});
	}
}

AviaryEditor.prototype.addWaterMark = function(sucess) {
	var _self = this;
	_self.app.appFS
			.getFileByURL(
					_self.param,
					function(options) {
						_self.param = options;
						var watermarkImage = _self.app.watermark64;
						if (_self.selectedWM) {
							var findResult = jQuery.grep(
									_self.app.appCache.waterMarkImgs, function(
											item, index) {
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
								var newWidth = ((origImg.width * nGcanvas.height) / origImg.height);

								if (!_self.skipautorotate) {
									if ((nGcanvas.width >= newWidth)) {
										nGctx
												.drawImage(
														origImg,
														-nGcanvas.height / 2,
														-nGcanvas.width / 2,
														origImg.width,
														origImg.height,
														(nGcanvas.width - newWidth) / 2,
														0, newWidth,
														nGcanvas.height);
									} else {
										var newHeight = ((origImg.height * nGcanvas.width) / origImg.width);
										if ((nGcanvas.height >= newHeight)) {
											nGctx
													.drawImage(
															origImg,
															-nGcanvas.height / 2,
															-nGcanvas.width / 2,
															origImg.width,
															origImg.height,
															0,
															(nGcanvas.height - newHeight) / 2,
															nGcanvas.width,
															newHeight);
										}
									}

									nGctx.clearRect(0, 0, nGcanvas.width,
											nGcanvas.height);
									nGctx.save();
									nGctx.translate(nGcanvas.width / 2,
											nGcanvas.height / 2);
									nGctx.rotate(90 * Math.PI / 180);
									nGctx.drawImage(origImg,
											-origImg.width / 2,
											-origImg.width / 2);
									nGctx.restore();

									// if(!_self.isIMR){
									// nGctx.drawImage(watermark, 0, 0);
									// }

								} else {
									if ((nGcanvas.width >= newWidth)) {
										nGctx
												.drawImage(
														origImg,
														0,
														0,
														origImg.width,
														origImg.height,
														(nGcanvas.width - newWidth) / 2,
														0, newWidth,
														nGcanvas.height);
									} else {
										var newHeight = ((origImg.height * nGcanvas.width) / origImg.width);
										if ((nGcanvas.height >= newHeight)) {
											nGctx
													.drawImage(
															origImg,
															0,
															0,
															origImg.width,
															origImg.height,
															0,
															(nGcanvas.height - newHeight) / 2,
															nGcanvas.width,
															newHeight);
										}
									}

									if (!_self.isIMR) {
										nGctx.drawImage(watermark, 0, 0);
									}
								}

								if (sucess) {
									sucess(_self.param, nGcanvas.toDataURL());
								} else {
									_self.app.galleryview.onEditFinish(
											_self.param, nGcanvas.toDataURL());
								}
							}
						}
					});
}