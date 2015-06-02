var VisionApi = function(app) {

	this.app = app;
	this.processLog = {};
	this.baseUrl = app.appCache.settingInfo.service_url;
	this.wsTypeModelADService = "ModelADService";
	this.completeUrl = this.baseUrl + "/VISService/services/"
			+ this.wsTypeModelADService;

	var vis_username = app.appCache.settingInfo.username;// "reyna.ramos";
	var vis_pass = app.appCache.settingInfo.password;// "password";
	var vis_lang = app.appCache.settingInfo.lang;// "en_US";
	var vis_client_id = app.appCache.settingInfo.client_id;// "1000000";
	var vis_role = app.appCache.settingInfo.role;// "1000052";
	var vis_org_id = app.appCache.settingInfo.org_id;// "1000003";
	var vis_whouse_id = app.appCache.settingInfo.warehouse_id;// "1000043";
	this.ADLoginRequest = '<_0:ADLoginRequest>' + '<_0:user>' + vis_username
			+ '</_0:user>' + '<_0:pass>' + vis_pass + '</_0:pass>'
			+ '<_0:lang>' + vis_lang + '</_0:lang>' + '<_0:ClientID>'
			+ vis_client_id + '</_0:ClientID>' + '<_0:RoleID>' + vis_role
			+ '</_0:RoleID>' + '<_0:OrgID>' + vis_org_id + '</_0:OrgID>'
			+ '<_0:WarehouseID>' + vis_whouse_id + '</_0:WarehouseID>'
			+ '<_0:stage>9</_0:stage>' + '</_0:ADLoginRequest>';
};

VisionApi.prototype.resetADLoginRequest = function(params, success, error) {
	var vis_username = app.appCache.settingInfo.username;// "reyna.ramos";
	var vis_pass = app.appCache.settingInfo.password;// "password";
	var vis_lang = app.appCache.settingInfo.lang;// "en_US";
	var vis_client_id = app.appCache.settingInfo.client_id;// "1000000";
	var vis_role = app.appCache.settingInfo.role;// "1000052";
	var vis_org_id = app.appCache.settingInfo.org_id;// "1000003";
	var vis_whouse_id = app.appCache.settingInfo.warehouse_id;// "1000043";

	this.ADLoginRequest = '<_0:ADLoginRequest>' + '<_0:user>' + vis_username
			+ '</_0:user>' + '<_0:pass>' + vis_pass + '</_0:pass>'
			+ '<_0:lang>' + vis_lang + '</_0:lang>' + '<_0:ClientID>'
			+ vis_client_id + '</_0:ClientID>' + '<_0:RoleID>' + vis_role
			+ '</_0:RoleID>' + '<_0:OrgID>' + vis_org_id + '</_0:OrgID>'
			+ '<_0:WarehouseID>' + vis_whouse_id + '</_0:WarehouseID>'
			+ '<_0:stage>9</_0:stage>' + '</_0:ADLoginRequest>';
}

