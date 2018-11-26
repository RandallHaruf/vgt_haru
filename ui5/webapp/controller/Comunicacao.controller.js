sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController"
	],
	function (BaseController) {
		return BaseController.extend("ui5ns.ui5.controller.Comunicacao", {
			
			onEnviarMensagem: function (oEvent) {
				sap.m.MessageToast.show("Enviar Mensagem");	
			},
			
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			}	
		});
	}
);