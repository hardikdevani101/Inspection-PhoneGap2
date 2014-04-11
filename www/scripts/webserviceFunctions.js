function onLogin(){
	navigator.notification.activityStart("Please Wait", "logging");
	$.ajax({type: "POST",
			url: vis_url+"/VISService/services/"+"ModelADService",
			dataType: "xml",
			contentType: 'text/xml; charset=\"utf-8\"',
			data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
				   +'<soapenv:Header/>'
				   +'<soapenv:Body>'
					  +'<_0:readData>'
						 +'<_0:ModelCRUDRequest>'
							+'<_0:ModelCRUD>'
							   +'<_0:serviceType>Login</_0:serviceType>'
							   +'<_0:TableName>AD_User</_0:TableName>'
							   +'<_0:recordIDVariable>@##AD_User_ID</_0:recordIDVariable>'
							   +'<_0:DataRow>'
							   +'</_0:DataRow>'
							+'</_0:ModelCRUD>'
							+'<_0:ADLoginRequest>'
							   +'<_0:user>'+ vis_user +'</_0:user>'
							   +'<_0:pass>'+ vis_pass +'</_0:pass>'
							   +'<_0:lang>'+vis_lang+'</_0:lang>'
							   +'<_0:ClientID>'+vis_client_id+'</_0:ClientID>'
							   +'<_0:RoleID>'+vis_role+'</_0:RoleID>'
							   +'<_0:OrgID>'+vis_org_id+'</_0:OrgID>'
							   +'<_0:WarehouseID>'+vis_whouse_id+'</_0:WarehouseID>'
							   +'<_0:stage>9</_0:stage>'
							+'</_0:ADLoginRequest>'
						 +'</_0:ModelCRUDRequest>'
					  +'</_0:readData>'
				   +'</soapenv:Body>'
				+'</soapenv:Envelope>',
                    success: processSuccess,
                    error: processError
                });
				function processSuccess(data, status, req) {
                    if (status == "success")
					{
						if($(req.responseXML).find('WindowTabData').find('RowCount').text()=="1")
						{
							var xmlResponse =req.responseXML.documentElement;
							var fullNodeList = xmlResponse.getElementsByTagName("DataRow");
							for (var i=0; i < fullNodeList.length; i++)
							{
							  var eachnode = new Option();
							  for (var j=0; j < fullNodeList[i].childNodes.length; j++)
								{	
									var dlab,dval;
									eachnode.text = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									eachnode.value = fullNodeList[i].childNodes[j].attributes[0].value;
									if(eachnode.value=='Name'){
								  		dlab = eachnode.text;
									}else if(eachnode.value=='AD_User_ID'){
								  		dval = eachnode.text;
							  		}
								}
							}
							username=dlab;
							INSPECTOR_ID=dval;
							loadPage("home");
							document.getElementById("user_lbl").innerHTML="Hello : "+username;
							navigator.notification.activityStop();
						}
						else{
							//navigator.notification.alert(req.responseText + " " + status);
							loadPage("login");
							document.getElementById("login_error").innerHTML="Not Valid User";
							navigator.notification.activityStop();
						}
					}
					
                }

                function processError(data, status, req) {
					loadPage("login");
					document.getElementById("login_error").innerHTML="Something Going Wrong!!!";
					navigator.notification.activityStop();
                }  
}


