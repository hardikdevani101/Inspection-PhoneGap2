Tbl_VISGallery = function(app) {
	this.app = app;
	this.appDB = app.appDB;
	this.imagelistarray = [];
}

Tbl_VISGallery.prototype.addFile = function(fileInfo, success, error) {
	var successCallback = this.appDB.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.errorCB;
	if (typeof (error) === "function") {
		errorCallback = error;
	}
	this.appDB.dbstore
			.transaction(
					function(tx) {
						var sqlQuery;
						if (fileInfo.X_INSTRUCTIONLINE_ID == 0
								|| fileInfo.X_INSTRUCTIONLINE_ID == null)
							sqlQuery = 'INSERT INTO vis_gallery(mr_line,in_out_id,name,file) VALUES ("'
									+ fileInfo.M_InOutLine_ID
									+ '","'
									+ fileInfo.M_INOUT_ID
									+ '","'
									+ fileInfo.fileName
									+ '","'
									+ fileInfo.fileFullPath + '")';
						else
							sqlQuery = 'INSERT INTO vis_gallery(mr_line,insp_line,name,file) VALUES ("'
									+ fileInfo.M_InOutLine_ID
									+ '","'
									+ fileInfo.X_INSTRUCTIONLINE_ID
									+ '","'
									+ fileInfo.fileName
									+ '","'
									+ fileInfo.fileFullPath + '")';
						tx.executeSql(sqlQuery, [], sucessCallback,
								errorCallback);
					}, errorCallback);

}

Tbl_VISGallery.prototype.getFilesByMRInfo = function(fileInfo, sucsses, error) {
	var successCallback = this.appDB.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.errorCB;
	if (typeof (error) === "function") {
		errorCallback = error;
	}
	var sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
			+ fileinfo.M_InOutLine_ID + '" and insp_line="'
			+ fileinfo.X_INSTRUCTIONLINE_ID + '"';
	console.log("DB query " + sqlQuery);

	this.appDB.dbstore.transaction(function(tx) {
		tx.executeSql(sqlQuery, [], successCallback, errorCallback);
	}, errorCallback);
}

Tbl_VISGallery.prototype.getFilesByInspInfo = function(fileInfo, success, error) {
	var successCallback = this.appDB.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.errorCB;
	if (typeof (error) === "function") {
		errorCallback = error;
	}
	this.appDB.dbstore.transaction(function(tx) {
		sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
				+ fileInfo.M_InOutLine_ID + '" and insp_line="'
				+ fileInfo.X_INSTRUCTIONLINE_ID + '"';
		tx.executeSql(sqlQuery, [], successCallback, errorCallback);
	}, errorCallback);
}

Tbl_VISGallery.prototype.addFileInfo = function(fileInfo, success, error) {
	var successCallback = this.appDB.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.errorCB;
	if (typeof (error) === "function") {
		errorCallback = error;
	}
	if (!fileInfo.dataSource) {
		fileInfo['dataSource'] = "CMR";
	}
	this.appDB.dbstore.transaction(function(tx) {
		var sqlQuery = 'INSERT INTO vis_gallery'
				+ ' (mr_line,in_out_id,insp_line,name,file,dataSource)'
				+ ' VALUES ("' + fileInfo.mrLineID + '","' + fileInfo.mrID
				+ '","' + fileInfo.inspID + '","' + fileInfo.fileName + '","'
				+ fileInfo.filePath + '","' + fileInfo.dataSource + '")';
		console.log(sqlQuery);
		tx.executeSql(sqlQuery, [], successCallback, errorCallback);
	});
}

Tbl_VISGallery.prototype.deleteFileInfo = function(fileInfo, success, error) {
	var successCallback = this.appDB.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.errorCB;
	if (typeof (error) === "function") {
		errorCallback = error;
	}
	if (!fileInfo.dataSource) {
		fileInfo.dataSource = "CMR";
	}
	this.appDB.dbstore.transaction(function(tx) {
		var sqlQuery = 'Delete From vis_gallery where file="'
				+ fileInfo.fileFullPath + '"';
		console.log(fileInfo.inspID);
		if (fileInfo.inspID == null || fileInfo.inspID == 0) {
			sqlQuery += ' and in_out_id="' + fileInfo.mrID + '"';
		} else {
			sqlQuery += ' and insp_line="' + fileInfo.inspID + '"';
		}
		console.log(sqlQuery);
		tx.executeSql(sqlQuery, [], successCallback, errorCallback);
	});
}

Tbl_VISGallery.prototype.getFilesToBeDeleted = function(fileInfo, success,
		error) {
	var successCallback = this.appDB.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.errorCB;
	if (typeof (error) === "function") {
		errorCallback = error;
	}

	this.appDB.dbstore.transaction(getFilesAttachedF, errorCallback);

	var getFilesAttachedF = function(tx) {
		tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="'
				+ fileInfo.M_InOutLine_ID + '" and imgAttach="F"', [],
				getFilesAttachedT, errorCallback);
	}
	var getFilesAttachedT = function(tx, result) {
		if (result.rows.length > 0) {
			navigator.notification.alert('Files attach not Finished',
					function() {
					}, 'Failure', 'OK');
		} else {
			tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="'
					+ fileInfo.M_InOutLine_ID + '" and imgAttach="T"', [],
					successCallback, errorCallback);
		}
	}
}

// TODO - This need to be moved to appropriate view file.
Tbl_VISGallery.prototype.onFileExplorerClick = function(entry) {
	var fileFullPath = getSDPath(entry).substring(1);
	var fileName = getFileName(fileFullPath);
	if (DataTypes
			.indexOf(getExtention(getFileName(fileFullPath)).toUpperCase()) > -1) {
		navigator.notification.activityStart("Please Wait", "loading...");
		root.getFile(fileFullPath, null, onImgFileSystem, function(error) {
			console.log(" FSError = " + error.code);
		});
	} else {
		dbf.onDirectFileUpload(fileFullPath, fileName);
	}
}

