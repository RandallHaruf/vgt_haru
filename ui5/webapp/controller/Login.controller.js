sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"sap/m/MessageToast",
		"sap/ui/model/json/JSONModel"
	], 
	function (BaseController, MessageToast, JSONModel) {
		"use strict";
		
		return BaseController.extend("ui5ns.ui5.controller.Login", {
			
			onLogin: function () {
				this.getRouter().navTo("selecaoModulo");
				/*
				jQuery.ajax("/VALECS/p2000426116trial/hana01/valecs/xsjs/login_auth.xsjs", {
					type: "GET",
					data: {
						user: that.byId("inputUsuario").getValue(),
						password: that.byId("inputSenha").getValue()
					},
					success: function (response) {
						var oResponse = $.parseJSON(response);
						
						MessageToast.show(oResponse.message);
						if (oResponse.success) {
							that.getRouter().navTo("moduleOverview");
						}
					},
					error: function (error) {
						MessageToast.show("Request Error");
					}
				});*/
			},
			
			onLanguageChange: function (oEvent) {
			}
		});
	}
);