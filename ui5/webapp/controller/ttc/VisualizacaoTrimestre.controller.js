sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, NodeAPI) {
		"use strict";
		
		return BaseController.extend("ui5ns.ui5.controller.ttc.VisualizacaoTrimestre", {
			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					"pagamentos": {
						borne: [
							{
								"classification": "Tax Borne",
								"category": "Taxes on Profits",
								"tax": "Corporate Income Tax",
								"nameOfTax": "",
								"nameOfGov": "",
								"jurisdicao": "Federal",
								"pais": "",
								"state": "",
								"city": "",
								"anoFiscal": 2015,
								"description": "",
								"dateOfPayment": "20/05/2018",
								"currency": "USD",
								"currencyRate": 1.2,
								"typeOfTransaction": "Cash Installment/Settlement",
								"otherSpecify": "",
								"principal": "999.999.999,99",
								"interest": "999.999.999,99",
								"fine": "999.999.999,99",
								"value": "999.999.999,99",
								"valueUSD": "999.999.999,99",
								"numberOfDocument": "",
								"beneficiaryCompany": "",
								"isNA": "sap-icon://decline"
							},
							{
								"classification": "Tax Borne",
								"category": "Taxes on Profits",
								"tax": "Other taxes",
								"nameOfTax": "",
								"nameOfGov": "",
								"jurisdicao": "Federal",
								"pais": "",
								"state": "",
								"city": "",
								"anoFiscal": 2016,
								"description": "",
								"dateOfPayment": "20/09/2018",
								"currency": "USD",
								"currencyRate": 1.2,
								"typeOfTransaction": "Cash Installment/Settlement",
								"otherSpecify": "",
								"principal": "999.999.999,99",
								"interest": "999.999.999,99",
								"fine": "999.999.999,99",
								"value": "999.999.999,99",
								"valueUSD": "999.999.999,99",
								"numberOfDocument": "",
								"beneficiaryCompany": "",
								"isNA": "sap-icon://decline"
							}
						],
						collected: [
							{
								"classification": "Tax Collected",
								"category": "Taxes on people",
								"tax": " Employee social contributions",
								"nameOfTax": "",
								"nameOfGov": "",
								"jurisdicao": "Federal",
								"pais": "",
								"state": "",
								"city": "",
								"anoFiscal": 2016,
								"description": "",
								"dateOfPayment": "20/09/2018",
								"currency": "USD",
								"currencyRate": 1.2,
								"typeOfTransaction": "Cash Installment/Settlement",
								"otherSpecify": "",
								"principal": "999.999.999,99",
								"interest": "999.999.999,99",
								"fine": "999.999.999,99",
								"value": "999.999.999,99",
								"valueUSD": "999.999.999,99",
								"numberOfDocument": "",
								"beneficiaryCompany": "",
								"isNA": "sap-icon://decline"
							}	
						]
					},
					Pagamentos: {
						Borne: [],
						Collected: []
					}
				}));
				
				this.getRouter().getRoute("ttcVisualizacaoTrimestre").attachPatternMatched(this._onRouteMatched, this);
			},
		
			onReabrir: function () {
				if (!this.pressDialog) {
					var oForm = new sap.ui.layout.form.Form({
						editable: true
					}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
						singleContainerFullSize: false
					}));
					
					var oFormContainer = new sap.ui.layout.form.FormContainer();
					
					var oFormElement = new sap.ui.layout.form.FormElement({
						label: "{i18n>viewGeralEmpresa}"
					}).addField(new sap.m.Text({
						text: this.getModel().getProperty("/Empresa").nome
					}));
					
					oFormContainer.addFormElement(oFormElement);
					
					oFormElement = new sap.ui.layout.form.FormElement({
						label: "{i18n>viewGeralPeriodo}"
					}).addField(new sap.m.Text({
						text: this.getModel().getProperty("/Periodo").periodo
					}));
					
					oFormContainer.addFormElement(oFormElement);
					
					oFormElement = new sap.ui.layout.form.FormElement({
						label: "{i18n>viewGeralJustificativa}"
					}).addField(new sap.m.TextArea({
						rows: 5
					}));
					
					oFormContainer.addFormElement(oFormElement);
					
					oForm.addFormContainer(oFormContainer);
					
					var that = this;
					
					this.pressDialog = new sap.m.Dialog({
						title: "{i18n>viewGeralNovaRequisicao}",
						content: oForm,
						beginButton: new sap.m.Button({
							text: "{i18n>viewGeralSalvar}",
							press: function () {
								sap.m.MessageToast.show("{i18n>viewGeralSalvarRequisiçao}" + that.getModel().getProperty("/Periodo").id_periodo);
								this.pressDialog.close();
							}.bind(this)
						}),
						endButton: new sap.m.Button({
							text: "{i18n>viewGeralSair}",
							press: function () {
								this.pressDialog.close();
							}.bind(this)
						})
					});
	
					// to get access to the global model
					this.getView().addDependent(this.pressDialog);
				}

				this.pressDialog.open();	
			},
		
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			
			navToPage2: function () {
				this.getRouter().navTo("ttcListagemEmpresas");
			},
			
			navToPage3: function () {
				var oEmpresaSelecionada = this.getModel().getProperty("/Empresa");
				var sIdAnoCalendarioSelecionado = this.getModel().getProperty("/AnoCalendario").idAnoCalendario;
				
				this.getRouter().navTo("ttcResumoTrimestre", {
					oEmpresa: JSON.stringify(oEmpresaSelecionada),
					idAnoCalendario: sIdAnoCalendarioSelecionado
				}); 
			},
			
			_onRouteMatched: function (oEvent) {
				 var oParameters = JSON.parse(oEvent.getParameter("arguments").oParameters); 
				 
				 this.getModel().setProperty("/Empresa", oParameters.oEmpresa);
				 this.getModel().setProperty("/Periodo", oParameters.oPeriodo);
				 this.getModel().setProperty("/AnoCalendario", oParameters.oAnoCalendario);
				 
				 var sIdEmpresa = oParameters.oEmpresa.id_empresa,
					sIdPeriodo = oParameters.oPeriodo.id_periodo,
					that = this;
					
				this.byId("tabelaPagamentosBorne").setBusyIndicatorDelay(100);
				this.byId("tabelaPagamentosBorne").setBusy(true);
				 
				NodeAPI.listarRegistros("/DeepQuery/Pagamento?full=true&empresa=" + sIdEmpresa + "&periodo=" + sIdPeriodo + "&tax_classification=1", function (response) { // tax_classification = BORNE
					if (response) {
						for (var i = 0; i < response.length; i++) {
							response[i].icone_aplicavel = response[i].ind_nao_aplicavel ? "sap-icon://accept" : "sap-icon://decline";
						}
						
						that.getModel().setProperty("/Pagamentos/Borne", response);
					}	
					
					that.byId("tabelaPagamentosBorne").setBusy(false);
				});
				
				this.byId("tabelaPagamentosCollected").setBusyIndicatorDelay(100);
				this.byId("tabelaPagamentosCollected").setBusy(true);
				
				NodeAPI.listarRegistros("/DeepQuery/Pagamento?full=true&empresa=" + sIdEmpresa + "&periodo=" + sIdPeriodo + "&tax_classification=2", function (response) { // tax_classification = BORNE
					if (response) {
						for (var i = 0; i < response.length; i++) {
							response[i].icone_aplicavel = response[i].ind_nao_aplicavel ? "sap-icon://accept" : "sap-icon://decline";
						}
						
						that.getModel().setProperty("/Pagamentos/Collected", response);
					}	
					
					that.byId("tabelaPagamentosCollected").setBusy(false);
				});
			}
		});
	}
);