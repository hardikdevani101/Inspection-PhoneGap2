var FileExplorerPage = function(app) {
	this.app = app;
	this.currentDirPath = '/';
	this.isLocalStorage = true;
	this.isGridView = true;
	this.selFiles = [];
	this.context = "#pg_file_explorer";
}

FileExplorerPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$("#current-dir-path", _self.context).html(
			'<h3 class="ui-bar ui-bar-a">root</h3>');
	$('#pg_file_explorer #btn_user').html(
			_self.app.appCache.settingInfo.username);
};



FileExplorerPage.prototype.init = function() {
	var _self = this;
	_self.isLocalStorage = true;
	_self.fillDataProviders();
	var contextPage = $(_self.context);
	contextPage.on("pagebeforeshow", function() {
		var arrINsp = _self.app.appCache.inspLines[_self.app.appCache.session.m_inoutline_id];
		$
				.each(
						arrINsp,
						function(i, item) {
							if ((item.x_instructionline_id) == (_self.app.appCache.session.x_instructionline_id)) {
								_self.skipEditImg = item.skipEdit;
							}
						});
		
		_self.app.appCache.currentPage = _self.context;
		if (_self.isEditAll) {
			return;
		}

		_self.rederBreadCrumb();
		$('#selected-files-count', _self.context).html(_self.selFiles.length);
		$("#pnl_selected_files", _self.context).enhanceWithin();

		_self.app.showDialog("Loading");
		setTimeout(function() {
			_self.loadData();
		}, 1);
	});

	$("#btn_finish_file_selection", _self.context).on('click', function(event) {
		_self.isEditAll = true;
		if(_self.skipEditImg){
			_self.app.showDialog("Loading");
		}
		_self.editAll();
	});

	$("#btn_skip_file_explorer", _self.context).on('click', function(event) {
		_self.currentDirPath = '/';
		_self.selFiles = [];
		$.mobile.changePage("#pg_gallery");
		event.preventDefault();
		return false;
	});
	
	$("#pg_file_explorer #btn_user").on('click', function(event) {
		//$('#preferenceMenu').popup('open');
		_self.app.showPreference('pg_file_explorer');
		event.preventDefault();
		return false
	});

	$("#btn_reload_files", _self.context).on("tap", function(event) {
		_self.currentDirPath = '/';
		// _self.selFiles = [];
		_self.explodeDirectory(_self.currentDirPath, function() {
			_self.renderContent()
		});
		event.preventDefault();
		return false;
	});

	var el_dataProviders = $("#sel_dataproviders", _self.context);
	el_dataProviders.on("change", function(event) {
		if (el_dataProviders.val().startsWith('ftp')) {
			_self.isLocalStorage = false;
		} else {
			_self.isLocalStorage = true;
		}
		_self.onDataStorageChange(event);
		event.preventDefault();
		return false;
	});

	var el_BtnDeleteFile = $('#btn_FEdelete_file', _self.context);
	el_BtnDeleteFile.off('click')
	el_BtnDeleteFile.on('click', function(event) {
		_self.onDeleteFile(event);
		event.preventDefault();
		return false;
	});

	_self.el_file_back = $("#btn_back_file", _self.context);
	_self.el_file_back.off('click');
	_self.el_file_back.on('click', function(event) {
		_self.onBackDir();
		event.preventDefault();
		return false;
	});

	var el_BtnEditFile = $('#btn_FEedit_file', _self.context);
	el_BtnEditFile.off('click');
	el_BtnEditFile.on('click', function(event) {
		_self.onEditFile(event);
		event.preventDefault();
		return false;
	});

	// $("#selected-files-count").off();
	var el_pnlSelFiles = $('#pnl_selected_files', _self.context);

	var el_selFileCount = $('#selected-files-count', _self.context);
	el_selFileCount.on("tap", function(event) {
		el_pnlSelFiles.panel("open");
		event.preventDefault();
		return false;
	});

	el_pnlSelFiles.on("panelbeforeopen", function(e, ui) {
		_self.renderSelectedFiles(e, ui);
		for (var i = 0; i < _self.selFiles.length; i++) {
			var file = _self.selFiles[i];
			var el_selfile = $('#ls_sel_files li[data-id="' + file.filePath
					+ '"]', _self.context);
			el_selfile.off('click');
			el_selfile.on('click', function(event) {
				var elm = $(event.delegateTarget, '#pnl_selected_files');
				var elmFile = elm.data('id');
				$('#pop_fileEplorer_actions', _self.context).popup("open", {
					positionTo : '#ls_sel_files li[data-id="' + elmFile + '"]'
				});

				_self.onSelFileTap(event);
				event.preventDefault();
				return false;
			});
		}
		el_pnlSelFiles.enhanceWithin();
		e.preventDefault();
		return false;
	});

	var el_btnFileViewMode = $("#btn_file_view_mode", _self.context);
	el_btnFileViewMode.on('click',
			function(event) {
				$(this).removeClass("ui-btn-active");
				if ($(this).attr('class').indexOf('ui-icon-bars') >= 0) {

					$(this).removeClass('ui-icon-bars');
					$(this).html('Grid View');
					$(this).addClass('ui-icon-grid');

					$('#pg_file_explorer #pg_file_main').removeClass(
							'img-gallery');
					$('#pg_file_explorer .ui-content').addClass(
							'img-gallery-listview');
					$('#pg_file_explorer #pg_file_main img').addClass(
							'ui-listview-mode');
					$('#pg_file_explorer #pg_file_main .current_dir_location')
							.addClass('current_dir_location_list');
					_self.isGridView = false;
					$('#ls_files li a', _self.context).removeClass(
							"ui-icon-carat-r");
					$("#ls_files p a.ui-icon-arrow-d", _self.context).hide();
					$.each(_self.selFiles, function(index, file) {
						$('#ls_files li[data-id="' + file.filePath + '"] a',
								_self.context).addClass("ui-icon-arrow-d");
					});
					$("#ls_files  .ui-listview .ui-li-has-thumb h2",
							_self.context).css("color", "#FFF");
				} else {
					$(this).removeClass('ui-icon-grid');
					$(this).html('List View');
					$(this).addClass('ui-icon-bars');
					_self.isGridView = true;
					$('#pg_file_explorer #pg_file_main')
							.addClass('img-gallery');
					$('#pg_file_explorer .ui-content').removeClass(
							'img-gallery-listview');
					$('#pg_file_explorer #pg_file_main img').removeClass(
							'ui-listview-mode');
					$("#ls_files p a.ui-icon-arrow-d", _self.context).hide();

					$.each(_self.selFiles, function(index, file) {
						$(
								'#ls_files li[data-id="' + file.filePath
										+ '"] p a.ui-icon-arrow-d',
								_self.context).show();
					});
					$("#ls_files  .ui-listview .ui-li-has-thumb h2",
							_self.context).css("color", "#202C3C");
				}
				event.preventDefault();
				return false;
			});
}

