var FS = function(app) {
	this.app = app;
}

FS.prototype.errorHandler = function(e) {
	var msg = '';
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

FS.prototype.init = function() {
	this.fileSystem = "";
	var _self = this;
	console.log("File-Storage:init");
	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
	if (window.requestFileSystem) {
		console.log("File-Storage:Debug - " + window.requestFileSystem);
		window.requestFileSystem(window.PERSISTENT, 1024 * 1024,
				function(filesystem) {
					_self.fileSystem = filesystem;
				}, this.errorHandler);
	}
}

FS.prototype.getFileByURL=function(url,callback){
	var url = 'filesystem:'+url;
	window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;
	window.resolveLocalFileSystemURL(url, function(fileEntry) {	
		fileEntry.file(function(file) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
				callback(this.result)
			};
			reader.readAsText(file);
		}, function(e) {
			callback(this.errorHandler(e));
		});	
	},function(e) {
		callback(this.errorHandler(e));
	});
}

// rename(fs.root, 'me.png', 'you.png');
FS.prototype.rename = function (src, newName) {
	this.fileSystem.root.getFile(src, {}, function(fileEntry) {
	    fileEntry.moveTo(this.fileSystem.root, newName);
	  }, errorHandler);
}

// copy(fs.root, '/folder1/me.png', 'folder2/mypics/');
FS.prototype.copy = function (src, dest,callback) {
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
FS.prototype.removeDir=function(dirPath,callback){
	window.requestFileSystem(window.TEMPORARY, 1024*1024, function(fs) {
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


FS.prototype.readDir=function(dirPath,callback){
	window.requestFileSystem(window.TEMPORARY, 1024*1024, function(fs) {
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

FS.prototype.append=function(filename,filedata,callback){
	this.fileSystem.root.getFile(filename, {create: false}, function(fileEntry) {
	    // Create a FileWriter object for our FileEntry {filename}.
	    fileEntry.createWriter(function(fileWriter) {
	      fileWriter.seek(fileWriter.length); 
	      // Start write position at EOF.
	      // Create a new Blob and write it to {filename}.
	      // var blob = new Blob(['Hello World'], {type: 'text/plain'});
	      var blob = new Blob(filedata, {type: 'text/plain'});
	      fileWriter.write(blob);
	    }, function(e) {
			callback(this.errorHandler(e));
		});
	  }, function(e) {
			callback(this.errorHandler(e));
		});	
}

FS.prototype.deletefile=function(filename,callback){
	 this.fileSystem.root.getFile(filename, {create: false}, function(fileEntry) {
		    fileEntry.remove(function() {
		    	callback('removed');
		    	console.log(filename+'File removed.');
		    }, function(e) {
				callback(this.errorHandler(e));
			});
		  }, function(e) {
				callback(this.errorHandler(e));
			});
}

// move('/me.png', 'newfolder/');
FS.prototype.move=function (src, dirName,callback) {
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

FS.prototype.renderFileTree=function (placeholder,callback) {
	
	var toArray=function (list) {
		  return Array.prototype.slice.call(list || [], 0);
	}

	var listResults = function(entries) {
		  // Document fragments can improve performance since they're only
			// appended to the DOM once. Only one browser reflow occurs.
		var dirReader = this.fileSystem.root.createReader();
		var entries = [];
		var fragment = document.createDocumentFragment();
		entries.forEach(function(entry, i) {
			var img = entry.isDirectory ? '<img src="img/folder-icon.gif">' :
		                                  '<img src="img/file-icon.gif">';
		    var li = document.createElement('li');
		    li.innerHTML = [img, '<span>', entry.name, '</span>'].join('');
		    	fragment.appendChild(li);
		  });
		  document.querySelector('#'+placeholder).appendChild(fragment);
		}
	  // Call the reader.readEntries() until no more results are returned.
	  var readEntries = function() {
	     dirReader.readEntries (function(results) {
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
FS.prototype.createDir=function (folders,callback) {
  var _self=this;
  // Throw out './' or '/' and move on to prevent something like
	// '/foo/.//bar'.
  if (folders[0] == '.' || folders[0] == '') {
    folders = folders.slice(1);
  }
  this.fileSystem.root.getDirectory(folders[0], {create: true}, function(dirEntry) {
    // Recursively add the new subfolder (if we still have another to create).
    if (folders.length) {
      _self.createDir(dirEntry, folders.slice(1));
    }
  }, function(e) {
		callback(this.errorHandler(e));
	});
};