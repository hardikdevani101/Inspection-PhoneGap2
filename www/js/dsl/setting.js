var Setting = function() {
	this.warehouseListArray = new Array();
	this.warehouseListArray[0] = new Array();
	this.warehouseListArray[0][0] = "1000001";
	this.warehouseListArray[0][1] = "1000045";
	this.warehouseListArray[0][2] = "Singapore PreSold in Amsterdam";
	this.warehouseListArray[1] = new Array();
	this.warehouseListArray[1][0] = "1000001";
	this.warehouseListArray[1][1] = "1000009";
	this.warehouseListArray[1][2] = "Singapore PreSold in Austin";
	this.warehouseListArray[2] = new Array();
	this.warehouseListArray[2][0] = "1000001";
	this.warehouseListArray[2][1] = "1000007";
	this.warehouseListArray[2][2] = "Singapore PreSold in Singapore";
	this.warehouseListArray[3] = new Array();
	this.warehouseListArray[3][0] = "1000001";
	this.warehouseListArray[3][1] = "1000046";
	this.warehouseListArray[3][2] = "Singapore Stock in Amsterdam";
	this.warehouseListArray[4] = new Array();
	this.warehouseListArray[4][0] = "1000001";
	this.warehouseListArray[4][1] = "1000008";
	this.warehouseListArray[4][2] = "Singapore Stock in Austin";
	this.warehouseListArray[5] = new Array();
	this.warehouseListArray[5][0] = "1000001";
	this.warehouseListArray[5][1] = "1000006";
	this.warehouseListArray[5][2] = "Singapore Stock in Singapore";
	this.warehouseListArray[6] = new Array();
	this.warehouseListArray[6][0] = "1000003";
	this.warehouseListArray[6][1] = "1000043";
	this.warehouseListArray[6][2] = "Austin PreSold in Amsterdam";
	this.warehouseListArray[7] = new Array();
	this.warehouseListArray[7][0] = "1000003";
	this.warehouseListArray[7][1] = "1000011";
	this.warehouseListArray[7][2] = "Austin PreSold in Austin";
	this.warehouseListArray[8] = new Array();
	this.warehouseListArray[8][0] = "1000003";
	this.warehouseListArray[8][1] = "1000013";
	this.warehouseListArray[8][2] = "Austin PreSold in Singapore";
	this.warehouseListArray[9] = new Array();
	this.warehouseListArray[9][0] = "1000003";
	this.warehouseListArray[9][1] = "1000044";
	this.warehouseListArray[9][2] = "Austin Stock in Amsterdam";
	this.warehouseListArray[10] = new Array();
	this.warehouseListArray[10][0] = "1000003";
	this.warehouseListArray[10][1] = "1000003";
	this.warehouseListArray[10][2] = "Austin Stock in Austin";
	this.warehouseListArray[11] = new Array();
	this.warehouseListArray[11][0] = "1000003";
	this.warehouseListArray[11][1] = "1000002";
	this.warehouseListArray[11][2] = "Austin Stock in Singapore";
	this.warehouseListArray[12] = new Array();
	this.warehouseListArray[12][0] = "1000019";
	this.warehouseListArray[12][1] = "1000037";
	this.warehouseListArray[12][2] = "Amsterdam PreSold in Amsterdam";
	this.warehouseListArray[13] = new Array();
	this.warehouseListArray[13][0] = "1000019";
	this.warehouseListArray[13][1] = "1000038";
	this.warehouseListArray[13][2] = "Amsterdam PreSold in Austin";
	this.warehouseListArray[14] = new Array();
	this.warehouseListArray[14][0] = "1000019";
	this.warehouseListArray[14][1] = "1000039";
	this.warehouseListArray[14][2] = "Amsterdam PreSold in Singapore";
	this.warehouseListArray[15] = new Array();
	this.warehouseListArray[15][0] = "1000019";
	this.warehouseListArray[15][1] = "1000040";
	this.warehouseListArray[15][2] = "Amsterdam Stock in Amsterdam";
	this.warehouseListArray[16] = new Array();
	this.warehouseListArray[16][0] = "1000019";
	this.warehouseListArray[16][1] = "1000041";
	this.warehouseListArray[16][2] = "Amsterdam Stock in Austin";
	this.warehouseListArray[17] = new Array();
	this.warehouseListArray[17][0] = "1000019";
	this.warehouseListArray[17][1] = "1000042";
	this.warehouseListArray[17][2] = "Amsterdam Stock in Singapore";
	this.warehouseListArray[18] = new Array();
	this.warehouseListArray[18][0] = "1000020";
	this.warehouseListArray[18][1] = "1000054";
	this.warehouseListArray[18][2] = "Japan PreSold in Japan";
	this.warehouseListArray[19] = new Array();
	this.warehouseListArray[19][0] = "1000020";
	this.warehouseListArray[19][1] = "1000055";
	this.warehouseListArray[19][2] = "Japan Stock in Japan";

	this.vis_url = null;
	this.vis_lang = null;
	this.vis_client_id = null;
	this.vis_role = null;
	this.vis_whouse_id = null;
	this.vis_org_id = null;
	this.vis_img_qulty = null;
}
var setting = new Setting()
{

}

