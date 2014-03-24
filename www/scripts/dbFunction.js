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
	tx.executeSql('CREATE TABLE IF NOT EXISTS vis_gallery(mr_line,insp_line,image)');
}



function insertimage(tx){
	tx.executeSql('INSERT INTO vis_gallery(mr_line,insp_line,image) VALUES ("'+M_InOutLine_ID+'","'+X_INSTRUCTIONLINE_ID+'","'+fileName+'")');
}

function loadimagelist(tx){
	tx.executeSql('SELECT image FROM vis_gallery WHERE mr_line="'+M_InOutLine_ID+'" and insp_line="'+X_INSTRUCTIONLINE_ID+'"', [], loadimageSelectSuccess,function(err){console.log("Error SQL: "+err.code);} );
}
function loadimageSelectSuccess(tx, results){
	imagelistarray=[];
	//imagelistarray=results;
	 for (var i=0; i<results.rows.length; i++){
		 imagelistarray.push(results.rows.item(i).image);
		   console.log("image name = "+results.rows.item(i).image);
		}
}