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
		"ui5ns/ui5/lib/NodeAPI",
		"sap/ui/core/mvc/XMLView"
	],
	function (BaseController, jQuery, Popover, Button, models, Filter, MessageToast, Constants, NodeAPI, XMLView) {

		return BaseController.extend("ui5ns.ui5.controller.admin.Inicio", {

			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({}));

				var oModel = new sap.ui.model.json.JSONModel({
					menu: {}
				});

				this._views = [];
				this.setModel(oModel, "viewModel");

				this._setToggleButtonTooltip(!sap.ui.Device.system.desktop);

				//this.getRouter().getRoute("adminInicio").attachPatternMatched(this._onRouteMatched, this);
				this.setUpRouteMatched("adminInicio");

				var that = this;
				
				this._carregarViewExterna("relatorioTTCXMLView", "ui5ns.ui5.view.ttc.Relatorio");
				this._carregarViewExterna("relatorioTaxPackageItemsToReportXMLView", "ui5ns.ui5.view.taxPackage.RelatorioItemsToReport");
				this._carregarViewExterna("relatorioTaxPackageTaxReconciliationXMLView", "ui5ns.ui5.view.taxPackage.Relatorio");
				this._carregarViewExterna("relatorioTaxPackageAccountingResultXMLView", "ui5ns.ui5.view.taxPackage.RelatorioAccountingResult");
				this._carregarViewExterna("relatorioTaxPackageTemporaryAndPermanentDifferencesXMLView", "ui5ns.ui5.view.taxPackage.RelatorioTemporaryAndPermanentDifferences");
				this._carregarViewExterna("relatorioTaxPackageFiscalResultXMLView", "ui5ns.ui5.view.taxPackage.RelatorioFiscalResult");
				this._carregarViewExterna("relatorioTaxPackageIncomeTaxXMLView", "ui5ns.ui5.view.taxPackage.RelatorioIncomeTax");
				this._carregarViewExterna("relatorioTaxPackageLossScheduleXMLView", "ui5ns.ui5.view.taxPackage.RelatorioLossSchedule");
				this._carregarViewExterna("relatorioTaxPackageCreditScheduleXMLView", "ui5ns.ui5.view.taxPackage.RelatorioCreditSchedule");
				this._carregarViewExterna("relatorioComplianceBepsXMLView", "ui5ns.ui5.view.compliance.Relatorio");
				this._carregarViewExterna("visualizarTTCXMLView", "ui5ns.ui5.view.ttc.ListagemEmpresas");
				this._carregarViewExterna("detalheTTCXMLView", "ui5ns.ui5.view.ttc.VisualizacaoTrimestre");
				this._carregarViewExterna("visualizarTaxPackageXMLView", "ui5ns.ui5.view.taxPackage.ListagemEmpresas");
				this._carregarViewExterna("detalheTaxPackageXMLView", "ui5ns.ui5.view.taxPackage.VisualizacaoTrimestre");
				this._carregarViewExterna("visualizarComplianceBepsXMLView", "ui5ns.ui5.view.compliance.ListagemObrigacoes");
				this._carregarViewExterna("detalheComplianceBepsXMLView", "ui5ns.ui5.view.compliance.FormularioDetalhesObrigacao");
			},

			onItemSelect: function (oEvent) {
				var that = this;
				var item = oEvent.getParameter("item");
				var viewPath = oEvent.getParameter("item").getBindingContext("viewModel").getObject().viewPath;
				var containerId = item.getKey();
				
				if (this._isItemInception(containerId)) {
					this._itemInceptionHandler(containerId);
				}
				else {
					var oPage = this.byId("pageContainer").getPage(containerId);
	
					if (oPage) {
						this.byId("pageContainer").to(oPage);
	
						this._dispararOnAfterShow(viewPath);
					} else {
						this._carregarViewItemMenu(viewPath, containerId)
							.then(function (oPage) {
								that.byId("pageContainer").to(oPage);
							});
					}
				}
			},
			
			_isItemInception: function (sItemKey) {
				return sItemKey.toLowerCase().startsWith('visualizar');
			},
			
			_itemInceptionHandler: function (sItemKey) {
				var oParam;
				
				switch (true) {
					case this._isItemInceptionTTC(sItemKey):
						oParam = this._getParametrosInceptionTTC();
						break;
					case this._isItemInceptionTaxPackage(sItemKey):
						oParam = this._getParametrosInceptionTaxPackage();
						break;
					case this._isItemInceptionComplianceBeps(sItemKey):
						oParam = this._getParametrosInceptionComplianceBeps();
						break;
				}
				
				this._navegarParaViewExterna(sItemKey, oParam);	
			},
			
			_isItemInceptionTTC: function (sItemKey) {
				return sItemKey.toLowerCase().indexOf('ttc') > -1;
			},
			
			_isItemInceptionTaxPackage: function (sItemKey) {
				return sItemKey.toLowerCase().indexOf('taxpackage') > -1;
			},
			
			_isItemInceptionComplianceBeps: function (sItemKey) {
				return sItemKey.toLowerCase().indexOf('compliancebeps') > -1;
			},
			
			_getParametrosInceptionTTC: function () {
				var that = this;
				
				return {
					params: {
						idAnoCalendarioCorrente: this.getModel().getProperty("/idAnoCalendarioCorrente"),
						atualizarDados: true
					},
					router: {
						navToListagem: function (oParam) {
							that._navegarParaViewExterna('visualizarTTC', oParam);
						},
						navToDetalhes: function (oParam) {
							that._navegarParaViewExterna('detalheTTC', oParam);
						}
					}
				};
			},
			
			_getParametrosInceptionTaxPackage: function () {
				var that = this;
					
				return {
					params: {
						idAnoCalendarioCorrente: this.getModel().getProperty("/idAnoCalendarioCorrente"),
						atualizarDados: true
					},
					router: {
						navToListagem: function (oParam) {
							that._navegarParaViewExterna('visualizarTaxPackage', oParam);
						},
						navToDetalhes: function (oParam) {
							that._navegarParaViewExterna('detalheTaxPackage', oParam);
						}
					}
				};
			},
			
			_getParametrosInceptionComplianceBeps: function () {
				var that = this;
					
				return {
					params: {
						idAnoCalendarioCorrente: this.getModel().getProperty("/idAnoCalendarioCorrente"),
						atualizarDados: true
					},
					router: {
						navToListagem: function (oParam) {
							that._navegarParaViewExterna('visualizarComplianceBeps', oParam);
						},
						navToDetalhes: function (oParam) {
							that._navegarParaViewExterna('detalheComplianceBeps', oParam);
						}
					}
				};
			},
			
			_navegarParaViewExterna: function (sItemKey, oParam) {
				var oView = this.byId("pageContainer").getPage(sItemKey + "XMLView");
						
				var that = this;

				if (oView) {
					// Navega para a view destino
					this.byId("pageContainer").to(oView);

					// Sobescreve o acesso rapido para que ele não seja exibido na área admin
					oView.getController().mostrarAcessoRapidoInception = function () {
						this.getView().byId("menuAcessoRapido").setVisible(false);
					};

					// Sobescreve o isFrame para sempre indicar que está sim na área admin
					oView.getController().isIFrame = function () {
						return true;
					};

					// Dispara o método que executa ações no carregamento da página
					if (oView.getController()._onRouteMatched) {
						oView.getController()._onRouteMatched(oParam);
					} else if (oView.getController()._handleRouteMatched) {
						oView.getController()._handleRouteMatched(oParam);
					}
				}
			},

			_dispararOnAfterShow: function (sViewPath) {
				var oXMLView = this._views[sViewPath];
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
			},

			_carregarViewItemMenu: function (sViewPath, sIdContainer) {
				var that = this;

				return new Promise(function (resolve, reject) {
					XMLView.create({
						id: sIdContainer + "XMLView",
						viewName: sViewPath
					}).then(function (oView) {
						oView.getController().getOwnerComponent = function () {
							return that.getOwnerComponent();
						};

						that._views[sViewPath] = oView;

						var oScrollContainer = new sap.m.ScrollContainer({
							id: sIdContainer,
							horizontal: false,
							vertical: true,
							height: "100%"
						}).addContent(oView);

						that.byId("pageContainer").addPage(oScrollContainer);

						resolve(oScrollContainer);
					});
				});
			},
			
			_carregarViewExterna: function (sViewId, sViewName) {
				var that = this;
				XMLView.create({
					id: sViewId,
					viewName: sViewName
				}).then(function (oView) {
					that.byId("pageContainer").addPage(oView);	
				});
			},

			_onItemRelatorioSelecionado: function (oEvent) {
				var oItem = oEvent.getParameter("item"),
					oView = this.byId("pageContainer").getPage(oItem.getId() + "XMLView");
					
				var that = this;

				if (oView) {
					// Navega para a view destino
					this.byId("pageContainer").to(oView);

					// Sobescreve o acesso rapido para que ele não seja exibido na área admin
					oView.getController().mostrarAcessoRapidoInception = function () {
						this.getView().byId("menuAcessoRapido").setVisible(false);
					};

					// Sobescreve o isFrame para sempre indicar que está sim na área admin
					oView.getController().isIFrame = function () {
						return true;
					};

					// Dispara o método que executa ações no carregamento da página
					if (oView.getController()._onRouteMatched) {
						oView.getController()._onRouteMatched();
					} else if (oView.getController()._handleRouteMatched) {
						oView.getController()._handleRouteMatched();
					}
				}
			},

			_adicionarSubItemMenu: function (oParent, sId, sLabel) {
				var oItem = new sap.m.MenuItem({
					id: sId,
					text: sLabel
				});

				oParent.addItem(oItem);
			},

			_montarMenuRelatorio: function () {
				var oMenuRelatorio = new sap.m.MenuButton({
					text: "{i18n>viewGeralRelatorio}",
					type: sap.m.ButtonType.Transparent
				});

				var oMenu = new sap.m.Menu().attachItemSelected(this._onItemRelatorioSelecionado.bind(this));

				// TTC
				//this._adicionarSubItemMenu(oMenu, "ui5ns.ui5.view.ttc.Relatorio", "{i18n>viewAdminInicioMenuTTC}");
				this._adicionarSubItemMenu(oMenu, "relatorioTTC", "{i18n>viewAdminInicioMenuTTC}");

				// Tax Package
				var oItemRelatorioTaxPackage = new sap.m.MenuItem({
					id: "relatorioTaxPackage",
					text: "{i18n>viewAdminInicioMenuTaxPackage}"
				});

				oMenu.addItem(oItemRelatorioTaxPackage);

				/*this._adicionarSubItemMenu(oItemRelatorioTaxPackage, "ui5ns.ui5.view.taxPackage.RelatorioItemsToReport",
					"{i18n>viewEdiçãoTrimestreItensParaReportar}");*/
				this._adicionarSubItemMenu(oItemRelatorioTaxPackage, "relatorioTaxPackageItemsToReport",
					"{i18n>viewEdiçãoTrimestreItensParaReportar}");

				var oItemRelatorioTaxPackageReconciliacaoFiscal = new sap.m.MenuItem({
					id: "relatorioTaxPackageReconciliacaoFiscal",
					text: "{i18n>viewTaxPackageVisualiazaçcaoTaxReconciliation}"
				});

				oItemRelatorioTaxPackage.addItem(oItemRelatorioTaxPackageReconciliacaoFiscal);

				/*this._adicionarSubItemMenu(oItemRelatorioTaxPackageReconciliacaoFiscal, "ui5ns.ui5.view.taxPackage.RelatorioAccountingResult",
					"{i18n>viewEdiçãoTrimestreResultadoContabil}");
				this._adicionarSubItemMenu(oItemRelatorioTaxPackageReconciliacaoFiscal, "ui5ns.ui5.view.taxPackage.RelatorioTemporaryAndPermanentDifferences",
					"{i18n>viewGeralAdicoesEExclusoes}");
				this._adicionarSubItemMenu(oItemRelatorioTaxPackageReconciliacaoFiscal, "ui5ns.ui5.view.taxPackage.RelatorioFiscalResult",
					"{i18n>viewEdiçãoTrimestreResultadoFiscal}");
				this._adicionarSubItemMenu(oItemRelatorioTaxPackageReconciliacaoFiscal, "ui5ns.ui5.view.taxPackage.RelatorioIncomeTax",
					"{i18n>viewEdiçãoTrimestreImpostoRenda}");

				this._adicionarSubItemMenu(oItemRelatorioTaxPackage, "ui5ns.ui5.view.taxPackage.RelatorioLossSchedule",
					"{i18n>viewTaxpackageEdiçãoTrimestreLOSSSCHEDULE}");
				this._adicionarSubItemMenu(oItemRelatorioTaxPackage, "ui5ns.ui5.view.taxPackage.RelatorioCreditSchedule",
					"{i18n>viewTaxpackageEdiçãoTrimestreCreditSchedule}");*/
				
				this._adicionarSubItemMenu(oItemRelatorioTaxPackageReconciliacaoFiscal, "relatorioTaxPackageTaxReconciliation",
					"{i18n>viewGeralTodos}");
				this._adicionarSubItemMenu(oItemRelatorioTaxPackageReconciliacaoFiscal, "relatorioTaxPackageAccountingResult",
					"{i18n>viewEdiçãoTrimestreResultadoContabil}");
				this._adicionarSubItemMenu(oItemRelatorioTaxPackageReconciliacaoFiscal, "relatorioTaxPackageTemporaryAndPermanentDifferences",
					"{i18n>viewGeralAdicoesEExclusoes}");
				this._adicionarSubItemMenu(oItemRelatorioTaxPackageReconciliacaoFiscal, "relatorioTaxPackageFiscalResult",
					"{i18n>viewEdiçãoTrimestreResultadoFiscal}");
				this._adicionarSubItemMenu(oItemRelatorioTaxPackageReconciliacaoFiscal, "relatorioTaxPackageIncomeTax",
					"{i18n>viewEdiçãoTrimestreImpostoRenda}");

				this._adicionarSubItemMenu(oItemRelatorioTaxPackage, "relatorioTaxPackageLossSchedule",
					"{i18n>viewTaxpackageEdiçãoTrimestreLOSSSCHEDULE}");
				this._adicionarSubItemMenu(oItemRelatorioTaxPackage, "relatorioTaxPackageCreditSchedule",
					"{i18n>viewTaxpackageEdiçãoTrimestreCreditSchedule}");

				// Compliance
				this._adicionarSubItemMenu(oMenu, "relatorioComplianceBeps", "{i18n>viewAdminInicioMenuComplianceBeps}");

				oMenuRelatorio.setMenu(oMenu);

				return oMenuRelatorio;
			},

			_montarBotaoLogoff: function () {
				var that = this;

				return new Button({
					text: "Logout",
					type: sap.m.ButtonType.Transparent
				}).attachPress(function (event) {
					fetch(Constants.urlBackend + "deslogar", {
							credentials: 'include'
						})
						.then(() => {
							that.getRouter().navTo("login");
						});
				});
			},

			handleUserNamePress: function (oEvent) {
				var that = this;

				var oHomeButton = new sap.m.Button({
					text: "Home",
					type: sap.m.ButtonType.Transparent
				}).attachPress(function () {
					that.getRouter().navTo("selecaoModulo");
				});

				var oMenuRelatorio = this._montarMenuRelatorio();

				var oLogoffButton = this._montarBotaoLogoff();

				var popover = new Popover({
					showHeader: false,
					placement: sap.m.PlacementType.Bottom,
					content: [
						oHomeButton,
						oMenuRelatorio,
						oLogoffButton
					],
					afterClose: function () {
						popover.destroy();
					}
				}).addStyleClass("sapMOTAPopover sapTntToolHeaderPopover");

				this.getView().addDependent(popover);

				popover.openBy(oEvent.getSource());
			},

			handleNotificationsPress: function (oEvent) {
				var that = this;

				this._carregarValoresNotificacoes();

				var countObrig = 0;
				var countTTC = 0;
				var countTAX = 0;

				NodeAPI.listarRegistros("DeepQuery/RequisicaoModeloObrigacao?&idStatus=1", function (response) { // 1 Obrigacao
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

				NodeAPI.get("DeepQuery/RequisicaoEncerramentoPeriodoTaxPackage", {
						queryString: {
							status: 1 // em andamento
						}
					})
					.then(function (response) {
						if (response) {
							var json = JSON.parse(response);
							that.getModel().setProperty("/ContadorTaxPackageEncerramentoPeriodo", json.length);
						}
					})
					.catch(function (err) {
						alert(err.statusText);
					});

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

				var Texto04 = new sap.m.Text({
					text: "{i18n>viewNotificacaolinhaRequisicaoEncerramentoPeriodoTaxPackage} ({/ContadorTaxPackageEncerramentoPeriodo})",
					width: "auto"
				}).addStyleClass("sapUiResponsiveMargin");
				vbox.addItem(Texto04);

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
					var oPage = that.byId("pageContainer").getPage("listaNotificacoes");

					if (oPage) {
						that.byId("pageContainer").to(oPage);

						that._dispararOnAfterShow("ui5ns.ui5.view.admin.ListaNotificacoes");
					} else {
						that._carregarViewItemMenu("ui5ns.ui5.view.admin.ListaNotificacoes", "listaNotificacoes")
							.then(function (oPage) {
								that.byId("pageContainer").to(oPage);
							});
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

			_onRouteMatched: function (oParam) {
				this._carregarValoresNotificacoes();

				fetch(Constants.urlBackend + "verifica-auth", {
						credentials: "include"
					})
					.then((res) => {
						res.json()
							.then((response) => {
								if (response.success) {
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

				this.getModel().setProperty("/idAnoCalendarioCorrente", oParam.idAnoCalendarioCorrente);

				this.getModel("viewModel").setProperty("/menu", {
					navigation: [{
						title: that.getResourceBundle().getText("viewAdminInicioMenuUsuario"),
						icon: "sap-icon://account",
						key: "usuario",
						viewPath: "ui5ns.ui5.view.admin.CadastroUsuario"
					}, {
						title: that.getResourceBundle().getText("viewAdminInicioMenuTaxPackageCadastroAliquotas"),
						icon: "sap-icon://waiver",
						key: "taxPackageCadastroAliquotas",
						viewPath: "ui5ns.ui5.view.admin.CadastroAliquotasTaxPackage"
					}, {
						title: that.getResourceBundle().getText("viewAdminInicioMenuPais"),
						icon: "sap-icon://choropleth-chart",
						key: "pais",
						viewPath: "ui5ns.ui5.view.admin.Pais"
					}, {
						title: that.getResourceBundle().getText("viewAdminInicioMenuEmpresa"),
						icon: "sap-icon://building",
						key: "empresa",
						viewPath: "ui5ns.ui5.view.admin.Empresa"
					}, {
						title: that.getResourceBundle().getText("viewAdminInicioMenuTTC"),
						icon: "sap-icon://batch-payments",
						expanded: false,
						items: [{
							title: that.getResourceBundle().getText("viewAdminInicioMenuTTCVisualizarModulo"),
							key: "visualizarTTC"
						}, {
							title: that.getResourceBundle().getText("viewGeralCambio"),
							key: "ttcCambio",
							viewPath: "ui5ns.ui5.view.admin.CambioTTC"
						}, {
							title: that.getResourceBundle().getText("viewGeralCategoria"),
							key: "ttcCadastroCategory",
							viewPath: "ui5ns.ui5.view.admin.CadastroCategoryTTC"
						}, {
							title: that.getResourceBundle().getText("viewGeralTaxa"),
							key: "ttcCadastroTax",
							viewPath: "ui5ns.ui5.view.admin.CadastroTaxTTC"
						}, {
							title: that.getResourceBundle().getText("viewGeralNomeT"),
							key: "ttcCadastroTributos",
							viewPath: "ui5ns.ui5.view.admin.CadastroNameOfTaxTTC"
						}]
					}, {
						title: that.getResourceBundle().getText("viewAdminInicioMenuTaxPackage"),
						icon: "sap-icon://product",
						expanded: false,
						items: [{
							title: that.getResourceBundle().getText("viewAdminInicioMenuTTCVisualizarModulo"),
							key: "visualizarTaxPackage"
						}, {
							title: that.getResourceBundle().getText("viewGeralItemsTR"),
							key: "taxPackageCadastroItemsToReport",
							viewPath: "ui5ns.ui5.view.admin.CadastroItemsToReportTaxPackage"
						}, {
							title: that.getResourceBundle().getText("viewGeralAdicoesEExclusoes"),
							key: "taxPackageCadastroAdicoesExclusoes",
							viewPath: "ui5ns.ui5.view.admin.CadastroDiferencasTaxPackage"
						}]
					}, {
						title: that.getResourceBundle().getText("viewAdminInicioMenuComplianceBeps"),
						icon: "sap-icon://activities",
						expanded: false,
						items: [{
							title: that.getResourceBundle().getText("viewAdminInicioMenuTTCVisualizarModulo"),
							key: "visualizarComplianceBeps"
						},{
							title: that.getResourceBundle().getText("viewAdminInicioMenuComplianceBepsCadastroTipoObrigacoes"),
							key: "cadastroObrigacoes",
							viewPath: "ui5ns.ui5.view.admin.CadastroObrigacoesComplianceBeps"
						}, {
							title: that.getResourceBundle().getText("viewArquivosAdminMenu"),
							key: "listaArquivos",
							viewPath: "ui5ns.ui5.view.admin.ListaArquivosComplianceBeps"
						}]
					}]
				});
			},

			_carregarValoresNotificacoes: function () {
				var that = this;

				var countSoma = 0
				Promise.all([
						this.retornarPromessaViaCallback("DeepQuery/RequisicaoModeloObrigacao?&idStatus=1"),
						this.retornarPromessaViaCallback("DeepQuery/RequisicaoReabertura?&status=1"),
						this.retornarPromessaViaCallback("DeepQuery/RequisicaoReaberturaTaxPackage?&status=1"),
						NodeAPI.get("DeepQuery/RequisicaoEncerramentoPeriodoTaxPackage", {
							queryString: {
								status: 1
							}
						})
					])
					.then(function (response) {
						var rsp1 = response[0];
						var rsp2 = response[1];
						var rsp3 = response[2];
						var rsp4 = JSON.parse(response[3]);

						var countSoma = rsp1.length + rsp2.length + rsp3.length + rsp4.length;
						that.getModel().setProperty("/ContadorSoma", {
							modelcountSoma: countSoma
						});
					})
					.catch(function (err) {

					});
			},

			onAtualizarNotificacoes: function (oEvent) {
				this._carregarValoresNotificacoes();
			},

			retornarPromessaViaCallback: function (sRoute) {
				return new Promise(function (resolve, reject) {
					NodeAPI.listarRegistros(sRoute, function (response) {
						if (response) {
							resolve(response);
						} else {
							reject();
						}
					});
				});
			},
		});
	}
);