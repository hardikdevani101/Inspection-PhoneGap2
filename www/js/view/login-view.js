var LoginPage = function (app,event) {
	this.app = app;
	this.event = event;
};

LoginPage.prototype.onLogin=function() {	
	var visionapi = new VisionApi(this.app);
	visionapi.login({username:$("#username"),password:$("#password")},success,error);
	
	var success= function(result){
		app.appcache.userinfo['username']=$("#username");
		app.appcache.userinfo['password']=$("#password");
		app.appcache.userinfo['userid']=result.userinfo.ad_user_id;
		app.appcache.userinfo['fname']=result.userinfo.name;
	}
	
	var error=function(){		
	
	}
}; 

LoginPage.prototype.init = function() {
	
}
