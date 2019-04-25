sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, NodeAPI, Validador, Utils) {
		return BaseController.extend("ui5ns.ui5.controller.beps.FormularioNovaObrigacao", {

			onInit: function () {
				var oModel = new sap.ui.model.json.JSONModel({
					Obrigacao: {
						fkEmpresa: null,
						fkDominioPais: null,
						fkObrigacaoAcessoria: null,
						fkDominioPeriocidadeObrigacao: null,
						fkAnoFiscal: null,
						prazo_entrega: null,
						extensao: null,
						obrigacao_inicial: null,
						suporte_contratado: null,
						suporte: null,
						observacoes: null,
						fkDominioStatusObrigacao: 1,
						fkDominioAprovacaoObrigacao: 1,
						motivoReprovacao: null
					}
				});

				oModel.setSizeLimit(300);

				this.setModel(oModel);
				//console.log("Model " + oModel);

				this.getRouter().getRoute("bepsFormularioNovaObrigacao").attachPatternMatched(this._onRouteMatched, this);
			},

			onSalvar: function (oEvent) {
				var that = this;

				oButton = oEvent.getSource();
				that.setBusy(oButton, true);

				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(this.getResourceBundle().getText("formularioObrigacaoMsgSalvar"), {
					title: "Confirm",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							if (that._validarGeral()) {
								that._inserirModeloObrigacao();
								that.setBusy(oButton, false);
							}
							that.setBusy(oButton, false);
						}
						that.setBusy(oButton, false);
					}
				});
				//sap.m.MessageToast.show("Cancelar inserção");

			},

			_inserirModeloObrigacao: function () {
				var that = this;

				NodeAPI.pCriarRegistro("ModeloObrigacao", {
						nomeObrigacao: this.getModel().getProperty("/Obrigacao/nome"),
						dataInicial: this.getModel().getProperty("/Obrigacao/dataInicio"),
						dataFinal: this.getModel().getProperty("/Obrigacao/dataFim"),
						prazoEntrega: this.getModel().getProperty("/Obrigacao/selectPrazoEntrega"),
						fkIdPais: this.getModel().getProperty("/Obrigacao/fkDominioPais"),
						fkIdDominioPeriodicidade: this.getModel().getProperty("/Obrigacao/fkDominioPeriocidadeObrigacao"),
						fkIdDominioObrigacaoAcessoriaTipo: 1,
						anoObrigacao: this.getModel().getProperty("/Obrigacao/anoObrigacao")
					})
					.then((res) => {
						console.log(res);
						that._inserirRequisicaoModeloObrigacao(that.getModel().getProperty("/Obrigacao/textAreaJustificativa"),
							that.getModel().getProperty("/Obrigacao/fkEmpresa"), JSON.stringify(JSON.parse(res)[0].generated_id));
					})
					.catch(function (err) {
						that.showError(err);
					});
			},

			_inserirRequisicaoModeloObrigacao: function (justificativa, fkempresa, fkModeloObrigacao) {
				var that = this;
				NodeAPI.pCriarRegistro("RequisicaoModeloObrigacao", {
						justificativa: justificativa,
						fkEmpresa: fkempresa,
						fkModeloObrigacao: fkModeloObrigacao,
						usarUsuarioSessao: 1,
						dataRequisicao: that._getDateCurrency(),
						fkDominioRequisicaoModeloObrigacaoStatus: 1
					})
					.then((result) => {
						console.log(result);

						var oParametros = {
							empresa: that.getModel().getProperty("/Empresa"),
							idAnoCalendario: that.getModel().getProperty("/AnoCalendarioSelecionado")
						};

						that.getRouter().navTo("bepsListagemObrigacoes", {
							parametros: JSON.stringify(oParametros)
						});

						that._limparModel();
						sap.m.MessageToast.show(that.getResourceBundle().getText("viewComplianceBepsObrigacaoCadastrada", {
							duration: 5000
						}));
					})
					.catch(function (error) {
						that.showError(error);
						//console.log(error);
					});
			},

			// função criada para pegar a data atual da requisição do modelo no formato yyyy-MM-dd
			_getDateCurrency() {
				var data = new Date();
				var ano = data.getFullYear();
				var mes = parseInt(data.getMonth() + parseInt(1));
				var dia = data.getDate();
				return ano + "-" + mes + "-" + dia;
			},

			_onRouteMatched: function (oEvent) {

				var oParametros = oEvent.getParameter("arguments").parametros ? JSON.parse(oEvent.getParameter("arguments").parametros) : null;

				this.getModel().setProperty("/AnoCalendarioSelecionado", oParametros.anoCalendario);

				this._carregarSelect("Empresa");
				this._carregarSelect("DominioPais");
				this._carregarSelect("ObrigacaoAcessoria?tipo=1");
				this._carregarSelect("DomPeriodicidadeObrigacao");
				//this._carregarSelect("DominioAnoFiscal");
				this._carregaComboPais();
			},

			_carregarSelect: function (sEntidade) {
				var that = this;

				NodeAPI.listarRegistros(sEntidade, function (response) {
					if (response) {
						var filtro;
						switch (sEntidade) {
						case "Empresa":
							filtro = Utils.orderByArrayParaBox(response, "nome");
							break;
						case "DominioPais":
							var aPais = response;
							for (var i = 0; i < aPais.length; i++) {
								aPais[i]["nomePais"] =
									Utils.traduzDominioPais(aPais[i]["fkDominioPais"], that);
							}
							filtro = Utils.orderByArrayParaBox(aPais, "nomePais");
							break;

						case "ObrigacaoAcessoria?tipo=2":
							filtro = Utils.orderByArrayParaBox(response, "nome");
							break;
						case "DomPeriodicidadeObrigacao":
							var aPeriodicidade = response;
							for (var i = 0; i < aPeriodicidade.length; i++) {
								aPeriodicidade[i]["descricao"] =
									Utils.traduzObrigacaoPeriodo(aPeriodicidade[i]["id_periodicidade_obrigacao"], that);
							}
							filtro = Utils.orderByArrayParaBox(aPeriodicidade, "descricao");
							break;
						case "DominioAnoFiscal":
							filtro = response;
							break;
						}
						response.unshift({});
						that.getModel().setProperty("/" + sEntidade, filtro);
						//Sthat._limparModel();
					}
				});
			},

			_limparModel: function () {
				this.getModel().setProperty("/Obrigacao", {
					fkEmpresa: null,
					fkDominioPais: null,
					fkObrigacaoAcessoria: null,
					fkDominioPeriocidadeObrigacao: null,
					fkAnoFiscal: null,
					prazo_entrega: null,
					extensao: null,
					obrigacao_inicial: null,
					suporte_contratado: null,
					suporte: null,
					observacoes: null,
					fkDominioStatusObrigacao: 1,
					fkDominioAprovacaoObrigacao: 1,
					motivoReprovacao: null
				});
			},

			_validarFormulario: function () {
				var obj = this.getModel().getProperty("/Obrigacao");
				var sIdFormulario = "#" + this.byId("formularioObrigacao").getDomRef().id;
				var dataValidada = true;

				var oValidacao = Validador.validarFormularioAdmin({
					aInputObrigatorio: $(sIdFormulario + " input[aria-required=true]"),

					aDropdownObrigatorio: [
						this.byId("selectEmpresas"),
						this.byId("comboPais"),
						//this.byId("selectAnoFiscal"),
						this.byId("selectPeriodicidade")
					]
				});

				oValidacao.formularioValido = (oValidacao.formularioValido);

				if (!oValidacao.formularioValido) {
					oValidacao.mensagem = this.getResourceBundle().getText("viewValidacaoCamposObirgatorios") + "\n";
					sap.m.MessageBox.warning(oValidacao.mensagem, {
						title: ""
					})
				}

				return oValidacao.formularioValido;
			},

			// cirado para personalizar o tratamento do ano
			_tratamentoAnoIniFim() {

				var dataini = this.byId("dataInicio").getValue();
				var datafin = this.byId("dataFim").getValue();

				var auxini = dataini.split("-");
				var auxfin = datafin.split("-");

				var anoini = auxini[0];
				var anofin = auxfin[0];

				return parseInt(anoini) <= parseInt(anofin);
			},

			_validarGeral: function () {

				var validado = "true";

				if (!this._validarFormulario()) {
					validado = false;
					return;
				}

				if (!this._tratamentoAnoIniFim()) {

					validado = "false";
					sap.m.MessageBox.warning(this.getResourceBundle().getText("viewComplianceFormularioObrigacoesAnoInvalido"), {
						title: ""
					})
					return;
				}

				return validado;
			},

			_carregaComboPais: function () {
				var that = this;

				NodeAPI.pListarRegistros("DeepQuery/Pais")
					.then(function (res) {
						res.unshift({});
						var aPais = res;
						for (var i = 1; i < aPais.length; i++) {
							aPais[i]["labelPais"] = Utils.traduzDominioPais(aPais[i]["fkDominioPais"], that);
						}
						that.getModel().setProperty("/Pais", Utils.orderByArrayParaBox(aPais, "labelPais"));
					})
					.catch(function (err) {
						that.showError(err);
					});
			},

			onCancelar: function () {
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(this.getResourceBundle().getText("formularioObrigacaoMsgCancelar"), {
					title: "Confirm",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							var oParametros = {
								empresa: that.getModel().getProperty("/Empresa"),
								idAnoCalendario: that.getModel().getProperty("/AnoCalendarioSelecionado")
							};

							that.getRouter().navTo("bepsListagemObrigacoes", {
								parametros: JSON.stringify(oParametros)
							});
							that._limparModel();
						}
					}
				});
				//sap.m.MessageToast.show("Cancelar inserção");
			},

			navToHome: function () {
				var that = this;
				$.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(this.getResourceBundle().getText("formularioObrigacaoMsgCancelar"), {

					title: "Confirm",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							that.getRouter().navTo("selecaoModulo");
							that._limparModel();
						}
					}

				})
			}
		});
	}
);