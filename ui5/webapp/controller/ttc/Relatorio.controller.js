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
	"sap/m/MessageBox"	
], function (jQuery, Controller, Filter, JSONModel, BaseController, NodeAPI, Constants, Utils,Export, ExportTypeCSV,TablePersoController,MessageBox) {
	"use strict";

	return BaseController.extend("ui5ns.ui5.controller.ttc.Relatorio", {
		onInit: function () {
				var oModel = new sap.ui.model.json.JSONModel({

				});
				
				oModel.setSizeLimit(5000);
				this.getView().setModel(oModel);
			//this.getView().setModel(new sap.ui.model.json.JSONModel({}));
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
			
			this._atualizarDados();
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
			var vetorInicio = [];
			var vetorFim = [];
			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas")? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas"): null : null;
			var oDominioTaxClassification = this.getModel().getProperty("/IdDominioTaxClassificationSelecionadas")? this.getModel().getProperty("/IdDominioTaxClassificationSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioTaxClassificationSelecionadas") : null : null;
			var oTaxCategory = this.getModel().getProperty("/IdTaxCategorySelecionadas")? this.getModel().getProperty("/IdTaxCategorySelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdTaxCategorySelecionadas") : null : null;
			var oTax = this.getModel().getProperty("/IdTaxSelecionadas")? this.getModel().getProperty("/IdTaxSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdTaxSelecionadas") : null : null;
			var oNameOfTax = this.getModel().getProperty("/IdNameOfTaxSelecionadas")? this.getModel().getProperty("/IdNameOfTaxSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdNameOfTaxSelecionadas") : null : null;
			var oDominioJurisdicao = this.getModel().getProperty("/IdDominioJurisdicaoSelecionadas")? this.getModel().getProperty("/IdDominioJurisdicaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioJurisdicaoSelecionadas") : null : null;
			var oDominioPais = this.getModel().getProperty("/IdDominioPaisSelecionadas")? this.getModel().getProperty("/IdDominioPaisSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioPaisSelecionadas") : null : null;
			var oDominioAnoFiscal = this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas")? this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas") : null : null;
			var oDominioMoeda = this.getModel().getProperty("/IdDominioMoedaSelecionadas")? this.getModel().getProperty("/IdDominioMoedaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioMoedaSelecionadas") : null : null;
			var oDominioTipoTransacao = this.getModel().getProperty("/IdDominioTipoTransacaoSelecionadas")? this.getModel().getProperty("/IdDominioTipoTransacaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioTipoTransacaoSelecionadas") : null : null;
			var oDataInicio = this.getModel().getProperty("/DataPagamentoInicio")? this.getModel().getProperty("/DataPagamentoInicio")[0] !== null ? vetorInicio[0] = (this.getModel().getProperty("/DataPagamentoInicio").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataPagamentoInicio").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataPagamentoInicio").getDate().toString().padStart(2,'0')) : null : null;
			var oDataFim = this.getModel().getProperty("/DataPagamentoFim")? this.getModel().getProperty("/DataPagamentoFim")[0] !== null ? vetorFim[0] = (this.getModel().getProperty("/DataPagamentoFim").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataPagamentoFim").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataPagamentoFim").getDate().toString().padStart(2,'0')) : null : null;
			
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
			oWhere.push(oDataFim === null? oDataFim : vetorFim);			
			
			jQuery.ajax(Constants.urlBackend + "DeepQuery/ReportTTC", {
				type: "POST",
				data: {
					parametros: JSON.stringify(oWhere)
				},
				success: function (response) {
					var aRegistro = JSON.parse(response);
					for (var i = 0, length = aRegistro.length; i < length; i++) {
						aRegistro[i].DataPagamento = aRegistro[i].DataPagamento.substring(8,10)+"/"+aRegistro[i].DataPagamento.substring(5,7)+"/"+aRegistro[i].DataPagamento.substring(4,0);
						aRegistro[i].JurosPagamento = aRegistro[i].JurosPagamento? Number(aRegistro[i].JurosPagamento).toFixed(2) : "0.00" ;
						aRegistro[i].MultaPagamento = aRegistro[i].MultaPagamento? Number(aRegistro[i].MultaPagamento).toFixed(2) : "0.00" ;
						aRegistro[i].PrincipalPagamento = aRegistro[i].PrincipalPagamento? Number(aRegistro[i].PrincipalPagamento).toFixed(2) : "0.00" ;
						aRegistro[i].TotalPagamento = aRegistro[i].TotalPagamento? Number(aRegistro[i].TotalPagamento).toFixed(2) : "0.00" ;
					}		
					that.getModel().setProperty("/ReportTTC", aRegistro);
				}
			});	
		},
		
		onDataExport : sap.m.Table.prototype.exportData || function(oEvent) {

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType : new ExportTypeCSV({
					separatorChar : ";"
				}),

				// Pass in the model created above
				models : this.getView().getModel(),

				// binding information for the rows aggregation
				rows : {
					path : "/ReportTTC"
				},

				// column definitions with column name and binding info for the content

				columns : [{
					name : this.getResourceBundle().getText("viewRelatorioEmpresa"),
					template : {
						content : "{Empresa}"
					}
				}, {
					name : this.getResourceBundle().getText("viewRelatorioClassificacao"),
					template : {
						content : "{DominioTaxClassification}"
					}
				}, {
					name : this.getResourceBundle().getText("viewRelatorioCategoria"),
					template : {
						content : "{TaxCategory}"
					}
				}, {
					name : this.getResourceBundle().getText("viewRelatorioT"),
					template : {
						content : "{Tax}"
					}
				}, {
					name : this.getResourceBundle().getText("viewRelatorioNomeT"),
					template : {
						content : "{NameOfTax}"
					}
				},{
					name : this.getResourceBundle().getText("viewRelatorioJurisdicao"),
					template : {
						content : "{DominioJurisdicao}"
					}
				},{
					name : this.getResourceBundle().getText("viewRelatorioPais"),
					template : {
						content : "{DominioPais}"
					}
				},{
					name : this.getResourceBundle().getText("viewRelatorioAnoFiscal"),
					template : {
						content : "{DominioAnoFiscal}"
					}
				},{
					name : this.getResourceBundle().getText("ViewRelatorioCurrency"),
					template : {
						content : "{DominioMoeda}"
					}
				},{
					name : this.getResourceBundle().getText("ViewRelatorioTipoDeTransacao"),
					template : {
						content : "{DominioTipoTransacao}"
					}
				},{
					name : this.getResourceBundle().getText("ViewRelatorioDataDePagamento"),
					template : {
						content : "{DataPagamento}"
					}
				},{
					name : this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaProjeto"),
					template : {
						content : "{ProjetoPagamento}"
					}
				},{
					name : this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaDescription"),
					template : {
						content : "{DescricaoPagamento}"
					}
				},{
					name : this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaOther"),
					template : {
						content : "{TipoTransacaoOutrosPagamento}"
					}
				},{
					name : this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaPrincipal"),
					template : {
						content : "{PrincipalPagamento}"
					}
				},{
					name : this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaInterest"),
					template : {
						content : "{JurosPagamento}"
					}
				},{
					name : this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaFine"),
					template : {
						content : "{MultaPagamento}"
					}
				},{
					name : this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaValue"),
					template : {
						content : "{TotalPagamento}"
					}
				},{
					name : this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaNumberDocument"),
					template : {
						content : "{NumeroDocumentoPagamento}"
					}
				},{
					name : this.getResourceBundle().getText("viewTTCDetalheTrimestreColunaBeneficiary"),
					template : {
						content : "{EntidadeBeneficiariaPagamento}"
					}
				}]
			});

			// download exported file
			oExport.saveFile(
				Utils.dateNowParaArquivo()
				+"_"
				+this.getResourceBundle().getText("viewGeralRelatorio") 
				+"_" 
				+ this.getResourceBundle().getText("viewAdminInicioMenuTTC")
				).catch(function(oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});
		}		
	});
});