function setlinedrop(){
	
	$.ajax({type: "POST",
			url: vis_url+"/VISService/services/"+"ModelADService",
			dataType: "xml",
			contentType: 'text/xml; charset=\"utf-8\"',
			data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
				   +'<soapenv:Header/>'
				   +'<soapenv:Body>'
					  +'<_0:queryData>'
					  	+'<_0:ModelCRUDRequest>'
						 +'<_0:ModelCRUD>'
							   +'<_0:serviceType>VIS_MRLINE</_0:serviceType>'
							   +'<_0:TableName>VIS_INSP_MRLine</_0:TableName>'
							   +'<_0:RecordID>0</_0:RecordID>'
							   +'<_0:DataRow>'
								 +'<_0:field column="INSPECTOR_ID" >'
									 +'<_0:val>'+INSPECTOR_ID+'</_0:val>'
								  +'</_0:field>'
							   +'</_0:DataRow>'
						 +'</_0:ModelCRUD>'
							+'<_0:ADLoginRequest>'
							   +'<_0:user>'+ vis_user +'</_0:user>'
							   +'<_0:pass>'+ vis_pass +'</_0:pass>'
							   +'<_0:lang>'+vis_lang+'</_0:lang>'
							   +'<_0:ClientID>'+vis_client_id+'</_0:ClientID>'
							   +'<_0:RoleID>'+vis_role+'</_0:RoleID>'
							   +'<_0:OrgID>'+vis_org_id+'</_0:OrgID>'
							   +'<_0:WarehouseID>'+vis_whouse_id+'</_0:WarehouseID>'
							   +'<_0:stage>9</_0:stage>'
							+'</_0:ADLoginRequest>'
						 +'</_0:ModelCRUDRequest>'
					  +'</_0:queryData>'
				   +'</soapenv:Body>'
				+'</soapenv:Envelope>',
                    success: processSuccess,
                    error: processError
                });
				function processSuccess(data, status, req) {
					console.log(req.responseText);
                    if (status == "success")
					{		
							var select = document.getElementById("linedrop");
							var xmlResponse =req.responseXML.documentElement;
							var fullNodeList = xmlResponse.getElementsByTagName("DataRow");
							for (var i=0; i < fullNodeList.length; i++)
							{
								var dlab,dval;
								var option = document.createElement('option');
							 	var eachnode = new Option();
								for (var j=0; j < fullNodeList[i].childNodes.length; j++)
								{
									eachnode.text = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									eachnode.value = fullNodeList[i].childNodes[j].attributes[0].value;
									if(eachnode.value=='LABEL'){
								  		dlab = eachnode.text;
									}else if(eachnode.value=='M_InOutLine_ID'){
								  		dval = eachnode.text;
							  		}
								}
								option.text=dlab;
								option.value=dval;
								console.log(option.text+" = "+option.value);
							  	select.add(option);
							}
							select.setAttribute("onchange","setNewInsp()");
							for(var i=0; i < select.options.length; i++){
								console.log(select.options[i].value);
								if(select.options[i].value==M_InOutLine_ID)
									{select.options[i].selected =true;console.log("selected="+select.options[i].value);}
							}
							setNewInsp();
					}
					
                }

                function processError(data, status, req) {
					loadPage("login");
					document.getElementById("login_error").innerHTML="Something Going Wrong!!!";
                }
}
function setNewInsp(){
	
	var e = document.getElementById("linedrop");
	M_InOutLine_ID=e.options[e.selectedIndex].value;
	M_line_name=e.options[e.selectedIndex].text;
	$.ajax({type: "POST",
			url: vis_url+"/VISService/services/"+"ModelADService",
			dataType: "xml",
			contentType: 'text/xml; charset=\"utf-8\"',
			data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
				   +'<soapenv:Header/>'
				   +'<soapenv:Body>'
					  +'<_0:queryData>'
					  	+'<_0:ModelCRUDRequest>'
						 +'<_0:ModelCRUD>'
							   +'<_0:serviceType>VIS_PHOTO_INSP_LINE_V</_0:serviceType>'
							   +'<_0:TableName>VIS_PHOTO_INSP_LINE_V</_0:TableName>'
							   +'<_0:RecordID>0</_0:RecordID>'
							   +'<_0:DataRow>'
								 +'<_0:field column="M_InOutLine_ID" >'
									 +'<_0:val>'+M_InOutLine_ID+'</_0:val>'
								  +'</_0:field>'
							   +'</_0:DataRow>'
						 +'</_0:ModelCRUD>'
							+'<_0:ADLoginRequest>'
							   +'<_0:user>'+ vis_user +'</_0:user>'
							   +'<_0:pass>'+ vis_pass +'</_0:pass>'
							   +'<_0:lang>'+vis_lang+'</_0:lang>'
							   +'<_0:ClientID>'+vis_client_id+'</_0:ClientID>'
							   +'<_0:RoleID>'+vis_role+'</_0:RoleID>'
							   +'<_0:OrgID>'+vis_org_id+'</_0:OrgID>'
							   +'<_0:WarehouseID>'+vis_whouse_id+'</_0:WarehouseID>'
							   +'<_0:stage>9</_0:stage>'
							+'</_0:ADLoginRequest>'
						 +'</_0:ModelCRUDRequest>'
					  +'</_0:queryData>'
				   +'</soapenv:Body>'
				+'</soapenv:Envelope>',
                    success: processSuccess,
                    error: processError
                });
				function processSuccess(data, status, req) {
                    if (status == "success")
					{		
							var div = document.getElementById("outNewIns");
							div.innerHTML="";
							var xmlResponse =req.responseXML.documentElement;
							var fullNodeList = xmlResponse.getElementsByTagName("DataRow");
							for (var i=0; i < fullNodeList.length; i++)
							{
								var dlab,dval;
								var tmpdiv = document.createElement('div');
							 	var eachnode = new Option();
								for (var j=0; j < fullNodeList[i].childNodes.length; j++)
								{
									eachnode.text = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									eachnode.value = fullNodeList[i].childNodes[j].attributes[0].value;
									if(eachnode.value=='Name'){
								  		dlab = eachnode.text;
									}else if(eachnode.value=='X_INSTRUCTIONLINE_ID'){
								  		dval = eachnode.text;
							  		}
								}
							   	
								tmpdiv.className = "divButton";
								tmpdiv.innerHTML=dlab;
								var clickstr="onInspSet('"+dval+"','"+dlab+"')";
								tmpdiv.setAttribute('onclick',clickstr);
							  	div.appendChild(tmpdiv);
							}
						
					}
					
                }

                function processError(data, status, req) {
					loadPage("login");
					document.getElementById("login_error").innerHTML="Something Going Wrong!!!";
                }
				navigator.notification.activityStop();
}