Setting.prototype.init = function() {

}

Setting.prototype.validationSetting = function() {

	var url = document.getElementById("txt_url");
	var lang = document.getElementById("txt_lang");
	var client = document.getElementById("txt_client");
	var role = document.getElementById("txt_role");
	var whouse = document.getElementById("txt_warehouse");
	var org = document.getElementById("txt_organizer");
	var img_qulty = document.getElementById("txt_imgQua");

	if (url.value == "" || url.value == null) {
		document.getElementById("setting_error").innerHTML = "URL Should Not Blank";
		url.focus();
	} else if (lang.value == "" || lang.value == null) {
		document.getElementById("setting_error").innerHTML = "Language Should Not Blank";
		lang.focus();
	} else if (client.value == "" || client.value == null) {
		app.loadPage("setting");
		client.focus();
	} else if (role.value == "" || role.value == null) {
		document.getElementById("setting_error").innerHTML = "Role Should Not Blank";
		role.focus();
	} else if (whouse.value == "" || whouse.value == null) {
		document.getElementById("setting_error").innerHTML = "Warehouse Should Not Blank";
		whouse.focus();
	} else if (org.value == "" || org.value == null) {
		document.getElementById("setting_error").innerHTML = "Organizor Should Not Blank";
		lang.focus();
	} else if (img_qulty.value == "" || img_qulty.value == null) {
		document.getElementById("setting_error").innerHTML = "Image quality Should Not Blank";
		lang.focus();
	} else {
		setting.onSettingUpdate();
	}
}

Setting.prototype.onSettingUpdate = function() {
	var e = document.getElementById("txt_url");
	vis_url = e.options[e.selectedIndex].value;

	vis_lang = document.getElementById("txt_lang").value;
	e = document.getElementById("txt_client");
	vis_client_id = e.options[e.selectedIndex].value;
	e = document.getElementById("txt_role");
	vis_role = e.options[e.selectedIndex].value;

	e = document.getElementById("txt_warehouse");
	vis_whouse_id = e.options[e.selectedIndex].value;

	e = document.getElementById("txt_organizer");
	vis_org_id = e.options[e.selectedIndex].value;
	vis_img_qulty = document.getElementById("txt_imgQua").value;

	if (vis_url == "" && vis_lang == "" && vis_client_id == ""
			&& vis_role == "" && vis_whouse_id == "" && vis_org_id == ""
			&& vis_img_qulty == "") {
		navigator.notification.alert('No Field Should Be Blank!',
				app.onSettingPage, 'Invalid Value', 'Ok');
		dbf.loadSetting();
	} else {
		db.transaction(dbf.updateSettings, dbf.errorCB);
		app.loadPage("login");
	}

}
