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