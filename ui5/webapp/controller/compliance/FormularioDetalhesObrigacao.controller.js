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

						this.setModel(new sap.ui.model.json.JSONModel({}));

						var idObrigacao = 1; //'PEGAR ID DA OBRIGACAO'

						this._atualizarDocumentos('/Documentos', idObrigacao, this.byId("tabelaDocumentos"));

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

						onSalvar: function () {
								var that = this;
								jQuery.sap.require("sap.m.MessageBox");
								sap.m.MessageBox.confirm(this.getResourceBundle().getText("formularioObrigacaoMsgSalvar"), {
									title: "Confirm",
									onClose: function (oAction) {
										if (sap.m.MessageBox.Action.OK === oAction) {
											//that.getRouter().navTo("complianceListagemObrigacoes");
											var obj = that.getModel().getProperty("/RespostaObrigacao");

											//Verificar se a data atual já passou para colocar status como em atraso
											if (obj["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] == 4 || obj[
													"fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] == 1) {
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
								var oBtnEnviar = oEvent.getSource();
								var now = new Date();
								var oTable = this.byId("tabelaDocumentos");

								//var CkeckSelect = oEvent.getParameter("selected");	

								var oData = {

									dataEnvio: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
									id: 1 //this.getModel().getProperty("/id_resposta_obrigacao")
								};

								/*if(CkeckSelect === true)
									{
				
									}*/

								if (oFileUploader.getValue()) {
									oBtnEnviar.setEnabled(false);
									this.setBusy(oBtnEnviar, true);
									Arquivo.upload(oFileUploader.oFileUpload.files[0], oFileUploader.getValue(), "UploadDocumento", oData)
										.then(function (response) {
											//sap.m.MessageToast.show(response);
											that._atualizarDocumentos('/Documentos', oData.id, oTable);
											oFileUploader.setValue("");
											oBtnEnviar.setEnabled(true);
											that.setBusy(oBtnEnviar, false);
										})
										.catch(function (err) {
											sap.m.MessageToast.show(err);
											oBtnEnviar.setEnabled(true);
											that.setBusy(oBtnEnviar, false);
										});
								} else {
									sap.m.MessageToast.show("Selecione um arquivo");
								}
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
									idObrigacao = 1; // PEGAR ID OBRIGAÇÃO

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
								var that = this;
								NodeAPI.listarRegistros("DominioMoeda", function (response) { // 1 COMPLIANCE
									if (response) {
										that.getModel().setProperty("/DominioMoeda", response);
									}

								});

								var oParametros = JSON.parse(oEvent.getParameter("arguments").parametros);
								oParametros.Obrigacao["suporte_contratado"] = (!!oParametros.Obrigacao["suporte_contratado"] === true ? true : false);
								oParametros.Obrigacao["ObrigacaoIniciada"] = oParametros.Obrigacao[
									"fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] == 4 ? false : true;
								this.getModel().setProperty("/RespostaObrigacao", oParametros.Obrigacao);
								that.getModel().setProperty("/JaEstavaPreenchido", (oParametros.Obrigacao["data_extensao"] ? true : false));
							}
					});
			}
		);