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
					corpo:null,
					bEmailButton: true
				}));
				
			},
			onEnviarMensagem: function (oEvent) {
				//sap.m.MessageToast.show(this.getResourceBundle().getText("viewEnviarMensagem"));
				var assunto = "Comunicacao - " + this.getModel().getProperty("/assunto");
				var corpo = this.getModel().getProperty("/corpo");
				var htmlBody = "<p>Dear Administrator,</p><p>" + corpo + "</p><p>Thank you in advance.</p><p>User</p>";
				var emailCC = "";//Pegar aqui o email na sessão do usuário
				this.getModel().setProperty("/bEmailButton", false);
				var that = this;
				jQuery.ajax({//Desativar botao
					url: Constants.urlBackend + "EmailSend",
					type: "POST",
					data: {
						_assunto: assunto,
						_corpo: htmlBody,
						_emailCC: emailCC
					},
					success: function (response) {
						that.getModel().setProperty("/corpo","");
						that.getModel().setProperty("/assunto","");
						that.getModel().setProperty("/bEmailButton", true);
						sap.m.MessageToast.show("Email enviado com sucesso");
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