sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"ui5ns/ui5/model/Constants"
	], 
	function (Controller, Constants) {
		"use strict";

		return Controller.extend("vale.Compliance.controller.BaseController", {
			
			onInit: function () {
				alert("oi");
			},
			
			getRouter : function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},
			
			getModel : function (sName) {
				return this.getView().getModel(sName);
			},
			
			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},
			
			getResourceBundle : function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			isIFrame: function () {
				return self !== top;		
			},
			
			setBusy: function (oComponent, bBusy) {
				if (bBusy) {
					oComponent.setBusyIndicatorDelay(100);
				}
				oComponent.setBusy(bBusy);
			},
			
			toURIComponent: function (oParam) {
				return encodeURIComponent(JSON.stringify(oParam));
			},
			
			fromURIComponent: function (sParam) {
				return JSON.parse(decodeURIComponent(sParam));
			},
			
			mostrarAcessoRapidoInception: function () {
				this.getView().byId("acessoRapidoLogout").setVisible(false);
				this.getView().byId("acessoRapidoEmpresas").setVisible(false);
				this.getView().byId("acessoRapidoComunicacao").setVisible(false);
			},
			
			onAcessoRapido: function (oEvent) {
				var oItem = oEvent.getParameter("item");
				
				if (oItem === this.byId("acessoRapidoComunicacao")) {
					this.getRouter().navTo("comunicacao");
				}
				else if (oItem === this.byId("acessoRapidoRelatorioTTC")) {
					this.getRouter().navTo("ttcRelatorio");
				}
				else if (oItem === this.byId("acessoRapidoRelatorioTaxPackage")) {
					this.getRouter().navTo("taxPackageRelatorio");
				}
				else if (oItem === this.byId("acessoRapidoRelatorioCompliance")) {
					this.getRouter().navTo("complianceRelatorio");
				}
				else if (oItem === this.byId("acessoRapidoRelatorioBeps")) {
					this.getRouter().navTo("bepsRelatorio");
				}
				else if (oItem === this.byId("acessoRapidoReaberturaTTC")) {
					this.getRouter().navTo("ttcRequisicaoReabertura");
				}
				else if (oItem === this.byId("acessoRapidoReaberturaTaxPackage")) {
					this.getRouter().navTo("taxPackageRequisicaoReabertura");
				}
				else if (oItem === this.byId("acessoRapidoEmpresas")) {
					this.getRouter().navTo("empresasVinculadas");
				}
				else if (oItem ===  this.byId("acessoRapidoLogout")) {
					fetch(Constants.urlBackend + "deslogar", {
						credentials: 'include'
					})
					.then(() => {
						this.getRouter().navTo("login");
					});
				}
			},
			
			onValidarData: function (oEvent) {
				if (!oEvent.getParameter("valid")) {
					jQuery.sap.require("sap.m.MessageBox");
							
					sap.m.MessageBox.show(this.getResourceBundle().getText("viewGeralValorInseridoNaoValido"), {
						title: this.getResourceBundle().getText("viewGeralAviso")
					});
					
					oEvent.getSource().setValue("");
				}
			}
		});
	}
);