Tbl_VISSetting = function(app) {
	this.app = app;
	this.appDB = app.appDB;
}

Tbl_VISSetting.prototype.getSetting = function(success, error) {
	var successCallback = this.appDB.success;
	if (typeof success === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.error;
	if (typeof error === "function") {
		errorCallback = error;
	}
	// var sql ='SELECT * FROM vis_setting';
	// if(setting.length>0){
	// for (var i = 0; i < size; i++) {
	// sql = sql +' Where' + setting[i].columnname + ' ' +setting[i].operation +
	// ' ' + setting[i].value;
	// }
	// }
	this.appDB.dbstore
			.transaction(
					function(tx) {
						tx
								.executeSql(
										'SELECT * FROM vis_setting',
										[],
										function(tx, results) {
											var setting = {};
											var len = results.rows.length;
											if (len < 1) {
												console.log('setting Record not Exist');
												setting['service_url'] = "http://192.168.0.121:8088";
												setting['role'] = "1000000";
												setting['lang'] = "en_US";
												setting['client_id'] = "1000000";
												setting['warehouse_id'] = "0";
												setting['org_id'] = "0";
												setting['img_quality'] = "75";
												tx
														.executeSql('INSERT INTO vis_setting (vis_url,vis_lang,vis_client_id,vis_role,vis_whouse_id,vis_ord_id,vis_img_qulty)'
																+ ' VALUES ('
																+ setting['service_url']
																+ ','
																+ setting['lang']
																+ ','
																+ setting['client_id']
																+ ', '
																+ setting['role']
																+ ','
																+ setting['warehouse_id']
																+ ','
																+ setting['org_id']
																+ ','
																+ setting['img_quality']
																+ ')');
											} else {
												console.log('setting Record Exist');
												setting['service_url'] = results.rows
														.item(0).vis_url;
												setting['role'] = results.rows
														.item(0).vis_role;
												setting['lang'] = results.rows
														.item(0).vis_lang;
												setting['client_id'] = results.rows
														.item(0).vis_client_id;
												setting['warehouse_id'] = results.rows
														.item(0).vis_whouse_id;
												setting['org_id'] = results.rows
														.item(0).vis_ord_id;
												setting['img_quality'] = results.rows
														.item(0).vis_img_qulty;
											}
											successCallback(setting);
										}, errorCallback)
					}, errorCallback);
}

Tbl_VISSetting.prototype.update = function(setting, success, error) {
	var successCallback = this.appDB.success;
	if (typeof success === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.error;
	if (typeof error === "function") {
		errorCallback = error;
	}
	var sql = 'UPDATE vis_setting SET vis_url = "' + setting.service_url
			+ '" ,vis_lang ="' + setting.lang + '",vis_client_id ="'
			+ setting.client_id + '",vis_role ="' + setting.role
			+ '",vis_whouse_id ="' + setting.warehouse_id + '",vis_ord_id ="'
			+ setting.org_id + '",vis_img_qulty ="' + setting.img_quality + '"';
	this.appDB.dbstore.transaction(function(tx) {
		tx.executeSql(sql, [], successCallback, errorCallback);
	}, errorCallback);
}
