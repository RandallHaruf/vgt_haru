sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, Constants, Validador, Utils, NodeAPI) {
		return BaseController.extend("ui5ns.ui5.controller.admin.CadastroCategoryTTC", {

			/* Métodos a implementar */
			onDesabilitar: function (oEvent) {
				var nome = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()).nome;
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(that.getResourceBundle().getText("viewGeralCertezaDesabilitarCategoria"), {
					title: "Info",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							sap.m.MessageToast.show(this.getResourceBundle().getText("viewAdminCadastroCategoriaTTCDesabilitarCategory") + nome);
						}
					}
				});
			},

			onExcluir: function (oEvent) {
				var that = this;
				//var nome = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()).nome;
				var idExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath())[this._nomeColunaIdentificadorNaListagemObjetos];

				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(that.getResourceBundle().getText("ViewGeralExcluirCategoriaC"), {
					title: "Info",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							//sap.m.MessageToast.show("Excluir Category: " + nome);	

							NodeAPI.pExcluirRegistro("TaxCategory", idExcluir)
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

							/*jQuery.ajax(Constants.urlBackend + "TaxCategory/" + idExcluir, {
								type: "DELETE",
								xhrFields: {
									withCredentials: true
								},
								crossDomain: true,
								dataType: "json",
								success: function (response) {
									that._carregarObjetos();
								}
							});*/
						}
					}
				});
			},

			_nomeColunaIdentificadorNaListagemObjetos: "id_tax_category",

			_validarFormulario: function () {

				var sIdFormulario = "#" + this.byId("formularioObjeto").getDomRef().id;

				var oValidacao = Validador.validarFormularioAdmin({
					aInputObrigatorio: jQuery(sIdFormulario + " input[aria-required=true]"),
					aDropdownObrigatorio: [
						this.byId("selectClassification")
					]
				});

				if (!oValidacao.formularioValido) {
					sap.m.MessageBox.warning(oValidacao.mensagem, {
						title: "Info"
					});
				}

				return oValidacao.formularioValido;
			},

			_carregarObjetos: function () {

				var that = this;
				that.getModel().setProperty("/objetos",null);
				that.setBusy(that.byId("tabelaObjetos"), true);
				jQuery.ajax(Constants.urlBackend + "DeepQuery/TaxCategory", {
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						var aResponse = response;
						for (var i = 0, length = aResponse.length; i < length; i++) {
							aResponse[i]["classification"] = Utils.traduzDominioTaxClassification(aResponse[i]["id_dominio_tax_classification"],that);
						}
						that.setBusy(that.byId("tabelaObjetos"), false);
						that.getModel().setProperty("/objetos", aResponse);						
					}
				});
			},

			_carregarCamposFormulario: function () {
				var that = this;

				jQuery.ajax(Constants.urlBackend + "DominioTaxClassification", {
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						response.unshift({
							id: 0,
							nome: ""
						});
						var aResponse = response;
						for (var i = 0, length = aResponse.length; i < length; i++) {
							aResponse[i]["classification"] = Utils.traduzDominioTaxClassification(aResponse[i]["id_dominio_tax_classification"],that);
						}
						that.getModel().setProperty("/DominioTaxClassification", aResponse);							
						//that.getModel().setProperty("/DominioTaxClassification", response);
					}
				});

				/*
				jQuery.ajax("https://3cmwthhrqctaqsr8-app-nodejs.cfapps.us10.hana.ondemand.com/node/DominioPaisStatus", {
					type: "GET",
					dataType: "json",
					success: function (response) {
						response.unshift({ id: 0, descricao: "" });
						that.getModel().setProperty("/DominioPaisStatus", response);
					}
				});*/
			},

			_carregarObjetoSelecionado: function (iIdObjeto) {
				
				var that = this;
				that.setBusy(that.byId("paginaObjeto"),true);

				jQuery.ajax(Constants.urlBackend + "TaxCategory/" + iIdObjeto, {
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						var oObjeto = response[0];
						var obj = {
							category: oObjeto["category"],
							fkDominioTaxClassification: oObjeto["fk_dominio_tax_classification.id_dominio_tax_classification"]
						};
						
						that.setBusy(that.byId("paginaObjeto"),false);
						that.getModel().setProperty("/objeto", obj);
					}
				});
			},

			_limparFormulario: function () {
				this.getModel().setProperty("/objeto", {});
			},

			_atualizarObjeto: function (iIdObjeto) {
				/*sap.m.MessageToast.show("Atualizar Objeto");
				this._navToPaginaListagem();*/

				var that = this;

				that.byId("btnCancelar").setEnabled(false);	
				that.byId("btnSalvar").setEnabled(false);	
				that.setBusy(that.byId("btnSalvar"),true);

				var obj = this.getModel().getProperty("/objeto");

				jQuery.ajax(Constants.urlBackend + "TaxCategory/" + iIdObjeto, {
					type: "PUT",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: {
						category: obj.category,
						fkDominioTaxClassification: obj.fkDominioTaxClassification
					},
					success: function (response) {
						that.byId("btnCancelar").setEnabled(true);	
						that.byId("btnSalvar").setEnabled(true);	
						that.setBusy(that.byId("btnSalvar"),false);						
						that._navToPaginaListagem();
					}
				});
			},

			_inserirObjeto: function () {
				/*sap.m.MessageToast.show("Inserir Objeto");
				this._navToPaginaListagem();*/

				var that = this;

				that.byId("btnCancelar").setEnabled(false);	
				that.byId("btnSalvar").setEnabled(false);	
				that.setBusy(that.byId("btnSalvar"),true);

				var obj = this.getModel().getProperty("/objeto");

				jQuery.ajax(Constants.urlBackend + "TaxCategory", {
					type: "POST",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: {
						category: obj.category,
						fkDominioTaxClassification: obj.fkDominioTaxClassification
					},
					success: function (response) {

						that.byId("btnCancelar").setEnabled(true);	
						that.byId("btnSalvar").setEnabled(true);	
						that.setBusy(that.byId("btnSalvar"),false);
						
						that._navToPaginaListagem();
					}
				});
			},

			_navToPaginaListagem: function () {
				this.byId("myNav").to(this.byId("paginaListagem"), "flip");
			},

			/* Métodos fixos */
			onInit: function () {
				var that = this;

				that.setModel(new sap.ui.model.json.JSONModel({
					//DominioPais: [],
					//DominioPaisStatus: [],
					objetos: [],
					objeto: {},
					isUpdate: false
				}));

				this.byId("paginaListagem").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarObjetos();
					}
				});

				this.byId("paginaObjeto").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarCamposFormulario();

						if (oEvent.data.path) {
							var id = that.getModel().getObject(oEvent.data.path)[that._nomeColunaIdentificadorNaListagemObjetos];

							that.getModel().setProperty("/isUpdate", true);
							that.getModel().setProperty("/idObjeto", id);

							that._carregarObjetoSelecionado(id);
						} else {
							that.getModel().setProperty("/isUpdate", false);
						}
					},

					onAfterHide: function (oEvent) {
						that._limparFormulario();
					}
				});
			},

			onNovoObjeto: function (oEvent) {
				this.byId("myNav").to(this.byId("paginaObjeto"), "flip");
			},

			onAbrirObjeto: function (oEvent) {
				this.byId("myNav").to(this.byId("paginaObjeto"), "flip", {
					path: oEvent.getSource().getBindingContext().getPath()
				});
			},

			onSalvar: function (oEvent) {
				if (this._validarFormulario()) {
					if (this.getModel().getProperty("/isUpdate")) {
						this._atualizarObjeto(this.getModel().getProperty("/idObjeto"));
					} else {
						this._inserirObjeto();
					}
				}
			},

			onCancelar: function (oEvent) {
				this.byId("myNav").to(this.byId("paginaListagem"), "flip");
			}
		});
	}
);

/*sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController"
	],
	function (BaseController) {
		return BaseController.extend("ui5ns.ui5.controller.admin.CadastroCategoryTTC", {
			onInit: function () {
				var that = this;
				
				this._dadosObjetos = [
					{
						id: "1",
						classification: "Tax Borne",
						nome: "Tax on Profits"
					},
					{
						id: "2",
						classification: "Tax Collected",
						nome: "Other taxes"
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
				this.byId("myNav").to(this.byId("paginaObjeto"), "flip");
			},
			
			onAbrirObjeto: function (oEvent) {
				this.byId("myNav").to(this.byId("paginaObjeto"), "flip", {
					path: oEvent.getSource().getBindingContext().getPath()
				});
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