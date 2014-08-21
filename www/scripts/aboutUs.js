var releaseVersion='Version : 1.0.14';
var releaseDate='Release Date : AUG 21 2014';
var applicationName='VISion - VIS Mobile Inspection';

function onAboutUs() {
	document.getElementById('visAppName').innerHTML=applicationName;
	document.getElementById('visAppVersion').innerHTML=releaseVersion;
	document.getElementById('visAppRelease').innerHTML=releaseDate;
	loadPage("aboutUs");
}

function onBackLogin() {
    loadPage("login");
    document.getElementById("txt_user").value = userName;
}