Tbl_VISGallery.prototype.discardGallery = function(fileInfo, success, error) {
	var successCallback = this.appDB.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.errorCB;
	if (typeof (error) === "function") {
		errorCallback = error;
	}

	this.getFilesByMR(fileInfo, deleteFiles, errorCallback);

	var deleteFiles = function(tx, results) {
		var inCls = [];
		for (var i = 0; i < size; i++) {
			inCls.push(results.rows.item(i).id);
		}
		var sqlQuery = "Delete From vis_gallery where id in (" + inCls + ")=";// TODO
		// Written;
		tx.executeSql(sqlQuery, [], function(tx, results) {
		}, errorCallback);
	}
}

Tbl_VISGallery.prototype.getFilesByMR = function(fileInfo, success, error) {
	var successCallback = this.appDB.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.errorCB;
	if (typeof (error) === "function") {
		errorCallback = error;
	}
	this.appDB.dbstore.transaction(function(tx) {
		var sqlQuery;
		if (fileInfo.X_INSTRUCTIONLINE_ID == 0
				|| fileInfo.X_INSTRUCTIONLINE_ID == null)
			sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
					+ M_InOutLine_ID + '" and in_out_id="' + M_INOUT_ID + '"';
		else
			sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
					+ fileInfo.M_InOutLine_ID + '" and insp_line="'
					+ fileInfo.X_INSTRUCTIONLINE_ID + '"';

		tx.executeSql(sqlQuery, [], successCallback, errorCallback);
	}, errorCallback);
}

Tbl_VISGallery.prototype.getUploadCounts = function(fileInfo, success, error) {
	var successCallback = this.appDB.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.errorCB;
	if (typeof (error) === "function") {
		errorCallback = error;
	}
	this.appDB.dbstore.transaction(function(tx) {
		var sqlQuery;
		if (fileInfo.isInsp == 0)
			sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
					+ fileInfo.mInNumber + '" and in_out_id="'
					+ fileInfo.InspNumber + '"';
		else
			sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
					+ fileInfo.mInNumber + '" and insp_line="'
					+ fileInfo.InspNumber + '"';
		tx.executeSql(sqlQuery, [], function(tx, results) {
			var totImg = results.rows.length;
			if (fileInfo.isInsp == 0)
				sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
						+ fileInfo.mInNumber + '" and in_out_id="'
						+ fileInfo.InspNumber + '" and imgUpload="T"';
			else
				sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
						+ fileInfo.mInNumber + '" and insp_line="'
						+ fileInfo.InspNumber + '" and imgUpload="T"';
			tx.executeSql(sqlQuery, [], function(tx, results) {
				var totImgUpload = results.rows.length;
				successCallback(fileInfo, totImgUpload);
			}, errorCallback);
		}, errorCallback);
	}, errorCallback);
}

Tbl_VISGallery.prototype.updateFileOnSuccess = function(fileInfo, success,
		error) {
	var successCallback = this.appDB.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.errorCB;
	if (typeof (error) === "function") {
		errorCallback = error;
	}

	this.appDB.dbstore.transaction(updateFileinfo, successCallback,
			errorCallback);

	var updateFileinfo = function(tx) {
		var sqlQuery;
		if (fileInfo.isInsp == 0) {
			sqlQuery = 'UPDATE vis_gallery SET imgAttach="T",imgUpload="T" WHERE name="'
					+ fileInfo.fileName
					+ '" and in_out_id="'
					+ imginspline
					+ '"';
		} else {
			sqlQuery = 'UPDATE vis_gallery SET imgAttach="T",imgUpload="T" WHERE name="'
					+ fileInfo.fileName
					+ '" and insp_line="'
					+ fileInfo.imginspline + '"';
		}
		tx.executeSql(sqlQuery);
	}
}

Tbl_VISGallery.prototype.removeOtherFiles = function(fileInfo, success, error) {
	var successCallback = this.appDB.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.errorCB;
	if (typeof (error) === "function") {
		errorCallback = error;
	}

	this.appDB.dbstore.transaction(
			function(tx) {
				var sqlQuery;
				if (fileInfo.X_INSTRUCTIONLINE_ID == 0
						|| fileInfo.X_INSTRUCTIONLINE_ID == null)
					sqlQuery = 'DELETE FROM vis_gallery WHERE file="'
							+ fileInfo.tempfile + '" and in_out_id="'
							+ fileInfo.M_INOUT_ID + '"';
				else
					sqlQuery = 'DELETE FROM vis_gallery WHERE file="' + tmpfile
							+ '" and insp_line="'
							+ fileInfo.X_INSTRUCTIONLINE_ID + '"';
				tx.executeSql(sqlQuery, errorCallback);
			}, successCallback, errorCallback);
}

Tbl_VISGallery.prototype.updateFileOnUploadFailure = function(fileInfo,
		success, error) {
	var successCallback = this.appDB.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.errorCB;
	if (typeof (error) === "function") {
		errorCallback = error;
	}
	this.appDB.dbstore
			.transaction(
					function(tx) {
						var sqlQuery;
						sqlQuery = 'UPDATE vis_gallery SET imgUpload="F",imgAttach="F" WHERE name="'
								+ fileInfo.name
								+ '" and in_out_id="'
								+ fileInfo.imginspline + '"';
						tx.executeSql(sqlQuery);
					}, errorCallback);
}
