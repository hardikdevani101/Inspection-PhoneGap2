var DB = function() {
	this.db = null;
	this.imagelistarray = null;
}

var dbf = new DB()
{

}

DB.prototype.init = function() {

}

DB.prototype.settingDbSetup = function(tx) {
	// tx.executeSql('DROP TABLE IF EXISTS vis_gallery');
	tx
			.executeSql('CREATE TABLE IF NOT EXISTS vis_setting'
					+ '(vis_url,vis_lang,vis_client_id,vis_role,vis_whouse_id,vis_ord_id,username,vis_img_qulty)');
	tx
			.executeSql('CREATE TABLE IF NOT EXISTS '
					+ 'vis_gallery(mr_line,insp_line DEFAULT "0",in_out_id DEFAULT "0",name,file,imgUpload DEFAULT "F",imgAttach DEFAULT "F")');
}

// db process
DB.prototype.errorCB = function(err) {
	console.log("Error processing SQL: " + err.code);
}

DB.prototype.loadSetting = function() {
	db.transaction(dbf.selectSettings, dbf.errorCB);
}

DB.prototype.selectSettings = function(tx) {
	tx.executeSql('SELECT * FROM vis_setting', [], dbf.settingSelectSuccess,
			dbf.errorCB);
}

DB.prototype.updateSettings = function(tx) {
	tx.executeSql('UPDATE vis_setting SET vis_url = "' + setting.vis_url
			+ '" ,vis_lang ="' + setting.vis_lang + '",vis_client_id ="'
			+ setting.vis_client_id + '",vis_role ="' + setting.vis_role + '",vis_whouse_id ="'
			+ setting.vis_whouse_id + '",vis_ord_id ="' + setting.vis_org_id
			+ '",vis_img_qulty ="' + setting.vis_img_qulty + '"');
	dbf.loadSetting();
}

DB.prototype.settingSelectSuccess = function(tx, results) {
	var len = results.rows.length;
	if (len < 1) {
		tx
				.executeSql('INSERT INTO vis_setting (vis_url,vis_lang,vis_client_id,vis_role,vis_whouse_id,vis_ord_id,vis_img_qulty) '
						+ 'VALUES ("http://192.168.0.121:8088","en_US","1000000", "1000000","0","0","75")');
		dbf.loadSetting();
	} else {
		for ( var i = 0; i < len; i++) {
			setting.vis_url = results.rows.item(i).vis_url;
			setting.vis_role = results.rows.item(i).vis_role;
			setting.vis_lang = results.rows.item(i).vis_lang;
			setting.vis_client_id = results.rows.item(i).vis_client_id;
			setting.vis_whouse_id = results.rows.item(i).vis_whouse_id;
			setting.vis_org_id = results.rows.item(i).vis_ord_id;
			setting.userName = results.rows.item(i).username;
			setting.vis_img_qulty = results.rows.item(i).vis_img_qulty;
			if (setting.userName == 'undefined') {
				setting.userName = '';
			}
		}
		if (app.pageState == 0) {
			app.loadPage("login");
		}
	}
}

DB.prototype.onFileExplorerClick = function(entry) {
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

DB.prototype.onDirectFileUpload = function(fileFullPath, fileName) {
	db
			.transaction(
					function(tx) {
						var sqlQuery;
						if (X_INSTRUCTIONLINE_ID == 0
								|| X_INSTRUCTIONLINE_ID == null)
							sqlQuery = 'INSERT INTO vis_gallery(mr_line,in_out_id,name,file) VALUES ("'
									+ M_InOutLine_ID
									+ '","'
									+ M_INOUT_ID
									+ '","'
									+ fileName
									+ '","'
									+ fileFullPath
									+ '")';
						else
							sqlQuery = 'INSERT INTO vis_gallery(mr_line,insp_line,name,file) VALUES ("'
									+ M_InOutLine_ID
									+ '","'
									+ X_INSTRUCTIONLINE_ID
									+ '","'
									+ fileName
									+ '","' + fileFullPath + '")';
						tx.executeSql(sqlQuery);
					}, dbf.errorCB);
	imgUploadCount = 1;
	onAfterSaveFile(fileFullPath, backToGallery);
}

DB.prototype.deleteMRgallery = function() {
	db.transaction(deleteimagelist, dbf.errorCB);

	function deleteimagelist(tx) {
		tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="'
				+ M_InOutLine_ID + '" and imgAttach="F"', [],
				deleteimageSelect, dbf.errorCB);
	}

	function deleteimageSelect(tx, result) {
		if (result.rows.length > 0) {
			navigator.notification.alert('Files attach not Finished',
					function() {
					}, 'Failure', 'OK');
		} else {
			tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="'
					+ M_InOutLine_ID + '" and imgAttach="T"', [],
					deleteImageSelectSuccess, dbf.errorCB);
		}
	}
}

DB.prototype.DiscardGallery = function(buttonIndex) {
	if (buttonIndex == 1) {
		db.transaction(function(tx) {
			var sqlQuery;
			if (X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null)
				sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
						+ M_InOutLine_ID + '" and in_out_id="' + M_INOUT_ID
						+ '"';
			else
				sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
						+ M_InOutLine_ID + '" and insp_line="'
						+ X_INSTRUCTIONLINE_ID + '"';
			tx.executeSql(sqlQuery, [], function(tx, results) {
				imagelistarray = results;
				deleteSelectedGallery();
			}, dbf.errorCB);
		}, errorCB);
	}
}

