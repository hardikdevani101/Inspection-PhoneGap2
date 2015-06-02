var DB = function(app) {
	console.log("DB constructor");
	this.app = app;
	this.currentDBVersion = "1.1"
	this.dbstore = window.openDatabase("vision_db3", "", "vision_db3",
			2 * 1024 * 1024);
}

DB.prototype.init = function(success, error) {
	var _self = this;
	var successCallback = _self.success;
	if (typeof (success) === "function") {
		successCallback = success;
	}
	var errorCallback = _self.errorCB;
	if (typeof (error) === "function") {
		errorCallback = error;
	}
	console.log("DB Initialize with version >>> " + _self.dbstore.version);

	_self.dbstore
			.transaction(
					function(tx) {
						// if (_self.dbstore.version == "") {
						// tx.executeSql('DROP TABLE IF EXISTS
						// vis_gallery');
						// tx.executeSql('DROP TABLE IF EXISTS
						// vis_setting');
						tx
								.executeSql('CREATE TABLE IF NOT EXISTS '
										+ ' vis_setting'
										+ ' (vis_url, vis_lang, vis_client_id, vis_role, vis_whouse_id, vis_ord_id, username,userid,userpwd, vis_img_qulty, is_login, app_version,img_editor DEFAULT "Vision")');
						tx
								.executeSql('CREATE TABLE IF NOT EXISTS '
										+ ' vis_gallery '
										+ ' (mr_line,insp_line DEFAULT "0",isMR DEFAULT "N",name,file,imgUpload DEFAULT "F",imgAttach DEFAULT "F", dataSource DEFAULT "CMR",imgEdited DEFAULT "F")');
						tx
								.executeSql('CREATE TABLE IF NOT EXISTS '
										+ ' vis_server '
										+ ' (rid, name , url , isFTP , user , password , isSelected DEFAULT "F")');
						_self.dbstore.changeVersion(_self.dbstore.version,
								"1.0", function(tx) {
								}, function(error) {
									console.log('Version Update Error >>> '
											+ error)
								});
						// }
					}, _self.errorCallback, function() {

						_self.dbstore.transaction(_self.loadFTPEntry,
								_self.errorCB);

						// if (_self.dbstore.version == "1.0") {
						// _self.dbstore
						// .changeVersion(
						// _self.dbstore.version,
						// "1.1",
						// function(tx) {
						// tx
						// .executeSql(
						// 'ALTER TABLE vis_setting ADD COLUMN img_editor
						// DEFAULT "Vision"',
						// [],
						// function() {
						// alert('change done');
						// },
						// function() {
						// alert('Error');
						// });
						//
						// alert('change done');
						// },
						// function(error) {
						// if (error.code == 5) {
						// // _self.dbstore
						// // .transaction(function(tx)
						// // {
						// // tx
						// // .executeSql('UPDATE
						// // vis_setting SET
						// // img_editor="Vision"');
						// // });
						// }
						// alert('DB Version Update Error : 1.1>>> '
						// + error.message
						// + "Error Code : "
						// + error.code);
						// console
						// .log('DB Version Update Error : 1.1>>> '
						// + error.message)
						// });
						// }
						successCallback();
					});
}

