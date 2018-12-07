sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"ui5ns/ui5/controller/BaseController",
	"ui5ns/ui5/lib/NodeAPI",
	"ui5ns/ui5/model/Constants"
], function (jQuery, Controller, Filter, JSONModel, BaseController, NodeAPI, Constants) {
	"use strict";

	return BaseController.extend("ui5ns.ui5.controller.compliance.Relatorio", {
		onInit: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel({}));
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDominioObrigacaoAcessoriaTipo, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteEmpresa, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDominioPais, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteObrigacaoAcessoria, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDomPeriodicidadeObrigacao, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDominioAnoFiscal, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDominioStatusObrigacao, this);
		},

		navToHome: function () {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("selecaoModulo");    	
		},
		
		navToPage2: function () {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("complianceListagemObrigacoes");                                  	
		},

		onNavBack: function (oEvent) {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("complianceListagemObrigacoes");                                  	
		},

		onSaveView: function (oEvent) {
			sap.m.MessageToast.show(JSON.stringify(oEvent.getParameters()));
		},

		onExit: function () {
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
			//sap.m.MessageToast.show(this.oSelectEmpresa.getSelectedItem().getKey());
			/*
			var aCurrentFilterValues = [];

			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectEmpresa));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectClassification));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectCategory));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectTax));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelecNameOftTax));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectJurisdicao));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectAnoFiscal));
			//aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectDateOfPayment));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectCurrency));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectTypeOfTransaction));
	
			this.filterTable(aCurrentFilterValues);
			*/
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
		_onRouteEmpresa: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("Empresa", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/Empresa", resposta);
				}
			});
		},
		_onRouteDominioPais: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("DominioPais", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/DominioPais", resposta);
				}
			});
		},
		_onRouteObrigacaoAcessoria: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("ObrigacaoAcessoria", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/ObrigacaoAcessoria", resposta);
				}
			});
		},	
		_onRouteDomPeriodicidadeObrigacao: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("DomPeriodicidadeObrigacao", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/DomPeriodicidadeObrigacao", resposta);
				}
			});
		},		
		_onRouteDominioAnoFiscal: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("DominioAnoFiscal", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/DominioAnoFiscal", resposta);
				}
			});
		},	
		_onRouteDominioStatusObrigacao: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("DominioStatusObrigacao", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/DominioStatusObrigacao", resposta);
				}
			});
		},		
		_onRouteDominioObrigacaoAcessoriaTipo: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("DominioObrigacaoAcessoriaTipo", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/DominioObrigacaoAcessoriaTipo", resposta);
				}
			});
		},
		_atualizarDados: function () {
			/*
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDominioObrigacaoAcessoriaTipo, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteEmpresa, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDominioPais, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteObrigacaoAcessoria, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDomPeriodicidadeObrigacao, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDominioAnoFiscal, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDominioStatusObrigacao, this);
			*/
			var that = this;
			var vetorInicio = [];
			var vetorFim = [];
			var oDominioObrigacaoAcessoriaTipo = this.getModel().getProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas")? this.getModel().getProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas") : null : null;			
			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas")? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas"): null : null;
			var oDominioPais = this.getModel().getProperty("/IdDominioPaisSelecionadas")? this.getModel().getProperty("/IdDominioPaisSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioPaisSelecionadas") : null : null;
			var oObrigacaoAcessoria = this.getModel().getProperty("/IdObrigacaoAcessoriaSelecionadas")? this.getModel().getProperty("/IdObrigacaoAcessoriaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdObrigacaoAcessoriaSelecionadas") : null : null;
			var oDomPeriodicidadeObrigacao = this.getModel().getProperty("/IdDomPeriodicidadeObrigacaoSelecionadas")? this.getModel().getProperty("/IdDomPeriodicidadeObrigacaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDomPeriodicidadeObrigacaoSelecionadas") : null : null;
			var oDominioAnoFiscal = this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas")? this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas") : null : null;
			var oDataPrazoEntrega = this.getModel().getProperty("/DataPrazoEntrega")? this.getModel().getProperty("/DataPrazoEntrega") !== null ? vetorInicio[0] = this.getModel().getProperty("/DataPrazoEntrega") : null : null;
			var oDataExtensao = this.getModel().getProperty("/DataExtensao")? this.getModel().getProperty("/DataExtensao")[0] !== null ? vetorFim[0] = this.getModel().getProperty("/DataExtensao") : null : null;
			var oDominioStatusObrigacao = this.getModel().getProperty("/IdDominioStatusObrigacaoSelecionadas")? this.getModel().getProperty("/IdDominioStatusObrigacaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioStatusObrigacaoSelecionadas") : null : null;

			var oCheckObrigacao = this.getModel().getProperty("CheckObrigacao")? this.getModel().getProperty("CheckObrigacao")[0] !== undefined ? this.getModel().getProperty("CheckObrigacao") : null : null;
			var oCheckSuporteContratado = this.getModel().getProperty("CheckSuporteContratado")? this.getModel().getProperty("CheckSuporteContratado")[0] !== undefined ? this.getModel().getProperty("CheckSuporteContratado") : null : null;			

			var oWhere = []; 
			oWhere.push(oDominioObrigacaoAcessoriaTipo);
			oWhere.push(oEmpresa);
			oWhere.push(oDominioPais);
			oWhere.push(oObrigacaoAcessoria);
			oWhere.push(oDomPeriodicidadeObrigacao);
			oWhere.push(oDominioAnoFiscal);
			oWhere.push(oDominioPais);
			oWhere.push(oDominioAnoFiscal);
			oWhere.push(oDataPrazoEntrega === null ? oDataPrazoEntrega : vetorInicio);
			oWhere.push(oDataExtensao === null? oDataExtensao : vetorFim);
			oWhere.push(oDominioStatusObrigacao);
			oWhere.push(oCheckObrigacao);
			oWhere.push(oCheckSuporteContratado);
			
			jQuery.ajax(Constants.urlBackend + "DeepQuery/ReportTTC", {
				type: "POST",
				data: {
					parametros: JSON.stringify(oWhere)
				},
				success: function (response) {
					that.getModel().setProperty("/ReportTTC", JSON.parse(response));
				}
			});	
		}			
	});
});