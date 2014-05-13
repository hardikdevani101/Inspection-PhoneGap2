var canvas;
var boundX, BoundY;
var xsize, ysize;
var jcrop_api;
var finalSelection;
var crop_img;
var watermark;
var opacity = (255 / (100 / 50));
var gctx;
var origImg;
var userName = "";
var INSPECTOR_ID;
var M_InOutLine_ID = 0;
var M_line_name;
var X_INSTRUCTIONLINE_ID;
var X_instruction_name;
var vis_pass;
var Disp_row;
var Disp_col;
var SelectedGallaryList;
var attachCount;
var itemCount;
var imgUploadCount = 0;
var mrLinesArray = new Array();
var backPage;
var gallaryTable="";
var totColumns=0;
var pageState = 0;
var deleteCount=0;
var inspLinesArray = new Array();
var pandingUploads = new Array();
var pandingCounts = 0;
var currentPage="";

function onLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
    document.addEventListener("backbutton", onBackButton, false);
    watermark = new Image();
    origImg = new Image();
    watermark.src = "img/Velocity_Watermark.png";
	console.log(window.innerHeight);
	console.log(window.innerWidth);
}

function onDeviceReady() {
    db = window.openDatabase("vis_inspection", "1.0", "vis_inspection", 100000);
    db.transaction(settingDbSetup, errorCB, loadSetting);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, setRootDirectory, function (error) {
        console.log("request FSError = " + error);
    });
}

function onExit() {
    loadPage("exit");
}

function onSyncFiles(){
	navigator.notification.activityStart("Please Wait", "Uploading files.....");
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="' + M_InOutLine_ID + '" and insp_line="' + X_INSTRUCTIONLINE_ID + '"  and imgUpload="F"', [], function (tx, results) {
            imagelistarray = results;
            imgUploadCount = imagelistarray.rows.length;
			callSyncVerify();
			for (var j = 0; j < imagelistarray.rows.length; j++) {
				onUploadFile(imagelistarray.rows.item(j).file, imagelistarray.rows.item(j).insp_line,callSyncVerify);
			}
        }, function (err) {
            console.log("Error SQL: " + err.code);
        });
    }, errorCB);
}

function callSyncVerify(){
	console.log(imgUploadCount);
	 if (imgUploadCount == 0) {
		onStopNotification();
		navigator.notification.alert('Synchronized all files', function () {
			gallaryTable="";
			backtogallary();		
		}, 'Success', 'OK');
		
	 }
}

function onFinish() {
    navigator.notification.activityStart("Please Wait", "Uploading files.....");
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="' + M_InOutLine_ID + '" and imgUpload="F"', [], function (tx, results) {
            imagelistarray = results;
            callFilesUpload();
        }, function (err) {
            console.log("Error SQL: " + err.code);
        });
    }, errorCB);
}

function callFilesUpload() {
    imgUploadCount = imagelistarray.rows.length;
    callUploadVerify();
    for (var j = 0; j < imagelistarray.rows.length; j++) {
        onUploadFile(imagelistarray.rows.item(j).file, imagelistarray.rows.item(j).insp_line,callUploadVerify);
    }
}

function callUploadVerify() {

    if (imgUploadCount == 0) {
        db.transaction(attachimagelist, errorCB);
        function attachimagelist(tx) {
            tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="' + M_InOutLine_ID + '" and imgUpload="F"', [], attachimageSelect, function (err) {
                console.log("Error SQL: " + err.code);
            });
        }
        function attachimageSelect(tx, result) {
            if (result.rows.length == 0) {
                AttachAllImage();
            } else {
                navigator.notification.alert('Failed to upload all files, Try again', function () {}, 'Failure', 'OK');
                onStopNotification();
            }
        }
    }
}

function AttachAllImage() {
    navigator.notification.activityStart("Please Wait", "Attaching Files");
	attachCount = inspLinesArray.length;
	for(var i=0; i < inspLinesArray.length ; i++){
			getResultOfInsp(inspLinesArray[i][1]);
	}
	
	function getResultOfInsp(inspNumber){
		db.transaction(function (tx) {
			tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="' + M_InOutLine_ID + '" and insp_line="' + inspNumber  + '" and imgUpload="T" and imgAttach="F"', [], 
			function (tx, result){
				if(result.rows.length > 0)
					AllAttachSelect(result);
				else
					attachCount=attachCount-1;
			}, function (err) {
				console.log("Error SQL: " + err.code);
			});
		}, errorCB);
	}
}

