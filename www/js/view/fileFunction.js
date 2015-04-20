var root;
var dirVISInspection;
var currentDir;
var parlistArray;
var dirVISInspectionFTP;
var isGalleryLoad = true;
var DataTypes = [ "JPEG", "JPG", "BMP", "PNG", "GIF" ];

var FileFunction = function() {
}

var fileFunction = new FileFunction()
{
}

FileFunction.prototype.setRootDirectory = function(fileSystem) {
	root = fileSystem.root;
	root.getDirectory("VIS_Inspection", {
		create : true
	}, fileFunction.setVISDirectory, dirFail);
}

FileFunction.prototype.setVISDirectory = function(fileSystem) {
	dirVISInspection = fileSystem;
	dirVISInspection.getDirectory("VIS_FTP", {
		create : true
	}, fileFunction.setVISFTPDirectory, dirFail);
}

FileFunction.prototype.setVISFTPDirectory = function(fileSystem) {
	dirVISInspectionFTP = fileSystem;
}

FileFunction.prototype.saveImage = function(imageURI) {
	var date = new Date;
	var sec = date.getSeconds();
	var mi = date.getMinutes();
	var hh = date.getHours();
	var yy = date.getFullYear();
	var mm = date.getMonth() + 1;
	var dd = date.getDate();
	var fileName = $('.photoPrefix:last').text() + "_" + mm + dd + yy + "_"
			+ hh + mi + sec + ".jpg";
	dirVISInspection.getFile(fileName, {
		create : true,
		exclusive : false
	}, function(fileEntry) {
		fileFunction.createImgWriter(fileEntry, imageURI);
	}, fileFunction.dirFail);
}

FileFunction.prototype.createImgWriter = function(fileEntry, imageURI) {
	var fileFullPath = getSDPath(fileEntry.fullPath).substring(1);
	fileEntry.createWriter(function(writer) {
		fileFunction
				.OnImgWriter(writer, fileFullPath, fileEntry.name, imageURI);
	}, fileFunction.dirFail);
}

FileFunction.prototype.OnImgWriter = function(writer, fileFullPath, fileName,
		imageURI) {
	writer.onwrite = function(evt) {
		dbf.onAddImageEntry();
		ftpFunction.checkIsPendingEditing();
	};
	writer.write(imageURI);
}

FileFunction.prototype.onAfterSaveFile = function(fileFullPath, callBack) {
	if (galleryTable != "" && galleryTable != null) {
		document.getElementById("disp-tab1").innerHTML = galleryTable;
		db.transaction(function(tx) {
			var sqlQuery;
			if (X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null)
				sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
						+ M_InOutLine_ID + '" and in_out_id="' + M_INOUT_ID
						+ '"';
			else
				sqlQuery = 'SELECT * FROM vis_gallery WHERE mr_line="'
						+ M_InOutLine_ID + '" and insp_line="'
						+ X_INSTRUCTIONLINE_ID + '"';
			tx.executeSql(sqlQuery, [], function(tx, results) {
				imagelistarray = results;
				if (totColumns < results.rows.length) {
					var colNum = Math.ceil(imagelistarray.rows.length / 3);
					colNum = colNum - 1;
					for ( var j = 0; j < 3; j++) {
						var tr = document.getElementById("tr-" + j);
						var td = document.createElement('td');
						td.setAttribute("id", "td-" + j + "-" + colNum);
						td.setAttribute("style", "margin:0px; padding:0px;");
						tr.appendChild(td);
						totColumns = totColumns + 1;
					}
				}
				galleryTable = document.getElementById("disp-tab1").innerHTML;
				fileFunction.fillSingleTD(fileFullPath, callBack);
			}, fileFunction.dirFail);
		}, fileFunction.dirFail);
	} else {
		if (X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null)
			fileFunction.onUploadFile(fileFullPath, M_INOUT_ID, callBack);
		else
			fileFunction.onUploadFile(fileFullPath, X_INSTRUCTIONLINE_ID,
					callBack);
	}
}