VisionApi.prototype.login = function(params, success, error) {
	var _self = this;
	_self.app.appCache.settingInfo['username'] = params.username;
	_self.app.appCache.settingInfo['password'] = params.password;
	this.resetADLoginRequest();
	var reqBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
			+ '<soapenv:Header/>'
			+ '<soapenv:Body>'
			+ '<_0:readData>'
			+ '<_0:ModelCRUDRequest>'
			+ '<_0:ModelCRUD>'
			+ '<_0:serviceType>Login</_0:serviceType>'
			+ '<_0:TableName>AD_User</_0:TableName>'
			+ '<_0:recordIDVariable>@##AD_User_ID</_0:recordIDVariable>'
			+ '<_0:DataRow>'
			+ '</_0:DataRow>'
			+ '</_0:ModelCRUD>'
			+ this.ADLoginRequest
			+ '</_0:ModelCRUDRequest>'
			+ '</_0:readData>'
			+ '</soapenv:Body>' + '</soapenv:Envelope>';
	$
			.ajax(
					{
						beforeSend : function() {
							_self.app.showDialog("Loading");
						},
						complete : function() {
							_self.app.hideDialog();
						},
						type : 'POST',
						crossDomain : true,
						data : reqBody,
						url : _self.completeUrl,
						accepts : {
							xml : 'text/xml',
							text : 'text/plain'
						},
						contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
						dataType : 'xml'
					})
			.then(
					function(response) {
						var jsonResponse = {};
						var xmlResponse = response;
						var fullNodeList = xmlResponse
								.getElementsByTagName("DataRow");
						var error = xmlResponse.getElementsByTagName("Error");
						if (error.length > 0) {
							var resultline = {};
							resultline["error"] = error[0].textContent;
							jsonResponse = resultline;
						}
						if (fullNodeList.length > 0) {
							for (var i = 0; i < fullNodeList.length; i++) {
								var dlab, dval;
								for (var j = 0; j < fullNodeList[i].childNodes.length; j++) {
									if (fullNodeList[i].childNodes[j].attributes[0].value == 'Name') {
										dlab = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									} else if (fullNodeList[i].childNodes[j].attributes[0].value == 'AD_User_ID') {
										dval = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									}
								}
								var resultline = {};
								resultline["name"] = dlab;
								resultline["ad_user_id"] = dval;
								jsonResponse = resultline;
							}
						}
						success({
							'loginInfo' : jsonResponse
						});
					}).fail(function(err) {
				error(err.responseText);
			});
}

VisionApi.prototype.getMRLines = function(params, success, error) {
	var _self = this;
	this.resetADLoginRequest();
	var reqBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
			+ '<soapenv:Header/>'
			+ '<soapenv:Body>'
			+ '<_0:queryData>'
			+ '<_0:ModelCRUDRequest>'
			+ '<_0:ModelCRUD>'
			+ '<_0:serviceType>VIS_MRLINE</_0:serviceType>'
			+ '<_0:TableName>VIS_INSP_MRLine</_0:TableName>'
			+ '<_0:RecordID>0</_0:RecordID>'
			+ '<_0:DataRow>'
			+ '<_0:field column="INSPECTOR_ID" >'
			+ '<_0:val>'
			+ params['userid']
			+ '</_0:val>'
			+ '</_0:field>'
			+ '</_0:DataRow>'
			+ '</_0:ModelCRUD>'
			+ _self.ADLoginRequest
			+ '</_0:ModelCRUDRequest>'
			+ '</_0:queryData>'
			+ '</soapenv:Body>'
			+ '</soapenv:Envelope>';

	$
			.ajax(
					{
						beforeSend : function() {
							_self.app.showDialog("Loading");
						},
						complete : function() {
							_self.app.hideDialog();
						},
						type : 'POST',
						crossDomain : true,
						data : reqBody,
						url : _self.completeUrl,
						accepts : {
							xml : 'text/xml',
							text : 'text/plain'
						},
						contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
						dataType : 'xml'
					})
			.then(
					function(response) {
						var jsonResponse = [];
						var xmlResponse = response;
						var fullNodeList = xmlResponse
								.getElementsByTagName("DataRow");
						if (fullNodeList.length > 0) {
							for (var i = 0; i < fullNodeList.length; i++) {
								var dlab, dval, inOut, desc;
								for (var j = 0; j < fullNodeList[i].childNodes.length; j++) {
									if (fullNodeList[i].childNodes[j].attributes[0].value == 'LABEL') {
										dlab = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									} else if (fullNodeList[i].childNodes[j].attributes[0].value == 'M_InOutLine_ID') {
										dval = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									} else if (fullNodeList[i].childNodes[j].attributes[0].value == 'M_InOut_ID') {
										inOut = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									} else if (fullNodeList[i].childNodes[j].attributes[0].value == 'Description') {
										desc = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									}
								}
								var mrLine = {};
								mrLine["label"] = dlab;
								mrLine["m_inoutline_id"] = dval;
								mrLine["m_inout_id"] = inOut;
								mrLine["desc"] = desc;
								jsonResponse.push(mrLine);
							}
						}
						success({
							'total' : jsonResponse.length,
							'mrlines' : jsonResponse
						});
					}).fail(function(err) {
				return err.responseText;
			});
};

