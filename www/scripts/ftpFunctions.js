function ftpExplorer(currentFtpDir)
{
	loadPage('ftpExplorer');
	if(typeof currentFtpDir === 'undefined')
		{
			parlistArray=[];
		}
	else if(currentFtpDir == '-')
		{
			parlistArray.pop();
		}
	else
		{
			parlistArray.push(currentFtpDir);
		}
	var tmpParList = parlistArray.toString().split(',');
	var urlPath = tmpParList.join('/');
	window.plugins.ftpclient.filelist(vis_FtpUrl+"/"+urlPath, function(AllList){
		var mainDiv = document.getElementById("ftpFileContent");
		mainDiv.innerHTML = "";
		var fileList = AllList[0]["fileNames"];
		var dirList = AllList[0]["directory"];
		
		for(var j = 0 ; j < dirList.length ; j++)
			{
				var label= document.createElement("div");
				label.style.lineHeight="30px";
				var img = document.createElement('img');
			    img.src = "img/folder.jpg";
			    img.height = 25;
			    img.width = 25;
			    img.style.margin = "2px 0px";
			    label.appendChild(img);
				var description = document.createTextNode(dirList[j]);
				label.appendChild(description);
				var clkStr = "ftpExplorer('"+dirList[j]+"')";
				label.setAttribute('onclick',clkStr);
				mainDiv.appendChild(label);
			}
		for(var i = 0 ; i < fileList.length ; i++)
			{
				var label= document.createElement("div");
				label.style.lineHeight="30px";
				var description = document.createTextNode(fileList[i]);
				var checkbox = document.createElement("input");
				checkbox.type = "checkbox"; 
				checkbox.name = "slctFtpFile[]";
				checkbox.value = fileList[i]; 
				checkbox.className = "ftpchk" ;
				checkbox.setAttribute("style","width:30px !important; height:30px !important;");
				checkbox.width = 50;
				checkbox.style.width = "50px";
				label.appendChild(checkbox);
				label.appendChild(description);
				mainDiv.appendChild(label);
			}
	}, ftpfail);
}



function ftpfail(){
	navigator.notification.alert('FTP Connection failed', function () {}, 'Failer', 'OK');
}

function onFinishFtpSelection()
{
	var selectChkList = [] ;
	document.getElementsByName('slctFtpFile[]');
	$(".ftpchk:checked").each(function() {
		selectChkList.push($(this).val());
	});
	if(selectChkList.length == 0)
		{
			backtogallary();
		}
	else if(selectChkList.length == 1)
		{
			onSingleFTPFileSelect(selectChkList[0]);
		}
	else if(selectChkList.length > 1)
		{
			downloadFTPFile(selectChkList);
		}
}

function onSingleFTPFileSelect(FtpFileName){
	window.plugins.ftpclient.get(dirVISInspectionFTP.fullPath +"/"+FtpFileName, vis_FtpUrl + FtpFileName, function(){
		onFileExplorerClick(dirVISInspectionFTP.fullPath +"/"+FtpFileName);
	}, function(){
		console.log("File not downloaded from ftp");
	});
}

function downloadFTPFile(selectChkList){
	navigator.notification.activityStart("Please Wait", "Uploading files...");
	var FtpFileName = selectChkList.shift();
	window.plugins.ftpclient.get(dirVISInspectionFTP.fullPath +"/"+FtpFileName, vis_FtpUrl + FtpFileName, function(){
		 root.getFile(dirVISInspectionFTP.fullPath.substring(1) +"/"+FtpFileName, null, function(entry){
			var fileFullPath=getSDPath(entry.fullPath).substring(2);
			var fileName=getFileName(fileFullPath);
			 db.transaction(function (tx){
					var sqlQuery;
					if(X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null)
						sqlQuery ='INSERT INTO vis_gallery(mr_line,in_out_id,name,file) VALUES ("'+M_InOutLine_ID+'","'+M_INOUT_ID+'","'+fileName+'","'+fileFullPath+'")';
					else
						sqlQuery ='INSERT INTO vis_gallery(mr_line,insp_line,name,file) VALUES ("'+M_InOutLine_ID+'","'+X_INSTRUCTIONLINE_ID+'","'+fileName+'","'+fileFullPath+'")';
					tx.executeSql(sqlQuery);
				}, errorCB,function(){
					onAfterSaveFile(fileFullPath);
					if(selectChkList.length > 0)
						{
							downloadFTPFile(selectChkList);
						}
				});
		 }, function (error) {
		        console.log(" FSError = " + error.code);
		    });
	}, function(){
		console.log("File not downloaded from ftp");
	});
}