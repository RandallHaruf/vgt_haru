sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"ui5ns/ui5/controller/BaseController",
	"ui5ns/ui5/lib/NodeAPI",
	"ui5ns/ui5/model/Constants",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportType",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/TablePersoController",
	"sap/m/MessageBox",
	"ui5ns/ui5/lib/Utils",
	"ui5ns/ui5/lib/Validador",
	"sap/m/Popover",
	"sap/m/Button",
	"ui5ns/ui5/lib/jszip",
	"ui5ns/ui5/lib/XLSX",
	"ui5ns/ui5/lib/FileSaver"
], function (jQuery, Controller, Filter, JSONModel, BaseController, NodeAPI, Constants, Export, ExportType, ExportTypeCSV,
	TablePersoController, MessageBox, Utils, Validador, Popover, Button) {
	"use strict";

	return BaseController.extend("ui5ns.ui5.controller.taxPackage.RelatorioIncomeTax", {
		onInit: function () {

			var oModel = new sap.ui.model.json.JSONModel({});
			oModel.setSizeLimit(5000);
			this.getView().setModel(oModel);
			this._atualizarDados();
			Utils.conteudoView("relatorioDoTaxPackage", this, "/TabelaDaView");
			var array = this.getModel().getProperty("/TabelaDaView");
			for (var k = 0, length = array.length; k < length; k++) {
				Utils.ajustaRem(this, aRegistro, array[k]["propriedadeDoValorDaLinha"], array[k]["textoNomeDaColuna"], 3, 1.35, 8)
			}
			this.getRouter().getRoute("taxPackageRelatorioIncomeTax").attachPatternMatched(this._handleRouteMatched, this);
		},

		_handleRouteMatched: function () {
			if (this.isIFrame()) {
				this.mostrarAcessoRapidoInception();
			}

			this.onExit();
		},

		navToHome: function () {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("selecaoModulo");
		},

		navToPage2: function () {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("taxPackageListagemEmpresas");
		},

		onNavBack: function (oEvent) {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("taxPackageListagemEmpresas");
		},

		onExit: function () {
			this._onClearSelecoes();
			this._atualizarDados();
			this.aKeys = [];
			this.aFilters = [];
			this.oModel = null;
		},

		_onClearSelecoes: function (oEvent) {
			this.getModel().setProperty("/IdEmpresasSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioAnoCalendarioSelecionadas", undefined);
			this.getModel().setProperty("/IdPeriodoSelecionadas", undefined);
			this.getModel().setProperty("/IdMoedaSelecionadas", undefined);
			this.getModel().setProperty("/TemplateReport", undefined);
			this.getModel().setProperty("/ReportTaxPackage", undefined);
		},

		onSelectChange: function (oEvent) {
			//this.onValidarData(oEvent);
			this._atualizarDados();
		},

		onImprimir: function (oEvent) {
			//this._geraRelatorio(); 			
		},

		_reportAdicionar: function (sProperty,that) {
			that.getModel().getProperty(sProperty).unshift({
				descricao: null,
				descricaoValueState: sap.ui.core.ValueState.Error,
				parametros: JSON.stringify(that.getModel().getProperty("/Preselecionado"))
			});
			that.getModel().refresh();
		},

		_reportExcluir: function (oEvent, sProperty,excluirProperty,that,id) {
			var array = that.getModel().getProperty(sProperty);
			var oExcluir = oEvent.getSource().getBindingContext().getObject();
			var oWhere = that.getModel().getProperty(excluirProperty);
			for (var i = 0, length = array.length; i < length; i++) {
				if (array[i] === oExcluir) {
					if(array[i][id]){
						oWhere.push(array[i][id]);
					}
					array.splice(i, 1);
				}
			}
			that.getModel().refresh();
		},
		
		_reportSelecionar: function (oEvent, sProperty,that) {
			var aTaxaMultipla = that.getModel().getProperty(sProperty);
			var oSelecionado = oEvent.getSource().getBindingContext().getObject();
			that.getModel().setProperty("/Preselecionado", JSON.parse(oSelecionado["parametros"]));
			that.onTemplateGet();
			that._dialogFiltro.close();
		},
		
		_dialogReport: function (sTitulo, sProperty,excluirProperty,that,id) {
			that.getModel().setProperty("/Excluir",[]);
			if (!that._dialogFiltro) {
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
					text: that.getResourceBundle().getText("viewGeralNova"),
					icon: "sap-icon://add",
					type: "Emphasized"
				}).attachPress(oTable, function () {
					that._reportAdicionar(sProperty,that);
				}, that));

				oTable.setHeaderToolbar(oToolbar);

				/* Colunas da tabela */
				oTable.addColumn(new sap.m.Column({
					width: "50px"
				}));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle"
				}).setHeader(new sap.m.Text({
					text: "Templates"
				})));
				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle",
					width: "90px"
				}).setHeader(new sap.m.Text({
					text: "Selecionar"
				})));

				/* Template das células */
				var oBtnExcluir = new sap.m.Button({
					icon: "sap-icon://delete",
					type: "Reject",
					tooltip: "{i18n>viewGeralExcluirLinha}"
				}).attachPress(oTable, function (oEvent2) {
					that._reportExcluir(oEvent2, sProperty,excluirProperty,that,id);
				}, that);

				var oInputDescricao = new sap.m.Input({
					value: "{descricao}",
					valueState: "{descricaoValueState}",
					valueStateText: "{i18n>viewGeralCampoNaoPodeSerVazio}"
				}).attachChange(function (oEvent) {
					var obj = oEvent.getSource().getBindingContext().getObject();
						obj.descricaoValueState = obj.descricao ? sap.ui.core.ValueState.None : sap.ui.core.ValueState.Error;
				});
				/* Template das células */
				var oBtnSelecionar = new sap.m.Button({
					icon: "sap-icon://provision",
					type: "Accept",
					tooltip: "Selecionar"
				}).attachPress(oTable, function (oEvent3) {
					that._reportSelecionar(oEvent3, sProperty,that);
				}, that);

				var oTemplate = new sap.m.ColumnListItem({
					cells: [oBtnExcluir, oInputDescricao, oBtnSelecionar]
				});

				oTable.bindItems({
					path: sProperty,
					template: oTemplate
				});

				oScrollContainer.addContent(oTable);

				//var that = this;

				/* Criação do diálogo com base na tabela */
				var dialog = new sap.m.Dialog({
					contentWidth: "500px",
					showHeader: false,
					type: "Message",
					content: oScrollContainer,
					endButton: new sap.m.Button({
						text: "Salvar",
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
								
								//that.onAplicarRegras();
								var excluir = that.getModel().getProperty("/Excluir");
								for (var i = 0, length = excluir.length; i < length; i++) {
									NodeAPI.pExcluirRegistro("TemplateReport", excluir[i])
										.then(function (res) {

										})
										.catch(function (err) {
											alert(err.status + " - " + err.statusText + "\n" + err.responseJSON.error.message);
										});										
								}
								for (var i = 0, length = aTaxa.length; i < length; i++) {
									if (aTaxa[i]["descricaoValueState"] === "None" && !aTaxa[i][id]) {
										NodeAPI.pCriarRegistro("TemplateReport", {
												tela: that.oView.mProperties.viewName,
												parametros: aTaxa[i]["parametros"],
												isIFrame: that.isIFrame() ? "true" : "false",
												descricao: aTaxa[i]["descricao"],
												usarSession: 1
											})
											.then(function (res) {

											})
											.catch(function (err) {
												alert(err.status + " - " + err.statusText + "\n" + err.responseJSON.error.message);
											});
									}
									else if(aTaxa[i]["descricaoValueState"] === "None" && aTaxa[i][id]){
										NodeAPI.pAtualizarRegistro("TemplateReport", aTaxa[i][id],{
												tela: that.oView.mProperties.viewName,
												parametros: aTaxa[i]["parametros"],
												isIFrame: that.isIFrame() ? "true" : "false",
												descricao: aTaxa[i]["descricao"],
												usarSession: 1
											})
											.then(function (res) {
												//var aRegistro = JSON.parse(res.result);
											})
											.catch(function (err) {
												alert(err.status + " - " + err.statusText + "\n" + err.responseJSON.error.message);
											});										
									}
								}
								dialog.close();
							} else {
								jQuery.sap.require("sap.m.MessageBox");
								sap.m.MessageBox.show(that.getResourceBundle().getText(
									"ViewDetalheTrimestreJSTextsTodososcamposmarcadossãodepreenchimentoobrigatório"), {
									title: that.getResourceBundle().getText("viewGeralAviso")
								});
							}
						}
					}),
					beginButton: new sap.m.Button({
						text: "Cancelar",
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
						//dialog.destroy();
					}
				});

				that.getView().addDependent(dialog);
				that._dialogFiltro = dialog;
			}

			that._dialogFiltro.open();
		},

		onDialogOpen: function (oEvent) {
			var that = this;
			this.onTemplateSet();
			Utils._dialogReport("Layout", "/TemplateReport","/Excluir",that,"id_template_report");
			that.setBusy(that._dialogFiltro, true);
			NodeAPI.pListarRegistros("TemplateReport", {
					tela: that.oView.mProperties.viewName,
					isIFrame: that.isIFrame() ? "true" : "false",
					usarSession: 1
				})
				.then(function (res) {
					that.getModel().setProperty("/TemplateReport", res.result);
					that.setBusy(that._dialogFiltro, false);
				})
				.catch(function (err) {
					alert(err.status + " - " + err.statusText + "\n" + err.responseJSON.error.message);
				});
		},
		
		onTemplateSet: function (oEvent) {
			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas") ? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !==
				undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas") : null : null;
			var oDominioAnoCalendario = this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas") ? this.getModel().getProperty(
					"/IdDominioAnoCalendarioSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas") :
				null : null;
			var oPeriodoSelecionadas = this.getModel().getProperty("/IdPeriodoSelecionadas") ? this.getModel().getProperty(
				"/IdPeriodoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdPeriodoSelecionadas") : null : null;
			var oMoedaSelecionadas = this.getModel().getProperty("/IdMoedaSelecionadas") ? this.getModel().getProperty("/IdMoedaSelecionadas")[
				0] !== undefined ? this.getModel().getProperty("/IdMoedaSelecionadas") : null : null;
			var oWhere = [];
			oWhere.push(oEmpresa);
			oWhere.push(oDominioAnoCalendario);
			oWhere.push(oPeriodoSelecionadas);
			oWhere.push(oMoedaSelecionadas);
			this.getModel().setProperty("/Preselecionado", oWhere);
		},
		
		onTemplateGet: function (oEvent) {
			this._onClearSelecoes();
			this._atualizarDados();
			var forcaSelecao = this.getModel().getProperty("/Preselecionado");
			this.getModel().setProperty("/IdEmpresasSelecionadas", forcaSelecao[0]);
			this.getModel().setProperty("/IdDominioAnoCalendarioSelecionadas", forcaSelecao[1]);
			this.getModel().setProperty("/IdPeriodoSelecionadas", forcaSelecao[2]);
			this.getModel().setProperty("/IdMoedaSelecionadas", forcaSelecao[3]);
		},
		onGerarRelatorio: function (oEvent) {
			this._geraRelatorioTax("/ReportTaxPackage");
		},
		onGerarCsv: function (oEvent) {
			this._geraRelatorioTax("/CSV");
		},
		onGerarXlsx: function (oEvent) {
			this._geraRelatorioTax("/XLSX");
		},
		onGerarTxt: function (oEvent) {
			this._geraRelatorioTax("/TXT");
		},

		_atualizarDados: function () {
			var that = this;
			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas") ? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !==
				undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas") : null : null;
			var oDominioAnoCalendario = this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas") ? this.getModel().getProperty(
					"/IdDominioAnoCalendarioSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas") :
				null : null;
			var oPeriodoSelecionadas = this.getModel().getProperty("/IdPeriodoSelecionadas") ? this.getModel().getProperty(
				"/IdPeriodoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdPeriodoSelecionadas") : null : null;
			var oMoedaSelecionadas = this.getModel().getProperty("/IdMoedaSelecionadas") ? this.getModel().getProperty("/IdMoedaSelecionadas")[
				0] !== undefined ? this.getModel().getProperty("/IdMoedaSelecionadas") : null : null;

			var oWhere = [];
			oWhere.push(oEmpresa);
			oWhere.push(oDominioAnoCalendario);
			oWhere.push(oPeriodoSelecionadas);
			oWhere.push(oMoedaSelecionadas);
			oWhere.push(null);
			oWhere.push(null);

			if (oEmpresa === null) {
				oWhere[5] = ["tblEmpresa.nome"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinctAccountingResult/ReportTaxPackage?full=" + (this.isIFrame() ? "true" :
					"false"), {
					type: "POST",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: {
						parametros: JSON.stringify(oWhere)
					},
					success: function (response) {
						var aRegistro = JSON.parse(response);
						that.getModel().setProperty("/Empresa", Utils.orderByArrayParaBox(aRegistro, "tblEmpresa.nome"));
					}
				});
			}

			if (oDominioAnoCalendario === null) {
				oWhere[5] = ["tblDominioAnoCalendario.ano_calendario"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinctAccountingResult/ReportTaxPackage?full=" + (this.isIFrame() ? "true" :
					"false"), {
					type: "POST",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: {
						parametros: JSON.stringify(oWhere)
					},
					success: function (response) {
						var aRegistro = JSON.parse(response);
						that.getModel().setProperty("/DominioAnoCalendario", aRegistro);
					}
				});
			}

			if (oPeriodoSelecionadas === null) {
				oWhere[5] = ["tblPeriodo.id_periodo"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinctAccountingResult/ReportTaxPackage?full=" + (this.isIFrame() ? "true" :
					"false"), {
					type: "POST",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: {
						parametros: JSON.stringify(oWhere)
					},
					success: function (response) {
						var aRegistro = JSON.parse(response);
						for (var i = 0, length = aRegistro.length; i < length; i++) {
							aRegistro[i]["tblPeriodo.periodo"] = Utils.traduzTrimestre(aRegistro[i]["tblPeriodo.numero_ordem"], that);
						}
						that.getModel().setProperty("/Periodo", Utils.orderByArrayParaBox(aRegistro, "tblPeriodo.periodo"));
					}
				});
			}

			if (oMoedaSelecionadas === null) {
				oWhere[5] = ["tblDominioMoeda.acronimo"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinctAccountingResult/ReportTaxPackage?full=" + (this.isIFrame() ? "true" :
					"false"), {
					type: "POST",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: {
						parametros: JSON.stringify(oWhere)
					},
					success: function (response) {
						var aRegistro = JSON.parse(response);
						that.getModel().setProperty("/DominioMoeda", Utils.orderByArrayParaBox(aRegistro, "tblDominioMoeda.acronimo"));
					}
				});
			}
		},

		onDataExport: sap.m.Table.prototype.exportData || function (tipo) {
			Utils.dataExportReport(this,tipo,"viewEdiçãoTrimestreImpostoRenda","viewEdiçãoTrimestreImpostoRenda");  /*
			var array = this.getModel().getProperty("/TabelaDaView");
			var coluna = [];
			var excel = [];
			for (var k = 0, length = array.length; k < length; k++) {
				coluna.push({
					name: array[k]["textoNomeDaColuna"],
					template: {
						content: "{" + array[k]["propriedadeDoValorDaLinha"] + "}"
					}
				})
				excel.push(array[k]["textoNomeDaColuna"]);
			}
			var valores = this.getModel().getProperty(tipo);
			var wsAccountResultData = [];
			wsAccountResultData.push(excel);
			for (var i = 0, length = valores.length; i < length; i++) {
				excel = [];
				for (var j = 0, length2 = array.length; j < length2; j++) {
					excel.push(valores[i][array[j]["propriedadeDoValorDaLinha"]]);
				}
				wsAccountResultData.push(excel);
			};

			var wbTaxPackage = XLSX.utils.book_new();
			var wsAccountResultName = this.getResourceBundle().getText("viewEdiçãoTrimestreImpostoRenda");
			var wsAccountResult = XLSX.utils.aoa_to_sheet(wsAccountResultData);
			XLSX.utils.book_append_sheet(wbTaxPackage, wsAccountResult, wsAccountResultName);
			var wopts = {};
			var formato = "";
			if (tipo === "/XLSX") {
				wopts = {
					bookType: 'xlsx'  ,
					type: 'array'
				};
				formato = ".xlsx";
			} else if (tipo === "/TXT") {
				wopts = {
					bookType: 'txt'  ,
					type: 'array'
				};
				formato = ".txt";
			} else {
				wopts = {
					bookType: 'csv'  ,
					type: 'array'
				};
				formato = ".csv";
			}
			var wbout = XLSX.write(wbTaxPackage, wopts);
			saveAs(new Blob([wbout], {
					type: "application/octet-stream"
				}),
				Utils.dateNowParaArquivo() + "_" + this.getResourceBundle().getText("viewGeralRelatorio") + "_" + this.getResourceBundle().getText(
					"viewEdiçãoTrimestreImpostoRenda") + formato);*/
		},

		_geraRelatorioTax: function (ifExport) {

			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas") ? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !==
				undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas") : null : null;
			var oDominioAnoCalendario = this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas") ? this.getModel().getProperty(
					"/IdDominioAnoCalendarioSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas") :
				null : null;
			var oPeriodoSelecionadas = this.getModel().getProperty("/IdPeriodoSelecionadas") ? this.getModel().getProperty(
				"/IdPeriodoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdPeriodoSelecionadas") : null : null;
			var oMoedaSelecionadas = this.getModel().getProperty("/IdMoedaSelecionadas") ? this.getModel().getProperty("/IdMoedaSelecionadas")[
				0] !== undefined ? this.getModel().getProperty("/IdMoedaSelecionadas") : null : null;

			var oWhere = [];
			oWhere.push(oEmpresa);
			oWhere.push(oDominioAnoCalendario);
			oWhere.push(oPeriodoSelecionadas);
			oWhere.push(oMoedaSelecionadas);
			oWhere.push(null);
			oWhere.push(null);

			var that = this;
			that.setBusy(that.byId("relatorioDoTaxPackage"), true);
			that.byId("GerarRelatorio").setEnabled(false);
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinctIncomeTax/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
				type: "POST",
				xhrFields: {
					withCredentials: true
				},
				crossDomain: true,
				data: {
					parametros: JSON.stringify(oWhere)
				},
				success: function (response) {
					var aRegistro = JSON.parse(response);
					for (var i = 0, length = aRegistro.length; i < length; i++) {
						aRegistro[i]["tblPeriodo.periodo"] = Utils.traduzTrimestre(aRegistro[i]["tblPeriodo.numero_ordem"], that);
					}
					Utils.conteudoView("relatorioDoTaxPackage", that, "/TabelaDaView");
					var array = that.getModel().getProperty("/TabelaDaView");
					var valor;
					if (ifExport === "/CSV" || ifExport === "/XLSX" || ifExport === "/TXT") {
						for (var i = 0, length = aRegistro.length; i < length; i++) {
							for (var k = 0, lengthk = array.length; k < lengthk; k++) {
								valor = aRegistro[i][array[k]["propriedadeDoValorDaLinha"]]
								aRegistro[i][array[k]["propriedadeDoValorDaLinha"]] = Validador.isNumber(valor) ? valor.toString().indexOf(".") !== -1 ?
									Utils.aplicarMascara(valor, that) : valor : valor;
							}
						}
						that.getModel().setProperty(ifExport, aRegistro);
						that.setBusy(that.byId("relatorioDoTaxPackage"), false);
						that.byId("GerarRelatorio").setEnabled(true);
						that.onDataExport(ifExport);
					} else {
						for (var k = 0, length = array.length; k < length; k++) {
							Utils.ajustaRem(that, aRegistro, array[k]["propriedadeDoValorDaLinha"], array[k]["textoNomeDaColuna"], 3, 1.35)
						}
						that.getModel().setProperty(ifExport, aRegistro);
						that.setBusy(that.byId("relatorioDoTaxPackage"), false);
						that.byId("GerarRelatorio").setEnabled(true);
					}
				}
			});
		},

		onSaveView: function (oEvent) {
			sap.m.MessageToast.show(JSON.stringify(oEvent.getParameters()));
		},

		onToggleHeader: function () {
			this.getPage().setHeaderExpanded(!this.getPage().getHeaderExpanded());
		},

		onToggleFooter: function () {
			this.getPage().setShowFooter(!this.getPage().getShowFooter());
		},

		filterTable: function (aCurrentFilterValues) {
			this.getTableItems().filter(this.getFilters(aCurrentFilterValues));
			this.updateFilterCriterias(this.getFilterCriteria(aCurrentFilterValues));
		},

		updateFilterCriterias: function (aFilterCriterias) {
			this.removeSnappedLabel(); /* because in case of label with an empty text, */
			this.addSnappedLabel(); /* a space for the snapped content will be allocated and can lead to title misalignment */
			this.oModel.setProperty("/Filter/text", this.getFormattedSummaryText(aFilterCriterias));
		},

		addSnappedLabel: function () {
			var oSnappedLabel = this.getSnappedLabel();
			oSnappedLabel.attachBrowserEvent("click", this.onToggleHeader, this);
			this.getPageTitle().addSnappedContent(oSnappedLabel);
		},

		removeSnappedLabel: function () {
			this.getPageTitle().destroySnappedContent();
		},

		getFilters: function (aCurrentFilterValues) {
			this.aFilters = [];

			this.aFilters = this.aKeys.map(function (sCriteria, i) {
				return new sap.ui.model.Filter(sCriteria, sap.ui.model.FilterOperator.Contains, aCurrentFilterValues[i]);
			});

			return this.aFilters;
		},

		getFilterCriteria: function (aCurrentFilterValues) {
			return this.aKeys.filter(function (el, i) {
				if (aCurrentFilterValues[i] !== "") return el;
			});
		},

		getFormattedSummaryText: function (aFilterCriterias) {
			if (aFilterCriterias.length > 0) {
				return "Filtered By (" + aFilterCriterias.length + "): " + aFilterCriterias.join(", ");
			} else {
				return "Filtered by None";
			}
		},

		getTable: function () {
			return this.getView().byId("idProductsTable");
		},

		getTableItems: function () {
			return this.getTable().getBinding("items");
		},

		getSelect: function (sId) {
			return this.getView().byId(sId);
		},

		getSelectedItemText: function (oSelect) {
			return oSelect.getSelectedItem() ? oSelect.getSelectedItem().getKey() : "";
		},

		getPage: function () {
			return this.getView().byId("dynamicPageId");
		},

		getPageTitle: function () {
			return this.getPage().getTitle();
		},

		getSnappedLabel: function () {
			return new sap.m.Label({
				text: "{/Filter/text}"
			});
		},

	});
});