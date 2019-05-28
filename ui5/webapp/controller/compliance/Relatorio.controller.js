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
	"ui5ns/ui5/lib/Utils",
	"ui5ns/ui5/lib/Validador",	
	"ui5ns/ui5/lib/jszip",
	"ui5ns/ui5/lib/XLSX",
	"ui5ns/ui5/lib/FileSaver"	
], function (jQuery, Controller, Filter, JSONModel, BaseController, NodeAPI, Constants, Export, ExportType ,ExportTypeCSV, TablePersoController,MessageBox,Utils,Validador) {
	"use strict";

	return BaseController.extend("ui5ns.ui5.controller.compliance.Relatorio", {
		onInit: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				"SuporteContratado": [{
					"key": null,
					"value": null
				}, {
					"key": 1,
					"value": this.getResourceBundle().getText("viewGeralSim")
				}, {
					"key": 0,
					"value": this.getResourceBundle().getText("viewGeralNao")
				}]				
			}));
			var oModel = new sap.ui.model.json.JSONModel({
			});		
			oModel.setSizeLimit(5000);
			this.getView().setModel(oModel);
			//this._atualizarDados();
			var that = this;
			this.getModel().setProperty("/NomeReport",this.getResourceBundle().getText("viewGeralRelatorio") + " Compliance/Beps");
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
				});		
			
			if (this.isVisualizacaoUsuario()) {
				this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._handleRouteMatched, this);			
			}
		},

		_handleRouteMatched: function (oEvent) {
			if (this.isIFrame()) {
				this.mostrarAcessoRapidoInception();
				this.getModel().setProperty('/IsAreaUsuario', !this.isIFrame());
			}
			
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
			
			this.onExit();
		},	

		navToHome: function () {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("selecaoModulo");    	
		},
		
		navToPage2: function () {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("complianceListagemObrigacoes");                                  	
		},
		_onClearSelecoes: function (oEvent){
			this.getModel().setProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas" , undefined);
			this.getModel().setProperty("/IdEmpresasSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioPaisSelecionadas", undefined);
			this.getModel().setProperty("/IdObrigacaoAcessoriaSelecionadas", undefined);
			this.getModel().setProperty("/IdDomPeriodicidadeObrigacaoSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioAnoFiscalSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioStatusObrigacaoSelecionadas", undefined);
			this.getModel().setProperty("/CheckObrigacaoInicial", undefined);
			this.getModel().setProperty("/CheckSuporteContratado", undefined);
			this.getModel().setProperty("/IdDominioAnoCalendarioSelecionadas", undefined);
			this.getModel().setProperty("/IdDominioMoedaSelecionadas", undefined);			
			this.getModel().setProperty("/TemplateReport", undefined);			
			this.getModel().setProperty("/ReportObrigacao", undefined);
		},
		onNavBack: function (oEvent) {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("complianceListagemObrigacoes");                                  	
		},
		onImprimir: function (oEvent) {
			this._geraRelatorio();                                  	
		},
		onGerarRelatorio: function (oEvent) {
			this._geraRelatorio("/ReportObrigacao"); 
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
		onSaveView: function (oEvent) {
			sap.m.MessageToast.show(JSON.stringify(oEvent.getParameters()));
		},

		onExit: function () {
			this._onClearSelecoes();
			Utils.displayFormat(this);	
			this._atualizarDados();		
			this.getModel().setProperty("/SuporteContratado",[{
					"key": null,
					"value": null
				}, {
					"key": 1,
					"value": this.getResourceBundle().getText("viewGeralSim")
				}, {
					"key": 0,
					"value": this.getResourceBundle().getText("viewGeralNao")
				}]);
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
/*
		
		_onRouteDominioObrigacaoAcessoriaTipo2: function (oEvent,registro) {
			var that = this;
			NodeAPI.listarRegistros("deepQuery/DominioObrigacaoAcessoriaTipo?idRegistro="+registro, function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/DominioObrigacaoAcessoriaTipo", resposta);
				}
			});
		},	
*/		


		onDialogOpen: function (oEvent) {
			var that = this;
			this.onTemplateSet();
			Utils._dialogReport("Layout", "/TemplateReport","/Excluir",that,"id_template_report",oEvent);
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
			var vetorInicioEntrega = [];
			var vetorInicioExtensao = [];
			var vetorInicioConclusao = [];			
			var vetorInicioUpload = [];				
			var vetorFimEntrega = [];
			var vetorFimExtensao = [];	
			var vetorFimConclusao = [];				
			var vetorFimUpload = [];
			
			var oDominioObrigacaoAcessoriaTipo = this.getModel().getProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas")? this.getModel().getProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas") : null : null;			
			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas")? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas"): null : null;
			var oDominioPais = this.getModel().getProperty("/IdDominioPaisSelecionadas")? this.getModel().getProperty("/IdDominioPaisSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioPaisSelecionadas") : null : null;
			var oObrigacaoAcessoria = this.getModel().getProperty("/IdObrigacaoAcessoriaSelecionadas")? this.getModel().getProperty("/IdObrigacaoAcessoriaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdObrigacaoAcessoriaSelecionadas") : null : null;
			var oDomPeriodicidadeObrigacao = this.getModel().getProperty("/IdDomPeriodicidadeObrigacaoSelecionadas")? this.getModel().getProperty("/IdDomPeriodicidadeObrigacaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDomPeriodicidadeObrigacaoSelecionadas") : null : null;
			var oDominioAnoFiscal = this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas")? this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas") : null : null;
			var oDataPrazoEntregaInicio = this.getModel().getProperty("/DataPrazoEntregaInicio")? this.getModel().getProperty("/DataPrazoEntregaInicio") !== null ? vetorInicioEntrega[0] = (this.getModel().getProperty("/DataPrazoEntregaInicio").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataPrazoEntregaInicio").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataPrazoEntregaInicio").getDate().toString().padStart(2,'0')) : null : null;
			var oDataPrazoEntregaFim = this.getModel().getProperty("/DataPrazoEntregaFim")? this.getModel().getProperty("/DataPrazoEntregaFim") !== null ? vetorFimEntrega[0] = (this.getModel().getProperty("/DataPrazoEntregaFim").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataPrazoEntregaFim").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataPrazoEntregaFim").getDate().toString().padStart(2,'0')) : null : null;			
			var oDataExtensaoInicio = this.getModel().getProperty("/DataExtensaoInicio")? this.getModel().getProperty("/DataExtensaoInicio")[0] !== null ? vetorInicioExtensao[0] = (this.getModel().getProperty("/DataExtensaoInicio").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataExtensaoInicio").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataExtensaoInicio").getDate().toString().padStart(2,'0')) : null : null;
			var oDataExtensaoFim = this.getModel().getProperty("/DataExtensaoFim")? this.getModel().getProperty("/DataExtensaoFim")[0] !== null ? vetorFimExtensao[0] = (this.getModel().getProperty("/DataExtensaoFim").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataExtensaoFim").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataExtensaoFim").getDate().toString().padStart(2,'0')) : null : null;			
			var oDominioStatusObrigacao = this.getModel().getProperty("/IdDominioStatusObrigacaoSelecionadas")? this.getModel().getProperty("/IdDominioStatusObrigacaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioStatusObrigacaoSelecionadas") : null : null;
			var oDominioAnoCalendario = this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas")? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas") : null : null;
			var oCheckSuporteContratado = this.getModel().getProperty("/CheckSuporteContratado") ? this.getModel().getProperty("/CheckSuporteContratado") === undefined ? null : this.getModel().getProperty("/CheckSuporteContratado") == "1" ? ["true"] : ["false"] : null;
			var oDominioMoeda = this.getModel().getProperty("/IdDominioMoedaSelecionadas")? this.getModel().getProperty("/IdDominioMoedaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioMoedaSelecionadas") : null : null;
			var oDataConclusaoInicio = this.getModel().getProperty("/DataConclusaoInicio")? this.getModel().getProperty("/DataConclusaoInicio")[0] !== null ? vetorInicioExtensao[0] = (this.getModel().getProperty("/DataConclusaoInicio").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataConclusaoInicio").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataConclusaoInicio").getDate().toString().padStart(2,'0')) : null : null;
			var oDataConclusaoFim = this.getModel().getProperty("/DataConclusaoFim")? this.getModel().getProperty("/DataConclusaoFim")[0] !== null ? vetorFimExtensao[0] = (this.getModel().getProperty("/DataConclusaoFim").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataConclusaoFim").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataConclusaoFim").getDate().toString().padStart(2,'0')) : null : null;
			var oDataUploadInicio = this.getModel().getProperty("/DataUploadInicio")? this.getModel().getProperty("/DataUploadInicio")[0] !== null ? vetorInicioExtensao[0] = (this.getModel().getProperty("/DataUploadInicio").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataUploadInicio").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataUploadInicio").getDate().toString().padStart(2,'0')) : null : null;
			var oDataUploadFim = this.getModel().getProperty("/DataUploadFim")? this.getModel().getProperty("/DataUploadFim")[0] !== null ? vetorFimExtensao[0] = (this.getModel().getProperty("/DataUploadFim").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataUploadFim").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataUploadFim").getDate().toString().padStart(2,'0')) : null : null;			
			
			var oWhere = [];
			var oFiltrosVisiveis = [];
			for (var i = 0, length = this.byId("filterbar").getAllFilterItems().length; i < length; i++) {
				oFiltrosVisiveis.push(
					{
						name: this.byId("filterbar").getAllFilterItems()[i].mProperties.name ,
						visible: this.byId("filterbar").getAllFilterItems()[i].mProperties.visibleInFilterBar
					}
				);
			}			
			oWhere.push(oDominioObrigacaoAcessoriaTipo);
			oWhere.push(oEmpresa);
			oWhere.push(oDominioPais);
			oWhere.push(oObrigacaoAcessoria);
			oWhere.push(oDomPeriodicidadeObrigacao);
			oWhere.push(oDominioAnoFiscal);
			oWhere.push(oDataPrazoEntregaInicio === null ? null : vetorInicioEntrega);
			oWhere.push(oDataPrazoEntregaFim === null ? null : vetorFimEntrega);
			oWhere.push(oDataExtensaoInicio === null? null : vetorInicioExtensao);
			oWhere.push(oDataExtensaoFim === null? null : vetorFimExtensao);			
			oWhere.push(oDominioStatusObrigacao);
			oWhere.push(oDominioAnoCalendario);
			oWhere.push(oCheckSuporteContratado);
			oWhere.push(oDominioMoeda);			
			oWhere.push(oDataConclusaoInicio === null? null : vetorInicioConclusao);
			oWhere.push(oDataConclusaoFim === null? null : vetorFimConclusao);			
			oWhere.push(oDataUploadInicio === null? null : vetorInicioUpload);
			oWhere.push(oDataUploadFim === null? null : vetorFimUpload);	
			oWhere.push(oFiltrosVisiveis);
			this.getModel().setProperty("/Preselecionado", oWhere);
		},
		
		onTemplateGet: function (oEvent) {
			this._onClearSelecoes();
			this._atualizarDados();
			var forcaSelecao = this.getModel().getProperty("/Preselecionado");
			this.getModel().setProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas", forcaSelecao[0]);
			this.getModel().setProperty("/IdEmpresasSelecionadas", forcaSelecao[1]);
			this.getModel().setProperty("/IdDominioPaisSelecionadas", forcaSelecao[2]);
			this.getModel().setProperty("/IdObrigacaoAcessoriaSelecionadas", forcaSelecao[3]);
			this.getModel().setProperty("/IdDomPeriodicidadeObrigacaoSelecionadas", forcaSelecao[4]);
			this.getModel().setProperty("/IdDominioAnoFiscalSelecionadas", forcaSelecao[5]);
			this.getModel().setProperty("/DataPrazoEntregaInicio", forcaSelecao[6]?Utils.bancoParaJsDate(forcaSelecao[6][0]): null);
			this.getModel().setProperty("/DataPrazoEntregaFim", forcaSelecao[7]?Utils.bancoParaJsDate(forcaSelecao[7][0]): null);
			this.getModel().setProperty("/DataExtensaoInicio", forcaSelecao[8]?Utils.bancoParaJsDate(forcaSelecao[8][0]): null);
			this.getModel().setProperty("/DataExtensaoFim", forcaSelecao[9]?Utils.bancoParaJsDate(forcaSelecao[9][0]): null);
			this.getModel().setProperty("/IdDominioStatusObrigacaoSelecionadas", forcaSelecao[10]);
			this.getModel().setProperty("/IdDominioAnoCalendarioSelecionadas", forcaSelecao[11]);	
			this.getModel().setProperty("/CheckSuporteContratado", forcaSelecao[12]);		
			this.getModel().setProperty("/IdDominioMoedaSelecionadas", Utils.bancoParaJsDate(forcaSelecao[13]));
			this.getModel().setProperty("/DataConclusaoInicio", forcaSelecao[14]?Utils.bancoParaJsDate(forcaSelecao[14][0]): null);
			this.getModel().setProperty("/DataConclusaoFim", forcaSelecao[15]?Utils.bancoParaJsDate(forcaSelecao[15][0]): null);
			this.getModel().setProperty("/DataUploadInicio", forcaSelecao[16]?Utils.bancoParaJsDate(forcaSelecao[16][0]): null);	
			this.getModel().setProperty("/DataUploadFim", forcaSelecao[17]?Utils.bancoParaJsDate(forcaSelecao[17][0]): null);	
			if(forcaSelecao.length >= 19){
				for (var i = 0, length = forcaSelecao[18].length; i < length; i++) {
					for (var k = 0, length = this.byId("filterbar").getAllFilterItems().length; k < length; k++) {
						if(forcaSelecao[18][i].name == this.byId("filterbar").getAllFilterItems()[k].mProperties.name){
							this.byId("filterbar").getAllFilterItems()[k].mProperties.visibleInFilterBar = forcaSelecao[18][i].visible;
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
			var vetorInicioEntrega = [];
			var vetorInicioExtensao = [];
			var vetorInicioConclusao = [];			
			var vetorInicioUpload = [];				
			var vetorFimEntrega = [];
			var vetorFimExtensao = [];	
			var vetorFimConclusao = [];				
			var vetorFimUpload = [];
			
			var oDominioObrigacaoAcessoriaTipo = this.getModel().getProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas")? this.getModel().getProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas") : null : null;			
			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas")? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas"): null : null;
			var oDominioPais = this.getModel().getProperty("/IdDominioPaisSelecionadas")? this.getModel().getProperty("/IdDominioPaisSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioPaisSelecionadas") : null : null;
			var oObrigacaoAcessoria = this.getModel().getProperty("/IdObrigacaoAcessoriaSelecionadas")? this.getModel().getProperty("/IdObrigacaoAcessoriaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdObrigacaoAcessoriaSelecionadas") : null : null;
			var oDomPeriodicidadeObrigacao = this.getModel().getProperty("/IdDomPeriodicidadeObrigacaoSelecionadas")? this.getModel().getProperty("/IdDomPeriodicidadeObrigacaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDomPeriodicidadeObrigacaoSelecionadas") : null : null;
			var oDominioAnoFiscal = this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas")? this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas") : null : null;
			var oDataPrazoEntregaInicio = this.getModel().getProperty("/DataPrazoEntregaInicio")? this.getModel().getProperty("/DataPrazoEntregaInicio") !== null ? vetorInicioEntrega[0] = (this.getModel().getProperty("/DataPrazoEntregaInicio").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataPrazoEntregaInicio").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataPrazoEntregaInicio").getDate().toString().padStart(2,'0')) : null : null;
			var oDataPrazoEntregaFim = this.getModel().getProperty("/DataPrazoEntregaFim")? this.getModel().getProperty("/DataPrazoEntregaFim") !== null ? vetorFimEntrega[0] = (this.getModel().getProperty("/DataPrazoEntregaFim").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataPrazoEntregaFim").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataPrazoEntregaFim").getDate().toString().padStart(2,'0')) : null : null;			
			var oDataExtensaoInicio = this.getModel().getProperty("/DataExtensaoInicio")? this.getModel().getProperty("/DataExtensaoInicio")[0] !== null ? vetorInicioExtensao[0] = (this.getModel().getProperty("/DataExtensaoInicio").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataExtensaoInicio").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataExtensaoInicio").getDate().toString().padStart(2,'0')) : null : null;
			var oDataExtensaoFim = this.getModel().getProperty("/DataExtensaoFim")? this.getModel().getProperty("/DataExtensaoFim")[0] !== null ? vetorFimExtensao[0] = (this.getModel().getProperty("/DataExtensaoFim").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataExtensaoFim").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataExtensaoFim").getDate().toString().padStart(2,'0')) : null : null;			
			var oDominioStatusObrigacao = this.getModel().getProperty("/IdDominioStatusObrigacaoSelecionadas")? this.getModel().getProperty("/IdDominioStatusObrigacaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioStatusObrigacaoSelecionadas") : null : null;
			var oDominioAnoCalendario = this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas")? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas") : null : null;
			var oCheckSuporteContratado = this.getModel().getProperty("/CheckSuporteContratado") ? this.getModel().getProperty("/CheckSuporteContratado") === undefined ? null : this.getModel().getProperty("/CheckSuporteContratado") == "1" ? ["true"] : ["false"] : null;
			var oDominioMoeda = this.getModel().getProperty("/IdDominioMoedaSelecionadas")? this.getModel().getProperty("/IdDominioMoedaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioMoedaSelecionadas") : null : null;
			var oDataConclusaoInicio = this.getModel().getProperty("/DataConclusaoInicio")? this.getModel().getProperty("/DataConclusaoInicio")[0] !== null ? vetorInicioExtensao[0] = (this.getModel().getProperty("/DataConclusaoInicio").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataConclusaoInicio").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataConclusaoInicio").getDate().toString().padStart(2,'0')) : null : null;
			var oDataConclusaoFim = this.getModel().getProperty("/DataConclusaoFim")? this.getModel().getProperty("/DataConclusaoFim")[0] !== null ? vetorFimExtensao[0] = (this.getModel().getProperty("/DataConclusaoFim").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataConclusaoFim").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataConclusaoFim").getDate().toString().padStart(2,'0')) : null : null;
			var oDataUploadInicio = this.getModel().getProperty("/DataUploadInicio")? this.getModel().getProperty("/DataUploadInicio")[0] !== null ? vetorInicioExtensao[0] = (this.getModel().getProperty("/DataUploadInicio").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataUploadInicio").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataUploadInicio").getDate().toString().padStart(2,'0')) : null : null;
			var oDataUploadFim = this.getModel().getProperty("/DataUploadFim")? this.getModel().getProperty("/DataUploadFim")[0] !== null ? vetorFimExtensao[0] = (this.getModel().getProperty("/DataUploadFim").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataUploadFim").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataUploadFim").getDate().toString().padStart(2,'0')) : null : null;			
			
			var oWhere = []; 
			oWhere.push(oDominioObrigacaoAcessoriaTipo);
			oWhere.push(oEmpresa);
			oWhere.push(oDominioPais);
			oWhere.push(oObrigacaoAcessoria);
			oWhere.push(oDomPeriodicidadeObrigacao);
			oWhere.push(oDominioAnoFiscal);
			oWhere.push(oDataPrazoEntregaInicio === null ? null : vetorInicioEntrega);
			oWhere.push(oDataPrazoEntregaFim === null ? null : vetorFimEntrega);
			oWhere.push(oDataExtensaoInicio === null? null : vetorInicioExtensao);
			oWhere.push(oDataExtensaoFim === null? null : vetorFimExtensao);			
			oWhere.push(oDominioStatusObrigacao);
			oWhere.push(oDominioAnoCalendario);
			oWhere.push(oCheckSuporteContratado);
			oWhere.push(null);
			oWhere.push(oDominioMoeda);			
			oWhere.push(oDataConclusaoInicio === null? null : vetorInicioConclusao);
			oWhere.push(oDataConclusaoFim === null? null : vetorFimConclusao);			
			oWhere.push(oDataUploadInicio === null? null : vetorInicioUpload);
			oWhere.push(oDataUploadFim === null? null : vetorFimUpload);				
			oWhere.push(null);	
			
			/* ----- ESTE TRECHO DE CODIGO FOI PARA A FUNCAO geraRelatorio
			this._preencheReportObrigacao(oWhere);
			*/
			var posicaoDoArrayParaDistinct = 19;
			if(oDominioObrigacaoAcessoriaTipo === null){
				oWhere[posicaoDoArrayParaDistinct] = ["tblDominioObrigacaoAcessoriaTipo.tipo"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
						that.getModel().setProperty("/DominioObrigacaoAcessoriaTipo", Utils.orderByArrayParaBox(aRegistro,"tblDominioObrigacaoAcessoriaTipo.tipo"));
					}
				});					
			}
			if(oEmpresa === null){
				oWhere[posicaoDoArrayParaDistinct] = ["tblEmpresa.nome"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
						that.getModel().setProperty("/Empresa", Utils.orderByArrayParaBox(aRegistro,"tblEmpresa.nome"));
					}
				});					
			}
			if(oDominioPais === null){
				oWhere[posicaoDoArrayParaDistinct] = ["tblDominioPais.pais"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
							aRegistro[i]["tblDominioPais.pais"] = Utils.traduzDominioPais(aRegistro[i]["tblDominioPais.id_dominio_pais"],that);           
						}					
						that.getModel().setProperty("/DominioPais", Utils.orderByArrayParaBox(aRegistro,"tblDominioPais.pais"));
					}
				});					
			}
			if(oObrigacaoAcessoria === null){
				oWhere[posicaoDoArrayParaDistinct] = ["tblModeloObrigacao.nome_obrigacao"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
							aRegistro[i]["tblModeloObrigacao.nome_obrigacao"] = aRegistro[i]["tblModeloObrigacao.nome_obrigacao"] + " - " +Utils.traduzDominioPais(aRegistro[i]["tblDominioPais.id_dominio_pais"],that); 
						}					
						that.getModel().setProperty("/ModeloObrigacao", Utils.orderByArrayParaBox(aRegistro,"tblModeloObrigacao.nome_obrigacao"));
					}
				});					
			}
			if(oDomPeriodicidadeObrigacao === null){
				oWhere[posicaoDoArrayParaDistinct] = ["tblDominioPeriodicidadeObrigacao.descricao"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
							aRegistro[i]["tblDominioPeriodicidadeObrigacao.descricao"] = Utils.traduzPeriodo(aRegistro[i]["tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao"],that);           
						}
						that.getModel().setProperty("/DomPeriodicidadeObrigacao", Utils.orderByArrayParaBox(aRegistro,"tblDominioPeriodicidadeObrigacao.descricao"));
					}
				});					
			}
			if(oDominioAnoFiscal === null){
				oWhere[posicaoDoArrayParaDistinct] = ["tblDominioAnoFiscal.ano_fiscal"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
							aRegistro.sort(function (x, y) {
								return Number(Number(y["tblDominioAnoFiscal.ano_fiscal"]-x["tblDominioAnoFiscal.ano_fiscal"]));
							});						
						that.getModel().setProperty("/DominioAnoFiscal", aRegistro);
					}
				});					
			}
			if(oDominioStatusObrigacao === null){
				oWhere[posicaoDoArrayParaDistinct] = ["tblDominioObrigacaoStatus.descricao_obrigacao_status"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
							aRegistro[i]["tblDominioObrigacaoStatus.descricao_obrigacao_status"] = Utils.traduzStatusObrigacao(aRegistro[i]["tblDominioObrigacaoStatus.id_dominio_obrigacao_status"],that);           
						}					
						that.getModel().setProperty("/DominioStatusObrigacao", Utils.orderByArrayParaBox(aRegistro,"tblDominioObrigacaoStatus.descricao_obrigacao_status"));
					}
				});					
			}
			if(oDataPrazoEntregaInicio === null && oDataPrazoEntregaFim === null ){
				oWhere[posicaoDoArrayParaDistinct] = ["prazo_de_entrega_calculado"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
						that.getModel().setProperty("/ObrigacaoPrazoMin", Utils.bancoParaJsDate(
							aRegistro[0] ? aRegistro[0]["min(prazo_de_entrega_calculado)"] : null
						));
						that.getModel().setProperty("/ObrigacaoPrazoMax", Utils.bancoParaJsDate(
							aRegistro[0] ? aRegistro[0]["max(prazo_de_entrega_calculado)"] : null
						));	
					}
				});					
			}
			if(oDataExtensaoInicio === null && oDataExtensaoFim === null){
				oWhere[posicaoDoArrayParaDistinct] = ["tblRespostaObrigacao.data_extensao"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
						that.getModel().setProperty("/ObrigacaoExtensaoMin", Utils.bancoParaJsDate(
							aRegistro[0] ? aRegistro[0]["min(tblRespostaObrigacao.data_extensao)"] : null
						));
						that.getModel().setProperty("/ObrigacaoExtensaoMax", Utils.bancoParaJsDate(
							aRegistro[0] ? aRegistro[0]["max(tblRespostaObrigacao.data_extensao)"] : null
						));	
					}
				});					
			}
	
			if(oDominioAnoCalendario === null){
				oWhere[posicaoDoArrayParaDistinct] = ["tblDominioAnoCalendario.ano_calendario"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
							aRegistro.sort(function (x, y) {
								return Number(Number(y["tblDominioAnoCalendario.ano_calendario"]-x["tblDominioAnoCalendario.ano_calendario"]));
							});						
						that.getModel().setProperty("/DominioAnoCalendario", aRegistro);	
					}
				});					
			}	
			
			if(oDominioMoeda === null){
				oWhere[posicaoDoArrayParaDistinct] = ["tblDominioMoeda.nome"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
						that.getModel().setProperty("/DominioMoeda",  Utils.orderByArrayParaBox(aRegistro,"tblDominioMoeda.acronimo"));	
					}
				});					
			}			
			if(oDataConclusaoInicio === null && oDataConclusaoFim === null){
				oWhere[posicaoDoArrayParaDistinct] = ["tblRespostaObrigacao.data_conclusao"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
						that.getModel().setProperty("/ObrigacaoConclusaoMin", Utils.bancoParaJsDate(
							aRegistro[0] ? aRegistro[0]["min(tblRespostaObrigacao.data_conclusao)"] : null
						));
						that.getModel().setProperty("/ObrigacaoConclusaoMax", Utils.bancoParaJsDate(
							aRegistro[0] ? aRegistro[0]["max(tblRespostaObrigacao.data_conclusao)"] : null
						));	
					}
				});					
			}	
			if(oDataUploadInicio === null && oDataUploadFim === null){
				oWhere[posicaoDoArrayParaDistinct] = ["tblDocumentoObrigacao.data_upload"];
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
						that.getModel().setProperty("/ObrigacaoUploadMin", Utils.bancoParaJsDate(
							aRegistro[0] ? aRegistro[0]["min(tblDocumentoObrigacao.data_upload)"] : null
						));
						that.getModel().setProperty("/ObrigacaoUploadMax", Utils.bancoParaJsDate(
							aRegistro[0] ? aRegistro[0]["max(tblDocumentoObrigacao.data_upload)"] : null
						));	
					}
				});					
			}			
		},
		/*
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
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro1"),
					template : {
						content : "{tblDominioObrigacaoAcessoriaTipo.tipo}"
					}
				}, {
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesSelectEmpresas"),
					template : {
						content : "{tblEmpresa.nome}"
					}
				}, {
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaPais"),
					template : {
						content : "{tblDominioPais.pais}"
					}
				}, {
					name : this.getResourceBundle().getText("viewEmpresasObrigacoesAcessorias"),
					template : {
						content : "{tblModeloObrigacao.nome_obrigacao}"
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
					name : this.getResourceBundle().getText("viewGeralAnoCalendario"),
					template : {
						content : "{tblDominioAnoCalendario.ano_calendario}"
					}
				},{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaPrazoEntrega"),
					template : {
						content : "{prazo_de_entrega_calculado}"
					}
				},{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaExtensao"),
					template : {
						content : "{tblRespostaObrigacao.data_extensao}"
					}
				},{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaStatus"),
					template : {
						content : "{tblDominioObrigacaoStatus.descricao_obrigacao_status}"//"{= ${obrigacao_inicial} === 1 ? ${i18n>viewGeralSim} : ${i18n>viewGeralNao}}"
					}
				},{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaSuporteContratado"),
					template : {
						content : "{tblRespostaObrigacao.suporte_contratado}"//"{= ${suporte_contratado} === 1 ? ${i18n>viewGeralSim} : ${i18n>viewGeralNao}}"
					}
				},{
					name : this.getResourceBundle().getText("formularioObrigacaoLabelValorSuporte"),
					template : {
						content : "{tblRespostaObrigacao.suporte_valor}"
					}
				},{
					name : this.getResourceBundle().getText("formularioObrigacaoLabelObservacoes"),
					template : {
						content : "{tblRespostaObrigacao.suporte_especificacao}"
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
		
		onDataExportTXT : sap.m.Table.prototype.exportData || function(oEvent) {

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType : new ExportType({
					fileExtension : "txt",
					mimeType : "text/plain",
					charset : "utf-8"
				}),

				// Pass in the model created above
				models : this.getView().getModel(),

				// binding information for the rows aggregation
				rows : {
					path : "/ReportObrigacao"
				},

				// column definitions with column name and binding info for the content

				columns : [{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro1"),
					template : {
						content : "{tblDominioObrigacaoAcessoriaTipo.tipo}"
					}
				}, {
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesSelectEmpresas"),
					template : {
						content : "{tblEmpresa.nome}"
					}
				}, {
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaPais"),
					template : {
						content : "{tblDominioPais.pais}"
					}
				}, {
					name : this.getResourceBundle().getText("viewEmpresasObrigacoesAcessorias"),
					template : {
						content : "{tblModeloObrigacao.nome_obrigacao}"
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
					name : this.getResourceBundle().getText("viewGeralAnoCalendario"),
					template : {
						content : "{tblDominioAnoCalendario.ano_calendario}"
					}
				},{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaPrazoEntrega"),
					template : {
						content : "{prazo_de_entrega_calculado}"
					}
				},{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaExtensao"),
					template : {
						content : "{tblRespostaObrigacao.data_extensao}"
					}
				},{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaStatus"),
					template : {
						content : "{tblDominioObrigacaoStatus.descricao_obrigacao_status}"//"{= ${obrigacao_inicial} === 1 ? ${i18n>viewGeralSim} : ${i18n>viewGeralNao}}"
					}
				},{
					name : this.getResourceBundle().getText("viewComplianceListagemObrigacoesColunaSuporteContratado"),
					template : {
						content : "{tblRespostaObrigacao.suporte_contratado}"//"{= ${suporte_contratado} === 1 ? ${i18n>viewGeralSim} : ${i18n>viewGeralNao}}"
					}
				},{
					name : this.getResourceBundle().getText("formularioObrigacaoLabelValorSuporte"),
					template : {
						content : "{tblRespostaObrigacao.suporte_valor}"
					}
				},{
					name : this.getResourceBundle().getText("formularioObrigacaoLabelObservacoes"),
					template : {
						content : "{tblRespostaObrigacao.suporte_especificacao}"
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
		*/
		onDataExport : sap.m.Table.prototype.exportData || function(tipo) {
			Utils.dataExportReport(this,tipo,"viewComplianceListagemObrigacoesTituloPagina","viewComplianceListagemObrigacoesTituloPagina");     
			
		},			
		_geraRelatorio: function (ifExport) {

			var vetorInicioEntrega = [];
			var vetorInicioExtensao = [];
			var vetorInicioConclusao = [];			
			var vetorInicioUpload = [];				
			var vetorFimEntrega = [];
			var vetorFimExtensao = [];	
			var vetorFimConclusao = [];				
			var vetorFimUpload = [];
			
			var oDominioObrigacaoAcessoriaTipo = this.getModel().getProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas")? this.getModel().getProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas") : null : null;			
			var oEmpresa = this.getModel().getProperty("/IdEmpresasSelecionadas")? this.getModel().getProperty("/IdEmpresasSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdEmpresasSelecionadas"): null : null;
			var oDominioPais = this.getModel().getProperty("/IdDominioPaisSelecionadas")? this.getModel().getProperty("/IdDominioPaisSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioPaisSelecionadas") : null : null;
			var oObrigacaoAcessoria = this.getModel().getProperty("/IdObrigacaoAcessoriaSelecionadas")? this.getModel().getProperty("/IdObrigacaoAcessoriaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdObrigacaoAcessoriaSelecionadas") : null : null;
			var oDomPeriodicidadeObrigacao = this.getModel().getProperty("/IdDomPeriodicidadeObrigacaoSelecionadas")? this.getModel().getProperty("/IdDomPeriodicidadeObrigacaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDomPeriodicidadeObrigacaoSelecionadas") : null : null;
			var oDominioAnoFiscal = this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas")? this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoFiscalSelecionadas") : null : null;
			var oDataPrazoEntregaInicio = this.getModel().getProperty("/DataPrazoEntregaInicio")? this.getModel().getProperty("/DataPrazoEntregaInicio") !== null ? vetorInicioEntrega[0] = (this.getModel().getProperty("/DataPrazoEntregaInicio").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataPrazoEntregaInicio").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataPrazoEntregaInicio").getDate().toString().padStart(2,'0')) : null : null;
			var oDataPrazoEntregaFim = this.getModel().getProperty("/DataPrazoEntregaFim")? this.getModel().getProperty("/DataPrazoEntregaFim") !== null ? vetorFimEntrega[0] = (this.getModel().getProperty("/DataPrazoEntregaFim").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataPrazoEntregaFim").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataPrazoEntregaFim").getDate().toString().padStart(2,'0')) : null : null;			
			var oDataExtensaoInicio = this.getModel().getProperty("/DataExtensaoInicio")? this.getModel().getProperty("/DataExtensaoInicio")[0] !== null ? vetorInicioExtensao[0] = (this.getModel().getProperty("/DataExtensaoInicio").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataExtensaoInicio").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataExtensaoInicio").getDate().toString().padStart(2,'0')) : null : null;
			var oDataExtensaoFim = this.getModel().getProperty("/DataExtensaoFim")? this.getModel().getProperty("/DataExtensaoFim")[0] !== null ? vetorFimExtensao[0] = (this.getModel().getProperty("/DataExtensaoFim").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataExtensaoFim").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataExtensaoFim").getDate().toString().padStart(2,'0')) : null : null;			
			var oDominioStatusObrigacao = this.getModel().getProperty("/IdDominioStatusObrigacaoSelecionadas")? this.getModel().getProperty("/IdDominioStatusObrigacaoSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioStatusObrigacaoSelecionadas") : null : null;
			var oDominioAnoCalendario = this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas")? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas") : null : null;
			var oCheckSuporteContratado = this.getModel().getProperty("/CheckSuporteContratado") ? this.getModel().getProperty("/CheckSuporteContratado") === undefined ? null : this.getModel().getProperty("/CheckSuporteContratado") == "1" ? ["true"] : ["false"] : null;
			var oDominioMoeda = this.getModel().getProperty("/IdDominioMoedaSelecionadas")? this.getModel().getProperty("/IdDominioMoedaSelecionadas")[0] !== undefined ? this.getModel().getProperty("/IdDominioMoedaSelecionadas") : null : null;
			var oDataConclusaoInicio = this.getModel().getProperty("/DataConclusaoInicio")? this.getModel().getProperty("/DataConclusaoInicio")[0] !== null ? vetorInicioExtensao[0] = (this.getModel().getProperty("/DataConclusaoInicio").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataConclusaoInicio").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataConclusaoInicio").getDate().toString().padStart(2,'0')) : null : null;
			var oDataConclusaoFim = this.getModel().getProperty("/DataConclusaoFim")? this.getModel().getProperty("/DataConclusaoFim")[0] !== null ? vetorFimExtensao[0] = (this.getModel().getProperty("/DataConclusaoFim").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataConclusaoFim").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataConclusaoFim").getDate().toString().padStart(2,'0')) : null : null;
			var oDataUploadInicio = this.getModel().getProperty("/DataUploadInicio")? this.getModel().getProperty("/DataUploadInicio")[0] !== null ? vetorInicioExtensao[0] = (this.getModel().getProperty("/DataUploadInicio").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataUploadInicio").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataUploadInicio").getDate().toString().padStart(2,'0')) : null : null;
			var oDataUploadFim = this.getModel().getProperty("/DataUploadFim")? this.getModel().getProperty("/DataUploadFim")[0] !== null ? vetorFimExtensao[0] = (this.getModel().getProperty("/DataUploadFim").getFullYear().toString() + "-" +(this.getModel().getProperty("/DataUploadFim").getMonth() +1).toString().padStart(2,'0') + "-" + this.getModel().getProperty("/DataUploadFim").getDate().toString().padStart(2,'0')) : null : null;			
			
			var oWhere = []; 
			oWhere.push(oDominioObrigacaoAcessoriaTipo);
			oWhere.push(oEmpresa);
			oWhere.push(oDominioPais);
			oWhere.push(oObrigacaoAcessoria);
			oWhere.push(oDomPeriodicidadeObrigacao);
			oWhere.push(oDominioAnoFiscal);
			oWhere.push(oDataPrazoEntregaInicio === null ? null : vetorInicioEntrega);
			oWhere.push(oDataPrazoEntregaFim === null ? null : vetorFimEntrega);
			oWhere.push(oDataExtensaoInicio === null? null : vetorInicioExtensao);
			oWhere.push(oDataExtensaoFim === null? null : vetorFimExtensao);			
			oWhere.push(oDominioStatusObrigacao);
			oWhere.push(oDominioAnoCalendario);
			oWhere.push(oCheckSuporteContratado);
			oWhere.push(null);
			oWhere.push(oDominioMoeda);			
			oWhere.push(oDataConclusaoInicio === null? null : vetorInicioConclusao);
			oWhere.push(oDataConclusaoFim === null? null : vetorFimConclusao);			
			oWhere.push(oDataUploadInicio === null? null : vetorInicioUpload);
			oWhere.push(oDataUploadFim === null? null : vetorFimUpload);				
			oWhere.push(null);	
			
			//this._preencheReportObrigacao(oWhere);
			var that = this;
			that.setBusy(that.byId("relatorioCompliance"),true);	
			that.byId("GerarRelatorio").setEnabled(false);	
			
			jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
						aRegistro[i]["prazo_de_entrega_calculado"] = aRegistro[i]["prazo_de_entrega_calculado"] 
						? Utils.stringDataDoBancoParaStringDDMMYYYY(
							aRegistro[i]["tblDominioAnoCalendario.ano_calendario"]+aRegistro[i]["prazo_de_entrega_calculado"].substring(4,10)
							) 
						: null;
						aRegistro[i]["tblRespostaObrigacao.data_extensao"] = aRegistro[i]["tblRespostaObrigacao.data_extensao"] 
						? Utils.stringDataDoBancoParaStringDDMMYYYY(aRegistro[i]["tblRespostaObrigacao.data_extensao"]) 
						: null;
						aRegistro[i]["tblRespostaObrigacao.data_conclusao"] = aRegistro[i]["tblRespostaObrigacao.data_conclusao"] 
						? Utils.stringDataDoBancoParaStringDDMMYYYY(aRegistro[i]["tblRespostaObrigacao.data_conclusao"]) 
						: null;
						aRegistro[i]["tblDocumentoObrigacao.data_upload"] = aRegistro[i]["tblDocumentoObrigacao.data_upload"] 
						? Utils.stringDataDoBancoParaStringDDMMYYYY(aRegistro[i]["tblDocumentoObrigacao.data_upload"]) 
						: null;
						//TRADUZIR DESCRICAO DA OBRIGACAO STATUS
						aRegistro[i]["tblRespostaObrigacao.suporte_contratado"] = !!aRegistro[i]["tblRespostaObrigacao.suporte_contratado"] === true 
						? that.getResourceBundle().getText("viewGeralSim") 
						: that.getResourceBundle().getText("viewGeralNao") ;
						
						aRegistro[i]["tblRespostaObrigacao.suporte_valor"] = that._aplicarMascara(aRegistro[i]["tblRespostaObrigacao.suporte_valor"]);
						
						aRegistro[i]["tblDominioPeriodicidadeObrigacao.descricao"] = Utils.traduzPeriodo(aRegistro[i]["tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao"],that);	
						aRegistro[i]["tblDominioPais.pais"] = Utils.traduzDominioPais(aRegistro[i]["tblDominioPais.id_dominio_pais"],that);  
						aRegistro[i]["tblDominioObrigacaoStatus.descricao_obrigacao_status"] = Utils.traduzStatusObrigacao(aRegistro[i]["tblDominioObrigacaoStatus.id_dominio_obrigacao_status"],that);           						
					}		
					Utils.conteudoView("relatorioCompliance",that,"/TabelaDaView");
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
						that.setBusy(that.byId("relatorioCompliance"),false);		
						that.byId("GerarRelatorio").setEnabled(true);						
						that.onDataExport(ifExport);
					}
					else{/*
						for (var k = 0, length = array.length; k < length; k++) {
							Utils.ajustaRem(that,aRegistro,array[k]["propriedadeDoValorDaLinha"],array[k]["textoNomeDaColuna"],3,1.35)
						}*/						
						that.getModel().setProperty(ifExport, aRegistro);
						that.setBusy(that.byId("relatorioCompliance"),false);		
						that.byId("GerarRelatorio").setEnabled(true);						
					}					
					/*
					that.getModel().setProperty("/ReportObrigacao", aRegistro);
					
					that.setBusy(that.byId("relatorioCompliance"),false);	
					that.byId("GerarRelatorio").setEnabled(true);	*/					
				}
			});				
		},
		
		_preencheReportObrigacao: function (oWhere){
			var that = this;
			that.setBusy(that.byId("relatorioCompliance"),true);	
			that.byId("GerarRelatorio").setEnabled(false);	
			
			jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
						aRegistro[i]["prazo_de_entrega_calculado"] = aRegistro[i]["prazo_de_entrega_calculado"] 
						? Utils.stringDataDoBancoParaStringDDMMYYYY(
							aRegistro[i]["tblDominioAnoCalendario.ano_calendario"]+aRegistro[i]["prazo_de_entrega_calculado"].substring(4,10)
							) 
						: null;
						aRegistro[i]["tblRespostaObrigacao.data_extensao"] = aRegistro[i]["tblRespostaObrigacao.data_extensao"] 
						? Utils.stringDataDoBancoParaStringDDMMYYYY(aRegistro[i]["tblRespostaObrigacao.data_extensao"]) 
						: null;
						//TRADUZIR DESCRICAO DA OBRIGACAO STATUS
						aRegistro[i]["tblRespostaObrigacao.suporte_contratado"] = !!aRegistro[i]["tblRespostaObrigacao.suporte_contratado"] === true 
						? that.getResourceBundle().getText("viewGeralSim") 
						: that.getResourceBundle().getText("viewGeralNao") ;
						
						aRegistro[i]["tblRespostaObrigacao.suporte_valor"] = that._aplicarMascara(aRegistro[i]["tblRespostaObrigacao.suporte_valor"]);
						
						aRegistro[i]["tblDominioPeriodicidadeObrigacao.descricao"] = Utils.traduzPeriodo(aRegistro[i]["tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao"],that);	
						aRegistro[i]["tblDominioPais.pais"] = Utils.traduzDominioPais(aRegistro[i]["tblDominioPais.id_dominio_pais"],that);  
						aRegistro[i]["tblDominioObrigacaoStatus.descricao_obrigacao_status"] = Utils.traduzStatusObrigacao(aRegistro[i]["tblDominioObrigacaoStatus.id_dominio_obrigacao_status"],that);           						
					}		
					that.getModel().setProperty("/ReportObrigacao", aRegistro);
					
					that.setBusy(that.byId("relatorioCompliance"),false);	
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
	});
});