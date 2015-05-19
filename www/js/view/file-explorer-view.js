var FileExplorerPage = function(app) {
	this.app = app;
	this.currentDirPath = '/';
	this.isLocalStorage = true;
	this.isGridView = true;
	this.selFiles = [];
}

FileExplorerPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$("#current-dir-path").html('<h3 class="ui-bar ui-bar-c">root</h3>');
	$('#pg_file_explorer #btn_user').html(
			_self.app.appCache.settingInfo.username);
};

FileExplorerPage.prototype.init = function() {
	var _self = this;
	_self.visionApi = new VisionApi(_self.app);
	_self.isLocalStorage = true;
	_self.fillDataProviders();
	$(document).on("pagebeforeshow", "#pg_file_explorer", function() {
		$.mobile.loading('show');
		_self.currentDirPath = '/';
		_self.selFiles = [];
		_self.rederBreadCrumb();
		_self.loadData();
	});

	$("#btn_finish_file_selection").on('click', function() {
		// TODO: Push Selected File information to Gallery
		// Page.
		_self.app.galleryview.onFileData(_self.selFiles);
		$.mobile.changePage("#pg_gallery");
	});

	$("#btn_reload_files").on(
			"tap",
			function(event) {
				_self.currentDirPath = '/';
				// _self.selFiles = [];
				_self.explodeDirectory(_self.currentDirPath, function() {
					_self.renderContent()
				}, function(msg) {
					_self.app.showError("pg_file_explorer",
							"Error in loading server data");
				});
			});

	$("#sel_dataproviders").on("change", function(event) {
		if ($("#sel_dataproviders").val() == 'LS') {
			_self.isLocalStorage = true;
		} else {
			_self.isLocalStorage = false;
		}
		_self.onDataStorageChange(event);
	});

	// $("#selected-files-count").off();
	$('#selected-files-count').on("tap", function(event) {
		_self.renderSelectedFiles(event);
	});

	$("#btn_file_view_mode").on(
			'click',
			function() {
				$(this).removeClass("ui-btn-active");
				if ($(this).attr('class').indexOf('ui-icon-bars') >= 0) {

					$(this).removeClass('ui-icon-bars');
					$(this).html('Grid View');
					$(this).addClass('ui-icon-grid');
					$('#pg_file_explorer #pg_file_main').removeClass(
							'img-gallery');
					$('#pg_file_explorer #pg_file_main img').addClass(
							'ui-listview-mode');

					$('#pg_file_explorer #pg_file_main .current_dir_location')
							.addClass('current_dir_location_list');

					_self.isGridView = false;
					$('#ls_files li a').removeClass("ui-icon-carat-r");
					$("#ls_files p a.ui-icon-arrow-d").hide();
					$.each(_self.selFiles, function(index, file) {
						$('#ls_files li[data-id="' + file.filePath + '"] a')
								.addClass("ui-icon-arrow-d");
					});
					$("#ls_files  .ui-listview .ui-li-has-thumb h2").css(
							"color", "#FFF");
				} else {
					$(this).removeClass('ui-icon-grid');
					$(this).html('List View');
					$(this).addClass('ui-icon-bars');
					_self.isGridView = true;
					$('#pg_file_explorer #pg_file_main')
							.addClass('img-gallery');
					$('#pg_file_explorer #pg_file_main img').removeClass(
							'ui-listview-mode');
					$("#ls_files p a.ui-icon-arrow-d").hide();

					$.each(_self.selFiles, function(index, file) {
						$(
								'#ls_files li[data-id="' + file.filePath
										+ '"] p a.ui-icon-arrow-d').show();
					});
					$("#ls_files  .ui-listview .ui-li-has-thumb h2").css(
							"color", "#202C3C");
				}
			});
}