FileExplorerPage.prototype.editAll = function() {
	var _self = this;
	find_rest = jQuery.grep(_self.selFiles, function(item, index) {

		var extension = item.name.substr((item.name.lastIndexOf('.') + 1));
		var findResult = jQuery.grep(_self.app.dataTypes,
				function(item, index) {
					return item == extension.toUpperCase();
				});
		if (findResult.length > 0) {
			return item.edited != true;
		}
	});
	
	if (find_rest.length > 0) {
		
		var imgData = _self.app.appCache.imgCache[find_rest[0].filePath];
		if (_self.app.appCache.settingInfo.img_editor
				&& _self.app.appCache.settingInfo.img_editor == 'Aviary') {
			_self.app.aviaryEdit.setup({
				'sourceInfo' : find_rest[0],
				imageURI : find_rest[0].filePath,
				watermark : _self.app.appCache.selWatermark,
				skipImgEdit : _self.skipEditImg
			});
			_self.app.aviaryEdit.edit(function(param, data) {
				_self.onEditFinish(param, data)
			});
		} else {
			_self.app.imageEditor = new ImageEditorPage(_self.app);
			_self.app.imageEditor.init();
			_self.app.imageEditor.setup({
				'sourceInfo' : find_rest[0],
				img64 : imgData,
				watermark : _self.app.appCache.selWatermark,
				skipImgEdit : _self.skipEditImg
			}, "N");
			
			if(_self.skipEditImg){
				_self.app.imageEditor.onWatermarkOnly();
			}
			else{
				$.mobile.changePage("#pg_img_editor");
			}			
		}
		
	} else {
		_self.isEditAll = false;
		_self.app.galleryview.onFileData(_self.selFiles);
		_self.currentDirPath = '/';
		_self.selFiles = [];
		setTimeout(function() {
			$.mobile.changePage("#pg_gallery");
		}, 500)
		
		event.preventDefault();
		return false;
	}
}

