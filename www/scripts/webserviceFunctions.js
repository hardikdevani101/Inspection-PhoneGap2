function onLogin(){
	navigator.notification.activityStart("Please Wait", "Logging.....");
	$.ajax({type: "POST",
			url: getWsUrl("ModelADService"),
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
							+ getWsDataLoginString()
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
							var dlab,dval;
							for (var i=0; i < fullNodeList.length; i++)
							{
							  for (var j=0; j < fullNodeList[i].childNodes.length; j++)
								{	
									if( fullNodeList[i].childNodes[j].attributes[0].value == 'Name'){
								  		dlab = fullNodeList[i].childNodes[j].childNodes[0].textContent;
									}else if( fullNodeList[i].childNodes[j].attributes[0].value == 'AD_User_ID'){
								  		dval = fullNodeList[i].childNodes[j].childNodes[0].textContent;
							  		}
								}
							}
							userName=dlab;
							INSPECTOR_ID=dval;
							db.transaction(function(tx){
								tx.executeSql('UPDATE vis_setting SET username = "'+userName+'"');
							}, errorCB);
							loadPage("home");
							pageState = 1;
							displayUserName();
							navigator.notification.activityStop();
						}
						else{
							loadPage("login");
							document.getElementById("login_error").innerHTML="Login Failed!!!!";
							navigator.notification.activityStop();
						}
					}
					
                }

                function processError(data, status, req) {
					console.log("Error ="+data.status);
					console.log("Error ="+data.statusText );
					console.log("Error ="+data.responseText);
					loadPage("login");
					document.getElementById("txt_user").value=userName;
					navigator.notification.alert('Failer!!',function(){},getErrorMessage(data, status, req),'Ok');
					navigator.notification.activityStop();
                }  
}


function fillMrLines(){
	
	$.ajax({type: "POST",
			url: getWsUrl("ModelADService"),
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
							+ getWsDataLoginString()
						 +'</_0:ModelCRUDRequest>'
					  +'</_0:queryData>'
				   +'</soapenv:Body>'
				+'</soapenv:Envelope>',
                    success: processSuccess,
                    error: processError
                });
				function processSuccess(data, status, req) {
                    if (status == "success")
					{		mrLinesArray = new Array();
							var xmlResponse =req.responseXML.documentElement;
							var fullNodeList = xmlResponse.getElementsByTagName("DataRow");
							if (fullNodeList.length == 0){
								navigator.notification.activityStop();
								navigator.notification.alert('No MR Lines to perform Inspection for you.','','Alert');
								loadPage("home");
							} else
							{
								for (var i=0; i < fullNodeList.length; i++)
								{
									var dlab,dval;
									var option = document.createElement('option');
									for (var j=0; j < fullNodeList[i].childNodes.length; j++)
									{
										if( fullNodeList[i].childNodes[j].attributes[0].value == 'LABEL'){
											dlab = fullNodeList[i].childNodes[j].childNodes[0].textContent ;
										}else if( fullNodeList[i].childNodes[j].attributes[0].value == 'M_InOutLine_ID'){
											dval = fullNodeList[i].childNodes[j].childNodes[0].textContent ;
										}
									}
									mrLinesArray[i]=new Array();
									mrLinesArray[i][0]=dlab;
									mrLinesArray[i][1]=dval;
								}
								onBackToStartInspection('home');
							}
					}
					
                }

                function processError(data, status, req) {
					if(backPage=='gallary')
						backtogallary();
					else
						{
							loadPage("home");
							displayUserName();
						}
					navigator.notification.activityStop();
					navigator.notification.alert('Failer!!',function(){},getErrorMessage(data, status, req),'Ok');
                }
				
}
function fillInspectionsLines(){
	
	var e = document.getElementById("linedrop");
	M_InOutLine_ID=e.options[e.selectedIndex].value;
	M_line_name=e.options[e.selectedIndex].text;
	$.ajax({type: "POST",
			url: getWsUrl("ModelADService"),
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
							+ getWsDataLoginString()
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
							inspLinesArray = new Array();
							var xmlResponse =req.responseXML.documentElement;
							var fullNodeList = xmlResponse.getElementsByTagName("DataRow");
							for (var i=0; i < fullNodeList.length; i++)
							{	
								var dlab,dval;
								for (var j=0; j < fullNodeList[i].childNodes.length; j++)
								{
									if( fullNodeList[i].childNodes[j].attributes[0].value == 'Name'){
								  		dlab = fullNodeList[i].childNodes[j].childNodes[0].textContent ;
									}else if( fullNodeList[i].childNodes[j].attributes[0].value == 'X_INSTRUCTIONLINE_ID'){
								  		dval = fullNodeList[i].childNodes[j].childNodes[0].textContent ;
							  		}
								}
								inspLinesArray[i]=new Array();
								inspLinesArray[i][0]=dlab;
								inspLinesArray[i][1]=dval;
							}
							renderInspectionFromCache();
					}
					
                }

                function processError(data, status, req) {
					if(backPage=='gallary')
						backtogallary();
					else
						{
							loadPage("home");
							displayUserName();
						}
					navigator.notification.activityStop();
					navigator.notification.alert('Failer!!',function(){},getErrorMessage(data, status, req),'Ok');
                }
}

