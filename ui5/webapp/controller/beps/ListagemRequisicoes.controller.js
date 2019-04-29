sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/models",
		/*"ui5ns/ui5/model/formatter",*/
		"sap/m/MessageToast",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController,models,/* formatter,*/ MessageToast, NodeAPI, Utils) {
		return BaseController.extend("ui5ns.ui5.controller.beps.ListagemRequisicoes", {
			
			onInit: function (oEvent) {
			
				this.setModel(models.createViewModelParaBepsListagemObrigacoes(), "viewModel");
			    this.setModel(new sap.ui.model.json.JSONModel({})); 
				this.getRouter().getRoute("bepsListagemRequisicoes").attachPatternMatched(this._onRouteMatched, this);	
			},
			
			onTrocarStatus: function (oEvent) {
				// sap.m.MessageToast.show("Ano selecionado: " + oEvent.getSource().getSelectedItem().getText());
				
				this._atualizarDados();
			},
			
			onDetalharObrigacao: function (oEvent) {
				this.getRouter().navTo("bepsFormularioDetalhesObrigacao");
			},
			
			onNovoObjeto: function (oEvent) {
				this.getRouter().navTo("ttcFormularioNovaRequisicaoReabertura");
			},

			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			
			navToPage2: function () {
				this.getRouter().navTo("bepsListagemObrigacoes", {
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
			
			_onRouteMatched: function (oEvent) {
				var that = this;
				this.getModel().setProperty("/IdAnoSelecionado", this.fromURIComponent(oEvent.getParameter("arguments").parametros).anoCalendario);
				this.getModel().setProperty("/IdEmpresaSelecionado", this.fromURIComponent(oEvent.getParameter("arguments").parametros).empresa);
				var oParametros = this.fromURIComponent(oEvent.getParameter("arguments").parametros);
				
				NodeAPI.listarRegistros("DeepQuery/RequisicaoModeloObrigacao?filtrarUsuario=true&TipoObrigacao=1", function (response) { // 1 BEPS
					if (response) {
						for (var i = 0, length = response.length; i < length; i++) {
							if (response[i]["id_dominio_requisicao_modelo_obrigacao_status"] == 1) {
								
							    response[i].oStatus = that.getResourceBundle().getText("viewTTCRequisicaoReaberturaPeriodoStatus1");
							    
							} else if (response[i]["id_dominio_requisicao_modelo_obrigacao_status"] == 2) {
								
								response[i].oStatus = that.getResourceBundle().getText("viewTTCRequisicaoReaberturaPeriodoStatus2");
								
							} else if (response[i]["id_dominio_requisicao_modelo_obrigacao_status"] == 3) {
								
							    response[i].oStatus = that.getResourceBundle().getText("viewTTCRequisicaoReaberturaPeriodoStatus3");
						}
						
						
						response[i]["nome_pais"] = Utils.traduzDominioPais(response[i]["fk_pais.id_pais"],that)
						response[i]["nome_periodicidade"] = Utils.traduzPeriodo(response[i]["fk_id_dominio_periodicidade.id_periodicidade_obrigacao"],that)
						response[i].suporte_contratado = response[i].suporte_contratado ? "SIM" : "NÃO";
						response[i].obrigacao_inicial = response[i].obrigacao_inicial ? "SIM" : "NÃO";
						}
						that.getModel().setProperty("/Obrigacao", response);
					}
				});
			}, 
			
			/*_onRouteMatched: function (oEvent) {
				this._atualizarDados(oEvent);
			},*/
			
			onTerminouAtualizar: function (oEvent) {             
				this._atualizarDados(oEvent);
			},
			
			_atualizarDados: function (oEvent) {
				var that = this;
				
				/*var oEmpresa = this.getModel().getProperty("/IdEmpresaSelecionado")? this.getModel().getProperty("/IdEmpresaSelecionado") : "";
				var oAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado")? this.getModel().getProperty("/AnoCalendarioSelecionado") : "";
				var oStatus = this.getView().byId('iconTabBarObrigacoes').getSelectedKey();
				
				if(oStatus == '0'){
					oStatus = '';
				};*/
				
			}
			
		});
	}
);