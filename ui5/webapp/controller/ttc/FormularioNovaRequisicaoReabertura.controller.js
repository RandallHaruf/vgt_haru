sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController"
	],
	function (BaseController) {
		BaseController.extend("ui5ns.ui5.controller.ttc.FormularioNovaRequisicaoReabertura", {
			onSalvar: function () {
				this.getRouter().navTo("ttcRequisicaoReabertura");	
			},
			
			onCancelar: function () {
				this.getRouter().navTo("ttcRequisicaoReabertura");	
			}
		});
	}
);