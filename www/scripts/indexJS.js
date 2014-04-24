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
var vis_user;
var vis_pass;
var Disp_row;
var Disp_col;
var SelectedGallaryList;
var attachCount;
var itemCount;
var imgUploadCount = 0;
var mrLinesArray = new Array();
var backPage;

function onLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
    document.addEventListener("backbutton", onBackButton, false);
    watermark = new Image();
    origImg = new Image();
    watermark.src = "img/Velocity_Watermark.png";
}

function onDeviceReady() {
    db = window.openDatabase("vis_inspection", "1.0", "vis_inspection", 100000);
    db.transaction(settingDbSetup, errorCB, loadSetting);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, setRootDirectory, function (error) {
        console.log("request FSError = " + error);
    });
    window.setTimeout(function () {
        loadPage("login");
        document.getElementById("txt_user").value = userName;
    }, 100);
}

function onExit() {
    loadPage("exit");
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
	console.log("cnt"+imgUploadCount);
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
                navigator.notification.activityStop();
            }
        }
    }
}

function AttachAllImage() {
    navigator.notification.activityStart("Please Wait", "Attaching Files");
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="' + M_InOutLine_ID + '" and imgUpload="T" and imgAttach="F"', [], AllAttachSelect, function (err) {
            console.log("Error SQL: " + err.code);
        });
    }, errorCB);

    function AllAttachSelect(tx, result) {
        if (result.rows.length > 0) {
            attachCount = result.rows.length;
            for (var i = 0; i < result.rows.length; i++) {
                callAttachImageWs(result.rows.item(i).insp_line, result.rows.item(i).file);
            }
        } else {
            navigator.notification.activityStop();
        }
    }
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
			}
        }
        onBackToStartInspection();
        navigator.notification.activityStop();
        navigator.notification.alert('All Files attached', function () {}, 'Success', 'OK');
}

function onRemoveVISDirFile(tmpfile,InspNumber){
	root.getFile(tmpfile, null, function (file) {
		file.remove(function (entry) {
			db.transaction(function (tx) {
				tx.executeSql('DELETE FROM vis_gallery WHERE file="' + tmpfile + '" and insp_line="' + InspNumber + '"');
			}, errorCB);
		}, function (error) { console.log("Error on read = " + error.code); });
    }, function (error) { console.log(" FSError = " + error.code); });
}

function confirmGallaryDiscard() {
    navigator.notification.confirm('Are you sure ???', DiscardGallary, 'Delete selected files..', 'Ok,Cancel');
}

function deleteSelectedGallary() {
	console.log("Array="+SelectedGallaryList.toString());
    for (var j = 0; j < imagelistarray.rows.length; j++) {
        if (DataTypes.indexOf(getExtention(getFileName(imagelistarray.rows.item(j).file)).toUpperCase()) < 0) {
            var tmpfile = imagelistarray.rows.item(j).file;
            if (SelectedGallaryList.indexOf(getFileName(tmpfile)) >= 0) {
				console.log("yes");
                db.transaction(function (tx) {
                    tx.executeSql('DELETE FROM vis_gallery WHERE file="' + tmpfile + '" and insp_line="' + X_INSTRUCTIONLINE_ID + '"');
                }, errorCB);
            }
        } else {
            if (SelectedGallaryList.indexOf(imagelistarray.rows.item(j).name) >= 0) {

                var tmpfile = imagelistarray.rows.item(j).file;
                root.getFile(tmpfile, null, function (Img) {
                    Img.remove(function (entry) {
                        db.transaction(function (tx) {
							console.log("yes");
                            tx.executeSql('DELETE FROM vis_gallery WHERE file="' + tmpfile + '" and insp_line="' + X_INSTRUCTIONLINE_ID + '"');
                        }, errorCB);
                    }, function (error) {
                        console.log("Error on read = " + error.code);
                    });
                }, function (error) {
                    console.log(" FSError = " + error.code);
                });
            }
        }
    }
    backtogallary();
}