FileExplorerPage.prototype.renderSelectedFiles = function() {
	var _self = this;
	var fileItems = '';
	$
			.each(
					_self.selFiles,
					function(index, value) {
						var extension = value.name.substr((value.name
								.lastIndexOf('.') + 1));
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
						var line = '<li data-isimg="'
								+ isImage
								+ '" data-name="'
								+ value.name
								+ '"data-id="'
								+ dataid
								+ '" class="file-placeholder"><a data-rel="popup" href="#pop_fileEplorer_actions">'
								+ '<img class="ui-li-thumb" src="'
								+ fileData
								+ '" /><h2>'
								+ value.name.substr(0, (value.name
										.lastIndexOf('.'))) + '</h2></a></li>';
						fileItems = fileItems + line;
					});

	$('#ls_sel_files').html(fileItems);
	$('#ls_sel_files').listview("refresh");
	$("#ls_sel_files .ui-icon-arrow-d").hide();
	$("#ls_sel_files .file-placeholder").off('tap', '#ls_sel_files .file-placeholder').on("tap", function(event) {
		_self.onSelFileTap(event);
	});

	$('#btn_FEdelete_file').off('tap', '#btn_FEdelete_file').on('click', function(event) {
		_self.onDeleteFile(event);

	});

	$('#btn_FEedit_file').off('tap', '#btn_FEedit_file').on('click', function(event) {
		_self.onEditFile(event);
	});

	$("#pnl_selected_files").panel("open");
}

FileExplorerPage.prototype.onDataStorageChange = function() {
	var _self = this;
	$.mobile.loading('show');
	_self.currentDirPath = '/';
	$("#current-dir-path").html('<h3 class="ui-bar ui-bar-c">root</h3>');
	// _self.selFiles = [];
	_self.explodeDirectory(_self.currentDirPath, function() {
		_self.renderContent()
	}, function(msg) {
		_self.app.showError("pg_file_explorer",
				"Error in loading ftp server data.");
	});
}

