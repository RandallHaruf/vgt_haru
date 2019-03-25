sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, NodeAPI, Utils) {
		"use strict";

		return BaseController.extend("ui5ns.ui5.controller.ttc.VisualizacaoTrimestre", {
			onInit: function () {
				//sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR");

				this.setModel(new sap.ui.model.json.JSONModel({
					Pagamentos: {
						Borne: [],
						Collected: []
					}
				}));

				this.getRouter().getRoute("ttcVisualizacaoTrimestre").attachPatternMatched(this._onRouteMatched, this);
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

			onReabrirPeriodo: function (oPeriodo) {
				var that = this;

				var oParams = {};

				oParams.oPeriodo = that.getModel().getProperty("/Periodo");
				oParams.oEmpresa = that.getModel().getProperty("/Empresa");

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
					text: "{/Periodo/periodo}"
				}));

				oFormContainer.addFormElement(oFormElement);

				var oTextArea = new sap.m.TextArea({
					rows: 5
				});

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralJustificativa}"
				}).addField(oTextArea);

				oFormContainer.addFormElement(oFormElement);

				oForm.addFormContainer(oFormContainer);

				var dialog = new sap.m.Dialog({
					title: "{i18n>viewGeralNovaRequisicao}",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "{i18n>viewGeralSalvar}",
						press: function () {
							NodeAPI.criarRegistro("RequisicaoReabertura", {
								dataRequisicao: this._formatDate(new Date()),
								idUsuario: "1",
								nomeUsuario: "Haru_Int",
								justificativa: oTextArea.getValue(),
								resposta: "",
								fkDominioRequisicaoReaberturaStatus: "1",
								fkEmpresa: oParams.oEmpresa.id_empresa,
								fkPeriodo: oParams.oPeriodo.id_periodo,
								nomeEmpresa: oParams.oEmpresa.nome
							});
							sap.m.MessageToast.show(this.getResourceBundle().getText("viewResumoTrimestreToast"));
							dialog.close();
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

			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			navToPage2: function () {
				this.getRouter().navTo("ttcListagemEmpresas", {
					parametros: JSON.stringify({
						idAnoCalendario: this.getModel().getProperty("/AnoCalendario").idAnoCalendario
					})
				});
			},

			navToPage3: function () {
				var oEmpresaSelecionada = this.getModel().getProperty("/Empresa");
				var sIdAnoCalendarioSelecionado = this.getModel().getProperty("/AnoCalendario").idAnoCalendario;

				this.getRouter().navTo("ttcResumoTrimestre", {
					oEmpresa: JSON.stringify(oEmpresaSelecionada),
					idAnoCalendario: sIdAnoCalendarioSelecionado
				});
			},

			_onRouteMatched: function (oEvent) {
				var that = this;
				
				if (this.isIFrame()) {
					this.mostrarAcessoRapidoInception();
					this.byId("btnReabrir").setVisible(false);
				}

				var oParameters = JSON.parse(oEvent.getParameter("arguments").oParameters);
				oParameters.oPeriodo.periodo = Utils.traduzTrimestreTTC(oParameters.oPeriodo.numero_ordem, that);
				
				this.getModel().setProperty("/Empresa", oParameters.oEmpresa);
				this.getModel().setProperty("/Periodo", oParameters.oPeriodo);
				this.getModel().setProperty("/AnoCalendario", oParameters.oAnoCalendario);

				var sIdEmpresa = oParameters.oEmpresa.id_empresa,
					sIdPeriodo = oParameters.oPeriodo.id_periodo;

				this.byId("tabelaPagamentosBorne").setBusyIndicatorDelay(100);
				this.byId("tabelaPagamentosBorne").setBusy(true);

				NodeAPI.listarRegistros("/DeepQuery/Pagamento?full=true&empresa=" + sIdEmpresa + "&periodo=" + sIdPeriodo + "&tax_classification=1",
					function (response) { // tax_classification = BORNE
						if (response) {
							for (var i = 0; i < response.length; i++) {
								response[i].icone_aplicavel = response[i].ind_nao_aplicavel ? "sap-icon://accept" : "sap-icon://decline";
							}

							that.getModel().setProperty("/Pagamentos/Borne", response);
						}

						that.byId("tabelaPagamentosBorne").setBusy(false);
					});

				this.byId("tabelaPagamentosCollected").setBusyIndicatorDelay(100);
				this.byId("tabelaPagamentosCollected").setBusy(true);

				NodeAPI.listarRegistros("/DeepQuery/Pagamento?full=true&empresa=" + sIdEmpresa + "&periodo=" + sIdPeriodo + "&tax_classification=2",
					function (response) { // tax_classification = BORNE
						if (response) {
							for (var i = 0; i < response.length; i++) {
								response[i].icone_aplicavel = response[i].ind_nao_aplicavel ? "sap-icon://accept" : "sap-icon://decline";
							}

							that.getModel().setProperty("/Pagamentos/Collected", response);
						}

						that.byId("tabelaPagamentosCollected").setBusy(false);
					});
			}
		});
	}
);