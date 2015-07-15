var GalleryPage = function(app) {
	this.app = app;
	this.selFiles = [];
	this.inspFiles = {};
	this.selectedFile = '';
	this.isGridView = true;
	this.context = "#pg_gallery";
}

GalleryPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#btn_user', _self.context).html(_self.app.appCache.settingInfo.username);
};

GalleryPage.prototype.onEditFinish = function(sourceInfo, editedImgData) {
	var _self = this;
	sourceInfo['mrLineID'] = _self.app.appCache.session.m_inoutline_id;
	sourceInfo['inspID'] = _self.app.appCache.session.x_instructionline_id;
	sourceInfo['isMR'] = _self.app.appCache.session.isMR;
	sourceInfo['fileData'] = editedImgData;
	sourceInfo['fileExt'] = "jpg";

	if (editedImgData) {
		if (sourceInfo.filePath
				&& sourceInfo.filePath.startsWith(_self.app.appFS.rootURI
						+ "/VIS_Inspection/")) {
			for (var i = 0; i < _self.inspFiles[sourceInfo['inspID']].length; i++) {
				obj = _self.inspFiles[sourceInfo['inspID']][i];
				if (obj.filePath == sourceInfo.filePath) {
					if (_self.app.appCache.imgCache[sourceInfo.filePath]) {
						_self.app.appCache.imgCache[sourceInfo.filePath] = editedImgData;
					}
				}
			}

			_self.app.appFS.updateVISFile(sourceInfo);
			_self.app.galleryview.renderInspFiles();
		} else {
			_self.app.appFS.createVISFile(sourceInfo, "T");
		}
	}
}

GalleryPage.prototype.onDeleteFile = function(event) {
	var _self = this;
	for (var i = 0; i < _self.inspFiles[_self.line_id].length; i++) {
		obj = _self.inspFiles[_self.line_id][i];
		if (obj.filePath == _self.selectedFile) {
			_self.inspFiles[_self.line_id].splice(i, 1);
			break;
		}
	}

	_self.app.galleryview.renderInspFiles();
	var selected = _self.selectedFile;
	var param = {};
	param['mrLineID'] = _self.app.appCache.session.m_inoutline_id;
	param['inspID'] = _self.app.appCache.session.x_instructionline_id;
	param['isMR'] = _self.app.appCache.session.isMR;
	param['fileFullPath'] = selected;
	_self.visGallery.deleteFileInfo(param, function() {
		console.log("File deleted >>> " + selected);
	}, null);
	_self.el_fileAction_popup.popup('close');
	event.preventDefault();
	return false;
}

GalleryPage.prototype.onEditFile = function(event) {
	var _self = this;
	if (_self.app.appCache.settingInfo.img_editor
			&& _self.app.appCache.settingInfo.img_editor != 'Vision') {
		_self.app.aviaryEdit.edit(function(param, data) {
			_self.onEditFinish(param, data);
		});
	} else {
		$.mobile.changePage("#pg_img_editor");
	}
	event.preventDefault();
	return false;
}

GalleryPage.prototype.onFileData = function(selFiles) {
	var _self = this;
	$
			.each(
					selFiles,
					function(index, file) {
						var result = false;
						if (_self.inspFiles[_self.line_id]) {

							for (var i = 0; i < _self.inspFiles[_self.line_id].length; i++) {
								item = _self.inspFiles[_self.line_id][i];
								if (item.filePath == file.filePath) {
									_self.inspFiles[_self.line_id][i]['filePath'] = file.filePath;
									_self.inspFiles[_self.line_id][i]['name'] = file.name;
									_self.inspFiles[_self.line_id][i]['uploded'] = file.uploded;
									_self.inspFiles[_self.line_id][i]['dataSource'] = file.dataSource;
									result = true;
									break;
								}
							}
						}
						if (!result) {
							_self.onCreateNewEntry(file);
						}
					});

	// TODO Remove dummy data Runner in production.
	// _self.inspFiles[152452] = [];
	// for (var i = 0; i < 15; i++) {
	// var item = {};
	// item['filePath'] = '/file/path/file' + i + '.jpg';
	// item['name'] = "file" + i + ".txt";
	// item['dataSource'] = "LS";
	// item['uploded'] = "Y";
	// if (i % 2 == 0) {
	// item['filePath'] = '/file/path/file' + i + '.jpg';
	// item['name'] = "file" + i;
	// item['dataSource'] = "CMR";
	// }
	// _self.inspFiles[152452].push(item);
	// }
	// Dummy Data Runner End.

	_self.renderInspFiles();
	_self.loadActualImage(_self.line_id);
}

