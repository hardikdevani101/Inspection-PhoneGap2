var releaseVersion='Version : 1.0.16';
var releaseDate='Release Date : SEP 11 2014';
var applicationName='VISion Application';
function onAboutUs(){
	document.getElementById('visAppName').innerHTML=applicationName;
	document.getElementById('visAppVersion').innerHTML=releaseVersion;
	document.getElementById('visAppRelease').innerHTML=releaseDate;
	loadPage("aboutUs");
}
function onBackLogin(){
	loadPage("login");
    document.getElementById("txt_user").value = userName;
}