DB.prototype.loadFTPEntry = function(tx) {
	var _self = this;
	tx
			.executeSql(
					'select * from vis_server',
					[],
					function(tx, results) {
						if (results.rows.length == 0) {
							_self.app.appCache.ftpServers.push({
								name : "FE VISD",
								url : "http://10.210.23.176:8088",
								isFTP : "F"
							});
							_self.app.appCache.ftpServers.push({
								name : "Production",
								url : "http://10.210.23.77:8088",
								isFTP : "F"
							});
							_self.app.appCache.ftpServers.push({
								name : "Development",
								url : "http://10.210.23.78:8088",
								isFTP : "F"
							});
							_self.app.appCache.ftpServers.push({
								name : "Test",
								url : "http://10.210.23.97:8088",
								isFTP : "F"
							});
							_self.app.appCache.ftpServers.push({
								name : "Logilite-Dev",
								url : "http://203.88.138.222:8384",
								isFTP : "F"
							});
							tx
									.executeSql('insert into vis_server (name , url , isFTP) '
											+ ' values ("FE VISD","http://10.210.23.176:8088","F")');
							tx
									.executeSql('insert into vis_server (name , url , isFTP)'
											+ ' values ("Production","http://10.210.23.77:8088","F")');
							tx
									.executeSql('insert into vis_server (name , url , isFTP)'
											+ ' values ("Development","http://10.210.23.78:8088","F")');
							tx
									.executeSql('insert into vis_server (name , url , isFTP)'
											+ ' values ("Test","http://10.210.23.97:8088","F")');
							tx
									.executeSql('insert into vis_server (name , url , isFTP)'
											+ ' values ("Logilite-Dev","http://203.88.138.222:8384","F")');
						} else {
							for (var j = 0; j < results.rows.length; j++) {
								result = 0
								rowitem = results.rows.item(j);
								result = jQuery.grep(
										_self.app.appCache.ftpServers,
										function(item, index) {
											return item.url == rowitem.url;
										});
								if (!result.length > 0) {
									_self.app.appCache.ftpServers.push(rowitem);
								}

							}
						}
						_self.app.settingnview.renderServer();
					}, _self.errorCB);
}