VisionApi.prototype.getInspLines = function(params, success, error) {
	var _self = this;
	this.resetADLoginRequest();
	var reqBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
			+ '<soapenv:Header/>'
			+ '<soapenv:Body>'
			+ '<_0:queryData>'
			+ '<_0:ModelCRUDRequest>'
			+ '<_0:ModelCRUD>'
			+ '<_0:serviceType>VIS_PHOTO_INSP_LINE_V</_0:serviceType>'
			+ '<_0:TableName>VIS_PHOTO_INSP_LINE_V</_0:TableName>'
			+ '<_0:RecordID>0</_0:RecordID>'
			+ '<_0:DataRow>'
			+ '<_0:field column="M_InOutLine_ID" >'
			+ '<_0:val>'
			+ params.m_inoutline_id
			+ '</_0:val>'
			+ '</_0:field>'
			+ '</_0:DataRow>'
			+ '</_0:ModelCRUD>'
			+ _self.ADLoginRequest
			+ '</_0:ModelCRUDRequest>'
			+ '</_0:queryData>'
			+ '</soapenv:Body>'
			+ '</soapenv:Envelope>';
	$
			.ajax(
					{
						beforeSend : function() {
							_self.app.showDialog("Loading");
						},
						complete : function() {
							_self.app.hideDialog();
						},
						type : 'POST',
						crossDomain : true,
						data : reqBody,
						url : _self.completeUrl,
						accepts : {
							xml : 'text/xml',
							text : 'text/plain'
						},
						contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
						dataType : 'xml'
					})
			.then(
					function(response) {
						var jsonResponse = [];
						var xmlResponse = response;
						var fullNodeList = xmlResponse
								.getElementsByTagName("DataRow");
						function mrLine(element, index, array) {
							return (element.m_inoutline_id == params.m_inoutline_id);
						}
						var mr_lines = _self.app.appCache.mrLines
								.filter(mrLine);
						if (mr_lines && mr_lines.length > 0) {
							var resultline = {};
							resultline['x_instructionline_id'] = mr_lines[0].m_inout_id;
							resultline['isMR'] = "Y";
							resultline['name'] = "Vendor Paper work";
							jsonResponse.push(resultline);
						}

						if (fullNodeList.length > 0) {
							for (var i = 0; i < fullNodeList.length; i++) {
								var dlab, dval;
								for (var j = 0; j < fullNodeList[i].childNodes.length; j++) {

									if (fullNodeList[i].childNodes[j].attributes[0].value == 'Name') {
										dlab = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									} else if (fullNodeList[i].childNodes[j].attributes[0].value == 'X_INSTRUCTIONLINE_ID') {
										dval = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									}
								}
								var resultline = {};
								resultline['x_instructionline_id'] = dval
								resultline['isMR'] = "N";
								resultline['name'] = dlab;
								jsonResponse.push(resultline);
							}
						}
						success({
							'insplines' : jsonResponse,
							'total' : jsonResponse.length
						});
					}).fail(function(err) {
				return err.responseText;
			});
};

VisionApi.prototype.uploadImage = function(params, success, error) {
	var _self = this;
	var reqBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
			+ '<soapenv:Header/>'
			+ '<soapenv:Body>'
			+ '<_0:runProcess>'
			+ '<_0:ModelRunProcessRequest>'
			+ '<_0:ModelRunProcess AD_Record_ID="2272195">'
			+ '<_0:serviceType>AttachImage</_0:serviceType>'
			+ '<_0:ParamValues>'
			+ '<_0:field column="X_InstructionLine_ID">'
			+ '<_0:val>'
			+ params.imginspline
			+ '</_0:val>'
			+ '</_0:field>'
			+ '<_0:field column="imgName">'
			+ '<_0:val>'
			+ params.imgname
			+ '</_0:val>'
			+ '</_0:field>'
			+ '</_0:ParamValues>'
			+ '</_0:ModelRunProcess>'
			+ _self.ADLoginRequest
			+ '</_0:ModelRunProcessRequest>'
			+ '</_0:runProcess>'
			+ '</soapenv:Body>' + '</soapenv:Envelope>';
	$.ajax({
		beforeSend : function() {
			_self.app.showDialog("Loading");
		},
		complete : function() {
			_self.app.hideDialog();
		},
		type : 'POST',
		crossDomain : true,
		data : reqBody,
		url : _self.completeUrl,
		accepts : {
			xml : 'text/xml',
			text : 'text/plain'
		},
		contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
		dataType : 'xml'
	}).then(function(response) {
		var summary = response.getElementsByTagName("Summary");
		var tmpArray = summary[0].textContent.split(']$[');
		var successArrayList = tmpArray[0].split('$$');
		var failedArrayList = [];
		if (!tmpArray[1] == "")
			failedArrayList = tmpArray[1].split('$$');
		if (failedArrayList && failedArrayList.length > 0) {
			$.each(failedArrayList, function(index, item) {
				_self.processLog.attachImage.push(item);
			});
		}
		success({
			'id' : params.imginspline,
			'success' : successArrayList,
			'failer' : failedArrayList,
			'type' : 1
		});
	}).fail(function(err) {
		error(err.responseText);
		_self.processLog.attachImage.push(err.responseText);
	});
};

