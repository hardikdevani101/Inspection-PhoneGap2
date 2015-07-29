var ServerSettingPage = function(app) {
	this.app = app;
	this.context = "#server-setting";
}

ServerSettingPage.prototype.init = function() {
	console.log("server-setting called");
	var _self = this;
	_self.contextPage = $(_self.context);

	$(document).on("pagebeforeshow", _self.context, function(event) {
		_self.app.appCache.currentPage = _self.context;
		_self.renderServer();
		event.preventDefault();
		return false;

	});

	$('#server_popup').on(
			"popupbeforeposition",
			function(event, ui) {
				// _self.contextPage.enhanceWithin();
				if (!_self.isNew) {
					var res = $.grep(_self.app.appCache.ftpServers, function(
							item, index) {
						return item.name == _self.fName;
					});
					if (res.length > 0) {
						$('#txt_svr_url', _self.context).val(res[0].url);
						$('#txt_svr_name', _self.context).val(res[0].name);
					}
				} else {
					$('#txt_svr_url', _self.context).val('');
					$('#txt_svr_name', _self.context).val('');
				}
				event.preventDefault();
				return false;
			});

	$('#btn_add_server', _self.context).on('click', function(event) {
		_self.isNew = true;
		$("#txt_svr_name").prop("disabled", false);
		$('#server_popup').popup('open', {
			positionTo : '#server-setting div[data-role="header"]'
		});
		// $('.ui-popup-container').css({
		// top : 0,
		// position : relative
		// });
		event.preventDefault();
		return false;
	});

	$('#btn_server_close', _self.context).on('click', function(event) {
		$('#server_popup').popup('close');
		event.preventDefault();
		return false;
	});

	$("#_form_servers").on("keypress", "input", function(e) {
		if (e.which === 13) {
			if ($('#_form_servers', _self.context).valid()) {
				$('#_form_servers', _self.context).submit();
			}
			return false;
		}
	});

	$('#_form_servers', '#server_popup').validate({
		rules : {
			txt_svr_name : {
				required : true
			},
			txt_svr_url : {
				required : true,
				url : true
			}
		},
		messages : {
			txt_svr_name : {
				required : "Name is Required!"
			},
			txt_svr_url : {
				required : "URL is Required!",
				url : "Invalid URL!"
			}
		},
		errorPlacement : function(error, element) {
			 error.appendTo(element.parent());
		},
		invalidHandler : function() {
		},
		submitHandler : function(form) {

			fUrl = $('#txt_svr_url', _self.context).val();
			fUser = '';
			fPass = '';
			isFTP = 'N';
			fName = $('#txt_svr_name', _self.context).val();
			//
			// if (_self.isNew) {
			// if (isFTP == 'Y') {
			// fUrl = "ftp://" + fUser + ":" + fPass + "@" + fUrl;
			// } else {
			// fUrl = "http://" + fUrl;
			// }
			// }
			resultline = {};
			resultline['rid'] = 0;
			resultline['url'] = fUrl.trim();
			resultline['isFTP'] = isFTP;
			resultline['name'] = fName;
			resultline['password'] = fPass;
			resultline['user'] = fUser;

			_self.onAddServer(_self.isNew, resultline);
			_self.renderServer();
			$('#server_popup').popup('close');
			return false;
		}
	});

}

ServerSettingPage.prototype.renderServer = function() {
	var _self = this;

	var items = '';
	$
			.each(
					_self.app.appCache.ftpServers,
					function() {
						if (this.isFTP != 'Y') {
							var line = '<li data-mini="true"><a data-id="'
									+ this.url
									+ '">'
									+ this.name
									+ '</a> <div class="split-custom-wrapper">'
									+ '<a href="#" data-role="button" data-id="'
									+ this.name
									+ '" class="split-custom-button" data-type="delete" data-icon="minus"'
									+ 'data-rel="dialog" data-theme="c" data-iconpos="notext">Add</a>'
									+ '<a href="#" data-role="button" data-id="'
									+ this.name
									+ '" class="split-custom-button" data-type="edit" data-icon="edit"'
									+ 'data-rel="dialog" data-theme="c" data-iconpos="notext">Edit</a></div></li>';

							items = items + line;
						}
					});

	var el_mrlinesList = $('#_list_serverLines', _self.context);
	el_mrlinesList.html(items);
	el_mrlinesList.enhanceWithin();
	el_mrlinesList.listview("refresh");

	var el_editServer = $('#_list_serverLines li div a[data-type="edit"]',
			_self.context);
	el_editServer.off('click');
	el_editServer.on('click', function(event) {
		_self.fName = $(this).data("id");

		_self.isNew = false;
		$("#txt_svr_name").prop("disabled", true);

		if (_self.fName) {
			$('#server_popup').popup('open', {
				positionTo : '#server-setting div[data-role="header"]'
			});
			// $('.ui-popup-container').css({
			// top : 0
			// });
		}

		event.preventDefault();
		return false;
	});

	var el_deleteServer = $('#_list_serverLines li div a[data-type="delete"]',
			_self.context);
	el_deleteServer.off('click');
	el_deleteServer.on('click', function(event) {

		fName = $(this).data("id");
		if (fName) {
			var res = $.grep(_self.app.appCache.ftpServers, function(item,
					index) {
				return item.name == fName;
			});
			if (res.length > 0) {
				_self.app.appDB.deleteServerEntry(res[0]);
			}
			_self.app.appCache.ftpServers = $.grep(
					_self.app.appCache.ftpServers, function(item, index) {
						return item.name != fName;
					});
			_self.renderServer();
		}
		event.preventDefault();
		return false;
	});

}

ServerSettingPage.prototype.onAddServer = function(isNew, serverObj) {
	var _self = this;
	if (isNew) {
		var res = $.grep(_self.app.appCache.ftpServers, function(item, index) {
			return item.name == serverObj.name;	
		});
		if (res.length <= 0) {
			_self.app.appCache.ftpServers.push(serverObj);
			_self.app.appDB.createFTPEntry();
		}
	} else {
		_self.app.appCache.ftpServers = $.grep(_self.app.appCache.ftpServers,
				function(item, index) {
					return item.name != serverObj.name;
				});
		_self.app.appCache.ftpServers.push(serverObj);
		_self.app.appDB.updateServerEntry(serverObj);
	}
}
