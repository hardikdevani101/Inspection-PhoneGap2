var InspLinesPage = function(app) {
	this.app = app;
	this.totalPendingItems = 0;
	this.progressedItem = 0;
	this.isAlertDisplay = false;
	this.context = "#pg_inspection";
	this.errorContext = "#pop_process_log";
	this.contextInspDetail = "#pg_inspection_detail";

}

InspLinesPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#pg_inspection #btn_user').html(_self.app.appCache.settingInfo.username);
};

InspLinesPage.prototype.init = function() {
	var _self = this;
	_self.contextPage = $(_self.context);
	_self.errorContextPage = $(_self.errorContext);
	_self.el_ispProgLog = $("#insp_process_log", _self.contextInspDetail);

	_self.contextPage.on("pagebeforeshow", function() {
		_self.app.appCache.currentPage = _self.context;
		_self.rederBreadCrumb();
		setTimeout(function() {
			_self.loadMRLines();
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
		},
				function() {
					_self.app.showError("pg_inspection",
							"Error: Watermark Not Loaded");
					_self.app.appCache.waterMarkImgs = [];
					var item = {};
					item["url"] = "Default";
					item["name"] = "Default";
					item["isDefault"] = "N";
					item["data"] = _self.app.watermark64;
					_self.app.appCache.waterMarkImgs.push(item);
				});
		// TODO : Dummy Data Runner Start
		// var ermsg = {
		// // 'X_INSTRUCTIONLINE_ID' : 'MR2323',
		// // 'M_INOUT_ID' : '23242342',
		// 'fileURI' : 'file/files/ererer.ted',
		// 'error' : 'ERROR Msg'
		// };
		// _self.app.appFTPUtil.processLog.push(ermsg);
		// _self.app.appFTPUtil.processLog.push(ermsg);
		// _self.app.appFTPUtil.processLog.push(ermsg);
		// _self.app.appFTPUtil.processLog.push(ermsg);
		// _self.app.appFTPUtil.processLog.push(ermsg);
		// TODO : Dummy Data Runner End

		_self.el_ispProgLog.hide();
		if (_self.app.appFTPUtil.processLog.length > 0) {
			_self.el_ispProgLog.html(_self.app.appFTPUtil.processLog.length);
			_self.el_ispProgLog.show();
		}
	});

	_self.el_ispProgLog.on('tap', function(event) {

		// $("#pop_process_log", _self.contextInspDetail).popup('open');
		$.mobile.changePage("#pop_process_log");
		event.preventDefault();
		return false;
	});

	$("#btn_retry_attach").on('tap', function(event) {
		// $("#pop_process_log", _self.contextInspDetail).popup("close");
		$.mobile.changePage("#pg_inspection_detail");
		_self.onFinishedCalled();
		event.preventDefault();
		return false
	});

	$("#pg_inspection #btn_user").on('click', function(event) {
		event.preventDefault();
		_self.app.showPreference('pg_inspection');
		return false
	});

	$("#pg_inspection_detail #btn_user").on('click', function(event) {
		event.preventDefault();
		/* $('#preferenceMenu').popup('open'); */
		_self.app.showPreference('pg_inspection_detail');
		return false
	});

	// $("#pop_process_log", _self.contextInspDetail).bind({
	// pagebeforeshow : function(event, ui) {
	_self.errorContextPage.on("pagebeforeshow", function() {
		_self.app.appCache.currentPage = _self.errorContext;

		var el_syncItems = $("#sync_items", _self.errorContext);
		var items = '';
		if (_self.app.appFTPUtil.processLog) {
			items += _self.getFTPProcessLog();
		}
		el_syncItems.html(items);
		el_syncItems.listview("refresh");

		var items = '';
		if (_self.app.visionApi.processLog.attachImage) {
			items += _self.getAttacheProcessLog();
		}
		var el_attachItems = $("#attach_items", _self.errorContext);
		el_attachItems.html(items);
		el_attachItems.listview("refresh");
		// }
	});

	$("#btn_retry_sync").on('tap', function(event) {
		// $("#pop_process_log", _self.contextInspDetail).popup("close");
		$.mobile.changePage("#pg_inspection_detail");
		_self.syncInspLines();
		event.preventDefault();
		return false;
	});

	$('#btn_refresh_mrlines', _self.context).on("click", function(event) {
		_self.app.appCache.mrLines = [];
		_self.loadMRLines();
		event.preventDefault();
		return false;
	});

	var contextPageInspDetail = $(_self.contextInspDetail);
	contextPageInspDetail.on("pagebeforeshow", function(event) {
		_self.app.appCache.currentPage = _self.contextInspDetail;
		setTimeout(function() {
			_self.loadInspLines({
				'selected_mrline' : _self.app.appCache.session.m_inoutline
			});
		}, 10);
		event.preventDefault();
		return false;
	});

	$('#btn_sync_insp', _self.contextInspDetail).on("click", function(event) {
		_self.syncInspLines();
		event.preventDefault();
		return false;
	});

	$('#btn_finish_mr', _self.contextInspDetail).on('click', function(event) {
		_self.onFinishedCalled();
		event.preventDefault();
		return false;
	});
}

