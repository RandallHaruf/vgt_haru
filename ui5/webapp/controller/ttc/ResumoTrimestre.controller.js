sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/jQueryMask",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, JSONModel, NodeAPI, JQueryMask, Constants, Utils) {
		"use strict";

		BaseController.extend("ui5ns.ui5.controller.ttc.ResumoTrimestre", {

			onInit: function () {
				// sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR");

				this.setModel(new JSONModel());

				this.getRouter().getRoute("ttcResumoTrimestre").attachPatternMatched(this._onRouteMatched, this);
			},

			onTrocarAnoCalendario: function (oEvent) {
				this._atualizarDados();
			},

			onEditarPeriodo: function (oPeriodo) {
				var that = this;

				var oParams = {};

				oParams.oPeriodo = oPeriodo;
				oParams.oEmpresa = that.getModel().getProperty("/Empresa");
				oParams.oAnoCalendario = {
					idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado"),
					anoCalendario: this.byId("selectAnoCalendario").getSelectedItem().getText()
				};

				this.getRouter().navTo("ttcDetalheTrimestre", {
					oParameters: JSON.stringify(oParams)
				});
			},

			ContadorDeTempo: function (idModulo, trimestre) {
				var Hoje = new Date();
				var Periodo;
				if (idModulo == 2) { //Taxpackage
					switch (trimestre) {
					case 1:
						Periodo = new Date((new Date().getFullYear()) + "/04/31");
						break;
					case 2:
						Periodo = new Date((new Date().getFullYear()) + "/07/31");
						break;
					case 3:
						Periodo = new Date((new Date().getFullYear()) + "/10/31");
						break;
					case 4:
						Periodo = new Date((new Date().getFullYear()) + "/01/31");
						if (Hoje > new Date((new Date().getFullYear()) + "/10/31") && Hoje < new Date((new Date().getFullYear() + 1) + "/01/01")) {
							Periodo.setFullYear(Periodo.getFullYear() + 1);
						}
					}
				} else if (idModulo == 1) { //TTC
					switch (trimestre) {
					case 1:
						Periodo = new Date((new Date().getFullYear()) + "/04/20");
						break;
					case 2:
						Periodo = new Date((new Date().getFullYear()) + "/07/20");
						break;
					case 3:
						Periodo = new Date((new Date().getFullYear()) + "/10/20");
						break;
					case 4:
						Periodo = new Date((new Date().getFullYear()) + "/01/20");
						if (Hoje > new Date((new Date().getFullYear()) + "/10/20") && Hoje < new Date((new Date().getFullYear() + 1) + "/01/01")) {
							Periodo.setFullYear(Periodo.getFullYear() + 1);
						}
					}
				}

				var TTCTempoFalta = Periodo.getTime() - Hoje.getTime();
				var seconds = Math.floor(TTCTempoFalta / 1000);
				var minutes = Math.floor(seconds / 60);
				var hours = Math.floor(minutes / 60);
				var days = Math.floor(hours / 24);

				return parseInt(days) + 1;
			},

			_dialogAviso: function (sMensagem, callbackAfterClose) {
				var that = this;

				var dialog2 = new sap.m.Dialog({
					title: that.getView().getModel("i18n").getResourceBundle().getText("viewResumoTrimestreJSTEXTSAviso"),
					type: "Message",
					content: new sap.m.Text({
						text: sMensagem
					}),
					endButton: new sap.m.Button({
						text: that.getView().getModel("i18n").getResourceBundle().getText("viewResumoTrimestreJSTEXTSFechar"),
						press: function () {
							dialog2.close();
						}
					}),
					afterClose: function () {
						dialog2.destroy();

						if (callbackAfterClose) {
							callbackAfterClose();
						}
					}
				});

				dialog2.open();
			},

			_dialogImpostoNaoDeclarado: function (aImpostoNaoDeclarado, callback) {
				var msgBorne = [];
				var msgCollected = [];

				for (var i = 0, length = aImpostoNaoDeclarado.length; i < length; i++) {
					if (aImpostoNaoDeclarado[i]["fk_dominio_tax_classification.id_dominio_tax_classification"] === 1) {
						msgBorne.push(aImpostoNaoDeclarado[i].tax);
					} else {
						msgCollected.push(aImpostoNaoDeclarado[i].tax);
					}
				}

				if (msgBorne.length || msgCollected.length) {
					var oVBox = new sap.m.VBox();

					var oHBox = new sap.m.HBox({
						justifyContent: "Center"
					}).addItem(new sap.m.Text({
						text: this.getResourceBundle().getText("viewTTCDetalheTrimestreMensagemAvisoImpostoNaoDeclarado")
					}).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBottom"));

					oVBox.addItem(oHBox);

					var criarPainelTax = function (aMsgTax, sTitulo) {
						if (aMsgTax.length) {
							var oPanel = new sap.m.Panel({
								expandable: true,
								expanded: false,
								headerText: sTitulo
							});

							var oHBoxInterno = new sap.m.VBox();

							for (var i = 0, length = aMsgTax.length; i < length; i++) {
								var oText = new sap.m.Text({
									text: aMsgTax[i]
								}).addStyleClass("bulletItem");

								oHBoxInterno.addItem(oText);
							}

							oPanel.addContent(oHBoxInterno);

							oVBox.addItem(oPanel);
						}
					};

					criarPainelTax(msgBorne, this.getResourceBundle().getText("viewGeralBorne"));

					criarPainelTax(msgCollected, this.getResourceBundle().getText("viewGeralCollected"));

					var dialog = new sap.m.Dialog({
						contentHeight: "150px",
						title: this.getResourceBundle().getText("viewGeralAviso"),
						type: "Message",
						content: oVBox,
						beginButton: new sap.m.Button({
							text: this.getResourceBundle().getText("viewGeralCancelar"),
							press: function () {
								dialog.close();
							}
						}),
						endButton: new sap.m.Button({
							text: this.getResourceBundle().getText("viewGeralContinuar"),
							press: function () {
								dialog.close();

								if (callback) {
									callback();
								}
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					}).addStyleClass("sapUiNoContentPadding");

					dialog.open();
				} else {
					if (callback) {
						callback();
					}
				}
			},

			_realizarEncerramentoPeriodo: function (idEmpresa, idPeriodo) {
				var that = this;

				NodeAPI.atualizarRegistro("EncerrarTrimestreTTC", "", {
					idEmpresa: idEmpresa,
					idPeriodo: idPeriodo
				}, function (response) {
					var json = JSON.parse(response);

					if (json.success) {
						that._atualizarDados();
					} else {
						that._dialogAviso(json.message);
					}
				});
			},

			onSubmeterPeriodo: function (oPeriodo) {
				var that = this,
					sIdEmpresa = this.getModel().getProperty("/Empresa").id_empresa;

				var dialog = new sap.m.Dialog({
					title: this.getView().getModel("i18n").getResourceBundle().getText("viewResumoTrimestreJSTEXTSConfirmaçãodeFechamento"),
					type: "Message",
					content: new sap.m.Text({
						text: this.getView().getModel("i18n").getResourceBundle().getText(
							"viewResumoTrimestreJSTEXTSVocêtemcertezaquedesejafecharoperíodo")
					}),
					beginButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewResumoTrimestreJSTEXTSSubmeter"),
						press: function () {
							NodeAPI.pListarRegistros("VerificarImpostoNaoDeclarado", {
									idEmpresa: sIdEmpresa,
									idPeriodo: oPeriodo.id_periodo
								})
								.then(function (res) {
									dialog.close();

									if (res.result.length) {
										that._dialogImpostoNaoDeclarado(res.result, function () {
											that._realizarEncerramentoPeriodo(sIdEmpresa, oPeriodo.id_periodo);
										});
									} else {
										that._realizarEncerramentoPeriodo(sIdEmpresa, oPeriodo.id_periodo);
									}
								})
								.catch(function (err) {
									dialog.close();

									if (err.status) {
										that._dialogAviso(err.status + " - " + err.statusText + "\nMessage: " + err.responseJSON.error.message);
									} else {
										that._dialogAviso(err.message);
									}
								});
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

			_formatDate: function (date) {
				var that = this;

				var d = new Date(date),
					month = '' + (d.getMonth() + 1),
					day = '' + d.getDate(),
					year = d.getFullYear();

				if (month.length < 2) month = '0' + month;
				if (day.length < 2) day = '0' + day;

				return [year, month, day].join('-');
			},

			_onEnviarMensagem: function (vEmpresa, vPeriodo) {
				var that = this;

				var assunto = "TTC - Quarter reopening - " + vEmpresa + " - " + vPeriodo;
				var htmlBody =
					"<p>Dear Administrator,</p><br><p>&nbsp;A user is requesting to reopen a closed quarter in the TTC module at <a href='" + document.domain +
					"'>Vale Global Tax (VGT)</a> Your approval is required</p><p>Thank you in advance.</p><p>Global Tax Team</p>";

				jQuery.ajax({ //Desativar botao
					url: Constants.urlBackend + "EmailSend",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					type: "POST",
					data: {
						_assunto: assunto,
						_corpo: htmlBody
					},
					success: function (response) {
						//sap.m.MessageToast.show("Email enviado com sucesso");
					}
				});
			},

			onReabrirPeriodo: function (oEvent, oPeriodo) {
				var that = this,
					oButton = oEvent.getSource();

				that.setBusy(oButton, true);

				NodeAPI.pListarRegistros("RequisicaoReabertura", {
						status: 1,
						empresa: oPeriodo["fk_empresa.id_empresa"],
						periodo: oPeriodo.id_periodo
					})
					.then(function (res) {
						if (res.length > 0) {
							var popup = new sap.m.Dialog({
								title: that.getResourceBundle().getText("viewResumoTrimestreJSTEXTSAviso"),
								type: "Message",
								content: new sap.m.Text({
									text: that.getResourceBundle().getText("viewTPRequisicaoReaberturaPendente")
								}),
								endButton: new sap.m.Button({
									text: that.getResourceBundle().getText("viewGeralFechar"),
									press: function () {
										popup.close();
									}
								})
							})
							popup.open();
						} else {
							var oParams = {};

							oParams.oPeriodo = oPeriodo;
							oParams.oEmpresa = that.getModel().getProperty("/Empresa");
							oParams.oAnoCalendario = {
								idAnoCalendario: that.getModel().getProperty("/AnoCalendarioSelecionado"),
								anoCalendario: that.byId("selectAnoCalendario").getSelectedItem().getText()
							};

							var oForm = new sap.ui.layout.form.Form({
								editable: true
							}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
								singleContainerFullSize: false
							}));

							var oFormContainer = new sap.ui.layout.form.FormContainer();

							var oFormElement = new sap.ui.layout.form.FormElement({
								label: "{i18n>viewGeralEmpresa}"
							}).addField(new sap.m.Text({
								text: "{/Empresa/nome}"
							}));

							oFormContainer.addFormElement(oFormElement);

							oFormElement = new sap.ui.layout.form.FormElement({
								label: "{i18n>viewGeralPeriodo}"
							}).addField(new sap.m.Text({
								text: oPeriodo.periodo
							}));

							oFormContainer.addFormElement(oFormElement);

							var oTextArea = new sap.m.TextArea({
								rows: 5
							}).attachChange(function (oEvent) {
								if (oEvent.getSource().getValue()) {
									oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
									oEvent.getSource().setValueStateText("");
								}
							});

							var oLabel = new sap.m.Label({
								text: "{i18n>viewGeralJustificativa}"
							}).addStyleClass("sapMLabelRequired");

							oFormElement = new sap.ui.layout.form.FormElement().setLabel(oLabel).addField(oTextArea);

							oFormContainer.addFormElement(oFormElement);

							oForm.addFormContainer(oFormContainer);

							var dialog = new sap.m.Dialog({
								title: "{i18n>viewGeralNovaRequisicao}",
								content: oForm,
								beginButton: new sap.m.Button({
									text: "{i18n>viewGeralSalvar}",
									press: function () {
										if (oTextArea.getValue()) {
											NodeAPI.criarRegistro("RequisicaoReabertura", {
												dataRequisicao: that._formatDate(new Date()),
												idUsuario: "2", //TROCAR PELA SESSION ID USUARIO
												nomeUsuario: "Juliana Mauricio",
												justificativa: oTextArea.getValue(),
												resposta: "",
												fkDominioRequisicaoReaberturaStatus: "1",
												fkEmpresa: oParams.oEmpresa.id_empresa,
												fkPeriodo: oPeriodo.id_periodo,
												nomeEmpresa: oParams.oEmpresa.nome
											}, function (response) {
												dialog.close();
												that._onEnviarMensagem(oParams.oEmpresa.nome, oPeriodo.periodo);
												sap.m.MessageToast.show(that.getResourceBundle().getText("viewResumoTrimestreToast"));
											});
										} else {
											oTextArea.setValueState(sap.ui.core.ValueState.Error);
											oTextArea.setValueStateText(that.getResourceBundle().getText("viewGeralCampoNaoPodeSerVazio"));
										}
									}.bind(that)
								}),
								endButton: new sap.m.Button({
									text: "{i18n>viewGeralSair}",
									press: function () {
										dialog.close();
									}.bind(that)
								}),
								afterClose: function () {
									that.getView().removeDependent(dialog);
									dialog.destroy();
								}
							});

							// to get access to the global model
							that.getView().addDependent(dialog);

							dialog.open();
						}

						that.setBusy(oButton, false);
					})
					.catch(function (err) {
						console.log(err);

						that.setBusy(oButton, false);
					});
			},

			onVisualizarPeriodo: function (oPeriodo) {
				var that = this;

				var oParams = {};

				oParams.oPeriodo = oPeriodo;
				oParams.oEmpresa = that.getModel().getProperty("/Empresa");
				oParams.oAnoCalendario = {
					idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado"),
					anoCalendario: this.byId("selectAnoCalendario").getSelectedItem().getText()
				};

				this.getRouter().navTo("ttcVisualizacaoTrimestre", {
					oParameters: JSON.stringify(oParams)
				});
			},

			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			navToPage2: function () {
				this.getRouter().navTo("ttcListagemEmpresas", {
					parametros: JSON.stringify({
						idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
					})
				});
			},

			navToRequisicoes: function () {
				var oParametros = {
					empresa: this.getModel().getProperty("/Empresa"),
					anoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
				};

				this.getRouter().navTo("ttcRequisicaoReabertura", {
					parametros: JSON.stringify(oParametros)
				});
			},

			_onRouteMatched: function (oEvent) {
				var that = this;

				if (this.isIFrame()) {
					this.mostrarAcessoRapidoInception();
					this.byId("btnRequisicoes").setVisible(false);
				}

				var oEmpresa = JSON.parse(oEvent.getParameter("arguments").oEmpresa);
				var idAnoCalendario = oEvent.getParameter("arguments").idAnoCalendario;

				this.getModel().setProperty("/AnoCalendarioSelecionado", idAnoCalendario);
				this.getModel().setProperty("/Empresa", oEmpresa);

				NodeAPI.listarRegistros("/DominioAnoCalendario", function (response) {
					if (response) {
						that.getModel().setProperty("/DominioAnoCalendario", response);

						that._atualizarDados();
					}
				});
			},

			_atualizarDados: function () {
				var that = this;

				var sIdEmpresa = this.getModel().getProperty("/Empresa").id_empresa;
				var sIdAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado");

				var sEntidade = "DeepQuery/RelacionamentoEmpresaPeriodo?empresa=" + sIdEmpresa + "&anoCalendario=" + sIdAnoCalendario + "&modulo=1"; // TTC

				var aIdToolbar = {};
				aIdToolbar[1] = "toolbarPrimeiroPeriodo";
				aIdToolbar[2] = "toolbarSegundoPeriodo";
				aIdToolbar[3] = "toolbarTerceiroPeriodo";
				aIdToolbar[4] = "toolbarQuartoPeriodo";

				NodeAPI.listarRegistros(sEntidade, function (response) {
					that.byId(aIdToolbar[1]).removeAllContent();
					that.byId(aIdToolbar[2]).removeAllContent();
					that.byId(aIdToolbar[3]).removeAllContent();
					that.byId(aIdToolbar[4]).removeAllContent();

					if (response) {
						for (var i = 0; i < response.length; i++) {
							var oPeriodo = response[i];

							if (that.isIFrame()) {
								that._popularToolbarInception(aIdToolbar[oPeriodo.numero_ordem], oPeriodo);
							} else {
								if (oPeriodo.ind_ativo) {
									that._popularToolbarPeriodoCorrente(aIdToolbar[oPeriodo.numero_ordem], oPeriodo);
								} else {
									that._popularToolbarPeriodoFechado(aIdToolbar[oPeriodo.numero_ordem], oPeriodo);
								}
							}
						}
					}
				});

				this._setBusy(true);

				var oAnoCalendario = this.getModel().getProperty("/DominioAnoCalendario").find(function (obj) {
					return obj.id_dominio_ano_calendario === Number(sIdAnoCalendario);
				});

				NodeAPI.listarRegistros("ResumoTrimestreTTC?empresa=" + sIdEmpresa + "&anoCalendario=" + JSON.stringify(oAnoCalendario),
					function (response) {
						if (response) {
							var aKeys = Object.keys(response);
							for (var i = 0, length = aKeys.length; i < length; i++) {
								var sKey = aKeys[i];

								var aPagamento = response[sKey];

								for (var j = 0, length2 = aPagamento.length; j < length2; j++) {
									var oPagamento = aPagamento[j];

									oPagamento.categoria = Utils.traduzCategoriaPagamento(oPagamento.categoria, that);

									oPagamento.primeiroValor = (oPagamento.primeiroValor ? parseInt(oPagamento.primeiroValor, 10) : 0);
									oPagamento.segundoValor = (oPagamento.segundoValor ? parseInt(oPagamento.segundoValor, 10) : 0);
									oPagamento.terceiroValor = (oPagamento.terceiroValor ? parseInt(oPagamento.terceiroValor, 10) : 0);
									oPagamento.total = (oPagamento.total ? parseInt(oPagamento.total, 10) : 0);
								}
							}
							that.getModel().setProperty("/Resumo", response);
						}

						that._setBusy(false);
					});
			},

			_popularToolbarInception: function (sIdToolbar, oPeriodo) {
				var that = this,
					oToolbar = this.byId(sIdToolbar);

				oToolbar.addContent(new sap.m.ToolbarSpacer());

				var oButton = new sap.m.Button({
					icon: "sap-icon://show-edit",
					text: that.getResourceBundle().getText("viewGeralVisualizar"),
					type: "Default"
				}).attachPress(function () {
					that.onVisualizarPeriodo(oPeriodo);
				});

				oToolbar.addContent(oButton);
			},

			_popularToolbarPeriodoFechado: function (sIdToolbar, oPeriodo) {
				var that = this;

				var oToolbar = this.byId(sIdToolbar);

				oToolbar.addContent(new sap.m.ToolbarSpacer());

				// <Button icon="sap-icon://show-edit" text="{i18n>viewGeralBotaoVisualizar}" type="Default" press="onVisualizarPeriodo"/>
				var oButton = new sap.m.Button({
					icon: "sap-icon://show-edit",
					text: that.getResourceBundle().getText("viewGeralVisualizar"),
					type: "Default"
				}).attachPress(function () {
					that.onVisualizarPeriodo(oPeriodo);
				});

				oToolbar.addContent(oButton);

				// <Button icon="sap-icon://permission" text="{i18n>viewGeralBotaoReabertura}" press="onReabrirPeriodo"/>
				oButton = new sap.m.Button({
					icon: "sap-icon://permission",
					text: that.getResourceBundle().getText("viewGeralReabertura")
				}).attachPress(function (event) {
					that.onReabrirPeriodo(event, oPeriodo);
				});

				oToolbar.addContent(oButton);
			},

			_isPeriodoCorrente: function (iNumeroOrdem) {
				var now = new Date(),
					dataInicio,
					dataFim,
					iCurrentYear = now.getFullYear();

				now.setYear(this.byId("selectAnoCalendario").getSelectedItem().getText());

				switch (iNumeroOrdem) {
				case 1:
					dataInicio = new Date(iCurrentYear + "/01/21");
					dataFim = new Date(iCurrentYear + "/04/20");
					return now >= dataInicio && now <= dataFim;
				case 2:
					dataInicio = new Date(iCurrentYear + "/04/21");
					dataFim = new Date(iCurrentYear + "/07/20");
					return now >= dataInicio && now <= dataFim;
				case 3:
					dataInicio = new Date(iCurrentYear + "/07/21");
					dataFim = new Date(iCurrentYear + "/10/20");
					return now >= dataInicio && now <= dataFim;
				case 4:
					var iAux;
					//if (now >= new Date(iCurrentYear + "/01/1") && now <= new Date(iCurrentYear + "/01/20")) {
					if (now.getMonth() === 0 && now.getDate() >= 1 && now.getDate() <= 31) {
						iAux = iCurrentYear - 1;
						dataInicio = new Date(iAux + "/10/21");
						dataFim = new Date(iCurrentYear + "/01/20");
					} else {
						iAux = iCurrentYear + 1;
						dataInicio = new Date(iCurrentYear + "/10/21");
						dataFim = new Date(iAux + "/01/20");
					}

					return now >= dataInicio && now <= dataFim;
				}

				return false;
			},

			_popularToolbarPeriodoCorrente: function (sIdToolbar, oPeriodo) {
				var that = this;

				var oToolbar = this.byId(sIdToolbar);

				if (this._isPeriodoCorrente(oPeriodo.numero_ordem)) {
					oToolbar.addContent(new sap.m.Title({
						text: that.getResourceBundle().getText("viewGeralFaltamXDias", [that.ContadorDeTempo(1, oPeriodo.numero_ordem)])
					}));
				} else {
					if(oPeriodo.DiasRestantes && oPeriodo.ind_ativo == true) {
						oToolbar.addContent(new sap.m.Title({
							text: that.getResourceBundle().getText("viewGeralFaltamXDias", [oPeriodo.DiasRestantes])
						}));	
					}
				}

				oToolbar.addContent(new sap.m.ToolbarSpacer());

				// <Button icon="sap-icon://edit" text="{i18n>viewGeralBotaoEditar}" type="Accept" press="onEditarPeriodo"/>
				var oButton = new sap.m.Button({
					icon: "sap-icon://edit",
					text: that.getResourceBundle().getText("viewGeralEditar"),
					type: "Accept"
				}).attachPress(function () {
					that.onEditarPeriodo(oPeriodo);
				});

				oToolbar.addContent(oButton);

				// <Button icon="sap-icon://paper-plane" text="{i18n>viewGeralBotaoFechamento}" press="onSubmeterPeriodo"/>
				oButton = new sap.m.Button({
					icon: "sap-icon://paper-plane",
					text: that.getResourceBundle().getText("viewGeralFechamento")
				}).attachPress(function () {
					that.onSubmeterPeriodo(oPeriodo);
				});

				oToolbar.addContent(oButton);
			},

			_setBusy: function (bBusy) {
				if (bBusy) {
					this.byId("tabelaPrimeiroPeriodo").setBusyIndicatorDelay(100);
					this.byId("tabelaSegundoPeriodo").setBusyIndicatorDelay(100);
					this.byId("tabelaTerceiroPeriodo").setBusyIndicatorDelay(100);
					this.byId("tabelaQuartoPeriodo").setBusyIndicatorDelay(100);
				}
				this.byId("tabelaPrimeiroPeriodo").setBusy(bBusy);
				this.byId("tabelaSegundoPeriodo").setBusy(bBusy);
				this.byId("tabelaTerceiroPeriodo").setBusy(bBusy);
				this.byId("tabelaQuartoPeriodo").setBusy(bBusy);
			}
		});
	}
);