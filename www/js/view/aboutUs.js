var AboutUs = function() {
	this.releaseVersion = "1.0.16";
	this.releaseDate = 'Release Date : SEP 11 2014';
	this.applicationName = 'VISion Application';
}
var about = new AboutUs()
{
}

AboutUs.prototype.onAboutUs = function() {
	document.getElementById('visAppName').innerHTML = this.applicationName;
	document.getElementById('visAppVersion').innerHTML = 'Version : '
			+ this.releaseVersion;
	document.getElementById('visAppRelease').innerHTML = this.releaseDate;
	app.loadPage("aboutUs");
}

AboutUs.prototype.onBackLogin = function() {
	app.loadPage("login");
	document.getElementById("txt_user").value = userName;
}