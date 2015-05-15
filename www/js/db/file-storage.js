var FS = function(app) {
	this.app = app;
	this.fileSystem = null;
	this.vis_dir = null;
	this.vis_ftp_dir = null;
	this.rootURI = "";
}

FS.prototype.errorHandler = function(e) {
	var msg = '';
	console.log('File Not Found');
	switch (e.code) {
	case FileError.QUOTA_EXCEEDED_ERR:
		msg = 'QUOTA_EXCEEDED_ERR';
		break;
	case FileError.NOT_FOUND_ERR:
		msg = 'NOT_FOUND_ERR';
		break;
	case FileError.SECURITY_ERR:
		msg = 'SECURITY_ERR';
		break;
	case FileError.INVALID_MODIFICATION_ERR:
		msg = 'INVALID_MODIFICATION_ERR';
		break;
	case FileError.INVALID_STATE_ERR:
		msg = 'INVALID_STATE_ERR';
		break;
	default:
		msg = 'Unknown Error';
		break;
	}
	;
	console.log("File-Storage:Error - " + msg);
	return msg;
}

FS.prototype.filelist = function(path, success) {
	var _self = this;
	console.log(path);
	window.webkitResolveLocalFileSystemURL(path, function(dirEntry) {
		var DirReader = dirEntry.createReader();
		DirReader.readEntries(function(entries) {
			var dirArr = [];
			var fileArr = [];
			for (var i = 0; i < entries.length; i++) { // sort entries
				var entry = entries[i];
				if (entry.isDirectory) {
					dirArr.push(entry.name);
				} else if (entry.isFile) {
					fileArr.push(entry.name);
				}
			}
			success([ {
				fileNames : fileArr,
				directory : dirArr
			} ]);
		}, _self.errorHandler);
	}, _self.errorHandler);
}

FS.prototype.getFile = function(path, success) {
	var _self = this;
	window.resolveLocalFileSystemURL(path, function(fileEntry) {
		fileEntry.file(function(file) {
			var reader = new FileReader();
			reader.onloadend = function(evt) {
				success({
					data : evt.target.result
				});
			};
			reader.readAsDataURL(file);
		}, _self.errorHandler);
	}, _self.errorHandler);
}

FS.prototype.createVISFile = function(param) {
	var _self = this;
	var prefix = "PS";
	if (_self.app.appCache.prefixCache[param.mrLineID]) {
		prefix = _self.app.appCache.prefixCache[param.mrLineID];
	}
	var date = new Date;
	var milSec = Math.floor(Math.random() * date.getMilliseconds());
	var sec = date.getSeconds();
	var mi = date.getMinutes();
	var hh = date.getHours();
	var yy = date.getFullYear();
	var mm = date.getMonth() + 1;
	var dd = date.getDate();
	var fileName = prefix + "_" + mm + dd + yy + "_" + hh + mi + sec + milSec
			+ "." + param.fileExt;
	_self.vis_dir
			.getFile(
					fileName,
					{
						create : true,
						exclusive : false
					},
					function(fileEntry) {
						fileEntry
								.createWriter(
										function(writer) {
											var fileBase64 = param.fileData
													.replace(
															/data:image\/(png|jpg|jpeg);base64,/,
															'');
											var binaryData = Base64Binary
													.decodeArrayBuffer(fileBase64);
											writer.onwrite = function(evt) {
												var fileFullPath = fileEntry
														.toURL();
												console.log(fileFullPath);
												console.log("New File Created");
												param['oldURI'] = param.filePath;
												param.filePath = fileFullPath;
												param['fileName'] = fileEntry.name;
												_self.app.appDB
														.doGalleryEntry(param);
												console.log("Added Entry ===="
														+ param.filePath);
												if (_self.app.galleryview.inspFiles[param.inspID]) {

													findResult = jQuery
															.grep(
																	_self.app.galleryview.inspFiles[param.inspID],
																	function(
																			item,
																			index) {
																		return item.filePath == param['oldURI'];
																	});
													if (findResult.length > 0) {
														$
																.each(
																		_self.app.galleryview.inspFiles[param.inspID],
																		function() {
																			if (this.filePath == param['oldURI']) {
																				this.filePath == param.filePath;
																				this['name'] == fileName;
																			}
																		});
													} else {
														item = {};
														item['filePath'] = param.filePath;
														item['name'] = param.fileName;
														item['uploded'] = "N";
														item['dataSource'] = "LS";
														item['data'] = "LS";
														_self.app.galleryview.inspFiles[param.inspID]
																.push(item);
														_self.app.appCache.imgCache[param.filePath] = param.fileData;
														_self.app.galleryview
																.renderInspFiles();
													}
												}
											};
											writer.write(binaryData);
										}, _self.errorHandler);
					}, _self.errorHandler);
}

