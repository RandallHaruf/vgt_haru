sap.ui.define(
	[
		"sap/ui/core/mvc/Controller"
	], 
	function (Controller) {
		"use strict";

		return Controller.extend("vale.Compliance.controller.BaseController", {
			
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
			}
		});
	}
);