function AllAttachSelect(result) {
		var filesListStr="";
            for (var i = 0; i < result.rows.length; i++) {
				filesListStr=filesListStr + result.rows.item(i).name + ",";
            }
			filesListStr=filesListStr.substring(0, filesListStr.length - 1);
			callAttachImageWs(result.rows.item(0).insp_line, filesListStr);
    }

function deleteImageSelectSuccess(tx, results) {
		for (var i = 0; i < results.rows.length; i++) {
			if(DataTypes.indexOf(getExtention(results.rows.item(i).name).toUpperCase()) >= 0)
			{
				onRemoveVISDirFile(results.rows.item(i).file,results.rows.item(i).insp_line);
			}
			else
			{
				tx.executeSql('DELETE FROM vis_gallery WHERE file="' + results.rows.item(i).file + '" and insp_line="' + results.rows.item(i).insp_line + '"');
				deleteCount=deleteCount-1;
			}
        }
        onBackToStartInspection('home');
        onStopNotification();
        navigator.notification.alert('All Files attached', function () {}, 'Success', 'OK');
}

function onRemoveVISDirFile(tmpfile,InspNumber){
	root.getFile(tmpfile, null, function (file) {
		file.remove(function (entry) {
			db.transaction(function (tx) {
				tx.executeSql('DELETE FROM vis_gallery WHERE file="' + tmpfile + '" and insp_line="' + InspNumber + '"');
				deleteCount=deleteCount-1;
				varifyAllDelete();
			}, errorCB);
		}, function (error) { console.log("Error on read = " + error.code); });
    }, function (error) { console.log(" FSError = " + error.code); });
}

function confirmGallaryDiscard() {
    navigator.notification.confirm('Are you sure ???', DiscardGallary, 'Delete selected files..', 'Ok,Cancel');
}

function varifyAllDelete(){
	if(deleteCount==0){
		gallaryTable="";
		backtogallary();
	}
}

function deleteSelectedGallary() {
	deleteCount = SelectedGallaryList.length;
    for (var j = 0; j < imagelistarray.rows.length; j++) {
        if (DataTypes.indexOf(getExtention(getFileName(imagelistarray.rows.item(j).file)).toUpperCase()) < 0) {
            var tmpfile = imagelistarray.rows.item(j).file;
            if (SelectedGallaryList.indexOf(getFileName(tmpfile)) >= 0) {
                db.transaction(function (tx) {
                    tx.executeSql('DELETE FROM vis_gallery WHERE file="' + tmpfile + '" and insp_line="' + X_INSTRUCTIONLINE_ID + '"');
					deleteCount=deleteCount-1;
					varifyAllDelete();
                }, errorCB);
            }
        } else {
            if (SelectedGallaryList.indexOf(imagelistarray.rows.item(j).name) >= 0) {
				onRemoveVISDirFile(imagelistarray.rows.item(j).file,X_INSTRUCTIONLINE_ID);
            }
        }
    }
}

