sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, NodeAPI, Validador, Utils) {
		return BaseController.extend("ui5ns.ui5.controller.admin.CadastroUsuario", {

			/* Métodos a implementar */
			onTextSearch: function (oEvent) {
				var sQuery = oEvent ? oEvent.getParameter("query") : null;
				this._oTxtFilter = null;

				if (sQuery !== null) {
					this._oTxtFilter = new sap.ui.model.Filter([
						new sap.ui.model.Filter("pais", sap.ui.model.FilterOperator.Contains, sQuery)
					], false);
				}

				this.getView().getModel().setProperty("/filterValue", sQuery);

				if (oEvent && this._oTxtFilter) {
					this.byId("tablePais").getBinding("rows").filter(this._oTxtFilter, "Application");
				}
			},

			onDesabilitar: function (oEvent) {
				var nome = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()).nome;
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(that.getResourceBundle().getText("ViewGeralDesabilitarNomeTaxa"), {
					title: "Info",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							sap.m.MessageToast.show(that.getResourceBundle().getText("viewGeralToastDesabilitarNameOfTax") + nome);
						}
					}
				});
			},

			onExcluir: function (oEvent) {
				var that = this;
				var idExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath())[this._nomeColunaIdentificadorNaListagemObjetos];

				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(that.getResourceBundle().getText("ViewGeralExcluirNomeTaxa"), {
					title: "Info",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							NodeAPI.excluirRegistro("NameOfTax", idExcluir, function (response) {
								that._carregarObjetos();
							});
						}
					}
				});
			},

			onTrocarClassification: function (oEvent) {
				this.getModel().setProperty("/TaxCategory", {});
				this.getModel().setProperty("/Tax", {});

				var idClassification = oEvent.getSource().getSelectedKey();

				if (idClassification) {
					this._carregarCategory(idClassification);
				}
			},

			onTrocarCategory: function (oEvent) {
				this.getModel().setProperty("/Tax", {});

				var idCategory = oEvent.getSource().getSelectedKey();

				if (idCategory) {
					this._carregarTax(idCategory);
				}
			},

			_nomeColunaIdentificadorNaListagemObjetos: "id_usuario",

			_validarFormulario: function () {

				var sIdFormulario = "#" + this.byId("formularioObjeto").getDomRef().id;

				var oValidacao = Validador.validarFormularioAdmin({
					aInputObrigatorio: jQuery(sIdFormulario + " input[aria-required=true]"),
					aDropdownObrigatorio: [
						this.byId("selectClassification"),
						this.byId("selectCategory"),
						this.byId("selectTax")
					]
				});

				if (!oValidacao.formularioValido) {
					sap.m.MessageBox.warning(oValidacao.mensagem, {
						title: "Aviso"
					});
				}

				return oValidacao.formularioValido;
			},

			_carregarObjetos: function () {

				var that = this;
				that.getModel().setProperty("/objetos", null);

				that.setBusy(that.byId("paginaListagem"), true);
				NodeAPI.listarRegistros("DeepQuery/Usuario", function (response) {
					var aResponse = response;
					/*for (var i = 0, length = aResponse.length; i < length; i++) {
						aResponse[i]["classification"] = Utils.traduzDominioTaxClassification(aResponse[i]["id_dominio_tax_classification"],that);
					}*/
					that.getModel().setProperty("/objetos", aResponse);
					that.setBusy(that.byId("paginaListagem"), false);
				});

			},

			_carregarCamposFormulario: function () {
				var that = this;

				/*NodeAPI.listarRegistros("DominioTaxClassification", function (response) {
					response.unshift({ "id_dominio_tax_classification": null, "classification": ""  });
						var aResponse = response;
						for (var i = 0, length = aResponse.length; i < length; i++) {
							aResponse[i]["classification"] = Utils.traduzDominioTaxClassification(aResponse[i]["id_dominio_tax_classification"],that);
						}
						that.getModel().setProperty("/DominioTaxClassification", Utils.orderByArrayParaBox(aResponse,"classification"));						
					//that.getModel().setProperty("/DominioTaxClassification", response);
				});*/

				NodeAPI.listarRegistros("DominioAcessoUsuario", function (response) {
					response = Utils.orderByArrayParaBox(response,"descricao");
					that.getModel().setProperty("/DominioAcessoUsuario", response);
				});
				NodeAPI.listarRegistros("DominioModulo", function (response) {
					response = Utils.orderByArrayParaBox(response,"modulo");
					that.getModel().setProperty("/DominioModulo", response);
				});
				NodeAPI.listarRegistros("Empresa", function (response) {
					response = Utils.orderByArrayParaBox(response,"nome");
					that.getModel().setProperty("/Empresas", response);
				});
			},

			_carregarCategory: function (sIdClassification) {
				var that = this;

				NodeAPI.listarRegistros("TaxCategory?classification=" + sIdClassification, function (response) {
					response.unshift({
						"id_tax_category": null,
						"category": ""
					});
					that.getModel().setProperty("/TaxCategory", Utils.orderByArrayParaBox(response, "category"));
				});
			},

			_carregarTax: function (sIdCategory) {
				var that = this;

				NodeAPI.listarRegistros("Tax?category=" + sIdCategory, function (response) {
					response.unshift({
						"id_tax": null,
						"tax": ""
					});
					that.getModel().setProperty("/Tax", Utils.orderByArrayParaBox(response, "tax"));
				});
			},

			_carregarObjetoSelecionado: function (iIdObjeto) {
				/*this.getModel().setProperty("/objeto", {
					id: iIdObjeto,
					nome: "Name of Tax"
				});*/

				var that = this;

				that.setBusy(that.byId("formularioObjeto"), true);

				NodeAPI.lerRegistro("Usuario", iIdObjeto, function (response) {
					that.getModel().setProperty("/objeto", response);

					//that._carregarDominioTipoAcesso(that);
					that.setBusy(that.byId("formularioObjeto"), false);
				});
			},
			_limparFormulario: function () {
				
				// Limpar outras propriedades do modelo
			},

			_atualizarObjeto: function (sIdObjeto) {
				/*sap.m.MessageToast.show("Atualizar Objeto");
				this._navToPaginaListagem();*/

				var that = this;
				that.byId("btnCancelar").setEnabled(false);
				that.byId("btnSalvar").setEnabled(false);
				that.setBusy(that.byId("btnSalvar"), true);

				var obj = this.getModel().getProperty("/objeto");

				NodeAPI.atualizarRegistro("NameOfTax", sIdObjeto, {
					nameOfTax: obj.nameOfTax,
					fkTax: obj.tax,
					idPaises: JSON.stringify(that._getIdsPaisesSelecionados())
				}, function (response) {
					that.byId("btnCancelar").setEnabled(true);
					that.byId("btnSalvar").setEnabled(true);
					that.setBusy(that.byId("btnSalvar"), false);
					that._navToPaginaListagem();
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

				NodeAPI.criarRegistro("NameOfTax", {
					indDefault: true,
					nameOfTax: obj.nameOfTax,
					fkTax: obj.tax,
					idPaises: JSON.stringify(that._getIdsPaisesSelecionados())
				}, function (response) {
					that.byId("btnCancelar").setEnabled(true);
					that.byId("btnSalvar").setEnabled(true);
					that.setBusy(that.byId("btnSalvar"), false);
					that._navToPaginaListagem();
				});
			},

			_getIdsPaisesSelecionados: function () {
				var aIds = [];

				var aDominioPais = this.getModel().getProperty("/DominioPais");

				for (var i = 0; i < aDominioPais.length; i++) {

					var oPais = aDominioPais[i];

					if (oPais.selecionado) {
						aIds.push(oPais["id_dominio_pais"]);
					}
				}

				return aIds;
			},

			_resolverVinculoPais: function (response) {
				var aDominioPais = this.getModel().getProperty("/DominioPais");

				for (var i = 0; i < aDominioPais.length; i++) {

					var oPais = aDominioPais[i];

					//var aux = response.find(x => x["fk_dominio_pais.id_dominio_pais"] === oPais["id_dominio_pais"]);
					var aux = response.find(function (x) {
						return x["fk_dominio_pais.id_dominio_pais"] === oPais["id_dominio_pais"];
					});

					if (aux) {
						oPais.selecionado = true;
					}

					aDominioPais.sort(function (x, y) {
						// true values first
						return (x.selecionado === y.selecionado) ? 0 : x.selecionado ? -1 : 1;
						// false values first
						// return (x === y)? 0 : x? 1 : -1;
					});

				}
			},

			_navToPaginaListagem: function () {
				this.byId("myNav").to(this.byId("paginaListagem"), "flip");
			},

			/* Métodos fixos */
			onInit: function () {
				var that = this;

				that.setModel(new sap.ui.model.json.JSONModel({
					paises: [],
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