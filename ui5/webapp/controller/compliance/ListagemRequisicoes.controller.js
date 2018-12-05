sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/formatter",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, formatter, NodeAPI) {
		BaseController.extend("ui5ns.ui5.controller.compliance.ListagemRequisicoes", {
			formatter: formatter,
			
			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					requisicoes: [
						/*{
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
						}*/	
					]
				}));
				this.getRouter().getRoute("ttcRequisicaoReabertura").attachPatternMatched(this._onRouteMatched, this);
			},
			
			onTrocarStatus: function (oEvent) {
				// sap.m.MessageToast.show("Ano selecionado: " + oEvent.getSource().getSelectedItem().getText());
				
				this._atualizarDados();
			},
			
			onNovoObjeto: function (oEvent) {
				this.getRouter().navTo("ttcFormularioNovaRequisicaoReabertura");
			},
			
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			
			navToPage2: function () {
				this.getRouter().navTo("ttcListagemEmpresas");
			},
			
			navToPage3: function () {
				//this.getRouter().navTo("ttcResumoTrimestre");
				this._navToResumoTrimestre();
			},
			
			_navToResumoTrimestre: function () {
				//this._limparModel();
				
				var oEmpresaSelecionada = this.getModel().getProperty("/empresa");
				var sIdAnoCalendario = this.getModel().getProperty("/idAnoCalendario");
			
				this.getRouter().navTo("ttcResumoTrimestre", {
					oEmpresa: JSON.stringify(oEmpresaSelecionada),
					idAnoCalendario: sIdAnoCalendario
				}); 
			},
			
			_onRouteMatched: function (oEvent) {
				var that = this;
				
				var oParametros = JSON.parse(oEvent.getParameter("arguments").parametros);
				
				this.getModel().setProperty("/empresa", oParametros.empresa);
				this.getModel().setProperty("/idAnoCalendario", oParametros.anoCalendario);
				
				NodeAPI.listarRegistros("RequisicaoReaberturaStatus", function (response) {
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/RequisicaoReaberturaStatus", response);
						
						that._atualizarDados();
					}
				});
			},
			
			_atualizarDados: function (oEvent) {
				var that = this;
				
				var oEmpresa = this.getModel().getProperty("/IdEmpresaSelecionado")? this.getModel().getProperty("/IdEmpresaSelecionado") : "";
				var oAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado")? this.getModel().getProperty("/AnoCalendarioSelecionado") : "";
				var oStatus = this.getView().byId('iconTabBarObrigacoes').getSelectedKey();
				
				if(oStatus == '0'){
					oStatus = '';
				};
				
				
				NodeAPI.listarRegistros("DeepQuery/Obrigacao?idTipo=1&idEmpresa="+oEmpresa+"&idAnoFiscal="+oAnoCalendario+"&idStatus="+oStatus, function (response) { // 1 COMPLIANCE
					if (response) {
						for (var i = 0, length = response.length; i < length; i++) {
							response[i].suporte_contratado = response[i].suporte_contratado ? "SIM" : "NÃO";
						}
						that.getModel().setProperty("/Obrigacao", response);
					}
				});
			}
			
		});
	}
);