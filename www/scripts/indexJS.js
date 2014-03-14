var canvas;
var boundX,BoundY;
var xsize,ysize;
var jcrop_api;
var finalSelection;
var crop_img;
var watermark;
var opacity = (255/(100/50));
var gctx;
var origImg;
var username;

function onLoad() {
	document.addEventListener("deviceready", onDeviceReady, false);
	document.addEventListener("backbutton", onBackButton, false);
	watermark = new Image();
	origImg = new Image();
	watermark.src = "img/Velocity_Watermark.png";
}
function onExit(){
	loadPage("exit");
}
function onDeviceReady() {
	db = window.openDatabase("vis_inspection", "1.0", "vis_inspection", 100000);
   	db.transaction(settingDbSetup, errorCB, loadSetting);
	loadPage("login");
}
function onLoginpage(){
	loadPage("login");
	document.getElementById("login_error").innerHTML="";
}
function onSettingPage(){
	loadPage("setting");
	document.getElementById("setting_error").innerHTML="";
	setSettingpage();
}
function setSettingpage(){
	document.getElementById("txt_url").value=vis_url;
	document.getElementById("txt_lang").value=vis_lang;
	document.getElementById("txt_client").value=vis_client_id;
	document.getElementById("txt_role").value=vis_role;
	document.getElementById("txt_warehouse").value=vis_whouse_id;
	document.getElementById("txt_organizer").value=vis_org_id;
}
function onSettingUpdate(){
	vis_url=document.getElementById("txt_url").value;
	vis_lang=document.getElementById("txt_lang").value;
	vis_client_id=document.getElementById("txt_client").value;
	vis_role=document.getElementById("txt_role").value;
	vis_whouse_id=document.getElementById("txt_warehouse").value;
	vis_org_id=document.getElementById("txt_organizer").value;
	if(vis_url=="" && vis_lang=="" && vis_client_id=="" && vis_role=="" && vis_whouse_id=="" && vis_org_id=="")
	{
		navigator.notification.alert('No Any Field Should Blank!',onSettingPage,'Invalid Value','Ok');
		loadSetting();
	}else{
		db.transaction(updateSettings, errorCB);
		loadPage("login");
	}
	
}
function onPhotoDataSuccess(imageData) {
	$('#smallImage').attr('src',"data:image/png;base64," + imageData);
	loadPage("imagePrev");
	onCrop();
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
	}
}

function onBackButton() {
	document.removeEventListener("backbutton", onBackButton, false);
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