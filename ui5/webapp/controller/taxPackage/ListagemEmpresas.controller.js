sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"sap/ui/core/routing/History",
		"sap/ui/model/json/JSONModel",
		"ui5ns/ui5/model/formatter",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, History, JSONModel, formatter, NodeAPI) {
		"use strict";
	
		BaseController.extend("ui5ns.ui5.controller.taxPackage.ListagemEmpresas", {
			
			formatter: formatter,
			
			onInit: function () {
				/*var oModel = new JSONModel({
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
				
				this.setModel(oModel, "companies");*/
				this.setModel(new sap.ui.model.json.JSONModel({}));
				
				this.getRouter().getRoute("taxPackageListagemEmpresas").attachPatternMatched(this._onRouteMatched, this);                 
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
				//sap.m.MessageToast.show("Trocou ano calendário");
				this._atualizarDados();
			},
			
			onSelecionarEmpresa: function (oEvent) {
				var oParametros = {
					empresa: this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()),
					idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
				};
				
				this.getRouter().navTo("taxPackageResumoTrimestre", {
					parametros: JSON.stringify(oParametros)
				});
			},
			
			_onRouteMatched: function (oEvent) {
				var that = this;
				
				NodeAPI.listarRegistros("DominioAnoCalendario", function (response) {
					if (response) {
						that.getModel().setProperty("/DominioAnoCalendario", response);
						
						var oAnoCorrente = response.find(function (element) {
							return element.ano_calendario === (new Date()).getFullYear();
						});
					
						if (oAnoCorrente) {
							that.getModel().setProperty("/AnoCalendarioSelecionado", oAnoCorrente.id_dominio_ano_calendario);      
							
							that._atualizarDados();
						}
					}
				});
			},
			
			_atualizarDados: function () {
				var sIdAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado");
				
				var that = this;
				
				this.byId("tabelaEmpresas").setBusyIndicatorDelay(100);
				this.byId("tabelaEmpresas").setBusy(true);
				
				// Passar parametro 'empresas' com um array de IDs para filtrar as empresas do usuário logado!!!
				NodeAPI.listarRegistros("TaxPackageListagemEmpresas?anoCalendario=" + sIdAnoCalendario, function (response) {
					if (response && response.success) {
						that.getModel().setProperty("/Empresa", response.result);
					}	
					
					that.byId("tabelaEmpresas").setBusy(false);
				});
			}
		});
	}
);