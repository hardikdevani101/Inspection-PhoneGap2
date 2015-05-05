var AppCache = function(app) {
	console.log("New AppCache");
	this.app = app;
	this.session = {
		m_inoutline_id : '',
		x_instructionline_id : ''
	}
	this.warehouseList = [];
	this.settingInfo = {};
	this.appInfo = {};
	this.pages = [];
	this.ftpServers= [];
	this.mrLines= [];
	this.inspLines= {};
	this.inspFiles= {};
}


AppCache.prototype.reset = function() {
	var _self = this
	this.app = app;
	this.session = {
		m_inoutline_id : '',
		x_instructionline_id : ''
	}
	this.warehouseList = [];
	this.settingInfo = {};
	this.appInfo = {};
	this.pages = [];
	this.ftpServers= [];
	this.mrLines= [];
	this.inspLines= {};
	this.inspFiles= {};
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
		name : "Austin Stock in Singapore"
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
		'lang' : ''
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
