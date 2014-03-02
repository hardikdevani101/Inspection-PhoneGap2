var pictureSource; // picture source
var destinationType; // sets the format of returned value 
var pageID;
var backPageID;
var cropX;
var cropY;
var cropW;
var cropH;
var canvasHidden;

function onLoad() {
	console.log("Called Load...");
	loadPage("home");
	document.addEventListener("deviceready", onDeviceReady, false);
	document.addEventListener("backbutton", onBackButton, false);
}

function onPhotoDataSuccess(imageData) {
	console.log("image: " + imageData);
	$('#smallImage').attr('src',imageData);
//	$('#cropImage').attr('src',imageData);
	loadPage("imagePrev");
}

function onDeviceReady() {
	console.log("Ready...");
	pictureSource = navigator.camera.PictureSourceType;
	destinationType = navigator.camera.DestinationType;
	canvasHidden = document.createElement('canvas');
	loadPage("home");
}

function captureI() {
	console.log("CaptureI");
	navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
		quality : 90,
		destinationType : Camera.DestinationType.FILE_URI,
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
		console.log(id1);
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

function onInspSet(name)
{
	loadPage('gallery');
	document.getElementById("gallery_head").innerHTML = name;
}

function onCrop()
{
	
	loadPage('cropView');
	var canvas = document.createElement('canvas');
	$('#cropImage').html(['<img src="', document.getElementById('smallImage').src, '" width="80%" height="80%"/>'].join(''));
	var img = $('#cropImage img')[0];
	$('#cropImage img').Jcrop({
						 bgColor: 'black',
						 bgOpacity: .3,
						 onSelect: cropAreaChanged,
						 onChange: cropAreaChanged
					});
	
	function cropAreaChanged(selection)
	{
		if (selection.w < 5)
			selection.w = 5;
		if (selection.h < 5)
			selection.h = 5; 
		
		canvas.width =  selection.w;
		canvas.height = selection.h;
		
		var ctx = canvas.getContext('2d');
		ctx.drawImage(img, selection.x, selection.y, selection.w, selection.h, 0, 0, canvas.width, canvas.height);
	}
}	
