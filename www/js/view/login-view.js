var LoginPage = function(app) {
	this.app = app;
};

LoginPage.prototype.onLogin = function() {
	var visionapi = new VisionApi(this.app);
	visionapi.login({
		username : $("#txt_user").val(),
		password : $("#txt_password").val()
	}, function(result) {
		app.appCache.userinfo['username'] = $("#txt_user");
		app.appCache.userinfo['password'] = $("#txt_password");
		app.appCache.userinfo['userid'] = result.userinfo.ad_user_id;
	}, function() {
		console.log("Login failed");
	});
};

LoginPage.prototype.init = function() {
	var _self = this;
	$("#btn_login").bind("click", function() {
		if ($('#_form_login').valid()) {
			_self.onLogin();
		}
	});
}
