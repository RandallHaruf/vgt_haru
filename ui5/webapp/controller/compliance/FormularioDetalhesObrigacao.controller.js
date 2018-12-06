sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, NodeAPI) {
		BaseController.extend("ui5ns.ui5.controller.compliance.FormularioDetalhesObrigacao", {

			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					obrigacao: {
						/*
						 {
        				"id_obrigacao": 1,
        				"prazo_entrega": "2019-02-18",
        				"extensao": "2019-02-18",
        				"obrigacao_inicial": 1,
        				"suporte_contratado": 1,
        				"suporte": "teste",
        				"observacoes": "teste",
        				"fk_dominio_status_obrigacao.id_status_obrigacao": 1,
        				"fk_dominio_pais.id_dominio_pais": 1,
        				"fk_dominio_periodicidade_obrigacao.id_periodicidade_obrigacao": 1,
        				"fk_empresa.id_empresa": 1,
        				"fk_obrigacao_acessoria.id_obrigacao_acessoria": 1,
        				"fk_dominio_ano_fiscal.id_dominio_ano_fiscal": 1,
        				"fk_dominio_aprovacao_obrigacao.id_aprovacao_obrigacao": 2,
        				"motivo_reprovacao": null
        				
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
							var obj = that.getModel().getProperty("/Obrigacao");
							NodeAPI.atualizarRegistro("Obrigacao", obj.id_obrigacao, {
								prazo_entrega: obj.prazo_entrega,
								extensao: obj.extensao,
								obrigacao_inicial: obj.obrigacao_inicial,
								suporte_contratado: (obj.suporte_contratado === "SIM"),
								suporte: obj.suporte,
								observacoes: obj.observacoes,
								fkDominioStatusObrigacao: obj["fk_dominio_status_obrigacao.id_status_obrigacao"],
								fkDominioPais: obj["fk_dominio_pais.id_dominio_pais"],
								fkDominioPeriocidadeObrigacao: obj["fk_dominio_periodicidade_obrigacao.id_periodicidade_obrigacao"],
								fkEmpresa: obj["fk_empresa.id_empresa"],
								fkObrigacaoAcessoria: obj["fk_obrigacao_acessoria.id_obrigacao_acessoria"],
								fkAnoFiscal: obj["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"],
								fkDominioAprovacaoObrigacao: obj["fk_dominio_aprovacao_obrigacao.id_aprovacao_obrigacao"],
								motivoReprovacao: obj.motivo_reprovacao
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

				this.getModel().setProperty("/Obrigacao", oParametros.Obrigacao);
			}
		});
	}
);