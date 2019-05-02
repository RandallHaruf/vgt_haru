sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/models",
		"ui5ns/ui5/model/formatter",
		"sap/ui/model/Filter",
		"sap/m/MessageToast",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController,models, formatter, Filter, MessageToast, Constants, NodeAPI, Utils) {
		return BaseController.extend("ui5ns.ui5.controller.compliance.ListagemRequisicoes", {
			formatter: formatter,

                /*onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					requisicoes: [
						{
							id: 1,
							empresa: "Empresa A",
							trimestre: "1º Trimestre",
							dataRequisicao: "20/05/2018",
							anoRequisicao: 2018,
							usuario: "Usuario A",
							justificativa: "Não consegui fazer a tempo",
							status: {
								icone: "sap-icon://accept",
								cor: "green", 
								tooltip: "Aprovado"
							}
						},
						{
							id: 2,
							empresa: "Empresa A",
							trimestre: "2º Trimestre",
							dataRequisicao: "10/05/2018",
							anoRequisicao: 2018,
							usuario: "Usuario A",
							justificativa: "Esqueci de preencher com o valor final",
							resposta: "Deveria ter preenchido.",
							status: {
								icone: "sap-icon://decline",
								cor: "red",
								tooltip: "Rejeitado"
							}
						},
						{
							id: 3,
							empresa: "Empresa A",
							trimestre: "3º Trimestre",
							dataRequisicao: "25/05/2018",
							anoRequisicao: 2018,
							usuario: "Usuario A",
							justificativa: "Não consegui fazer a tempo",
							status: {
								icone: "sap-icon://lateness",
								cor: "orange",
								tooltip: "Em andamento"
							}
						}
					]
				}));
				this.getRouter().getRoute("complianceListagemObrigacoes").attachPatternMatched(this._onRouteMatched, this);
			},*/

			onInit: function (oEvent) {
			
				this.setModel(models.createViewModelParaComplianceListagemObrigacoes(), "viewModel");
			    this.setModel(new sap.ui.model.json.JSONModel({})); 
				this.getRouter().getRoute("complianceListagemRequisicoes").attachPatternMatched(this._onRouteMatched, this);
			},
			
			onTrocarStatus: function (oEvent) {
				// sap.m.MessageToast.show("Ano selecionado: " + oEvent.getSource().getSelectedItem().getText());
				
				this._atualizarDados();
			},

            onDetalharObrigacao: function (oEvent) {
				this.getRouter().navTo("complianceFormularioDetalhesObrigacao");
			},
			
			onNovoObjeto: function (oEvent) {
				this.getRouter().navTo("ttcFormularioNovaRequisicaoReabertura");
			},

			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			
			navToPage2: function () {
				this.getRouter().navTo("complianceListagemObrigacoes", {
					parametros: this.toURIComponent({
						idEmpresaCalendario: this.getModel().getProperty("/IdEmpresaSelecionado"),
						idAnoCalendario: this.getModel().getProperty("/IdAnoSelecionado")
					})
				});
			},

            /*navToPage3: function () {
				this.getRouter().navTo("ttcResumoTrimestre");
				this._navToResumoTrimestre();
			},
			*/
			/*_navToResumoTrimestre: function () {
				this._limparModel();
				
				var oEmpresaSelecionada = this.getModel().getProperty("/empresa");
				var sIdAnoCalendario = this.getModel().getProperty("/idAnoCalendario");
			
				this.getRouter().navTo("ttcResumoTrimestre", {
					oEmpresa: JSON.stringify(oEmpresaSelecionada),
					idAnoCalendario: sIdAnoCalendario
				}); 
			},*/
			
			onDetalharRequisicao: function (oEvent) {
				var that = this;
				var oItemSelecionado = oEvent.getSource().getBindingContext().getObject();
				this._dialogDetalharRequisicao = sap.ui.getCore().byId("dialogRequisicao");
				
				if (!this._dialogDetalharRequisicao) {
					var oForm = new sap.ui.layout.form.Form({
						editable: true
					}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
						singleContainerFullSize: false
					}));
	
					var oFormContainer = new sap.ui.layout.form.FormContainer();
					
					var oFormElement = new sap.ui.layout.form.FormElement({
						label: "{i18n>viewGeralIdRequisicao}"
					}).addField(new sap.m.Text({
						text: oItemSelecionado.id_requisicao_modelo_obrigacao
					}));
					oFormContainer.addFormElement(oFormElement);
					
					oFormElement = new sap.ui.layout.form.FormElement({
						label: "{i18n>viewGeralDataRequisicao}"
					}).addField(new sap.m.Text({
						text: oItemSelecionado.data_requisicao
					}));
					oFormContainer.addFormElement(oFormElement);
					
					oFormElement = new sap.ui.layout.form.FormElement({
						label: "{i18n>viewGeralUsuario}"
					}).addField(new sap.m.Text({
						text: oItemSelecionado.nome_usuario
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
	
					oFormElement = new sap.ui.layout.form.FormElement({
						label: "{i18n>formularioObrigacaoLabelObrigacaoIniciada}"
					}).addField(new sap.m.Text({
						text: oItemSelecionado.obrigacao_inicial
					}));
					oFormContainer.addFormElement(oFormElement);
	
					oFormElement = new sap.ui.layout.form.FormElement({
						label: "{i18n>formularioObrigacaoLabelSuporteContratado}"
					}).addField(new sap.m.Text({
						text: oItemSelecionado.suporte_contratado
					}));
					oFormContainer.addFormElement(oFormElement);
					
					oForm.addFormContainer(oFormContainer);
					var dialog = new sap.m.Dialog({
						title: oItemSelecionado.nome_obrigacao,
						showHeader: true,
						type: "Message",
						id: "dialogRequisicao",
						content: oForm,
						endButton: new sap.m.Button({
							text: "OK",
							press: function () {
								dialog.close();
							}
						}),
						afterClose: function () {
							that.getView().removeDependent(dialog);
							dialog.destroy();
						}
					});
					this.getView().addDependent(dialog);
					this._dialogDetalharRequisicao = dialog;
				}
				this._dialogDetalharRequisicao.open();
			},
			
			_onRouteMatched: function (oEvent) {
				var that = this;
				this.getModel().setProperty("/IdAnoSelecionado", this.fromURIComponent(oEvent.getParameter("arguments").parametros).anoCalendario);
				this.getModel().setProperty("/IdEmpresaSelecionado", this.fromURIComponent(oEvent.getParameter("arguments").parametros).empresa);
				var oParametros = this.fromURIComponent(oEvent.getParameter("arguments").parametros);
				
				NodeAPI.listarRegistros("DominioRequisicaoModeloObrigacaoStatus", function (response) {
					if (response) {
						var aResponse = response.result;
						for (var i = 0, length = aResponse.length; i < length; i++) {
							aResponse[i]["status"] = Utils.traduzTTCRequisicaoReaberturaPeriodoStatus(aResponse[i]["id_dominio_requisicao_modelo_obrigacao_status"],that);
						}	
						aResponse = Utils.orderByArrayParaBox(aResponse, "status");
						aResponse.unshift({
							status: that.getResourceBundle().getText("viewGeralTodos")
						});						
						that.getModel().setProperty("/DominioRequisicaoModeloObrigacaoStatus", aResponse);
						that._atualizarDados();
					}
				});
			},
			
			onTerminouAtualizar: function (oEvent) {             
				this._atualizarDados(oEvent);
			},
			
			_atualizarDados: function (oEvent) {
				var that = this;
				
				var sIdStatus = this.getModel().getProperty("/DominioRequisicaoModeloObrigacaoStatusSelecionado") ? this.getModel().getProperty("/DominioRequisicaoModeloObrigacaoStatusSelecionado") : "";
				
				NodeAPI.listarRegistros("DeepQuery/RequisicaoModeloObrigacao?filtrarUsuario=true&TipoObrigacao=2&idStatus=" + sIdStatus, function (response) { // 2 COMPLIANCE
					if (response) {
						for (var i = 0, length = response.length; i < length; i++) {
							if (response[i].id_dominio_requisicao_modelo_obrigacao_status === 1) {
							    response[i].oStatus = {
								  icone: "sap-icon://lateness",
							      cor: "orange",
							      tooltip: "Pendente"
							    };
							} else if (response[i].id_dominio_requisicao_modelo_obrigacao_status === 2) {
								response[i].oStatus = {
								  icone: "sap-icon://accept",
							      cor: "green",
							      tooltip: "Aprovado"
							    };
							} else if (response[i].id_dominio_requisicao_modelo_obrigacao_status === 3) {
							    response[i].oStatus = {
								  icone: "sap-icon://decline",
							      cor: "red",
							      tooltip: "Reprovado"
							    };
							}
						
						response[i]["pais"] = Utils.traduzDominioPais(response[i]["fk_dominio_pais.id_dominio_pais"], that);
						response[i]["nome_periodicidade"] = Utils.traduzPeriodo(response[i]["fk_id_dominio_periodicidade.id_periodicidade_obrigacao"],that);
						response[i].suporte_contratado = response[i].suporte_contratado ? "SIM" : "NÃO";
						response[i].obrigacao_inicial = response[i].obrigacao_inicial ? "SIM" : "NÃO";
						}
						that.getModel().setProperty("/Obrigacao", response);
					}
				});
			}
			
		});
	}
);