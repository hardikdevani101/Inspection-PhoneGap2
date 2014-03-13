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
var fileName;
var imageURI;
var db;
var vis_url,vis_lang,vis_client_id,vis_role,vis_whouse_id,vis_ord_id;
var username;


function onLoad() {
	document.addEventListener("deviceready", onDeviceReady, false);
	document.addEventListener("backbutton", onBackButton, false);
	watermark = new Image();
	origImg = new Image();
	watermark.src = "img/Velocity_Watermark.png";
}
function onLoginpage(){
	loadPage("login");
}
function onLogin(){

	$.ajax({type: "POST",
			url: "http://192.168.0.121:8088/VISService/services/ModelADService",
			dataType: "xml",
			contentType: 'text/xml; charset=utf-8',
			data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:_0="http://idempiere.org/ADInterface/1_0">'
				   +'<soapenv:Header/>'
				   +'<soapenv:Body>'
					  +'<_0:readData>'
						 +'<_0:ModelCRUDRequest>'
							+'<_0:ModelCRUD>'
							   +'<_0:serviceType>Login</_0:serviceType>'
							   +'<_0:TableName>AD_User</_0:TableName>'
							   +'<_0:recordIDVariable>@##AD_User_ID</_0:recordIDVariable>'
							   +'<_0:DataRow>'
							   +'</_0:DataRow>'
							+'</_0:ModelCRUD>'
							+'<_0:ADLoginRequest>'
							   +'<_0:user>'+document.getElementById("txt_user").value+'</_0:user>'
							   +'<_0:pass>'+document.getElementById("txt_password").value+'</_0:pass>'
							   +'<_0:lang>'+vis_lang+'</_0:lang>'
							   +'<_0:ClientID>'+vis_client_id+'</_0:ClientID>'
							   +'<_0:RoleID>'+vis_role+'</_0:RoleID>'
							   +'<_0:OrgID>'+vis_ord_id+'</_0:OrgID>'
							   +'<_0:WarehouseID>'+vis_whouse_id+'</_0:WarehouseID>'
							   +'<_0:stage>9</_0:stage>'
							+'</_0:ADLoginRequest>'
						 +'</_0:ModelCRUDRequest>'
					  +'</_0:readData>'
				   +'</soapenv:Body>'
				+'</soapenv:Envelope>',
                    success: processSuccess,
                    error: processError
                });
				function processSuccess(data, status, req) {
                    if (status == "success")
					{
						if($(req.responseXML).find('WindowTabData').find('RowCount').text()=="1")
						{
							username=$(req.responseXML).find('WindowTabData').find('DataSet').find('DataRow').find('field').find('val').text();
							loadPage("home");
							document.getElementById("user_lbl").innerHTML="Hello : "+username;
						}
						else{
							//navigator.notification.alert(req.responseText + " " + status);
							loadPage("login");
							document.getElementById("login_error").innerHTML="Not Valid User";
						}
					}
					
                }

                function processError(data, status, req) {
					loadPage("login");
					document.getElementById("login_error").innerHTML="Something Going Wrong !!!";
                }  
}
function onSettingPage(){
	loadPage("setting");
	setSettingpage();
}
function setSettingpage(){
	document.getElementById("txt_url").value=vis_url;
	document.getElementById("txt_lang").value=vis_lang;
	document.getElementById("txt_client").value=vis_client_id;
	document.getElementById("txt_role").value=vis_role;
	document.getElementById("txt_warehouse").value=vis_whouse_id;
	document.getElementById("txt_organizer").value=vis_ord_id;
}
function onSettingUpdate(){
	vis_url=document.getElementById("txt_url").value;
	vis_lang=document.getElementById("txt_lang").value;
	vis_client_id=document.getElementById("txt_client").value;
	vis_role=document.getElementById("txt_role").value;
	vis_whouse_id=document.getElementById("txt_warehouse").value;
	vis_ord_id=document.getElementById("txt_organizer").value;
	if(vis_url=="" && vis_lang=="" && vis_client_id=="" && vis_role=="" && vis_whouse_id=="" && vis_ord_id=="")
	{
		navigator.notification.alert('No Any Field Should Blank!',onSettingPage,'Invalid Value','Ok');
		successCB();
	}else{
		db.transaction(updateSettingDb, errorCB);
		loadPage("login");
	}
	
}
function onPhotoDataSuccess(imageData) {
	$('#smallImage').attr('src',"data:image/png;base64," + imageData);
	loadPage("imagePrev");
	onCrop();
}

function onDeviceReady() {
	db = window.openDatabase("vis_inspection", "1.0", "vis_inspection", 100000);
   	db.transaction(populateDB, errorCB, successCB);
	pictureSource = navigator.camera.PictureSourceType;
	destinationType = navigator.camera.DestinationType;
	loadPage("login");
}
//db process
function errorCB(err) {
    //console.log("Error processing SQL: "+err.code);
    db.transaction(queryDB, errorCB);
}
function successCB() {
    db.transaction(queryDB, errorCB);
}
function updateSettingDb(tx) {
	tx.executeSql('UPDATE vis_setting SET vis_url = "'+vis_url+'" ,vis_lang ="'+vis_lang +'",vis_client_id ="'+vis_client_id +'",vis_role ="'+vis_role +'",vis_whouse_id ="'+ vis_whouse_id+'",vis_ord_id ="'+vis_ord_id +'"');
	successCB();
}
function queryDB(tx) {
    tx.executeSql('SELECT * FROM vis_setting', [], querySuccess,function(err){console.log("Error SQL: "+err.code);} );
	
}
function querySuccess(tx, results) {
    var len = results.rows.length;
    console.log("DEMO table: " + len + " rows found.");
    for (var i=0; i<len; i++){
       vis_url=results.rows.item(i).vis_url;
	   vis_role=results.rows.item(i).vis_role;
	   vis_lang=results.rows.item(i).vis_lang;
	   vis_client_id=results.rows.item(i).vis_client_id;
	   vis_whouse_id=results.rows.item(i).vis_whouse_id;
	   vis_ord_id=results.rows.item(i).vis_ord_id;
    }
}
function populateDB(tx) {
  /*  tx.executeSql('DROP TABLE vis_setting');*/
    tx.executeSql('CREATE TABLE vis_setting(vis_url,vis_lang,vis_client_id,vis_role,vis_whouse_id,vis_ord_id)');
    tx.executeSql('INSERT INTO vis_setting (vis_url,vis_lang,vis_client_id,vis_role,vis_whouse_id,vis_ord_id) VALUES ("uri","lang","clientid", "role","whouse","org")');
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