FS.prototype.updateVISFile = function(param) {
	var _self = this;
	var fileBase64 = param.fileData.replace(
			/data:image\/(png|jpg|jpeg);base64,/, '');
	var binaryData = Base64Binary.decodeArrayBuffer(fileBase64);
	window.resolveLocalFileSystemURL(param.fileFullPath, function(fileEntry) {
		fileEntry.createWriter(function(writer) {
			writer.onwrite = function(evt) {
				console.log("FileData Updated");
			};
			writer.write(binaryData);
		}, _self.errorHandler);
	}, _self.errorHandler);
}

FS.prototype.init = function() {
	this.fileSystem = "";
	var _self = this;
	if (window.requestFileSystem) {
		console.log("Found File-Storage:Debug - ");
		window.requestFileSystem(window.PERSISTENT, 0, function(filesystem) {
			_self.fileSystem = filesystem;
			_self.rootURI = _self.fileSystem.root.toURL();
			console.log(">>>>>>>>>>>>>>>>>>>" + _self.fileSystem.root.toURL());
			filesystem.root.getDirectory('VIS_Inspection', {
				create : true
			}, function(filesystem) {
				console.log('VIS Directory');
				_self.vis_dir = filesystem;
				filesystem.getDirectory('VIS_FTP', {
					create : true
				}, function(filesystem) {
					console.log('VIS FTP');
					_self.vis_ftp_dir = filesystem;
				}, _self.errorHandler);
			}, _self.errorHandler);
		}, _self.errorHandler);
	} else if (window.webkitRequestFileSystem) {
		console.log('Found >> ' + window.webkitRequestFileSystem);
		window.requestFileSystem = window.webkitRequestFileSystem;

		window.webkitStorageInfo.requestQuota(window.PERSISTENT,
				50 * 1024 * 1024, function(grantedBytes) {
					window.requestFileSystem(window.PERSISTENT, 0, function(
							filesystem) {
						_self.fileSystem = filesystem;
						_self.rootURI = _self.fileSystem.root.toURL();
						filesystem.root.getDirectory('VIS_Inspection', {
							create : true
						}, function(filesystem) {
							console.log('VIS Directory');
							_self.vis_dir = filesystem;
							filesystem.getDirectory('VIS_FTP', {
								create : true
							}, function(filesystem) {
								console.log('VIS FTP');
								_self.vis_ftp_dir = filesystem;
							}, _self.errorHandler);
						}, _self.errorHandler);
					}, _self.errorHandler);

				}, function(e) {
					console.log('Error', e);
				});
	}
}

FS.prototype.getExtention = function(Fname) {
	var tmpArray = Fname.split('.');
	return tmpArray.pop();
}

FS.prototype.saveVISFile = function(fileData, oldFileURI) {
	var _self = this;
	var date = new Date;
	var sec = date.getSeconds();
	var mi = date.getMinutes();
	var hh = date.getHours();
	var yy = date.getFullYear();
	var mm = date.getMonth() + 1;
	var dd = date.getDate();
	var fileName = mm + dd + yy + "_" + hh + mi + sec + ".jpg";
	_self.vis_dir.getFile(fileName, {
		create : true,
		exclusive : false
	}, function(fileEntry) {
		fileEntry.createWriter(function(writer) {
			writer.onwrite = function(evt) {
				var fileFullPath = fileEntry.toURL();
				console.log(fileFullPath);
				console.log("New File Created");
				var mrLineID1 = _self.app.appCache.session.m_inoutline_id;
				var inspID1 = _self.app.appCache.session.x_instructionline_id;
				var mrID1 = _self.app.appCache.session.M_INOUT_ID;

				_self.app.appDB.updateGalleryURIEntry(mrLineID1, inspID1,
						mrID1, fileEntry.name, fileFullPath, oldFileURI);

				_self.getFileByURL({
					oldURI : oldFileURI,
					fileURI : fileFullPath,
					inspID : inspID1
				}, function(param) {
					_self.onUpdateCacheImageData(param);
				})

				// $.each(_self.app.appCache.inspFiles[inspID], function() {
				// if (this.filePath == oldFileURI) {
				// this.filePath == fileFullPath;
				// this['name'] == fileEntry.name;
				// this.data = evt.target.result;
				// $.mobile.changePage("#pg_gallery");
				// }
				// });

			};
			writer.write(fileData);
		}, _self.errorHandler);
	}, _self.errorHandler);
}

