var vision_ftp, vision_ftp_url;
function onLogin() {
    navigator.notification.activityStart("Please Wait", "Logging in...");
    $.ajax({type: "POST",
        url: getWsUrl("ModelADService"),
        dataType: "xml",
        contentType: 'text/xml; charset=\"utf-8\"',
        data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
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
            + getWsDataLoginString()
            + '</_0:ModelCRUDRequest>'
            + '</_0:readData>'
            + '</soapenv:Body>'
            + '</soapenv:Envelope>',
        success: processSuccess,
        error: processError
    });
    function processSuccess(data, status, req) {
        if (status == "success") {
            if ($(req.responseXML).find('WindowTabData').find('RowCount').text() == "1") {
                var xmlResponse = req.responseXML.documentElement;
                var fullNodeList = xmlResponse.getElementsByTagName("DataRow");
                var dlab, dval;
                for (var i = 0; i < fullNodeList.length; i++) {
                    for (var j = 0; j < fullNodeList[i].childNodes.length; j++) {
                        if (fullNodeList[i].childNodes[j].attributes[0].value == 'Name') {
                            dlab = fullNodeList[i].childNodes[j].childNodes[0].textContent;
                        } else if (fullNodeList[i].childNodes[j].attributes[0].value == 'AD_User_ID') {
                            dval = fullNodeList[i].childNodes[j].childNodes[0].textContent;
                        }
                    }
                }
                userName = dlab;
                INSPECTOR_ID = dval;
                db.transaction(function (tx) {
                    tx.executeSql('UPDATE vis_setting SET username = "' + userName + '"');
                }, errorCB);
                loadPage("home");
                pageState = 1;
                displayUserName();
                onStopNotification();
            }
            else {
                loadPage("login");
                document.getElementById("login_error").innerHTML = "Login Failed!!!!";
                onStopNotification();
            }
        }

    }

    function processError(data, status, req) {
        console.log("Error =" + data.status);
        console.log("Error =" + data.statusText);
        console.log("Error =" + data.responseText);
        loadPage("login");
        document.getElementById("txt_user").value = userName;
        navigator.notification.alert('Failure!!', function () {
        }, getErrorMessage(data, status, req), 'Ok');
        onStopNotification();
    }
}

function fillMrLines() {

    $.ajax({type: "POST",
        url: getWsUrl("ModelADService"),
        dataType: "xml",
        contentType: 'text/xml; charset=\"utf-8\"',
        data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
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
            + '<_0:val>' + INSPECTOR_ID + '</_0:val>'
            + '</_0:field>'
            + '</_0:DataRow>'
            + '</_0:ModelCRUD>'
            + getWsDataLoginString()
            + '</_0:ModelCRUDRequest>'
            + '</_0:queryData>'
            + '</soapenv:Body>'
            + '</soapenv:Envelope>',
        success: processSuccess,
        error: processError
    });
    function processSuccess(data, status, req) {
        if (status == "success") {
            M_InOutLine_ID = "";
            mrLinesArray = new Array();
            var xmlResponse = req.responseXML.documentElement;
            var fullNodeList = xmlResponse.getElementsByTagName("DataRow");
            if (fullNodeList.length == 0) {
                onStopNotification();
                navigator.notification.alert('No lines to inspect are assigned to you.', '', 'Alert');
                loadPage("home");
            } else {
                for (var i = 0; i < fullNodeList.length; i++) {
                    var dlab, dval, inOut, desc;
                    var option = document.createElement('option');
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
                    mrLinesArray[i] = new Array();
                    mrLinesArray[i][0] = dlab;
                    mrLinesArray[i][1] = dval;
                    mrLinesArray[i][2] = inOut;
                    mrLinesArray[i][3] = desc;
                }
                onBackToStartInspection('home');
            }
        }

    }

    function processError(data, status, req) {
        if (backPage == 'gallery')
            backToGallery();
        else {
            loadPage("home");
            displayUserName();
        }
        onStopNotification();
        navigator.notification.alert('Failure!!', function () {
        }, getErrorMessage(data, status, req), 'Ok');
    }

}

