var pictureSource; // picture source
var destinationType; // sets the format of returned value 
var pageID;
var backPageID;
var canvas;

var boundX,BoundY;
var xsize,ysize;
var jcrop_api;
var finalSelection;
var crop_img;


var watermark;
var opacity = (255/(100/50));
var gcanvas;
var gctx;
var origImg;
//var waterImg;
var scW;
var scH;
var fileName;
var imageURI;


function onLoad() {
	loadPage("home");
	document.addEventListener("deviceready", onDeviceReady, false);
	document.addEventListener("backbutton", onBackButton, false);
	scW=window.innerWidth;
	scH=window.innerHeight;
	watermark = new Image();
	origImg = new Image();
	watermark.src = "img/Velocity_Watermark.png";
}

function onPhotoDataSuccess(imageData) {
	$('#smallImage').attr('src',"data:image/png;base64," + imageData);
	loadPage("imagePrev");
	onCrop();
}

function onDeviceReady() {
	
	pictureSource = navigator.camera.PictureSourceType;
	destinationType = navigator.camera.DestinationType;
	loadPage("home");
}
function captureI() {
	navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
		quality : 90,
		destinationType : Camera.DestinationType.DATA_URL,
		allowEdit : true
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
		backPageID = pageID;
		pageID = id1;
	}
}

function onBackButton() {
	document.removeEventListener("backbutton", onBackButton, false);
	//loadPage(backPageID);
}

function onStartNewInspection() {
	loadPage("startNewInsp");
}

function onInspSet(name) {
	loadPage('gallery');
	document.getElementById("gallery_head").innerHTML = name;
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
						 setSelect: [0,0,256,192]
					},function(){
					      // Use the API to get the real image size
					      var bounds = this.getBounds();
					      boundx = bounds[0];
					      boundy = bounds[1];
					      // Store the API in the jcrop_api variable
					      jcrop_api = this; 
					    });
	
	function cropAreaChanged(selection)
	{
		if (selection.w > 0 && selection.h > 0 )
			finalSelection = selection;
	}
}	

function onCropSaved() {
	canvas = document.createElement('canvas');
	
	var tempImage = new Image();
    tempImage.src = crop_img.src;
	xsize = tempImage.width,
    ysize = tempImage.height;
	
	var rx = xsize / boundx;
	var ry = ysize / boundy;

	canvas.width = Math.round(rx * finalSelection.w);
	canvas.height = Math.round(ry * finalSelection.h);
	
	if(canvas.width<1024 && canvas.height<768)
	navigator.notification.alert('Select Bigger Size!',onCrop,'Crop Not Correct','Ok');
	
	var x1 = Math.round(rx * finalSelection.x);
	var y1 = Math.round(ry * finalSelection.y);

	var w = canvas.width;
	var h = canvas.height;

	var ctx = canvas.getContext('2d');
	ctx.drawImage(crop_img, x1, y1, w, h, 0, 0, w, h);
	$('#waterImage').attr('src', canvas.toDataURL());
	
	origImg.src=canvas.toDataURL();
	
	loadPage("waterImgPrev");
	
	//Using timer to reApplyWaterMark
	window.setTimeout(function(){
	reApplyatterMark();
	},50);
}

function onCropSkip(){
	$('#waterImage').attr('src',document.getElementById('smallImage').src);
	
	origImg.src=document.getElementById('waterImage').src;
	loadPage("waterImgPrev");
	//Using timer to reApplyWaterMark
	window.setTimeout(function(){
	reApplyatterMark();
	},50);
}
//For Water Mark
function applyWatermark(){
	
			console.log("applyWatermark");
			gcanvas =  document.createElement('canvas');
			if (!gcanvas) {
			  alert('Error: I cannot create a new canvas element!');
			  return;
			}
			gctx = gcanvas.getContext("2d");
			
			if(origImg.width>1024 && origImg.height>768){
				gcanvas.width = 1024;
				gcanvas.height = 768;
			}
			
			gctx.drawImage(origImg, 0, 0,origImg.width,origImg.height,0,0,1024,768);
			x=(gcanvas.width-20)-(watermark.width);
			y=(gcanvas.height-20)-(watermark.height);
			gctx.drawImage(watermark, x, y);
			$('#waterImage').attr('src',gcanvas.toDataURL());
			
			
}
function reApplyatterMark(){
	applyWatermark();
}
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
	var img=Base64Binary.decodeArrayBuffer(img64);
	imageURI=img;
	
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

