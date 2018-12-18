sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, NodeAPI,Utils) {
		BaseController.extend("ui5ns.ui5.controller.compliance.FormularioDetalhesObrigacao", {

			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					RespostaObrigacao: {
						/*
						 {
        				"id_resposta_obrigacao": 1,
        				"suporte_contratado": "True",
        				"suporte_especificacao": "BlaBla",
        				"suporte_valor": 1000.00,
        				"fk_id_dominio_moeda.id_dominio_moeda": 1,
        				"fk_id_rel_modelo_empresa.id_rel_modelo_empresa": "1",
        				"fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal": "1",
        				"fk_id_dominio_ano_calendario.id_dominio_ano_calendario": 1,
        			},
						*/
					}
				}));
				this.getRouter().getRoute("complianceFormularioDetalhesObrigacao").attachPatternMatched(this._onRouteMatched, this);
			},
			onSalvar: function () {
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(this.getResourceBundle().getText("formularioObrigacaoMsgSalvar"), {
					title: "Confirm",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							//that.getRouter().navTo("complianceListagemObrigacoes");
							var obj = that.getModel().getProperty("/RespostaObrigacao");
							
							//Verificar se a data atual já passou para colocar status como em atraso
							if(obj["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] == 4 || obj["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] == 1){
								if(obj["prazo_entrega_customizado"]){
									var dataPrazo = Utils.bancoParaJsDate(obj["prazo_entrega_customizado"]);	
								}
								else{
									var dataPrazo = Utils.bancoParaJsDate(obj["prazo_entrega"]);	
								}
								var dataAtual = new Date();
								if (dataAtual > dataPrazo) {
									obj["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] = 5;
								}
								else {
									obj["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"] = 1;
								}
							}
							
							
							NodeAPI.atualizarRegistro("RespostaObrigacao", obj.id_resposta_obrigacao, {
								suporteContratado: obj["suporte_contratado"],
								suporteEspecificacao: obj["suporte_especificacao"],
								suporteValor: obj["suporte_valor"],
								fkIdDominioMoeda: obj["fk_id_dominio_moeda.id_dominio_moeda"],
								fkIdRelModeloEmpresa : obj["fk_id_rel_modelo_empresa.id_rel_modelo_empresa"],
								fkIdDominioAnoFiscal: obj["fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal"],
								fkIdDominioAnoCalendario: obj["fk_id_dominio_ano_calendario.id_dominio_ano_calendario"],
								fkIdDominioObrigacaoStatusResposta: obj["fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status"],
								dataExtensao: obj["data_extensao"]
							}, function (response) {
								that.getRouter().navTo("complianceListagemObrigacoes");
							});
						}
					}
				}); //sap.m.MessageToast.show("Cancelar inserção");
			},

			onCancelar: function () {
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(this.getResourceBundle().getText("formularioObrigacaoMsgCancelar"), {
					title: "Confirm",
					onClose: function (oAction) {
						if (sap.m.MessageBox.Action.OK === oAction) {
							that.getRouter().navTo("complianceListagemObrigacoes");
						}
					}
				});
				//sap.m.MessageToast.show("Cancelar inserção");
			},
			
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			navToPage2: function () {
				this.getRouter().navTo("complianceListagemObrigacoes");
			},
			
			onTrocarSuporte: function() {
				var obj = this.getModel().getProperty("/RespostaObrigacao");
				if (obj["suporte_contratado"] == false) {
					obj["suporte_especificacao"] = "";
					obj["fk_id_dominio_moeda.id_dominio_moeda"] = "";
					obj["suporte_valor"] = "";
				}	
			},

			_onRouteMatched: function (oEvent) {
				var that = this; 
				NodeAPI.listarRegistros("DominioMoeda", function (response) { // 1 COMPLIANCE
				if(response){
					that.getModel().setProperty("/DominioMoeda", response);
				}
					
				});
			
				var oParametros = JSON.parse(oEvent.getParameter("arguments").parametros);
				oParametros.Obrigacao["suporte_contratado"] = (oParametros.Obrigacao["suporte_contratado"] === "SIM" ? true : false);
				this.getModel().setProperty("/RespostaObrigacao", oParametros.Obrigacao);
			}
		});
	}
);