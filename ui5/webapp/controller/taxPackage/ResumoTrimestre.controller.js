sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, NodeAPI) {
		return BaseController.extend("ui5ns.ui5.controller.taxPackage.ResumoTrimestre", {
			pressDialog: null,
			
			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					"trimestres": {
						"PrimeiroTrimestre": [],
						"SegundoTrimestre": [],
						"TerceiroTrimestre": [],
						"QuartoTrimestre": []
					},
					"anual": [],
					"retificadora": []
				}));
				
				this.getRouter().getRoute("taxPackageResumoTrimestre").attachPatternMatched(this._onRouteMatched, this);
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
					parametros: JSON.stringify(oParams)
				});
			},
			
			onVisualizarPeriodo: function (oPeriodo) {
				//this.getRouter().navTo("taxPackageVisualizacaoTrimestre");
				alert("Visualizar: " + oPeriodo.periodo);
			},
			
			onSubmeterPeriodo: function (oPeriodo) {
				var dialog = new sap.m.Dialog({
					title: "Confirmação de Fechamento",
					type: "Message",
					content: new sap.m.Text({ text: "Você tem certeza que deseja fechar o período?" }),
					beginButton: new sap.m.Button({
						text: "Submeter",
						press: function () {
							//sap.m.MessageToast.show("Submit pressed!");
							alert("Submeter: " + oPeriodo.periodo);
							dialog.close();
						}
					}),
					endButton: new sap.m.Button({
						text: "Cancelar",
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
	
				dialog.open();	
			},
			
			onReabrirPeriodo: function (oPeriodo) {
				var that = this;
				
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
					text: oPeriodo.numero_ordem + " {i18n>viewGeralTrimestre}"
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralJustificativa}"
				}).addField(new sap.m.TextArea({
					rows: 5
				}));

				oFormContainer.addFormElement(oFormElement);

				oForm.addFormContainer(oFormContainer);

				var dialog = new sap.m.Dialog({
					title: "{i18n>viewGeralNovaRequisicao}",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "{i18n>viewGeralSalvar}",
						press: function () {
							sap.m.MessageToast.show("Salvar requisição para o período: " + oPeriodo.id_periodo);
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
			
			onAnexarDeclaracao: function (oPeriodo) {
				//alert("Anexar Declaração: " + oPeriodo.periodo);
				
				var oHBox = new sap.m.HBox();
				
				oHBox.addItem(new sap.m.UploadCollection({
					multiple: true,
					instantUpload: false
				}));
				
				var dialog = new sap.m.Dialog({
					title: "Anexar Declaração",
					content: oHBox,
					beginButton: new sap.m.Button({
						text: "enviar",
						press: function () {
							sap.m.MessageToast.show("Enviar declaração: " + oPeriodo.periodo);
							dialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "sair",
						press: function () {
							dialog.close();
						}.bind(this)
					})
				});

				// to get access to the global model
				this.getView().addDependent(dialog);

				dialog.open();
			},
			
			onBaixarDeclaracao: function (oPeriodo) {
				alert("Baixar Declaração: " + oPeriodo.periodo);	
			},
			
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			
			navToPage2: function () {
				this.getRouter().navTo("taxPackageListagemEmpresas");
			},
			
			navToRequisicoes: function () {
				this.getRouter().navTo("taxPackageRequisicaoReabertura");
			},
			
			_onRouteMatched: function (oEvent) {
				var oParametros = JSON.parse(oEvent.getParameter("arguments").parametros);
				
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
				
				this.getModel().setProperty("/trimestres/PrimeiroTrimestre", [{
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
				}]);
				
				this._setTableBusy(false);
			},
			
			_carregarToolbar: function (sIdEmpresa, sIdAnoCalendario) {
				var that = this,
					sRota = "DeepQuery/RelacionamentoTaxPackagePeriodo?empresa=" + sIdEmpresa + "&anoCalendario=" + sIdAnoCalendario + "&modulo=2",
					aIdToolbar = ["toolbarPrimeiroPeriodo", "toolbarSegundoPeriodo", "toolbarTerceiroPeriodo", "toolbarQuartoPeriodo", "toolbarAnual", "toolbarRetificadora"];
				
				this._setToolbarBusy(aIdToolbar, true);
				
				// Realiza a limpeza das toolbar antes de carregar as novas para
				// garantir que caso um ano calendário não tenha relacionamento com períodos ele
				// não tenha acesso errôneo ao formulário
				for (var i = 0, length = aIdToolbar.length; i < length; i++) {
					var sIdToolbar = aIdToolbar[i];
					this.byId(sIdToolbar).removeAllContent();
				}
				
				NodeAPI.listarRegistros(sRota, function (response) {
					if (response) {
						for (var i = 0, j = 0, length = response.length; i < length; i++) {
							var oPeriodo = response[i];
							
							if (oPeriodo.numero_ordem <= 4) {
								if (oPeriodo.ind_ativo) {
									that._popularToolbarEstimativaCorrente(aIdToolbar[j], oPeriodo);
								}
								else {
									that._popularToolbarEstimativaFechada(aIdToolbar[j], oPeriodo);
								}
								j++;
							}
							else if (oPeriodo.numero_ordem === 5 || oPeriodo.numero_ordem === length) {
								if (oPeriodo.ind_ativo) {
									that._popularToolbarAnualCorrente(aIdToolbar[j], oPeriodo);
								}
								else {
									that._popularToolbarAnualFechada(aIdToolbar[j], oPeriodo);
								}
								j++;
							}
						}
					}
					that._setToolbarBusy(aIdToolbar, false);
				});
			},
			
			_popularToolbarEstimativaCorrente: function (sIdToolbar, oPeriodo) {
				var that = this;
				
				var oToolbar = this.byId(sIdToolbar);
				
				oToolbar.addContent(new sap.m.Title({
					text: that.getResourceBundle().getText("viewGeralFaltamXDias", [1]) // TROCAR PELO TEMPO QUE FALTA PARA O PERÍODO ACABAR                         
				}));
				
				oToolbar.addContent(new sap.m.ToolbarSpacer());
				
				// <Button icon="sap-icon://edit" text="{i18n>viewGeralBotaoEditar}" type="Accept" press="onEditarPeriodo"/>
				var oButton = new sap.m.Button({
					icon: "sap-icon://edit",
					text: that.getResourceBundle().getText("viewGeralEditar"),
					type: "Accept"
				}).attachPress(function () { that.onEditarPeriodo(oPeriodo); });
				
				oToolbar.addContent(oButton);
				
				// <Button icon="sap-icon://paper-plane" text="{i18n>viewGeralBotaoFechamento}" press="onSubmeterPeriodo"/>
				oButton = new sap.m.Button({
					icon: "sap-icon://paper-plane",
					text: that.getResourceBundle().getText("viewGeralFechamento")
				}).attachPress(function () { that.onSubmeterPeriodo(oPeriodo); });
				
				oToolbar.addContent(oButton);
			},
			
			_popularToolbarEstimativaFechada: function (sIdToolbar, oPeriodo) {
				var that = this;
				
				var oToolbar = this.byId(sIdToolbar);
				
				oToolbar.addContent(new sap.m.ToolbarSpacer());
				
				// <Button icon="sap-icon://show-edit" text="{i18n>viewGeralBotaoVisualizar}" type="Default" press="onVisualizarPeriodo"/>
				var oButton = new sap.m.Button({
					icon: "sap-icon://show-edit",
					text: that.getResourceBundle().getText("viewGeralVisualizar"),
					type: "Default"
				}).attachPress(function () { that.onVisualizarPeriodo(oPeriodo); });
				
				oToolbar.addContent(oButton);
				
				// <Button icon="sap-icon://permission" text="{i18n>viewGeralBotaoReabertura}" press="onReabrirPeriodo"/>
				oButton = new sap.m.Button({
					icon: "sap-icon://permission",
					text: that.getResourceBundle().getText("viewGeralReabertura")
				}).attachPress(function () { that.onReabrirPeriodo(oPeriodo); });
				
				oToolbar.addContent(oButton);
			},
			
			_popularToolbarAnualCorrente: function (sIdToolbar, oPeriodo) {
				var that = this;
				
				var oToolbar = this.byId(sIdToolbar);
				
				oToolbar.addContent(new sap.m.Title({
					text: that.getResourceBundle().getText("viewGeralFaltamXDias", [1]) // TROCAR PELO TEMPO QUE FALTA PARA O PERÍODO ACABAR                         
				}));
				
				oToolbar.addContent(new sap.m.ToolbarSpacer());
				
				// <Button icon="sap-icon://attachment" text="{i18n>viewGeralAnexarDocumentacao}" type="Accept" press="onAnexarDeclaracao"/>
				var oButton = new sap.m.Button({
					icon: "sap-icon://attachment",
					text: that.getResourceBundle().getText("viewGeralAnexarDocumentacao"),
					type: "Accept"
				}).attachPress(function () { that.onAnexarDeclaracao(oPeriodo); });
				
				oToolbar.addContent(oButton);
				
				// <Button icon="sap-icon://edit" text="{i18n>viewGeralBotaoEditar}" type="Accept" press="onEditarPeriodo"/>
				oButton = new sap.m.Button({
					icon: "sap-icon://edit",
					text: that.getResourceBundle().getText("viewGeralEditar"),
					type: "Accept"
				}).attachPress(function () { that.onEditarPeriodo(oPeriodo); });
				
				oToolbar.addContent(oButton);
				
				// <Button icon="sap-icon://paper-plane" text="{i18n>viewGeralBotaoFechamento}" press="onSubmeterPeriodo"/>
				oButton = new sap.m.Button({
					icon: "sap-icon://paper-plane",
					text: that.getResourceBundle().getText("viewGeralFechamento")
				}).attachPress(function () { that.onSubmeterPeriodo(oPeriodo); });
				
				oToolbar.addContent(oButton);
			},
			
			_popularToolbarAnualFechada: function (sIdToolbar, oPeriodo) {
				var that = this;
				
				var oToolbar = this.byId(sIdToolbar);
				
				oToolbar.addContent(new sap.m.ToolbarSpacer());
				
				// <Button icon="sap-icon://attachment" text="{i18n>viewGeralAnexarDocumentacao}" type="Accept" press="onAnexarDeclaracao"/>
				var oButton = new sap.m.Button({
					icon: "sap-icon://attachment",
					text: "Baixar Declaração"/*that.getResourceBundle().getText("viewGeralAnexarDocumentacao")*/,
					type: "Accept"
				}).attachPress(function () { that.onBaixarDeclaracao(oPeriodo); });
				
				oToolbar.addContent(oButton);
				
				oButton = new sap.m.Button({
					icon: "sap-icon://show-edit",
					text: that.getResourceBundle().getText("viewGeralVisualizar"),
					type: "Default"
				}).attachPress(function () { that.onVisualizarPeriodo(oPeriodo); });
				
				oToolbar.addContent(oButton);
				
				// <Button icon="sap-icon://permission" text="{i18n>viewGeralBotaoReabertura}" press="onReabrirPeriodo"/>
				oButton = new sap.m.Button({
					icon: "sap-icon://permission",
					text: that.getResourceBundle().getText("viewGeralReabertura")
				}).attachPress(function () { that.onReabrirPeriodo(oPeriodo); });
				
				oToolbar.addContent(oButton);
			},
			
			_setToolbarBusy: function (aIdToolbar, bBusy) {
				for (var i = 0, length = aIdToolbar.length; i < length; i++) {
					var sIdToolbar = aIdToolbar[i];
					if (bBusy) {
						this.byId(sIdToolbar).setBusyIndicatorDelay(100);
					}	
					this.byId(sIdToolbar).setBusy(bBusy);
				}
			},
			
			_setTableBusy: function (bBusy) {
				var aIdTabela = ["tabelaPrimeiroPeriodo", "tabelaSegundoPeriodo", "tabelaTerceiroPeriodo", "tabelaQuartoPeriodo", "tabelaAnual", "tabelaRetificadora"];
				for (var i = 0, length = aIdTabela.length; i < length; i++) {
					var sIdTabela = aIdTabela[i];
					if (bBusy) {
						this.byId(sIdTabela).setBusyIndicatorDelay(100);
					}	
					this.byId(sIdTabela).setBusy(bBusy);
				}
			}
		});
	}
);