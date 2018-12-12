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
				"ObrigacaoIniciada": [{
					"key": null,
					"value": null
				}, {
					"key": 1,
					"value": this.getResourceBundle().getText("viewGeralSim")
				}, {
					"key": 0,
					"value": this.getResourceBundle().getText("viewGeralNao")
				}],
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
			this._atualizarDados();			
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
			var oCheckObrigacao = this.getModel().getProperty("/CheckObrigacaoInicial") ? this.getModel().getProperty("/CheckObrigacaoInicial") === undefined ? null : this.getModel().getProperty("/CheckObrigacaoInicial") == "1" ? ["true"] : ["false"] : null;
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
			oWhere.push(oCheckObrigacao);
			oWhere.push(oCheckSuporteContratado);
			oWhere.push(null);	
			
			/* ----- ESTE TRECHO DE CODIGO FOI PARA A FUNCAO geraRelatorio
			this._preencheReportObrigacao(oWhere);
			*/

			oWhere[13] = ["tblDominioObrigacaoAcessoriaTipo.tipo"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
				type: "POST",
				data: {
					parametros: JSON.stringify(oWhere)
				},
				success: function (response) {
					var aRegistro = JSON.parse(response);
					that.getModel().setProperty("/DominioObrigacaoAcessoriaTipo", aRegistro);
				}
			});		
			oWhere[13] = ["tblEmpresa.nome"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
				type: "POST",
				data: {
					parametros: JSON.stringify(oWhere)
				},
				success: function (response) {
					var aRegistro = JSON.parse(response);
					that.getModel().setProperty("/Empresa", aRegistro);
				}
			});				
			oWhere[13] = ["tblDominioPais.pais"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
				type: "POST",
				data: {
					parametros: JSON.stringify(oWhere)
				},
				success: function (response) {
					var aRegistro = JSON.parse(response);
					that.getModel().setProperty("/DominioPais", aRegistro);
				}
			});		
			oWhere[13] = ["tblObrigacaoAcessoria.nome"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
				type: "POST",
				data: {
					parametros: JSON.stringify(oWhere)
				},
				success: function (response) {
					var aRegistro = JSON.parse(response);
					that.getModel().setProperty("/ObrigacaoAcessoria", aRegistro);
				}
			});	
			oWhere[13] = ["tblDominioPeriodicidadeObrigacao.descricao"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
				type: "POST",
				data: {
					parametros: JSON.stringify(oWhere)
				},
				success: function (response) {
					var aRegistro = JSON.parse(response);
					that.getModel().setProperty("/DomPeriodicidadeObrigacao", aRegistro);
				}
			});	
			oWhere[13] = ["tblDominioAnoFiscal.ano_fiscal"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
				type: "POST",
				data: {
					parametros: JSON.stringify(oWhere)
				},
				success: function (response) {
					var aRegistro = JSON.parse(response);
					that.getModel().setProperty("/DominioAnoFiscal", aRegistro);
				}
			});		
			oWhere[13] = ["tblDominioStatusObrigacao.descricao"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
				type: "POST",
				data: {
					parametros: JSON.stringify(oWhere)
				},
				success: function (response) {
					var aRegistro = JSON.parse(response);
					that.getModel().setProperty("/DominioStatusObrigacao", aRegistro);
				}
			});	
			oWhere[13] = ["tblObrigacao.prazo_entrega"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
				type: "POST",
				data: {
					parametros: JSON.stringify(oWhere)
				},
				success: function (response) {
					var aRegistro = JSON.parse(response);
					that.getModel().setProperty("/ObrigacaoPrazoMin", Utils.bancoParaJsDate(aRegistro[0]["min(tblObrigacao.prazo_entrega)"]));
					that.getModel().setProperty("/ObrigacaoPrazoMax", Utils.bancoParaJsDate(aRegistro[0]["max(tblObrigacao.prazo_entrega)"]));	
				}
			});	
			oWhere[13] = ["tblObrigacao.extensao"];
			jQuery.ajax(Constants.urlBackend + "DeepQueryDistinct/ReportObrigacao", {
				type: "POST",
				data: {
					parametros: JSON.stringify(oWhere)
				},
				success: function (response) {
					var aRegistro = JSON.parse(response);
					that.getModel().setProperty("/ObrigacaoExtensaoMin", Utils.bancoParaJsDate(aRegistro[0]["min(tblObrigacao.extensao)"]));
					that.getModel().setProperty("/ObrigacaoExtensaoMax", Utils.bancoParaJsDate(aRegistro[0]["max(tblObrigacao.extensao)"]));	
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
		
		_geraRelatorio: function () {
			/*
			Esta função gera um array de arrays para serem passados como argumento posteriormente para a função de preencher o relatorio.
			Para nao passar um argumento aquela posicao de array deve ficar nula.
			Ex.:
			[null,null,null,["1","2"],["35"],null,null,["5","8","12","7"]]
			*/
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
			var oCheckObrigacao = this.getModel().getProperty("/CheckObrigacaoInicial") ? this.getModel().getProperty("/CheckObrigacaoInicial") === undefined ? null : this.getModel().getProperty("/CheckObrigacaoInicial") == "1" ? ["true"] : ["false"] : null;
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
			oWhere.push(oCheckObrigacao);
			oWhere.push(oCheckSuporteContratado);
			
			this._preencheReportObrigacao(oWhere);
		},
		
		_preencheReportObrigacao: function (oWhere){
			var that = this;
			jQuery.ajax(Constants.urlBackend + "DeepQuery/ReportObrigacao", {
				type: "POST",
				data: {
					parametros: JSON.stringify(oWhere)
				},
				success: function (response) {
					var aRegistro = JSON.parse(response);
					for (var i = 0, length = aRegistro.length; i < length; i++) {
						aRegistro[i]["tblObrigacao.prazo_entrega"] = aRegistro[i]["tblObrigacao.prazo_entrega"].substring(8,10)+"/"+aRegistro[i]["tblObrigacao.prazo_entrega"].substring(5,7)+"/"+aRegistro[i]["tblObrigacao.prazo_entrega"].substring(4,0);
						aRegistro[i]["tblObrigacao.extensao"] = aRegistro[i]["tblObrigacao.extensao"].substring(8,10)+"/"+aRegistro[i]["tblObrigacao.extensao"].substring(5,7)+"/"+aRegistro[i]["tblObrigacao.extensao"].substring(4,0);
						aRegistro[i]["tblObrigacao.obrigacao_inicial"] = aRegistro[i]["tblObrigacao.obrigacao_inicial"] === 1 ? that.getResourceBundle().getText("viewGeralSim") : that.getResourceBundle().getText("viewGeralNao") ;         
						aRegistro[i]["tblObrigacao.suporte_contratado"] = aRegistro[i]["tblObrigacao.suporte_contratado"] === 1 ? that.getResourceBundle().getText("viewGeralSim") :that.getResourceBundle().getText("viewGeralNao") ;
					}		
					that.getModel().setProperty("/ReportObrigacao", aRegistro);
				}
			});				
		}
	});
});