var canvas;
var gcanvas;
var boundX, BoundY;
var jcrop_api;
var finalSelection;
var crop_img;
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
var warehouseListArray = new Array();
var cropImageW,cropImageH;
var scrollHeight;
var canX=0,canY=0,canX1=0,canY1=0;
var actArray;
var aNo=-1;
var editCtx;
var bValue=50,cValue=50;
var flag=0;

function onLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
    document.addEventListener("backbutton", onBackButton, false);
}

function onDeviceReady() {
	renderWarehouseDropdown();
    db = window.openDatabase("vis_inspection", "1.0", "vis_inspection", 100000);
    db.transaction(settingDbSetup, errorCB, loadSetting);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, setRootDirectory, function (error) {
        console.log("request FSError = " + error);
    });
}

function onOrgChange(){
	$("#txt_warehouse").empty();
	var e = document.getElementById("txt_organizer");
	var wareHouseDrop = document.getElementById("txt_warehouse");
	var org_id = e.options[e.selectedIndex].value;
	if(org_id == 0){
		for(var i=0; i < warehouseListArray.length ; i++)
		{
			var option = document.createElement('option');
			option.text = warehouseListArray[i][2];
			option.value = warehouseListArray[i][1];
			if (option.value == vis_whouse_id)
				option.selected = true;
			wareHouseDrop.add(option);
		}
	}
	else{
		for(var i=0; i < warehouseListArray.length ; i++)
		{
			if(warehouseListArray[i][0] == org_id)
			{
				var option = document.createElement('option');
				option.text = warehouseListArray[i][2];
				option.value = warehouseListArray[i][1];
				if (option.value == vis_whouse_id)
					option.selected = true;
				wareHouseDrop.add(option);
			}
		}
	}
}

