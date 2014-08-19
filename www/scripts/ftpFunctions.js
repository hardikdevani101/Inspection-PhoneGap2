var vis_FtpUrl;
function onFtpExplorer() {
    loadPage("ftpExplorer");
    if (typeof vision_ftp !== 'undefined' && vision_ftp.length > 0 && vision_ftp != null) {
        onFTPSelect();
    }
    else {
        getFTPList();
    }
}

function onFTPSelect() {
    var select = document.getElementById("drop_ftp_name");
    select.innerHTML = "";
    for (var i = 0; i < vision_ftp.length; i++) {
        var option = document.createElement('option');
        option.text = vision_ftp[i][0];
        option.value = vision_ftp[i][2] + ":" + vision_ftp[i][3] + "@" + vision_ftp[i][1];
        if (vision_ftp_url == vision_ftp[i][2] + ":" + vision_ftp[i][3] + "@" + vision_ftp[i][1])
            option.selected = true;
        select.add(option);
    }
    select.setAttribute("onchange", "createVisionURL()");
    createVisionURL();
}

function createVisionURL() {
    var e = document.getElementById("drop_ftp_name");
    var selFTPUrl = e.options[e.selectedIndex].value;
    for (var i = 0; i < vision_ftp.length; i++) {
        if ((vision_ftp[i][2] + ":" + vision_ftp[i][3] + "@" + vision_ftp[i][1]) == selFTPUrl) {
            vision_ftp_url = vision_ftp[i][2] + ":" + vision_ftp[i][3] + "@" + vision_ftp[i][1];
            ftpExplorer();
            break;
        }
    }
}

function ftpExplorer(currentFtpDir) {
    if (typeof currentFtpDir === 'undefined') {
        parlistArray = [];
    }
    else if (currentFtpDir == '-') {
        parlistArray.pop();
    }
    else {
        parlistArray.push(currentFtpDir);
    }
    var tmpParList = parlistArray.toString().split(',');
    var urlPath = tmpParList.join('/');
    vis_FtpUrl = "ftp://" + vision_ftp_url + "/" + urlPath;
    vision.ftpclient.filelist(vis_FtpUrl, function (AllList) {
        var mainDiv = document.getElementById("ftpFileContent");
        mainDiv.innerHTML = "";
        var fileList = AllList[0]["fileNames"];
        var dirList = AllList[0]["directory"];

        for (var j = 0; j < dirList.length; j++) {
            var label1 = document.createElement("div");
            label1.class = "ftpDir";
            label1.style.lineHeight = "30px";
            var img = document.createElement('img');
            img.src = "img/folder.jpg";
            img.height = 25;
            img.width = 25;
            img.style.margin = "2px 0px";
            label1.appendChild(img);
            var description1 = document.createTextNode(dirList[j]);
            label1.appendChild(description1);
            var clkStr = "ftpExplorer('" + dirList[j] + "')";
            label1.setAttribute('onclick', clkStr);
            mainDiv.appendChild(label1);
        }
        for (var i = 0; i < fileList.length; i++) {
            var label2 = document.createElement("div");
            label2.class = "ftpFile";
            label2.style.lineHeight = "30px";
            var description2 = document.createTextNode(fileList[i]);
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = "slctFtpFile[]";
            checkbox.value = fileList[i];
            checkbox.className = "ftpchk";
            checkbox.setAttribute("style", "width:30px !important; height:30px !important;");
            checkbox.width = 50;
            checkbox.style.width = "50px";
            label2.appendChild(checkbox);
            label2.appendChild(description2);
            mainDiv.appendChild(label2);
        }
    }, ftpfail);
}

function ftpfail() {
    navigator.notification.alert('FTP Connection failed', function () {}, 'Failure', 'OK');
}

function onFinishFtpSelection() {
    var selectChkList = [];
    document.getElementsByName('slctFtpFile[]');
    $(".ftpchk:checked").each(function () {
        selectChkList.push($(this).val());
    });
    if (selectChkList.length == 0) {
        backToGallery();
    }
    else if (selectChkList.length == 1) {
        onSingleFTPFileSelect(selectChkList[0]);
    }
    else if (selectChkList.length > 1) {
        downloadFTPFile(selectChkList);
    }
}

function onSingleFTPFileSelect(FtpFileName) {
    vision.ftpclient.get(dirVISInspectionFTP.fullPath + "/" + FtpFileName, vis_FtpUrl + FtpFileName, function () {
        onFileExplorerClick(dirVISInspectionFTP.fullPath + "/" + FtpFileName);
    }, function () {
        console.log("File not downloaded from FTP");
    });
}

function downloadFTPFile(selectChkList) {
    navigator.notification.activityStart("Please Wait", "Uploading files...");
    var FtpFileName = selectChkList.shift();
    vision.ftpclient.get(dirVISInspectionFTP.fullPath + "/" + FtpFileName, vis_FtpUrl + FtpFileName, function () {
        root.getFile(dirVISInspectionFTP.fullPath.substring(1) + "/" + FtpFileName, null, function (entry) {
            var fileFullPath = getSDPath(entry.fullPath).substring(2);
            var fileName = getFileName(fileFullPath);
            if (DataTypes.indexOf(getExtention(getFileName(fileFullPath)).toUpperCase()) >= 0) {
                entry.file(function (rfile) {
                    var reader = new FileReader();
                    reader.onloadend = function (evt) {
                        var image_temp = new Image();
                        image_temp.src = evt.target.result;
                        image_temp.onload = function () {
                            var tmpCanvas = document.createElement('canvas');
                            tmpCanvas.height = image_temp.height;
                            tmpCanvas.width = image_temp.width;
                            var tmpCtx = tmpCanvas.getContext("2d");
                            tmpCtx.drawImage(image_temp, 0, 0, image_temp.width, image_temp.height);
                            var encoder = new JPEGEncoder();
                            var img64 = encoder.encode(tmpCtx.getImageData(0, 0, image_temp.width, image_temp.height), 100);
                            var imageURI = Base64Binary.decodeArrayBuffer(img64.replace(/data:image\/jpeg;base64,/, ''));
                            saveImage(imageURI);
                            if (selectChkList.length > 0) {
                                downloadFTPFile(selectChkList);
                            }
                        }
                    };
                    reader.readAsDataURL(rfile);
                }, function () {
                });
            }
            else {
                db.transaction(function (tx) {
                    var sqlQuery;
                    if (X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null)
                        sqlQuery = 'INSERT INTO vis_gallery(mr_line,in_out_id,name,file) VALUES ("' + M_InOutLine_ID + '","' + M_INOUT_ID + '","' + fileName + '","' + fileFullPath + '")';
                    else
                        sqlQuery = 'INSERT INTO vis_gallery(mr_line,insp_line,name,file) VALUES ("' + M_InOutLine_ID + '","' + X_INSTRUCTIONLINE_ID + '","' + fileName + '","' + fileFullPath + '")';
                    tx.executeSql(sqlQuery);
                }, errorCB, function () {
                    onAfterSaveFile(fileFullPath);
                    if (selectChkList.length > 0) {
                        downloadFTPFile(selectChkList);
                    }
                });
            }
        }, function (error) {
            console.log(" FSError = " + error.code);
        });
    }, function () {
        console.log("File not downloaded from FTP");
    });
}