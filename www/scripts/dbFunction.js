//db process
var db;
var imagelistarray;
var vis_url,vis_lang,vis_client_id,vis_role,vis_whouse_id,vis_org_id;
function errorCB(err) {
    console.log("Error processing SQL: "+err.code);
}
function loadSetting() {
    db.transaction(selectSettings, errorCB);
}
function updateSettings(tx) {
	tx.executeSql('UPDATE vis_setting SET vis_url = "'+vis_url+'" ,vis_lang ="'+vis_lang +'",vis_client_id ="'+vis_client_id +'",vis_role ="'+vis_role +'",vis_whouse_id ="'+ vis_whouse_id+'",vis_ord_id ="'+vis_org_id +'"');
	loadSetting();
}
function selectSettings(tx) {
    tx.executeSql('SELECT * FROM vis_setting', [], settingSelectSuccess,function(err){console.log("Error SQL: "+err.code);} );
}
function settingSelectSuccess(tx, results) {
    var len = results.rows.length;
	if(len<1)
	{
		tx.executeSql('INSERT INTO vis_setting (vis_url,vis_lang,vis_client_id,vis_role,vis_whouse_id,vis_ord_id) VALUES ("http://192.168.0.121:8088","en_US","1000000", "1000000","0","0")');
		loadSetting();
	}else
	{
		for (var i=0; i<len; i++){
		   vis_url=results.rows.item(i).vis_url;
		   vis_role=results.rows.item(i).vis_role;
		   vis_lang=results.rows.item(i).vis_lang;
		   vis_client_id=results.rows.item(i).vis_client_id;
		   vis_whouse_id=results.rows.item(i).vis_whouse_id;
		   vis_org_id=results.rows.item(i).vis_ord_id;
		}
	}
}
function settingDbSetup(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS vis_setting(vis_url,vis_lang,vis_client_id,vis_role,vis_whouse_id,vis_ord_id)');
	//tx.executeSql('DROP TABLE IF EXISTS vis_gallery'); 
	tx.executeSql('CREATE TABLE IF NOT EXISTS vis_gallery(mr_line,insp_line,image,file,imgUpload DEFAULT "F")');
}


function fileDbEntry(entry){
	fileName=getSDPath(entry).substring(1);
	console.log("Entry="+entry);
	console.log("File Name="+fileName);
	if(DataTypes.indexOf(getExtention(getFileName(fileName)).toUpperCase()) > -1){
		navigator.notification.activityStart("Please Wait", "loading");
		//getGallaryFileSystem();
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getGallaryFileSystem,function(error){ console.log("request FSError = "+error); });
	}else
	{
		db.transaction(insertFile, errorCB);
		backtogallary();
		readImages();
		window.setTimeout(function(){
				uploadSingleFile(fileName);
				},100);
	}
}
function getSDPath(Fname){
	var tmpArray=Fname.split('mnt/sdcard');
	return tmpArray.pop();
}
function getExtention(Fname){
	var tmpArray=Fname.split('.');
	return tmpArray.pop();
}
function insertimage(tx){
	tx.executeSql('INSERT INTO vis_gallery(mr_line,insp_line,image) VALUES ("'+M_InOutLine_ID+'","'+X_INSTRUCTIONLINE_ID+'","'+fileName+'")');
}
function insertFile(tx){
	tx.executeSql('INSERT INTO vis_gallery(mr_line,insp_line,file) VALUES ("'+M_InOutLine_ID+'","'+X_INSTRUCTIONLINE_ID+'","'+fileName+'")');
}

function loadimagelist(tx){
	tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="'+M_InOutLine_ID+'" and insp_line="'+X_INSTRUCTIONLINE_ID+'"', [], loadimageSelectSuccess,function(err){console.log("Error SQL: "+err.code);} );
}
function loadimageSelectSuccess(tx, results){
	//imagelistarray=[];
	imagelistarray=results;
}

//load All Mrline data From Db For upload
function uploadimagelist(tx){
	tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="'+M_InOutLine_ID+'"', [], uploadimageSelectSuccess,function(err){console.log("Error SQL: "+err.code);} );
}
function uploadimageSelectSuccess(tx, results){
	imagelistarray=results;
}


function chngeuploadstate(tx){
	tx.executeSql('UPDATE vis_gallery SET imgUpload="T" WHERE image="'+fileName+'"');
}