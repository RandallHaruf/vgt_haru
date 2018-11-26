sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController"
	],
	function (BaseController) {
		BaseController.extend("ui5ns.ui5.controller.taxPackage.FormularioNovaRequisicaoReabertura", {
			onSalvar: function () {
				this.getRouter().navTo("taxPackageRequisicaoReabertura");	
			},
			
			onCancelar: function () {
				this.getRouter().navTo("taxPackageRequisicaoReabertura");	
			}
		});
	}
);