FS.prototype.onUpdateCacheImageData = function(param) {
	var _self = this;
	$.each(_self.app.appCache.inspFiles[param.inspID], function() {
		if (this.filePath == param.oldURI) {
			this.filePath == param.fileURI;
			this['name'] == param.name;
			this.data = param.data;
			$.mobile.changePage("#pg_gallery");
		}
	});
}

FS.prototype.getSDPath = function(Fname) {
	var tmpArray = Fname.split('mnt/sdcard');
	return tmpArray.pop();
}

FS.prototype.getFileName = function(tmpFile) {
	var tmpArray = tmpFile.split('/');
	return tmpArray.pop();
}

FS.prototype.uploadFile = function(file, mr_line, insp_line, in_out_id) {
	var _self = this;
	_self.fileSystem.root.getFile(file, null, function(fileEntry) {
		_self.app.appFTPUtil.uploadFile(fileEntry, mr_line, insp_line,
				in_out_id);
	}, _self.errorHandler);
}

FS.prototype.getVISFile = function(param, callBack) {
	var _self = this;

	_self.fileSystem.root.getFile(param.filePath.substring(1,
			param.filePath.length), null, function(fileSystem) {
		fileSystem.file(function(file) {
			var reader = new FileReader();
			reader.onloadend = function(evt) {
				console.log("Read as data URL");
				param['fileURI'] = fileSystem.toURL();
				console.log(fileSystem.toURL());
				param['data'] = evt.target.result;
				param['fileName'] = file.name;

				callBack(param);
			};
			reader.readAsDataURL(file);
		}, _self.errorHandler);
	}, _self.errorHandler);
}

FS.prototype.getFileByURL = function(param, callback) {
	var _self = this;
	window.resolveLocalFileSystemURL(param.fileURI, function(fileEntry) {
		fileEntry.file(function(file) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
				param['fileName'] = file.name;
				param['data'] = e.target.result;
				callback(param);
			};
			reader.readAsDataURL(file);
		}, _self.errorHandler);
	}, _self.errorHandler);
}

// rename(fs.root, 'me.png', 'you.png');
FS.prototype.rename = function(src, newName) {
	this.fileSystem.root.getFile(src, {}, function(fileEntry) {
		fileEntry.moveTo(this.fileSystem.root, newName);
	}, errorHandler);
}

// copy(fs.root, '/folder1/me.png', 'folder2/mypics/');
FS.prototype.copy = function(src, dest, callback) {
	this.fileSystem.root.getFile(src, {}, function(fileEntry) {
		this.fileSystem.root.getDirectory(dest, {}, function(dirEntry) {
			fileEntry.copyTo(dirEntry);
		}, function(e) {
			callback(this.errorHandler(e));
		});
	}, function(e) {
		callback(this.errorHandler(e));
	});
}

// '/misc/../music'
FS.prototype.removeDir = function(dirPath, callback) {
	window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
		fs.root.getDirectory(filePath, {}, function(dirEntry) {
			dirEntry.removeRecursively(function() {
				console.log('Directory removed.');
			}, function(e) {
				callback(this.errorHandler(e));
			});

		}, function(e) {
			callback(this.errorHandler(e));
		});
	}, function(e) {
		callback(this.errorHandler(e));
	});
}

FS.prototype.readDir = function(dirPath, callback) {
	window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
		fs.root.getDirectory(filePath, {}, function(dirEntry) {
			dirEntry.removeRecursively(function() {
				console.log('Directory removed.');
			}, function(e) {
				callback(this.errorHandler(e));
			});

		}, function(e) {
			callback(this.errorHandler(e));
		});
	}, function(e) {
		callback(this.errorHandler(e));
	});
}

