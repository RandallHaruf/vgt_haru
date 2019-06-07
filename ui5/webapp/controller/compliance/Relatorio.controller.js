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
			//this.getModel().setProperty("/TemplateReport", undefined);			
			this.getModel().setProperty("/ReportObrigacao", undefined);
		},
		/*COMMENT M_VGT.53
		_onClearFiltros: function (oEvent) {
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
		},		
		COMMENT M_VGT.53*/		
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
			var that = this;
			that.setBusy(that.byId("idNomeReport"), true);
			that.getModel().setProperty("/NomeReport",that.getResourceBundle().getText("viewGeralRelatorio") + " Compliance/Beps");			
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
		getSelectedItemsTemplate: function(oEvent){
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
			//var oWhere = [];
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
			
			oWhere.ObrigacaoAcessoriaTipo = oDominioObrigacaoAcessoriaTipo;
			oWhere.Empresa = oEmpresa;
			oWhere.Pais = oDominioPais;
			oWhere.ObrigacaoAcessoria = oObrigacaoAcessoria;
			oWhere.Periodicidade = oDomPeriodicidadeObrigacao;
			oWhere.AnoFiscal = oDominioAnoFiscal;
			oWhere.DataPrazoEntregaInicio = oDataPrazoEntregaInicio === null ? null : vetorInicioEntrega;
			oWhere.DataPrazoEntregaFim = oDataPrazoEntregaFim === null ? null : vetorFimEntrega;
			oWhere.DataExtensaoInicio = oDataExtensaoInicio === null? null : vetorInicioExtensao;
			oWhere.DataExtensaoFim = oDataExtensaoFim === null? null : vetorFimExtensao;			
			oWhere.StatusObrigacao = oDominioStatusObrigacao;
			oWhere.AnoCalendario = oDominioAnoCalendario;
			oWhere.CheckSuporteContratado = oCheckSuporteContratado;
			oWhere.Moeda = oDominioMoeda;			
			oWhere.DataConclusaoInicio = oDataConclusaoInicio === null? null : vetorInicioConclusao;
			oWhere.DataConclusaoFim = oDataConclusaoFim === null? null : vetorFimConclusao;			
			oWhere.DataUploadInicio = oDataUploadInicio === null? null : vetorInicioUpload;
			oWhere.DataUploadFim = oDataUploadFim === null? null : vetorFimUpload;			
			oWhere.Filtros = oFiltrosVisiveis;

			return oWhere;
		},

		
		onTemplateGet: function (oEvent) {
			this._onClearSelecoes();
			var forcaSelecao = this.getModel().getProperty("/Preselecionado");
	
			this.getModel().setProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas", forcaSelecao.ObrigacaoAcessoriaTipo);
			this.getModel().setProperty("/IdEmpresasSelecionadas", forcaSelecao.Empresa);
			this.getModel().setProperty("/IdDominioPaisSelecionadas", forcaSelecao.Pais);
			this.getModel().setProperty("/IdObrigacaoAcessoriaSelecionadas", forcaSelecao.ObrigacaoAcessoria);
			this.getModel().setProperty("/IdDomPeriodicidadeObrigacaoSelecionadas", forcaSelecao.Periodicidade);
			this.getModel().setProperty("/IdDominioAnoFiscalSelecionadas", forcaSelecao.AnoFiscal);
			this.getModel().setProperty("/DataPrazoEntregaInicio", forcaSelecao.DataPrazoEntregaInicio?forcaSelecao.DataPrazoEntregaInicio[0]: null);
			this.getModel().setProperty("/DataPrazoEntregaFim", forcaSelecao.DataPrazoEntregaFim?forcaSelecao.DataPrazoEntregaFim[0]: null);
			this.getModel().setProperty("/DataExtensaoInicio", forcaSelecao.DataExtensaoInicio?forcaSelecao.DataExtensaoInicio[0]: null);
			this.getModel().setProperty("/DataExtensaoFim", forcaSelecao.DataExtensaoFim?forcaSelecao.DataExtensaoFim[0]: null);
			this.getModel().setProperty("/IdDominioStatusObrigacaoSelecionadas", forcaSelecao.StatusObrigacao);
			this.getModel().setProperty("/IdDominioAnoCalendarioSelecionadas", forcaSelecao.AnoCalendario);	
			this.getModel().setProperty("/CheckSuporteContratado", forcaSelecao.CheckSuporteContratado);		
			this.getModel().setProperty("/IdDominioMoedaSelecionadas", forcaSelecao.Moeda);
			this.getModel().setProperty("/DataConclusaoInicio", forcaSelecao.DataConclusaoInicio?forcaSelecao.DataConclusaoInicio[0]: null);
			this.getModel().setProperty("/DataConclusaoFim", forcaSelecao.DataConclusaoFim?forcaSelecao.DataConclusaoFim[0]: null);
			this.getModel().setProperty("/DataUploadInicio", forcaSelecao.DataUploadInicio?forcaSelecao.DataUploadInicio[0]: null);	
			this.getModel().setProperty("/DataUploadFim", forcaSelecao.DataUploadFim?forcaSelecao.DataUploadFim[0]: null);	

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
			/*COMMENT M_VGT.23
			//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
			var that = this;
			that.getModel().setProperty("/DominioObrigacaoAcessoriaTipo",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioObrigacaoAcessoriaTipo"),"tblDominioObrigacaoAcessoriaTipo.tipo",that.getModel().getProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas"),"tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo"));				
			that.getModel().setProperty("/Empresa",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Empresa"),"tblEmpresa.nome",that.getModel().getProperty("/IdEmpresasSelecionadas"),"tblEmpresa.id_empresa"));				
			that.getModel().setProperty("/DominioPais",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioPais"),"tblDominioPais.pais",that.getModel().getProperty("/IdDominioPaisSelecionadas"),"tblDominioPais.id_dominio_pais"));				
			that.getModel().setProperty("/ModeloObrigacao",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/ModeloObrigacao"),"tblModeloObrigacao.nome_obrigacao",that.getModel().getProperty("/IdObrigacaoAcessoriaSelecionadas"),"tblModeloObrigacao.id_modelo"));				
			that.getModel().setProperty("/DomPeriodicidadeObrigacao",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DomPeriodicidadeObrigacao"),"tblDominioPeriodicidadeObrigacao.descricao",that.getModel().getProperty("/IdDomPeriodicidadeObrigacaoSelecionadas"),"tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao"));				
			that.getModel().setProperty("/DominioAnoFiscal",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioAnoFiscal"),"tblDominioAnoFiscal.ano_fiscal",that.getModel().getProperty("/IdDominioAnoFiscalSelecionadas"),"tblDominioAnoFiscal.id_dominio_ano_fiscal"));				
			that.getModel().setProperty("/DominioStatusObrigacao",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioStatusObrigacao"),"tblDominioObrigacaoStatus.descricao_obrigacao_status",that.getModel().getProperty("/IdDominioStatusObrigacaoSelecionadas"),"tblDominioObrigacaoStatus.id_dominio_obrigacao_status"));				
			that.getModel().setProperty("/DominioAnoCalendario",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioAnoCalendario"),"tblDominioAnoCalendario.ano_calendario",that.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas"),"tblDominioAnoCalendario.id_dominio_ano_calendario"));				
			that.getModel().setProperty("/DominioMoeda",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioMoeda"),"tblDominioMoeda.acronimo",that.getModel().getProperty("/IdDominioMoedaSelecionadas"),"tblResposataObrigacao.fk_id_dominio_moeda.id_dominio_moeda"));				
			COMMENT*/
		},

		_atualizarDados: function () {
			var that = this;

			var oWhere = this.getSelectedItemsTemplate();
			if(oWhere.ObrigacaoAcessoriaTipo === null){
				oWhere.Distinct = ["tblDominioObrigacaoAcessoriaTipo.tipo"];			
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false")+"&moduloAtual=3" /*Modulo 3e4 representa Compliance/Beps*/, {
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
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioObrigacaoAcessoriaTipo",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioObrigacaoAcessoriaTipo"),"tblDominioObrigacaoAcessoriaTipo.tipo",that.getModel().getProperty("/IdDominioObrigacaoAcessoriaTipoSelecionadas"),"tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo"));				
			}COMMENT*/
			if(oWhere.Empresa === null){
				oWhere.Distinct = ["tblEmpresa.nome"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false")+"&moduloAtual=3" /*Modulo 3e4 representa Compliance/Beps*/, {
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
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/Empresa",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/Empresa"),"tblEmpresa.nome",that.getModel().getProperty("/IdEmpresasSelecionadas"),"tblEmpresa.id_empresa"));				
			}COMMENT*/
			if(oWhere.Pais === null){
				oWhere.Distinct = ["tblDominioPais.pais"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false")+"&moduloAtual=3" /*Modulo 3e4 representa Compliance/Beps*/, {
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
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioPais",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioPais"),"tblDominioPais.pais",that.getModel().getProperty("/IdDominioPaisSelecionadas"),"tblDominioPais.id_dominio_pais"));				
			}COMMENT*/
			if(oWhere.ObrigacaoAcessoria === null){
				oWhere.Distinct = ["tblModeloObrigacao.nome_obrigacao"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false")+"&moduloAtual=3" /*Modulo 3e4 representa Compliance/Beps*/, {
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
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/ModeloObrigacao",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/ModeloObrigacao"),"tblModeloObrigacao.nome_obrigacao",that.getModel().getProperty("/IdObrigacaoAcessoriaSelecionadas"),"tblModeloObrigacao.id_modelo"));				
			}COMMENT*/
			if(oWhere.Periodicidade === null){
				oWhere.Distinct = ["tblDominioPeriodicidadeObrigacao.descricao"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false")+"&moduloAtual=3" /*Modulo 3e4 representa Compliance/Beps*/, {
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
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DomPeriodicidadeObrigacao",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DomPeriodicidadeObrigacao"),"tblDominioPeriodicidadeObrigacao.descricao",that.getModel().getProperty("/IdDomPeriodicidadeObrigacaoSelecionadas"),"tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao"));				
			}COMMENT*/
			if(oWhere.AnoFiscal === null){
				oWhere.Distinct = ["tblDominioAnoFiscal.ano_fiscal"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false")+"&moduloAtual=3" /*Modulo 3e4 representa Compliance/Beps*/, {
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
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioAnoFiscal",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioAnoFiscal"),"tblDominioAnoFiscal.ano_fiscal",that.getModel().getProperty("/IdDominioAnoFiscalSelecionadas"),"tblDominioAnoFiscal.id_dominio_ano_fiscal"));				
			}COMMENT*/
			if(oWhere.StatusObrigacao === null){
				oWhere.Distinct = ["tblDominioObrigacaoStatus.descricao_obrigacao_status"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false")+"&moduloAtual=3" /*Modulo 3e4 representa Compliance/Beps*/, {
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
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioStatusObrigacao",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioStatusObrigacao"),"tblDominioObrigacaoStatus.descricao_obrigacao_status",that.getModel().getProperty("/IdDominioStatusObrigacaoSelecionadas"),"tblDominioObrigacaoStatus.id_dominio_obrigacao_status"));				
			}COMMENT*/
			if(oWhere.DataPrazoEntregaInicio === null && oWhere.DataPrazoEntregaFim === null ){
				oWhere.Distinct = ["prazo_de_entrega_calculado"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false")+"&moduloAtual=3" /*Modulo 3e4 representa Compliance/Beps*/, {
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
			if(oWhere.DataExtensaoInicio === null && oWhere.DataExtensaoFim === null){
				oWhere.Distinct = ["tblRespostaObrigacao.data_extensao"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false")+"&moduloAtual=3" /*Modulo 3e4 representa Compliance/Beps*/, {
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
			if(oWhere.AnoCalendario === null){
				oWhere.Distinct = ["tblDominioAnoCalendario.ano_calendario"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false")+"&moduloAtual=3" /*Modulo 3e4 representa Compliance/Beps*/, {
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
			}	/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioAnoCalendario",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioAnoCalendario"),"tblDominioAnoCalendario.ano_calendario",that.getModel().getProperty("/IdDominioAnoCalendarioSelecionadas"),"tblDominioAnoCalendario.id_dominio_ano_calendario"));				
			}COMMENT*/
			if(oWhere.Moeda === null){
				oWhere.Distinct = ["tblDominioMoeda.nome"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false")+"&moduloAtual=3" /*Modulo 3e4 representa Compliance/Beps*/, {
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
			}/*COMMENT M_VGT.23
			else{//COMENTADO PARA LIBERAR NO ITEM M_VGT.23
				that.getModel().setProperty("/DominioMoeda",Utils.orderByArrayParaBoxComSelecao(that.getModel().getProperty("/DominioMoeda"),"tblDominioMoeda.acronimo",that.getModel().getProperty("/IdDominioMoedaSelecionadas"),"tblResposataObrigacao.fk_id_dominio_moeda.id_dominio_moeda"));				
			}COMMENT*/			
			if(oWhere.DataConclusaoInicio === null && oWhere.DataConclusaoFim === null){
				oWhere.Distinct = ["tblRespostaObrigacao.data_conclusao"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false")+"&moduloAtual=3" /*Modulo 3e4 representa Compliance/Beps*/, {
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
			if(oWhere.DataUploadInicio === null && oWhere.DataUploadFim === null){
				oWhere.Distinct = ["tblDocumentoObrigacao.data_upload"];				
				jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false")+"&moduloAtual=3" /*Modulo 3e4 representa Compliance/Beps*/, {
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

		onDataExport : sap.m.Table.prototype.exportData || function(tipo) {
			Utils.dataExportReport(this,tipo,"viewComplianceListagemObrigacoesTituloPagina","viewComplianceListagemObrigacoesTituloPagina","/TabelaDaView");    
			
		},			
		_geraRelatorio: function (ifExport) {
			var oWhere = this.getSelectedItemsTemplate();
			
			var that = this;
	
			that.byId("GerarRelatorio").setEnabled(false);	
			
			const promise1 = function () {
				return new Promise(function (resolve, reject) {
					that.setBusy(that.byId("relatorioCompliance"),true);							
					jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (that.isIFrame() ? "true": "false")+"&moduloAtual=3" /*Modulo 3e4 representa Compliance/Beps*/, {
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
						that.onDataExport(ifExport);
					}
					else{/*
						for (var k = 0, length = array.length; k < length; k++) {
							Utils.ajustaRem(that,aRegistro,array[k]["propriedadeDoValorDaLinha"],array[k]["textoNomeDaColuna"],3,1.35)
						}*/						
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
					that.byId("GerarRelatorio").setEnabled(true);	
					that.setBusy(that.byId("relatorioCompliance"),false);	
				});		
			
			
			
			
			
			
			
			
			
			
			
			/*
			jQuery.ajax(Constants.urlBackend + "DeepQueryNewDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false")+"&moduloAtual=3" , {
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
					else{
					
						// for (var k = 0, length = array.length; k < length; k++) {
						// 	Utils.ajustaRem(that,aRegistro,array[k]["propriedadeDoValorDaLinha"],array[k]["textoNomeDaColuna"],3,1.35)
						// }						
						that.getModel().setProperty(ifExport, aRegistro);
						that.setBusy(that.byId("relatorioCompliance"),false);		
						that.byId("GerarRelatorio").setEnabled(true);						
					}		
				}
			});	*/			
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