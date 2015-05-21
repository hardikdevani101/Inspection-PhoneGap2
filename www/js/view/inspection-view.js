var InspLinesPage = function(app) {
	this.app = app;
	this.totalPendingItems = 0;
	this.progressedItem = 0;
	this.isAlertDisplay = false;
	this.context = "#pg_inspection"
	this.contextInspDetail = "#pg_inspection_detail";

}

InspLinesPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#pg_inspection #btn_user').html(_self.app.appCache.settingInfo.username);
};

InspLinesPage.prototype.init = function() {
	var _self = this;
	_self.contextPage = $(_self.context);
	_self.el_ispProgLog = $("#insp_process_log", _self.contextInspDetail);

	_self.contextPage.on("pagebeforeshow", function() {
		_self.rederBreadCrumb();
		setTimeout(function() {
			_self.loadMRLines();
		}, 10);

		_self.el_ispProgLog.hide();
		if (_self.app.appFTPUtil.processLog.length > 0) {
			_self.el_ispProgLog.html(_self.app.appFTPUtil.processLog.length);
			_self.el_ispProgLog.show();
		}
	});

	_self.el_ispProgLog.on('tap', function() {
		$("#pop_process_log", _self.contextInspDetail).popup('open')
		event.preventDefault();
		return false;
	});

	$("#btn_retry_attach", "#insp_process_log").on('tap', function(event) {
		_self = this;
		$("#pop_process_log", _self.contextInspDetail).popup("close");
		_self.onFinishedCalled();
		event.preventDefault();
		return false
	});

	$("#btn_retry_sync", "#insp_process_log").on('tap', function(event) {
		_self = this;
		$("#pop_process_log", _self.contextInspDetail).popup("close");
		_self.syncInspLines();
		event.preventDefault();
		return false;
	});

	$("#pop_process_log", _self.contextInspDetail).bind({
		popupbeforeposition : function(event, ui) {
			var el_syncItems = $("#sync_items", "#insp_process_log");
			var items = '<li data-role="list-divider">Sync Failed</li>';
			if (_self.app.appFTPUtil.processLog) {
				items += _self.getFTPProcessLog();
			}
			el_syncItems.html(items);
			el_syncItems.listview("refresh");

			var items = '<li data-role="list-divider">Attached Failed</li>';
			if (_self.app.visionApi.processLog.attachImage) {
				items += _self.getAttacheProcessLog();
			}
			var el_attachItems = $("#attach_items", "#insp_process_log");
			el_attachItems.html(items);
			el_attachItems.listview("refresh");
			return false;
		}
	});

	$('#btn_refresh_mrlines', _self.context).on("click", function() {
		_self.app.appCache.mrLines = [];
		_self.loadMRLines();
		event.preventDefault();
		return false;
	});

	var contextPageInspDetail = $(_self.contextInspDetail);
	contextPageInspDetail.on("pagebeforeshow", function() {
		setTimeout(function() {
			_self.loadInspLines({
				'selected_mrline' : _self.app.appCache.session.m_inoutline_id
			});
		}, 10);
		event.preventDefault();
		return false;
	});

	$('#btn_sync_insp', _self.contextInspDetail).on("click", function() {
		_self.app.appCache.inspLines = [];
		_self.syncInspLines();
		event.preventDefault();
		return false;
	});

	$('#btn_finish_mr', _self.contextInspDetail).on('click', function() {
		_self.onFinishedCalled();
		event.preventDefault();
		return false;
	});
}

InspLinesPage.prototype.getFTPProcessLog = function() {
	item = '';
	$.each(_self.app.appFTPUtil.processLog, function(item, index) {
		var line = '<li data-mini="true">MRLine:' + this.M_INOUT_ID
				+ '-InspLine:' + this.X_INSTRUCTIONLINE_ID + '-File:'
				+ this.fileURI + ' -Error:' + this.error + '</li>';
		items += line;
	});
	return item;
}

InspLinesPage.prototype.getAttacheProcessLog = function() {
	item = '';
	$.each(_self.app.visionApi.processLog.attachImage, function() {
		var line = '<li data-mini="true">File Failed:' + this + '</li>';
		items += line;
	});
	return item;
}

InspLinesPage.prototype.displayAlert = function() {
	var _self = this;
	if (_self.app.appFTPUtil.processLog.length > 0) {
		$("#pop_process_log", _self.contextInspDetail).popup("open");
	} else {
		_self.app.showError("pg_inspection_detail",
				"All Files Uploaded Successfully.");
	}
}