FileExplorerPage.prototype.renderSelectedFiles = function() {
	var _self = this;
	var fileItems = '';
	$.each(_self.selFiles, function(index, value) {
		var extension = value.name.substr((value.name.lastIndexOf('.') + 1));
		var findResult = jQuery.grep(_self.app.dataTypes,
				function(item, index) {
					return item == extension.toUpperCase();
				});
		var isImage = false;
		var fileData = _self.app.file64;
		var dataid = value.filePath;
		if (findResult.length > 0) {
			isImage = true;
			fileData = _self.app.image64;
			if (_self.app.appCache.imgCache[dataid]) {
				fileData = _self.app.appCache.imgCache[dataid];
			}
		}
		var line = '<li data-isimg="' + isImage + '" data-name="' + value.name
				+ '"data-id="' + dataid
				+ '" class="file-placeholder"><a href="#">'
				+ '<img class="ui-li-thumb" src="' + fileData + '" /><h2>'
				+ value.name.substr(0, (value.name.lastIndexOf('.')))
				+ '</h2></a></li>';
		fileItems = fileItems + line;
	});

	var el_selFilesList = $('#ls_sel_files', _self.context)
	el_selFilesList.html(fileItems);
	el_selFilesList.listview("refresh");
	$("#ls_sel_files .ui-icon-arrow-d").hide();
}

FileExplorerPage.prototype.onDataStorageChange = function() {
	var _self = this;
	_self.app.showDialog('Loading...');
	_self.currentDirPath = '/';
	$("#current-dir-path", _self.context).html(
			'<h3 class="ui-bar ui-bar-a">root</h3>');
	_self.explodeDirectory(_self.currentDirPath, function() {
		_self.renderContent()
	});
}

