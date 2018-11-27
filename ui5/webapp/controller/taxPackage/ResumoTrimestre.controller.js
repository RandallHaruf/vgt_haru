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
						"PrimeiroTrimestre": [
							{
								"primeiroValor": "999.999.999,99",
								"segundoValor": "999.999.999,99",
								"terceiroValor": "999.999.999,99",
								"quartoValor": "999.999.999,99"
							}
						],
						"SegundoTrimestre": [
							{
								"primeiroValor": "999.999.999,99",
								"segundoValor": "999.999.999,99",
								"terceiroValor": "999.999.999,99",
								"quartoValor": "999.999.999,99"
							}
						],
						"TerceiroTrimestre": [
							{
								"primeiroValor": "999.999.999,99",
								"segundoValor": "999.999.999,99",
								"terceiroValor": "999.999.999,99",
								"quartoValor": "999.999.999,99"
							}
						],
						"QuartoTrimestre": [
							{
								"primeiroValor": "999.999.999,99",
								"segundoValor": "999.999.999,99",
								"terceiroValor": "999.999.999,99",
								"quartoValor": "999.999.999,99"
							}
						]
					},
					"anual": [
						{
							"primeiroValor": "999.999.999,99",
							"segundoValor": "999.999.999,99",
							"terceiroValor": "999.999.999,99",
							"quartoValor": "999.999.999,99"
						}
					],
					"retificadora": [
						{
							"primeiroValor": "999.999.999,99",
							"segundoValor": "999.999.999,99",
							"terceiroValor": "999.999.999,99",
							"quartoValor": "999.999.999,99"
						}
					]
				}));
				
				this.getRouter().getRoute("taxPackageResumoTrimestre").attachPatternMatched(this._onRouteMatched, this);
			},	
			
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			
			navToPage2: function () {
				this.getRouter().navTo("taxPackageListagemEmpresas");
			},
			
			onNavBack: function () {
				this.getRouter().navTo("taxPackageListagemEmpresas");
			},
			
			onTrocarAnoCalendario: function (oEvent) {
				this._atualizarDados();	
			},
			
			onEditar: function (oEvent) {
				this.getRouter().navTo("taxPackageEdicaoTrimestre");
			},
			
			onVisualizarTrimestre: function (oEvent) {
				this.getRouter().navTo("taxPackageVisualizacaoTrimestre");
			},
			
			onFecharPeriodo: function () {
				var dialog = new sap.m.Dialog({
					title: "Confirmação de Fechamento",
					type: "Message",
					content: new sap.m.Text({ text: "Você tem certeza que deseja fechar o período?" }),
					beginButton: new sap.m.Button({
						text: "Submeter",
						press: function () {
							sap.m.MessageToast.show("Submit pressed!");
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
			
			onRequisicaoReabertura: function (oEvent) {
				if (!this.pressDialog) {
					var oForm = new sap.ui.layout.form.Form({
						editable: true
					}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
						singleContainerFullSize: false
					}));
					
					var oFormContainer = new sap.ui.layout.form.FormContainer();
					
					var oFormElement = new sap.ui.layout.form.FormElement({
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
					
					oFormElement = new sap.ui.layout.form.FormElement({
						label: "Justificativa"
					}).addField(new sap.m.TextArea({
						rows: 5
					}));
					
					oFormContainer.addFormElement(oFormElement);
					
					oForm.addFormContainer(oFormContainer);
					
					/*var oVBox = new sap.m.VBox();
					
					oVBox.addItem(new sap.m.Text({
						text: "Empresa: Vale"
					}));
					
					oVBox.addItem(new sap.m.Text({
						text: "Trimestre: 1º"
					}));
					
					var oVBox2 = new sap.m.HBox();
					oVBox2.addItem(new sap.m.Text({
						text: "Justificativa"
					}));
					oVBox2.addItem(new sap.m.TextArea({
						rows: 5
					}));
					
					oVBox.addItem(oVBox2);*/
					
					this.pressDialog = new sap.m.Dialog({
						title: "Nova Requisição",
						content: oForm,
						beginButton: new sap.m.Button({
							text: "salvar",
							press: function () {
								sap.m.MessageToast.show("Salvar requisição");
								this.pressDialog.close();
							}.bind(this)
						}),
						endButton: new sap.m.Button({
							text: "sair",
							press: function () {
								this.pressDialog.close();
							}.bind(this)
						})
					});
	
					// to get access to the global model
					this.getView().addDependent(this.pressDialog);
				}

				this.pressDialog.open();
			},
			
			navToRequisicoes: function () {
				this.getRouter().navTo("taxPackageRequisicaoReabertura");
			},
			
			onAnexarDeclaracao: function (oEvent) {
				if (!this.pressDialog2) {
					var oHBox = new sap.m.HBox();
					
					oHBox.addItem(new sap.m.UploadCollection({
						multiple: true,
						instantUpload: false
					}));
					
					this.pressDialog2 = new sap.m.Dialog({
						title: "Anexar Declaração",
						content: oHBox,
						beginButton: new sap.m.Button({
							text: "enviar",
							press: function () {
								sap.m.MessageToast.show("Enviar documentos");
								this.pressDialog2.close();
							}.bind(this)
						}),
						endButton: new sap.m.Button({
							text: "sair",
							press: function () {
								this.pressDialog2.close();
							}.bind(this)
						})
					});
	
					// to get access to the global model
					this.getView().addDependent(this.pressDialog2);
				}

				this.pressDialog2.open();
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
				sap.m.MessageToast.show("Empresa: " + this.getModel().getProperty("/Empresa").nome + " - Ano Calendario: " +  this.getModel().getProperty("/AnoCalendarioSelecionado"));
			}
		});
	}
);