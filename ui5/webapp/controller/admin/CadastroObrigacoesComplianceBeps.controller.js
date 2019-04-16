sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, Constants, Validador, NodeAPI, Utils) {
		return BaseController.extend("ui5ns.ui5.controller.admin.CadastroObrigacoesComplianceBeps", {

			/* Métodos a implementar */
			onDesabilitar: function (oEvent) {
				var nome = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()).nome;
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(that.getResourceBundle().getText("ViewGeralDesabilitarOBR"), {
					title: "Info",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							sap.m.MessageToast.show("Desabilitar Obrigação: " + nome);
						}
					}
				});
			},

			onExcluir: function (oEvent) {
				var that = this;
				//var nome = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()).nome;
				var idExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath())[this._nomeColunaIdentificadorNaListagemObjetos];

				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(that.getResourceBundle().getText("ViewGeralCerteza"), {
					title: "Info",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							//sap.m.MessageToast.show("Excluir Obrigação: " + nome);

							//jQuery.ajax(Constants.urlBackend + "ObrigacaoAcessoria/" + idExcluir, {
							/*jQuery.ajax(Constants.urlBackend + "ModeloObrigacao/" + idExcluir, {
								type: "DELETE",
								xhrFields: {
									withCredentials: true
								},
								crossDomain: true,
								success: function (response) {
									that._carregarObjetos();
								}
							});*/
							NodeAPI.pExcluirRegistro("ModeloObrigacao", idExcluir)
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
			//-------------------
			//-------------------
			//-------------------
			//-------------------
			//trocar o nome desse registro
			//_nomeColunaIdentificadorNaListagemObjetos: "id_obrigacao_acessoria",
			_nomeColunaIdentificadorNaListagemObjetos: "tblModeloObrigacao.id_modelo",
			//-------------------
			//-------------------
			//-------------------
			//-------------------
			//DESCOMENTAR A VALIDACAO DOS OUTROS CAMPOS
			_validarFormulario: function () {

				var sIdFormulario = "#" + this.byId("formularioObjeto").getDomRef().id;

				var oValidacao = Validador.validarFormularioAdmin({
					aInputObrigatorio: jQuery(sIdFormulario + " input[aria-required=true]"),
					aDropdownObrigatorio: [
						this.byId("selectStatus"),
						this.byId("selectPais"),
						this.byId("selectPeriodicidade")
					],
					oPeriodoObrigatorio: {
						dataInicio: this.byId("dataInicio"),
						dataFim: this.byId("dataFim"),
						selectPrazoEntrega: this.byId("selectPrazoEntrega")
					}
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
					tipo: "Compliance",
					nome: "Obrigação 1"
				}, {
					id: "2",
					tipo: "Beps",
					nome: "Obrigação 2"
				}]);*/

				var that = this;
				that.getModel().setProperty("/objetos", null);
				//jQuery.ajax(Constants.urlBackend + "DeepQuery/ObrigacaoAcessoria", {
				jQuery.ajax(Constants.urlBackend + "DeepQuery/ModeloObrigacao", {
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						var aResponse = response;
						for (var i = 0, length = aResponse.length; i < length; i++) {
							aResponse[i]["tblDominioPais.pais"] = Utils.traduzDominioPais(aResponse[i]["tblDominioPais.id_dominio_pais"], that);
						}							
						that.getModel().setProperty("/objetos", Utils.orderByArrayParaBox(response,"nomePais"));
					}
				});
			},

			_carregarCamposFormulario: function () {
				var that = this;
				//this.onTrocaLingua();

				jQuery.ajax(Constants.urlBackend + "DominioObrigacaoAcessoriaTipo", {
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
						that.getModel().setProperty("/DominioObrigacaoAcessoriaTipo", Utils.orderByArrayParaBox(response,"tipo"));
					}
				});
				//os dois node api foram adicionados recentemente para puxar os valores novos do formulario
				NodeAPI.listarRegistros("DomPeriodicidadeObrigacao", function (response) {
					if (response) {
						//response.unshift({});
						response.unshift({
							id: 0,
							nome: ""
						});
						var aRegistro = response;
						for (var i = 0, length = aRegistro.length; i < length; i++) {
							aRegistro[i]["descricao"] = Utils.traduzObrigacaoPeriodo(aRegistro[i]["id_periodicidade_obrigacao"], that);
						}
						that.getModel().setProperty("/DomPeriodicidadeObrigacao", Utils.orderByArrayParaBox(aRegistro,"descricao"));
					}
				});
				NodeAPI.listarRegistros("DeepQuery/Pais", function (response) {
					if (response) {
						//response.unshift({});
						response.unshift({
							id: 0,
							nome: ""
						});
						var aPais = response;
						for (var i = 0, length = aPais.length; i < length; i++) {
							aPais[i]["nomePais"] = Utils.traduzDominioPais(aPais[i]["fkDominioPais"], that);
						}						
						that.getModel().setProperty("/Pais", Utils.orderByArrayParaBox(aPais,"nomePais"));

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

			_carregarObjetoSelecionado: function (iIdObjeto) { //CARREGAR O NOVO OBJETO DE OBRIGACAO ACESSORIA
				/*this.getModel().setProperty("/objeto", {
					id: iIdObjeto,
					nome: "Nome da Obrigação"
				});*/
				//CARREGAR O NOVO OBJETO DE OBRIGACAO ACESSORIA
				var that = this;
				that.byId("btnOCCancelar").setEnabled(false);
				jQuery.ajax(Constants.urlBackend + "ModeloObrigacao/" + iIdObjeto, {
					//jQuery.ajax(Constants.urlBackend + "ObrigacaoAcessoria/" + iIdObjeto, {
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						var oObjeto = response[0];
						var obj = {
							nome: oObjeto["nome_obrigacao"],
							fkDominioObrigacaoAcessoriaTipo: oObjeto["fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo"],
							dataInicio: oObjeto["data_inicial"],
							dataFim: oObjeto["data_final"],
							selectPeriodicidade: oObjeto["fk_id_dominio_periodicidade.id_periodicidade_obrigacao"],
							/*Utils.traduzPeriodo(oObjeto["fk_id_dominio_periodicidade.id_periodicidade_obrigacao"]),    */
							selectPais: oObjeto["fk_id_pais.id_pais"],
							selectPrazoEntrega: oObjeto["prazo_entrega"],
							anoObrigacao: oObjeto["ano_obrigacao"]

						};
						that.byId("btnOCCancelar").setEnabled(true);
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
				that.byId("btnOCCancelar").setEnabled(false);
				that.byId("btnSalvarOC").setEnabled(false);
				that.setBusy(that.byId("btnSalvarOC"), true);
				var obj = this.getModel().getProperty("/objeto");

				//jQuery.ajax(Constants.urlBackend + "ObrigacaoAcessoria/" + iIdObjeto, {
				jQuery.ajax(Constants.urlBackend + "ModeloObrigacao/" + iIdObjeto, {
					type: "PUT",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: {
						nomeObrigacao: obj.nome,
						dataInicial: obj.dataInicio,
						dataFinal: obj.dataFim,
						prazoEntrega: obj.selectPrazoEntrega,
						anoObrigacao: obj.anoObrigacao ? Math.abs(obj.anoObrigacao) : null,
						fkIdPais: obj.selectPais,
						fkIdDominioPeriodicidade: obj.selectPeriodicidade,
						fkIdDominioObrigacaoStatus: 2,
						fkIdDominioObrigacaoAcessoriaTipo: obj.fkDominioObrigacaoAcessoriaTipo
					},
					success: function (response) {
						that.byId("btnOCCancelar").setEnabled(true);
						that.byId("btnSalvarOC").setEnabled(true);
						that.setBusy(that.byId("btnSalvarOC"), false);
						that._navToPaginaListagem();
					}
				});
			},

			_inserirObjeto: function () {
				/*sap.m.MessageToast.show("Inserir Objeto");
				this._navToPaginaListagem();		*/

				var that = this;
				that.byId("btnOCCancelar").setEnabled(false);
				that.byId("btnSalvarOC").setEnabled(false);
				that.setBusy(that.byId("btnSalvarOC"), true);
				var obj = this.getModel().getProperty("/objeto");

				//jQuery.ajax(Constants.urlBackend + "ObrigacaoAcessoria", {				
				jQuery.ajax(Constants.urlBackend + "ModeloObrigacao", {
					type: "POST",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: {
						nomeObrigacao: obj.nome,
						dataInicial: obj.dataInicio,
						dataFinal: obj.dataFim,
						prazoEntrega: obj.selectPrazoEntrega,
						anoObrigacao: obj.anoObrigacao ? Math.abs(obj.anoObrigacao) : null,
						fkIdPais: obj.selectPais,
						fkIdDominioPeriodicidade: obj.selectPeriodicidade,
						fkIdDominioObrigacaoStatus: 2,
						fkIdDominioObrigacaoAcessoriaTipo: obj.fkDominioObrigacaoAcessoriaTipo
					},
					success: function (response) {
						that.byId("btnOCCancelar").setEnabled(true);
						that.byId("btnSalvarOC").setEnabled(true);
						that.setBusy(that.byId("btnSalvarOC"), false);
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
				Utils.displayFormat(this);
				this.byId("myNav").to(this.byId("paginaObjeto"), "flip");
			},

			onAbrirObjeto: function (oEvent) {
				Utils.displayFormat(this);
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
		return BaseController.extend("ui5ns.ui5.controller.admin.CadastroObrigacoesComplianceBeps", {
			onInit: function () {
				var that = this;
				
				this._dadosObjetos = [
					{
						id: "1",
						tipo: "Compliance",
						nome: "Obrigação 1"
					},
					{
						id: "2",
						tipo: "Beps",
						nome: "Obrigação 2"
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