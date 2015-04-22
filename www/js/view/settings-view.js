var SettingsPage = function(app, event) {
	this.app = app;
	this.event = event
}

var settingsPage = new SettingsPage();

SettingsPage.prototype.init = function() {
	// Initialize components.
	console.log("Seting innnnnnnnnnnnnnnnnnnnnnnnnnnnit");
	var _self = this;
	$("#txt_organization")
			.on(
					'change',
					function() {
						console
								.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
					});
	$("#txt_url").val(app.appcache.settingInfo.service_url);
	$("#txt_role").val(app.appcache.settingInfo.role);
	$("#txt_client").val(app.appcache.settingInfo.client_id);
	$("#txt_organization").val(app.appcache.settingInfo.org_id);
	$("#txt_warehouse").val(app.appcache.settingInfo.warehouse_id);
	$("#txt_imgQua").val(app.appcache.settingInfo.img_quality);
	$("#txt_lang").val(app.appcache.settingInfo.lang);
	app.appcache.session.M_InOutLine_ID = '';

	// Register Event listeners
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
			error.appendTo(element.parent().prev());
		},
		submitHandler : function(form) {
			console.log("Successssss");
			_self.onUpdate();
			return false;
		}
	});
}

SettingsPage.prototype.onUpdate = function() {
	var settingInfo = {};
	settingInfo['lang'] = $("#txt_lang option:selected").val();
	settingInfo['service_url'] = $("#txt_url option:selected").val();
	settingInfo['client_id'] = $("#txt_client_id option:selected").val();
	settingInfo['org_id'] = $("#txt_organization option:selected").val();
	settingInfo['warehouse_id'] = $("#txt_warehouse option:selected").val();
	settingInfo['img_quality'] = $("#txt_imgQua option:selected").val();
	settingInfo['role'] = $("#txt_role option:selected").val();

	var vissettings = new Tbl_VISSetting(this.app)
	vissettings.update(settingInfo, success, error);

	var success = function() {
		app.appCache.updateSettingInfo(settingInfo);
	};
	var error = function() {
	};
}

SettingsPage.prototype.onOrgChange = function(event, ui) {
	$("#txt_warehouse").empty();
	var org_id = $("#txt_organization").val();
	if (org_id == 0) {
		for ( var i = 0; i < app.appcache.warehouseList.length; i++) {
			console.log(app.appcache.warehouseList[i].name);
			$("#txt_warehouse").append(
					$("<option></option>").val(
							app.appcache.warehouseList[i].warehouseid).html(
							app.appcache.warehouseList[i].name));
		}
	} else {
		for ( var i = 0; i < app.appcache.warehouseList.length; i++) {
			var result = $.grep(app.appcache.warehouseList, function(e) {
				return e.orgid == org_id;
			});
			for ( var i = 0; i < result.length; i++) {
				console.log(result[i].name);
				$("#txt_warehouse").append(
						$("<option></option>").val(result[i].warehouseid).html(
								result[i].name));
			}
		}
	}
}