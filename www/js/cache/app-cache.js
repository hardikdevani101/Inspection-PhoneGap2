var AppCache = function(app) {
	console.log("New AppCache");
	this.app = app;
	this.session = {
		m_inoutline_id : '',
		x_instructionline_id : ''
	}
	this.warehouseList = [];
	this.orgList = [];
	this.roleList = [];
	this.settingInfo = {};
	this.loginInfo = {};
	this.appInfo = {};
	this.pages = [];
	this.ftpServers = [];
	this.localStorage = [ {
		data : {},
		url : '/'
	} ];
	this.mrLines = [];
	this.inspLines = {};
	this.prefixCache = {};
	this.imgCache = {};
	this.inspFiles = {};
	this.waterMarkImgs = [];
}

AppCache.prototype.reset = function() {
	this.session = {
		m_inoutline_id : '',
		x_instructionline_id : ''
	}
	this.settingInfo.is_login = false;
	this.settingInfo.isWaterMarkLoaded = false;
	this.appInfo = {};
	this.loginInfo = {};
	this.pages = [];
	this.localStorage = [ {
		data : {},
		url : '/'
	} ];

	this.prefixCache = {};
	// this.ftpServers = [];
	this.mrLines = [];
	this.inspLines = {};
	this.inspFiles = {};
	this.waterMarkImgs = [];
}

AppCache.prototype.addPage = function(pageid, page) {
	var _self = this
	var result = $.grep(_self.pages, function(e) {
		return e.pageid == pageid;
	});
	if (result.length == 0) {
		_self.pages.push({
			pageid : pageid,
			page : page
		});
	}
}

AppCache.prototype.init = function() {
	this.appInfo = {};

	this.warehouseList.push({
		orgid : "1000001",
		warehouseid : "1000045",
		name : "Singapore PreSold in Amsterdam"
	}, {
		orgid : "1000001",
		warehouseid : "1000009",
		name : "Singapore PreSold in Austin"
	}, {
		orgid : "1000001",
		warehouseid : "1000007",
		name : "Singapore PreSold in Singapore"
	}, {
		orgid : "1000001",
		warehouseid : "1000046",
		name : "Singapore Stock in Amsterdam"
	}, {
		orgid : "1000001",
		warehouseid : "1000008",
		name : "Singapore Stock in Austin"
	}, {
		orgid : "1000001",
		warehouseid : "1000006",
		name : "Singapore Stock in Singapore"
	});
	this.warehouseList.push({
		orgid : "1000003",
		warehouseid : "1000043",
		name : "Austin PreSold in Amsterdam"
	}, {
		orgid : "1000003",
		warehouseid : "1000011",
		name : "Austin PreSold in Austin"
	}, {
		orgid : "1000003",
		warehouseid : "1000013",
		name : "Austin PreSold in Singapore"
	}, {
		orgid : "1000003",
		warehouseid : "1000044",
		name : "Austin Stock in Amsterdam"
	}, {
		orgid : "1000003",
		warehouseid : "1000003",
		name : "Austin Stock in Austin"
	}, {
		orgid : "1000003",
		warehouseid : "1000002",
		name : "Austin Stock in Singapore"
	});
	this.warehouseList.push({
		orgid : "1000019",
		warehouseid : "1000037",
		name : "Amsterdam Stock in Amsterdam"
	}, {
		orgid : "1000019",
		warehouseid : "1000038",
		name : "Amsterdam PreSold in Austin"
	}, {
		orgid : "1000019",
		warehouseid : "1000039",
		name : "Amsterdam PreSold in Singapore"
	}, {
		orgid : "1000019",
		warehouseid : "1000040",
		name : "Amsterdam Stock in Amsterdam"
	}, {
		orgid : "1000019",
		warehouseid : "1000041",
		name : "Amsterdam Stock in Austin"
	}, {
		orgid : "1000019",
		warehouseid : "1000042",
		name : "Amsterdam Stock in Singapore"
	});
	this.warehouseList.push({
		orgid : "1000020",
		warehouseid : "1000054",
		name : "Japan PreSold in Japan"
	}, {
		orgid : "1000020",
		warehouseid : "1000055",
		name : "Japan Stock in Japan"
	}, {
		orgid : "1000025",
		warehouseid : "1000057",
		name : "FE-MADC"
	}, {
		orgid : "1000026",
		warehouseid : "1000058",
		name : "FE-EMEADC"
	}, {
		orgid : "1000027",
		warehouseid : "1000059",
		name : "FE-APDC"
	});

	this.orgList.push({
		orgid : "1000019",
		name : "Amsterdam"
	}, {
		orgid : "1000003",
		name : "Austin"
	}, {
		orgid : "1000020",
		name : "Japan"
	}, {
		orgid : "1000001",
		name : "Singapore"
	}, {
		orgid : "1000024",
		name : "FE Global"
	}, {
		orgid : "1000025",
		name : "FE MADC"
	}, {
		orgid : "1000026",
		name : "FE EMEADC"
	}, {
		orgid : "1000027",
		name : "FE APDC"
	});

	this.roleList.push({
		roleid : "1000138",
		name : "FE QA Manager"
	}, {
		roleid : "1000139",
		name : "FE QA Team"
	}, {
		roleid : "1000043",
		name : "Warehouse QA Team"
	}, {
		roleid : "1000055",
		name : "Warehouse QA Manager"
	}, {
		roleid : "1000044",
		name : "Warehouse Manager"
	}, {
		roleid : "1000052",
		name : "Warehouse IC Team"
	}, {
		roleid : "1000054",
		name : "Warehouse IC Manager"
	}, {
		roleid : "1000000",
		name : "Velocity Admin"
	});

	this.settingInfo = {
		'username' : '',
		'password' : '',
		'service_url' : '',
		'org_id' : '',
		'role' : '',
		'client_id' : '',
		'warehouse_id' : '',
		'img_quality' : '',
		'lang' : '',
		'watermark' : ''
	};

	this.loginInfo = {
		username : '',
		userid : '',
		password : '',
		fname : ''
	};
}

AppCache.prototype.updateSettingInfo = function(settingInfo) {
	this.settingInfo = settingInfo;
}
