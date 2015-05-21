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
		this.visionApi = new VisionApi(this.app);
		this.visionApi
				.login(
						{
							username : $("#txt_user", _self.context).val(),
							password : $("#txt_password", _self.context).val()
						},
						function(result) {
							if (result.loginInfo.error) {
								_self.app.showError("pg_login",
										result.loginInfo.error);
							} else {
								_self.app.isLogin = true;
								_self.app.appCache.settingInfo['userid'] = result.loginInfo.ad_user_id;
								_self.app.appCache.settingInfo['is_login'] = true;

								var visSettingsDAO = new Tbl_VISSetting(
										_self.app);
								visSettingsDAO.login("Y", function(data) {
									console.log("DB-Login Success!")
								}, function(msg) {
									console.log("DB-Login Failed!")
								});
								_self.rederBreadCrumb();
								$(':mobile-pagecontainer').pagecontainer(
										'change', '#pg_inspection', {
											reload : false
										});
							}
							// Load More Server details.
							_self.app.settingnview.reloadServerDetail();

						}, function() {
							_self.app.showError("pg_login", "Login failed");
							console.log("Login failed");
						});

	} catch (error) {
		_self.app.showError("pg_login", "Login failed" + error);
		console.log("Login failed" + error);
	}
};

LoginPage.prototype.init = function() {
	var _self = this;

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
