function onLogin(){

	$.ajax({type: "POST",
			url: vis_url+"/VISService/services/"+"ModelADService",
			dataType: "xml",
			contentType: 'text/xml; charset=utf-8',
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
							   +'<_0:user>'+document.getElementById("txt_user").value+'</_0:user>'
							   +'<_0:pass>'+document.getElementById("txt_password").value+'</_0:pass>'
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
							username=$(req.responseXML).find('WindowTabData').find('DataSet').find('DataRow').find('field').find('val').text();
							loadPage("home");
							document.getElementById("user_lbl").innerHTML="Hello : "+username;
						}
						else{
							//navigator.notification.alert(req.responseText + " " + status);
							loadPage("login");
							document.getElementById("login_error").innerHTML="Not Valid User";
						}
					}
					
                }

                function processError(data, status, req) {
					loadPage("login");
					document.getElementById("login_error").innerHTML="Something Going Wrong !!!";
                }  
}