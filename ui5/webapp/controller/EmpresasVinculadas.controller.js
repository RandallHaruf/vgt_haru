sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, NodeAPI) {
		BaseController.extend("ui5ns.ui5.controller.EmpresasVinculadas",  {
			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					Registros: [/*{
						nome: "Empresa A"
					}, {
						nome: "Empresa B"
					}, {
						nome: "Empresa C"
					}*/]
				}));
				
				this.getRouter().getRoute("empresasVinculadas").attachPatternMatched(this._onRouteMatched, this);
			},
			
			onSelecionarEmpresa: function (oEvent) {
				var oParametros = {
					empresa: this.getModel().getObject(oEvent.getSource().getBindingContext().getPath())
				};
				
				this.getRouter().navTo("detalheEmpresaVinculada", {
					parametros: JSON.stringify(oParametros)
				});
			},
			
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			_onRouteMatched: function (oEvent) {
				var that = this;
				this.byId("empresaTabela").setBusyIndicatorDelay(100);
				this.byId("empresaTabela").setBusy(true);
				
				NodeAPI.listarRegistros("DeepQuery/Empresa", function(response){
					if (response){
						that.getModel().setProperty("/requisicoes", response);
					}
					that.byId("empresaTabela").setBusy(false);
				});
			}
		});
	}
);