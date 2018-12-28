sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/lib/Arquivo",
		"ui5ns/ui5/lib/jQueryMask",
		"ui5ns/ui5/model/Constants"
	],
	function (BaseController, NodeAPI, Utils, Arquivo, jQueryMask, Constants) {
		BaseController.extend("ui5ns.ui5.controller.compliance.FormularioDetalhesObrigacao", {

			onInit: function () {

				//this.setModel(new sap.ui.model.json.JSONModel({}));
				this.setModel(new sap.ui.model.json.JSONModel({
					RespostaObrigacao: {
						/*
						 {
        				"id_resposta_obrigacao": 1,
        				"suporte_contratado": "True",
        				"suporte_especificacao": "BlaBla",
        				"suporte_valor": 1000.00,
        				"fk_id_dominio_moeda.id_dominio_moeda": 1,
        				"fk_id_rel_modelo_empresa.id_rel_modelo_empresa": "1",
        				"fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal": "1",
        				"fk_id_dominio_ano_calendario.id_dominio_ano_calendario": 1,
        			},
						*/
					}
				}));
				this.getRouter().getRoute("complianceFormularioDetalhesObrigacao").attachPatternMatched(this._onRouteMatched, this);

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

						that.setBusy(oTable, false);
					})
					.catch(function (err) {
						sap.m.MessageToast.show(err);

						that.setBusy(oTable, false);
					});
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

			onSalvar: function () {
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(this.getResourceBundle().getText("formularioObrigacaoMsgSalvar"), {
					title: "Confirm",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							//that.getRouter().navTo("complianceListagemObrigacoes");
							var obj = that.getModel().getProperty("/RespostaObrigacao");

							if (obj["ObrigacaoIniciada"] && obj["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] == 4) {
								obj["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] = 1;
							}

							//Verificar se a data atual já passou para colocar status como em atraso
							if (obj["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] == 1 || obj[
									"fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] == 5 || obj[
									"fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] == 4) {
								if (obj["data_extensao"]) {
									var dataPrazo = Utils.bancoParaJsDate(obj["data_extensao"]);
								} else if (obj["prazo_entrega_customizado"]) {
									var dataPrazo = Utils.bancoParaJsDate(obj["prazo_entrega_customizado"]);
								} else {
									var dataPrazo = Utils.bancoParaJsDate(obj["prazo_entrega"]);
								}
								var dataAtual = new Date();
								dataPrazo = new Date(dataPrazo.getFullYear(), dataPrazo.getMonth(), dataPrazo.getDate(), 23, 59, 59, 0);
								if (dataPrazo < dataAtual) {
									obj["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] = 5;
								} else {
									obj["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] = 1;
								}
							}

							NodeAPI.atualizarRegistro("RespostaObrigacao", obj.id_resposta_obrigacao, {
								suporteContratado: obj["suporte_contratado"],
								suporteEspecificacao: obj["suporte_especificacao"],
								suporteValor: obj["suporte_valor"],
								fkIdDominioMoeda: obj["fk_id_dominio_moeda.id_dominio_moeda"],
								fkIdRelModeloEmpresa: obj["fk_id_rel_modelo_empresa.id_rel_modelo_empresa"],
								fkIdDominioAnoFiscal: obj["fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal"],
								fkIdDominioAnoCalendario: obj["fk_id_dominio_ano_calendario.id_dominio_ano_calendario"],
								fkIdDominioObrigacaoStatusResposta: obj["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"],
								dataExtensao: obj["data_extensao"]
							}, function (response) {
								that.getView().byId("fileUploader").setValue("");
								that.getRouter().navTo("complianceListagemObrigacoes");
							});
						}
					}
				}); //sap.m.MessageToast.show("Cancelar inserção");
			},

			onCancelar: function () {
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(this.getResourceBundle().getText("formularioObrigacaoMsgCancelar"), {
					title: "Confirm",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							that.getRouter().navTo("complianceListagemObrigacoes");
						}
					}
				});
				//sap.m.MessageToast.show("Cancelar inserção");
			},

			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			navToPage2: function () {
				this.getRouter().navTo("complianceListagemObrigacoes");
			},

			onTrocarSuporte: function () {
				var obj = this.getModel().getProperty("/RespostaObrigacao");
				if (!!obj["suporte_contratado"] == false) {
					obj["suporte_especificacao"] = "";
					obj["fk_id_dominio_moeda.id_dominio_moeda"] = "";
					obj["suporte_valor"] = "";
				}
			},

			onEnviarArquivo: function (oEvent, sProperty) {
				var that = this;
				var oFileUploader = this.getView().byId("fileUploader");
				var obj2 = that.getModel().getProperty("/RespostaObrigacao");
				var DataConclusao = that.byId("DataAtual").getDateValue();
				var oBtnEnviar = oEvent.getSource();
				var oTable = this.byId("tabelaDocumentos");
				var DataFormatada;

				var oData = {

					indConclusao: false,
					id: obj2["id_resposta_obrigacao"]
				};

				//if (DataConclusao === null) {
				//if (!this.getModel().getProperty("/JaDataObrigacaoConcluida")) {
				if (!this.getModel().getProperty("/IsDeclaracao")) {
					if (oFileUploader.getValue()) {
						oBtnEnviar.setEnabled(false);
						this.getModel().setProperty("/CancelaBotaoConfirmar", false);
						this.getModel().setProperty("/CancelaBotaoCancelar", false);
						this.setBusy(oBtnEnviar, true);
						Arquivo.upload(oFileUploader.oFileUpload.files[0], oFileUploader.getValue(), "UploadDocumento", oData)
							.then(function (response) {
								//sap.m.MessageToast.show(response);
								that._atualizarDocumentos('/Documentos', oData.id, oTable);
								oFileUploader.setValue("");
								oBtnEnviar.setEnabled(true);
								that.setBusy(oBtnEnviar, false);
								that.getModel().setProperty("/CancelaBotaoConfirmar", true);
								that.getModel().setProperty("/CancelaBotaoCancelar", true);
							})
							.catch(function (err) {
								sap.m.MessageToast.show(err);
								oBtnEnviar.setEnabled(true);
								that.setBusy(oBtnEnviar, false);
								that.getModel().setProperty("/CancelaBotaoConfirmar", true);
								that.getModel().setProperty("/CancelaBotaoCancelar", true);
							});
					} else {
						sap.m.MessageToast.show("Selecione um arquivo");
					}

				} else {
					DataFormatada = DataConclusao.getFullYear() + "-" + (DataConclusao.getMonth() + 1) + "-" + DataConclusao.getDate();
					this.getModel().setProperty("/CancelaBotaoConfirmar", false);
					this.getModel().setProperty("/CancelaBotaoCancelar", false);

					var oBtnCancelar = new sap.m.Button({
						text: "{i18n>formularioObrigacaoBotaoCancelar}"
					});

					var dialog = new sap.m.Dialog({
						title: "{i18n>ViewDetalheTrimestreJSTextsConfirmation}",
						type: "Message",
						content: new sap.m.Text({
							//ATTENTION! You are in the process of closing the Obligation, Are you sure you want to continue?
							text: "{i18n>viewMensagemObrigacao}"
						}),
						beginButton: new sap.m.Button({
							text: "{i18n>viewGeralSim}",
							press: function (oEvent2) {
								if (oFileUploader.getValue()) {
									oEvent2.getSource().setEnabled(false);
									oBtnCancelar.setEnabled(false);
									that.setBusy(dialog, true);
									oData.indConclusao = true;
									oBtnEnviar.setEnabled(false);
									that.setBusy(oBtnEnviar, true);
									Arquivo.upload(oFileUploader.oFileUpload.files[0], oFileUploader.getValue(), "UploadDocumento", oData)
										.then(function (response) {
											//sap.m.MessageToast.show(response);
											that._atualizarDocumentos('/Documentos', oData.id, oTable);

											var IntMes = DataConclusao.getMonth(); //Number(DataConclusao.toString());
											IntMes = IntMes + 1;
											var strMes = IntMes.toString();

											that.getModel().getProperty("/RespostaObrigacao")["data_conclusao"] = DataConclusao.getFullYear() + "-" + strMes + "-" +
												DataConclusao.getDate();
											that._AtualizaStatusObrigacao(DataFormatada);

											var obj = that.getModel().getProperty("/RespostaObrigacao");

											NodeAPI.atualizarRegistro("RespostaObrigacao", obj.id_resposta_obrigacao, {
												suporteContratado: obj["suporte_contratado"],
												suporteEspecificacao: obj["suporte_especificacao"],
												suporteValor: obj["suporte_valor"],
												fkIdDominioMoeda: obj["fk_id_dominio_moeda.id_dominio_moeda"],
												fkIdRelModeloEmpresa: obj["fk_id_rel_modelo_empresa.id_rel_modelo_empresa"],
												fkIdDominioAnoFiscal: obj["fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal"],
												fkIdDominioAnoCalendario: obj["fk_id_dominio_ano_calendario.id_dominio_ano_calendario"],
												fkIdDominioObrigacaoStatusResposta: obj["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"],
												dataExtensao: obj["data_extensao"],
												dataConclusao: obj["data_conclusao"]
											}, function (response2) {
												that.getRouter().navTo("complianceListagemObrigacoes");
												that.getModel().setProperty("/CancelaBotaoConfirmar", true);
												that.getModel().setProperty("/CancelaBotaoCancelar", true);
												oFileUploader.setValue("");
												oBtnEnviar.setEnabled(true);
												that.setBusy(oBtnEnviar, false);
												dialog.close();
											});

										})
										.catch(function (err) {
											sap.m.MessageToast.show(err);
											oBtnEnviar.setEnabled(true);
											that.setBusy(oBtnEnviar, false);
											that.getModel().setProperty("/CancelaBotaoConfirmar", true);
											that.getModel().setProperty("/CancelaBotaoCancelar", true);
											dialog.close();
										});
								} else {
									sap.m.MessageToast.show("Selecione um arquivo");
								}

							}
						}),
						endButton: oBtnCancelar,
						afterClose: function () {
							dialog.destroy();
						}
					});

					oBtnCancelar.attachPress(function (oEvent2) {
						dialog.close();
					});

					this.getView().addDependent(dialog);

					dialog.open();
				}
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
					prazo_entrega_customizado = new Date(this.getModel().getProperty("RespostaObrigacao")["ano_calendario"] + '-' + strMes + '-' + arryData[2]);
				} else {
					prazo_entrega_customizado = null;
				}
				arryData = obj2["prazo_entrega"].split('-');
				IntMes = Number(arryData[1].toString());
				IntMes = IntMes - 1;
				strMes = IntMes.toString();
				var prazo_entrega = new Date(this.getModel().getProperty("RespostaObrigacao")["ano_calendario"] + '-' + strMes + '-' + arryData[2]);
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

						oArquivo.btnExcluirEnabled = true;
						oArquivo.btnDownloadEnabled = true;
						that.setBusy(oButton, false);
						that.getModel().refresh();
					})
					.catch(function (err) {
						sap.m.MessageToast.show("Erro ao baixar arquivo: " + oArquivo.nome_arquivo);

						oArquivo.btnExcluirEnabled = true;
						oArquivo.btnDownloadEnabled = true;
						that.setBusy(oButton, false);
						that.getModel().refresh();
					});
			},

			onExcluirArquivo: function (oEvent) {
				var that = this,
					oButton = oEvent.getSource(),
					oArquivo = oEvent.getSource().getBindingContext().getObject(),
					oTable = this.byId("tabelaDocumentos"),
					idObrigacao = that.getModel().getProperty("/RespostaObrigacao")["id_resposta_obrigacao"];

				this._confirmarExclusao(function () {
					oArquivo.btnExcluirEnabled = false;
					oArquivo.btnDownloadEnabled = false;
					that.getModel().refresh();
					that.setBusy(oButton, true);

					Arquivo.excluir("ExcluirDocumento/" + oArquivo.id_documento)
						.then(function (response) {
							//sap.m.MessageToast.show(response);
							that._atualizarDocumentos('/Documentos', idObrigacao, oTable);

							oArquivo.btnExcluirEnabled = true;
							oArquivo.btnDownloadEnabled = true;
							that.setBusy(oButton, false);
							that.getModel().refresh();
						})
						.catch(function (err) {
							sap.m.MessageToast.show("Erro ao excluir arquivo: " + oArquivo.nome_arquivo);

							oArquivo.btnExcluirEnabled = true;
							oArquivo.btnDownloadEnabled = true;
							that.setBusy(oButton, false);
							that.getModel().refresh();
						});
				});
			},

			_confirmarExclusao: function (onConfirm) {
				var dialog = new sap.m.Dialog({
					title: this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsConfirmation"),
					type: "Message",
					content: new sap.m.Text({
						text: "Você tem certeza que deseja excluir este arquivo?"
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

			_onRouteMatched: function (oEvent) {
				this.getModel().setProperty("/IsDeclaracao", false);
				this.getModel().setProperty("/Linguagem", sap.ui.getCore().getConfiguration().getLanguage().toUpperCase());

				var that = this;
				NodeAPI.listarRegistros("DominioMoeda", function (response) { // 1 COMPLIANCE
					if (response) {
						that.getModel().setProperty("/DominioMoeda", response);
					}

				});
				var oParametros = JSON.parse(oEvent.getParameter("arguments").parametros);
				var idObrigacao = oParametros.Obrigacao["id_resposta_obrigacao"];
				oParametros.Obrigacao["suporte_contratado"] = (!!oParametros.Obrigacao["suporte_contratado"] === true ? true : false);
				oParametros.Obrigacao["ObrigacaoIniciada"] = oParametros.Obrigacao[
					"fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] != 4 ? true : false;
				this.getModel().setProperty("/JaEstavaIniciada", (oParametros.Obrigacao[
					"fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] == 4 ? true : false));
				this.getModel().setProperty("/RespostaObrigacao", oParametros.Obrigacao);
				that.getModel().setProperty("/JaEstavaPreenchido", (oParametros.Obrigacao["data_extensao"] ? true : false));
				that.getModel().setProperty("/JaDataObrigacaoConcluida", (!!oParametros.Obrigacao["data_conclusao"] === false ? true : false));
				this.getModel().setProperty("/CancelaBotaoConfirmar", (!!oParametros.Obrigacao["data_conclusao"] === false ? true : false));
				this._atualizarDocumentos('/Documentos', idObrigacao, this.byId("tabelaDocumentos"));
			}
		});
	}
);