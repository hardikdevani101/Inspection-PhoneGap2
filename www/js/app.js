var App = function() {
	this.canvas;
	this.gcanvas;
	this.boundX, BoundY;
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
	this.cropImageW, cropImageH;
	this.scrollHeight;
	this.canX = 0, canY = 0, canX1 = 0, canY1 = 0;
	this.actArray;
	this.aNo = -1;
	this.editCtx;
	this.bValue = 50, cValue = 50;
};

var app = new App()
{
};

App.prototype.init = function() {
};

App.prototype.onLoad = function() {
	document.addEventListener("deviceready", app.onDeviceReady, false);
	document.addEventListener("backbutton", app.onBackButton, false);
};

App.prototype.onDeviceReady = function() {
	db = window.openDatabase("vis_inspection", "1.0", "vis_inspection", 100000);
	db.transaction(dbf.settingDbSetup, dbf.errorCB, dbf.loadSetting);
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
			fileFunction.setRootDirectory, app.error);
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

App.prototype.openPage = function() {

};

App.prototype.performaAction = function() {

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