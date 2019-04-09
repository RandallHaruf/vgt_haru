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
			this._atualizarDados();
			/*
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this._handleRouteMatched, this);*/
			this.getRouter().getRoute("ttcRelatorio").attachPatternMatched(this._handleRouteMatched, this);
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
			this.getModel().setProperty("/ReportTTC", undefined);
		},
		onNavBack: function (oEvent) {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("ttcListagemEmpresas");
		},

		onSaveView: function (oEvent) {
			sap.m.MessageToast.show(JSON.stringify(oEvent.getParameters()));
		},

		onExit: function () {
			this._onClearSelecoes();
			this._atualizarDados();
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
				null ? vetorInicio[0] = (this.getModel().getProperty("/DataPagamentoInicio").getFullYear().toString() + "-" + (this.getModel().getProperty(
						"/DataPagamentoInicio").getMonth() + 1).toString().padStart(2, '0') + "-" + this.getModel().getProperty("/DataPagamentoInicio").getDate()
					.toString().padStart(2, '0')) : null : null;
			var oDataFim = this.getModel().getProperty("/DataPagamentoFim") ? this.getModel().getProperty("/DataPagamentoFim")[0] !== null ?
				vetorFim[0] = (this.getModel().getProperty("/DataPagamentoFim").getFullYear().toString() + "-" + (this.getModel().getProperty(
						"/DataPagamentoFim").getMonth() + 1).toString().padStart(2, '0') + "-" + this.getModel().getProperty("/DataPagamentoFim").getDate()
					.toString().padStart(2, '0')) : null : null;

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
			oWhere.push(null);
			if(oEmpresa === null){
				oWhere[13] = ["tblEmpresa.nome"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false"), {
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
			if(oDominioTaxClassification === null){
				oWhere[13] = ["tblDominioTaxClassification.classification"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false"), {
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
			}
			if(oTaxCategory === null){
				oWhere[13] = ["tblTaxCategory.category"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false"), {
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
			}
			if(oTax === null){
				oWhere[13] = ["tblTax.tax"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false"), {
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
			}
			if(oNameOfTax === null){
				oWhere[13] = ["tblNameOfTax.name_of_tax"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false"), {
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
			}
			if(oDominioJurisdicao === null){
				oWhere[13] = ["tblDominioJurisdicao.jurisdicao"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false"), {
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
			}
			if(oDominioPais === null){
				oWhere[13] = ["tblDominioPais.pais"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false"), {
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
			}
			if(oDominioAnoFiscal === null){
				oWhere[13] = ["tblDominioAnoFiscal.ano_fiscal"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false"), {
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
						that.getModel().setProperty("/DominioAnoFiscal", aRegistro);
					}
				});				
			}
			if(oDataInicio === null && oDataFim === null){
				oWhere[13] = ["tblPagamento.data_pagamento"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false"), {
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
				oWhere[13] = ["tblDominioMoeda.acronimo"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false"), {
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
			if(oDominioTipoTransacao === null){
				oWhere[13] = ["tblDominioTipoTransacao.tipo_transacao"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTTC?full=" + (this.isIFrame() ? "true" : "false"), {
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
			}
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
			var oDataInicio = this.getModel().getProperty("/DataPagamentoInicio") ? this.getModel().getProperty("/DataPagamentoInicio")[0] !==
				null ? vetorInicio[0] = (this.getModel().getProperty("/DataPagamentoInicio").getFullYear().toString() + "-" + (this.getModel().getProperty(
						"/DataPagamentoInicio").getMonth() + 1).toString().padStart(2, '0') + "-" + this.getModel().getProperty("/DataPagamentoInicio").getDate()
					.toString().padStart(2, '0')) : null : null;
			var oDataFim = this.getModel().getProperty("/DataPagamentoFim") ? this.getModel().getProperty("/DataPagamentoFim")[0] !== null ?
				vetorFim[0] = (this.getModel().getProperty("/DataPagamentoFim").getFullYear().toString() + "-" + (this.getModel().getProperty(
						"/DataPagamentoFim").getMonth() + 1).toString().padStart(2, '0') + "-" + this.getModel().getProperty("/DataPagamentoFim").getDate()
					.toString().padStart(2, '0')) : null : null;

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
			oWhere.push(null);

			var that = this;
			that.setBusy(that.byId("relatorioDoTTC"), true);
			that.byId("GerarRelatorio").setEnabled(false);
			jQuery.ajax(Constants.urlBackend + "DeepQuery/ReportTTC?full=" + (this.isIFrame() ? "true" : "false"), {
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
					else{/*
						for (var k = 0, length = array.length; k < length; k++) {
							Utils.ajustaRem(that,aRegistro,array[k]["propriedadeDoValorDaLinha"],array[k]["textoNomeDaColuna"],3,1.35)
						}		*/				
						that.getModel().setProperty(ifExport, aRegistro);
						that.setBusy(that.byId("relatorioDoTTC"),false);		
						that.byId("GerarRelatorio").setEnabled(true);						
					}/*					
					that.getModel().setProperty("/ReportTTC", aRegistro);
					that.setBusy(that.byId("relatorioDoTTC"), false);
					that.byId("GerarRelatorio").setEnabled(true);*/
				}
			});
		},

		_preencheReportTTC: function (oWhere) {
			var that = this;
			that.setBusy(that.byId("relatorioDoTTC"), true);
			that.byId("GerarRelatorio").setEnabled(false);
			jQuery.ajax(Constants.urlBackend + "DeepQuery/ReportTTC?full=" + (this.isIFrame() ? "true" : "false"), {
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
					}
					that.getModel().setProperty("/ReportTTC", aRegistro);
					that.setBusy(that.byId("relatorioDoTTC"), false);
					that.byId("GerarRelatorio").setEnabled(true);
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
			var array = this.getModel().getProperty("/TabelaDaView");
			var coluna = [];
			var excel = [];
			for (var k = 0, length = array.length; k < length; k++) {
				coluna.push({name: array[k]["textoNomeDaColuna"],template:{content: "{"+array[k]["propriedadeDoValorDaLinha"]+"}"}}) 
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
				
				var wbTaxPackage  = XLSX.utils.book_new();
				var wsAccountResultName = this.getResourceBundle().getText("viewAdminInicioMenuTTC");
				var wsAccountResult = XLSX.utils.aoa_to_sheet(wsAccountResultData);
				XLSX.utils.book_append_sheet(wbTaxPackage, wsAccountResult, wsAccountResultName);
				var wopts = {};
				var formato = "";
				if(tipo === "/XLSX"){
					wopts = { bookType:'xlsx'/*, bookSST:false*/, type:'array' };
					formato = ".xlsx";
				}
				else if (tipo === "/TXT"){
					wopts = { bookType:'txt'/*, bookSST:false*/, type:'array' };
					formato = ".txt";
				}
				else{
					wopts = { bookType:'csv'/*, bookSST:false*/, type:'array' };
					formato = ".csv";
				}
				var wbout = XLSX.write(wbTaxPackage,wopts);
				saveAs(new Blob([wbout],{type:"application/octet-stream"}), 
					Utils.dateNowParaArquivo()
					+"_"
					+this.getResourceBundle().getText("viewGeralRelatorio") 
					+"_" 
					+ this.getResourceBundle().getText("viewAdminInicioMenuTTC")
					+formato);				
		}		
/*
		onDataExport: sap.m.Table.prototype.exportData || function (oEvent) {

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new ExportTypeCSV({
					separatorChar: ";"
				}),

				// Pass in the model created above
				models: this.getView().getModel(),

				// binding information for the rows aggregation
				rows: {
					path: "/ReportTTC"
				},

				// column definitions with column name and binding info for the content
				columns: [{
					name: this.getResourceBundle().getText("viewRelatorioEmpresa"),
					template: {
						content: "{tblEmpresa.nome}"
					}
				}, {
					name: this.getResourceBundle().getText("viewRelatorioClassificacao"),
					template: {
						content: "{tblDominioTaxClassification.classification}"
					}
				}, {
					name: this.getResourceBundle().getText("viewRelatorioCategoria"),
					template: {
						content: "{tblTaxCategory.category}"
					}
				}, {
					name: this.getResourceBundle().getText("viewRelatorioT"),
					template: {
						content: "{tblTax.tax}"
					}
				}, {
					name: this.getResourceBundle().getText("viewRelatorioNomeT"),
					template: {
						content: "{tblNameOfTax.name_of_tax}"
					}
				}, {
					name: this.getResourceBundle().getText("viewRelatorioNomeDoOrgao"),
					template: {
						content: "{tblPagamento.administracao_governamental}"
					}
				}, {
					name: this.getResourceBundle().getText("viewRelatorioJurisdicao"),
					template: {
						content: "{tblDominioJurisdicao.jurisdicao}"
					}
				}, {
					name: this.getResourceBundle().getText("viewRelatorioPais"),
					template: {
						content: "{tblDominioPais.pais}"
					}
				}, {
					name: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaEstado"),
					template: {
						content: "{tblPagamento.estado}"
					}
				}, {
					name: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaCity"),
					template: {
						content: "{tblPagamento.cidade}"
					}
				}, {
					name: this.getResourceBundle().getText("viewRelatorioAnoFiscal"),
					template: {
						content: "{tblDominioAnoFiscal.ano_fiscal}"
					}
				}, {
					name: this.getResourceBundle().getText("ViewRelatorioCurrency"),
					template: {
						content: "{tblDominioMoeda.acronimo}"
					}
				}, {
					name: this.getResourceBundle().getText("ViewRelatorioTipoDeTransacao"),
					template: {
						content: "{tblDominioTipoTransacao.tipo_transacao}"
					}
				}, {
					name: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaDataPagamento"),
					template: {
						content: "{tblPagamento.data_pagamento}"
					}
				}, {
					name: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaProjeto"),
					template: {
						content: "{tblPagamento.projeto}"
					}
				}, {
					name: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaDescription"),
					template: {
						content: "{tblPagamento.descricao}"
					}
				}, {
					name: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaOther"),
					template: {
						content: "{tblPagamento.tipo_transacao_outros}"
					}
				}, {
					name: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaPrincipal"),
					template: {
						content: "{tblPagamento.principal}"
					}
				}, {
					name: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaInterest"),
					template: {
						content: "{tblPagamento.juros}"
					}
				}, {
					name: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaFine"),
					template: {
						content: "{tblPagamento.multa}"
					}
				}, {
					name: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaValue"),
					template: {
						content: "{tblPagamento.total}"
					}
				}, {
					name: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaNumberDocument"),
					template: {
						content: "{tblPagamento.numero_documento}"
					}
				}, {
					name: this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaBeneficiary"),
					template: {
						content: "{tblPagamento.entidade_beneficiaria}"
					}
				}]
			});

			// download exported file
			oExport.saveFile(
				Utils.dateNowParaArquivo() + "_" + this.getResourceBundle().getText("viewGeralRelatorio") + "_" + this.getResourceBundle().getText(
					"viewAdminInicioMenuTTC")
			).catch(function (oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		}*/
	});
});