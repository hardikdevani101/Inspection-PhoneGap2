var releaseVersion='Version : 1.0.8';
var releaseDate='Release Date : 24-6-2014';
var applicationName='VISion Application';
function onAboutUs(){
	var versionDiv=document.getElementById('appVersion');
	var realeseDateDiv=document.getElementById('appRelease')
	var appNameDiv=document.getElementById('appName')
	appNameDiv.innerHTML=applicationName;
	versionDiv.innerHTML=releaseVersion;
	realeseDateDiv.innerHTML=releaseDate;
	loadPage("aboutUs");
}
function onBackLogin(){
	loadPage("login");
    document.getElementById("txt_user").value = userName;
}