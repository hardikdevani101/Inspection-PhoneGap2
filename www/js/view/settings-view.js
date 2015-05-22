var SettingsPage = function(app) {
	this.app = app;
	this.context = "#pg_settings";
	this.visSettingsDAO = new Tbl_VISSetting(app);
}

SettingsPage.prototype.reloadServerDetail = function() {
	var _self = this;
	_self.app.visionApi.getFTPServerList({
		orgid : app.appCache.settingInfo.org_id
	}, function(result) {
		for (var i = 0; i < result.ftpservers.length; i++) {
			findCount = 0
			ftpItem = result.ftpservers[i];
			findCount = jQuery.grep(_self.app.appCache.ftpServers, function(
					item, index) {
				return item.url == ftpItem.url;
			});
			if (!findCount.length > 0) {
				_self.app.appCache.ftpServers.push(ftpItem);
			}
		}
		_self.app.appDB.createFTPEntry();
	}, function(msg) {
		_self.app.showError("pg_settings", "Servers failed : " + msg);
	});
}

SettingsPage.prototype.renderServer = function() {
	var _self = this;
	_self.el_txURL.html('');
	if (_self.app.appCache.ftpServers.length > 0) {
		$.each(_self.app.appCache.ftpServers, function(key, data) {
			if (data.isFTP != 'Y') {
				_self.el_txURL.append(new Option(data.name, data.url));
			}
		});
		_self.el_txURL.selectmenu();
		if (_self.app.appCache.settingInfo.service_url) {
			_self.el_txURL.val(_self.app.appCache.settingInfo.service_url)
					.attr('selected', true).siblings('option').removeAttr(
							'selected');
		}
		_self.el_txURL.selectmenu('refresh', true);
	}
}

SettingsPage.prototype.renderOrgs = function() {
	var _self = this;
	_self.el_txOrg.empty();
	for (var i = 0; i < _self.app.appCache.orgList.length; i++) {
		_self.el_txOrg.append(new Option(app.appCache.orgList[i].name,
				_self.app.appCache.orgList[i].orgid));
	}
	_self.el_txOrg.selectmenu('refresh', true);
}

SettingsPage.prototype.renderRoles = function() {
	var _self = this;
	_self.el_txRole.empty();
	for (var i = 0; i < _self.app.appCache.roleList.length; i++) {
		_self.el_txRole.append(new Option(_self.app.appCache.roleList[i].name,
				_self.app.appCache.roleList[i].roleid));
	}
	_self.el_txRole.selectmenu('refresh', true);
}

SettingsPage.prototype.init = function() {
	var _self = this;
	_self.contextPage = $("#pg_settings", $.mobile.activePage);
	_self.el_txWH = $("#txt_warehouse", _self.context);
	_self.el_txOrg = $("#txt_organization", _self.context);
	_self.el_txURL = $("#txt_url", _self.context);
	_self.el_txRole = $("#txt_role", _self.context);
	_self.el_txClient = $("#txt_client", _self.context);
	_self.el_imgQua = $("#txt_imgQua", _self.context);
	_self.el_txLang = $("#txt_lang", _self.context);
	_self.el_txEditor = $("#txt_editApp", _self.context);

	_self.contextPage.on("panelbeforeopen", function(event, ui) {
		_self.contextPage.enhanceWithin();
		_self.renderServer();
		event.preventDefault();
		return false;
	});

	// Register Event listeners
	_self.el_txOrg.on("change", function(event) {
		_self.onOrgChange();
		event.preventDefault();
		return false;
	});

	_self.el_txURL.on("change", function(event) {
		_self.onServerChange()
		event.preventDefault();
		return false;
	});

	_self.renderOrgs();
	_self.renderRoles();
	_self.onOrgChange();

	$('#_form_settings', _self.context).validate({
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
			// // error.appendTo(element.parent().prev());
			// // element.attr("placeholer","Required Field");
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
		} else {
			$(_self.context, $.mobile.activePage).panel("open", {});
		}
	}, function(msg) {
		_self.app.showError("pg_settings", "No Settings Found:" + msg)
	});

}

