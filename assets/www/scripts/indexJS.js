var pictureSource; // picture source
var destinationType; // sets the format of returned value 
var pageID;
var backPageID;

function onLoad() {
	console.log("Called Load...");
	loadPage("home");
	document.addEventListener("deviceready", onDeviceReady, false);
	document.addEventListener("backbutton", onBackButton, false);
}

function onPhotoDataSuccess(imageData) {
//	console.log("image: " + imageData);
//	var smallImage = document.getElementById('smallImage');
//	smallImage.src = "data:image/jpeg;base64," + imageData;
//	console.log(document.getElementById('img1').innerHTML);
//	document.getElementById("disp").innerHTML = document.getElementById('img1').innerHTML;
//	document.addEventListener("backbutton", onBackButton, false);
	
	console.log("image: " + imageData);
	$('#smallImage').attr('src', "data:image/jpeg;base64," + imageData);
	loadPage("imagePrev");
	$('#smallImage').Jcrop();
	console.log("End of function");
}

function onDeviceReady() {
	console.log("Ready...");
	navigator.splashscreen.show();
	pictureSource = navigator.camera.PictureSourceType;
	destinationType = navigator.camera.DestinationType;
	loadPage("home");
}

function captureI() {
	smallImage.src = "";

	navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
		quality : 50,
		destinationType : Camera.DestinationType.DATA_URL,
		allowEdit : true
	});
}

function onFail(message) {
	alert('Failed because: ' + message);
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
	//document.removeEventListener("backbutton", onBackButton, false);
	loadPage(backPageID);
}

function onStartNewInspection() {
	loadPage("startNewInsp");
}

function onInspSet(name)
{
	loadPage('gallery');
	document.getElementById("gallery_head").innerHTML = name;
}