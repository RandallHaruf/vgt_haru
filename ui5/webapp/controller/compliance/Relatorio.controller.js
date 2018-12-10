sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"ui5ns/ui5/controller/BaseController",
	"ui5ns/ui5/lib/NodeAPI",
	"ui5ns/ui5/model/Constants"
], function (jQuery, Controller, Filter, JSONModel, BaseController, NodeAPI, Constants) {
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
			/*this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDominioObrigacaoAcessoriaTipo, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteEmpresa, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDominioPais, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteObrigacaoAcessoria, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDomPeriodicidadeObrigacao, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDominioAnoFiscal, this);
			this.getRouter().getRoute("complianceRelatorio").attachPatternMatched(this._onRouteDominioStatusObrigacao, this);
			*/
			this._atualizarDados();
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
		_onRouteEmpresa: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("Empresa", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/Empresa", resposta);
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
		_onRouteObrigacaoAcessoria: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("ObrigacaoAcessoria", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/ObrigacaoAcessoria", resposta);
				}
			});
		},	
		_onRouteDomPeriodicidadeObrigacao: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("DomPeriodicidadeObrigacao", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/DomPeriodicidadeObrigacao", resposta);
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
		_onRouteDominioStatusObrigacao: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("DominioStatusObrigacao", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/DominioStatusObrigacao", resposta);
				}
			});
		},		
		_onRouteDominioObrigacaoAcessoriaTipo: function (oEvent) {
			var that = this;
			NodeAPI.listarRegistros("DominioObrigacaoAcessoriaTipo", function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/DominioObrigacaoAcessoriaTipo", resposta);
				}
			});
		},
		_onRouteDominioObrigacaoAcessoriaTipo2: function (oEvent,registro) {
			var that = this;
			NodeAPI.listarRegistros("deepQuery/DominioObrigacaoAcessoriaTipo?idRegistro="+registro, function (resposta) {
				if (resposta) {
					that.getModel().setProperty("/DominioObrigacaoAcessoriaTipo", resposta);
				}
			});
		},		
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
			
			jQuery.ajax(Constants.urlBackend + "DeepQuery/ReportObrigacao", {
				type: "POST",
				data: {
					parametros: JSON.stringify(oWhere)
				},
				success: function (response) {
					var aRegistro = JSON.parse(response);
					for (var i = 0, length = aRegistro.length; i < length; i++) {
						aRegistro[i].prazo_entrega = aRegistro[i].prazo_entrega.substring(8,10)+"/"+aRegistro[i].prazo_entrega.substring(5,7)+"/"+aRegistro[i].prazo_entrega.substring(4,0);
						aRegistro[i].extensao = aRegistro[i].extensao.substring(8,10)+"/"+aRegistro[i].extensao.substring(5,7)+"/"+aRegistro[i].extensao.substring(4,0);			
					}		
					that.getModel().setProperty("/ReportObrigacao", aRegistro);
				}
			});	
			
			/*PARAMETRO DO DISTINCT
			"tipo": Distinct para Obrigacoes
			"nome": Nomes das Empresas
			"pais": Pais
			"TBLOBRIGACAOACESSORIANOME": Listagem de Obrigacoes
			"descricao": Periodicidade
			"ano_fiscal": Ano Fiscal
			"TBLSTATUSOBRIGACAODESCRICAO": Status
			*/
			
			oWhere[13] = ["tipo"];
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
			oWhere[13] = ["nome"];
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
			oWhere[13] = ["pais"];
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
			oWhere[13] = ["TBLOBRIGACAOACESSORIANOME"];
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
			oWhere[13] = ["descricao"];
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
			oWhere[13] = ["ano_fiscal"];
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
			oWhere[13] = ["TBLSTATUSOBRIGACAODESCRICAO"];
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
		}			
	});
});