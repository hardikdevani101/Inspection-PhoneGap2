var FTPPage = function(app) {
	this.app = app;
	this.currentDirPath = '/';
	this.selFiles = [];
}

FTPPage.prototype.rederBreadCrumb = function() {
	// $('#ftp_explorer_bc').text(
	// String(_self.app.appCache.loginInfo.username));
}

FTPPage.prototype.init = function() {
	var _self = this;
	$(document)
			.on(
					"pagebeforeshow",
					"#pg_ftp_explorer",
					function() {
						// Initialize serverlist Drop down
						_self.visionApi = new VisionApi(_self.app);
						for ( var i = 0; i < _self.app.appCache.ftpServers.length; i++) {
							$("#sel_ftpservers")
									.append(
											new Option(
													_self.app.appCache.ftpServers[i].name,
													_self.app.appCache.ftpServers[i].url));
						}
						$('#sel_ftpservers').selectmenu('refresh', true);

						_self.rederBreadCrumb();
						_self.loadFTPServers();

						$('#btn_refresh_ftpServers').on("click", function() {
							_self.app.appCache.ftpServers = {};
							_self.loadFTPServers();
						});

						$("#sel_ftpservers").on("change",
								_self.onFTPServerChange);
					});
}

FTPPage.prototype.loadFTPServers = function() {
	var _self = this;
	_self.app.showDialog("Loading..");
	var selected_ftpserver = $("#sel_ftpservers").val();
	if (_self.app.appCache.ftpServers[selected_ftpserver]) {
		_self.renderContent();
	} else {
		var success = function(result) {
			var items = '';
			$.each(result.ftpServers, function(index, value) {
				_self.app.appCache.ftpServers[value.url] = {
					'info' : value,
					'data' : {}
				};
			});
			// Initialize selected FTP Server DirTree
			_self.explodeServerDir(_self.currentDirPath, function() {
				_self.renderContent()
			}, function(msg) {
				console.log("Error in loading ftp server data.")
			});
		};

		_self.visionApi.getFTPServerList({
			userid : app.appCache.loginInfo.userid
		}, success, function() {
			// popup Errorbox.
			console.log("Load FTP Servers failed");
			_self.app.hideDialog();
		});
	}
}

FTPPage.prototype.renderContent = function(dirPath) {
	var _self = this;
	var items = '';
	var selected_ftpserver = $("#sel_ftpservers").val();
	var serverData = _self.app.appCache.ftpServers[selected_ftpserver].data;
	var files = serverData[dirPath].files;
	var dirs = serverData[dirPath].dirs;
	var ftpUrl = "ftp://" + selected_ftpserver;

	$('#ls_ftpServers').html(items);
	$('#ls_ftpServers').listview("refresh");

	$(".dir-placeholder").bind("tap", onDirTap);
	$(".file-placeholder").bind("tap", onFileTap);

	_self.app.hideDialog();
}

FTPPage.prototype.onFileTap = function(event) {
	var selected = $(event.delegateTarget).data('id')
	console.log('Tap >> ' + selected);
	var findResult = jQuery.grep(_self.selFiles, function(item, index) {
		return item.id == selected;
	});
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
	_self.currentDirPath = $(event.delegateTarget).data('id')
	console.log('Tap >> ' + selected);
	_self.explodeServerDir(_self.currentDirPath, function() {
		_self.renderContent(_self.currentDirPath);
	}, error);

}

FTPPage.prototype.renderDirs = function(dirs) {
	var _self = this;
	var dirItems = '';
	$
			.each(
					dirs,
					function(index, value) {
						var fileData = _self.app.dir64;
						var line = '<li data-id="'
								+ _self.currentDirPath
								+ '/'
								+ value
								+ '" class="dir-placeholder"><a href="#">'
								+ '<img class="ui-li-thumb" src="data:image/png;base64,'
								+ fileData
								+ '" /><h2>'
								+ value
								+ '</h2><p class="ui-li-aside"><a class="ui-btn ui-corner-all ui-icon-arrow-u ui-btn-icon-notext ui-btn-inline"></a></p></a></li>';
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
						var findResult = jQuery.grep(_self.app.imgDataTypes,
								function(item, index) {
									return item == extension.toUpperCase();
								});
						var fileData = _self.app.file64;
						if (findResult.length > 0) {
							fileData = _self.app.image64
						}
						var line = '<li id="'
								+ _self.line_id
								+ '" data-id="'
								+ $("#sel_ftpservers").val()
								+ _self.currentDirPath
								+ value
								+ '" class="file-placeholder"><a href="#">'
								+ '<img class="ui-li-thumb" src="data:image/png;base64,'
								+ fileData
								+ '" /><h2>'
								+ value.substr(0, (value.lastIndexOf('.')))
								+ '</h2><p class="ui-li-aside"><a class="ui-btn ui-corner-all ui-icon-arrow-u ui-btn-icon-notext ui-btn-inline"></a></p></a></li>';
						fileItems = fileItems + line;
					});

	return fileItems;
}

FTPPage.prototype.explodeServerDir = function(dirName, success, error) {
	var _self = this;
	var selected_ftpserver = $("#sel_ftpservers").val();
	var ftpServerInfo = jQuery.grep(_self.app.appCache.ftpServers, function(
			item, index) {
		return item.url == selected_ftpserver;
	});

	var ftpUrl = "ftp://" + selected_ftpserver + "/";
	if (dirName != '/') {
		ftpUrl += dirName;
	}

	var updateFTPCache = function(files, dirs) {
		if (!_self.app.appCache.ftpServers[selected_ftpserver]) {
			_self.app.appCache.ftpServers[selected_ftpserver] = {};
		}
		var serverData = _self.app.appCache.ftpServers[selected_ftpserver].data
		var dirPath = '/';
		if (dirName != '') {
			dirPath += dirName;
		}

		var resultline = {};
		resultline['files'] = files
		resultline['dirs'] = dirs
		serverData[dirPath] = resultline;
		_self.app.appCache.ftpServers[selected_ftpserver].data = serverData;
		success();
	}

	var successCB = function(results) {
		var files = results[0]["fileNames"];
		var dirs = results[0]["directory"];
		updateFTPCache(files, dirs);
	};

	// _self.app.ftpClient.filelist(ftpUrl, successCB, error);
	tempFiles = [ "file.jpg", "file.pdf", "file.png", "file.txt" ];
	tempDir = [ "subfolder1", "subfolder2", "testf1", "testf2" ];
	updateFTPCache(tempFiles, tempDir);
}
