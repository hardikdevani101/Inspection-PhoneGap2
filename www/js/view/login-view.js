var LoginPage = function(app) {
	this.app = app;
};

LoginPage.prototype.onLogin = function() {
	try {
		this.visionApi=new VisionApi(this.app);
		this.visionApi.login({
			username : $("#txt_user").val(),
			password : $("#txt_password").val()
		}, function(result) {
			if(result.loginInfo.error){
				alert(result.loginInfo.error);
			}else{
				app.appCache.loginInfo['username'] = $("#txt_user");
				app.appCache.loginInfo['password'] = $("#txt_password");
				app.appCache.loginInfo['userid'] = result.loginInfo.ad_user_id;
				
				var visSettingsDAO = new Tbl_VISSetting(this);
				visSettingsDAO.login("Y", function(data) {
					console.log("DB-Login Success!")
				}, function(msg) {
					console.log("DB-Login Failed!")
				});
				
				$(':mobile-pagecontainer').pagecontainer('change', '#pg_home', {
					reload : false
				})
			}
		}, function() {
			console.log("Login failed");
		});

	} catch (error) {
		console.log("Login failed" + error);
	}
};

LoginPage.prototype.init = function() {
	var _self = this;
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
				required : "Required Field!."
			},
			txt_password : {
				required : "Required Field!."
			}
		},
		errorPlacement : function(error, element) {
			//error.appendTo(element.parent().prev());
			element.attr("placeholder","Required Field!");
			element.attr("style","border:1px solid red;");
		},
		invalidHandler : function() {
			alert("invalid form"); // for demo
		},
		submitHandler : function(form) {
			_self.onLogin();
			return false;
		}
	});
}
