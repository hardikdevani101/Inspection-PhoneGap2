Tbl_VISSetting = function(app) {
	this.app = app;
	this.appDB = app.appDB;
}

Tbl_VISSetting.prototype.find = function(filter, success, error) {
	var _self = this;
	var successCallback = this.appDB.success;
	if (typeof success === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.error;
	if (typeof error === "function") {
		errorCallback = error;
	}
	var sql = 'SELECT * FROM vis_setting';
	if (filter.length > 0) {
		for (var i = 0; i < size; i++) {
			if (sql.indexOf(' WHERE ') > -1) {
				sql = sql + ' AND ';
			} else {
				sql = sql + ' WHERE ';
			}
			sql = sql + filter[i].columnname + ' ' + filter[i].operation + ' '
					+ filter[i].value;
		}
	}
	var setting = {};
	this.appDB.dbstore
			.transaction(
					function(tx) {
						tx
								.executeSql(
										sql,
										[],
										function(tx, results) {
											var len = results.rows.length;
											if (len > 0) {
												console
														.log('setting Record Exist');
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
												setting['is_login'] = results.rows
														.item(0).is_login == "Y";
												setting['username'] = results.rows
														.item(0).username;
												setting['userid'] = results.rows
														.item(0).userid;
												setting['password'] = results.rows
														.item(0).password;
												_self.app.appCache.settingInfo['username'] = results.rows
														.item(0).username;
												_self.app.appCache.settingInfo['password'] = results.rows
														.item(0).userpwd;
												_self.app.appCache.settingInfo['userid'] = results.rows
														.item(0).userid;
											}
											successCallback(setting);
										});
					}, errorCallback, this.appDB.success);
}

Tbl_VISSetting.prototype.add = function(settingInfo, success, error) {
	var successCallback = this.appDB.success;
	if (typeof success === "function") {
		successCallback = success;
	}
	var errorCallback = this.appDB.error;
	if (typeof error === "function") {
		errorCallback = error;
	}
	this.appDB.dbstore
			.transaction(
					function(tx) {
						tx
								.executeSql('INSERT INTO vis_setting '
										+ ' (vis_url, vis_lang, vis_client_id, vis_role, vis_whouse_id, vis_ord_id, vis_img_qulty)'
										+ ' VALUES ("'
										+ settingInfo['service_url'] + '","'
										+ settingInfo['lang'] + '","'
										+ settingInfo['client_id'] + '"," '
										+ settingInfo['role'] + '","'
										+ settingInfo['warehouse_id'] + '","'
										+ settingInfo['org_id'] + '","'
										+ settingInfo['img_quality'] + '")');
					}, function(err) {
						console.log("SettingInfo insert failed." + tx.message);
						errorCallback();
					}, function() {
						console.log("SettingInfo inserted.");
						successCallback(settingInfo);
					});

};

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
		tx.executeSql(sql, [], function(tx, results) {
			successCallback(results)
		});
	}, errorCallback, this.appDB.success);
}

Tbl_VISSetting.prototype.login = function(isLogin, success, error) {
	var _self = this;
	var successCallback = _self.appDB.success;
	if (typeof success === "function") {
		successCallback = success;
	}

	var errorCallback = this.appDB.errorCB;
	if (typeof error === "function") {
		errorCallback = error;
	}

	var sql = 'UPDATE vis_setting SET is_login = "' + isLogin + '"';
	if (isLogin == "Y") {
		sql += ', username= "' + _self.app.appCache.settingInfo["username"]
				+ '", userpwd = "' + _self.app.appCache.settingInfo["password"]
				+ '", userid="' + _self.app.appCache.settingInfo["userid"]
				+ '"';
	} else {
		sql += ',username="",userid="",userpwd=""';
	}
	this.appDB.dbstore.transaction(function(tx) {
		tx.executeSql(sql, [], function(tx, results) {
			successCallback(results)
		});
	}, errorCallback, successCallback);
}
