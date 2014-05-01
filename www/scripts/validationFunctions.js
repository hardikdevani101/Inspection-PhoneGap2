function validateLogin(){
	var u_name=document.getElementById("txt_user").value;
	var u_pass=document.getElementById("txt_password").value;
	if(u_name=="" || u_name==null)
	{
		document.getElementById("login_error").innerHTML="Username Should Not Blank";
		document.getElementById("txt_user").focus();
	}else if(u_pass=="" || u_pass==null){
	
		document.getElementById("login_error").innerHTML="Password Should Not Blank";
		document.getElementById("txt_password").focus();
	}else{
		userName = u_name;
		vis_pass = u_pass;
		onLogin();
	}
}
function validationSetting(){
	var url=document.getElementById("txt_url");
	var lang=document.getElementById("txt_lang");
	var client=document.getElementById("txt_client");
	var role=document.getElementById("txt_role");
	var whouse=document.getElementById("txt_warehouse");
	var org=document.getElementById("txt_organizer");
	
	if(url.value=="" || url.value==null){
		loadPage("setting");
		setValSetting();
		document.getElementById("setting_error").innerHTML="URL Should Not Blank";
		url.focus();
	}else if(lang.value=="" || lang.value==null){
		loadPage("setting");
		setValSetting();
		document.getElementById("setting_error").innerHTML="Language Should Not Blank";
		lang.focus();
	}else if(client.value=="" || client.value==null){
		loadPage("setting");
		setValSetting();
		document.getElementById("setting_error").innerHTML="Client Should Not Blank";
		client.focus();
	}else if(role.value=="" || role.value==null){
		loadPage("setting");
		setValSetting();
		document.getElementById("setting_error").innerHTML="Role Should Not Blank";
		role.focus();
	}else if(whouse.value=="" || whouse.value==null){
		loadPage("setting");
		setValSetting();
		document.getElementById("setting_error").innerHTML="Warehouse Should Not Blank";
		whouse.focus();
	}else if(org.value=="" || org.value==null){
		loadPage("setting");
		setValSetting();
		document.getElementById("setting_error").innerHTML="Organizor Should Not Blank";
		lang.focus();
	}else{
		onSettingUpdate();
	}
	function setValSetting(){
	url.text=url.text;
	lang.text=lang.text;
	client.text=client.text;
	role.text=role.text;
	whouse.text=whouse.text;
	org.text=org.text;
	}
}