FileFunction.prototype.fillSingleTD = function(fileFullPath, callBack) {
	document.getElementById("disp-tab1").innerHTML = galleryTable;
	if (DataTypes
			.indexOf(getExtention(getFileName(fileFullPath)).toUpperCase()) >= 0) {
		root
				.getFile(
						fileFullPath,
						null,
						function(FnEntries) {
							FnEntries
									.file(
											function(rfile) {
												var reader = new FileReader();
												reader.onloadend = function(evt) {
													var imgelem = document
															.createElement("img");
													imgelem
															.setAttribute(
																	"height",
																	(window.innerHeight * .27)
																			+ "px");
													imgelem
															.setAttribute(
																	"width",
																	(window.innerHeight * .36)
																			+ "px");
													imgelem
															.setAttribute(
																	"style",
																	"margin:3px 5px; float:left;");
													imgelem.setAttribute("src",
															evt.target.result);
													if (Disp_row > 2) {
														Disp_row = 0;
														Disp_col = Disp_col + 1;
													}

													var chkImg = document
															.createElement("img");
													chkImg
															.setAttribute(
																	"style",
																	"position:absolute;height:35px;width:35px;display:none;");
													chkImg.setAttribute("src",
															"img/up.png");
													chkImg.setAttribute("id",
															"tdUpload-"
																	+ Disp_row
																	+ "-"
																	+ Disp_col);
													if (document
															.getElementById("td-"
																	+ Disp_row
																	+ "-"
																	+ Disp_col)) {
														document
																.getElementById(
																		"td-"
																				+ Disp_row
																				+ "-"
																				+ Disp_col)
																.appendChild(
																		chkImg);
														pandingUploads[pandingCounts] = new Array();
														pandingUploads[pandingCounts][0] = "tdUpload-"
																+ Disp_row
																+ "-"
																+ Disp_col;
														pandingUploads[pandingCounts++][1] = getFileName(fileFullPath);
														document
																.getElementById(
																		"td-"
																				+ Disp_row
																				+ "-"
																				+ Disp_col)
																.appendChild(
																		imgelem);
														itemCount = itemCount + 1;
														Disp_row = Disp_row + 1;
														galleryTable = document
																.getElementById("disp-tab1").innerHTML;
													} else {
														console
																.log("Col not found.>>>>"
																		+ "td-"
																		+ Disp_row
																		+ "-"
																		+ Disp_col);
													}

												};
												reader.readAsDataURL(rfile);
											}, function() {
											});
						}, function(error) {
							console.log(" FSError = " + error.code);
							onStopNotification();
						});
	} else {
		var imgelem = document.createElement("div");
		imgelem
				.setAttribute("style",
						"margin:3px 5px; border:1px solid #000;float:left; word-wrap:break-word;");
		imgelem.style.width = (window.innerHeight * .36) + "px";
		imgelem.style.height = (window.innerHeight * .27) + "px";
		imgelem.innerHTML = getFileName(fileFullPath);
		if (Disp_row > 2) {
			Disp_row = 0;
			Disp_col = Disp_col + 1;
		}

		var chkImg = document.createElement("img");
		chkImg.setAttribute("style",
				"position:absolute;height:35px;width:35px;display:none;");
		chkImg.setAttribute("src", "img/up.png");
		chkImg.setAttribute("id", "tdUpload-" + Disp_row + "-" + Disp_col);
		document.getElementById("td-" + Disp_row + "-" + Disp_col).appendChild(
				chkImg);

		pandingUploads[pandingCounts] = new Array();
		pandingUploads[pandingCounts][0] = "tdUpload-" + Disp_row + "-"
				+ Disp_col;
		pandingUploads[pandingCounts++][1] = getFileName(fileFullPath);
		document.getElementById("td-" + Disp_row + "-" + Disp_col).appendChild(
				imgelem);
		itemCount = itemCount + 1;
		Disp_row = Disp_row + 1;
		galleryTable = document.getElementById("disp-tab1").innerHTML;
	}
	if (X_INSTRUCTIONLINE_ID == 0 || X_INSTRUCTIONLINE_ID == null)
		fileFunction.onUploadFile(fileFullPath, M_INOUT_ID, callBack);
	else
		fileFunction.onUploadFile(fileFullPath, X_INSTRUCTIONLINE_ID, callBack);
}

FileFunction.prototype.dirFail = function(error) {
	console.log(" FSError = " + error);
}

