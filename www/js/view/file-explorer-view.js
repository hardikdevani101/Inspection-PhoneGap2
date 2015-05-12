var FileExplorerPage = function(app) {
	this.app = app;
	this.currentDirPath = '/';
	this.isLocalStorage = true;
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
	$(document).on("pagebeforeshow", "#pg_file_explorer", function() {
		this.currentDirPath = '/';
		this.isLocalStorage = true;
		this.selFiles = [];
		_self.rederBreadCrumb();
		_self.visionApi = new VisionApi(_self.app);
		_self.rederBreadCrumb();
		_self.fillDataProviders();
		_self.loadData();

		// $('#btn_reload_files').on("click", function() {
		// _self.app.appCache.ftpServers = {};
		// _self.loadData();
		// });

		$("#btn_finish_file_selection").on('click', function() {
			// TODO: Push Selected File information to Gallery
			// Page.
			_self.app.galleryview.onFileData(_self.selFiles);
			$.mobile.changePage("#pg_gallery");
		});

		$("#btn_reload_files").on("tap", function(event) {
			_self.currentDirPath = '/';
			// _self.selFiles = [];
			_self.explodeDirectory(_self.currentDirPath, function() {
				_self.renderContent()
			}, function(msg) {
				console.log("Error in loading server data.")
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
						var fileData = _self.app.file64;
						var dataid = value.filePath;
						if (findResult.length > 0) {
							fileData = _self.app.image64;
							if (_self.app.appCache.imgCache[dataid]) {
								fileData = _self.app.appCache.imgCache[dataid];
							}
						}
						var line = '<li data-name="'
								+ value.name
								+ '"data-id="'
								+ dataid
								+ '" class="file-placeholder"><a href="#">'
								+ '<img class="ui-li-thumb" src="'
								+ fileData
								+ '" /><h2>'
								+ value.name.substr(0, (value.name
										.lastIndexOf('.')))
								+ '</h2><p class="ui-li-aside"><a class="ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext ui-btn-b ui-btn-inline"></a></p></a></li>';
						fileItems = fileItems + line;
					});

	$('#ls_sel_files').html(fileItems);
	$('#ls_sel_files').listview("refresh");
	$("#ls_sel_files .ui-icon-arrow-d").hide();
	$("#ls_sel_files .file-placeholder").on("tap", function(event) {
		_self.onFileTap(event);
		_self.renderSelectedFiles();
	});

	$("#pnl_selected_files").panel("open");
}

FileExplorerPage.prototype.onDataStorageChange = function() {
	var _self = this;
	_self.currentDirPath = '/';
	$("#current-dir-path").html('<h3 class="ui-bar ui-bar-c">root</h3>');
	// _self.selFiles = [];
	_self.explodeDirectory(_self.currentDirPath, function() {
		_self.renderContent()
	}, function(msg) {
		console.log("Error in loading ftp server data.")
	});
}

// Initialize FTP Servers
FileExplorerPage.prototype.fillDataProviders = function() {
	var _self = this;
	var reloadDataProviders = function() {
		$('#sel_dataproviders').html("");
		$("#sel_dataproviders").append(
				new Option("LocalStorage", "file:///storage/sdcard0"));
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
			_self.app.showDialog("Loading..");
			_self.app.hideDialog();
		});
	}
}

FileExplorerPage.prototype.loadData = function() {
	var _self = this;
	_self.explodeDirectory(_self.currentDirPath, function() {
		_self.renderContent()
	}, function(msg) {
		console.log("Error in loading ftp server data.")
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

			$("#ls_files .ui-icon-arrow-d").hide();

			$.each(_self.selFiles, function(index, file) {
				$('li[data-id="' + file.filePath + '"] .ui-icon-arrow-d')
						.show();
			});

			$("#ls_dirs .dir-placeholder").bind("tap", function(event) {
				_self.onDirTap(event)
			});

			$("#ls_files .file-placeholder").bind("tap", function(event) {
				_self.onFileTap(event)
			});
		}
	}
	_self.app.hideDialog();
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
		$('li[data-id="' + selected + '"] .ui-icon-arrow-d').show();
	} else {
		_self.selFiles = jQuery.grep(_self.selFiles, function(item, index) {
			return item.filePath != selected;
		});
		$('li[data-id="' + selected + '"] .ui-icon-arrow-d').hide();
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

	$(".bc-link").on("tap", function(event) {
		_self.onDirTap(event);
	});
};

FileExplorerPage.prototype.changeDir = function() {
	var _self = this;
	_self.explodeDirectory(_self.currentDirPath, function() {
		_self.renderContent(_self.currentDirPath);
	}, function(msg) {
		console.log(msg);
	});
};

FileExplorerPage.prototype.renderDirs = function(dirs) {
	var _self = this;
	var dirItems = '';
	$.each(dirs, function(index, value) {
		var fileData = _self.app.dir64;
		var storage = _self.isLocalStorage ? "LS" : "FTP";
		var line = '<li data-storage="' + storage + '" data-id="'
				+ _self.currentDirPath + value
				+ '" class="dir-placeholder"><a href="#">'
				+ '<img class="ui-li-thumb" src="' + fileData + '" /><h2>'
				+ value + '</h2></a></li>';
		dirItems = dirItems + line;
	});
	return dirItems;
}

FileExplorerPage.prototype.loadActualImage = function(dataid, isLocalStrg) {
	var _self = this;
	if (!_self.app.appCache.imgCache[dataid]) {
		var storage = _self.isLocalStorage ? 'LS' : 'FTP';

		if (isLocalStrg) {
			// TODO get data from local storage;
			_self.app.appFS.getFile(dataid, function(result) {
				var img64 = result.data
				_self.app.appCache.imgCache[dataid] = img64;
				$('li[data-id="' + dataid + '"] img').attr('src', img64);
			}, function(msg) {
				console.log('Error Getting File >>> ' + dataid);
			});
		} else {

			_self.app.ftpClient.get("", dataid, {}, function(result) {
				var img64 = "data:image/jpeg;base64," + result[0].base64;
				_self.app.appCache.imgCache[dataid] = img64;
				$('li[data-id="' + dataid + '"] img').attr('src', img64);
			}, function(msg) {
				console.log('Error Getting File >>> ' + dataid);
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
						var line = '<li data-storage="'
								+ storage
								+ '"  data-name="'
								+ value
								+ '"data-id="'
								+ dataid
								+ '" class="file-placeholder"><a href="#">'
								+ '<img class="ui-li-thumb" src="'
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

	if (!dataStorageInfo.data || !dataStorageInfo.data[_self.currentDirPath]) {
		// TODO - open below actual data filler.
		if (!_self.isLocalStorage) {
			_self.app.ftpClient.filelist(ftpUrl, {}, function(results) {
				successCB(results)
			}, function() {
				console.log('Something wrong with server');
			});
		} else {
			_self.app.appFS.filelist(ftpUrl, function(results) {
				successCB(results)
			}, error);
		}

	} else {
		callback();
	}
}
