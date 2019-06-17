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
], function (jQuery, Controller, Filter, JSONModel, BaseController,NodeAPI,Constants,Export,ExportType,ExportTypeCSV,TablePersoController,MessageBox,Utils,Validador) {
	"use strict";

	return BaseController.extend("ui5ns.ui5.controller.taxPackage.RelatorioTemporaryAndPermanentDifferences", {
		onInit: function () {

			var oModel = new sap.ui.model.json.JSONModel({
			});
			oModel.setSizeLimit(5000);
			this.getView().setModel(oModel);
			Utils.conteudoView("relatorioDoTaxPackage",this,"/TabelaDaView");
			if (this.isVisualizacaoUsuario()) {
				this.getRouter().getRoute("taxPackageRelatorioTemporaryAndPermanentDifferences").attachPatternMatched(this._handleRouteMatched, this);				
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
			var that = this;
			that.setBusy(that.byId("idNomeReport"), true);
			that.getModel().setProperty("/NomeReport",that.getResourceBundle().getText("viewGeralRelatorio") + " " + that.getResourceBundle().getText("viewGeralAdicoesEExclusoes"));
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

		_onClearSelecoes: function (oEvent){
			this.getModel().setProperty("/IdEmpresasSelecionadas" , undefined);
			this.getModel().setProperty("/IdDominioAnoCalendarioSelecionadas", undefined);
			this.getModel().setProperty("/IdPeriodoSelecionadas", undefined);
			this.getModel().setProperty("/IdMoedaSelecionadas", undefined);
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
			this.getModel().setProperty("/StatusSelecionado", undefined);	
			this.getModel().setProperty("/IdTipoDiferencaSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioTipoDiferencaSelecionadas", undefined);				
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
			Utils._dialogReport("Layout", "/TemplateReport","/Excluir",that,"id_template_report","/Preselecionado",oEvent);
			that.setBusy(that._dialogFiltro, true);
			NodeAPI.pListarRegistros("TemplateReport", {
					tela: that.oView.mProperties.viewName,
					isIFrame: that.isIFrame() ? "true" : "false",
					usarSession: 1
				})
				.then(function (res) {
					that.getModel().setProperty("/TemplateReport", Utils.orderByArrayParaBox(res.result,"descricao"));
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
			var forcaSelecao = this.getModel().getProperty("/Preselecionado");
			this.getModel().setProperty("/IdEmpresasSelecionadas", forcaSelecao.Empresa);
			this.getModel().setProperty("/IdDominioAnoCalendarioSelecionadas", forcaSelecao.AnoCalendario);
			this.getModel().setProperty("/IdPeriodoSelecionadas", forcaSelecao.Periodo);
			this.getModel().setProperty("/IdMoedaSelecionadas", forcaSelecao.Moeda);
			this.getModel().setProperty("/IdTipoDiferencaSelecionadas", forcaSelecao.TipoDiferenca);
			this.getModel().setProperty("/IdDominioTipoDiferencaSelecionadas", forcaSelecao.DominioTipoDiferenca);	
			this.getModel().setProperty("/StatusSelecionado", forcaSelecao.Status);			
			if(forcaSelecao.length >= 8){
				for (var i = 0, length = forcaSelecao.Filtros.length; i < length; i++) {
					for (var k = 0, length = this.byId("filterbar").getAllFilterItems().length; k < length; k++) {
						if(forcaSelecao.Filtros[i].name == this.byId("filterbar").getAllFilterItems()[k].mProperties.name){
							this.byId("filterbar").getAllFilterItems()[k].mProperties.visibleInFilterBar = forcaSelecao.Filtros[i].visible;
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
			/*COMMENT M_VGT.23
			//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
			var that = this;
			that.getModel().setProperty("/Empresa",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Empresa"),"tblEmpresa.nome",that.getModel().getProperty("/IdEmpresasSelecionadas"),"tblEmpresa.id_empresa"));				
			that.getModel().setProperty("/DominioAnoCalendario",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioAnoCalendario"),"tblDominioAnoCalendario.ano_calendario",that.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas"),"tblDominioAnoCalendario.id_dominio_ano_calendario"));				
			that.getModel().setProperty("/Periodo",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Periodo"),"tblPeriodo.periodo",that.getModel().getProperty("/IdPeriodoSelecionadas"),"tblPeriodo.numero_ordem"));				
			that.getModel().setProperty("/DominioMoeda",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioMoeda"),"tblDominioMoeda.acronimo",that.getModel().getProperty("/IdMoedaSelecionadas"),"tblDominioMoeda.id_dominio_moeda"));				
			that.getModel().setProperty("/TipoDiferenca",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/TipoDiferenca"),"tblDiferencaOpcao.nome",that.getModel().getProperty("/IdTipoDiferencaSelecionadas"),"tblDiferencaOpcao.id_diferenca_opcao"));				
			that.getModel().setProperty("/DominioTipoDiferenca",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioTipoDiferenca"),"tblDominioDiferencaTipo.tipo",that.getModel().getProperty("/IdDominioTipoDiferencaSelecionadas"),"tblDominioDiferencaTipo.id_dominio_diferenca_tipo"));				
			that.getModel().setProperty("/Status",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Status"),"tblDominioRelTaxPackagePeriodoStatusEnvio.status_envio",that.getModel().getProperty("/StatusSelecionado"),"tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"));				
			COMMENT*/				
		},
		getSelectedItemsTemplate: function(oEvent){
			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas")? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas"): null : null;
			var oDominioAnoCalendario = this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas")? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas") : null : null;
			var oPeriodoSelecionadas = this.getModel().getProperty("/IdPeriodoSelecionadas")? this.getModel().getProperty("/IdPeriodoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdPeriodoSelecionadas") : null : null;
			var oMoedaSelecionadas = this.getModel().getProperty("/IdMoedaSelecionadas")? this.getModel().getProperty("/IdMoedaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdMoedaSelecionadas") : null : null;
			var oTipoDiferencaSelecionadas = this.getModel().getProperty("/IdTipoDiferencaSelecionadas")? this.getModel().getProperty("/IdTipoDiferencaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdTipoDiferencaSelecionadas") : null : null;
			var oDominioTipoDiferencaSelecionadas = this.getModel().getProperty("/IdDominioTipoDiferencaSelecionadas")? this.getModel().getProperty("/IdDominioTipoDiferencaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioTipoDiferencaSelecionadas") : null : null;
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
			oWhere.Empresa = oEmpresa;
			oWhere.AnoCalendario = oDominioAnoCalendario; 
			oWhere.Periodo = oPeriodoSelecionadas; 
			oWhere.Moeda = oMoedaSelecionadas;
			oWhere.Status = oStatusSelecionado;
			oWhere.TipoDiferenca = oTipoDiferencaSelecionadas;
			oWhere.DominioTipoDiferenca = oDominioTipoDiferencaSelecionadas;
			oWhere.Filtros = oFiltrosVisiveis;
			return oWhere;
			
		},			
		_atualizarDados: function () {
			var that = this;
			var oWhere = this.getSelectedItemsTemplate();
			/*	
			var oWhere = []; 
			oWhere.push(oEmpresa);
			oWhere.push(oDominioAnoCalendario);
			oWhere.push(oPeriodoSelecionadas);
			oWhere.push(oMoedaSelecionadas);
			oWhere.push(null);
			oWhere.push(oTipoDiferencaSelecionadas);
			oWhere.push(oDominioTipoDiferencaSelecionadas);	
			oWhere.push(oStatusSelecionado);			
			oWhere.push(null);
			*/
			// if(oEmpresa === null){
			// 	oWhere[8] = ["tblEmpresa.nome"];
			if (oWhere.Empresa === null) {
				oWhere.Distinct = ["tblEmpresa.nome"];				
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
						that.getModel().setProperty("/Empresa", Utils.orderByArrayParaBox(aRegistro,"tblEmpresa.nome") );
					}
				});					
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/Empresa",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Empresa"),"tblEmpresa.nome",that.getModel().getProperty("/IdEmpresasSelecionadas"),"tblEmpresa.id_empresa"));				
			}COMMENT*/
			// if(oDominioAnoCalendario === null){
			// 	oWhere[8] = ["tblDominioAnoCalendario.ano_calendario"];
			if (oWhere.AnoCalendario === null) {
				oWhere.Distinct = ["tblDominioAnoCalendario.ano_calendario"];			
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
			// if(oPeriodoSelecionadas === null){
			// 	oWhere[8] = ["tblPeriodo.id_periodo"];
			if (oWhere.Periodo === null) {
				oWhere.Distinct = ["tblPeriodo.id_periodo"];			
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
								aRegistro[i]["tblPeriodo.periodo"] = Utils.traduzTrimestre(aRegistro[i]["tblPeriodo.numero_ordem"],that);           
							}									
						that.getModel().setProperty("/Periodo",  Utils.orderByArrayParaBox(aRegistro,"tblPeriodo.periodo"));
					}
				});					
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/Periodo",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Periodo"),"tblPeriodo.periodo",that.getModel().getProperty("/IdPeriodoSelecionadas"),"tblPeriodo.numero_ordem"));				
			}COMMENT*/	
			// if(oMoedaSelecionadas === null){
			// 	oWhere[8] = ["tblDominioMoeda.acronimo"];
			if (oWhere.Moeda === null) {
				oWhere.Distinct = ["tblDominioMoeda.acronimo"];					
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
						that.getModel().setProperty("/DominioMoeda", Utils.orderByArrayParaBox(aRegistro,"tblDominioMoeda.acronimo"));
					}
				});					
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioMoeda",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioMoeda"),"tblDominioMoeda.acronimo",that.getModel().getProperty("/IdMoedaSelecionadas"),"tblDominioMoeda.id_dominio_moeda"));				
			}COMMENT*/
			// if(oTipoDiferencaSelecionadas === null){
			// 	oWhere[8] = ["tblDiferencaOpcao.nome"];
			if(oWhere.TipoDiferenca === null){
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
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/TipoDiferenca",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/TipoDiferenca"),"tblDiferencaOpcao.nome",that.getModel().getProperty("/IdTipoDiferencaSelecionadas"),"tblDiferencaOpcao.id_diferenca_opcao"));				
			}COMMENT*/
			// if(oDominioTipoDiferencaSelecionadas === null){
			// 	oWhere[8] = ["tblDominioDiferencaTipo.tipo"];
			if(oWhere.DominioTipoDiferenca === null){
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
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioTipoDiferenca",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioTipoDiferenca"),"tblDominioDiferencaTipo.tipo",that.getModel().getProperty("/IdDominioTipoDiferencaSelecionadas"),"tblDominioDiferencaTipo.id_dominio_diferenca_tipo"));				
			}COMMENT*/
			// if (oStatusSelecionado === null) {
			// 	oWhere[8] = ["tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"];
			if (oWhere.Status === null) {
				oWhere.Distinct = ["tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"];			
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

		
		onDataExport : sap.m.Table.prototype.exportData || function(tipo) {
			Utils.dataExportReport(this,tipo,"viewGeralAdicoesEExclusoes","viewGeralAdicoesEExclusoes","/TabelaDaView");			
		},			
		
		_geraRelatorioTax: function (ifExport) {

			var oWhere = this.getSelectedItemsTemplate();			
			var that = this;
			that.byId("GerarRelatorio").setEnabled(false);	
			
			const promise1 = function () {
				return new Promise(function (resolve, reject) {
					that.setBusy(that.byId("relatorioDoTaxPackage"),true);							
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

				});
			};		
			
			const handler1 = function (response) {
					var aRegistro = JSON.parse(response);
					for (var i = 0, length = aRegistro.length; i < length; i++) {
						aRegistro[i]["tblPeriodo.periodo"] = Utils.traduzTrimestre(aRegistro[i]["tblPeriodo.numero_ordem"],that); 
						aRegistro[i]["tblDominioDiferencaTipo.tipo"] = Utils.traduzDominioDiferencaTipo(aRegistro[i]["tblDominioDiferencaTipo.id_dominio_diferenca_tipo"],that); 
						aRegistro[i]["tblDominioRelTaxPackagePeriodoStatusEnvio.status_envio"] = Utils.traduzRelTaxPackagePeriodoStatusEnvio(aRegistro[i]["tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"], that);						
					}
					Utils.conteudoView("relatorioDoTaxPackage",that,"/TabelaDaView");
					var array = that.getModel().getProperty("/TabelaDaView");
					var valor;
					if(ifExport === "/CSV" || ifExport === "/XLSX" || ifExport === "/TXT"){
						for (var i = 0, length = aRegistro.length; i < length; i++) {
							for (var k = 0, lengthk = array.length; k < lengthk; k++) {
								valor = aRegistro[i][array[k]["propriedadeDoValorDaLinha"]]
								aRegistro[i][array[k]["propriedadeDoValorDaLinha"]] = Validador.isNumber(valor) ? valor.toString().indexOf(".") !== -1 ? Utils.aplicarMascara(valor,that): valor : valor;
							}
						}						
						that.getModel().setProperty(ifExport, aRegistro);
						that.onDataExport(ifExport);
					}
					else{
						for (var k = 0, length = array.length; k < length; k++) {
							Utils.ajustaRem(that,aRegistro,array[k]["propriedadeDoValorDaLinha"],array[k]["textoNomeDaColuna"],3,1.35)
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
			
			/*
			jQuery.ajax(Constants.urlBackend + "deepQueryDistinctTemporaryAndPermanentDifferences/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=2" , {
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
						aRegistro[i]["tblPeriodo.periodo"] = Utils.traduzTrimestre(aRegistro[i]["tblPeriodo.numero_ordem"],that); 
						aRegistro[i]["tblDominioDiferencaTipo.tipo"] = Utils.traduzDominioDiferencaTipo(aRegistro[i]["tblDominioDiferencaTipo.id_dominio_diferenca_tipo"],that); 
						aRegistro[i]["tblDominioRelTaxPackagePeriodoStatusEnvio.status_envio"] = Utils.traduzRelTaxPackagePeriodoStatusEnvio(aRegistro[i]["tblDominioRelTaxPackagePeriodoStatusEnvio.id_dominio_rel_tax_package_periodo_status_envio"], that);						
					}
					Utils.conteudoView("relatorioDoTaxPackage",that,"/TabelaDaView");
					var array = that.getModel().getProperty("/TabelaDaView");
					var valor;
					if(ifExport === "/CSV" || ifExport === "/XLSX" || ifExport === "/TXT"){
						for (var i = 0, length = aRegistro.length; i < length; i++) {
							for (var k = 0, lengthk = array.length; k < lengthk; k++) {
								valor = aRegistro[i][array[k]["propriedadeDoValorDaLinha"]]
								aRegistro[i][array[k]["propriedadeDoValorDaLinha"]] = Validador.isNumber(valor) ? valor.toString().indexOf(".") !== -1 ? Utils.aplicarMascara(valor,that): valor : valor;
							}
						}						
						that.getModel().setProperty(ifExport, aRegistro);
						that.setBusy(that.byId("relatorioDoTaxPackage"),false);		
						that.byId("GerarRelatorio").setEnabled(true);						
						that.onDataExport(ifExport);
					}
					else{
						for (var k = 0, length = array.length; k < length; k++) {
							Utils.ajustaRem(that,aRegistro,array[k]["propriedadeDoValorDaLinha"],array[k]["textoNomeDaColuna"],3,1.35)
						}						
						that.getModel().setProperty(ifExport, aRegistro);
						that.setBusy(that.byId("relatorioDoTaxPackage"),false);		
						that.byId("GerarRelatorio").setEnabled(true);						
					}
				}
			});	
			*/
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