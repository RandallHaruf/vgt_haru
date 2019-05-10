sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/lib/Validador",
		"sap/ui/core/format/NumberFormat",
		"ui5ns/ui5/lib/jszip",
		"ui5ns/ui5/lib/XLSX",
	],
	function (BaseController, NodeAPI, Utils, Validador, NumberFormat) {
		"use strict";

		return BaseController.extend("ui5ns.ui5.controller.taxPackage.EdicaoTrimestre", {
			onInit: function () {
				//sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR");

				var oModel = new sap.ui.model.json.JSONModel({});
				oModel.setSizeLimit(300);

				this.setModel(oModel);
				this._zerarModel();

				this.getRouter().getRoute("taxPackageEdicaoTrimestre").attachPatternMatched(this._onRouteMatched, this);
			},

			onImportarDados: function (oEvent) {
				var that = this,
					eventSource = oEvent.getSource();
							
				try {
					if (eventSource.getValue()) {
						var file = eventSource.oFileUpload.files[0];
		
						var reader = new FileReader();
		
						reader.onload = function (e) {
							try {
								var data = e.target.result;
			
								var workbook = that._lerPlanilha(data);
			
								var oTaxReconciliation = that.getModel().getProperty("/TaxReconciliation").find(function (obj) {
									return obj.ind_ativo;
								});
								
								var processarDiferenca = function (XL_row_object, sCaminhoDiferencas, sCaminhoOpcaoDiferenca) {
									var sChaveProcurar = "",
										iNumeroOrdemPeriodo = that.getModel().getProperty("/Periodo").numero_ordem;
			
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
										sChaveProcurar = "valor5";
										break;
									case iNumeroOrdemPeriodo >= 6:
										sChaveProcurar = "valor6";
										break;
									}
			
									var aDiferenca = that.getModel().getProperty(sCaminhoDiferencas),
										aOpcaoDiferenca = that.getModel().getProperty(sCaminhoOpcaoDiferenca);
			
									for (var i = 0; i < XL_row_object.length; i++) {
										var objXlsx = XL_row_object[i];
			
										var keys = Object.keys(objXlsx);
			
										if (keys.indexOf('Type') > -1 && objXlsx.KEY) {
											var oDiferencaComOpcaoJaInserida = aDiferenca.find(function (obj) {
												return Number(objXlsx.KEY) === Number(obj["fk_diferenca_opcao.id_diferenca_opcao"]);
											});
			
											if (oDiferencaComOpcaoJaInserida) {
			
												var oOpcaoDiferenca = aOpcaoDiferenca.find(function (obj) {
													return Number(objXlsx.KEY) === obj.id_diferenca_opcao;
												});
												
												if (oOpcaoDiferenca.ind_duplicavel) {
													var novaDiferenca = {};
													novaDiferenca["fk_diferenca_opcao.id_diferenca_opcao"] = objXlsx.KEY;
													novaDiferenca["outro"] = objXlsx.Other;
													novaDiferenca[sChaveProcurar] = Validador.isNumber(objXlsx.Value) ? objXlsx.Value : 0;
			
													aDiferenca.push(novaDiferenca);
												}
												else {
													// Permite alterar o campo outro apenas se estiver importando uma diferença que foi inseria no mesmo período de edição.
													if (Number(iNumeroOrdemPeriodo) === Number(oDiferencaComOpcaoJaInserida.numero_ordem)) {
														oDiferencaComOpcaoJaInserida["outro"] = objXlsx.Other;
													}
													oDiferencaComOpcaoJaInserida[sChaveProcurar] = Validador.isNumber(objXlsx.Value) ? objXlsx.Value : 0;
												}
			
											} 
											else {
												var novaDiferenca = {};
												novaDiferenca["fk_diferenca_opcao.id_diferenca_opcao"] = objXlsx.KEY;
												novaDiferenca["outro"] = objXlsx.Other;
												novaDiferenca[sChaveProcurar] = Validador.isNumber(objXlsx.Value) ? objXlsx.Value : 0;
			
												aDiferenca.push(novaDiferenca);
											}
										}
									}
								};
			
								var processarTaxaMultipla = function (XL_row_object, sCaminhoTaxaMultipla, iIdTipoTaxaMultipla) {
									var aOtherTax = that.getModel().getProperty(sCaminhoTaxaMultipla);
										
									for (var i = 0; i < XL_row_object.length; i++) {
										var objXlsx = XL_row_object[i];
										
										if (objXlsx.Description) {
											aOtherTax.push({
												descricao: objXlsx.Description,
												valor: Validador.isNumber(objXlsx.Value) ? objXlsx.Value : 0,
												"fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla": iIdTipoTaxaMultipla
											});
										}
									}
								};
			
								workbook.SheetNames.forEach(function (sheetName) {
									// Here is your object
									var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
			
									if (sheetName === "Accounting Result" && XL_row_object[0]) {
										
										oTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax =
											Validador.isNumber(XL_row_object[0]["Statutory GAAP Profit / (loss) before tax"]) ? XL_row_object[0][
												"Statutory GAAP Profit / (loss) before tax"
											] : 0;
										oTaxReconciliation.rc_current_income_tax_current_year =
											Validador.isNumber(XL_row_object[0]["Current income tax – Current year"]) ? XL_row_object[0][
												"Current income tax – Current year"
											] : 0;
										oTaxReconciliation.rc_current_income_tax_previous_year =
											Validador.isNumber(XL_row_object[0]["Current income tax – Previous Year"]) ? XL_row_object[0][
												"Current income tax – Previous Year"
											] : 0;
										oTaxReconciliation.rc_deferred_income_tax =
											Validador.isNumber(XL_row_object[0]["Deferred Income Tax"]) ? XL_row_object[0]["Deferred Income Tax"] : 0;
										oTaxReconciliation.rc_non_recoverable_wht =
											Validador.isNumber(XL_row_object[0]["Non- Recoverable WHT"]) ? XL_row_object[0]["Non- Recoverable WHT"] : 0;
											
									} 
									else if (sheetName === "Permanent Differences") {
										processarDiferenca(XL_row_object, "/DiferencasPermanentes", "/DiferencaOpcao/Permanente");
									}
									else if (sheetName === "Temporary Differences") {
										processarDiferenca(XL_row_object, "/DiferencasTemporarias", "/DiferencaOpcao/Temporaria");
									}
									else if (sheetName === "Other Taxes") {
										processarTaxaMultipla(XL_row_object, "/OtherTaxes", 1);
									}
									else if (sheetName === "Tax Incentives") {
										processarTaxaMultipla(XL_row_object, "/IncentivosFiscais", 2);
									}
									else if (sheetName === "WHT") {
										processarTaxaMultipla(XL_row_object, "/WHT", 3);
									}
								});
			
								that.onAplicarRegras();
								eventSource.setValue("");
							}
							catch (err) {
								eventSource.setValue("");
								that._exibirErroImportacao(err.message);
							}
						};
		
						reader.onerror = function (ex) {
							eventSource.setValue("");
							that._exibirErroImportacao(ex.message);
						};
		
						reader.readAsBinaryString(file);
					}
				}
				catch (e) {
					eventSource.setValue("");
					this._exibirErroImportacao(e.message);
				}
			},
			
			_lerPlanilha: function (data) {
				var that = this;
				
				var workbook = XLSX.read(data, {
					type: 'binary'
				});	
				
				try {
					if (workbook.Sheets["Accounting Result"]["A1"].v === "Statutory GAAP Profit / (loss) before tax"
						&& workbook.Sheets["Accounting Result"]["B1"].v === "Current income tax – Current year"
						&& workbook.Sheets["Accounting Result"]["C1"].v === "Current income tax – Previous Year"
						&& workbook.Sheets["Accounting Result"]["D1"].v === "Deferred Income Tax"
						&& workbook.Sheets["Accounting Result"]["E1"].v === "Non- Recoverable WHT"
						&& workbook.Sheets["Temporary Differences"]["A1"].v === "Type"
						&& workbook.Sheets["Temporary Differences"]["B1"].v === "Other"
						&& workbook.Sheets["Temporary Differences"]["C1"].v === "Value"
						&& workbook.Sheets["Temporary Differences"]["AB1"].v === "KEY"
						&& workbook.Sheets["Permanent Differences"]["A1"].v === "Type"
						&& workbook.Sheets["Permanent Differences"]["B1"].v === "Other"
						&& workbook.Sheets["Permanent Differences"]["C1"].v === "Value"
						&& workbook.Sheets["Permanent Differences"]["AB1"].v === "KEY"
						&& workbook.Sheets["Other Taxes"]["A1"].v === "Description"
						&& workbook.Sheets["Other Taxes"]["B1"].v === "Value"
						&& workbook.Sheets["Tax Incentives"]["A1"].v === "Description"
						&& workbook.Sheets["Tax Incentives"]["B1"].v === "Value"
						&& workbook.Sheets["WHT"]["A1"].v === "Description"
						&& workbook.Sheets["WHT"]["B1"].v === "Value"
						&& workbook.Sheets["Dados"]) {
						var ws = workbook.Sheets["Dados"];
						
						var oOpcoesNaPlanilha = Object.keys(ws).reduce(function (results, item) { 
							if (item.indexOf('B') > -1) {
								results.aTemporaria.push(ws[item].v); 
							}
							else if (item.indexOf('E') > -1) {
								results.aPermanente.push(ws[item].v); 
							}
							return results;
						}, { aTemporaria: [], aPermanente: [] });
						
						var checarOpcoes = function (aOpcoesNaPlanilha, sCaminhoOpcoes) {
							var aOpcaoNoBanco = that.getModel().getProperty(sCaminhoOpcoes);
							
							for (var i = 0, length = aOpcoesNaPlanilha.length; i < length; i++) {
								var oBusca = aOpcaoNoBanco.find(function (obj) {
									return obj.id_diferenca_opcao === aOpcoesNaPlanilha[i];
								});
								
								if (!oBusca) {
									throw new Error(that.getResourceBundle().getText("viewGeralPlanilhaForaDoPadrao"));
								}
							}
						};
						
						checarOpcoes(oOpcoesNaPlanilha.aTemporaria, "/DiferencaOpcao/Temporaria");
						checarOpcoes(oOpcoesNaPlanilha.aPermanente, "/DiferencaOpcao/Permanente");
                    
                        that._validarDiferencasDuplicadas(workbook,that);	

						return workbook;	
					}
					else {
						throw new Error(that.getResourceBundle().getText("viewGeralPlanilhaForaDoPadrao"));
					}
				}
				catch (e) {
					console.log("Planilha fora do padrão: " + e.message)
					throw new Error(that.getResourceBundle().getText("viewGeralPlanilhaForaDoPadrao") + ": \n" + e.message);
				}
			},

			_validarDiferencasDuplicadas: function (workbook,that) {
				var verificarAbaDiferenca = function (nomeAba, sCaminhoDiferencas, sCaminhoOpcaoDiferenca){
					var aba = workbook.Sheets[nomeAba];
					var linhasAba = XLSX.utils.sheet_to_row_object_array(aba);
					var aOpcaoDiferenca = that.getModel().getProperty(sCaminhoOpcaoDiferenca);	
					var tiposJaIterados = [];
					for(let i = 0, length = linhasAba.length; i < length; i++ ){
						let linha = linhasAba[i];
						if(linha["KEY"] && linha["Type"]){
							var oDiferencaComTipoJaInserido = false;
							for(let j =0; j < tiposJaIterados.length; j++){
								if(tiposJaIterados[j] == linha["KEY"]){
									oDiferencaComTipoJaInserido = true;
								}
							}
							tiposJaIterados.push(Number(linha["KEY"]));
							if (oDiferencaComTipoJaInserido) {
								var oOpcaoDiferenca = aOpcaoDiferenca.find(function (obj) {
									return Number(linha["KEY"]) === obj.id_diferenca_opcao;
								});
								if(oOpcaoDiferenca["ind_duplicavel"] == false){
									throw new Error(that.getResourceBundle().getText("viewGeralPlanilhaComTipoDuplicadoComIndDuplicadoFalso"));
								}
							}
						}
					}
				}
				verificarAbaDiferenca("Temporary Differences", "/DiferencasTemporarias", "/DiferencaOpcao/Temporaria");
				verificarAbaDiferenca("Permanent Differences", "/DiferencasPermanentes", "/DiferencaOpcao/Permanente");
			},
            
			_exibirErroImportacao: function (sErro) {
				var dialog = new sap.m.Dialog({
					title: this.getResourceBundle().getText("viewGeralMensagemErroImport"),
					type: "Message",
					content: new sap.m.Text({
						text: sErro
					}),
					endButton: new sap.m.Button({
						text: "OK",
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});
	
				dialog.open();
			},

			_adicionarTaxaMultipla: function (sProperty, sFkTipo) {
				this.getModel().getProperty(sProperty).unshift({
					descricao: null,
					descricaoValueState: sap.ui.core.ValueState.Error,
					valor: 0,
					"fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla": sFkTipo
				});

				this.getModel().refresh();
			},

			_excluirTaxaMultipla: function (oEvent, sProperty) {
				var aTaxaMultipla = this.getModel().getProperty(sProperty);
				var oExcluir = oEvent.getSource().getBindingContext().getObject();

				for (var i = 0, length = aTaxaMultipla.length; i < length; i++) {
					if (aTaxaMultipla[i] === oExcluir) {
						aTaxaMultipla.splice(i, 1);
						break;
					}
				}

				this.getModel().refresh();
			},

			_dialogTaxaMultipla: function (sTitulo, sProperty, sFkTipo, isNegativo) {
				var oScrollContainer = new sap.m.ScrollContainer({
					horizontal: true,
					vertical: true,
					height: "330px"
				}).addStyleClass("sapUiNoContentPadding");

				/* Criação da tabela de inserção */
				var oTable = new sap.m.Table();

				/* Toolbar com título da tabela e botão de nova taxa */
				var oToolbar = new sap.m.Toolbar();

				oToolbar.addContent(new sap.m.ObjectIdentifier({
					title: sTitulo
				}));

				oToolbar.addContent(new sap.m.ToolbarSpacer());

				oToolbar.addContent(new sap.m.Button({
					text: this.getResourceBundle().getText("viewGeralNova"),
					icon: "sap-icon://add",
					type: "Emphasized"
				}).attachPress(oTable, function () {
					this._adicionarTaxaMultipla(sProperty, sFkTipo);
				}, this));

				oTable.setHeaderToolbar(oToolbar);

				/* Colunas da tabela */
				oTable.addColumn(new sap.m.Column({
					width: "50px"
				}));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("ViewRelatorioDescricao")
				})));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("viewRelatorioValue")
				})));

				/* Template das células */
				var oBtnExcluir = new sap.m.Button({
					icon: "sap-icon://delete",
					type: "Reject",
					tooltip: "{i18n>viewGeralExcluirLinha}"
				}).attachPress(oTable, function (oEvent2) {
					this._excluirTaxaMultipla(oEvent2, sProperty);
				}, this);

				var oInputDescricao = new sap.m.Input({
					value: "{descricao}",
					valueState: "{descricaoValueState}",
					valueStateText: this.getResourceBundle().getText("viewGeralCampoNaoPodeSerVazio")
				}).attachChange(function (oEvent) {
					var obj = oEvent.getSource().getBindingContext().getObject();
					obj.descricaoValueState = obj.descricao ? sap.ui.core.ValueState.None : sap.ui.core.ValueState.Error;
				});

				var oInputValor = new sap.m.Input({
					textAlign: "End",
					value: "{path: 'valor', type: 'sap.ui.model.type.Float', formatOptions: {minFractionDigits: 2, maxFractionDigits:2}}"
				}).attachChange(function (oEvent) {
					if (this._validarNumeroInserido(oEvent) && isNegativo) {
						var fValorNegativo = Math.abs(this._limparMascara(oEvent.getSource().getValue())) * -1;
						var sValorFormatado = NumberFormat.getFloatInstance({
							minFractionDigits: 2,
							maxFractionDigits: 2
						}).format(fValorNegativo);
						oEvent.getSource().setValue(sValorFormatado);
					}
				}, this);

				var oTemplate = new sap.m.ColumnListItem({
					cells: [oBtnExcluir, oInputDescricao, oInputValor]
				});

				oTable.bindItems({
					path: sProperty,
					template: oTemplate
				});

				oScrollContainer.addContent(oTable);

				var that = this;

				/* Criação do diálogo com base na tabela */
				var dialog = new sap.m.Dialog({
					contentWidth: "500px",
					showHeader: false,
					type: "Message",
					content: oScrollContainer,
					beginButton: new sap.m.Button({
						text: that.getResourceBundle().getText("viewGeralFechar"),
						press: function () {
							var aTaxa = that.getModel().getProperty(sProperty),
								bValido = true;

							if (aTaxa && aTaxa.length) {
								var aTaxaSemDescricao = aTaxa.filter(function (obj) {
									return !obj.descricao;
								});

								if (aTaxaSemDescricao.length) {
									bValido = false;
								}
							}

							if (bValido) {
								dialog.close();
								that.onAplicarRegras();
							} else {
								jQuery.sap.require("sap.m.MessageBox");
								sap.m.MessageBox.show(that.getResourceBundle().getText(
									"ViewDetalheTrimestreJSTextsTodososcamposmarcadossãodepreenchimentoobrigatório"), {
									title: that.getResourceBundle().getText("viewGeralAviso")
								});
							}
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				this.getView().addDependent(dialog);

				dialog.open();
			},

			onEditarOtherTaxes: function (oEvent) {
				this._dialogTaxaMultipla(this.getResourceBundle().getText("viewGeralOthertaxes"), "/OtherTaxes", 1);
			},

			onEditarIncentivosFiscais: function (oEvent) {
				this._dialogTaxaMultipla(this.getResourceBundle().getText("viewGeralIncentivosFiscais"), "/IncentivosFiscais", 2, true);
			},

			onEditarWHT: function (oEvent) {
				this._dialogTaxaMultipla("WHT", "/WHT", 3, true);
			},

			onEditarAntecipacoes: function (oEvent) {
				/* Criação do scroll container */
				var oScrollContainer = new sap.m.ScrollContainer({
					horizontal: true,
					vertical: true,
					height: "400px"
				}).addStyleClass("sapUiNoContentPadding");

				/* Criação do painel com os valores declarados do TTC */
				var oPanelTTC = new sap.m.Panel({
					expandable: true,
					expanded: false,
					headerText: this.getResourceBundle().getText("viewTAXEdicaoTrimestreValoresDeclaradosTTC"),
					width: "auto"
				}).addStyleClass("sapUiResponsiveMargin sapUiNoContentPadding");

				/* Scroll Container da tabela do TTC que pode ser mt grande */
				var oScrollContainerTTC = new sap.m.ScrollContainer({
					horizontal: true
				}).addStyleClass("sapUiNoContentPadding");

				/* Criação da tabela de inserção */
				var oTable = new sap.m.Table();

				/* Colunas da tabela */
				oTable.addColumn(new sap.m.Column({
					width: "50px"
				}));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle",
					width: "150px"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaTax")
				})));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle",
					width: "150px"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("ViewRelatorioDataDePagamento")
				})));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle",
					width: "150px"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaCurrency")
				})));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle",
					width: "110px",
					hAlign: "End"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaPrincipal")
				})));

				/* Template das células */
				var oCheckBox = new sap.m.CheckBox({
					selected: "{selecionado}"
				});

				var oTextNameOfTax = new sap.m.Text({
					text: "{tax}"
				});

				var oTextDataPagamento = new sap.m.Text({
					text: "{data_pagamento}"
				});

				var oTextAcronimo = new sap.m.Text({
					text: "{acronimo}"
				});

				var oTextPrincipal = new sap.m.Text({
					textAlign: "End",
					text: "{path: 'principal', type: 'sap.ui.model.type.Float', formatOptions: {minFractionDigits: 2, maxFractionDigits:2}}"
				});

				var oTemplate = new sap.m.ColumnListItem({
					cells: [oCheckBox, oTextNameOfTax, oTextDataPagamento, oTextAcronimo, oTextPrincipal /*, oTextJuros, oTextMulta, oTextValor*/ ]
				});

				oTable.bindItems({
					path: "/PagamentosTTC",
					template: oTemplate
				});

				oPanelTTC.addContent(oTable);

				/* Criação do painel com os outros pagamentos declarados */
				var oPanelOutros = new sap.m.Panel({
					expandable: true,
					expanded: false,
					headerText: this.getResourceBundle().getText("viewTAXEdicaoTrimestreOutrosPagamentos"),
					width: "auto"
				}).addStyleClass("sapUiResponsiveMargin sapUiNoContentPadding");

				/* Criação da tabela de inserção */
				oTable = new sap.m.Table();

				/* Toolbar com título da tabela e botão de nova taxa */
				var oToolbar = new sap.m.Toolbar();

				oToolbar.addContent(new sap.m.Button({
					text: this.getResourceBundle().getText("viewGeralNova"),
					icon: "sap-icon://add",
					type: "Emphasized"
				}).attachPress(oTable, function () {
					this._adicionarTaxaMultipla("/OutrasAntecipacoes", 4);
				}, this));

				oTable.setHeaderToolbar(oToolbar);

				/* Colunas da tabela */
				oTable.addColumn(new sap.m.Column({
					width: "50px"
				}));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("ViewRelatorioDescricao")
				})));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("viewRelatorioValue")
				})));

				/* Template das células */
				var oBtnExcluir = new sap.m.Button({
					icon: "sap-icon://delete",
					type: "Reject",
					tooltip: "{i18n>viewGeralExcluirLinha}"
				}).attachPress(oTable, function (oEvent2) {
					this._excluirTaxaMultipla(oEvent2, "/OutrasAntecipacoes");
				}, this);

				/*var oInputDescricao = new sap.m.Input({
					value: "{descricao}"
				});*/

				var oInputDescricao = new sap.m.Input({
					value: "{descricao}",
					valueState: "{descricaoValueState}",
					valueStateText: this.getResourceBundle().getText("viewGeralCampoNaoPodeSerVazio")
				}).attachChange(function (oEvent) {
					var obj = oEvent.getSource().getBindingContext().getObject();
					obj.descricaoValueState = obj.descricao ? sap.ui.core.ValueState.None : sap.ui.core.ValueState.Error;
				});

				/*var oInputValor = new sap.m.Input({
					type: "Number",
					value: "{valor}"
				}).attachChange(function (oEvent2) {
					oEvent2.getSource().setValue(Math.abs(oEvent2.getSource().getValue()) * -1);
				});*/

				var oInputValor = new sap.m.Input({
					textAlign: "End",
					value: "{path: 'valor', type: 'sap.ui.model.type.Float', formatOptions: {minFractionDigits: 2, maxFractionDigits:2}}"
				}).attachChange(function (oEvent2) {
					if (this._validarNumeroInserido(oEvent2)) {
						var fValorNegativo = Math.abs(this._limparMascara(oEvent.getSource().getValue())) * -1;
						var sValorFormatado = NumberFormat.getFloatInstance({
							minFractionDigits: 2,
							maxFractionDigits: 2
						}).format(fValorNegativo);
						oEvent.getSource().setValue(sValorFormatado);
					}
				}, this);

				oTemplate = new sap.m.ColumnListItem({
					cells: [oBtnExcluir, oInputDescricao, oInputValor]
				});

				oTable.bindItems({
					path: "/OutrasAntecipacoes",
					template: oTemplate
				});

				oScrollContainerTTC.addContent(oTable);
				oPanelOutros.addContent(oScrollContainerTTC);

				/* Adiciona os paineis ao container de rolagem */
				oScrollContainer.addContent(oPanelTTC);
				oScrollContainer.addContent(oPanelOutros);

				var that = this;

				/* Criação do diálogo com base na tabela */
				var dialog = new sap.m.Dialog({
					contentWidth: "800px",
					showHeader: false,
					type: "Message",
					content: oScrollContainer,
					beginButton: new sap.m.Button({
						text: that.getResourceBundle().getText("viewGeralFechar"),
						press: function () {
							var aTaxa = that.getModel().getProperty("/OutrasAntecipacoes"),
								bValido = true;

							if (aTaxa && aTaxa.length) {
								var aTaxaSemDescricao = aTaxa.filter(function (obj) {
									return !obj.descricao;
								});

								if (aTaxaSemDescricao.length) {
									bValido = false;
								}
							}

							if (bValido) {
								dialog.close();
								that.onAplicarRegras();
							} else {
								jQuery.sap.require("sap.m.MessageBox");
								sap.m.MessageBox.show(that.getResourceBundle().getText(
									"ViewDetalheTrimestreJSTextsTodososcamposmarcadossãodepreenchimentoobrigatório"), {
									title: that.getResourceBundle().getText("viewGeralAviso")
								});
							}
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				}).addStyleClass("sapUiNoContentPadding");

				this.getView().addDependent(dialog);

				dialog.open();
			},

			_adicionarUtilizacaoSchedule: function (sProperty, sFkTipo, iAnoFiscal) {
				this.getModel().getProperty(sProperty).unshift({
					schedule_fy: iAnoFiscal ? iAnoFiscal : null,
					valor: 0,
					obs: null,
					"fk_dominio_schedule_value_utilized_tipo.id_dominio_schedule_value_utilized_tipo": sFkTipo
				});

				this.getModel().refresh();
			},

			_dialogValueUtilized: function (oEvent, sProperty, sScheduleFY, sSchedule, sFkTipo, sTitulo, sValueUtilized, sLabelValueExpired) {
				/*var validarClosingBalanceAposUtilizacao = function (oEv) {
					var obj = oEv.getSource().getBindingContext().getObject(),
						currentFYValuesUtilized = that.getModel().getProperty(sProperty).filter(o => Number(o.schedule_fy) === Number(obj.schedule_fy)),
						totalUtilizedCurrentYear = 0;

					for (var j = 0, length = currentFYValuesUtilized.length; j < length; j++) {
						totalUtilizedCurrentYear += currentFYValuesUtilized[j].valor ? Number(currentFYValuesUtilized[j].valor) : 0;
					}

					var closingBalance = that.getModel().getProperty(sScheduleFY).find((o) => o.key === Number(obj.schedule_fy)).closingBalance;

					alert("Utilized: " + totalUtilizedCurrentYear + " Closing balance: " + closingBalance);

					return (closingBalance + totalUtilizedCurrentYear) >= 0 ? true : false;
				};*/

				/*var aSchedule = this.getModel().getProperty(sSchedule),
					FY = [{}];

				for (var i = 0, length = aSchedule.length; i < length; i++) {
					var oSchedule = aSchedule[i];

					if (Number(oSchedule.fy) !== Number(this.getModel().getProperty("/AnoCalendario").anoCalendario)) {
						FY.push({
							key: oSchedule.fy,
							text: oSchedule.fy,
							closingBalance: oSchedule.closing_balance,
							valueUtilized: oSchedule.current_year_value_utilized
						});
					}
				}*/

				//this.getModel().setProperty(sScheduleFY, FY);

				/*this.getModel().getProperty(sProperty).sort(function (a, b) {
					return (a.schedule_fy > b.schedule_fy) ? -1 : ((b.schedule_fy > a.schedule_fy) ? 1 : 0);
				});*/

				/*var oScrollContainer = new sap.m.ScrollContainer({
					horizontal: true,
					vertical: true,
					height: "400px"
				}).addStyleClass("sapUiNoContentPadding");
				
				// Criação da tabela com a referência de closing balance para cada FY
				var oPanelSaldo = new sap.m.Panel({
					expandable: true,
					expanded: false,
					headerText: "Balanço",
					width: "auto"
				}).addStyleClass("sapUiResponsiveMargin sapUiNoContentPadding");
				
				var oTableSaldo = new sap.m.Table();
				
				oTableSaldo.addColumn(new sap.m.Column({
					vAlign: "Middle"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("viewEdiçãoTrimestreFY")
				})));
				
				oTableSaldo.addColumn(new sap.m.Column({
					vAlign: "Middle"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("viewTaxPackageClosingBalance")
				})));
				
				var oInputFY = new sap.m.Input({
					value: "{text}"
				});
				
				var oInputClosingBalance = new sap.m.Input({
					value: "{closingBalance}"
				});
				
				var oTemplate = new sap.m.ColumnListItem({
					cells: [oInputFY, oInputClosingBalance]
				});

				oTableSaldo.bindItems({
					path: sScheduleFY,
					template: oTemplate
				});
				
				oPanelSaldo.addContent(oTableSaldo);
				
				// Criação da tabela de inserção 
				var oPanelUtilizacoes = new sap.m.Panel({
					expandable: true,
					expanded: false,
					headerText: "Utilizações",
					width: "auto"
				}).addStyleClass("sapUiResponsiveMargin sapUiNoContentPadding");

				//var oScrollContainerUtilizacoes = new sap.m.ScrollContainer({
					//horizontal: true,
					//vertical: true,
					height: "430px"
				//}).addStyleClass("sapUiNoContentPadding");

				var oTable = new sap.m.Table();

				// Toolbar com título da tabela e botão de nova taxa
				var oToolbar = new sap.m.Toolbar();

				oToolbar.addContent(new sap.m.ObjectIdentifier({
					title: sTitulo
				}));

				oToolbar.addContent(new sap.m.ToolbarSpacer());

				oToolbar.addContent(new sap.m.Button({
					text: this.getResourceBundle().getText("viewGeralNova"),
					icon: "sap-icon://add",
					type: "Emphasized"
				}).attachPress(oTable, function () {
					this._adicionarUtilizacaoSchedule(sProperty, sFkTipo);
				}, this));

				oTable.setHeaderToolbar(oToolbar);

				// Colunas da tabela 
				oTable.addColumn(new sap.m.Column({
					width: "50px"
				}));

				oTable.addColumn(new sap.m.Column({
					width: "100px",
					vAlign: "Middle"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("viewEdiçãoTrimestreFY")
				})));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle",
					width: "175px"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("viewGeralValue")
				})));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle",
					width: "175px"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("viewNotificacaoColunaobservacao")
				})));

				// Template das células
				var oBtnExcluir = new sap.m.Button({
					icon: "sap-icon://delete",
					type: "Reject",
					tooltip: "{i18n>viewGeralExcluirLinha}"
				}).attachPress(oTable, function (oEvent2) {
					this._excluirTaxaMultipla(oEvent2, sProperty);
				}, this);

				var oSelectFY = new sap.m.Select({
					selectedKey: "{schedule_fy}"
				}).bindItems({
					templateShareable: false,
					path: sScheduleFY,
					template: new sap.ui.core.ListItem({
						key: "{key}",
						text: "{text}"
					})
				}).attachChange(function (oEvent3) {
					if (validarClosingBalanceAposUtilizacao(oEvent3)) {
						alert('valido');
					} else {
						alert('nao valido');
					}
				});

				var oInputValor = new sap.m.Input({
					textAlign: "End",
					value: "{path: 'valor', type: 'sap.ui.model.type.Float', formatOptions: {minFractionDigits: 2, maxFractionDigits:2}}"
				}).attachChange(function (oEvent2) {
					if (this._validarNumeroInserido(oEvent2)) {
						var fValorNegativo = Math.abs(this._limparMascara(oEvent2.getSource().getValue())) * -1;
						var sValorFormatado = NumberFormat.getFloatInstance({
							minFractionDigits: 2,
							maxFractionDigits: 2
						}).format(fValorNegativo);
						oEvent2.getSource().setValue(sValorFormatado);

						if (validarClosingBalanceAposUtilizacao(oEvent2)) {
							alert('valido');
						} else {
							alert('nao valido');
						}
					}
					//if (this._validarNumeroInserido(oEvent) && isNegativo) {
						//var fValorNegativo = Math.abs(this._limparMascara(oEvent.getSource().getValue())) * -1;
						//var sValorFormatado = NumberFormat.getFloatInstance({minFractionDigits: 2, maxFractionDigits: 2}).format(fValorNegativo);
						//oEvent.getSource().setValue(sValorFormatado);
					//}
				}, this);

				var oInputObservacao = new sap.m.Input({
					value: "{obs}"
				});

				var oTemplate = new sap.m.ColumnListItem({
					cells: [oBtnExcluir, oSelectFY, oInputValor, oInputObservacao]
				});

				oTable.bindItems({
					path: sProperty,
					template: oTemplate
				});

				//oScrollContainerUtilizacoes.addContent(oTable);
				oPanelUtilizacoes.addContent(oTable);

				oScrollContainer.addContent(oPanelSaldo);
				oScrollContainer.addContent(oPanelUtilizacoes);*/

				var that = this;

				var oVBox = new sap.m.VBox();

				oVBox.addItem(new sap.m.Title({
					text: sTitulo,
					titleStyle: "H4",
					wrapping: true
				}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginTop sapUiSmallMarginBottom"));

				var oScrollContainer = new sap.m.ScrollContainer({
					horizontal: true,
					vertical: true,
					height: "430px"
				}).addStyleClass("sapUiNoContentPadding");

				var oTableSaldo = new sap.m.Table();

				/*var oToolbar = new sap.m.Toolbar();

				oToolbar.addContent(new sap.m.ObjectIdentifier({
					title: sTitulo
				}));
				
				oTableSaldo.setHeaderToolbar(oToolbar);*/

				oTableSaldo.addColumn(new sap.m.Column({
					hAlign: "Center",
					vAlign: "Middle",
					width: "35px"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("viewEdiçãoTrimestreFY")
				})));

				/*oTableSaldo.addColumn(new sap.m.Column({
					vAlign: "Middle",
					width: "8rem"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("viewTaxPackageClosingBalance")
				})));*/

				oTableSaldo.addColumn(new sap.m.Column({
					hAlign: "Center",
					vAlign: "Middle",
					width: "4.5rem"
				}).setHeader(new sap.m.Text({
					text: sValueUtilized
				})));

				/*oTableSaldo.addColumn(new sap.m.Column({
					width: "50px"
				}));*/

				var oInputFY = new sap.m.Label({
					text: "{fy}"
				});

				/*var oInputClosingBalance = new sap.m.Input({
					value: "{closing_balance}"
				});*/

				var oHBox = new sap.m.HBox({
					justifyContent: "End",
					alignItems: "Center"
				});

				var oInputValueUtilized = new sap.m.Text({
					text: "{path: 'current_year_value_utilized', type: 'sap.ui.model.type.Float', formatOptions: {minFractionDigits: 2, maxFractionDigits:2}}"
				}).addStyleClass("sapUiSmallMarginEnd");

				var oBtnDetalhes = new sap.m.Button({
					text: this.getResourceBundle().getText("viewGeralDetalhes")
				}).attachPress(function (event) {
					that._dialogDetalhesValueUtilized(event, sProperty, sFkTipo, sLabelValueExpired);
				});

				oHBox.addItem(oInputValueUtilized);
				oHBox.addItem(oBtnDetalhes);

				var oTemplate = new sap.m.ColumnListItem({
					cells: [oInputFY /*, oInputClosingBalance*/ , oHBox /*oInputValueUtilized, oBtnDetalhes*/ ]
				});

				oTableSaldo.bindItems({
					path: sSchedule /*FY*/ ,
					template: oTemplate,
					sorter: new sap.ui.model.Sorter("fy", true),
					filters: [
						new sap.ui.model.Filter("fy", sap.ui.model.FilterOperator.NE, this.getModel().getProperty("/AnoCalendario").anoCalendario)
					]
				});

				oScrollContainer.addContent(oTableSaldo);

				oVBox.addItem(oScrollContainer);

				/* Criação do diálogo com base na tabela */
				var dialog = new sap.m.Dialog({
					contentWidth: "400px",
					showHeader: false,
					type: "Message",
					content: oVBox,
					beginButton: new sap.m.Button({
						text: that.getResourceBundle().getText("viewGeralFechar"),
						press: function () {
							dialog.close();
							//that.onAplicarRegras();
						}
					}),
					afterClose: function () {
						dialog.destroy();
						/*that.onAplicarRegras();
						console.log(that.getModel().getProperty(sProperty));*/
					}
				}).addStyleClass("sapUiNoContentPadding");

				this.getView().addDependent(dialog);

				dialog.open();
			},

			_dialogDetalhesValueUtilized: function (oEvent, sProperty, sFkTipo, sLabelValueExpired) {
				var that = this,
					obj = oEvent.getSource().getBindingContext().getObject(),
					sPathClosingBalance = oEvent.getSource().getBindingContext().getPath() + "/closing_balance",
					sLabelClosingBalance = this.getResourceBundle().getText("viewTaxPackageClosingBalance");

				if (this._isScheduleExpirado(obj)) {
					sPathClosingBalance = oEvent.getSource().getBindingContext().getPath() + "/current_year_value_expired";
					sLabelClosingBalance = sLabelValueExpired;
				}

				var oVBox = new sap.m.VBox();

				var oToolbar = new sap.m.Toolbar();

				//var oHBox = new sap.m.HBox();

				oToolbar.addContent(new sap.m.Label({
					text: sLabelClosingBalance + ": "
				}).addStyleClass("sapUiSmallMarginBegin"));

				oToolbar.addContent(new sap.m.Text({
					textAlign: "End",
					text: "{path: '" + sPathClosingBalance +
						"', type: 'sap.ui.model.type.Float', formatOptions: {minFractionDigits: 2, maxFractionDigits:2}}"
				}));

				//oToolbar.addContent(oHBox);
				oToolbar.addContent(new sap.m.ToolbarSpacer());
				oToolbar.addContent(new sap.m.Button({
					icon: "sap-icon://add"
				}).addStyleClass("sapUiSmallMarginEnd").attachPress(oTable, function () {
					this._adicionarUtilizacaoSchedule(sProperty, sFkTipo, obj.fy);
				}, this));

				oVBox.addItem(oToolbar);

				var oScrollContainer = new sap.m.ScrollContainer({
					horizontal: true,
					vertical: true,
					height: "300px"
				}).addStyleClass("sapUiNoContentPadding");

				var oTable = new sap.m.Table();

				/*var oToolbar = new sap.m.Toolbar();

				oToolbar.addContent(new sap.m.Button({
					text: this.getResourceBundle().getText("viewGeralNova"),
					icon: "sap-icon://add",
					type: "Emphasized"
				}).attachPress(oTable, function () {
					this._adicionarUtilizacaoSchedule(sProperty, sFkTipo, obj.fy);
				}, this));*/

				//oToolbar.addContent(new sap.m.ToolbarSpacer());

				/*oToolbar.addContent(new sap.m.Text({
					textAlign: "End",
					text: "{path: '" + oEvent.getSource().getBindingContext().getPath() + "/closing_balance"
						+ "', type: 'sap.ui.model.type.Float', formatOptions: {minFractionDigits: 2, maxFractionDigits:2}}"
				}).addStyleClass("sapUiSmallMarginEnd"));
				
				oTable.setHeaderToolbar(oToolbar);*/

				// Colunas da tabela 
				oTable.addColumn(new sap.m.Column({
					width: "50px"
				}));

				/*oTable.addColumn(new sap.m.Column({
					width: "100px",
					vAlign: "Middle"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("viewEdiçãoTrimestreFY")
				})));*/

				oTable.addColumn(new sap.m.Column({
						vAlign: "Middle",
						width: "175px"
					})
					/*.setHeader(new sap.m.Text({
										text: this.getResourceBundle().getText("viewGeralValue")
									}))*/
				);

				/*oTable.addColumn(new sap.m.Column({
					vAlign: "Middle",
					width: "175px"
				}).setHeader(new sap.m.Text({
					text: this.getResourceBundle().getText("viewNotificacaoColunaobservacao")
				})));*/

				// Template das células
				var oBtnExcluir = new sap.m.Button({
					icon: "sap-icon://delete",
					type: "Reject",
					tooltip: "{i18n>viewGeralExcluirLinha}"
				}).attachPress(oTable, function (oEvent2) {
					this._excluirTaxaMultipla(oEvent2, sProperty);
					this.onAplicarRegras();
				}, this);

				/*var oSelectFY = new sap.m.Select({
					selectedKey: "{schedule_fy}"
				}).bindItems({
					templateShareable: false,
					path: sScheduleFY,
					template: new sap.ui.core.ListItem({
						key: "{key}",
						text: "{text}"
					})
				}).attachChange(function (oEvent3) {
					if (validarClosingBalanceAposUtilizacao(oEvent3)) {
						alert('valido');
					} else {
						alert('nao valido');
					}
				});*/

				var oInputValor = new sap.m.Input({
					textAlign: "End",
					value: "{path: 'valor', type: 'sap.ui.model.type.Float', formatOptions: {minFractionDigits: 2, maxFractionDigits:2}}"
				}).attachChange(function (oEvent2) {
					if (this._validarNumeroInserido(oEvent2)) {
						var fValorNegativo = Math.abs(this._limparMascara(oEvent2.getSource().getValue())) * -1;
						var sValorFormatado = NumberFormat.getFloatInstance({
							minFractionDigits: 2,
							maxFractionDigits: 2
						}).format(fValorNegativo);

						var closingBalance = this.getModel().getProperty(sPathClosingBalance);

						if (fValorNegativo + closingBalance >= 0) {
							oEvent2.getSource().setValue(sValorFormatado);
						} else {
							oEvent2.getSource().setValue(0);

							var dialog = new sap.m.Dialog({
								title: this.getResourceBundle().getText("viewGeralAviso"),
								type: "Message",
								content: new sap.m.Text({
									text: this.getResourceBundle().getText("viewTAXEdicaoTrimestreMensagemValidacaoUtilizacao", [sLabelClosingBalance])
								}),
								endButton: new sap.m.Button({
									text: "OK",
									press: function () {
										dialog.close();
									}
								}),
								afterClose: function () {
									dialog.destroy();
								}
							});

							dialog.open();
						}

						/*if (validarClosingBalanceAposUtilizacao(oEvent2)) {
							alert('valido');
						} else {
							alert('nao valido');
						}*/
					}
					this.onAplicarRegras();
					//if (this._validarNumeroInserido(oEvent) && isNegativo) {
					//var fValorNegativo = Math.abs(this._limparMascara(oEvent.getSource().getValue())) * -1;
					//var sValorFormatado = NumberFormat.getFloatInstance({minFractionDigits: 2, maxFractionDigits: 2}).format(fValorNegativo);
					//oEvent.getSource().setValue(sValorFormatado);
					//}
				}, this);

				/*var oInputObservacao = new sap.m.Input({
					value: "{obs}"
				});*/

				var oTemplate = new sap.m.ColumnListItem({
					cells: [oBtnExcluir, /*oSelectFY,*/ oInputValor /*, oInputObservacao*/ ]
				});

				oTable.bindItems({
					path: sProperty,
					template: oTemplate,
					filters: [
						new sap.ui.model.Filter("schedule_fy", sap.ui.model.FilterOperator.EQ, obj.fy)
					]
				});

				/*var oBinding = oTable.getBinding("items");
				var oFilter = new sap.ui.model.Filter("text", sap.ui.model.FilterOperator.Contains, obj.text);
				oBinding.filter([oFilter]);*/

				oScrollContainer.addContent(oTable);

				oVBox.addItem(oScrollContainer);

				var dialog = new sap.m.Dialog({
					title: obj.fy,
					contentWidth: "340px",
					content: oVBox,
					endButton: new sap.m.Button({
						text: that.getResourceBundle().getText("viewGeralFechar"),
						press: function () {
							dialog.close();
						}.bind(this)
					}),
					afterClose: function () {
						dialog.destroy();
						that.onAplicarRegras();
					}
				});

				// to get access to the global model
				this.getView().addDependent(dialog);

				dialog.open();
			},

			onEditarOverpaymentFromPriorYearAppliedToCurrentYear: function (oEvent) {
				var that = this;

				var sProperty = "/OverpaymentFromPriorYearAppliedToCurrentYear",
					sScheduleFY = "/CreditScheduleFY",
					sSchedule = "/CreditSchedule",
					sFkTipo = 2;

				this._dialogValueUtilized(oEvent, sProperty, sScheduleFY, sSchedule, sFkTipo, this.getResourceBundle().getText(
						"viewGeralOverpaymentFromPriorYearAppliedToCurrentYear"), this.getResourceBundle().getText(
						"viewEdiçãoTrimestreCurrentYearCreditU"),
					this.getResourceBundle().getText("viewEdiçãoTrimestreCurrentYearCreditE"));
			},

			onEditarTotalLossesUtilized: function (oEvent) {
				var that = this;

				var sProperty = "/TotalLossesUtilized",
					sScheduleFY = "/LossScheduleFY",
					sSchedule = "/LossSchedule",
					sFkTipo = 1;

				this._dialogValueUtilized(oEvent, sProperty, sScheduleFY, sSchedule, sFkTipo, this.getResourceBundle().getText(
						"viewGeralTotalLossesUtilized"), this.getResourceBundle().getText("viewEdiçãoTrimestreCurrentYearLossUtilized"),
					this.getResourceBundle().getText("viewTaxPackageCurrentYearLossExpired"));
			},

			_limparMascara: function (sValor) {
				if (this.isPTBR()) {
					return sValor.replace(/\./g, "").replace(",", ".");
				} else {
					return sValor.replace(/\,/g, "");
				}
			},

			_validarNumeroInserido: function (oEvent) {
				if (oEvent && oEvent.getSource()) {
					if (!Validador.isNumber(this._limparMascara(oEvent.getSource().getValue()))) {
						oEvent.getSource().setValue(0);

						var dialog = new sap.m.Dialog({
							title: this.getResourceBundle().getText("viewGeralAviso"),
							type: "Message",
							content: new sap.m.Text({
								text: this.getResourceBundle().getText("viewGeralValorInseridoNaoValido")
							}),
							endButton: new sap.m.Button({
								text: "OK",
								press: function () {
									dialog.close();
								}
							}),
							afterClose: function () {
								dialog.destroy();
							}
						});

						dialog.open();

						return false;
					} else {
						return true;
					}
				}

				return false;
			},

			onAplicarRegras: function (oEvent) {
				this._validarNumeroInserido(oEvent);

				this._onAplicarFormulasRC();
				this._onCalcularTotalDiferenca();
				this._onCalcularTotalTaxasMultiplas();
				this._onCalcularTotalAntecipacoes();
				this._onAplicarFormulasRF();
				this._onAplicarFormulasIT();
				this._onAplicarFormulasSchedule();
				this._onCalcularTotalSchedule();
				this.getModel().refresh();
			},

			_onAplicarFormulasRC: function () {
				//var oResultadoContabil = oEvent.getSource().getBindingContext().getObject();
				if (this.getModel().getProperty("/TaxReconciliation")) {
					var oResultadoContabil = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
						return obj.ind_ativo === true;
					});

					var fValor1 = oResultadoContabil.rc_statutory_gaap_profit_loss_before_tax ? Number(oResultadoContabil.rc_statutory_gaap_profit_loss_before_tax) :
						0,
						fValor2 = oResultadoContabil.rc_current_income_tax_current_year ? Number(oResultadoContabil.rc_current_income_tax_current_year) :
						0,
						fValor3 = oResultadoContabil.rc_current_income_tax_previous_year ? Number(oResultadoContabil.rc_current_income_tax_previous_year) :
						0,
						fValor4 = oResultadoContabil.rc_deferred_income_tax ? Number(oResultadoContabil.rc_deferred_income_tax) : 0,
						fValor5 = oResultadoContabil.rc_non_recoverable_wht ? Number(oResultadoContabil.rc_non_recoverable_wht) : 0;

					oResultadoContabil.rc_statutory_provision_for_income_tax = fValor2 + fValor3 + fValor4 + fValor5;

					var fValor6 = oResultadoContabil.rc_statutory_provision_for_income_tax ? oResultadoContabil.rc_statutory_provision_for_income_tax :
						0;

					oResultadoContabil.rc_statutory_gaap_profit_loss_after_tax = fValor1 - fValor6;
				}
			},

			_onAplicarFormulasRF: function () {
				if (this.getModel().getProperty("/TaxReconciliation")) {
					var oResultadoFiscal = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
						return obj.ind_ativo === true;
					});

					var fValor1 = oResultadoFiscal.rc_statutory_gaap_profit_loss_before_tax ? Number(oResultadoFiscal.rc_statutory_gaap_profit_loss_before_tax) :
						0,
						fTotalDiferencaPermanente = this.getModel().getProperty("/TotalDiferencaPermanente") ? Number(this.getModel().getProperty(
							"/TotalDiferencaPermanente")) : 0,
						fTotalDiferencaTemporaria = this.getModel().getProperty("/TotalDiferencaTemporaria") ? Number(this.getModel().getProperty(
							"/TotalDiferencaTemporaria")) : 0;

					oResultadoFiscal.rf_taxable_income_loss_before_losses_and_tax_credits = fValor1 + fTotalDiferencaPermanente +
						fTotalDiferencaTemporaria;

					/*oResultadoFiscal.rf_total_losses_utilized = (oResultadoFiscal.rf_total_losses_utilized ? Math.abs(Number(oResultadoFiscal.rf_total_losses_utilized)) :
						0) * -1;*/

					var aTotalLossesUtilized = this.getModel().getProperty("/TotalLossesUtilized");

					if (aTotalLossesUtilized) {
						var fTotalLossesUtilized = 0;

						for (var i = 0, length = aTotalLossesUtilized.length; i < length; i++) {
							var oTotalLossesUtilized = aTotalLossesUtilized[i];

							fTotalLossesUtilized += oTotalLossesUtilized.valor ? Number(oTotalLossesUtilized.valor) : 0;
						}

						oResultadoFiscal.rf_total_losses_utilized = fTotalLossesUtilized;
					}

					oResultadoFiscal.rf_taxable_income_loss_after_losses = oResultadoFiscal.rf_taxable_income_loss_before_losses_and_tax_credits +
						oResultadoFiscal.rf_total_losses_utilized;

					oResultadoFiscal.it_statutory_tax_rate_average = oResultadoFiscal.it_statutory_tax_rate_average ? Number(oResultadoFiscal.it_statutory_tax_rate_average) :
						0;
					oResultadoFiscal.it_jurisdiction_tax_rate_average = oResultadoFiscal.it_jurisdiction_tax_rate_average ? Number(oResultadoFiscal.it_jurisdiction_tax_rate_average) :
						0;

					if (oResultadoFiscal.rf_taxable_income_loss_after_losses > 0) {
						if (oResultadoFiscal.it_statutory_tax_rate_average) {
							oResultadoFiscal.rf_income_tax_before_other_taxes_and_credits =
								oResultadoFiscal.rf_taxable_income_loss_after_losses * (oResultadoFiscal.it_statutory_tax_rate_average / 100);
						} else if (oResultadoFiscal.it_jurisdiction_tax_rate_average) {
							oResultadoFiscal.rf_income_tax_before_other_taxes_and_credits =
								oResultadoFiscal.rf_taxable_income_loss_after_losses * (oResultadoFiscal.it_jurisdiction_tax_rate_average / 100);
						} else {
							oResultadoFiscal.rf_income_tax_before_other_taxes_and_credits = 0;
						}
					} else {
						oResultadoFiscal.rf_income_tax_before_other_taxes_and_credits = 0;
					}

					var fValor2 = oResultadoFiscal.rf_other_taxes ? Number(oResultadoFiscal.rf_other_taxes) : 0,
						fValor3 = oResultadoFiscal.rf_incentivos_fiscais ? Number(oResultadoFiscal.rf_incentivos_fiscais) : 0;

					oResultadoFiscal.rf_total_other_taxes_and_tax_credits = fValor2 + fValor3;

					oResultadoFiscal.rf_net_local_tax = (oResultadoFiscal.rf_total_other_taxes_and_tax_credits ? Number(oResultadoFiscal.rf_total_other_taxes_and_tax_credits) :
						0) + (oResultadoFiscal.rf_income_tax_before_other_taxes_and_credits ? Number(oResultadoFiscal.rf_income_tax_before_other_taxes_and_credits) :
						0);

					/*oResultadoFiscal.rf_overpayment_from_prior_year_applied_to_current_year = oResultadoFiscal.rf_overpayment_from_prior_year_applied_to_current_year ?
						Math.abs(oResultadoFiscal.rf_overpayment_from_prior_year_applied_to_current_year) * -1 : 0;*/

					var aOverpaymentFromPriorYearAppliedToCurrentYear = this.getModel().getProperty("/OverpaymentFromPriorYearAppliedToCurrentYear");

					if (aOverpaymentFromPriorYearAppliedToCurrentYear) {
						var fOverpaymentFromPriorYearAppliedToCurrentYear = 0;

						for (var i = 0, length = aOverpaymentFromPriorYearAppliedToCurrentYear.length; i < length; i++) {
							var oOverpaymentFromPriorYearAppliedToCurrentYear = aOverpaymentFromPriorYearAppliedToCurrentYear[i];

							fOverpaymentFromPriorYearAppliedToCurrentYear += oOverpaymentFromPriorYearAppliedToCurrentYear.valor ? Number(
								oOverpaymentFromPriorYearAppliedToCurrentYear.valor) : 0;
						}

						oResultadoFiscal.rf_overpayment_from_prior_year_applied_to_current_year = fOverpaymentFromPriorYearAppliedToCurrentYear;
					}

					var fRfNetLocalTax = oResultadoFiscal.rf_net_local_tax ? Number(oResultadoFiscal.rf_net_local_tax) : 0,
						fRfWHT = oResultadoFiscal.rf_wht ? Number(oResultadoFiscal.rf_wht) : 0,
						fRfOverpaymentFromPriorYearAppliedToCurrentYear = oResultadoFiscal.rf_overpayment_from_prior_year_applied_to_current_year ?
						Number(oResultadoFiscal.rf_overpayment_from_prior_year_applied_to_current_year) : 0,
						fRfTotalInterimTaxesPaymentsAntecipacoes = oResultadoFiscal.rf_total_interim_taxes_payments_antecipacoes ? Number(
							oResultadoFiscal.rf_total_interim_taxes_payments_antecipacoes) : 0;

					oResultadoFiscal.rf_tax_due_overpaid = fRfNetLocalTax + fRfWHT + fRfOverpaymentFromPriorYearAppliedToCurrentYear +
						fRfTotalInterimTaxesPaymentsAntecipacoes;
				}
			},

			_onAplicarFormulasIT: function () {
				if (this.getModel().getProperty("/TaxReconciliation")) {
					var oIncomeTax = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
						return obj.ind_ativo === true;
					});

					var fRcStatutoryProvisionForIncomeTax = oIncomeTax.rc_statutory_provision_for_income_tax ? Number(oIncomeTax.rc_statutory_provision_for_income_tax) :
						0,
						fValor2 = oIncomeTax.rf_income_tax_before_other_taxes_and_credits ? Number(oIncomeTax.rf_income_tax_before_other_taxes_and_credits) :
						0;

					oIncomeTax.it_income_tax_as_per_the_statutory_financials = fRcStatutoryProvisionForIncomeTax;
					oIncomeTax.it_income_tax_as_per_the_tax_return = fValor2;

					var fRcStatutoryGaapProfitLossBeforeTax = oIncomeTax.rc_statutory_gaap_profit_loss_before_tax ? Number(oIncomeTax.rc_statutory_gaap_profit_loss_before_tax) :
						0,
						fValor4 = oIncomeTax.rf_net_local_tax ? Number(oIncomeTax.rf_net_local_tax) : 0;

					if (fRcStatutoryGaapProfitLossBeforeTax !== 0) {
						oIncomeTax.it_effective_tax_rate_as_per_the_statutory_financials = /*Number(parseFloat(*/ (fRcStatutoryProvisionForIncomeTax /
							fRcStatutoryGaapProfitLossBeforeTax) /*).toFixed(2))*/ * 100;
						oIncomeTax.it_effective_tax_rate_as_per_the_tax_return = /*Number(parseFloat(*/ (fValor4 / fRcStatutoryGaapProfitLossBeforeTax)
							/*).toFixed(
														2))*/
							* 100;
					} else {
						if (fRcStatutoryProvisionForIncomeTax > 0) {
							oIncomeTax.it_effective_tax_rate_as_per_the_statutory_financials = 100;
						}
						if (fValor4 > 0) {
							oIncomeTax.it_effective_tax_rate_as_per_the_tax_return = 100;
						}
					}

					var fValor5 = oIncomeTax.it_income_tax_as_per_the_statutory_financials,
						fValor6 = oIncomeTax.it_income_tax_as_per_the_tax_return;

					// Se os impostos forem iguais
					if (fValor5 === fValor6) {
						// Não pede detalhes
						this.byId("textAreaIncomeTaxDetails").setEnabled(false);
					}
					// Se qualquer um dos dois forem 0
					else if (fValor5 === 0 || fValor6 === 0) {
						// pede detalhes
						this.byId("textAreaIncomeTaxDetails").setEnabled(true);
					} else {
						var variacao = fValor5 / fValor6;

						// Se a variação entre eles for menor que 0
						if (variacao < 0) {
							// pede detalhes
							this.byId("textAreaIncomeTaxDetails").setEnabled(true);
						}
						// Se eles exibirem 20% de diferença para mais ou para menos
						else if (variacao >= 1.2 || variacao <= 0.8) {
							// pede detalhe
							this.byId("textAreaIncomeTaxDetails").setEnabled(true);
						}
						// Se não
						else {
							// não pede detalhe
							this.byId("textAreaIncomeTaxDetails").setEnabled(false);
						}
					}

					// Se o IncomeTaxDetails estiver habilitado significa que ele é obrigatório!
					if (this.byId("textAreaIncomeTaxDetails").getEnabled()) {
						// Se estiver vazio, avisa ao usuário que o preenchimento é obrigatório
						if (!this.byId("textAreaIncomeTaxDetails").getValue()) {
							this.getModel().setProperty("/IncomeTaxDetailsValueState", sap.ui.core.ValueState.Error);
						} else {
							// Se estiver preenchido nao exibe/remove o aviso de obrigatoriedade
							this.getModel().setProperty("/IncomeTaxDetailsValueState", sap.ui.core.ValueState.None);
						}
					} else {
						// Se o IncomeTaxDetails não estiver habilitado ele não é editável, então limpa o campo e remove aviso de obrigatoriedade
						this.byId("textAreaIncomeTaxDetails").setValue("");
						this.getModel().setProperty("/IncomeTaxDetailsValueState", sap.ui.core.ValueState.None);
					}
				}
			},

			// @NOVO_SCHEDULE - descomentar
			_onAplicarFormulasSchedule: function () {
				var that = this;

				var oTaxReconciliation = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
					return obj.ind_ativo === true;
				});

				// Loss Schedule
				var aLossSchedule = this.getModel().getProperty("/LossSchedule");

				if (oTaxReconciliation && aLossSchedule) {
					var oLossScheduleCorrente = aLossSchedule.find(function (obj) {
						return obj.ind_corrente === true;
					});

					// rf_taxable_income_loss_before_losses_and_tax_credits é declarado para o ano que está sendo editado,
					// portanto vira current_year_loss apenas para o retrato do ano equivalente no loss schedule
					if (oLossScheduleCorrente) {
						if (oTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits < 0) {
							//oLossScheduleCorrente.current_year_value = oTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits;
							// 30/01/2019 @pedsf - Foi pedido para alterar a forma como o valor é transferido para o Loss Schedule,
							// caso ele seja negativo, ele é transferido como valor ABSOLUTO (ignorando sinal)!
							oLossScheduleCorrente.current_year_value = Math.abs(oTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits);
						} else {
							oLossScheduleCorrente.current_year_value = 0;
						}
					}

					var aTotalLossesUtilized = this.getModel().getProperty("/TotalLossesUtilized");

					for (var i = 0, length = aLossSchedule.length; i < length; i++) {
						var oLossSchedule = aLossSchedule[i];

						if (oLossSchedule) {
							/*oLossSchedule.current_year_value_utilized = oTaxReconciliation.rf_total_losses_utilized ? Number(oTaxReconciliation.rf_total_losses_utilized) :
								0;*/

							var fCurrentScheduleLossesUtilized = 0,
								aCurrentScheduleLossesUtilized = aTotalLossesUtilized.filter(function (o) {
									return Number(o.schedule_fy) === Number(oLossSchedule.fy);
								});

							for (var j = 0, length2 = aCurrentScheduleLossesUtilized.length; j < length2; j++) {
								fCurrentScheduleLossesUtilized += aCurrentScheduleLossesUtilized[j].valor ? Number(aCurrentScheduleLossesUtilized[j].valor) : 0;
							}

							oLossSchedule.current_year_value_utilized = fCurrentScheduleLossesUtilized;

							var valor1 = oLossSchedule.opening_balance ? Number(oLossSchedule.opening_balance) : 0,
								valor2 = oLossSchedule.current_year_value ? Number(oLossSchedule.current_year_value) : 0,
								valor3 = oLossSchedule.current_year_value_utilized ? Number(oLossSchedule.current_year_value_utilized) : 0,
								valor4 = oLossSchedule.adjustments ? Number(oLossSchedule.adjustments) : 0;
							/*,
															valor5 = oLossSchedule.current_year_value_expired ? Number(oLossSchedule.current_year_value_expired) : 0;
															
														oLossSchedule.closing_balance = valor1 + valor2 + valor3 + valor4 + valor5;*/

							// Se for um retrato expirando, o value expired passsa a agir como closing_balance
							if (that._isScheduleExpirado(oLossSchedule)) {
								oLossSchedule.current_year_value_expired = valor1 + valor2 + valor3 + valor4;
								oLossSchedule.closing_balance = 0;
							} else {
								oLossSchedule.closing_balance = valor1 + valor2 + valor3 + valor4;
							}

							oLossSchedule.justificativaEnabled =
								Validador.isNumber(oLossSchedule.adjustments) && Number(oLossSchedule.adjustments) !== 0 ? true : false;

							oLossSchedule.justificativaValueState =
								oLossSchedule.justificativaEnabled ? oLossSchedule.justificativa ? sap.ui.core.ValueState.None : sap.ui.core.ValueState.Error :
								sap.ui.core.ValueState.None;

							if (!oLossSchedule.justificativaEnabled) {
								oLossSchedule.justificativa = "";
							}
						}
					}
				}

				// Credit Schedule
				var aCreditSchedule = this.getModel().getProperty("/CreditSchedule");

				if (oTaxReconciliation && aCreditSchedule) {
					var oCreditScheduleCorrente = aCreditSchedule.find(function (obj) {
						return obj.ind_corrente === true;
					});

					// rf_tax_due_overpaid é declarado para o ano que está sendo editado,
					// portanto vira current_year_credit apenas para o retrato do ano equivalente no credit schedule
					if (oCreditScheduleCorrente) {
						if (oTaxReconciliation.rf_tax_due_overpaid < 0) {
							oCreditScheduleCorrente.current_year_value = Math.abs(oTaxReconciliation.rf_tax_due_overpaid);
						} else {
							oCreditScheduleCorrente.current_year_value = 0;
						}
					}

					var aOverpayment = this.getModel().getProperty("/OverpaymentFromPriorYearAppliedToCurrentYear");

					for (var i = 0, length = aCreditSchedule.length; i < length; i++) {
						var oCreditSchedule = aCreditSchedule[i];

						if (oCreditSchedule) {
							/*oCreditSchedule.current_year_value_utilized = oTaxReconciliation.rf_overpayment_from_prior_year_applied_to_current_year ? Number(
								oTaxReconciliation.rf_overpayment_from_prior_year_applied_to_current_year) : 0;*/

							var fCurrentScheduleCreditUtilized = 0,
								aCurrentScheduleCreditUtilized = aOverpayment.filter(function (o) {
									return Number(o.schedule_fy) === Number(oCreditSchedule.fy);
								});

							for (var j = 0, length2 = aCurrentScheduleCreditUtilized.length; j < length2; j++) {
								fCurrentScheduleCreditUtilized += aCurrentScheduleCreditUtilized[j].valor ? Number(aCurrentScheduleCreditUtilized[j].valor) : 0;
							}

							oCreditSchedule.current_year_value_utilized = fCurrentScheduleCreditUtilized;

							var valor6 = oCreditSchedule.opening_balance ? Number(oCreditSchedule.opening_balance) : 0,
								valor7 = oCreditSchedule.current_year_value ? Number(oCreditSchedule.current_year_value) : 0,
								valor8 = oCreditSchedule.current_year_value_utilized ? Number(oCreditSchedule.current_year_value_utilized) : 0,
								valor9 = oCreditSchedule.adjustments ? Number(oCreditSchedule.adjustments) : 0;
							/*,
															valor10 = oCreditSchedule.current_year_value_expired ? Number(oCreditSchedule.current_year_value_expired) : 0;

														oCreditSchedule.closing_balance = valor6 + valor7 + valor8 + valor9 + valor10;*/

							// Se for um retrato expirando, o value expired passsa a agir como closing_balance
							if (that._isScheduleExpirado(oCreditSchedule)) {
								oCreditSchedule.current_year_value_expired = valor6 + valor7 + valor8 + valor9;
								oCreditSchedule.closing_balance = 0;
							} else {
								oCreditSchedule.closing_balance = valor6 + valor7 + valor8 + valor9;
							}

							oCreditSchedule.justificativaEnabled =
								Validador.isNumber(oCreditSchedule.adjustments) && Number(oCreditSchedule.adjustments) !== 0 ? true : false;

							oCreditSchedule.justificativaValueState =
								oCreditSchedule.justificativaEnabled ? oCreditSchedule.justificativa ? sap.ui.core.ValueState.None : sap.ui.core.ValueState.Error :
								sap.ui.core.ValueState.None;

							if (!oCreditSchedule.justificativaEnabled) {
								oCreditSchedule.justificativa = "";
							}
						}
					}
				}
			},

			/*
			// @NOVO_SCHEDULE - comentar
			_onAplicarFormulasSchedule: function () {

				var oTaxReconciliation = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
					return obj.ind_ativo === true;
				});

				if (this.getModel().getProperty("/LossSchedule")) {
					// Loss Schedule
					var oLossSchedule = this.getModel().getProperty("/LossSchedule").find(function (obj) {
						return obj.ind_corrente === true;
					});

					if (oLossSchedule) {
						if (oTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits < 0) {
							oLossSchedule.current_year_value = oTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits;
						} else {
							oLossSchedule.current_year_value = 0;
						}

						oLossSchedule.current_year_value_utilized = oTaxReconciliation.rf_total_losses_utilized ? Number(oTaxReconciliation.rf_total_losses_utilized) :
							0;

						var valor1 = oLossSchedule.opening_balance ? Number(oLossSchedule.opening_balance) : 0,
							valor2 = oLossSchedule.current_year_value ? Number(oLossSchedule.current_year_value) : 0,
							valor3 = oLossSchedule.current_year_value_utilized ? Number(oLossSchedule.current_year_value_utilized) : 0,
							valor4 = oLossSchedule.adjustments ? Number(oLossSchedule.adjustments) : 0,
							valor5 = oLossSchedule.current_year_value_expired ? Number(oLossSchedule.current_year_value_expired) : 0;

						oLossSchedule.closing_balance = valor1 + valor2 + valor3 + valor4 + valor5;
					}

					for (var i = 0, length = this.getModel().getProperty("/LossSchedule").length; i < length; i++) {
						var oLossSchedule = this.getModel().getProperty("/LossSchedule")[i];

						oLossSchedule.justificativaEnabled = (oLossSchedule.ind_corrente && oLossSchedule.adjustments) ? true : false;
					}
				}

				// Credit Schedule
				if (this.getModel().getProperty("/CreditSchedule")) {
					var oCreditSchedule = this.getModel().getProperty("/CreditSchedule").find(function (obj) {
						return obj.ind_corrente === true;
					});

					if (oCreditSchedule) {
						if (oTaxReconciliation.rf_tax_due_overpaid < 0) {
							oCreditSchedule.current_year_value = Math.abs(oTaxReconciliation.rf_tax_due_overpaid);
						} else {
							oCreditSchedule.current_year_value = 0;
						}

						oCreditSchedule.current_year_value_utilized = oTaxReconciliation.rf_overpayment_from_prior_year_applied_to_current_year ? Number(
							oTaxReconciliation.rf_overpayment_from_prior_year_applied_to_current_year) : 0;

						var valor6 = oCreditSchedule.opening_balance ? Number(oCreditSchedule.opening_balance) : 0,
							valor7 = oCreditSchedule.current_year_value ? Number(oCreditSchedule.current_year_value) : 0,
							valor8 = oCreditSchedule.current_year_value_utilized ? Number(oCreditSchedule.current_year_value_utilized) : 0,
							valor9 = oCreditSchedule.adjustments ? Number(oCreditSchedule.adjustments) : 0,
							valor10 = oCreditSchedule.current_year_value_expired ? Number(oCreditSchedule.current_year_value_expired) : 0;

						oCreditSchedule.closing_balance = valor6 + valor7 + valor8 + valor9 + valor10;
					}

					for (var i = 0, length = this.getModel().getProperty("/CreditSchedule").length; i < length; i++) {
						var oCreditSchedule = this.getModel().getProperty("/CreditSchedule")[i];

						oCreditSchedule.justificativaEnabled = (oCreditSchedule.ind_corrente && oCreditSchedule.adjustments) ? true : false;
					}
				}
			},*/

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
					sChaveProcurar = "valor5";
					break;
				case iNumeroOrdemPeriodo >= 6:
					sChaveProcurar = "valor6";
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

			_onCalcularTotalSchedule: function () {
				if (this.getModel().getProperty("/LossSchedule") && this.getModel().getProperty("/LossSchedule").length > 0) {

					var aLossSchedule = this.getModel().getProperty("/LossSchedule"),
						length = this.getModel().getProperty("/LossSchedule").length;

					var fTotalOpeningBalance = 0;
					var fTotalCurrentYearValue = 0;
					var fTotalCurrentYearValueUtilized = 0;
					var fTotalAdjustments = 0;
					var fTotalCurrentYearValueExpired = 0;
					var fTotalClosingBalance = 0;

					for (var i = 0; i < length; i++) {
						var oLossSchedule = aLossSchedule[i];

						fTotalOpeningBalance += oLossSchedule.opening_balance ? Number(oLossSchedule.opening_balance) : 0;
						fTotalCurrentYearValue += oLossSchedule.current_year_value ? Number(oLossSchedule.current_year_value) : 0;
						fTotalCurrentYearValueUtilized += oLossSchedule.current_year_value_utilized ? Number(oLossSchedule.current_year_value_utilized) :
							0;
						fTotalAdjustments += oLossSchedule.adjustments ? Number(oLossSchedule.adjustments) : 0;
						fTotalCurrentYearValueExpired += oLossSchedule.current_year_value_expired ? Number(oLossSchedule.current_year_value_expired) : 0;
						fTotalClosingBalance += oLossSchedule.closing_balance ? Number(oLossSchedule.closing_balance) : 0;
					}

					this.getModel().setProperty("/TotalLossSchedule/opening_balance", fTotalOpeningBalance);
					this.getModel().setProperty("/TotalLossSchedule/current_year_value", fTotalCurrentYearValue);
					this.getModel().setProperty("/TotalLossSchedule/current_year_value_utilized", fTotalCurrentYearValueUtilized);
					this.getModel().setProperty("/TotalLossSchedule/adjustments", fTotalAdjustments);
					this.getModel().setProperty("/TotalLossSchedule/current_year_value_expired", fTotalCurrentYearValueExpired);
					this.getModel().setProperty("/TotalLossSchedule/closing_balance", fTotalClosingBalance);
				}

				if (this.getModel().getProperty("/CreditSchedule") && this.getModel().getProperty("/CreditSchedule").length > 0) {

					var aCreditSchedule = this.getModel().getProperty("/CreditSchedule"),
						length = this.getModel().getProperty("/CreditSchedule").length;

					var fTotalOpeningBalance = 0;
					var fTotalCurrentYearValue = 0;
					var fTotalCurrentYearValueUtilized = 0;
					var fTotalAdjustments = 0;
					var fTotalCurrentYearValueExpired = 0;
					var fTotalClosingBalance = 0;

					for (var i = 0; i < length; i++) {
						var oCreditSchedule = aCreditSchedule[i];

						fTotalOpeningBalance += oCreditSchedule.opening_balance ? Number(oCreditSchedule.opening_balance) : 0;
						fTotalCurrentYearValue += oCreditSchedule.current_year_value ? Number(oCreditSchedule.current_year_value) : 0;
						fTotalCurrentYearValueUtilized += oCreditSchedule.current_year_value_utilized ? Number(oCreditSchedule.current_year_value_utilized) :
							0;
						fTotalAdjustments += oCreditSchedule.adjustments ? Number(oCreditSchedule.adjustments) : 0;
						fTotalCurrentYearValueExpired += oCreditSchedule.current_year_value_expired ? Number(oCreditSchedule.current_year_value_expired) :
							0;
						fTotalClosingBalance += oCreditSchedule.closing_balance ? Number(oCreditSchedule.closing_balance) : 0;
					}

					this.getModel().setProperty("/TotalCreditSchedule/opening_balance", fTotalOpeningBalance);
					this.getModel().setProperty("/TotalCreditSchedule/current_year_value", fTotalCurrentYearValue);
					this.getModel().setProperty("/TotalCreditSchedule/current_year_value_utilized", fTotalCurrentYearValueUtilized);
					this.getModel().setProperty("/TotalCreditSchedule/adjustments", fTotalAdjustments);
					this.getModel().setProperty("/TotalCreditSchedule/current_year_value_expired", fTotalCurrentYearValueExpired);
					this.getModel().setProperty("/TotalCreditSchedule/closing_balance", fTotalClosingBalance);
				}
			},

			_onCalcularTotalTaxasMultiplas: function () {
				if (this.getModel().getProperty("/TaxReconciliation")) {
					var oTaxReconciliation = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
						return obj.ind_ativo === true;
					});

					if (oTaxReconciliation) {
						var iTotalOtherTax = this._onCalcularTotalTaxaMultipla("/OtherTaxes");
						var iTotalIncentivosFiscais = this._onCalcularTotalTaxaMultipla("/IncentivosFiscais");
						var iTotalWHT = this._onCalcularTotalTaxaMultipla("/WHT");

						oTaxReconciliation.rf_other_taxes = iTotalOtherTax;
						oTaxReconciliation.rf_incentivos_fiscais = iTotalIncentivosFiscais;
						oTaxReconciliation.rf_wht = iTotalWHT;
					}
				}
			},

			_onCalcularTotalTaxaMultipla: function (sProperty) {
				var aTaxaMultipla = this.getModel().getProperty(sProperty),
					iTotalTaxaMultipla = 0;

				if (aTaxaMultipla) {
					for (var i = 0, length = aTaxaMultipla.length; i < length; i++) {
						iTotalTaxaMultipla += (aTaxaMultipla[i].valor ? Number(aTaxaMultipla[i].valor) : 0);
					}
				}

				return iTotalTaxaMultipla;
			},

			_onCalcularTotalAntecipacoes: function () {
				if (this.getModel().getProperty("/TaxReconciliation")) {
					var oTaxReconciliation = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
						return obj.ind_ativo === true;
					});

					if (oTaxReconciliation) {
						var aAntecipacao = this.getModel().getProperty("/PagamentosTTC"),
							aOutrasAntecipacoes = this.getModel().getProperty("/OutrasAntecipacoes"),
							fTotalAntecipacao = 0;

						if (aAntecipacao) {
							for (var i = 0, length = aAntecipacao.length; i < length; i++) {
								fTotalAntecipacao += ((aAntecipacao[i].selecionado && aAntecipacao[i].principal) ? Math.abs(Number(aAntecipacao[i].principal)) *
									-1 : 0);
							}
						}

						if (aOutrasAntecipacoes) {
							for (var i = 0, length = aOutrasAntecipacoes.length; i < length; i++) {
								fTotalAntecipacao += (aOutrasAntecipacoes[i].valor ? Number(aOutrasAntecipacoes[i].valor) : 0);
							}
						}

						oTaxReconciliation.rf_total_interim_taxes_payments_antecipacoes = Math.abs(fTotalAntecipacao) * -1;
					}
				}
			},

			onTrocarDiferenca: function (oEvent) {
				var sPath = oEvent.getSource().getBindingContext().getPath().indexOf("Permanentes") !== -1 ? "/DiferencasPermanentes" :
					"/DiferencasTemporarias",
					oOpcaoSelecionada = oEvent.getParameters("selectedItem").selectedItem.getBindingContext().getObject();

				if (oOpcaoSelecionada.id_diferenca_opcao && !oOpcaoSelecionada.ind_duplicavel) {
					var aObjetoComEssaOpcao = this.getModel().getProperty(sPath).filter(function (obj) {
						return Number(obj["fk_diferenca_opcao.id_diferenca_opcao"]) === Number(oOpcaoSelecionada.id_diferenca_opcao);
					});

					if (aObjetoComEssaOpcao.length > 1) {
						jQuery.sap.require("sap.m.MessageBox");

						sap.m.MessageBox.show(this.getResourceBundle().getText("viewTAXEdicaoTrimestreMensagemValidacaoDiferencaDuplicada"), {
							title: this.getResourceBundle().getText("viewGeralAviso")
						});

						oEvent.getSource().getBindingContext().getObject()["fk_diferenca_opcao.id_diferenca_opcao"] = null;
					}
				}
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
				var that = this,
					oExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());

				this._onExcluirDiferenca(oExcluir, "/DiferencasPermanentes", function () {
					// Se nao foi uma diferença recém adicionada e não persistida no banco, adiciona a lista de exclusões.
					if (!oExcluir.nova) {
						that.getModel().getProperty("/DiferencasPermanentesExcluidas").push(oExcluir.id_diferenca);
					}
				});
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
				var that = this,
					oExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());

				this._onExcluirDiferenca(oExcluir, "/DiferencasTemporarias", function () {
					// Se nao foi uma diferença recém adicionada e não persistida no banco, adiciona a lista de exclusões.
					if (!oExcluir.nova) {
						that.getModel().getProperty("/DiferencasTemporariasExcluidas").push(oExcluir.id_diferenca);
					}
				});
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

			_onExcluirDiferenca: function (oExcluir, sProperty, callbackConfirmacao) {
				var that = this;

				jQuery.sap.require("sap.m.MessageBox");

				sap.m.MessageBox.confirm(this.getResourceBundle().getText("ViewDetalheTrimestreJSTextsVocetemcertezaquedesejaexcluiralinha"), {
					title: this.getResourceBundle().getText("ViewDetalheTrimestreJSTextsConfirmation"),
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

							if (callbackConfirmacao) {
								callbackConfirmacao();
							}
						}
					}
				});
			},

			onSalvarFechar: function (oEvent) {
				var that = this;

				this._salvar(oEvent, function (response) {
					if (response.success) {
						that._navToResumoTrimestre();
					} else {
						sap.m.MessageToast.show("Erro ao salvar");
					}
				});
			},

			onSalvar: function (oEvent) {
				var that = this;
				this._salvar(oEvent, function (response) {
					if (response.success) {
						sap.m.MessageToast.show(that.getResourceBundle().getText("viewDetalheTrimestreSalvoSucesso"));

						that._atualizarDados();
					} else {
						sap.m.MessageToast.show(that.getResourceBundle().getText("viewEdiçãoTrimestreTaxJSErro"));
					}
				});
			},

			onCancelar: function (oEvent) {
				var that = this;
				this._confirmarCancelamento(function () {
					if (that.getModel().getProperty('/CopiaRealizada')) {
						that._limparCopia(function () {
							that._navToResumoTrimestre();	
						});
					}
					else {
						that._navToResumoTrimestre();
					}
				});
			},
			
			_initItemsToReport: function (sIdRelTaxPackagePeriodo) {
				var that = this;

				this.byId("containerItemsToReport2").removeAllContent();
				this.setBusy(this.byId("containerItemsToReport2"), true);
				
				var oModel = [];

				NodeAPI.listarRegistros("ItemToReport", function (response) {
					if (response) {
						var oItemToReport, oHBox, oMultiComboBox, oRadioButton, oTextArea, oVBox = new sap.m.VBox();

						for (var i = 0, length = response.length; i < length; i++) {
							var obj = {},
								oVBoxInterno = new sap.m.VBox().addStyleClass("bordered sapUiLargeMarginBottom sapUiContentPadding");

							oRadioButton = null;
							oMultiComboBox = null;

							oItemToReport = response[i];
							obj.idItemToReport = oItemToReport.id_item_to_report;

							oHBox = new sap.m.HBox({
								alignItems: "Center"
							});
							oHBox.addItem(new sap.m.Text({
								text: oItemToReport.pergunta
							}).addStyleClass("negrito"));

							if (oItemToReport.flag_sim_nao) {

								oRadioButton = new sap.m.RadioButton({
									groupName: "group" + i,
									text: that.getResourceBundle().getText("viewGeralSim")
								});
								obj.idRadioButtonSim = oRadioButton.getId();
								oHBox.addItem(oRadioButton);

								oRadioButton = new sap.m.RadioButton({
									groupName: "group" + i,
									text: that.getResourceBundle().getText("viewGeralNao"),
									selected: true
								});
								obj.idRadioButtonNao = oRadioButton.getId();
								oHBox.addItem(oRadioButton);
							}

							oVBoxInterno.addItem(oHBox);

							if (oItemToReport.flag_ano) {
								oMultiComboBox = new sap.m.MultiComboBox({
										width: "50%"
									})
									.bindItems({
										templateShareable: false,
										path: "/DominioAnoFiscal",
										template: new sap.ui.core.ListItem({
											key: "{id_dominio_ano_fiscal}",
											text: "{ano_fiscal}"
										})
									});
								obj.idMultiComboBox = oMultiComboBox.getId();
								oMultiComboBox.setVisible(!oItemToReport.flag_sim_nao);
								oVBoxInterno.addItem(oMultiComboBox);
							}

							var oPainelHistorico = new sap.m.Panel({
								expandable: true,
								expanded: false,
								headerText: that.getResourceBundle().getText("viewTaxPackageEdicaoTrimestreHistoricoItemToReport")
							}).addStyleClass("sapUiNoContentPadding sapUiSmallMarginBottom");
							var oList = new sap.m.List();
							oPainelHistorico.addContent(oList);
							oPainelHistorico.setVisible(that.getModel().getProperty("/Periodo").numero_ordem !== 1);
							obj.idPainelHistorico = oList.getId();
							oVBoxInterno.addItem(oPainelHistorico);

							oTextArea = new sap.m.TextArea({
								width: "100%",
								rows: 5
							});
							oTextArea.setVisible(!oItemToReport.flag_sim_nao);
							obj.idTextArea = oTextArea.getId();
							oVBoxInterno.addItem(oTextArea);

							if (oRadioButton) {
								(function (textArea, multiComboBox) {
									oRadioButton.attachSelect(function (oEvent) {
										textArea.setVisible(!oEvent.getParameter("selected")).setValue("");
										if (multiComboBox) {
											multiComboBox.setVisible(!oEvent.getParameter("selected")).setSelectedKeys(null);
										}
									});
								})(oTextArea, oMultiComboBox);
							}

							oVBox.addItem(oVBoxInterno);

							oModel.push(obj);
						}

						that.byId("containerItemsToReport2").addContent(oVBox);
						that.getModel().setProperty("/ComponentesItemToReport", oModel);

						that._carregarDadosItemToReport(sIdRelTaxPackagePeriodo);
					}

					that.setBusy(that.byId("containerItemsToReport2"), false);
				});
			},

			_carregarDadosItemToReport: function (sIdRelTaxPackagePeriodo) {
				var that = this,
					aComponenteItemToReport = this.getModel().getProperty("/ComponentesItemToReport");

				NodeAPI.listarRegistros("RespostaItemToReport?relTaxPackagePeriodo=" + sIdRelTaxPackagePeriodo, function (response) {
					if (response) {
						for (var i = 0, length = response.length; i < length; i++) {
							var oRespostaItemToReport = response[i];

							var oComponenteItemToReport = aComponenteItemToReport.find(function (obj) {
								return oRespostaItemToReport["fk_item_to_report.id_item_to_report"] === obj.idItemToReport;
							});

							if (oComponenteItemToReport) {
								var sIdRadioButtonSim = oComponenteItemToReport.idRadioButtonSim,
									sIdRadioButtonNao = oComponenteItemToReport.idRadioButtonNao,
									sIdMultiComboBox = oComponenteItemToReport.idMultiComboBox,
									sIdTextArea = oComponenteItemToReport.idTextArea;

								if (sIdRadioButtonSim) {
									sap.ui.getCore().byId(sIdRadioButtonSim).setSelected(oRespostaItemToReport.ind_se_aplica ? true : false);
									sap.ui.getCore().byId(sIdRadioButtonNao).setSelected(oRespostaItemToReport.ind_se_aplica ? false : true);
								}

								if (sIdTextArea) {
									sap.ui.getCore().byId(sIdTextArea).setValue(oRespostaItemToReport.resposta).setVisible(
										sIdRadioButtonSim ? !!oRespostaItemToReport.ind_se_aplica : true);
								}

								oComponenteItemToReport.id_resposta_item_to_report = oRespostaItemToReport.id_resposta_item_to_report;

								if (sIdMultiComboBox) {
									sap.ui.getCore().byId(sIdMultiComboBox).setVisible(sIdRadioButtonSim ? !!oRespostaItemToReport.ind_se_aplica : true);
									that._carregarRelacionamentoRespostaItemToReportAnoFiscal(oRespostaItemToReport, sIdMultiComboBox);
								}
							}
						}
					}
				});

				var sIdEmpresa = this.getModel().getProperty("/Empresa").id_empresa,
					sIdAnoCalendario = this.getModel().getProperty("/AnoCalendario").idAnoCalendario,
					sNumeroOrdemPeriodo = this.getModel().getProperty("/Periodo").numero_ordem,
					sEntidade = "DeepQuery/RespostaItemToReport?historico=true&empresa=" + sIdEmpresa + "&anoCalendario=" + sIdAnoCalendario +
					"&numeroOrdem=" + sNumeroOrdemPeriodo;

				NodeAPI.pListarRegistros(sEntidade)
					.then(function (response) {
						if (response) {
							/*response.sort(function (a, b) {
								return (a.numero_ordem > b.numero_ordem) ? 1 : ((b.numero_ordem > a.numero_ordem) ? -1 : 0);
							});*/

							for (var i = 0, length = response.length; i < length; i++) {
								var oRespostaItemToReport = response[i];

								var oComponenteItemToReport = aComponenteItemToReport.find(function (obj) {
									return oRespostaItemToReport["fk_item_to_report.id_item_to_report"] === obj.idItemToReport;
								});

								// Para cada resposta de item to report que ainda possua seu componente visual ativado,
								// é preciso pesquisar se existe relacionamento dela com anos fiscais (ou seja, é uma resposta com combo box de ano fiscal),
								// para exibir o histórico de anos e de resposta textual.
								if (oComponenteItemToReport) {
									(function (oResposta, oComponente) {
										NodeAPI.pListarRegistros("DeepQuery/RelacionamentoRespostaItemToReportAnoFiscal", {
												respostaItemToReport: oResposta.id_resposta_item_to_report
											})
											.then(function (aRel) {
												if (oResposta.resposta || (aRel.length)) {
													var sIdPainelHistorico = oComponente.idPainelHistorico,
														sLabel;

													switch (oResposta.numero_ordem) {
													case 1:
														sLabel = that.getResourceBundle().getText("viewGeralPeriodo1");
														break;
													case 2:
														sLabel = that.getResourceBundle().getText("viewGeralPeriodo2");
														break;
													case 3:
														sLabel = that.getResourceBundle().getText("viewGeralPeriodo3");
														break;
													case 4:
														sLabel = that.getResourceBundle().getText("viewGeralPeriodo4");
														break;
													case 5:
														sLabel = that.getResourceBundle().getText("viewGeralPeriodo5");
														break;
													}

													var oCustomListItem = new sap.m.CustomListItem();
													var oVBox = new sap.m.VBox().addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginTopBottom");

													oVBox.addItem(new sap.m.Title({
														level: "H3",
														text: sLabel
													}));

													var msg = "";
													for (var j = 0, length2 = aRel.length; j < length2; j++) {
														if (j !== 0) {
															msg += ",";
														}
														msg += aRel[j]["ano_fiscal"];
													}
													msg += (msg ? "\n" : "") + oResposta.resposta;

													oVBox.addItem(new sap.m.Text({
														text: msg
													}));

													oCustomListItem.addContent(oVBox);

													sap.ui.getCore().byId(sIdPainelHistorico).addItem(oCustomListItem);
												}
											});
									})(oRespostaItemToReport, oComponenteItemToReport);

								}
							}
						}
					});
			},

			_carregarRelacionamentoRespostaItemToReportAnoFiscal: function (oRespostaItemToReport, sIdMultiComboBox) {
				var sEntidade = "RelacionamentoRespostaItemToReportAnoFiscal?respostaItemToReport=" + oRespostaItemToReport.id_resposta_item_to_report,
					oMultiComboBox = sap.ui.getCore().byId(sIdMultiComboBox);

				NodeAPI.listarRegistros(sEntidade, function (response) {
					if (response) {
						var aIdAnoFiscal = [];

						for (var i = 0, length = response.length; i < length; i++) {
							aIdAnoFiscal.push(response[i]["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"].toString());
						}

						oMultiComboBox.setSelectedKeys(aIdAnoFiscal);
					}
				});
			},

			_initTaxReconciliation: function () {
				var that = this;

				// Construção do resultado contabil
				var oResultadoContabil = {
					aTemplate: [{
						label: "1º Trimestre",
						isEditavel: true,
						propriedade: "primeiroValor"
					}, {
						label: "2º Trimestre",
						isEditavel: false,
						propriedade: "segundoValor"
					}, {
						label: "3º Trimestre",
						isEditavel: false,
						propriedade: "terceiroValor"
					}, {
						label: "4º Trimestre",
						isEditavel: false,
						propriedade: "quartoValor"
					}],
					aItems: [{
						campo: "Statutory GAAP Profit / (loss) before t",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Current Income Tax – Current Year",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Current Income Tax – Previous Year",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Deferred Income Tax",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Non-Recoverable WHT",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Statutory provision for income tax",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Statutory GAAP profit / (loss) after tax",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}]
				};

				this._montarTabelaTR(oResultadoContabil, "/taxReconciliation/resultadoContabil", "containerResultadoContabil2");

				// Construção das adições e exclusões
				var oAdicoes = {
					aTemplate: [{
						label: "1º Trimestre",
						isEditavel: true,
						propriedade: "primeiroValor"
					}, {
						label: "2º Trimestre",
						isEditavel: false,
						propriedade: "segundoValor"
					}, {
						label: "3º Trimestre",
						isEditavel: false,
						propriedade: "terceiroValor"
					}, {
						label: "4º Trimestre",
						isEditavel: false,
						propriedade: "quartoValor"
					}],
					aItems: [{
						idTipo: 2,
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}]
				};

				this._montarTabelaTR(oAdicoes, "/taxReconciliation/adicoesExclusoes/permanentDifferences/itens", "containerAdicoesExclusoes2", {
					titulo: "Permanent Differences",
					caminhoOpcoes: "/taxReconciliation/adicoesExclusoes/permanentDifferences/opcoes",
					onNova: that.onNovaAdicao,
					onExcluir: that.onExcluirAdicao
				});

				var oExclusoes = {
					aTemplate: [{
						label: "1º Trimestre",
						isEditavel: true,
						propriedade: "primeiroValor"
					}, {
						label: "2º Trimestre",
						isEditavel: false,
						propriedade: "segundoValor"
					}, {
						label: "3º Trimestre",
						isEditavel: false,
						propriedade: "terceiroValor"
					}, {
						label: "4º Trimestre",
						isEditavel: false,
						propriedade: "quartoValor"
					}],
					aItems: [{
						idTipo: 2,
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}]
				};

				this._montarTabelaTR(oExclusoes, "/taxReconciliation/adicoesExclusoes/temporaryDifferences/itens", "containerAdicoesExclusoes2", {
					titulo: "Temporary Differences",
					caminhoOpcoes: "/taxReconciliation/adicoesExclusoes/temporaryDifferences/opcoes",
					onNova: that.onNovaExclusao,
					onExcluir: that.onExcluirExclusao
				});

				// Construção do Resultado Fiscal
				var oResultadoFiscal = {
					aTemplate: [{
						label: "1º Trimestre",
						isEditavel: true,
						propriedade: "primeiroValor"
					}, {
						label: "2º Trimestre",
						isEditavel: false,
						propriedade: "segundoValor"
					}, {
						label: "3º Trimestre",
						isEditavel: false,
						propriedade: "terceiroValor"
					}, {
						label: "4º Trimestre",
						isEditavel: false,
						propriedade: "quartoValor"
					}],
					aItems: [{
						campo: "Taxable income / (loss) before losses and tax credits",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Total losses utilized",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Taxable income / (loss) after losses",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Income tax before other taxes and credits",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Other taxes",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Incentivos Fiscais",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Total other taxes and tax credits",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Net local tax",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "WHT",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Overpayment from prior year applied to current year",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Total interim taxes payments (antecipações)",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Tax due / (overpaid)",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}]
				};

				this._montarTabelaTR(oResultadoFiscal, "/taxReconciliation/resultadoFiscal", "containerResultadoFiscal2");

				// Construção do Income Tax
				var oIncomeTax = {
					aTemplate: [{
						label: "1º Trimestre",
						isEditavel: true,
						propriedade: "primeiroValor"
					}, {
						label: "2º Trimestre",
						isEditavel: false,
						propriedade: "segundoValor"
					}, {
						label: "3º Trimestre",
						isEditavel: false,
						propriedade: "terceiroValor"
					}, {
						label: "4º Trimestre",
						isEditavel: false,
						propriedade: "quartoValor"
					}],
					aItems: [{
						campo: "Income Tax – as per the statutory financials",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Income Tax – as per the tax return",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Jurisdiction tax rate – average",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Staturory tax rate – average",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Effective tax rate - as per the statutory financials",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Effective tax rate - as per the tax return",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}]
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
					oToolbar.addContent(new sap.m.ObjectIdentifier({
						title: oAdicaoExclusaoConfig.titulo
					}));
					oToolbar.addContent(new sap.m.ToolbarSpacer());
					oToolbar.addContent(new sap.m.Button({
						text: "Nova",
						icon: "sap-icon://add",
						type: "Emphasized"
					}).attachPress(oTable, oAdicaoExclusaoConfig.onNova, this));
					// Adicionar onPress do botão
					oTable.setHeaderToolbar(oToolbar);

					// Coluna de exclusão da linha
					oTable.addColumn(new sap.m.Column({
						width: "50px"
					}));

					aCells.push(new sap.m.Button({
						icon: "sap-icon://delete",
						type: "Reject",
						tooltip: "{i18n>viewGeralExcluirLinha}"
					}).attachPress(oTable, oAdicaoExclusaoConfig.onExcluir, this));

					// Coluna de tipo de diferença
					oTable.addColumn(new sap.m.Column({
						vAlign: "Middle"
					}).setHeader(new sap.m.Text({
						text: "Tipo"
					})));

					aCells.push(new sap.m.Select({
						selectedKey: "{idTipo}"
					}).bindItems({
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
				} else {

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
					} else {
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
					that.getRouter().navTo("taxPackageListagemEmpresas", {
						parametros: that.toURIComponent({
							idAnoCalendario: that.getModel().getProperty("/AnoCalendario").idAnoCalendario
						})
					});
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
					title: this.getResourceBundle().getText("viewGeralConfirma"),
					type: "Message",
					content: new sap.m.Text({
						text: this.getResourceBundle().getText("viewDetalhesTrimestreJStextsVocêtemcertezaquedesejacancelaraedição")
					}),
					beginButton: new sap.m.Button({
						text: this.getResourceBundle().getText("viewGeralSim"),
						press: function () {
							dialog.close();
							if (onConfirm) {
								onConfirm();
							}
						}
					}),
					endButton: new sap.m.Button({
						text: this.getResourceBundle().getText("viewGeralCancelar"),
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				dialog.open();
			},

			_onRouteMatched: function (oEvent) {
				this._zerarModel();
				this.getModel().setProperty("/ocultarItemToReport", true);

				var oParametros = this.fromURIComponent(oEvent.getParameter("arguments").parametros);
				
				if (oParametros.oPeriodo.numero_ordem === 6) {
					this.getModel().setProperty("/ocultarItemToReport", false);
				}
				
				var sLabelDataInicio = oParametros.oEmpresa.fy_start_date,
					sLabelDataFim = oParametros.oEmpresa.fy_end_date;

				try {
					sLabelDataInicio = Utils.stringDataDoBancoParaStringDDMMYYYY(oParametros.oEmpresa.fy_start_date);
					sLabelDataFim = Utils.stringDataDoBancoParaStringDDMMYYYY(oParametros.oEmpresa.fy_end_date);

					sLabelDataInicio = sLabelDataInicio.substring(0, sLabelDataInicio.lastIndexOf('/'));
					sLabelDataFim = sLabelDataFim.substring(0, sLabelDataFim.lastIndexOf('/'));
				} catch (e) {
					console.log(e);
				}

				this.getModel().setProperty("/LabelDataInicio", sLabelDataInicio);
				this.getModel().setProperty("/LabelDataFim", sLabelDataFim);
				this.getModel().setProperty("/LabelCITType", this._pegarLabelCITType(oParametros.oPeriodo.numero_ordem));
				this.getModel().setProperty("/LabelPeriodo", this._pegarLabelPeriodoTaxReconciliation(oParametros.oPeriodo.numero_ordem));
				this.getModel().setProperty("/Empresa", oParametros.oEmpresa);
				this.getModel().setProperty("/Periodo", oParametros.oPeriodo);
				this.getModel().setProperty("/AnoCalendario", oParametros.oAnoCalendario);

				this.getModel().setProperty("/TaxReconciliation/0/periodo", this._pegarLabelPeriodoTaxReconciliation(this.getModel().getProperty(
					"/Periodo") ? this.getModel().getProperty("/Periodo").numero_ordem : ""));
				this.getModel().setProperty("/TaxReconciliation/0/labelPeriodo", this._pegarLabelPeriodoTaxReconciliation(this.getModel().getProperty(
					"/Periodo") ? this.getModel().getProperty("/Periodo").numero_ordem : ""));

				var that = this;

				NodeAPI.listarRegistros("DominioMoeda", function (response) {
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/DominioMoeda", response);

						var oMoedaSelecionada = response.find(function (obj) {
							return obj.id_dominio_moeda === oParametros.oPeriodo["fk_dominio_moeda_rel.id_dominio_moeda"];
						});

						if (oMoedaSelecionada) {
							that.getModel().setProperty("/LabelMoeda", oMoedaSelecionada.acronimo);
						}
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

				this.setBusy(this.byId("paginaEdicaoTrimestreTP"), true);

				NodeAPI.pListarRegistros('RelacionamentoTaxPackagePeriodo/' + oParametros.oPeriodo.id_rel_tax_package_periodo + '/IsPrimeiraEdicao')
					.then(function (res) {
						that.setBusy(that.byId("paginaEdicaoTrimestreTP"), false);
						
						if (res.result.isPrimeiraEdicao) {
							if (res.result.indIndagarMoeda) {
								jQuery.sap.require("sap.m.MessageBox");
	
								sap.m.MessageBox.confirm(that.getResourceBundle().getText("viewEdicaoTrimestreConfirmacaoManterMoeda"), {
									title: that.getResourceBundle().getText("ViewDetalheTrimestreJSTextsConfirmation"),
									onClose: function (oAction) {
										if (oAction === sap.m.MessageBox.Action.OK) {
											//alert('Copiar dados do período anterior');
											that._copiarDadosPeriodoAnterior(oParametros.oPeriodo.id_rel_tax_package_periodo);
										}
										else {
											//alert('Primeira Edicao. _atualizarDados()');
											that._atualizarDados();	
										}
									}
								});
							}
							else if (oParametros.oPeriodo.numero_ordem === 6) {
								//alert('Copiar dados do período anterior');
								that._copiarDadosPeriodoAnterior(oParametros.oPeriodo.id_rel_tax_package_periodo);
							}
							else {
								//alert('Primeira Edicao. _atualizarDados()');
								that._atualizarDados();	
							}
						}
						else {
							//alert('Já foi editado. _atualizarDados()');
							that._atualizarDados();	
						}
					})
					.catch(function (err) {
						console.log(err);
					});
			},

			_copiarDadosPeriodoAnterior: function (idRelTaxPackagePeriodo) {
				var that = this;
				
				this.setBusy(this.byId("paginaEdicaoTrimestreTP"), true);
				
				NodeAPI.pListarRegistros('RelacionamentoTaxPackagePeriodo/' + idRelTaxPackagePeriodo + '/CopiarDadosPeriodoAnterior')
					.then(function (res) {
						that.setBusy(that.byId("paginaEdicaoTrimestreTP"), false);
						that.getModel().setProperty('/CopiaRealizada', true);
						that._atualizarDados();
					})
					.catch(function (err) {
						console.log(err);
					});
			},
			
			_limparCopia: function (callback) {
				var that = this;
				
				this.setBusy(this.byId("paginaEdicaoTrimestreTP"), true);
				
				NodeAPI.pListarRegistros('RelacionamentoTaxPackagePeriodo/' + this.getModel().getProperty('/Periodo').id_rel_tax_package_periodo + '/LimparDados')
					.then(function (res) {
						that.setBusy(that.byId("paginaEdicaoTrimestreTP"), false);
						if (callback) {
							callback();
						}
					})
					.catch(function (err) {
						console.log(err);
						if (callback) {
							callback();
						}
					});
			},

			_atualizarDados: function () {
				var that = this,
					sIdRelTaxPackagePeriodo = this.getModel().getProperty("/Periodo").id_rel_tax_package_periodo;

				var oContainerTaxReconciliation = this.byId("containerTaxReconciliation");

				this.setBusy(oContainerTaxReconciliation, true);

				NodeAPI.listarRegistros("TaxPackage?idRelTaxPackagePeriodo=" + sIdRelTaxPackagePeriodo, function (response) {
					var sIdTaxReconciliation;

					if (response) {
						if (response.taxReconciliation) {
							var oTaxReconAtivo = response.taxReconciliation.find(function (obj) {
								return obj.ind_ativo;
							});
							oTaxReconAtivo.labelPeriodo = that._pegarLabelPeriodoTaxReconciliation(oTaxReconAtivo.numero_ordem);
							that.getModel().setProperty("/TaxReconciliation", response.taxReconciliation);
							that.getModel().setProperty("/IncomeTaxDetails", oTaxReconAtivo.it_details_if_tax_returns_income_differs_from_fs);
							that._carregarTaxasMultiplas(oTaxReconAtivo.id_tax_reconciliation);
							that._carregarValuesUtilized(oTaxReconAtivo.id_tax_reconciliation);
							sIdTaxReconciliation = oTaxReconAtivo.id_tax_reconciliation;
						}
						that.getModel().setProperty("/DiferencasPermanentes", response.diferencaPermanente);
						that.getModel().setProperty("/DiferencasTemporarias", response.diferencaTemporaria);
						//that.getModel().setProperty("/Moeda", response.moeda);

						that.onAplicarRegras();
					}

					that._carregarPagamentosTTC(sIdTaxReconciliation);
					that._carregarHistorico();
					that._carregarTaxRate();

					that.setBusy(oContainerTaxReconciliation, false);
				});

				this._carregarSchedule(1, "/LossSchedule", sIdRelTaxPackagePeriodo, Number(this.getModel().getProperty("/Empresa").prescricao_prejuizo));
				this._carregarSchedule(2, "/CreditSchedule", sIdRelTaxPackagePeriodo, Number(this.getModel().getProperty("/Empresa").prescricao_credito));
				this._initItemsToReport(sIdRelTaxPackagePeriodo);
			},

			_pegarLabelCITType: function (iNumeroOrdem) {
				var sLabel;

				switch (true) {
				case iNumeroOrdem === 1: //sLabelBanco.includes("1"):
					sLabel = this.getResourceBundle().getText("viewEdiçãoTrimestreEstimativa");
					break;
				case iNumeroOrdem === 2: //sLabelBanco.includes("2"):
					sLabel = this.getResourceBundle().getText("viewEdiçãoTrimestreEstimativa");
					break;
				case iNumeroOrdem === 3: //sLabelBanco.includes("3"):
					sLabel = this.getResourceBundle().getText("viewEdiçãoTrimestreEstimativa");
					break;
				case iNumeroOrdem === 4: //sLabelBanco.includes("4"):
					sLabel = this.getResourceBundle().getText("viewEdiçãoTrimestreEstimativa");
					break;
				case iNumeroOrdem === 5: //sLabelBanco === "anual":
					sLabel = this.getResourceBundle().getText("viewGeralAnual");
					break;
				case iNumeroOrdem >= 6: //sLabelBanco === "retificadora":
					sLabel = this.getResourceBundle().getText("viewGeralRetificadora");
					break;
				}

				return sLabel;
			},

			_pegarLabelPeriodoTaxReconciliation: function (iNumeroOrdem) {
				var sLabelTraduzido;

				switch (true) {
				case iNumeroOrdem === 1: //sLabelBanco.includes("1"):
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo1");
					break;
				case iNumeroOrdem === 2: //sLabelBanco.includes("2"):
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo2");
					break;
				case iNumeroOrdem === 3: //sLabelBanco.includes("3"):
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo3");
					break;
				case iNumeroOrdem === 4: //sLabelBanco.includes("4"):
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo4");
					break;
				case iNumeroOrdem === 5: //sLabelBanco === "anual":
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo5");
					break;
				case iNumeroOrdem >= 6: //sLabelBanco === "retificadora":
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo6");
					break;
				}

				return sLabelTraduzido;
			},

			_carregarHistorico: function () {
				var that = this,
					sIdTaxPackage = this.getModel().getProperty("/Periodo").id_tax_package,
					sNumeroOrdem = this.getModel().getProperty("/Periodo").numero_ordem,
					sEntidade = "DeepQuery/TaxReconciliation?taxPackage=" + sIdTaxPackage + "&numeroOrdem=" + sNumeroOrdem + "&historico=true";

				NodeAPI.listarRegistros(sEntidade, function (response) {
					if (response) {
						that.getModel().setProperty("/HistoricoIncomeTaxDetails", []);
						
						for (var i = 0, length = response.length; i < length; i++) {
							response[i].ind_ativo = false;
							response[i].labelPeriodo = that._pegarLabelPeriodoTaxReconciliation(response[i].numero_ordem);
							
							if (response[i].it_details_if_tax_returns_income_differs_from_fs) {
								that.getModel().getProperty("/HistoricoIncomeTaxDetails").push({
									labelPeriodo: response[i].labelPeriodo,
									incomeTaxDetails: response[i].it_details_if_tax_returns_income_differs_from_fs
								});
							}
						}
						response = response.filter(function (obj) {
							return obj.id_tax_reconciliation;
						});
						that.getModel().setProperty("/TaxReconciliation", that.getModel().getProperty("/TaxReconciliation").concat(response));
						that.getModel().refresh();
					}
					that._definirMoeda();
				});
			},

			_definirMoeda: function () {
				var that = this,
					aTaxRecon = this.getModel().getProperty("/TaxReconciliation"),
					iNumeroOrdem = Number(this.getModel().getProperty("/Periodo").numero_ordem);
					
				var oMoeda = aTaxRecon.reduce(function (result, item) {
					if (item.numero_ordem >= 1 && item.numero_ordem <= 4 && item["fk_dominio_moeda_rel.id_dominio_moeda"] && result.sIdMoedaEstimativa !== item["fk_dominio_moeda_rel.id_dominio_moeda"]) {
						result.sIdMoedaEstimativa = item["fk_dominio_moeda_rel.id_dominio_moeda"];
					}
					if (item.numero_ordem === 5 && item["fk_dominio_moeda_rel.id_dominio_moeda"] && result.sIdMoedaAnual !== item["fk_dominio_moeda_rel.id_dominio_moeda"]) {
						result.sIdMoedaAnual = item["fk_dominio_moeda_rel.id_dominio_moeda"];
					}
					if (item.numero_ordem === 6 && item["fk_dominio_moeda_rel.id_dominio_moeda"] && result.sIdMoedaRetificadora !== item["fk_dominio_moeda_rel.id_dominio_moeda"]) {
						result.sIdMoedaRetificadora = item["fk_dominio_moeda_rel.id_dominio_moeda"];
					}
					return result;
				}, { sIdMoedaEstimativa: null, sIdMoedaAnual: null, sIdMoedaRetificadora: null });
				
				switch (iNumeroOrdem) {
					case 1:
					case 2:
					case 3:
					case 4:
						this.getModel().setProperty('/Moeda', oMoeda.sIdMoedaEstimativa);
						break;
					case 5:
						this.getModel().setProperty('/Moeda', oMoeda.sIdMoedaAnual);
						break;
					case 6:
						this.getModel().setProperty('/Moeda', oMoeda.sIdMoedaRetificadora);
						break;
				}
				
				this.getModel().setProperty('/MoedaAnterior', this.getModel().getProperty('/Moeda'));
			},
			
			_carregarAntecipacoes: function (sIdTaxReconciliation) {
				var that = this;
				NodeAPI.listarRegistros("Antecipacao?taxReconciliation=" + sIdTaxReconciliation, function (response) {
					if (response) {
						var aPagamento = that.getModel().getProperty("/PagamentosTTC");

						for (var i = 0, length = response.length; i < length; i++) {
							var oAntecipacao = response[i];

							var oPagamento = aPagamento.find(function (obj) {
								return obj.id_pagamento === oAntecipacao["fk_pagamento.id_pagamento"];
							});

							if (oPagamento) {
								oPagamento.selecionado = true;
								oPagamento.id_antecipacao = oAntecipacao.id_antecipacao;
							}
						}

						that.onAplicarRegras();
					}
				});
			},

			_carregarPagamentosTTC: function (sIdTaxReconciliation) {
				var that = this,
					sIdEmpresa = this.getModel().getProperty("/Empresa").id_empresa,
					idAnoCalendario = this.getModel().getProperty("/AnoCalendario").idAnoCalendario;

				NodeAPI.listarRegistros("DeepQuery/Pagamento?full=true&empresa=" + sIdEmpresa + "&taxIsExportavelTaxPackage=true&anoFiscal=" + idAnoCalendario, function (response) {
					if (response) {
						that.getModel().setProperty("/PagamentosTTC", response);

						if (sIdTaxReconciliation) {
							that._carregarAntecipacoes(sIdTaxReconciliation);
						}
					}
				});
			},

			_carregarTaxRate: function () {
				var that = this,
					oEmpresa = this.getModel().getProperty("/Empresa"),
					oAnoCalendario = this.getModel().getProperty("/AnoCalendario"),
					oTaxReconAtivo = that.getModel().getProperty("/TaxReconciliation").find(function (obj) {
						return obj.ind_ativo;
					});

				// Carrega a alíquota vigente para o período de edição do tax package do imposto em vigor para o país da empresa
				NodeAPI.pListarRegistros("ValorAliquota", {
						fkAliquota: oEmpresa["fk_imposto_pais"] ? oEmpresa["fk_imposto_pais"] : 0,
						fkDominioAnoFiscal: oAnoCalendario.idAnoCalendario
					})
					.then(function (res) {
						oTaxReconAtivo.it_jurisdiction_tax_rate_average = (res.result[0] && res.result[0].valor) ? Number(res.result[0].valor) : 0;
					})
					.catch(function (err) {
						oTaxReconAtivo.it_jurisdiction_tax_rate_average = 0;
						if (err.status) { // erro de http (400 ou 500)
							alert(err.status + ": " + err.statusText + "\n" + "Error: " + err.responseJSON.error.message);
						}
					});

				// Carrega a alíquota vigente para o período de edição do tax package do imposto em vigor para a empresa
				NodeAPI.pListarRegistros("ValorAliquota", {
						fkAliquota: oEmpresa["fk_imposto_empresa"] ? oEmpresa["fk_imposto_empresa"] : 0,
						fkDominioAnoFiscal: oAnoCalendario.idAnoCalendario
					})
					.then(function (res) {
						oTaxReconAtivo.it_statutory_tax_rate_average = (res.result[0] && res.result[0].valor) ? Number(res.result[0].valor) : 0;
					})
					.catch(function (err) {
						oTaxReconAtivo.it_statutory_tax_rate_average = 0;
						if (err.status) { // erro de http (400 ou 500)
							alert(err.status + ": " + err.statusText + "\n" + "Error: " + err.responseJSON.error.message);
						}
					});
			},

			_salvar: function (oEvent, callback) {
				if (this._isFormularioValido()) {
					var that = this,
						oBtnPressionado = oEvent.getSource(),
						oBtnSalvarFechar = this.byId("btnSalvarFechar"),
						oBtnSalvar = this.byId("btnSalvar"),
						oBtnCancelar = this.byId("btnCancelar");

					oBtnSalvarFechar.setEnabled(false);
					oBtnSalvar.setEnabled(false);
					oBtnCancelar.setEnabled(false);

					this.setBusy(oBtnPressionado, true);

					this._inserir(function (response) {
						oBtnSalvarFechar.setEnabled(true);
						oBtnSalvar.setEnabled(true);
						oBtnCancelar.setEnabled(true);

						that.setBusy(oBtnPressionado, false);

						if (callback) {
							callback(JSON.parse(response));
						}
					});
				}
			},

			_isFormularioValido: function () {
				var msg = "",
					bValido = true,
					aValidacao = [];

				aValidacao.push(this._validarJustificativa());
				aValidacao.push(this._validarIncomeTaxDetails());
				aValidacao.push(this._validarMoeda());

				for (var i = 0, length = aValidacao.length; i < length; i++) {
					var oValidacao = aValidacao[i];

					if (!oValidacao.valido) {
						msg += "- " + oValidacao.mensagem + "\n";
						bValido = false;
					}
				}

				if (!bValido) {
					jQuery.sap.require("sap.m.MessageBox");

					sap.m.MessageBox.show(msg, {
						title: this.getResourceBundle().getText("viewGeralAviso")
					});
				}

				return bValido;
			},
			
			_validarMoeda: function () {
				var bMoedaPreechida = this.getModel().getProperty("/Moeda");
				return {
					valido: !!bMoedaPreechida,
					mensagem: this.getResourceBundle().getText("viewTAXEdicaoTrimestreMensagemValidacaoMoeda") // alterar texto
				};
			},
			
			_validarJustificativa: function () {
				var aLossSchedule = this.getModel().getProperty("/LossSchedule"),
					aCreditSchedule = this.getModel().getProperty("/CreditSchedule"),
					aScheduleComJustificativaObrigatoriaVazia;

				var pegarScheduleComJustificativaObrigatoriaVazia = function (aSchedule) {
					return aSchedule.filter(function (obj) {
						return obj.justificativaEnabled && !obj.justificativa;
					});
				};

				aScheduleComJustificativaObrigatoriaVazia = pegarScheduleComJustificativaObrigatoriaVazia(aLossSchedule);
				aScheduleComJustificativaObrigatoriaVazia = aScheduleComJustificativaObrigatoriaVazia.concat(
					pegarScheduleComJustificativaObrigatoriaVazia(aCreditSchedule));

				return {
					valido: !aScheduleComJustificativaObrigatoriaVazia.length,
					mensagem: this.getResourceBundle().getText("viewTAXEdicaoTrimestreMensagemValidacaoJustificativa") //"Existem justificativas obrigatórias sem preenchimento"
				};
			},

			_validarIncomeTaxDetails: function () {
				var bValido = this.getModel().getProperty("/IncomeTaxDetailsValueState") !== sap.ui.core.ValueState.Error;

				return {
					valido: bValido,
					mensagem: this.getResourceBundle().getText("viewGeralTaxVisuPleaseProvide")
				};
			},

			_inserir: function (callback) {
				var sIdMoeda = this.getModel().getProperty("/Moeda");
				var sIncomeTaxDetails = this.getModel().getProperty("/IncomeTaxDetails");

				var oTaxReconciliation = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
					return obj.ind_ativo === true;
				});

				var aDiferencaPermanente = this.getModel().getProperty("/DiferencasPermanentes"),
					aDiferencaPermanenteExcluida = this.getModel().getProperty("/DiferencasPermanentesExcluidas"),
					aDiferencaTemporaria = this.getModel().getProperty("/DiferencasTemporarias"),
					aDiferencaTemporariaExcluida = this.getModel().getProperty("/DiferencasTemporariasExcluidas"),
					aRespostaItemToReport = this._formatarRespostaItemToReport(),
					aOtherTax = this.getModel().getProperty("/OtherTaxes"),
					aIncentivosFiscais = this.getModel().getProperty("/IncentivosFiscais"),
					aWHT = this.getModel().getProperty("/WHT"),
					aAntecipacao = this.getModel().getProperty("/PagamentosTTC"),
					aOutrasAntecipacoes = this.getModel().getProperty("/OutrasAntecipacoes");

				/*
				// @NOVO_SCHEDULE - comentar
				var oLossSchedule = this.getModel().getProperty("/LossSchedule").find(function (obj) {
						return obj.ind_corrente === true;
					}),
					oCreditSchedule = this.getModel().getProperty("/CreditSchedule").find(function (obj) {
						return obj.ind_corrente === true;
					});*/

				// @NOVO_SCHEDULE - descomentar
				var aLossSchedule = this.getModel().getProperty("/LossSchedule"),
					aCreditSchedule = this.getModel().getProperty("/CreditSchedule"),
					aTotalLossesUtilized = this.getModel().getProperty("/TotalLossesUtilized"),
					aOverpaymentFromPriorYearAppliedToCurrentYear = this.getModel().getProperty("/OverpaymentFromPriorYearAppliedToCurrentYear");

				console.log("######## INSERIR ########");
				console.log("- Items To Report: ");
				console.table(aRespostaItemToReport);
				console.log("- Moeda TP: " + sIdMoeda);
				console.log("- Tax Reconciliation: \n");
				console.log("	-- Income Tax Details: \n" + sIncomeTaxDetails + "\n");
				console.log("   -- Detalhe Tax Reconciliation\n");
				console.table(oTaxReconciliation);
				console.log("   -- Diferenças Permanentes\n");
				console.table(aDiferencaPermanente);
				console.log("   -- Diferenças Permanentes Excluídas\n");
				console.table(aDiferencaPermanenteExcluida);
				console.log("   -- Diferenças Temporárias\n");
				console.table(aDiferencaTemporaria);
				console.log("   -- Diferenças Temporárias Excluídas\n");
				console.table(aDiferencaTemporariaExcluida);
				console.log("   -- Other Taxes\n");
				console.table(aOtherTax);
				console.log("   -- Incentivos Fiscais\n");
				console.table(aIncentivosFiscais);
				console.log("   -- WHT\n");
				console.table(aWHT);
				console.log("   -- Antecipações\n");
				console.table(aAntecipacao);
				console.log("   -- Outras Antecipações\n");
				console.table(aOutrasAntecipacoes);
				console.log("- Loss Schedule: ");
				console.table(aLossSchedule);
				console.log("   -- Total Losses Utilized\n");
				console.table(aTotalLossesUtilized);
				console.log("- Credit Schedule: ");
				console.table(aCreditSchedule);
				console.log("   -- Overpayment from Prior Year Applied To Current Year\n");
				console.table(aOverpaymentFromPriorYearAppliedToCurrentYear);

				var oTaxPackage = {
					empresa: this.getModel().getProperty("/Empresa"),
					periodo: this.getModel().getProperty("/Periodo"),
					anoCalendario: this.getModel().getProperty("/AnoCalendario"),
					moeda: this.getModel().getProperty("/Moeda"),
					taxReconciliationRcRfIt: this.getModel().getProperty("/TaxReconciliation"),
					incomeTaxDetails: this.getModel().getProperty("/IncomeTaxDetails"),
					diferencasPermanentes: aDiferencaPermanente,
					diferencasPermanentesExcluidas: aDiferencaPermanenteExcluida,
					diferencasTemporarias: aDiferencaTemporaria,
					diferencasTemporariasExcluidas: aDiferencaTemporariaExcluida,
					respostaItemToReport: aRespostaItemToReport,
					lossSchedule: aLossSchedule,
					totalLossesUtilized: aTotalLossesUtilized,
					creditSchedule: aCreditSchedule,
					overpaymentFromPriorYearAppliedToCurrentYear: aOverpaymentFromPriorYearAppliedToCurrentYear,
					otherTaxes: aOtherTax,
					incentivosFiscais: aIncentivosFiscais,
					wht: aWHT,
					antecipacoes: aAntecipacao,
					outrasAntecipacoes: aOutrasAntecipacoes
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

					if (oComponenteItemToReport.id_resposta_item_to_report) {
						oRespostaItemToReport.id_resposta_item_to_report = oComponenteItemToReport.id_resposta_item_to_report;
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
					parametros: this.toURIComponent(oParametros)
				});
			},

			_zerarModel: function () {
				this.getModel().setData({
					CopiaRealizada: false,
					PagamentosTTC: [],
					OutrasAntecipacoes: [],
					OtherTaxes: [],
					IncentivosFiscais: [],
					WHT: [],
					TotalLossesUtilized: [],
					OverpaymentFromPriorYearAppliedToCurrentYear: [],
					TotalLossSchedule: {
						opening_balance: 0,
						current_year_value: 0,
						current_year_value_utilized: 0,
						adjustments: 0,
						current_year_value_expired: 0,
						closing_balance: 0,
					},
					LossSchedule: [],
					LossScheduleFY: [],
					TotalCreditSchedule: {
						opening_balance: 0,
						current_year_value: 0,
						current_year_value_utilized: 0,
						adjustments: 0,
						current_year_value_expired: 0,
						closing_balance: 0,
					},
					CreditSchedule: [],
					CreditScheduleFY: [],
					DiferencaOpcao: {
						Permanente: [],
						Temporaria: []
					},
					DiferencasPermanentes: [],
					DiferencasPermanentesExcluidas: [],
					DiferencasTemporarias: [],
					DiferencasTemporariasExcluidas: [],
					TotalDiferencaPermanente: 0,
					TotalDiferencaTemporaria: 0,
					Moeda: null,
					TaxReconciliation: [{
						periodo: "X Trimestre",
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
					IncomeTaxDetailsValueState: null,
					HistoricoIncomeTaxDetails: [],
					lossSchedule: [{
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
					}],
					creditSchedule: [{
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
					}],
					opcoesAno: [{
						ano: 2018
					}, {
						ano: 2017
					}]
				});

				this.getModel().refresh();
			},

			_limparModel: function () {
				this.getModel().setProperty("/OtherTaxes", []);
				this.getModel().setProperty("/IncentivosFiscais", []);
				this.getModel().setProperty("/WHT", []);
				this.getModel().setProperty("/Moeda", null);
				this.getModel().setProperty("/MoedaAnterior", null);
				this.getModel().setProperty("/TaxReconciliation", []);
				this.getModel().setProperty("/DiferencasPermanentes", []);
				this.getModel().setProperty("/DiferencasTemporarias", []);
				this.getModel().setProperty("/LossSchedule", []);
				this.getModel().setProperty("/CreditSchedule", []);
			},

			/*
			// @NOVO_SCHEDULE - comentar
			_carregarSchedule: function (sTipo, sProperty, sIdRelTaxPackagePeriodo) {
				var that = this;

				NodeAPI.listarRegistros("Schedule?tipo=" + sTipo + "&idRelTaxPackagePeriodo=" + sIdRelTaxPackagePeriodo, function (response) {
					if (response && response.length > 0) {
						for (var i = 0; i < response.length; i++) {
							response[i].ind_corrente = true;
						}
						
						that.getModel().setProperty(sProperty, response);
						that._carregarHistoricoSchedule(sProperty, sTipo);
						that.onAplicarRegras();
					} else {
						that._carregarScheduleInicial(sTipo, sProperty);
					}
				});
			},*/

			// @NOVO_SCHEDULE - descomentar
			_carregarSchedule: function (sTipo, sProperty, sIdRelTaxPackagePeriodo, iPrescricao) {
				var that = this,
					oAnoCalendario = this.getModel().getProperty("/AnoCalendario");

				NodeAPI.listarRegistros("DeepQuery/Schedule?tipo=" + sTipo + "&idRelTaxPackagePeriodo=" + sIdRelTaxPackagePeriodo, function (
					response) {
					if (response && response.length > 0) {
						var oScheduleCorrente = response.find(function (obj) {
							return obj.ano_fiscal === Number(oAnoCalendario.anoCalendario);
						});

						if (oScheduleCorrente) oScheduleCorrente.ind_corrente = true;

						// Se o período em edição pertencer ao ano corrente de edição do tax package
						if (that._anoEdicaoIgualAnoCorrente()) {
							// Atualiza o year of expiration
							for (var i = 0, length = response.length; i < length; i++) {
								response[i].year_of_expiration = response[i].fy + iPrescricao;
							}
						}

						that.getModel().setProperty(sProperty, response);
						that.onAplicarRegras();
					} else {
						that._carregarScheduleInicial(sTipo, sProperty);
					}
				});
			},

			_isScheduleExpirado: function (oSchedule) {
				var oAnoCalendario = this.getModel().getProperty("/AnoCalendario");

				return Number(oSchedule.year_of_expiration) === Number(oAnoCalendario.anoCalendario);
			},

			_anoEdicaoIgualAnoCorrente: function () {
				var iAnoEdicao = Number(this.getModel().getProperty("/AnoCalendario").anoCalendario),
					oPeriodoEdicaoAberto = Utils.getPeriodoEdicaoTaxPackage(iAnoEdicao),
					oPeriodoEdicaoCorrente = Utils.getPeriodoEdicaoTaxPackage(),
					bResultado = true;

				if (oPeriodoEdicaoAberto.fim <= oPeriodoEdicaoCorrente.inicio) {
					bResultado = false;
				}

				return bResultado;
			},

			_carregarHistoricoSchedule: function (sProperty, sTipo) {
				var that = this,
					oEmpresa = this.getModel().getProperty("/Empresa"),
					oAnoCalendario = this.getModel().getProperty("/AnoCalendario");

				var oParam = {
					empresa: oEmpresa,
					anoCalendario: oAnoCalendario,
					tipo: sTipo // Loss Schedule
				};

				NodeAPI.pListarRegistros("HistoricoSchedule?parametros=" + JSON.stringify(oParam))
					.then(function (response) {
						that.getModel().setProperty(sProperty, that.getModel().getProperty(sProperty).concat(response));
						that.onAplicarRegras();
					});
			},

			/*
			// @NOVO_SCHEDULE - COMENTAR
			_carregarScheduleInicial: function (sTipo, sProperty) {
				var that = this,
					oEmpresa = this.getModel().getProperty("/Empresa"),
					oPeriodo = this.getModel().getProperty("/Periodo"),
					oAnoCalendario = this.getModel().getProperty("/AnoCalendario");

				var oParams = {
					empresa: oEmpresa,
					periodo: oPeriodo,
					anoCalendario: oAnoCalendario,
					tipo: sTipo // Loss Schedule
				};

				var sEntidade = "ScheduleParaNovoPeriodo?parametros=" + JSON.stringify(oParams);

				NodeAPI.listarRegistros(sEntidade, function (response) {
					if (response) {
						for (var i = 0; i < response.length; i++) {
							response[i].ind_corrente = true;
						}
						that.getModel().setProperty(sProperty, [response]);
						that._carregarHistoricoSchedule(sProperty, sTipo);
						that.onAplicarRegras();
					}
				});
			},*/

			// @NOVO_SCHEDULE - descomentar
			_carregarScheduleInicial: function (sTipo, sProperty) {
				var that = this,
					oEmpresa = this.getModel().getProperty("/Empresa"),
					oPeriodo = this.getModel().getProperty("/Periodo"),
					oAnoCalendario = this.getModel().getProperty("/AnoCalendario");

				var oParams = {
					empresa: oEmpresa,
					periodo: oPeriodo,
					anoCalendario: oAnoCalendario,
					tipo: sTipo // Loss Schedule
				};

				var sEntidade = "ScheduleParaNovoPeriodo?parametros=" + JSON.stringify(oParams);

				NodeAPI.listarRegistros(sEntidade, function (response) {
					// Apenas os retratos que não expiraram são exibidos
					if (response) {
						var aScheduleValido = response.filter(function (obj) {
							return Number(obj.year_of_expiration) >= Number(oAnoCalendario.anoCalendario);
						});

						that.getModel().setProperty(sProperty, aScheduleValido);
						that.onAplicarRegras();
					}
				});
			},

			_carregarTaxasMultiplas: function (sIdTaxReconciliation) {
				var that = this;

				NodeAPI.listarRegistros("/TaxaMultipla?taxReconciliation=" + sIdTaxReconciliation, function (response) {
					if (response) {

						var aOtherTax = response.filter(function (obj) {
							return obj["fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla"] === 1;
						});

						var aIncentivoFiscal = response.filter(function (obj) {
							return obj["fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla"] === 2;
						});

						var aWHT = response.filter(function (obj) {
							return obj["fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla"] === 3;
						});

						var aOutrasAntecipacoes = response.filter(function (obj) {
							return obj["fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla"] === 4;
						});

						that.getModel().setProperty("/OtherTaxes", aOtherTax);
						that.getModel().setProperty("/IncentivosFiscais", aIncentivoFiscal);
						that.getModel().setProperty("/WHT", aWHT);
						that.getModel().setProperty("/OutrasAntecipacoes", aOutrasAntecipacoes);

						that.onAplicarRegras();
					}
				});
			},

			_carregarValuesUtilized: function (sIdTaxReconciliation) {
				var that = this;

				// IMPLEMENTAR A ROTA
				/*NodeAPI.listarRegistros("/ScheduleValueUtilized?taxReconciliation=" + sIdTaxReconciliation, function (response) {
					if (response) {
						var aTotalLossesUtilized = response.filter(function (obj) {
							return obj["fk_dominio_schedule_value_utilized_tipo.id_dominio_schedule_value_utilized_tipo"] === 1;
						});

						var aOverpaymentFromPriorYearAppliedToCurrentYear = response.filter(function (obj) {
							return obj["fk_dominio_schedule_value_utilized_tipo.id_dominio_schedule_value_utilized_tipo"] === 2;
						});

						that.getModel().setProperty("/TotalLossesUtilized", aOtherTax);
						that.getModel().setProperty("/OverpaymentFromPriorYearAppliedToCurrentYear", aIncentivoFiscal);

						that.onAplicarRegras();
					}
				});*/

				NodeAPI.pListarRegistros("ScheduleValueUtilized", {
						fkTaxReconciliation: sIdTaxReconciliation
					})
					.then(function (response) {
						var result = response.result;

						var aTotalLossesUtilized = result.filter(function (obj) {
							return obj["fk_dominio_schedule_value_utilized_tipo.id_dominio_schedule_value_utilized_tipo"] === 1;
						});

						var aOverpaymentFromPriorYearAppliedToCurrentYear = result.filter(function (obj) {
							return obj["fk_dominio_schedule_value_utilized_tipo.id_dominio_schedule_value_utilized_tipo"] === 2;
						});

						that.getModel().setProperty("/TotalLossesUtilized", aTotalLossesUtilized);
						that.getModel().setProperty("/OverpaymentFromPriorYearAppliedToCurrentYear", aOverpaymentFromPriorYearAppliedToCurrentYear);

						that.onAplicarRegras();
					})
					.catch(function (err) {
						console.log(err);
					});
			},

			onTrocarJustificativa: function (oEvent) {
				var obj = oEvent.getSource().getBindingContext().getObject();

				obj.justificativaValueState = obj.justificativa ? sap.ui.core.ValueState.None : sap.ui.core.ValueState.Error;
			},

			onTrocarIncomeTaxDetails: function (oEvent) {
				this.getModel().setProperty("/IncomeTaxDetailsValueState", oEvent.getSource().getValue() ? sap.ui.core.ValueState.None : sap.ui.core
					.ValueState.Error);
			},
			
			onTrocarMoeda: function (oEvent) {
				var that = this,
					eventSource = oEvent.getSource(),
					oTaxReconCorrente = this.getModel().getProperty('/TaxReconciliation').find(function (obj) {
						return obj.ind_ativo;	
					});
				
				jQuery.sap.require("sap.m.MessageBox");
	
				// Para estimativas pede confirmação ao usuário se deseja mesmo trocar moeda
				if (oTaxReconCorrente.numero_ordem >= 1 && oTaxReconCorrente.numero_ordem <= 4 && oTaxReconCorrente["fk_dominio_moeda_rel.id_dominio_moeda"]) {
					sap.m.MessageBox.confirm(this.getResourceBundle().getText("viewEdicaoTrimestreConfirmacaoTrocaMoeda"), {
						title: this.getResourceBundle().getText("ViewDetalheTrimestreJSTextsConfirmation"),
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {
								that.getModel().setProperty('/MoedaAnterior', eventSource.getSelectedKey());
							}
							else {
								that.getModel().setProperty('/Moeda', that.getModel().getProperty('/MoedaAnterior'));
							}
						}
					});
				}
			}
		});
	}
);