GalleryPage.prototype.onCreateNewEntry = function(file) {
	var _self = this;

	param = {};
	param['mrLineID'] = _self.app.appCache.session.m_inoutline_id;
	param['inspID'] = _self.app.appCache.session.x_instructionline_id;
	param['isMR'] = _self.app.appCache.session.isMR;
	param['fileName'] = file.name;
	param['filePath'] = file.filePath;
	param['dataSource'] = file.dataSource;

	item = {};
	item['filePath'] = file.filePath;
	item['name'] = file.name;
	item['uploded'] = file.uploded;
	item['dataSource'] = file.dataSource;

	// Add DB Entry or Create File from FTP Data
	if (file.dataSource == "FTP" || file.dataSource == "LS") {
		var extension = file.name.substr((file.name.lastIndexOf('.') + 1));
		var findResult = jQuery.grep(_self.app.dataTypes,
				function(item, index) {
					return item == extension.toUpperCase();
				});
		if (findResult.length > 0) {
			var base64 = _self.app.appCache.imgCache[file.filePath];
			param['fileData'] = base64;
			param['fileExt'] = extension;
			if (base64) {
				_self.app.appFS.createVISFile(param,
						file.edited ? (file.edited ? "T" : "F") : "F");
			}
		} else {
			param.edited = true;
			_self.visGallery.addFileInfo(param, function() {
			}, null);
			item['uploded'] = 'F';
			_self.inspFiles[_self.line_id].push(item);
		}
	} else {

		if (file.edited) {
			var base64 = _self.app.appCache.imgCache[file.filePath];
			param['fileData'] = base64;
			param['fileExt'] = "jpg";
			if (base64) {
				_self.app.appFS.createVISFile(param, "T");
			}
		} else {
			_self.visGallery.addFileInfo(param, function() {
			}, null);
			item['uploded'] = 'F';
			_self.inspFiles[_self.line_id].push(item);
		}

	}
}