// Initialize FTP Servers
FileExplorerPage.prototype.fillDataProviders = function() {
	var _self = this;
	var reloadDataProviders = function() {
		var el_dataProvider = $('#sel_dataproviders', _self.context);
		el_dataProvider.html("");
		// root URI = "file:///storage/sdcard0";
		el_dataProvider.append(new Option("LocalStorage",
				_self.app.appFS.rootURI));
		if (_self.app.appCache.ftpServers.length > 0) {
			$.each(_self.app.appCache.ftpServers, function(key, data) {
				if (data.isFTP == 'Y') {
					el_dataProvider.append(new Option(data.name, data.url));
				}
			});
			// var option1 = $($("option", $('#sel_dataproviders')).get(1));
			// option1.attr('selected', 'selected');
			el_dataProvider.selectmenu();
			el_dataProvider.selectmenu('refresh', true);
		}

		el_dataProvider.selectmenu();
		el_dataProvider.selectmenu('refresh', true);
	}

	if (_self.app.appCache.ftpServers.length > 0) {
		reloadDataProviders();
	} else {
		var success = function(result) {
			var items = '';
			_self.app.appCache.ftpServers = [];
			for (var i = 0; i < result.ftpservers.length; i++) {
				_self.app.appCache.ftpServers.push(result.ftpservers[i]);
			}
			reloadDataProviders();
		}
		_self.app.visionApi.getFTPServerList({
			orgid : app.appCache.settingInfo.org_id
		}, function(result) {
			success(result)
		}, function(msg) {
			// _self.app.showDialog("Loading..");
			// // TODO close below dummy data runner.
			// resultline = {};
			// resultline['record-id'] = '2323';
			// resultline['url'] = 'ftp://343.343.343.34';
			// resultline['isFTP'] = 'Y';
			// resultline['name'] = 'Ftp Server';
			// resultline['password'] = 'username';
			// resultline['user'] = 'username';
			// _self.app.appCache.ftpServers.push(resultline);
			// var result = {
			// 'ftpservers' : [ resultline, resultline, resultline ],
			// 'total' : 1
			// };

			// var items = '';
			// _self.app.appCache.ftpServers = [];
			// $.each(result.ftpservers, function(index, data) {
			// _self.app.appCache.ftpServers.push(data);
			// });
			// reloadDataProviders();
			// // TODO End.
			// popup Errorbox.
			_self.app.showError("pg_file_explorer", "FTP Servers failed : "
					+ msg);
			_self.app.hideDialog();
		});
	}
}

FileExplorerPage.prototype.loadData = function() {
	var _self = this;
	_self.explodeDirectory(_self.currentDirPath, function() {
		_self.renderContent()
	});
}

FileExplorerPage.prototype.renderContent = function(dirPath) {
	var _self = this;
	var dataStorageInfo = _self.app.appCache.localStorage[0];
	var selected_dataprovider = $("#sel_dataproviders").val();
	if (!_self.isLocalStorage) {
		for (var i = 0; i < _self.app.appCache.ftpServers.length; i++) {
			var item = _self.app.appCache.ftpServers[i];
			if (item.url == selected_dataprovider) {
				dataStorageInfo = item;
				break;
			}
		}
	}

	var el_filesList = $('#ls_files', _self.context);
	var el_dirsList = $('#ls_dirs', _self.context);
	el_filesList.html('');
	el_filesList.listview("refresh");
	el_dirsList.html('');
	el_dirsList.listview("refresh");

	var serverData = dataStorageInfo.data;
	if (serverData) {
		if (serverData[_self.currentDirPath]) {

			var files = serverData[_self.currentDirPath].files;
			var dirs = serverData[_self.currentDirPath].dirs;

			var fileItems = _self.renderFiles(files);
			var dirItems = _self.renderDirs(dirs);

			el_filesList.html(fileItems);
			el_filesList.listview("refresh");
			el_dirsList.html(dirItems);
			el_dirsList.listview("refresh");

			$("#ls_files p a.ui-icon-arrow-d", _self.context).hide();
			$('#ls_files li a', _self.context).removeClass("ui-icon-carat-r");

			for (var i = 0; i < _self.selFiles.length; i++) {
				file = _self.selFiles[i];
				if (_self.isGridView) {
					$(
							'#ls_files li[data-id="' + file.filePath
									+ '"] .ui-icon-arrow-d', _self.context)
							.show();
				} else {
					$('#ls_files li[data-id="' + file.filePath + '"] a',
							_self.context).removeClass("ui-icon-arrow-d");
				}
			}

			for (var i = 0; i < files.length; i++) {
				file = files[i];
				var dataid = $("#sel_dataproviders").val()
						+ _self.currentDirPath + file
				var el_fileLi = $('#ls_files li[data-id="' + dataid + '"]',
						_self.context);

				el_fileLi.off('click');
				el_fileLi.on("click", function(event) {
					_self.onFileTap(event)
					event.preventDefault();
					return false;
				});
			}

			for (var i = 0; i < dirs.length; i++) {
				value = dirs[i];
				var el_dirLi = $('#ls_dirs li[data-id="' + _self.currentDirPath
						+ value + '"]', _self.context);

				el_dirLi.off('click');
				el_dirLi.on("click", function(event) {
					_self.onDirTap(event)
					event.preventDefault();
					return false;
				});
			}
		}
	}
	_self.app.hideDialog();
}

