sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"ui5ns/ui5/controller/BaseController",
	"ui5ns/ui5/lib/NodeAPI"
], function (jQuery, Controller, Filter, JSONModel, BaseController, NodeAPI) {
	"use strict";

	return BaseController.extend("ui5ns.ui5.controller.ttc.Relatorio", {
		onInit: function () {
			/*this.oModel = new JSONModel();
			this.oModel.loadData(jQuery.sap.getModulePath("ui5ns.ui5.model.mock", "/relatorioTTC.json"), null, false);
			this.getView().setModel(this.oModel);*/
			
			this.getView().setModel(new sap.ui.model.json.JSONModel({}));
			this.getRouter().getRoute("ttcRelatorio").attachPatternMatched(this._onRouteEmpresa, this);
			this.getRouter().getRoute("ttcRelatorio").attachPatternMatched(this._onRouteNameOfTax, this);
			this.getRouter().getRoute("ttcRelatorio").attachPatternMatched(this._onRouteTaxCategory, this);
			this.getRouter().getRoute("ttcRelatorio").attachPatternMatched(this._onRouteTax, this);
			this.getRouter().getRoute("ttcRelatorio").attachPatternMatched(this._onRouteDominioTaxClassification, this);
			this.getRouter().getRoute("ttcRelatorio").attachPatternMatched(this._onRouteDominioPais, this);
			this.getRouter().getRoute("ttcRelatorio").attachPatternMatched(this._onRouteDominioJurisdicao, this);
			this.getRouter().getRoute("ttcRelatorio").attachPatternMatched(this._onRouteDominioAnoFiscal, this);
			this.getRouter().getRoute("ttcRelatorio").attachPatternMatched(this._onRouteDominioMoeda, this);
			this.getRouter().getRoute("ttcRelatorio").attachPatternMatched(this._onRouteDominioTipoTransacao, this);
			//this._atualizarDados();
			/*
			this.aKeys = ["empresa", "classification", "category", "tax", "nameOfTax", "nameOfGov", "jurisdicao", "anoFiscal", "description", "dateOfPayment",
						"currency", "currencyRate", "typeOfTransaction", "otherSpecify", "principal", "interest", "fine", "value", "valueUSD", "numberOfDocument", "beneficiaryCompany"];
			this.oSelectEmpresa = this.getSelect("/IdEmpresasSelecionadas");
			this.oSelectClassification = this.getSelect("selectClassification");
			this.oSelectCategory = this.getSelect("selectCategory");
			this.oSelectTax = this.getSelect("selectTax");
			this.oSelecNameOftTax = this.getSelect("selectNameOfTax");
			this.oSelectJurisdicao = this.getSelect("selectJurisdicao");
			this.oSelectAnoFiscal = this.getSelect("selectAnoFiscal");
			//this.oSelectDateOfPayment = this.getSelect("selectDateOfPayment");
			this.oSelectCurrency = this.getSelect("selectCurrency");
			this.oSelectTypeOfTransaction = this.getSelect("selectTypeOfTransaction");
			this.oModel.setProperty("/Filter/text", "Filtered by None");
			this.addSnappedLabel();
			*/
		},
		
		navToHome: function () {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("selecaoModulo");                                  	
		},
		
		navToPage2: function () {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("ttcListagemEmpresas");                                  	
		},

		onNavBack: function (oEvent) {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("ttcListagemEmpresas");                                  	
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
/*			
			//sap.m.MessageToast.show(this.getModel().getProperty(this.getSelectedItemText(this.getSelect("selectEmpresa"))));
*/	
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
		
		onImprimir: function (oEvent) {
			this._atualizarDados();
			//sap.m.MessageToast.show(this.getModel().getProperty("/IdEmpresasSelecionadas"));
		},
		
		_onRouteEmpresa: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("Empresa", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/Empresa", resposta);
				}
			});
		},
		_onRouteNameOfTax: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("NameOfTax", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/NameOfTax", resposta);
				}
			});
		},
		_onRouteTaxCategory: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("TaxCategory", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/TaxCategory", resposta);
				}
			});
		},
		_onRouteTax: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("Tax", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/Tax", resposta);
				}
			});
		},
		_onRouteDominioTaxClassification: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("DominioTaxClassification", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/DominioTaxClassification", resposta);
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
		_onRouteDominioJurisdicao: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("DominioJurisdicao", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/DominioJurisdicao", resposta);
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
		_onRouteDominioMoeda: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("DominioMoeda", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/DominioMoeda", resposta);
				}
			});
		},
		_onRouteDominioTipoTransacao: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("DominioTipoTransacao", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/DominioTipoTransacao", resposta);
				}
			});
		},
		_atualizarDados: function () {
			var that = this;
			
			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas")? this.getModel().getProperty("/IdEmpresasSelecionadas") : null;
			var oDominioTaxClassification = this.getModel().getProperty("/IdDominioTaxClassificationSelecionadas")? this.getModel().getProperty("/IdDominioTaxClassificationSelecionadas") : null;
			var oTaxCategory = this.getModel().getProperty("/IdTaxCategorySelecionadas")? this.getModel().getProperty("/IdTaxCategorySelecionadas") : null;
			var oTax = this.getModel().getProperty("/IdTaxSelecionadas")? this.getModel().getProperty("/IdTaxSelecionadas") : null;
			var oNameOfTax = this.getModel().getProperty("/IdNameOfTaxSelecionadas")? this.getModel().getProperty("/IdNameOfTaxSelecionadas") : null;
			var oDominioJurisdicao = this.getModel().getProperty("/IdDominioJurisdicaoSelecionadas")? this.getModel().getProperty("/IdDominioJurisdicaoSelecionadas") : null;
			var oDominioPais = this.getModel().getProperty("/IdDominioPaisSelecionadas")? this.getModel().getProperty("/IdDominioPaisSelecionadas") : null;
			var oDominioAnoFiscal = this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas")? this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas") : null;
			var oDominioMoeda = this.getModel().getProperty("/IdDominioMoedaSelecionadas")? this.getModel().getProperty("/IdDominioMoedaSelecionadas") : null;
			var oDominioTipoTransacao = this.getModel().getProperty("/IdDominioTipoTransacaoSelecionadas")? this.getModel().getProperty("/IdDominioTipoTransacaoSelecionadas") : null;
			
			
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
			
			NodeAPI.listarRegistros("DeepQuery/ReportTCC?parametros=" + JSON.stringify(oWhere), function (response) { // 1 COMPLIANCE
				if (response) {
					/*for (var i = 0, length = response.length; i < length; i++) {
						response[i].suporte_contratado = response[i].suporte_contratado ? "SIM" : "NÃO";
					}*/
					that.getModel().setProperty("/ReportTTC", response);
					sap.m.MessageToast.show(response);
				}
			});
		}		
	});
});