function imagetoserver(imginspline,imgname){
	
	$.ajax({type: "POST",
			url: vis_url+"/VISService/services/"+"ModelADService",
			dataType: "xml",
			contentType: 'text/xml; charset=\"utf-8\"',
			data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
				   +'<soapenv:Header/>'
				   +'<soapenv:Body>'
					  +'<_0:runProcess>'
					  	+'<_0:ModelRunProcessRequest>'
							+'<_0:ModelRunProcess AD_Record_ID="2272195">'
								   +'<_0:serviceType>AttachImage</_0:serviceType>'
								   +'<_0:ParamValues>'
									  +'<_0:field column="X_InstructionLine_ID">'
										 +'<_0:val>'+imginspline+'</_0:val>'
									  +'</_0:field>'
									  +'<_0:field column="imgName">'
										 +'<_0:val>'+imgname+'</_0:val>'
									  +'</_0:field>'
								   +'</_0:ParamValues>'
								+'</_0:ModelRunProcess>'
							+'<_0:ADLoginRequest>'
							   +'<_0:user>'+ vis_user +'</_0:user>'
							   +'<_0:pass>'+ vis_pass +'</_0:pass>'
							   +'<_0:lang>'+vis_lang+'</_0:lang>'
							   +'<_0:ClientID>'+vis_client_id+'</_0:ClientID>'
							   +'<_0:RoleID>'+vis_role+'</_0:RoleID>'
							   +'<_0:OrgID>'+vis_org_id+'</_0:OrgID>'
							   +'<_0:WarehouseID>'+vis_whouse_id+'</_0:WarehouseID>'
							   +'<_0:stage>9</_0:stage>'
							+'</_0:ADLoginRequest>'
						 +'</_0:ModelRunProcessRequest>'
					  +'</_0:runProcess>'
				   +'</soapenv:Body>'
				+'</soapenv:Envelope>',
                    success: processSuccess,
                    error: processError
                });
				function processSuccess(data, status, req) {
					var xmlResponse =req.responseXML.documentElement;
					var fullNodeList = xmlResponse.getElementsByTagName("Summary");
					if(fullNodeList[0].textContent=='success')
					{
						console.log(fullNodeList[0].textContent);
						
					}else{
						console.log(fullNodeList[0].textContent);
					}
                }

                function processError(data, status, req) {
					loadPage("login");
					document.getElementById("login_error").innerHTML="Something Going Wrong!!!";
                }
				navigator.notification.activityStop();
}