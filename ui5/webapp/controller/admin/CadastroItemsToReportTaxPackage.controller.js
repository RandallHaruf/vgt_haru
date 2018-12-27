sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/Validador"
	],
	function (BaseController, Constants, Validador) {
		return BaseController.extend("ui5ns.ui5.controller.admin.CadastroItemsToReportTaxPackage", {

			/* Métodos a implementar */
			onDesabilitar: function (oEvent) {
				var nome = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()).pergunta;
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(that.getResourceBundle().getText("ViewGeralDesabilitarPergunta"), {
					title: "Confirm",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							sap.m.MessageToast.show(that.getResourceBundle().getText("viewGeralToastDesabilitarPergunta") + nome);
						}
					}
				});
			},

			onExcluir: function (oEvent) {
				var that = this;

				var iIdExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath())[this._nomeColunaIdentificadorNaListagemObjetos];

				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(that.getResourceBundle().getText("ViewGeralCerteza"), {
					title: "Confirm",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							//sap.m.MessageToast.show("Excluir Pergunta: " + nome);	

							jQuery.ajax(Constants.urlBackend + "ItemToReport/" + iIdExcluir, {
								type: "DELETE",
								xhrFields: {
									withCredentials: true
								},
								crossDomain: true,
								dataType: "json",
								success: function (response) {
									that._carregarObjetos();
								}
							});
						}
					}
				});
			},

			_nomeColunaIdentificadorNaListagemObjetos: "id_item_to_report",

			_validarFormulario: function () {

				var sIdFormulario = "#" + this.byId("formularioObjeto").getDomRef().id;

				var oValidacao = Validador.validarFormularioAdmin({
					aInputObrigatorio: jQuery(sIdFormulario + " textarea[aria-required=true]")
				});

				if (!oValidacao.formularioValido) {
					sap.m.MessageBox.warning(oValidacao.mensagem, {
						title: "Aviso"
					});
				}

				return oValidacao.formularioValido;
			},

			_carregarObjetos: function () {
				/*this.getModel().setProperty("/objetos", [{
					id: "1",
					pergunta: "Item to Report 1"
				}, {
					id: "2",
					pergunta: "Item to Report 2"
				}]);*/

				var that = this;

				jQuery.ajax(Constants.urlBackend + "ItemToReport", {
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
			},

			_carregarCamposFormulario: function () {
				/*var that = this;
				
				jQuery.ajax("https://3cmwthhrqctaqsr8-app-nodejs.cfapps.us10.hana.ondemand.com/node/DominioPais", {
					type: "GET",
					dataType: "json",
					success: function (response) {
						response.unshift({ id: 0, nome: "" });
						that.getModel().setProperty("/DominioPais", response);
					}
				});
				
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
				/*this.getModel().setProperty("/objeto", {
					id: iIdObjeto,
					pergunta: "Texto da Pergunta"
				});*/

				var that = this;

				jQuery.ajax(Constants.urlBackend + "ItemToReport/" + iIdObjeto, {
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						var oObjeto = response[0];
						var obj = {
							pergunta: oObjeto["pergunta"],
							flagSimNao: !!oObjeto["flag_sim_nao"],
							flagAno: !!oObjeto["flag_ano"]
						};

						that.getModel().setProperty("/objeto", obj);
					}
				});
			},

			_limparFormulario: function () {
				this.getModel().setProperty("/objeto", {});
			},

			_atualizarObjeto: function (iIdObjeto) {
				/*sap.m.MessageToast.show("Atualizar Objeto " + iIdObjeto);
				this._navToPaginaListagem();*/

				var that = this;
				that.byId("btnCancelar").setEnabled(false);
				that.byId("btnSalvar").setEnabled(false);
				that.setBusy(that.byId("btnSalvar"), true);

				var obj = this.getModel().getProperty("/objeto");

				jQuery.ajax(Constants.urlBackend + "ItemToReport/" + iIdObjeto, {
					type: "PUT",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: {
						pergunta: obj.pergunta,
						flagSimNao: obj.flagSimNao,
						flagAno: obj.flagAno
					},
					success: function (response) {
						that.byId("btnCancelar").setEnabled(true);
						that.byId("btnSalvar").setEnabled(true);
						that.setBusy(that.byId("btnSalvar"), false);
						that._navToPaginaListagem();
					}
				});
			},

			_inserirObjeto: function () {
				/*sap.m.MessageToast.show("Inserir Objeto");
				this._navToPaginaListagem();	*/
				var that = this;
				that.byId("btnCancelar").setEnabled(false);
				that.byId("btnSalvar").setEnabled(false);
				that.setBusy(that.byId("btnSalvar"), true);

				var obj = this.getModel().getProperty("/objeto");

				jQuery.ajax(Constants.urlBackend + "ItemToReport", {
					type: "POST",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: {
						pergunta: obj.pergunta,
						flagSimNao: obj.flagSimNao,
						flagAno: obj.flagAno
					},
					success: function (response) {
						that.byId("btnCancelar").setEnabled(true);
						that.byId("btnSalvar").setEnabled(true);
						that.setBusy(that.byId("btnSalvar"), false);
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