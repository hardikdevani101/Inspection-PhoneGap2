var SettingsPage = function(app) {
	this.app = app;
	this.visSettingsDAO = new Tbl_VISSetting(app);
	// this.event = event
}

SettingsPage.prototype.reloadServerDetail = function() {
	var _self = this;
	if (_self.app.appCache.ftpServers.length > 0) {
		$.each(_self.app.appCache.ftpServers, function(key, data) {
			if (data.isFTP != 'Y') {
				$("#txt_url").append(new Option(data.name, data.url));
			}
		});
		$('#txt_url').selectmenu();
		$('#txt_url').selectmenu('refresh', true);
	}
}

SettingsPage.prototype.init = function() {
	// Initialize components.
	console.log("Inittialize Settings View.");
	var _self = this;

	// Register Event listeners
	$("#txt_organization").on("change", function() {
		_self.onOrgChange();
	});
	$("#txt_url").on("change", function() {
		_self.onServerChange()
	});
	$('#_form_settings').validate({
		rules : {
			txt_url : {
				required : true
			},
			txt_lang : {
				required : true
			},
			txt_organization : {
				required : true
			},
			txt_role : {
				required : true
			},
			txt_warehouse : {
				required : true
			},
			txt_imgQua : {
				required : true
			},
			txt_client : {
				required : true
			}
		},
		invalidHandler : function() {
			alert("invalid form"); // for demo
		},
		messages : {
			txt_url : {
				required : "Required Field!."
			},
			txt_lang : {
				required : "Required Field!."
			},
			txt_organization : {
				required : "Required Field!."
			},
			txt_role : {
				required : "Required Field!."
			},
			txt_warehouse : {
				required : "Required Field!."
			},
			txt_imgQua : {
				required : "Required Field!."
			},
			txt_client : {
				required : "Required Field!."
			}
		},
		errorPlacement : function(error, element) {
			// error.appendTo(element.parent().prev());
			// element.attr("placeholer","Required Field");
			element.attr("style", "border:1px solid red;");
		},
		submitHandler : function(form) {
			_self.onUpdate();
			$(':mobile-pagecontainer').pagecontainer('change', '#pg_login', {
				reload : false
			})
			return false;
		}
	});

	_self.visSettingsDAO.find({}, function(settingInfo) {
		if (settingInfo.service_url) {
			_self.app.appCache.settingInfo = settingInfo;
			_self.onSettingFind(settingInfo);
		}
		else{
			$("#pg_settings").panel("open", {});
		}
	}, function(msg) {
		console.log("SettingInfo Error - " + msg);
	});

}

SettingsPage.prototype.onUpdate = function() {
	var _self = this;
	var settingInfo = {};
	settingInfo['lang'] = $("#txt_lang option:selected").val();
	settingInfo['service_url'] = $("#txt_url option:selected").val();
	settingInfo['client_id'] = $("#txt_client option:selected").val();
	settingInfo['org_id'] = $("#txt_organization option:selected").val();
	settingInfo['warehouse_id'] = $("#txt_warehouse option:selected").val();
	settingInfo['img_quality'] = $("#txt_imgQua option:selected").val();
	settingInfo['role'] = $("#txt_role option:selected").val();

	var error = function(msg) {
		console.log("Setting Info Updates Fails." + msg);
	};

	this.visSettingsDAO.find({}, function(result) {
		if (result.service_url) {
			_self.visSettingsDAO.update(settingInfo, function(data) {
				_self.app.appCache.updateSettingInfo(settingInfo);
				$("#pg_settings").panel("close");
			}, error);
		} else {
			_self.visSettingsDAO.add(settingInfo, function(data) {
				_self.app.appCache.updateSettingInfo(settingInfo);
				$("#pg_settings").panel("close");
			}, error);
		}
	}, function(msg) {
		console.log("SettingInfo Error - " + msg);
	});
}

SettingsPage.prototype.onOrgChange = function() {
	console.log("Organizartion Change");
	$("#txt_warehouse").empty();
	var org_id = $("#txt_organization").val();
	if (org_id == null || org_id == 0) {
		for (var i = 0; i < app.appCache.warehouseList.length; i++) {
			$("#txt_warehouse").append(
					new Option(app.appCache.warehouseList[i].name,
							app.appCache.warehouseList[i].warehouseid));
		}
	} else {
		var result = $.grep(app.appCache.warehouseList, function(e) {
			return e.orgid == org_id;
		});
		for (var i = 0; i < result.length; i++) {
			$("#txt_warehouse").append(
					new Option(result[i].name, result[i].warehouseid));
		}
	}
	$('#txt_warehouse').selectmenu('refresh', true);
}

SettingsPage.prototype.onServerChange = function() {
	console.log("Server Change");
	var _self = this;

	$("#txt_warehouse").empty();
	var org_id = $("#txt_organization").val();
	if (org_id == null || org_id == 0) {
		for (var i = 0; i < app.appCache.warehouseList.length; i++) {
			$("#txt_warehouse").append(
					new Option(app.appCache.warehouseList[i].name,
							app.appCache.warehouseList[i].warehouseid));
		}
	} else {
		var result = $.grep(app.appCache.warehouseList, function(e) {
			return e.orgid == org_id;
		});
		for (var i = 0; i < result.length; i++) {
			$("#txt_warehouse").append(
					new Option(result[i].name, result[i].warehouseid));
		}
	}
	$('#txt_warehouse').selectmenu('refresh', true);

	// _self.app.logout();
}

SettingsPage.prototype.onSettingFind = function(setting) {
	var _self = this;
	_self.app.isLogin = setting.is_login;
	
	if (!setting.service_url || setting.service_url == '') {
		if (_self.app.isLogin) {
			_self.app.logout();
		}
		$("#pg_settings").panel("open", {});
	} else {
		$("#pg_settings").panel("close");
		$("#txt_url").val(setting.service_url).attr('selected', true).siblings(
				'option').removeAttr('selected');
		$("#txt_url").selectmenu("refresh", true);
		$("#txt_role").val(setting.role).attr('selected', true).siblings(
				'option').removeAttr('selected');
		$("#txt_role").selectmenu("refresh", true);
		$("#txt_client").val(setting.client_id).attr('selected', true)
				.siblings('option').removeAttr('selected');
		$("#txt_client").selectmenu("refresh", true);
		$("#txt_imgQua").val(setting.img_quality).attr('selected', true)
				.siblings('option').removeAttr('selected');
		$("#txt_imgQua").selectmenu("refresh", true);
		$("#txt_lang").val(setting.lang).attr('selected', true).siblings(
				'option').removeAttr('selected');
		$("#txt_lang").selectmenu("refresh", true);
		$("#txt_warehouse").val(setting.warehouse_id).attr('selected', true)
				.siblings('option').removeAttr('selected');
		$("#txt_warehouse").selectmenu("refresh", true);
		$("#txt_organization").val(setting.org_id).attr('selected', true)
				.siblings('option').removeAttr('selected');
		$("#txt_organization").selectmenu("refresh", true);
		$("#txt_organization").trigger("change");

		// Enhance new select element
		// $('#txt_organization').selectmenu();
	}
}