InspLinesPage.prototype.syncInspLines = function(callBack) {
	var _self = this;
	_self.app.showDialog("Loading");
	_self.inProgressSyncCount = 0;
	totalFTPCount = 0;
	var ftpSuccess = function(msg) {
		_self.inProgressSyncCount++;
		if (_self.inProgressSyncCount == totalFTPCount) {
			_self.app.hideDialog();
			if (callBack) {
				callBack();
			} else {
				_self.displayAlert();
			}
			_self.renderCounts();
		}
	}
	var ftpFailer = function(msg) {
		_self.inProgressSyncCount++;
		var el_insProcLog = $("#insp_process_log", _self.contextInspDetail);
		if (!_self.isAlertDisplay) {
			_self.isAlertDisplay = true;
			el_insProcLog.show();
		}
		el_insProcLog.html(_self.app.appFTPUtil.processLog.length);
		if (_self.inProgressSyncCount == totalFTPCount) {
			_self.app.hideDialog();
			if (callBack) {
				callBack();
			} else {
				_self.displayAlert();
			}
			_self.renderCounts();
		}
	}

	var success = function(tx, results) {
		if (results.rows.length > 0) {
			totalFTPCount = results.rows.length;
			for (var i = 0; i < results.rows.length; i++) {
				_self.app.appFTPUtil.uploadFile(results.rows.item(i).file,
						results.rows.item(i).mr_line,
						results.rows.item(i).insp_line,
						results.rows.item(i).isMR, function(msg) {
							ftpFailer(msg);
						}, function(msg) {
							ftpSuccess(msg);
						});
			}
		}
	};

	// Restart Sync Process.
	_self.app.appFTPUtil.processLog = [];
	_self.app.appDB.getUploadFailedEntry(success);
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

	var el_mrlinesList = $('#_list_mrlines', _self.context);

	el_mrlinesList.html(items);
	el_mrlinesList.listview("refresh");
	var el_mrLinelinks = $('#_list_mrlines li a', _self.context);
	el_mrLinelinks.off('click');
	el_mrLinelinks.on('click', function(event) {
		_self.app.appCache.session.m_inoutline_id = $(this).data("id");
		$.mobile.changePage("#pg_inspection_detail");
		event.preventDefault();
		return false;
	});

	$.mobile.loading('hide');
}

InspLinesPage.prototype.loadMRLines = function() {
	var _self = this;
	// _self.app.showDialog('Loading MR Lines');
	_self.app.showDialog("Loading");
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

		_self.app.visionApi.getMRLines({
			userid : app.appCache.settingInfo.userid
		}, success, function(msg) {
			_self.app.showError("pg_inspection",
					"Failed to load MR-lines! Check internet Connection & Server Availability."
							+ msg);
		});
	}
};

InspLinesPage.prototype.renderInspLines = function() {
	var _self = this;
	var sel_inoutline_id = _self.app.appCache.session.m_inoutline_id;
	var items = '';

	var mr_lines = _self.app.appCache.mrLines.filter(function(element, index,
			array) {
		return (element.m_inoutline_id == sel_inoutline_id);
	});

	if (!_self.app.appCache.prefixCache[sel_inoutline_id]) {
		_self.app.appCache.prefixCache[sel_inoutline_id] = mr_lines[0].desc;
	}

	$('#inspMRDetail', _self.contextInspDetail).html(mr_lines[0].label);

	var el_prefixInspLine = $('#prefixInpectLine', _self.contextInspDetail);
	el_prefixInspLine.attr("data-id", sel_inoutline_id);
	el_prefixInspLine.html(_self.app.appCache.prefixCache[sel_inoutline_id]);

	if (!(typeof _self.app.appCache.inspLines[sel_inoutline_id] === 'undefined')
			&& _self.app.appCache.inspLines[sel_inoutline_id].length > 0) {
		$.each(_self.app.appCache.inspLines[sel_inoutline_id], function() {
			var line = '<li><a data-isMR="' + this.isMR + '" id="inspline_'
					+ this.x_instructionline_id + '" data-id="'
					+ this.x_instructionline_id + '">' + this.name
					+ '<span class="ui-li-count">0/0</span></a></li>';
			console.log(line);
			items = items + line;
		});

		var el_inspLineList = $('#_list_insp', _self.contextInspDetail);

		el_inspLineList.html(items);
		el_inspLineList.listview("refresh");

		var el_inspLineLinks = $('#_list_insp li a', _self.contextInspDetail);

		el_inspLineLinks.off('click');
		el_inspLineLinks.on('click', function() {
			_self.app.appCache.session.x_instructionline_id = $(this)
					.data("id");
			_self.app.appCache.session.isMR = $(this).data("ismr");
			$.mobile.changePage("#pg_gallery");
		});
	}
	// _self.app.hideDialog();
	$.mobile.loading('hide');
	_self.renderCounts();
};

