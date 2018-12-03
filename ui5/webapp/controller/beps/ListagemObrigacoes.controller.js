sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/models",
		"sap/ui/model/Filter",
		"sap/m/MessageToast",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, models, Filter, MessageToast, NodeAPI) {
		return BaseController.extend("ui5ns.ui5.controller.beps.ListagemObrigacoes", {
			
			onInit: function (oEvent) {
				this.setModel(models.createViewModelParaComplianceListagemObrigacoes(), "viewModel");
				this.setModel(new sap.ui.model.json.JSONModel({})); 
				this.getRouter().getRoute("complianceListagemObrigacoes").attachPatternMatched(this._onRouteMatched, this);	
			},
			
			_onRouteMatched: function (oEvent) {
				this.carregarFiltroEmpresa();
				this.carregarFiltroAnoCalendario();
			},
			
			onFiltrar: function (oEvent) {
				if (!this._filtrosRapidos) {
					var that = this;
					this._filtrosRapidos = {
						naoIniciada: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro2"))],
						emAndamento: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro3"))],
						emAtraso: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro4"))],
						entregueNoPrazo: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro5"))],
						entregueForaPrazo: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro6"))]
					};
				}
				
				var sKey = oEvent.getParameter("key");
				var oFilter = this._filtrosRapidos[sKey];
				var oBinding = this.byId("tabelaObrigacoes").getBinding("items");
				
				oBinding.filter(oFilter);
			},
			
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			
			onNavToReport: function () {
				this.getRouter().navTo("bepsRelatorio");	
			},
			
			onTerminouAtualizar: function (oEvent) {             
				MessageToast.show("Atualizar contadores");	
			},
			
			onTrocarAnoCalendario: function (oEvent) {
				MessageToast.show("Filtrar tabela por ano calendário: " + oEvent.getSource().getSelectedItem().getText());	
			},
			
			onBuscarDocumentos: function (oEvent) {
				this.getRouter().navTo("bepsRepositorioDocumentos");
			},
			
			onNovaObrigacao: function (oEvent) {
				this.getRouter().navTo("bepsFormularioNovaObrigacao");
			},
			
			onDetalharObrigacao: function (oEvent) {
				this.getRouter().navTo("bepsFormularioDetalhesObrigacao");
			},
			
			onNavBack: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			carregarFiltroEmpresa: function () {
				var that = this;
				NodeAPI.listarRegistros("Empresa", function (response) {
					response.unshift({ id: null, descricao: "" });
					that.getModel().setProperty("/Empresa", response);
				});
			},
			
			carregarFiltroAnoCalendario : function(){
				var that = this;
					NodeAPI.listarRegistros("DominioAnoCalendario", function (response) {
					response.unshift({ id: null, descricao: "" });
					that.getModel().setProperty("/DominioAnoCalendario", response);
				});
			}
		});
	}
);