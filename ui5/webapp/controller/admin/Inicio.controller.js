sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"jquery.sap.global",
		"sap/m/Popover",
		"sap/m/Button",
		"ui5ns/ui5/model/models",
		"sap/ui/model/Filter",
		"sap/m/MessageToast",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/NodeAPI"
	],
	function (BaseController, jQuery, Popover, Button, models, Filter, MessageToast, Constants, NodeAPI) {

		return BaseController.extend("ui5ns.ui5.controller.admin.Inicio", {

			onInit: function () {

				this.setModel(new sap.ui.model.json.JSONModel({}));

				var oModel = new sap.ui.model.json.JSONModel({
					menu: {}
				});

				this.setModel(oModel, "viewModel");

				this._setToggleButtonTooltip(!sap.ui.Device.system.desktop);

				this.getRouter().getRoute("adminInicio").attachPatternMatched(this._onRouteMatched, this);
			},

			onItemSelect: function (oEvent) {
				var item = oEvent.getParameter("item");
				//var viewId = this.getView().getId();

				if (item.getKey() === "ttcModulo") {
					this.getRouter().navTo("ttcListagemEmpresas");
				} else if (item.getKey() === "taxPackageModulo") {
					this.getRouter().navTo("taxPackageListagemEmpresas");
				} else if (item.getKey() === "complianceModulo") {
					this.getRouter().navTo("complianceListagemObrigacoes");
				} else if (item.getKey() === "bepsModulo") {
					this.getRouter().navTo("bepsListagemObrigacoes");
				} else {
					//sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + item.getKey());
					this.byId("pageContainer").to(this.byId(item.getKey()));

					// @pedsf 15/10/18 
					// A primeira vez que a XMLView é construída dispara o evento onAfterShow da pagina de listagem de objetos.
					// Após a primeira vez, o disparo apenas ocorre quando há navegação interna na XMLView (ir de página de listagem para
					// a de objeto, ou de objeto para a de listagem). Foi preciso forçar o disparo desse evento ao trocar de item de menu,
					// se não os objetos de um menu não seriam recarregados em visualizações posteriores a primeira.
					// Procurar melhor solução, mas por enquanto é o que tem.
					var oXMLView = this.byId(item.getKey() + "XMLView");
					if (oXMLView && oXMLView.byId("paginaListagem") && oXMLView.byId("paginaListagem").aDelegates) {
						var aDelegates = oXMLView.byId("paginaListagem").aDelegates;
						for (var i = 0; i < aDelegates.length; i++) {
							var oItem = aDelegates[i];

							if (oItem.oDelegate && oItem.oDelegate.onAfterShow) {
								oItem.oDelegate.onAfterShow();
								break;
							}
						}
					}
				}
			},

			handleUserNamePress: function (oEvent) {
				var that = this;

				var oHomeButton = new sap.m.Button({
					text: "Home"
				}).attachPress(function () {
					that.getRouter().navTo("selecaoModulo");
				});

				var popover = new Popover({
					showHeader: false,
					placement: sap.m.PlacementType.Bottom,
					content: [
						oHomeButton,
						new Button({
							text: that.getResourceBundle().getText("viewAdminInicioLabelBotaoSair"),
							type: sap.m.ButtonType.Transparent
						})
					]
				}).addStyleClass("sapMOTAPopover sapTntToolHeaderPopover");

				popover.openBy(oEvent.getSource());
			},

			handleNotificationsPress: function (oEvent) {

				var that = this;

				var countObrig = 0;
				var countTTC = 0;
				var countTAX = 0;

				NodeAPI.listarRegistros("DeepQuery/Obrigacao?idAprovacao=1", function (response) { // 1 Obrigacao
					if (response) {

						for (var i = 0, length = response.length; i < length; i++) {
							countObrig++;
						}
						that.getModel().setProperty("/ContadorObrig", {
							modelcountObrig: countObrig

						});
						that.getModel().setProperty("/Obrigacao", response);
					}

				});

				NodeAPI.listarRegistros("DeepQuery/RequisicaoReabertura?status=1", function (response) { // 1 TTC
					if (response) {

						for (var i = 0, length = response.length; i < length; i++) {
							countTTC++;
						}
					}
					that.getModel().setProperty("/ContadorTTC", {
						modelcountTTC: countTTC

					});
					that.getModel().setProperty("/RequisicaoReabertura", response);

				});
				NodeAPI.listarRegistros("DeepQuery/RequisicaoReaberturaTaxPackage?status=1", function (response) { // 1 TAX Packege
					if (response) {

						for (var i = 0, length = response.length; i < length; i++) {
							countTAX++;
						}
					}
					that.getModel().setProperty("/ContadorTax", {
						modelcountTAX: countTAX

					});
					that.getModel().setProperty("/RequisicaoReaberturaTaxPackage", response);
				});

				//var oList = new sap.m.List();
				var viewId = this.getView().getId();

				var vbox = new sap.m.VBox();
				var Texto01 = new sap.m.Text({
					text: "{i18n>viewNotificacaolinhaRequisicaoObrigacao}  ({/ContadorObrig/modelcountObrig})",
					width: "auto"
				}).addStyleClass("sapUiResponsiveMargin");
				vbox.addItem(Texto01);

				var Texto02 = new sap.m.Text({
					text: "{i18n>viewNotificacaolinhaRequisicaoTTC} ({/ContadorTTC/modelcountTTC})",
					width: "auto"
				}).addStyleClass("sapUiResponsiveMargin");
				vbox.addItem(Texto02);

				var Texto03 = new sap.m.Text({
					text: "{i18n>viewNotificacaolinhaRequisicaoTaxPackage} ({/ContadorTax/modelcountTAX})",
					width: "auto"
				}).addStyleClass("sapUiResponsiveMargin");
				vbox.addItem(Texto03);

				/*var panel01 = new sap.m.Panel({
					headerText: "alguma coisa",
					width: "auto",
					expanded: false,
					expandable: true
				}).addStyleClass("sapUiResponsiveMargin");
				vbox.addItem(panel01);*/
				//<Panel expandable="true" expanded="false" headerText="{i18n>viewNotificacaoTitutoObrigacao} ({/ContadorObrig/modelcountObrig})" width="auto" class="sapUiResponsiveMargin">
				/* Carregar notificações dinamicamente */
				/*
				oList.addItem(new sap.m.NotificationListItem({
					title: "Requisição de Reabertura",
					description: "TTC - 1º trimestre/2016",
					authorName: "João da Silva",
					datetime: "1 hora",
					priority: "High"
				}));
				*/
				var popover = new Popover({
					title: that.getResourceBundle().getText("viewAdminInicioTituloNotificacoes"),
					placement: sap.m.PlacementType.Bottom,
					content: [
						vbox
					]
				});

				this.getView().addDependent(popover);

				var oToolbar = new sap.m.Toolbar();
				oToolbar.addContent(new sap.m.ToolbarSpacer());
				oToolbar.addContent(new sap.m.Button({
					text: that.getResourceBundle().getText("viewAdminInicioBotaoTodasNotificacoes")
				}).attachPress(function () {
					sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--listaNotificacoes");

					var oXMLView = that.byId("listaNotificacoesXMLView");
					if (oXMLView && oXMLView.byId("paginaListagem") && oXMLView.byId("paginaListagem").aDelegates) {
						var aDelegates = oXMLView.byId("paginaListagem").aDelegates;
						for (var i = 0; i < aDelegates.length; i++) {
							var oItem = aDelegates[i];

							if (oItem.oDelegate && oItem.oDelegate.onAfterShow) {
								oItem.oDelegate.onAfterShow();
								break;
							}
						}
					}
				}));

				popover.setFooter(oToolbar);

				popover.openBy(oEvent.getSource());
			},

			onSideNavButtonPress: function () {
				var viewId = this.getView().getId();
				var toolPage = sap.ui.getCore().byId(viewId + "--toolPage");
				var sideExpanded = toolPage.getSideExpanded();

				this._setToggleButtonTooltip(sideExpanded);

				toolPage.setSideExpanded(!toolPage.getSideExpanded());
			},

			_setToggleButtonTooltip: function (bLarge) {
				var toggleButton = this.byId("sideNavigationToggleButton");
				if (bLarge) {
					toggleButton.setTooltip(this.getResourceBundle().getText("viewAdminInicioTooltipBotaoSideNavLarge"));
				} else {
					toggleButton.setTooltip(this.getResourceBundle().getText("viewAdminInicioTooltipBotaoSideNavSmall"));
				}
			},

			_onRouteMatched: function (oEvent) {

				fetch(Constants.urlBackend + "verifica-auth", {
						credentials: "include"
					})
					.then((res) => {
						res.json()
							.then((response) => {
								if (response.success) {
									//alert(response.nome + "  " + response.id);
										that.getModel().setProperty("/NomeUsuario", response.nome);
								} else {
									MessageToast.show(response.error.msg);
									this.getRouter().navTo("Login");
								}
							})
							.catch((err) => {
								MessageToast.show(err);
								this.getRouter().navTo("Login");
							});
					})
					.catch((err) => {
						MessageToast.show(err);
						this.getRouter().navTo("Login");
					});
					
				var that = this;

				this.getModel("viewModel").setProperty("/menu", {
					navigation: [
						/*{
												title: that.getResourceBundle().getText("viewAdminInicioMenuUsuario"),
												icon: "sap-icon://person-placeholder",
												key: "usuario"
											},*/
						{
							title: that.getResourceBundle().getText("viewAdminInicioMenuTaxPackageCadastroAliquotas"),
							icon: "sap-icon://waiver",
							key: "taxPackageCadastroAliquotas"
						}, {
							title: that.getResourceBundle().getText("viewAdminInicioMenuPais"),
							icon: "sap-icon://choropleth-chart",
							key: "pais"
						}, {
							title: that.getResourceBundle().getText("viewAdminInicioMenuEmpresa"),
							icon: "sap-icon://building",
							key: "empresa"
						}, {
							title: that.getResourceBundle().getText("viewAdminInicioMenuTTC"),
							icon: "sap-icon://batch-payments",
							expanded: false,
							items: [{
								title: "Visualizar Módulo",
								key: "ttcModulo",
								route: "ttcListagemEmpresas"
							}, {
								title: that.getResourceBundle().getText("viewGeralCambio"),
								key: "ttcCambio"
							}, {
								title: that.getResourceBundle().getText("viewGeralCategoria"),
								key: "ttcCadastroCategory"
							}, {
								title: that.getResourceBundle().getText("viewGeralTaxa"),
								key: "ttcCadastroTax"
							}, {
								title: that.getResourceBundle().getText("viewGeralNomeT"),
								key: "ttcCadastroTributos"
							}]
						}, {
							title: that.getResourceBundle().getText("viewAdminInicioMenuTaxPackage"),
							icon: "sap-icon://product",
							expanded: false,
							items: [{
								title: that.getResourceBundle().getText("viewGeralVisualizarM"),
								key: "taxPackageModulo"
							}, {
								title: that.getResourceBundle().getText("viewGeralItemsTR"),
								key: "taxPackageCadastroItemsToReport"
							}, {
								title: that.getResourceBundle().getText("viewGeralAdicoesEExclusoes"),
								key: "taxPackageCadastroAdicoesExclusoes"
							}]
						}, {
							title: that.getResourceBundle().getText("viewAdminInicioMenuComplianceBeps"),
							icon: "sap-icon://activities",
							expanded: false,
							items: [{
									title: that.getResourceBundle().getText("viewAdminInicioMenuComplianceBepsVisualizarCompliance"),
									key: "complianceModulo"
								}, {
									title: that.getResourceBundle().getText("viewAdminInicioMenuComplianceBepsVisualizarBeps"),
									key: "bepsModulo"
								}, {
									title: that.getResourceBundle().getText("viewAdminInicioMenuComplianceBepsCadastroTipoObrigacoes"),
									key: "cadastroObrigacoes"
								}
								/*, {
																title: that.getResourceBundle().getText("viewAdminInicioMenuComplianceBepsCadastroObrigacoes"),
																key: "cadastroObrigacoes"
															}*/
							]
						}
					]
				});
			}
		});
	}
);