var DB = function(app) {
	console.log("DB constructor");
	this.app = app;
	this.dbstore = window.openDatabase("vis_inspection", "1.0",
			"vis_inspection", 2 * 1024 * 1024);
}

DB.prototype.init = function() {
	var _self = this;
	console.log("DB init");
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
					}, _self.errorCB, _self.loadSetting);
}

DB.prototype.errorCB = function(err) {
	console.log("Error processing SQL: " + err.code);
}

DB.prototype.success = function(tx, results) {
	console.log("Success processing SQL - TX: " + tx);
	console.log("Success processing SQL: " + results);
}

DB.prototype.loadSetting = function() {
	var _self = this;
	console.log("DB loadSetting");
	var vissettings = new Tbl_VISSetting(_self.app);
	vissettings.getSetting(function(setting) {
		_self.app.appCache.updateSettingInfo(setting);
	}, _self.errorCB);
}
