sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/formatter",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, formatter, NodeAPI) {
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
				
				var oEmpresaSelecionada = this.getModel().getProperty("/Empresa");
			
				this.getRouter().navTo("ttcResumoTrimestre", {
					oEmpresa: JSON.stringify(oEmpresaSelecionada)
				}); 
			},
			_onRouteMatched: function (oEvent) {
				var that = this;
				
				var oParametros = JSON.parse(oEvent.getParameter("arguments").parametros);
				
				this.getModel().setProperty("/empresa", oParametros.empresa);
				this.getModel().setProperty("/AnoCalendarioSelecionado", oParametros.anoCalendario);
				
				NodeAPI.listarRegistros("DeepQuery/RequisicaoReabertura", function(response){
					if (response) {
						//var vIcone, vCor, vTooltip;
						
						/*Object.keys(response).forEach(function(key) {
							switch (response[key].id_dominio_requisicao_reabertura_status) {
								case 1:
									vIcone = "sap-icon://lateness";
									vCor = "orange";
									vTooltip = "Aguardando";
								case 2:
									vIcone = "sap-icon://accept";
									vCor = "green";
									vTooltip = "Aprovado";
								case 3:
									vIcone = "sap-icon://decline";
									vCor = "red";
									vTooltip = "Reprovado";
								default:
									vIcone = "";
									vCor = "";
									vTooltip = "";
							};					
							Object.assign(response[key],{vStatus: {icone: vIcone, cor: vCor, tooltip: vTooltip}});
						});*/
						
						for (var i = 0; i < response.length; i++) {
							if (response[i].id_dominio_requisicao_reabertura_status === 1) {
							    response[i].oStatus = {
								  icone: "sap-icon://lateness",
							      cor: "orange",
							      tooltip: "Aguardando"
							    };
							}
						}
						
						that.getModel().setProperty("/requisicoes", response);
					
					//that._atualizarDados();
					}
				});
				/*NodeAPI.listarRegistros("DeepQuery/Empresa", function(response){
				if (response){
					that.getModel().setProperty("/Registros", response);
				}
					that.byId("empresaTabela").setBusy(false);
				});*/
			}
		});
	}
);