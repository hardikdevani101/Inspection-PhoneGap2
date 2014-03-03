var pictureSource; // picture source
var destinationType; // sets the format of returned value 
var pageID;
var backPageID;
var cropX;
var cropY;
var cropW;
var cropH;
var canvas;

var boundX,BoundY;
var xsize,ysize;
var jcrop_api;
var  finalSelection;

var crop_img;


function onLoad() {
	console.log("Called Load...");
	loadPage("home");
	document.addEventListener("deviceready", onDeviceReady, false);
	document.addEventListener("backbutton", onBackButton, false);
}

function onPhotoDataSuccess(imageData) {
	console.log("image: " + imageData);
	$('#smallImage').attr('src',"data:image/jpeg;base64," + imageData);
//	$('#cropImage').attr('src',imageData);
	loadPage("imagePrev");
}

function onDeviceReady() {
	console.log("Ready...");
	pictureSource = navigator.camera.PictureSourceType;
	destinationType = navigator.camera.DestinationType;
	loadPage("home");
}

function captureI() {
	console.log("CaptureI");
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
	canvas = document.createElement('canvas');
	var tempImage = new Image();
    tempImage.src = $('#cropImage').src;
    
//    var widthAct = tempImage.width;
//    var heightAct = tempImage.height;
//    
//    console.log("widthAct = " +widthAct);
//    console.log("heightAct = " +heightAct);
//    
//    var widthImg = $('#cropImage').width;
//    var heightImg = $('#cropImage').height;
//    
//    console.log("widthImg = " +widthImg);
//    console.log("heightImg = " +heightImg);
   
   
	$('#cropImage').html(['<img src="', document.getElementById('smallImage').src, '" width="80%" height="80%" />'].join(''));
	crop_img = $('#cropImage img')[0];
	
	var tempImage = new Image();
    tempImage.src = crop_img.src;
	xsize = tempImage.width,
    ysize = tempImage.height;
	
	
	$('#cropImage img').Jcrop({
						 bgColor: 'black',
						 bgOpacity: .3,
						 onSelect: cropAreaChanged,
						 onChange: cropAreaChanged
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
			/*selection.w = 5;
		if (selection.h < 5)
			selection.h = 5; 
		
		canvas.width =  selection.w;
		canvas.height = selection.h;
		
		var ctx = canvas.getContext('2d');
		ctx.drawImage(img, selection.x, selection.y, selection.w, selection.h, 0, 0, canvas.width, canvas.height);
		*/
	}
	
}	

function onCropSaved()
{
	canvas = document.createElement('canvas');
	console.log(canvas.toDataURL());
	
	
	
	var rx = xsize/boundx ;
    var ry = ysize/boundy ;

    console.log("***rx1***: " + rx);
	console.log("***ry1***" + ry);
    
	canvas.width =  Math.round(rx * finalSelection.w);
	canvas.height = Math.round(ry * finalSelection.h);

	var x1 =Math.round(rx * finalSelection.x);
	var y1 = Math.round(ry * finalSelection.y);
	
	var w = canvas.width ;
	var h =canvas.height;
	
	console.log("***W*** : " + w);
	console.log("***H***: " + h);
	console.log("***X1*** : " + x1);
	console.log("***Y1***: " + y1);
	console.log("***finalSelection.x*** : " + finalSelection.x);
	console.log("***rx2***: " + rx);
	console.log("***ry2***" + ry);
	console.log("***xsize***: " + xsize);
	console.log("***ysize***: " + ysize);
	console.log("***boundX***: "+ boundx);
	console.log("***boundY***: "+ boundy);
	
	
	
	var ctx = canvas.getContext('2d');
	ctx.drawImage(crop_img, x1, y1, w,h, 0, 0, w, h);
	
	$('#smallImage').attr('src',canvas.toDataURL());
	loadPage("imagePrev");
}