FileExplorerPage.prototype.onDeleteFile = function(event) {
	var _self = this;
	$("#pop_fileEplorer_actions", _self.context).popup('close');
	setTimeout(function() {
		if (_self.isGridView) {
			$('li[data-id="' + _self.selectedFile + '"] p a.ui-icon-arrow-d',
					_self.context).hide();
		} else {
			$('#ls_files li[data-id="' + _self.selectedFile + '"] a',
					_self.context).removeClass("ui-icon-arrow-d");
		}

		$('#selected-files-count', _self.context).html(_self.selFiles.length);
		_self.selFiles = jQuery.grep(_self.selFiles, function(item, index) {
			return item.filePath != _self.selectedFile;
		});
		_self.renderSelectedFiles();
	}, 1);
}

FileExplorerPage.prototype.onEditFinish = function(param, data, isLocal) {
	var _self = this;
	currentURI = param.oldURI;
	if (param.actualURI) {
		currentURI = param.actualURI;
	}
	if (isLocal == "Y") {
		currentURI = param.filePath;
	}
	_self.app.appCache.imgCache[currentURI] = data;
	$('li[data-id="' + currentURI + '"] img', "#pnl_selected_files").attr(
			'src', data);
	// if (!param.actualURI || isLocal == "Y") {
	$.each(_self.selFiles, function() {
		if (this.filePath == currentURI) {
			this.edited = true;
			console.log(this.filePath + ">>>>>>>" + this.edited);
		}
	});
	// }
	setTimeout(function() {
		if (_self.isEditAll) {
			_self.editAll();
		}
	}, 10);
}

FileExplorerPage.prototype.onEditFile = function(event) {
	var _self = this;
	if (_self.app.appCache.settingInfo.img_editor == 'Vision') {
		$.mobile.changePage("#pg_img_editor");
	} else {
		_self.app.aviaryEdit.edit(function(param, data) {
			_self.onEditFinish(param, data)
		});
	}
}

FileExplorerPage.prototype.onSelFileTap = function(event) {
	var _self = this;
	var el_selected = $(event.delegateTarget, '#pnl_selected_files');
	var selected = el_selected.data('id');
	_self.selectedFile = selected;
	var file_name = el_selected.data('name');
	var isImg = el_selected.data('isimg');
	
	if ((isImg) && (!_self.skipEditImg)) {
		$("#pop_fileEplorer_actions #btn_FEedit_file", _self.context).show();
	} else {
		$("#pop_fileEplorer_actions #btn_FEedit_file", _self.context).hide();
	}
	setTimeout(function() {
		var imgData = _self.app.appCache.imgCache[selected];
		var sourceInfo = jQuery.grep(_self.selFiles, function(item, index) {
			return item.filePath == selected;
		});
		if (sourceInfo.length > 0) {
			if (_self.app.appCache.settingInfo.img_editor
					&& _self.app.appCache.settingInfo.img_editor == 'Aviary') {
				_self.app.aviaryEdit.setup({
					'sourceInfo' : sourceInfo[0],
					imageURI : sourceInfo[0].filePath,
					watermark : _self.app.appCache.selWatermark,
					skipImgEdit : _self.skipEditImg
				});
			} else {

				_self.app.imageEditor = new ImageEditorPage(_self.app);
				_self.app.imageEditor.init();
				_self.app.imageEditor.setup({
					'sourceInfo' : sourceInfo[0],
					img64 : imgData,
					watermark : _self.app.appCache.selWatermark,
					skipImgEdit : _self.skipEditImg
				}, "N");
			}
		}
	}, 1);
}

