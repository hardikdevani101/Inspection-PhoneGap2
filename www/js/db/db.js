var DB = function(app) {
	console.log("DB constructor");
	this.app = app;
	this.dbstore = window.openDatabase("vision_db", "1.0", "vision_db",
			2 * 1024 * 1024);
}

DB.prototype.init = function(success, error) {
	var _self = this;
	console.log("DB init");
	var successCallback = _self.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = _self.errorCB;
	if (typeof (error) === "function") {
		errorCallback = error;
	}
	_self.dbstore
			.transaction(
					function(tx) {
//						 tx.executeSql('DROP TABLE IF EXISTS vis_gallery');
						// tx.executeSql('DROP TABLE IF EXISTS vis_setting');
						tx
								.executeSql('CREATE TABLE IF NOT EXISTS '
										+ ' vis_setting'
										+ ' (vis_url, vis_lang, vis_client_id, vis_role, vis_whouse_id, vis_ord_id, username,userid,userpwd, vis_img_qulty, is_login, app_version)');
						tx
								.executeSql('CREATE TABLE IF NOT EXISTS '
										+ ' vis_gallery '
										+ ' (mr_line,insp_line DEFAULT "0",in_out_id DEFAULT "0",name,file,imgUpload DEFAULT "F",imgAttach DEFAULT "F", dataSource DEFAULT "CMR")');

					}, _self.errorCallback, _self.successCallback);
}

DB.prototype.reloadDB = function() {
	var _self = this;
	_self.dbstore
			.transaction(
					function(tx) {
						tx.executeSql('DROP TABLE IF EXISTS vis_setting');
						tx
								.executeSql('CREATE TABLE IF NOT EXISTS '
										+ ' vis_setting'
										+ ' (vis_url, vis_lang, vis_client_id, vis_role, vis_whouse_id, vis_ord_id, username, vis_img_qulty, is_login, app_version)');
						tx.executeSql('DROP TABLE IF EXISTS vis_gallery');
						tx
								.executeSql('CREATE TABLE IF NOT EXISTS '
										+ ' vis_gallery '
										+ ' (mr_line,insp_line DEFAULT "0",in_out_id DEFAULT "0",name,file,imgUpload DEFAULT "F",imgAttach DEFAULT "F", dataSource DEFAULT "CMR")');

					}, _self.errorCB, _self.success);

}

DB.prototype.getTotalInspEntries = function(param, callBack) {
	var _self = this;
	_self.dbstore.transaction(function(tx) {
		var sql = 'select count(*) from vis_gallery where insp_line="'
				+ param.x_instructionline_id + '"';
		tx.executeSql(sql, [], function(tx, results) {
			callBack(param, results.rows.item(0)['count(*)']);
		}, _self.errorCB);
	}, _self.errorCB, _self.success);
}

DB.prototype.getUploadedInspEntries = function(param, callBack) {
	var _self = this;
	_self.dbstore.transaction(function(tx) {
		var sql = 'select count(*) from vis_gallery where insp_line="'
				+ param.x_instructionline_id + '" and imgUpload="T"';
		tx.executeSql(sql, [], function(tx, results) {
			callBack(param, results.rows.item(0)['count(*)']);
		}, _self.errorCB);
	}, _self.errorCB, _self.success);
}

DB.prototype.updateGalleryURIEntry = function(M_InOutLine_ID,
		X_INSTRUCTIONLINE_ID, M_INOUT_ID, fileName, fileFullPath, oldURI) {
	var _self = this;
	_self.dbstore.transaction(function(tx) {
		var sqlQuery;
		if (X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null) {
			sqlQuery = 'UPDATE vis_gallery SET name="' + fileName + '",file="'
					+ fileFullPath + '" WHERE file="' + oldURI
					+ '" and in_out_id="' + M_INOUT_ID + '"';
		} else {
			sqlQuery = 'UPDATE vis_gallery SET name="' + fileName + '",file="'
					+ fileFullPath + '" WHERE file="' + oldURI
					+ '" and insp_line="' + X_INSTRUCTIONLINE_ID + '"';
		}
		tx.executeSql(sqlQuery);
	}, _self.errorCB, _self.success);
}

