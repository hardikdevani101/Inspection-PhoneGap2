var FileUtils = function(app) {
	this.app = app;
	this.root = '';
	this.dirVISInspection = '';
	this.currentDir = '';
	this.parlistArray = [];
	this.dirVISInspectionFTP = '';
	this.isGalleryLoad = true;
	this.DataTypes = [ "JPEG", "JPG", "BMP", "PNG", "GIF" ];
}

FileUtils.prototype.onInitFs = function(fileSystem) {
	console.log("onInitFs");
	var _self = this;
	this.root = fileSystem.root;
	this.root.getDirectory("VIS_Inspection", {
		create : true
	}, _self.setVISDirectory, _self.dirFail);
}

FileUtils.prototype.setVISDirectory = function(fileSystem) {
	console.log("setVISDirectory");
	var _self = this;
	this.dirVISInspection = fileSystem;
	this.dirVISInspection.getDirectory("VIS_FTP", {
		create : true
	}, _self.setVISFTPDirectory, _self.dirFail);
}

FileUtils.prototype.setVISFTPDirectory = function(fileSystem) {
	console.log("setVISFTPDirectory");
	this.dirVISInspectionFTP = fileSystem;
}

FileUtils.prototype.saveImage = function(imageURI) {
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
		FileUtils.createImgWriter(fileEntry, imageURI);
	}, FileUtils.dirFail);
}

FileUtils.prototype.createImgWriter = function(fileEntry, imageURI) {
	var fileFullPath = getSDPath(fileEntry.fullPath).substring(1);
	fileEntry.createWriter(function(writer) {
		FileUtils.OnImgWriter(writer, fileFullPath, fileEntry.name, imageURI);
	}, FileUtils.dirFail);
}

FileUtils.prototype.OnImgWriter = function(writer, fileFullPath, fileName,
		imageURI) {
	writer.onwrite = function(evt) {
		dbf.onAddImageEntry();
		ftpFunction.checkIsPendingEditing();
	};
	writer.write(imageURI);
}

FileUtils.prototype.afterSaveFile = function(fileinfo, callBack) {
	if (galleryTable != "" && galleryTable != null) {
		$("$disp-tab1").innerHTML = galleryTable;
		var error = FileUtils.dirFail
		var success = function(tx, results) {
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
			galleryTable = $("#disp-tab1").innerHTML;
			FileUtils.fillSingleTD(fileFullPath, callBack);
		};

		var visgallery = new Tbl_VISGallery(this.app);
		if (fileinfo.X_INSTRUCTIONLINE_ID == 0
				|| fileinfo.X_INSTRUCTIONLINE_ID == null) {
			visgallery.getFilesByMRInfo(fileinfo, success, error);

		} else {
			visgallery.getFilesByInspInfo(fileinfo, success, error)
		}
	} else {
		if (fileinfo.X_INSTRUCTIONLINE_ID == 0
				|| fileinfo.X_INSTRUCTIONLINE_ID == null)
			FileUtils.onUploadFile(fileinfo.fileFullPath, M_INOUT_ID, callBack);
		else
			FileUtils.onUploadFile(fileinfo.fileFullPath, X_INSTRUCTIONLINE_ID,
					callBack);
	}
}

FileUtils.prototype.fillSingleTD = function(fileFullPath, callBack) {
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
		FileUtils.onUploadFile(fileFullPath, M_INOUT_ID, callBack);
	else
		FileUtils.onUploadFile(fileFullPath, X_INSTRUCTIONLINE_ID, callBack);
}

FileUtils.prototype.dirFail = function(error) {
	console.log(" FSError = " + error);
}

FileUtils.prototype.onUploadFile = function(filePath, InspNumber, callBack) {
	root.getFile(filePath, null, SingleFileSuccess, FileUtils.dirFail);

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
												FileUtils
														.setUploadedImg(FnEntries.name);
												imgUploadCount = imgUploadCount - 1;
												if (callBack
														&& imgUploadCount == 0)
													callBack();
											});
						}, uploadFail, options);
	}
}

FileUtils.prototype.setUploadedImg = function(fileName) {
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

FileUtils.prototype.uploadFail = function(error) {
	console.log("Error = " + error.code);
	navigator.notification.alert('All files not uploaded', function() {
	}, 'Failure', 'OK');
	onStopNotification();
}

FileUtils.prototype.fileexplore = function() {
	parlistArray = [];
	parlistArray.push(root);
	FileUtils.listDir(root);
}
FileUtils.prototype.backFile = function() {
	var tmppar = parlistArray.pop();
	FileUtils.listDir(tmppar);
}
FileUtils.prototype.listDir = function(DirEntry) {
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

FileUtils.prototype.listsub = function(DirName) {
	parlistArray.push(currentDir);
	currentDir.getDirectory(DirName, null, function(dir) {
		listDir(dir);
	}, function(error) {
		console.log("Error = " + error.code);
	});
	currentDir = null;
}

FileUtils.prototype.onReadFileDataUrl = function(FnEntries, ItemNumber,
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

FileUtils.prototype.onImgFileSystem = function(FnEntries) {
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

FileUtils.prototype.getSDPath = function(Fname) {
	var tmpArray = Fname.split('mnt/sdcard');
	return tmpArray.pop();
}

FileUtils.prototype.getExtention = function(Fname) {
	var tmpArray = Fname.split('.');
	return tmpArray.pop();
}