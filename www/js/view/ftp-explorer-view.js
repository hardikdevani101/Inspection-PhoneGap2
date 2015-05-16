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
			var mrLineID1 = _self.app.appCache.session.m_inoutline_id;
			var inspID1 = _self.app.appCache.session.x_instructionline_id;
			var mrID1 = _self.app.appCache.session.M_INOUT_ID;
			_self.app.galleryview.pushFileData({
				filesData : selFiles,
				mrLineID : mrLineID1,
				inspID : inspID1,
				mrID : mrID1
			});
			$.mobile.changePage("#pg_gallery");
		});

		$("#btn_reload_files").on("tap", function() {
			_self.currentDirPath = '/';
			// _self.selFiles = [];
			_self.explodeDirectory(_self.currentDirPath, function() {
				_self.renderContent()
			}, function(msg) {
				console.log("Error in loading server data.")
			});
		});

		$("#sel_dataproviders").on("change", function() {
			if ($("#sel_dataproviders").val() == 'LS') {
				_self.isLocalStorage = true;
			} else {
				_self.isLocalStorage = false;
			}
			_self.onDataStorageChange();
		});

		$('#selected-files-count').on("tap", function(event) {
			_self.renderSelectedFiles();
		});
	});
}

FileExplorerPage.prototype.renderSelectedFiles = function() {
	console.log('renderSelectedFiles >>>>>> ');
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
		if (_self.app.appCache.ftpServers.length > 0) {
			$.each(_self.app.appCache.ftpServers, function(key, data) {
				if (data.isFTP == 'Y') {
					$("#sel_dataproviders").append(
							new Option(data.name, data.url));
				}
			});
//			var option1 = $($("option", $('#sel_dataproviders')).get(1));
//			option1.attr('selected', 'selected');
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
			// TODO close below dummy data runner.
			resultline = {};
			resultline['record-id'] = '2323';
			resultline['url'] = 'ftp://343.343.343.34';
			resultline['isFTP'] = 'Y';
			resultline['name'] = 'Ftp Server';
			resultline['password'] = 'username';
			resultline['user'] = 'username';
			//_self.app.appCache.ftpServers.push(resultline);
			var result = {
				'ftpservers' : [ resultline, resultline, resultline ],
				'total' : 1
			};
			
			var items = '';
			_self.app.appCache.ftpServers = [];
			$.each(result.ftpservers, function(index, data) {
				_self.app.appCache.ftpServers.push(data);
			});
			reloadDataProviders();
			// popup Errorbox.
			console.log("Load FTP Servers failed" + msg);
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

//	var selected_dataprovider = $("#sel_dataproviders").val();
//	var dataStorageInfo = '';
//	jQuery.grep(_self.app.appCache.ftpServers, function(item, index) {
//		if (item.url == selected_dataprovider) {
//			dataStorageInfo = item;
//		}
//		return (item.url == selected_dataprovider);
//	});
	
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

FileExplorerPage.prototype.onFileTap = function(event) {
	var _self = this;
	var selected = $(event.delegateTarget).data('id');
	var file_name = $(event.delegateTarget).data('name');
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

FileExplorerPage.prototype.onDirTap = function(event) {
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

FileExplorerPage.prototype.loadImgInDOM = function(dataid, isLocalStrg) {
	var _self = this;
	if (_self.app.appCache.imgCache[dataid]) {
		$('li[data-id="' + dataid + '"] img').attr('src',
				_self.app.appCache.imgCache[dataid]);
	} else {
		var storage = _self.isLocalStorage?'LS':'FTP';
		// TODO remove below dummy data runner in production.
		// Start of dummy data filler.
		var img = "data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAd Hx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3 Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAFoAWgMBIgACEQED EQH/xAAbAAADAQEBAQEAAAAAAAAAAAAAAQcEBQYCA//EAEAQAAECBAEGCwQHCQAAAAAAAAEAAgME BRGxBgchMTV0EhYXNlFVdZOy0eITImGBc5GSocHS8BUyQUJDRHGCg//EABkBAQADAQEAAAAAAAAA AAAAAAQAAwUBAv/EACQRAAEDAgYDAQEAAAAAAAAAAAABAgMEERQhMTIzcRITUUJB/9oADAMBAAIR AxEAPwC4oQkToUIC5eUFalqNJmNMOu86IcMHS8+XxX1XaxLUeSdHmHXcdEOGNbz0KS1apTFVnXzM y67joa0amjoCTTU6yLddA08/hkmp91CfnK3UPaR3F8WI7gw4YPut6AFs4pVwaqe4/wC7PNc6kbVk /pmYq3DUmVEzoLNYGgiSa7nEi4pV3q4/bZ5o4pV3q4/bZ5qvIRsdKX4NhIHZK12G0v8A2c/3dPuu aT9xW3JnKicpk2yVqEV8SVLuA72xPChfM6fkqipXnDgMgZRFzGge1gNe4DpuR+CtimxC+D0K5IvS nkxSpMIIBbaxF9C+1hojnOpEk55u4wGEnp0Lcs9UsqoORbpcS5tcrMrR5N0eYddx0Q4Y1vPwXSUf ymmJmoZRzMJ7i8tjGDCbewAvawV9ND7X2XQpnl9bctTHV6nM1acdMzTru1NaNTB0BYl3OJ9f6vJ/ 6s80cUK91e7vWfmWqksTUsioZqskVbqhzqOCatJ2H9dmKtw1Ke5LZHzsGow5uqMbBZBcHNh8MOLn fw1agqENSzq2Rr3p4qOpGK1q3GhCEMWCl+crbzN1bi5VBS/OVt5m6txclUfKGq+MoNC2NI7uzALe sFC2NI7uzALejv3KXs2oIKPznPGJ2gPGFYAo/O88X9oDxhKo9XdBqr89lfQgJhCFoFkDUmhdICEI UICl+crbzN1bi5VBS/OVt5m6txclUfKGq+MoNC2NI7uzALesFC2NI7uzALejv3KXs2oIKPzvPF/a A8YVgCj87zxf2gPGEui1d0Gqvz2V8JhIJhB/ov8Ag0IQukBCEKEBS/OVt5m6txcqgpfnK28zdW4u SqPlDVfGUGhbGkd3ZgFvWChbGkd3ZgFvR37lL2bUEo/O88X9oDxhWAqPzujLCJc/348YSqLV3Qaq 0b2V8JpAp3QxaaDQlcIuFCDQlcIuFCDUvzk7eZurfE5U+6l+chwdX2gHSJZoP1uSqPlC1fGUKhbG kd3ZgFvWCg7GkfoGYBb0d25RDNqCKmWXdGiydSdUYTSYEYgucP5Hfq3zVNOpfnGY18NzXtDmkaQR cFe4ZFjddDxNGj25k7p+X83LyzIc1KMmHgW9oH8G4+IsVp5RYnVje/8ASvMZRwocCrRWQYbIbL/u saAFzFqJTROzsZvvkblc91yixOrG9/6UcosTqxvf+leFQu4SH4dxMn091yixOrG9/wClHKLE6sb3 /pXhUKYSH4TEyfT3D84kYscGU1gdbQTG0X+pefkZWeyorTjFJe6I4GNEA91jfw/wuTCAMRgIuC4K zUSXgS8hDbAgw4YIvZjQMFVKjKdt2Jmp7jV0y2cptl4bYUJkNgs1rQAPgv1SCayjSRLH/9k="
		setInterval(function() {
			_self.app.appCache.imgCache[dataid] = img;
			$('li[data-id="' + dataid + '"] img').attr('src', img);
		}, 1000);

		// End of dummy data filler.

		if (isLocalStrg) {
			// TODO get data from local storage;
		} else {

			// TODO get data from FTP storage; Open below code in production.
			// _self.app.ftpClient
			// .getFile(
			// dataid,
			// function(result) {
			// var img64 = result.data
			// _self.app.appCache.imgCache[dataid] = img64;
			// $(
			// 'li[data-id="' + dataid
			// + '"] img')
			// .attr('src', img64);
			// },
			// function(msg) {
			// console
			// .log('Error Getting File >>> '
			// + dataid);
			// });
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
							_self.loadImgInDOM(dataid, _self.isLocalStorage);
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

FileExplorerPage.prototype.explodeDirectory = function(dirName, success, error) {
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
	}
	var ftpUrl = dataProviderUrl + dirName;

	var updateStorageCache = function(files, dirs) {
		var selIndex = 0
		dataStorageInfo.data = {};
		var resultline = {};
		resultline['files'] = files;
		resultline['dirs'] = dirs;
		dataStorageInfo.data[_self.currentDirPath] = resultline;
		if (!_self.isLocalStorage) {
			_self.app.appCache.ftpServers[selIndex] = dataStorageInfo;
		} else {
			_self.app.appCache.localStorage[0] = dataStorageInfo;
		}
		success();
	}

	var successCB = function(results) {
		var files = results[0]["fileNames"];
		var dirs = results[0]["directory"];
		updateStorageCache(files, dirs);
	};


	if (dataStorageInfo.data && !dataStorageInfo.data[_self.currentDirPath]) {
		// TODO - open below actual data filler.
		if (!_self.isLocalStorage) {
			// _self.app.ftpClient.filelist(ftpUrl, successCB, error);
		} else {
			// _self.app.fileStorage.filelist(ftpUrl, successCB,
			// error);
		}

		// TODO - Remove below dummy data filler.
		var randomNum = Math.floor(Math.random() * (30 - 0 + 1)) + 0;
		var extensionList = [ "jpg", "pdf", "png", "txt" ];
		var tempFiles = [], tempDir = [];
		for (var i = 0; i < randomNum; i++) {
			tempFiles.push('file'
					+ i
					+ '.'
					+ extensionList[Math.floor(Math.random()
							* (extensionList.length))]);
		}
		randomNum = Math.floor(Math.random() * (30 - 0 + 1)) + 0;
		var dirList = [ "subfolder", "textf" ];
		for (var i = 0; i < randomNum; i++) {
			tempDir.push(dirList[Math.floor(Math.random() * (dirList.length))]
					+ "_" + i);
		}
		updateStorageCache(tempFiles, tempDir);
	}
}