DB.prototype.doGalleryEntry = function(fileInfo) {
	var _self = this;
	_self.dbstore.transaction(function(tx) {
		var param = [];
		var sqlQuery = " select * from vis_gallery ";
		var whereSQL = " where file=?";
		param.push(fileInfo.oldURI);
		if (fileInfo.inspID == null || fileInfo.inspID == 0) {
			whereSQL += " and insp_line=?";
			param.push(fileInfo.inspID);
		} else {
			whereSQL += " and in_out_id=?";
			param.push(fileInfo.mrID);
		}
		tx.executeSql(sqlQuery + whereSQL, param, function(tx, results) {
			if (results.rows.length > 0) {
				sqlQuery = 'UPDATE vis_gallery SET name="' + fileInfo.fileName
						+ '",file="' + fileInfo.filePath + '" ';
				tx.executeSql(sqlQuery + whereSQL, param);
			} else {
				sqlQuery = 'INSERT INTO vis_gallery '
						+ ' (mr_line,in_out_id,insp_line,name,file)'
						+ ' VALUES ("' + fileInfo.mrLineID + '","'
						+ fileInfo.mrID + '","' + fileInfo.inspID + '","'
						+ fileInfo.fileName + '","' + fileInfo.filePath
						+ '")';
				tx.executeSql(sqlQuery);
			}
		}, _self.errorCB);
	}, _self.errorCB, _self.success);
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
						tx.executeSql(sqlQuery, [], function(tx, results) {
							if (!results.rowsAffected) {
								console.log('No rows affected!');
								return false;
							}
						}, function() {

						});
					}, _self.errorCB);
}

DB.prototype.onAttachSucess = function(param) {
	var _self = this;
	var sql = '';
	if (param.failer.length > 0) {
		if (param.success.length > 0) {
			sql = 'UPDATE vis_gallery SET imgAttach="T" WHERE name in (';
			for (var i = 0; i < param.success; i++) {
				sql = sql + '"' + param.success[i] + '",';
			}
			sql = sql.substring(0, sql.length - 1) + ') and ';
			if (param.type == 0) {
				sql = ' in_out_id = "' + param.id + '"';
			} else {
				sql = 'insp_line = "' + param.id + '"';
			}
		}
		alert(param.failer.toString());
	} else {
		if (param.type == 1) {
			sql = 'UPDATE vis_gallery SET imgAttach="T" WHERE insp_line="'
					+ param.id + '"';
		} else {
			sql = 'UPDATE vis_gallery SET imgAttach="T" WHERE in_out_id="'
					+ param.id + '"';
		}
	}
	_self.dbstore.transaction(function(tx) {
		tx.executeSql(sql);
		tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="'
				+ app.appCache.session.m_inoutline_id
				+ '" and (imgUpload="F" or imgAttach="F")', [], function(tx,
				results) {
			if (results.rows.length <= 0) {
				alert("All Files Attached");
			}
		}, _self.errorCB);
	});
}

DB.prototype.onChangeUplaodStatus = function(M_InOutLine_ID,
		X_INSTRUCTIONLINE_ID, M_INOUT_ID, fileName, fileFullPath) {
	var _self = this;
	_self.dbstore.transaction(function(tx) {
		var sqlQuery;

		if (X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null) {
			sqlQuery = 'UPDATE vis_gallery SET imgUpload="T",name="' + fileName
					+ '" WHERE file="' + fileFullPath + '" and in_out_id="'
					+ M_INOUT_ID + '"';
		} else {
			sqlQuery = 'UPDATE vis_gallery SET imgUpload="T",name="' + fileName
					+ '" WHERE file="' + fileFullPath + '" and insp_line="'
					+ X_INSTRUCTIONLINE_ID + '"';
		}
		tx.executeSql(sqlQuery);
	}, _self.errorCB, _self.success);
}

DB.prototype.getUploadFailedEntry = function(sucess) {
	var _self = this;
	_self.dbstore.transaction(function(tx) {
		var sqlQuery;
		sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
				+ _self.app.appCache.session.m_inoutline_id
				+ '" and imgUpload="F"';
		tx.executeSql(sqlQuery, [], sucess, _self.errorCB);
	}, _self.errorCB);
}

DB.prototype.getAttachPendingEntry = function(sucess) {
	var _self = this;
	_self.dbstore.transaction(function(tx) {
		var sqlQuery;
		sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
				+ _self.app.appCache.session.m_inoutline_id
				+ '" and imgUpload="T" and imgAttach="F"';
		tx.executeSql(sqlQuery, [], sucess, _self.errorCB);
	}, _self.errorCB);
}

DB.prototype.errorCB = function(err) {
	console.log("Error processing SQL: " + err.code);
}

DB.prototype.success = function(tx, results) {
	console.log("Success processing SQL");
}
