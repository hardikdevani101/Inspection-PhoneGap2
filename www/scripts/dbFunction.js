//db process
var db;
var imagelistarray;
var vis_url,vis_lang,vis_client_id,vis_role,vis_whouse_id,vis_org_id,vis_img_qulty;
function errorCB(err) {
    console.log("Error processing SQL: "+err.code);
}
function loadSetting() {
    db.transaction(selectSettings, errorCB);
}
function updateSettings(tx) {
	tx.executeSql('UPDATE vis_setting SET vis_url = "'+vis_url+'" ,vis_lang ="'+vis_lang +'",vis_client_id ="'+vis_client_id +'",vis_role ="'+vis_role +'",vis_whouse_id ="'+ vis_whouse_id+'",vis_ord_id ="'+vis_org_id +'",vis_img_qulty ="'+vis_img_qulty +'"');
	loadSetting();
}
function selectSettings(tx) {
    tx.executeSql('SELECT * FROM vis_setting', [], settingSelectSuccess,function(err){console.log("Error SQL: "+err.code);} );
}
function settingSelectSuccess(tx, results) {
    var len = results.rows.length;
	if(len<1)
	{
		tx.executeSql('INSERT INTO vis_setting (vis_url,vis_lang,vis_client_id,vis_role,vis_whouse_id,vis_ord_id,vis_img_qulty) VALUES ("http://192.168.0.121:8088","en_US","1000000", "1000000","0","0","75")');
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
		   userName=results.rows.item(i).username;
		   vis_img_qulty=results.rows.item(i).vis_img_qulty;
		   if(userName=='undefined'){
				userName = '';
		   }
		}
		if(pageState==0){
			loadPage("login");
		}
		document.getElementById("txt_user").value = userName;
	}
}
function settingDbSetup(tx) {
	//tx.executeSql('DROP TABLE IF EXISTS vis_gallery'); 
    tx.executeSql('CREATE TABLE IF NOT EXISTS vis_setting(vis_url,vis_lang,vis_client_id,vis_role,vis_whouse_id,vis_ord_id,username,vis_img_qulty)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS vis_gallery(mr_line,insp_line DEFAULT "0",in_out_id DEFAULT "0",name,file,imgUpload DEFAULT "F",imgAttach DEFAULT "F")');
}


function onFileExplorerClick(entry){
	var fileFullPath=getSDPath(entry).substring(1);
	var fileName=getFileName(fileFullPath);
	if(DataTypes.indexOf(getExtention(getFileName(fileFullPath)).toUpperCase()) > -1){
		navigator.notification.activityStart("Please Wait", "loading...");
		root.getFile(fileFullPath,null,onImgFileSystem,function(error){ console.log(" FSError = "+error.code); });
	}else
	{
		onDirectFileUpload(fileFullPath,fileName);
	}
}

function onDirectFileUpload(fileFullPath,fileName){
	db.transaction(function (tx){
		var sqlQuery;
		if(X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null)
			sqlQuery ='INSERT INTO vis_gallery(mr_line,in_out_id,name,file) VALUES ("'+M_InOutLine_ID+'","'+M_INOUT_ID+'","'+fileName+'","'+fileFullPath+'")';
		else
			sqlQuery ='INSERT INTO vis_gallery(mr_line,insp_line,name,file) VALUES ("'+M_InOutLine_ID+'","'+X_INSTRUCTIONLINE_ID+'","'+fileName+'","'+fileFullPath+'")';
		tx.executeSql(sqlQuery);
	}, errorCB);
	imgUploadCount = 1;
	onAfterSaveFile(fileFullPath);
}

function deleteMRgallery() {
    db.transaction(deleteimagelist, errorCB);

    function deleteimagelist(tx) {
        tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="' + M_InOutLine_ID + '" and imgAttach="F"', [], deleteimageSelect, function (err) {
            console.log("Error SQL: " + err.code);
        });
    }

    function deleteimageSelect(tx, result) {
        if (result.rows.length > 0) {
            navigator.notification.alert('Files attach not Finished', function () {}, 'Failure', 'OK');
        } else {
            tx.executeSql('SELECT * FROM vis_gallery WHERE mr_line="' + M_InOutLine_ID + '" and imgAttach="T"', [], deleteImageSelectSuccess, function (err) {
                console.log("Error SQL: " + err.code);
            });
        }
    }
}

