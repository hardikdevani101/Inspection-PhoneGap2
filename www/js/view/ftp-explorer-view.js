var FTPPage = function(app) {
	this.app = app;
	this.currentDirPath = '/';
	this.isLocalStorage = false;
	this.selFiles = [];
}

FTPPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#pg_ftp_explorer #btn_user').html(
			$(_self.app.appCache.loginInfo.username).val());
};

FTPPage.prototype.init = function() {
	var _self = this;
	$(document).on("pagebeforeshow", "#pg_ftp_explorer", function() {
		_self.rederBreadCrumb();
		// Initialize serverlist Drop down
		_self.visionApi = new VisionApi(_self.app);
		_self.rederBreadCrumb();
		_self.loadFTPServers();

		$("#current-dir-path").html('<h3 class="ui-bar ui-bar-c">root</h3>');

		$('#btn_refresh_ftpServers').on("click", function() {
			_self.app.appCache.ftpServers = {};
			_self.loadFTPServers();
		});

		$("#btn-finish-ftp-file-selection").on('click', function() {
			// TODO: Push Selected File information to Gallery
			// Page.
			_self.app.galleryview.pushFileData(selFiles);
			
			$.mobile.changePage("#pg_gallery");
		});

		$("#btn-reload-ftp-files").on("tap", function() {
			_self.currentDirPath = '/';
			// _self.selFiles = [];
			_self.explodeServerDir(_self.currentDirPath, function() {
				_self.renderContent()
			}, function(msg) {
				console.log("Error in loading ftp server data.")
			});
		});

		$("#sel_ftpservers").on("change", function() {
			_self.onFTPServerChange();
		});

		$('#selected-files-count').on("tap", function(event) {
			_self.renderSelectedFiles();
		});
	});
}

FTPPage.prototype.renderSelectedFiles = function() {
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
						if (findResult.length > 0) {
							fileData = _self.app.image64
						}
						var dataid = value.id;
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

	$('#ls_sel_ftpFiles').html(fileItems);
	$('#ls_sel_ftpFiles').listview("refresh");
	$("#ls_sel_ftpFiles .ui-icon-arrow-d").hide();
	$("#ls_sel_ftpFiles .file-placeholder").on("tap", function(event) {
		_self.onFileTap(event);
		_self.renderSelectedFiles();
	});

	$("#pnl_selected_ftp_files").panel("open");
}

FTPPage.prototype.onFTPServerChange = function() {
	var _self = this;
	_self.currentDirPath = '/';
	$("#current-dir-path").html('<h3 class="ui-bar ui-bar-c">root</h3>');
	// _self.selFiles = [];
	_self.explodeServerDir(_self.currentDirPath, function() {
		_self.renderContent()
	}, function(msg) {
		console.log("Error in loading ftp server data.")
	});
}

FTPPage.prototype.fillFTPServerList = function() {
	var _self = this;
	$("#sel_ftpservers").html('');
	$("#sel_ftpservers").append(new Option("Local Storage", "LS"));
	if (_self.app.appCache.ftpServers.length > 0) {
		$.each(_self.app.appCache.ftpServers, function(key, data) {
			if (data.isFTP == 'Y') {
				$("#sel_ftpservers").append(new Option(data.name, data.url));
			}
		});
		var option1 = $($("option", $('#sel_ftpservers')).get(1));
		option1.attr('selected', 'selected');
		$('#sel_ftpservers').selectmenu();
		$('#sel_ftpservers').selectmenu('refresh', true);
		_self.isLocalStorage = true;
	}
}