FS.prototype.createFile = function(fileName, fileData, callback) {
	this.fileSystem.root.getFile(fileName, {
		create : true
	}, function(fileEntry) {
		// Create a FileWriter object for our FileEntry (log.txt).
		fileEntry.createWriter(function(fileWriter) {
			fileWriter.onwriteend = function(e) {
				console.log('Write completed.');
			};
			fileWriter.onerror = function(e) {
				console.log('Write failed: ' + e.toString());
			};
			// Create a new Blob and write it to log.txt.
			// var blob = new Blob(['test data'], {
			// type : 'text/plain'
			// });
			var blob = new Blob(fileData, {
				type : 'text/plain'
			});
			fileWriter.write(blob);
			callback("success");
		}, function(e) {
			callback(this.errorHandler(e));
		});
	}, function(e) {
		callback(this.errorHandler(e));
	});
}

FS.prototype.read = function(filename, callback) {
	this.fileSystem.root.getFile(filename, {}, function(fileEntry) {
		// Get a File object representing the file,
		// then use FileReader to read its contents.
		fileEntry.file(function(file) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
				callback(this.result);
			};
			reader.readAsText(file);
		}, function(e) {
			callback(this.errorHandler(e));
		});
	}, function(e) {
		callback(this.errorHandler(e));
	});
}

FS.prototype.append = function(filename, filedata, callback) {
	this.fileSystem.root.getFile(filename, {
		create : false
	}, function(fileEntry) {
		// Create a FileWriter object for our FileEntry {filename}.
		fileEntry.createWriter(function(fileWriter) {
			fileWriter.seek(fileWriter.length);
			// Start write position at EOF.
			// Create a new Blob and write it to {filename}.
			// var blob = new Blob(['Hello World'], {type: 'text/plain'});
			var blob = new Blob(filedata, {
				type : 'text/plain'
			});
			fileWriter.write(blob);
		}, function(e) {
			callback(this.errorHandler(e));
		});
	}, function(e) {
		callback(this.errorHandler(e));
	});
}

FS.prototype.deletefile = function(filename, callback) {
	this.fileSystem.root.getFile(filename, {
		create : false
	}, function(fileEntry) {
		fileEntry.remove(function() {
			callback('removed');
			console.log(filename + 'File removed.');
		}, function(e) {
			callback(this.errorHandler(e));
		});
	}, function(e) {
		callback(this.errorHandler(e));
	});
}

// move('/me.png', 'newfolder/');
FS.prototype.move = function(src, dirName, callback) {
	this.fileSystem.root.getFile(src, {}, function(fileEntry) {
		this.fileSystem.root.getDirectory(dirName, {}, function(dirEntry) {
			fileEntry.moveTo(dirEntry);
		}, function(e) {
			callback(this.errorHandler(e));
		});
	}, function(e) {
		callback(this.errorHandler(e));
	});
}

FS.prototype.renderFileTree = function(placeholder, callback) {

	var toArray = function(list) {
		return Array.prototype.slice.call(list || [], 0);
	}

	var listResults = function(entries) {
		// Document fragments can improve performance since they're only
		// appended to the DOM once. Only one browser reflow occurs.
		var dirReader = this.fileSystem.root.createReader();
		var entries = [];
		var fragment = document.createDocumentFragment();
		entries.forEach(function(entry, i) {
			var img = entry.isDirectory ? '<img src="img/folder-icon.gif">'
					: '<img src="img/file-icon.gif">';
			var li = document.createElement('li');
			li.innerHTML = [ img, '<span>', entry.name, '</span>' ].join('');
			fragment.appendChild(li);
		});
		document.querySelector('#' + placeholder).appendChild(fragment);
	}
	// Call the reader.readEntries() until no more results are returned.
	var readEntries = function() {
		dirReader.readEntries(function(results) {
			if (!results.length) {
				listResults(entries.sort());
			} else {
				entries = entries.concat(toArray(results));
				readEntries();
			}
		}, function(e) {
			callback(this.errorHandler(e));
		});
	};
	readEntries();
	// Start reading dirs.
}

// var path = 'music/genres/jazz/';
// createDir(fs.root, path.split('/'));
FS.prototype.createDir = function(folders, callback) {
	var _self = this;
	// Throw out './' or '/' and move on to prevent something like
	// '/foo/.//bar'.
	if (folders[0] == '.' || folders[0] == '') {
		folders = folders.slice(1);
	}
	this.fileSystem.root.getDirectory(folders[0], {
		create : true
	}, function(dirEntry) {
		// Recursively add the new subfolder (if we still have another to
		// create).
		if (folders.length) {
			_self.createDir(dirEntry, folders.slice(1));
		}
	}, function(e) {
		callback(this.errorHandler(e));
	});
};