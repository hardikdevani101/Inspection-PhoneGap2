
function LoginPage(app) {
	this.pageId = "loginpage";
	this.controller = controller;
};

var loginPage = new LoginPage();

LoginPage.prototype.onLogin=function(){
	
	
	if (loginPage
			.login(this.msg_userID
					.getValue())) {
		var redirectPage = new LoginPage();
		this.app.to(redirectPage.pageId);
	} else {
		alert(commonStaticString._msg_invalid_useridandpassword);
	}
}; 

LoginPage.prototype.init = function() {
	this.app = new sap.m.App("CRM", {});
	this.oShell = new sap.m.Shell("app");
	this.oShell.setLogo("images/logo-sugarcrm.png");
	this.layout = new sap.ui.commons.layout.MatrixLayout({
		id : 'matrix4',
		layoutFixed : true,
		// width : '400px',
		columns : 2,
	// widths : [ '150px', '250px' ]
	});

	this.matrix_row_logo = new sap.ui.commons.layout.MatrixLayoutRow(
			"matrix_logo");
	this.matrix_row_userid = new sap.ui.commons.layout.MatrixLayoutRow(
			"mlr_userID");
	this.matrix_row_password = new sap.ui.commons.layout.MatrixLayoutRow(
			"mlr_password");
	this.matrix_row_button_login = new sap.ui.commons.layout.MatrixLayoutRow(
			"matrix_btn_login");

	this.matrix_cell_userid = new sap.ui.commons.layout.MatrixLayoutCell(
			"mlc_logo");
	this.matrix_cell_password = new sap.ui.commons.layout.MatrixLayoutCell(
			"mlc_password");
	this.matrix_cell_btn_login = new sap.ui.commons.layout.MatrixLayoutCell(
			"matrix_btn_l");

	this.msg_password = new sap.m.Input("inputPassword", {
		type : sap.m.InputType.Password,
		placeholder : 'Enter your password ...'
	});
	this.msg_userID = new sap.m.Input({
		value : "",
		placeholder : "Enter User ID"
	});

	this.matrix_row_logo.addCell(LoginPage.matrix_cell_userid);
	this.matrix_row_password.addCell(LoginPage.matrix_cell_password);
	this.matrix_row_button_login.addCell(LoginPage.matrix_cell_btn_login);

	var _self= this;
	
	this.page = new sap.m.Page(
			"Login_Page",
			{
				title : "Login Page",
				content : [
						this.oMatrix_Login.createRow(this.matrix_cell_userid
								.addContent(this.msg_userID).addStyleClass(
										"center1")),
						this.oMatrix_Login.createRow(this.matrix_cell_password
								.addContent(this.msg_password).addStyleClass(
										"center2")),
						this.oMatrix_Login
								.createRow(this.matrix_cell_btn_login
										.addContent(
												new sap.m.Button(
														{
															icon : "images/login.png",
															press : _self.onLogin(), 
														})).addStyleClass(
												"center_btn_login")), ]
			});

	this.app.addPage(LoginPage.view);
}
