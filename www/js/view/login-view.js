var LoginPage = function (app) {
	this.app = app;
//	this.event = event;
};

LoginPage.prototype.onLogin=function() {	
	var visionapi = new VisionApi(this.app);
	visionapi.login({username:$("#username"),password:$("#password")},success,error);
	
	var success= function(result){
		app.appCache.userinfo['username']=$("#username");
		app.appCache.userinfo['password']=$("#password");
		app.appCache.userinfo['userid']=result.userinfo.ad_user_id;
		
	}
	
	var error=function(){		
	
	}
}; 

LoginPage.prototype.init = function() {
	
}
