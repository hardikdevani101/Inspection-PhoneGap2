var LoginPage = function(app) {
	this.app = app;
	this.context = "#pg_login";
};

LoginPage.prototype.rederBreadCrumb = function() {
	var _self = this;
	$('#btn_user', _self.context).html(_self.app.appCache.settingInfo.username);
};

LoginPage.prototype.onLogin = function() {
	var _self = this;
	try {
		if (!_self.app.visionApi) {
			_self.app.visionApi = new VisionApi(_self.app);
		}
		_self.app.appCache.settingInfo['username'] = $("#txt_user",
				_self.context).val();
		_self.app.appCache.settingInfo['password'] = $("#txt_password",
				_self.context).val();
		_self.app.appCache.settingInfo['service_url'] = $("#txt_url",
				_self.context).val();

		_self.app.visionApi.onLoginVarify({
			username : _self.app.appCache.settingInfo['username'],
			password : _self.app.appCache.settingInfo['password'],
			completeUrl : _self.app.appCache.settingInfo['service_url']
		}, function() {

			$.mobile.changePage("#pg_settings");

		}, function(error) {
			_self.app.showError("pg_login", "Login failed" + error);
		});

	} catch (error) {
		_self.app.showError("pg_login", "Login failed" + error);
	}
};

LoginPage.prototype.renderServer = function() {
	var _self = this;
	_self.el_txURL.html('');
	if (_self.app.appCache.ftpServers.length > 0) {
		$.each(_self.app.appCache.ftpServers, function(key, data) {
			if (data.isFTP != 'Y') {
				_self.el_txURL.append(new Option(data.name, data.url));
			}
		});
		_self.el_txURL.selectmenu();
		if (_self.app.appCache.settingInfo.service_url) {
			_self.el_txURL.val(_self.app.appCache.settingInfo.service_url)
					.attr('selected', true).siblings('option').removeAttr(
							'selected');
		}
		_self.el_txURL.selectmenu('refresh', true);
	}
}

LoginPage.prototype.init = function() {
	var _self = this;
	_self.el_txURL = $("#txt_url", _self.context);

	$(document).on(
			"pagebeforeshow",
			_self.context,
			function() {
				_self.app.appCache.currentPage = _self.context;
				$("#txt_password", _self.context).val("");
				if (_self.app.appCache.settingInfo['username']) {
					$("#txt_user", _self.context).val(
							_self.app.appCache.settingInfo['username']);
				}
				_self.renderServer();
			});

	$('#server_popup').on(
			"popupbeforeposition",
			function(event, ui) {
				// _self.contextPage.enhanceWithin();
				if (!_self.isNew) {
					fUrl = $("#txt_url", _self.context).val();
					var res = $.grep(_self.app.appCache.ftpServers, function(
							item, index) {
						return item.url == fUrl;
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

	$('#btn_url_add', _self.context).on('click', function(event) {
		_self.isNew = true;
		$('#server_popup').popup('open');
		event.preventDefault();
		return false;
	});

	$('#btn_server_close', _self.context).on('click', function(event) {
		$('#server_popup').popup('close');
		event.preventDefault();
		return false;
	});

	$('#btn_url_update', _self.context).on('click', function(event) {
		_self.isNew = false;
		fUrl = $("#txt_url", _self.context).val();
		if (fUrl) {
			$('#server_popup').popup('open');
		}
		event.preventDefault();
		return false;
	});

	$('#btn_url_delete', _self.context).on(
			'click',
			function(event) {

				fUrl = $("#txt_url", _self.context).val();
				if (fUrl) {
					var res = $.grep(_self.app.appCache.ftpServers, function(
							item, index) {
						return item.url == fUrl;
					});
					if (res.length > 0) {
						_self.app.appDB.deleteServerEntry(res[0]);
					}
					_self.app.appCache.ftpServers = $.grep(
							_self.app.appCache.ftpServers,
							function(item, index) {
								return item.url != fUrl;
							});
					_self.renderServer();
				}
				event.preventDefault();
				return false;
			});

	$('#_form_servers', _self.context).validate({
		rules : {
			txt_svr_name : {
				required : true
			},
			txt_svr_url : {
				required : true
			}
		},
		messages : {
			txt_svr_name : {
				required : "Server Name is Required!."
			},
			txt_svr_url : {
				required : "Server URL is Required!."
			}
		},
		errorPlacement : function(error, element) {
			// error.appendTo(element.parent().prev());
			$("#login-error-box", _self.context).html(error);
			//			
			// element.attr("placeholder", error);
			// element.attr("style", "border:1px solid red;");
		},
		invalidHandler : function() {
			$("#login-error-box", _self.context).popup("open", {
				overlayTheme : "a",
				positionTo : "#txt_svr_name"
			});
		},
		submitHandler : function(form) {

			fUrl = $('#txt_svr_url', _self.context).val();
			fUser = '';
			fPass = '';
			isFTP = 'N';
			fName = $('#txt_svr_name', _self.context).val();

			if (_self.isNew) {
				if (isFTP == 'Y') {
					fUrl = "ftp://" + fUser + ":" + fPass + "@" + fUrl;
				} else {
					fUrl = "http://" + fUrl;
				}
			}
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

	$('#_form_login', _self.context).validate({
		rules : {
			txt_user : {
				required : true
			},
			txt_password : {
				required : true
			}
		},
		messages : {
			txt_user : {
				required : "UserName is Required!."
			},
			txt_password : {
				required : "Password is Required!."
			}
		},
		errorPlacement : function(error, element) {
			// error.appendTo(element.parent().prev());
			$("#login-error-box", _self.context).html(error);
			//			
			// element.attr("placeholder", error);
			// element.attr("style", "border:1px solid red;");
		},
		invalidHandler : function() {
			$("#login-error-box", _self.context).popup("open", {
				overlayTheme : "a",
				positionTo : "#txt_user"
			});
		},
		submitHandler : function(form) {
			_self.onLogin();
			return false;
		}
	});
}

LoginPage.prototype.onAddServer = function(isNew, serverObj) {
	var _self = this;
	if (isNew) {
		var res = $.grep(_self.app.appCache.ftpServers, function(item, index) {
			return item.url == serverObj.url;
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
