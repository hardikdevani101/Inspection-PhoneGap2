var App = function() {
	this.dataTypes = [ "JPEG", "JPG", "BMP", "PNG", "GIF" ];
};

App.prototype.onDeviceReady = function() {

	$.mobile.allowCrossDomainPages = true;
	$.support.cors = true;
	$.mobile.loadingMessage = "Loading..";

	if (navigator.userAgent.indexOf("Android") != -1) {
		$.mobile.defaultPageTransition = 'none';
		$.mobile.defaultDialogTransition = 'none';
		$("a").attr("data-transition", "none");
		$.mobile.touchOverflowEnabled = true;
		$.fn.buttonMarkup.defaults.corners = false;
	}

	var _self = this;
	// Initialize Application Cache on page load.
	_self.appCache = new AppCache(_self);
	_self.appCache.init();

	// Initialize FTP Util.
	_self.appFTPUtil = new FTPUtils(_self);
	_self.appFTPUtil.init();

	// Initiate database-storage on page load.
	_self.appDB = new DB(_self);
	_self.appDB.init(function() {

	}, function(msg) {
		console.log("App Init Error - " + msg)
	});

	// Initiate file-storage on page load.
	app.appFS = new FS(app);
	app.appFS.init();

	_self.register();
};

App.prototype.loadWaterMarkFiles = function() {
	var _self = this;
	$.each(_self.appCache.waterMarkImgs, function() {
		var _self_waterMark = this;
		var xhr = new XMLHttpRequest();
		xhr._url = _self_waterMark.url;
		xhr.open('GET', _self_waterMark.url, true);
		xhr.responseType = 'blob';
		xhr.onreadystatechange = _self.loadImageFileSuccess;
		xhr.send();
	});
};

App.prototype.loadImageFileSuccess = function() {
	var xhrObj = this;
	if (xhrObj.readyState == 4 && xhrObj.status == 200) {
		$.each(app.appCache.waterMarkImgs, function() {
			if (xhrObj._url == this.url) {
				this['data'] = xhrObj.response;
			}
		});
	}
}

App.prototype.error = function(error) {
	console.log("Error = " + error);
};

App.prototype.showDialog = function(msg) {
	$.mobile.loading('show', {
		text : msg,
		textVisible : true,
		theme : 'b',
		html : ""
	});
};

App.prototype.hideDialog = function() {
	$.mobile.loading("hide");
};

App.prototype.register = function() {
	var _self = this;
	$(document).on("pagecreate", "#pg_login", function(event) {
		console.log("Login Called");
		_self.loginview = new LoginPage(_self);
		_self.loginview.init();
		_self.appCache.addPage('pg_login', _self.loginview);
		_self.settingnview = new SettingsPage(_self);
		_self.settingnview.init();
	});

	$(document).on("pagecreate", "#pg_inspection", function(event) {
		_self.inspLinePage = new InspLinesPage(_self);
		_self.inspLinePage.init();
		_self.appCache.addPage('pg_inspection', _self.inspLinePage);
	});

	$(document).on("pagecreate", "#pg_home", function(event) {
		var visionApi = new VisionApi(_self);
		visionApi.getWaterMarkList(function(data) {
			_self.appCache.waterMarkImgs = data.responce;
			_self.loadWaterMarkFiles();
		}, function() {
			console.log("Error");
		});
	});

	$(document).on("pagecreate", "#pg_aboutus", function(event) {
		_self.aboutusview = new AboutUsPage(_self);
		_self.aboutusview.init();
		_self.appCache.addPage('pg_aboutus', _self.aboutusview);
	});

	$(document).on("pagecreate", "#pg_inspectionDetail", function(event) {
		console.log("pg_inspectionDetail");
		console.log(_self.appCache.session.m_inoutline_id);
		_self.inspLinePage.loadInspLines({
			m_inoutline_id : _self.appCache.session.m_inoutline_id
		});
	});

	$(document).on("pagecreate", "#pg_gallery", function(event) {
		_self.galleryview = new GalleryPage(_self);
		_self.galleryview.init(_self.appCache.session.x_instructionline_id);
		_self.appCache.addPage('pg_gallery', _self.galleryview);
	});

	$(document).on("pagecreate", "#pg_file_explorer", function(event) {
		_self.fileExplorer = new FileExplorerPage(_self);
		_self.fileExplorer.init();
		_self.appCache.addPage('pg_file_explorer', _self.fileExplorer);
	});

	$(document).on("click", "#btn_logout", function(event) {
		// TODO Clear Session
		_self.appCache.reset();

		$.mobile.changePage("#pg_login", {
			transition : "slide",
			changeHash : false
		});
	});
}

// Initialize application.

var app = new App();
app.onDeviceReady();

$(document).ready(function() {
	console.log('DOM ready called!!')
	console.log('User Agent!!' + navigator.userAgent)
	// app.onDeviceReady();

	if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
		console.log('Registered deviceready listener!!')
		//$(document).bind("mobileinit", app.onDeviceReady());
		document.addEventListener("deviceready", function(){
			app.appFS = new FS(app);
			app.appFS.init();
		}, false);
	} else {
		console.log('Explicitly called onDeviceReady!!')
		app.onDeviceReady();
	}

});
