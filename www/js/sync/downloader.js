self.addEventListener('message', function(event) {
	self.importScripts('../db/db.js', '../db/file-storage.js', 'cordova.js',
			'../../ftpclient.js');
	console.log('Donwload worker called' + event.data);
	var isFTP = event.data.isFTP;
	if (isFTP) {
		var files = event.data.selFiles;
		for (var i = 0; i < files.length; i++) {
			var file = files[0];
			var ftpDownloadSuccessCB = function(fileData) {
				self.postMessage(fileData);
			}
			var ftpDownloadErrorCB = function(msg) {
				console.log("File not downloaded from ftp >> " + msg);
			}
			vision.ftpclient
					.get(file, ftpDownloadSuccessCB, ftpDownloadErrorCB);
		}
	}
}, false);

self.addEventListener('message', function(event) {
	// console.log('Error -Donwload-Worker said: ' + event.message, event);
}, false);