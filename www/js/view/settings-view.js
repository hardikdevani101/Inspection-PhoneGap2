var SettingsPage = function(app) {
	this.app = app;
	this.context = "#pg_settings";
}

SettingsPage.prototype.renderOrgs = function() {
	var _self = this;
	_self.el_txOrg.empty();
	for (var i = 0; i < _self.app.appCache.orgList.length; i++) {
		_self.el_txOrg.append(new Option(app.appCache.orgList[i].name,
				_self.app.appCache.orgList[i].orgid));
	}
	if (_self.app.appCache.settingInfo.org_id) {
		_self.el_txOrg.val(_self.app.appCache.settingInfo.org_id).attr(
				'selected', true).siblings('option').removeAttr('selected');
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
	if (_self.app.appCache.settingInfo.role) {
		_self.el_txRole.val(_self.app.appCache.settingInfo.role).attr(
				'selected', true).siblings('option').removeAttr('selected');
	}
	_self.el_txRole.selectmenu('refresh', true);
}

SettingsPage.prototype.init = function() {
	var _self = this;
	_self.contextPage = $("#pg_settings", $.mobile.activePage);
	_self.el_txWH = $("#txt_warehouse", _self.context);
	_self.el_txOrg = $("#txt_organization", _self.context);
	_self.el_txRole = $("#txt_role", _self.context);
	_self.el_txClient = $("#txt_client", _self.context);
	_self.el_txLang = $("#txt_lang", _self.context);

	$(document)
			.on(
					"pagebeforeshow",
					_self.context,
					function(event) {

						if (_self.el_txWH.children('option:selected')) {
							if (_self.el_txWH.children('option:selected').attr(
									'value')) {
								_self.app.appCache.settingInfo.warehouse_id = _self.el_txWH
										.children('option:selected').attr(
												'value');
							}
						}

						if (_self.el_txOrg.children('option:selected')) {
							if (_self.el_txOrg.children('option:selected')
									.attr('value')) {
								_self.app.appCache.settingInfo.org_id = _self.el_txOrg
										.children('option:selected').attr(
												'value');
							}
						}

						_self.contextPage.enhanceWithin();
						_self.renderOrgs();
						_self.renderRoles();
						_self.onOrgChange();
						return false;
					});

	// Register Event listeners
	_self.el_txWH.on("change", function(event) {
		var value = $(this).children('option:selected').attr('value');
		_self.app.appCache.settingInfo.warehouse_id = value;
		event.preventDefault();
		return false;
	});

	_self.el_txOrg.on("change", function(event) {
		var value = $(this).children('option:selected').attr('value');
		_self.app.appCache.settingInfo.org_id = value;
		_self.onOrgChange();
		event.preventDefault();
		return false;
	});

	$('#_form_settings', _self.context).validate({
		rules : {
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
			txt_client : {
				required : true
			}
		},
		invalidHandler : function() {
		},
		messages : {
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
			_self.onLogin();
			// $(':mobile-pagecontainer').pagecontainer('change', '#pg_login', {
			// reload : false
			// })
			return false;
		}
	});

}

SettingsPage.prototype.onLogin = function() {
	var _self = this;
	try {
		_self.app.visionApi = new VisionApi(_self.app);
		_self.app.visionApi
				.login(
						function(result) {

							if (result.loginInfo.error) {
								_self.app.showError("pg_login",
										result.loginInfo.error);
							} else {
								_self.app.isLogin = true;
								_self.app.appCache.settingInfo['userid'] = result.loginInfo.ad_user_id;
								_self.app.appCache.settingInfo['is_login'] = true;

								var error = function(msg) {
									_self.app.showError("pg_settings",
											"Error: SettingInfo Update Failed-"
													+ msg)
								};

								_self.visSettingsDAO = new Tbl_VISSetting(
										_self.app);
								_self.visSettingsDAO
										.find(
												{},
												function(result) {
													if (result.service_url) {
														_self.visSettingsDAO
																.update(
																		_self.app.appCache.settingInfo,
																		function(
																				data) {
																			_self.app.appCache
																					.updateSettingInfo(_self.app.appCache.settingInfo);
																		},
																		error);
													} else {
														_self.visSettingsDAO
																.add(
																		_self.app.appCache.settingInfo,
																		function(
																				data) {
																			_self.app.appCache
																					.updateSettingInfo(_self.app.appCache.settingInfo);
																		},
																		error);
													}
												}, function(msg) {
													_self.app.showError(
															'pg_settings',
															"Error:No Seeting info Found-"
																	+ msg)
												});

								_self.visSettingsDAO.login("Y", function(data) {
									console.log("DB-Login Success!")
								}, function(msg) {
									console.log("DB-Login Failed!")
								});

								$(':mobile-pagecontainer').pagecontainer(
										'change', '#pg_inspection', {
											reload : false
										});
								_self.app.reloadServerDetail();
							}
							// Load More Server details.

						}, function(error) {
							_self.app.showError("pg_login", "Login failed"
									+ error);
						});

	} catch (error) {
		_self.app.showError("pg_login", "Login failed" + error);
	}
}

SettingsPage.prototype.onUpdate = function() {
	var _self = this;
	var settingInfo = _self.app.appCache.settingInfo;
	settingInfo['lang'] = $("#txt_lang option:selected", _self.context).val();
	settingInfo['client_id'] = $("#txt_client option:selected", _self.context)
			.val();
	settingInfo['org_id'] = $("#txt_organization option:selected",
			_self.context).val();
	settingInfo['warehouse_id'] = $("#txt_warehouse option:selected",
			_self.context).val();
	settingInfo['role'] = $("#txt_role option:selected", _self.context).val();
	_self.app.appCache.updateSettingInfo(settingInfo);
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
	if (_self.app.appCache.settingInfo.warehouse_id) {
		_self.el_txWH.val(_self.app.appCache.settingInfo.warehouse_id).attr(
				'selected', true).siblings('option').removeAttr('selected');
	}
	_self.el_txWH.selectmenu('refresh', true);
}