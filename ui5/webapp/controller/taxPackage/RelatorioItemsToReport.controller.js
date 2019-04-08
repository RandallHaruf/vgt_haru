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
	"ui5ns/ui5/lib/Utils"	
], function (jQuery, Controller, Filter, JSONModel, BaseController,NodeAPI,Constants,Export,ExportType,ExportTypeCSV,TablePersoController,MessageBox,Utils) {
	"use strict";

	return BaseController.extend("ui5ns.ui5.controller.taxPackage.RelatorioItemsToReport", {
		onInit: function () {
			
			var oModel = new sap.ui.model.json.JSONModel({
			});
			oModel.setSizeLimit(5000);
			this.getView().setModel(oModel);
			this._atualizarDados();
			/*
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this._handleRouteMatched, this);	*/		
			this.getRouter().getRoute("taxPackageRelatorioItemsToReport").attachPatternMatched(this._handleRouteMatched, this);				
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

		_onClearSelecoes: function (oEvent){
			this.getModel().setProperty("/IdEmpresasSelecionadas" , undefined);
			this.getModel().setProperty("/IdDominioAnoCalendarioSelecionadas", undefined);
			this.getModel().setProperty("/IdPeriodoSelecionadas", undefined);
			this.getModel().setProperty("/IdMoedaSelecionadas", undefined);
			this.getModel().setProperty("/FlagSNSelecionado", undefined);
			this.getModel().setProperty("/FlagAnoSelecionado", undefined);
			this.getModel().setProperty("/PerguntaSelecionada", undefined);
			this.getModel().setProperty("/RespondeuSimSelecionado", undefined);		
			this.getModel().setProperty("/AnoFiscalSelecionado", undefined);			
			this.getModel().setProperty("/ReportTaxPackage", undefined);
		},

		onSelectChange: function (oEvent) {
			//this.onValidarData(oEvent);
			this._atualizarDados();			
		},

		onImprimir: function (oEvent) {
			//this._geraRelatorio(); 			
		},
		onGerarRelatorio: function (oEvent) {
			this._geraRelatorioTax(); 
		},

		_atualizarDados: function () {
			var that = this;
			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas")? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas"): null : null;
			var oDominioAnoCalendario = this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas")? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas") : null : null;
			var oPeriodoSelecionadas = this.getModel().getProperty("/IdPeriodoSelecionadas")? this.getModel().getProperty("/IdPeriodoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdPeriodoSelecionadas") : null : null;
			var oMoedaSelecionadas = this.getModel().getProperty("/IdMoedaSelecionadas")? this.getModel().getProperty("/IdMoedaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdMoedaSelecionadas") : null : null;
			var oFlagSNSelecionado = this.getModel().getProperty("/FlagSNSelecionado")? this.getModel().getProperty("/FlagSNSelecionado")[0] !== undefined ? this.getModel().getProperty("/FlagSNSelecionado") : null : null;
			var oFlagAnoSelecionado = this.getModel().getProperty("/FlagAnoSelecionado")? this.getModel().getProperty("/FlagAnoSelecionado")[0] !== undefined ? this.getModel().getProperty("/FlagAnoSelecionado") : null : null;
			var oPerguntaSelecionada = this.getModel().getProperty("/PerguntaSelecionada")? this.getModel().getProperty("/PerguntaSelecionada")[0] !== undefined ? this.getModel().getProperty("/PerguntaSelecionada") : null : null;
			var oRespondeuSimSelecionado = this.getModel().getProperty("/RespondeuSimSelecionado")? this.getModel().getProperty("/RespondeuSimSelecionado")[0] !== undefined ? this.getModel().getProperty("/RespondeuSimSelecionado") : null : null;
			var oAnoFiscalSelecionado = this.getModel().getProperty("/AnoFiscalSelecionado")? this.getModel().getProperty("/AnoFiscalSelecionado")[0] !== undefined ? this.getModel().getProperty("/AnoFiscalSelecionado") : null : null;
			
			var oWhere = []; 
			oWhere.push(oEmpresa);
			oWhere.push(oDominioAnoCalendario);
			oWhere.push(oPeriodoSelecionadas);
			oWhere.push(oMoedaSelecionadas);
			oWhere.push(null);
			oWhere.push(oFlagSNSelecionado);
			oWhere.push(oFlagAnoSelecionado);
			oWhere.push(oPerguntaSelecionada);
			oWhere.push(oRespondeuSimSelecionado);
			oWhere.push(oAnoFiscalSelecionado);
			oWhere.push(null);

			oWhere[10] = ["tblEmpresa.nome"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
			oWhere[10] = ["tblDominioAnoCalendario.ano_calendario"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
				}
			});	
			oWhere[10] = ["tblPeriodo.id_periodo"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
					that.getModel().setProperty("/Periodo", aRegistro);
				}
			});	
			oWhere[10] = ["tblDominioMoeda.acronimo"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
			oWhere[10] = ["tblItemToReport.pergunta"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
					that.getModel().setProperty("/Pergunta", aRegistro);
				}
			});			
			oWhere[10] = ["tblItemToReport.flag_ano"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
					that.getModel().setProperty("/FlagAno", aRegistro);
				}
			});	
			oWhere[10] = ["tblItemToReport.flag_sim_nao"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
					that.getModel().setProperty("/FlagSN", aRegistro);
				}
			});		
			oWhere[10] = ["tblRespostaItemToReport.ind_se_aplica"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
					that.getModel().setProperty("/RespondeuSim", aRegistro);
				}
			});	
			oWhere[10] = ["tblDominioAnoFiscal.ano_fiscal"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
					var oArrayAgregado =[];
					var oArrayFiltro =[];
					var saida=[];
					for (var i = 0; i < aRegistro.length; i++) {
						oArrayAgregado = aRegistro[i]["Ano_Fiscal_Agregado"].split(",");
						oArrayFiltro = aRegistro[i]["Ano_Fiscal_Filtro"].split(",");
					    for (var k = 0; k < oArrayAgregado.length; k++) {
							saida.push({Ano_Fiscal_Agregado:oArrayAgregado[k],Ano_Fiscal_Filtro:oArrayFiltro[k]})
					    }
					}					
					const result = [];
					const map = new Map();
					for (const item of saida) {
					    if(!map.has(item.Ano_Fiscal_Agregado)){
					        map.set(item.Ano_Fiscal_Agregado, true);    // set any value to Map
					        result.push({
					            Ano_Fiscal_Agregado: item.Ano_Fiscal_Agregado,
					            Ano_Fiscal_Filtro: item.Ano_Fiscal_Filtro
					        });
					    }
					}
					result.sort(function (x, y) {
						return Number(Number(x["Ano_Fiscal_Filtro"]-y["Ano_Fiscal_Filtro"]));
					});
					that.getModel().setProperty("/AnoFiscal", result);
				}
			});				
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
					path : "/ReportTaxPackage"
				},
				// column definitions with column name and binding info for the content
				columns : [{
					name : this.getResourceBundle().getText("viewRelatorioEmpresa"),
					template : {
						content : "{tblEmpresa.nome}"
					}
				}, {
					name : this.getResourceBundle().getText("viewGeralAnoCalendario"),
					template : {
						content : "{tblDominioAnoCalendario.ano_calendario}"
					}
				}, {
					name : this.getResourceBundle().getText("viewGeralPeriodo"),
					template : {
						content : "{tblPeriodo.periodo}"
					}
				}, {
					name : this.getResourceBundle().getText("viewGeralFlagSN"),
					template : {
						content : "{tblItemToReport.flag_sim_nao}"
					}
				}, {
					name : this.getResourceBundle().getText("viewGeralFlagAno"),
					template : {
						content : "{tblItemToReport.flag_ano}"
					}
				}, {
					name : this.getResourceBundle().getText("viewRelatorioAnoFiscal"),
					template : {
						content : "{Ano_Fiscal_Agregado}"
					}
				}, {
					name : this.getResourceBundle().getText("viewTPRequisicaoReaberturaResposta") + " " + this.getResourceBundle().getText("viewGeralSim")+ "?",
					template : {
						content : "{tblRespostaItemToReport.ind_se_aplica}"
					}
				}, {
					name : this.getResourceBundle().getText("viewGeralQUestion"),
					template : {
						content : "{tblItemToReport.pergunta}"
					}
				}, {
					name : this.getResourceBundle().getText("viewTPRequisicaoReaberturaResposta"),
					template : {
						content : "{tblRespostaItemToReport.resposta}"
					}
				}]
			});
			
			// download exported file
			oExport.saveFile(
				Utils.dateNowParaArquivo()
				+"_"
				+this.getResourceBundle().getText("viewGeralRelatorio") 
				+"_" 
				+ this.getResourceBundle().getText("viewTaxPackageVisualizacaoTrimestreItensParaReportar")
				).catch(function(oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});
		},	
		
		_geraRelatorioTax: function () {

			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas")? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas"): null : null;
			var oDominioAnoCalendario = this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas")? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas") : null : null;
			var oPeriodoSelecionadas = this.getModel().getProperty("/IdPeriodoSelecionadas")? this.getModel().getProperty("/IdPeriodoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdPeriodoSelecionadas") : null : null;
			var oMoedaSelecionadas = this.getModel().getProperty("/IdMoedaSelecionadas")? this.getModel().getProperty("/IdMoedaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdMoedaSelecionadas") : null : null;
			var oFlagSNSelecionado = this.getModel().getProperty("/FlagSNSelecionado")? this.getModel().getProperty("/FlagSNSelecionado")[0] !== undefined ? this.getModel().getProperty("/FlagSNSelecionado") : null : null;
			var oFlagAnoSelecionado = this.getModel().getProperty("/FlagAnoSelecionado")? this.getModel().getProperty("/FlagAnoSelecionado")[0] !== undefined ? this.getModel().getProperty("/FlagAnoSelecionado") : null : null;
			var oPerguntaSelecionada = this.getModel().getProperty("/PerguntaSelecionada")? this.getModel().getProperty("/PerguntaSelecionada")[0] !== undefined ? this.getModel().getProperty("/PerguntaSelecionada") : null : null;
			var oRespondeuSimSelecionado = this.getModel().getProperty("/RespondeuSimSelecionado")? this.getModel().getProperty("/RespondeuSimSelecionado")[0] !== undefined ? this.getModel().getProperty("/RespondeuSimSelecionado") : null : null;
			var oAnoFiscalSelecionado = this.getModel().getProperty("/AnoFiscalSelecionado")? this.getModel().getProperty("/AnoFiscalSelecionado")[0] !== undefined ? this.getModel().getProperty("/AnoFiscalSelecionado") : null : null;
			var oWhere = []; 
			oWhere.push(oEmpresa);
			oWhere.push(oDominioAnoCalendario);
			oWhere.push(oPeriodoSelecionadas);
			oWhere.push(oMoedaSelecionadas);
			oWhere.push(null);
			oWhere.push(oFlagSNSelecionado);
			oWhere.push(oFlagAnoSelecionado);
			oWhere.push(oPerguntaSelecionada);
			oWhere.push(oRespondeuSimSelecionado);
			oWhere.push(oAnoFiscalSelecionado);
			oWhere.push(null);
			
			this._preencheReportTax(oWhere);			
		},
		
		_preencheReportTax: function (oWhere){
			var that = this;
			that.setBusy(that.byId("relatorioDoTaxPackage"),true);
			that.byId("GerarRelatorio").setEnabled(false);				
			jQuery.ajax(Constants.urlBackend + "DeepQuery/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
						/*aRegistro[i]["tblTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax"] = 
							aRegistro[i]["tblTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax"] 
								? Number(aRegistro[i]["tblTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax"]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") 
								: "0" ;*/
						aRegistro[i]["tblTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax"] = that._aplicarMascara(aRegistro[i]["tblTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax"]);
						/*aRegistro[i]["tblTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits"] = 
							aRegistro[i]["tblTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits"] 
								? Number(aRegistro[i]["tblTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits"]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") 
								: "0" ;*/
						aRegistro[i]["tblTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits"] = that._aplicarMascara(aRegistro[i]["tblTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits"]);
						/*aRegistro[i]["tblTaxReconciliation.rf_net_local_tax"] = 
							aRegistro[i]["tblTaxReconciliation.rf_net_local_tax"] 
								? Number(aRegistro[i]["tblTaxReconciliation.rf_net_local_tax"]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") 
								: "0" ;*/
						aRegistro[i]["tblTaxReconciliation.rf_net_local_tax"] = that._aplicarMascara(aRegistro[i]["tblTaxReconciliation.rf_net_local_tax"]);
						/*aRegistro[i]["tblTaxReconciliation.rf_tax_due_overpaid"] = 
							aRegistro[i]["tblTaxReconciliation.rf_tax_due_overpaid"] 
								? Number(aRegistro[i]["tblTaxReconciliation.rf_tax_due_overpaid"]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") 
								: "0" ;*/
						aRegistro[i]["tblTaxReconciliation.rf_tax_due_overpaid"] = that._aplicarMascara(aRegistro[i]["tblTaxReconciliation.rf_tax_due_overpaid"]);
						aRegistro[i]["tblPeriodo.periodo"] = Utils.traduzTrimestre(aRegistro[i]["tblPeriodo.numero_ordem"],that); 								
					}						
					that.getModel().setProperty("/ReportTaxPackage", aRegistro);
					that.setBusy(that.byId("relatorioDoTaxPackage"),false);		
					that.byId("GerarRelatorio").setEnabled(true);						
				}
			});				
		},		
		
		_aplicarMascara: function (numero) {
			if (this.isPTBR()) {
				return numero ? Number(numero).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "0";	
			}
			else {
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
		},
		
		
	});
});