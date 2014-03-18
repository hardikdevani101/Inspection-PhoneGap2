var fileName;
var imageURI;
var gcanvas;
function saveImage(){
	
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



function readImages(){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotreadFileSystem,function(error){ console.log("request FSError = "+error); });
}
function gotreadFileSystem(fileSystem) {
	fileSystem.root.getDirectory("VIS_Inspection", {create : true},readdatafile, dirFail);
}
function readdatafile(directory){
	var directoryReader = directory.createReader();
	console.log("Directory ====== ="+directory.fullPath);
	directoryReader.readEntries(readSuccess,function(error){ console.log("Error on read = "+error); });
}
function readSuccess(entries){
	var i;
	var ft = new FileTransfer();
	var options = new FileUploadOptions();
		options.fileKey="file";
		options.mimeType="image/png";
    for (i=0; i<entries.length; i++) {
		options.fileName=entries[i].name;
		ft.upload(entries[i].toURL(), encodeURI(vis_url+"/VISService/fileUpload"), win, fail, options);
        console.log("images ="+entries[i].toURI());
    }
}
function win(r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
}

function fail(error) {
   console.log("Sent = " + error.code);
}
		