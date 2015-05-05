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
	
	//$.mobile.allowCrossDomainPages=true;	
	$.mobile.allowCrossDomainPages = true;
	$.support.cors = true;
	$.mobile.loadingMessage="Loading..";
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
	// _self.fileUtil = new FileUtils(_self);

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
	
	$(document).on("click", "#btn_logout", function(event) {		
		//TODO Clear Session
		_self.appCache.reset();
		
		$.mobile.changePage("#pg_login", {
			transition : "slide",
			changeHash : false
		});
	});
};

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