FTPPage.prototype.loadFTPServers = function() {
	var _self = this;

	if (_self.app.appCache.ftpServers.length > 0) {
		_self.fillFTPServerList();
		_self.explodeServerDir(_self.currentDirPath, function() {
			_self.renderContent()
		}, function(msg) {
			console.log("Error in loading ftp server data.")
		});
	} else {
		var success = function(result) {
			var items = '';
			_self.app.appCache.ftpServers = [];
			$.each(result.ftpservers, function(index, data) {
				_self.app.appCache.ftpServers.push(data);
			});
			_self.fillFTPServerList();
			// Initialize selected FTP Server DirTree
			_self.explodeServerDir(_self.currentDirPath, function() {
				_self.renderContent()
			}, function(msg) {
				console.log("Error in loading ftp server data.")
			});
		};

		_self.visionApi.getFTPServerList({
			orgid : app.appCache.settingInfo.org_id
		}, success, function(msg) {
			_self.app.showDialog("Loading..");
//			resultline = {};
//			resultline['record-id'] = '2323';
//			resultline['url'] = 'ftp://343.343.343.34';
//			resultline['isFTP'] = 'Y';
//			resultline['name'] = 'Ftp Server';
//			resultline['password'] = 'username';
//			resultline['user'] = 'username';
//			_self.app.appCache.ftpServers.push(resultline);
//			success({
//				'ftpservers' : [ resultline, resultline, resultline ],
//				'total' : 1
//			});
			// popup Errorbox.
			console.log("Load FTP Servers failed" + msg);
			_self.app.hideDialog();
		});
	}
	_self.app.hideDialog();
}

FTPPage.prototype.renderContent = function(dirPath) {
	var _self = this;

	var selected_ftpserver = $("#sel_ftpservers").val();
	var ftpServerInfo = '';
	jQuery.grep(_self.app.appCache.ftpServers, function(item, index) {
		if (item.url == selected_ftpserver) {
			ftpServerInfo = item;
		}
		return (item.url == selected_ftpserver);
	});

	var serverData = ftpServerInfo.data;
	console.log(serverData);
	if (serverData) {
		if (serverData[_self.currentDirPath]) {
			var files = serverData[_self.currentDirPath].files;
			var dirs = serverData[_self.currentDirPath].dirs;
			var fileItems = _self.renderFiles(files);
			var dirItems = _self.renderDirs(dirs);

			$('#ls_ftpFiles').html(fileItems);
			$('#ls_ftpFiles').listview("refresh");
			$('#ls_ftpDirs').html(dirItems);
			$('#ls_ftpDirs').listview("refresh");

			$.each(_self.selFiles, function(index, file) {
				$('li[data-id="' + file.id + '"] .ui-icon-arrow-d').show();
			});

			$(".ui-icon-arrow-d").hide();

			$(".dir-placeholder").bind("tap", function(event) {
				_self.onDirTap(event)
			});

			$(".file-placeholder").bind("tap", function(event) {
				_self.onFileTap(event)
			});
		}
	}
	_self.app.hideDialog();
}

FTPPage.prototype.onFileTap = function(event) {
	var _self = this;
	var selected = $(event.delegateTarget).data('id');
	var file_name = $(event.delegateTarget).data('name');
	console.log('Tap >> ' + selected);
	var findResult = [];
	if (_self.selFiles.length > 0) {
		var findResult = jQuery.grep(_self.selFiles, function(item, index) {
			return item.id == selected;
		});

	}
	if (!findResult.length > 0) {
		dataSrc = "FTP";
		if (_self.isLocalStorage) {
			dataSrc = "LS";
		}
		_self.selFiles.push({
			id : selected,
			dataSource : dataSrc,
			name : file_name

		});
		$('li[data-id="' + selected + '"] .ui-icon-arrow-d').show();
	} else {
		_self.selFiles = jQuery.grep(_self.selFiles, function(item, index) {
			return item.id != selected;
		});
		$('li[data-id="' + selected + '"] .ui-icon-arrow-d').hide();
	}
	$('#selected-files-count').html(_self.selFiles.length);
}

FTPPage.prototype.onDirTap = function(event) {
	var _self = this;
	_self.currentDirPath = $(event.delegateTarget).data('id');
	if (!_self.currentDirPath.endsWith('/')) {
		_self.currentDirPath += '/';
	}
	if ($(event.delegateTarget).data('id') == '/') {
		_self.currentDirPath = '/';
	}
	_self.renderDirPath();
	_self.changeDir();
};

