sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/Constants"
	],
	function (BaseController, Constants) {
		return BaseController.extend("ui5ns.ui5.controller.admin.CadastroDiferencasTaxPackage", {

			onInit: function () {
				var that = this;

				that.setModel(new sap.ui.model.json.JSONModel({
					DominioDiferencaTipo: [],
					objetos: []
				}));

				this.byId("paginaListagem").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarObjetos();
					}
				});

				jQuery.ajax(Constants.urlBackend + "DominioDiferencaTipo", {
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						that.getModel().setProperty("/DominioDiferencaTipo", response);
					}
				});
			},

			onNovoObjeto: function (oEvent) {
				var that = this;

				var oForm = new sap.ui.layout.form.Form({
					editable: true
				}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
					singleContainerFullSize: false
				}));

				var oFormContainer = new sap.ui.layout.form.FormContainer();

				/*var oFormElement = new sap.ui.layout.form.FormElement({
					label: "Tipo"
				}).addField(new sap.m.Select().addItem(new sap.ui.core.Item({
					text: "Permanente"
				})).addItem(new sap.ui.core.Item({
					text: "Temporária"
				})));*/

				var oFormElement = new sap.ui.layout.form.FormElement(
					/*{
										label: "Tipo"
									}*/
				);

				oFormElement.setLabel(new sap.m.Label({
					text: "Tipo"
				}).addStyleClass("sapMLabelRequired"));

				var oSelectTipo = new sap.m.Select().bindItems({
					templateShareable: false,
					path: "/DominioDiferencaTipo",
					template: new sap.ui.core.ListItem({
						key: "{id_dominio_diferenca_tipo}",
						text: "{tipo}"
					})
				});

				oFormElement.addField(oSelectTipo);

				oFormContainer.addFormElement(oFormElement);

				var oInputNome = new sap.m.Input();

				oFormElement = new sap.ui.layout.form.FormElement(
						/*{
											label: "Nome"
										}*/
					)
					.setLabel(new sap.m.Label({
						text: "Nome"
					}).addStyleClass("sapMLabelRequired"))
					.addField(oInputNome);

				oFormContainer.addFormElement(oFormElement);

				oForm.addFormContainer(oFormContainer);

				var dialog = new sap.m.Dialog({
					title: "Nova Diferença",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "salvar",
						press: function () {
							//sap.m.MessageToast.show("Inserir diferença: " + oInputNome.getValue());

							if (!oInputNome.getValue() || !oSelectTipo.getSelectedKey()) {
								sap.m.MessageBox.warning(that.getResourceBundle().getText("ViewGeralOrbigatorio"), {
									title: "Aviso"
								});
							} else {
								jQuery.ajax(Constants.urlBackend + "DiferencaOpcao", {
									type: "POST",
									xhrFields: {
										withCredentials: true
									},
									crossDomain: true,
									data: {
										nome: oInputNome.getValue(),
										fkDominioDiferencaTipo: oSelectTipo.getSelectedKey()
									},
									success: function (response) {
										that._carregarObjetos();

										dialog.close();
									}
								});
							}
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "sair",
						press: function () {
							dialog.close();
						}.bind(this)
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				// to get access to the global model
				this.getView().addDependent(dialog);

				dialog.open();
			},

			onAbrirObjeto: function (oEvent) {
				var that = this;

				var iIdDiferenca = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath())["id_diferenca_opcao"];
				var sNomeCorrente = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()).nome;
				var iFkTipoCorrente = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath())["id_dominio_diferenca_tipo"];

				var oForm = new sap.ui.layout.form.Form({
					editable: true
				}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
					singleContainerFullSize: false
				}));

				var oFormContainer = new sap.ui.layout.form.FormContainer();

				var oFormElement = new sap.ui.layout.form.FormElement(
					/*{
										label: "Tipo"
									}*/
				);

				oFormElement.setLabel(new sap.m.Label({
					text: "Tipo"
				}).addStyleClass("sapMLabelRequired"));

				var oSelectTipo = new sap.m.Select({
					selectedKey: iFkTipoCorrente
				}).bindItems({
					templateShareable: false,
					path: "/DominioDiferencaTipo",
					template: new sap.ui.core.ListItem({
						key: "{id_dominio_diferenca_tipo}",
						text: "{tipo}"
					})
				});

				oFormElement.addField(oSelectTipo);

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement(
					/*{
										label: "Nome"
									}*/
				);

				oFormElement.setLabel(new sap.m.Label({
					text: "Nome"
				}).addStyleClass("sapMLabelRequired"));

				var oInputNome = new sap.m.Input({
					value: sNomeCorrente
				});

				oFormElement.addField(oInputNome);

				oFormContainer.addFormElement(oFormElement);

				oForm.addFormContainer(oFormContainer);

				var dialog = new sap.m.Dialog({
					title: "Editar Diferença",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "salvar",
						press: function () {
							//sap.m.MessageToast.show("Atualizar diferença: " + nome);

							if (!oInputNome.getValue() || !oSelectTipo.getSelectedKey()) {
								sap.m.MessageBox.warning(that.getResourceBundle().getText("ViewGeralOrbigatorio"), {
									title: "Aviso"
								});
							} else {
								jQuery.ajax(Constants.urlBackend + "DiferencaOpcao/" + iIdDiferenca, {
									type: "PUT",

									xhrFields: {
										withCredentials: true
									},
									crossDomain: true,
									data: {
										nome: oInputNome.getValue(),
										fkDominioDiferencaTipo: oSelectTipo.getSelectedKey()
									},
									success: function (response) {
										that._carregarObjetos();

										dialog.close();
									}
								});
							}

							//dialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "sair",
						press: function () {
							dialog.close();
						}.bind(this)
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				// to get access to the global model
				this.getView().addDependent(dialog);

				dialog.open();
			},

			onDesabilitar: function (oEvent) {
				var nome = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()).nome;
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(that.getResourceBundle().getText("viewGeralCertezaDesabilitar"), {
					title: "Confirm",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							sap.m.MessageToast.show("Desabilitar Diferença: " + nome);
						}
					}
				});
			},

			onExcluir: function (oEvent) {
				var that = this;
				//var nome = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()).nome;
				var iIdDiferenca = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath())["id_diferenca_opcao"];

				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(that.getResourceBundle().getText("ViewGeralCerteza"), {
					title: "Confirm",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							//sap.m.MessageToast.show("Excluir Diferença: " + nome);	

							jQuery.ajax(Constants.urlBackend + "DiferencaOpcao/" + iIdDiferenca, {
								type: "DELETE",
								xhrFields: {
									withCredentials: true
								},
								crossDomain: true,
								success: function (response) {
									that._carregarObjetos();
								}
							});
						}
					}
				});
			},

			_carregarObjetos: function () {
				/*this.getModel().setProperty("/objetos", [{
					id: "1",
					tipo: "Permanentes",
					nome: "Diferença 1"
				}, {
					id: "2",
					tipo: "Temporárias",
					nome: "Diferença 2"
				}]);*/

				var that = this;

				jQuery.ajax(Constants.urlBackend + "DeepQuery/DiferencaOpcao", {
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						that.getModel().setProperty("/objetos", response);
					}
				});
			}
		});
	}
);