function fillGallaryForDelete() {
	loadPage('SelectGallary');
    for (var j = 0; j < 3; j++) {
        var tr = document.createElement('tr');
        tr.setAttribute("style", "margin:0px; padding:0px;");

        for (var i = 0; i < Math.ceil(imagelistarray.rows.length / 3); i++) {
            var td = document.createElement('td');
            td.setAttribute("id", "Seltd-" + j + "-" + i);
            td.setAttribute("style", "margin:0px; padding:0px;");
            tr.appendChild(td);
        }
        document.getElementById("disp-selGal").appendChild(tr);
    }
    Disp_col = 0;Disp_row = 0;
    for (var j = 0; j < imagelistarray.rows.length; j++) {
        if (DataTypes.indexOf(getExtention(getFileName(imagelistarray.rows.item(j).file)).toUpperCase()) < 0) {

            var tmpFile = imagelistarray.rows.item(j).file;
            var imgelem = document.createElement("div");
            imgelem.setAttribute("style", "margin:3px 5px; border:1px solid #000;float:left; word-wrap:break-word;");
            imgelem.style.width = (window.innerHeight * .36) + "px";
            imgelem.style.height = (window.innerHeight * .27) + "px";
            imgelem.setAttribute("height", "25%");
            imgelem.setAttribute("width", "30%");
            imgelem.innerHTML = getFileName(tmpFile);

            var chkImg = document.createElement("img");
            chkImg.setAttribute("style", "left:-50; margin-left:-50;position:absolute;display:none;");
            chkImg.setAttribute("src", "img/checkbox_full.png");
            if (Disp_row > 2 ) {
				Disp_row = 0;Disp_col = Disp_col + 1;
			}
            var clickstr = "onDeleteFileSelect('Seltd-" + Disp_row + "-" + Disp_col + "','" + getFileName(tmpFile) + "')";
            chkImg.setAttribute("id", "chkSeltd-" + Disp_row + "-" + Disp_col);
            document.getElementById("Seltd-" + Disp_row + "-" + Disp_col).appendChild(chkImg);
            document.getElementById("Seltd-" + Disp_row + "-" + Disp_col).appendChild(imgelem);
            document.getElementById("Seltd-" + Disp_row + "-" + Disp_col).setAttribute('onclick', clickstr);
            Disp_row = Disp_row + 1;
        } else {
            root.getFile(imagelistarray.rows.item(j).file, null, function (FnEntries) {
					onReadFileDataUrl(FnEntries,j,fillToDeleteSelectionImage);
			}, function (error) {console.log(" FSError = " + error.code);});
			
            function fillToDeleteSelectionImage(evt,ItemNumber,rfile) {
                    var imgelem = document.createElement("img");
                    imgelem.setAttribute("height", (window.innerHeight * .27) + "px");
                    imgelem.setAttribute("width", (window.innerHeight* .36) + "px");
                    imgelem.setAttribute("style", "margin:3px 5px; float:left;");
                    imgelem.setAttribute("src", evt.target.result);
                    var chkImg = document.createElement("img");
                    chkImg.setAttribute("style", "left:-50; margin-left:-50;position:absolute;display:none;");
                    chkImg.setAttribute("src", "img/checkbox_full.png");

					if (Disp_row > 2 ) {
							Disp_row = 0;Disp_col = Disp_col + 1;
					}
                    var clickstr = "onDeleteFileSelect('Seltd-" + Disp_row + "-" + Disp_col + "','" + rfile.name + "')";
                    chkImg.setAttribute("id", "chkSeltd-" + Disp_row + "-" + Disp_col);
                    document.getElementById("Seltd-" + Disp_row + "-" + Disp_col).appendChild(chkImg);
                    document.getElementById("Seltd-" + Disp_row + "-" + Disp_col).appendChild(imgelem);
                    document.getElementById("Seltd-" + Disp_row + "-" + Disp_col).setAttribute('onclick', clickstr);
                    Disp_row = Disp_row + 1;
            }
        }
    }
    onStopNotification();
}

function onDeleteFileSelect(selectTdId, galName) {

    if (SelectedGallaryList.indexOf(galName) < 0) {
        SelectedGallaryList.push(galName);
        document.getElementById("chk" + selectTdId).setAttribute("style", "display: block;position:absolute;");
    } else {
        document.getElementById("chk" + selectTdId).setAttribute("style", "display: none;");
        SelectedGallaryList = remFile(SelectedGallaryList, galName);
    }
    function remFile(ary, elem) {
        var i = ary.indexOf(elem);
        if (i >= 0) ary.splice(i, 1);
        return ary;
    }
}

function renderGallary() {
    
	if(gallaryTable=="")
	{
		db.transaction(function (tx) {
			tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="' + M_InOutLine_ID + '" and insp_line="' + X_INSTRUCTIONLINE_ID + '"', [], function (tx, results) {
				imagelistarray = results;
				Disp_col = 0;
				Disp_row = 0;
				onCreateTR_TD('disp-tab1',fillGallaryPhotos);
			}, function (err) {
				console.log("Error SQL: " + err.code);
			});
		}, errorCB);
	}else{
		document.getElementById("disp-tab1").innerHTML="";
		document.getElementById("disp-tab1").innerHTML=gallaryTable;
		onStopNotification();
	}
}

