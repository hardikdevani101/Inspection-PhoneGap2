var SettingsPage = function(app,event) {
	this.app=app;
	this.event=event
}

var settingsPage = new SettingsPage();


SettingsPage.prototype.init = function() {
	// Initialize components.
	var _self=this;
	$("#txt_url").val(app.appcache.settings.service_url);
	$("#txt_role").val(app.appcache.settings.role);
	$("#txt_client").val(app.appcache.settings.client_id);
	$("#txt_org").val(app.appcache.settings.org_id);
	$("#txt_warehouse").val(app.appcache.settings.warehouse_id);
	$("#txt_img_quality").val(app.appcache.settings.img_quality);
	$("#txt_lang").val(app.appcache.settings.lang);
	app.appcache.session.M_InOutLine_ID = '';
	
	// Register Event listeners
	$("#txt_org_id").onChange(this.onOrgChange());
	$('#_form_settings').validate({
	    rules: {
	        txt_url: {
	            required: true
	        },
	        txt_lang: {
	            required: true
	        },
	        txt_org: {
	            required: true
	        },
	        txt_role: {
	            required: true
	        },
	        txt_warehouse: {
	            required: true
	        },
	        txt_img_quality: {
	            required: true
	        },
	        txt_client: {
	            required: true
	        }
	    },
	    messages: {
	        txt_url: {
	            required: "Required Field!."
	        },
	        txt_lang: {
	            required: "Required Field!."
	        },
	        txt_org: {
	            required: "Required Field!."
	        },
	        txt_role: {
	            required: "Required Field!."
	        },
	        txt_warehouse: {
	            required: "Required Field!."
	        },
	        txt_img_quality: {
	            required: "Required Field!."
	        },
	        txt_client: {
	            required: "Required Field!."
	        }
	    },
	    errorPlacement: function (error, element) {
	        error.appendTo(element.parent().prev());
	    },
	    submitHandler: function (form) {
	    	_self.onUpdate();
// $(':mobile-pagecontainer').pagecontainer('change', '#success', {
// reload: false
// });
	        return false;
	    }
	});
}


SettingsPage.prototype.onUpdate = function() {
	// $( "#txt_url option:selected" ).text();
	var settingInfo = {};
	settingInfo['service_url']=$( "#txt_url option:selected" ).val();
	settingInfo['lang']=$( "#txt_lang option:selected" ).val();;
	settingInfo['client_id']=$("#txt_client_id option:selected" ).val();
	settingInfo['org_id']=$("#txt_org_id option:selected" ).val();
	settingInfo['warehouse_id']=$("#txt_warehouse_id option:selected" ).val();
	settingInfo['img_quality']=$("#txt_img_quality option:selected" ).val();
	settingInfo['role']=$("#txt_role option:selected" ).val();

	var vissettings = new VIS-Settings(this.app)
	vissettings.update(settingInfo,success,error);
	
	var success = function(){
		app.appCache.updateSettingInfo(settingInfo);
	};
	var error = function(){
		
	};
}

SettingsPage.prototype.onOrgChange = function() {
	$("#txt_warehouse").empty();
	var e = document.getElementById("txt_org");
	var wareHouseDrop = document.getElementById("txt_warehouse");
	var org_id = $("#txt_org").val();
	if (org_id == 0) {
		for (var i = 0; i < app.appcache.warehouseList.length; i++) {
			$("#txt_warehouse").append($("<option></option>").val(app.appcache.warehouseList[i].warehouseid).html(app.appcache.warehouseList[i].name));
		}
	} else {
		for (var i = 0; i < app.appcache.warehouseList.length; i++) {
			var result = $.grep(app.appcache.warehouseList, function(e){ return e.orgid == org_id; });
			for (var i = 0; i < result.length; i++) {
				$("#txt_warehouse").append($("<option></option>").val(result[i].warehouseid).html(result[i].name));
			}
		}
	}
}