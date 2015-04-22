Tbl_VISSetting = function(app){
	this.app = app;
	this.dbStore = app.dbStore;
}

Tbl_VISSetting.prototype.getSetting=function(settingInfo, success,error){
	var successCallback = this.dbstore.success;
	if(typeof(success) === "function"){
		successCallback=success;
	}
	var errorCallback = this.dbstore.error;
	if(typeof(error) === "function"){
		errorCallback=error;
	}
	var sql ='SELECT * FROM vis_setting';
	if(settingInfo.length>0){
		for (var i = 0; i < size; i++) {
			sql = sql +' Where' + setting[i].columnname + ' ' +setting[i].operation + ' ' + setting[i].value;
		}
	}
	this.dbstore.transaction.executeSql('SELECT * FROM vis_setting', [], successCallback,
			errorCallback);
}

Tbl_VISSetting.prototype.update = function(setting, success, error) {
	var successCallback = this.dbstore.success;
	if(typeof(success) === "function"){
		successCallback=success;
	}
	var errorCallback = this.dbstore.error;
	if(typeof(error) === "function"){
		errorCallback=error;
	}
	var sql= 'UPDATE vis_setting SET vis_url = "' + setting.service_url
			+ '" ,vis_lang ="' + setting.lang + '",vis_client_id ="'
			+ setting.client_id + '",vis_role ="' + setting.role
			+ '",vis_whouse_id ="' + setting.warehouse_id + '",vis_ord_id ="'
			+ setting.org_id + '",vis_img_qulty ="' + setting.img_quality
			+ '"';
	this.dbstore.transaction.executeSql(sql, [], successCallback,
			errorCallback);
}