function onCreateTR_TD(tableName,callBack){
	totColumns=0;
	document.getElementById("disp-tab1").innerHTML="";
	for (var j = 0; j < 3; j++) {
        var tr = document.createElement('tr');
		tr.setAttribute("id", "tr-" + j);
        tr.setAttribute("style", "margin:0px; padding:0px;");
        for (var i = 0; i < Math.ceil(imagelistarray.rows.length / 3); i++) {
            var td = document.createElement('td');
            td.setAttribute("id", "td-" + j + "-" + i);
            td.setAttribute("style", "margin:0px; padding:0px;");
            tr.appendChild(td);
			totColumns=totColumns+1;
        }
        document.getElementById("disp-tab1").appendChild(tr);
    }
	callBack();
}

function fillGallaryPhotos() {
    itemCount = 0;
	pandingCounts= 0;
	if(imagelistarray.rows.length == 0){
		onStopNotification();
	}
    for (var j = 0; j < imagelistarray.rows.length; j++) {
        if (DataTypes.indexOf(getExtention(imagelistarray.rows.item(j).name).toUpperCase()) < 0) {

            fillToTDDiv(imagelistarray.rows.item(j).file,j);
			function fillToTDDiv(tmpFile,ItemNumber){
				var imgelem = document.createElement("div");
				imgelem.setAttribute("style", "margin:3px 5px; border:1px solid #000;float:left; word-wrap:break-word;");
				imgelem.style.width = (window.innerHeight * .36) + "px";
				imgelem.style.height = (window.innerHeight * .27) + "px";
				imgelem.innerHTML = getFileName(tmpFile);
				if (Disp_row > 2 ) {
							Disp_row = 0;Disp_col = Disp_col + 1;
				}
				var chkImg = document.createElement("img");
					chkImg.setAttribute("style", "position:absolute;height:35px;width:35px;display:none;");
					chkImg.setAttribute("src", "img/up.png");
					chkImg.setAttribute("id","tdUpload-" + Disp_row + "-" + Disp_col);
					document.getElementById("td-" + Disp_row + "-" + Disp_col).appendChild(chkImg);
					
				if (imagelistarray.rows.item(ItemNumber).imgUpload == 'T') {
					document.getElementById("tdUpload-" + Disp_row + "-" + Disp_col).setAttribute("style", "position:absolute;height:35px;width:35px;display:block;");
				}else{
					pandingUploads[pandingCounts] = new Array();
					pandingUploads[pandingCounts][0]="tdUpload-" + Disp_row + "-" + Disp_col;
					pandingUploads[pandingCounts++][1]=getFileName(tmpFile);
					document.getElementById("tdUpload-" + Disp_row + "-" + Disp_col).setAttribute("style", "display:none;");
				}
				document.getElementById("td-" + Disp_row + "-" + Disp_col).appendChild(imgelem);
				itemCount = itemCount + 1;
				Disp_row = Disp_row + 1;
				onRenderTable();
			}
            
        } else {
			getFileFunction(j,imagelistarray.rows.item(j).file);
			function getFileFunction(ItemNumber,FilePath){
				root.getFile(FilePath, null, function (FnEntries) {
						onReadFileDataUrl(FnEntries,ItemNumber,fillToImage);
				}, function (error) {console.log(" FSError = " + error.code);});
			}
            function fillToImage(evt,ItemNumber,rfile) {
                    var imgelem = document.createElement("img");
                    imgelem.setAttribute("height", (window.innerHeight * .27) + "px");
                    imgelem.setAttribute("width", (window.innerHeight * .36) + "px");
                    imgelem.setAttribute("style", "margin:3px 5px; float:left;");
                    imgelem.setAttribute("src", evt.target.result);
                    if (Disp_row > 2 ) {
							Disp_row = 0;Disp_col = Disp_col + 1;
					}
					var chkImg = document.createElement("img");
					chkImg.setAttribute("style", "position:absolute;height:35px;width:35px;display:none;");
					chkImg.setAttribute("src", "img/up.png");
					chkImg.setAttribute("id","tdUpload-" + Disp_row + "-" + Disp_col);
					document.getElementById("td-" + Disp_row + "-" + Disp_col).appendChild(chkImg);
					
                    if (imagelistarray.rows.item(ItemNumber).imgUpload == 'T') {
                        document.getElementById("tdUpload-" + Disp_row + "-" + Disp_col).setAttribute("style", "position:absolute;height:35px;width:35px;display:block;");
                    }else{
						pandingUploads[pandingCounts] = new Array();
						pandingUploads[pandingCounts][0] = "tdUpload-" + Disp_row + "-" + Disp_col;
						pandingUploads[pandingCounts++][1] = rfile.name;
						document.getElementById("tdUpload-" + Disp_row + "-" + Disp_col).setAttribute("style", "display:none;");
					}
                    document.getElementById("td-" + Disp_row + "-" + Disp_col).appendChild(imgelem);
                    itemCount = itemCount + 1;
                    Disp_row = Disp_row + 1;
					onRenderTable();
            }
        }
    }
}

