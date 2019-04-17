sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/models",
		"sap/ui/model/Filter",
		"sap/m/MessageToast",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, models, Filter, MessageToast, Constants, NodeAPI) {
		return BaseController.extend("ui5ns.ui5.controller.ListaNotificacoes", {
			onInit: function () {

				this.setModel(models.createViewModelParaComplianceListagemObrigacoes(), "viewModel");
				this.setModel(new sap.ui.model.json.JSONModel({}));

				var that = this;

				this.byId("paginaListagem").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._atualizarDados();
					}
				});

				//this.getRouter().getRoute("complianceListagemObrigacoes").attachPatternMatched(this._onRouteMatched, this);
				/*
				oModel = new sap.ui.model.json.JSONModel({
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
				*/
			},

			onAtualizaInfo: function () {
				this._atualizarDados();
			},

			_onRouteMatched: function (oEvent) {
				this._atualizarDados();
			},

			onTerminouAtualizar: function (oEvent) {
				this._atualizarDados();
			},

			_atualizarDados: function () {
				var that = this;
				var countObrig = 0,
					countTTC = 0,
					countTAX = 0;

				NodeAPI.listarRegistros("DeepQuery/RequisicaoModeloObrigacao?&idStatus=1", function (response) { // 1 Obrigacao
					if (response) {

						for (var i = 0, length = response.length; i < length; i++) {
							countObrig++;
						}
						that.getModel().setProperty("/ContadorObrig", {
							modelcountObrig: countObrig

						});
						that.getModel().setProperty("/RequisicaoModeloObrigacao", response);/*
						that.getModel().setProperty("/Obrigacao", response);*/
					}

				});

				NodeAPI.listarRegistros("DeepQuery/RequisicaoReabertura?&status=1", function (response) { // 1 TTC
					if (response) {

						for (var i = 0, length = response.length; i < length; i++) {
							countTTC++;
						}
						that.getModel().setProperty("/ContadorTTC", {
							modelcountTTC: countTTC

						});
						that.getModel().setProperty("/RequisicaoReabertura", response);
					}

				});
				that.getModel().setProperty("/ContadorTTC", {
					modelcountTTC: countTTC
				});

				NodeAPI.listarRegistros("DeepQuery/RequisicaoReaberturaTaxPackage?&status=1", function (response) { // 1 TAX Packege
					if (response) {

						for (var i = 0, length = response.length; i < length; i++) {
							countTAX++;
						}
						that.getModel().setProperty("/ContadorTax", {
							modelcountTAX: countTAX

						});
						that.getModel().setProperty("/RequisicaoReaberturaTaxPackage", response);
					}

				});

				that.getModel().setProperty("/ContadorTax", {
					modelcountTAX: countTAX
				});

				NodeAPI.get("DeepQuery/RequisicaoEncerramentoPeriodoTaxPackage", {
						queryString: {
							status: 1
						}
					})
					.then(function (response) {
						if (response) {
							var json = JSON.parse(response);
							that.getModel().setProperty("/ContadorTax2", json.length);
							that.getModel().setProperty("/RequisicaoEncerramentoPeriodoTaxPackage", json);
						}
					})
					.catch(function (err) {
						alert(err.statusText);
					});

			},

			onDetalharEncerramentoTaxPackage: function (oEvent) {
				var oItemSelecionado = oEvent.getSource().getBindingContext().getObject();

				var oForm = new sap.ui.layout.form.Form({
					editable: true
				}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
					singleContainerFullSize: false
				}));

				var oFormContainer = new sap.ui.layout.form.FormContainer();

				var oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralEmpresa}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.nome_empresa
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralTrimestre}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.periodo
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralDataRequisicao}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.data_requisicao
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralAno}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.ano_calendario
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralUsuario}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.nome_usuario
				}));

				oFormContainer.addFormElement(oFormElement);
				
				var oSelect = new sap.m.Select();
				oSelect.addItem(new sap.ui.core.Item({
					text: "Aprovado",
					key: "2"
				}));
				oSelect.addItem(new sap.ui.core.Item({
					text: "Reprovado",
					key: "3"
				}));

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "Status"
				}).addField(oSelect);
				
				oFormContainer.addFormElement(oFormElement);

				var oTextArea = new sap.m.TextArea({
					rows: 5
				});

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralResposta}"
				}).addField(oTextArea);

				oFormContainer.addFormElement(oFormElement);

				oForm.addFormContainer(oFormContainer);

				var that = this;

				var dialog = new sap.m.Dialog({
					title: "{i18n>viewNotificacaoTituloTaxPackageRequisicaoEncerramento} (#" + oItemSelecionado.id_requisicao_encerramento_periodo_tax_package + ")",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "{i18n>viewGeralSalvar}",
						press: function () {
							NodeAPI.atualizarRegistro("RequisicaoEncerramentoPeriodoTaxPackage", oItemSelecionado.id_requisicao_encerramento_periodo_tax_package, {
								dataRequisicao: oItemSelecionado.data_requisicao,
								observacao: oItemSelecionado.observacao, 
								resposta: oTextArea.getValue(),
								fkDominioRequisicaoEncerramentoPeriodoStatus: oSelect.getSelectedKey(),
								fkUsuario: oItemSelecionado["fk_usuario.id_usuario"],
								fkRelTaxPackagePeriodo: oItemSelecionado.id_rel_tax_package_periodo,
								atualizarPeriodo: true
							}, function (response) {
								that._onEnviarMensagem(oItemSelecionado.nome_empresa, oItemSelecionado.periodo, "ENCERRAMENTO_TP", oItemSelecionado["fk_usuario.id_usuario"]);
								sap.m.MessageToast.show("Solicitação salva com sucesso !");
								dialog.close();
								that.onAtualizaInfo();
							});
						}.bind(this)
					}).setEnabled(oItemSelecionado.btnSalvarHabilitado),
					endButton: new sap.m.Button({
						text: "{i18n>viewGeralSair}",
						press: function () {
							dialog.close();
						}.bind(this)
					}),
					afterClose: function () {
						that.getView().removeDependent(dialog);
						dialog.destroy();
					}
				});

				// to get access to the global model
				this.getView().addDependent(dialog);

				dialog.open();
			},

			onDetalharObrigacao: function (oEvent) {

				var oItemSelecionado = oEvent.getSource().getBindingContext().getObject();
				//var oItemSelecionado = oEvent.getSource().getBindingContext().getObject();
				//oItemSelecionado.id_obrigacao;

				var oForm = new sap.ui.layout.form.Form({
					editable: true
				}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
					singleContainerFullSize: false
				}));

				var oFormContainer = new sap.ui.layout.form.FormContainer();

				var oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralEmpresa}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.nome
				}));

				oFormContainer.addFormElement(oFormElement);
				
				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewComplianceListagemObrigacoesNomeObrigacao}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.nome_obrigacao
				}));

				oFormContainer.addFormElement(oFormElement);
				
				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewEmpresasDataI}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.data_inicial
				}));

				oFormContainer.addFormElement(oFormElement);
				
				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewEmpresasDataF}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.data_final
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewComplianceListagemObrigacoesColunaPrazoEntrega}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.prazo_entrega
				}));

				oFormContainer.addFormElement(oFormElement);
				
				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralAnoObrigacao}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.ano_obrigacao
				}));

				oFormContainer.addFormElement(oFormElement);
				
				/*oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewComplianceListagemObrigacoesColunaExtensao}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.extensao
				}));

				oFormContainer.addFormElement(oFormElement);*/

				/*oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewComplianceListagemObrigacoesColunaAnoFiscal}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.ano_fiscal
				}));

				oFormContainer.addFormElement(oFormElement);*/

				/*oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewComplianceListagemObrigacoesColunaPais}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.pais
				}));

				oFormContainer.addFormElement(oFormElement);*/

				/*oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewComplianceListagemObrigacoesColunaPeriodicidade}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.descricao
				}));

				oFormContainer.addFormElement(oFormElement);*/

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>formularioObrigacaoLabelObrigacaoIniciada}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.obrigacao_inicial ? "SIM" : "NÃO"
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>formularioObrigacaoLabelSuporteContratado}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.suporte_contratado ? "SIM" : "NÃO"

				}));

				oFormContainer.addFormElement(oFormElement);

				/*oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewComplianceListagemObrigacoesColunaSuporteContratado}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.suporte

				}));

				oFormContainer.addFormElement(oFormElement);*/

				/*oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>formularioObrigacaoLabelObservacoes}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.observacoes

				}));

				oFormContainer.addFormElement(oFormElement);*/

				/*var oComboBox = new sap.m.ComboBox("box_default", {
					items: {
						path: "/DominioStatusObrigacao",
						template: {descricao}
					}

				});*/

				var oSelect = new sap.m.Select();

				oSelect.addItem(new sap.ui.core.Item({
					text: "Aprovado",
					key: "2"
				}));
				oSelect.addItem(new sap.ui.core.Item({
					text: "Reprovado",
					key: "3"
				}));

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "Status"
				}).addField(oSelect);

				var oTextArea = new sap.m.TextArea({
					rows: 5
				});

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeral}"
				}).addField(oSelect);

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralResposta}"
				}).addField(oTextArea);

				oFormContainer.addFormElement(oFormElement);

				oForm.addFormContainer(oFormContainer);

				var that = this;
				this.setModel(new sap.ui.model.json.JSONModel({
					obrigacao: {}
				}));
				var dialog = new sap.m.Dialog({
					title: "{i18n>viewNotificacaolinhaRequisicaoObrigacao} (#" + oItemSelecionado.id_requisicao_modelo_obrigacao + ")",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "{i18n>viewGeralSalvar}",
						press: function () {
							//var objObrig = that.getModel().getProperty("/Obrigacao");
							//objObrig.id_obrigacao = oItemSelecionado.id_obrigacao;
							NodeAPI.atualizarRegistro("RequisicaoModeloObrigacao", oItemSelecionado.id_requisicao_modelo_obrigacao, {
								nome_obrigacao: oItemSelecionado.nome_obrigacao,
								data_inicial: oItemSelecionado.data_inicial,
								data_final: oItemSelecionado.data_final,
								prazo_entrega: oItemSelecionado.prazo_entrega,
								ano_obrigacao: oItemSelecionado.ano_obrigacao,
								extensao: oItemSelecionado.extensao,
								obrigacao_inicial: oItemSelecionado.obrigacao_inicial,
								suporte_contratado: oItemSelecionado.suporte_contratado,
								suporte: oItemSelecionado.suporte,
								observacoes: oItemSelecionado.observacoes,
								fkDominioStatusObrigacao: oItemSelecionado["fk_dominio_status_obrigacao.id_status_obrigacao"],
								fkDominioPais: oItemSelecionado["fk_dominio_pais.id_dominio_pais"],
								fkDominioPeriocidadeObrigacao: oItemSelecionado["fk_dominio_periodicidade_obrigacao.id_periodicidade_obrigacao"],
								fkEmpresa: oItemSelecionado["fk_empresa.id_empresa"],
								fkObrigacaoAcessoria: oItemSelecionado["fk_obrigacao_acessoria.id_obrigacao_acessoria"],
								fkAnoFiscal: oItemSelecionado["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"],
								fkDominioObrigacaoAcessoriaTipo: oItemSelecionado["fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo"],
								fkDominioEncerramentoPeriodoStatus: oItemSelecionado["fk_dominio_requisicao_encerramento_periodo_status.id_dominio_requisicao_encerramento_periodo_status"],
								//fkDominioAprovacaoObrigacao: oSelect.getSelectedKey(),
								fkDominioRequisicaoModeloObrigacaoStatus: oSelect.getSelectedKey(),
								motivoReprovacao: oTextArea.getValue()
							}, function (response) {
								sap.m.MessageToast.show("Solicitação salva com sucesso !");
								dialog.close();
								that.onAtualizaInfo();
								//that.getRouter().navTo("complianceListagemObrigacoes");
							});
						}.bind(this)
					}).setEnabled(oItemSelecionado.btnSalvarHabilitado),
					endButton: new sap.m.Button({
						text: "{i18n>viewGeralSair}",
						press: function () {
							dialog.close();
						}.bind(this)
					}),
					afterClose: function () {
						that.getView().removeDependent(dialog);
						dialog.destroy();
					}
				});

				// to get access to the global model
				this.getView().addDependent(dialog);

				dialog.open();
			},

			_onEnviarMensagem: function (vEmpresa, vPeriodo, vTipo, idUsuario) {
				var that = this,
					assunto = "",
					htmlBody = "";

				if (vTipo === "ENCERRAMENTO_TP") {
					assunto = "Tax Package - Quarter closing request - " + vEmpresa + " - " + vPeriodo;
					htmlBody =
						"<p>Dear User,</p><br>"
						+ "<p>&nbsp;Please be informed that we reviewed your request to submit a Tax Package period and the decision is available at <a href='" + document.domain +"'>Vale Global Tax (VGT)</a>.<br>"
						+ "Should you have any question or require any support, don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.</p>"
						+ "<p>Thank you in advance for your support.</p>"
						+ "<p>Global Tax Team</p>";
				}
				else if (vTipo == "TTC") {
					assunto = "TTC - Quarter reopening request - " + vEmpresa + " - " + vPeriodo;
					htmlBody =
						"<p>Dear User,</p><br><p>&nbsp;Please be informed that we reviewed your request to reopen a TTC closed period and the decision is available at <a href='" +
						document.domain +
						"'>Vale Global Tax (VGT)</a> .<br>The quarter reopened will remain open for 5 days. Past the delay, it will be closed automatically.<br>Should you have any question or require any support, don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.</p><p>Thank you in advance for your support.</p><p>Global Tax Team</p>";
				} else {
					assunto = "TAX PACKAGE - Quarter reopening request - " + vEmpresa + " - " + vPeriodo;
					htmlBody =
						"<p>Dear User,</p><br><p>&nbsp;Please be informed that we reviewed your request to reopen a TAX PACKAGE closed period and the decision is available at <a href='" +
						document.domain +
						"'>Vale Global Tax (VGT)</a> .<br>The quarter reopened will remain open for 5 days. Past the delay, it will be closed automatically.<br>Should you have any question or require any support, don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.</p><p>Thank you in advance for your support.</p><p>Global Tax Team</p>";
				}

				jQuery.ajax({ //Desativar botao
					url: Constants.urlBackend + "EmailSend",
					type: "POST",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: {
						_assunto: assunto,
						_corpo: htmlBody,
						IdUsuario: idUsuario
					},
					success: function (response) {
						//sap.m.MessageToast.show("Email enviado com sucesso");
					}
				});
			},

			onDetalharTTC: function (oEvent) {

				var oItemSelecionadoTTC = oEvent.getSource().getBindingContext().getObject();

				var oForm = new sap.ui.layout.form.Form({
					editable: true
				}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
					singleContainerFullSize: false
				}));

				var oFormContainer = new sap.ui.layout.form.FormContainer();

				var oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralEmpresa}"
				}).addField(new sap.m.Text({
					text: oItemSelecionadoTTC.nome
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralTrimestre}"
				}).addField(new sap.m.Text({
					text: oItemSelecionadoTTC.periodo
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralDataRequisicao}"
				}).addField(new sap.m.Text({
					text: oItemSelecionadoTTC.data_requisicao
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralAno}"
				}).addField(new sap.m.Text({
					text: oItemSelecionadoTTC.ano_calendario
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralUsuario}"
				}).addField(new sap.m.Text({
					text: oItemSelecionadoTTC.nome_usuario
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralJustificativa}"
				}).addField(new sap.m.Text({
					text: oItemSelecionadoTTC.justificativa
				}));

				oFormContainer.addFormElement(oFormElement);

				/*var oComboBox = new sap.m.ComboBox("box_default", {
					items: {
						path: "/DominioStatusObrigacao",
						template: {descricao}
					}

				});*/

				var oSelect = new sap.m.Select();
				oSelect.addItem(new sap.ui.core.Item({
					text: "Aprovado",
					key: "2"
				}));
				oSelect.addItem(new sap.ui.core.Item({
					text: "Reprovado",
					key: "3"
				}));

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "Status"
				}).addField(oSelect);

				var oTextArea = new sap.m.TextArea({
					rows: 5
				});

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeral}"
				}).addField(oSelect);

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralResposta}"
				}).addField(oTextArea);

				oFormContainer.addFormElement(oFormElement);

				oForm.addFormContainer(oFormContainer);

				var that = this;
				this.setModel(new sap.ui.model.json.JSONModel({
					TTC: {}
				}));

				var dialog = new sap.m.Dialog({
					title: "{i18n>viewNotificacaolinhaRequisicaoTTC} (#" + oItemSelecionadoTTC.id_requisicao_reabertura + ")",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "{i18n>viewGeralSalvar}",
						press: function () {
							var dataBanco = this._retornaNovaDataFormatoBanco();
							//var objTTC = that.getModel().getProperty("/RequisicaoReabertura");
							//objTTC.id_requisicao_reabertura = oItemSelecionadoTTC.id_requisicao_reabertura;
							NodeAPI.atualizarRegistro("RequisicaoReabertura", oItemSelecionadoTTC.id_requisicao_reabertura, {
								dataRequisicao: oItemSelecionadoTTC.data_requisicao,
								idUsuario: oItemSelecionadoTTC.id_usuario,
								nomeUsuario: oItemSelecionadoTTC.nome_usuario,
								justificativa: oItemSelecionadoTTC.justificativa,
								resposta: oTextArea.getValue(),
								fkDominioRequisicaoReaberturaStatus: oSelect.getSelectedKey(),
								fkEmpresa: oItemSelecionadoTTC["fk_empresa.id_empresa"],
								fkPeriodo: oItemSelecionadoTTC["fk_periodo.id_periodo"],
								dataResposta: dataBanco,
								reabrirPeriodo: true
							}, function (response) {
								that._onEnviarMensagem(oItemSelecionadoTTC.nome, oItemSelecionadoTTC.periodo, "TTC", oItemSelecionadoTTC.id_usuario);
								sap.m.MessageToast.show("Solicitação salva com sucesso !");
								dialog.close();
								that.onAtualizaInfo();
								//that.getRouter().navTo("complianceListagemObrigacoes");
							});
						}.bind(this)
					}).setEnabled(oItemSelecionadoTTC.btnSalvarHabilitado),
					endButton: new sap.m.Button({
						text: "{i18n>viewGeralSair}",
						press: function () {
							dialog.close();
						}.bind(this)
					}),
					afterClose: function () {
						that.getView().removeDependent(dialog);
						dialog.destroy();
					}
				});

				// to get access to the global model
				this.getView().addDependent(dialog);

				dialog.open();
			},

			onDetalharTaxPackage: function (oEvent) {

				var oItemSelecionadoTAX = oEvent.getSource().getBindingContext().getObject();

				var oForm = new sap.ui.layout.form.Form({
					editable: true
				}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
					singleContainerFullSize: false
				}));

				var oFormContainer = new sap.ui.layout.form.FormContainer();

				var oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralEmpresa}"
				}).addField(new sap.m.Text({
					text: oItemSelecionadoTAX.nome
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralTrimestre}"
				}).addField(new sap.m.Text({
					text: oItemSelecionadoTAX.periodo
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralDataRequisicao}"
				}).addField(new sap.m.Text({
					text: oItemSelecionadoTAX.data_requisicao
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralAno}"
				}).addField(new sap.m.Text({
					text: oItemSelecionadoTAX.ano_calendario
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralUsuario}"
				}).addField(new sap.m.Text({
					text: oItemSelecionadoTAX.nome_usuario
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralJustificativa}"
				}).addField(new sap.m.Text({
					text: oItemSelecionadoTAX.justificativa
				}));

				oFormContainer.addFormElement(oFormElement);

				/*var oComboBox = new sap.m.ComboBox("box_default", {
					items: {
						path: "/DominioStatusObrigacao",
						template: {descricao}
					}

				});*/

				var oSelect = new sap.m.Select();
				oSelect.addItem(new sap.ui.core.Item({
					text: "Aprovado",
					key: "2"
				}));
				oSelect.addItem(new sap.ui.core.Item({
					text: "Reprovado",
					key: "3"
				}));

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "Status"
				}).addField(oSelect);

				var oTextArea = new sap.m.TextArea({
					rows: 5
				});

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeral}"
				}).addField(oSelect);

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralResposta}"
				}).addField(oTextArea);

				oFormContainer.addFormElement(oFormElement);

				oForm.addFormContainer(oFormContainer);

				var that = this;
				this.setModel(new sap.ui.model.json.JSONModel({
					TAX: {}
				}));

				var dialog = new sap.m.Dialog({
					title: "{i18n>viewNotificacaolinhaRequisicaoTaxPackage} (#" + oItemSelecionadoTAX.id_requisicao_reabertura_tax_tackage + ")",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "{i18n>viewGeralSalvar}",
						press: function () {
							var dataBanco = this._retornaNovaDataFormatoBanco();
							//var objTAX = that.getModel().getProperty("/RequisicaoReaberturaTaxPackage");
							//objTAX.id_requisicao_reabertura_tax_tackage = oItemSelecionadoTAX.id_requisicao_reabertura;
							NodeAPI.atualizarRegistro("RequisicaoReaberturaTaxPackage", oItemSelecionadoTAX.id_requisicao_reabertura_tax_tackage, {
								dataRequisicao: oItemSelecionadoTAX.data_requisicao,
								idUsuario: oItemSelecionadoTAX.id_usuario,
								nomeUsuario: oItemSelecionadoTAX.nome_usuario,
								justificativa: oItemSelecionadoTAX.justificativa,
								resposta: oTextArea.getValue(),
								fkDominioRequisicaoReaberturaStatus: oSelect.getSelectedKey(),
								fkIdRelTaxPackagePeriodo: oItemSelecionadoTAX["fk_id_rel_tax_package_periodo.id_rel_tax_package_periodo"],
								dataResposta: dataBanco,
								reabrirPeriodo: true
							}, function (response) {
								that._onEnviarMensagem(oItemSelecionadoTAX.nome, oItemSelecionadoTAX.periodo, "TAX", oItemSelecionadoTAX.id_usuario);
								sap.m.MessageToast.show("Solicitação salva com sucesso !");
								dialog.close();
								that.onAtualizaInfo();
								//that.getRouter().navTo("complianceListagemObrigacoes");
							});
						}.bind(this)
					}).setEnabled(oItemSelecionadoTAX.btnSalvarHabilitado),
					endButton: new sap.m.Button({
						text: "{i18n>viewGeralSair}",
						press: function () {
							dialog.close();
						}.bind(this)
					}),
					afterClose: function () {
						that.getView().removeDependent(dialog);
						dialog.destroy();
					}
				});

				// to get access to the global model
				this.getView().addDependent(dialog);

				dialog.open();
			},
			/*
			onResponder: function (oEvent) {
				//if (!this.pressDialog) {
				var oForm = new sap.ui.layout.form.Form({
					editable: true
				}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
					singleContainerFullSize: false
				}));

				var oFormContainer = new sap.ui.layout.form.FormContainer();

				var oFormElement = new sap.ui.layout.form.FormElement({
					label: "Módulo"
				}).addField(new sap.m.Text({
					text: "Tax Package"
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "Usuário"
				}).addField(new sap.m.Text({
					text: "Usuário A"
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "Empresa"
				}).addField(new sap.m.Text({
					text: "Empresa A"
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "Período"
				}).addField(new sap.m.Text({
					text: "1º Trimestre"
				}));

				oFormContainer.addFormElement(oFormElement);

				var oSelect = new sap.m.Select();
				oSelect.addItem(new sap.ui.core.Item({
					text: "Aprovado"
				}));
				oSelect.addItem(new sap.ui.core.Item({
					text: "Reprovado"
				}));

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "Status"
				}).addField(oSelect);

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "Resposta"
				}).addField(new sap.m.TextArea({
					rows: 5
				}));

				oFormContainer.addFormElement(oFormElement);

				oForm.addFormContainer(oFormContainer);

				var pressDialog = new sap.m.Dialog({
					title: "Resposta Requisição",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "enviar",
						press: function () {
							sap.m.MessageToast.show("Enviar resposta");
							pressDialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "sair",
						press: function () {
							pressDialog.close();
						}.bind(this)
					}),
					afterClose: function () {
						pressDialog.destroy();
					}
				});

				// to get access to the global model
				this.getView().addDependent(pressDialog);
				//}

				pressDialog.open();
			},
			*/
			_carregarObjetos: function () {
				sap.m.MessageToast.show("Carregar objetos");
			},
			_retornaNovaDataFormatoBanco: function () {
		        var year, month, day;
		        var dataAgora = new Date();
		        year = String(dataAgora.getFullYear());
		        month = String(dataAgora.getMonth() + 1);
		        if (month.length == 1) {
		            month = "0" + month;
		        }
		        day = String(dataAgora.getDate());
		        if (day.length == 1) {
		            day = "0" + day;
		        }
		        return year + "-" + month + "-" + day;
			}
		});
	});