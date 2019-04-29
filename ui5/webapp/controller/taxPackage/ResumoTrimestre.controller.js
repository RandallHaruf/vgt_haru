sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/jQueryMask",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/Arquivo",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, NodeAPI, jQueryMask, Constants, Arquivo) {
		return BaseController.extend("ui5ns.ui5.controller.taxPackage.ResumoTrimestre", {
			pressDialog: null,

			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					MoedaPrimeiroTrimestre: null,
					MoedaSegundoTrimestre: null,
					MoedaTerceiroTrimestre: null,
					MoedaQuartoTrimestre: null,
					MoedaAnual: null,
					MoedaRetificadora: null,
					"trimestres": {
						PrimeiroTrimestre: [{
							rc_statutory_gaap_profit_loss_before_tax: 0,
							rf_taxable_income_loss_before_losses_and_tax_credits: 0,
							rf_net_local_tax: 0,
							rf_tax_due_overpaid: 0
						}],
						SegundoTrimestre: [{
							rc_statutory_gaap_profit_loss_before_tax: 0,
							rf_taxable_income_loss_before_losses_and_tax_credits: 0,
							rf_net_local_tax: 0,
							rf_tax_due_overpaid: 0
						}],
						TerceiroTrimestre: [{
							rc_statutory_gaap_profit_loss_before_tax: 0,
							rf_taxable_income_loss_before_losses_and_tax_credits: 0,
							rf_net_local_tax: 0,
							rf_tax_due_overpaid: 0
						}],
						QuartoTrimestre: [{
							rc_statutory_gaap_profit_loss_before_tax: 0,
							rf_taxable_income_loss_before_losses_and_tax_credits: 0,
							rf_net_local_tax: 0,
							rf_tax_due_overpaid: 0
						}]
					},
					"anual": [{
						rc_statutory_gaap_profit_loss_before_tax: 0,
						rf_taxable_income_loss_before_losses_and_tax_credits: 0,
						rf_net_local_tax: 0,
						rf_tax_due_overpaid: 0
					}],
					"retificadora": [{
						rc_statutory_gaap_profit_loss_before_tax: 0,
						rf_taxable_income_loss_before_losses_and_tax_credits: 0,
						rf_net_local_tax: 0,
						rf_tax_due_overpaid: 0
					}]
				}));

				this.getRouter().getRoute("taxPackageResumoTrimestre").attachPatternMatched(this._onRouteMatched, this);

				//jQuery(".money span").mask("000.000.000.000.000", {reverse: true});
			},

			onTrocarAnoCalendario: function (oEvent) {
				this._atualizarDados();
			},

			onEditarPeriodo: function (oPeriodo) {
				var oParams = {};
				oParams.oPeriodo = oPeriodo;
				oParams.oEmpresa = this.getModel().getProperty("/Empresa");
				oParams.oAnoCalendario = {
					idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado"),
					anoCalendario: this.byId("selectAnoCalendario").getSelectedItem().getText()
				};

				this.getRouter().navTo("taxPackageEdicaoTrimestre", {
					parametros: this.toURIComponent(oParams)
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

			onVisualizarPeriodo: function (oPeriodo) {
				//this.getRouter().navTo("taxPackageVisualizacaoTrimestre");
				//alert("Visualizar: " + oPeriodo.periodo);
				var oParams = {};
				oParams.oPeriodo = oPeriodo;
				oParams.oEmpresa = this.getModel().getProperty("/Empresa");
				oParams.oAnoCalendario = {
					idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado"),
					anoCalendario: this.byId("selectAnoCalendario").getSelectedItem().getText()
				};

				this.getRouter().navTo("taxPackageVisualizacaoTrimestre", {
					parametros: this.toURIComponent(oParams)
				});
			},

			onSubmeterPeriodo: function (oEvent, oPeriodo) {
				var that = this,
					oBtnSubmeterPeriodo = oEvent.getSource();

				if (oPeriodo.numero_ordem >= 5) {
					oBtnSubmeterPeriodo.setEnabled(false);
					this.setBusy(oBtnSubmeterPeriodo, true);

					NodeAPI.get("ChecarDeclaracaoEnviada", {
							queryString: {
								idRelTaxPackagePeriodo: oPeriodo.id_rel_tax_package_periodo
							}
						}).then(function (result) {
							oBtnSubmeterPeriodo.setEnabled(true);
							that.setBusy(oBtnSubmeterPeriodo, false);

							var json = JSON.parse(result);

							if (json.success && json.result) {
								that._dialogSubmeterPeriodo(oPeriodo);
							} else {
								jQuery.sap.require("sap.m.MessageBox");

								// Não é possível encerrar período sem enviar a declaração
								sap.m.MessageBox.show(that.getResourceBundle().getText("viewResumoTrimestreJSTEXTSAvisoFaltaDeclaracao"), {
									title: that.getResourceBundle().getText("viewGeralAviso")
								});
							}
						})
						.catch(function (err) {
							oBtnSubmeterPeriodo.setEnabled(true);
							that.setBusy(oBtnSubmeterPeriodo, false);

							alert(err.statusText);
						});
				} else {
					this._dialogSubmeterPeriodo(oPeriodo);
				}
			},

			_dialogSubmeterPeriodo: function (oPeriodo) {
				var that = this;

				var dialog = new sap.m.Dialog({
					title: this.getResourceBundle().getText("viewResumoTrimestreJSTEXTSConfirmaçãodeFechamento"),
					type: "Message",
					content: new sap.m.Text({
						text: this.getResourceBundle().getText("viewResumoTrimestreJSTEXTSVocêtemcertezaquedesejafecharoperíodo"),
					}),
					beginButton: new sap.m.Button({
						text: this.getResourceBundle().getText("viewResumoTrimestreJSTEXTSSubmeter"),
						press: function () {
							NodeAPI.pAtualizarRegistro("EncerrarTrimestreTaxPackage", "", {
								relTaxPackagePeriodo: oPeriodo.id_rel_tax_package_periodo,
								requerAprovacao: oPeriodo.numero_ordem >= 4
							}).then(function (response) {
								dialog.close();

								var json = JSON.parse(response);

								if (json.success) {
									that._atualizarDados();
								} else {
									var dialog2 = new sap.m.Dialog({
										title: that.getResourceBundle().getText("viewResumoTrimestreJSTEXTSAviso"),
										type: "Message",
										content: new sap.m.Text({
											text: json.message
										}),
										endButton: new sap.m.Button({
											text: that.getResourceBundle().getText("viewResumoTrimestreJSTEXTSFechar"),
											press: function () {
												dialog2.close();
											}
										}),
										afterClose: function () {
											dialog2.destroy();
										}
									});

									dialog2.open();
								}
							}).catch(function (err) {
								dialog.close();

								var dialog2 = new sap.m.Dialog({
									title: that.getResourceBundle().getText("viewResumoTrimestreJSTEXTSAviso"),
									type: "Message",
									content: new sap.m.Text({
										text: err.status + " - " + err.statusText
									}),
									endButton: new sap.m.Button({
										text: that.getResourceBundle().getText("viewResumoTrimestreJSTEXTSFechar"),
										press: function () {
											dialog2.close();
										}
									}),
									afterClose: function () {
										dialog2.destroy();
									}
								});

								dialog2.open();
							});
						}
					}),
					endButton: new sap.m.Button({
						text: this.getResourceBundle().getText("viewGeralCancelar"),
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

			_onEnviarMensagem: function (vEmpresa, vPeriodo) {
				var that = this;

				var assunto = "TAX PACKAGE – Quarter reopening - " + vEmpresa + " - " + vPeriodo;
				//var corpo = that.getModel().getProperty("/corpo");
				var htmlBody =
					"<p>Dear Administrator,</p><br><p>&nbsp;A user is requesting to reopen a closed quarter in the TAX PACKAGE module at Vale Global Tax (VGT) – inserir hyperlink– Your approval is required</p><p>Thank you in advance.</p><p>Global Tax Team</p>";
				//this.getModel().setProperty("/bEmailButton", false);

				jQuery.ajax({ //Desativar botao
					url: Constants.urlBackend + "EmailSend",
					type: "POST",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
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

				var that = this;
				var oEmpresa = this.getModel().getProperty("/Empresa");

				oButton = oEvent.getSource();
				that.setBusy(oButton, true);

				var oForm = new sap.ui.layout.form.Form({
					editable: true
				}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
					singleContainerFullSize: false
				}));

				var oFormContainer = new sap.ui.layout.form.FormContainer();

				var oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralEmpresa}"
				}).addField(new sap.m.Text({
					text: "{/Empresa/empresa}"
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

				NodeAPI.pListarRegistros("RequisicaoReaberturaTaxPackage", {
						status: 1,
						//empresa: oPeriodo["fk_empresa.id_empresa"],
						reltaxperiodo: oPeriodo.id_rel_tax_package_periodo
					})
					.then(function (res) {
						if (res.length > 0) {
							//alert("Já existe um pedido de reabertura para o pedido selecionado");
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
							var dialog = new sap.m.Dialog({
								title: "{i18n>viewGeralNovaRequisicao}",
								content: oForm,
								beginButton: new sap.m.Button({
									text: "{i18n>viewGeralSalvar}",
									press: function () {
										if (oTextArea.getValue()) {
											NodeAPI.pCriarRegistro("RequisicaoReaberturaTaxPackage", {
												dataRequisicao: that._formatDate(new Date()),
												idUsuario: 2,
												nomeUsuario: "Juliana",
												justificativa: oTextArea.getValue(),
												fkDominioRequisicaoReaberturaStatus: 1,
												fkIdRelTaxPackagePeriodo: oPeriodo.id_rel_tax_package_periodo
											}).then(function (response) {
												dialog.close();
												that._onEnviarMensagem(oEmpresa.empresa, oPeriodo.periodo);
												sap.m.MessageToast.show(that.getResourceBundle().getText("viewResumoTrimestreToast"));
											}).catch(function (err) {
												dialog.close();

												var dialog2 = new sap.m.Dialog({
													title: that.getResourceBundle().getText("viewResumoTrimestreJSTEXTSAviso"),
													type: "Message",
													content: new sap.m.Text({
														text: err.status + " - " + err.statusText
													}),
													endButton: new sap.m.Button({
														text: that.getResourceBundle().getText("viewResumoTrimestreJSTEXTSFechar"),
														press: function () {
															dialog2.close();
														}
													}),
													afterClose: function () {
														dialog2.destroy();
													}
												});

												dialog2.open();
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

			_formatDate: function (date) {
				var d = new Date(date),
					month = '' + (d.getMonth() + 1),
					day = '' + d.getDate(),
					year = d.getFullYear();

				if (month.length < 2) month = '0' + month;
				if (day.length < 2) day = '0' + day;

				return [year, month, day].join('-');
			},

			_atualizarDeclaracoes: function (sProperty, sIdRelTaxPackagePeriodo, oTable) {
				var that = this;

				this.setBusy(oTable, true);

				Arquivo.listar("ListarDeclaracoes?idRelTaxPackagePeriodo=" + sIdRelTaxPackagePeriodo)
					.then(function (response) {
						for (var i = 0; i < response.length; i++) {
							if (response[i].ind_declaracao) {
								response[i].label_declaracao = that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoDeclaracaoSim");
								if (response[i].data_envio_declaracao) {
									response[i].label_declaracao += that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoEnvioDeclaracao") +
										response[i].data_envio_declaracao;
								}
							} else {
								response[i].label_declaracao = that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoDeclaracaoNao");
							}
						}
						that.getModel().setProperty(sProperty, response);

						that.setBusy(oTable, false);
					})
					.catch(function (err) {
						sap.m.MessageToast.show(err);

						that.setBusy(oTable, false);
					});
			},

			onAnexarDeclaracao: function (oPeriodo) {
				var that = this,
					sProperty = oPeriodo.numero_ordem === 5 ? "/DeclaracoesAnual" : "/DeclaracoesRetificadora";

				var oVBox = new sap.m.VBox();

				var oVBox2 = new sap.m.VBox();

				var oHBox = new sap.m.HBox();

				var oCheckBox = new sap.m.CheckBox({
					text: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoDeclaracao"),
					selected: "{/IsDeclaracao}"
				}).addStyleClass("sapUiSmallMarginEnd");

				var oDatePicker = new sap.m.DatePicker({
					value: "{/DataEnvioDeclaracao}",
					valueFormat: "yyyy-MM-dd",
					enabled: "{= ${/IsDeclaracao} === true ? true : false}"
				});

				oHBox.addItem(oCheckBox);
				oHBox.addItem(oDatePicker);

				var oHBox2 = new sap.m.HBox();

				var oFileUploader = new sap.ui.unified.FileUploader({
					id: "fileUploader",
					name: "myFileUpload",
					uploadUrl: "",
					buttonText: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoProcurar"),
					width: "400px",
					tooltip: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoEnviarArquivoParaNodeJS"),
					placeholder: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoEscolhaUmArquivo")
				});

				var oTable = new sap.m.Table({
					inset: false
				});

				var oButton = new sap.m.Button({
					text: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoEnviarArquivo")
				}).attachPress(function (oEvent) {
					this.onEnviarArquivo(oEvent, oPeriodo, oFileUploader, sProperty, oTable);
				}, this);

				oHBox2.addItem(oFileUploader);
				oHBox2.addItem(oButton);

				oVBox2.addItem(oHBox);
				oVBox2.addItem(oHBox2);

				var oScrollContainer = new sap.m.ScrollContainer({
					vertical: true,
					height: "350px",
					width: "100%"
				});

				var oToolbar = new sap.m.Toolbar();

				oToolbar.addContent(new sap.m.Text({
					text: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoDocumentos")
				}));

				oTable.setHeaderToolbar(oToolbar);

				// colunas
				oTable.addColumn(new sap.m.Column().setHeader(new sap.m.Text({
					text: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoNomeDoArquivo")
				})));

				oTable.addColumn(new sap.m.Column().setHeader(new sap.m.Text({
					text: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoDataDeUpload")
				})));

				oTable.addColumn(new sap.m.Column({
					width: "6.5rem"
				}));

				// células
				var oObjectIdentifier = new sap.m.ObjectIdentifier({
					title: "{nome_arquivo}",
					text: "{label_declaracao}"
				}).addStyleClass("sapMTableContentMargin");

				var oObjectNumber = new sap.m.ObjectNumber({
					number: "{data_upload}"
				});

				var oHBox3 = new sap.m.HBox();

				var oButton2 = new sap.m.Button({
					icon: "sap-icon://download-from-cloud",
					type: "Accept",
					tooltip: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoBaixarArquivo"),
					enabled: "{btnDownloadEnabled}"
				}).addStyleClass("sapUiSmallMarginEnd").attachPress(oTable, function (oEvent2) {
					this.onBaixarArquivo(oEvent2, oPeriodo);
				}, this);

				var oButton3 = new sap.m.Button({
					icon: "sap-icon://delete",
					type: "Reject",
					tooltip: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoExcluirArquivo"),
					enabled: "{btnExcluirEnabled}"
				}).attachPress(oTable, function (oEvent3) {
					this.onExcluirArquivo(oEvent3, oPeriodo, sProperty, oTable);
				}, this);

				oHBox3.addItem(oButton2);
				oHBox3.addItem(oButton3);

				// template
				var oTemplate = new sap.m.ColumnListItem({
					cells: [oObjectIdentifier, oObjectNumber, oHBox3]
				});

				oTable.bindItems({
					path: sProperty,
					template: oTemplate
				});

				oScrollContainer.addContent(oTable);

				oVBox.addItem(oVBox2);
				oVBox.addItem(oScrollContainer);

				var dialog = new sap.m.Dialog({
					title: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoAnexarDeclaracao"),
					content: oVBox,
					endButton: new sap.m.Button({
						text: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoEndButton"),
						press: function () {
							dialog.close();
						}.bind(this)
					}),
					afterClose: function () {
						that.getModel().setProperty(sProperty, []);
						dialog.destroy();
					}
				});

				// to get access to the global model
				this.getView().addDependent(dialog);

				dialog.open();

				this._atualizarDeclaracoes(sProperty, oPeriodo.id_rel_tax_package_periodo, oTable);
			},

			onEnviarArquivo: function (oEvent, oPeriodo, oFileUploader, sProperty, oTable) {
				var that = this,
					oBtnEnviar = oEvent.getSource();

				var oData = {
					dataEnvioDeclaracao: (this.getModel().getProperty("/DataEnvioDeclaracao") ? this.getModel().getProperty("/DataEnvioDeclaracao") :
						""),
					indDeclaracao: (this.getModel().getProperty("/IsDeclaracao") ? true : false),
					fkRelTaxPackagePeriodo: oPeriodo.id_rel_tax_package_periodo
				};

				if (oFileUploader.getValue()) {
					oBtnEnviar.setEnabled(false);
					this.setBusy(oBtnEnviar, true);

					Arquivo.upload(oFileUploader.oFileUpload.files[0], oFileUploader.getValue(), "UploadDeclaracao", oData)
						.then(function (response) {
							//sap.m.MessageToast.show(response);
							that._atualizarDeclaracoes(sProperty, oPeriodo.id_rel_tax_package_periodo, oTable);
							oFileUploader.setValue("");
							oBtnEnviar.setEnabled(true);
							that.getModel().setProperty("/IsDeclaracao", false);
							that.getModel().setProperty("/DataEnvioDeclaracao", null);
							that.setBusy(oBtnEnviar, false);
						})
						.catch(function (err) {
							sap.m.MessageToast.show(err);
							oBtnEnviar.setEnabled(true);
							that.setBusy(oBtnEnviar, false);
						});
				} else {
					sap.m.MessageToast.show(that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoSelecioneUmArquivo"));
				}
			},

			onBaixarArquivo: function (oEvent, oPeriodo) {
				var that = this,
					oButton = oEvent.getSource(),
					oArquivo = oEvent.getSource().getBindingContext().getObject();

				oArquivo.btnExcluirEnabled = false;
				oArquivo.btnDownloadEnabled = false;
				this.getModel().refresh();
				this.setBusy(oButton, true);

				Arquivo.download("DownloadDeclaracao?arquivo=" + oArquivo.id_declaracao)
					.then(function (response) {
						Arquivo.salvar(response[0].nome_arquivo, response[0].mimetype, response[0].dados_arquivo.data);

						oArquivo.btnExcluirEnabled = true;
						oArquivo.btnDownloadEnabled = true;
						that.setBusy(oButton, false);
						that.getModel().refresh();
					})
					.catch(function (err) {
						sap.m.MessageToast.show(that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoErroAoBaixarArquivo") + oArquivo
							.nome_arquivo);

						oArquivo.btnExcluirEnabled = true;
						oArquivo.btnDownloadEnabled = true;
						that.setBusy(oButton, false);
						that.getModel().refresh();
					});
			},

			onExcluirArquivo: function (oEvent, oPeriodo, sProperty, oTable) {
				var that = this,
					oButton = oEvent.getSource(),
					oArquivo = oEvent.getSource().getBindingContext().getObject();

				this._confirmarExclusao(function () {
					oArquivo.btnExcluirEnabled = false;
					oArquivo.btnDownloadEnabled = false;
					that.getModel().refresh();
					that.setBusy(oButton, true);

					Arquivo.excluir("ExcluirDeclaracao/" + oArquivo.id_declaracao)
						.then(function (response) {
							//sap.m.MessageToast.show(response);
							that._atualizarDeclaracoes(sProperty, oPeriodo.id_rel_tax_package_periodo, oTable);

							oArquivo.btnExcluirEnabled = true;
							oArquivo.btnDownloadEnabled = true;
							that.setBusy(oButton, false);
							that.getModel().refresh();
						})
						.catch(function (err) {
							sap.m.MessageToast.show(that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoErroAoExcluirArquivo") +
								oArquivo.nome_arquivo);

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
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoCertezaDeExcluir")
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

			onBaixarDeclaracao: function (oPeriodo) {
				var that = this,
					sProperty = oPeriodo.numero_ordem === 5 ? "/DeclaracoesAnual" : "/DeclaracoesRetificadora";

				var oVBox = new sap.m.VBox();

				/*var oVBox2 = new sap.m.VBox();
				var oHBox = new sap.m.HBox();
				var oCheckBox = new sap.m.CheckBox({
					text: "Declaração",
					selected: "{/IsDeclaracao}"
				}).addStyleClass("sapUiSmallMarginEnd");
				var oDatePicker = new sap.m.DatePicker({
					value: "{/DataEnvioDeclaracao}",
					valueFormat: "yyyy-MM-dd",
					enabled: "{= ${/IsDeclaracao} === true ? true : false}"
				});
				oHBox.addItem(oCheckBox);
				oHBox.addItem(oDatePicker);
				var oHBox2 = new sap.m.HBox();
				var oFileUploader = new sap.ui.unified.FileUploader({
					id: "fileUploader",
					name: "myFileUpload",
					uploadUrl: "",
					width: "400px",
					tooltip: "Enviar o arquivo para o Nodejs",
					placeholder: "Escolha um arquivo"
				});
				var oTable = new sap.m.Table({
					inset: false
				});
				var oButton = new sap.m.Button({
					text: "Enviar Arquivo"
				}).attachPress(function (oEvent) {
					this.onEnviarArquivo(oEvent, oPeriodo, oFileUploader, sProperty, oTable);
				}, this);
				oHBox2.addItem(oFileUploader);
				oHBox2.addItem(oButton);
				oVBox2.addItem(oHBox);
				oVBox2.addItem(oHBox2);*/

				var oScrollContainer = new sap.m.ScrollContainer({
					vertical: true,
					height: "350px",
					width: "100%"
				});

				var oTable = new sap.m.Table({
					inset: false
				});

				var oToolbar = new sap.m.Toolbar();

				oToolbar.addContent(new sap.m.Text({
					text: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoDocumentos")
				}));

				oTable.setHeaderToolbar(oToolbar);

				// colunas
				oTable.addColumn(new sap.m.Column().setHeader(new sap.m.Text({
					text: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoNomeDoArquivo")
				})));

				oTable.addColumn(new sap.m.Column().setHeader(new sap.m.Text({
					text: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoDataDeUpload")
				})));

				oTable.addColumn(new sap.m.Column({
					width: "6.5rem"
				}));

				// células
				var oObjectIdentifier = new sap.m.ObjectIdentifier({
					title: "{nome_arquivo}",
					text: "{label_declaracao}"
				}).addStyleClass("sapMTableContentMargin");

				var oObjectNumber = new sap.m.ObjectNumber({
					number: "{data_upload}"
				});

				var oHBox3 = new sap.m.HBox();

				var oButton2 = new sap.m.Button({
					icon: "sap-icon://download-from-cloud",
					type: "Accept",
					tooltip: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoBaixarArquivo"),
					enabled: "{btnDownloadEnabled}"
				}).addStyleClass("sapUiSmallMarginEnd").attachPress(oTable, function (oEvent2) {
					this.onBaixarArquivo(oEvent2, oPeriodo);
				}, this);

				/* oButton3 = new sap.m.Button({
					icon: "sap-icon://delete",
					type: "Reject",
					tooltip: "Excluir Arquivo",
					enabled: "{btnExcluirEnabled}"
				}).attachPress(oTable, function (oEvent3) {
					this.onExcluirArquivo(oEvent3, oPeriodo, sProperty, oTable);
				}, this);*/

				oHBox3.addItem(oButton2);
				//oHBox3.addItem(oButton3);

				// template
				var oTemplate = new sap.m.ColumnListItem({
					cells: [oObjectIdentifier, oObjectNumber, oHBox3]
				});

				oTable.bindItems({
					path: sProperty,
					template: oTemplate
				});

				oScrollContainer.addContent(oTable);

				//oVBox.addItem(oVBox2);
				oVBox.addItem(oScrollContainer);

				var dialog = new sap.m.Dialog({
					title: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoVisualizarDeclaracao"),
					content: oVBox,
					endButton: new sap.m.Button({
						text: that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoEndButton"),
						press: function () {
							dialog.close();
						}.bind(this)
					}),
					afterClose: function () {
						that.getModel().setProperty(sProperty, []);
						dialog.destroy();
					}
				});

				// to get access to the global model
				this.getView().addDependent(dialog);

				dialog.open();

				this._atualizarDeclaracoes(sProperty, oPeriodo.id_rel_tax_package_periodo, oTable);
			},

			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			navToPage2: function () {
				this.getRouter().navTo("taxPackageListagemEmpresas", {
					parametros: this.toURIComponent({
						idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
					})
				});
			},

			navToRequisicoes: function () {
				//this.getRouter().navTo("taxPackageRequisicaoReabertura");

				var oParametros = {
					empresa: this.getModel().getProperty("/Empresa"),
					anoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
				};

				this.getRouter().navTo("taxPackageRequisicaoReabertura", {
					parametros: this.toURIComponent(oParametros)
				});
			},

			_onRouteMatched: function (oEvent) {
				if (this.isIFrame()) {
					this.mostrarAcessoRapidoInception();
					this.byId("btnRequisicoes").setVisible(false);
				}

				var oParametros = this.fromURIComponent(oEvent.getParameter("arguments").parametros);

				this.getModel().setProperty("/Empresa", oParametros.empresa);
				this.getModel().setProperty("/AnoCalendarioSelecionado", oParametros.idAnoCalendario);

				var that = this;

				NodeAPI.listarRegistros("/DominioAnoCalendario", function (response) {
					if (response) {
						that.getModel().setProperty("/DominioAnoCalendario", response);

						that._atualizarDados();
					}
				});
			},

			_atualizarDados: function () {
				var sIdEmpresa = this.getModel().getProperty("/Empresa").id_empresa,
					sIdAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado");

				this._carregarToolbar(sIdEmpresa, sIdAnoCalendario);
				this._carregarResumo(sIdEmpresa, sIdAnoCalendario);
			},

			_carregarResumo: function (sIdEmpresa, sIdAnoCalendario) {
				this._setTableBusy(true);

				var that = this,
					sEntidade = "DeepQuery/TaxReconciliation?anoCalendario=" + sIdAnoCalendario + "&empresa=" + sIdEmpresa;

				this._limparResumo();

				NodeAPI.listarRegistros(sEntidade, function (response) {
					if (response) {
						for (var i = 0, length = response.length; i < length; i++) {
							response[i]["rc_statutory_gaap_profit_loss_before_tax"] = response[i]["rc_statutory_gaap_profit_loss_before_tax"] ? parseInt(
								response[i]["rc_statutory_gaap_profit_loss_before_tax"], 10) : 0;
							response[i]["rf_taxable_income_loss_before_losses_and_tax_credits"] = (response[i][
								"rf_taxable_income_loss_before_losses_and_tax_credits"
							] ? parseInt(response[i]["rf_taxable_income_loss_before_losses_and_tax_credits"], 10) : 0);
							response[i]["rf_net_local_tax"] = (response[i]["rf_net_local_tax"] ? parseInt(response[i]["rf_net_local_tax"], 10) : 0);
							response[i]["rf_tax_due_overpaid"] = (response[i]["rf_tax_due_overpaid"] ? parseInt(response[i]["rf_tax_due_overpaid"], 10) :
								0);

							var oTaxReconciliation = response[i];

							switch (true) {
							case oTaxReconciliation.numero_ordem === 1:
								that.getModel().setProperty("/trimestres/PrimeiroTrimestre", [oTaxReconciliation]);
								that.getModel().setProperty("/MoedaPrimeiroTrimestre", oTaxReconciliation.acronimo);
								break;
							case oTaxReconciliation.numero_ordem === 2:
								that.getModel().setProperty("/trimestres/SegundoTrimestre", [oTaxReconciliation]);
								that.getModel().setProperty("/MoedaSegundoTrimestre", oTaxReconciliation.acronimo);
								break;
							case oTaxReconciliation.numero_ordem === 3:
								that.getModel().setProperty("/trimestres/TerceiroTrimestre", [oTaxReconciliation]);
								that.getModel().setProperty("/MoedaTerceiroTrimestre", oTaxReconciliation.acronimo);
								break;
							case oTaxReconciliation.numero_ordem === 4:
								that.getModel().setProperty("/trimestres/QuartoTrimestre", [oTaxReconciliation]);
								that.getModel().setProperty("/MoedaQuartoTrimestre", oTaxReconciliation.acronimo);
								break;
							case oTaxReconciliation.numero_ordem === 5:
								that.getModel().setProperty("/anual", [oTaxReconciliation]);
								that.getModel().setProperty("/MoedaAnual", oTaxReconciliation.acronimo);
								break;
							case oTaxReconciliation.numero_ordem >= 6:
								// PEGAR A ULTIMA RETIFICADORA APENAS
								that.getModel().setProperty("/retificadora", [oTaxReconciliation]);
								that.getModel().setProperty("/MoedaRetificadora", oTaxReconciliation.acronimo);
								break;
							}
						}

						setTimeout(function () {
							$.each($('.money span'), function (index, el) {
								var valor = $(el).text();
								if (that.isPTBR()) {
									valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
								} else {
									valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
								}
								$(el).text(valor);
							});
						}, 150);
					}

					that._setTableBusy(false);
				});

				/*this.getModel().setProperty("/trimestres/PrimeiroTrimestre", [{
					"primeiroValor": "999.999.999,99",
					"segundoValor": "999.999.999,99",
					"terceiroValor": "999.999.999,99",
					"quartoValor": "999.999.999,99"
				}]);
					
				this.getModel().setProperty("/trimestres/SegundoTrimestre", [{
					"primeiroValor": "999.999.999,99",
					"segundoValor": "999.999.999,99",
					"terceiroValor": "999.999.999,99",
					"quartoValor": "999.999.999,99"
				}]);
					
				this.getModel().setProperty("/trimestres/TerceiroTrimestre", [{
					"primeiroValor": "999.999.999,99",
					"segundoValor": "999.999.999,99",
					"terceiroValor": "999.999.999,99",
					"quartoValor": "999.999.999,99"
				}]);
					
				this.getModel().setProperty("/trimestres/QuartoTrimestre", [{
					"primeiroValor": "999.999.999,99",
					"segundoValor": "999.999.999,99",
					"terceiroValor": "999.999.999,99",
					"quartoValor": "999.999.999,99"
				}]);
					
				this.getModel().setProperty("/anual", [{
					"primeiroValor": "999.999.999,99",
					"segundoValor": "999.999.999,99",
					"terceiroValor": "999.999.999,99",
					"quartoValor": "999.999.999,99"
				}]);
					
				this.getModel().setProperty("/retificadora", [{
					"primeiroValor": "999.999.999,99",
					"segundoValor": "999.999.999,99",
					"terceiroValor": "999.999.999,99",
					"quartoValor": "999.999.999,99"
				}]);*/
			},

			_limparResumo: function () {
				this.getModel().setProperty("/MoedaPrimeiroTrimestre", "");
				this.getModel().setProperty("/trimestres/PrimeiroTrimestre", [{
					rc_statutory_gaap_profit_loss_before_tax: 0,
					rf_taxable_income_loss_before_losses_and_tax_credits: 0,
					rf_net_local_tax: 0,
					rf_tax_due_overpaid: 0
				}]);

				this.getModel().setProperty("/MoedaSegundoTrimestre", "");
				this.getModel().setProperty("/trimestres/SegundoTrimestre", [{
					rc_statutory_gaap_profit_loss_before_tax: 0,
					rf_taxable_income_loss_before_losses_and_tax_credits: 0,
					rf_net_local_tax: 0,
					rf_tax_due_overpaid: 0
				}]);

				this.getModel().setProperty("/MoedaTerceiroTrimestre", "");
				this.getModel().setProperty("/trimestres/TerceiroTrimestre", [{
					rc_statutory_gaap_profit_loss_before_tax: 0,
					rf_taxable_income_loss_before_losses_and_tax_credits: 0,
					rf_net_local_tax: 0,
					rf_tax_due_overpaid: 0
				}]);

				this.getModel().setProperty("/MoedaQuartoTrimestre", "");
				this.getModel().setProperty("/trimestres/QuartoTrimestre", [{
					rc_statutory_gaap_profit_loss_before_tax: 0,
					rf_taxable_income_loss_before_losses_and_tax_credits: 0,
					rf_net_local_tax: 0,
					rf_tax_due_overpaid: 0
				}]);

				this.getModel().setProperty("/MoedaAnual", "");
				this.getModel().setProperty("/anual", [{
					rc_statutory_gaap_profit_loss_before_tax: 0,
					rf_taxable_income_loss_before_losses_and_tax_credits: 0,
					rf_net_local_tax: 0,
					rf_tax_due_overpaid: 0
				}]);

				this.getModel().setProperty("/MoedaRetificadora", "");
				this.getModel().setProperty("/retificadora", [{
					rc_statutory_gaap_profit_loss_before_tax: 0,
					rf_taxable_income_loss_before_losses_and_tax_credits: 0,
					rf_net_local_tax: 0,
					rf_tax_due_overpaid: 0
				}]);
			},

			_carregarToolbar: function (sIdEmpresa, sIdAnoCalendario) {
				var that = this,
					sRota = "DeepQuery/RelacionamentoTaxPackagePeriodo?empresa=" + sIdEmpresa + "&anoCalendario=" + sIdAnoCalendario + "&modulo=2"
					/*,
										aIdToolbar = ["toolbarPrimeiroPeriodo", "toolbarSegundoPeriodo", "toolbarTerceiroPeriodo", "toolbarQuartoPeriodo", "toolbarAnual",
											"toolbarRetificadora"
										]*/
				;

				var aIdToolbar = {};
				aIdToolbar[1] = "toolbarPrimeiroPeriodo";
				aIdToolbar[2] = "toolbarSegundoPeriodo";
				aIdToolbar[3] = "toolbarTerceiroPeriodo";
				aIdToolbar[4] = "toolbarQuartoPeriodo";
				aIdToolbar[5] = "toolbarAnual";
				aIdToolbar[6] = "toolbarRetificadora";

				this._setToolbarBusy(aIdToolbar, true);

				// Realiza a limpeza das toolbar antes de carregar as novas para
				// garantir que caso um ano calendário não tenha relacionamento com períodos ele
				// não tenha acesso errôneo ao formulário
				that.byId(aIdToolbar[1]).removeAllContent();
				that.byId(aIdToolbar[2]).removeAllContent();
				that.byId(aIdToolbar[3]).removeAllContent();
				that.byId(aIdToolbar[4]).removeAllContent();
				that.byId(aIdToolbar[5]).removeAllContent();
				that.byId(aIdToolbar[6]).removeAllContent();

				NodeAPI.listarRegistros(sRota, function (response) {
					if (response) {
						for (var i = 0, length = response.length; i < length; i++) {
							var oPeriodo = response[i];

							// Se estimativa
							if (oPeriodo.numero_ordem <= 4) {
								if (that.isIFrame()) {
									that._popularToolbarEstimativaInception(aIdToolbar[oPeriodo.numero_ordem], oPeriodo);
								} else {
									if (oPeriodo.ind_ativo) {
										that._popularToolbarEstimativaCorrente(aIdToolbar[oPeriodo.numero_ordem], oPeriodo);
									} else {
										that._popularToolbarEstimativaFechada(aIdToolbar[oPeriodo.numero_ordem], oPeriodo);
									}
								}
							} 
							// Se anual
							else if (oPeriodo.numero_ordem === 5) {
								if (that.isIFrame()) {
									that._popularToolbarAnualInception(aIdToolbar[oPeriodo.numero_ordem], oPeriodo);
								} else {
									if (oPeriodo.ind_ativo) {
										that._popularToolbarAnualCorrente(aIdToolbar[oPeriodo.numero_ordem], oPeriodo);
									} else {
										that._popularToolbarAnualFechada(aIdToolbar[oPeriodo.numero_ordem], oPeriodo);
									}
								}
							}
							// Se ÚLTIMA retificadora
							else if ((oPeriodo.numero_ordem === 6 && i === length - 1)) {
								// Flag que indica se existe ao menos 1 aprovação de envio para o ANUAL
								var isExibirRetificadora = response.find(function (obj) {
									return obj.numero_ordem === 5;
								}).ind_exibir_retificadora;
								
								if (isExibirRetificadora) {
									if (that.isIFrame()) {
										that._popularToolbarAnualInception(aIdToolbar[oPeriodo.numero_ordem], oPeriodo);
									} else {
										if (oPeriodo.ind_ativo) {
											that._popularToolbarAnualCorrente(aIdToolbar[oPeriodo.numero_ordem], oPeriodo);
										} else {
											that._popularToolbarAnualFechada(aIdToolbar[oPeriodo.numero_ordem], oPeriodo);
										}
									}
								}
							}
						}
					}
					that._setToolbarBusy(aIdToolbar, false);
				});
			},

			_isPeriodoCorrente: function (iNumeroOrdem) {
				var now = new Date(),
					dataInicio,
					dataFim,
					iCurrentYear = now.getFullYear();

				now.setYear(this.byId("selectAnoCalendario").getSelectedItem().getText());

				switch (iNumeroOrdem) {
				case 1:
					dataInicio = new Date(iCurrentYear + "/02/1");
					dataFim = new Date(iCurrentYear + "/04/31");
					return now >= dataInicio && now <= dataFim;
				case 2:
					dataInicio = new Date(iCurrentYear + "/05/1");
					dataFim = new Date(iCurrentYear + "/07/31");
					return now >= dataInicio && now <= dataFim;
				case 3:
					dataInicio = new Date(iCurrentYear + "/08/1");
					dataFim = new Date(iCurrentYear + "/10/31");
					return now >= dataInicio && now <= dataFim;
				case 4:
					var iAux;
					//if (now >= new Date(iCurrentYear + "/01/1") && now <= new Date(iCurrentYear + "/01/31")) {
					if (now.getMonth() === 0 && now.getDate() >= 1 && now.getDate() <= 31) {
						now.setYear(now.getFullYear() + 1);
						iAux = iCurrentYear - 1;
						dataInicio = new Date(iAux + "/11/1");
						dataFim = new Date(iCurrentYear + "/01/31");
					} else {
						iAux = iCurrentYear + 1;
						dataInicio = new Date(iCurrentYear + "/11/1");
						dataFim = new Date(iAux + "/01/31");
					}

					return now >= dataInicio && now <= dataFim;
				}

				return false;
			},

			_popularToolbarEstimativaInception: function (sIdToolbar, oPeriodo) {
				var that = this;

				var oToolbar = this.byId(sIdToolbar);

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

			_popularToolbarEstimativaCorrente: function (sIdToolbar, oPeriodo) {
				var that = this;

				var oToolbar = this.byId(sIdToolbar);

				if (this._isPeriodoCorrente(oPeriodo.numero_ordem)) {
					oToolbar.addContent(new sap.m.Title({
						text: that.getResourceBundle().getText("viewGeralFaltamXDias", [that.ContadorDeTempo(2, oPeriodo.numero_ordem)]) // TROCAR PELO TEMPO QUE FALTA PARA O PERÍODO ACABAR                         
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
				}).attachPress(function (oEvent) {
					that.onSubmeterPeriodo(oEvent, oPeriodo);
				});

				oToolbar.addContent(oButton);
			},

			_popularToolbarEstimativaFechada: function (sIdToolbar, oPeriodo) {
				var that = this;

				var oToolbar = this.byId(sIdToolbar);

				if (oPeriodo.status_envio === 5) {
					oToolbar.addContent(new sap.m.Text({
						text: "{i18n>viewGeralAguardandoAprovacao}"
					}));
				}

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
				if (oPeriodo.status_envio !== 5) { // aguardando aprovação
					oButton = new sap.m.Button({
						icon: "sap-icon://permission",
						text: that.getResourceBundle().getText("viewGeralReabertura")
					}).attachPress(function (evento) {
						that.onReabrirPeriodo(evento, oPeriodo);
					});
				}

				oToolbar.addContent(oButton);
			},

			_popularToolbarAnualInception: function (sIdToolbar, oPeriodo) {
				var that = this;

				var oToolbar = this.byId(sIdToolbar);

				oToolbar.addContent(new sap.m.ToolbarSpacer());

				var oButton = new sap.m.Button({
					icon: "sap-icon://attachment",
					text: that.getResourceBundle().getText("viewTaxPackageResumoTrimestreBaixarDeclaracao"),
					type: "Accept"
				}).attachPress(function () {
					that.onBaixarDeclaracao(oPeriodo);
				});

				oToolbar.addContent(oButton);

				oButton = new sap.m.Button({
					icon: "sap-icon://show-edit",
					text: that.getResourceBundle().getText("viewGeralVisualizar"),
					type: "Default"
				}).attachPress(function () {
					that.onVisualizarPeriodo(oPeriodo);
				});

				oToolbar.addContent(oButton);
			},

			_popularToolbarAnualCorrente: function (sIdToolbar, oPeriodo) {
				var that = this;

				var oToolbar = this.byId(sIdToolbar);

				/*oToolbar.addContent(new sap.m.Title({
					text: that.getResourceBundle().getText("viewGeralFaltamXDias", [1]) // TROCAR PELO TEMPO QUE FALTA PARA O PERÍODO ACABAR                         
				}));*/
				
				if (!this._isPeriodoCorrente(oPeriodo.numero_ordem) && oPeriodo.DiasRestantes && oPeriodo.ind_ativo == true) {
					oToolbar.addContent(new sap.m.Title({
						text: that.getResourceBundle().getText("viewGeralFaltamXDias", [oPeriodo.DiasRestantes])
					}));	
				}

				oToolbar.addContent(new sap.m.ToolbarSpacer());

				// <Button icon="sap-icon://attachment" text="{i18n>viewGeralAnexarDocumentacao}" type="Accept" press="onAnexarDeclaracao"/>
				var oButton = new sap.m.Button({
					icon: "sap-icon://attachment",
					text: that.getResourceBundle().getText("viewGeralAnexarDocumentacao"),
					type: "Accept"
				}).attachPress(function () {
					that.onAnexarDeclaracao(oPeriodo);
				});

				oToolbar.addContent(oButton);

				// <Button icon="sap-icon://edit" text="{i18n>viewGeralBotaoEditar}" type="Accept" press="onEditarPeriodo"/>
				oButton = new sap.m.Button({
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
				}).attachPress(function (oEvent) {
					that.onSubmeterPeriodo(oEvent, oPeriodo);
				});

				oToolbar.addContent(oButton);
			},

			_popularToolbarAnualFechada: function (sIdToolbar, oPeriodo) {
				var that = this;

				var oToolbar = this.byId(sIdToolbar);

				if (oPeriodo.status_envio === 5) {
					oToolbar.addContent(new sap.m.Text({
						text: "{i18n>viewGeralAguardandoAprovacao}"
					}));
				}

				oToolbar.addContent(new sap.m.ToolbarSpacer());

				// <Button icon="sap-icon://attachment" text="{i18n>viewGeralAnexarDocumentacao}" type="Accept" press="onAnexarDeclaracao"/>
				var oButton = new sap.m.Button({
					icon: "sap-icon://attachment",
					text: that.getResourceBundle().getText("viewTaxPackageResumoTrimestreBaixarDeclaracao"),
					type: "Accept"
				}).attachPress(function () {
					that.onBaixarDeclaracao(oPeriodo);
				});

				oToolbar.addContent(oButton);

				oButton = new sap.m.Button({
					icon: "sap-icon://show-edit",
					text: that.getResourceBundle().getText("viewGeralVisualizar"),
					type: "Default"
				}).attachPress(function () {
					that.onVisualizarPeriodo(oPeriodo);
				});

				oToolbar.addContent(oButton);

				// <Button icon="sap-icon://permission" text="{i18n>viewGeralBotaoReabertura}" press="onReabrirPeriodo"/>
				if (oPeriodo.status_envio !== 5) { // aguardando aprovação
					oButton = new sap.m.Button({
						icon: oPeriodo.numero_ordem === 6 ? "sap-icon://create-form" : "sap-icon://permission",
						text: oPeriodo.numero_ordem === 6 ? "Ativar" : that.getResourceBundle().getText("viewGeralReabertura")
					}).attachPress(function (evento) {
						that.onReabrirPeriodo(evento, oPeriodo);
					});
				}

				oToolbar.addContent(oButton);
			},

			_setToolbarBusy: function (aIdToolbar, bBusy) {
				for (var i = 1, length = Object.keys(aIdToolbar).length; i <= length; i++) {
					var sIdToolbar = aIdToolbar[i];
					if (bBusy) {
						this.byId(sIdToolbar).setBusyIndicatorDelay(100);
					}
					this.byId(sIdToolbar).setBusy(bBusy);
				}
			},

			_setTableBusy: function (bBusy) {
				var aIdTabela = ["tabelaPrimeiroPeriodo", "tabelaSegundoPeriodo", "tabelaTerceiroPeriodo", "tabelaQuartoPeriodo", "tabelaAnual",
					"tabelaRetificadora"
				];
				for (var i = 0, length = aIdTabela.length; i < length; i++) {
					var sIdTabela = aIdTabela[i];
					if (bBusy) {
						this.byId(sIdTabela).setBusyIndicatorDelay(100);
					}
					this.byId(sIdTabela).setBusy(bBusy);
				}
			}
		});
	});