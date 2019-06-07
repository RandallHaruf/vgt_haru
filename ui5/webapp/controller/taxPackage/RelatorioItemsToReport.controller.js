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
			else{
				this.getModel().setProperty('/IsAreaUsuario', true);
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
			this.getModel().setProperty("/StatusSelecionado", undefined);					
			//this.getModel().setProperty("/TemplateReport", undefined);
			this.getModel().setProperty("/ReportTaxPackage", undefined);
		},
		/*COMMENT M_VGT.53
		_onClearFiltros: function (oEvent) {
			this.getModel().setProperty("/IdEmpresasSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioAnoCalendarioSelecionadas", undefined);
			this.getModel().setProperty("/IdPeriodoSelecionadas", undefined);
			this.getModel().setProperty("/IdMoedaSelecionadas", undefined);
			this.getModel().setProperty("/FlagSNSelecionado", undefined);
			this.getModel().setProperty("/FlagAnoSelecionado", undefined);
			this.getModel().setProperty("/PerguntaSelecionada", undefined);
			this.getModel().setProperty("/RespondeuSimSelecionado", undefined);
			this.getModel().setProperty("/AnoFiscalSelecionado", undefined);
			this.getModel().setProperty("/StatusSelecionado", undefined);					
		},		
		COMMENT M_VGT.53*/
		
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
			Utils._dialogReport("Layout", "/TemplateReport", "/Excluir", that, "id_template_report","/Preselecionado", oEvent);
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
		getSelectedItemsTemplate: function(oEvent){
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
			var oStatusSelecionado = this.getModel().getProperty("/StatusSelecionado") ? this.getModel().getProperty(
				"/StatusSelecionado")[0] !== undefined ? this.getModel().getProperty("/StatusSelecionado") : null : null;
				
			var oWhere = {};
			var oFiltrosVisiveis = [];
			for (var i = 0, length = this.byId("filterbar").getAllFilterItems().length; i < length; i++) {
				oFiltrosVisiveis.push({
					name: this.byId("filterbar").getAllFilterItems()[i].mProperties.name,
					visible: this.byId("filterbar").getAllFilterItems()[i].mProperties.visibleInFilterBar
				});
			}
			oWhere.Empresa = oEmpresa; //0
			oWhere.AnoCalendario = oDominioAnoCalendario; //1
			oWhere.Periodo = oPeriodoSelecionadas; //2
			oWhere.Moeda = oMoedaSelecionadas; //3
			oWhere.FlagSN = oFlagSNSelecionado; //4
			oWhere.FlagAno = oFlagAnoSelecionado; //5
			oWhere.Pergunta = oPerguntaSelecionada; //6
			oWhere.RespondeuSim = oRespondeuSimSelecionado;//7
			oWhere.AnoFiscal = oAnoFiscalSelecionado;//8
			oWhere.Status = oStatusSelecionado;//NOVO 9
			oWhere.Filtros = oFiltrosVisiveis;//10
			return oWhere;
			
		},
		onTemplateSet: function (oEvent) {
			var oWhere = this.getSelectedItemsTemplate();
			this.getModel().setProperty("/Preselecionado", oWhere);
		},

		onTemplateGet: function (oEvent) {
			this._onClearSelecoes();
			var forcaSelecao = this.getModel().getProperty("/Preselecionado");

			this.getModel().setProperty("/IdEmpresasSelecionadas", forcaSelecao.Empresa);
			this.getModel().setProperty("/IdDominioAnoCalendarioSelecionadas", forcaSelecao.AnoCalendario);
			this.getModel().setProperty("/IdPeriodoSelecionadas", forcaSelecao.Periodo);
			this.getModel().setProperty("/IdMoedaSelecionadas", forcaSelecao.Moeda);
			this.getModel().setProperty("/FlagSNSelecionado", forcaSelecao.FlagSN);
			this.getModel().setProperty("/FlagAnoSelecionado", forcaSelecao.FlagAno);
			this.getModel().setProperty("/PerguntaSelecionada", forcaSelecao.Pergunta);
			this.getModel().setProperty("/RespondeuSimSelecionado", forcaSelecao.RespondeuSim);
			this.getModel().setProperty("/AnoFiscalSelecionado", forcaSelecao.AnoFiscal);
			this.getModel().setProperty("/StatusSelecionado", forcaSelecao.Status);

			for (var i = 0, length = forcaSelecao.Filtros.length; i < length; i++) {
				for (var k = 0, length = this.byId("filterbar").getAllFilterItems().length; k < length; k++) {
					if (forcaSelecao.Filtros[i].name == this.byId("filterbar").getAllFilterItems()[k].mProperties.name) {
						this.byId("filterbar").getAllFilterItems()[k].mProperties.visibleInFilterBar = forcaSelecao.Filtros[i].visible;
						break;
					}
				}
			}
		
			
			var dialog = this.byId("filterbar");
			dialog._setConsiderFilterChanges(false);
			dialog._recreateBasicAreaContainer(true);
			dialog._retrieveVisibleAdvancedItems();
			dialog._setConsiderFilterChanges(true);
			/*COMMENT M_VGT.23
			//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
			var that = this;
			that.getModel().setProperty("/Empresa",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Empresa"),"tblEmpresa.nome",that.getModel().getProperty("/IdEmpresasSelecionadas"),"tblEmpresa.id_empresa"));				
			that.getModel().setProperty("/DominioAnoCalendario",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioAnoCalendario"),"tblDominioAnoCalendario.ano_calendario",that.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas"),"tblDominioAnoCalendario.id_dominio_ano_calendario"));				
			that.getModel().setProperty("/Periodo",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Periodo"),"tblPeriodo.periodo",that.getModel().getProperty("/IdPeriodoSelecionadas"),"tblPeriodo.numero_ordem"));				
			that.getModel().setProperty("/DominioMoeda",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioMoeda"),"tblDominioMoeda.acronimo",that.getModel().getProperty("/IdMoedaSelecionadas"),"tblDominioMoeda.id_dominio_moeda"));				
			that.getModel().setProperty("/Pergunta",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Pergunta"),"tblItemToReport.pergunta",that.getModel().getProperty("/PerguntaSelecionada"),"tblItemToReport.pergunta"));				
			that.getModel().setProperty("/FlagAno",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/FlagAno"),"tblItemToReport.flag_ano",that.getModel().getProperty("/FlagAnoSelecionado"),"tblItemToReport.flag_ano"));				
			that.getModel().setProperty("/FlagSN",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/FlagSN"),"tblItemToReport.flag_sim_nao",that.getModel().getProperty("/FlagSNSelecionado"),"tblItemToReport.flag_sim_nao"));				
			that.getModel().setProperty("/RespondeuSim",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/RespondeuSim"),"tblRespostaItemToReport.ind_se_aplica",that.getModel().getProperty("/RespondeuSimSelecionado"),"tblRespostaItemToReport.ind_se_aplica"));				
			that.getModel().setProperty("/AnoFiscal",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/AnoFiscal"),"Ano_Fiscal_Agregado",that.getModel().getProperty("/AnoFiscalSelecionado"),"Ano_Fiscal_Filtro"));				
			that.getModel().setProperty("/Status",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Status"),"tblDominioRelTaxPackagePeriodoStatusEnvio.status_envio",that.getModel().getProperty("/StatusSelecionado"),"tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"));				
			COMMENT*/
		},

		_atualizarDados: function () {
			var that = this;
			var oWhere = this.getSelectedItemsTemplate();
			// if (oEmpresa === null) {
			// 	oWhere[11] = ["tblEmpresa.nome"];
			if (oWhere.Empresa === null) {
				oWhere.Distinct = ["tblEmpresa.nome"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
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
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/Empresa",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Empresa"),"tblEmpresa.nome",that.getModel().getProperty("/IdEmpresasSelecionadas"),"tblEmpresa.id_empresa"));				
			}COMMENT*/
			// if (oDominioAnoCalendario === null) {
			// 	oWhere[11] = ["tblDominioAnoCalendario.ano_calendario"];
			if (oWhere.AnoCalendario === null) {
				oWhere.Distinct = ["tblDominioAnoCalendario.ano_calendario"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
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
							return Number(Number(y["tblDominioAnoCalendario.ano_calendario"] - x["tblDominioAnoCalendario.ano_calendario"]));
						});
						that.getModel().setProperty("/DominioAnoCalendario", aRegistro);
						/*COMMENT M_VGT.23
						that.getModel().setProperty("/DominioAnoCalendario", Utils.orderByArrayParaBoxComSelecao(aRegistro,"tblDominioAnoCalendario.ano_calendario",that.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas"),"tblDominioAnoCalendario.id_dominio_ano_calendario"));							
						COMMENT*/
					}
				});
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioAnoCalendario",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioAnoCalendario"),"tblDominioAnoCalendario.ano_calendario",that.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas"),"tblDominioAnoCalendario.id_dominio_ano_calendario"));				
			}COMMENT*/
			// if (oPeriodoSelecionadas === null) {
			// 	oWhere[11] = ["tblPeriodo.id_periodo"];
			if (oWhere.Periodo === null) {
				oWhere.Distinct = ["tblPeriodo.id_periodo"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
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
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/Periodo",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Periodo"),"tblPeriodo.periodo",that.getModel().getProperty("/IdPeriodoSelecionadas"),"tblPeriodo.numero_ordem"));				
			}COMMENT*/
			// if (oMoedaSelecionadas === null) {
			// 	oWhere[11] = ["tblDominioMoeda.acronimo"];
			if (oWhere.Moeda === null) {
				oWhere.Distinct = ["tblDominioMoeda.acronimo"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
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
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioMoeda",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioMoeda"),"tblDominioMoeda.acronimo",that.getModel().getProperty("/IdMoedaSelecionadas"),"tblDominioMoeda.id_dominio_moeda"));				
			}COMMENT*/
			// if (oPerguntaSelecionada === null) {
			// 	oWhere[11] = ["tblItemToReport.pergunta"];
			if (oWhere.Pergunta === null) {
				oWhere.Distinct = ["tblItemToReport.pergunta"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
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
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/Pergunta",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Pergunta"),"tblItemToReport.pergunta",that.getModel().getProperty("/PerguntaSelecionada"),"tblItemToReport.pergunta"));				
			}COMMENT*/
			// if (oFlagAnoSelecionado === null) {
			// 	oWhere[11] = ["tblItemToReport.flag_ano"];
			if (oWhere.FlagAno === null) {
				oWhere.Distinct = ["tblItemToReport.flag_ano"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
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
						for (var i = 0, length = aRegistro.length; i < length; i++){
							aRegistro[i]["tblItemToReport.flag_ano"] = Utils.traduzBooleano(aRegistro[i]["tblItemToReport.flag_ano"], that);							
						}
						that.getModel().setProperty("/FlagAno", aRegistro);
					}
				});
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/FlagAno",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/FlagAno"),"tblItemToReport.flag_ano",that.getModel().getProperty("/FlagAnoSelecionado"),"tblItemToReport.flag_ano"));				
			}COMMENT*/

			// if (oFlagSNSelecionado === null) {
			// 	oWhere[11] = ["tblItemToReport.flag_sim_nao"];
			if (oWhere.FlagSN === null) {
				oWhere.Distinct = ["tblItemToReport.flag_sim_nao"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
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
						for (var i = 0, length = aRegistro.length; i < length; i++){
							aRegistro[i]["tblItemToReport.flag_sim_nao"] = Utils.traduzBooleano(aRegistro[i]["tblItemToReport.flag_sim_nao"], that);
						}						
						that.getModel().setProperty("/FlagSN", aRegistro);
					}
				});
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/FlagSN",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/FlagSN"),"tblItemToReport.flag_sim_nao",that.getModel().getProperty("/FlagSNSelecionado"),"tblItemToReport.flag_sim_nao"));				
			}COMMENT*/
			// if (oRespondeuSimSelecionado === null) {
			// 	oWhere[11] = ["tblRespostaItemToReport.ind_se_aplica"];
			if (oWhere.RespondeuSim === null) {
				oWhere.Distinct = ["tblRespostaItemToReport.ind_se_aplica"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
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
						for (var i = 0, length = aRegistro.length; i < length; i++){
							aRegistro[i]["tblRespostaItemToReport.ind_se_aplica"] = Utils.traduzBooleano(aRegistro[i]["tblRespostaItemToReport.ind_se_aplica"], that);
						}						
						that.getModel().setProperty("/RespondeuSim", aRegistro);
					}
				});
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/RespondeuSim",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/RespondeuSim"),"tblRespostaItemToReport.ind_se_aplica",that.getModel().getProperty("/RespondeuSimSelecionado"),"tblRespostaItemToReport.ind_se_aplica"));				
			}COMMENT*/
			// if (oAnoFiscalSelecionado === null) {
			// 	oWhere[11] = ["tblDominioAnoFiscal.ano_fiscal"];
			if (oWhere.AnoFiscal === null) {
				oWhere.Distinct = ["tblDominioAnoFiscal.ano_fiscal"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
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
							return Number(Number( y["Ano_Fiscal_Filtro"]) - x["Ano_Fiscal_Filtro"]);
						});
						that.getModel().setProperty("/AnoFiscal", result);
					}
				});
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/AnoFiscal",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/AnoFiscal"),"Ano_Fiscal_Agregado",that.getModel().getProperty("/AnoFiscalSelecionado"),"Ano_Fiscal_Filtro"));				
			}COMMENT*/
			// if (oStatusSelecionado === null) {
			// 	oWhere[11] = ["tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"];
			if (oWhere.Status === null) {
				oWhere.Distinct = ["tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
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
							aRegistro[i]["tblDominioRelTaxPackagePeriodoStatusEnvio.status_envio"] = Utils.traduzRelTaxPackagePeriodoStatusEnvio(aRegistro[i]["tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"], that);
						}	
						that.getModel().setProperty("/Status", Utils.orderByArrayParaBox(aRegistro, "tblDominioRelTaxPackagePeriodoStatusEnvio.status_envio"));
					}
				});
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/Status",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Status"),"tblDominioRelTaxPackagePeriodoStatusEnvio.status_envio",that.getModel().getProperty("/StatusSelecionado"),"tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"));				
			}COMMENT*/
		},

		onDataExport: sap.m.Table.prototype.exportData || function (tipo) {
			Utils.dataExportReport(this, tipo, "viewTaxPackageVisualizacaoTrimestreItensParaReportar",
				"viewTaxPackageVisualizacaoTrimestreItensParaReportar","/TabelaDaView");
		},
		_geraRelatorioTax: function (ifExport) {

			var oWhere = this.getSelectedItemsTemplate();
			var that = this;
			that.byId("GerarRelatorio").setEnabled(false);
			
			const promise1 = function () {
				return new Promise(function (resolve, reject) {
					that.setBusy(that.byId("relatorioDoTaxPackage"),true);							
					jQuery.ajax(Constants.urlBackend + "DeepQuery/ReportTaxPackage?full=" + (that.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
						type: "POST",
						xhrFields: {
							withCredentials: true
						},
						crossDomain: true,
						data: {
							parametros: JSON.stringify(oWhere)
						},
						success: function (response) {
							resolve(response);
						}
					});								

				});
			};		
			
			const handler1 = function (response) {
					var aRegistro = JSON.parse(response);
					for (var i = 0, length = aRegistro.length; i < length; i++) {
						aRegistro[i]["tblPeriodo.periodo"] = Utils.traduzTrimestre(aRegistro[i]["tblPeriodo.numero_ordem"], that);
						aRegistro[i]["tblDominioRelTaxPackagePeriodoStatusEnvio.status_envio"] = Utils.traduzRelTaxPackagePeriodoStatusEnvio(aRegistro[i]["tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"], that);
						aRegistro[i]["tblItemToReport.flag_sim_nao"] = Utils.traduzBooleano(aRegistro[i]["tblItemToReport.flag_sim_nao"], that);
						aRegistro[i]["tblRespostaItemToReport.ind_se_aplica"] = Utils.traduzBooleano(aRegistro[i]["tblRespostaItemToReport.ind_se_aplica"], that);
						aRegistro[i]["tblItemToReport.flag_ano"] = Utils.traduzBooleano(aRegistro[i]["tblItemToReport.flag_ano"], that);
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
					}
				};		
			
			promise1()
				.then(function(res) {
					handler1(res);
				})
				.catch(function(err){
					console.log(err);
				})
				.finally(function(){
					that.byId("GerarRelatorio").setEnabled(true);	
					that.setBusy(that.byId("relatorioDoTaxPackage"),false);	
				});				
			
			
			
			
			jQuery.ajax(Constants.urlBackend + "DeepQuery/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
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
						aRegistro[i]["tblDominioRelTaxPackagePeriodoStatusEnvio.status_envio"] = Utils.traduzRelTaxPackagePeriodoStatusEnvio(aRegistro[i]["tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"], that);
						aRegistro[i]["tblItemToReport.flag_sim_nao"] = Utils.traduzBooleano(aRegistro[i]["tblItemToReport.flag_sim_nao"], that);
						aRegistro[i]["tblRespostaItemToReport.ind_se_aplica"] = Utils.traduzBooleano(aRegistro[i]["tblRespostaItemToReport.ind_se_aplica"], that);
						aRegistro[i]["tblItemToReport.flag_ano"] = Utils.traduzBooleano(aRegistro[i]["tblItemToReport.flag_ano"], that);
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