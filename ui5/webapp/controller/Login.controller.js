sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"sap/m/MessageToast",
		"sap/ui/model/json/JSONModel",
		"ui5ns/ui5/model/Constants"
	],
	function (BaseController, MessageToast, JSONModel, Constants) {
		"use strict";
		
		return BaseController.extend("ui5ns.ui5.controller.Login", {

			onInit: function () {
				var that = this;
				
				if (!this.isIFrame()) {
					this.byId("loginForm").setVisible(true);	
					
					fetch(Constants.urlBackend + "verifica-auth", {
							credentials: 'include'
						})
						.then((res) => {
							res.json()
								.then((response) => {
									if (response.success) {
										if (!that.isIFrame()) {
											MessageToast.show(response.msg);
										}
										this.getRouter().navTo("selecaoModulo");
									}
								})
						});
				}
				else {
					this.getRouter().navTo("selecaoModulo");
				}
				
				this.getRouter().getRoute("login").attachPatternMatched(this._onRouteMatched, this);	
			},

			onLogin: function () {
				//this.getRouter().navTo("selecaoModulo");

				fetch(Constants.urlBackend + "login", {
						method: "POST",
						headers: {
							Accept: "application/json",
							"Content-type": "application/json"
						},
						credentials: 'include',
						body: JSON.stringify({
							usuario: this.byId("inputUsuario").getValue(),
							senha: this.byId("inputSenha").getValue()
						})
					})
					.then((r) => {
						r.json()
							.then((response) => {
								if (response.success) {
									this.byId("inputUsuario").setValue("");
									this.byId("inputSenha").setValue("");
									
									MessageToast.show(response.msg);
									this.getRouter().navTo("selecaoModulo");
								} else {
									MessageToast.show(response.error.msg);
								}
							})
							.catch((err) => {
								MessageToast.show(err);
							})
					})
					.catch((err) => {
						MessageToast.show(err);
					});
			},

			onLanguageChange: function (oEvent) {},
			_onRouteMatched: function(){
			    var that = this;
				this.byId("inputSenha").onsapenter = function(e) {that.byId("buttonLogin").firePress()};
				this.byId("inputUsuario").onsapenter = function(e) {that.byId("buttonLogin").firePress()};
			}
		});
	}
);