InspLinesPage.prototype.renderCounts = function() {
	var _self = this;
	var mrLineID = _self.app.appCache.session.m_inoutline_id;
	_self.inspCount = {};

	if (_self.app.appCache.inspLines[mrLineID]) {
		var el_inspLineList = $('#_list_insp', _self.contextInspDetail);
		$.each(_self.app.appCache.inspLines[mrLineID], function() {
			_self.app.appDB.getTotalInspEntries(this, function(param, results) {
				var elm = $('a#inspline_' + param.x_instructionline_id
						+ ' span', "#_list_insp");
				elm.html(results + "/" + elm.html().split("/").pop());
				el_inspLineList.listview("refresh");
			});

			_self.app.appDB.getUploadedInspEntries(this, function(param,
					results) {
				var elm = $('a#inspline_' + param.x_instructionline_id
						+ ' span', "#_list_insp");
				elm.html(elm.html().split("/").shift() + "/" + results);
				el_inspLineList.listview("refresh");
			});
		});
	}
}

InspLinesPage.prototype.rederInspLinesDetailsBreadCrumb = function() {
	var _self = this;
	$('#pg_inspection_detail #btn_user').html(
			_self.app.appCache.settingInfo.username);
};

InspLinesPage.prototype.displayAttachAlert = function() {
	var _self = this;
	var el_inspProcLog = $("#insp_process_log", _self.contextInspDetail);
	if (_self.app.visionApi.processLog.attachImage.length > 0) {
		if (!_self.isAlertDisplay) {
			_self.isAlertDisplay = true;
			el_inspProcLog.show();
		}
		el_inspProcLog.html(_self.app.visionApi.processLog.attachImage.length);
		$("#pop_process_log", _self.contextInspDetail).popup("open");
	} else {
		_self.app.showError("pg_inspection_detail",
				"All Files are Attached Successfully!");
	}
}

InspLinesPage.prototype.onFinishedCalled = function() {
	var _self = this;
	_self.inProgressAttachCount = 0;
	_self.app.visionApi.processLog.attachImage = [];
	totalAttachCount = 0;
	var attachSucess = function(param) {
		_self.app.appDB.onAttachSucess(param);
		_self.inProgressAttachCount++;
		if (_self.inProgressAttachCount == totalAttachCount) {
			_self.displayAttachAlert();
		}
	}

	var attachFail = function(msg) {
		_self.inProgressAttachCount++;
		if (_self.inProgressAttachCount == totalAttachCount) {
			_self.displayAttachAlert();
		}
	}

	var onUploadedEntrySucess = function(tx, results) {
		if (results.rows.length > 0) {
			var attachmentList = [];
			for (var i = 0; i < results.rows.length; i++) {
				var item = {};
				if (results.rows.item(i).isMR == "Y") {
					item['id'] = results.rows.item(i).insp_line;
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

			totalAttachCount = attachmentList.length;
			$.each(attachmentList, function() {
				if (this.type == 1) {
					_self.app.visionApi.uploadImage({
						imginspline : this.id,
						imgname : this.files
					}, function(param) {
						attachSucess(param);
					}, function(msg) {
						attachFail(msg);
					});
				} else {
					_self.app.visionApi.uploadImageByMInOut({
						recid : this.id,
						tabname : 'M_InOut',
						imgname : this.files
					}, function(param) {
						attachSucess(param);
					}, function(msg) {
						attachFail(msg);
					});
				}
			});

		} else {
			_self.app.showError("pg_inspection_detail",
					"No files pending for attach.");
		}
	};

	var onFailedUplodEntrysuccess = function(tx, results) {
		if (results.rows.length > 0) {
			// Restart Sync Process.
			_self.app.appFTPUtil.processLog = [];
			_self.syncInspLines(function() {
				if (_self.app.appFTPUtil.processLog.length > 0) {
					_self.displayAlert();
				} else {
					_self.app.appDB
							.getAttachPendingEntry(onUploadedEntrySucess);
				}
			});
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
	}

	if (!(typeof _self.app.appCache.inspLines[sel_inoutline_id] === 'undefined')) {
		_self.renderInspLines();
	} else {
		var success = function(result) {
			var items = '';
			_self.app.appCache.inspLines[sel_inoutline_id] = result.insplines;
			_self.renderInspLines();
		}

		_self.app.visionApi.getInspLines({
			m_inoutline_id : sel_inoutline_id
		}, success, function() {
			_self.app.showError("pg_inspection_detail",
					"Failed to Load - Inspection lines");
		});
	}
}
