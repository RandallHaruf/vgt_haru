sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, Constants,Utils,NodeAPI) {
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
					text: that.getResourceBundle().getText("viewGeralTipo")
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
						text: that.getResourceBundle().getText("viewRelatorioNome")
					}).addStyleClass("sapMLabelRequired"))
					.addField(oInputNome);

				oFormContainer.addFormElement(oFormElement);
				
				var oCheckBox = new sap.m.CheckBox({
					text: that.getResourceBundle().getText("viewCadastroDiferencaIndicadorDuplicavel")
				});
				
				oFormElement = new sap.ui.layout.form.FormElement().addField(oCheckBox);
				
				oFormContainer.addFormElement(oFormElement);

				oForm.addFormContainer(oFormContainer);

				var dialog = new sap.m.Dialog({
					title: that.getResourceBundle().getText("viewGeralNovaDiferenca"),
					content: oForm,
					beginButton: new sap.m.Button({
						text: that.getResourceBundle().getText("viewGeralSalvar"),
						press: function () {
							//sap.m.MessageToast.show("Inserir diferença: " + oInputNome.getValue());

							if (!oInputNome.getValue() || !oSelectTipo.getSelectedKey()) {
								sap.m.MessageBox.warning(that.getResourceBundle().getText("ViewGeralOrbigatorio"), {
									title: that.getResourceBundle().getText("viewResumoTrimestreJSTEXTSAviso")
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
										indDuplicavel: oCheckBox.getSelected(),
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
						text:  that.getResourceBundle().getText("viewGeralSair"),
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
				var bDuplicavel = !!this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()).ind_duplicavel;

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
					text:  that.getResourceBundle().getText("viewGeralTipo")
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
					text: that.getResourceBundle().getText("viewRelatorioNome")
				}).addStyleClass("sapMLabelRequired"));

				var oInputNome = new sap.m.Input({
					value: sNomeCorrente
				});

				oFormElement.addField(oInputNome);

				oFormContainer.addFormElement(oFormElement);
				
				var oCheckBox = new sap.m.CheckBox({
					selected: bDuplicavel,
					text: that.getResourceBundle().getText("viewCadastroDiferencaIndicadorDuplicavel")
				});
				
				oFormElement = new sap.ui.layout.form.FormElement().addField(oCheckBox);
				
				oFormContainer.addFormElement(oFormElement);

				oForm.addFormContainer(oFormContainer);

				var dialog = new sap.m.Dialog({
					title: that.getResourceBundle().getText("viewGeralEditarDiferenca"),
					content: oForm,
					beginButton: new sap.m.Button({
						text: that.getResourceBundle().getText("viewGeralSalvar"),
						press: function () {
							//sap.m.MessageToast.show("Atualizar diferença: " + nome);

							if (!oInputNome.getValue() || !oSelectTipo.getSelectedKey()) {
								sap.m.MessageBox.warning(that.getResourceBundle().getText("ViewGeralOrbigatorio"), {
									title: that.getResourceBundle().getText("viewResumoTrimestreJSTEXTSAviso")
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
										indDuplicavel: oCheckBox.getSelected(),
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
						text:  that.getResourceBundle().getText("viewGeralSair"),
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
/*
							jQuery.ajax(Constants.urlBackend + "DiferencaOpcao/" + iIdDiferenca, {
								type: "DELETE",
								xhrFields: {
									withCredentials: true
								},
								crossDomain: true,
								success: function (response) {
									that._carregarObjetos();
								}
							});*/
							NodeAPI.pExcluirRegistro("DiferencaOpcao", iIdDiferenca)
								.then(function (res) {
									console.log(res);
									that._carregarObjetos();
								})
								.catch(function (err) {
									console.log(err);
									/*if (err.responseJSON) {
										alert((err.responseJSON.error.code + ' - ' + err.responseJSON.error.message);
									}
									else {
										alert(err.message);
									}*/
									that.showError(err);
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
				that.setBusy(that.byId("tabelaObjetos"), true);
				that.getModel().setProperty("/DominioDiferencaTipo", null);
				jQuery.ajax(Constants.urlBackend + "DominioDiferencaTipo", {
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						var aResponse = response;
						for (var i = 0, length = aResponse.length; i < length; i++) {
							aResponse[i]["tipo"] = Utils.traduzDominioDiferencaTipo(aResponse[i]["id_dominio_diferenca_tipo"],that);
						}
						that.getModel().setProperty("/DominioDiferencaTipo", aResponse);						
						//that.getModel().setProperty("/DominioDiferencaTipo", response);
					}
				});
				that.getModel().setProperty("/objetos", null);
				jQuery.ajax(Constants.urlBackend + "DeepQuery/DiferencaOpcao", {
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						
						var aResponse = response;
						for (var i = 0, length = aResponse.length; i < length; i++) {
							aResponse[i]["tipo"] = Utils.traduzDominioDiferencaTipo(aResponse[i]["fk_dominio_diferenca_tipo.id_dominio_diferenca_tipo"],that);
						}
						that.setBusy(that.byId("tabelaObjetos"), false);
						that.getModel().setProperty("/objetos", aResponse);
					
						//that.getModel().setProperty("/objetos", response);
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