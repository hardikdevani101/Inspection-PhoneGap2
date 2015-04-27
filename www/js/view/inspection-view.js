var InspLinesPage = function(app) {
	this.app = app;
}

InspLinesPage.prototype.init = function() {
	var _self = this;
	$('#pg_inspection div h1').append(_self.app.appCache.loginInfo.username);
	_self.loadMRLines();
	$(document).on('click', '#_list_mrlines div ul', function() {
		console.log($(this).data("id"));
		_self.loadInspLines({
			'm_inoutline_id' : $(this).data("id")
		});
	});
}

InspLinesPage.prototype.loadMRLines = function() {
	var _self = this;
	var visionApi = new VisionApi(_self.app);
	var success = function(result) {
		console.log(result.mrlines);
		var items = '';
		$
				.each(
						result.mrlines,
						function() {
							
							var line = '<div data-role="collapsible"><h2>'
								+ this.label
								+ '</h2><ul id="mrline_'
								+ this.m_inoutline_id
								+ '" data-role="listview" data-split-icon="gear" data-split-theme="a" data-count-theme="b" data-id="'
								+ this.m_inoutline_id
								+ '" data-inset="true" class="ui-grid-b"></ul></div>';
							
							
//							var line = '<li id="mrline_'
//									+ this.m_inoutline_id
//									+ '" data-corners="false" data-shadow="false" data-iconshadow="false" data-wrapperels="div" '
//									+ 'data-icon="arrow-r" data-iconpos="right" data-theme="b"><a href="#" data-id="'
//									+ this.m_inoutline_id + '">' + this.label
//									+ '</a></li>';
							items = items + line;
						});
		$('#_list_mrlines').html(items);
		console.log($('#_list_mrlines').html());
		$('#_list_mrlines').toggle().toggle();
		if (result.mrlines.length > 0) {
			_self.loadInspLines({
				'm_inoutline_id' : result.mrlines[0].m_inoutline_id
			});
		} else {
			_self.loadInspLines();
		}
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
	}
	var _self = this;
	var visionApi = new VisionApi(_self.app);
	var success = function(result) {
		var items = '';
//		$
//				.each(
//						result.insplines,
//						function() {
//							var line = '<div data-role="collapsible"><h2>'
//									+ this.name
//									+ '</h2><ul id="insp_'
//									+ this.x_instructionline_id
//									+ '" data-role="listview" data-split-icon="gear" data-split-theme="a" data-count-theme="b" data-id="'
//									+ this.x_instructionline_id
//									+ '" data-inset="true" class="ui-grid-b"></ul><a href="#listitem_actions" data-rel="popup"'
//									+'data-transition="flip">Add</a></div>';
//
//							items = items + line;
//						});
//		$('#_list_insplines').html(items);
//		$('#_list_insplines').listview().listview('refresh');
		$.mobile.changePage("#pg_inspection", {
			transition : "slide",
			changeHash : false
		});
	}
	visionApi.getInspLines({
		m_inoutline_id : sel_inoutline_id
	}, success, function() {
		console.log("Inspection lines failed");
	});
}