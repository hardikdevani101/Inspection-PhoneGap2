var releaseVersion='Version : 1.0.10';
var releaseDate='Release Date : JULY 2 2014';
var applicationName='VISion Application';
function onAboutUs(){
	document.getElementById('aboutUs').innerHTML="";
	var br = document.createElement('br');
	var versionDiv=document.createElement("H4");
	var realeseDateDiv=document.createElement("H4");
	var appNameDiv=document.createElement("H2");
	appNameDiv.innerHTML=applicationName;
	versionDiv.innerHTML=releaseVersion;
	realeseDateDiv.innerHTML=releaseDate;
	document.getElementById('aboutUs').appendChild(appNameDiv);
	document.getElementById('aboutUs').appendChild(versionDiv);
	document.getElementById('aboutUs').appendChild(realeseDateDiv);
	document.getElementById('aboutUs').appendChild(br);
	var buttonnode= document.createElement('input');
	buttonnode.setAttribute('type','button');
	buttonnode.setAttribute('value','Back');
	buttonnode.className="login_btns";
	document.getElementById('aboutUs').appendChild(buttonnode);
	buttonnode.setAttribute('OnClick',"onBackLogin()");
	loadPage("aboutUs");
}
function onBackLogin(){
	loadPage("login");
    document.getElementById("txt_user").value = userName;
}