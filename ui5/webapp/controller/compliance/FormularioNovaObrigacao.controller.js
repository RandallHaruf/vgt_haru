sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController"
	],
	function (BaseController) {
		return BaseController.extend("ui5ns.ui5.controller.compliance.FormularioNovaObrigacao", {
			onSalvar: function () {
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(this.getResourceBundle().getText("formularioObrigacaoMsgSalvar") , {
					title: "Confirm",
					onClose: function(oAction) { 
						if (sap.m.MessageBox.Action.OK !== oAction) {
							that.getRouter().navTo("complianceListagemObrigacoes");
						}
					}
				});
				//sap.m.MessageToast.show("Cancelar inserção");
			},
			
			onCancelar: function () {
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(this.getResourceBundle().getText("formularioObrigacaoMsgCancelar") , {
					title: "Confirm",
					onClose: function(oAction) { 
						if (sap.m.MessageBox.Action.OK === oAction) {
							that.getRouter().navTo("complianceListagemObrigacoes");
						}
					}
				});
				//sap.m.MessageToast.show("Cancelar inserção");
			}
		});
	}
);