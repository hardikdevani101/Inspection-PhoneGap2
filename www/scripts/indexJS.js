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
var userid;
var INSPECTOR_ID;
var M_InOutLine_ID=0;
var M_line_name;
var X_INSTRUCTIONLINE_ID;
var X_instruction_name;

function onLoad() {
	document.addEventListener("deviceready", onDeviceReady, false);
	document.addEventListener("backbutton", onBackButton, false);
	watermark = new Image();
	origImg = new Image();
	watermark.src = "img/Velocity_Watermark.png";
}

function onDeviceReady() {
	db = window.openDatabase("vis_inspection", "1.0", "vis_inspection", 100000);
   	db.transaction(settingDbSetup, errorCB, loadSetting);
	loadPage("login");
}

function onExit(){
	loadPage("exit");
}

function picupload(){
	readImages();
	db.transaction(uploadimagelist, errorCB);
	window.setTimeout(function(){
		var i;
		var ft = new FileTransfer();
		var options = new FileUploadOptions();
			options.fileKey="file";
			options.mimeType="image/png";
		for (i=0; i<readEntries.length; i++) {
			for(var j=0;j<imagelistarray.rows.length; j++)
			{	
				if(imagelistarray.rows.item(j).image==readEntries[i].name && imagelistarray.rows.item(j).imgUpload=="F")
				{
					options.fileName=readEntries[i].name;
					ft.upload(readEntries[i].toURL(), encodeURI(vis_url+"/VISService/fileUpload"), function(r){
											db.transaction(chngealluploadstate, errorCB);
											function chngealluploadstate(tx){
												tx.executeSql('UPDATE vis_gallery SET imgUpload="T" WHERE image="'+readEntries[i].name+'"');
												console.log("updated truuuu========");
											}
					}, uploadfail, options);
					imagetoserver(imagelistarray.rows.item(j).insp_line,readEntries[i].name);
					console.log("images ="+readEntries[i].toURL());
				}else if(imagelistarray.rows.item(j).image==readEntries[i].name && imagelistarray.rows.item(j).imgUpload=="T"){
					imagetoserver(imagelistarray.rows.item(j).insp_line,readEntries[i].name);
				}
			}
		}
	deleteMRgallary();
	},100);
}
function deleteMRgallary(){
	db.transaction(deleteimagelist, errorCB);
	function deleteimagelist(tx){
		tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="'+M_InOutLine_ID+'" and imgUpload="F"', [], deleteimageSelect,function(err){console.log("Error SQL: "+err.code);} );
	}
	function deleteimageSelect(tx,result){
		if(result.rows.length>0){
			console.log("Upload Not Finished");
		}else{
			tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="'+M_InOutLine_ID+'" and imgUpload="T"', [], deleteimageSelectsuccess,function(err){console.log("Error SQL: "+err.code);} );
		}
	}
}

function deleteimageSelectsuccess(tx,results){
	
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotdeleteFileSystem,function(error){ console.log("request FSError = "+error.code); });
		function gotdeleteFileSystem(filesystem){
			filesystem.root.getDirectory("VIS_Inspection", {create : true},deletedatafile, dirFail);
		}
		function deletedatafile(directory){
			var directoryReader = directory.createReader();
			console.log("Directory ====== ="+directory.fullPath);
			directoryReader.readEntries(deleteFileSuccess,function(error){ console.log("Error on read = "+error.code); });
		}
		function deleteFileSuccess(entries){
			console.log("delete call===="+results.rows.length);
			for(var i=0;i<results.rows.length;i++){
				console.log("Result  call===="+entries.length);
				for(var j=0;j<entries.length;j++){
					console.log("Entries call====");
					if(entries[j].name==results.rows.item(i).image)
					{ console.log("file=="+entries[j].name);
						entries[j].remove(imgdelSuccess,function(error){ console.log("Error on read = "+error.code); });
						function imgdelSuccess(entry){
							tx.executeSql('DELETE FROM vis_gallery WHERE image="'+entries[j].name+'"');
							console.log("deleted");
						}
					}
				}
			}
			
		}
		window.setTimeout(function(){
		onStartNewInspection();
		},300);
}

function singleImgUpload(imgnm){
	console.log("img file system ======"+imgnm);
	var ft = new FileTransfer();
	var options = new FileUploadOptions();
		options.fileKey="file";
		options.mimeType="image/png";
		options.fileName=fileName;
		ft.upload(imgnm.toURL(), encodeURI(vis_url+"/VISService/fileUpload"), singleuploadwin, uploadfail, options);
}

function singleuploadwin(){
	db.transaction(chngeuploadstate, errorCB);
}

function uploadwin(r) {
            console.log("Sent = " + r.bytesSent);
}

function uploadfail(error) {
   console.log("Error = " + error.code);
}

function showPhotos(){
	navigator.notification.activityStart("Please Wait", "loading Photos");
	readImages();
	db.transaction(loadimagelist, errorCB);
	window.setTimeout(function(){
		for (i=0; i<readEntries.length; i++) {
			if(imagelistarray.indexOf(readEntries[i].name) > -1)
			{
				readEntries[i].file(gotrFile,function(){});
				function gotrFile(rfile){
						readDataUrl(rfile);
				}
				
				function readDataUrl(rfile) {
					var reader = new FileReader();
					reader.onloadend = function(evt) {
						//console.log(evt.target.result);
						var imgelem = document.createElement("img");
						imgelem.setAttribute("height", "25%");
						imgelem.setAttribute("width", "30%");
						imgelem.setAttribute("style", "margin:3px 5px;");
						imgelem.setAttribute("src",evt.target.result);
						document.getElementById("imglist").appendChild(imgelem);
					};
					reader.readAsDataURL(rfile);
				}
				
				console.log("images ="+imagelistarray[i]+"img="+readEntries[i].toURL());
			}
		}
		navigator.notification.activityStop();
	},300);
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
	navigator.notification.activityStart("Please Wait", "loading");
	setlinedrop();
}

function onInspSet(nid,iname) {
	loadPage('gallery');
	showPhotos();
	X_INSTRUCTIONLINE_ID=nid;
	X_instruction_name=iname;
	document.getElementById("gallery_head").innerHTML = M_line_name+"("+X_instruction_name+")";
	
}

function backtogallary(){
	loadPage('gallery');
	showPhotos();
	document.getElementById("gallery_head").innerHTML = M_line_name+"("+X_instruction_name+")";
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
	navigator.notification.activityStart("Please Wait", "Croping");
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
	
			navigator.notification.activityStart("Please Wait", "Water Marking");
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
			navigator.notification.activityStop();
}
function reApplyatterMark(){
	applyWatermark();
}