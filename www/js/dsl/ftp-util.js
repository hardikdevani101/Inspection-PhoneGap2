var FTPUtils = function(app) {
	this.app = app;
	this.processLog = [];
}

FTPUtils.prototype.init = function() {

}

FTPUtils.prototype.upload = function(fileURI, M_InOutLine_ID,
		X_INSTRUCTIONLINE_ID, isMR, onError, onSuccess, ftpURL) {
	var _self = this;
	var ft = new FileTransfer();
	var options = new FileUploadOptions();
	options.fileKey = "file";
	options.fileName = fileURI.split('/').pop();

	ft.upload(fileURI,
			encodeURI(_self.app.appCache.settingInfo.service_url
					+ "/VISService/fileUpload"), function(result) {
				var xmlResponse = result.response;
				var oldfileName = $(xmlResponse).find('oldName').text().trim();
				var newFileName = $(xmlResponse).find('newName').text().trim();
				if (newFileName && newFileName.length > 0) {
					oldfileName = newFileName;
				}
				if (ftpURL) {
					fileURI = ftpURL;
				}
				_self.app.appDB.onChangeUplaodStatus(M_InOutLine_ID,
						X_INSTRUCTIONLINE_ID, isMR, oldfileName, fileURI);
				var sucmsg = {
					'X_INSTRUCTIONLINE_ID' : X_INSTRUCTIONLINE_ID,
					'isMR' : isMR,
					'fileURI' : fileURI,
					'newFileName' : oldfileName
				};
				onSuccess(sucmsg);
			}, function(err) {
				var msg = _self.uploadFail(err);
				var ermsg = {
					'X_INSTRUCTIONLINE_ID' : X_INSTRUCTIONLINE_ID,
					'isMR' : isMR,
					'fileURI' : fileURI.split('/').pop(),
					'error' : msg
				};
				onError(ermsg);
			}, options);
}

FTPUtils.prototype.uploadFile = function(fileURI, M_InOutLine_ID,
		X_INSTRUCTIONLINE_ID, isMR, onError, onSuccess) {
	var _self = this;
	if (fileURI.startsWith("ftp")) {
		var fileName = fileURI.split('/').pop();
		_self.app.ftpClient.get(_self.app.appFS.vis_dir.fullPath + "/"
				+ fileName, fileURI, {}, function(result) {
			ftpURL = fileURI;
			fileURI = result[0].localPath;
			_self.upload(fileURI, M_InOutLine_ID, X_INSTRUCTIONLINE_ID, isMR,
					onError, onSuccess, ftpURL);
		}, function(msg) {
			var ermsg = {
				'X_INSTRUCTIONLINE_ID' : X_INSTRUCTIONLINE_ID,
				'isMR' : isMR,
				'fileURI' : fileURI.split('/').pop(),
				'error' : "File Not Found"
			};
			onError(ermsg);
		});
	} else {
		_self.upload(fileURI, M_InOutLine_ID, X_INSTRUCTIONLINE_ID, isMR,
				onError, onSuccess);
	}
}

FTPUtils.prototype.getSDPath = function(Fname) {
	var tmpArray = Fname.split('mnt/sdcard');
	return tmpArray.pop();
}

FTPUtils.prototype.getFileName = function(tmpFile) {
	var tmpArray = tmpFile.split('/');
	return tmpArray.pop();
}

FTPUtils.prototype.uploadFail = function(error) {
	var msg = '';
	switch (error.code) {
	case FileTransferError.FILE_NOT_FOUND_ERR:
		msg = 'FILE_NOT_FOUND_ERR';
		break;
	case FileTransferError.INVALID_URL_ERR:
		msg = 'INVALID_URL_ERR';
		break;
	case FileTransferError.CONNECTION_ERR:
		msg = 'CONNECTION_ERR';
		break;
	case FileTransferError.ABORT_ERR:
		msg = 'ABORT_ERR';
		break;
	default:
		msg = 'Unknown Error';
		break;
	}
	console.log("File-Transfer:Error - " + msg);
	return msg;
}