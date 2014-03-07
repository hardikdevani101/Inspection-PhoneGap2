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
var watermarkX = "10";
var watermarkY = "10";
var opacity = (255/(100/50));
var gcanvas;
var gctx;
var origImg;
//var waterImg;
var previewCanvas;
var contexto;
var canvaso;
var wrx;
var wry;
var wmCanvasDiv;


function onLoad() {
	loadPage("home");
	document.addEventListener("deviceready", onDeviceReady, false);
	document.addEventListener("backbutton", onBackButton, false);
	watermark = new Image();
	watermark.src = "img/logo.png";
}

function onPhotoDataSuccess(imageData) {
	$('#smallImage').attr('src',"data:image/jpeg;base64," + imageData);
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
	canvas = document.createElement('canvas');
    
	$('#cropImage').html(['<img src="', document.getElementById('smallImage').src, '" width="80%" height="80%" />'].join(''));
	crop_img = $('#cropImage img')[0];
	
	
	
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

	var x1 = Math.round(rx * finalSelection.x);
	var y1 = Math.round(ry * finalSelection.y);

	var w = canvas.width;
	var h = canvas.height;

	var ctx = canvas.getContext('2d');
	ctx.drawImage(crop_img, x1, y1, w, h, 0, 0, w, h);
	$('#waterImage').attr('src', canvas.toDataURL());
	origImg = new Image();
	origImg.src=canvas.toDataURL();
	
	loadPage("waterImgPrev");
	onWatermark();
	//Using timer to reApplyWaterMark
	window.setTimeout(function(){
	reApplyatterMark();
	},300);
}

function reonCrop(){
	$('#smallImage').attr('src',document.getElementById('waterImage').src);
	loadPage("imagePrev");
	onCrop();
}

function onCropSkip(){
	$('#waterImage').attr('src',document.getElementById('smallImage').src);
	loadPage("waterImgPrev");
}
//For Water Mark
function onWatermark(){
	
	initCanvas();
	initWatermark();	
}
function initCanvas(){
	
			wmCanvasDiv = document.getElementById('wmCanvasContainer');
			gcanvas =  document.getElementById('WatermarkCanvas'); //document.createElement('canvas');
			if (!gcanvas) {
			  alert('Error: I cannot create a new canvas element!');
			  return;
			}

			//gcanvas.style.cssText = " width:80%; height:80%";
			gctx = gcanvas.getContext("2d");
			
			
			gcanvas.onmouseup = function(ev){
				var x,y;
				if (ev.layerX || ev.layerX == 0) { // Firefox
				  x = ev.layerX;
				  y = ev.layerY;
				} else if (ev.offsetX || ev.offsetX == 0) { // Opera
				  x = ev.offsetX;
				  y = ev.offsetY;
				}
				applyWatermark(x,y);
			}
}
function initWatermark(){
	
	applyTransparency();
			console.log("watermark img="+watermark.src);
}
function applyTransparency(){
			var w = watermark.width || watermark.offsetWidth,
			h = watermark.height || watermark.offsetHeight;
			
			canvas.width = w;
			canvas.height = h;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(watermark, 0, 0);
			var image = ctx.getImageData(0, 0, w, h);
			var imageData = image.data,
			length = imageData.length;
			for(var i=3; i < length; i+=4){  
				imageData[i] = (imageData[i]<opacity)?imageData[i]:opacity;
			}
			image.data = imageData;
			ctx.putImageData(image, 0, 0);
			watermark.onload = null;
			watermark.src = "";
			watermark.src = canvas.toDataURL();
			// assign img attributes to the transparent watermark
			// because browsers recalculation doesn't work as fast as needed
			watermark.width = w;
			watermark.height = h;
			applyWatermark(50,50);
}

function applyWatermark(x,y){
	console.log("applyWatermark");
		
			gcanvas.width = origImg.width || origImg.offsetWidth;
			gcanvas.height = origImg.height || origImg.offsetHeight;
			gctx.drawImage(origImg, 0, 0);
			
			x=x-(watermark.width/2);
			y=y-(watermark.height/2);
			if(x<0)
				x=0;
			if(y<0)
				y=0;
			gctx.drawImage(watermark, x, y);
			
}
function reApplyatterMark(){

	applyWatermark(50,50);
}