function onRenderTable(){
	if(itemCount==imagelistarray.rows.length)
	{
		gallaryTable = document.getElementById("disp-tab1").innerHTML;
		onStopNotification();
	}
}

function discardInspections() {
    navigator.notification.confirm('Are you sure ???', confirmDiscardInspections, 'Discard All Inspections...', 'Ok,Cancel');
}

function confirmDiscardInspections(buttonIndex) {
    if (buttonIndex == 1) {
        db.transaction(function(tx){
			tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="'+M_InOutLine_ID+'"', [], 
			function(tx,results){
				for (var i = 0; i < results.rows.length; i++) {
					if(DataTypes.indexOf(getExtention(results.rows.item(i).name).toUpperCase()) >= 0)
					{
						onRemoveVISDirFile(results.rows.item(i).file,results.rows.item(i).insp_line);
					}
					else
					{
						tx.executeSql('DELETE FROM vis_gallery WHERE file="' + results.rows.item(i).file + '" and insp_line="' + results.rows.item(i).insp_line + '"');
					}
				}
				navigator.notification.alert('Discard All Inspections success', function () {}, 'Success', 'OK');
			},function(err){console.log("Error SQL: "+err.code);} );
		}, errorCB); 
    }
}

function getFileName(tmpFile) {
    var tmpArray = tmpFile.split('/');
    return tmpArray.pop();
}

function onLoginpage() {
    loadPage("login");
	document.getElementById("txt_user").value = userName;
	pageState = 0;
    document.getElementById("login_error").innerHTML = "";
}

function loadAccureChoise() {
    loadPage("AccureChoise");
}

function loadgallaryChoise() {
    loadPage("fileExpo");
    fileexplore();
}

function onSettingPage() {
    loadPage("setting");
    document.getElementById("setting_error").innerHTML = "";
    setSettingpage();
}

function setSettingpage() {
    document.getElementById("txt_url").value = vis_url;
    document.getElementById("txt_lang").value = vis_lang;
    document.getElementById("txt_client").value = vis_client_id;
	var e = document.getElementById("txt_role");
	for(var i=0 ; i < e.options.length ; i++){
		if(e.options[i].value==vis_role)
			e.options[i].selected = true;
	}
	M_InOutLine_ID=e.options[e.selectedIndex].value;
	
	e = document.getElementById("txt_warehouse");
	for(var i=0 ; i < e.options.length ; i++){
		if(e.options[i].value==vis_whouse_id)
			e.options[i].selected = true;
	}
	
	e = document.getElementById("txt_organizer");
	for(var i=0 ; i < e.options.length ; i++){
		if(e.options[i].value==vis_org_id)
			e.options[i].selected = true;
	}
}

function onSettingUpdate() {
    vis_url = document.getElementById("txt_url").value;
    vis_lang = document.getElementById("txt_lang").value;
    vis_client_id = document.getElementById("txt_client").value;
	var e = document.getElementById("txt_role");
	vis_role = e.options[e.selectedIndex].value;
	
	e = document.getElementById("txt_warehouse");
	vis_whouse_id = e.options[e.selectedIndex].value;
	
	e = document.getElementById("txt_organizer");
	vis_org_id = e.options[e.selectedIndex].value;
	
    if (vis_url == "" && vis_lang == "" && vis_client_id == "" && vis_role == "" && vis_whouse_id == "" && vis_org_id == "") {
        navigator.notification.alert('No Any Field Should Blank!', onSettingPage, 'Invalid Value', 'Ok');
        loadSetting();
    } else {
        db.transaction(updateSettings, errorCB);
        loadPage("login");
    }

}

function displayUserName(){
	document.getElementsByName("user_lbl")[0].innerHTML="User : "+userName;
	document.getElementsByName("user_lbl")[1].innerHTML="User : "+userName;
	document.getElementsByName("user_lbl")[2].innerHTML="User : "+userName;
	document.getElementsByName("user_lbl")[3].innerHTML="User : "+userName;
	document.getElementsByName("user_lbl")[4].innerHTML="User : "+userName;
	document.getElementsByName("user_lbl")[5].innerHTML="User : "+userName;
}