GalleryPage.prototype.init = function() {
	var _self = this;
	_self.contextPage = $(_self.context);
	_self.el_mainDiv = $("#pg_gal_main", _self.contextPage);
	_self.el_mainDiv_img = $("#pg_gal_main img", _self.contextPage);
	_self.el_prefix_inspLine = $("#prefixInpectLine", _self.contextPage);
	_self.el_prefix_popup = $("#prefixModify", _self.contextPage);
	_self.el_prefix_insp = $("#prefixInpect", _self.contextPage);
	_self.el_add_button = $("#btn-add", _self.contextPage);
	_self.el_pnl_fileSource = $("#pnl_file_sources", _self.contextPage);
	_self.el_update_prefix = $("#btn_update_prefix", _self.contextPage);
	_self.el_reset_prefix = $("#btn_reset_prefix", _self.contextPage);
	_self.el_btn_camera = $("#btn_pic_camera", _self.contextPage);
	_self.el_btn_gallery = $("#btn_pic_gallery", _self.contextPage);
	_self.el_btn_file = $("#btn_file_explorer", _self.contextPage);
	_self.el_btn_delete = $("#btn_delete_file", _self.contextPage);
	_self.el_btn_edit = $("#btn_edit_file", _self.contextPage);
	_self.el_btn_toggle = $("#btn_doc_view_mode", _self.contextPage);
	_self.el_ls_inspFile = $("#ls_inspFiles", _self.contextPage);
	_self.el_waterMark = $('select[name="select-gallery-waterMark"]',
			_self.contextPage);
	_self.el_fileAction_popup = $('#pop_file_actions', _self.contextPage);
	_self.el_lbl_inspDetail = $('#lbl_inspDetail', _self.contextPage);

	$(document)
			.on(
					"pagebeforeshow",
					_self.context,
					function() {
						_self.isGridView = true;
						_self.app.appCache.currentPage = _self.context;
						_self.rederBreadCrumb();
						// TODO remove below hard coded.
						// _self.line_id = 152452;
						_self.line_id = _self.app.appCache.session.x_instructionline_id;
						_self.isMR = _self.app.appCache.session.isMR;
						_self.visGallery = new Tbl_VISGallery(_self.app);
						var sel_inoutline_id = _self.app.appCache.session.m_inoutline_id;

						// _self.app.appCache.inspLines[sel_inoutline_id]
						for (var i = 0; i < _self.app.appCache.inspLines[sel_inoutline_id].length; i++) {
							obj = _self.app.appCache.inspLines[sel_inoutline_id][i];
							if (obj.x_instructionline_id == _self.line_id) {
								_self.el_lbl_inspDetail.html(obj.name);
								break;
							}
						}
						if (!_self.app.appCache.settingInfo.isWaterMarkLoaded) {
							_self.loadWatermark();
							_self.app.appCache.settingInfo.isWaterMarkLoaded = true;
						}
						setTimeout(function() {
							_self.loadInspFile();
						}, 10);

						_self.el_mainDiv.addClass('img-gallery');
						$("#pg_gal_main img", _self.contextPage).removeClass(
								'ui-listview-mode');
						$("#ls_inspFiles p button.ui-icon-arrow-u",
								_self.context).hide();

						$("#ls_inspFiles li button h2", _self.context).css(
								"color", "white");

						_self.el_prefix_inspLine
								.html(_self.app.appCache.prefixCache[sel_inoutline_id]);

						$.mobile.loading('hide');
					});

	_self.el_waterMark.on('change', function() {
		var value = $(this).children('option:selected').attr('value');
		if (value != '') {
			_self.app.appCache.selWatermark = value;
			_self.app.onUpdateWaterMark(value, function(msg) {
				_self.app.showError("pg_gallery",
						"Error: Watermark Not Updated - " + msg);
			});
		}
	});

	_self.el_prefix_inspLine.on('click', function(event) {
		_self.el_prefix_popup.popup("open", {positionTo: '#pg_gallery div[data-role="header"]'});
		_self.el_prefix_insp.val(_self.el_prefix_inspLine.html());
		event.preventDefault();
		return false;
	});

	_self.el_add_button.on('click', function(event) {
		_self.el_pnl_fileSource.panel("toggle");
		_self.el_pnl_fileSource.enhanceWithin();
		_self.el_pnl_fileSource.panel({
			disabled : false
		});
		event.preventDefault();
		return false;
	});

	$("#pg_gallery #btn_user").on('click', function(event) {
		//$('#preferenceMenu').popup('open');
		_self.app.showPreference('pg_gallery');
		event.preventDefault();
		return false
	});

	_self.el_update_prefix
			.on(
					'click',
					function(event) {
						_self.el_prefix_inspLine.html(_self.el_prefix_insp
								.val());
						_self.el_prefix_popup.popup("close");
						if (_self.app.appCache.session.m_inoutline_id)
							_self.app.appCache.prefixCache[_self.app.appCache.session.m_inoutline_id] = _self.el_prefix_insp
									.val();
						event.preventDefault();
						return false;
					});

	_self.el_reset_prefix
			.on(
					'click',
					function(event) {
						var sel_inoutline_id = _self.app.appCache.session.m_inoutline_id;
						var mr_lines = _self.app.appCache.mrLines
								.filter(function(element, index, array) {
									return (element.m_inoutline_id == sel_inoutline_id);
								});
						if (mr_lines.length > 0) {
							_self.el_prefix_inspLine.html(mr_lines[0].desc);
							_self.el_prefix_popup.popup("close");
							if (_self.app.appCache.session.m_inoutline_id)
								_self.app.appCache.prefixCache[_self.app.appCache.session.m_inoutline_id] = mr_lines[0].desc;
						}
						event.preventDefault();
						return false;
					});

	_self.el_btn_camera.on('click', function(event) {
		_self.getCameraImage();
		event.preventDefault();
		return false;
	});

	_self.el_btn_gallery.on('click', function(event) {
		_self.getGalleryImage();
		event.preventDefault();
		return false;
	});

	_self.el_btn_file.on('click', function(event) {
		$.mobile.changePage("#pg_file_explorer");
		event.preventDefault();
		return false;
	});

	_self.el_btn_delete.on('click', function(event) {
		_self.onDeleteFile(event);
		event.preventDefault();
		return false;

	});

	_self.el_btn_edit.on('click', function(event) {
		_self.onEditFile(event);
		event.preventDefault();
		return false;
	});

	_self.el_btn_toggle.on('click', function(event) {
		$(this).removeClass("ui-btn-active");
		if ($(this).attr('class').indexOf('ui-icon-grid') >= 0) {
			_self.isGridView = true;
			$(this).removeClass('ui-icon-grid');
			$(this).html('List View');
			$(this).addClass('ui-icon-bars ui-btn-icon-notext');
			$('#pg_gallery #pg_gal_main').addClass('img-gallery');
			$('#pg_gallery .ui-content').removeClass('img-gallery-listview');
			$("#pg_gallery #pg_gal_main img").removeClass('ui-listview-mode');
			$("#ls_inspFiles p a.ui-icon-arrow-u", _self.context).hide();
			$.each(_self.inspFiles[_self.line_id], function(index, file) {
				if (file.uploded == 'T') {
					$(
							'#ls_inspFiles li[data-id="' + file.filePath
									+ '"] p a.ui-icon-arrow-u', _self.context)
							.show();
				}
			});
			$("#ls_inspFiles .ui-listview .ui-li-has-thumb h2", _self.context)
					.css("color", "#FFF");

		} else {
			_self.isGridView = false;
			$(this).removeClass('ui-icon-bars');
			$(this).html('Grid View');
			$(this).addClass('ui-icon-grid ui-btn-icon-notext');
			$("#pg_gal_main img", _self.contextPage).addClass(
					'ui-listview-mode');
			_self.el_mainDiv.removeClass('img-gallery');
			_self.el_mainDiv.addClass('img-gallery-listview');

			$('#ls_inspFiles li a', _self.context).removeClass(
					"ui-icon-carat-r");
			$("#ls_inspFiles p a.ui-icon-arrow-u", _self.context).hide();
			$.each(_self.inspFiles[_self.line_id], function(index, file) {
				if (file.uploded == 'T') {

					$('#ls_inspFiles li[data-id="' + file.filePath + '"] a')
							.addClass("ui-icon-arrow-u", _self.context);
				}
			});
			$("#ls_inspFiles .ui-listview .ui-li-has-thumb h2", _self.context)
					.css("color", "#202C3C");
		}
		event.preventDefault();
		return false;
	});
}

