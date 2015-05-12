var LoginPage = function(app) {
	this.app = app;
};
LoginPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#pg_home #btn_user')
			.html($(_self.app.appCache.loginInfo.username).val());
};
LoginPage.prototype.onLogin = function() {
	var _self = this;
	try {
		this.visionApi = new VisionApi(this.app);
		this.visionApi.login({
			username : $("#txt_user").val(),
			password : $("#txt_password").val()
		}, function(result) {
			if (result.loginInfo.error) {
				alert(result.loginInfo.error);
			} else {
				app.appCache.loginInfo['username'] = $("#txt_user");
				app.appCache.loginInfo['password'] = $("#txt_password");
				app.appCache.loginInfo['userid'] = result.loginInfo.ad_user_id;
				app.appCache.settingInfo['is_login'] = true;

				var visSettingsDAO = new Tbl_VISSetting(this);
				visSettingsDAO.login("Y", function(data) {
					console.log("DB-Login Success!")
				}, function(msg) {
					console.log("DB-Login Failed!")
				});
				_self.rederBreadCrumb();
				$(':mobile-pagecontainer').pagecontainer('change',
						'#pg_inspection', {
							reload : false
						});
			}
			// Load More Server details.
			_self.app.settingnview.reloadServerDetails()

		}, function() {
			console.log("Login failed");
		});

	} catch (error) {
		console.log("Login failed" + error);
	}
};

LoginPage.prototype.init = function() {
	var _self = this;
	$(document).on("pagebeforeshow", "#pg_login", function() {
		$('#pg_login .ui-content').css('margin-top', $('#pg_login').height() / 2);
	});

	var visionapi = new VisionApi(this.app);
	$('#_form_login').validate({
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
			$("#login-error-box").html(error);
			//			
			// element.attr("placeholder", error);
			// element.attr("style", "border:1px solid red;");
		},
		invalidHandler : function() {
			$("#login-error-box").popup("open", {
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
