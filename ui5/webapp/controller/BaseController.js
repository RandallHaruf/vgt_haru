sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"ui5ns/ui5/model/Constants"
	], 
	function (Controller, Constants) {
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
				//return this.getModel("i18n").getResourceBundle();
			},
			
			isIFrame: function () {
				return self !== top;		
			},
			
			/* 28/05/19 - Todas as views externas instanciadas manualmente dentro do ambiente admin
			recebem um id terminado em "XMLView". Está é a referencia utilizada para indicar ao controller em que contexto
			ele se encontra. Essa solução foi necessaria para se ter um indicativo de contexto durante o "onInit",
			assim sendo possível evitar que o route matched seja declarado para views que não utilizam esse mecanismo de navegação entre views. */ 
			isVisualizacaoUsuario: function () {
				return this.oView.getId().toLowerCase().indexOf('xmlview') === -1;
			},
			
			isVisualizacaoAdmin: function () {
				return this.oView.getId().toLowerCase().indexOf('xmlview') > -1;
			},
			
			isPTBR: function () {
				return (sap.ui.getCore().getConfiguration().getLanguage().toUpperCase() === "PT-BR");
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
				else if (oItem === this.byId("acessoRapidoRelatorioAccountingResult")) {
					this.getRouter().navTo("taxPackageRelatorioAccountingResult");
				}				
				else if (oItem === this.byId("acessoRapidoRelatorioCreditSchedule")) {
					this.getRouter().navTo("taxPackageRelatorioCreditSchedule");
				}
				else if (oItem === this.byId("acessoRapidoRelatorioFiscalResult")) {
					this.getRouter().navTo("taxPackageRelatorioFiscalResult");
				}
				else if (oItem === this.byId("acessoRapidoRelatorioIncomeTax")) {
					this.getRouter().navTo("taxPackageRelatorioIncomeTax");
				}
				else if (oItem === this.byId("acessoRapidoRelatorioItemsToReport")) {
					this.getRouter().navTo("taxPackageRelatorioItemsToReport");
				}
				else if (oItem === this.byId("acessoRapidoRelatorioLossSchedule")) {
					this.getRouter().navTo("taxPackageRelatorioLossSchedule");
				}
				else if (oItem === this.byId("acessoRapidoRelatorioTemporaryAndPermanentDifferences")) {
					this.getRouter().navTo("taxPackageRelatorioTemporaryAndPermanentDifferences");
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
			},
			
			showError: function (error) {
				jQuery.sap.require("sap.m.MessageBox");
				
				var msg;
				
				if (typeof error == 'string' || error instanceof String) {
					msg = error;
				}
				else {
					if (error.responseJSON) {
						if (error.responseJSON.error.code && this.getResourceBundle().hasText(error.responseJSON.error.code)) {
							msg = this.getResourceBundle().getText(error.responseJSON.error.code);
						}
						else {
							msg = error.responseJSON.error.message;
						}
					}
					else {
						msg = error.message;
					}
				}
				
				sap.m.MessageBox.error(msg, {
					title: "Error"
				});
			},
			
			setUpRouteMatched: function (sRouteName) {
				if (this._onRouteMatched) {
					this.getRouter().getRoute(sRouteName).attachPatternMatched(this._routeMatched, this);	
				}
				else {
					console.log("No _onRouteMatched method defined");
				}
			},
			
			navTo: function (sRouteName, oParam) {
				if (oParam) {
					this.getRouter().navTo(sRouteName, {
						parametros: this.toURIComponent(oParam)
					});
				}
				else {
					this.getRouter().navTo(sRouteName);
				}
			},
			
			_routeMatched: function (oEvent) {
				var parametros = this.fromURIComponent(oEvent.getParameter("arguments").parametros);
				this._onRouteMatched(parametros);
			}
		});
	}
);