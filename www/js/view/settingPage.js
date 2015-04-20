function SettingPage() {

}

var settingPage = new SettingPage()
{

}

SettingPage.prototype.init = function() {

}

SettingPage.prototype.renderWarehous = function() {
	$("#txt_warehouse").empty();
	var e = document.getElementById("txt_organizer");
	var wareHouseDrop = document.getElementById("txt_warehouse");
	var org_id = e.options[e.selectedIndex].value;
	if (org_id == 0) {
		for ( var i = 0; i < setting.warehouseListArray.length; i++) {
			var option = document.createElement('option');
			option.text = setting.warehouseListArray[i][2];
			option.value = setting.warehouseListArray[i][1];
			if (option.value == vis_whouse_id)
				option.selected = true;
			wareHouseDrop.add(option);
		}
	} else {
		for ( var i = 0; i < setting.warehouseListArray.length; i++) {
			if (setting.warehouseListArray[i][0] == org_id) {
				var option = document.createElement('option');
				option.text = setting.warehouseListArray[i][2];
				option.value = setting.warehouseListArray[i][1];
				if (option.value == vis_whouse_id)
					option.selected = true;
				wareHouseDrop.add(option);
			}
		}
	}
}

SettingPage.prototype.setSettingpage = function() {
	var e = document.getElementById("txt_url");
	for ( var i = 0; i < e.options.length; i++) {
		if (e.options[i].value == vis_url)
			e.options[i].selected = true;
	}
	document.getElementById("txt_lang").value = vis_lang;
	e = document.getElementById("txt_client");
	for ( var i = 0; i < e.options.length; i++) {
		if (e.options[i].value == vis_client_id)
			e.options[i].selected = true;
	}
	document.getElementById("txt_imgQua").value = vis_img_qulty;
	e = document.getElementById("txt_role");
	for ( var i = 0; i < e.options.length; i++) {
		if (e.options[i].value == vis_role)
			e.options[i].selected = true;
	}
	app.M_InOutLine_ID = e.options[e.selectedIndex].value;

	e = document.getElementById("txt_organizer");
	for ( var i = 0; i < e.options.length; i++) {
		if (e.options[i].value == vis_org_id)
			e.options[i].selected = true;
	}
	e.setAttribute("onchange", "settingPage.renderWarehous()");
	settingPage.renderWarehous();
}