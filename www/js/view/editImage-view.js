var EditImagePage = function(app, imageObj) {
	this.app = app;
	this.imageObj = imageObj;
}

EditImagePage.prototype.init = function(width, height) {
	var _self = this;
	_self.imageObj.height = height;
	_self.imageObj.width = width;
	$(document)
			.on(
					"pagebeforeshow",
					"#pg_editView",
					function() {

						$('#btn_editSave').on('click', function(event) {
							_self.saveImage($('#cropImage img')[0]);
						});

						$('#btn_editUndo').on('click', function(event) {

						});

						$('#slider-brightness').attr("style", "height:100px");
						$('#slider-brightness').slider({
							orientation : "vertical",
							min : 0,
							max : 100,
							value : 50,
							slide : function(event, ui) {
								_self.onBrightnessChange(event, ui);
							},
							change : function(event, ui) {
								_self.onBrightnessChange(event, ui);
							},
							start : function(event, ui) {
							}
						});

						$('#slider-brightness').slider('refresh');

						$('#slider-contrast').attr("style", "height:100px");
						$('#slider-contrast').slider({
							orientation : "vertical",
							min : 0,
							max : 100,
							value : 50,
							slide : function(event, ui) {
								_self.onContrastChange(event, ui);
							},
							change : function(event, ui) {
								_self.onContrastChange(event, ui);
							},
							start : function(event, ui) {
							}
						});

						$('#slider-contrast').slider('refresh');

						_self.renderEditImage();
						if (_self.app.appCache.waterMarkImgs.length > 0) {
							$('select[name="select-edit-waterMark"]').empty();
							$
									.each(
											_self.app.appCache.waterMarkImgs,
											function() {
												$(
														'select[name="select-edit-waterMark"]')
														.append(
																$(
																		"<option></option>")
																		.val(
																				this.url)
																		.html(
																				this.name));
											});
						}
						$('select[name="select-edit-waterMark"]').selectmenu(
								'refresh');
					});
}

EditImagePage.prototype.renderEditImage = function() {
	var _self = this;
	canX = 0, canY = 0, canX1 = 0, canY1 = 0;
	aNo = -1;
	bValue = 50, cValue = 50;
	_self.actArray = new Array();
	_self.gcanvas = $('#editCanvas')[0];
	_self.editCtx = _self.gcanvas.getContext("2d");
	_self.gcanvas.height = _self.imageObj.height;
	_self.gcanvas.width = _self.imageObj.width;
	_self.editCtx.drawImage(_self.imageObj, 0, 0, _self.imageObj.width,
			_self.imageObj.height);
	_self.gcanvas.addEventListener("touchmove", function(e) {
		if (!e)
			var e = event;
		e.preventDefault();
		_self.canX1 = e.targetTouches[0].pageX - _self.gcanvas.offsetLeft;
		_self.canY1 = e.targetTouches[0].pageY - _self.gcanvas.offsetTop;
		_self.editCtx.clearRect(0, 0, _self.imageObj.width,
				_self.imageObj.hight);
		_self.editCtx.putImageData(_self.tmpEditData, 0, 0);
		_self.drowRect(_self.canX, _self.canY, _self.canX1 - _self.canX,
				_self.canY1 - _self.canY);
	}, true);
	_self.gcanvas.addEventListener("touchstart", function(e) {
		if (!e)
			var e = event;
		e.preventDefault();

		_self.canX = e.targetTouches[0].pageX - _self.gcanvas.offsetLeft;
		_self.canY = e.targetTouches[0].pageY - _self.gcanvas.offsetTop;
		_self.tmpEditData = _self.editCtx.getImageData(0, 0,
				_self.gcanvas.width, _self.gcanvas.height);
	}, false);
	_self.gcanvas.addEventListener("touchend",
			function(e) {
				_self.actArray[++_self.aNo] = new Array();
				_self.actArray[_self.aNo][0] = _self.bValue;
				_self.actArray[_self.aNo][1] = _self.cValue;
				_self.actArray[_self.aNo][2] = _self.canX + "*" + _self.canY
						+ "*" + (_self.canX1 - _self.canX) + "*"
						+ (_self.canY1 - _self.canY);
			}, false);

}

