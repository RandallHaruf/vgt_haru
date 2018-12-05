sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, NodeAPI) {
		return BaseController.extend("ui5ns.ui5.controller.compliance.FormularioNovaObrigacao", {
			onInit: function () {
				var oModel = new sap.ui.model.json.JSONModel({
					Obrigacao: {
						fkEmpresa: null,
						fkDominioPais: null,
						fkObrigacaoAcessoria: null,
						fkDominioPeriocidadeObrigacao: null,
						fkAnoFiscal: null,
						prazo_entrega: null,
						extensao: null,
						obrigacao_inicial: null,
						suporte_contratado: null,
						suporte: null,
						observacoes: null,
						fkDominioStatusObrigacao: 1,
						fkDominioAprovacaoObrigacao: 1,
						motivoReprovacao: null
					}
				});
				
				oModel.setSizeLimit(300);
				
				this.setModel(oModel); 
				
				this.getRouter().getRoute("complianceFormularioNovaObrigacao").attachPatternMatched(this._onRouteMatched, this);	
			},
			
			onSalvar: function () {
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(this.getResourceBundle().getText("formularioObrigacaoMsgSalvar") , {
					title: "Confirm",
					onClose: function(oAction) { 
						if (sap.m.MessageBox.Action.OK === oAction) {
							//alert(JSON.stringify(this.getModel().getProperty("/Obrigacao")));
							NodeAPI.criarRegistro("Obrigacao", that.getModel().getProperty("/Obrigacao"), function (response) {
								that.getRouter().navTo("complianceListagemObrigacoes");
							});
						}
					}
				});
				//sap.m.MessageToast.show("Cancelar inserção");
			},
			
			onCancelar: function () {
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm(this.getResourceBundle().getText("formularioObrigacaoMsgCancelar") , {
					title: "Confirm",
					onClose: function(oAction) { 
						if (sap.m.MessageBox.Action.OK === oAction) {
							that.getRouter().navTo("complianceListagemObrigacoes");
							that._limparModel();
						}
					}
				});
				//sap.m.MessageToast.show("Cancelar inserção");
			},
			
			_onRouteMatched: function (oEvent) {
				this._carregarSelect("Empresa");
				this._carregarSelect("DominioPais");
				this._carregarSelect("ObrigacaoAcessoria");
				this._carregarSelect("DomPeriodicidadeObrigacao");
				this._carregarSelect("DominioAnoFiscal");
			},
			
			_carregarSelect: function (sEntidade) {
				var that = this;
				
				NodeAPI.listarRegistros(sEntidade, function (response) {
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/" + sEntidade, response);
						that._limparModel();
					}
				});
			},
			
			_limparModel: function () {
				this.getModel().setProperty("/Obrigacao", {
					fkEmpresa: null,
					fkDominioPais: null,
					fkObrigacaoAcessoria: null,
					fkDominioPeriocidadeObrigacao: null,
					fkAnoFiscal: null,
					prazo_entrega: null,
					extensao: null,
					obrigacao_inicial: null,
					suporte_contratado: null,
					suporte: null, 
					observacoes: null,
					fkDominioStatusObrigacao: 1,
					fkDominioAprovacaoObrigacao:1,
					motivoReprovacao: null
				});
			}
		});
	}
);