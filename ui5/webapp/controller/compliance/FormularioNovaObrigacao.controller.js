sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, NodeAPI , Utils) {
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
				this._carregarSelect("ObrigacaoAcessoria?tipo=2");
				this._carregarSelect("DomPeriodicidadeObrigacao");
				this._carregarSelect("DominioAnoFiscal");
			},
			
			_carregarSelect: function (sEntidade) {
				var that = this;
				
				NodeAPI.listarRegistros(sEntidade, function (response) {
					if (response) {
						var filtro;
						switch (sEntidade){
							case "Empresa":
								filtro = Utils.orderByArrayParaBox(response,"nome");
								break;
							case "DominioPais":
								var aPais = response;
								for(var i = 0 ; i < aPais.length ; i++){
									aPais[i]["pais"] = 
									Utils.traduzDominioPais(aPais[i]["id_dominio_pais"],that);
								}								
								filtro = Utils.orderByArrayParaBox(aPais,"pais");
								break;
							case "ObrigacaoAcessoria?tipo=2":
								filtro = Utils.orderByArrayParaBox(response,"nome");
								break;
							case "DomPeriodicidadeObrigacao":
								var aPeriodicidade = response;
								for(var i = 0 ; i < aPeriodicidade.length ; i++){
									aPeriodicidade[i]["descricao"] = 
									Utils.traduzObrigacaoPeriodo(aPeriodicidade[i]["id_periodicidade_obrigacao"],that);
								}								
								filtro = Utils.orderByArrayParaBox(aPeriodicidade,"descricao");
								break;
							case "DominioAnoFiscal":
								filtro = response;
								break;	
						}
						response.unshift({});
						that.getModel().setProperty("/" + sEntidade, filtro);
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