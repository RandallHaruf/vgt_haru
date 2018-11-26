sap.ui.define(
	[	
		"ui5ns/ui5/controller/BaseController"
	],
	function (BaseController) {
		"use strict";
		
		return BaseController.extend("ui5ns.ui5.controller.taxPackage.VisualizacaoTrimestre", {
			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					taxReconciliation: {
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
					},
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
						}
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
					]
				}));
				
				this._initItemsToReport();
				this._initTaxReconciliation();               
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
						label: "Empresa"
					}).addField(new sap.m.Text({
						text: "Empresa A"
					}));
					
					oFormContainer.addFormElement(oFormElement);
					
					oFormElement = new sap.ui.layout.form.FormElement({
						label: "Período"
					}).addField(new sap.m.Text({
						text: "1º Trimestre"
					}));
					
					oFormContainer.addFormElement(oFormElement);
					
					oFormElement = new sap.ui.layout.form.FormElement({
						label: "Justificativa"
					}).addField(new sap.m.TextArea({
						rows: 5
					}));
					
					oFormContainer.addFormElement(oFormElement);
					
					oForm.addFormContainer(oFormContainer);
					
					this.pressDialog = new sap.m.Dialog({
						title: "Nova Requisição",
						content: oForm,
						beginButton: new sap.m.Button({
							text: "salvar",
							press: function () {
								sap.m.MessageToast.show("Salvar requisição");
								this.pressDialog.close();
							}.bind(this)
						}),
						endButton: new sap.m.Button({
							text: "sair",
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
			
			onNovaAdicao: function (oEvent) {
				var oNewObj = {
					idItem: 0,
					primeiroValor: 0,
					segundoValor: 0,
					terceiroValor: 0,
					quartoValor: 0
				};
				
				this.getModel().getProperty("/taxReconciliation/adicoesExclusoes/permanentDifferences/itens").push(oNewObj);
				this.getModel().refresh();
			},
			
			onNovaExclusao: function (oEvent) {
				var oNewObj = {
					idItem: 0,
					primeiroValor: 0,
					segundoValor: 0,
					terceiroValor: 0,
					quartoValor: 0
				};
				
				this.getModel().getProperty("/taxReconciliation/adicoesExclusoes/temporaryDifferences/itens").push(oNewObj);
				this.getModel().refresh();
			},
			
			onNavBack: function () {
				this.getRouter().navTo("taxPackageResumoTrimestre");
			},
			
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			
			navToPage2: function () {
				this.getRouter().navTo("taxPackageListagemEmpresas");
			},
			
			navToPage3: function () {
				this.getRouter().navTo("taxPackageResumoTrimestre");
			},
			
			_initItemsToReport: function () {
				var aItemsToReport = [
					"What is the first fiscal year still open to scrutiny by the tax authorities? If YES, please indicate which year(s).",
					"Is there a tax audit ongoing as at the reporting date? If YES, please indicate which year(s).",
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
						oVBox.addItem(new sap.m.Text({ text: "2017, 2018" }).addStyleClass("sapUiSmallMarginBottom"));
					}
					else {
						oVBox.addItem(new sap.m.TextArea({ width: "100%", rows: 5 }).addStyleClass("sapUiSmallMarginBottom"));
					}
				}
				
				this.byId("containerItemsToReport").addContent(oVBox);
			},
			
			_initTaxReconciliation: function () {
				var that = this;
				
				// Construção do resultado contabil
				var oResultadoContabil = {
					aTemplate: [
						{
							label: "1º Trimestre",
							isEditavel: false,
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
							campo: "Statutory GAAP Profit / (loss) before tax",
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
				
				this._montarTabelaTR(oResultadoContabil, "/taxReconciliation/resultadoContabil", "containerResultadoContabil");
				
				// Construção das adições e exclusões
				var oAdicoes = {
					aTemplate: [
						{
							label: "1º Trimestre",
							isEditavel: false,
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
				
				this._montarTabelaTR(oAdicoes, "/taxReconciliation/adicoesExclusoes/permanentDifferences/itens", "containerAdicoesExclusoes", {
					titulo: "Permanent Differences",
					caminhoOpcoes: "/taxReconciliation/adicoesExclusoes/permanentDifferences/opcoes",
					onNova: that.onNovaAdicao
				});
				
				var oExclusoes = {
					aTemplate: [
						{
							label: "1º Trimestre",
							isEditavel: false,
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
				
				this._montarTabelaTR(oExclusoes, "/taxReconciliation/adicoesExclusoes/temporaryDifferences/itens", "containerAdicoesExclusoes", {
					titulo: "Temporary Differences",
					caminhoOpcoes: "/taxReconciliation/adicoesExclusoes/temporaryDifferences/opcoes",
					onNova: that.onNovaExclusao
				});
				
				// Construção do Resultado Fiscal
				var oResultadoFiscal = {
					aTemplate: [
						{
							label: "1º Trimestre",
							isEditavel: false,
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
				
				this._montarTabelaTR(oResultadoFiscal, "/taxReconciliation/resultadoFiscal", "containerResultadoFiscal");
				
				// Construção do Income Tax
				var oIncomeTax = {
					aTemplate: [
						{
							label: "1º Trimestre",
							isEditavel: false,
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
				
				this._montarTabelaTR(oIncomeTax, "/taxReconciliation/incomeTax", "containerIncomeTax");
				
				var oVBox = new sap.m.VBox();
				
				oVBox.addItem(new sap.m.ObjectIdentifier({
					title: "Please provide details if Tax Return's Income differs from FS"
				}).addStyleClass("sapUiMediumMarginTop"));
				
				oVBox.addItem(new sap.m.TextArea({
					rows: 5,
					width: "100%",
					enabled: false
				}));
				
				this.byId("containerIncomeTax").addContent(oVBox);
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
					/*oToolbar.addContent(new sap.m.ToolbarSpacer());
					oToolbar.addContent(new sap.m.Button({ text: "Nova", icon: "sap-icon://add", type: "Emphasized" }).attachPress(oTable, oAdicaoExclusaoConfig.onNova, this));*/
					// Adicionar onPress do botão
					oTable.setHeaderToolbar(oToolbar);
					
					oTable.addColumn(new sap.m.Column({
						vAlign: "Middle"
					}).setHeader(new sap.m.Text({
						text: "Tipo"
					})));
					
					/*aCells.push(new sap.m.Select({ selectedKey: "{idTipo}" }).bindItems({
						path: oAdicaoExclusaoConfig.caminhoOpcoes,
						template: new sap.ui.core.Item({
							key: "{id}",
							text: "{texto}"
						})
					}));*/
					aCells.push(new sap.m.Text({
						text: "{idTipo}"
					}));
					
					oTable.addColumn(new sap.m.Column({
						vAlign: "Middle"
					}).setHeader(new sap.m.Text({
						text: "Outro"
					})));
					
					aCells.push(new sap.m.Text({
						text: ""
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
			}
		});
	}
);