// Initialize FTP Servers
FileExplorerPage.prototype.fillDataProviders = function() {
	var _self = this;
	var reloadDataProviders = function() {
		$('#sel_dataproviders').html("");
		// root URI = "file:///storage/sdcard0";
		$("#sel_dataproviders").append(
				new Option("LocalStorage", _self.app.appFS.rootURI));
		if (_self.app.appCache.ftpServers.length > 0) {
			$.each(_self.app.appCache.ftpServers, function(key, data) {
				if (data.isFTP == 'Y') {
					$("#sel_dataproviders").append(
							new Option(data.name, data.url));
				}
			});
			// var option1 = $($("option", $('#sel_dataproviders')).get(1));
			// option1.attr('selected', 'selected');
			$('#sel_dataproviders').selectmenu();
			$('#sel_dataproviders').selectmenu('refresh', true);
		}
	}
	if (_self.app.appCache.ftpServers.length > 0) {
		reloadDataProviders();
	} else {
		var success = function(result) {
			var items = '';
			_self.app.appCache.ftpServers = [];
			$.each(result.ftpservers, function(index, data) {
				_self.app.appCache.ftpServers.push(data);
			});
			reloadDataProviders();
		}
		_self.visionApi.getFTPServerList({
			orgid : app.appCache.settingInfo.org_id
		}, success, function(msg) {
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
			//
			// var items = '';
			// _self.app.appCache.ftpServers = [];
			// $.each(result.ftpservers, function(index, data) {
			// _self.app.appCache.ftpServers.push(data);
			// });
			// reloadDataProviders();
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
	}, function(msg) {
		_self.app.showError(msg);
	});
	_self.app.hideDialog();
}

FileExplorerPage.prototype.renderContent = function(dirPath) {
	var _self = this;

	var dataStorageInfo = _self.app.appCache.localStorage[0];
	var selected_dataprovider = $("#sel_dataproviders").val();
	if (!_self.isLocalStorage) {
		jQuery.grep(_self.app.appCache.ftpServers, function(item, index) {
			if (item.url == selected_dataprovider) {
				dataStorageInfo = item;
			}
			return (item.url == selected_dataprovider);
		});
	}

	var serverData = dataStorageInfo.data;
	if (serverData) {
		if (serverData[_self.currentDirPath]) {
			var files = serverData[_self.currentDirPath].files;
			var dirs = serverData[_self.currentDirPath].dirs;
			var fileItems = _self.renderFiles(files);
			var dirItems = _self.renderDirs(dirs);

			$('#ls_files').html(fileItems);
			$('#ls_files').listview("refresh");
			$('#ls_dirs').html(dirItems);
			$('#ls_dirs').listview("refresh");
			$("#ls_files p a.ui-icon-arrow-d").hide();
			$('#ls_files li a').removeClass("ui-icon-carat-r");

			$.each(_self.selFiles, function(index, file) {
				if (_self.isGridView) {
					$('li[data-id="' + file.filePath + '"] .ui-icon-arrow-d')
							.show();
				} else {
					$('#ls_files li[data-id="' + file.filePath + '"] a')
							.removeClass("ui-icon-arrow-d");
				}

			});

			$("#ls_dirs .dir-placeholder").off('tap', '#ls_dirs .dir-placeholder').on("tap", function(event) {
				_self.onDirTap(event)
			});

			$("#ls_files .file-placeholder").off('tap', '#ls_files .file-placeholder').on("tap", function(event) {
				_self.onFileTap(event)
			});
		}
	}
	// _self.app.hideDialog();
	$.mobile.loading('hide');
}

FileExplorerPage.prototype.onDeleteFile = function(event) {
	var _self = this;
	event.preventDefault();
	_self.selFiles = jQuery.grep(_self.selFiles, function(item, index) {
		return item.filePath != _self.selectedFile;
	});
	if (_self.isGridView) {
		$('li[data-id="' + _self.selectedFile + '"] p a.ui-icon-arrow-d')
				.hide();
	} else {
		$('#ls_files li[data-id="' + _self.selectedFile + '"] a').removeClass(
				"ui-icon-arrow-d");
	}
	$('#selected-files-count').html(_self.selFiles.length);
	$("#pop_fileEplorer_actions").popup('close');
}

FileExplorerPage.prototype.onEditFinish = function(param, data) {
	var _self = this;
	currentURI = param.oldURI;
	if (param.actualURI) {
		currentURI = param.actualURI;
	}
	_self.app.appCache.imgCache[currentURI] = data;
	$('li[data-id="' + currentURI + '"] img').attr('src', data);
	if (!param.actualURI) {
		$.each(_self.selFiles, function() {
			if (this.filePath == currentURI) {
				this.edited = true;
			}
		});
	}
}

FileExplorerPage.prototype.onEditFile = function(event) {
	var _self = this;
	if (_self.app.appCache.settingInfo.editApp == 'Vision') {
		event.preventDefault();
		$.mobile.changePage("#pg_img_editor");
	} else {
		_self.app.aviaryEdit.edit(function(param, data) {
			_self.onEditFinish(param, data)
		});
	}
}

FileExplorerPage.prototype.onSelFileTap = function(event) {
	var _self = this;
	var selected = $(event.delegateTarget).data('id');
	var file_name = $(event.delegateTarget).data('name');

	_self.selectedFile = selected;

	if ($(event.delegateTarget).data('isimg')) {
		$("#btn_FEedit_file").show();
	} else {
		$("#btn_FEedit_file").hide();
	}

	var imgData = _self.app.appCache.imgCache[selected];
	var sourceInfo = jQuery.grep(_self.selFiles, function(item, index) {
		return item.filePath == selected;
	});
	if (sourceInfo.length > 0) {
		if (_self.app.appCache.settingInfo.editApp == 'Vision') {
			_self.app.imageEditor.setup({
				'sourceInfo' : sourceInfo[0],
				width : $("#pg_gallery .ui-panel-wrapper").width(),
				height : $("#pg_gallery .ui-panel-wrapper").height(),
				img64 : imgData,
				watermark : $('select[name="select-gallery-waterMark"]').val()
			}, function(param, data) {
				_self.onEditFinish(param, data);
			});
		} else {
			_self.app.aviaryEdit.setup({
				'sourceInfo' : sourceInfo[0],
				imageURI : sourceInfo[0].filePath,
				watermark : $('select[name="select-gallery-waterMark"]').val()
			});
		}
	}
}

FileExplorerPage.prototype.onFileTap = function(event) {
	var _self = this;
	var selected = $(event.delegateTarget).data('id');
	var file_name = $(event.delegateTarget).data('name');
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
			$('li[data-id="' + selected + '"] p a.ui-icon-arrow-d').show();
		} else {
			// $('li[data-id="' + selected + '"] p a.ui-icon-arrow-d').show();
			$('#ls_files li[data-id="' + selected + '"] a').addClass(
					"ui-icon-arrow-d");
		}
	} else {
		_self.selFiles = jQuery.grep(_self.selFiles, function(item, index) {
			return item.filePath != selected;
		});
		if (_self.isGridView) {
			$('li[data-id="' + selected + '"] p a.ui-icon-arrow-d').hide();
		} else {
			$('#ls_files li[data-id="' + selected + '"] a').removeClass(
					"ui-icon-arrow-d");
		}
	}
	$('#selected-files-count').html(_self.selFiles.length);
}