InspLinesPage.prototype.getFTPProcessLog = function() {
	var _self = this;
	item1 = '';
	$.each(_self.app.appFTPUtil.processLog,
			function(index, item) {
				var line = '<li data-mini="true">File Failed:' + item.fileURI
						+ '</li>';
				item1 += line;
			});
	return item1;
}

InspLinesPage.prototype.getAttacheProcessLog = function() {
	var _self = this;
	item1 = '';
	$.each(_self.app.visionApi.processLog.attachImage, function(index, item) {
		var line = '<li data-mini="true">File Failed:' + item + '</li>';
		item1 += line;
	});
	return item1;
}

InspLinesPage.prototype.displayAlert = function() {
	var _self = this;
	if (_self.app.appFTPUtil.processLog.length > 0) {
		// $("#pop_process_log", _self.contextInspDetail).popup("open");
		_self.app.showError("pg_inspection_detail",
				"Error: Some files not synced", function() {
					$.mobile.changePage("#pop_process_log");
				});
	} else {
		var el_insProcLog = $("#insp_process_log", _self.contextInspDetail);
		_self.isAlertDisplay = false;
		el_insProcLog.hide();
		_self.app.showError("pg_inspection_detail",
				"All Files Uploaded Successfully.");
	}
	_self.app.hideDialog();
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
		_self.app.appFTPUtil.processLog.push(msg);
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
		} else {
			_self.app.showError("pg_inspection_detail",
					"No files pending for Sync.");
			var el_insProcLog = $("#insp_process_log", _self.contextInspDetail);
			_self.isAlertDisplay = false;
			el_insProcLog.hide();
			$.mobile.loading('hide');
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
		if(_self.app.appCache.session.isPick == this.isPickTicket){
			var line = '<li data-mini="true"><a  data-mini="true" id="mrline_'
				+ this.m_inoutline_id + '" data-id="' + this.m_inoutline_id
				+ '" data-isPick="' + this.isPickTicket + '">' + this.label + ' / ' + this.desc + '</a></li>';
			items = items + line;
		}
	});

	var el_mrlinesList = $('#_list_mrlines', _self.context);

	el_mrlinesList.html(items);
	el_mrlinesList.listview("refresh");
	var el_mrLinelinks = $('#_list_mrlines li a', _self.context);
	el_mrLinelinks.off('click');
	el_mrLinelinks
			.on(
					'click',
					function(event) {

						var cId = $(this).data("id");
						var cIsPick = $(this).attr("data-isPick");

						_self.app.appCache.session.m_inoutline = $.grep(
								_self.app.appCache.mrLines, function(item,
										index) {
									return item.isPickTicket == cIsPick
											&& item.m_inoutline_id == cId;
								});

						if (_self.app.appCache.session.m_inoutline.length > 0) {
							_self.app.appCache.session.m_inoutline = _self.app.appCache.session.m_inoutline[0];
						}

						$.mobile.changePage("#pg_inspection_detail");
						event.preventDefault();
						return false;
					});

	$.mobile.loading('hide');
}