function fillGallaryForDelete() {
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
            imgelem.style.width = (window.innerWidth * .30) + "px";
            imgelem.style.height = (window.innerHeight * .25) + "px";
            imgelem.setAttribute("height", "25%");
            imgelem.setAttribute("width", "30%");
            imgelem.innerHTML = getFileName(tmpFile);

            var chkImg = document.createElement("img");
            chkImg.setAttribute("style", "left:-50; margin-left:-50;position:absolute;display:none;");
            chkImg.setAttribute("src", "img/checkbox_full.png");
            if (Disp_col >= Math.ceil(imagelistarray.rows.length / 3)) {
                Disp_col = 0;
                Disp_row = Disp_row + 1;
            }
            var clickstr = "onDeleteFileSelect('Seltd-" + Disp_row + "-" + Disp_col + "','" + getFileName(tmpFile) + "')";
            chkImg.setAttribute("id", "chkSeltd-" + Disp_row + "-" + Disp_col);
            document.getElementById("Seltd-" + Disp_row + "-" + Disp_col).appendChild(chkImg);
            document.getElementById("Seltd-" + Disp_row + "-" + Disp_col).appendChild(imgelem);
            document.getElementById("Seltd-" + Disp_row + "-" + Disp_col).setAttribute('onclick', clickstr);
            Disp_col = Disp_col + 1;
        } else {
            root.getFile(imagelistarray.rows.item(j).file, null, function (FnEntries) {
					onReadFileDataUrl(FnEntries,fillToDeleteSelectionImage);
			}, function (error) {console.log(" FSError = " + error.code);});
			
            function fillToDeleteSelectionImage(evt,rfile) {
                    var imgelem = document.createElement("img");
                    imgelem.setAttribute("height", (window.innerHeight * .25) + "px");
                    imgelem.setAttribute("width", (window.innerWidth * .30) + "px");
                    imgelem.setAttribute("style", "margin:3px 5px; float:left;");
                    imgelem.setAttribute("src", evt.target.result);
                    var chkImg = document.createElement("img");
                    chkImg.setAttribute("style", "left:-50; margin-left:-50;position:absolute;display:none;");
                    chkImg.setAttribute("src", "img/checkbox_full.png");

                    if (Disp_col >= Math.ceil(imagelistarray.rows.length / 3)) {
                        Disp_col = 0;
                        Disp_row = Disp_row + 1;
                    }
                    var clickstr = "onDeleteFileSelect('Seltd-" + Disp_row + "-" + Disp_col + "','" + rfile.name + "')";
                    chkImg.setAttribute("id", "chkSeltd-" + Disp_row + "-" + Disp_col);
                    document.getElementById("Seltd-" + Disp_row + "-" + Disp_col).appendChild(chkImg);
                    document.getElementById("Seltd-" + Disp_row + "-" + Disp_col).appendChild(imgelem);
                    document.getElementById("Seltd-" + Disp_row + "-" + Disp_col).setAttribute('onclick', clickstr);
                    Disp_col = Disp_col + 1;
            }
        }
    }
    navigator.notification.activityStop();
    loadPage('SelectGallary');
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
    navigator.notification.activityStart("Please Wait", "loading.....");
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="' + M_InOutLine_ID + '" and insp_line="' + X_INSTRUCTIONLINE_ID + '"', [], function (tx, results) {
            imagelistarray = results;
			fillGallaryPhotos();
        }, function (err) {
            console.log("Error SQL: " + err.code);
        });
    }, errorCB);
    document.getElementById("imglist").style.height = (window.innerHeight * .70) + "px";
    document.getElementById("imglist").setAttribute("style", "overflow-x: auto; overflow-y: hidden;");
}

function fillGallaryPhotos() {
    for (var j = 0; j < 3; j++) {
        var tr = document.createElement('tr');
        tr.setAttribute("style", "margin:0px; padding:0px;");
        for (var i = 0; i < Math.ceil(imagelistarray.rows.length / 3); i++) {
            var td = document.createElement('td');
            td.setAttribute("id", "td-" + j + "-" + i);
            td.setAttribute("style", "margin:0px; padding:0px;");
            tr.appendChild(td);
        }
        document.getElementById("disp-tab1").appendChild(tr);
    }
    Disp_col = 0;
    Disp_row = 0;
    itemCount = 0;
    for (var j = 0; j < imagelistarray.rows.length; j++) {
        if (DataTypes.indexOf(getExtention(imagelistarray.rows.item(j).name).toUpperCase()) < 0) {

            var tmpFile = imagelistarray.rows.item(j).file;
            var imgelem = document.createElement("div");
            imgelem.setAttribute("style", "margin:3px 5px; border:1px solid #000;float:left; word-wrap:break-word;");
            imgelem.style.width = (window.innerWidth * .30) + "px";
            imgelem.style.height = (window.innerHeight * .25) + "px";
            imgelem.setAttribute("height", "25%");
            imgelem.setAttribute("width", "30%");
            imgelem.innerHTML = getFileName(tmpFile);
            if (Disp_col >= Math.ceil(imagelistarray.rows.length / 3)) {
                Disp_col = 0;
                Disp_row = Disp_row + 1;
            }
            if (imagelistarray.rows.item(itemCount).imgUpload == 'T') {
                var chkImg = document.createElement("img");
                chkImg.setAttribute("style", "position:absolute;height:35px;width:35px;");
                chkImg.setAttribute("src", "img/up.png");
                document.getElementById("td-" + Disp_row + "-" + Disp_col).appendChild(chkImg);
            }
            document.getElementById("td-" + Disp_row + "-" + Disp_col).appendChild(imgelem);
            itemCount = itemCount + 1;
            Disp_col = Disp_col + 1;
        } else {
            root.getFile(imagelistarray.rows.item(j).file, null, function (FnEntries) {
					onReadFileDataUrl(FnEntries,fillToImage);
			}, function (error) {console.log(" FSError = " + error.code);});
			
            function fillToImage(evt,rfile) {
                    var imgelem = document.createElement("img");
                    imgelem.setAttribute("height", (window.innerHeight * .25) + "px");
                    imgelem.setAttribute("width", (window.innerWidth * .30) + "px");
                    imgelem.setAttribute("style", "margin:3px 5px; float:left;");
                    imgelem.setAttribute("src", evt.target.result);
                    if (Disp_col >= Math.ceil(imagelistarray.rows.length / 3)) {
                        Disp_col = 0;Disp_row = Disp_row + 1;
                    }
                    if (imagelistarray.rows.item(itemCount).imgUpload == 'T') {
                        var chkImg = document.createElement("img");
                        chkImg.setAttribute("style", "position:absolute;height:35px;width:35px;");
                        chkImg.setAttribute("src", "img/up.png");
                        document.getElementById("td-" + Disp_row + "-" + Disp_col).appendChild(chkImg);
                    }
                    document.getElementById("td-" + Disp_row + "-" + Disp_col).appendChild(imgelem);
                    itemCount = itemCount + 1;
                    Disp_col = Disp_col + 1;
            }
        }
    }
    navigator.notification.activityStop();
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
    document.getElementById("login_error").innerHTML = "";
}

