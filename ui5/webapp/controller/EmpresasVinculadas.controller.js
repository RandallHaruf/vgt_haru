sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/model/Constants"
	],
	function (BaseController, NodeAPI, Constants) {
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
					empresa: this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()),
					nomeUsuario: this.getModel().getProperty("/NomeUsuario")
				};
				
				this.getRouter().navTo("detalheEmpresaVinculada", {
					parametros: this.toURIComponent(oParametros),
				});
			},
			
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			_onRouteMatched: function (oEvent) {
				
				var that = this;
				this.byId("empresaTabela").setBusyIndicatorDelay(100);
				this.byId("empresaTabela").setBusy(true);
				
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
				
				NodeAPI.listarRegistros("DeepQuery/Empresa", function(response){
					if (response){
						that.getModel().setProperty("/Registros", response);
					}
					that.byId("empresaTabela").setBusy(false);
				});
			}
		});
	}
);