GalleryPage.prototype.loadWatermark = function() {
	var _self = this;
	if (_self.app.appCache.waterMarkImgs.length >= 0) {
		_self.el_waterMark.empty();
		$.each(_self.app.appCache.waterMarkImgs, function() {
			if (this.url == _self.app.appCache.settingInfo['watermark']) {
				_self.el_waterMark.append($("<option selected></option>").val(
						this.url).html(this.name));
			} else {
				_self.el_waterMark.append($("<option></option>").val(this.url)
						.html(this.name));
			}
		});

		if (!(_self.app.appCache.settingInfo['watermark'])) {
			var findResult = jQuery.grep(_self.app.appCache.waterMarkImgs,
					function(item, index) {
						return item.isDefault == 'Y';
					});
			if (findResult.length > 0) {
				_self.el_waterMark.val(findResult[0].url);
				_self.el_waterMark.trigger('change');
			}
		}
	}
	_self.el_waterMark.selectmenu('refresh');

	var value = _self.el_waterMark.children('option:selected').attr('value');
	_self.app.appCache.selWatermark = value;
}

GalleryPage.prototype.loadInspFile = function() {
	var _self = this;
	if (!(typeof _self.inspFiles[_self.line_id] === 'undefined')
			&& _self.inspFiles[_self.line_id].length > 0) {
		_self.renderInspFiles();
	} else {
		var success = function(tx, result) {
			_self.inspFiles[_self.line_id] = [];
			for (var i = 0; i < result.rows.length; i++) {
				var item = {};
				item['filePath'] = result.rows.item(i).file;
				item['name'] = result.rows.item(i).name;
				item['uploded'] = result.rows.item(i).imgUpload;
				item['dataSource'] = result.rows.item(i).dataSource;
				_self.inspFiles[_self.line_id].push(item);
			}

			// TODO Remove dummy data Runner in production.
			// _self.inspFiles[152452] = [];
			// for (var i = 0; i < 15; i++) {
			// var item = {};
			// item['filePath'] = '/file/path/file' + i + '.jpg';
			// item['name'] = "file" + i + ".txt";
			// item['dataSource'] = "LS";
			// item['uploded'] = "Y";
			// if (i % 2 == 0) {
			// item['filePath'] = '/file/path/file' + i + '.jpg';
			// item['name'] = "file" + i;
			// item['dataSource'] = "CMR";
			// }
			// _self.inspFiles[152452].push(item);
			// }
			// Dummy Data Runner End.

			_self.renderInspFiles();
			_self.loadActualImage(_self.line_id);
		};
		if (_self.isMR == "Y") {
			_self.visGallery.getFilesByMRInfo({
				M_InOutLine_ID : _self.app.appCache.session.m_inoutline_id,
				X_INSTRUCTIONLINE_ID : _self.line_id
			}, success, function(msg) {
				_self.app.showError("pg_gallery", "Reading Data Failed.");
			});
		} else {
			_self.visGallery.getFilesByInspInfo({
				M_InOutLine_ID : _self.app.appCache.session.m_inoutline_id,
				X_INSTRUCTIONLINE_ID : _self.line_id
			}, success, function(msg) {
				_self.app.showError("pg_gallery", "Reading Data Failed.");
			});
		}
	}
}