function loadAccureChoise() {
    loadPage("AccureChoise");
}

function loadgallaryChoise() {
    loadPage("fileExpo");
    fileexplore();
    window.setTimeout(function () {
        fileexplore();
    }, 100);
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
    document.getElementById("txt_role").value = vis_role;
    document.getElementById("txt_warehouse").value = vis_whouse_id;
    document.getElementById("txt_organizer").value = vis_org_id;
}

function onSettingUpdate() {
    vis_url = document.getElementById("txt_url").value;
    vis_lang = document.getElementById("txt_lang").value;
    vis_client_id = document.getElementById("txt_client").value;
    vis_role = document.getElementById("txt_role").value;
    vis_whouse_id = document.getElementById("txt_warehouse").value;
    vis_org_id = document.getElementById("txt_organizer").value;
    if (vis_url == "" && vis_lang == "" && vis_client_id == "" && vis_role == "" && vis_whouse_id == "" && vis_org_id == "") {
        navigator.notification.alert('No Any Field Should Blank!', onSettingPage, 'Invalid Value', 'Ok');
        loadSetting();
    } else {
        db.transaction(updateSettings, errorCB);
        loadPage("login");
    }

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
    alert('Failed because: ' + message);
    loadPage('gallery');
}

function loadPage(id1) {
    if (id1 == 'exit') {
        navigator.app.exitApp();
    } else {
        document.getElementById("disp").innerHTML = document
            .getElementById(id1).innerHTML;
    }
}

function onBackButton() {
    document.removeEventListener("backbutton", onBackButton, false);
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
        fillInspectionsLines();
    }
}


function onInspSet(nid, iname) {
    loadPage('gallery');
    renderGallary();
    X_INSTRUCTIONLINE_ID = nid;
    X_instruction_name = iname;
    document.getElementById("gallery_head").innerHTML = M_line_name + "(" + X_instruction_name + ")";

}

function backtogallary() {
    loadPage('gallery');
    renderGallary();
    document.getElementById("gallery_head").innerHTML = M_line_name + "(" + X_instruction_name + ")";
}

function onCrop() {
    loadPage('cropView');

    $('#cropImage').html(['<img src="', document.getElementById('smallImage').src, '" width="80%" height="80%" />'].join(''));
    crop_img = $('#cropImage img')[0];

    $('#cropImage img').Jcrop({
        bgColor: 'black',
        bgOpacity: .3,
        onSelect: cropAreaChanged,
        onChange: cropAreaChanged,
        aspectRatio: 4 / 3,
        setSelect: [0, 0, 256, 192]
    }, function () {
        // Use the API to get the real image size
        var bounds = this.getBounds();
        boundx = bounds[0];
        boundy = bounds[1];
        // Store the API in the jcrop_api variable
        jcrop_api = this;
    });
    navigator.notification.activityStop();

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
    //loadPage("waterImgPrev");
    //Using timer to reApplyWaterMark
    window.setTimeout(function () {
        reApplyatterMark();
        saveImage();
    }, 50);

}

function onCropSkip() {
    $('#waterImage').attr('src', document.getElementById('smallImage').src);
    origImg.src = document.getElementById('waterImage').src;
    //loadPage("waterImgPrev");
    //Using timer to reApplyWaterMark
    window.setTimeout(function () {
        reApplyatterMark();
        saveImage();
    }, 50);
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
    navigator.notification.activityStop();
}

function reApplyatterMark() {
    applyWatermark();
}