function fillInspectionsLines() {

    var e = document.getElementById("linedrop");
    M_InOutLine_ID = e.options[e.selectedIndex].value;
    for (var i = 0; i < mrLinesArray.length; i++)
        if (mrLinesArray[i][1] == M_InOutLine_ID) {
            M_Line_Desc = mrLinesArray[i][3];
            break;
        }
    M_line_name = e.options[e.selectedIndex].text;
    $.ajax({type: "POST",
        url: getWsUrl("ModelADService"),
        dataType: "xml",
        contentType: 'text/xml; charset=\"utf-8\"',
        data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
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
            + '<_0:val>' + M_InOutLine_ID + '</_0:val>'
            + '</_0:field>'
            + '</_0:DataRow>'
            + '</_0:ModelCRUD>'
            + getWsDataLoginString()
            + '</_0:ModelCRUDRequest>'
            + '</_0:queryData>'
            + '</soapenv:Body>'
            + '</soapenv:Envelope>',
        success: processSuccess,
        error: processError
    });
    function processSuccess(data, status, req) {
        if (status == "success") {
            inspLinesArray = new Array();
            for (var i = 0; i < mrLinesArray.length; i++) {
                if (mrLinesArray[i][1] == M_InOutLine_ID) {
                    inspLinesArray[0] = new Array();
                    inspLinesArray[0][0] = "Vendor Paper work";
                    inspLinesArray[0][1] = mrLinesArray[i][2];
                }
            }
            var xmlResponse = req.responseXML.documentElement;
            var fullNodeList = xmlResponse.getElementsByTagName("DataRow");
            for (var i = 0; i < fullNodeList.length; i++) {
                var dlab, dval;
                for (var j = 0; j < fullNodeList[i].childNodes.length; j++) {
                    if (fullNodeList[i].childNodes[j].attributes[0].value == 'Name') {
                        dlab = fullNodeList[i].childNodes[j].childNodes[0].textContent;
                    } else if (fullNodeList[i].childNodes[j].attributes[0].value == 'X_INSTRUCTIONLINE_ID') {
                        dval = fullNodeList[i].childNodes[j].childNodes[0].textContent;
                    }
                }
                inspLinesArray[i + 1] = new Array();
                inspLinesArray[i + 1][0] = dlab;
                inspLinesArray[i + 1][1] = dval;
            }
            renderInspectionFromCache();
        }

    }

    function processError(data, status, req) {
        if (backPage == 'gallery')
            backToGallery();
        else {
            loadPage("home");
            displayUserName();
        }
        onStopNotification();
        navigator.notification.alert('Failure!!', function () {
        }, getErrorMessage(data, status, req), 'Ok');
    }
}

function FillInspectionDiv(dlab, dval, totCnt, uploadCnt, isInsp) {
    var titleBar = document.getElementById("titleBarStartInsp");
    var tHeight = window.innerHeight * .10;
    titleBar.style.height = tHeight + "px";
    var sideBar = document.getElementById("sideBarStartInsp");
    var sWidth = window.innerWidth * .10;
    sideBar.style.width = sWidth + "px";
    sideBar.style.height = window.innerHeight * .82 + "px";

    var tmpdiv = document.createElement('div');
    tmpdiv.className = "InspButton";
    tmpdiv.setAttribute("style", "margin:2px 10px;");
    var totStr = document.createTextNode(totCnt + " ( " + uploadCnt + " ) ");
    var label = document.createTextNode(dlab);
    var br = document.createElement('br');
    tmpdiv.appendChild(totStr);
    tmpdiv.appendChild(br);
    tmpdiv.appendChild(label);
    tmpdiv.style.height = (window.innerHeight * .23) + "px";
    tmpdiv.style.width = (window.innerHeight * .3333) + "px";
    var clickstr;
    if (isInsp == 0)
        clickstr = "onDefualtInspSet('" + dval + "','" + dlab.replace('\'', '\\\'') + "')";
    else
        clickstr = "onInspSet('" + dval + "','" + dlab.replace('\'', '\\\'') + "')";
    tmpdiv.setAttribute('onclick', clickstr);
    if (Disp_col >= Math.ceil(inspLinesArray.length / 3)) {
        Disp_col = 0;
        Disp_row = Disp_row + 1;
    }
    document.getElementById("InsTd-" + Disp_row + "-" + Disp_col).appendChild(tmpdiv);
    Disp_col = Disp_col + 1;
}