function FillInspectionDiv(dlab,dval,totCnt,uploadCnt){
	var tmpdiv = document.createElement('div');
	var totStr= document.createElement('div');
	totStr.setAttribute("style", "position:absolute;margin-top:5px;margin-left:50px;");
	totStr.innerHTML=totCnt+" ( "+uploadCnt+" ) ";
	tmpdiv.className = "InspButton";
	tmpdiv.setAttribute("style", "margin:2px 10px;");
	tmpdiv.innerHTML=dlab;
	tmpdiv.style.height=(window.innerHeight*.15)+"px";
	tmpdiv.style.width=(window.innerWidth*.20)+"px";
	var clickstr="onInspSet('"+dval+"','"+ dlab.replace('\'', '\\\'')+"')";
	tmpdiv.setAttribute('onclick',clickstr);
	if(Disp_col>=Math.ceil(inspLinesArray.length/2)){Disp_col=0;Disp_row=Disp_row+1;}
	document.getElementById("InsTd-"+Disp_row+"-"+Disp_col).appendChild(totStr);
	document.getElementById("InsTd-"+Disp_row+"-"+Disp_col).appendChild(tmpdiv);
	Disp_col=Disp_col+1;
}

function callAttachImageWs(imginspline,imgname){
	
	$.ajax({type: "POST",
			url: getWsUrl("ModelADService"),
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
							+ getWsDataLoginString()
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
					var tmpArray=fullNodeList[0].textContent.split(']$[');
					if(tmpArray[1]==""){
						db.transaction(function(tx){
							tx.executeSql('UPDATE vis_gallery SET imgAttach="T" WHERE insp_line="'+imginspline+'"');
							attachCount=attachCount-1;
							if(attachCount==0){
								deleteMRgallary();
							}
						}, errorCB);
					}else{
						var successArrayList=tmpArray[0].split('$$');
						var failedArrayList=tmpArray[1].split('$$');
						if(successArrayList.length > 0){
							for(var i=0; i < successArrayList.length ; i++){
								onchangeSuccessState(successArrayList[i],imginspline);
							}
						}
						if(failedArrayList.length > 0){
							for(var i=0; i < failedArrayList.length ; i++){
								var failerMsgArray=failedArrayList[i].split('::');
								onchangeFailerState(failerMsgArray,imginspline);
							}
						}
						onBackToStartInspection('home');
						navigator.notification.activityStop();
						navigator.notification.alert('Error while Attaching : ' + failedArrayList.toString() , function(){}, 'Failure', 'OK');
					}
                }

                function processError(data, status, req) {
					navigator.notification.activityStop();
					navigator.notification.alert('Failer!!',function(){},getErrorMessage(data, status, req),'Ok');
                }
				
}
function getWsUrl(services){
	return vis_url+"/VISService/services/"+services;
}
function getWsDataLoginString(){
	return '<_0:ADLoginRequest>'
							   +'<_0:user>'+ userName +'</_0:user>'
							   +'<_0:pass>'+ vis_pass +'</_0:pass>'
							   +'<_0:lang>'+vis_lang+'</_0:lang>'
							   +'<_0:ClientID>'+vis_client_id+'</_0:ClientID>'
							   +'<_0:RoleID>'+vis_role+'</_0:RoleID>'
							   +'<_0:OrgID>'+vis_org_id+'</_0:OrgID>'
							   +'<_0:WarehouseID>'+vis_whouse_id+'</_0:WarehouseID>'
							   +'<_0:stage>9</_0:stage>'
		+'</_0:ADLoginRequest>';
}
function getErrorMessage(data, status, req){
	if(data.status == 0){
	return data.statusText +" : Error getting response, Connection refused";
	}else if(data.status == 500){
	return data.statusText +" : "+ $(data.responseXML).find('faultstring').text();
	}else{
	return data.statusText +" : Something goint wrong !!!";
	}
}