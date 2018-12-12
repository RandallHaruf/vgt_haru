sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"ui5ns/ui5/controller/BaseController",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportType",	
	"sap/ui/core/util/ExportTypeCSV",	
	"sap/m/TablePersoController",
	"sap/m/MessageBox",
	"ui5ns/ui5/lib/Utils"	
], function (jQuery, Controller, Filter, JSONModel, BaseController,Export,ExportType,ExportTypeCSV,TablePersoController,MessageBox,Utils) {
	"use strict";

	return BaseController.extend("ui5ns.ui5.controller.taxPackage.Relatorio", {
		onInit: function () {
			this.oModel = new JSONModel();
			this.oModel.loadData(jQuery.sap.getModulePath("ui5ns.ui5.model.mock", "/relatorioTaxPackage.json"), null, false);
			this.getView().setModel(this.oModel);
		
			this.aKeys = ["empresa", "aba", "anoCalendario", "periodoReferencia"];
			this.oSelectEmpresa = this.getSelect("selectEmpresa");
			this.oSelectAba = this.getSelect("selectAba");
			this.oSelectAnoCalendario = this.getSelect("selectAnoCalendario");
			this.oSelectPeriodoReferencia = this.getSelect("selectPeriodoReferencia");
			this.oModel.setProperty("/Filter/text", "Filtered by None");
			this.addSnappedLabel();
			
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this._handleRouteMatched, this);			
		},

		_handleRouteMatched: function () {
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
			this.aKeys = [];
			this.aFilters = [];
			this.oModel = null;
		},

		onSelectChange: function (oEvent) {
			this._atualizarDados();			
			//sap.m.MessageToast.show(this.oSelectEmpresa.getSelectedItem().getKey());
			/*var aCurrentFilterValues = [];

			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectEmpresa));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectAba));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectAnoCalendario));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectPeriodoReferencia));
	
			this.filterTable(aCurrentFilterValues);*/
		},

		_atualizarDados: function () {
			
		},
		
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
					path : "/ReportObrigacao"
				},

				// column definitions with column name and binding info for the content

				columns : [{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaTipo"),
					template : {
						content : "{tblDominioObrigacaoAcessoriaTipo.tipo}"
					}
				}, {
					name : this.getResourceBundle().getText("viewRelatorioEmpresa"),
					template : {
						content : "{tblEmpresa.nome}"
					}
				}, {
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaPais"),
					template : {
						content : "{tblDominioPais.pais}"
					}
				}, {
					name : this.getResourceBundle().getText("viewComplianceFormularioDetalhesObrigacaoListagemObrigações"),
					template : {
						content : "{tblObrigacaoAcessoria.nome}"
					}
				}, {
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaPeriodicidade"),
					template : {
						content : "{tblDominioPeriodicidadeObrigacao.descricao}"
					}
				},{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaAnoFiscal"),
					template : {
						content : "{tblDominioAnoFiscal.ano_fiscal}"
					}
				},{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaPrazoEntrega"),
					template : {
						content : "{tblObrigacao.prazo_entrega}"
					}
				},{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaExtensao"),
					template : {
						content : "{tblObrigacao.extensao}"
					}
				},{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaStatus"),
					template : {
						content : "{tblDominioStatusObrigacao.descricao}"
					}
				},{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesBotaoRequisicao"),
					template : {
						content : "{tblObrigacao.obrigacao_inicial}"//"{= ${obrigacao_inicial} === 1 ? ${i18n>viewGeralSim} : ${i18n>viewGeralNao}}"
					}
				},{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaSuporteContratado"),
					template : {
						content : "{tblObrigacao.suporte_contratado}"//"{= ${suporte_contratado} === 1 ? ${i18n>viewGeralSim} : ${i18n>viewGeralNao}}"
					}
				},{
					name : this.getResourceBundle().getText("ViewRelatorioTipoDeTransacao"),
					template : {
						content : "{tblObrigacao.suporte}"
					}
				},{
					name : this.getResourceBundle().getText("viewRelatorioAnoFiscal"),
					template : {
						content : "{tblObrigacao.observacoes}"
					}
				}]
			});
			
			// download exported file
			oExport.saveFile(
				Utils.dateNowParaArquivo()
				+"_"
				+this.getResourceBundle().getText("viewGeralRelatorio") 
				+"_" 
				+ this.getResourceBundle().getText("viewComplianceListagemObrigacoesTituloPagina")
				+"_"
				+this.getResourceBundle().getText("viewSelecaoModuloBotaoBeps")
				).catch(function(oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});
		},	
		
		_exibeReport: function () {
			
			
		},
		
		_preencheReportTax: function (oWhere){
			
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