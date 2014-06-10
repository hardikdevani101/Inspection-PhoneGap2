var root;
var dirVISInspection;
var currentDir;
var parlistArray;
var DataTypes=["JPEG","JPG","BMP","PNG"];

function setRootDirectory(fileSystem){
	root=fileSystem.root;
	root.getDirectory("VIS_Inspection", {create : true},setVISDirectory, dirFail);
}

function setVISDirectory(fileSystem){
	dirVISInspection=fileSystem;
}

function saveImage(imageURI){
	navigator.notification.activityStart("Please Wait", "Saving Image.....");
	var date = new Date;
	var sec = date.getSeconds();
	var mi = date.getMinutes();
	var hh = date.getHours();
	var yy = date.getFullYear();
	var mm = date.getMonth();
	var dd = date.getDate();
	var fileName="vis_inspection_"+mm+dd+yy+"_"+hh+mi+sec+".jpg";
	dirVISInspection.getFile(fileName, {create: true, exclusive: false}, function (fileEntry){
		CreateImgWriter(fileEntry,imageURI);
	},function(error){ console.log("File Create FSError = "+error.code); });
}

function CreateImgWriter(fileEntry,imageURI) { 
	var fileFullPath=getSDPath(fileEntry.fullPath).substring(1);
	fileEntry.createWriter(function (writer){
		OnImgWriter(writer,fileFullPath,fileEntry.name,imageURI);
	}, function(error){ console.log("file entry FSError = "+error.code); });
}
function OnImgWriter(writer,fileFullPath,fileName,imageURI){ 
	 writer.onwrite = function(evt) {
		 	db.transaction(function (tx){
				tx.executeSql('INSERT INTO vis_gallery(mr_line,insp_line,name,file) VALUES ("'+M_InOutLine_ID+'","'+X_INSTRUCTIONLINE_ID+'","'+fileName+'","'+fileFullPath+'")');
			}, errorCB);
			onAfterSaveFile(fileFullPath);
			onUploadFile(fileFullPath,X_INSTRUCTIONLINE_ID,callUploadVerify);
        };
	 writer.write(imageURI);
}

function onAfterSaveFile(fileFullPath){
	navigator.notification.activityStart("Please Wait", "loading.....");
    loadPage('gallery');
	if(gallaryTable != "" && gallaryTable != null)
	{	
		document.getElementById("disp-tab1").innerHTML=gallaryTable;
		db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="' + M_InOutLine_ID + '" and insp_line="' + X_INSTRUCTIONLINE_ID + '"', [], function (tx, results) {
				imagelistarray = results;
				if(totColumns >= results.rows.length){
					fillSingleTD(fileFullPath);
					
				}else
				{
					var colNum = Math.ceil( imagelistarray.rows.length / 3 );
					colNum=colNum-1;
					for (var j = 0; j < 3; j++) {
						var tr = document.getElementById("tr-" + j);
						var td = document.createElement('td');
						td.setAttribute("id", "td-" + j + "-" + colNum);
						td.setAttribute("style", "margin:0px; padding:0px;");
						tr.appendChild(td);
						totColumns=totColumns+1;
					}
					fillSingleTD(fileFullPath);
				}						
			}, function (err) { console.log("Error SQL: " + err.code);	});
		},  function (err) { console.log("Error SQL: " + err.code);	});
    }
	else{
		backtogallary();
	}
}

function fillSingleTD(fileFullPath){
	if (DataTypes.indexOf(getExtention(getFileName(fileFullPath)).toUpperCase()) >= 0) {
		var imgelem = document.createElement("img");
		imgelem.setAttribute("height", (window.innerHeight * .27) + "px");
		imgelem.setAttribute("width", (window.innerHeight * .36) + "px");
		imgelem.setAttribute("style", "margin:3px 5px; float:left;");
		imgelem.setAttribute("src", gcanvas.toDataURL());
		if (Disp_row > 2 ) {
			Disp_row = 0;Disp_col = Disp_col + 1;
		}
		
		var chkImg = document.createElement("img");
		chkImg.setAttribute("style", "position:absolute;height:35px;width:35px;display:none;");
		chkImg.setAttribute("src", "img/up.png");
		chkImg.setAttribute("id","tdUpload-" + Disp_row + "-" + Disp_col);
		document.getElementById("td-" + Disp_row + "-" + Disp_col).appendChild(chkImg);
		
		pandingUploads[pandingCounts] = new Array();
		pandingUploads[pandingCounts][0] = "tdUpload-" + Disp_row + "-" + Disp_col;
		pandingUploads[pandingCounts++][1] = getFileName(fileFullPath);
		document.getElementById("td-" + Disp_row + "-" + Disp_col).appendChild(imgelem);
		itemCount = itemCount + 1;
		Disp_row = Disp_row + 1;
		gallaryTable=document.getElementById("disp-tab1").innerHTML;
	}
	else
	{
		var imgelem = document.createElement("div");
		imgelem.setAttribute("style", "margin:3px 5px; border:1px solid #000;float:left; word-wrap:break-word;");
		imgelem.style.width = (window.innerHeight * .36) + "px";
		imgelem.style.height = (window.innerHeight * .27) + "px";
		imgelem.innerHTML = getFileName(fileFullPath);
		if (Disp_row > 2 ) {
					Disp_row = 0;Disp_col = Disp_col + 1;
		}
		
		var chkImg = document.createElement("img");
		chkImg.setAttribute("style", "position:absolute;height:35px;width:35px;display:none;");
		chkImg.setAttribute("src", "img/up.png");
		chkImg.setAttribute("id","tdUpload-" + Disp_row + "-" + Disp_col);
		document.getElementById("td-" + Disp_row + "-" + Disp_col).appendChild(chkImg);
		
		pandingUploads[pandingCounts] = new Array();
		pandingUploads[pandingCounts][0] = "tdUpload-" + Disp_row + "-" + Disp_col;
		pandingUploads[pandingCounts++][1] = getFileName(fileFullPath);
		document.getElementById("td-" + Disp_row + "-" + Disp_col).appendChild(imgelem);
		itemCount = itemCount + 1;
		Disp_row = Disp_row + 1;
		gallaryTable=document.getElementById("disp-tab1").innerHTML;
	}
	backtogallary();
}

