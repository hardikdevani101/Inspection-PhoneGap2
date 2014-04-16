var fileName;
var imageURI;
var gcanvas;
var readEntries;
function saveImage(){
	navigator.notification.activityStart("Please Wait", "Saving Image");
	var date = new Date;
	var sec = date.getSeconds();
	var mi = date.getMinutes();
	var hh = date.getHours();

	var yy = date.getFullYear();
	var mm = date.getMonth();
	var dd = date.getDate();
	fileName="vis_inspection_"+mm+dd+yy+"_"+hh+mi+sec+".png";
	
	var img64 = gcanvas.toDataURL("image/png").replace(/data:image\/png;base64,/,''); 
	imageURI=Base64Binary.decodeArrayBuffer(img64);
	
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem,function(error){ console.log("request FSError = "+error); });
}

function gotFileEntry(fileEntry) {
	fileEntry.createWriter(gotFileWriter, function(error){ console.log("file entry FSError = "+error.code); });
}
function gotFileWriter(writer){
	 writer.onwrite = function(evt) {
		 	db.transaction(insertimage, errorCB);
            backtogallary();
			readImages();
			window.setTimeout(function(){
			readImg();
			},100);
        };
	 writer.write(imageURI);
}
function gotFileSystem(fileSystem) {
	fileSystem.root.getDirectory("VIS_Inspection", {create : true},datafile, dirFail);
}
function datafile(directory){
	directory.getFile(fileName, {create: true, exclusive: false}, gotFileEntry,function(error){ console.log("File Create FSError = "+error.code); });
}
function dirFail(error) {
	console.log("DIRError = "+error);
}


//Read All Images
function readImages(){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotreadFileSystem,function(error){ console.log("request FSError = "+error); });
}
function gotreadFileSystem(fileSystem) {
	fileSystem.root.getDirectory("VIS_Inspection", {create : true},readdatafile, dirFail);
}
function readdatafile(directory){
	var directoryReader = directory.createReader();
	directoryReader.readEntries(readSuccess,function(error){ console.log("Error on read = "+error); });
}
function readSuccess(entries){
	readEntries=entries;
}
function win(r) {
            //console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            //console.log("Sent = " + r.bytesSent);
}

function fail(error) {
   console.log("Error = " + error.code);
}


//Single image Read
function readImg(){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotImgDirFileSystem,function(error){ console.log("request FSError = "+error.code); });
}
function gotImgDirFileSystem(DirSystem) {
	DirSystem.root.getDirectory("VIS_Inspection", {create : true},gotImgFileSystem, function(error){ console.log(" FSError = "+error.code); });
}
function gotImgFileSystem(fileSystem) {
	console.log("Get imag file system");
	fileSystem.getFile(fileName,null,imgSuccess,function(error){ console.log(" FSError = "+error.code); });
}
function readImgfile(img){
	img.file(imgSuccess,function(error){ console.log("Error on read = "+error.code); });
}
function imgSuccess(imgEntries){
		singleImgUpload(imgEntries);
}

//file explorer
var root;
var currentDir;
var parentDir;
var parlist;
var DataTypes=["JPEG","JPG","BMP","PNG"];
function fileexplore(){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileExplore,function(error){ console.log("request FSError = "+error); });
	parlist=[];
}
function gotFileExplore(fileSystem) {
	root=fileSystem.root;
	
	parlist.push(root);
	listDir(root);
}
function backFile(){
	var tmppar=parlist.pop();
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
						console.log("entry file====="+entry.name);
						var tmpstr="listsub('"+entry.name+"')";
						div.setAttribute('onclick',tmpstr);
						div.innerHTML=entry.name;
					}
				else if( entry.isFile && entry.name[0] != '.' ){
						div.className="file";
						var tmpstr="fileDbEntry('"+entry.fullPath+"')";
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
	parlist.push(currentDir);
	currentDir.getDirectory(DirName, null, function (dir){listDir(dir);}, function(error){ console.log("Error = "+error.code); });
}

//upload File After Select
function uploadSingleFile(fName){
	root.getFile(fName,null,FnameSuccess,function(error){ console.log(" FSError = "+error.code); });
}
function FnameSuccess(FnEntries){
		var ft = new FileTransfer();
		var options = new FileUploadOptions();
		options.fileKey="file";
		options.fileName=FnEntries.name;
		ft.upload(FnEntries.toURL(), encodeURI(vis_url+"/VISService/fileUpload"), singleFilewin, uploadfail, options);
		function singleFilewin(){
			db.transaction( function(tx){tx.executeSql('UPDATE vis_gallery SET imgUpload="T" WHERE file="'+fileName+'"');}, errorCB);
		}
}

function getGallaryFileSystem(fileSystem){
	fileSystem.root.getFile(fileName,null,GallaryImgSuccess,function(error){ console.log(" FSError = "+error.code); });
}

function GallaryImgSuccess(FnEntries){
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

		