FileFunction.prototype.onUploadFile = function(filePath, InspNumber, callBack) {
	root.getFile(filePath, null, SingleFileSuccess, fileFunction.dirFail);

	function SingleFileSuccess(FnEntries) {
		var ft = new FileTransfer();
		var options = new FileUploadOptions();
		options.fileKey = "file";
		options.fileName = FnEntries.name;
		ft
				.upload(
						FnEntries.toURL(),
						encodeURI(vis_url + "/VISService/fileUpload"),
						function(result) {
							var xmlResponse = result.response;
							var oldFileName = $(xmlResponse).find('oldName')
									.text().trim();
							var newFileName = $(xmlResponse).find('newName')
									.text().trim();

							fileName = getFileName(getSDPath(FnEntries.fullPath));
							db
									.transaction(
											function(tx) {
												var sqlQuery;

												if (oldFileName != newFileName) {
													if (X_INSTRUCTIONLINE_ID == 0
															|| X_INSTRUCTIONLINE_ID == null)
														sqlQuery = 'UPDATE vis_gallery SET imgUpload="T",name="'
																+ newFileName
																+ '" WHERE file="'
																+ filePath
																+ '" and in_out_id="'
																+ InspNumber
																+ '"';
													else
														sqlQuery = 'UPDATE vis_gallery SET imgUpload="T",name="'
																+ newFileName
																+ '" WHERE file="'
																+ filePath
																+ '" and insp_line="'
																+ InspNumber
																+ '"';
												} else {
													if (X_INSTRUCTIONLINE_ID == 0
															|| X_INSTRUCTIONLINE_ID == null)
														sqlQuery = 'UPDATE vis_gallery SET imgUpload="T" WHERE file="'
																+ filePath
																+ '" and in_out_id="'
																+ InspNumber
																+ '"';
													else
														sqlQuery = 'UPDATE vis_gallery SET imgUpload="T" WHERE file="'
																+ filePath
																+ '" and insp_line="'
																+ InspNumber
																+ '"';
												}
												tx.executeSql(sqlQuery);
											},
											errorCB,
											function() {
												fileFunction
														.setUploadedImg(FnEntries.name);
												imgUploadCount = imgUploadCount - 1;
												if (callBack
														&& imgUploadCount == 0)
													callBack();
											});
						}, uploadFail, options);
	}
}

FileFunction.prototype.setUploadedImg = function(fileName) {
	for ( var i = 0; i < pandingUploads.length; i++) {
		if (pandingUploads[i][1] == fileName) {
			var tdDiv = document.getElementById(pandingUploads[i][0]);
			if (tdDiv != null)
				tdDiv
						.setAttribute("style",
								"position:absolute;height:35px;width:35px;display:block;");
		}
	}
	galleryTable = document.getElementById("disp-tab1").innerHTML;
}

FileFunction.prototype.uploadFail = function(error) {
	console.log("Error = " + error.code);
	navigator.notification.alert('All files not uploaded', function() {
	}, 'Failure', 'OK');
	onStopNotification();
}

FileFunction.prototype.fileexplore = function() {
	parlistArray = [];
	parlistArray.push(root);
	fileFunction.listDir(root);
}
FileFunction.prototype.backFile = function() {
	var tmppar = parlistArray.pop();
	fileFunction.listDir(tmppar);
}
FileFunction.prototype.listDir = function(DirEntry) {
	if (!DirEntry.isDirectory)
		console.log('listDir incorrect type');
	currentDir = DirEntry;

	var DirReader = DirEntry.createReader();
	DirReader.readEntries(function(entries) {
		var dirContent = $('#dirContent');
		dirContent.empty();
		var dirArr = new Array();
		var fileArr = new Array();
		var div = document.createElement('div');
		div.innerHTML = DirEntry.name + ".....";
		dirContent.append(div);
		for ( var i = 0; i < entries.length; ++i) { // sort entries
			var entry = entries[i];
			var div = document.createElement('div');
			if (entry.isDirectory && entry.name[0] != '.') {
				div.className = "folder";
				var tmpstr = "listsub('" + entry.name + "')";
				div.setAttribute('onclick', tmpstr);
				div.innerHTML = entry.name;
			} else if (entry.isFile && entry.name[0] != '.') {
				div.className = "file";
				var tmpstr = "onFileExplorerClick('" + entry.fullPath + "')";
				div.setAttribute('onclick', tmpstr);
				div.innerHTML = entry.name;
			}
			dirContent.append(div);
		}

	}, function(error) {
		console.log('listDir readEntries error: ' + error.code);
	});
}

FileFunction.prototype.listsub = function(DirName) {
	parlistArray.push(currentDir);
	currentDir.getDirectory(DirName, null, function(dir) {
		listDir(dir);
	}, function(error) {
		console.log("Error = " + error.code);
	});
	currentDir = null;
}

FileFunction.prototype.onReadFileDataUrl = function(FnEntries, ItemNumber,
		callBack) {
	FnEntries.file(function(rfile) {
		var reader = new FileReader();
		reader.onloadend = function(evt) {
			callBack(evt, ItemNumber, rfile);
		};
		reader.readAsDataURL(rfile);
	}, function() {
	});
}

FileFunction.prototype.onImgFileSystem = function(FnEntries) {
	FnEntries.file(gotGalleryImg, function() {
	});
	function gotGalleryImg(rfile) {
		var reader = new FileReader();
		reader.onloadend = function(evt) {
			onCropCall(evt.target.result);
		};
		reader.readAsDataURL(rfile);
	}
}

FileFunction.prototype.getSDPath = function(Fname) {
	var tmpArray = Fname.split('mnt/sdcard');
	return tmpArray.pop();
}

FileFunction.prototype.getExtention = function(Fname) {
	var tmpArray = Fname.split('.');
	return tmpArray.pop();
}