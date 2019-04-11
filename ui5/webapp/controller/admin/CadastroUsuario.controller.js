sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/model/Constants"
	],
	function (BaseController, NodeAPI, Validador, Utils, Constants) {
		return BaseController.extend("ui5ns.ui5.controller.admin.CadastroUsuario", {

			/* Métodos a implementar */
			onTextSearch: function (oEvent) {
				var sQuery = oEvent ? oEvent.getParameter("query") : null;
				this._oTxtFilter = null;

				if (sQuery !== null) {
					this._oTxtFilter = new sap.ui.model.Filter([
						new sap.ui.model.Filter("nome", sap.ui.model.FilterOperator.Contains, sQuery)
					], false);
				}

				this.getView().getModel().setProperty("/filterValue", sQuery);

				if (oEvent && this._oTxtFilter) {
					this.byId("tableEmpresa").getBinding("rows").filter(this._oTxtFilter, "Application");
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

			_nomeColunaIdentificadorNaListagemObjetos: "id_usuario",

			_validarFormulario: function () {

				var sIdFormulario = "#" + this.byId("formularioObjeto").getDomRef().id;

				var oValidacao = Validador.validarFormularioAdmin({
					aInputObrigatorio: jQuery(sIdFormulario + " input[aria-required=true]"),
					aDropdownObrigatorio: [
						this.byId("selectTipoAcesso")
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

				NodeAPI.listarRegistros("DominioAcessoUsuario", function (response) {
					Utils.orderByArrayParaBox(response, "descricao");
					response.unshift({});
					that.getModel().setProperty("/DominioAcessoUsuario", response);
				});
				
				/*NodeAPI.listarRegistros("DominioModulo", function (response) {
					Utils.orderByArrayParaBox(response, "modulo");
					that.getModel().setProperty("/DominioModulo", response);
					
					var idUsuario = that.getModel().getProperty("/idObjeto");
					
					NodeAPI.listarRegistros("DeepQuery/UsuarioModulo?idUsuario=" + idUsuario, function (resposta) {

						for (var i = 0; i < response.length; i++) {
							var aux = resposta.find(function (x) {
								return (x["fk_dominio_modulo.id_dominio_modulo"] === response[i]["id_dominio_modulo"]);
							});
							if (aux) {
								response[i]["marcado"] = true;
							}
						}
						response = Utils.orderByArrayParaBox(response, "modulo");
						that.getModel().setProperty("/DominioModulo", response);
					});
				});
				
				NodeAPI.listarRegistros("Empresa", function (response) {
					Utils.orderByArrayParaBox(response, "nome");
					that.getModel().setProperty("/Empresas", response);
				});*/
				
				return new Promise(function (resolve, reject) {
					Promise.all([
							NodeAPI.pListarRegistros("DominioModulo"),
							NodeAPI.pListarRegistros("Empresa?full=true")
						])
						.then(function (res) {
							Utils.orderByArrayParaBox(res[0], "modulo");
							that.getModel().setProperty("/DominioModulo", res[0]);
							Utils.orderByArrayParaBox(res[1], "nome");
							that.getModel().setProperty("/Empresas", res[1]);
							resolve();
						})	
						.catch(function (err) {
							reject(err);
						});
				});
			},

			_carregarObjetoSelecionado: function (iIdObjeto) {
				/*this.getModel().setProperty("/objeto", {
					id: iIdObjeto,
					nome: "Name of Tax"
				});*/

				var that = this;

				that.setBusy(that.byId("formularioObjeto"), true);
				that.getModel().setProperty("/idObjeto", iIdObjeto);
				NodeAPI.lerRegistro("Usuario", iIdObjeto, function (response) {
					response.ind_ativo = response.ind_ativo ? true : false;
					that.getModel().setProperty("/objeto", response);

					//that._carregarDominioTipoAcesso(that);
					that.setBusy(that.byId("formularioObjeto"), false);
				});
				
				var promise1 = NodeAPI.pLerRegistro("Usuario", iIdObjeto);
				var promise2 = NodeAPI.pListarRegistros("RelUsuarioModulo?fkUsuario=" + iIdObjeto);
				var promise3 = NodeAPI.pListarRegistros("RelUsuarioEmpresa?fkUsuario=" + iIdObjeto);
				Promise.all([
						promise1,
						promise2,
						promise3
					])
					.then(function (aResponse) {
						var Usuario = JSON.parse(aResponse[0])[0];
						Usuario.ind_ativo = Usuario.ind_ativo ? true : false;
						that.getModel().setProperty("/objeto", Usuario);
						
						var aModulosUsuario = aResponse[1];
						var aEmpresasUsuario = aResponse[2];
						
						var aModulos = that.getModel().getProperty("/DominioModulo");
						var aEmpresas = that.getModel().getProperty("/Empresas");
						
						for(var i = 0; i < aModulos.length; i++){
							for(var j = 0; j < aModulosUsuario.length; j++) {
								if (aModulos[i].id_dominio_modulo == aModulosUsuario[j]["fk_dominio_modulo.id_dominio_modulo"]) {
									aModulos[i].selecionado = true;
								}
							}
						}
						for(var i = 0; i < aEmpresas.length; i++){
							for(var j = 0; j < aEmpresasUsuario.length; j++) {
								if (aEmpresas[i].id_empresa == aEmpresasUsuario[j]["fk_empresa.id_empresa"]) {
									aEmpresas[i].selecionado = true;
								}
							}
						}
						
						that._resolverCheckbox(that);
						
						that.getModel().refresh();
						
						
						
						that.setBusy(that.byId("formularioObjeto"), false);
					});
			},
			
			_limparFormulario: function () {
				this.getModel().setProperty("/objeto", {});
				this.getModel().setProperty("/DominioAcessoUsuario", []);
				this.getModel().setProperty("/DominioModulo", []);
				this.getModel().setProperty("/Empresas", []);
			},

			_atualizarObjeto: function (sIdObjeto) {
				/*sap.m.MessageToast.show("Atualizar Objeto");
				this._navToPaginaListagem();*/

				var that = this;
				that.byId("btnCancelar").setEnabled(false);
				that.byId("btnSalvar").setEnabled(false);
				that.setBusy(that.byId("btnSalvar"), true);

				var aModulos = that.getModel().getProperty("/DominioModulo");
				var ModulosSelecionados = [];
				for(var i = 0; i < aModulos.length; i++){
					if (aModulos[i].selecionado == true) {
						ModulosSelecionados.push(aModulos[i]);
					}
				}
				
				var aEmpresas = that.getModel().getProperty("/Empresas");
				var EmpresasSelecionadas = [];
				for(var i = 0; i < aEmpresas.length; i++){
					if (aEmpresas[i].selecionado == true) {
						EmpresasSelecionadas.push(aEmpresas[i]);
					}
				}

				var obj = this.getModel().getProperty("/objeto");

				NodeAPI.atualizarRegistro("Usuario", sIdObjeto, {
					nome: obj.nome,
					email: obj.email,
					contato: obj.contato,
					user: obj.user,
					indAtivo: obj["ind_ativo"],
					fkDominioTipoAcesso: obj["fk_dominio_tipo_acesso.id_tipo_acesso"],
					emailGestor: obj.email_gestor,
					modulos: ModulosSelecionados,
					empresas: EmpresasSelecionadas
				}
				, function (response) {
					that.byId("btnCancelar").setEnabled(true);
					that.byId("btnSalvar").setEnabled(true);
					that.setBusy(that.byId("btnSalvar"), false);
					that._navToPaginaListagem();
				});
			},

			_inserirObjeto: function () {
				var that = this,
					obj = this.getModel().getProperty("/objeto");
				
				var finalizarProcesso = function () {
					that.byId("btnCancelar").setEnabled(true);
					that.byId("btnSalvar").setEnabled(true);
					that.setBusy(that.byId("btnSalvar"), false);
				};
				
				that.byId("btnCancelar").setEnabled(false);
				that.byId("btnSalvar").setEnabled(false);
				that.setBusy(that.byId("btnSalvar"), true);
				
				var aModulos = that.getModel().getProperty("/DominioModulo");
				var ModulosSelecionados = [];
				for(var i = 0; i < aModulos.length; i++){
					if (aModulos[i].selecionado == true) {
						ModulosSelecionados.push(aModulos[i]);
					}
				}
				
				var aEmpresas = that.getModel().getProperty("/Empresas");
				var EmpresasSelecionadas = [];
				for(var i = 0; i < aEmpresas.length; i++){
					if (aEmpresas[i].selecionado == true) {
						EmpresasSelecionadas.push(aEmpresas[i]);
					}
				}

				NodeAPI.pCriarRegistro("Usuario", {
						nome: obj.nome,
						email: obj.email,
						contato: obj.contato,
						user: obj.user,
						indAtivo: obj["ind_ativo"],
						fkDominioTipoAcesso: obj["fk_dominio_tipo_acesso.id_tipo_acesso"],
						emailGestor: obj.email_gestor,
						modulos: ModulosSelecionados,
						empresas: EmpresasSelecionadas
					})
					.then(function (res) {
						finalizarProcesso();
						that._navToPaginaListagem();	
					})
					.catch(function (err) {
						alert(err.status + " - " + err.statusText);
						finalizarProcesso();
					});
			},

			_navToPaginaListagem: function () {
				this.byId("myNav").to(this.byId("paginaListagem"), "flip");
			},
			
			_resolverCheckbox: function (that) {
				var Usuario = that.getModel().getProperty("/objeto");	
				var Modulos = that.getModel().getProperty("/DominioModulo");
				var Empresas = that.getModel().getProperty("/Empresas");
				
				for(let i = 0; i < Modulos.length; i++){
					switch(Number(Usuario["fk_dominio_tipo_acesso.id_tipo_acesso"])){
						case 0:
							if (Modulos[i]["id_dominio_modulo"] == 5){
								Modulos[i].selecionado = false;
								Modulos[i].habilitado = false;
							}
							else{
								Modulos[i].habilitado = true;
							}
							break;
						case 1:
							if(Modulos[i]["id_dominio_modulo"] != 5){
								Modulos[i].selecionado = false;
							}
							else{
								Modulos[i].selecionado = true;
							}
							Modulos[i].habilitado = false;
							break;
						case 2:
							if (Modulos[i]["id_dominio_modulo"] == 5){
								Modulos[i].selecionado = true;
								Modulos[i].habilitado = false;
							}
							else{
								Modulos[i].habilitado = true;
							}
							break;
					}
				}
				for(let i = 0; i < Empresas.length; i++){
					switch(Number(Usuario["fk_dominio_tipo_acesso.id_tipo_acesso"])){
						case 1:
							Empresas[i].selecionado = false;
							Empresas[i].habilitado = false;
					}
				}
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
						
						const execucaoNormal = function () {
							if (oEvent.data.path) {
								var id = that.getModel().getObject(oEvent.data.path)[that._nomeColunaIdentificadorNaListagemObjetos];
	
								that.getModel().setProperty("/isUpdate", true);
								that.getModel().setProperty("/idObjeto", id);
	
								that._carregarObjetoSelecionado(id);
							} else {
								that.getModel().getProperty("/objeto")["ind_ativo"] = true;
								that.getModel().setProperty("/isUpdate", false);
							}	
						}
						
						that._carregarCamposFormulario()
							.then(function () {
								execucaoNormal();	
							})
							.catch(function () {
								execucaoNormal();
							});
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
			},
			
			changeTipoAcesso: function (oEvent) {
				var that = this;
				this._resolverCheckbox(that);
				this.getModel().refresh();
			},
			onTrocarSenha: function (oEvent){
				this.setBusy(this.byId("btnTrocarSenha"),true);
				var idObjeto = this.getModel().getProperty("/idObjeto");
				var that = this;
				$.ajax({
					type:"GET",
					url: Constants.urlBackend + "Usuario/" + idObjeto + "/ResetSenha",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true
				}).done(function() {
				  sap.m.MessageToast.show(that.getResourceBundle().getText("viewUsuarioAdminConfirmacaoEmail"));
				  that.setBusy(that.byId("btnTrocarSenha"),false);
				}).fail(function (err) {
				  sap.m.MessageToast.show(err.responseJSON.error.msg);
				  that.setBusy(that.byId("btnTrocarSenha"),false);
				})
			}
		});
	}
);