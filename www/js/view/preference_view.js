var PreferencePage = function(app) {
	this.app = app;
	this.context = "#preferenceMenu";
}

PreferencePage.prototype.init = function() {
	var _self = this;
	_self.contextPage = $("#preferenceMenu");
	_self.el_imgQua = $("#txt_imgQua", _self.context);
	_self.el_txEditor = $("#txt_editApp", _self.context);

	_self.contextPage.on("popupbeforeposition", function(event, ui) {
		// _self.contextPage.enhanceWithin();
		var setting = _self.app.appCache.settingInfo;
		_self.el_imgQua.val(setting.img_quality).attr('selected', true)
				.siblings('option').removeAttr('selected');
		_self.el_imgQua.selectmenu("refresh", true);
		_self.el_txEditor.val(setting.img_editor).attr('selected', true)
				.siblings('option').removeAttr('selected');
		_self.el_txEditor.selectmenu("refresh", true);
		$('.ui-popup-screen').off();
		event.preventDefault();
		return false;
	});

	$('#btn_preference_close', _self.context).on('click', function(event) {
		$(_self.context).popup("close");
		event.preventDefault();
	});

	$('#_form_preferences', _self.context).validate({
		rules : {
			txt_imgQua : {
				required : true
			}
		},
		invalidHandler : function() {
		},
		messages : {

			txt_imgQua : {
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
			return false;
		}
	});
}

PreferencePage.prototype.onUpdate = function() {
	var _self = this;
	var settingInfo = _self.app.appCache.settingInfo;
	settingInfo['img_quality'] = $("#txt_imgQua option:selected", _self.context)
			.val();
	settingInfo['img_editor'] = $("#txt_editApp option:selected", _self.context)
			.val();

	var error = function(msg) {
		_self.app.showError("pg_settings",
				"Error: PreferenceInfo Update Failed-" + msg)
	};

	_self.app.visSettingsDAO.updatePreference(settingInfo, function(data) {
		_self.app.appCache.updateSettingInfo(settingInfo);
		$(_self.context).popup("close");
	}, error);

}