function callAttachImageWs(imginspline, imgname) {

    $.ajax({type: "POST",
        url: getWsUrl("ModelADService"),
        dataType: "xml",
        contentType: 'text/xml; charset=\"utf-8\"',
        data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
            + '<soapenv:Header/>'
            + '<soapenv:Body>'
            + '<_0:runProcess>'
            + '<_0:ModelRunProcessRequest>'
            + '<_0:ModelRunProcess AD_Record_ID="2272195">'
            + '<_0:serviceType>AttachImage</_0:serviceType>'
            + '<_0:ParamValues>'
            + '<_0:field column="X_InstructionLine_ID">'
            + '<_0:val>' + imginspline + '</_0:val>'
            + '</_0:field>'
            + '<_0:field column="imgName">'
            + '<_0:val>' + imgname + '</_0:val>'
            + '</_0:field>'
            + '</_0:ParamValues>'
            + '</_0:ModelRunProcess>'
            + getWsDataLoginString()
            + '</_0:ModelRunProcessRequest>'
            + '</_0:runProcess>'
            + '</soapenv:Body>'
            + '</soapenv:Envelope>',
        success: processSuccess,
        error: processError
    });
    function processSuccess(data, status, req) {
        var xmlResponse = req.responseXML.documentElement;
        var fullNodeList = xmlResponse.getElementsByTagName("Summary");
        var tmpArray = fullNodeList[0].textContent.split(']$[');
        if (tmpArray[1] == "") {
            db.transaction(function (tx) {
                tx.executeSql('UPDATE vis_gallery SET imgAttach="T" WHERE insp_line="' + imginspline + '"');
                attachCount = attachCount - 1;
                if (attachCount == 0) {
                    deleteMRgallery();
                }
            }, errorCB);
        } else {
            var successArrayList = tmpArray[0].split('$$');
            var failedArrayList = tmpArray[1].split('$$');
            if (successArrayList.length > 0) {
                for (var i = 0; i < successArrayList.length; i++) {
                    onchangeSuccessState(successArrayList[i], imginspline, 1);
                }
            }
            if (failedArrayList.length > 0) {
                for (var i = 0; i < failedArrayList.length; i++) {
                    var failerMsgArray = failedArrayList[i].split('::');
                    onchangeFailerState(failerMsgArray, imginspline, 1);
                }
            }
            onBackToStartInspection('home');
            onStopNotification();
            navigator.notification.alert('Error while Attaching : ' + failedArrayList.toString(), function () {
            }, 'Failure', 'OK');
        }
    }

    function processError(data, status, req) {
        onStopNotification();
        navigator.notification.alert('Failure!!', function () {
        }, getErrorMessage(data, status, req), 'Ok');
    }

}

function callAttachM_InoutWs(rec_id, tab_name, imgname) {
    $.ajax({type: "POST",
        url: getWsUrl("ModelADService"),
        dataType: "xml",
        contentType: 'text/xml; charset=\"utf-8\"',
        data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
            + '<soapenv:Header/>'
            + '<soapenv:Body>'
            + '<_0:runProcess>'
            + '<_0:ModelRunProcessRequest>'
            + '<_0:ModelRunProcess AD_Record_ID="' + rec_id + '">'
            + '<_0:serviceType>AttachImage</_0:serviceType>'
            + '<_0:ParamValues>'
            + '<_0:field column="TableName">'
            + '<_0:val>' + tab_name + '</_0:val>'
            + '</_0:field>'
            + '<_0:field column="imgName">'
            + '<_0:val>' + imgname + '</_0:val>'
            + '</_0:field>'
            + '</_0:ParamValues>'
            + '</_0:ModelRunProcess>'
            + getWsDataLoginString()
            + '</_0:ModelRunProcessRequest>'
            + '</_0:runProcess>'
            + '</soapenv:Body>'
            + '</soapenv:Envelope>',
        success: processSuccess,
        error: processError
    });
    function processSuccess(data, status, req) {
        var xmlResponse = req.responseXML.documentElement;
        var fullNodeList = xmlResponse.getElementsByTagName("Summary");
        var tmpArray = fullNodeList[0].textContent.split(']$[');
        if (tmpArray[1] == "") {
            db.transaction(function (tx) {
                tx.executeSql('UPDATE vis_gallery SET imgAttach="T" WHERE in_out_id="' + rec_id + '"');
                attachCount = attachCount - 1;
                if (attachCount == 0) {
                    deleteMRgallery();
                }
            }, errorCB);
        } else {
            var successArrayList = tmpArray[0].split('$$');
            var failedArrayList = tmpArray[1].split('$$');
            if (successArrayList.length > 0) {
                for (var i = 0; i < successArrayList.length; i++) {
                    onchangeSuccessState(successArrayList[i], rec_id, 0);
                }
            }
            if (failedArrayList.length > 0) {
                for (var i = 0; i < failedArrayList.length; i++) {
                    var failerMsgArray = failedArrayList[i].split('::');
                    onchangeFailerState(failerMsgArray, rec_id, 0);
                }
            }
            onBackToStartInspection('home');
            onStopNotification();
            navigator.notification.alert('Error while Attaching : ' + failedArrayList.toString(), function () {
            }, 'Failure', 'OK');
        }
    }

    function processError(data, status, req) {
        onStopNotification();
        navigator.notification.alert('Failure!!', function () {
        }, getErrorMessage(data, status, req), 'Ok');
    }

}

