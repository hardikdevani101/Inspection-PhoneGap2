var Preference = function(app) {
	this.app = app;
	this.context = '_PreferencePopup';
	
}

Preference.prototype.init = function(pageId) {
	var _self = this;
	_self.pageId = pageId;
	_self.contextPage = $('#'+pageId+ _self.context);
	_self.el_imgQua = $('#' + pageId + "_txt_imgQua", self.contextPage);
	_self.el_txEditor = $('#' + pageId + "_txt_editApp", self.contextPage);

	_self.contextPage.on("panelbeforeopen", function(event, ui) {
		console.log("panelbeforeopen");
		var setting = _self.app.appCache.settingInfo;
		_self.el_imgQua.val(setting.img_quality).attr('selected', true)
				.siblings('option').removeAttr('selected');
		_self.el_imgQua.selectmenu('refresh', true);
		_self.el_txEditor.val(setting.img_editor).attr('selected', true)
				.siblings('option').removeAttr('selected');
		_self.el_txEditor.selectmenu("refresh", true);
		// $('.ui-popup-screen').off();
		event.preventDefault();
		return false;
	});

	_self.contextPage.on('panelclose', function(event, ui) {
		console.log("Pop Up close");
		event.preventDefault();
	});

	$('#btn_preference_close', _self.contextPage).on('click', function(event) {
		$('#'+ pageId + _self.context).panel("close");
		event.preventDefault();
	});
	
	$("#_form_preferences").on("keypress", "input", function(e) {
		if (e.which === 13) {
			if ($('#_form_preferences', _self.contextPage).valid()) {
				$('#_form_preferences', _self.contextPage).submit();
			}
			return false;
		}
	});

	$('#_form_preferences', _self.contextPage).validate({
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


Preference.prototype.onUpdate = function() {
	var _self = this;
	var settingInfo = _self.app.appCache.settingInfo;

	settingInfo['img_quality'] = $(
			'#' + _self.pageId + "_txt_imgQua option:selected",
			_self.contextPage).val();
	settingInfo['img_editor'] = $(
			'#' + _self.pageId + "_txt_editApp option:selected",
			_self.contextPage).val();

	var error = function(msg) {
		_self.app.showError("pg_settings",
				"Error: PreferenceInfo Update Failed-" + msg)
	};

	_self.app.visSettingsDAO.updatePreference(settingInfo, function(data) {
		_self.app.appCache.updateSettingInfo(settingInfo);
		$('#' + _self.pageId + _self.context).panel("close");
	}, error);

}