VisionApi.prototype.uploadImageByMInOut = function(params, success, error) {
	var _self = this;
	var reqBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
			+ '<soapenv:Header/>'
			+ '<soapenv:Body>'
			+ '<_0:runProcess>'
			+ '<_0:ModelRunProcessRequest>'
			+ '<_0:ModelRunProcess AD_Record_ID="'
			+ params.recid
			+ '">'
			+ '<_0:serviceType>AttachImage</_0:serviceType>'
			+ '<_0:ParamValues>'
			+ '<_0:field column="TableName">'
			+ '<_0:val>'
			+ params.tabname
			+ '</_0:val>'
			+ '</_0:field>'
			+ '<_0:field column="imgName">'
			+ '<_0:val>'
			+ params.imgname
			+ '</_0:val>'
			+ '</_0:field>'
			+ '</_0:ParamValues>'
			+ '</_0:ModelRunProcess>'
			+ _self.ADLoginRequest
			+ '</_0:ModelRunProcessRequest>'
			+ '</_0:runProcess>'
			+ '</soapenv:Body>' + '</soapenv:Envelope>';
	$.ajax({
		beforeSend : function() {
			_self.app.showDialog("Loading");
		},
		complete : function() {
			_self.app.hideDialog();
		},
		type : 'POST',
		crossDomain : true,
		data : reqBody,
		url : _self.completeUrl,
		accepts : {
			xml : 'text/xml',
			text : 'text/plain'
		},
		contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
		dataType : 'xml'
	}).then(function(response) {
		var summary = response.getElementsByTagName("Summary");
		var tmpArray = summary[0].textContent.split(']$[');
		var successArrayList = tmpArray[0].split('$$');
		var failedArrayList = [];
		if (!tmpArray[1] == "")
			failedArrayList = tmpArray[1].split('$$');
		if (failedArrayList && failedArrayList.length > 0) {
			$.each(failedArrayList, function(index, item) {
				_self.processLog.attachImage.push(item);
			});
		}

		success({
			'id' : params.recid,
			'success' : successArrayList,
			'failer' : failedArrayList,
			'type' : 0
		});
	}).fail(function(err) {
		error(err.responseText);
		_self.processLog.attachImage.push(err.responseText);
	});
};

