sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, NodeAPI) {
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
							NodeAPI.atualizarRegistro("RespostaObrigacao", obj.id_obrigacao, {
								suporteContratado: (obj.suporte_contratado === "SIM"),
								suporteEspecificacao: obj.suporte_especificacao,
								suporteValor: obj.suporte_valor,
								fkIdDominioMoeda: obj["fk_id_dominio_moeda.id_dominio_moeda"],
								fkIdRelModeloEmpresa : obj["fk_id_rel_modelo_empresa.id_rel_modelo_empresa"],
								fkIdDominioAnoFiscal: obj["fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal"],
								fkIdDominioAnoCalendario: obj["fk_id_dominio_ano_calendario.id_dominio_ano_calendario"]
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
						if (sap.m.MessageBox.Action.OK !== oAction) {
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

			_onRouteMatched: function (oEvent) {

				var oParametros = JSON.parse(oEvent.getParameter("arguments").parametros);

				this.getModel().setProperty("/RespostaObrigacao", oParametros.Obrigacao);
			}
		});
	}
);