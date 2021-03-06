sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/lib/Arquivo",
		"ui5ns/ui5/lib/jQueryMask",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5//model/enums/PerfilUsuario",
		"sap/ui/core/Fragment",
		"sap/ui/model/json/JSONModel"
	],
	function (BaseController, NodeAPI, Utils, Arquivo, jQueryMask, Constants, Validador, PerfilUsuario, Fragment, JSONModel) {
		BaseController.extend("ui5ns.ui5.controller.compliance.FormularioDetalhesObrigacao", {

			onInit: function () {
				this._zerarModel();

				if (this.isVisualizacaoUsuario()) {
					this.getRouter().getRoute("complianceFormularioDetalhesObrigacao").attachPatternMatched(this._onRouteMatched, this);
				}
			},

			_atualizarStatusPodeEncerrar: function () {
				var documentos = this.getModel().getProperty("/Documentos");
				var data = this.getModel().getProperty("/RespostaObrigacao")["data_conclusao"];

				// Só pode encerrar se a resposta ainda não foi concluída e existem documentos anexados a ela
				var podeEncerrar = !data && documentos.length ? true : false;

				this.getModel().setProperty("/PodeEncerrar", podeEncerrar);
			},

			_atualizarDocumentos: function (sProperty, sIdObrigacao, oTable) {
				var that = this;

				this.setBusy(oTable, true);

				Arquivo.listar("ListarDocumento?id=" + sIdObrigacao)
					.then(function (response) {
						for (var i = 0; i < response.length; i++) {
							response[i].btnExcluirEnabled = !response[i].ind_conclusao;
						}

						that.getModel().setProperty(sProperty, response);
					})
					.catch(function (err) {
						sap.m.MessageToast.show(err);
					})
					.finally(function () {
						that._atualizarStatusPodeEncerrar();
						that.setBusy(oTable, false);
					});
			},

			onAnexarArquivo: function (oEvent) {
				var oFileUploader = this.getView().byId("fileUploader");

				if (oFileUploader.getValue()) {
					var dataUpload = Utils.stringDateNowParaVariavelFormatoYYYYMMDD();
					var idRespostaObrigacao = this.getModel().getProperty("/RespostaObrigacao")["id_resposa_obrigacao"];
					var aDocumento = this.getModel().getProperty("/Documentos");

					var oArquivo = {
						id_documento: 0,
						data_upload: dataUpload,
						"fk_id_resposta_obrigacao.id_resposta_obrigacao": idRespostaObrigacao,
						ind_conclusao: false,
						nome_arquivo: oFileUploader.getValue(),
						btnDownloadEnabled: false,
						btnExcluirEnabled: true,
						arquivo: oFileUploader.oFileUpload.files[0]
					};

					aDocumento.push(oArquivo);
					this.getModel().refresh();

					oFileUploader.setValue("");
					this._atualizarStatusPodeEncerrar();
				} else {
					sap.m.MessageToast.show(this.getResourceBundle().getText('viewGeralSelecioneArquivo'));
				}
			},

			onSelecionaCheck: function (oEvent) {
				var now = new Date();

				var CkeckSelect = oEvent.getParameter("selected");
				//var oCkeckSelect = this.getView().byId("CheckSeleciona");

				if (CkeckSelect === true) {
					this.byId("DataAtual").setDateValue(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
					//oBtnEnviar.setEnabled(false);
				} else {
					this.byId("DataAtual").setDateValue();
				}
			},

			onTrocarObrigacaoIniciada: function (oEvent) {
				var objObrigacao = this.getModel().getProperty("/RespostaObrigacao");
				if (objObrigacao["ObrigacaoIniciada"]) {
					objObrigacao["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] = 1;
				}
			},

			_mostrarDialogProgressoUploadAnexo: function () {
				if (!this._dialogProgresso) {
					var that = this;

					Fragment.load({
						name: "ui5ns.ui5.view.compliance.DialogProgresso"
					}).then(function (oDialog) {
						that._dialogProgresso = oDialog;

						that._dialogProgresso.setEscapeHandler(function (promise) {
							promise.reject();
						});

						that.getView().addDependent(that._dialogProgresso);

						that._dialogProgresso.open();
					});
				} else {
					this._dialogProgresso.open();
				}
			},

			_mostrarDialogDataConclusao: function (callbackSalvar) {
				var that = this;

				var oVBox = new sap.m.VBox({
					width: '300px',
					alignItems: 'Center'
				});

				var labelDataConclusao = new sap.m.Text({
					textAlign: 'Center',
					text: that.getView().getModel("i18n").getResourceBundle().getText("viewMensagemObrigacao")
				}).addStyleClass('sapUiSmallMarginBottom');

				var datePickerDataConclusao = new sap.m.DatePicker({
					value: "{/DataConclusao}",
					valueFormat: "yyyy-MM-dd",
					displayFormat: "{i18n>displayFormatFull}",
					width: "200px"
				}).attachChange(function (event) {
					var DataConclusao = that.getModel().getProperty("/DataConclusao");

					if (!DataConclusao) {
						that.getModel().setProperty("/ButtonOkEncerrar", false);
					} else {
						that.getModel().setProperty("/ButtonOkEncerrar", true);
						that.getModel().setProperty("/DataConclusao", DataConclusao);
					}
					that.getModel().refresh();
				})

				oVBox.addItem(labelDataConclusao);
				oVBox.addItem(datePickerDataConclusao);

				var dialog = new sap.m.Dialog({
					title: this.getResourceBundle().getText('viewGeralAviso'),
					showHeader: true,
					type: "Message",
					content: oVBox,
					beginButton: new sap.m.Button({
						text: "OK",
						enabled: "{/ButtonOkEncerrar}",
						press: function () {
							dialog.close();

							if (callbackSalvar) {
								callbackSalvar();
							}
						}
					}),
					endButton: new sap.m.Button({
						text: that.getView().getModel("i18n").getResourceBundle().getText("viewGeralCancelar"),
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					},
					beforeOpen: function () {
						var DataConclusao = that.getModel().getProperty("/DataConclusao");
						if (!DataConclusao) {
							var d = new Date();
							datePickerDataConclusao.setDateValue(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
							that.getModel().setProperty("/ButtonOkEncerrar", true);
							that.getModel().refresh();
						}

					}
				})

				this.getView().addDependent(dialog);

				dialog.open();
			},

			_getPromisesExcluir: function () {
				// verificar se tem exclusao e disparar as exclusoes
				var aPromise = [],
					aIdDocumentoParaExcluir = this.getModel().getProperty('/IdDocumentosParaExcluir');

				for (var i = 0, length = aIdDocumentoParaExcluir.length; i < length; i++) {
					var oPromise = Arquivo.excluir("ExcluirDocumento/" + aIdDocumentoParaExcluir[i]);
					aPromise.push(oPromise);
				}

				return aPromise;
			},

			_getPromisesUpload: function (bIsEncerramento) {
				// verificar se tem anexo e disparar uploads, caso seja uma conclusão, o arquivo é criado com "ind_conclusao" = true
				var aDocumento = this.getModel().getProperty('/Documentos');
				var oRespostaObrigacao = this.getModel().getProperty('/RespostaObrigacao');

				var aAnexo = aDocumento.filter(function (documento) {
					return documento.arquivo;
				});

				this.getModel("anexos").setProperty('/', aAnexo);

				var oData = {
					indConclusao: bIsEncerramento,
					id: oRespostaObrigacao["id_resposta_obrigacao"]
				};

				var aPromise = [];

				if (aAnexo.length) {
					this._mostrarDialogProgressoUploadAnexo();
				}

				for (var i = 0, length = aAnexo.length; i < length; i++) {
					var oAnexo = aAnexo[i];

					(function (anexo, thisController) {
						var oPromise = Arquivo.upload(oAnexo.arquivo, oAnexo.nome_arquivo, "UploadDocumento", oData, {
							onProgress: function (progresso) {
								anexo.progresso = progresso;
								thisController.getModel("anexos").refresh();
							}
						});
						aPromise.push(oPromise);
					})(oAnexo, this);
				}

				return aPromise;
			},

			_getPromisesAtualizarArquivoConclusao: function (bIsEncerramento) {
				// verificar se é conclusão e atualizar documentos com "ind_conclusao" = true
				var aPromise = [];

				if (bIsEncerramento) {
					var aDocumento = this.getModel().getProperty('/Documentos');

					var aDocumentoPersistido = aDocumento.filter(function (documento) {
						return documento.id_documento;
					});

					for (var i = 0, length = aDocumentoPersistido.length; i < length; i++) {
						var oDocumentoPersistido = aDocumentoPersistido[i];

						var oPromise = NodeAPI.pAtualizarRegistro("DocumentoObrigacao", oDocumentoPersistido.id_documento, {
							id: oDocumentoPersistido.id_documento,
							fkIdRespostaObrigacao: oDocumentoPersistido["fk_id_resposta_obrigacao.id_resposta_obrigacao"],
							mimetype: oDocumentoPersistido.mimetype,
							tamanho: oDocumentoPersistido.tamanho,
							dataUpload: oDocumentoPersistido.data_upload,
							fkIdUsuario: oDocumentoPersistido["fk_id_usuario.id_usuario"],
							indConclusao: bIsEncerramento
						});

						aPromise.push(oPromise);
					}
				}

				return aPromise;
			},

			_atualizarRespostaObrigacao: function (bIsEncerramento) {
				var oRespostaObrigacao = this.getModel().getProperty('/RespostaObrigacao');

				oRespostaObrigacao.data_conclusao = bIsEncerramento ? this.getModel().getProperty('/DataConclusao') : oRespostaObrigacao.data_conclusao;

				// ANALISAR NCESSIDADE

				// var IntMes = DataConclusao.getMonth(); //Number(DataConclusao.toString());
				// 	IntMes = IntMes + 1;
				// 	var strMes = IntMes.toString();

				// 	that.getModel().getProperty("/RespostaObrigacao")["data_conclusao"] = DataConclusao.getFullYear() + "-" + strMes +
				// 		"-" +
				// 		DataConclusao.getDate();
				// 	var DataFormatada = that.getModel().getProperty("/RespostaObrigacao")["data_conclusao"];

				// 	that._AtualizaStatusObrigacao(DataFormatada);

				return NodeAPI.pAtualizarRegistro("RespostaObrigacao", oRespostaObrigacao.id_resposta_obrigacao, {
					suporteContratado: oRespostaObrigacao.suporte_contratado,
					suporteEspecificacao: oRespostaObrigacao.suporte_especificacao,
					suporteValor: oRespostaObrigacao.suporte_valor,
					fkIdDominioMoeda: oRespostaObrigacao["fk_id_dominio_moeda.id_dominio_moeda"],
					fkIdRelModeloEmpresa: oRespostaObrigacao.id_rel_modelo_empresa,
					fkIdDominioAnoFiscal: oRespostaObrigacao.id_ano_fiscal_calculado,
					fkIdDominioAnoCalendario: oRespostaObrigacao.id_dominio_ano_calendario,
					fkIdDominioObrigacaoStatusResposta: oRespostaObrigacao.status_obrigacao_calculado, // TALVEZ PRECISEMOS USAR O METODO DE ATUALIZAR STATUS
					dataExtensao: oRespostaObrigacao.data_extensao,
					dataConclusao: oRespostaObrigacao.data_conclusao,
					confirmarPenalidade: oRespostaObrigacao.confirmar_penalidade,
					justificativa: oRespostaObrigacao.justificativa,
					fkIdDominioMoedaPenalidade: oRespostaObrigacao["fk_id_dominio_moeda_penalidade.id_dominio_moeda"],
					valorPenalidade: oRespostaObrigacao.valor_penalidade,
					indIniciada: true
				});
			},

			_persistir: function (bIsEncerramento) {
				var that = this;

				this.setBusy(this.getView(), true);

				var aPromise = []
					.concat(this._getPromisesExcluir())
					.concat(this._getPromisesUpload(bIsEncerramento))
					.concat(this._getPromisesAtualizarArquivoConclusao(bIsEncerramento));

				Promise.all(aPromise)
					.then(function () {
						return that._atualizarRespostaObrigacao(bIsEncerramento);
					})
					.catch(function (err) {
						that._showError(err);
					})
					.finally(function () {
						that.setBusy(that.getView(), false);
						that.onVoltarParaListagem();
					});
			},

			_salvar: function () {
				this._persistir(false);
			},

			_encerrar: function () {
				this._persistir(true);
			},

			onEncerrar: function (oEvent, event) {
				var that = this,
					justificativa = that.getModel().getProperty("/RespostaObrigacao/justificativa");

				if (!that.getModel().getProperty("/ocultarPenalidade") && !justificativa) {
					var dialog = new sap.m.Dialog({
						title: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralAviso"),
						type: "Message",
						content: new sap.m.Text({
							text: this.getView().getModel("i18n").getResourceBundle().getText("viewFormularioComplianceBepsJustificativa")
						}),
						endButton: new sap.m.Button({
							text: "Ok",
							press: function () {
								dialog.close();
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					});

					dialog.open();
				} else {
					this._mostrarDialogDataConclusao(this._encerrar.bind(this));
				}
			},

			onSalvar: function (oEvent) {
				this._salvar();
			},

			onVoltarParaListagem: function () {
				this.getRouter().navTo("complianceListagemObrigacoes", {
					parametros: this.toURIComponent({
						idAnoCalendario: this.getModel().getProperty("/AnoSelecionadoAnteriormente"),
						nomeUsuario: this.getModel().getProperty("/NomeUsuario")
					})
				});
			},

			onCancelar: function () {
				var that = this;

				if (this.isIFrame()) {
					that.onVoltarParaListagem();
				} else {
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.confirm(this.getResourceBundle().getText("formularioObrigacaoMsgCancelar"), {
						title: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralConfirma"),
						onClose: function (oAction) {
							if (sap.m.MessageBox.Action.OK === oAction) {
								that.onVoltarParaListagem();
							}
						}
					});
				}
			},

			navToHome: function () {
				var that = this;

				if (this.isIFrame()) {
					that.getRouter().navTo("selecaoModulo");
				} else {
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.confirm(this.getResourceBundle().getText("formularioObrigacaoMsgCancelar"), {
						title: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralConfirma"),
						onClose: function (oAction) {
							if (sap.m.MessageBox.Action.OK === oAction) {
								that.getRouter().navTo("selecaoModulo");
							}
						}
					});
				}
			},

			navToPage2: function () {
				if (this.isVisualizacaoUsuario()) {
					this.onCancelar();
				} else {
					this._inceptionParams._targetInceptionParams.router.navToListagem(this._inceptionParams._targetInceptionParams);
				}
			},

			onTrocarSuporte: function () {
				var obj = this.getModel().getProperty("/RespostaObrigacao");
				if (!!obj["suporte_contratado"] == false) {
					obj["suporte_especificacao"] = "";
					obj["fk_id_dominio_moeda.id_dominio_moeda"] = "";
					obj["suporte_valor"] = "";
				}
			},

			onTrocarPenalidade: function () {
				var obj = this.getModel().getProperty("/RespostaObrigacao");
				if (!!obj["confirmar_penalidade"] === false) {
					obj["fk_id_dominio_moeda_penalidade.id_dominio_moeda"] = "";
					obj["valor_penalidade"] = "";
				}
			},

			onTrocarValorSuporte: function (oEvent) {
				Validador.validarNumeroInserido(oEvent, this);
			},

			onTrocarValorPenalidade: function (oEvent) {
				Validador.validarNumeroInserido(oEvent, this);
			},
			
			_AtualizaStatusObrigacao: function (Data) {
				var that = this;
				var obj2 = that.getModel().getProperty("/RespostaObrigacao");
				var Status;
				var DataExtensao;
				if (!(obj2["data_extensao"] === null)) {
					var arryData = obj2["data_extensao"].split('-');
					var IntMes = Number(arryData[1].toString());
					IntMes = IntMes - 1;
					var strMes = IntMes.toString();
					DataExtensao = new Date(arryData[0] + '-' + strMes + '-' + arryData[2]);
				} else {
					DataExtensao = null;
				}
				var prazo_entrega_customizado;
				if (!(obj2["prazo_entrega_customizado"] === null)) {
					arryData = obj2["prazo_entrega_customizado"].split('-');
					IntMes = Number(arryData[1].toString());
					IntMes = IntMes - 1;
					strMes = IntMes.toString();
					prazo_entrega_customizado = new Date(this.getModel().getProperty("/RespostaObrigacao")["ano_calendario"] + '-' + strMes + '-' +
						arryData[2]);
				} else {
					prazo_entrega_customizado = null;
				}
				arryData = obj2["prazo_entrega"].split('-');
				IntMes = Number(arryData[1].toString());
				IntMes = IntMes - 1;
				strMes = IntMes.toString();
				var prazo_entrega = new Date(this.getModel().getProperty("/RespostaObrigacao")["ano_calendario"] + '-' + strMes + '-' + arryData[2]);
				arryData = Data.split('-');
				IntMes = Number(arryData[1].toString());
				IntMes = IntMes - 1;
				strMes = IntMes.toString();
				var DataEscolhida = new Date(arryData[0] + '-' + strMes + '-' + arryData[2]);

				if (DataExtensao === null) {
					if (prazo_entrega_customizado === null) {
						if (prazo_entrega < DataEscolhida) {
							Status = 7;
						} else {
							Status = 6;
						}
					} else {
						if (prazo_entrega_customizado < DataEscolhida) {
							Status = 7;
						} else {
							Status = 6;
						}
					}
				} else {
					if (DataExtensao < DataEscolhida) {
						Status = 7;
					} else {
						Status = 6;
					}
				}

				that.getModel().getProperty("/RespostaObrigacao")["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] = Status;

			},

			onBaixarArquivo: function (oEvent) {
				var that = this,
					oButton = oEvent.getSource(),
					oArquivo = oEvent.getSource().getBindingContext().getObject();

				oArquivo.btnExcluirEnabled = false;
				oArquivo.btnDownloadEnabled = false;
				this.getModel().refresh();
				this.setBusy(oButton, true);

				Arquivo.download("DownloadDocumento?arquivo=" + oArquivo.id_documento)
					.then(function (response) {
						Arquivo.salvar(response[0].nome_arquivo, response[0].mimetype, response[0].dados_arquivo.data);
						if (!oArquivo.ind_conclusao) {
							oArquivo.btnExcluirEnabled = true;
						}
						oArquivo.btnDownloadEnabled = true;
						that.setBusy(oButton, false);
						that.getModel().refresh();
					})
					.catch(function (err) {
						sap.m.MessageToast.show(that.getResourceBundle().getText("ViewGeralErrSelecionarArquivo") + oArquivo.nome_arquivo);
						if (!oArquivo.ind_conclusao) {
							oArquivo.btnExcluirEnabled = true;
						}
						oArquivo.btnDownloadEnabled = true;
						that.setBusy(oButton, false);
						that.getModel().refresh();
					});
			},

			_retirarArquivoDaTabela: function (oArquivoExcluir) {
				var aDocumento = this.getModel().getProperty('/Documentos');

				for (var i = 0; i < aDocumento.length; i++) {
					if (oArquivoExcluir === aDocumento[i]) {
						aDocumento.splice(i, 1);
						break;
					}
				}

				this.getModel().setProperty('/Documentos', aDocumento);
			},

			onExcluirArquivo: function (oEvent) {
				var that = this;
				var oArquivo = oEvent.getSource().getBindingContext().getObject();
				var aIdDocumentoParaExcluir = this.getModel().getProperty('/IdDocumentosParaExcluir');

				this._confirmarExclusao(function () {
					if (oArquivo.id_documento) {
						aIdDocumentoParaExcluir.push(oArquivo.id_documento);
					}

					that._retirarArquivoDaTabela(oArquivo);
					that._atualizarStatusPodeEncerrar();
				});
			},

			_confirmarExclusao: function (onConfirm) {
				var dialog = new sap.m.Dialog({
					title: this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsConfirmation"),
					type: "Message",
					content: new sap.m.Text({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralConfimarExclusaoArquivo")
					}),
					beginButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralSim"),
						press: function () {
							dialog.close();
							if (onConfirm) {
								onConfirm();
							}
						}
					}),
					endButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralCancelar"),
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				dialog.open();
			},

			_zerarModel: function () {
				var oModel = new sap.ui.model.json.JSONModel({
					IsIFrame: false,
					PodeEncerrar: false,
					RespostaObrigacao: {},
					Documentos: [],
					IdDocumentosParaExcluir: [],
					DataConclusao: null
				});

				oModel.setSizeLimit(500);

				this.setModel(oModel);

				this.setModel(new JSONModel(), "anexos");
			},

			_onRouteMatched: function (oEvent) {
				var that = this;

				const oEventoInicial = jQuery.extend(true, {}, oEvent);

				fetch(Constants.urlBackend + "verifica-auth", {
						credentials: "include"
					})
					.then((res) => {
						res.json()
							.then((response) => {

								if (response.success) {
									if (response.nivelAcesso == PerfilUsuario.MANAGER) {
										this.isIFrame = function () {
											return true;
										}
									}
									continuarRouteMatched(oEventoInicial);
								} else {
									sap.m.MessageToast.show(response.error.msg);
									that.getRouter().navTo("login");
								}
							})
							.catch((err) => {
								sap.m.MessageToast.show(err);
								that.getRouter().navTo("login");
							});
					})
					.catch((err) => {
						sap.m.MessageToast.show(err);
						that.getRouter().navTo("login");
					});

				var continuarRouteMatched = function (event) {
					that._zerarModel();

					var oParametros;

					if (that.isVisualizacaoUsuario()) {
						oParametros = that.fromURIComponent(event.getParameter("arguments").parametros);
					} else {
						oParametros = event;
						that._inceptionParams = event;
					}

					var ocultarPenalidade = false;

					if (oParametros.Obrigacao.status_obrigacao_calculado != 5 && oParametros.Obrigacao.status_obrigacao_calculado != 7) {
						ocultarPenalidade = true;
					}

					if (oParametros.Obrigacao.status_obrigacao_calculado === 5) {
						that.getModel().setProperty("/ConfirmarPenalidade", true);
					}

					if (oParametros.Obrigacao.status_obrigacao_calculado === 5 || oParametros.Obrigacao.status_obrigacao_calculado === 7) {
						that.getModel().setProperty("/ocultarJustificativa", true);
					}

					that.getModel().setProperty("/ocultarPenalidade", ocultarPenalidade);
					that.getModel().setProperty("/IsIFrame", that.isIFrame());
					that.getModel().setProperty("/IsDeclaracao", false);
					that.getModel().setProperty("/Linguagem", sap.ui.getCore().getConfiguration().getLanguage().toUpperCase());

					var idObrigacao = oParametros.Obrigacao["id_resposta_obrigacao"];
					var idAnoCalendario = oParametros.idAnoCalendario;
					that.getModel().setProperty("/AnoSelecionadoAnteriormente", idAnoCalendario);
					oParametros.Obrigacao["suporte_contratado"] = (!!oParametros.Obrigacao["suporte_contratado"] === true ? true : false);
					oParametros.Obrigacao["confirmar_penalidade"] = (!!oParametros.Obrigacao["confirmar_penalidade"] === true ? true : false);
					oParametros.Obrigacao["ObrigacaoIniciada"] = oParametros.Obrigacao.ind_iniciada ? true : false;
					that.getModel().setProperty("/JaEstavaIniciada", (!oParametros.Obrigacao.ind_iniciada ? true : false));
					that.getModel().setProperty("/JaEstavaPreenchido", (oParametros.Obrigacao["data_extensao"] ? true : false));
					that.getModel().setProperty("/JaDataObrigacaoConcluida", (!!oParametros.Obrigacao["data_conclusao"] === false ? true : false));
					that.getModel().setProperty("/ConfirmarPenalidade", (!!oParametros.Obrigacao["confirmar_penalidade"] === false ? true : false));
					that.getModel().setProperty("/CancelaBotaoConfirmar", (!!oParametros.Obrigacao["data_conclusao"] === false ? true : false));
					that.getModel().setProperty("/NomeUsuario", oParametros.nomeUsuario);
					that.getModel().setProperty('/IsAreaUsuario', !that.isIFrame());

					that.setBusy(that.getView(), true);

					that.getModel().setProperty("/RespostaObrigacao", oParametros.Obrigacao);
					that.getModel().setProperty('/CopiaResposta', Object.assign({}, oParametros.Obrigacao));

					NodeAPI.listarRegistros("DominioMoeda", function (response) { // 1 COMPLIANCE
						if (response) {
							response.unshift({});
							that.getModel().setProperty("/DominioMoeda", response);
							that.getModel().setProperty('/RespostaObrigacao', that.getModel().getProperty('/CopiaResposta'));

							that.setBusy(that.getView(), false);

							if (!idObrigacao) {
								NodeAPI.pCriarRegistro('RespostaObrigacao', {
										fkIdRelModeloEmpresa: oParametros.Obrigacao["id_rel_modelo_empresa"],
										fkIdDominioAnoCalendario: oParametros.Obrigacao.id_dominio_ano_calendario
									})
									.then(function (res) {
										var generatedId = JSON.parse(res)[0].generated_id;

										that.getModel().getProperty('/RespostaObrigacao').id_resposta_obrigacao = generatedId;

										that._atualizarDocumentos('/Documentos', generatedId, that.byId("tabelaDocumentos"));
									});
							} else {
								that._atualizarDocumentos('/Documentos', idObrigacao, that.byId("tabelaDocumentos"));
							}
						}
					});
				}
			}
		});
	}
);