DB.prototype.createFTPEntry = function() {
	var _self = this;
	_self.dbstore.transaction(function(tx) {
		tx.executeSql('select * from vis_server', [], function(tx, results) {
			for (var i = 0; i < _self.app.appCache.ftpServers.length; i++) {
				ftpItem = _self.app.appCache.ftpServers[i];
				found = false;
				for (var j = 0; j < results.rows.length; j++) {
					item = results.rows.item(j);
					if (ftpItem.url == item.url) {
						found = true;
						break;
					}
				}
				if (!found) {
					tx.executeSql('insert into vis_server '
							+ ' (rid , name , url , isFTP , user , password)'
							+ ' values ("' + ftpItem.rid + '","' + ftpItem.name
							+ '","' + ftpItem.url + '","' + ftpItem.isFTP
							+ '","' + ftpItem.user + '","' + ftpItem.password
							+ '")');
				}
			}
		}, _self.errorCB);
	}, _self.errorCB);
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

DB.prototype.doGalleryEntry = function(fileInfo) {
	var _self = this;
	var param = [];
	var sqlQuery = " select * from vis_gallery ";
	var whereSQL = ' where file="' + fileInfo.oldURI + '"';
	;
	param.push(fileInfo.oldURI);
	if (fileInfo.isMR == "N") {
		whereSQL += ' and isMR="N" and insp_line="' + fileInfo.inspID + '"';
		param.push(fileInfo.inspID);
	} else {
		whereSQL += ' and isMR="Y" and insp_line="' + fileInfo.inspID + '"';
		param.push(fileInfo.inspID);
	}

	_self.dbstore.transaction(function(tx) {
		tx.executeSql(sqlQuery + whereSQL, [], function(tx, results) {
			if (results.rows.length > 0) {
				sqlQuery = 'UPDATE vis_gallery SET name="' + fileInfo.fileName
						+ '",file="' + fileInfo.filePath + '",imgEdited="T" ';
				tx.executeSql(sqlQuery + whereSQL, []);
			} else {
				sqlQuery = 'INSERT INTO vis_gallery '
						+ ' (mr_line,isMR,insp_line,name,file,imgEdited)'
						+ ' VALUES ("' + fileInfo.mrLineID + '","'
						+ fileInfo.isMR + '","' + fileInfo.inspID + '","'
						+ fileInfo.fileName + '","' + fileInfo.filePath + '","'
						+ fileInfo.imgEdited + '")';
				tx.executeSql(sqlQuery);
			}
		}, _self.errorCB);
	}, _self.errorCB, _self.success);
}

DB.prototype.addGalleryEntry = function(M_InOutLine_ID, X_INSTRUCTIONLINE_ID,
		isMR, fileName, fileFullPath) {
	var _self = this;

	_self.dbstore
			.transaction(
					function(tx) {
						var sqlQuery = 'INSERT INTO vis_gallery(mr_line,insp_line,isMR,name,file) VALUES ("'
								+ M_InOutLine_ID
								+ '","'
								+ X_INSTRUCTIONLINE_ID
								+ '","'
								+ isMR
								+ '","'
								+ fileName
								+ '","'
								+ fileFullPath + '")';
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
	var fsql = '';
	if (param.failer.length > 0) {
		if (param.success && param.success.length > 0) {
			sql = 'UPDATE vis_gallery SET imgAttach="T" WHERE name in (';
			for (var i = 0; i < param.success.length; i++) {
				sql += '"' + param.success[i] + '",';
			}
			sql = sql.substring(0, sql.length - 1) + ') and ';
			if (param.type == 0) {
				sql += ' isMR ="Y" and insp_line = "' + param.id + '"';
			} else {
				sql += ' isMR ="N" and insp_line = "' + param.id + '"';
			}
		}
		if (param.failer && param.failer.length > 0) {
			fsql = 'UPDATE vis_gallery SET imgAttach="F",imgUpload="F" WHERE name in (';
			for (var i = 0; i < param.failer.length; i++) {
				fsql += '"' + param.failer[i].split('::')[0] + '",';
			}
			fsql = fsql.substring(0, fsql.length - 1) + ') and ';
			if (param.type == 0) {
				fsql += ' isMR ="Y" and insp_line = "' + param.id + '"';
			} else {
				fsql += ' isMR ="N" and insp_line = "' + param.id + '"';
			}
		}
	} else {
		if (param.type == 1) {
			sql = 'UPDATE vis_gallery SET imgAttach="T" WHERE insp_line="'
					+ param.id + '" and isMR="N"';
		} else {
			sql = 'UPDATE vis_gallery SET imgAttach="T" WHERE insp_line="'
					+ param.id + '" and isMR="Y"';
		}
	}
	_self.dbstore.transaction(function(tx) {
		if (sql.length > 0) {
			tx.executeSql(sql);
			if (_self.app.galleryview) {
				_self.app.galleryview.inspFiles = {};
			}
		}
		if (fsql.length > 0) {
			tx.executeSql(fsql);
		}
	});
}

DB.prototype.onChangeUplaodStatus = function(M_InOutLine_ID,
		X_INSTRUCTIONLINE_ID, isMR, fileName, fileFullPath) {
	var _self = this;
	_self.dbstore.transaction(function(tx) {
		var sqlQuery = 'UPDATE vis_gallery SET imgUpload="T"';
		if (fileName.length > 0) {
			sqlQuery += ',name="' + fileName + '"';
		}

		if (isMR == "Y") {
			sqlQuery += ' WHERE file="' + fileFullPath
					+ '" and isMR="Y" and insp_line="' + X_INSTRUCTIONLINE_ID
					+ '"';
		} else {
			sqlQuery += ' WHERE file="' + fileFullPath
					+ '" and isMR="N" and insp_line="' + X_INSTRUCTIONLINE_ID
					+ '"';
		}
		tx.executeSql(sqlQuery);
		if (_self.app.galleryview) {
			_self.app.galleryview.inspFiles[X_INSTRUCTIONLINE_ID] = [];
		}
	}, _self.errorCB, _self.success);
}

DB.prototype.getNotEditableFiles = function(sucess) {
	var _self = this;
	_self.dbstore.transaction(function(tx) {
		var sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
				+ _self.app.appCache.session.m_inoutline_id
				+ '" and imgEdited="F"';
		tx.executeSql(sqlQuery, [], sucess, _self.errorCB);
	}, _self.errorCB);
}

DB.prototype.getUploadFailedEntry = function(sucess) {
	var _self = this;
	_self.dbstore.transaction(function(tx) {
		var sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
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