function renderWarehouseDropdown(){
	warehouseListArray[0]=new Array();
	warehouseListArray[0][0]="1000000";
	warehouseListArray[0][1]="1000001";
	warehouseListArray[0][2]="Velocity Asia Warehouse";
	warehouseListArray[1]=new Array();
	warehouseListArray[1][0]="1000000";
	warehouseListArray[1][1]="1000000";
	warehouseListArray[1][2]="Standard";
	warehouseListArray[2]=new Array();
	warehouseListArray[2][0]="1000001";
	warehouseListArray[2][1]="1000031";
	warehouseListArray[2][2]="Singapore GT in Austin";
	warehouseListArray[3]=new Array();
	warehouseListArray[3][0]="1000001";
	warehouseListArray[3][1]="1000032";
	warehouseListArray[3][2]="Singapore GT in Singapore";
	warehouseListArray[4]=new Array();
	warehouseListArray[4][0]="1000001";
	warehouseListArray[4][1]="1000005";
	warehouseListArray[4][2]="Singapore Stock in Vienna";
	warehouseListArray[5]=new Array();
	warehouseListArray[5][0]="1000001";
	warehouseListArray[5][1]="1000006";
	warehouseListArray[5][2]="Singapore Stock in Singapore";
	warehouseListArray[6]=new Array();
	warehouseListArray[6][0]="1000001";
	warehouseListArray[6][1]="1000007";
	warehouseListArray[6][2]="Singapore PreSold in Singapore";
	warehouseListArray[7]=new Array();
	warehouseListArray[7][0]="1000001";
	warehouseListArray[7][1]="1000008";
	warehouseListArray[7][2]="Singapore Stock in Austin";
	warehouseListArray[8]=new Array();
	warehouseListArray[8][0]="1000001";
	warehouseListArray[8][1]="1000009";
	warehouseListArray[8][2]="Singapore PreSold in Austin";
	warehouseListArray[9]=new Array();
	warehouseListArray[9][0]="1000001";
	warehouseListArray[9][1]="1000010";
	warehouseListArray[9][2]="Singapore PreSold in Vienna";
	warehouseListArray[10]=new Array();
	warehouseListArray[10][0]="1000001";
	warehouseListArray[10][1]="1000025";
	warehouseListArray[10][2]="Singapore Stock";
	warehouseListArray[11]=new Array();
	warehouseListArray[11][0]="1000001";
	warehouseListArray[11][1]="1000026";
	warehouseListArray[11][2]="Singapore Presold";
	warehouseListArray[12]=new Array();
	warehouseListArray[12][0]="1000001";
	warehouseListArray[12][1]="1000045";
	warehouseListArray[12][2]="Singapore PreSold in Amsterdam";
	warehouseListArray[13]=new Array();
	warehouseListArray[13][0]="1000001";
	warehouseListArray[13][1]="1000046";
	warehouseListArray[13][2]="Singapore Stock in Amsterdam";
	warehouseListArray[14]=new Array();
	warehouseListArray[14][0]="1000003";
	warehouseListArray[14][1]="1000029";
	warehouseListArray[14][2]="Austin GT in Austin";
	warehouseListArray[15]=new Array();
	warehouseListArray[15][0]="1000003";
	warehouseListArray[15][1]="1000030";
	warehouseListArray[15][2]="Austin GT in Singapore";
	warehouseListArray[16]=new Array();
	warehouseListArray[16][0]="1000003";
	warehouseListArray[16][1]="1000002";
	warehouseListArray[16][2]="Austin Stock in Singapore";
	warehouseListArray[17]=new Array();
	warehouseListArray[17][0]="1000003";
	warehouseListArray[17][1]="1000003";
	warehouseListArray[17][2]="Austin Stock in Austin";
	warehouseListArray[18]=new Array();
	warehouseListArray[18][0]="1000003";
	warehouseListArray[18][1]="1000004";
	warehouseListArray[18][2]="Austin Stock in Vienna";
	warehouseListArray[19]=new Array();
	warehouseListArray[19][0]="1000003";
	warehouseListArray[19][1]="1000011";
	warehouseListArray[19][2]="Austin PreSold in Austin";
	warehouseListArray[20]=new Array();
	warehouseListArray[20][0]="1000003";
	warehouseListArray[20][1]="1000012";
	warehouseListArray[20][2]="Austin QS in Austin";
	warehouseListArray[21]=new Array();
	warehouseListArray[21][0]="1000003";
	warehouseListArray[21][1]="1000013";
	warehouseListArray[21][2]="Austin PreSold in Singapore";
	warehouseListArray[22]=new Array();
	warehouseListArray[22][0]="1000003";
	warehouseListArray[22][1]="1000014";
	warehouseListArray[22][2]="Austin QS in Singapore";
	warehouseListArray[23]=new Array();
	warehouseListArray[23][0]="1000003";
	warehouseListArray[23][1]="1000015";
	warehouseListArray[23][2]="Austin PreSold in Vienna";
	warehouseListArray[24]=new Array();
	warehouseListArray[24][0]="1000003";
	warehouseListArray[24][1]="1000016";
	warehouseListArray[24][2]="Austin QS in Vienna";
	warehouseListArray[25]=new Array();
	warehouseListArray[25][0]="1000003";
	warehouseListArray[25][1]="1000023";
	warehouseListArray[25][2]="Austin Stock";
	warehouseListArray[26]=new Array();
	warehouseListArray[26][0]="1000003";
	warehouseListArray[26][1]="1000024";
	warehouseListArray[26][2]="Austin Presold";
	warehouseListArray[27]=new Array();
	warehouseListArray[27][0]="1000003";
	warehouseListArray[27][1]="1000043";
	warehouseListArray[27][2]="Austin PreSold in Amsterdam";
	warehouseListArray[28]=new Array();
	warehouseListArray[28][0]="1000003";
	warehouseListArray[28][1]="1000044";
	warehouseListArray[28][2]="Austin Stock in Amsterdam";
	warehouseListArray[29]=new Array();
	warehouseListArray[29][0]="1000007";
	warehouseListArray[29][1]="1000017";
	warehouseListArray[29][2]="Vienna Stock in Vienna";
	warehouseListArray[30]=new Array();
	warehouseListArray[30][0]="1000007";
	warehouseListArray[30][1]="1000018";
	warehouseListArray[30][2]="Vienna PreSold in Vienna";
	warehouseListArray[31]=new Array();
	warehouseListArray[31][0]="1000007";
	warehouseListArray[31][1]="1000019";
	warehouseListArray[31][2]="Vienna Stock in Singapore";
	warehouseListArray[32]=new Array();
	warehouseListArray[32][0]="1000007";
	warehouseListArray[32][1]="1000020";
	warehouseListArray[32][2]="Vienna PreSold in Singapore";
	warehouseListArray[33]=new Array();
	warehouseListArray[33][0]="1000007";
	warehouseListArray[33][1]="1000021";
	warehouseListArray[33][2]="Vienna Stock in Austin";
	warehouseListArray[34]=new Array();
	warehouseListArray[34][0]="1000007";
	warehouseListArray[34][1]="1000022";
	warehouseListArray[34][2]="Vienna Presold in Austin";
	warehouseListArray[35]=new Array();
	warehouseListArray[35][0]="1000007";
	warehouseListArray[35][1]="1000027";
	warehouseListArray[35][2]="Vienna Stock";
	warehouseListArray[36]=new Array();
	warehouseListArray[36][0]="1000007";
	warehouseListArray[36][1]="1000028";
	warehouseListArray[36][2]="Vienna Presold";
	warehouseListArray[37]=new Array();
	warehouseListArray[37][0]="1000019";
	warehouseListArray[37][1]="1000037";
	warehouseListArray[37][2]="Amsterdam PreSold in Amsterdam";
	warehouseListArray[38]=new Array();
	warehouseListArray[38][0]="1000019";
	warehouseListArray[38][1]="1000038";
	warehouseListArray[38][2]="Amsterdam PreSold in Austin";
	warehouseListArray[39]=new Array();
	warehouseListArray[39][0]="1000019";
	warehouseListArray[39][1]="1000039";
	warehouseListArray[39][2]="Amsterdam PreSold in Singapore";
	warehouseListArray[40]=new Array();
	warehouseListArray[40][0]="1000019";
	warehouseListArray[40][1]="1000040";
	warehouseListArray[40][2]="Amsterdam Stock in Amsterdam";
	warehouseListArray[41]=new Array();
	warehouseListArray[41][0]="1000019";
	warehouseListArray[41][1]="1000041";
	warehouseListArray[41][2]="Amsterdam Stock in Austin";
	warehouseListArray[42]=new Array();
	warehouseListArray[42][0]="1000019";
	warehouseListArray[42][1]="1000042";
	warehouseListArray[42][2]="Amsterdam Stock in Singapore";
	warehouseListArray[43]=new Array();
	warehouseListArray[43][0]="11";
	warehouseListArray[43][1]="103";
	warehouseListArray[43][2]="HQ Warehouse";
	warehouseListArray[44]=new Array();
	warehouseListArray[44][0]="12";
	warehouseListArray[44][1]="104";
	warehouseListArray[44][2]="Store Warehouse";
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
		mrLinesArray = new Array();
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
		}, function (error) { console.log("Error on Delete = " + error.code); });
    }, function (error) { console.log(" FSError = " + error.code); });
}

