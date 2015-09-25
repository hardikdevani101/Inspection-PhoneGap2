var MenuPage = function(app) {
	this.app = app;
	this.context = "#pg_menu";
}

MenuPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#pg_menu #btn_user').html(_self.app.appCache.settingInfo.username);
};

MenuPage.prototype.init = function() {
	var _self = this;
	_self.contextPage = $(_self.context);

	_self.contextPage.on("pagebeforeshow", function() {
		_self.app.appCache.currentPage = _self.context;
		_self.rederBreadCrumb();
		setTimeout(function() {
			_self.loadLines();
		}, 10);

		_self.app.visionApi = new VisionApi(_self.app);
		_self.app.visionApi.getWaterMarkList({
			orgid : _self.app.appCache.settingInfo.org_id
		}, function(data) {
			_self.app.appCache.waterMarkImgs = data.responce;
			_self.app.loadWaterMarkFiles();
			if (_self.app.appCache.waterMarkImgs.length <= 0) {
				var item = {};
				item["url"] = "Default";
				item["name"] = "Default";
				item["isDefault"] = "N";
				item["data"] = _self.app.watermark64;
				_self.app.appCache.waterMarkImgs.push(item);
			}
		}, function() {
			_self.app.showError("pg_menu", "Error: Watermark Not Loaded");
			_self.app.appCache.waterMarkImgs = [];
			var item = {};
			item["url"] = "Default";
			item["name"] = "Default";
			item["isDefault"] = "N";
			item["data"] = _self.app.watermark64;
			_self.app.appCache.waterMarkImgs.push(item);
		});

	});

	$("#pg_menu #btn_user").on('click', function(event) {
		event.preventDefault();
		_self.app.showPreference('pg_menu');
		return false
	});

	$('#btn_refresh_mrlines', _self.context).on("click", function(event) {
		_self.app.appCache.mrLines = [];
		_self.loadLines();
		event.preventDefault();
		return false;
	});

}

MenuPage.prototype.loadLines = function() {
	var _self = this;

	_self.app.showDialog("Loading");
	if (_self.app.appCache.mrLines.length > 0) {
		_self.renderLines();
	} else {
		var success = function(result) {
			_self.insp_lines = [];
			_self.app.appCache.mrLines = result.mrlines;
			_self.renderLines();
		};

		_self.app.visionApi.getMRLines({
			userid : app.appCache.settingInfo.userid
		}, success, function(msg) {
			_self.app.showError("pg_menu",
					"Failed to load MR-lines! Check internet Connection & Server Availability."
							+ msg);
		});
	}
};

MenuPage.prototype.renderLines = function() {
	var _self = this;
	var SO = 0;
	var MR = 0;
	$.each(_self.app.appCache.mrLines, function() {
		if (this.isPickTicket == 'Y')
			SO += 1;
		else
			MR += 1;
	});

	var line = '<li data-mini="true"><a data-mini="true" data-isPick="N"> MR Lines<span class="ui-li-count">'
			+ MR
			+ '</span></a></li>'
			+ '<li data-mini="true"><a data-mini="true" data-isPick="Y"> Pick Tickets<span class="ui-li-count">'
			+ SO + '</span></a></li>';

	var el_mrlinesList = $('#_list_lines', _self.context);

	el_mrlinesList.html(line);
	el_mrlinesList.listview("refresh");
	var el_Linelinks = $('#_list_lines li a', _self.context);
	el_Linelinks.off('click');
	el_Linelinks.on('click', function(event) {
		var cIsPick = $(this).attr("data-isPick");

		_self.app.appCache.session.isPick = cIsPick;

		$.mobile.changePage("#pg_inspection");
		event.preventDefault();
		return false;
	});

	$.mobile.loading('hide');
}