function onPhotoDataSuccess(imageData) {
    navigator.notification.activityStart("Please Wait", "loading.....");
    $('#smallImage').attr('src', "data:image/png;base64," + imageData);
    loadPage("imagePrev");
    onCrop();
}

function captureI() {
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
        quality: 90,
        destinationType: Camera.DestinationType.DATA_URL,
        allowEdit: true
    });

}

function onFail(message) {
    //alert('Failed because: ' + message);
	navigator.notification.alert('Failer!!',function(){},message,'Ok');
    backtogallary();
}

function loadPage(id1) {
    if (id1 == 'exit') {
        navigator.app.exitApp();
    } else {
        document.getElementById("disp").innerHTML = document.getElementById(id1).innerHTML;
		currentPage=id1;
    }
}

function onBackButton() {
    //document.removeEventListener("backbutton", onBackButton, false);
	if(currentPage=='login'){
		function checkButtonSelection(iValue){
            if (iValue == 2){
                    navigator.app.exitApp();
                }
            }
        navigator.notification.confirm(
            "Are you sure you want to EXIT ?",
            checkButtonSelection,
            'EXIT APP:',
            'Cancel,OK');
	}else if(currentPage=='home'){
		loadPage("login");
		document.getElementById("txt_user").value = userName;
	}else if(currentPage=='startNewInsp'){
		loadPage("home");
	}else if(currentPage=='gallery'){
		onBackToStartInspection('gallary');
	}else if(currentPage=='SelectGallary'){
		backtogallary();
	}else if(currentPage=='fileExpo'){
		backtogallary();
	}else if(currentPage=='cropView'){
		backtogallary();
	}else if(currentPage=='setting'){
		onLoginpage();
	}else if(currentPage=='aboutUs'){
		onLoginpage();
	}else{
         navigator.app.backHistory();
    }
}

function onStartNewInspection() {
    loadPage("startNewInsp");
    navigator.notification.activityStart("Please Wait", "loading.....");
    backPage = 'home';
    fillMrLines();
}

function onBackToStartInspection(backPageName) {
    loadPage("startNewInsp");
    backPage = backPageName;
    navigator.notification.activityStart("Please Wait", "loading.....");
	console.log(mrLinesArray.toString());
    if (mrLinesArray.length == 0) {
        fillMrLines();
    } else {
        var select = document.getElementById("linedrop");
        for (var i = 0; i < mrLinesArray.length; i++) {
            var option = document.createElement('option');
            option.text = mrLinesArray[i][0];
            option.value = mrLinesArray[i][1];
            if (option.value == M_InOutLine_ID)
                option.selected = true;
            select.add(option);
        }
        select.setAttribute("onchange", "fillInspectionsLines()");
        onfillInspectionsLines();
    }
}

function onfillInspectionsLines(){
	var e = document.getElementById("linedrop");
	var selMrLine=e.options[e.selectedIndex].value;
	if(M_InOutLine_ID==selMrLine){
		renderInspectionFromCache();
	}else{
		fillInspectionsLines();
	}
}

function renderInspectionFromCache(){
	var div = document.getElementById("outNewIns");
	document.getElementById("disp-Insp").innerHTML="";
	//div.setAttribute("style", "overflow-x: auto; overflow-y: hidden;");
	//div.style.width="auto";
	//div.style.width=(window.innerHeight*.75)+"px";
	//div.style.height=(window.innerHeight*.65)+"px";
	for(var j=0; j<2; j++)
	{
		var tr = document.createElement('tr');
		tr.setAttribute("style", "margin:0px; padding:0px;");
		for(var i=0; i < Math.ceil(inspLinesArray.length/2); i++)
		{
			var td = document.createElement('td');
			td.setAttribute("id","InsTd-"+j+"-"+i);
			td.setAttribute("style", "margin:1px; padding:1px;");
			tr.appendChild(td);
		}
		document.getElementById("disp-Insp").appendChild(tr);
	}
	Disp_col=0;Disp_row=0;
	console.log(inspLinesArray.toString());
	for(var i=0 ; i < inspLinesArray.length ; i++){
		var dval = inspLinesArray[i][1];
		var dlab = inspLinesArray[i][0];
		getUploadCounts(M_InOutLine_ID,dlab,dval,FillInspectionDiv);
	}
	
	onStopNotification();
}

