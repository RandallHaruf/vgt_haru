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

	return BaseController.extend("ui5ns.ui5.controller.taxPackage.Relatorio", {
		onInit: function () {

			var oModel = new sap.ui.model.json.JSONModel({});
			oModel.setSizeLimit(5000);
			this.getView().setModel(oModel);
			Utils.conteudoView("relatorioDoTaxPackageAccountingResult", this, "/TabelaDaViewAccountingResult");
			Utils.conteudoView("relatorioDoTaxPackageTemporaryAndPermanentDiferences", this, "/TabelaDaViewTemporaryAndPermanentDiferences");
			Utils.conteudoView("relatorioDoTaxPackageFiscalResult", this, "/TabelaDaViewFiscalResult");
			Utils.conteudoView("relatorioDoTaxPackageIncomeTax", this, "/TabelaDaViewIncomeTax");			
			if (this.isVisualizacaoUsuario()) {
				this.getRouter().getRoute("taxPackageRelatorio").attachPatternMatched(this._handleRouteMatched, this);
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
								this.getModel().setProperty("/NomeUsuario", response.nome + " - " + response.ambiente);
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
			this.getModel().setProperty("/Modulo",[{
					"key": "AccountingResult",
					"value": this.getResourceBundle().getText("viewEdiçãoTrimestreResultadoContabil")
				}, {
					"key": "TemporaryAndPermanentDiferences",
					"value": this.getResourceBundle().getText("viewGeralAdicoesEExclusoes")
				}, {
					"key": "FiscalResult",
					"value": this.getResourceBundle().getText("viewEdiçãoTrimestreResultadoFiscal")
				}, { 
					"key": "IncomeTax",
					"value": this.getResourceBundle().getText("viewEdiçãoTrimestreImpostoRenda")
				}]);			
				
			var that = this;
			that.setBusy(that.byId("idNomeReport"), true);
			that.getModel().setProperty("/NomeReport",that.getResourceBundle().getText("viewGeralRelatorio") + " " + that.getResourceBundle().getText("viewTaxPackageVisualiazaçcaoTaxReconciliation"));			
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
			this.getModel().setProperty("/StatusSelecionado", undefined);
			this.getModel().setProperty("/IdTipoDiferencaSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioTipoDiferencaSelecionadas", undefined);
			this.getModel().setProperty("/ModuloSelecionado", undefined);
			//this.getModel().setProperty("/TemplateReport", undefined);
			this.getModel().setProperty("/ReportTaxPackage", undefined);
			this.getModel().setProperty("/ReportTaxPackageTemporaryAndPermanentDiferences", undefined);
			this.getModel().setProperty("/ReportTaxPackageIncomeTax", undefined);
			this.getModel().setProperty("/ReportTaxPackageFiscalResult", undefined);
			this.getModel().setProperty("/ReportTaxPackageAccountingResult", undefined);	
			this.byId("PanelAccountingResult").setProperty("expanded",false);			
			this.byId("PanelTemporaryAndPermanentDiferences").setProperty("expanded",false);			
			this.byId("PanelFiscalResult").setProperty("expanded",false);			
			this.byId("PanelIncomeTax").setProperty("expanded",false);						

		},
		/*COMMENT M_VGT.53
		_onClearFiltros: function (oEvent) {
			this.getModel().setProperty("/IdEmpresasSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioAnoCalendarioSelecionadas", undefined);
			this.getModel().setProperty("/IdPeriodoSelecionadas", undefined);
			this.getModel().setProperty("/IdMoedaSelecionadas", undefined);
			this.getModel().setProperty("/StatusSelecionado", undefined);
			this.getModel().setProperty("/IdTipoDiferencaSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioTipoDiferencaSelecionadas", undefined);
			this.getModel().setProperty("/ModuloSelecionado", undefined);					
		},		
		COMMENT M_VGT.53*/	
		onSelectChange: function (oEvent) {
			var that = this;
			var oAba = this.getModel().getProperty("/ModuloSelecionado") ? this.getModel().getProperty("/ModuloSelecionado")[0] !==
				undefined ? this.getModel().getProperty("/ModuloSelecionado") : null : null;	
			/*COMMENT M_VGT.23
			//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
			that.getModel().setProperty("/Empresa",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Empresa"),"nome",that.getModel().getProperty("/IdEmpresasSelecionadas"),"id_empresa"));
			that.getModel().setProperty("/DominioAnoCalendario",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioAnoCalendario"),"ano_calendario",that.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas"),"id_dominio_ano_calendario"));				
			that.getModel().setProperty("/Periodo",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Periodo"),"periodo",that.getModel().getProperty("/IdPeriodoSelecionadas"),"numero_ordem"));				
			that.getModel().setProperty("/DominioMoeda",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioMoeda"),"acronimo",that.getModel().getProperty("/IdMoedaSelecionadas"),"id_dominio_moeda"));				
			that.getModel().setProperty("/Status",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Status"),"value",that.getModel().getProperty("/StatusSelecionado"),"key"));				
			that.getModel().setProperty("/TipoDiferenca",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/TipoDiferenca"),"tblDiferencaOpcao.nome",that.getModel().getProperty("/IdTipoDiferencaSelecionadas"),"tblDiferencaOpcao.id_diferenca_opcao"));				
			that.getModel().setProperty("/DominioTipoDiferenca",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioTipoDiferenca"),"tblDominioDiferencaTipo.tipo",that.getModel().getProperty("/IdDominioTipoDiferencaSelecionadas"),"tblDominioDiferencaTipo.id_dominio_diferenca_tipo"));				
			that.getModel().setProperty("/Modulo",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Modulo"),"value",that.getModel().getProperty("/ModuloSelecionado"),"key"));
			COMMENT*/		
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

		onTemplateSet: function (oEvent) {
			var oWhere = this.getSelectedItemsTemplate();
			this.getModel().setProperty("/Preselecionado", oWhere);
		},

		onTemplateGet: function (oEvent) {
			this._onClearSelecoes();
			var that = this;
			var forcaSelecao = this.getModel().getProperty("/Preselecionado");
			this.getModel().setProperty("/IdEmpresasSelecionadas", forcaSelecao.Empresa);
			this.getModel().setProperty("/IdDominioAnoCalendarioSelecionadas", forcaSelecao.AnoCalendario);
			this.getModel().setProperty("/IdPeriodoSelecionadas", forcaSelecao.Periodo);
			this.getModel().setProperty("/IdMoedaSelecionadas", forcaSelecao.Moeda);
			this.getModel().setProperty("/StatusSelecionado", forcaSelecao.Status);
			this.getModel().setProperty("/IdTipoDiferencaSelecionadas", forcaSelecao.TipoDiferenca);
			this.getModel().setProperty("/IdDominioTipoDiferencaSelecionadas", forcaSelecao.DominioTipoDiferenca);
			this.getModel().setProperty("/ModuloSelecionado", forcaSelecao.Modulo);
			
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
			that.getModel().setProperty("/Empresa",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Empresa"),"nome",that.getModel().getProperty("/IdEmpresasSelecionadas"),"id_empresa"));
			that.getModel().setProperty("/DominioAnoCalendario",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioAnoCalendario"),"ano_calendario",that.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas"),"id_dominio_ano_calendario"));				
			that.getModel().setProperty("/Periodo",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Periodo"),"periodo",that.getModel().getProperty("/IdPeriodoSelecionadas"),"numero_ordem"));				
			that.getModel().setProperty("/DominioMoeda",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioMoeda"),"acronimo",that.getModel().getProperty("/IdMoedaSelecionadas"),"id_dominio_moeda"));				
			that.getModel().setProperty("/Status",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Status"),"value",that.getModel().getProperty("/StatusSelecionado"),"key"));				
			that.getModel().setProperty("/TipoDiferenca",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/TipoDiferenca"),"tblDiferencaOpcao.nome",that.getModel().getProperty("/IdTipoDiferencaSelecionadas"),"tblDiferencaOpcao.id_diferenca_opcao"));				
			that.getModel().setProperty("/DominioTipoDiferenca",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioTipoDiferenca"),"tblDominioDiferencaTipo.tipo",that.getModel().getProperty("/IdDominioTipoDiferencaSelecionadas"),"tblDominioDiferencaTipo.id_dominio_diferenca_tipo"));				
			that.getModel().setProperty("/Modulo",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Modulo"),"value",that.getModel().getProperty("/ModuloSelecionado"),"key"));
			COMMENT*/			
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
			var oStatusSelecionado = this.getModel().getProperty("/StatusSelecionado") ? this.getModel().getProperty(
				"/StatusSelecionado")[0] !== undefined ? this.getModel().getProperty("/StatusSelecionado") : null : null;
			var oIdTipoDiferencaSelecionadas = this.getModel().getProperty("/IdTipoDiferencaSelecionadas") ? this.getModel().getProperty(
				"/IdTipoDiferencaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdTipoDiferencaSelecionadas") : null : null;
			var oIdDominioTipoDiferencaSelecionadas = this.getModel().getProperty("/IdDominioTipoDiferencaSelecionadas") ? this.getModel().getProperty(
				"/IdDominioTipoDiferencaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioTipoDiferencaSelecionadas") : null : null;
			var oModuloSelecionado = this.getModel().getProperty("/ModuloSelecionado") ? this.getModel().getProperty(
				"/ModuloSelecionado")[0] !== undefined ? this.getModel().getProperty("/ModuloSelecionado") : null : null;
				
			var oFiltrosVisiveis = [];
			for (var i = 0, length = this.byId("filterbar").getAllFilterItems().length; i < length; i++) {
				oFiltrosVisiveis.push(
					{
						name: this.byId("filterbar").getAllFilterItems()[i].mProperties.name ,
						visible: this.byId("filterbar").getAllFilterItems()[i].mProperties.visibleInFilterBar
					}
				);
			}
		
			var oWhere = {};
			oWhere.Empresa = oEmpresa;
			oWhere.AnoCalendario = oDominioAnoCalendario;
			oWhere.Periodo = oPeriodoSelecionadas;
			oWhere.Moeda = oMoedaSelecionadas;
			oWhere.Status = oStatusSelecionado;				
			oWhere.TipoDiferenca = oIdTipoDiferencaSelecionadas;	
			oWhere.DominioTipoDiferenca = oIdDominioTipoDiferencaSelecionadas;
			oWhere.Modulo = oModuloSelecionado;
			oWhere.Filtros = oFiltrosVisiveis;
			return oWhere;
		},
		
		_atualizarDados: function () {
			var that = this;
			
			NodeAPI.listarRegistros("Empresa?full="+(this.isIFrame() ? "true" : "false")+"&moduloAtual=taxpackage", function (response) {
				var aRegistro = response;
				that.getModel().setProperty("/Empresa", Utils.orderByArrayParaBox(aRegistro, "nome"));
			});		
			NodeAPI.listarRegistros("DominioAnoCalendario", function (response) {
				var aRegistro = response;
				that.getModel().setProperty("/DominioAnoCalendario", aRegistro);
			});				
			that.getModel().setProperty("/Periodo", Utils.orderByArrayParaBox([{
				periodo: that.getResourceBundle().getText('viewGeralPeriodo1'),
				numero_ordem: 1
				}, {
				periodo: that.getResourceBundle().getText('viewGeralPeriodo2'),
				numero_ordem: 2
				}, {
				periodo: that.getResourceBundle().getText('viewGeralPeriodo3'),
				numero_ordem: 3
				}, {
				periodo: that.getResourceBundle().getText('viewGeralPeriodo4'),
				numero_ordem: 4
				}, {
				periodo: that.getResourceBundle().getText('viewGeralPeriodo5'),
				numero_ordem: 5
				}, {
				periodo: that.getResourceBundle().getText('viewGeralPeriodo6'),
				numero_ordem: 6
			}], "periodo"));
			NodeAPI.listarRegistros("DominioMoeda", function (response) {
				var aRegistro = response;
				that.getModel().setProperty("/DominioMoeda", Utils.orderByArrayParaBox(aRegistro, "acronimo"));
			});	
				
			that.getModel().setProperty("/Status", Utils.orderByArrayParaBox([{
				value: that.getResourceBundle().getText('viewTAXListagemEmpresaTooltipIcones1'),
				key: 1
				}, {
				value: that.getResourceBundle().getText('viewTAXListagemEmpresaTooltipIcones2'),
				key: 2
				}, {
				value: that.getResourceBundle().getText('viewTAXListagemEmpresaTooltipIcones3'),
				key: 3
				}, {
				value: that.getResourceBundle().getText('viewTAXListagemEmpresaTooltipIcones4'),
				key: 4
				}, {
				value: that.getResourceBundle().getText('viewTAXListagemEmpresaTooltipIcones5'),
				key: 5
				}], "value"));				
	
			var oWhere = {};

			oWhere.Empresa = null;
			oWhere.AnoCalendario = null;
			oWhere.Periodo = null;
			oWhere.Moeda = null;
			oWhere.Status = null;				
			oWhere.TipoDiferenca = null;	
			oWhere.DominioTipoDiferenca = null;
			oWhere.Modulo = null;
			oWhere.Filtros = null;			
			
			oWhere.Distinct = ["tblDiferencaOpcao.nome"];			
			jQuery.ajax(Constants.urlBackend + "deepQueryDistinctTemporaryAndPermanentDifferences/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
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
					that.getModel().setProperty("/TipoDiferenca", Utils.orderByArrayParaBox(aRegistro,"tblDiferencaOpcao.nome"));
				}
			});

			oWhere.Distinct = ["tblDominioDiferencaTipo.tipo"];			
			jQuery.ajax(Constants.urlBackend + "deepQueryDistinctTemporaryAndPermanentDifferences/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
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
							aRegistro[i]["tblDominioDiferencaTipo.tipo"] = Utils.traduzDominioDiferencaTipo(aRegistro[i]["tblDominioDiferencaTipo.id_dominio_diferenca_tipo"],that);           
						}						
					that.getModel().setProperty("/DominioTipoDiferenca", Utils.orderByArrayParaBox(aRegistro,"tblDominioDiferencaTipo.tipo"));
				}
			});	
		},

		onDataExport: sap.m.Table.prototype.exportData || function (tipo,nomeDaAba,nomeDoReport,idtabela) {
			Utils.dataExportReport(this, tipo, nomeDaAba, nomeDoReport,idtabela);
		},
		
		_geraRelatorioTax: function (ifExport) {

			var oWhere = this.getSelectedItemsTemplate();
			
			var that = this;

			that.byId("GerarRelatorio").setEnabled(false);

			var AccountingResultVisible = false;
			var TemporaryAndPermanentDiferencesVisible = false;
			var FiscalResultVisible = false;
			var IncomeTaxVisible = false;		
			
			if(oWhere.Modulo == null){			
				AccountingResultVisible = true;
				TemporaryAndPermanentDiferencesVisible = true;
				FiscalResultVisible = true;
				IncomeTaxVisible = true;					
			}
			else{
				for (var k = 0, length = oWhere.Modulo.length; k < length; k++) {
					switch(oWhere.Modulo[k]){
						case "AccountingResult":
							AccountingResultVisible = true;
							break;
						case "TemporaryAndPermanentDiferences":
							TemporaryAndPermanentDiferencesVisible = true;
							break;
						case "FiscalResult":
							FiscalResultVisible = true;
							break;
						case "IncomeTax":
							IncomeTaxVisible = true;
							break;						
					}
				}					
			}
			
			
			that.getModel().setProperty("/AccountingResultVisible",AccountingResultVisible);
			that.getModel().setProperty("/TemporaryAndPermanentDiferencesVisible",TemporaryAndPermanentDiferencesVisible);
			that.getModel().setProperty("/FiscalResultVisible",FiscalResultVisible);
			that.getModel().setProperty("/IncomeTaxVisible",IncomeTaxVisible);
			
			const promise1 = function () {
				return new Promise(function (resolve, reject) {
					if(TemporaryAndPermanentDiferencesVisible){
						that.setBusy(that.byId("relatorioDoTaxPackageTemporaryAndPermanentDiferences"), true);								
						jQuery.ajax(Constants.urlBackend + "deepQueryDistinctTemporaryAndPermanentDifferences/ReportTaxPackage?full=" + (that.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
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
					}else{
						resolve();
					}
				});
			};		
			
			const handler1 = function (response) {
				if(TemporaryAndPermanentDiferencesVisible){
					var aRegistro = JSON.parse(response);
						for (var i = 0, length = aRegistro.length; i < length; i++) {
							aRegistro[i]["tblPeriodo.periodo"] = Utils.traduzTrimestre(aRegistro[i]["tblPeriodo.numero_ordem"],that); 
							aRegistro[i]["tblDominioDiferencaTipo.tipo"] = Utils.traduzDominioDiferencaTipo(aRegistro[i]["tblDominioDiferencaTipo.id_dominio_diferenca_tipo"],that); 
							aRegistro[i]["tblDominioRelTaxPackagePeriodoStatusEnvio.status_envio"] = Utils.traduzRelTaxPackagePeriodoStatusEnvio(aRegistro[i]["tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"], that);						
						}
						Utils.conteudoView("relatorioDoTaxPackageTemporaryAndPermanentDiferences",that,"/TabelaDaViewTemporaryAndPermanentDiferences");
						var array = that.getModel().getProperty("/TabelaDaViewTemporaryAndPermanentDiferences");
						var valor;
						if(ifExport === "/CSV" || ifExport === "/XLSX" || ifExport === "/TXT"){
							for (var i = 0, length = aRegistro.length; i < length; i++) {
								for (var k = 0, lengthk = array.length; k < lengthk; k++) {
									valor = aRegistro[i][array[k]["propriedadeDoValorDaLinha"]]
									aRegistro[i][array[k]["propriedadeDoValorDaLinha"]] = Validador.isNumber(valor) ? valor.toString().indexOf(".") !== -1 ? Utils.aplicarMascara(valor,that): valor : valor;
								}
							}						
							that.getModel().setProperty(ifExport, aRegistro);
							that.setBusy(that.byId("relatorioDoTaxPackageTemporaryAndPermanentDiferences"),false);		
					
							that.onDataExport(
								ifExport,
								"viewGeralAdicoesEExclusoes",
								"viewGeralAdicoesEExclusoes",
								"/TabelaDaViewTemporaryAndPermanentDiferences"
							);
						}
						else{
							if(aRegistro.length > 0){
								for (var k = 0, length = array.length; k < length; k++) {
									Utils.ajustaRem(that,aRegistro,array[k]["propriedadeDoValorDaLinha"],array[k]["textoNomeDaColuna"],3,1.35)
								}							
							}
							that.getModel().setProperty("/ReportTaxPackageTemporaryAndPermanentDiferences", aRegistro);
							that.setBusy(that.byId("relatorioDoTaxPackageTemporaryAndPermanentDiferences"),false);		
						}						
				}
			};
			
			const promise2 = function () {
				return new Promise(function (resolve, reject) {
					if(IncomeTaxVisible){
						that.setBusy(that.byId("relatorioDoTaxPackageIncomeTax"), true);	
						jQuery.ajax(Constants.urlBackend + "deepQueryDistinctIncomeTax/ReportTaxPackage?full=" + (that.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
							type: "POST",
							xhrFields: {
								withCredentials: true
							},
							crossDomain: true,
							data: {
								parametros: JSON.stringify(oWhere)
							},
							success: function (response1) {
								resolve(response1);
							}
						});
					}else{
						resolve();
					}
				});
			};				
			
			const handler2 = function (response1) {
				if(IncomeTaxVisible){
					var aRegistro1 = JSON.parse(response1);
					for (var j = 0, length1 = aRegistro1.length; j < length1; j++) {
						aRegistro1[j]["tblPeriodo.periodo"] = Utils.traduzTrimestre(aRegistro1[j]["tblPeriodo.numero_ordem"], that);
						aRegistro1[j]["tblDominioRelTaxPackagePeriodoStatusEnvio.status_envio"] = Utils.traduzRelTaxPackagePeriodoStatusEnvio(aRegistro1[j]["tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"], that);						
					}
					Utils.conteudoView("relatorioDoTaxPackageIncomeTax", that, "/TabelaDaViewIncomeTax");
					var array1 = that.getModel().getProperty("/TabelaDaViewIncomeTax");
					var valor1;
					if (ifExport === "/CSV" || ifExport === "/XLSX" || ifExport === "/TXT") {
						for (var j = 0, length1 = aRegistro1.length; j < length1; j++) {
							for (var l = 0, lengthk1 = array1.length; l< lengthk1; l++) {
								valor1 = aRegistro1[j][array1[l]["propriedadeDoValorDaLinha"]]
								aRegistro1[j][array1[l]["propriedadeDoValorDaLinha"]] = Validador.isNumber(valor1) ? valor1.toString().indexOf(".") !== -1 ?
									Utils.aplicarMascara(valor1, that) : valor1 : valor1;
							}
						}
						that.getModel().setProperty(ifExport, aRegistro1);
						that.setBusy(that.byId("relatorioDoTaxPackageIncomeTax"), false);

						that.onDataExport(
							ifExport,
							"viewEdiçãoTrimestreImpostoRenda",
							"viewEdiçãoTrimestreImpostoRenda",
							"/TabelaDaViewIncomeTax"
						);
					} else {
						if(aRegistro1.length > 0){
							for (var l = 0, length1 = array1.length; l < length1; l++) {
								Utils.ajustaRem(that,aRegistro1,array1[l]["propriedadeDoValorDaLinha"],array1[l]["textoNomeDaColuna"],3,1.35)
							}							
						}						
						that.getModel().setProperty("/ReportTaxPackageIncomeTax", aRegistro1);
						that.setBusy(that.byId("relatorioDoTaxPackageIncomeTax"), false);
					}					
				}
			};		
			
			const promise3 = function () {
				return new Promise(function (resolve, reject) {
					if(FiscalResultVisible){
						that.setBusy(that.byId("relatorioDoTaxPackageFiscalResult"), true);								
						jQuery.ajax(Constants.urlBackend + "DeepQueryDistinctFiscalResult/ReportTaxPackage?full=" + (that.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
							type: "POST",
							xhrFields: {
								withCredentials: true
							},
							crossDomain: true,
							data: {
								parametros: JSON.stringify(oWhere)
							},
							success: function (response2) {		
								resolve(response2);
							}
						});
					}else{
						resolve();
					}
				});
			};			
			
			const handler3 = function (response2) {
				if(FiscalResultVisible){
					var aRegistro2 = JSON.parse(response2);
					for (var x = 0, length2 = aRegistro2.length; x < length2; x++) {
						aRegistro2[x]["tblPeriodo.periodo"] = Utils.traduzTrimestre(aRegistro2[x]["tblPeriodo.numero_ordem"],that); 		
						aRegistro2[x]["tblDominioRelTaxPackagePeriodoStatusEnvio.status_envio"] = Utils.traduzRelTaxPackagePeriodoStatusEnvio(aRegistro2[x]["tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"], that);						
					}
					Utils.conteudoView("relatorioDoTaxPackageFiscalResult",that,"/TabelaDaViewFiscalResult");
					var array2 = that.getModel().getProperty("/TabelaDaViewFiscalResult");
					var valor2;
					if(ifExport === "/CSV" || ifExport === "/XLSX" || ifExport === "/TXT"){
						for (var x = 0, length2 = aRegistro2.length; x < length2; x++) {
							for (var y = 0, lengthk2 = array2.length; y < lengthk2; y++) {
								valor2 = aRegistro2[x][array2[y]["propriedadeDoValorDaLinha"]]
								aRegistro2[x][array2[y]["propriedadeDoValorDaLinha"]] = Validador.isNumber(valor2) ? valor2.toString().indexOf(".") !== -1 ? Utils.aplicarMascara(valor2,that): valor2 : valor2;
							}
						}						
						that.getModel().setProperty(ifExport, aRegistro2);
						that.setBusy(that.byId("relatorioDoTaxPackageFiscalResult"),false);		
						
						that.onDataExport(
							ifExport,
							"viewEdiçãoTrimestreResultadoFiscal",
							"viewEdiçãoTrimestreResultadoFiscal",							
							"/TabelaDaViewFiscalResult"
						);
					}
					else{
						if(aRegistro2.length > 0){
							for (var x = 0, length = array2.length; x < length; x++) {
								Utils.ajustaRem(that,aRegistro2,array2[x]["propriedadeDoValorDaLinha"],array2[x]["textoNomeDaColuna"],3,1.35)
							}							
						}						
						that.getModel().setProperty("/ReportTaxPackageFiscalResult", aRegistro2);
						that.setBusy(that.byId("relatorioDoTaxPackageFiscalResult"),false);		
						
					}					
				}
			};				
			
			const promise4 = function () {
				return new Promise(function (resolve, reject) {
					if(AccountingResultVisible){
						that.setBusy(that.byId("relatorioDoTaxPackageAccountingResult"), true);						
						jQuery.ajax(Constants.urlBackend + "DeepQueryDistinctAccountingResult/ReportTaxPackage?full=" + (that.isIFrame() ? "true" : "false")+"&moduloAtual=2" /*Modulo 2 representa Tax Package*/, {
							type: "POST",
							xhrFields: {
								withCredentials: true
							},
							crossDomain: true,
							data: {
								parametros: JSON.stringify(oWhere)
							},
							success: function (response3) {			
								resolve(response3);
							}
						});
					}else{
						resolve();
					}
				});
			};			
			
			const handler4 = function (response3) {
				if(AccountingResultVisible){
					var aRegistro3 = JSON.parse(response3);
					for (var w = 0, length3 = aRegistro3.length; w < length3; w++) {
						aRegistro3[w]["tblPeriodo.periodo"] = Utils.traduzTrimestre(aRegistro3[w]["tblPeriodo.numero_ordem"], that);
						aRegistro3[w]["tblDominioRelTaxPackagePeriodoStatusEnvio.status_envio"] = Utils.traduzRelTaxPackagePeriodoStatusEnvio(aRegistro3[w]["tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"], that);						
					}
					Utils.conteudoView("relatorioDoTaxPackageAccountingResult", that, "/TabelaDaViewAccountingResult");
					var array3 = that.getModel().getProperty("/TabelaDaViewAccountingResult");
					var valor3;
					if (ifExport === "/CSV" || ifExport === "/XLSX" || ifExport === "/TXT") {
						for (var w = 0, length3 = aRegistro3.length; w < length3; w++) {
							for (var z = 0, lengthk3 = array3.length; z < lengthk3; z++) {
								valor3 = aRegistro3[w][array3[z]["propriedadeDoValorDaLinha"]]
								aRegistro3[w][array3[z]["propriedadeDoValorDaLinha"]] = Validador.isNumber(valor3) ? valor3.toString().indexOf(".") !== -1 ?
									Utils.aplicarMascara(valor3, that) : valor3 : valor3;
							}
						}
						that.getModel().setProperty(ifExport, aRegistro3);
						that.setBusy(that.byId("relatorioDoTaxPackageAccountingResult"), false);

						that.onDataExport(
							ifExport,
							"viewEdiçãoTrimestreResultadoContabil",
							"viewEdiçãoTrimestreResultadoContabil",									
							"/TabelaDaViewAccountingResult"
						);
					} else {
						if(aRegistro3.length > 0){
							for (var w = 0, length3 = array3.length; w < length3; w++) {
								Utils.ajustaRem(that,aRegistro3,array3[w]["propriedadeDoValorDaLinha"],array3[w]["textoNomeDaColuna"],3,1.35)
							}							
						}						
						that.getModel().setProperty("/ReportTaxPackageAccountingResult", aRegistro3);
						that.setBusy(that.byId("relatorioDoTaxPackageAccountingResult"), false);

					}					
				}
			};	
			
			promise1()
				.then(function(res) {
					handler1(res);
					return promise2();
				})
				.then(function(res) {
					handler2(res);
					return promise3();
				})
				.then(function(res) {
					handler3(res);
					return promise4();
				})
				.then(function(res){
					handler4(res);
				})
				.catch(function(err){
					console.log(err);
				})
				.finally(function(){
					that.byId("GerarRelatorio").setEnabled(true);					
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
		}

	});
});