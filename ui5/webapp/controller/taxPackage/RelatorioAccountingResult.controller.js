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

	return BaseController.extend("ui5ns.ui5.controller.taxPackage.RelatorioAccountingResult", {
		onInit: function () {
			
			var oModel = new sap.ui.model.json.JSONModel({
			});
			oModel.setSizeLimit(5000);
			this.getView().setModel(oModel);
			this._atualizarDados();
			/*
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this._handleRouteMatched, this);	*/		
			this.getModel().setProperty("/remtblEmpresa.nome", "6rem");
			this.getModel().setProperty("/remtblDominioAnoCalendario.ano_calendario", "6rem");
			this.getModel().setProperty("/remtblPeriodo.periodo", "6rem");
			this.getModel().setProperty("/remtblDominioMoeda.acronimo", "6rem");
			this.getModel().setProperty("/remtblTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax", "6rem");
			this.getModel().setProperty("/remtblTaxReconciliation.rc_current_income_tax_current_year", "6rem");
			this.getModel().setProperty("/remtblTaxReconciliation.rc_current_income_tax_previous_year", "6rem");
			this.getModel().setProperty("/remtblTaxReconciliation.rc_deferred_income_tax", "6rem");
			this.getModel().setProperty("/remtblTaxReconciliation.rc_non_recoverable_wht", "6rem");
			this.getModel().setProperty("/remtblTaxReconciliation.rc_statutory_provision_for_income_tax", "6rem");
			this.getModel().setProperty("/remtblTaxReconciliation.rc_statutory_gaap_profit_loss_after_tax", "6rem");
			this.getRouter().getRoute("taxPackageRelatorioAccountingResult").attachPatternMatched(this._handleRouteMatched, this);				
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

			var oWhere = []; 
			oWhere.push(oEmpresa);
			oWhere.push(oDominioAnoCalendario);
			oWhere.push(oPeriodoSelecionadas);
			oWhere.push(oMoedaSelecionadas);
			oWhere.push(null);
			oWhere.push(null);
			
			oWhere[5] = ["tblEmpresa.nome"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinctAccountingResult/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
			oWhere[5] = ["tblDominioAnoCalendario.ano_calendario"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinctAccountingResult/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
			oWhere[5] = ["tblPeriodo.id_periodo"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinctAccountingResult/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
			oWhere[5] = ["tblDominioMoeda.acronimo"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinctAccountingResult/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
					path : "/CSV"
				},

				// column definitions with column name and binding info for the content
				columns : [{
					name : this.getResourceBundle().getText("viewRelatorioEmpresa"),
					template : {
						content : "{tblEmpresa.nome}"
					}
				}, {
					name : this.getResourceBundle().getText("viewRelatorioAnoFiscal"),
					template : {
						content : "{tblDominioAnoCalendario.ano_calendario}"
					}
				}, {
					name : this.getResourceBundle().getText("viewGeralPeriodo"),
					template : {
						content : "{tblPeriodo.periodo}"
					}
				}, {
					name : this.getResourceBundle().getText("viewGeralMoeda"),
					template : {
						content : "{tblDominioMoeda.acronimo}"
					}
				}, {
					name : this.getResourceBundle().getText("viewEdiçãoTrimestreLucroperdaGAAPestatutárioantesdoimposto"),
					template : {
						content : "{tblTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax}"
					}
				}, {
					name : this.getResourceBundle().getText("viewEdiçãoTrimestreImpostoDeRenDaAtual") + " - " + this.getResourceBundle().getText("viewEdiçãoTrimestreAnoAtual"),
					template : {
						content : "{tblTaxReconciliation.rc_current_income_tax_current_year}"
					}
				}, {
					name : this.getResourceBundle().getText("viewEdiçãoTrimestreImpostoDeRenDaAtual") + " - " + this.getResourceBundle().getText("viewEdiçãoTrimestreAnoAnterior"),
					template : {
						content : "{tblTaxReconciliation.rc_current_income_tax_previous_year}"
					}
				}, {
					name : this.getResourceBundle().getText("viewEdiçãoTrimestreImpostoDeRendaDiferido"),
					template : {
						content : "{tblTaxReconciliation.rc_deferred_income_tax}"
					}
				}, {
					name : this.getResourceBundle().getText("viewEdiçãoTrimestreNonRecoverableWHT"),
					template : {
						content : "{tblTaxReconciliation.rc_non_recoverable_wht}"
					}
				}, {
					name : this.getResourceBundle().getText("viewEdiçãoTrimestreStatutoryProvisionForIncomeTax"),
					template : {
						content : "{tblTaxReconciliation.rc_statutory_provision_for_income_tax}"
					}
				}, {
					name : this.getResourceBundle().getText("viewEdiçãoTrimestreLucroperdaGAAPestatutáriodepoisdoimposto"),
					template : {
						content : "{tblTaxReconciliation.rc_statutory_gaap_profit_loss_after_tax}"
					}
				}]
			});
			
			// download exported file
			oExport.saveFile(
				Utils.dateNowParaArquivo()
				+"_"
				+this.getResourceBundle().getText("viewGeralRelatorio") 
				+"_" 
				+ this.getResourceBundle().getText("viewGeralTaxa")
				).catch(function(oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});
		},	
		
		_geraRelatorioTax: function (ifExport) {

			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas")? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas"): null : null;
			var oDominioAnoCalendario = this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas")? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas") : null : null;
			var oPeriodoSelecionadas = this.getModel().getProperty("/IdPeriodoSelecionadas")? this.getModel().getProperty("/IdPeriodoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdPeriodoSelecionadas") : null : null;
			var oMoedaSelecionadas = this.getModel().getProperty("/IdMoedaSelecionadas")? this.getModel().getProperty("/IdMoedaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdMoedaSelecionadas") : null : null;

			var oWhere = []; 
			oWhere.push(oEmpresa);
			oWhere.push(oDominioAnoCalendario);
			oWhere.push(oPeriodoSelecionadas);
			oWhere.push(oMoedaSelecionadas);
			oWhere.push(null);
			oWhere.push(null);
			
			var that = this;
			that.setBusy(that.byId("relatorioDoTaxPackage"),true);
			that.byId("GerarRelatorio").setEnabled(false);				
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinctAccountingResult/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
					}	/*
					that.ajustaRem(that,aRegistro,"tblTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax",that.getResourceBundle().getText("viewEdiçãoTrimestreLucroperdaGAAPestatutárioantesdoimposto"),3,1.35);
					that.ajustaRem(that,aRegistro,"tblTaxReconciliation.rc_current_income_tax_current_year",`${that.getResourceBundle().getText("viewEdiçãoTrimestreImpostoDeRenDaAtual")} - ${that.getResourceBundle().getText("viewEdiçãoTrimestreAnoAtual")}` ,3,1.35);
					that.ajustaRem(that,aRegistro,"tblTaxReconciliation.rc_current_income_tax_previous_year",`${that.getResourceBundle().getText("viewEdiçãoTrimestreImpostoDeRenDaAtual")} - ${that.getResourceBundle().getText("viewEdiçãoTrimestreAnoAnterior")}` ,3,1.35);
					that.ajustaRem(that,aRegistro,"tblTaxReconciliation.rc_deferred_income_tax",that.getResourceBundle().getText("viewEdiçãoTrimestreImpostoDeRendaDiferido"),3,1.35);
					that.ajustaRem(that,aRegistro,"tblTaxReconciliation.rc_non_recoverable_wht",that.getResourceBundle().getText("viewEdiçãoTrimestreNonRecoverableWHT"),3,1.35);
					that.ajustaRem(that,aRegistro,"tblTaxReconciliation.rc_statutory_provision_for_income_tax",that.getResourceBundle().getText("viewEdiçãoTrimestreStatutoryProvisionForIncomeTax"),3,1.35);
					that.ajustaRem(that,aRegistro,"tblTaxReconciliation.rc_statutory_gaap_profit_loss_after_tax",that.getResourceBundle().getText("viewEdiçãoTrimestreLucroperdaGAAPestatutáriodepoisdoimposto"),3,1.35);	*/
					var cabecalho;
					var atributo;
					for (var k = 0, length = that.byId("relatorioDoTaxPackage").getColCount()-2; k < length; k++) {
						cabecalho = that.byId("relatorioDoTaxPackage").getColumns()[k].mAggregations.header.mProperties.text //Nome do Cabeçalho 
						atributo = that.byId("relatorioDoTaxPackage").mBindingInfos.items.template.mAggregations.cells[k].mBindingInfos.text.parts[0].path // nome do atributo
						that.ajustaRem(that,aRegistro,atributo,cabecalho,3,1.35)
					}
					that.byId("texto1").mBindingInfos.text.parts[0].path
					var property = ifExport ? "/CSV" : "/ReportTaxPackage";
					if(property === "/CSV"){
						that.onDataExportCSV();
					}
					else{
						that.getModel().setProperty(property, aRegistro);
						that.setBusy(that.byId("relatorioDoTaxPackage"),false);		
						that.byId("GerarRelatorio").setEnabled(true);						
					}
				}
			});			
		},
		/*
		_preencheReportTax: function (oWhere,ifExport){
			var that = this;
			that.setBusy(that.byId("relatorioDoTaxPackage"),true);
			that.byId("GerarRelatorio").setEnabled(false);				
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinctAccountingResult/ReportTaxPackage?full=" + (this.isIFrame() ? "true" : "false"), {
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
					var property = ifExport ? "/CSV" : "/ReportTaxPackage";
					that.getModel().setProperty(property, aRegistro);
					that.setBusy(that.byId("relatorioDoTaxPackage"),false);		
					that.byId("GerarRelatorio").setEnabled(true);						
				}
			});				
		},	*/	
		ajustaRem: function (that,array,campoNumerico,nomeDoCabecalho,remInicial,remProporcional){
			//this = Para setar a Propriedade Desejada com nome /rem+campoNumerico
			//array = Array com um numero que voce quer que o rem da coluna fique proporcional ao maior valor que ocorra dele
			//campoNumerico = nome string do campo no qual esta o valor da coluna
			//remInicial = width inicial desejado
			//remProporcional = Proporção da notação cientifica do valor que sera aplicada			
			//valores ideais remInicial = 3 e remProporcional = 1.35
			var ordenadorAdjustments = array.slice();
				ordenadorAdjustments.sort(function (x, y) {
					return Number((Math.abs(Number(y[campoNumerico]))?Math.abs(Number(y[campoNumerico])):y[campoNumerico]?y[campoNumerico].length:0)-(Math.abs(Number(x[campoNumerico]))?Math.abs(Number(x[campoNumerico])):x[campoNumerico]?x[campoNumerico].length:0));
				});
				var numero = (Math.abs(Number(ordenadorAdjustments[0][campoNumerico])? Number(ordenadorAdjustments[0][campoNumerico]) : 10**(Number(ordenadorAdjustments[0][campoNumerico].length)/5))+1).toExponential(0).split("+");
				var texto = 5 + (nomeDoCabecalho.length/10);
				that.getModel().setProperty("/rem"+campoNumerico,JSON.stringify(Math.max((remInicial+(Number(numero[numero.length-1]))/remProporcional),(texto)))+"rem");
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