function onStopNotification(){
	window.setTimeout(function() {
		navigator.notification.activityStop();
	}, 300);
}

function onInspSet(nid, iname) {
	navigator.notification.activityStart("Please Wait", "loading.....");
    loadPage('gallery');
	gallaryTable="";
    renderGallary();
    X_INSTRUCTIONLINE_ID = nid;
    X_instruction_name = iname;
    document.getElementById("gallery_head").innerHTML = M_line_name + "(" + X_instruction_name + ")";

}

function backtogallary() {
	navigator.notification.activityStart("Please Wait", "loading.....");
    loadPage('gallery');
    renderGallary();
    document.getElementById("gallery_head").innerHTML = M_line_name + "(" + X_instruction_name + ")";
}

function onCrop() {
    loadPage('cropView');

    $('#cropImage').html(['<img src="', document.getElementById('smallImage').src, '" width="80%" height="80%" />'].join(''));
    crop_img = $('#cropImage img')[0];
	if(crop_img.width*3/4 > crop_img.height){
		ysize = crop_img.height;
		xsize = crop_img.height*4/3; 
	}else{
		xsize = crop_img.width;
		ysize = crop_img.width*3/4;
	}
    $('#cropImage img').Jcrop({
        bgColor: 'black',
        bgOpacity: .3,
        onSelect: cropAreaChanged,
        onChange: cropAreaChanged,
        aspectRatio: 4 / 3,
        setSelect: [(crop_img.width-xsize)/2, (crop_img.height - ysize)/2, xsize, ysize]
    }, function () {
        // Use the API to get the real image size
        var bounds = this.getBounds();
        boundx = bounds[0];
        boundy = bounds[1];
        // Store the API in the jcrop_api variable
        jcrop_api = this;
    });
    onStopNotification();
    function cropAreaChanged(selection) {
        if (selection.w > 0 && selection.h > 0)
            finalSelection = selection;
    }
}

function onCropSaved() {
    navigator.notification.activityStart("Please Wait", "Croping.....");
    canvas = document.createElement('canvas');
    var tempImage = new Image();
    tempImage.src = crop_img.src;
    xsize = tempImage.width,
    ysize = tempImage.height;

    var rx = xsize / boundx;
    var ry = ysize / boundy;

    canvas.width = Math.round(rx * finalSelection.w);
    canvas.height = Math.round(ry * finalSelection.h);

    if (canvas.width < 1024 && canvas.height < 768)
        navigator.notification.alert('Select Bigger Size!', onCrop, 'Crop Not Correct', 'Ok');

    var x1 = Math.round(rx * finalSelection.x);
    var y1 = Math.round(ry * finalSelection.y);

    var w = canvas.width;
    var h = canvas.height;

    var ctx = canvas.getContext('2d');
    ctx.drawImage(crop_img, x1, y1, w, h, 0, 0, w, h);
    $('#waterImage').attr('src', canvas.toDataURL());
    origImg.src = canvas.toDataURL();
	origImg.onload=function(){
		reApplyatterMark();
	}

}

function onCropSkip() {
    $('#waterImage').attr('src', document.getElementById('smallImage').src);
    origImg.src = document.getElementById('waterImage').src;
	origImg.onload=function(){
		reApplyatterMark();
	}
}
//For Water Mark
function applyWatermark() {

    navigator.notification.activityStart("Please Wait", "Water Marking.....");
    gcanvas = document.createElement('canvas');
    if (!gcanvas) {
        alert('Error: I cannot create a new canvas element!');
        return;
    }
    gctx = gcanvas.getContext("2d");

    if (origImg.width > 1024 && origImg.height > 768) {
        gcanvas.width = 1024;
        gcanvas.height = 768;
    }
    gctx.drawImage(origImg, 0, 0, origImg.width, origImg.height, 0, 0, 1024, 768);
    x = (gcanvas.width - 20) - (watermark.width);
    y = (gcanvas.height - 20) - (watermark.height);
    gctx.drawImage(watermark, x, y);
    $('#waterImage').attr('src', gcanvas.toDataURL());
    onStopNotification();
	saveImage();
}

function reApplyatterMark() {
    applyWatermark();
}