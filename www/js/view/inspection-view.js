var InspLinesPage = function(app) {
	this.app = app;
}

InspLinesPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#pg_inspection #btn_user').html(
			$(_self.app.appCache.loginInfo.username).val());
};

InspLinesPage.prototype.init = function() {
	var _self = this;
	// $('#pg_inspection div h2').text(
	// String(_self.app.appCache.loginInfo.username));
	// _self.loadMRLines();
	$(document).on("pagebeforeshow", "#pg_inspection", function() {
		_self.rederBreadCrumb();
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
		var line = '<li data-mini="true"><a  data-mini="true" id="mrline_'
				+ this.m_inoutline_id + '" data-id="' + this.m_inoutline_id
				+ '">' + this.label + ' / ' + this.desc + '</a></li>';
		items = items + line;
	});

	$('#_list_mrlines').html(items);
	$('#_list_mrlines').listview("refresh");

	$('#_list_mrlines li a').on('click', function() {
		console.log($(this).data("id"));
		_self.app.appCache.session.m_inoutline_id = $(this).data("id");
		$.mobile.changePage("#pg_inspection_detail");
	});

	$('#btn_finish_mr').on('click', function() {
		_self.onFinishedCalled();
	});
	$('#btn_sync_insp').on('click', function() {
		_self.onSyncCalled();
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
};
InspLinesPage.prototype.updateInspLinesDetail = function() {

};
InspLinesPage.prototype.renderInspLines = function() {
	var _self = this;
	var sel_inoutline_id = _self.app.appCache.session.m_inoutline_id;
	var items = '';
	function mrLine(element, index, array) {
		return (element.m_inoutline_id == sel_inoutline_id);
	}
	var mr_lines = _self.app.inspLinePage.mrLines.filter(mrLine);
	if (mr_lines.length > 0) {
		$('#inspMRDetail').html(mr_lines[0].label);
		$('#prefixInpectLine').html(mr_lines[0].desc);
	}
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
					$.mobile.changePage("#pg_gallery");
				});
	}
	_self.app.hideDialog();
};

InspLinesPage.prototype.rederInspLinesDetailsBreadCrumb = function() {
	var _self = this;
	$('#pg_inspection_detail #btn_user').html(
			$(_self.app.appCache.loginInfo.username).val());
};

InspLinesPage.prototype.onSyncCalled = function() {
	var _self = this;
	var success = function(tx, results) {
		if (results.rows.length > 0) {
			for (var i = 0; i < results.rows.length; i++) {
				_self.app.appFS.uploadFile(results.rows.item(i).file,
						results.rows.item(i).mr_line,
						results.rows.item(i).insp_line,
						results.rows.item(i).in_out_id);
			}
		} else {
			alert("Completed");
		}
	};
	_self.app.appDB.getUploadFailedEntry(success);
}

InspLinesPage.prototype.onFinishedCalled = function() {
	var _self = this;
	var onUploadedEntrySucess = function(tx, results) {
		if (results.rows.length > 0) {
			var attachmentList = [];
			for (var i = 0; i < results.rows.length; i++) {
				var item = {};
				if (results.rows.item(i).insp_line == null
						|| results.rows.item(i).insp_line == 0) {
					item['id'] = results.rows.item(i).in_out_id;
					item['type'] = 0;
				} else {
					item['id'] = results.rows.item(i).insp_line;
					item['type'] = 1;
				}
				item['files'] = results.rows.item(i).name;

				var isUpdated = false;
				$.each(attachmentList, function() {
					if (this.id == item['id']) {
						this.files = this.files + "," + item['files'];
						isUpdated = true;
					}
				});

				if (!isUpdated) {
					attachmentList.push(item);
				}
			}

			var visService = new VisionApi(app);
			$.each(attachmentList, function() {
				if (this.type == 1) {
					visService.uploadImage({
						imginspline : this.id,
						imgname : this.files
					}, function(param) {
						_self.app.appDB.onAttachSucess(param);
					});
				} else {
					visService.uploadImageByMInOut({
						recid : this.id,
						tabname : 'M_InOut',
						imgname : this.files
					}, function(param) {
						_self.app.appDB.onAttachSucess(param);
					});
				}
			});

		} else {
			alert("Uploaded");
		}
	};

	var onFailedUplodEntrysuccess = function(tx, results) {
		if (results.rows.length > 0) {
			alert("Please first sync all files");
		} else {
			_self.app.appDB.getAttachPendingEntry(onUploadedEntrySucess);
		}
	};
	_self.app.appDB.getUploadFailedEntry(onFailedUplodEntrysuccess);
};

InspLinesPage.prototype.loadInspLines = function(params) {
	var _self = this;
	_self.rederInspLinesDetailsBreadCrumb();
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
