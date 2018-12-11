sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/models",
		"sap/ui/model/Filter",
		"sap/m/MessageToast",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, models, Filter, MessageToast, NodeAPI) {
		return BaseController.extend("ui5ns.ui5.controller.ListaNotificacoes", {
			onInit: function () {

				this.setModel(models.createViewModelParaComplianceListagemObrigacoes(), "viewModel");
				this.setModel(new sap.ui.model.json.JSONModel({}));
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
			
			onAtualizaInfo: function()
			{
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

				NodeAPI.listarRegistros("DeepQuery/Obrigacao?&idAprovacao=1", function (response) { // 1 Obrigacao
					if (response) {

						for (var i = 0, length = response.length; i < length; i++) {
							countObrig++;
						}
						that.getModel().setProperty("/ContadorObrig", {
							modelcountObrig: countObrig

						});
						that.getModel().setProperty("/Obrigacao", response);
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
					label: "{i18n>viewComplianceListagemObrigacoesColunaPrazoEntrega}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.prazo_entrega
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewComplianceListagemObrigacoesColunaExtensao}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.extensao
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewComplianceListagemObrigacoesColunaAnoFiscal}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.ano_fiscal
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewComplianceListagemObrigacoesColunaPais}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.pais
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewComplianceListagemObrigacoesColunaPeriodicidade}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.descricao
				}));

				oFormContainer.addFormElement(oFormElement);

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

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewComplianceListagemObrigacoesColunaSuporteContratado}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.suporte

				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>formularioObrigacaoLabelObservacoes}"
				}).addField(new sap.m.Text({
					text: oItemSelecionado.observacoes

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
					obrigacao: {
					} 	
				}));
				var dialog = new sap.m.Dialog({
					title: "{i18n>viewNotificacaolinhaRequisicaoObrigacao} (#" + oItemSelecionado.id_obrigacao + ")",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "{i18n>viewGeralSalvar}",
						press: function () {
							//var objObrig = that.getModel().getProperty("/Obrigacao");
							//objObrig.id_obrigacao = oItemSelecionado.id_obrigacao;
							NodeAPI.atualizarRegistro("Obrigacao", 	oItemSelecionado.id_obrigacao , {
								prazo_entrega: oItemSelecionado.prazo_entrega,
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
								fkDominioAprovacaoObrigacao: oSelect.getSelectedKey(),
								motivoReprovacao:  oTextArea.getValue()
							}, function (response) {
								sap.m.MessageToast.show("Solicitação salva com sucesso !");
								dialog.close();
								that.onAtualizaInfo();
								//that.getRouter().navTo("complianceListagemObrigacoes");
							});
						}.bind(this)
					}),
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
					TTC: {
					} 	
				}));
				
				var dialog = new sap.m.Dialog({
					title: "{i18n>viewNotificacaolinhaRequisicaoTTC} (#" + oItemSelecionadoTTC.id_requisicao_reabertura + ")",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "{i18n>viewGeralSalvar}",
						press: function () {
							//var objTTC = that.getModel().getProperty("/RequisicaoReabertura");
							//objTTC.id_requisicao_reabertura = oItemSelecionadoTTC.id_requisicao_reabertura;
							NodeAPI.atualizarRegistro("RequisicaoReabertura", oItemSelecionadoTTC.id_requisicao_reabertura, {
								dataRequisicao: oItemSelecionadoTTC.data_requisicao,
								idUsuario: oItemSelecionadoTTC.id_usuario,
								nomeUsuario: oItemSelecionadoTTC.nome_usuario,
								justificativa: oItemSelecionadoTTC.justificativa,
								resposta:  oTextArea.getValue(),
								fkDominioRequisicaoReaberturaStatus: oSelect.getSelectedKey(),
								fkEmpresa: oItemSelecionadoTTC["fk_empresa.id_empresa"],
								fkPeriodo: oItemSelecionadoTTC["fk_periodo.id_periodo"],
								reabrirPeriodo: true
							}, function (response) {
								sap.m.MessageToast.show("Solicitação salva com sucesso !");
								dialog.close();
								that.onAtualizaInfo();
								//that.getRouter().navTo("complianceListagemObrigacoes");
							});
						}.bind(this)
					}),
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
			
			onDetalharTaxPackage : function (oEvent) {

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
					TAX: {
					} 	
				}));
				
				    var dialog = new sap.m.Dialog({
					title: "{i18n>viewNotificacaolinhaRequisicaoTaxPackage} (#" + oItemSelecionadoTAX.id_requisicao_reabertura_tax_tackage + ")",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "{i18n>viewGeralSalvar}",
						press: function () {
							//var objTAX = that.getModel().getProperty("/RequisicaoReaberturaTaxPackage");
							//objTAX.id_requisicao_reabertura_tax_tackage = oItemSelecionadoTAX.id_requisicao_reabertura;
							NodeAPI.atualizarRegistro("RequisicaoReaberturaTaxPackage", oItemSelecionadoTAX.id_requisicao_reabertura_tax_tackage, {
								dataRequisicao: oItemSelecionadoTAX.data_requisicao,
								idUsuario: 	oItemSelecionadoTAX.id_usuario,
								nomeUsuario: oItemSelecionadoTAX.nome_usuario,
								justificativa: oItemSelecionadoTAX.justificativa,
								resposta:  oTextArea.getValue(),
								fkDominioRequisicaoReaberturaStatus: oSelect.getSelectedKey(),
								fkIdRelTaxPackagePeriodo: oItemSelecionadoTAX["fk_id_rel_tax_package_periodo.id_rel_tax_package_periodo"],
								}, function (response) {
								sap.m.MessageToast.show("Solicitação salva com sucesso !");
								dialog.close();
								that.onAtualizaInfo();
								//that.getRouter().navTo("complianceListagemObrigacoes");
							});
						}.bind(this)
					}),
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
			}
		});
	});