function dirFail(error) {
	console.log("DIRError = "+error);
}

function onUploadFile(filePath, InspNumber,callBack) {
    root.getFile(filePath, null, SingleFileSuccess, function (error) {
        console.log(" FSError = " + error.code);
    });

    function SingleFileSuccess(FnEntries) {
        var ft = new FileTransfer();
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = FnEntries.name;
        ft.upload(FnEntries.toURL(), encodeURI(vis_url + "/VISService/fileUpload"), function () {
            fileName = getFileName(getSDPath(FnEntries.fullPath));
            db.transaction(function (tx) {
                tx.executeSql('UPDATE vis_gallery SET imgUpload="T" WHERE file="' + filePath + '" and insp_line="' + InspNumber + '"');
				setUploadedImg(FnEntries.name);
            }, errorCB);
            imgUploadCount = imgUploadCount - 1;
            callBack();
        }, uploadFail, options);
    }
}

function setUploadedImg(fileName){
	backtogallary();
	for(var i=0; i < pandingUploads.length ; i++){
		if(pandingUploads[i][1]==fileName){
			var tdDiv=document.getElementById(pandingUploads[i][0]);
			tdDiv.setAttribute("style", "position:absolute;height:35px;width:35px;display:block;");
		}
	}
	gallaryTable=document.getElementById("disp-tab1").innerHTML;
}

function uploadFail(error) {
    console.log("Error = " + error.code);
    navigator.notification.alert('All files not uploaded', function () {}, 'Failure', 'OK');
    onStopNotification();
}

function fileexplore(){
	parlistArray=[];
	parlistArray.push(root);
	listDir(root);
}
function backFile(){
	var tmppar=parlistArray.pop();
	listDir(tmppar);
}
function listDir(DirEntry){
	if( !DirEntry.isDirectory ) console.log('listDir incorrect type');
	currentDir=DirEntry;
	
	var DirReader = DirEntry.createReader();
	DirReader.readEntries(function(entries){
			var dirContent = $('#dirContent');
			dirContent.empty();
			var dirArr = new Array();
			var fileArr = new Array();
			var div=document.createElement('div');
			div.innerHTML=DirEntry.name+".....";
			dirContent.append(div);
			for(var i=0; i<entries.length; ++i){ // sort entries
				var entry = entries[i];
				var div=document.createElement('div');
				if( entry.isDirectory && entry.name[0] != '.' ){
						div.className="folder";
						var tmpstr="listsub('"+entry.name+"')";
						div.setAttribute('onclick',tmpstr);
						div.innerHTML=entry.name;
					}
				else if( entry.isFile && entry.name[0] != '.' ){
						div.className="file";
						var tmpstr="onFileExplorerClick('"+entry.fullPath+"')";
						div.setAttribute('onclick',tmpstr);
						div.innerHTML=entry.name;
					}
					dirContent.append(div);
			}
			
   }, function(error){
        console.log('listDir readEntries error: '+error.code);
    });
}
function listsub(DirName){
	parlistArray.push(currentDir);
	currentDir.getDirectory(DirName, null, function (dir){listDir(dir);}, function(error){ console.log("Error = "+error.code); });
	currentDir = null;
}

function onReadFileDataUrl(FnEntries,ItemNumber,callBack){
	FnEntries.file(function (rfile){
		var reader = new FileReader();
			reader.onloadend = function (evt) {
			callBack(evt,ItemNumber,rfile);
		};
		reader.readAsDataURL(rfile);
	}, function () {});
}

function onImgFileSystem(FnEntries){
	FnEntries.file(gotGallaryImg,function(){});
	function gotGallaryImg(rfile){readGallaryDataUrl(rfile);}
	function readGallaryDataUrl(rfile) {
		var reader = new FileReader();
		reader.onloadend = function(evt) {
			onCropCall(evt.target.result);
		};
		reader.readAsDataURL(rfile);
	}
}

function getSDPath(Fname){
	var tmpArray=Fname.split('mnt/sdcard');
	return tmpArray.pop();
}

function getExtention(Fname){
	var tmpArray=Fname.split('.');
	return tmpArray.pop();
}