EditImagePage.prototype.drowRect = function(x, y, w, h) {
	var _self = this;
	_self.editCtx.beginPath();
	_self.editCtx.fillStyle = "#ffffff";
	_self.editCtx.fillRect(x, y, w, h);
	_self.editCtx.closePath();
	_self.editCtx.stroke();
}

EditImagePage.prototype.onContrastChange = function(event, ui) {
	var contraValue = ui.value - _self.cValue;
	var contraImageData = _self.editCtx.getImageData(0, 0, _self.gcanvas.width,
			_self.gcanvas.height);
	var _self = this;
	var data = contraImageData.data;
	var factor = (259 * (contraValue + 255)) / (255 * (259 - contraValue));
	for (var i = 0; i < data.length; i += 4) {
		data[i] = factor * (data[i] - 128) + 128;
		data[i + 1] = factor * (data[i + 1] - 128) + 128;
		data[i + 2] = factor * (data[i + 2] - 128) + 128;
	}
	_self.editCtx.putImageData(contraImageData, 0, 0);

	_self.cValue = ui.value;
	if (_self.flag == 0) {
		if (_self.aNo > -1 ? (_self.actArray[_self.aNo][0] != _self.bValue || _self.actArray[_self.aNo][1] != _self.cValue)
				: true) {
			_self.actArray[++_self.aNo] = new Array();
			_self.actArray[_self.aNo][0] = _self.bValue;
			_self.actArray[_self.aNo][1] = _self.cValue;
			_self.actArray[_self.aNo][2] = _self.canX + "*" + _self.canY + "*"
					+ (_self.canX1 - _self.canX) + "*"
					+ (_self.canY1 - _self.canY);
		}
	}
	return contraImageData;
}

EditImagePage.prototype.onBrightnessChange = function(event, ui) {
	var brightValue = ui.value - _self.bValue;
	var brightImageData = _self.editCtx.getImageData(0, 0, _self.gcanvas.width,
			_self.gcanvas.height);
	var _self = this;
	var pixels = brightImageData.data;
	for (var i = 0; i < pixels.length; i += 4) {
		pixels[i] += brightValue;
		pixels[i + 1] += brightValue;
		pixels[i + 2] += brightValue;
	}
	_self.editCtx.putImageData(brightImageData, 0, 0);

	_self.bValue = ui.value;
	if (_self.flag == 0) {
		if (_self.aNo > -1 ? (_self.actArray[_self.aNo][0] != _self.bValue || _self.actArray[_self.aNo][1] != _self.cValue)
				: true) {
			_self.actArray[++_self.aNo] = new Array();
			_self.actArray[_self.aNo][0] = _self.bValue;
			_self.actArray[_self.aNo][1] = _self.cValue;
			_self.actArray[_self.aNo][2] = _self.canX + "*" + _self.canY + "*"
					+ (_self.canX1 - _self.canX) + "*"
					+ (_self.canY1 - _self.canY);
		}
	}
	return brightImageData;
}

EditImagePage.prototype.saveEditImage = function() {
	var _self = this;
	var origImg = new Image();
	origImg.src = _self.gcanvas.toDataURL();
	origImg.onload = function() {
		applyWatermark(origImg);
	}
}

EditImagePage.prototype.onUndoEdit = function() {
	var _self = this;
	if (_self.actArray.length >= 1) {
		_self.actArray.pop();
		--_self.aNo;
		_self.editCtx.clearRect(0, 0, _self.cropImageW, _self.cropImageH);
		_self.editCtx.drawImage(_self.edit_image, 0, 0, _self.cropImageW,
				_self.cropImageH);
		var b = 50, c = 50;
		for (var j = 0; j < _self.actArray.length; j++) {
			var valueArray = _self.actArray[j];
			b = valueArray[0];
			c = valueArray[1]
			var rectArray = valueArray[2].split('*');
			_self.drowRect(_self.rectArray[0], _self.rectArray[1],
					_self.rectArray[2], _self.rectArray[3]);
		}
		_self.bValue = 50;
		_self.cValue = 50;
		_self.flag = 1;
		$("#slider-brightness").slider("option", "value", b);
		$("#slider-contrast").slider("option", "value", c);
		_self.flag = 0;
	}
	if (_self.actArray.length == 0) {
		_self.canX = 0, _self.canY = 0, _self.canX1 = 0, _self.canY1 = 0;
	}
}
