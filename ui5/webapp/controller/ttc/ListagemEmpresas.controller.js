sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/jQueryMask"
	],
	function (BaseController, JSONModel, NodeAPI,JQueryMask) {
		"use strict";

		BaseController.extend("ui5ns.ui5.controller.ttc.ListagemEmpresas", {

			onInit: function () {
				this.setModel(new JSONModel());
				
				this.getRouter().getRoute("ttcListagemEmpresas").attachPatternMatched(this._onRouteMatched, this);                         
				jQuery(".money span").mask("000.000.000.000.000", {reverse: true});
			},

			onTrocarAnoCalendario: function (oEvent) {
				// sap.m.MessageToast.show("Ano selecionado: " + oEvent.getSource().getSelectedItem().getText());
				
				this._atualizarDados();
			},
			
			onSelecionarEmpresa: function (oEvent) {
				var oEmpresaSelecionada = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				var sIdAnoCalendarioSelecionado = this.getModel().getProperty("/AnoCalendarioSelecionado");
				
				this.getRouter().navTo("ttcResumoTrimestre", {
					oEmpresa: JSON.stringify(oEmpresaSelecionada),
					idAnoCalendario: sIdAnoCalendarioSelecionado
				});
			},
			
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
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
				
				/*NodeAPI.listarRegistros("Empresa", function (response) {
					if (response){
						that.getModel().setProperty("/Empresa", response);
					} 
				});*/
				
				/*this.getModel().setProperty("/Empresas", [{
					"id_empresa": 1,
					nome: "Empresa A",
					moeda: "USD",
					borne: "999.999.999,99",
					collected: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					"id_empresa": 1,
					nome: "Empresa A",
					moeda: "GBP",
					borne: "999.999.999,99",
					collected: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					"id_empresa": 2,
					nome: "Empresa B",
					moeda: "USD",
					borne: "999.999.999,99",
					collected: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					"id_empresa": 3,
					nome: "Empresa C",
					moeda: "USD",
					borne: "999.999.999,99",
					collected: "999.999.999,99",
					total: "999.999.999,99"
				}]);
				
				this.getModel().setProperty("/DominioAnoCalendario", [{
					"id_dominio_ano_calendario": 2,
					"ano_calendario": 2018
				}, {
					"id_dominio_ano_calendario": 1,
					"ano_calendario": 2017
				}]);*/
			},
			
			_atualizarDados: function () {
				var sIdAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado");
				
				var that = this;
				
				this.byId("tabelaEmpresas").setBusyIndicatorDelay(100);
				this.byId("tabelaEmpresas").setBusy(true);
				
				// Passar parametro 'empresas' com um array de IDs para filtrar as empresas do usuário logado!!!
				NodeAPI.listarRegistros("ResumoEmpresaTTC?anoCalendario=" + sIdAnoCalendario, function (response) {
					if (response) {
						for(var i = 0; i < response.length; i++){
							response[i]["collected"] = response[i]["collected"] ? parseInt(response[i]["collected"],10) : 0;
							response[i]["total"] = response[i]["total"] ? parseInt(response[i]["total"],10) : 0;
							response[i]["borne"] = response[i]["borne"] ? parseInt(response[i]["borne"],10) : 0;
						}
						that.getModel().setProperty("/Empresa", response);
					}	
					
					that.byId("tabelaEmpresas").setBusy(false);
				});
			}
		});
	}
);