DB.prototype.onDeleteGalleryPage = function() {
	navigator.notification.activityStart("Please Wait", "loading...");
	SelectedGalleryList = [];
	db.transaction(function(tx) {
		var sqlQuery;
		if (X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null)
			sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
					+ M_InOutLine_ID + '" and in_out_id="' + M_INOUT_ID + '"';
		else
			sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
					+ M_InOutLine_ID + '" and insp_line="'
					+ X_INSTRUCTIONLINE_ID + '"';
		tx.executeSql(sqlQuery, [], function(tx, results) {
			imagelistarray = results;
			fillGalleryForDelete();
		}, dbf.errorCB);
	}, errorCB);
	document.getElementById("disp-selGal").innerHTML = "";
}

DB.prototype.getUploadCounts = function(mInNumber, dlab, InspNumber, callBack,
		isInsp) {
	db.transaction(function(tx) {
		var sqlQuery;
		if (isInsp == 0)
			sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="' + mInNumber
					+ '" and in_out_id="' + InspNumber + '"';
		else
			sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="' + mInNumber
					+ '" and insp_line="' + InspNumber + '"';
		tx.executeSql(sqlQuery, [], function(tx, results) {
			var totImg = results.rows.length;
			if (isInsp == 0)
				sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
						+ mInNumber + '" and in_out_id="' + InspNumber
						+ '" and imgUpload="T"';
			else
				sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
						+ mInNumber + '" and insp_line="' + InspNumber
						+ '" and imgUpload="T"';
			tx.executeSql(sqlQuery, [], function(tx, results) {
				var totImgUpload = results.rows.length;
				callBack(dlab, InspNumber, totImg, totImgUpload, isInsp);
			}, dbf.errorCB);
		}, dbf.errorCB);
	}, dbf.errorCB);
}

DB.prototype.onchangeSuccessState = function(fileName, imginspline, isInsp) {
	db
			.transaction(
					function(tx) {
						var sqlQuery;
						if (isInsp == 0) {
							sqlQuery = 'UPDATE vis_gallery SET imgAttach="T",imgUpload="T" WHERE name="'
									+ fileName
									+ '" and in_out_id="'
									+ imginspline + '"';
						} else {
							sqlQuery = 'UPDATE vis_gallery SET imgAttach="T",imgUpload="T" WHERE name="'
									+ fileName
									+ '" and insp_line="'
									+ imginspline + '"';
						}
						tx.executeSql(sqlQuery);
					}, dbf.errorCB);
}

DB.prototype.onchangeFailerState = function(failerMsgArray, imginspline, isInsp) {
	if (failerMsgArray[1].substring(0, 1) == "2") {
		db
				.transaction(
						function(tx) {
							var sqlQuery;
							if (isInsp == 0) {
								sqlQuery = 'UPDATE vis_gallery SET imgUpload="F",imgAttach="F" WHERE name="'
										+ failerMsgArray[0]
										+ '" and in_out_id="'
										+ imginspline
										+ '"';
							} else {
								sqlQuery = 'UPDATE vis_gallery SET imgUpload="F",imgAttach="F" WHERE name="'
										+ failerMsgArray[0]
										+ '" and insp_line="'
										+ imginspline
										+ '"';
							}
							tx.executeSql(sqlQuery);
						}, errorCB);
	} else {
		db
				.transaction(
						function(tx) {
							var sqlQuery;
							if (isInsp == 0) {
								sqlQuery = 'UPDATE vis_gallery SET imgAttach="F",imgAttach="F" WHERE name="'
										+ failerMsgArray[0]
										+ '" and in_out_id="'
										+ imginspline
										+ '"';
							} else {
								sqlQuery = 'UPDATE vis_gallery SET imgAttach="F",imgAttach="F" WHERE name="'
										+ failerMsgArray[0]
										+ '" and insp_line="'
										+ imginspline
										+ '"';
							}
							tx.executeSql(sqlQuery);
						}, dbf.errorCB);
	}
}

DB.prototype.onRemoveOtherFiles = function(tmpfile) {
	db.transaction(function(tx) {
		var sqlQuery;
		if (X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null)
			sqlQuery = 'DELETE FROM vis_gallery WHERE file="' + tmpfile
					+ '" and in_out_id="' + M_INOUT_ID + '"';
		else
			sqlQuery = 'DELETE FROM vis_gallery WHERE file="' + tmpfile
					+ '" and insp_line="' + X_INSTRUCTIONLINE_ID + '"';
		tx.executeSql(sqlQuery);
	}, dbf.errorCB, function() {
		deleteCount = deleteCount - 1;
		varifyAllDelete();
	});
}

DB.prototype.onAddImageEntry = function() {
	db
			.transaction(
					function(tx) {
						var sqlQuery;
						if (X_INSTRUCTIONLINE_ID == 0
								|| X_INSTRUCTIONLINE_ID == null)
							sqlQuery = 'INSERT INTO vis_gallery(mr_line,in_out_id,name,file) VALUES ("'
									+ M_InOutLine_ID
									+ '","'
									+ M_INOUT_ID
									+ '","'
									+ fileName
									+ '","'
									+ fileFullPath
									+ '")';
						else
							sqlQuery = 'INSERT INTO vis_gallery(mr_line,insp_line,name,file) VALUES ("'
									+ M_InOutLine_ID
									+ '","'
									+ X_INSTRUCTIONLINE_ID
									+ '","'
									+ fileName
									+ '","' + fileFullPath + '")';
						tx.executeSql(sqlQuery, [], function(tx, results) {
							fileFunction.onAfterSaveFile(fileFullPath,
									backToGallery);
						}, dbf.errorCB);
					}, dbf.errorCB);
}