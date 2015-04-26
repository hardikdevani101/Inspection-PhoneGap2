var App = function() {
	this.canvas;
	this.gcanvas;
	this.boundX, this.BoundY;
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
	this.onDeviceReady();
};

App.prototype.onDeviceReady = function() {
	var _self = this;
	//Initialize Application Cache on page load.
	_self.appCache = new AppCache(_self);
	_self.appCache.init();
	
	// Initiate database-storage on page load.
	_self.appDB = new DB(_self);
	_self.appDB.init(function() {
		var vissettings = new Tbl_VISSetting(_self.app);
		vissettings.find({}, function(setting) {
			_self.app.appCache.updateSettingInfo(setting);
		}, _self.appDB.errorCB);

	}, function(msg) {
		console.log("App Init Error - "+msg)
	});

	// Initiate file-storage on page load.
	_self.appFS = new FS(_self);
	_self.appFS.init();
	//_self.fileUtil = new FileUtils(_self);
	
	$(document).on("pagecreate", "#pg_login", function(event) {
		console.log("Login Called");
		_self.loginview = new LoginPage(_self);
		_self.loginview.init();
		_self.appCache.addPage('pg_login', _self.loginview);
		_self.settingnview = new SettingsPage(_self);
		_self.settingnview.init();
	});

	$(document).on("pagecreate", "#pg_inspection", function(event) {
		_self.inspLinePage = new InspLinePage(this, event);
		_self.inspLinePage.init();
		_self.appCache.addPage('pg_inspection', _self.inspLinePage);
	});

	$(document).on("pagecreate", "#pg_aboutus", function(event) {
		_self.aboutusview = new AboutUsPage(this, event);
		_self.aboutusview.init();
		_self.appCache.addPage('pg_aboutus', _self.aboutusview);
	});

};

App.prototype.error = function(error) {
	console.log("Error = " + error);
};