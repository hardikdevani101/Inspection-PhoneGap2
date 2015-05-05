var InspLinesPage = function(app) {
	this.app = app;
}

InspLinesPage.prototype.init = function() {
	var _self = this;
	// $('#pg_inspection div h2').text(
	// String(_self.app.appCache.loginInfo.username));
	// _self.loadMRLines();
	$(document).on("pagebeforeshow", "#pg_inspection", function() {
		_self.loadMRLines();
		$('#btn_refresh_mrlines').on("click", function() {
			_self.app.appCache.mrLines = [];
			_self.loadMRLines();
		});
	});

	$(document).on("pagebeforeshow", "#pg_inspection_detail", function() {
		_self.loadInspLines({
			'selected_mrline' : _self.app.appCache.session.m_inoutline_id
		});
		$('#btn_sync_insp').on("click", function() {
			_self.app.appCache.inspLines = [];
			_self.syncInspLines();
		});
	});
}

InspLinesPage.prototype.syncInspLines = function() {
	
}

InspLinesPage.prototype.renderMRLines = function() {
	var _self = this;
	var items = '';
	$.each(_self.app.appCache.mrLines, function() {
		var line = '<li><a id="mrline_' + this.m_inoutline_id + '" data-id="'
				+ this.m_inoutline_id + '">' + this.label + ' / ' + this.desc
				+ '</a></li>';
		items = items + line;
	});

	$('#_list_mrlines').html(items);
	$('#_list_mrlines').listview("refresh");

	$('#_list_mrlines li a').on('click', function() {
		console.log($(this).data("id"));
		_self.app.appCache.session.m_inoutline_id = $(this).data("id");
		$.mobile.changePage("#pg_inspection_detail", {
			transition : "slide",
			changeHash : false
		});
	});

	$.mobile.changePage("#pg_inspection", {
		transition : "slide",
		changeHash : false
	});

	$.mobile.loading('hide');
}

InspLinesPage.prototype.loadMRLines = function() {
	var _self = this;
	var visionApi = new VisionApi(_self.app);
	// _self.app.showDialog('Loading MR Lines');
	$.mobile.loading('show');
	if (_self.app.appCache.mrLines.length > 0) {
		_self.renderMRLines();
	} else {
		var success = function(result) {
			var items = '';
			_self.mrLines = result.mrlines;
			_self.insp_lines = [];
			_self.app.appCache.mrLines = result.mrlines;
			_self.renderMRLines();
		};

		visionApi.getMRLines({
			userid : app.appCache.loginInfo.userid
		}, success, function() {
			// popup Errorbox.
			console.log("Load MR-lines failed");
			_self.app.hideDialog();
		});
	}
}

InspLinesPage.prototype.renderInspLines = function() {
	var _self = this;
	var sel_inoutline_id = _self.app.appCache.session.m_inoutline_id;
	var items = '';
	if (!(typeof _self.app.appCache.inspLines[sel_inoutline_id] === 'undefined')
			&& _self.app.appCache.inspLines[sel_inoutline_id].length > 0) {
		$.each(_self.app.appCache.inspLines[sel_inoutline_id], function() {
			var line = '<li><a id="inspline_' + this.x_instructionline_id
					+ '" data-id="' + this.x_instructionline_id + '">'
					+ this.name + '</a></li>';
			items = items + line;
		});
		$('#_list_insp').html(items);
		$('#_list_insp').listview("refresh");
		$('#_list_insp li a').on(
				'click',
				function() {
					_self.app.appCache.session.x_instructionline_id = $(this)
							.data("id");
					$.mobile.changePage("#pg_gallery", {
						transition : "slide",
						changeHash : false
					});
				});
	}
	_self.app.hideDialog();
}

InspLinesPage.prototype.loadInspLines = function(params) {
	var _self = this;
	_self.app.showDialog('Loading..');
	var sel_inoutline_id = _self.app.appCache.session.m_inoutline_id;
	if (!(typeof params === 'undefined')) {
		sel_inoutline_id = params.selected_mrline;
		console.log(sel_inoutline_id);
	}

	if (!(typeof _self.app.appCache.inspLines[sel_inoutline_id] === 'undefined')) {
		_self.renderInspLines();
	} else {
		var visionApi = new VisionApi(_self.app);
		var success = function(result) {
			var items = '';
			_self.app.appCache.inspLines[sel_inoutline_id] = result.insplines
			_self.renderInspLines();
		}

		visionApi.getInspLines({
			m_inoutline_id : sel_inoutline_id
		}, success, function() {
			_self.app.hideDialog();
			console.log("Failed to Load - Inspection lines");
		});
	}
}