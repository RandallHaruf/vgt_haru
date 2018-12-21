sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/jQueryMask",
		"ui5ns/ui5/model/Constants"
	],
	function (BaseController, JSONModel, NodeAPI, JQueryMask, Constants) {
		"use strict";

		BaseController.extend("ui5ns.ui5.controller.ttc.ResumoTrimestre", {

			onInit: function () {
				sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR");
				
				this.setModel(new JSONModel());

				this.getRouter().getRoute("ttcResumoTrimestre").attachPatternMatched(this._onRouteMatched, this);
			},

			onTrocarAnoCalendario: function (oEvent) {
				/*sap.m.MessageToast.show(this.getResourceBundle().getText("viewResumoTrimestreAnoSelecionado ") + oEvent.getSource().getSelectedItem()
					.getText());*/

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
						if (Hoje > new Date((new Date().getFullYear()) + "/10/31") && Hoje < new Date((new Date().getFullYear() + 1) + "01/01")) {
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
						if (Hoje > new Date((new Date().getFullYear()) + "/10/20") && Hoje < new Date((new Date().getFullYear() + 1) + "01/01")) {
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

			onSubmeterPeriodo: function (oPeriodo) {
				var that = this,
					sIdEmpresa = this.getModel().getProperty("/Empresa").id_empresa;

				var dialog = new sap.m.Dialog({
					title: this.getView().getModel("i18n").getResourceBundle().getText("viewResumoTrimestreJSTEXTSConfirmaçãodeFechamento"),
					type: "Message",
					content: new sap.m.Text({
						text: this.getView().getModel("i18n").getResourceBundle().getText(
							"viewResumoTrimestreJSTEXTSVocêtemcertezaquedesejafecharoperíodo"),
					}),
					beginButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewResumoTrimestreJSTEXTSSubmeter"),
						press: function () {
							NodeAPI.atualizarRegistro("EncerrarTrimestreTTC", "", {
								idEmpresa: sIdEmpresa,
								idPeriodo: oPeriodo.id_periodo
							}, function (response) {
								dialog.close();

								var json = JSON.parse(response);

								if (json.success) {
									that._atualizarDados();
								} else {
									var dialog2 = new sap.m.Dialog({
										title: that.getView().getModel("i18n").getResourceBundle().getText("viewResumoTrimestreJSTEXTSAviso"),
										type: "Message",
										content: new sap.m.Text({
											text: json.message
										}),
										endButton: new sap.m.Button({
											text: that.getView().getModel("i18n").getResourceBundle().getText("viewResumoTrimestreJSTEXTSFechar"),
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

				var assunto = "TTC - Period reopening - " + vEmpresa + " - " + vPeriodo;
				//var corpo = that.getModel().getProperty("/corpo");
				var htmlBody =
					"<p>Dear Administrator,</p><br><p>&nbsp;A user is requesting to reopen a closed period in the TTC module at Vale Global Tax (VGT) – inserir hyperlink– Your approval is required</p><p>Thank you in advance.</p><p>Global Tax Team</p>";
				//this.getModel().setProperty("/bEmailButton", false);

				jQuery.ajax({ //Desativar botao
					url: Constants.urlBackend + "EmailSend",
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

			onReabrirPeriodo: function (oPeriodo) {
				var that = this;

				var oParams = {};

				oParams.oPeriodo = oPeriodo;
				oParams.oEmpresa = that.getModel().getProperty("/Empresa");
				oParams.oAnoCalendario = {
					idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado"),
					anoCalendario: this.byId("selectAnoCalendario").getSelectedItem().getText()
				};

				//sIdEmpresa = that.getModel().getProperty("/Empresa");

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
				this.getRouter().navTo("ttcListagemEmpresas");
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
				var oEmpresa = JSON.parse(oEvent.getParameter("arguments").oEmpresa);
				var idAnoCalendario = oEvent.getParameter("arguments").idAnoCalendario;

				this.getModel().setProperty("/AnoCalendarioSelecionado", idAnoCalendario);
				this.getModel().setProperty("/Empresa", oEmpresa);

				/*this.getModel().setProperty("/PrimeiroPeriodo", [{
					moeda: "USD",
					categoria: "borne",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "USD",
					categoria: "collected",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "BRL",
					categoria: "borne",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "BRL",
					categoria: "collected",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "GBP",
					categoria: "borne",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "GBP",
					categoria: "collected",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "CHF",
					categoria: "borne",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "CHF",
					categoria: "collected",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}]);
				this.getModel().setProperty("/SegundoPeriodo", [{
					moeda: "USD",
					categoria: "borne",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "USD",
					categoria: "collected",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "BRL",
					categoria: "borne",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "BRL",
					categoria: "collected",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}]);
				this.getModel().setProperty("/TerceiroPeriodo", [{
					moeda: "USD",
					categoria: "borne",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "USD",
					categoria: "collected",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "BRL",
					categoria: "borne",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "BRL",
					categoria: "collected",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}]);
				this.getModel().setProperty("/QuartoPeriodo", [{
					moeda: "USD",
					categoria: "borne",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "USD",
					categoria: "collected",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "BRL",
					categoria: "borne",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}, {
					moeda: "BRL",
					categoria: "collected",
					primeiroValor: "999.999.999,99",
					segundoValor: "999.999.999,99",
					terceiroValor: "999.999.999,99",
					total: "999.999.999,99"
				}]);*/

				var that = this;

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

				var aIdToolbar = ["toolbarPrimeiroPeriodo", "toolbarSegundoPeriodo", "toolbarTerceiroPeriodo", "toolbarQuartoPeriodo"];

				NodeAPI.listarRegistros(sEntidade, function (response) {
					that.byId(aIdToolbar[0]).removeAllContent();
					that.byId(aIdToolbar[1]).removeAllContent();
					that.byId(aIdToolbar[2]).removeAllContent();
					that.byId(aIdToolbar[3]).removeAllContent();

					if (response) {
						for (var i = 0; i < response.length; i++) {

							//response[i][""] = 

							var oPeriodo = response[i];

							if (oPeriodo.ind_ativo) {
								that._popularToolbarPeriodoCorrente(aIdToolbar[i], oPeriodo);
							} else {
								that._popularToolbarPeriodoFechado(aIdToolbar[i], oPeriodo);
							}
						}
					}
				});

				this._setBusy(true);

				NodeAPI.listarRegistros("ResumoTrimestreTTC?empresa=" + sIdEmpresa + "&anoCalendario=" + sIdAnoCalendario, function (response) {
					if (response) {
						var aKeys = Object.keys(response);
						for (var i = 0, length = aKeys.length; i < length; i++) {
							var sKey = aKeys[i];

							var aPagamento = response[sKey];

							for (var j = 0, length2 = aPagamento.length; j < length2; j++) {
								var oPagamento = aPagamento[j];

								oPagamento["primeiroValor"] = (oPagamento["primeiroValor"] ? parseInt(oPagamento["primeiroValor"], 10) : 0);
								oPagamento["segundoValor"] = (oPagamento["segundoValor"] ? parseInt(oPagamento["segundoValor"], 10) : 0);
								oPagamento["terceiroValor"] = (oPagamento["terceiroValor"] ? parseInt(oPagamento["terceiroValor"], 10) : 0);
								oPagamento["total"] = (oPagamento["total"] ? parseInt(oPagamento["total"], 10) : 0);
							}
						}
						that.getModel().setProperty("/Resumo", response);
						setTimeout(function () {
							$.each($('.money span'), function (index, el) {
								var valor = $(el).text();
								valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
								$(el).text(valor);
							});
						}, 150);
					}

					that._setBusy(false);
				});

				/*
				if ((new Date()).getFullYear() !== Number(this.byId("selectAnoCalendario").getSelectedItem().getText())) {
					this._popularToolbarPeriodoFechado("toolbarPrimeiroPeriodo", 1);
					this._popularToolbarPeriodoFechado("toolbarSegundoPeriodo", 2);
					this._popularToolbarPeriodoFechado("toolbarTerceiroPeriodo", 3);
					this._popularToolbarPeriodoFechado("toolbarQuartoPeriodo", 4);
				}
				else {
					this._popularToolbarPeriodoFechado("toolbarPrimeiroPeriodo", 1);
					this._popularToolbarPeriodoFechado("toolbarSegundoPeriodo", 2);
					this._popularToolbarPeriodoFechado("toolbarTerceiroPeriodo", 3);
					this._popularToolbarPeriodoCorrente("toolbarQuartoPeriodo", 4);
				}*/
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
				}).attachPress(function () {
					that.onReabrirPeriodo(oPeriodo);
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
						dataInicio = new Date(iCurrentYear + "/21/1");
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
						if (now >= new Date(iCurrentYear + "/01/1") && now <= new Date(iCurrentYear + "/01/20")) {
							iAux = iCurrentYear - 1;
							dataInicio = new Date(iAux + "/10/21");
							dataFim = new Date(iCurrentYear + "/01/20");
						}
						else {
							iAux =  iCurrentYear + 1;
							dataInicio = new Date(iCurrentYear + "/10/21");
							dataFim = new Date(iAux+  "/01/20");
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
						text: that.getResourceBundle().getText("viewGeralFaltamXDias", [that.ContadorDeTempo(1,oPeriodo.numero_ordem)])
					}));
				}
				else {
					// PEGAR A DATA LIMITE QUE A REABERTURA É VALIDA E CALCULAR QUANTO TEMPO FALTA
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