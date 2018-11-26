sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel"
], function (jQuery, Controller, Filter, JSONModel) {
	"use strict";

	return Controller.extend("ui5ns.ui5.controller.compliance.Relatorio", {
		onInit: function () {
			this.oModel = new JSONModel();
			this.oModel.loadData(jQuery.sap.getModulePath("ui5ns.ui5.model.mock", "/relatorioTTC.json"), null, false);
			this.getView().setModel(this.oModel);
		
			this.aKeys = ["empresa", "classification", "category", "tax", "nameOfTax", "nameOfGov", "jurisdicao", "anoFiscal", "description", "dateOfPayment",
						"currency", "currencyRate", "typeOfTransaction", "otherSpecify", "principal", "interest", "fine", "value", "valueUSD", "numberOfDocument", "beneficiaryCompany"];
			this.oSelectEmpresa = this.getSelect("selectEmpresa");
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