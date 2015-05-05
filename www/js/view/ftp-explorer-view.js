var FTPPage = function(app) {
	this.app = app;
	this.pgtotal = 0;
	this.pgcurrent = 0;
	this.pgcount= 0;
	this.ftpFiles= [];
};

FTPPage.prototype.loadFTPDetails = function(serverList) {
	var _self = this;
	$.each(_self.app.appCache.ftpServers, function() {
		if(_self.app.appCache.session.ftpserver && _self.app.appCache.session.ftpserver.id= this.url){
		}

		var line = '<li><a id="ftpServer_' + this.name
				+ '" data-id="' + this.url + ' "data-uname="'+this.user+'" data-password="'+this.password+'">' + this.name
				+ '</a></li>';
		items = items + line;
	});

	$('#_list_ftpservers').html(items);
	$('#_list_ftpservers').listview("refresh");
	$('#_list_ftpservers li a').on('click', function() {
		console.log($(this).data("id"));
		_self.app.appCache.session.ftpserver= {url:$(this).data("id"),uname:$(this).data("uname"),password:$(this).data("password")};
		_self.loadFTPData();
	});
}

FTPPage.prototype.loadFTPData = function(){
	var _self = this;
	if(_self.app.appCache.session.ftpserver){
		//TODO get FTP data
		var files = [];
		var dirs = [];
	}
} 

FTPPage.prototype.renderFiles=function(imgs){
	var _self = this;
	$.each(imgs, function() {
		var line = '<li><a id="ftpServer_' + this.name
		+ '" data-id="' + this.url + ' "data-uname="'+this.user+'" data-password="'+this.password+'">' + this.name
		+ '</a></li>';
		items = items + line;
	});
	$('#_swipe_container').html(items);
	$('#_swipe_container').listview("refresh");
	$('#_swipe_container img').on('click', function() {
		var elmtUrl =  $(this).data("url");
		var isSelected =false;
		$.each(_self.selectedImgs, function() {
			if(elmtUrl==this.url){
				isSelected = true;
				break;
			}
		})		
		if(isSelected){
			
		}
	});
	
}

FTPPage.prototype.init = function() {
	var _self = this;
	_self.loadFTPImages();	
	if(_self.app.appCache.ftpServers.length>0){
		_self.load(_self.app.appCache.ftpServers);
	}
	else{
		var success = function(result){
			var serverList = result.ftpservers;
			_self.loadFTPDetails(serverList);
		}
		var error = function (msg){
			console.log("Error > getting FTP Server Details:" + msg)
		}
		visionapi.getFTPServerList({'vis_org_id':app.appCache.settingInfo.org_id},success,error);
	}
}