function getFTPList() {

    $.ajax({type: "POST",
        url: getWsUrl("ModelADService"),
        dataType: "xml",
        contentType: 'text/xml; charset=\"utf-8\"',
        data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
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
            + '</_0:DataRow>'
            + '</_0:ModelCRUD>'
            + getWsDataLoginString()
            + '</_0:ModelCRUDRequest>'
            + '</_0:queryData>'
            + '</soapenv:Body>'
            + '</soapenv:Envelope>',
        success: processSuccess,
        error: processError
    });
    function processSuccess(data, status, req) {
        if (status == "success") {
            vision_ftp_url = "";
            vision_ftp = new Array();
            var xmlResponse = req.responseXML.documentElement;
            var fullNodeList = xmlResponse.getElementsByTagName("DataRow");
            if (fullNodeList.length == 0) {
                onStopNotification();
                navigator.notification.alert('No FTP list found.', '', 'Alert');
                backToGallery();
            } else {
                for (var i = 0; i < fullNodeList.length; i++) {
                    var fUrl, fName, fPass, fUser;
                    var option = document.createElement('option');
                    for (var j = 0; j < fullNodeList[i].childNodes.length; j++) {
                        if (fullNodeList[i].childNodes[j].attributes[0].value == 'FTP_Url') {
                            fUrl = fullNodeList[i].childNodes[j].childNodes[0].textContent;
                        } else if (fullNodeList[i].childNodes[j].attributes[0].value == 'Name') {
                            fName = fullNodeList[i].childNodes[j].childNodes[0].textContent;
                        } else if (fullNodeList[i].childNodes[j].attributes[0].value == 'Password') {
                            fPass = fullNodeList[i].childNodes[j].childNodes[0].textContent;
                        } else if (fullNodeList[i].childNodes[j].attributes[0].value == 'Username') {
                            fUser = fullNodeList[i].childNodes[j].childNodes[0].textContent;
                        }
                    }
                    vision_ftp[i] = new Array();
                    vision_ftp[i][0] = fName;
                    vision_ftp[i][1] = fUrl;
                    vision_ftp[i][2] = fUser;
                    vision_ftp[i][3] = fPass;
                }
                onFtpExplorer();
            }
        }

    }

    function processError(data, status, req) {
        backToGallery();
        onStopNotification();
        navigator.notification.alert('Failure!!', function () {
        }, getErrorMessage(data, status, req), 'Ok');
    }

}

function getWsUrl(services) {
    return vis_url + "/VISService/services/" + services;
}
function getWsDataLoginString() {
    return '<_0:ADLoginRequest>'
        + '<_0:user>' + userName + '</_0:user>'
        + '<_0:pass>' + vis_pass + '</_0:pass>'
        + '<_0:lang>' + vis_lang + '</_0:lang>'
        + '<_0:ClientID>' + vis_client_id + '</_0:ClientID>'
        + '<_0:RoleID>' + vis_role + '</_0:RoleID>'
        + '<_0:OrgID>' + vis_org_id + '</_0:OrgID>'
        + '<_0:WarehouseID>' + vis_whouse_id + '</_0:WarehouseID>'
        + '<_0:stage>9</_0:stage>'
        + '</_0:ADLoginRequest>';
}
function getErrorMessage(data, status, req) {
    if (data.status == 0) {
        return data.statusText + " : Error getting response, Connection refused Or Timeout ";
    } else if (data.status == 500) {
        return data.statusText + " : " + $(data.responseXML).find('faultstring').text();
    } else {
        return data.statusText + " : Something gone wrong !!!";
    }
}