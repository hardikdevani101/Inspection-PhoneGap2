var DB = function(app) {
	console.log("DB constructor");
	this.app = app;
	this.dbstore = window.openDatabase("vis_inspection", "1.0",
			"vis_inspection", 2 * 1024 * 1024);
}

DB.prototype.init = function(success, error) {
	var _self = this;
	console.log("DB init");
	var successCallback = _self.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = _self.error;
	if (typeof (error) === "function") {
		errorCallback = error;
	}
	_self.dbstore
			.transaction(
					function(tx) {
						// tx.executeSql('DROP TABLE IF EXISTS vis_gallery');
						tx
								.executeSql('CREATE TABLE IF NOT EXISTS '
										+ ' vis_setting'
										+ ' (vis_url, vis_lang, vis_client_id, vis_role, vis_whouse_id, vis_ord_id, username, vis_img_qulty)');
						tx
								.executeSql('CREATE TABLE IF NOT EXISTS '
										+ ' vis_gallery '
										+ ' (mr_line,insp_line DEFAULT "0",in_out_id DEFAULT "0",name,file,imgUpload DEFAULT "F",imgAttach DEFAULT "F")');
					}, _self.successCallback, _self.errorCallback);
}

DB.prototype.addGalleryEntry = function(M_InOutLine_ID, X_INSTRUCTIONLINE_ID,
		M_INOUT_ID, fileName, fileFullPath) {
	var _self = this;
	_self.dbstore
			.transaction(
					function(tx) {
						var sqlQuery;
						if (X_INSTRUCTIONLINE_ID == 0
								|| X_INSTRUCTIONLINE_ID == null) {
							sqlQuery = 'INSERT INTO vis_gallery(mr_line,in_out_id,name,file) VALUES ("'
									+ M_InOutLine_ID
									+ '","'
									+ M_INOUT_ID
									+ '","'
									+ fileName
									+ '","'
									+ fileFullPath
									+ '")';
						} else {
							sqlQuery = 'INSERT INTO vis_gallery(mr_line,insp_line,name,file) VALUES ("'
									+ M_InOutLine_ID
									+ '","'
									+ X_INSTRUCTIONLINE_ID
									+ '","'
									+ fileName
									+ '","' + fileFullPath + '")';
						}
						tx.executeSql(sqlQuery);
					}, _self.errorCB);
}

DB.prototype.updateFileNameGalleryEntry = function(M_InOutLine_ID,
		X_INSTRUCTIONLINE_ID, M_INOUT_ID, fileName, fileFullPath) {
	var _self = this;
	_self.dbstore.transaction(function(tx) {
		var sqlQuery;

		if (X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null) {
			sqlQuery = 'UPDATE vis_gallery SET imgUpload="T",name="'
					+ fileName + '" WHERE file="' + filePath
					+ '" and in_out_id="' + InspNumber + '"';
		} else {
			sqlQuery = 'UPDATE vis_gallery SET imgUpload="T",name="'
					+ fileName + '" WHERE file="' + filePath
					+ '" and insp_line="' + InspNumber + '"';
		}

		tx.executeSql(sqlQuery);
	}, _self.errorCB, function() {
		/*
		 * setUploadedImg(fnEntries.name); imgUploadCount = imgUploadCount - 1;
		 * if (callBack && imgUploadCount == 0) callBack();
		 */
	});
}

DB.prototype.errorCB = function(err) {
	console.log("Error processing SQL: " + err.code);
}

DB.prototype.success = function(tx, results) {
	console.log("Success processing SQL - TX: " + tx);
	console.log("Success processing SQL: " + results);
}
