var App = function() {
	this.canvas;
	this.gcanvas;
	this.boundX, 
	this.BoundY;
	this.jcrop_api;
	this.finalSelection;
	this.crop_img;
	this.userName = "";
	this.INSPECTOR_ID;
	this.M_InOutLine_ID = 0;
	this.M_line_name;
	this.X_INSTRUCTIONLINE_ID;
	this.M_INOUT_ID = 0;
	this.M_Line_Desc = "";
	this.X_instruction_name;
	this.vis_pass;
	this.Disp_row;
	this.Disp_col;
	this.SelectedGalleryList;
	this.attachCount;
	this.itemCount;
	this.imgUploadCount = 0;
	this.mrLinesArray = new Array();
	this.backPage;
	this.galleryTable = "";
	this.totColumns = 0;
	this.pageState = 0;
	this.deleteCount = 0;
	this.inspLinesArray = new Array();
	this.pandingUploads = new Array();
	this.pandingCounts = 0;
	this.currentPage = "";
	this.warehouseListArray = new Array();
	this.cropImageW; 
	this.cropImageH;
	this.scrollHeight;
	this.canX = 0;
	this.canY = 0;
	this.canX1 = 0;
	this.canY1 = 0;
	this.actArray;
	this.aNo = -1;
	this.editCtx;
	this.bValue = 50;
	this.cValue = 50;
};

App.prototype.init = function() {
	//this.onDeviceReady();
};

App.prototype.onDeviceReady = function() {
	this.dbstore = new DB();
	this.dbstore.init();
	this.appCache = new AppCache();
	
	navigator.webkitPersistentStorage.requestQuota(1024*1024, 
	        function(grantedBytes) {
	            window.requestFileSystem(window.PERSISTENT, grantedBytes, onInitFs, errorHandler);
	        }, 
	        function(errorCode) {
	            alert("Storage not granted.");
	        }
	);
	// window.RequestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem; 
	// window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileFunction.setRootDirectory, app.error);
	var _self=this;

	$(document).on( "pagecreate", "#pg_login", function( event ) {
		_self.loginview = new LoginPage(this,event);
		_self.loginview.init();
		_self.appcache.addPage('pg_login',_self.loginview);
	});

	$(document).on( "pagecreate", "#pg_inspection", function( event ) {
		_self.inspLinePage = new InspLinePage(this,event);
		_self.inspLinePage.init();
		_self.appcache.addPage('pg_inspection',_self.inspLinePage);

	});
	
	$( document ).on( "pagecreate", "#pg_settgins", function( event ) {
		_self.settingsview = new SettingsPage(this,event);
		_self.settingsview.init();
		_self.appcache.addPage('pg_settgins',_self.settingsview);
	});
	
	$( document ).on( "pagecreate", "#pg_aboutus", function( event ) {
		_self.aboutusview = new AboutUsPage(this,event);
		_self.aboutusview.init();
		_self.appcache.addPage('pg_aboutus',_self.aboutusview);
	});

};

App.prototype.loadPage = function(id1) {
	document.getElementById("txt_user").value = setting.userName;
	if (id1 == 'exit') {
		navigator.app.exitApp();
	} else {
		document.getElementById("disp").innerHTML = document
				.getElementById(id1).innerHTML;
		this.currentPage = id1;
	}
};

App.prototype.onLoginpage = function() {
	app.loadPage("login");
	document.getElementById("txt_user").value = userName;
	pageState = 0;
	document.getElementById("login_error").innerHTML = "";
}

App.prototype.onSettingPage = function() {
	app.loadPage("setting");
	document.getElementById("setting_error").innerHTML = "";
	settingPage.setSettingpage();
}

App.prototype.onBackButton = function() {
	if (this.currentPage == 'login') {
		function checkButtonSelection(iValue) {
			if (iValue == 2) {
				navigator.app.exitApp();
			}
		}
		navigator.notification.confirm("Are you sure you want to EXIT ?",
				checkButtonSelection, 'EXIT APP:', [ 'Cancel', 'OK' ]);
	} else if (currentPage == 'home') {
		app.loadPage("login");
		document.getElementById("txt_user").value = userName;
	} else if (currentPage == 'startNewInsp') {
		app.loadPage("home");
	} else if (currentPage == 'gallery') {
		app.onBackToStartInspection('gallery');
	} else if (currentPage == 'SelectGallery') {
		app.backToGallery();
	} else if (currentPage == 'fileExpo') {
		app.backToGallery();
	} else if (currentPage == 'ftpExplorer') {
		app.backToGallery();
	} else if (currentPage == 'cropView') {
		app.backToGallery();
	} else if (currentPage == 'setting') {
		app.onLoginpage();
	} else if (currentPage == 'aboutUs') {
		app.onLoginpage();
	} else if (currentPage == 'editView') {
		app.onBackToCropView();
	} else {
		navigator.app.backHistory();
	}
};

App.prototype.validateLogin = function() {
	var u_name = document.getElementById("txt_user").value;
	var u_pass = document.getElementById("txt_password").value;
	if (u_name == "" || u_name == null) {
		document.getElementById("login_error").innerHTML = "Username Should Not Blank";
		document.getElementById("txt_user").focus();
	} else if (u_pass == "" || u_pass == null) {

		document.getElementById("login_error").innerHTML = "Password Should Not Blank";
		document.getElementById("txt_password").focus();
	} else {
		app.userName = u_name;
		app.vis_pass = u_pass;
		onLogin();
	}
}

App.prototype.error = function(error) {
	console.log("Error = " + error);
};