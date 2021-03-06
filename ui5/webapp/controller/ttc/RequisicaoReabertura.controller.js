sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/formatter",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, formatter, NodeAPI,Utils) {
		BaseController.extend("ui5ns.ui5.controller.ttc.RequisicaoReabertura", {
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
				this.getRouter().navTo("ttcListagemEmpresas", {
					parametros: this.toURIComponent({
						idAnoCalendario: this.getModel().getProperty("/idAnoCalendario"),
						nomeUsuario: this.getModel().getProperty("/NomeUsuario")
					})
				});
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
					oEmpresa: this.toURIComponent(oEmpresaSelecionada),
					idAnoCalendario: this.toURIComponent(sIdAnoCalendario),
					nomeUsuario: this.getModel().getProperty("/NomeUsuario")
				}); 
			},
			
			_onRouteMatched: function (oEvent) {
				var that = this;
				
				var oParametros = this.fromURIComponent(oEvent.getParameter("arguments").parametros);
				
				this.getModel().setProperty("/empresa", oParametros.empresa);
				this.getModel().setProperty("/idAnoCalendario", oParametros.anoCalendario);
				this.getModel().setProperty("/NomeUsuario", oParametros.nomeUsuario);
				
				NodeAPI.listarRegistros("RequisicaoReaberturaStatus", function (response) {
					if (response) {

						var aResponse = response;
						for (var i = 0, length = aResponse.length; i < length; i++) {
							aResponse[i]["status"] = Utils.traduzTTCRequisicaoReaberturaPeriodoStatus(aResponse[i]["id_dominio_requisicao_reabertura_status"],that);
						}	
						response = Utils.orderByArrayParaBox(response,"status");
						response.unshift({
							status: that.getResourceBundle().getText("viewGeralTodos")
						});						
						that.getModel().setProperty("/RequisicaoReaberturaStatus", response);
						that._atualizarDados();
					}
				});
			},
			
			_atualizarDados: function (oEvent) {
				var that = this;
				
				var oEmpresa = this.getModel().getProperty("/empresa");
				var sIdStatus = this.getModel().getProperty("/RequisicaoReaberturaStatusSelecionado") ? this.getModel().getProperty("/RequisicaoReaberturaStatusSelecionado") : "";
				
				NodeAPI.listarRegistros("DeepQuery/RequisicaoReabertura?status=" + sIdStatus +"&empresa=" + oEmpresa.id_empresa , function(response){
					if (response) {
						for (var i = 0; i < response.length; i++) {
							if (response[i].id_dominio_requisicao_reabertura_status === 1) {
							    response[i].oStatus = {
								  icone: "sap-icon://lateness",
							      cor: "orange",
							      tooltip: "Aguardando"
							    };
							} else if (response[i].id_dominio_requisicao_reabertura_status === 2) {
							    response[i].oStatus = {
								  icone: "sap-icon://accept",
							      cor: "green",
							      tooltip: "Aprovado"
							    };
							} else if (response[i].id_dominio_requisicao_reabertura_status === 3) {
							    response[i].oStatus = {
								  icone: "sap-icon://decline",
							      cor: "red",
							      tooltip: "Reprovado"
							    };
							}
							response[i]["periodo"] = Utils.traduzTrimestreTTC(response[i]["numero_ordem"],that);
						}
						that.getModel().setProperty("/requisicoes", response);
					}
				});
			}
			
		});
	}
);