GalleryPage.prototype.loadActualImage = function(inspID) {
	var _self = this;
	if (!(typeof _self.inspFiles[inspID] === 'undefined')) {
		$.each(_self.inspFiles[inspID], function() {
			var extension = this.filePath.substr((this.filePath
					.lastIndexOf('.') + 1));
			// var extension =
			// _self.app.appFS.getExtention(this.filePath
			// .toUpperCase());

			var findResult = jQuery.grep(_self.app.dataTypes, function(item,
					index) {
				return item == extension.toUpperCase();
			});
			if (this.dataSource == 'CMR' || findResult.length > 0) {

				var dataid = this.filePath;
				if (_self.app.appCache.imgCache[dataid]) {
					$('li[data-id="' + dataid + '"] img', _self.context).attr(
							'src', _self.app.appCache.imgCache[dataid]);
				} else {

					// TODO remove below dummy data runner
					// Start of dummy data filler.
					// var img = _self.app.file64;
					// setInterval(function() {
					// _self.app.appCache.imgCache[dataid] = img;
					// $('li[data-id="' + dataid + '"] img').attr('src', img);
					// }, 1000);
					// End of dummy data filler.

					_self.app.appFS.getFileByURL({
						fileURI : this.filePath
					}, function(param) {
						img = param.data
						self.app.appCache.imgCache[dataid] = img;
						$('li[data-id="' + dataid + '"] img', _self.context)
								.attr('src', img);
					});
				}
			}

		});
	}
}

GalleryPage.prototype.onFileTap = function(event) {
	var _self = this;

	var dataid = $(event.delegateTarget).data('id');
	// var imgData = _self.app.tempImage;
	var imgData = _self.app.appCache.imgCache[dataid];

	_self.selectedFile = dataid;
	if ($(event.delegateTarget).data('isimg')
			&& $(event.delegateTarget).data('isup') == 'F') {
		_self.el_btn_edit.show();
	} else {
		_self.el_btn_edit.hide();
	}

	setTimeout(
			function() {
				if (_self.app.appCache.imgCache[dataid]) {

					var sourceInfo = jQuery.grep(
							_self.inspFiles[_self.line_id], function(value,
									index) {
								return value.filePath == dataid;
							});

					if (sourceInfo.length > 0) {
						if (_self.app.appCache.settingInfo.img_editor
								&& _self.app.appCache.settingInfo.img_editor != 'Vision') {
							_self.app.aviaryEdit.setup({
								'sourceInfo' : sourceInfo[0],
								imageURI : sourceInfo[0].filePath,
								watermark : (_self.el_waterMark.val())
							});
						} else {

							_self.app.imageEditor = new ImageEditorPage(
									_self.app);
							_self.app.imageEditor.init();
							_self.app.imageEditor.setup({
								img64 : imgData,
								'sourceInfo' : sourceInfo[0],
								watermark : (_self.el_waterMark.val())
							}, "Y");
						}
					}
				}
			}, 10);
}

