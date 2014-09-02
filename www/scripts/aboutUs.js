var releaseVersion='Version : 1.1.1';
var releaseDate='Release Date : SEP 02 2014';
var applicationName='VISion - VIS Mobile Inspection';
var applicationPublisher='Velocity Electronics, L.P.';

function onAboutUs() {
	$('#visAppName').html(applicationName);
	$('#visAppVersion').html(releaseVersion);
	$('#visAppRelease').html(releaseDate);
    $('#visAppPublisher').html(applicationPublisher);
	loadPage("aboutUs");
}

function onBackLogin() {
    loadPage("login");
    $("#txt_user").val(userName);
}