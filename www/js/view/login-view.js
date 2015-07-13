var LoginPage = function(app) {
	this.app = app;
	this.context = "#pg_login";
};

LoginPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#btn_user', _self.context).html(_self.app.appCache.settingInfo.username);
};

LoginPage.prototype.onLogin = function() {
	var _self = this;
	try {
		if (!_self.app.visionApi) {
			_self.app.visionApi = new VisionApi(_self.app);
		}
		_self.app.appCache.settingInfo['username'] = $("#txt_user",
				_self.context).val();
		_self.app.appCache.settingInfo['password'] = $("#txt_password",
				_self.context).val();
		_self.app.appCache.settingInfo['service_url'] = $("#txt_url",
				_self.context).val();

		_self.app.visionApi.onLoginVarify({
			username : _self.app.appCache.settingInfo['username'],
			password : _self.app.appCache.settingInfo['password'],
			completeUrl : _self.app.appCache.settingInfo['service_url']
		}, function() {

			$.mobile.changePage("#pg_settings");

		}, function(error) {
			_self.app.showError("pg_login", "Login failed" + error);
		});

	} catch (error) {
		_self.app.showError("pg_login", "Login failed" + error);
	}
};

LoginPage.prototype.renderServer = function() {
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

LoginPage.prototype.init = function() {
	var _self = this;
	_self.el_txURL = $("#txt_url", _self.context);

	$(document).on(
			"pagebeforeshow",
			_self.context,
			function() {
				_self.app.appCache.currentPage = _self.context;
				$("#txt_password", _self.context).val("");
				if (_self.app.appCache.settingInfo['username']) {
					$("#txt_user", _self.context).val(
							_self.app.appCache.settingInfo['username']);
				}
				_self.renderServer();
			});

	$('#btn_url_update', _self.context).on('click', function(event) {

		$.mobile.changePage("#server-setting");
		return false;
	});

	$('#_form_login', _self.context).validate({
		rules : {
			txt_user : {
				required : true
			},
			txt_password : {
				required : true
			}
		},
		messages : {
			txt_user : {
				required : "UserName is Required!."
			},
			txt_password : {
				required : "Password is Required!."
			}
		},
		errorPlacement : function(error, element) {
			// error.appendTo(element.parent().prev());
			$("#login-error-box", _self.context).html(error);
			//			
			// element.attr("placeholder", error);
			// element.attr("style", "border:1px solid red;");
		},
		invalidHandler : function() {
			$("#login-error-box", _self.context).popup("open", {
				overlayTheme : "a",
				positionTo : "#txt_user"
			});
		},
		submitHandler : function(form) {
			_self.onLogin();
			return false;
		}
	});
}