function confirmGallaryDiscard() {
    navigator.notification.confirm('Are you sure ???', DiscardGallary, 'Delete selected files..', ['Ok','Cancel']);
}

function varifyAllDelete(){
	if(deleteCount==0){
		gallaryTable="";
		backtogallary();
		document.getElementById("disp-selGal").innerHTML = "";
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
				}, function (error) {console.log(" FSError = " + error.code); onStopNotification(); });
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
    navigator.notification.confirm('Are you sure ???', confirmDiscardInspections, 'Discard All Inspections...', ['Ok','Cancel']);
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
	document.getElementById("txt_imgQua").value = vis_img_qulty;
	var e = document.getElementById("txt_role");
	for(var i=0 ; i < e.options.length ; i++){
		if(e.options[i].value==vis_role)
			e.options[i].selected = true;
	}
	M_InOutLine_ID=e.options[e.selectedIndex].value;
	
	e = document.getElementById("txt_organizer");
	for(var i=0 ; i < e.options.length ; i++){
		if(e.options[i].value==vis_org_id)
			e.options[i].selected = true;
	}
	e.setAttribute("onchange", "onOrgChange()");
	onOrgChange();
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
	vis_img_qulty = document.getElementById("txt_imgQua").value;
	
    if (vis_url == "" && vis_lang == "" && vis_client_id == "" && vis_role == "" && vis_whouse_id == "" && vis_org_id == "" && vis_img_qulty == "") {
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
	document.getElementsByName("user_lbl")[6].innerHTML="User : "+userName;
}

