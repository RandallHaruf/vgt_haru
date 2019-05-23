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
				var idExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath())[this._nomeColunaIdentificadorNaListagemObjetos];

				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(that.getResourceBundle().getText("ViewGeralCerteza"), {
					title: "Info",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							NodeAPI.pExcluirRegistro("ModeloObrigacao", idExcluir)
								.then(function (res) {
									console.log(res);
									that._carregarObjetos({
										manterFiltro: true
									});
								})
								.catch(function (err) {
									console.log(err);
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
			// trocar o nome desse registro
			// _nomeColunaIdentificadorNaListagemObjetos: "id_obrigacao_acessoria",
			_nomeColunaIdentificadorNaListagemObjetos: "tblModeloObrigacao.id_modelo",
			//-------------------
			//-------------------
			//-------------------
			//-------------------

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

			onFiltrarCompliance: function () {
				this.filterDialogCompliance.open();
			},

			onFiltrarBeps: function () {
				this.filterDialogBeps.open();
			},

			_inserirFiltroModeloObrigacaoNoModel: function (aModelo, iTipo, sCaminhoModel) {
				var auxDistinct = [];

				var aObrigacao = aModelo.filter(function (obj, index, self) {
					if (obj["tblTipoObrigacao.id_dominio_obrigacao_acessoria_tipo"] == iTipo && auxDistinct.indexOf(obj[
							"tblModeloObrigacao.nome_obrigacao"]) === -1) {
						auxDistinct.push(obj["tblModeloObrigacao.nome_obrigacao"]);
						return true;
					}
					return false;
				});

				this.getModel().setProperty(sCaminhoModel, Utils.orderByArrayParaBox(aObrigacao,
					"tblModeloObrigacao.nome_obrigacao"));
			},

			_montarFiltro: function (bManterFiltro) {
				var that = this;
				
				if (!bManterFiltro) {
					Utils.criarDialogFiltro("tabelaCompliance", [{
						text: this.getResourceBundle().getText("viewGeralPais"),
						applyTo: 'tblDominioPais.id_dominio_pais',
						items: {
							loadFrom: 'DominioPais',
							path: '/EasyFilterDominioPais',
							text: 'pais',
							key: 'id_dominio_pais'
						}
					}, {
						text: this.getResourceBundle().getText("viewGeralNome"),
						applyTo: 'tblModeloObrigacao.nome_obrigacao',
						items: {
							loadFrom: "DeepQuery/ModeloObrigacao?&idStatus=2",
							path: '/EasyFilterModeloObrigacaoCompliance',
							text: 'tblModeloObrigacao.nome_obrigacao',
							key: 'tblModeloObrigacao.nome_obrigacao'
						}
					}], this, function (params) {
						that.getModel().setProperty("/QuantidadeRegistrosCompliance", params.filteredItemsCount);
					}, "filterDialogCompliance");
	
					Utils.criarDialogFiltro("tabelaBeps", [{
						text: this.getResourceBundle().getText("viewGeralPais"),
						applyTo: 'tblDominioPais.id_dominio_pais',
						items: {
							path: '/EasyFilterDominioPais',
							text: 'pais',
							key: 'id_dominio_pais'
						}
					}, {
						text: this.getResourceBundle().getText("viewGeralNome"),
						applyTo: 'tblModeloObrigacao.nome_obrigacao',
						items: {
							path: '/EasyFilterModeloObrigacaoBeps',
							text: 'tblModeloObrigacao.nome_obrigacao',
							key: 'tblModeloObrigacao.nome_obrigacao'
						}
					}], this, function (params) {
						that.getModel().setProperty("/QuantidadeRegistrosBeps", params.filteredItemsCount);
					}, "filterDialogBeps");
				}

				this._loadFrom_filterDialogCompliance().then((function (res) {
					// Filtro Dominio Pais
					for (var i = 0, length = res[0].length; i < length; i++) {
						res[0][i]["pais"] = Utils.traduzDominioPais(res[0][i]["id_dominio_pais"], that);
					}
					that.getModel().setProperty("/EasyFilterDominioPais", Utils.orderByArrayParaBox(res[0], "pais"));

					// Filtro Modelo Obrigacao
					that._inserirFiltroModeloObrigacaoNoModel(res[1], 2, "/EasyFilterModeloObrigacaoCompliance");
					that._inserirFiltroModeloObrigacaoNoModel(res[1], 1, "/EasyFilterModeloObrigacaoBeps");
				}));
			},

			_carregarObjetos: function (oParam) {
				var that = this;
				
				this._montarFiltro(oParam.manterFiltro);

				that.getModel().setProperty("/objetosCompliance", []);
				that.getModel().setProperty("/objetosBeps", []);

				this.setBusy(this.byId("idIconTabBarInlineMode"), true);

				jQuery.ajax(Constants.urlBackend + "DeepQuery/ModeloObrigacao?&idStatus=2", {
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						var aResponse = response,
							objetosCompliance = [],
							objetosBeps = [];

						for (var i = 0, length = aResponse.length; i < length; i++) {
							aResponse[i]["tblDominioPais.pais"] = Utils.traduzDominioPais(aResponse[i]["tblDominioPais.id_dominio_pais"], that);
							if (aResponse[i]["tblTipoObrigacao.id_dominio_obrigacao_acessoria_tipo"] == 2) {
								objetosCompliance.push(aResponse[i]);
							} else {
								objetosBeps.push(aResponse[i]);
							}
						}

						that.getModel().setProperty("/objetosCompliance", Utils.orderByArrayParaBox(objetosCompliance, "nomePais"));
						that.getModel().setProperty("/objetosBeps", Utils.orderByArrayParaBox(objetosBeps, "nomePais"));
						that.getModel().setProperty("/QuantidadeRegistrosCompliance", that.byId("tabelaCompliance").getBinding("items").iLength);
						that.getModel().setProperty("/QuantidadeRegistrosBeps", that.byId("tabelaBeps").getBinding("items").iLength);
						that.setBusy(that.byId("idIconTabBarInlineMode"), false);
					}
				});
			},

			_carregarCamposFormulario: function () {
				var that = this;

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
						that.getModel().setProperty("/DominioObrigacaoAcessoriaTipo", Utils.orderByArrayParaBox(response, "tipo"));
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
						that.getModel().setProperty("/DomPeriodicidadeObrigacao", Utils.orderByArrayParaBox(aRegistro, "descricao"));
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
						that.getModel().setProperty("/Pais", Utils.orderByArrayParaBox(aPais, "nomePais"));

					}
				});
			},

			_carregarObjetoSelecionado: function (iIdObjeto) {
				var that = this;
				that.byId("btnOCCancelar").setEnabled(false);

				jQuery.ajax(Constants.urlBackend + "ModeloObrigacao/" + iIdObjeto, {
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
				var that = this;

				that.byId("btnOCCancelar").setEnabled(false);
				that.byId("btnSalvarOC").setEnabled(false);

				that.setBusy(that.byId("btnSalvarOC"), true);

				var obj = this.getModel().getProperty("/objeto");

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
				var that = this;

				that.byId("btnOCCancelar").setEnabled(false);
				that.byId("btnSalvarOC").setEnabled(false);

				that.setBusy(that.byId("btnSalvarOC"), true);

				var obj = this.getModel().getProperty("/objeto");

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
				this.byId("myNav").to(this.byId("paginaListagem"), "flip", {
					manterFiltro: true
				});
			},

			/* Métodos fixos */
			onInit: function () {
				var that = this;

				that.setModel(new sap.ui.model.json.JSONModel({
					objetos: [],
					objeto: {},
					isUpdate: false
				}));

				this.byId("paginaListagem").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarObjetos(oEvent && oEvent.data ? oEvent.data : {});
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
				this._navToPaginaListagem();
			}
		});
	}
);