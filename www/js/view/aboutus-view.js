var AboutUsPage = function(app,event) {
	this.releaseVersion = "1.0.16";
	this.releaseDate = 'Release Date : SEP 11 2014';
	this.applicationName = 'VISion Application';
	this.event=event;
	this.app=app;
}

AboutUsPage.prototype.init = function() {
	$('#visAppName').innerHTML = this.applicationName;
	$('#visAppVersion').innerHTML = 'Version : '
			+ this.releaseVersion;
	$('#visAppRelease').innerHTML = this.releaseDate;
}