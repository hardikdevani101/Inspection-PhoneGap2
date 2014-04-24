var imageURI;
var gcanvas;
var root;
var dirVISInspection;
var currentDir;
var parentDir;
var parlistArray;
var DataTypes=["JPEG","JPG","BMP","PNG"];

function setRootDirectory(fileSystem){
	root=fileSystem.root;
	root.getDirectory("VIS_Inspection", {create : true},setVISDirectory, dirFail);
}

function setVISDirectory(fileSystem){
	dirVISInspection=fileSystem;
}

function saveImage(){
	navigator.notification.activityStart("Please Wait", "Saving Image.....");
	var date = new Date;
	var sec = date.getSeconds();
	var mi = date.getMinutes();
	var hh = date.getHours();
	var yy = date.getFullYear();
	var mm = date.getMonth();
	var dd = date.getDate();
	var fileName="vis_inspection_"+mm+dd+yy+"_"+hh+mi+sec+".png";
	var img64 = gcanvas.toDataURL("image/png").replace(/data:image\/png;base64,/,''); 
	imageURI=Base64Binary.decodeArrayBuffer(img64);
	dirVISInspection.getFile(fileName, {create: true, exclusive: false}, CreateImgWriter,function(error){ console.log("File Create FSError = "+error.code); });

}

function CreateImgWriter(fileEntry) { 
	var fileFullPath=getSDPath(fileEntry.fullPath).substring(1);
	fileEntry.createWriter(function (writer){
		OnImgWriter(writer,fileFullPath,fileEntry.name);
	}, function(error){ console.log("file entry FSError = "+error.code); });
}
function OnImgWriter(writer,fileFullPath,fileName){ 
	 writer.onwrite = function(evt) {
		 	db.transaction(function (tx){
				tx.executeSql('INSERT INTO vis_gallery(mr_line,insp_line,name,file) VALUES ("'+M_InOutLine_ID+'","'+X_INSTRUCTIONLINE_ID+'","'+fileName+'","'+fileFullPath+'")');
			}, errorCB);
            backtogallary();
			onUploadFile(fileFullPath,X_INSTRUCTIONLINE_ID,callUploadVerify);
        };
	 writer.write(imageURI);
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
            }, errorCB);
            imgUploadCount = imgUploadCount - 1;
            callBack();
        }, uploadFail, options);
    }
}

function uploadFail(error) {
    console.log("Error = " + error.code);
    navigator.notification.alert('All files not uploaded', function () {}, 'Failure', 'OK');
    navigator.notification.activityStop();
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
}

function onReadFileDataUrl(FnEntries,callBack){
	FnEntries.file(function (rfile){
		var reader = new FileReader();
			reader.onloadend = function (evt) {
			console.log("yes this is img");
			callBack(evt,rfile);
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
			$('#smallImage').attr('src',evt.target.result);
			loadPage("imagePrev");
			onCrop();
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