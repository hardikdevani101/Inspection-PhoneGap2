var FTPPage = function(app) {
	this.app = app;
	this.currentDirPath = '/';
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

		$('#btn_refresh_ftpServers').on("click", function() {
			_self.app.appCache.ftpServers = {};
			_self.loadFTPServers();
		});

		$("#btn-finish-ftp-file-selection").on('click', function() {
			// Push Selected File information to Gallery Page.
			$.mobile.changePage("#pg_gallery");
		});

		$("#sel_ftpservers").on("change", _self.onFTPServerChange);
	});
}

FTPPage.prototype.fillFTPServerList = function() {
	var _self = this;
	$("#sel_ftpservers").html('');
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
		_self.renderContent();
	}
}

FTPPage.prototype.loadFTPServers = function() {
	var _self = this;
	_self.app.showDialog("Loading..");
	if (_self.app.appCache.ftpServers.length > 0) {
		_self.fillFTPServerList();
		_self.renderContent();
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
	$('#currentDirPath').html(selected);
	$('#currentDirPath').attr('title', selected);
	console.log('Tap >> ' + selected);
	var findResult = [];
	if (_self.selFiles.length > 0) {
		var findResult = jQuery.grep(_self.selFiles, function(item, index) {
			return item.id == selected;
		});

	}
	if (!findResult.length > 0) {
		_self.selFiles.push({
			id : selected
		});
		$(event.delegateTarget).addClass("selected-file");
	} else {
		_self.selFiles = jQuery.grep(_self.selFiles, function(item, index) {
			return item.id != selected;
		});
		$(event.delegateTarget).removeClass("selected-file");
	}
}

FTPPage.prototype.onDirTap = function(event) {
	var _self = this;
	_self.currentDirPath = $(event.delegateTarget).data('id') + '/'
	console.log('Tap _self.currentDirPath>> ' + _self.currentDirPath);
	$('#currentDirPath').attr('title', _self.currentDirPath);
	$('#currentDirPath').html(_self.currentDirPath);
	_self.explodeServerDir(_self.currentDirPath, function() {
		_self.renderContent(_self.currentDirPath);
	}, function(msg) {
		console.log(msg)
	});

}

FTPPage.prototype.renderDirs = function(dirs) {
	var _self = this;
	var dirItems = '';
	$.each(dirs, function(index, value) {
		var fileData = _self.app.dir64;
		var line = '<li data-id="' + _self.currentDirPath + value
				+ '" class="dir-placeholder"><a href="#">'
				+ '<img class="ui-li-thumb" src="'
				+ fileData + '" /><h2>' + value + '</h2></a></li>';
		dirItems = dirItems + line;
	});
	return dirItems;
}

FTPPage.prototype.renderFiles = function(files) {
	var _self = this;
	var fileItems = '';
	$.each(files, function(index, value) {
		var extension = value.substr((value.lastIndexOf('.') + 1));
		var findResult = jQuery.grep(_self.app.imgDataTypes, function(item,
				index) {
			return item == extension.toUpperCase();
		});
		var fileData = _self.app.file64;
		if (findResult.length > 0) {
			fileData = _self.app.image64
		}
		var line = '<li id="' + _self.line_id + '" data-id="'
				+ $("#sel_ftpservers").val() + _self.currentDirPath + value
				+ '" class="file-placeholder"><a href="#">'
				+ '<img class="ui-li-thumb" src="'
				+ fileData + '" /><h2>'
				+ value.substr(0, (value.lastIndexOf('.'))) + '</h2></a></li>';
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
	if (dirName != '/') {
		ftpUrl += dirName;
	}

	var updateFTPCache = function(files, dirs) {
		var selIndex = 0
		var ftpServerInfo = '';
		jQuery.grep(_self.app.appCache.ftpServers, function(item, index) {
			if (item.url == selected_ftpserver) {
				selIndex = index;
				ftpServerInfo = item;
			}
			return (item.url == selected_ftpserver);
		});

		ftpServerInfo.data = {};
		// var dirPath = _self.currentDirPath;
		// if (dirName != '/') {
		// dirPath = dirPath+dirName+'/';
		// }

		var resultline = {};
		resultline['files'] = files
		resultline['dirs'] = dirs
		ftpServerInfo.data[_self.currentDirPath] = resultline;
		_self.app.appCache.ftpServers[selIndex] = ftpServerInfo;
		success();
	}

	var successCB = function(results) {
		var files = results[0]["fileNames"];
		var dirs = results[0]["directory"];
		updateFTPCache(files, dirs);
	};

	// _self.app.ftpClient.filelist(ftpUrl, successCB, error);
	var randomNum = Math.floor(Math.random() * (30 - 0 + 1)) + 0;
	var extensionList = [ "jpg", "pdf", "png", "txt" ];
	var tempFiles = [], tempDir = [];
	for ( var i = 0; i < randomNum; i++) {
		tempFiles.push('file.'
				+ extensionList[Math.floor(Math.random()
						* (extensionList.length))]);
	}
	randomNum = Math.floor(Math.random() * (30 - 0 + 1)) + 0;
	var dirList = [ "subfolder", "textf" ];
	for ( var i = 0; i < randomNum; i++) {
		tempDir.push(dirList[Math.floor(Math.random() * (dirList.length))]
				+ "_" + i);
	}
	updateFTPCache(tempFiles, tempDir);
}
