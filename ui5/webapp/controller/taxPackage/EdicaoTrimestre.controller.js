sap.ui.define(
	[	
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, NodeAPI) {
		"use strict";
		
		return BaseController.extend("ui5ns.ui5.controller.taxPackage.EdicaoTrimestre", {
			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					DiferencaOpcao: {
						Permanente: [],
						Temporaria: []
					},
					DiferencasPermanentes: [],
					DiferencasTemporarias: [],
					TotalDiferencaPermanente: 0,
					TotalDiferencaTemporaria: 0,
					Moeda: null,
					TaxReconciliation: [{
						periodo: "1º Trimestre",
						rc_statutory_gaap_profit_loss_before_tax: 0,
						rc_current_income_tax_current_year: 0,
						rc_current_income_tax_previous_year: 0,
						rc_deferred_income_tax: 0,
						rc_non_recoverable_wht: 0,
						rc_statutory_provision_for_income_tax: 0, 
						rc_statutory_gaap_profit_loss_after_tax: 0,
						rf_taxable_income_loss_before_losses_and_tax_credits: 0,
						rf_total_losses_utilized: 0,
						rf_taxable_income_loss_after_losses: 0,
						rf_income_tax_before_other_taxes_and_credits: 0,
						rf_other_taxes: 0,
						rf_incentivos_fiscais: 0,
						rf_total_other_taxes_and_tax_credits: 0,
						rf_net_local_tax: 0,
						rf_wht: 0,
						rf_overpayment_from_prior_year_applied_to_current_year: 0,
						rf_total_interim_taxes_payments_antecipacoes: 0,
						rf_tax_due_overpaid: 0,
						it_income_tax_as_per_the_statutory_financials: 0,
						it_income_tax_as_per_the_tax_return: 0,
						it_jurisdiction_tax_rate_average: 0,
						it_statutory_tax_rate_average: 0,
						it_effective_tax_rate_as_per_the_statutory_financials: 0,
						it_effective_tax_rate_as_per_the_tax_return: 0,
						ind_ativo: true
					}],
					IncomeTaxDetails: null,
					/*taxReconciliation: {
						resultadoContabil: [],
						adicoesExclusoes: {
							permanentDifferences: {
								itens: [],
								opcoes: [
									{
										id: 1,
										texto: "Meals and entertaining including gifts"
									},
									{
										id: 2,
										texto: "Amortization"
									}
								]
							},
							temporaryDifferences: {
								itens: [],
								opcoes: [
									{
										id: 1,
										texto: "Tangible fixed assets"
									},
									{
										id: 2,
										texto: "Intangible assets"
									}
								]
							}
						},
						resultadoFiscal: [],
						incomeTax: []
					},*/
					lossSchedule: [
						{
							fiscalYear: 2017,
							yearOfExpiration: 2017,
							openingBalance: 0,
							currentYearLoss: 0,
							currentYearLossUtilized: 0,
							adjustments: 0,
							justificativa: "",
							currentYearLossExpired: 0,
							closingBalance: 0,
							obs: ""
						}/*, 
						{
							fiscalYear: "",
							yearOfExpiration: "Total",
							openingBalance: 0,
							currentYearLoss: 0,
							currentYearLossUtilized: 0,
							adjustments: 0,
							justificativa: "",
							currentYearLossExpired: 0,
							closingBalance: 0,
							obs: ""
						}*/
					],
					creditSchedule: [
						{
							fiscalYear: 2017,
							yearOfExpiration: 2017,
							openingBalance: 0,
							currentYearCredit: 0,
							currentYearCreditUtilized: 0,
							adjustments: 0,
							justificativa: "",
							currentYearCreditExpired: 0,
							closingBalance: 0,
							obs: ""
						}
					],
					opcoesAno: [
						{
							ano: 2018
						},
						{
							ano: 2017
						}
					]
				}));
				
				//this._initItemsToReport();
				//this._initTaxReconciliation();               
				
				this.getRouter().getRoute("taxPackageEdicaoTrimestre").attachPatternMatched(this._onRouteMatched, this);
			},
			
			onAplicarRegras: function (oEvent) {
				this._onAplicarFormulasRC();
				this._onCalcularTotalDiferenca();
				this._onAplicarFormulasRF();
				this._onAplicarFormulasIT();
				this.getModel().refresh();
			},
			
			_onAplicarFormulasRC: function () {
				//var oResultadoContabil = oEvent.getSource().getBindingContext().getObject();
				var oResultadoContabil = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
					return obj.ind_ativo === true;
				}); 
				
				var fValor1 = oResultadoContabil.rc_statutory_gaap_profit_loss_before_tax ? Number(oResultadoContabil.rc_statutory_gaap_profit_loss_before_tax) : 0,
					fValor2 = oResultadoContabil.rc_current_income_tax_current_year ? Number(oResultadoContabil.rc_current_income_tax_current_year) : 0,
					fValor3 = oResultadoContabil.rc_current_income_tax_previous_year ? Number(oResultadoContabil.rc_current_income_tax_previous_year) : 0,
					fValor4 = oResultadoContabil.rc_deferred_income_tax ? Number(oResultadoContabil.rc_deferred_income_tax) : 0,
					fValor5 = oResultadoContabil.rc_non_recoverable_wht ? Number(oResultadoContabil.rc_non_recoverable_wht) : 0;
				
				oResultadoContabil.rc_statutory_provision_for_income_tax = fValor2 + fValor3 + fValor4 + fValor5;
				
				var fValor6 = oResultadoContabil.rc_statutory_provision_for_income_tax ? oResultadoContabil.rc_statutory_provision_for_income_tax : 0;
				
				oResultadoContabil.rc_statutory_gaap_profit_loss_after_tax = fValor1 - fValor6;
			},
			
			_onAplicarFormulasRF: function () {
				var oResultadoFiscal = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
					return obj.ind_ativo === true;
				}); 	
				
				var fValor1 = oResultadoFiscal.rc_statutory_gaap_profit_loss_before_tax ? Number(oResultadoFiscal.rc_statutory_gaap_profit_loss_before_tax) : 0,
					fTotalDiferencaPermanente = this.getModel().getProperty("/TotalDiferencaPermanente") ? Number(this.getModel().getProperty("/TotalDiferencaPermanente")) : 0,
					fTotalDiferencaTemporaria = this.getModel().getProperty("/TotalDiferencaTemporaria") ? Number(this.getModel().getProperty("/TotalDiferencaTemporaria")) : 0;
					
				oResultadoFiscal.rf_taxable_income_loss_before_losses_and_tax_credits = fValor1 + fTotalDiferencaPermanente + fTotalDiferencaTemporaria;
				
				oResultadoFiscal.rf_total_losses_utilized = (oResultadoFiscal.rf_total_losses_utilized ? Math.abs(Number(oResultadoFiscal.rf_total_losses_utilized)) : 0) * -1;
				
				oResultadoFiscal.rf_taxable_income_loss_after_losses = oResultadoFiscal.rf_taxable_income_loss_before_losses_and_tax_credits + oResultadoFiscal.rf_total_losses_utilized;
				
				var fValor2 = oResultadoFiscal.rf_other_taxes ? Number(oResultadoFiscal.rf_other_taxes) : 0,
					fValor3 = oResultadoFiscal.rf_incentivos_fiscais ? Number(oResultadoFiscal.rf_incentivos_fiscais) : 0;
				
				oResultadoFiscal.rf_total_other_taxes_and_tax_credits = fValor2 + fValor3;
				
				oResultadoFiscal.rf_net_local_tax = oResultadoFiscal.rf_total_other_taxes_and_tax_credits + oResultadoFiscal.rf_income_tax_before_other_taxes_and_credits;
				
				var fValor4 =  oResultadoFiscal.rf_net_local_tax,
					fValor5 = oResultadoFiscal.rf_wht ? Number(oResultadoFiscal.rf_wht) : 0,
					fValor6 = oResultadoFiscal.rf_overpayment_from_prior_year_applied_to_current_year ? Number(oResultadoFiscal.rf_overpayment_from_prior_year_applied_to_current_year) : 0,
					fValor7 = oResultadoFiscal.rf_total_interim_taxes_payments_antecipacoes ? Number(oResultadoFiscal.rf_total_interim_taxes_payments_antecipacoes) : 0;
					
				oResultadoFiscal.rf_tax_due_overpaid = fValor4 + fValor5 + fValor6 + fValor7;
			},
			
			_onAplicarFormulasIT: function () {
				var oIncomeTax = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
					return obj.ind_ativo === true;
				}); 
				
				var fValor1 = oIncomeTax.rc_current_income_tax_current_year ? Number(oIncomeTax.rc_current_income_tax_current_year) : 0,
					fValor2 = oIncomeTax.rf_income_tax_before_other_taxes_and_credits ? Number(oIncomeTax.rf_income_tax_before_other_taxes_and_credits) : 0;
				
				oIncomeTax.it_income_tax_as_per_the_statutory_financials = fValor1;
				oIncomeTax.it_income_tax_as_per_the_tax_return = fValor2;
				
				var fValor3 = oIncomeTax.rc_statutory_gaap_profit_loss_before_tax ? Number(oIncomeTax.rc_statutory_gaap_profit_loss_before_tax) : 0,
					fValor4 = oIncomeTax.rf_net_local_tax ? Number(oIncomeTax.rf_net_local_tax) : 0;
				
				if (fValor3 !== 0) {
					oIncomeTax.it_effective_tax_rate_as_per_the_statutory_financials = fValor1 / fValor3;
					oIncomeTax.it_effective_tax_rate_as_per_the_tax_return = fValor4 / fValor3;
				}
				else {
					if (fValor1 > 0) {
						oIncomeTax.it_effective_tax_rate_as_per_the_statutory_financials = 1;	
					}
					if (fValor4 > 0) {
						oIncomeTax.it_effective_tax_rate_as_per_the_tax_return = 1;
					}
				}
			},
			
			_onCalcularTotalDiferenca: function () {
				var sChaveProcurar = "",
					fTotalDiferencaPermanente = 0,
					fTotalDiferencaTemporaria = 0,
					iNumeroOrdemPeriodo = this.getModel().getProperty("/Periodo").numero_ordem;
				
				switch (true) {
					case iNumeroOrdemPeriodo === 1:
						sChaveProcurar = "valor1";
						break;
					case iNumeroOrdemPeriodo === 2:
						sChaveProcurar = "valor2";
						break;
					case iNumeroOrdemPeriodo === 3:
						sChaveProcurar = "valor3";
						break;
					case iNumeroOrdemPeriodo === 4:
						sChaveProcurar = "valor4";
						break;
					case iNumeroOrdemPeriodo === 5:
						sChaveProcurar = "valorAnual";
						break;
					case iNumeroOrdemPeriodo >= 6:
						sChaveProcurar = "valorRetificadora";
						break;
				}
				
				if (sChaveProcurar) {
					var aDiferencasPermanentes = this.getModel().getProperty("/DiferencasPermanentes"),
						aDiferencasTemporarias = this.getModel().getProperty("/DiferencasTemporarias");
						
					for (var i = 0, length = aDiferencasPermanentes.length; i < length; i++) {
						var oDiferencaPermanente = aDiferencasPermanentes[i],
							fValor = oDiferencaPermanente[sChaveProcurar] ? Number(oDiferencaPermanente[sChaveProcurar]) : 0;
						
						fTotalDiferencaPermanente += fValor;
					}
					
					for (var i = 0, length = aDiferencasTemporarias.length; i < length; i++) {
						var oDiferencaTemporaria = aDiferencasTemporarias[i],
							fValor = oDiferencaTemporaria[sChaveProcurar] ? Number(oDiferencaTemporaria[sChaveProcurar]) : 0;
						
						fTotalDiferencaTemporaria += fValor;
					}
				}
				
				this.getModel().setProperty("/TotalDiferencaPermanente", fTotalDiferencaPermanente);
				this.getModel().setProperty("/TotalDiferencaTemporaria", fTotalDiferencaTemporaria);
			},
			
			onNovaDiferencaPermanente: function (oEvent) {
				this.getModel().getProperty("/DiferencasPermanentes").unshift({
					"fk_diferenca_opcao.id_diferenca_opcao": null,
					"outro": null,
					"valor1": 0,
					"valor2": 0,
					"valor3": 0,
					"valor4": 0,
					"valor5": 0,
					"valor6": 0,
					"nova": true
				});
				this.getModel().refresh();
			},
			
			onExcluirPermanente: function (oEvent) {
				var oExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				this._onExcluirDiferenca(oExcluir, "/DiferencasPermanentes");
			},
			
			onNovaDiferencaTemporaria: function (oEvent) {
				this.getModel().getProperty("/DiferencasTemporarias").unshift({
					"fk_diferenca_opcao.id_diferenca_opcao": null,
					"outro": null,
					"valor1": 0,
					"valor2": 0,
					"valor3": 0,
					"valor4": 0,
					"valor5": 0,
					"valor6": 0,
					"nova": true
				});
				this.getModel().refresh();
			},
			
			onExcluirTemporaria: function (oEvent) {
				var oExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				this._onExcluirDiferenca(oExcluir, "/DiferencasTemporarias");
			},
			
			onNovaAdicao: function (oEvent) {
				var oNewObj = {
					idItem: 0,
					primeiroValor: 0,
					segundoValor: 0,
					terceiroValor: 0,
					quartoValor: 0
				};
				
				this.getModel().getProperty("/taxReconciliation/adicoesExclusoes/permanentDifferences/itens").unshift(oNewObj);
				this.getModel().refresh();
			},
			
			onExcluirAdicao: function (oEvent) {
				var oExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				this._onExcluirDiferenca(oExcluir, "/taxReconciliation/adicoesExclusoes/permanentDifferences/itens");	
			},
			
			onNovaExclusao: function (oEvent) {
				var oNewObj = {
					idItem: 0,
					primeiroValor: 0,
					segundoValor: 0,
					terceiroValor: 0,
					quartoValor: 0
				};
				
				this.getModel().getProperty("/taxReconciliation/adicoesExclusoes/temporaryDifferences/itens").unshift(oNewObj);
				this.getModel().refresh();
			},
			
			onExcluirExclusao: function (oEvent) {
				var oExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				this._onExcluirDiferenca(oExcluir, "/taxReconciliation/adicoesExclusoes/temporaryDifferences/itens");	
			},
			
			_onExcluirDiferenca: function (oExcluir, sProperty) {
				var that = this;
				
				jQuery.sap.require("sap.m.MessageBox");
				
				sap.m.MessageBox.confirm("Você tem certeza que deseja excluir esta linha?", {
					title: "Confirmação",
					onClose: function (oAction) { 
						if (oAction === sap.m.MessageBox.Action.OK) {
							var aData = that.getModel().getProperty(sProperty);
							
							for (var i = 0; i < aData.length; i++) {
								var obj = aData[i];
								
								if (oExcluir === obj) {
									aData.splice(i, 1);
									break;
								}
							}
							
							that.getModel().setProperty(sProperty, aData);
							that.onAplicarRegras();
						}
					}
				});	
			},
			
			onSalvarFechar: function (oEvent) {
				var that = this;
				
				this._salvar(oEvent, function (response) {
					if (response.success) {
						that._navToResumoTrimestre();
					}
					else {
						sap.m.MessageToast.show("Erro ao salvar");
					}
				});
			},
			
			onSalvar: function (oEvent) {
				this._salvar(oEvent, function (response) {
					if (response.success) {
						sap.m.MessageToast.show("Salvo com sucesso");
					}
					else {
						sap.m.MessageToast.show("Erro ao salvar");
					}
				});
			},
			
			onCancelar: function (oEvent) {
				var that = this;
				this._confirmarCancelamento(function () {
					that._navToResumoTrimestre();
				});
			},
			
			_initItemsToReport: function () {
				var that = this; 
				
				this.byId("containerItemsToReport2").removeAllContent();
				
				var oModel = [];
				
				NodeAPI.listarRegistros("ItemToReport", function (response) {
					if (response) {
						//alert(JSON.stringify(response));
						var oItemToReport, oHBox, oRadioButton, oMultiComboBox, oTextArea, oVBox = new sap.m.VBox();
						
						for (var i = 0, length = response.length; i < length; i++) {
							var obj = {};
							
							oItemToReport = response[i];
							obj.idItemToReport = oItemToReport.id_item_to_report;
							
							oHBox = new sap.m.HBox({ alignItems: "Center" });
							oHBox.addItem(new sap.m.Text({ text: oItemToReport.pergunta }));
							
							if (oItemToReport.flag_sim_nao) {
								oRadioButton = new sap.m.RadioButton({ groupName: "group" + i, text: "Sim" });
								obj.idRadioButtonSim = oRadioButton.getId();
								oHBox.addItem(oRadioButton);
								
								oRadioButton = new sap.m.RadioButton({ groupName: "group" + i, text: "Não", selected: true }); 
								obj.idRadioButtonNao = oRadioButton.getId();
								oHBox.addItem(oRadioButton);
							}
							
							oVBox.addItem(oHBox);
							
							if (oItemToReport.flag_ano) {
								oMultiComboBox = new sap.m.MultiComboBox({ width: "50%" })
									.bindItems({
										templateShareable: false,
										path: "/DominioAnoFiscal",
										template: new sap.ui.core.ListItem({
											key: "{id_dominio_ano_fiscal}",
											text: "{ano_fiscal}"
										})
									});
								obj.idMultiComboBox = oMultiComboBox.getId();
								oVBox.addItem(oMultiComboBox);
							}
							
							oTextArea = new sap.m.TextArea({ width: "100%", rows: 5 }).addStyleClass("sapUiMediumMarginBottom");
							obj.idTextArea = oTextArea.getId();
							oVBox.addItem(oTextArea);	
							
							oModel.push(obj);
						}
						
						that.getModel().setProperty("/ComponentesItemToReport", oModel);
						that.byId("containerItemsToReport2").addContent(oVBox);
					}	
				});
				
				/*var aItemsToReport = [
					"What is the first fiscal year still open to scrutiny by the tax authorities? If YES, please indicate which year(s).",
					"Is there a tax audit ongoing as at the reporting date? If YES, pleas indicate which year(s).",
					"Was a tax audit completed during the last year before the reporting date?  If YES, pleas indicate which year(s).",
					"Is there any tax litigation (appeal, court case) pending? If YES, please comment below and quantify the exposure.",
					"Are you aware of any tax risks in your country? If YES, please comment below and quantify the exposure.",
					"Is there  any potential tax planning or tax risk management opportunities? If yes, please give details.",
					"Is there  any potential tax planning or tax risk management opportunities? If yes, please give details.",
					"Is there any significant issues addressed when preparing/reviewing the tax computation/tax return? If YES, please give details.",
					"Is there any relevant observations regarding the corporate income tax return process e.g. tax returns filed late, concerns regarding data quality or timeliness, process improvement opportunities etc? If YES, provide details.",
					"Is there any other relevant items that should be communicated  to the company e.g. business changes,  reorganization, agreement with tax authorities, regulatory changes etc.? If YES, provide details.",
					"Is there any formal written communications to the company regarding items included in the tax return.? If YES, please provide details.",
					"Is the Entity subject to Transfer Price rules? If yes, provide details.",
					"Does the company benefit from any tax exemption? If YES, provide details."
				];
				
				var sItemToReport, oHBox, oVBox = new sap.m.VBox();
				
				for (var i = 0; i < aItemsToReport.length; i++) {
					sItemToReport = aItemsToReport[i];
					
					oHBox = new sap.m.HBox({ alignItems: "Center" });
					oHBox.addItem(new sap.m.Text({ text: sItemToReport }));
					oHBox.addItem(new sap.m.RadioButton({ groupName: "group" + i, text: "Sim" }));
					oHBox.addItem(new sap.m.RadioButton({ groupName: "group" + i, text: "Não", selected: true }));
					
					oVBox.addItem(oHBox);
					
					if (sItemToReport === "What is the first fiscal year still open to scrutiny by the tax authorities? If YES, please indicate which year(s).") {
						oVBox.addItem(new sap.m.MultiComboBox({ width: "50%" }).bindItems({
							templateShareable: false,
							path: "/opcoesAno",
							template: new sap.ui.core.ListItem({
								key: "{ano}",
								text: "{ano}"
							})
						}));
					}
					else {
						oVBox.addItem(new sap.m.TextArea({ width: "100%", rows: 5 }).addStyleClass("sapUiSmallMarginBottom"));	
					}
				}
				
				this.byId("containerItemsToReport2").addContent(oVBox);*/
			},
			
			_initTaxReconciliation: function () {
				var that = this;
				
				// Construção do resultado contabil
				var oResultadoContabil = {
					aTemplate: [
						{
							label: "1º Trimestre",
							isEditavel: true,
							propriedade: "primeiroValor"
						},
						{
							label: "2º Trimestre",
							isEditavel: false,
							propriedade: "segundoValor"
						},
						{
							label: "3º Trimestre",
							isEditavel: false,
							propriedade: "terceiroValor"
						},
						{
							label: "4º Trimestre",
							isEditavel: false,
							propriedade: "quartoValor"
						}
					],
					aItems: [
						{
							campo: "Statutory GAAP Profit / (loss) before t",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Current Income Tax – Current Year",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Current Income Tax – Previous Year",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Deferred Income Tax",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Non-Recoverable WHT",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Statutory provision for income tax",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Statutory GAAP profit / (loss) after tax",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						}
					]
				};
				
				this._montarTabelaTR(oResultadoContabil, "/taxReconciliation/resultadoContabil", "containerResultadoContabil2");
				
				// Construção das adições e exclusões
				var oAdicoes = {
					aTemplate: [
						{
							label: "1º Trimestre",
							isEditavel: true,
							propriedade: "primeiroValor"
						},
						{
							label: "2º Trimestre",
							isEditavel: false,
							propriedade: "segundoValor"
						},
						{
							label: "3º Trimestre",
							isEditavel: false,
							propriedade: "terceiroValor"
						},
						{
							label: "4º Trimestre",
							isEditavel: false,
							propriedade: "quartoValor"
						}
					],
					aItems: [
						{
							idTipo: 2,
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						}	
					]
				};
				
				this._montarTabelaTR(oAdicoes, "/taxReconciliation/adicoesExclusoes/permanentDifferences/itens", "containerAdicoesExclusoes2", {
					titulo: "Permanent Differences",
					caminhoOpcoes: "/taxReconciliation/adicoesExclusoes/permanentDifferences/opcoes",
					onNova: that.onNovaAdicao,
					onExcluir: that.onExcluirAdicao
				});
				
				var oExclusoes = {
					aTemplate: [
						{
							label: "1º Trimestre",
							isEditavel: true,
							propriedade: "primeiroValor"
						},
						{
							label: "2º Trimestre",
							isEditavel: false,
							propriedade: "segundoValor"
						},
						{
							label: "3º Trimestre",
							isEditavel: false,
							propriedade: "terceiroValor"
						},
						{
							label: "4º Trimestre",
							isEditavel: false,
							propriedade: "quartoValor"
						}
					],
					aItems: [
						{
							idTipo: 2,
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						}	
					]
				};
				
				this._montarTabelaTR(oExclusoes, "/taxReconciliation/adicoesExclusoes/temporaryDifferences/itens", "containerAdicoesExclusoes2", {
					titulo: "Temporary Differences",
					caminhoOpcoes: "/taxReconciliation/adicoesExclusoes/temporaryDifferences/opcoes",
					onNova: that.onNovaExclusao,
					onExcluir: that.onExcluirExclusao
				});
				
				// Construção do Resultado Fiscal
				var oResultadoFiscal = {
					aTemplate: [
						{
							label: "1º Trimestre",
							isEditavel: true,
							propriedade: "primeiroValor"
						},
						{
							label: "2º Trimestre",
							isEditavel: false,
							propriedade: "segundoValor"
						},
						{
							label: "3º Trimestre",
							isEditavel: false,
							propriedade: "terceiroValor"
						},
						{
							label: "4º Trimestre",
							isEditavel: false,
							propriedade: "quartoValor"
						}
					],
					aItems: [
						{
							campo: "Taxable income / (loss) before losses and tax credits",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Total losses utilized",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Taxable income / (loss) after losses",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Income tax before other taxes and credits",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Other taxes",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Incentivos Fiscais",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Total other taxes and tax credits",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Net local tax",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "WHT",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Overpayment from prior year applied to current year",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Total interim taxes payments (antecipações)",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Tax due / (overpaid)",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						}
					]
				};
				
				this._montarTabelaTR(oResultadoFiscal, "/taxReconciliation/resultadoFiscal", "containerResultadoFiscal2");
				
				// Construção do Income Tax
				var oIncomeTax = {
					aTemplate: [
						{
							label: "1º Trimestre",
							isEditavel: true,
							propriedade: "primeiroValor"
						},
						{
							label: "2º Trimestre",
							isEditavel: false,
							propriedade: "segundoValor"
						},
						{
							label: "3º Trimestre",
							isEditavel: false,
							propriedade: "terceiroValor"
						},
						{
							label: "4º Trimestre",
							isEditavel: false,
							propriedade: "quartoValor"
						}
					],
					aItems: [
						{
							campo: "Income Tax – as per the statutory financials",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Income Tax – as per the tax return",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Jurisdiction tax rate – average",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Staturory tax rate – average",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Effective tax rate - as per the statutory financials",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Effective tax rate - as per the tax return",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						}
					]
				};
				
				this._montarTabelaTR(oIncomeTax, "/taxReconciliation/incomeTax", "containerIncomeTax2");
				
				var oVBox = new sap.m.VBox();
				
				oVBox.addItem(new sap.m.ObjectIdentifier({
					title: "Please provide details if Tax Return's Income differs from FS"
				}).addStyleClass("sapUiMediumMarginTop"));
				
				oVBox.addItem(new sap.m.TextArea({
					rows: 5,
					width: "100%"
				}));
				
				this.byId("containerIncomeTax2").addContent(oVBox);
			},
			
			_montarTabelaTR: function (oItems, sProperty, sIdContainer, oAdicaoExclusaoConfig) {
				/*var oResultadoContabil = {
					aTemplate: [
						{
							label: "1º Trimestre",
							isEditavel: true,
							propriedade: "primeiroValor"
						},
						{
							label: "2º Trimestre",
							isEditavel: false,
							propriedade: "segundoValor"
						},
						{
							label: "3º Trimestre",
							isEditavel: false,
							propriedade: "terceiroValor"
						},
						{
							label: "4º Trimestre",
							isEditavel: false,
							propriedade: "quartoValor"
						}
					],
					aItems: [
						{
							campo: "Statutory GAAP Profit / (loss) before yet",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Current Income Tax – Current Year",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Current Income Tax – Previous Year",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Deferred Income Tax",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Non-Recoverable WHT",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Statutory provision for income tax",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Statutory GAAP profit / (loss) after tax",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						}
					]
				};*/
				
				//this.getModel().setProperty("/taxReconciliation/resultadoContabil", oResultadoContabil.aItems);
				this.getModel().setProperty(sProperty, oItems.aItems);
				
				var oTable = new sap.m.Table().addStyleClass("bordered celulasSeparadas");
				var aCells = [];
				
				if (oAdicaoExclusaoConfig) {
					oTable.addStyleClass("sapUiSmallMarginBottom");
					
					var oToolbar = new sap.m.Toolbar();
					oToolbar.addContent(new sap.m.ObjectIdentifier({ title: oAdicaoExclusaoConfig.titulo }));
					oToolbar.addContent(new sap.m.ToolbarSpacer());
					oToolbar.addContent(new sap.m.Button({ text: "Nova", icon: "sap-icon://add", type: "Emphasized" }).attachPress(oTable, oAdicaoExclusaoConfig.onNova, this));
					// Adicionar onPress do botão
					oTable.setHeaderToolbar(oToolbar);
					
					// Coluna de exclusão da linha
					oTable.addColumn(new sap.m.Column({
						width: "50px"
					}));
					
					aCells.push(new sap.m.Button({
						icon: "sap-icon://delete",
						type: "Reject"
					}).attachPress(oTable, oAdicaoExclusaoConfig.onExcluir, this));
					
					// Coluna de tipo de diferença
					oTable.addColumn(new sap.m.Column({
						vAlign: "Middle"
					}).setHeader(new sap.m.Text({
						text: "Tipo"
					})));
					
					aCells.push(new sap.m.Select({ selectedKey: "{idTipo}" }).bindItems({
						templateShareable: false,
						path: oAdicaoExclusaoConfig.caminhoOpcoes,
						template: new sap.ui.core.ListItem({
							key: "{id}",
							text: "{texto}"
						})
					}));
					
					// Coluna de outro caso usuário selecione "outras"
					oTable.addColumn(new sap.m.Column({
						vAlign: "Middle"
					}).setHeader(new sap.m.Text({
						text: "Outro"
					})));
					
					aCells.push(new sap.m.Input({
						value: ""
					}));
				}
				else {
				
					oTable.addColumn(new sap.m.Column({
						vAlign: "Middle"
					}).setHeader(new sap.m.Text({
						text: ""
					})));
					
					aCells.push(new sap.m.ObjectIdentifier({
						title: "{campo}"
					}));
				}
				
				var oTemplateColuna;
				
				for (var i = 0; i < oItems.aTemplate.length; i++) {
					oTemplateColuna = oItems.aTemplate[i];
					
					if (oTemplateColuna.isEditavel) {
						aCells.push(new sap.m.Input({
							type: "Number",
							value: "{" + oTemplateColuna.propriedade + "}"
						}));
						
						oTable.addColumn(new sap.m.Column().setHeader(new sap.m.Text({
							text: oTemplateColuna.label
						})));
					}
					else {
						aCells.push(new sap.m.Text({
							text: "{" + oTemplateColuna.propriedade + "}"
						}));
						
						oTable.addColumn(new sap.m.Column({
							vAlign: "Middle"
						}).setHeader(new sap.m.Text({
							text: oTemplateColuna.label
						})));
					}
				}
				
				var oTemplate = new sap.m.ColumnListItem({
					cells: aCells
				});
				
				oTable.bindItems({
					path: sProperty,
					template: oTemplate
				});
				
				this.byId(sIdContainer).addContent(oTable);
			},
			
			navToHome: function () {
				var that = this;
				this._confirmarCancelamento(function () {
					that.getRouter().navTo("selecaoModulo");
				});
			},
			
			navToPage2: function () {
				var that = this;
				this._confirmarCancelamento(function () {
					that.getRouter().navTo("taxPackageListagemEmpresas");
				});
			},
			
			navToPage3: function () {
				var that = this;
				this._confirmarCancelamento(function () {
					that._navToResumoTrimestre();
				});
			},
			
			_confirmarCancelamento: function (onConfirm) {
				var dialog = new sap.m.Dialog({
					title: "Confirmação",
					type: "Message",
					content: new sap.m.Text({ text: "Você tem certeza que deseja cancelar a edição?" }),
					beginButton: new sap.m.Button({
						text: "Sim",
						press: function () {
							dialog.close();
							if (onConfirm) {
								onConfirm();
							}
						}
					}),
					endButton: new sap.m.Button({
						text: "Cancelar",
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
	
				dialog.open();
			},
			
			_onRouteMatched: function (oEvent) {
				var oParametros = JSON.parse(oEvent.getParameter("arguments").parametros);

				this.getModel().setProperty("/Empresa", oParametros.oEmpresa);
				this.getModel().setProperty("/Periodo", oParametros.oPeriodo);
				this.getModel().setProperty("/AnoCalendario", oParametros.oAnoCalendario);
				
				//alert("Empresa: " + oParametros.oEmpresa.nome + "\nPeriodo: " + oParametros.oPeriodo.periodo + "\nAnoCalendario: " + oParametros.oAnoCalendario.anoCalendario);
				
				var that = this;
				
				NodeAPI.listarRegistros("DominioMoeda", function (response) {
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/DominioMoeda", response);
					}
				});
				
				NodeAPI.listarRegistros("DiferencaOpcao?tipo=1", function (response) {
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/DiferencaOpcao/Permanente", response);
					}
				});
				
				NodeAPI.listarRegistros("DiferencaOpcao?tipo=2", function (response) {
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/DiferencaOpcao/Temporaria", response);
					}
				});
				
				NodeAPI.listarRegistros("DominioAnoFiscal", function (response) {
					if (response) {
						that.getModel().setProperty("/DominioAnoFiscal", response);
					}	
				});
				              
		    	this._initItemsToReport();  
				this._atualizarDados();
			},
			
			_atualizarDados: function () {
				var that = this,
					sIdRelTaxPackagePeriodo = this.getModel().getProperty("/Periodo").id_rel_tax_package_periodo;
				
				NodeAPI.listarRegistros("TaxPackage?idRelTaxPackagePeriodo=" + sIdRelTaxPackagePeriodo, function (response) {
					if (response) {
						//var oTaxReconAtivo = response.taxReconciliation.find(obj => obj.ind_ativo);
						var oTaxReconAtivo = response.taxReconciliation.find(function (obj) { return obj.ind_ativo; });
						that.getModel().setProperty("/TaxReconciliation", response.taxReconciliation);
						that.getModel().setProperty("/IncomeTaxDetails", oTaxReconAtivo.it_details_if_tax_returns_income_differs_from_fs);
						that.getModel().setProperty("/DiferencasPermanentes", response.diferencaPermanente);
						that.getModel().setProperty("/DiferencasTemporarias", response.diferencaTemporaria);
						
						that.onAplicarRegras();
					}	
				});
			},
			
			_salvar: function (oEvent, callback) {
				var oButton = oEvent.getSource();
				
				oButton.setEnabled(false);
				
				this._inserir(function (response) {
					oButton.setEnabled(true);
					
					if (callback) {
						callback(JSON.parse(response));
					}
				});
			},
			
			_inserir: function (callback) {
				var sIdMoeda = this.getModel().getProperty("/Moeda");
				var sIncomeTaxDetails = this.getModel().getProperty("/IncomeTaxDetails");
				
				var oTaxReconciliation = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
					return obj.ind_ativo === true;
				});
				
				var aDiferencaPermanente = this.getModel().getProperty("/DiferencasPermanentes"),
					aDiferencaTemporaria = this.getModel().getProperty("/DiferencasTemporarias"),
					aRespostaItemToReport = this._formatarRespostaItemToReport();
				
				console.log("######## INSERIR ########");
				console.log("- Items To Report: ");
				console.table(aRespostaItemToReport);
				console.log("- Moeda TP: " + sIdMoeda);
				console.log("- Tax Reconciliation: \n");
				console.log("	-- Income Tax Details: " + sIncomeTaxDetails + "\n");
				console.table(oTaxReconciliation);
				console.table(aDiferencaPermanente);
				console.table(aDiferencaTemporaria);
				
				var oTaxPackage = {
					empresa: this.getModel().getProperty("/Empresa"),
					periodo: this.getModel().getProperty("/Periodo"),
					anoCalendario: this.getModel().getProperty("/AnoCalendario"),
					moeda: this.getModel().getProperty("/Moeda"),
					taxReconciliationRcRfIt: this.getModel().getProperty("/TaxReconciliation"),
					incomeTaxDetails: this.getModel().getProperty("/IncomeTaxDetails"),
					diferencasPermanentes: aDiferencaPermanente,
					diferencasTemporarias: aDiferencaTemporaria,
					respostaItemToReport: aRespostaItemToReport
				};
				
				NodeAPI.criarRegistro("InserirTaxPackage", {
					taxPackage: JSON.stringify(oTaxPackage)
				}, function (response) {
					if (callback) {
						callback(response);
					}
				});
			},
			
			_formatarRespostaItemToReport: function () {
				var aComponenteItemToReport = this.getModel().getProperty("/ComponentesItemToReport");
				
				var aRespostaItemToReport = [];
				
				for (var i = 0, length = aComponenteItemToReport.length; i < length; i++) {
					var oComponenteItemToReport = aComponenteItemToReport[i],	
						oRespostaItemToReport = {
							fkItemToReport: oComponenteItemToReport.idItemToReport
						};
					
					if (oComponenteItemToReport.idRadioButtonSim) {
						oRespostaItemToReport.ind_se_aplica = sap.ui.getCore().byId(oComponenteItemToReport.idRadioButtonSim).getSelected();
					}
					
					if (oComponenteItemToReport.idMultiComboBox) {
						oRespostaItemToReport.relAnoFiscal = sap.ui.getCore().byId(oComponenteItemToReport.idMultiComboBox).getSelectedKeys();   
					}
					
					if (oComponenteItemToReport.idTextArea) {
						oRespostaItemToReport.resposta = sap.ui.getCore().byId(oComponenteItemToReport.idTextArea).getValue();
					}
					
					aRespostaItemToReport.push(oRespostaItemToReport);
				}
				
				return aRespostaItemToReport;
			},
			
			_navToResumoTrimestre: function () {
				this._limparModel();
				
				var oParametros = {
					empresa: this.getModel().getProperty("/Empresa"),
					idAnoCalendario: this.getModel().getProperty("/AnoCalendario").idAnoCalendario
				};
				
				this.getRouter().navTo("taxPackageResumoTrimestre", {
					parametros: JSON.stringify(oParametros)
				});
			},
			
			_limparModel: function () {
				this.getModel().setProperty("/Moeda", null);
				this.getModel().setProperty("/TaxReconciliation", {});
				this.getModel().setProperty("/DiferencasPermanentes", []);
				this.getModel().setProperty("/DiferencasTemporarias", []);
				/*this.getModel().setProperty("/TaxReconciliation", [{
					periodo: "1º Trimestre",
					rc_statutory_gaap_profit_loss_before_tax: 0,
					rc_current_income_tax_current_year: 0,
					rc_current_income_tax_previous_year: 0,
					rc_deferred_income_tax: 0,
					rc_non_recoverable_wht: 0,
					rc_statutory_provision_for_income_tax: 0, 
					rc_statutory_gaap_profit_loss_after_tax: 0,
					ind_ativo: true
				}]);*/
			}
		});
	}
);