/*sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController"
	],
	function (BaseController) {
		return BaseController.extend("ui5ns.ui5.controller.admin.CadastroDiferencasTaxPackage", {
			onInit: function () {
				var that = this;
				
				this._dadosObjetos = [
					{
						id: "1",
						tipo: "Permanentes",
						nome: "Diferença 1"
					},
					{
						id: "2",
						tipo: "Temporárias",
						nome: "Diferença 2"
					}
				];
				
				this.byId("paginaListagem").addEventDelegate({
					onAfterShow: function (oEvent) {
						
						that.setModel(new sap.ui.model.json.JSONModel({
							objetos: that._dadosObjetos
						}));
					}	
				});
				
				this.byId("paginaObjeto").addEventDelegate({
					onAfterShow: function (oEvent) {
						if (oEvent.data.path) {
							var oSelectedObject = that.getModel().getObject(oEvent.data.path);
							
							// É preciso pegar o id do objeto selecionado e enviar uma request
							// para preencher as informações do mesmo
							that._idObjetoSelecionado = oSelectedObject.id;
							//that.byId("selectPais").setSelectedKey(oSelectedObject.id);
							that.byId("inputNomeAliquota").setValue(oSelectedObject.nome);
						}
					},
					
					onAfterHide: function (oEvent) {
						// Limpar campos do formulário após sair da página
						var idDiv = that.byId("paginaObjeto").getDomRef().id;
						
						$("#" + idDiv + " input").val("");
						$("#" + idDiv + " select").val("");
						
						that._idObjetoSelecionado = "";
					}
				});
			},
			
			onNovoObjeto: function (oEvent) {
				//this.byId("myNav").to(this.byId("paginaObjeto"), "flip");
				//this._abrirModal();
				
				var oForm = new sap.ui.layout.form.Form({
					editable: true
				}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
					singleContainerFullSize: false
				}));
				
				var oFormContainer = new sap.ui.layout.form.FormContainer();
				
				var oFormElement = new sap.ui.layout.form.FormElement({
					label: "Tipo"
				}).addField(new sap.m.Select().addItem(new sap.ui.core.Item({
					text: "Permanente"
				})).addItem(new sap.ui.core.Item({
					text: "Temporária"
				})));
				
				oFormContainer.addFormElement(oFormElement);
				
				oFormElement = new sap.ui.layout.form.FormElement({
					label: "Nome"
				}).addField(new sap.m.Input());
				
				oFormContainer.addFormElement(oFormElement);
				
				oForm.addFormContainer(oFormContainer);
				
				var dialog = new sap.m.Dialog({
					title: "Nova Diferença",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "salvar",
						press: function () {
							sap.m.MessageToast.show("Inserir diferença");
							dialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "sair",
						press: function () {
							dialog.close();
						}.bind(this)
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});

				// to get access to the global model
				this.getView().addDependent(dialog);
				
				dialog.open();
			},
			
			onAbrirObjeto: function (oEvent) {
				//this._abrirModal(oEvent.getSource().getBindingContext().getObject().nome);
				var oForm = new sap.ui.layout.form.Form({
					editable: true
				}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
					singleContainerFullSize: false
				}));
				
				var oFormContainer = new sap.ui.layout.form.FormContainer();
				
				var oFormElement = new sap.ui.layout.form.FormElement({
					label: "Tipo"
				}).addField(new sap.m.Select().addItem(new sap.ui.core.Item({
					text: "Permanente"
				})).addItem(new sap.ui.core.Item({
					text: "Temporária"
				})));
				
				oFormContainer.addFormElement(oFormElement);
				
				oFormElement = new sap.ui.layout.form.FormElement({
					label: "Nome"
				}).addField(new sap.m.Input());
				
				oFormContainer.addFormElement(oFormElement);
				
				oForm.addFormContainer(oFormContainer);
				
				var dialog = new sap.m.Dialog({
					title: "Editar Diferença",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "salvar",
						press: function () {
							sap.m.MessageToast.show("Inserir diferença");
							dialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "sair",
						press: function () {
							dialog.close();
						}.bind(this)
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});

				// to get access to the global model
				this.getView().addDependent(dialog);
				
				dialog.open();
			},
			
			onSalvar: function (oEvent) {
				var sIdObjetoSelecionado = this._idObjetoSelecionado;
				if (sIdObjetoSelecionado) {
					alert("Atualizar alterações");
				}
				else {
					alert("Inserir novo objeto");
					
					// Novo objeto
					var id = jQuery.now().toString();
					var nome = this.byId("inputNomeAliquota").getValue();
					
					this._dadosObjetos.push({
						id: id,
						nome: nome
					});
				}
				
				this.byId("myNav").to(this.byId("paginaListagem"), "flip");
			},
			
			onCancelar: function (oEvent) {
				this.byId("myNav").to(this.byId("paginaListagem"), "flip");
			}
		});
	}
);*/