VisionApi.prototype.getFTPServerList = function(params, success, error) {
	var _self = this;
	var reqBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
			+ '<soapenv:Header/>'
			+ '<soapenv:Body>'
			+ '<_0:queryData>'
			+ '<_0:ModelCRUDRequest>'
			+ '<_0:ModelCRUD>'
			+ '<_0:serviceType>Vision_FTP</_0:serviceType>'
			+ '<_0:TableName>Vision_FTP</_0:TableName>'
			+ '<_0:RecordID>0</_0:RecordID>'
			+ '<_0:DataRow>'
			+ '<_0:field column="IsActive" >'
			+ '<_0:val>Y</_0:val>'
			+ '</_0:field>'
			+ '<_0:field column="AD_Org_ID" >'
			+ '<_0:val>'
			+ params.orgid
			+ '</_0:val>'
			+ '</_0:field>'
			+ '</_0:DataRow>'
			+ '</_0:ModelCRUD>'
			+ _self.ADLoginRequest
			+ '</_0:ModelCRUDRequest>'
			+ '</_0:queryData>'
			+ '</soapenv:Body>'
			+ '</soapenv:Envelope>';
	$
			.ajax(
					{
						beforeSend : function() {
							_self.app.showDialog("Loading");
						},
						complete : function() {
							_self.app.hideDialog();
						},
						type : 'POST',
						crossDomain : true,
						data : reqBody,
						url : _self.completeUrl,
						accepts : {
							xml : 'text/xml',
							text : 'text/plain'
						},
						contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
						dataType : 'xml'

					})
			.then(
					function(response) {
						jsonResponse = [];
						var xmlResponse = response;
						var fullNodeList = xmlResponse
								.getElementsByTagName("DataRow");
						if (fullNodeList.length > 0) {
							for (var i = 0; i < fullNodeList.length; i++) {
								var dlab, dval, inOut, desc;
								for (var j = 0; j < fullNodeList[i].childNodes.length; j++) {
									if (fullNodeList[i].childNodes[j].attributes[0].value == 'FTP_Url') {
										fUrl = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									} else if (fullNodeList[i].childNodes[j].attributes[0].value == 'Name') {
										fName = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									} else if (fullNodeList[i].childNodes[j].attributes[0].value == 'Password') {
										fPass = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									} else if (fullNodeList[i].childNodes[j].attributes[0].value == 'Username') {
										fUser = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									} else if (fullNodeList[i].childNodes[j].attributes[0].value == 'Vision_FTP_ID') {
										recordId = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									} else if (fullNodeList[i].childNodes[j].attributes[0].value == 'isFTP') {
										isFTP = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									}
								}
								resultline = {};

								if (isFTP == 'Y') {
									fUrl = "ftp://" + fUser + ":" + fPass + "@"
											+ fUrl;
								} else {
									fUrl = "http://" + fUrl;
								}

								resultline['rid'] = recordId;
								resultline['url'] = fUrl;
								resultline['isFTP'] = isFTP;
								resultline['name'] = fName;
								resultline['password'] = fPass;
								resultline['user'] = fUser;
								jsonResponse.push(resultline);
							}
						}
						success({
							'ftpservers' : jsonResponse,
							'total' : jsonResponse.length
						});
					}).fail(function(err) {
				error(err.responseText);
			});
};

VisionApi.prototype.getWaterMarkList = function(success, error) {
	var _self = this;
	var reqBody = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
			+ '<soapenv:Header/>'
			+ '<soapenv:Body>'
			+ '<_0:getList>'
			+ '<_0:ModelGetListRequest>'
			+ '<_0:ModelGetList>'
			+ '<_0:serviceType>Watermark List</_0:serviceType>'
			+ '<_0:AD_Reference_ID>0</_0:AD_Reference_ID>'
			+ '<_0:Filter></_0:Filter>'
			+ '</_0:ModelGetList>'
			+ _self.ADLoginRequest
			+ '</_0:ModelGetListRequest>'
			+ '</_0:getList>' + '</soapenv:Body>' + '</soapenv:Envelope>';
	$
			.ajax(
					{

						beforeSend : function() {
							_self.app.showDialog("Loading");
						},
						complete : function() {
							_self.app.hideDialog();
						},
						type : 'POST',
						crossDomain : true,
						data : reqBody,
						url : _self.completeUrl,
						accepts : {
							xml : 'text/xml',
							text : 'text/plain'
						},
						contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
						dataType : 'xml'
					})
			.then(
					function(response) {
						jsonResponse = [];
						var xmlResponse = response;
						var fullNodeList = xmlResponse
								.getElementsByTagName("DataRow");
						var data = [];
						if (fullNodeList.length > 0) {
							for (var i = 0; i < fullNodeList.length; i++) {
								var item = {};
								for (var j = 0; j < fullNodeList[i].childNodes.length; j++) {
									if (fullNodeList[i].childNodes[j].attributes[0].value == 'Description') {
										item["url"] = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									} else if (fullNodeList[i].childNodes[j].attributes[0].value == 'Name') {
										item["name"] = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									}
								}
								data.push(item);
							}
						}
						success({
							'responce' : data
						});
					}).fail(function(err) {
				error(err.responseText);
			});
}