GalleryPage.prototype.getFileViewHtml = function(file) {
	var _self = this;
	var fileName = file.name;
	// var fileName = _self.app.appFS.getFileName(file.filePath);

	var extension = fileName.substr((fileName.lastIndexOf('.') + 1));
	var findResult = jQuery.grep(_self.app.dataTypes, function(item, index) {
		return item == extension.toUpperCase();
	});
	var fileData = _self.app.file64;
	var isImage = false;
	if (file.dataSource == 'CMR' || findResult.length > 0) {
		isImage = true;
		fileData = _self.app.image64;
		if (_self.app.appCache.imgCache[file.filePath]) {
			fileData = _self.app.appCache.imgCache[file.filePath];
		}
	}
	var classname = ''
	if (isImage) {
		classname = 'image-data-source';
	}
	var line = '<li data-isimg="' + isImage + '" data-isup="' + file.uploded
			+ '" data-storage="' + file.dataStorage + '"  data-name="'
			+ file.name + '"data-id="' + file.filePath
			+ '" class="file-placeholder ' + classname + '"><a href="#">'
			+ '<img class="ui-li-thumb" src="' + fileData + '" /><h2>'
			+ file.name + '</h2>';
	if (file.uploded == 'T') {
		line += '<p class="ui-li-aside"><a class="ui-btn ui-corner-all ui-icon-arrow-u ui-btn-icon-notext ui-btn-inline"></a></p>';
	}
	line += '</a></li>';
	return line;
}

GalleryPage.prototype.renderInspFiles = function() {
	var _self = this;
	var items = '';
	if (!(typeof _self.inspFiles[_self.line_id] === 'undefined')) {
		$.each(_self.inspFiles[_self.line_id], function(index, value) {
			line = _self.getFileViewHtml(this);
			items = items + line;
		});
		_self.el_ls_inspFile.html(items);
		_self.el_ls_inspFile.listview("refresh");
		$("#ls_inspFiles p a.ui-icon-arrow-u", _self.context).hide();
		$('#ls_inspFiles li a', _self.context).removeClass("ui-icon-carat-r");

		$.each(_self.inspFiles[_self.line_id], function(index, file) {
			if (file.uploded == 'T') {
				if (_self.isGridView) {
					$('li[data-id="' + file.filePath + '"] .ui-icon-arrow-u',
							_self.context).show();
				}
			}
		});
		$.each(_self.inspFiles[_self.line_id], function(index, file) {

			$('#ls_inspFiles li[data-id="' + file.filePath + '"]',
					_self.context).off('click');
			$('#ls_inspFiles li[data-id="' + file.filePath + '"]',
					_self.context).on(
					"click",
					function(event) {
						_self.el_fileAction_popup.popup("open", {
							positionTo : '#ls_inspFiles li[data-id="'
									+ file.filePath + '"]'
						});
						_self.onFileTap(event);
						_self.el_fileAction_popup.enhanceWithin();
						event.preventDefault();
						return false;
					});
		});
	}
}

GalleryPage.prototype.getCameraImage = function() {
	var _self = this;
	navigator.camera.getPicture(function(param) {
		_self.onPhotoDataSuccess(param);
	}, function(message) {
		_self.onFail(message);
	}, {
		quality : 70,
		destinationType : Camera.DestinationType.FILE_URI,
		encodingType : Camera.EncodingType.JPEG
	});
}

GalleryPage.prototype.getGalleryImage = function() {
	var _self = this;
	navigator.camera.getPicture(function(param) {
		_self.onPhotoDataSuccess(param);
	}, _self.onFail, {
		quality : 70,
		sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
		destinationType : Camera.DestinationType.FILE_URI,
		encodingType : Camera.EncodingType.JPEG
	});
}

GalleryPage.prototype.onPhotoDataSuccess = function(imageURI) {
	var _self = this;

	if (_self.app.appCache.settingInfo.img_editor
			&& _self.app.appCache.settingInfo.img_editor != 'Vision') {
		_self.app.aviaryEdit.setup({
			'sourceInfo' : {},
			imageURI : imageURI,
			watermark : (_self.el_waterMark.val())
		});
		_self.app.aviaryEdit.edit(function(param, data) {
			_self.onEditFinish(param, data);
		});
	} else {
		_self.app.appFS.getFileByURL({
			fileURI : imageURI
		}, function(param) {

			_self.app.imageEditor = new ImageEditorPage(_self.app);
			_self.app.imageEditor.init();
			_self.app.imageEditor.setup({
				img64 : param.data,
				'sourceInfo' : {},
				watermark : (_self.el_waterMark.val())
			}, "Y");
			setTimeout(function() {
				$.mobile.changePage("#pg_img_editor");
			}, 10);
		});
	}

}

GalleryPage.prototype.onFail = function(message) {
	var _self = this;
	_self.app.showError("pg_gallery", message);
}