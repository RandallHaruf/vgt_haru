sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"ui5ns/ui5/controller/BaseController",
	"ui5ns/ui5/lib/NodeAPI",
	"ui5ns/ui5/model/Constants",
	"ui5ns/ui5/lib/Utils",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/TablePersoController",
	"sap/m/MessageBox",
	"ui5ns/ui5/lib/Validador",
	"ui5ns/ui5/lib/jszip",
	"ui5ns/ui5/lib/XLSX",
	"ui5ns/ui5/lib/FileSaver"
], function (jQuery, Controller, Filter, JSONModel, BaseController, NodeAPI, Constants, Utils, Export, ExportTypeCSV,
	TablePersoController, MessageBox,Validador) {
	"use strict";

	return BaseController.extend("ui5ns.ui5.controller.ttc.Relatorio", {
		onInit: function () {

			var oModel = new sap.ui.model.json.JSONModel({});
			oModel.setSizeLimit(5000);
			this.getView().setModel(oModel);
			//this._atualizarDados();
			//-----------------ALTERAR NAS OUTRAS TELAS
			var that = this;/*
			that.setBusy(that.byId("myVariantManagement"), true);
			this.getModel().setProperty("/NomeReport",this.getResourceBundle().getText("viewGeralRelatorio") + " TTC");
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
					that.setBusy(that.byId("myVariantManagement"), false);
				});		*/	
				
			if (this.isVisualizacaoUsuario()) {
				this.getRouter().getRoute("ttcRelatorio").attachPatternMatched(this._handleRouteMatched, this);
			}
		},
		_handleRouteMatched: function () {
			if (this.isIFrame()) {
				this.mostrarAcessoRapidoInception();
				this.getModel().setProperty("/isIframe",true);
				this.getModel().setProperty('/IsAreaUsuario', !this.isIFrame());
			}
			else{
				this.getModel().setProperty("/isIframe",false);
			}
			this.onExit();
			
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
		},

		navToHome: function () {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("selecaoModulo");
		},

		navToPage2: function () {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("ttcListagemEmpresas");
		},

		myFormatter: function (value) {
			return value + "%";
		},

		_onClearSelecoes: function (oEvent) {
			this.getModel().setProperty("/IdEmpresasSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioTaxClassificationSelecionadas", undefined);
			this.getModel().setProperty("/IdTaxCategorySelecionadas", undefined);
			this.getModel().setProperty("/IdTaxSelecionadas", undefined);
			this.getModel().setProperty("/IdNameOfTaxSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioJurisdicaoSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioPaisSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioAnoFiscalSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioMoedaSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioTipoTransacaoSelecionadas", undefined);
			this.getModel().setProperty("/DataPagamentoInicio", undefined);
			this.getModel().setProperty("/DataPagamentoFim", undefined);
			this.getModel().setProperty("/IdEnviadoSelecionadas", undefined);
			this.getModel().setProperty("/TemplateReport", undefined);			
			this.getModel().setProperty("/ReportTTC", undefined);
		},
		onNavBack: function (oEvent) {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("ttcListagemEmpresas");
		},

		onSaveView: function (oEvent) {
			sap.m.MessageToast.show(JSON.stringify(oEvent.getParameters()));
			
		},
		
		onSelectView: function (oEvent) {
			sap.m.MessageToast.show(JSON.stringify(oEvent.getParameters()));
			
		},
		onManageView: function (oEvent) {
			sap.m.MessageToast.show(JSON.stringify(oEvent.getParameters()));
			
		},		

		onExit: function () {
			this.getModel().setProperty("/Enviado",[{
					"key": "true",
					"value": this.getResourceBundle().getText("viewGeralEnviadoTTC")
				}, {
					"key": "false",
					"value": this.getResourceBundle().getText("viewGeralNaoEnviadoTTC")
				}]);			
			this._onClearSelecoes();
			this._atualizarDados();
			
			var that = this;
			
			that.setBusy(that.byId("idNomeReport"), true);
			that.getModel().setProperty("/NomeReport",that.getResourceBundle().getText("viewGeralRelatorio") + " TTC");			
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
				
			Utils.displayFormat(this);
			this.aKeys = [];
			this.aFilters = [];
			this.oModel = null;
		},
		onToggleHeader: function () {
			this.getPage().setHeaderExpanded(!this.getPage().getHeaderExpanded());
		},
		onToggleFooter: function () {
			this.getPage().setShowFooter(!this.getPage().getShowFooter());
		},
		onSelectChange: function (oEvent) {
			//this.onValidarData(oEvent);
			this._atualizarDados();
			//this._geraRelatorio();
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
		onImprimir: function (oEvent) {
			this._geraRelatorio();
		},
		onGerarRelatorio: function (oEvent) {
			this._geraRelatorio("/ReportTTC"); 
		},
		onGerarCsv: function (oEvent) {
			this._geraRelatorio("/CSV"); 
		},		
		onGerarXlsx: function (oEvent) {
			this._geraRelatorio("/XLSX"); 
		},			
		onGerarTxt: function (oEvent) {
			this._geraRelatorio("/TXT"); 
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
			var vetorInicio = [];
			var vetorFim = [];
			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas") ? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !==
				undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas") : null : null;
			var oDominioTaxClassification = this.getModel().getProperty("/IdDominioTaxClassificationSelecionadas") ? this.getModel().getProperty(
				"/IdDominioTaxClassificationSelecionadas")[0] !== undefined ? this.getModel().getProperty(
				"/IdDominioTaxClassificationSelecionadas") : null : null;
			var oTaxCategory = this.getModel().getProperty("/IdTaxCategorySelecionadas") ? this.getModel().getProperty(
				"/IdTaxCategorySelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdTaxCategorySelecionadas") : null : null;
			var oTax = this.getModel().getProperty("/IdTaxSelecionadas") ? this.getModel().getProperty("/IdTaxSelecionadas")[0] !== undefined ?
				this.getModel().getProperty("/IdTaxSelecionadas") : null : null;
			var oNameOfTax = this.getModel().getProperty("/IdNameOfTaxSelecionadas") ? this.getModel().getProperty("/IdNameOfTaxSelecionadas")[
				0] !== undefined ? this.getModel().getProperty("/IdNameOfTaxSelecionadas") : null : null;
			var oDominioJurisdicao = this.getModel().getProperty("/IdDominioJurisdicaoSelecionadas") ? this.getModel().getProperty(
					"/IdDominioJurisdicaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioJurisdicaoSelecionadas") : null :
				null;
			var oDominioPais = this.getModel().getProperty("/IdDominioPaisSelecionadas") ? this.getModel().getProperty(
				"/IdDominioPaisSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioPaisSelecionadas") : null : null;
			var oDominioAnoFiscal = this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas") ? this.getModel().getProperty(
					"/IdDominioAnoFiscalSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas") : null :
				null;
			var oDominioMoeda = this.getModel().getProperty("/IdDominioMoedaSelecionadas") ? this.getModel().getProperty(
				"/IdDominioMoedaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioMoedaSelecionadas") : null : null;
			var oDominioTipoTransacao = this.getModel().getProperty("/IdDominioTipoTransacaoSelecionadas") ? this.getModel().getProperty(
					"/IdDominioTipoTransacaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioTipoTransacaoSelecionadas") :
				null : null;
			var oDataInicio = this.getModel().getProperty("/DataPagamentoInicio") ? this.getModel().getProperty("/DataPagamentoInicio")[0] !==
				null ? vetorInicio[0] = this.getModel().getProperty("/DataPagamentoInicio") : null : null;
			var oDataFim = this.getModel().getProperty("/DataPagamentoFim") ? this.getModel().getProperty("/DataPagamentoFim")[0] !== null ?
				vetorFim[0] = this.getModel().getProperty("/DataPagamentoFim") : null : null;		
			var oEnviado = this.getModel().getProperty("/IdEnviadoSelecionadas") ? this.getModel().getProperty(
				"/IdEnviadoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdEnviadoSelecionadas") : null : null;					
			var oWhere = [];
			//-----------------ALTERAR NAS OUTRAS TELAS
			var oFiltrosVisiveis = [];
			for (var i = 0, length = this.byId("filterbar").getAllFilterItems().length; i < length; i++) {
				oFiltrosVisiveis.push(
					{
						name: this.byId("filterbar").getAllFilterItems()[i].mProperties.name ,
						visible: this.byId("filterbar").getAllFilterItems()[i].mProperties.visibleInFilterBar
					}
				);
			}
			
			
			
			
			
			oWhere.push(oEmpresa);
			oWhere.push(oDominioTaxClassification);
			oWhere.push(oTaxCategory);
			oWhere.push(oTax);
			oWhere.push(oNameOfTax);
			oWhere.push(oDominioJurisdicao);
			oWhere.push(oDominioPais);
			oWhere.push(oDominioAnoFiscal);
			oWhere.push(oDominioMoeda);
			oWhere.push(oDominioTipoTransacao);
			oWhere.push(oDataInicio === null ? oDataInicio : vetorInicio);
			oWhere.push(oDataFim === null ? oDataFim : vetorFim);
			oWhere.push(oEnviado);
			oWhere.push(oFiltrosVisiveis);
			this.getModel().setProperty("/Preselecionado", oWhere);
		},
		onTemplateGet: function (oEvent) {
			this._onClearSelecoes();
			this._atualizarDados();
			var forcaSelecao = this.getModel().getProperty("/Preselecionado");
			this.getModel().setProperty("/IdEmpresasSelecionadas", forcaSelecao[0]);
			this.getModel().setProperty("/IdDominioTaxClassificationSelecionadas", forcaSelecao[1]);
			this.getModel().setProperty("/IdTaxCategorySelecionadas", forcaSelecao[2]);
			this.getModel().setProperty("/IdTaxSelecionadas", forcaSelecao[3]);
			this.getModel().setProperty("/IdNameOfTaxSelecionadas", forcaSelecao[4]);
			this.getModel().setProperty("/IdDominioJurisdicaoSelecionadas", forcaSelecao[5]);
			this.getModel().setProperty("/IdDominioPaisSelecionadas", forcaSelecao[6]);
			this.getModel().setProperty("/IdDominioAnoFiscalSelecionadas", forcaSelecao[7]);
			this.getModel().setProperty("/IdDominioMoedaSelecionadas", forcaSelecao[8]);
			this.getModel().setProperty("/IdDominioTipoTransacaoSelecionadas", forcaSelecao[9]);
			this.getModel().setProperty("/DataPagamentoInicio", forcaSelecao[10]?Utils.bancoParaJsDate(forcaSelecao[10][0]): null);
			this.getModel().setProperty("/DataPagamentoFim", forcaSelecao[11]?Utils.bancoParaJsDate(forcaSelecao[11][0]): null);	
			this.getModel().setProperty("/IdEnviadoSelecionadas", forcaSelecao[12]);			
			//-----------------ALTERAR NAS OUTRAS TELAS
			if(forcaSelecao.length >= 14){
				for (var i = 0, length = forcaSelecao[13].length; i < length; i++) {
					for (var k = 0, length = this.byId("filterbar").getAllFilterItems().length; k < length; k++) {
						if(forcaSelecao[13][i].name == this.byId("filterbar").getAllFilterItems()[k].mProperties.name){
							this.byId("filterbar").getAllFilterItems()[k].mProperties.visibleInFilterBar = forcaSelecao[13][i].visible;
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
			var vetorInicio = [];
			var vetorFim = [];

			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas") ? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !==
				undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas") : null : null;
			var oDominioTaxClassification = this.getModel().getProperty("/IdDominioTaxClassificationSelecionadas") ? this.getModel().getProperty(
				"/IdDominioTaxClassificationSelecionadas")[0] !== undefined ? this.getModel().getProperty(
				"/IdDominioTaxClassificationSelecionadas") : null : null;
			var oTaxCategory = this.getModel().getProperty("/IdTaxCategorySelecionadas") ? this.getModel().getProperty(
				"/IdTaxCategorySelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdTaxCategorySelecionadas") : null : null;
			var oTax = this.getModel().getProperty("/IdTaxSelecionadas") ? this.getModel().getProperty("/IdTaxSelecionadas")[0] !== undefined ?
				this.getModel().getProperty("/IdTaxSelecionadas") : null : null;
			var oNameOfTax = this.getModel().getProperty("/IdNameOfTaxSelecionadas") ? this.getModel().getProperty("/IdNameOfTaxSelecionadas")[
				0] !== undefined ? this.getModel().getProperty("/IdNameOfTaxSelecionadas") : null : null;
			var oDominioJurisdicao = this.getModel().getProperty("/IdDominioJurisdicaoSelecionadas") ? this.getModel().getProperty(
					"/IdDominioJurisdicaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioJurisdicaoSelecionadas") : null :
				null;
			var oDominioPais = this.getModel().getProperty("/IdDominioPaisSelecionadas") ? this.getModel().getProperty(
				"/IdDominioPaisSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioPaisSelecionadas") : null : null;
			var oDominioAnoFiscal = this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas") ? this.getModel().getProperty(
					"/IdDominioAnoFiscalSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas") : null :
				null;
			var oDominioMoeda = this.getModel().getProperty("/IdDominioMoedaSelecionadas") ? this.getModel().getProperty(
				"/IdDominioMoedaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioMoedaSelecionadas") : null : null;
			var oDominioTipoTransacao = this.getModel().getProperty("/IdDominioTipoTransacaoSelecionadas") ? this.getModel().getProperty(
					"/IdDominioTipoTransacaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioTipoTransacaoSelecionadas") :
				null : null;
			var oDataInicio = this.getModel().getProperty("/DataPagamentoInicio") ? this.getModel().getProperty("/DataPagamentoInicio")[0] !==
				null ? vetorInicio[0] = this.getModel().getProperty("/DataPagamentoInicio") : null : null;
			var oDataFim = this.getModel().getProperty("/DataPagamentoFim") ? this.getModel().getProperty("/DataPagamentoFim")[0] !== null ?
				vetorFim[0] = this.getModel().getProperty("/DataPagamentoFim") : null : null;	
			var oEnviado = this.getModel().getProperty("/IdEnviadoSelecionadas") ? this.getModel().getProperty(
				"/IdEnviadoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdEnviadoSelecionadas") : null : null;	
				
			var oWhere = [];
			oWhere.push(oEmpresa);
			oWhere.push(oDominioTaxClassification);
			oWhere.push(oTaxCategory);
			oWhere.push(oTax);
			oWhere.push(oNameOfTax);
			oWhere.push(oDominioJurisdicao);
			oWhere.push(oDominioPais);
			oWhere.push(oDominioAnoFiscal);
			oWhere.push(oDominioMoeda);
			oWhere.push(oDominioTipoTransacao);
			oWhere.push(oDataInicio === null ? oDataInicio : vetorInicio);
			oWhere.push(oDataFim === null ? oDataFim : vetorFim);
			oWhere.push(oEnviado);			
			oWhere.push(null);
			
			that.getModel().setProperty("/Enviado",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Enviado"),"value",that.getModel().getProperty("/IdEnviadoSelecionadas"),"key"));
			if(oEmpresa === null){
				oWhere[14] = ["tblEmpresa.nome"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=1" /*Modulo 2 representa Tax Package*/, {
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
			if(oDominioTaxClassification === null){
				oWhere[14] = ["tblDominioTaxClassification.classification"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=1" /*Modulo 2 representa Tax Package*/, {
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
							aRegistro[i]["tblDominioTaxClassification.classification"] = Utils.traduzDominioTaxClassification(aRegistro[i][
								"tblDominioTaxClassification.id_dominio_tax_classification"
							], that);
						}
	
						that.getModel().setProperty("/DominioTaxClassification", Utils.orderByArrayParaBox(aRegistro,
							"tblDominioTaxClassification.classification"));
					}
				});				
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioTaxClassification",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioTaxClassification"),"tblDominioTaxClassification.classification",that.getModel().getProperty("/IdDominioTaxClassificationSelecionadas"),"tblDominioTaxClassification.id_dominio_tax_classification"));				
			}	COMMENT*/		
			if(oTaxCategory === null){
				oWhere[14] = ["tblTaxCategory.category"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=1" /*Modulo 2 representa Tax Package*/, {
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
	
						that.getModel().setProperty("/TaxCategory", Utils.orderByArrayParaBox(aRegistro, "tblTaxCategory.category"));
					}
				});				
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/TaxCategory",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/TaxCategory"),"tblTaxCategory.category",that.getModel().getProperty("/IdTaxCategorySelecionadas"),"tblTaxCategory.id_tax_category"));				
			}	COMMENT*/			
			if(oTax === null){
				oWhere[14] = ["tblTax.tax"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=1" /*Modulo 2 representa Tax Package*/, {
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
	
						that.getModel().setProperty("/Tax", Utils.orderByArrayParaBox(aRegistro, "tblTax.tax"));
					}
				});				
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/Tax",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Tax"),"tblTax.tax",that.getModel().getProperty("/IdTaxSelecionadas"),"tblTax.id_tax"));				
			}		COMMENT*/			
			if(oNameOfTax === null){
				oWhere[14] = ["tblNameOfTax.name_of_tax"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=1" /*Modulo 2 representa Tax Package*/, {
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
	
						that.getModel().setProperty("/NameOfTax", Utils.orderByArrayParaBox(aRegistro, "tblNameOfTax.name_of_tax"));
					}
				});				
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/NameOfTax",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/NameOfTax"),"tblNameOfTax.name_of_tax",that.getModel().getProperty("/IdNameOfTaxSelecionadas"),"tblNameOfTax.id_name_of_tax"));				
			}			COMMENT*/		
			if(oDominioJurisdicao === null){
				oWhere[14] = ["tblDominioJurisdicao.jurisdicao"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=1" /*Modulo 2 representa Tax Package*/, {
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
							aRegistro[i]["tblDominioJurisdicao.jurisdicao"] = Utils.traduzJurisdicao(aRegistro[i][
								"tblDominioJurisdicao.id_dominio_jurisdicao"
							], that);
						}
	
						that.getModel().setProperty("/DominioJurisdicao", Utils.orderByArrayParaBox(aRegistro, "tblDominioJurisdicao.jurisdicao"));
					}
				});				
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioJurisdicao",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioJurisdicao"),"tblDominioJurisdicao.jurisdicao",that.getModel().getProperty("/IdDominioJurisdicaoSelecionadas"),"tblDominioJurisdicao.id_dominio_jurisdicao"));				
			}			COMMENT*/		
			if(oDominioPais === null){
				oWhere[14] = ["tblDominioPais.pais"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=1" /*Modulo 2 representa Tax Package*/, {
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
							aRegistro[i]["tblDominioPais.pais"] = Utils.traduzDominioPais(aRegistro[i]["tblDominioPais.id_dominio_pais"], that);
						}
						that.getModel().setProperty("/DominioPais", Utils.orderByArrayParaBox(aRegistro, "tblDominioPais.pais"));
					}
				});				
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioPais",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioPais"),"tblDominioPais.pais",that.getModel().getProperty("/IdDominioPaisSelecionadas"),"tblDominioPais.id_dominio_pais"));				
			}		COMMENT*/		
			if(oDominioAnoFiscal === null){
				oWhere[14] = ["tblDominioAnoFiscal.ano_fiscal"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=1" /*Modulo 2 representa Tax Package*/, {
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
						// that.getModel().setProperty("/DominioAnoFiscal", aRegistro);
						that.getModel().setProperty("/DominioAnoFiscal", Utils.orderByArrayParaBoxComSelecao(aRegistro,"tblDominioAnoFiscal.ano_fiscal",that.getModel().getProperty("/IdDominioAnoFiscalSelecionadas"),"tblDominioAnoFiscal.id_dominio_ano_fiscal"));							
					}
				});				
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioAnoFiscal",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioAnoFiscal"),"tblDominioAnoFiscal.ano_fiscal",that.getModel().getProperty("/IdDominioAnoFiscalSelecionadas"),"tblDominioAnoFiscal.id_dominio_ano_fiscal"));				
			}		COMMENT*/			
			if(oDataInicio === null && oDataFim === null){
				oWhere[14] = ["tblPagamento.data_pagamento"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=1" /*Modulo 2 representa Tax Package*/, {
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
						that.getModel().setProperty("/DataPagamentoMin", Utils.bancoParaJsDate(
							aRegistro[0] ? aRegistro[0]["min(tblPagamento.data_pagamento)"] : null
						));
						that.getModel().setProperty("/DataPagamentoMax", Utils.bancoParaJsDate(
							aRegistro[0] ? aRegistro[0]["max(tblPagamento.data_pagamento)"] : null
						));
					}
				});				
			}
			if(oDominioMoeda === null){
				oWhere[14] = ["tblDominioMoeda.acronimo"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=1" /*Modulo 2 representa Tax Package*/, {
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
				that.getModel().setProperty("/DominioMoeda",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioMoeda"),"tblDominioMoeda.acronimo",that.getModel().getProperty("/IdDominioMoedaSelecionadas"),"tblDominioMoeda.id_dominio_moeda"));				
			}		COMMENT*/			
			if(oDominioTipoTransacao === null){
				oWhere[14] = ["tblDominioTipoTransacao.tipo_transacao"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=1" /*Modulo 2 representa Tax Package*/, {
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
							aRegistro[i]["tblDominioTipoTransacao.tipo_transacao"] = Utils.traduzTipoTransacao(aRegistro[i][
								"tblDominioTipoTransacao.id_dominio_tipo_transacao"
							], that);
						}
						that.getModel().setProperty("/DominioTipoTransacao", Utils.orderByArrayParaBox(aRegistro,
							"tblDominioTipoTransacao.tipo_transacao"));
					}
				});				
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioTipoTransacao",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioTipoTransacao"),"tblDominioTipoTransacao.tipo_transacao",that.getModel().getProperty("/IdDominioTipoTransacaoSelecionadas"),"tblDominioTipoTransacao.id_dominio_tipo_transacao"));				
			}		COMMENT*/		
		},

		_geraRelatorio: function (ifExport) {
			var vetorInicio = [];
			var vetorFim = [];

			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas") ? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !==
				undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas") : null : null;
			var oDominioTaxClassification = this.getModel().getProperty("/IdDominioTaxClassificationSelecionadas") ? this.getModel().getProperty(
				"/IdDominioTaxClassificationSelecionadas")[0] !== undefined ? this.getModel().getProperty(
				"/IdDominioTaxClassificationSelecionadas") : null : null;
			var oTaxCategory = this.getModel().getProperty("/IdTaxCategorySelecionadas") ? this.getModel().getProperty(
				"/IdTaxCategorySelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdTaxCategorySelecionadas") : null : null;
			var oTax = this.getModel().getProperty("/IdTaxSelecionadas") ? this.getModel().getProperty("/IdTaxSelecionadas")[0] !== undefined ?
				this.getModel().getProperty("/IdTaxSelecionadas") : null : null;
			var oNameOfTax = this.getModel().getProperty("/IdNameOfTaxSelecionadas") ? this.getModel().getProperty("/IdNameOfTaxSelecionadas")[
				0] !== undefined ? this.getModel().getProperty("/IdNameOfTaxSelecionadas") : null : null;
			var oDominioJurisdicao = this.getModel().getProperty("/IdDominioJurisdicaoSelecionadas") ? this.getModel().getProperty(
					"/IdDominioJurisdicaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioJurisdicaoSelecionadas") : null :
				null;
			var oDominioPais = this.getModel().getProperty("/IdDominioPaisSelecionadas") ? this.getModel().getProperty(
				"/IdDominioPaisSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioPaisSelecionadas") : null : null;
			var oDominioAnoFiscal = this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas") ? this.getModel().getProperty(
					"/IdDominioAnoFiscalSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas") : null :
				null;
			var oDominioMoeda = this.getModel().getProperty("/IdDominioMoedaSelecionadas") ? this.getModel().getProperty(
				"/IdDominioMoedaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioMoedaSelecionadas") : null : null;
			var oDominioTipoTransacao = this.getModel().getProperty("/IdDominioTipoTransacaoSelecionadas") ? this.getModel().getProperty(
					"/IdDominioTipoTransacaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioTipoTransacaoSelecionadas") :
				null : null;
			// var oDataInicio = this.getModel().getProperty("/DataPagamentoInicio") ? this.getModel().getProperty("/DataPagamentoInicio")[0] !==
			// 	null ? vetorInicio[0] = (this.getModel().getProperty("/DataPagamentoInicio").getFullYear().toString() + "-" + (this.getModel().getProperty(
			// 			"/DataPagamentoInicio").getMonth() + 1).toString().padStart(2, '0') + "-" + this.getModel().getProperty("/DataPagamentoInicio").getDate()
			// 		.toString().padStart(2, '0')) : null : null;
			// var oDataFim = this.getModel().getProperty("/DataPagamentoFim") ? this.getModel().getProperty("/DataPagamentoFim")[0] !== null ?
			// 	vetorFim[0] = (this.getModel().getProperty("/DataPagamentoFim").getFullYear().toString() + "-" + (this.getModel().getProperty(
			// 			"/DataPagamentoFim").getMonth() + 1).toString().padStart(2, '0') + "-" + this.getModel().getProperty("/DataPagamentoFim").getDate()
			// 		.toString().padStart(2, '0')) : null : null;
			var oDataInicio = this.getModel().getProperty("/DataPagamentoInicio") ? this.getModel().getProperty("/DataPagamentoInicio")[0] !==
				null ? vetorInicio[0] = this.getModel().getProperty("/DataPagamentoInicio") : null : null;
			var oDataFim = this.getModel().getProperty("/DataPagamentoFim") ? this.getModel().getProperty("/DataPagamentoFim")[0] !== null ?
				vetorFim[0] = this.getModel().getProperty("/DataPagamentoFim") : null : null;			
			var oEnviado = this.getModel().getProperty("/IdEnviadoSelecionadas") ? this.getModel().getProperty(
				"/IdEnviadoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdEnviadoSelecionadas") : null : null;	
			var oWhere = [];
			oWhere.push(oEmpresa);
			oWhere.push(oDominioTaxClassification);
			oWhere.push(oTaxCategory);
			oWhere.push(oTax);
			oWhere.push(oNameOfTax);
			oWhere.push(oDominioJurisdicao);
			oWhere.push(oDominioPais);
			oWhere.push(oDominioAnoFiscal);
			oWhere.push(oDominioMoeda);
			oWhere.push(oDominioTipoTransacao);
			oWhere.push(oDataInicio === null ? oDataInicio : vetorInicio);
			oWhere.push(oDataFim === null ? oDataFim : vetorFim);
			oWhere.push(oEnviado);
			oWhere.push(null);

			var that = this;
			that.setBusy(that.byId("relatorioDoTTC"), true);
			that.byId("GerarRelatorio").setEnabled(false);
			jQuery.ajax(Constants.urlBackend + "DeepQuery/ReportTTC?full=" + (this.isIFrame() ? "true" : "false")+"&moduloAtual=1" /*Modulo 2 representa Tax Package*/, {
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
						aRegistro[i]["tblPagamento.data_pagamento"] = aRegistro[i]["tblPagamento.data_pagamento"] ? Utils.stringDataDoBancoParaStringDDMMYYYY(
							aRegistro[i]["tblPagamento.data_pagamento"]) : null;
						/*aRegistro[i]["tblPagamento.juros"] = aRegistro[i]["tblPagamento.juros"] ? Number(aRegistro[i]["tblPagamento.juros"]).toFixed(
							2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "%").replace(/\./g, ',').replace(/%/g, '.') : "0";*/
						aRegistro[i]["tblPagamento.juros"] = that._aplicarMascara(aRegistro[i]["tblPagamento.juros"]);
						/*aRegistro[i]["tblPagamento.multa"] = aRegistro[i]["tblPagamento.multa"] ? Number(aRegistro[i]["tblPagamento.multa"]).toFixed(
							2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "%").replace(/\./g, ',').replace(/%/g, '.') : "0";*/
						aRegistro[i]["tblPagamento.multa"] = that._aplicarMascara(aRegistro[i]["tblPagamento.multa"]);
						/*aRegistro[i]["tblPagamento.principal"] = aRegistro[i]["tblPagamento.principal"] ? Number(aRegistro[i][
							"tblPagamento.principal"]).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "%").replace(/\./g, ',').replace(/%/g, '.') : "0";*/
						aRegistro[i]["tblPagamento.principal"] = that._aplicarMascara(aRegistro[i]["tblPagamento.principal"]);
						/*aRegistro[i]["tblPagamento.total"] = aRegistro[i]["tblPagamento.total"] ? Number(aRegistro[i]["tblPagamento.total"]).toFixed(
							2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "%").replace(/\./g, ',').replace(/%/g, '.') : "0";*/
						aRegistro[i]["tblPagamento.total"] = that._aplicarMascara(aRegistro[i]["tblPagamento.total"]);
						aRegistro[i]["conversao_brl"] = aRegistro[i]["conversao_brl"] ? that._aplicarMascara(aRegistro[i]["conversao_brl"]) : "-";
						aRegistro[i]["conversao_usd"] = aRegistro[i]["conversao_usd"] ? that._aplicarMascara(aRegistro[i]["conversao_usd"]) : "-";
						aRegistro[i]["tblDominioTaxClassification.classification"] = Utils.traduzDominioTaxClassification(aRegistro[i][
							"tblDominioTaxClassification.id_dominio_tax_classification"
						], that);
						aRegistro[i]["tblDominioJurisdicao.jurisdicao"] = Utils.traduzJurisdicao(aRegistro[i][
							"tblDominioJurisdicao.id_dominio_jurisdicao"
						], that);
						aRegistro[i]["tblDominioPais.pais"] = Utils.traduzDominioPais(aRegistro[i]["tblDominioPais.id_dominio_pais"], that);
						aRegistro[i]["tblDominioTipoTransacao.tipo_transacao"] = Utils.traduzTipoTransacao(aRegistro[i][
							"tblDominioTipoTransacao.id_dominio_tipo_transacao"
						], that);
						aRegistro[i]["tblRelEmpresaPeriodo.ind_enviado"] = Utils.traduzStatusEnvioTrimestreTTC(
							aRegistro[i]["tblRelEmpresaPeriodo.ind_enviado"] ? 1 : 0
							, that);						
					}
					Utils.conteudoView("relatorioDoTTC",that,"/TabelaDaView");
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
						that.setBusy(that.byId("relatorioDoTTC"),false);		
						that.byId("GerarRelatorio").setEnabled(true);						
						that.onDataExport(ifExport);
					}
					else{				
						that.getModel().setProperty(ifExport, aRegistro);
						that.setBusy(that.byId("relatorioDoTTC"),false);		
						that.byId("GerarRelatorio").setEnabled(true);						
					}
				}
			});
		},

		_aplicarMascara: function (numero) {
			if (this.isPTBR()) {
				return numero ? Number(numero).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "%").replace(/\./g, ',').replace(/%/g, '.') : "0";
			}
			else {
				return numero ? Number(numero).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "%").replace(/%/g, ',') : "0";
			}
		},
		onDataExport : sap.m.Table.prototype.exportData || function(tipo) {
			
			Utils.dataExportReport(this,tipo,"viewAdminInicioMenuTTC","viewAdminInicioMenuTTC","/TabelaDaView");                    
		
		}		

	});
});