function DiscardGallery(buttonIndex) {
    if (buttonIndex == 1) {
        db.transaction(function (tx) {
			var sqlQuery;
			if(X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null)
				sqlQuery ='SELECT * FROM vis_gallery WHERE mr_line="' + M_InOutLine_ID + '" and in_out_id="' + M_INOUT_ID + '"';
			else
				sqlQuery ='SELECT * FROM vis_gallery WHERE mr_line="' + M_InOutLine_ID + '" and insp_line="' + X_INSTRUCTIONLINE_ID + '"';
            tx.executeSql(sqlQuery, [], function (tx, results) {
                imagelistarray = results;
                deleteSelectedGallery();
            }, function (err) {
                console.log("Error SQL: " + err.code);
            });
        }, errorCB);
    }
}

function onDeleteGalleryPage() {
	navigator.notification.activityStart("Please Wait", "loading...");
    SelectedGalleryList = [];
    db.transaction(function (tx) {
		var sqlQuery;
		if(X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null)
			sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="' + M_InOutLine_ID + '" and in_out_id="' + M_INOUT_ID + '"';
		else
			sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="' + M_InOutLine_ID + '" and insp_line="' + X_INSTRUCTIONLINE_ID + '"';
        tx.executeSql(sqlQuery, [], function (tx, results) {
            imagelistarray = results;
            fillGalleryForDelete();
        }, function (err) {
            console.log("Error SQL: " + err.code);
        });
    }, errorCB);
    document.getElementById("disp-selGal").innerHTML = "";
}
function getUploadCounts(mInNumber,dlab,InspNumber,callBack,isInsp){
	db.transaction(function (tx) {
		var sqlQuery;
		if(isInsp == 0)
			sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="' + mInNumber + '" and in_out_id="' + InspNumber + '"';
		else
			sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="' + mInNumber + '" and insp_line="' + InspNumber + '"';
        tx.executeSql(sqlQuery, [], function (tx, results) {
            var totImg = results.rows.length;
			if(isInsp == 0)
				sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="' + mInNumber + '" and in_out_id="' + InspNumber + '" and imgUpload="T"';
			else
				sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="' + mInNumber + '" and insp_line="' + InspNumber + '" and imgUpload="T"';
            tx.executeSql(sqlQuery, [], function (tx, results){
				var totImgUpload=results.rows.length;
				callBack(dlab,InspNumber,totImg,totImgUpload,isInsp);
			},function (err) {console.log("Error SQL: " + err.code);});
        }, function (err) {console.log("Error SQL: " + err.code);});
    }, errorCB);
}

function onchangeSuccessState(fileName,imginspline,isInsp){
	db.transaction(function(tx){
		var sqlQuery;
		if(isInsp == 0)
			sqlQuery = 'UPDATE vis_gallery SET imgAttach="T",imgUpload="T" WHERE name="'+fileName+'" and in_out_id="'+imginspline+'"';
		else
			sqlQuery = 'UPDATE vis_gallery SET imgAttach="T",imgUpload="T" WHERE name="'+fileName+'" and insp_line="'+imginspline+'"';
		tx.executeSql(sqlQuery);
	}, errorCB);
}

function onchangeFailerState(failerMsgArray,imginspline,isInsp){
	if(failerMsgArray[1].substring(0,1) == "2")
	{
		db.transaction(function (tx){
			var sqlQuery;
			if(isInsp == 0)
				sqlQuery = 'UPDATE vis_gallery SET imgUpload="F",imgAttach="F" WHERE name="'+failerMsgArray[0]+'" and in_out_id="'+imginspline+'"';
			else
				sqlQuery = 'UPDATE vis_gallery SET imgUpload="F",imgAttach="F" WHERE name="'+failerMsgArray[0]+'" and insp_line="'+imginspline+'"';
			tx.executeSql(sqlQuery);
		}, errorCB);
	}else{
		db.transaction(function (tx){
			var sqlQuery;
			if(isInsp == 0)
				sqlQuery = 'UPDATE vis_gallery SET imgAttach="F",imgAttach="F" WHERE name="'+failerMsgArray[0]+'" and in_out_id="'+imginspline+'"'; 
			else
				sqlQuery = 'UPDATE vis_gallery SET imgAttach="F",imgAttach="F" WHERE name="'+failerMsgArray[0]+'" and insp_line="'+imginspline+'"';
			tx.executeSql(sqlQuery);
		}, errorCB);
	}
}

function onRemoveOtherFiles(tmpfile){
	db.transaction(function (tx) {
		var sqlQuery;
		if(X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null)
			sqlQuery = 'DELETE FROM vis_gallery WHERE file="' + tmpfile + '" and in_out_id="' + M_INOUT_ID + '"';
		else
			sqlQuery = 'DELETE FROM vis_gallery WHERE file="' + tmpfile + '" and insp_line="' + X_INSTRUCTIONLINE_ID + '"';
        tx.executeSql(sqlQuery);
    }, errorCB, function(){
		deleteCount=deleteCount-1;
		varifyAllDelete();
    });
}