FileExplorerPage.prototype.onFileTap = function(event) {
	var _self = this;
	var el_selectedFile = $(event.delegateTarget, _self.context);
	var selected = el_selectedFile.data('id');
	var file_name = el_selectedFile.data('name');

	var findResult = [];
	if (_self.selFiles.length > 0) {
		findResult = jQuery.grep(_self.selFiles, function(item, index) {
			return item.filePath == selected;
		});
	}

	if (!findResult.length > 0) {
		dataSrc = "FTP";
		if (_self.isLocalStorage) {
			dataSrc = "LS";
		}
		_self.selFiles.push({
			filePath : selected,
			dataSource : dataSrc,
			name : file_name,
			uploaded : 'N'
		});

		if (_self.isGridView) {
			$('#ls_files li[data-id="' + selected + '"] p a.ui-icon-arrow-d',
					_self.context).show();
		} else {
			// $('li[data-id="' + selected + '"] p a.ui-icon-arrow-d').show();
			$('#ls_files li[data-id="' + selected + '"] a', _self.context)
					.addClass("ui-icon-arrow-d");
		}
	} else {
		_self.selFiles = jQuery.grep(_self.selFiles, function(item, index) {
			return item.filePath != selected;
		});
		if (_self.isGridView) {
			$('#ls_files li[data-id="' + selected + '"] p a.ui-icon-arrow-d',
					_self.context).hide();
		} else {
			$('#ls_files li[data-id="' + selected + '"] a', _self.context)
					.removeClass("ui-icon-arrow-d");
		}
	}
	$('#selected-files-count', _self.context).html(_self.selFiles.length);
}

FileExplorerPage.prototype.onDirTap = function(event) {
	var _self = this;
	_self.currentDirPath = $(event.delegateTarget).data('id').toString();
	var tmp = _self.currentDirPath;
	_self.app.showDialog("Loading..");
	setTimeout(function() {
		if (!_self.currentDirPath.endsWith('/')) {
			_self.currentDirPath += '/';
		}
		if (tmp == '/') {
			_self.currentDirPath = '/';
		}
		setTimeout(function() {
			_self.renderDirPath();
		}, 1)
		_self.changeDir();
		_self.app.hideDialog();
	}, 1);
};

FileExplorerPage.prototype.onBackDir = function() {
	var _self = this;
	if (_self.linkRegister && _self.linkRegister.length > 1) {
		_self.linkRegister.pop();
		_self.currentDirPath = _self.linkRegister.pop();
		var tmp = _self.currentDirPath;
		_self.app.showDialog("Loading..");
		setTimeout(function() {
			if (!_self.currentDirPath.endsWith('/')) {
				_self.currentDirPath += '/';
			}
			if (tmp == '/') {
				_self.currentDirPath = '/';
			}
			setTimeout(function() {
				_self.renderDirPath();
			}, 1)
			_self.changeDir();
			_self.app.hideDialog();
		}, 1);
	}
}

FileExplorerPage.prototype.renderDirPath = function() {
	var _self = this;
	var dirPathArray = _self.currentDirPath.split('/');
	var items = '';
	var dirPath = '/';
	_self.linkRegister = [];
	for (var i = 0; i < dirPathArray.length; i++) {
		var value = dirPathArray[i];
		if (i != dirPathArray.length - 1) {
			dirPath += value + '/';
			if (value == '') {
				value = 'root ';
				dirPath = '/'
			}
			_self.linkRegister.push(dirPath);
			var line = "<a href='#' class='bc-link' data-id='" + dirPath
					+ "'> ~" + value + "</a>";
			if (i == dirPathArray.length - 2) {
				line = ' ~' + value;
			}
			items += line;
		}
	}

	$("#current-dir-path", _self.context).html(
			'<h3 class="ui-bar ui-bar-a">' + items + '</h3>');

	for (var i = 0; i < _self.linkRegister.length; i++) {
		var value = _self.linkRegister[i];
		var el_dirLink = $(
				"#current-dir-path a[data-id='" + value
						+ "']", _self.context)
		el_dirLink.off('click');
		el_dirLink.on("click", function(event) {
			_self.onDirTap(event);
			event.preventDefault();
			return false;
		});
	}
};

