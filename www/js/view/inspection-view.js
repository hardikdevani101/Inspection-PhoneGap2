var InspLinesPage = function(app) {
	this.app = app;
}

InspLinesPage.prototype.init = function() {
	var _self = this;
	$('#pg_inspection div h2').text(
			String(_self.app.appCache.loginInfo.username));

	_self.loadMRLines();
}

InspLinesPage.prototype.loadMRLines = function() {
	var _self = this;
	var visionApi = new VisionApi(_self.app);
	var success = function(result) {
		var items = '';
		_self.mrLines = result.mrlines;
		_self.insp_lines = [];
		$.each(result.mrlines, function() {

			var line = '<li><a id="mrline_' + this.m_inoutline_id
					+ '" data-id="' + this.m_inoutline_id + '">' + this.label
					+ '</a></li>';
			items = items + line;
		});
		$('#_list_mrlines').html(items);
		$('#_list_mrlines').listview("refresh");
		$('#_list_mrlines li a').on('click', function() {
			console.log($(this).data("id"));
			_self.app.appCache.session.m_inoutline_id = $(this).data("id");
			$.mobile.changePage("#pg_inspectionDetail");
		});
		$.mobile.changePage("#pg_inspection", {
			transition : "slide",
			changeHash : false
		});

	};
	visionApi.getMRLines({
		userid : app.appCache.loginInfo.userid
	}, success, function() {
		console.log("MR lines failed");
	});
}

InspLinesPage.prototype.loadInspLines = function(params) {
	var sel_inoutline_id;
	if (!(typeof params === 'undefined')) {
		sel_inoutline_id = params.m_inoutline_id;
		console.log(sel_inoutline_id);
	}
	var _self = this;
	var visionApi = new VisionApi(_self.app);
	var success = function(result) {
		var items = '';
		_self.insp_lines.push({
			m_inout_id : sel_inoutline_id,
			insp_lines : result.insplines
		});
		$.each(result.insplines, function() {
			var line = '<li><a id="mrline_' + this.x_instructionline_id
					+ '" data-id="' + this.x_instructionline_id + '">'
					+ this.name + '</a></li>';
			items = items + line;
		});
		$('#_list_insp').html(items);
		$('#_list_insp').listview("refresh");
		$('#_list_insp li a').on('click', function() {
			_self.app.appCache.session.m_insp_id = $(this).data("id");
			$.mobile.changePage("#pg_gallery");
		});
	}
	visionApi.getInspLines({
		m_inoutline_id : sel_inoutline_id
	}, success, function() {
		console.log("Inspection lines failed");
	});
}