function onPhotoDataSuccess(imageData) {
    navigator.notification.activityStart("Please Wait", "loading.....");
    onCropCall("data:image/jpeg;base64," + imageData);
}

function captureI() {
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
		quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
		encodingType: Camera.EncodingType.JPEG
    });
}

function onFail(message) {
    //alert('Failed because: ' + message);
	navigator.notification.alert('Failure!!',function(){},message,'Ok');
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
            ['Cancel','OK']);
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
	}else if(currentPage=='editView'){
		onBackToCropView();
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
	e = selMrLine = null ;
}

function renderInspectionFromCache(){
	document.getElementById("disp-Insp").innerHTML="";
	for(var j=0; j<3; j++)
	{
		var tr = document.createElement('tr');
		tr.setAttribute("style", "margin:0px; padding:0px;");
		for(var i=0; i < Math.ceil(inspLinesArray.length/3); i++)
		{
			var td = document.createElement('td');
			td.setAttribute("id","InsTd-"+j+"-"+i);
			td.setAttribute("style", "margin:1px; padding:1px;");
			tr.appendChild(td);
		}
		document.getElementById("disp-Insp").appendChild(tr);
	}
	Disp_col=0;Disp_row=0;
	for(var i=0 ; i < inspLinesArray.length ; i++){
		var dval = inspLinesArray[i][1];
		var dlab = inspLinesArray[i][0];
		getUploadCounts(M_InOutLine_ID,dlab,dval,FillInspectionDiv);
		dval = dlab = null ;
	}
	
	onStopNotification();
	if(inspLinesArray.length >= 10 )
		navigator.notification.alert('Swipe to see more buttons..', null, 'Message !!', 'Ok');
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

function onImagePicker(){
	navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
		quality: 100,
		sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
        destinationType: Camera.DestinationType.DATA_URL,
		encodingType: Camera.EncodingType.JPEG
    });
}

function onCropCall(results){
	actArray = "";
	var tmpImg = new Image();
	tmpImg.onload = function() {
		var randerHeight = window.innerHeight * 0.70 ;
		if(this.height < this.width && !((this.height/this.width) > .70)){
			cropImageW = (randerHeight * 4)/3;
			cropImageH = (cropImageW/this.width) * this.height ;
		}else{
			cropImageH = randerHeight;
			cropImageW = (cropImageH/this.height) * this.width ;
		}
		onCrop(results);
		tmpImg = null;
	}
	tmpImg.src = results;
}

