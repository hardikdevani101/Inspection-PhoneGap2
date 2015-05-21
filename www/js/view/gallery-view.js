var GalleryPage = function(app) {
	this.app = app;
	this.selFiles = [];
	this.inspFiles = {};
	this.selectedFile = '';
	this.isGridView = true;
}

GalleryPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#pg_gallery #btn_user').html(_self.app.appCache.settingInfo.username);
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
			$
					.each(
							_self.inspFiles[sourceInfo['inspID']],
							function() {
								if (this.filePath == sourceInfo.filePath) {
									if (_self.app.appCache.imgCache[sourceInfo.filePath]) {
										_self.app.appCache.imgCache[sourceInfo.filePath] = editedImgData;
									}
								}
							});
			_self.app.appFS.updateVISFile(sourceInfo);
			// _self.app.appCache.imgCache[sourceInfo.filePath] =
			// sourceInfo.fileData;
			_self.app.galleryview.renderInspFiles();

		} else {
			_self.app.appFS.createVISFile(sourceInfo);
		}
	}
}

GalleryPage.prototype.onDeleteFile = function(event) {
	var _self = this;
	event.preventDefault();
	_self.app.galleryview.inspFiles[_self.line_id] = jQuery.grep(
			_self.app.galleryview.inspFiles[_self.line_id], function(item,
					index) {
				return item.filePath != _self.app.galleryview.selectedFile;
			});
	_self.app.galleryview.renderInspFiles();
	var selected = _self.app.galleryview.selectedFile;
	var param = {};
	param['mrLineID'] = _self.app.appCache.session.m_inoutline_id;
	param['inspID'] = _self.app.appCache.session.x_instructionline_id;
	param['isMR'] = _self.app.appCache.session.isMR;
	param['fileFullPath'] = selected;
	_self.visGallery.deleteFileInfo(param, function() {
		console.log("File deleted >>> " + selected);
	}, null);
	$("#pop_file_actions").popup('close');

}

GalleryPage.prototype.onEditFile = function(event) {
	var _self = this;
	event.preventDefault();
	if (_self.app.appCache.settingInfo.img_editor
			&& _self.app.appCache.settingInfo.img_editor != 'Vision') {
		_self.app.aviaryEdit.edit(function(param, data) {
			_self.onEditFinish(param, data);
		});
	} else {
		$.mobile.changePage("#pg_img_editor");
	}
}