InspLinesPage.prototype.loadMRLines = function() {
	var _self = this;

	_self.app.showDialog("Loading");
	if (_self.app.appCache.mrLines.length > 0) {
		_self.renderMRLines();
	} else {
		var success = function(result) {
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
	var items = '';
	var sel_inoutline_id = _self.app.appCache.session.m_inoutline;	
	var uuID = sel_inoutline_id.m_inoutline_id+ "" +sel_inoutline_id.isPickTicket;

	if (!_self.app.appCache.prefixCache[uuID]) {
		_self.app.appCache.prefixCache[uuID] = sel_inoutline_id.desc;
	}

	$('#inspMRDetail', _self.contextInspDetail).html(sel_inoutline_id.label);

	var el_prefixInspLine = $('#prefixInpectLine', _self.contextInspDetail);
	el_prefixInspLine.attr("data-id", uuID);
	el_prefixInspLine.html(_self.app.appCache.prefixCache[uuID]);

	if (!(typeof _self.app.appCache.inspLines[uuID] === 'undefined')
			&& _self.app.appCache.inspLines[uuID].length > 0) {
		$.each(_self.app.appCache.inspLines[uuID], function() {
			var line = '<li><a data-isMR="' + this.isMR + '" id="inspline_'
					+ this.x_instructionline_id + '" data-id="'
					+ this.x_instructionline_id + '">' + this.name
					+ '<span class="ui-li-count">0/0</span></a></li>';
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
	var mrLineID = _self.app.appCache.session.m_inoutline;
	var uuID = mrLineID.m_inoutline_id+ "" +mrLineID.isPickTicket;
	_self.inspCount = {};

	if (_self.app.appCache.inspLines[uuID]) {
		var el_inspLineList = $('#_list_insp', _self.contextInspDetail);
		$.each(_self.app.appCache.inspLines[uuID], function() {
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
		_self.app.showError("pg_inspection_detail",
				"Error: Some files not Atteched", function() {
					$.mobile.changePage("#pop_process_log");
				});
		// $("#pop_process_log", _self.contextInspDetail).popup("open");
	} else {
		var el_insProcLog = $("#insp_process_log", _self.contextInspDetail);
		_self.isAlertDisplay = false;
		el_insProcLog.hide();
		_self.app.showError("pg_inspection_detail",
				"All Files are Attached Successfully!");
	}
	_self.app.hideDialog();
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
		fileArray = msg.split(",");
		$.each(fileArray, function(index, item) {
			_self.app.visionApi.processLog.attachImage.push(item);
		});
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
				item['isPickTicket'] = results.rows.item(i).isPickTicket;

				var isUpdated = false;
				$.each(attachmentList, function() {
					if (this.id == item['id'] && this.isPickTicket == item['isPickTicket']) {
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
					var tabName = 'M_InOut';
					if (this.isPickTicket == 'Y')
						tabName = 'C_Order';
					_self.app.visionApi.uploadImageByMInOut({
						recid : this.id,
						tabname : tabName,
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
			var el_insProcLog = $("#insp_process_log", _self.contextInspDetail);
			_self.isAlertDisplay = false;
			el_insProcLog.hide();
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
					setTimeout(function() {
						_self.app.appDB
								.getAttachPendingEntry(onUploadedEntrySucess);
					}, 100);
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
	var sel_inoutline_id = _self.app.appCache.session.m_inoutline;
	if (!(typeof params === 'undefined')) {
		sel_inoutline_id = params.selected_mrline;
	}
	var uuID = sel_inoutline_id.m_inoutline_id+ "" +sel_inoutline_id.isPickTicket;

	if (!(typeof _self.app.appCache.inspLines[uuID] === 'undefined')) {
		_self.renderInspLines();
	} else {
		var success = function(result) {
			
			_self.app.appCache.inspLines[uuID] = result.insplines;
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
