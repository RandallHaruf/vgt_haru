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
			var that = this;
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
									this.getModel().setProperty("/NomeUsuario", response.nome + " - " + response.ambiente);
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
			//this.getModel().setProperty("/TemplateReport", undefined);			
			this.getModel().setProperty("/ReportTTC", undefined);
		},
		//COMMENT M_VGT.53
		_onClearFiltros: function (oEvent) {
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
		},		
		//COMMENT M_VGT.53*/			
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
			this._atualizarDados();
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

			var oWhere = this.getSelectedItemsTemplate();
			this.getModel().setProperty("/Preselecionado", oWhere);
		},
		onTemplateGet: function (oEvent) {
			this._onClearSelecoes();
			var forcaSelecao = this.getModel().getProperty("/Preselecionado");
			this.getModel().setProperty("/IdEmpresasSelecionadas", forcaSelecao.Empresa);
			this.getModel().setProperty("/IdDominioTaxClassificationSelecionadas", forcaSelecao.TaxClassification);
			this.getModel().setProperty("/IdTaxCategorySelecionadas", forcaSelecao.TaxCategory);
			this.getModel().setProperty("/IdTaxSelecionadas", forcaSelecao.Tax);
			this.getModel().setProperty("/IdNameOfTaxSelecionadas", forcaSelecao.NameOfTax);
			this.getModel().setProperty("/IdDominioJurisdicaoSelecionadas", forcaSelecao.Jurisdicao);
			this.getModel().setProperty("/IdDominioPaisSelecionadas", forcaSelecao.Pais);
			this.getModel().setProperty("/IdDominioAnoFiscalSelecionadas", forcaSelecao.AnoFiscal);
			this.getModel().setProperty("/IdDominioMoedaSelecionadas", forcaSelecao.Moeda);
			this.getModel().setProperty("/IdDominioTipoTransacaoSelecionadas", forcaSelecao.TipoTransacao);
			// this.getModel().setProperty("/DataPagamentoInicio", forcaSelecao.DataInicio?Utils.bancoParaJsDate(forcaSelecao.DataInicio[0]): null);
			// this.getModel().setProperty("/DataPagamentoFim", forcaSelecao.DataFim?Utils.bancoParaJsDate(forcaSelecao.DataFim[0]): null);	
			this.getModel().setProperty("/DataPagamentoInicio", forcaSelecao.DataInicio?forcaSelecao.DataInicio[0]: null);
			this.getModel().setProperty("/DataPagamentoFim", forcaSelecao.DataFim?forcaSelecao.DataFim[0]: null);				
			this.getModel().setProperty("/IdEnviadoSelecionadas", forcaSelecao.Enviado);			

			for (var i = 0, length = forcaSelecao.Filtros.length; i < length; i++) {
				for (var k = 0, length = this.byId("filterbar").getAllFilterItems().length; k < length; k++) {
					if(forcaSelecao.Filtros[i].name == this.byId("filterbar").getAllFilterItems()[k].mProperties.name){
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
			//COMMENT M_VGT.23
			//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
			var that = this;
			that.getModel().setProperty("/Enviado",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Enviado"),"value",that.getModel().getProperty("/IdEnviadoSelecionadas"),"key"));
			that.getModel().setProperty("/Empresa",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Empresa"),"tblEmpresa.nome",that.getModel().getProperty("/IdEmpresasSelecionadas"),"tblEmpresa.id_empresa"));				
			that.getModel().setProperty("/DominioTaxClassification",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioTaxClassification"),"tblDominioTaxClassification.classification",that.getModel().getProperty("/IdDominioTaxClassificationSelecionadas"),"tblDominioTaxClassification.id_dominio_tax_classification"));				
			that.getModel().setProperty("/TaxCategory",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/TaxCategory"),"tblTaxCategory.category",that.getModel().getProperty("/IdTaxCategorySelecionadas"),"tblTaxCategory.id_tax_category"));				
			that.getModel().setProperty("/Tax",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Tax"),"tblTax.tax",that.getModel().getProperty("/IdTaxSelecionadas"),"tblTax.id_tax"));				
			that.getModel().setProperty("/NameOfTax",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/NameOfTax"),"tblNameOfTax.name_of_tax",that.getModel().getProperty("/IdNameOfTaxSelecionadas"),"tblNameOfTax.id_name_of_tax"));				
			that.getModel().setProperty("/DominioJurisdicao",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioJurisdicao"),"tblDominioJurisdicao.jurisdicao",that.getModel().getProperty("/IdDominioJurisdicaoSelecionadas"),"tblDominioJurisdicao.id_dominio_jurisdicao"));				
			that.getModel().setProperty("/DominioPais",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioPais"),"tblDominioPais.pais",that.getModel().getProperty("/IdDominioPaisSelecionadas"),"tblDominioPais.id_dominio_pais"));				
			that.getModel().setProperty("/DominioAnoFiscal",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioAnoFiscal"),"tblDominioAnoFiscal.ano_fiscal",that.getModel().getProperty("/IdDominioAnoFiscalSelecionadas"),"tblDominioAnoFiscal.id_dominio_ano_fiscal"));				
			that.getModel().setProperty("/DominioMoeda",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioMoeda"),"tblDominioMoeda.acronimo",that.getModel().getProperty("/IdDominioMoedaSelecionadas"),"tblDominioMoeda.id_dominio_moeda"));				
			that.getModel().setProperty("/DominioTipoTransacao",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioTipoTransacao"),"tblDominioTipoTransacao.tipo_transacao",that.getModel().getProperty("/IdDominioTipoTransacaoSelecionadas"),"tblDominioTipoTransacao.id_dominio_tipo_transacao"));				
			//COMMENT M_VGT.23*/			
		},
		getSelectedItemsTemplate: function(oEvent){
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
			var oWhere = {};

			var oFiltrosVisiveis = [];
			for (var i = 0, length = this.byId("filterbar").getAllFilterItems().length; i < length; i++) {
				oFiltrosVisiveis.push(
					{
						name: this.byId("filterbar").getAllFilterItems()[i].mProperties.name ,
						visible: this.byId("filterbar").getAllFilterItems()[i].mProperties.visibleInFilterBar
					}
				);
			}

			oWhere.Empresa = oEmpresa;
			oWhere.TaxClassification = oDominioTaxClassification;
			oWhere.TaxCategory = oTaxCategory;
			oWhere.Tax = oTax;
			oWhere.NameOfTax = oNameOfTax;
			oWhere.Jurisdicao = oDominioJurisdicao;
			oWhere.Pais = oDominioPais;
			oWhere.AnoFiscal = oDominioAnoFiscal;
			oWhere.Moeda = oDominioMoeda;
			oWhere.TipoTransacao = oDominioTipoTransacao;
			oWhere.DataInicio = oDataInicio === null ? oDataInicio : vetorInicio;
			oWhere.DataFim = oDataFim === null ? oDataFim : vetorFim;
			oWhere.Enviado = oEnviado;			
			oWhere.Filtros = oFiltrosVisiveis;
			return oWhere;
			
		},
		_atualizarDados: function () {
			var that = this;

			var oWhere = this.getSelectedItemsTemplate();
			
			//COMMENT M_VGT.23
			//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
			that.getModel().setProperty("/Enviado",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Enviado"),"value",that.getModel().getProperty("/IdEnviadoSelecionadas"),"key"));
			//COMMENT M_VGT.23*/
			if(oWhere.Empresa === null){
				oWhere.Distinct = ["tblEmpresa.nome"];				
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
			}//COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/Empresa",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Empresa"),"tblEmpresa.nome",that.getModel().getProperty("/IdEmpresasSelecionadas"),"tblEmpresa.id_empresa"));				
			}//COMMENT M_VGT.23*/
			if(oWhere.TaxClassification === null){
				oWhere.Distinct = ["tblDominioTaxClassification.classification"];				
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
			}//COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioTaxClassification",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioTaxClassification"),"tblDominioTaxClassification.classification",that.getModel().getProperty("/IdDominioTaxClassificationSelecionadas"),"tblDominioTaxClassification.id_dominio_tax_classification"));				
			}	//COMMENT M_VGT.23*/		
			if(oWhere.TaxCategory === null){
				oWhere.Distinct = ["tblTaxCategory.category"];				
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
			}//COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/TaxCategory",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/TaxCategory"),"tblTaxCategory.category",that.getModel().getProperty("/IdTaxCategorySelecionadas"),"tblTaxCategory.id_tax_category"));				
			}	//COMMENT M_VGT.23*/			
			if(oWhere.Tax === null){
				oWhere.Distinct = ["tblTax.tax"];				
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
			}//COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/Tax",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Tax"),"tblTax.tax",that.getModel().getProperty("/IdTaxSelecionadas"),"tblTax.id_tax"));				
			}		//COMMENT M_VGT.23*/			
			if(oWhere.NameOfTax === null){
				oWhere.Distinct = ["tblNameOfTax.name_of_tax"];				
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
			}//COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/NameOfTax",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/NameOfTax"),"tblNameOfTax.name_of_tax",that.getModel().getProperty("/IdNameOfTaxSelecionadas"),"tblNameOfTax.id_name_of_tax"));				
			}			//COMMENT M_VGT.23*/		
			if(oWhere.Jurisdicao === null){
				oWhere.Distinct = ["tblDominioJurisdicao.jurisdicao"];				
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
			}//COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioJurisdicao",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioJurisdicao"),"tblDominioJurisdicao.jurisdicao",that.getModel().getProperty("/IdDominioJurisdicaoSelecionadas"),"tblDominioJurisdicao.id_dominio_jurisdicao"));				
			}			//COMMENT M_VGT.23*/		
			if(oWhere.Pais === null){
				oWhere.Distinct = ["tblDominioPais.pais"];				
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
			}//COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioPais",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioPais"),"tblDominioPais.pais",that.getModel().getProperty("/IdDominioPaisSelecionadas"),"tblDominioPais.id_dominio_pais"));				
			}		//COMMENT M_VGT.23*/		
			if(oWhere.AnoFiscal === null){
				oWhere.Distinct = ["tblDominioAnoFiscal.ano_fiscal"];				
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
			}//COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioAnoFiscal",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioAnoFiscal"),"tblDominioAnoFiscal.ano_fiscal",that.getModel().getProperty("/IdDominioAnoFiscalSelecionadas"),"tblDominioAnoFiscal.id_dominio_ano_fiscal"));				
			}		//COMMENT M_VGT.23*/			
			if(oWhere.DataInicio === null && oWhere.DataFim === null){
				oWhere.Distinct = ["tblPagamento.data_pagamento"];				
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
			if(oWhere.Moeda === null){
				oWhere.Distinct = ["tblDominioMoeda.acronimo"];				
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
			}//COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioMoeda",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioMoeda"),"tblDominioMoeda.acronimo",that.getModel().getProperty("/IdDominioMoedaSelecionadas"),"tblDominioMoeda.id_dominio_moeda"));				
			}		//COMMENT M_VGT.23*/			
			if(oWhere.TipoTransacao === null){
				oWhere.Distinct = ["tblDominioTipoTransacao.tipo_transacao"];				
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
			}//COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioTipoTransacao",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioTipoTransacao"),"tblDominioTipoTransacao.tipo_transacao",that.getModel().getProperty("/IdDominioTipoTransacaoSelecionadas"),"tblDominioTipoTransacao.id_dominio_tipo_transacao"));				
			}		//COMMENT M_VGT.23*/		
		},

		_geraRelatorio: function (ifExport) {

			var oWhere = this.getSelectedItemsTemplate();
			
			var that = this;

			that.byId("GerarRelatorio").setEnabled(false);
			
			const promise1 = function () {
				return new Promise(function (resolve, reject) {
					that.setBusy(that.byId("relatorioDoTTC"),true);							
					jQuery.ajax(Constants.urlBackend + "DeepQuery/ReportTTC?full=" + (that.isIFrame() ? "true" : "false")+"&moduloAtual=1" /*Modulo 2 representa Tax Package*/, {
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
						that.onDataExport(ifExport);
					}
					else{				
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
					that.setBusy(that.byId("relatorioDoTTC"),false);		
					that.byId("GerarRelatorio").setEnabled(true);
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