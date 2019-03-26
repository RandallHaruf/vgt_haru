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
], function (jQuery, Controller, Filter, JSONModel, BaseController, NodeAPI, Constants, Export, ExportType ,ExportTypeCSV, TablePersoController,MessageBox,Utils) {
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
			this._atualizarDados();
			/*this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this._handleRouteMatched, this);*/		
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._handleRouteMatched, this);			
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
			this.getModel().setProperty("/ReportObrigacao", undefined);
		},
		onNavBack: function (oEvent) {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("complianceListagemObrigacoes");                                  	
		},
		onImprimir: function (oEvent) {
			this._geraRelatorio();                                  	
		},
		onGerarRelatorio: function (oEvent) {
			this._geraRelatorio(); 
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
		_atualizarDados: function () {
			var that = this;
			var vetorInicioEntrega = [];
			var vetorInicioExtensao = [];
			var vetorFimEntrega = [];
			var vetorFimExtensao = [];			
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
			oWhere.push(null);	
			
			/* ----- ESTE TRECHO DE CODIGO FOI PARA A FUNCAO geraRelatorio
			this._preencheReportObrigacao(oWhere);
			*/

			oWhere[14] = ["tblDominioObrigacaoAcessoriaTipo.tipo"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
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
			oWhere[14] = ["tblEmpresa.nome"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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
			oWhere[14] = ["tblDominioPais.pais"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
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
			oWhere[14] = ["tblModeloObrigacao.nome_obrigacao"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
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
					that.getModel().setProperty("/ModeloObrigacao", Utils.orderByArrayParaBox(aRegistro,"tblModeloObrigacao.nome_obrigacao"));
				}
			});	
			oWhere[14] = ["tblDominioPeriodicidadeObrigacao.descricao"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
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
			oWhere[14] = ["tblDominioAnoFiscal.ano_fiscal"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
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
			oWhere[14] = ["tblDominioObrigacaoStatus.descricao_obrigacao_status"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
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
			oWhere[14] = ["prazo_de_entrega_calculado"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
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
			oWhere[14] = ["tblRespostaObrigacao.data_extensao"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
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
			oWhere[14] = ["tblDominioAnoCalendario.ano_calendario"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
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
		
		_geraRelatorio: function () {

			var vetorInicioEntrega = [];
			var vetorInicioExtensao = [];
			var vetorFimEntrega = [];
			var vetorFimExtensao = [];	
			
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
		
			this._preencheReportObrigacao(oWhere);
		},
		
		_preencheReportObrigacao: function (oWhere){
			var that = this;
			that.setBusy(that.byId("relatorioCompliance"),true);	
			that.byId("GerarRelatorio").setEnabled(false);	
			
			jQuery.ajax(Constants.urlBackend + "DeepQuery/ReportObrigacao?full=" + (this.isIFrame() ? "true": "false"), {
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