function onCrop(results) {
    loadPage('cropView');
    $('#cropImage').html(['<img src="', results , '" width="'+cropImageW+'" height="'+cropImageH+'" />'].join(''));
    crop_img = $('#cropImage img')[0];
	var xsize, ysize, totH;
	if(crop_img.width*3/4 > crop_img.height){
		ysize = crop_img.height;
		xsize = crop_img.height*4/3; 
	}else{
		xsize = crop_img.width;
		ysize = crop_img.width*3/4;
	}
	scrollHeight = ysize;
    $('#cropImage img').Jcrop({
        bgColor: 'black',
        bgOpacity: .3,
		onSelect: cropAreaChanged,
        onChange: cropAreaChanged,
        aspectRatio: 4 / 3,
		allowResize: false,
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
        {	
			finalSelection = selection;
		}
    }
	document.getElementById("slider-vertical").setAttribute("style","height:"+(cropImageH-50)+"px;margin:35% 0px 25% 0px;");
	$('#slider-vertical').slider({
		orientation: "vertical",
		min: 5,
		max: ysize,
		value:ysize,
		change:function( event, ui ) {
				selectCropArea(ui.value);
			},
		slide:function( event, ui ) {
				clearInterval(myVar);
				selectCropArea(ui.value);
			}
	});
}

function selectCropArea(scrollValue)
{
	var totSelW = (scrollValue*4)/3 + finalSelection.x;
	var totSelH = scrollValue + finalSelection.y;
	var xPos, yPos;
	if(totSelH > crop_img.height && scrollValue > finalSelection.h)
	{
		yPos = Math.ceil(finalSelection.y - (scrollValue - finalSelection.h));
	}
	else
	{ 
		yPos = finalSelection.y;
	}
	if(totSelW > crop_img.width && (scrollValue*4)/3 > finalSelection.w)
	{
		xPos = Math.ceil(finalSelection.x - ((scrollValue*4)/3 - finalSelection.w));
	}
	else
	{
		xPos = finalSelection.x;
	}
	jcrop_api.setSelect([parseInt(xPos),parseInt(yPos),parseInt((scrollValue*4)/3)+xPos,parseInt(scrollValue)+yPos]);
	totSelW = totSelH = xPos = yPos = null ;
}
var myVar = 0;
function onSliderChange(cValue)
{	
	myVar = setInterval(function (){
		value = $("#slider-vertical").slider("option", "value" ) + cValue;
		$("#slider-vertical").slider("option", "value", value );
		}, 100);
}

function stopSliderChange()
{
	clearInterval(myVar);
}

function onCropSaved()
{
	CropSaved(applyWatermark);
}
function CropSaved(callBack) {
	
	var origImg = new Image();
	var xsize, ysize;
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
	var x1 = Math.round(rx * finalSelection.x);
	var y1 = Math.round(ry * finalSelection.y);
	var w = canvas.width;
	var h = canvas.height;

	var ctx = canvas.getContext('2d');
	ctx.drawImage(crop_img, x1, y1, w, h, 0, 0, w, h);
	origImg.src = canvas.toDataURL();
	origImg.onload=function(){
		var randerHeight = window.innerHeight * 0.70 ;
		if(this.height < this.width && !((this.height/this.width) > .70)){
			cropImageW = (randerHeight * 4)/3;
			cropImageH = (cropImageW/this.width) * this.height ;
		}else{
			cropImageH = randerHeight;
			cropImageW = (cropImageH/this.height) * this.width ;
		}
		callBack(origImg);
		xsize = ysize = tempImage = rx = ry = null ;
	}
}

function onCropSkip() {
	var origImg = new Image();
	origImg.src = crop_img.src ;
	origImg.onload=function(){
		applyWatermark(origImg);
	}
}
//For Water Mark
function applyWatermark(origImg) {
	var gctx;
	var watermark = new Image();
    watermark.src = "img/Velocity_Watermark.png";
	watermark.onload=function(){
		gcanvas = document.createElement('canvas');
		if (!gcanvas) {
			alert('Error: I cannot create a new canvas element!');
			return;
		}
		gctx = gcanvas.getContext("2d");
		gcanvas.width = 1024;
		gcanvas.height = 768;
		gctx.drawImage(origImg, 0, 0, origImg.width, origImg.height, 0, 0, 1024, 768);
		x = (gcanvas.width - 20) - (watermark.width);
		y = (gcanvas.height - 20) - (watermark.height);
		gctx.drawImage(watermark, x, y);
		var encoder = new JPEGEncoder();
		var img64 = encoder.encode(gctx.getImageData(0,0,1024,768), parseInt(vis_img_qulty)).replace(/data:image\/jpeg;base64,/,'');
		var imageURI=Base64Binary.decodeArrayBuffer(img64);
		onStopNotification();
		saveImage(imageURI);
		watermark = encoder = img64 = null;
	}
    navigator.notification.activityStart("Please Wait", "Water Marking.....");
}

function onCropImageEdit()
{
	CropSaved(onImageEdit);
}

function callImageEdit()
{
	onImageEdit(crop_img);
}

function onImageEdit(origImg)
{
	edit_image = new Image();
	edit_image.src = origImg.src;
	edit_image.onload=function(){
		this.height = cropImageH;
		this.width = cropImageW;
		ImageEdit();
		navigator.notification.activityStop();
	}
}
var edit_image;

function ImageEdit()
{
	canX=0,canY=0,canX1=0,canY1=0;
	aNo=-1;
	bValue=50,cValue=50;
	loadPage('editView');
	actArray = new Array();
	gcanvas = document.getElementById('editCanvas');
	editCtx = gcanvas.getContext("2d");
	gcanvas.height = edit_image.height;
	gcanvas.width = edit_image.width;
	editCtx.drawImage(edit_image,0,0,edit_image.width,edit_image.height);
	gcanvas.addEventListener("touchmove", touchMove, true);
	gcanvas.addEventListener("touchstart", touchDown, false);
	gcanvas.addEventListener("touchend", touchEnd, false);
	var tmpEditData = "" ;
	
	document.getElementById("slider-brightness").setAttribute("style","height:"+(edit_image.height-50)+"px; margin:15px 0px 10px 0px;");
	$('#slider-brightness').slider({
		orientation: "vertical",
		min: 0,
		max: 100,
		value:50,
		slide:function( event, ui ) {
				var editImageData = editCtx.getImageData(0,0,gcanvas.width,gcanvas.height);
				onBrightnessChange(ui.value-bValue,editImageData);
				bValue = ui.value;
			},
		change:function( event, ui ) {
				var editImageData = editCtx.getImageData(0,0,gcanvas.width,gcanvas.height);
				onBrightnessChange(ui.value-bValue,editImageData);
				bValue = ui.value;
				if(flag == 0)
				{
					if( aNo > -1 ? (actArray[aNo][0] != bValue || actArray[aNo][1] != cValue) : true)
					{
						actArray[++aNo] = new Array();
						actArray[aNo][0]=bValue;
						actArray[aNo][1]=cValue;
						actArray[aNo][2]=canX+"*"+canY+"*"+(canX1-canX)+"*"+(canY1-canY);
					}
				}
			},
		start: function( event, ui ) {
		}
	});
	
	document.getElementById("slider-contrass").setAttribute("style","height:"+(edit_image.height-50)+"px;margin:15px 0px 10px 0px;");
	$('#slider-contrass').slider({
		orientation: "vertical",
		min: 0,
		max: 100,
		value:50,
		slide:function( event, ui ) {
				var editImageData = editCtx.getImageData(0,0,gcanvas.width,gcanvas.height);
				onContrassChange(ui.value-cValue,editImageData);
				cValue = ui.value;
			},
		change:function( event, ui ) {
				var editImageData = editCtx.getImageData(0,0,gcanvas.width,gcanvas.height);
				onContrassChange(ui.value-cValue,editImageData);
				cValue = ui.value;
				if(flag == 0)
				{
					if( aNo > -1 ? (actArray[aNo][0] != bValue || actArray[aNo][1] != cValue) : true)
					{
						actArray[++aNo] = new Array();
						actArray[aNo][0]=bValue;
						actArray[aNo][1]=cValue;
						actArray[aNo][2]=canX+"*"+canY+"*"+(canX1-canX)+"*"+(canY1-canY);
					}
				}
			},
		start: function( event, ui ) {
			
		}
	});
	
	function touchDown(e) 
	{
		if (!e)
			var e = event;
		e.preventDefault();
		
		
		canX = e.targetTouches[0].pageX - gcanvas.offsetLeft;
		canY = e.targetTouches[0].pageY - gcanvas.offsetTop;
		tmpEditData = editCtx.getImageData(0,0,gcanvas.width,gcanvas.height);
	}
	function touchMove(e) 
	{
		if (!e)
			var e = event;
		e.preventDefault();
		canX1 = e.targetTouches[0].pageX - gcanvas.offsetLeft;
		canY1 = e.targetTouches[0].pageY - gcanvas.offsetTop;
		editCtx.clearRect(0,0,edit_image.width,edit_image.hight);
		editCtx.putImageData(tmpEditData,0,0);
		drowRect(canX,canY,canX1-canX,canY1-canY);
	}
	function touchEnd(e) 
	{
		actArray[++aNo] = new Array();
		actArray[aNo][0]=bValue;
		actArray[aNo][1]=cValue;
		actArray[aNo][2]=canX+"*"+canY+"*"+(canX1-canX)+"*"+(canY1-canY);
	}
	
}

function drowRect(x,y,w,h)
{
	editCtx.beginPath();
	editCtx.fillStyle="#ffffff";
	editCtx.fillRect(x,y,w,h);
	editCtx.closePath();
	editCtx.stroke();
}

function onBackToCropView()
{
	onCropCall(crop_img.src);
}
	
function saveEditImage()
{
	var origImg = new Image();
	origImg.src = gcanvas.toDataURL();
	origImg.onload=function(){
		applyWatermark(origImg);
	}
}

function onUndoEdit()
{
	if(actArray.length >= 1)
	{
		actArray.pop();
		--aNo;
		editCtx.clearRect(0,0,cropImageW,cropImageH);
		editCtx.drawImage(edit_image,0,0,cropImageW,cropImageH);
		var b=50,c=50;
		for(var j=0;j<actArray.length;j++)
		{
			var valueArray = actArray[j];
			b = valueArray[0];
			c = valueArray[1]
			var rectArray = valueArray[2].split('*');
			drowRect(rectArray[0],rectArray[1],rectArray[2],rectArray[3]);
		}
		bValue = 50;
		cValue = 50;
		flag = 1;
		$("#slider-brightness").slider("option", "value", b );
		$("#slider-contrass").slider("option", "value", c );
		flag = 0;
	}
	if(actArray.length == 0)
	{
		canX=0,canY=0,canX1=0,canY1=0;
	}
}

function onContrassChange(contraValue,contraImageData)
{	
	var data = contraImageData.data;
	var factor = (259 * (contraValue + 255)) / (255 * (259 - contraValue));
	for(var i=0;i<data.length;i+=4)
	{
		data[i] = factor * (data[i] - 128) + 128;
		data[i+1] = factor * (data[i+1] - 128) + 128;
		data[i+2] = factor * (data[i+2] - 128) + 128;
	}
	editCtx.putImageData(contraImageData,0,0);
	return contraImageData;
}

function onBrightnessChange(brightValue, brightImageData)
{
	var pixels = brightImageData.data;
	for(var i = 0; i < pixels.length; i+=4)
	{
		pixels[i] += brightValue;
		pixels[i+1] += brightValue;
		pixels[i+2] += brightValue;
	}
	editCtx.putImageData(brightImageData,0,0);
	return brightImageData;
}