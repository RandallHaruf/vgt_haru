sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController,Utils) {
		BaseController.extend("ui5ns.ui5.controller.DetalheEmpresaVinculada", {
			
			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					empresa: {
						/*
						nome: "Empresa A",
						hfmsap: "23654321",
						tin: "3213211",
						jurisdicaoTIN: "6549798",
						ni: "2132465asd",
						jurisdicaoNI: "45asd45",
						endereco: "Rua exemplo, n1, cidade",
						pais: "Brasil",
						tipoSocietario: "Controlada Direta",
						fyStartDate: "05/2017",
						fyEndDate: "05/2018",
						status: "Paraíso Fiscal",
						aliquotaVigente: "Alíquota 1 - 28%",
						lbcNome: "João da Silva",
						lbcEmail: "joao.silva@email.com",
						comentarios: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
						*/
					}
				}));
				this.getRouter().getRoute("detalheEmpresaVinculada").attachPatternMatched(this._onRouteMatched, this);
			},
			
			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},
			
			navToPage2: function () {
				this.getRouter().navTo("empresasVinculadas");
			},
			
			_onRouteMatched: function (oEvent) {
				var oParametros = JSON.parse(oEvent.getParameter("arguments").parametros);
						var aResponse = oParametros;
							aResponse["empresa"]["pais"] = Utils.traduzDominioPais(aResponse["empresa"]["fk_dominio_pais.id_dominio_pais"],this);
							aResponse["empresa"]["status"] = Utils.traduzEmpresaStatusTipo(aResponse["empresa"]["id_dominio_empresa_status"],this);	
							aResponse["empresa"]["tipo_societario"] = Utils.traduzEmpresaTipoSocietario(aResponse["empresa"]["id_dominio_empresa_tipo_societario"],this);								
			
				this.getModel().setProperty("/empresa", oParametros.empresa);
			}
		});
	}
);