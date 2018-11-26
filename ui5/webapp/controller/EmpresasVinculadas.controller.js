sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController"
	],
	function (BaseController) {
		BaseController.extend("ui5ns.ui5.controller.EmpresasVinculadas", {
			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					Registros: [{
						nome: "Empresa A"
					}, {
						nome: "Empresa B"
					}, {
						nome: "Empresa C"
					}]
				}));
			},
			
			onSelecionarEmpresa: function (oEvent) {
				this.getRouter().navTo("detalheEmpresaVinculada");
			},
			
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			}
		});
	}
);