FileExplorerPage.prototype.onDirTap = function(event) {
	var _self = this;
	_self.currentDirPath = $(event.delegateTarget).data('id').toString();
	var tmp = _self.currentDirPath;
	if (!_self.currentDirPath.endsWith('/')) {
		_self.currentDirPath += '/';
	}
	if ($(event.delegateTarget).data('id') == '/') {
		_self.currentDirPath = '/';
	}
	_self.renderDirPath();
	_self.changeDir();
};

FileExplorerPage.prototype.renderDirPath = function() {
	var _self = this;
	var dirPathArray = _self.currentDirPath.split('/');
	var items = '';
	var dirPath = '/';
	$.each(dirPathArray, function(index, value) {
		if (index != dirPathArray.length - 1) {
			dirPath += value + '/';
			if (value == '') {
				value = 'root ';
				dirPath = '/'
			}
			var line = "<a href='#' class='bc-link' data-id='" + dirPath + "'>"
					+ value + " /</a>";
			if (index == dirPathArray.length - 2) {
				line = value;
			}
			items += line;
		}
	});

	$("#current-dir-path").html(
			'<h3 class="ui-bar ui-bar-c">' + items + '</h3>');

	$(".bc-link").off('tap', '.bc-link').on("tap", function(event) {
		_self.onDirTap(event);
	});
};

FileExplorerPage.prototype.changeDir = function() {
	var _self = this;

	_self.explodeDirectory(_self.currentDirPath, function() {
		_self.renderContent(_self.currentDirPath);
	}, function(msg) {
		_self.app.showError("pg_file_explorer", msg);
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

		// setInterval(function() {
		// _self.app.appCache.imgCache[dataid] = img;
		// $('li[data-id="' + dataid + '"] img').attr('src', img);
		// }, 1000);

		// End of dummy data filler.

		if (isLocalStrg) {
			// TODO get data from local storage;
			_self.app.appFS.getFile(dataid, function(result) {
				var img64 = result.data
				_self.app.appCache.imgCache[dataid] = img64;
				$('li[data-id="' + dataid + '"] img').attr('src', img64);
			}, function(msg) {
				_self.app.showError("pg_file_explorer", msg);
			});
		} else {

			// TODO get data from FTP storage; Open below code in production.
			_self.app.ftpClient.get("", dataid, {}, function(result) {
				var img64 = "data:image/jpeg;base64," + result[0].base64;
				_self.app.appCache.imgCache[dataid] = img64;
				$('li[data-id="' + dataid + '"] img').attr('src', img64);
			}, function(msg) {
				_self.app.showError("pg_file_explorer", msg);
			});
		}
	}

}

FileExplorerPage.prototype.renderFiles = function(files) {
	var _self = this;
	var fileItems = '';
	$
			.each(
					files,
					function(index, value) {
						var extension = value
								.substr((value.lastIndexOf('.') + 1));
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
						var dataid = $("#sel_dataproviders").val()
								+ _self.currentDirPath + value;

						// TODO: Get Images from FTP;
						if (isImage) {
							if (_self.app.appCache.imgCache[dataid]) {
								fileData = _self.app.appCache.imgCache[dataid];
							} else {
								_self.loadActualImage(dataid,
										_self.isLocalStorage);
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
					});

	return fileItems;
}

FileExplorerPage.prototype.explodeDirectory = function(dirName, callback, error) {
	var _self = this;
	var dataStorageInfo = _self.app.appCache.localStorage[0];
	var dataProviderUrl = '';
	var selected_dataprovider = $("#sel_dataproviders").val();
	if (!_self.isLocalStorage) {
		jQuery.grep(_self.app.appCache.ftpServers, function(item, index) {
			if (item.url == selected_dataprovider) {
				dataStorageInfo = item;
			}
			return (item.url == selected_dataprovider);
		});
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

	// console.log(ftpUrl);

	if (!dataStorageInfo.data || !dataStorageInfo.data[_self.currentDirPath]) {
		// TODO - open below actual data filler.
		if (!_self.isLocalStorage) {
			_self.app.ftpClient.filelist(ftpUrl, {}, function(results) {
				successCB(results)
			}, function() {
				_self.app.showError("pg_file_explorer",
						"Something wrong with server");
			});
		} else {
			_self.app.appFS.filelist(ftpUrl, function(results) {
				successCB(results)
			}, error);
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
	} else {
		callback();
	}
}
