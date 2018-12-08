sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/model/Constants"
	],
	function (BaseController,NodeAPI,Constants) {
		return BaseController.extend("ui5ns.ui5.controller.Comunicacao", {
			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					assunto:null,
					corpo:null
				}));
				
			},
			onEnviarMensagem: function (oEvent) {
				//sap.m.MessageToast.show(this.getResourceBundle().getText("viewEnviarMensagem"));
				var assunto = this.getModel().getProperty("/assunto");
				var corpo = this.getModel().getProperty("/corpo");
				
				jQuery.ajax({//Desativar botao
					url: Constants.urlBackend + "EmailSend",
					type: "POST",
					data: {
						_assunto: assunto,
						_corpo: corpo
					},
					success: function (response) {
						alert(response);//Ativafr botao
					}
				});
				
				/*NodeAPI.listarRegistros("DeepQuery/Usuario?tipoAcesso=1",function (response){
					if(response){
						for(var i = 0; i < response.length; i++){
							jQuery.post(Constants.urlBackend + "EmailSend",
								{
									_email: response["email"],
									_assunto: assunto,
									_corpo: corpo
								},
								function(success){
									
								}
							);
						}
					}
				});*/
			},
			
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			}	
		});
	}
);