SettingsPage.prototype.onUpdate = function() {
	var _self = this;
	var settingInfo = {};
	settingInfo['lang'] = $("#txt_lang option:selected", _self.context).val();
	settingInfo['service_url'] = $("#txt_url option:selected", _self.context)
			.val();
	settingInfo['client_id'] = $("#txt_client option:selected", _self.context)
			.val();
	settingInfo['org_id'] = $("#txt_organization option:selected",
			_self.context).val();
	settingInfo['warehouse_id'] = $("#txt_warehouse option:selected",
			_self.context).val();
	settingInfo['img_quality'] = $("#txt_imgQua option:selected", _self.context)
			.val();
	settingInfo['role'] = $("#txt_role option:selected", _self.context).val();
	settingInfo['img_editor'] = $("#txt_editApp option:selected", _self.context)
			.val();

	var error = function(msg) {
		_self.app.showError("pg_settings", "Error: SettingInfo Update Failed-"
				+ msg)
	};

	this.visSettingsDAO.find({}, function(result) {
		if (result.service_url) {
			_self.visSettingsDAO.update(settingInfo, function(data) {
				_self.app.appCache.updateSettingInfo(settingInfo);
				$("#pg_settings", $.mobile.activePage).panel("close");
			}, error);
		} else {
			_self.visSettingsDAO.add(settingInfo, function(data) {
				_self.app.appCache.updateSettingInfo(settingInfo);
				$("#pg_settings", $.mobile.activePage).panel("close");
			}, error);
		}
	}, function(msg) {
		_self.app
				.showError('pg_settings', "Error:No Seeting info Found-" + msg)
	});
}

SettingsPage.prototype.onOrgChange = function() {
	var _self = this;
	_self.el_txWH.empty();
	var org_id = _self.el_txOrg.val();
	if (org_id == null || org_id == 0) {
		for (var i = 0; i < app.appCache.warehouseList.length; i++) {
			_self.el_txWH.append(new Option(app.appCache.warehouseList[i].name,
					app.appCache.warehouseList[i].warehouseid));
		}
	} else {
		var result = $.grep(app.appCache.warehouseList, function(e) {
			return e.orgid == org_id;
		});
		for (var i = 0; i < result.length; i++) {
			_self.el_txWH.append(new Option(result[i].name,
					result[i].warehouseid));
		}
	}
	_self.el_txWH.selectmenu('refresh', true);
}

SettingsPage.prototype.onServerChange = function() {
	var _self = this;
	var el_txWH = _self.el_txWH;
	var el_txOrg = _self.el_txOrg;

	el_txWH.empty();
	var org_id = el_txOrg.val();
	if (org_id == null || org_id == 0) {
		for (var i = 0; i < app.appCache.warehouseList.length; i++) {
			el_txWH.append(new Option(app.appCache.warehouseList[i].name,
					app.appCache.warehouseList[i].warehouseid));
		}
	} else {
		var result = $.grep(app.appCache.warehouseList, function(e) {
			return e.orgid == org_id;
		});
		for (var i = 0; i < result.length; i++) {
			el_txWH.append(new Option(result[i].name, result[i].warehouseid));
		}
	}
	el_txWH.selectmenu('refresh', true);
}

SettingsPage.prototype.onSettingFind = function(setting) {
	var _self = this;
	_self.app.isLogin = setting.is_login;
	_self.app.img_editor = setting.img_editor;
	var contextPage = _self.contextPage;

	if (!setting.service_url || setting.service_url == '') {
		if (_self.app.isLogin) {
			_self.app.logout();
		}
		contextPage.panel("open", {});
	} else {

		contextPage.panel("close");
		_self.el_txURL.val(setting.service_url).attr('selected', true)
				.siblings('option').removeAttr('selected');
		_self.el_txURL.selectmenu("refresh", true);
		_self.el_txRole.val(setting.role).attr('selected', true).siblings(
				'option').removeAttr('selected');
		_self.el_txRole.selectmenu("refresh", true);
		_self.el_txClient.val(setting.client_id).attr('selected', true)
				.siblings('option').removeAttr('selected');
		_self.el_txClient.selectmenu("refresh", true);
		_self.el_imgQua.val(setting.img_quality).attr('selected', true)
				.siblings('option').removeAttr('selected');
		_self.el_imgQua.selectmenu("refresh", true);
		_self.el_txLang.val(setting.lang).attr('selected', true).siblings(
				'option').removeAttr('selected');
		_self.el_txLang.selectmenu("refresh", true);
		_self.el_txOrg.val(setting.org_id).attr('selected', true).siblings(
				'option').removeAttr('selected');
		_self.el_txOrg.selectmenu("refresh", true);
		_self.el_txWH.val(setting.warehouse_id).attr('selected', true)
				.siblings('option').removeAttr('selected');
		_self.el_txWH.selectmenu("refresh", true);
		_self.el_txOrg.trigger("change");
		_self.el_txEditor.val(setting.img_editor).attr('selected', true)
				.siblings('option').removeAttr('selected');
		_self.el_txEditor.selectmenu("refresh", true);
	}
}