FTPPage.prototype.renderDirPath = function() {
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

FTPPage.prototype.changeDir = function() {
	var _self = this;
	console.log('Tap _self.currentDirPath>> ' + _self.currentDirPath);
	_self.explodeServerDir(_self.currentDirPath, function() {
		_self.renderContent(_self.currentDirPath);
	}, function(msg) {
		console.log(msg);
	});
};

FTPPage.prototype.renderDirs = function(dirs) {
	var _self = this;
	var dirItems = '';
	$.each(dirs, function(index, value) {
		var fileData = _self.app.dir64;
		var line = '<li data-id="' + _self.currentDirPath + value
				+ '" class="dir-placeholder"><a href="#">'
				+ '<img class="ui-li-thumb" src="' + fileData + '" /><h2>'
				+ value + '</h2></a></li>';
		dirItems = dirItems + line;
	});
	return dirItems;
}

FTPPage.prototype.renderFiles = function(files) {
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
						if (findResult.length > 0) {
							fileData = _self.app.image64
						}
						var dataid = $("#sel_ftpservers").val()
								+ _self.currentDirPath + value;
						
						// TODO: Get Images from FTP;

						var line = '<li data-name="'
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

FTPPage.prototype.explodeServerDir = function(dirName, success, error) {
	var _self = this;
	var selected_ftpserver = $("#sel_ftpservers").val();
	var ftpServerInfo = '';
	jQuery.grep(_self.app.appCache.ftpServers, function(item, index) {
		if (item.url == selected_ftpserver) {
			ftpServerInfo = item;
		}
		return (item.url == selected_ftpserver);
	});

	var ftpUrl = ftpServerInfo.url
	ftpUrl += dirName;

	var ftpServerInfo = '';
	jQuery.grep(_self.app.appCache.ftpServers, function(item, index) {
		if (item.url == selected_ftpserver) {
			selIndex = index;
			ftpServerInfo = item;
		}
		return (item.url == selected_ftpserver);
	});

	var updateFTPCache = function(files, dirs) {
		var selIndex = 0
		ftpServerInfo.data = {};
		var resultline = {};
		resultline['files'] = files;
		resultline['dirs'] = dirs;
		ftpServerInfo.data[_self.currentDirPath] = resultline;
		_self.app.appCache.ftpServers[selIndex] = ftpServerInfo;
		success();
	}

	var successCB = function(results) {
		console.log("Files Got");
		var files = results[0]["fileNames"];
		var dirs = results[0]["directory"];
		console.log("fileNames" + files);
		console.log("directory" + dirs);
		updateFTPCache(files, dirs);
	};
	console.log(ftpUrl);
	if (!ftpServerInfo.data || !ftpServerInfo.data[_self.currentDirPath]) {
		//TODO - open below actual data filler.
		 _self.app.ftpClient.filelist(ftpUrl, successCB, error);
		
		//TODO - Remove below dummy data filler.
//		var randomNum = Math.floor(Math.random() * (30 - 0 + 1)) + 0;
//		var extensionList = [ "jpg", "pdf", "png", "txt" ];
//		var tempFiles = [], tempDir = [];
//		for (var i = 0; i < randomNum; i++) {
//			tempFiles.push('file'
//					+ i
//					+ '.'
//					+ extensionList[Math.floor(Math.random()
//							* (extensionList.length))]);
//		}
//		randomNum = Math.floor(Math.random() * (30 - 0 + 1)) + 0;
//		var dirList = [ "subfolder", "textf" ];
//		for (var i = 0; i < randomNum; i++) {
//			tempDir.push(dirList[Math.floor(Math.random() * (dirList.length))]
//					+ "_" + i);
//		}
//		updateFTPCache(tempFiles, tempDir);
	}
}
