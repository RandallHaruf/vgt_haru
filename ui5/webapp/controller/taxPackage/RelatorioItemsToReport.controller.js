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
	"ui5ns/ui5/lib/jszip",
	"ui5ns/ui5/lib/XLSX",
	"ui5ns/ui5/lib/FileSaver"
], function (jQuery, Controller, Filter, JSONModel, BaseController, NodeAPI, Constants, Export, ExportType, ExportTypeCSV,
	TablePersoController, MessageBox, Utils, Validador) {
	"use strict";

	return BaseController.extend("ui5ns.ui5.controller.taxPackage.RelatorioItemsToReport", {
		onInit: function () {

			var oModel = new sap.ui.model.json.JSONModel({});
			oModel.setSizeLimit(5000);
			this.getView().setModel(oModel);
			Utils.conteudoView("relatorioDoTaxPackage", this, "/TabelaDaView");
			if (this.isVisualizacaoUsuario()) {
				this.getRouter().getRoute("taxPackageRelatorioItemsToReport").attachPatternMatched(this._handleRouteMatched, this);
			}
		},

		_handleRouteMatched: function () {
			if (this.isIFrame()) {
				this.mostrarAcessoRapidoInception();
				this.getModel().setProperty('/IsAreaUsuario', !this.isIFrame());
			}

			fetch(Constants.urlBackend + "verifica-auth", {
					credentials: "include"
				})
				.then((res) => {
					res.json()
						.then((response) => {
							if (response.success) {
								this.getModel().setProperty("/NomeUsuario", response.nome);
							} else {
								MessageToast.show(response.error.msg);
								this.getRouter().navTo("Login");
							}
						})
				})

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
			var that = this;
			that.setBusy(that.byId("idNomeReport"), true);
			that.getModel().setProperty("/NomeReport",that.getResourceBundle().getText("viewGeralRelatorio") + " " + that.getResourceBundle().getText("viewGeralItemsTR"));			
			NodeAPI.pListarRegistros("TemplateReport", {
					tela: that.oView.mProperties.viewName,
					isIFrame: that.isIFrame() ? "true" : "false",
					indDefault: true,
					usarSession: 1
				})
				.then(function (res) {
					if(res.result.length){
						that.getModel().setProperty("/Preselecionado", JSON.parse(res.result[0].parametros));
						that.getModel().setProperty("/NomeReport", res.result[0].descricao);
						that.onTemplateGet();						
					}
				})
				.catch(function (err) {
					alert(err.status + " - " + err.statusText + "\n" + err.responseJSON.error.message);
				})
				.finally(function(){
					that.setBusy(that.byId("idNomeReport"), false);
				});				
			this.aKeys = [];
			this.aFilters = [];
			this.oModel = null;
		},

		_onClearSelecoes: function (oEvent) {
			this.getModel().setProperty("/IdEmpresasSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioAnoCalendarioSelecionadas", undefined);
			this.getModel().setProperty("/IdPeriodoSelecionadas", undefined);
			this.getModel().setProperty("/IdMoedaSelecionadas", undefined);
			this.getModel().setProperty("/FlagSNSelecionado", undefined);
			this.getModel().setProperty("/FlagAnoSelecionado", undefined);
			this.getModel().setProperty("/PerguntaSelecionada", undefined);
			this.getModel().setProperty("/RespondeuSimSelecionado", undefined);
			this.getModel().setProperty("/AnoFiscalSelecionado", undefined);
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

		onDialogOpen: function (oEvent) {
			var that = this;
			this.onTemplateSet();
			Utils._dialogReport("Layout", "/TemplateReport", "/Excluir", that, "id_template_report", oEvent);
			that.setBusy(that._dialogFiltro, true);
			NodeAPI.pListarRegistros("TemplateReport", {
					tela: that.oView.mProperties.viewName,
					isIFrame: that.isIFrame() ? "true" : "false",
					usarSession: 1
				})
				.then(function (res) {
					that.getModel().setProperty("/TemplateReport", Utils.orderByArrayParaBox(res.result, "descricao"));
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
			var oFlagSNSelecionado = this.getModel().getProperty("/FlagSNSelecionado") ? this.getModel().getProperty("/FlagSNSelecionado")[0] !==
				undefined ? this.getModel().getProperty("/FlagSNSelecionado") : null : null;
			var oFlagAnoSelecionado = this.getModel().getProperty("/FlagAnoSelecionado") ? this.getModel().getProperty("/FlagAnoSelecionado")[0] !==
				undefined ? this.getModel().getProperty("/FlagAnoSelecionado") : null : null;
			var oPerguntaSelecionada = this.getModel().getProperty("/PerguntaSelecionada") ? this.getModel().getProperty("/PerguntaSelecionada")[
				0] !== undefined ? this.getModel().getProperty("/PerguntaSelecionada") : null : null;
			var oRespondeuSimSelecionado = this.getModel().getProperty("/RespondeuSimSelecionado") ? this.getModel().getProperty(
				"/RespondeuSimSelecionado")[0] !== undefined ? this.getModel().getProperty("/RespondeuSimSelecionado") : null : null;
			var oAnoFiscalSelecionado = this.getModel().getProperty("/AnoFiscalSelecionado") ? this.getModel().getProperty(
				"/AnoFiscalSelecionado")[0] !== undefined ? this.getModel().getProperty("/AnoFiscalSelecionado") : null : null;

			var oWhere = [];
			var oFiltrosVisiveis = [];
			for (var i = 0, length = this.byId("filterbar").getAllFilterItems().length; i < length; i++) {
				oFiltrosVisiveis.push({
					name: this.byId("filterbar").getAllFilterItems()[i].mProperties.name,
					visible: this.byId("filterbar").getAllFilterItems()[i].mProperties.visibleInFilterBar
				});
			}
			oWhere.push(oEmpresa); //
			oWhere.push(oDominioAnoCalendario); //
			oWhere.push(oPeriodoSelecionadas); //
			oWhere.push(oMoedaSelecionadas); //
			oWhere.push(oFlagSNSelecionado); //
			oWhere.push(oFlagAnoSelecionado); //
			oWhere.push(oPerguntaSelecionada); //
			oWhere.push(oRespondeuSimSelecionado);
			oWhere.push(oAnoFiscalSelecionado);
			oWhere.push(oFiltrosVisiveis);
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
			this.getModel().setProperty("/FlagSNSelecionado", forcaSelecao[4]);
			this.getModel().setProperty("/FlagAnoSelecionado", forcaSelecao[5]);
			this.getModel().setProperty("/PerguntaSelecionada", forcaSelecao[6]);
			this.getModel().setProperty("/RespondeuSimSelecionado", forcaSelecao[7]);
			this.getModel().setProperty("/AnoFiscalSelecionado", forcaSelecao[8]);
			if (forcaSelecao.length >= 10) {
				for (var i = 0, length = forcaSelecao[9].length; i < length; i++) {
					for (var k = 0, length = this.byId("filterbar").getAllFilterItems().length; k < length; k++) {
						if (forcaSelecao[9][i].name == this.byId("filterbar").getAllFilterItems()[k].mProperties.name) {
							this.byId("filterbar").getAllFilterItems()[k].mProperties.visibleInFilterBar = forcaSelecao[9][i].visible;
							break;
						}
					}
				}
			}
			var dialog = this.byId("filterbar");
			dialog._setConsiderFilterChanges(false);
			dialog._recreateBasicAreaContainer(true);
			dialog._retrieveVisibleAdvancedItems();
			dialog._setConsiderFilterChanges(true);
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
			var oFlagSNSelecionado = this.getModel().getProperty("/FlagSNSelecionado") ? this.getModel().getProperty("/FlagSNSelecionado")[0] !==
				undefined ? this.getModel().getProperty("/FlagSNSelecionado") : null : null;
			var oFlagAnoSelecionado = this.getModel().getProperty("/FlagAnoSelecionado") ? this.getModel().getProperty("/FlagAnoSelecionado")[0] !==
				undefined ? this.getModel().getProperty("/FlagAnoSelecionado") : null : null;
			var oPerguntaSelecionada = this.getModel().getProperty("/PerguntaSelecionada") ? this.getModel().getProperty("/PerguntaSelecionada")[
				0] !== undefined ? this.getModel().getProperty("/PerguntaSelecionada") : null : null;
			var oRespondeuSimSelecionado = this.getModel().getProperty("/RespondeuSimSelecionado") ? this.getModel().getProperty(
				"/RespondeuSimSelecionado")[0] !== undefined ? this.getModel().getProperty("/RespondeuSimSelecionado") : null : null;
			var oAnoFiscalSelecionado = this.getModel().getProperty("/AnoFiscalSelecionado") ? this.getModel().getProperty(
				"/AnoFiscalSelecionado")[0] !== undefined ? this.getModel().getProperty("/AnoFiscalSelecionado") : null : null;

			var oWhere = [];
			oWhere.push(oEmpresa); //
			oWhere.push(oDominioAnoCalendario); //
			oWhere.push(oPeriodoSelecionadas); //
			oWhere.push(oMoedaSelecionadas); //
			oWhere.push(null);
			oWhere.push(oFlagSNSelecionado); //
			oWhere.push(oFlagAnoSelecionado); //
			oWhere.push(oPerguntaSelecionada); //
			oWhere.push(oRespondeuSimSelecionado);
			oWhere.push(oAnoFiscalSelecionado);
			oWhere.push(null);
			if (oEmpresa === null) {
				oWhere[10] = ["tblEmpresa.nome"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
				oWhere[10] = ["tblDominioAnoCalendario.ano_calendario"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
						aRegistro.sort(function (x, y) {
							return Number(Number(x["tblDominioAnoCalendario.ano_calendario"] - y["tblDominioAnoCalendario.ano_calendario"]));
						});
						that.getModel().setProperty("/DominioAnoCalendario", aRegistro);
					}
				});
			}
			if (oPeriodoSelecionadas === null) {
				oWhere[10] = ["tblPeriodo.id_periodo"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
				oWhere[10] = ["tblDominioMoeda.acronimo"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
			if (oPerguntaSelecionada === null) {
				oWhere[10] = ["tblItemToReport.pergunta"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
						that.getModel().setProperty("/Pergunta", Utils.orderByArrayParaBox(aRegistro, "tblItemToReport.pergunta"));
					}
				});
			}
			if (oFlagAnoSelecionado === null) {
				oWhere[10] = ["tblItemToReport.flag_ano"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
						that.getModel().setProperty("/FlagAno", aRegistro);
					}
				});
			}

			if (oFlagSNSelecionado === null) {
				oWhere[10] = ["tblItemToReport.flag_sim_nao"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
						that.getModel().setProperty("/FlagSN", aRegistro);
					}
				});
			}
			if (oRespondeuSimSelecionado === null) {
				oWhere[10] = ["tblRespostaItemToReport.ind_se_aplica"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
						that.getModel().setProperty("/RespondeuSim", aRegistro);
					}
				});
			}
			if (oAnoFiscalSelecionado === null) {
				oWhere[10] = ["tblDominioAnoFiscal.ano_fiscal"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
						var oArrayAgregado = [];
						var oArrayFiltro = [];
						var saida = [];
						for (var i = 0; i < aRegistro.length; i++) {
							oArrayAgregado = aRegistro[i]["Ano_Fiscal_Agregado"].split(",");
							oArrayFiltro = aRegistro[i]["Ano_Fiscal_Filtro"].split(",");
							for (var k = 0; k < oArrayAgregado.length; k++) {
								saida.push({
									Ano_Fiscal_Agregado: oArrayAgregado[k],
									Ano_Fiscal_Filtro: oArrayFiltro[k]
								})
							}
						}
						const result = [];
						const map = new Map();
						for (const item of saida) {
							if (!map.has(item.Ano_Fiscal_Agregado)) {
								map.set(item.Ano_Fiscal_Agregado, true); // set any value to Map
								result.push({
									Ano_Fiscal_Agregado: item.Ano_Fiscal_Agregado,
									Ano_Fiscal_Filtro: item.Ano_Fiscal_Filtro
								});
							}
						}
						result.sort(function (x, y) {
							return Number(Number(x["Ano_Fiscal_Filtro"] - y["Ano_Fiscal_Filtro"]));
						});
						that.getModel().setProperty("/AnoFiscal", result);
					}
				});
			}

		},
		/*
		onDataExportCSV : sap.m.Table.prototype.exportData || function(oEvent) {
			var array = this.getModel().getProperty("/TabelaDaView");
			var coluna = [];
			for (var k = 0, length = array.length; k < length; k++) {
				coluna.push({name: array[k]["textoNomeDaColuna"],template:{content: "{"+array[k]["propriedadeDoValorDaLinha"]+"}"}}) 
			}	
			
			var oExport = new Export({
			
				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType : new ExportTypeCSV({
					separatorChar : ";"
				}),

				// Pass in the model created above
				models : this.getView().getModel(),

				// binding information for the rows aggregation
				rows : {
					path : "/CSV"
				},
				columns : coluna
			});
			
			// download exported file
			oExport.saveFile(
				Utils.dateNowParaArquivo()
				+"_"
				+this.getResourceBundle().getText("viewGeralRelatorio") 
				+"_" 
				+ this.getResourceBundle().getText("viewEdiçãoTrimestreImpostoRenda")
				).catch(function(oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});
		},*/
		/*
		onDataExportCSV : sap.m.Table.prototype.exportData || function(oEvent) {

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType : new ExportTypeCSV({
					separatorChar : ";"
				}),

				// Pass in the model created above
				models : this.getView().getModel(),

				// binding information for the rows aggregation
				rows : {
					path : "/ReportTaxPackage"
				},
				// column definitions with column name and binding info for the content
				columns : [{
					name : this.getResourceBundle().getText("viewRelatorioEmpresa"),
					template : {
						content : "{tblEmpresa.nome}"
					}
				}, {
					name : this.getResourceBundle().getText("viewGeralAnoCalendario"),
					template : {
						content : "{tblDominioAnoCalendario.ano_calendario}"
					}
				}, {
					name : this.getResourceBundle().getText("viewGeralPeriodo"),
					template : {
						content : "{tblPeriodo.periodo}"
					}
				}, {
					name : this.getResourceBundle().getText("viewGeralFlagSN"),
					template : {
						content : "{tblItemToReport.flag_sim_nao}"
					}
				}, {
					name : this.getResourceBundle().getText("viewGeralFlagAno"),
					template : {
						content : "{tblItemToReport.flag_ano}"
					}
				}, {
					name : this.getResourceBundle().getText("viewRelatorioAnoFiscal"),
					template : {
						content : "{Ano_Fiscal_Agregado}"
					}
				}, {
					name : this.getResourceBundle().getText("viewTPRequisicaoReaberturaResposta") + " " + this.getResourceBundle().getText("viewGeralSim")+ "?",
					template : {
						content : "{tblRespostaItemToReport.ind_se_aplica}"
					}
				}, {
					name : this.getResourceBundle().getText("viewGeralQUestion"),
					template : {
						content : "{tblItemToReport.pergunta}"
					}
				}, {
					name : this.getResourceBundle().getText("viewTPRequisicaoReaberturaResposta"),
					template : {
						content : "{tblRespostaItemToReport.resposta}"
					}
				}]
			});
			
			// download exported file
			oExport.saveFile(
				Utils.dateNowParaArquivo()
				+"_"
				+this.getResourceBundle().getText("viewGeralRelatorio") 
				+"_" 
				+ this.getResourceBundle().getText("viewTaxPackageVisualizacaoTrimestreItensParaReportar")
				).catch(function(oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});
		},	*/
		onDataExport: sap.m.Table.prototype.exportData || function (tipo) {
			Utils.dataExportReport(this, tipo, "viewTaxPackageVisualizacaoTrimestreItensParaReportar",
				"viewTaxPackageVisualizacaoTrimestreItensParaReportar");
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
			var oFlagSNSelecionado = this.getModel().getProperty("/FlagSNSelecionado") ? this.getModel().getProperty("/FlagSNSelecionado")[0] !==
				undefined ? this.getModel().getProperty("/FlagSNSelecionado") : null : null;
			var oFlagAnoSelecionado = this.getModel().getProperty("/FlagAnoSelecionado") ? this.getModel().getProperty("/FlagAnoSelecionado")[0] !==
				undefined ? this.getModel().getProperty("/FlagAnoSelecionado") : null : null;
			var oPerguntaSelecionada = this.getModel().getProperty("/PerguntaSelecionada") ? this.getModel().getProperty("/PerguntaSelecionada")[
				0] !== undefined ? this.getModel().getProperty("/PerguntaSelecionada") : null : null;
			var oRespondeuSimSelecionado = this.getModel().getProperty("/RespondeuSimSelecionado") ? this.getModel().getProperty(
				"/RespondeuSimSelecionado")[0] !== undefined ? this.getModel().getProperty("/RespondeuSimSelecionado") : null : null;
			var oAnoFiscalSelecionado = this.getModel().getProperty("/AnoFiscalSelecionado") ? this.getModel().getProperty(
				"/AnoFiscalSelecionado")[0] !== undefined ? this.getModel().getProperty("/AnoFiscalSelecionado") : null : null;
			var oWhere = [];
			oWhere.push(oEmpresa);
			oWhere.push(oDominioAnoCalendario);
			oWhere.push(oPeriodoSelecionadas);
			oWhere.push(oMoedaSelecionadas);
			oWhere.push(null);
			oWhere.push(oFlagSNSelecionado);
			oWhere.push(oFlagAnoSelecionado);
			oWhere.push(oPerguntaSelecionada);
			oWhere.push(oRespondeuSimSelecionado);
			oWhere.push(oAnoFiscalSelecionado);
			oWhere.push(null);

			var that = this;
			that.setBusy(that.byId("relatorioDoTaxPackage"), true);
			that.byId("GerarRelatorio").setEnabled(false);
			jQuery.ajax(Constants.urlBackend + "DeepQuery/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
						for (var i = 0, length = aRegistro.length; i < length; i++) {
							aRegistro[i]["Ano_Fiscal_Agregado"] = aRegistro[i]["Ano_Fiscal_Agregado"] ? aRegistro[i]["Ano_Fiscal_Agregado"].replace(
								/\\\r,|,/g, "\n") : aRegistro[i]["Ano_Fiscal_Agregado"];
						}
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

		_aplicarMascara: function (numero) {
			if (this.isPTBR()) {
				return numero ? Number(numero).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "0";
			} else {
				return numero ? Number(numero).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
			}
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