FileExplorerPage.prototype.changeDir = function() {
	var _self = this;
	_self.explodeDirectory(_self.currentDirPath, function() {
		_self.renderContent(_self.currentDirPath);
	});
};

FileExplorerPage.prototype.renderDirs = function(dirs) {
	var _self = this;
	var dirItems = '';
	var imgClass = '';
	if (!_self.isGridView) {
		imgClass = "ui-listview-mode";
	}

	$.each(dirs, function(index, value) {
		var fileData = _self.app.dir64;
		var storage = _self.isLocalStorage ? "LS" : "FTP";
		var line = '<li data-storage="' + storage + '" data-id="'
				+ _self.currentDirPath + value
				+ '" class="dir-placeholder"><a href="#">'
				+ '<img class="ui-li-thumb ' + imgClass + '" src="' + fileData
				+ '" /><h2>' + value + '</h2></a></li>';
		dirItems = dirItems + line;
	});

	return dirItems;
}

FileExplorerPage.prototype.loadActualImage = function(dataid, isLocalStrg) {
	var _self = this;
	if (!_self.app.appCache.imgCache[dataid]) {
		var storage = _self.isLocalStorage ? 'LS' : 'FTP';

		// console.log('Get image from ' + storage + ' >> ' + dataid);
		// // TODO remove below dummy data runner in production.
		// // Start of dummy data filler.
		// var img = _self.app.image64;
		// _self.app.appCache.imgCache[dataid] = img;
		// $('li[data-id="' + dataid + '"] img').attr('src', img);

		// End of dummy data filler.

		if (isLocalStrg) {
			// TODO get data from local storage;
			_self.app.appFS.getFile(dataid, function(result) {
				var img64 = result.data
				_self.app.appCache.imgCache[dataid] = img64;
				$('li[data-id="' + dataid + '"] img').attr('src', img64);
			}, function(msg) {
				_self.app.showError("pg_file_explorer",
						"Error:Failed to load file from Storage." + msg);
			});
		} else {

			// TODO get data from FTP storage; Open below code in production.
			_self.app.ftpClient.get("", dataid, {}, function(result) {
				var img64 = "data:image/jpeg;base64," + result[0].base64;
				_self.app.appCache.imgCache[dataid] = img64;
				$('li[data-id="' + dataid + '"] img').attr('src', img64);
			}, function(msg) {
				_self.app.showError("pg_file_explorer",
						"Error: Failed to load file from FTP." + msg);
			});
		}
	}

}

FileExplorerPage.prototype.renderFiles = function(files) {
	var _self = this;
	var fileItems = '';
	for (var i = 0; i < files.length; i++) {
		var index = i;
		var value = files[i];
		var extension = value.substr((value.lastIndexOf('.') + 1));

		var findResult = jQuery.grep(_self.app.dataTypes,
				function(item, index) {
					return item == extension.toUpperCase();
				});

		var fileData = _self.app.file64;
		var isImage = false;
		if (findResult.length > 0) {
			isImage = true;
			fileData = _self.app.image64
		}
		var dataid = $("#sel_dataproviders", _self.context).val()
				+ _self.currentDirPath + value;

		// TODO: Get Images from FTP;
		if (isImage) {
			if (_self.app.appCache.imgCache[dataid]) {
				fileData = _self.app.appCache.imgCache[dataid];
			} else {
				_self.loadActualImage(dataid, _self.isLocalStorage);
			}
		}
		var storage = _self.isLocalStorage ? "LS" : "FTP";
		var imgClass = '';
		if (!_self.isGridView) {
			imgClass = "ui-listview-mode";
		}

		var line = '<li data-storage="'
				+ storage
				+ '"  data-name="'
				+ value
				+ '"data-id="'
				+ dataid
				+ '" class="file-placeholder"><a href="#">'
				+ '<img class="ui-li-thumb '
				+ imgClass
				+ '" src="'
				+ fileData
				+ '" /><h2>'
				+ value.substr(0, (value.lastIndexOf('.')))
				+ '</h2><p class="ui-li-aside"><a class="ui-btn ui-shadow ui-corner-all ui-icon-arrow-d ui-btn-icon-notext ui-btn-b ui-btn-inline"></a></p></a></li>';
		fileItems = fileItems + line;

	}
	return fileItems;
}

