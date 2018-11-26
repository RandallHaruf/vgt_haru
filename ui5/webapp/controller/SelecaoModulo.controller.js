sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/control/NumericIcon",
		"ui5ns/ui5/model/Constants"
	],
	function (BaseController, NumericIcon, Constants) {
		return BaseController.extend("ui5ns.ui5.controller.SelecaoModulo", {
			
			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					Periodos: [{
						periodo: "1º trimestre",
						n1: 1,
						n2: 2
					}, {
						periodo: "2º trimestre",
						n1: 5,
						n2: 2
					}]	
				}));
				/*this.byId("vemNimim").addItem(new NumericIcon({
					icon: new sap.ui.core.Icon({
						src: "sap-icon://message-warning"
					}),
					number: 2,
					color: "#900"
				}));*/
				
				/*var that = this;
				jQuery("#" + this.byId("painelTTC").getDomRef().id).click(function () {
					that.getRouter().navTo("ttcListagemEmpresas");
				});*/
				
				this.byId("selectIdioma").setSelectedKey(sap.ui.getCore().getConfiguration().getLanguage());
			},
			
			navToTTC: function (oEvent) {
				this.getRouter().navTo("ttcListagemEmpresas");
			},
			
			navToTaxPackage: function (oEvent) {
				this.getRouter().navTo("taxPackageListagemEmpresas");
			},
			
			navToCompliance: function (oEvent) {
				this.getRouter().navTo("complianceListagemObrigacoes");
			},
			
			navToBeps: function (oEvent) {
				this.getRouter().navTo("bepsListagemObrigacoes");
			},
			
			navToAdmin: function (oEvent) {
				this.getRouter().navTo("adminInicio");
			},
			
			onNavToComunicacao: function (oEvent) {
				this.getRouter().navTo("comunicacao");
			},
			
			onTrocarIdioma: function (oEvent) {
				var sCodigoIdioma = oEvent.getSource().getSelectedKey();
				
				if (sCodigoIdioma.toUpperCase() !== sap.ui.getCore().getConfiguration().getLanguage().toUpperCase()) {
					sap.ui.getCore().getConfiguration().setLanguage(sCodigoIdioma);
				}
			}
			
		});
	}
);