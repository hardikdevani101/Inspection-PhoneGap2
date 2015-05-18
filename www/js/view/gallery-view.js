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
	console.log("Image Edit Done for " + sourceInfo);
	var _self = this;
	sourceInfo['mrLineID'] = _self.app.appCache.session.m_inoutline_id;
	sourceInfo['inspID'] = _self.app.appCache.session.x_instructionline_id;
	sourceInfo['mrID'] = _self.app.appCache.session.M_INOUT_ID;
	sourceInfo['fileData'] = editedImgData;
	sourceInfo['fileExt'] = "jpg";

	if (editedImgData) {
		if (sourceInfo.filePath
				&& sourceInfo.filePath.startsWith(_self.app.appFS.rootURI
						+ "/VIS_Inspection/")) {
			console.log("On Update File");
			$
					.each(
							_self.inspFiles[sourceInfo['inspID']],
							function() {
								if (this.filePath == sourceInfo.filePath) {
									console.log("Found filePath");
									if (_self.app.appCache.imgCache[sourceInfo.filePath]) {
										console.log("Edit image cache");
										_self.app.appCache.imgCache[sourceInfo.filePath] = editedImgData;
									}
								}
							});
			_self.app.appFS.updateVISFile(sourceInfo);
			// _self.app.appCache.imgCache[sourceInfo.filePath] =
			// sourceInfo.fileData;
			_self.app.galleryview.renderInspFiles();

		} else {
			console.log("On create new File");
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
	param['mrID'] = _self.app.appCache.session.M_INOUT_ID;
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
		_self.app.aviaryEdit.edit(function(param) {
			_self.app.appFS.getFileByURL(param, function(param) {
				_self.onEditFinish(param, param.data);
			});
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
		param['mrID'] = _self.app.appCache.session.M_INOUT_ID;
		param['fileName'] = file.name;
		param['filePath'] = file.filePath;
		param['dataSource'] = file.dataSource;
		var result = jQuery.grep(_self.inspFiles[_self.line_id], function(item,
				index) {
			if (item.filePath == file.filePath) {
				item['filePath'] = file.filePath;
				item['name'] = file.name;
				item['uploded'] = file.uploded;
				item['dataSource'] = file.dataSource;
			}
			return item.filePath == file.filePath;
		});
		if (!result.length > 0) {
			console.log("File not found  === " + file.filePath);
			_self.onCreateNewEntry(file, param);
		}

	});

	// TODO Remove dummy data Runner in production.
//	_self.inspFiles[152452] = [];
//	for (var i = 0; i < 15; i++) {
//		var item = {};
//		item['filePath'] = '/file/path/file' + i + '.jpg';
//		item['name'] = "file" + i + ".txt";
//		item['dataSource'] = "LS";
//		item['uploded'] = "Y";
//		if (i % 2 == 0) {
//			item['filePath'] = '/file/path/file' + i + '.jpg';
//			item['name'] = "file" + i;
//			item['dataSource'] = "CMR";
//		}
//		_self.inspFiles[152452].push(item);
//	}
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
		console.log(extension);
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
				console.log("Entry Done");
			}, null);
			_self.inspFiles[_self.line_id].push(item);
		}
	} else {
		_self.visGallery.addFileInfo(param, function() {
			console.log("Entry Done");
		}, null);
		_self.inspFiles[_self.line_id].push(item);
	}
}