FileExplorerPage.prototype.explodeDirectory = function(dirName, callback) {
	var _self = this;
	var dataStorageInfo = _self.app.appCache.localStorage[0];
	var dataProviderUrl = '';
	var selected_dataprovider = $("#sel_dataproviders", _self.context).val();
	if (!_self.isLocalStorage) {
		for (var i = 0; i < _self.app.appCache.ftpServers.length; i++) {
			var item = _self.app.appCache.ftpServers[i];
			if (item.url == selected_dataprovider) {
				dataStorageInfo = item;
				break;
			}
		}
		dataProviderUrl = dataStorageInfo.url;
	} else {
		dataProviderUrl = selected_dataprovider;
	}
	var ftpUrl = dataProviderUrl + dirName;
	var successCB = function(results) {
		var selIndex = 0
		var files = results[0]["fileNames"];
		var dirs = results[0]["directory"];
		// / dataStorageInfo.data[] = {};
		var resultline = {};
		resultline['files'] = files;
		resultline['dirs'] = dirs;
		if (!dataStorageInfo.data) {
			dataStorageInfo.data = {};
		}
		dataStorageInfo.data[_self.currentDirPath] = resultline;
		if (!_self.isLocalStorage) {
			_self.app.appCache.ftpServers[selIndex] = dataStorageInfo;
		} else {
			_self.app.appCache.localStorage[0] = dataStorageInfo;
		}
		callback();
	}

	// TODO - open below actual data filler.
	if (!_self.isLocalStorage) {
		_self.app.showDialog('Loading...');
		_self.app.ftpClient.filelist(ftpUrl, {}, function(results) {
			successCB(results)
		}, function(msg) {
			callback();
			_self.app.showError("pg_file_explorer",
					"Error:Failed to load data from FTP server.Path:(" + ftpUrl
							+ ")." + msg);

		});
	} else {
		_self.app.appFS.filelist(ftpUrl, function(results) {
			successCB(results)
		}, function() {
			_self.app.showError("pg_file_explorer",
					"Error:Failed to load data from Local Storage.Path:("
							+ ftpUrl + ")." + msg);
			callback();
		});
	}

	// TODO - Remove below dummy data filler.
	// var randomNum = Math.floor(Math.random() * 31);
	// var extensionList = [ "jpg", "pdf", "png", "txt" ];
	// var tempFiles = [], tempDir = [];
	// for (var i = 0; i < randomNum; i++) {
	// tempFiles.push('file'
	// + i
	// + '.'
	// + extensionList[Math.floor(Math.random()
	// * (extensionList.length))]);
	// }
	// randomNum = Math.floor(Math.random() * 31);
	// var dirList = [ "subfolder", "textf" ];
	// for (var i = 0; i < randomNum; i++) {
	// tempDir.push(dirList[Math.floor(Math.random() * (dirList.length))]
	// + "_" + i);
	// }
	// successCB([ {
	// fileNames : tempFiles,
	// directory : tempDir
	// } ]);
	// TODO - End
}
