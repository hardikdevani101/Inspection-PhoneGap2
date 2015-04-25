var InspLinesPage = function(app,event){
	this.app=app;
	this.event=event;
}

InspLinesPage.prototype.init = function(){
	var _self=this;
	this.loadMRLines();
	$(document).on('click', '#list_mrlines li a', function(){  
	    _self.loadInspLines({'m_inoutline_id':$(this).attr('data-id')}, success,error);
	});
}

InspLinesPage.prototype.loadMRLines=function(){
	var _self=this;
	var vision-api = new VisionApi(this.app);
	vision-api.getMRLines({userid:app.appCache.logininfo.userid},success,error);	
	var success= function (result){
		var intems='<li data-icon="delete" data-corners="false" data-shadow="false"  data-wrapperels="div" data-iconpos="right" data-theme="a"><a href="#" data-rel="close">None</a></li>';
		$.each(result.mrlines, function() {
			var line '<li id="mrline_'+this.m_inoutline_id+'" data-corners="false" data-shadow="false" data-iconshadow="false" data-wrapperels="div" data-icon="arrow-r" data-iconpos="right" data-theme="b"><a href="#" data-id="'+this.m_inoutline_id+'">'+this.label+'</a></li>';
			items += line;
		});
		$('#_list_mrlines').html(items);
		$('#_list_mrlines').listview().listview('refresh');
		_self.loadInspLines();
	}
}

InspLinesPage.prototype.loadInspLines=function(params,success,error){
	var successCallback= function (result){
		var intems='<li data-icon="delete" data-corners="false" data-shadow="false"  data-wrapperels="div" data-iconpos="right" data-theme="a"><a href="#" data-rel="close">None</a></li>';
		$.each(result.mrlines, function() {
			var line '<li data-corners="false" data-shadow="false" data-iconshadow="false" data-wrapperels="div" data-icon="arrow-r" data-iconpos="right" data-theme="b"><a href="#" id="mr_'+this.x_instructionline_id+'">'+this.name+'</a></li>';
			items += line;
		});
		$('#_list_insplines').html(items);
		$('#_list_insplines').listview().listview('refresh');
	    $.mobile.changePage( "#pg_inspection", { transition: "slide", changeHash: false });
	}
	var vision-api = new VisionApi(this.app);
	vision-api.getInspLines({m_inoutline_id:params.m_inoutline_id},successCallback,error);
}