GalleryPage.prototype.init = function() {
	var _self = this;
	$(document).on(
			"pagebeforeshow",
			"#pg_gallery",
			function() {
				_self.rederBreadCrumb();
				// TODO remove below hard coded.
				// _self.line_id = 152452;
				_self.line_id = _self.app.appCache.session.x_instructionline_id;
				_self.visGallery = new Tbl_VISGallery(_self.app);
				_self.loadInspFile();

				if (_self.app.appCache.waterMarkImgs.length > 0) {
					$('select[name="select-gallery-waterMark"]').empty();
					$.each(_self.app.appCache.waterMarkImgs, function() {
						$('select[name="select-gallery-waterMark"]').append(
								$("<option></option>").val(this.url).html(
										this.name));
					});
				}
				$('select[name="select-gallery-waterMark"]').selectmenu(
						'refresh');
			});
	$('#prefixInpectLine').on('click', function() {
		$("#prefixModify").popup("open");
		$("#prefixInpect").val($('#prefixInpectLine').html());
	});

	$('#btn-add').on('click', function() {
		$("#pnl_file_sources").panel("open");
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
				console.log(result.rows.item(i).name);
				item['uploded'] = result.rows.item(i).imgUpload;
				item['dataSource'] = result.rows.item(i).dataSource;
				_self.inspFiles[_self.line_id].push(item);
			}

			// TODO Remove dummy data Runner in production.
//			_self.inspFiles[152452] = [];
//			for (var i = 0; i < 15; i++) {
//				var item = {};
//				item['filePath'] = '/file/path/file' + i + '.jpg';
//				item['name'] = "file" + i + ".txt";
//				item['dataSource'] = "LS";
//				item['uploded'] = "Y";
//				if (i % 2 == 0) {
//					item['filePath'] = '/file/path/file' + i + '.jpg';
//					item['name'] = "file" + i;
//					item['dataSource'] = "CMR";
//				}
//				_self.inspFiles[152452].push(item);
//			}
			// Dummy Data Runner End.

			_self.renderInspFiles();
			_self.loadActualImage(_self.line_id);
		};
		_self.visGallery.getFilesByInspInfo({
			M_InOutLine_ID : _self.app.appCache.session.m_inoutline_id,
			X_INSTRUCTIONLINE_ID : _self.line_id
		}, success, function(msg) {
			console.log('Reading Inspection Data from VIS_GAllERY is Failed.');
		});
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
//					var img = _self.app.image64;
//					setInterval(function() {
//						_self.app.appCache.imgCache[dataid] = img;
//						$('li[data-id="' + dataid + '"] img').attr('src', img);
//					}, 1000);
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
	if ($(event.delegateTarget).data('isimg')) {
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
				console.log(sourceInfo[0].filePath);
				_self.app.aviaryEdit.setup({
					'sourceInfo' : sourceInfo[0],
					imageURI : sourceInfo[0].filePath,
					watermark : $('select[name="select-gallery-waterMark"]')
							.val()
				});
			} else {
				_self.app.imageEditor.setup({
					'sourceInfo' : sourceInfo[0],
					width : $("#pg_gallery .ui-panel-wrapper").width(),
					height : $("#pg_gallery .ui-panel-wrapper").height(),
					img64 : imgData,
					watermark : $('select[name="select-gallery-waterMark"]')
							.val()
				});
			}
		}
	}
}

GalleryPage.prototype.getFileViewHtml = function(file) {
	var _self = this;
	var fileName = file.name;
	// var fileName = _self.app.appFS.getFileName(file.filePath);

	var extension = fileName.substr((fileName.lastIndexOf('.') + 1));
	console.log(extension);
	var findResult = jQuery.grep(_self.app.dataTypes, function(item, index) {
		return item == extension.toUpperCase();
	});
	var fileData = _self.app.file64;
	var isImage = false;
	console.log(file.dataSource);
	console.log(findResult.length);
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
	var line = '<li data-isimg="' + isImage + '" data-storage="'
			+ file.dataStorage + '"  data-name="' + file.name + '"data-id="'
			+ file.filePath + '" class="file-placeholder ' + classname
			+ '"><a data-rel="popup" href="#pop_file_actions">'
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
				} else {
					$('#ls_inspFiles li[data-id="' + file.filePath + '"] a')
							.removeClass("ui-icon-arrow-u");
				}
			}
		});

		$("#ls_inspFiles .file-placeholder").bind("tap", function(event) {
			_self.onFileTap(event);
		});
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

GalleryPage.prototype.onImageSelection = function(param) {
	var _self = this;
	// _self.app.appDB.addGalleryEntry(param.mrLineID, param.inspID, param.mrID,
	// param.fileName, param.fileURI);
	param['filePath'] = param.fileURI;
	_self.visGallery.addFileInfo(param, function() {
		console.log("Image Entry Done");
	}, null);

	var item = {};
	item['filePath'] = param.fileURI;
	item['data'] = param.data;
	item['uploded'] = 'F';
	_self.app.appCache.imgCache[param.fileURI] = param.data;
	if (!_self.app.appCache.inspFiles[param.inspID]) {
		_self.app.appCache.inspFiles[param.inspID] = [];
	}
	_self.app.appCache.inspFiles[param.inspID].push(item);
	_self.renderInspFiles();
}

GalleryPage.prototype.onPhotoDataSuccess = function(imageURI) {
	var _self = this;
	// console.log(imageURI);
	// _self.app.appFS.getFileByURL({
	// fileURI : imageURI
	// }, function(param) {
	// param['mrLineID'] = _self.app.appCache.session.m_inoutline_id;
	// param['inspID'] = _self.app.appCache.session.x_instructionline_id;
	// param['mrID'] = _self.app.appCache.session.M_INOUT_ID;
	// console.log("on Get file storage success");
	// _self.onImageSelection(param);
	// });

	// _self.app.imageEditor.setup({
	// 'sourceInfo' : {},
	// width : $("#pg_gallery .ui-panel-wrapper").width(),
	// height : $("#pg_gallery .ui-panel-wrapper").height(),
	// img64 : "data:image/jpeg;base64," + imageURI
	// });
	// $.mobile.changePage("#pg_img_editor");

	_self.app.aviaryEdit.setup({}, imageURI);
	_self.app.aviaryEdit.edit();

}

GalleryPage.prototype.onFail = function(message) {
	console.log(message);
}