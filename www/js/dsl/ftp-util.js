var FTPUtils = function(app) {
	this.app = app;
}

FTPUtils.prototype.init = function() {

}

FTPUtils.prototype.uploadFile = function(fnEntries) {
	var _self = this;
	var ft = new FileTransfer();
	var options = new FileUploadOptions();
	options.fileKey = "file";
	options.fileName = fnEntries.name;
	ft
			.upload(
					fnEntries.toURL(),
					encodeURI(_self.app.appCache.settingInfo.service_url
							+ "/VISService/fileUpload"),
					function(result) {
						var xmlResponse = result.response;
						var newFileName = $(xmlResponse).find('newName').text()
								.trim();

						var M_InOutLine_ID = _self.app.appCache.session.m_inoutline_id;
						var X_INSTRUCTIONLINE_ID = _self.app.appCache.session.x_instructionline_id;
						var M_INOUT_ID = _self.app.appCache.session.M_INOUT_ID;

						_self.app.appDB.updateFileNameGalleryEntry(
								M_InOutLine_ID, X_INSTRUCTIONLINE_ID,
								M_INOUT_ID, newFileName, fnEntries.fullPath);
					}, _self.uploadFail, options);
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
	switch (e.code) {
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
	;
	console.log("File-Transfer:Error - " + msg);
}