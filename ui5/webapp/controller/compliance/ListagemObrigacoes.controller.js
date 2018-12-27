sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/models",
		"sap/ui/model/Filter",
		"sap/m/MessageToast",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, models, Filter, MessageToast, NodeAPI) {
		return BaseController.extend("ui5ns.ui5.controller.compliance.ListagemObrigacoes", {

			onInit: function (oEvent) {
				this.setModel(models.createViewModelParaComplianceListagemObrigacoes(), "viewModel");
				this.setModel(new sap.ui.model.json.JSONModel({}));
				this.getRouter().getRoute("complianceListagemObrigacoes").attachPatternMatched(this._onRouteMatched, this);
			},

			_onRouteMatched: function (oEvent) {
				this.getModel().setProperty("/Linguagem", sap.ui.getCore().getConfiguration().getLanguage().toUpperCase());
				this.carregarFiltroEmpresa();
				this.carregarFiltroAnoCalendario();
				//this._atualizarDados();
				this._atualizarDadosFiltrado();
				
			},

			onFiltrar: function (oEvent) {
				if (!this._filtrosRapidos) {
					var that = this;
					this._filtrosRapidos = {
						naoIniciada: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro2"))],
						emAndamento: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro3"))],
						emAtraso: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro4"))],
						entregueNoPrazo: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro5"))],
						entregueForaPrazo: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro6"))]
					};
				}

				var sKey = oEvent.getParameter("key");
				var oFilter = this._filtrosRapidos[sKey];
				var oBinding = this.byId("tabelaObrigacoes").getBinding("items");

				oBinding.filter(oFilter);
				

				var oAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado") ? this.getModel().getProperty(
					"/AnoCalendarioSelecionado") : "";
				var CampoAnoEstaPreenchido = (oAnoCalendario ? "&ListarAteAnoAtualMaisUm=1" : "");
				this._atualizarDadosFiltrado();
				/*if (!!CampoAnoEstaPreenchido) {
					this._atualizarDadosFiltrado();
				}
				else{
					this._atualizarDados();
				}*/
			},

			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			navToListagemRequisicoes: function () {
				var oParametros = {
					empresa: this.getModel().getProperty("/Empresa"),
					anoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
				};

				this.getRouter().navTo("complianceListagemRequisicoes", {
					parametros: JSON.stringify(oParametros)
				});
			},

			onNavToReport: function () {
				this.getRouter().navTo("complianceRelatorio");
			},

			onTerminouAtualizar: function (oEvent) {
				//MessageToast.show("Atualizar contadores");	
				//this._atualizarDados();
				/*var existeEmpresa = this.getModel().getProperty("/AnoCalendarioSelecionado") ? this.getModel().getProperty(
					"/AnoCalendarioSelecionado") : "";
				if () {
					
				}*/
				
			},

			onTrocarAnoCalendario: function (oEvent) {
				//MessageToast.show("Filtrar tabela por ano calendário: " + oEvent.getSource().getSelectedItem().getText());	
				this._atualizarDadosFiltrado();
			},

			onTrocarEmpresa: function (oEvent) {
				//MessageToast.show("Filtrar tabela por empresas: " + oEvent.getSource().getSelectedItem().getText());
				this._atualizarDadosFiltrado();
			},

			onBuscarDocumentos: function (oEvent) {
				this.getRouter().navTo("complianceRepositorioDocumentos");
			},

			onNovaObrigacao: function (oEvent) {
				this.getRouter().navTo("complianceFormularioNovaObrigacao");
			},

			onDetalharObrigacao: function (oEvent) {
				var oParametros = {
					Obrigacao: this.getModel().getObject(oEvent.getSource().getBindingContext().getPath())
				};

				this.getRouter().navTo("complianceFormularioDetalhesObrigacao", {
					parametros: JSON.stringify(oParametros)
				});
			},

			onNavBack: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			carregarFiltroEmpresa: function () {
				var that = this;
				NodeAPI.listarRegistros("Empresa", function (response) {
					response.unshift({
						id: null,
						descricao: ""
					});
					that.getModel().setProperty("/Empresa", response);
				});
			},

			carregarFiltroAnoCalendario: function () {
				var that = this;
				NodeAPI.listarRegistros("DeepQuery/DominioAnoCalendarioAteCorrente", function (response) {
					response.unshift({
						id: null,
						descricao: ""
					});
					that.getModel().setProperty("/DominioAnoCalendario", response);
				});
			},

			_atualizarDados: function () {
				var that = this;

				var oEmpresa = this.getModel().getProperty("/IdEmpresaSelecionado") ? this.getModel().getProperty("/IdEmpresaSelecionado") : "";
				var oAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado") ? this.getModel().getProperty(
					"/AnoCalendarioSelecionado") : "";
				var oStatus = this.getView().byId('iconTabBarObrigacoes').getSelectedKey();
				if (oStatus == '0') {
					oStatus = '';
				};

				NodeAPI.listarRegistros("DeepQuery/RespostaObrigacao?tipo=2&empresa=" + oEmpresa + "&anoCalendario=" + oAnoCalendario +
					"&statusResp=&statusModelo=2&IndAtivoRel=true&ListarAteAnoAtual=true",
					function (response) { // 1 COMPLIANCE
						if (response) {
							var Todos = 0,
								NaoIniciada = 0,
								Aguardando = 0,
								EmAtraso = 0,
								EntregueNoPrazo = 0,
								EntregueForaPrazo = 0;
							for (var i = 0, length = response.length; i < length; i++) {
								switch (response[i]["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"]) {
								case 4:
									NaoIniciada++;
									break;
								case 1:
									Aguardando++;
									break;
								case 5:
									EmAtraso++;
									break;
								case 6:
									EntregueNoPrazo++;
									break;
								case 7:
									EntregueForaPrazo++;
									break;
								}
								Todos++;
							}
							that.getModel().setProperty("/Contadores", {
								modelTodos: Todos,
								modelNaoIniciada: NaoIniciada,
								modelAguardando: Aguardando,
								modelEmAtraso: EmAtraso,
								modelEntregueNoPrazo: EntregueNoPrazo,
								modelEntregueForaPrazo: EntregueForaPrazo
							});
							//that.getModel().setProperty("/Obrigacao", response);

						}
					});

				NodeAPI.listarRegistros("DeepQuery/RespostaObrigacao?tipo=2&empresa=" + oEmpresa + "&anoCalendario=" + oAnoCalendario +
					"&statusResp=" + oStatus + "&statusModelo=2&IndAtivoRel=true&ListarAteAnoAtual=true",
					function (response) { // 1 COMPLIANCE
						if (response) {
							for (var i = 0, length = response.length; i < length; i++) {
								response[i]["label_prazo_entrega"] = 
									(response[i]["prazo_entrega_customizado"] !== null) 
									? response[i]["ano_calendario"] + "-" + response[i]["prazo_entrega_customizado"].substring(5, 7) + "-" + response[i]["prazo_entrega_customizado"].substring(8, 10) 
									: response[i]["ano_calendario"] + "-" + response[i]["prazo_entrega"].substring(5, 7) + '-' + response[i]["prazo_entrega"].substring(8, 10);
									
								response[i]["prazo_entrega_customizado"] = 
									(response[i]["prazo_entrega_customizado"] !== null) 
									? response[i]["ano_calendario"] +"-" + response[i]["prazo_entrega_customizado"].substring(5, 7) + "-" + response[i]["prazo_entrega_customizado"].substring(8, 10) 
									: null;
							}
							that.getModel().setProperty("/Obrigacao", response);

						}
					});
			},
			_atualizarDadosFiltrado: function () {
				var that = this;

				var oEmpresa = this.getModel().getProperty("/IdEmpresaSelecionado") ? this.getModel().getProperty("/IdEmpresaSelecionado") : "";
				var oAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado") ? this.getModel().getProperty(
					"/AnoCalendarioSelecionado") : "";
				var oStatus = this.getView().byId('iconTabBarObrigacoes').getSelectedKey();
				var campoAnoEstaVazio = (!oAnoCalendario ? "&ListarAteAnoAtualMaisUm=1" : "");
				if (oStatus == '0') {
					oStatus = '';
				};

				NodeAPI.listarRegistros("DeepQuery/RespostaObrigacao?tipo=2&empresa=" + oEmpresa + "&anoCalendario=" + oAnoCalendario +
					"&statusResp=&statusModelo=2&IndAtivoRel=true" + campoAnoEstaVazio,
					function (response) { // 1 COMPLIANCE
						if (response) {
							var Todos = 0,
								NaoIniciada = 0,
								Aguardando = 0,
								EmAtraso = 0,
								EntregueNoPrazo = 0,
								EntregueForaPrazo = 0;
							for (var i = 0, length = response.length; i < length; i++) {
								switch (response[i]["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"]) {
								case 4:
									NaoIniciada++;
									break;
								case 1:
									Aguardando++;
									break;
								case 5:
									EmAtraso++;
									break;
								case 6:
									EntregueNoPrazo++;
									break;
								case 7:
									EntregueForaPrazo++;
									break;
								}
								Todos++;
							}
							that.getModel().setProperty("/Contadores", {
								modelTodos: Todos,
								modelNaoIniciada: NaoIniciada,
								modelAguardando: Aguardando,
								modelEmAtraso: EmAtraso,
								modelEntregueNoPrazo: EntregueNoPrazo,
								modelEntregueForaPrazo: EntregueForaPrazo
							});
							//that.getModel().setProperty("/Obrigacao", response);

						}
					});

				NodeAPI.listarRegistros("DeepQuery/RespostaObrigacao?tipo=2&empresa=" + oEmpresa + "&anoCalendario=" + oAnoCalendario +
					"&statusResp=" + oStatus + "&statusModelo=2&IndAtivoRel=true" + campoAnoEstaVazio,
					function (response) { // 1 COMPLIANCE
						if (response) {
							for (var i = 0, length = response.length; i < length; i++) {
								response[i]["label_prazo_entrega"] = 
									(response[i]["prazo_entrega_customizado"] !== null) 
									? response[i]["ano_calendario"] + "-" + response[i]["prazo_entrega_customizado"].substring(5, 7) + "-" + response[i]["prazo_entrega_customizado"].substring(8, 10) 
									: response[i]["ano_calendario"] + "-" + response[i]["prazo_entrega"].substring(5, 7) + '-' + response[i]["prazo_entrega"].substring(8, 10);
									
								response[i]["prazo_entrega_customizado"] = 
									(response[i]["prazo_entrega_customizado"] !== null) 
									? response[i]["ano_calendario"] +"-" + response[i]["prazo_entrega_customizado"].substring(5, 7) + "-" + response[i]["prazo_entrega_customizado"].substring(8, 10) 
									: null;
							}
							that.getModel().setProperty("/Obrigacao", response);

						}
					});
			}
		});
	}
);