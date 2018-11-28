sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController"
	],
	function (BaseController) {
		return BaseController.extend("ui5ns.ui5.controller.ListaNotificacoes", {
			onInit: function () {
				var that = this;
				
				this.byId("paginaListagem").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarObjetos();
					}	
				});
			},
			
			onResponder: function (oEvent) {
				//if (!this.pressDialog) {
					var oForm = new sap.ui.layout.form.Form({
						editable: true
					}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
						singleContainerFullSize: false
					}));
					
					var oFormContainer = new sap.ui.layout.form.FormContainer();
					
					var oFormElement = new sap.ui.layout.form.FormElement({
						label: "Módulo"
					}).addField(new sap.m.Text({
						text: "Tax Package"
					}));
					
					oFormContainer.addFormElement(oFormElement);
					
					oFormElement = new sap.ui.layout.form.FormElement({
						label: "Usuário"
					}).addField(new sap.m.Text({
						text: "Usuário A"
					}));
					
					oFormContainer.addFormElement(oFormElement);
					
					oFormElement = new sap.ui.layout.form.FormElement({
						label: "Empresa"
					}).addField(new sap.m.Text({
						text: "Empresa A"
					}));
					
					oFormContainer.addFormElement(oFormElement);
					
					oFormElement = new sap.ui.layout.form.FormElement({
						label: "Período"
					}).addField(new sap.m.Text({
						text: "1º Trimestre"
					}));
					
					oFormContainer.addFormElement(oFormElement);
					
					var oSelect = new sap.m.Select();
					oSelect.addItem(new sap.ui.core.Item({
						text: "Aprovado"
					}));
					oSelect.addItem(new sap.ui.core.Item({
						text: "Reprovado"
					}));
					
					oFormElement = new sap.ui.layout.form.FormElement({
						label: "Status"
					}).addField(oSelect);
					
					oFormContainer.addFormElement(oFormElement);
					
					oFormElement = new sap.ui.layout.form.FormElement({
						label: "Resposta"
					}).addField(new sap.m.TextArea({
						rows: 5
					}));
					
					oFormContainer.addFormElement(oFormElement);
					
					oForm.addFormContainer(oFormContainer);
					
					var pressDialog = new sap.m.Dialog({
						title: "Resposta Requisição",
						content: oForm,
						beginButton: new sap.m.Button({
							text: "enviar",
							press: function () {
								sap.m.MessageToast.show("Enviar resposta");
								pressDialog.close();
							}.bind(this)
						}),
						endButton: new sap.m.Button({
							text: "sair",
							press: function () {
								pressDialog.close();
							}.bind(this)
						}),
						afterClose: function () {
							pressDialog.destroy();
						}
					});
	
					// to get access to the global model
					this.getView().addDependent(pressDialog);
				//}

				pressDialog.open();
			},
			
			_carregarObjetos: function () {
				sap.m.MessageToast.show("Carregar objetos");
			}
		});
	}
);