GalleryPage.prototype.onFileData = function(selFiles) {
	var _self = this;
	$.each(selFiles, function(index, file) {
		param = {};
		param['mrLineID'] = _self.app.appCache.session.m_inoutline_id;
		param['inspID'] = _self.app.appCache.session.x_instructionline_id;
		param['isMR'] = _self.app.appCache.session.isMR;
		param['fileName'] = file.name;
		param['filePath'] = file.filePath;
		param['dataSource'] = file.dataSource;
		var result = [];
		if (_self.inspFiles[_self.line_id]) {
			result = jQuery.grep(_self.inspFiles[_self.line_id], function(item,
					index) {
				if (item.filePath == file.filePath) {
					item['filePath'] = file.filePath;
					item['name'] = file.name;
					item['uploded'] = file.uploded;
					item['dataSource'] = file.dataSource;
				}
				return item.filePath == file.filePath;
			});
		}
		if (!result.length > 0) {
			_self.onCreateNewEntry(file, param);
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

GalleryPage.prototype.onCreateNewEntry = function(file, param) {
	var _self = this;
	item = {};
	item['filePath'] = file.filePath;
	item['name'] = file.name;
	item['uploded'] = file.uploded;
	item['dataSource'] = file.dataSource;

	// Add DB Entry or Create File from FTP Data
	if (file.dataSource == "FTP") {
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
				_self.app.appFS.createVISFile(param);
			}
		} else {
			_self.visGallery.addFileInfo(param, function() {
			}, null);
			_self.inspFiles[_self.line_id].push(item);
		}
	} else {

		if (param.edited) {
			var base64 = _self.app.appCache.imgCache[file.filePath];
			param['fileData'] = base64;
			param['fileExt'] = "jpg";
			if (base64) {
				_self.app.appFS.createVISFile(param);
			}
		} else {
			_self.visGallery.addFileInfo(param, function() {
			}, null);
			_self.inspFiles[_self.line_id].push(item);
		}

	}
}

GalleryPage.prototype.init = function() {
	var _self = this;
	$(document)
			.on(
					"pagebeforeshow",
					"#pg_gallery",
					function() {
						_self.isGridView = true;

						_self.rederBreadCrumb();
						// TODO remove below hard coded.
						// _self.line_id = 152452;
						_self.line_id = _self.app.appCache.session.x_instructionline_id;
						_self.isMR = _self.app.appCache.session.isMR;
						_self.visGallery = new Tbl_VISGallery(_self.app);

						setTimeout(function() {
							_self.loadInspFile();
						}, 10);

						$('#pg_gallery #pg_gal_main').addClass('img-gallery');
						$('#pg_gallery #pg_gal_main img').removeClass(
								'ui-listview-mode');
						$("#ls_inspFiles p button.ui-icon-arrow-u").hide();

						$("#ls_inspFiles li button h2").css("color", "white");

						if (_self.app.appCache.waterMarkImgs.length > 0) {
							$('select[name="select-gallery-waterMark"]')
									.empty();
							$
									.each(
											_self.app.appCache.waterMarkImgs,
											function() {
												$(
														'select[name="select-gallery-waterMark"]')
														.append(
																$(
																		"<option></option>")
																		.val(
																				this.url)
																		.html(
																				this.name));
											});
						}
						$('select[name="select-gallery-waterMark"]')
								.selectmenu('refresh');
						$.mobile.loading('hide');
					});
	$('#prefixInpectLine').on('click', function() {
		$("#prefixModify").popup("open");
		$("#prefixInpect").val($('#prefixInpectLine').html());
	});

	// $(document).on("panelbeforeopen", "#pnl_file_sources", function(e, ui) {
	// $("#pnl_file_sources").enhanceWithin();
	// });

	$('#btn-add').on('click', function() {
		$("#pnl_file_sources").panel("toggle");
		$("#pnl_file_sources").enhanceWithin();
		$("#pnl_file_sources").panel({
			disabled : false
		});
	});

	$('#btn_update_prefix').on(
			'click',
			function() {
				$("#prefixInpectLine").html($('#prefixInpect').val());
				$("#prefixModify").popup("close");
				if ($("#prefixInpectLine").data('id'))
					_self.app.appCache.prefixCache[$("#prefixInpectLine").data(
							'id').toString()] = $('#prefixInpect').val();
			});
	$('#btn_pic_camera').on('click', function() {
		_self.getCameraImage();
		// _self.onPhotoEdit({
		// data : _self.app.tempImage
		// });
	});

	$('#btn_pic_gallery').on('click', function() {
		_self.getGalleryImage();
	});

	$('#btn_delete_file').on('click', function(event) {
		_self.onDeleteFile(event);

	});

	$('#btn_edit_file').on('click', function(event) {
		_self.onEditFile(event);
	});

	$("#btn_doc_view_mode")
			.on(
					'click',
					function() {
						$(this).removeClass("ui-btn-active");
						if ($(this).attr('class').indexOf('ui-icon-grid') >= 0) {
							_self.isGridView = true;
							$(this).removeClass('ui-icon-grid');
							$(this).html('List View');
							$(this).addClass('ui-icon-bars ui-btn-icon-notext');
							$('#pg_gallery #pg_gal_main').addClass(
									'img-gallery');
							$('#pg_gallery #pg_gal_main img').removeClass(
									'ui-listview-mode');
							$("#ls_inspFiles p button.ui-icon-arrow-u").hide();
							$
									.each(
											_self.inspFiles[_self.line_id],
											function(index, file) {
												if (file.uploded == 'T') {
													$(
															'#ls_inspFiles li[data-id="'
																	+ file.filePath
																	+ '"] p button.ui-icon-arrow-u')
															.show();
												}
											});
							$("#ls_inspFiles li button h2").css("color",
									"white");

						} else {
							_self.isGridView = false;
							$(this).removeClass('ui-icon-bars');
							$(this).html('Grid View');
							$(this).addClass('ui-icon-grid ui-btn-icon-notext');
							$('#pg_gallery #pg_gal_main img').addClass(
									'ui-listview-mode');
							$('#pg_gallery #pg_gal_main').removeClass(
									'img-gallery');

							$('#ls_inspFiles li a').removeClass(
									"ui-icon-carat-r");
							$("#ls_inspFiles p button.ui-icon-arrow-u").hide();
							$.each(_self.inspFiles[_self.line_id], function(
									index, file) {
								if (file.uploded == 'T') {

									$(
											'#ls_inspFiles li[data-id="'
													+ file.filePath
													+ '"] button').addClass(
											"ui-icon-arrow-u");
								}
							});
							$("#ls_inspFiles li button h2").css("color",
									"#202C3C");
						}
					});
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
				console.log(result.rows.item(i).file);
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
					$('li[data-id="' + dataid + '"] img').attr('src',
							_self.app.appCache.imgCache[dataid]);
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
						$('li[data-id="' + dataid + '"] img').attr('src', img);
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
	console.log($(event.delegateTarget).data('isup'));
	if ($(event.delegateTarget).data('isimg')
			&& $(event.delegateTarget).data('isup') == 'F') {
		$("#btn_edit_file").show();
	} else {
		$("#btn_edit_file").hide();
	}

	if (_self.app.appCache.imgCache[dataid]) {
		var sourceInfo = jQuery.grep(_self.inspFiles[_self.line_id], function(
				value, index) {
			return value.filePath == dataid;
		});
		if (sourceInfo.length > 0) {
			if (_self.app.appCache.settingInfo.img_editor
					&& _self.app.appCache.settingInfo.img_editor != 'Vision') {
				_self.app.aviaryEdit.setup({
					'sourceInfo' : sourceInfo[0],
					imageURI : sourceInfo[0].filePath,
					watermark : ($('select[name="select-gallery-waterMark"]')
							.val())
				});
			} else {
				_self.app.imageEditor.setup({
					img64 : imgData,
					'sourceInfo' : sourceInfo[0],
					watermark : ($('select[name="select-gallery-waterMark"]')
							.val())
				}, "Y");
			}
		}
	}
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
		$('#ls_inspFiles').html(items);
		$('#ls_inspFiles').listview("refresh");
		$("#ls_inspFiles p a.ui-icon-arrow-u").hide();
		$('#ls_inspFiles li a').removeClass("ui-icon-carat-r");

		$.each(_self.inspFiles[_self.line_id], function(index, file) {
			if (file.uploded == 'T') {
				if (_self.isGridView) {
					$('li[data-id="' + file.filePath + '"] .ui-icon-arrow-u')
							.show();
				}
			}
		});
		$.each(_self.inspFiles[_self.line_id],
				function(index, file) {

					$('#ls_inspFiles li[data-id="' + file.filePath + '"]').off(
							'click');
					$('#ls_inspFiles li[data-id="' + file.filePath + '"]').on(
							"click", function(event) {
								event.preventDefault();
								console.log("file-placeholder tap >>>>>");
								$("#pop_file_actions").popup("close");
								$("#pop_file_actions").popup("open", {
									x : event.clientX,
									y : event.clientY
								});
								_self.onFileTap(event);
								$("#pop_file_actions").enhanceWithin();
							});
				});
		// $("#ls_inspFiles .file-placeholder").bind("tap", function(event) {
		// console.log("file-placeholder tap >>>>>");
		// $("#pop_file_actions").popup("open", {
		// x : event.clientX,
		// y : event.clientY
		// });
		// _self.onFileTap(event);
		// });
	}
}

GalleryPage.prototype.getCameraImage = function() {
	var _self = this;
	navigator.camera.getPicture(function(param) {
		_self.onPhotoDataSuccess(param);
	}, _self.onFail, {
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

	if (_self.app.appCache.settingInfo.img_editor == 'Vision') {

		_self.app.appFS.getFileByURL({
			fileURI : imageURI
		}, function(param) {
			_self.app.imageEditor.setup({
				'sourceInfo' : {},
				width : $("#pg_gallery .ui-panel-wrapper").width(),
				height : $("#pg_gallery .ui-panel-wrapper").height(),
				img64 : param.data,
				watermark : $('select[name="select-gallery-waterMark"]').val()
			});
		});
		$.mobile.changePage("#pg_img_editor");
	} else {

		_self.app.aviaryEdit.setup({
			'sourceInfo' : {},
			imageURI : imageURI,
			watermark : $('select[name="select-gallery-waterMark"]').val()
		});

		// _self.app.aviaryEdit.setup({}, imageURI);
		_self.app.aviaryEdit.edit();

	}

}

GalleryPage.prototype.onFail = function(message) {
	_self.app.showError("pg_gallery", "message");
}