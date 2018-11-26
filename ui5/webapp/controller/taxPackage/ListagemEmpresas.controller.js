sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"sap/ui/core/routing/History",
		"sap/ui/model/json/JSONModel",
		"ui5ns/ui5/model/formatter"
	],
	function (BaseController, History, JSONModel, formatter) {
		"use strict";
	
		BaseController.extend("ui5ns.ui5.controller.taxPackage.ListagemEmpresas", {
			
			formatter: formatter,
			
			onInit: function () {
				var oModel = new JSONModel({
					Companies: [
						{
							name: "CompanyA",
							primeiroTrimestre: "sap-icon://accept",
							segundoTrimestre: "sap-icon://decline",
							terceiroTrimestre: "sap-icon://decline",
							quartoTrimestre: "sap-icon://decline",
							anual: "sap-icon://decline",
							qteRetificadoras: 0
						}
					]
				});
				
				this.setModel(oModel, "companies");
			},
			
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			
			onNavToReport: function () {
				this.getRouter().navTo("taxPackageRelatorio");	
			},
			
			onNavBack: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			
			onTrocarAnoCalendario: function () {
				//alert("Trocou ano calendário");
				sap.m.MessageToast.show("Trocou ano calendário");
			},
			
			onSelecionarEmpresa: function () {
				this.getRouter().navTo("taxPackageResumoTrimestre");
			}
		});
	}
);