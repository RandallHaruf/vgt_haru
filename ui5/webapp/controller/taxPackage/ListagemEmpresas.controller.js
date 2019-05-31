sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"ui5ns/ui5/model/formatter",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, JSONModel, formatter, NodeAPI, Constants, Utils) {
		"use strict";

		BaseController.extend("ui5ns.ui5.controller.taxPackage.ListagemEmpresas", {

			formatter: formatter,

			onInit: function () {
				var oModel = new JSONModel();
				oModel.setSizeLimit(500);
				this.setModel(oModel);

				if (this.isVisualizacaoUsuario()) {
					this.getRouter().getRoute("taxPackageListagemEmpresas").attachPatternMatched(this._onRouteMatched, this);
				}
			},

			onBaixarModeloImport: function (oEvent) {
				window.location = Constants.urlBackend + "TaxPackage/DownloadModeloImport";
			},

			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			onNavToReport: function () {
				this.getRouter().navTo("taxPackageRelatorio");
			},

			onNavBack: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			onTrocarAnoCalendario: function () {
				this._atualizarDados();
			},

			onSelecionarEmpresa: function (oEvent) {
				if (this.isVisualizacaoUsuario()) {
					this.setBusy(this.byId("tabelaEmpresas"), true);
	
					var oEmpresa = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
					delete oEmpresa.iconeStatusPrimeiroPeriodo;
					delete oEmpresa.iconeStatusSegundoPeriodo;
					delete oEmpresa.iconeStatusTerceiroPeriodo;
					delete oEmpresa.iconeStatusQuartoPeriodo;
					delete oEmpresa.iconeStatusAnual;
	
					var oParametros = {
						empresa: oEmpresa,
						idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado"),
						nomeUsuario: this.getModel().getProperty("/NomeUsuario")
					};
	
					this.getRouter().navTo("taxPackageResumoTrimestre", {
						parametros: this.toURIComponent(oParametros)
					});
				} 
				else {
					var objSelecionado = oEvent.getSource().getBindingContext().getObject();
					
					this._inceptionParams.router.navToDetalhes({
						nomeUsuario: '',
						oAnoCalendario: {
							idAnoCalendario: objSelecionado.idAnoCalendario,
							anoCalendario: objSelecionado.anoCalendario
						},
						oEmpresa: {
							empresa: objSelecionado.nomeEmpresa,
							id_empresa: objSelecionado.idEmpresa,
							tin: objSelecionado.tin,
							fy_start_date: objSelecionado.fyStartDate,
							fy_end_date: objSelecionado.fyEndDate, 
							fk_imposto_pais: objSelecionado.fkTributoPais,
							fk_imposto_empresa: objSelecionado.fkTributoEmpresa,
							prescricao_prejuizo: objSelecionado.prescricaoPrejuizoPais,
							prescricao_credito: objSelecionado.prescricaoCreditoPais,
							"fk_pais.id_pais": objSelecionado.idPais
						},
						oPeriodo: {
							numero_ordem: objSelecionado.numeroOrdem,
							id_rel_tax_package_periodo: objSelecionado.idRelTaxPackagePeriodo,
							id_tax_package: objSelecionado.fkTaxPackage
						},
						_targetInceptionParams: this._inceptionParams
					});
				}
			},

			_onRouteMatched: function (oEvent) {
				var that = this;

				var anoCalendario;
				var nomeUsuario = '';
				var atualizarDados = false;

				if (this.isVisualizacaoAdmin()) {
					this._inceptionParams = oEvent;
					anoCalendario = oEvent.params.idAnoCalendarioCorrente;

					// Sempre invalida o atualizar dados, pois no retorno do detalhe para o resumo esse parametro
					// é recebido de volta e impede a atualizacao da tabela/reconstrução do filtro. É preciso manter o estado anterior ao detalhamento.
					// O único momento que este valor é true é no clique do botão de visualizar o TTC no admin.
					atualizarDados = oEvent.params.atualizarDados;
					oEvent.params.atualizarDados = false;

					this.mostrarAcessoRapidoInception();
				} else {
					anoCalendario = this.fromURIComponent(oEvent.getParameter("arguments").parametros).idAnoCalendario;
					nomeUsuario = this.fromURIComponent(oEvent.getParameter("arguments").parametros).nomeUsuario;
				}

				that.getModel().setProperty("/AnoCalendarioSelecionado", anoCalendario);
				that.getModel().setProperty("/NomeUsuario", nomeUsuario);
				this.getModel().setProperty('/IsAreaUsuario', !this.isIFrame());

				if (this.isVisualizacaoAdmin()) {
					if (atualizarDados) {
						this._montarFiltroAdmin();
						this._atualizarDados({
							filtroAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
						});
					}
				} else {
					NodeAPI.listarRegistros("DominioAnoCalendario", function (response) {
						if (response) {
							that.getModel().setProperty("/DominioAnoCalendario", response);
							that._atualizarDados();
						}
					});
				}
			},

			_atualizarDados: function (oFiltro) {
				if (this.isVisualizacaoAdmin()) {
					this._atualizarDadosAdmin(oFiltro);
				} else {
					this._atualizarDadosUsuario();
				}
			},

			_atualizarDadosUsuario: function () {
				var sIdAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado");

				var that = this;

				if (true) { // Condicao para reconstruir, normalmente ao vir da view de seleção de módulo
					Utils.criarDialogFiltro("tabelaEmpresas", [{
						text: this.getResourceBundle().getText("viewGeralEmpresa"),
						applyTo: 'id_empresa',
						items: {
							loadFrom: 'DeepQuery/Empresa?moduloAtual=taxpackage',
							path: '/EasyFilterEmpresa',
							text: 'nome',
							key: 'id_empresa'
						}
					}], this, function (params) {
						console.log(params);
					});

					this._loadFrom().then((function (res) {
						that.getModel().setProperty("/EasyFilterEmpresa", Utils.orderByArrayParaBox(res[0], "nome"));
					}));
				}

				this.byId("tabelaEmpresas").setBusyIndicatorDelay(100);
				this.byId("tabelaEmpresas").setBusy(true);

				NodeAPI.listarRegistros(
					"TaxPackageListagemEmpresas?anoCalendario=" + sIdAnoCalendario + "&full=" + (this.isIFrame() ? "true" : "false") +
					"&moduloAtual=taxpackage",
					function (response) {
						if (response && response.success) {
							for (var i = 0, length = response.result.length; i < length; i++) {
								var obj = response.result[i];
								obj.iconeStatusPrimeiroPeriodo = that._resolverIcone(obj.status_primeiro_periodo);
								obj.tooltipPrimeiroPeriodo = that._resolverTooltip(obj.status_primeiro_periodo);

								obj.iconeStatusSegundoPeriodo = that._resolverIcone(obj.status_segundo_periodo);
								obj.tooltipSegundoPeriodo = that._resolverTooltip(obj.status_segundo_periodo);

								obj.iconeStatusTerceiroPeriodo = that._resolverIcone(obj.status_terceiro_periodo);
								obj.tooltipTerceiroPeriodo = that._resolverTooltip(obj.status_terceiro_periodo);

								obj.iconeStatusQuartoPeriodo = that._resolverIcone(obj.status_quarto_periodo);
								obj.tooltipQuartoPeriodo = that._resolverTooltip(obj.status_quarto_periodo);

								obj.iconeStatusAnual = that._resolverIcone(obj.status_anual);
								obj.tooltipAnualPeriodo = that._resolverTooltip(obj.status_anual);
							}
							that.getModel().setProperty("/Empresa", response.result);
						}

						that.byId("tabelaEmpresas").setBusy(false);
					});
			},

			_atualizarDadosAdmin: function (oFiltro) {
				var thisController = this;

				thisController.setBusy(thisController.byId("tabelaAdmin"), true);

				NodeAPI.pListarRegistros('TaxPackage/ResumoEmpresaAdmin', oFiltro ? oFiltro : '')
					.then(function (res) {
						for (var i = 0; i < res.result.length; i++) {
							res.result[i].labelPeriodo = Utils.traduzTrimestreTaxPackage(res.result[i].numeroOrdem, thisController);
							res.result[i].iconeStatus = thisController._resolverIcone(res.result[i].statusEnvio);
							res.result[i].tooltipStatus = thisController._resolverTooltip(res.result[i].statusEnvio);
							
							if (res.result[i].numeroOrdem === 6) {
								res.result[i].labelPeriodo += ' #' + res.result[i].numeroRetificadora;
							}
						}

						thisController.getModel().setProperty('/ResumoEmpresaAdmin', res.result);
					})
					.finally(function () {
						thisController.setBusy(thisController.byId('tabelaAdmin'), false);
					});
			},

			_montarFiltroAdmin: function () {
				var that = this;

				Utils.criarDialogFiltroManual([{
					text: that.getResourceBundle().getText('viewGeralAnoCalendario'),
					key: 'filtroAnoCalendario',
					defaultKey: this.getModel().getProperty("/AnoCalendarioSelecionado"),
					items: {
						loadFrom: 'DominioAnoCalendario',
						path: '/EasyFilterAnoCalendario',
						text: 'ano_calendario',
						key: 'id_dominio_ano_calendario'
					}
				}, {
					text: that.getResourceBundle().getText('viewFormularioNovaReaquisiçãoReaberturaTrimestre'),
					key: 'filtroPeriodo',
					items: {
						path: '/EasyFilterPeriodo',
						text: 'periodo',
						key: 'numero_ordem'
					}
				}, {
					text: that.getResourceBundle().getText('viewComplianceListagemObrigacoesColunaStatus'),
					key: 'filtroStatus',
					items: {
						path: '/EasyFilterStatus',
						text: 'label_status',
						key: 'status'
					}
				}, {
					text: that.getResourceBundle().getText('viewPaisRegião'),
					key: 'filtroRegiao',
					items: {
						loadFrom: 'DominioPaisRegiao',
						path: '/EasyFilterRegiao',
						text: 'regiao',
						key: 'id_dominio_pais_regiao'
					}
				}, {
					text: that.getResourceBundle().getText('viewRelatorioPais'),
					key: 'filtroPais',
					items: {
						loadFrom: 'DeepQuery/Pais',
						path: '/EasyFilterPais',
						text: 'nomePais',
						key: 'id'
					}
				}], this, function (params) {
					console.log(params);
					that._atualizarDados(params.filterSelection);
				});

				this._loadFrom().then((function (res) {
					that.getModel().setProperty("/EasyFilterAnoCalendario", res[0]);

					that.getModel().setProperty("/EasyFilterRegiao", Utils.orderByArrayParaBox(res[1].map(obj => {
						obj.regiao = Utils.traduzPaisRegiao(obj.id_dominio_pais_regiao, that);
						return obj;
					}), "regiao"));

					that.getModel().setProperty("/EasyFilterPais", Utils.orderByArrayParaBox(res[2].map(obj => {
						obj.nomePais = Utils.traduzDominioPais(obj.fkDominioPais, that);
						return obj;
					}), "nomePais"));

					that.getModel().setProperty("/EasyFilterPeriodo", Utils.orderByArrayParaBox([{
						periodo: that.getResourceBundle().getText('viewGeralPeriodo1'),
						numero_ordem: 1
					}, {
						periodo: that.getResourceBundle().getText('viewGeralPeriodo2'),
						numero_ordem: 2
					}, {
						periodo: that.getResourceBundle().getText('viewGeralPeriodo3'),
						numero_ordem: 3
					}, {
						periodo: that.getResourceBundle().getText('viewGeralPeriodo4'),
						numero_ordem: 4
					}, {
						periodo: that.getResourceBundle().getText('viewGeralPeriodo5'),
						numero_ordem: 5
					}, {
						periodo: that.getResourceBundle().getText('viewGeralPeriodo6'),
						numero_ordem: 6
					}], "periodo"));

					that.getModel().setProperty("/EasyFilterStatus", Utils.orderByArrayParaBox([{
						label_status: that._resolverTooltip(1),
						status: 1
					}, {
						label_status: that._resolverTooltip(2),
						status: 2
					}, {
						label_status: that._resolverTooltip(3),
						status: 3
					}, {
						label_status: that._resolverTooltip(4),
						status: 4
					}, {
						label_status: that._resolverTooltip(5),
						status: 5
					}], "label_status"));
				}));
			},

			_resolverIcone: function (iStatus) {
				var sIcone;

				switch (iStatus) {
				case 1: // Fechado e não enviado
					sIcone = "sap-icon://decline";
					break;
				case 2: // Não iniciado
					sIcone = "sap-icon://begin";
					break;
				case 3: // Em andamento
					sIcone = "sap-icon://process";
					break;
				case 4: // Enviado
					sIcone = "sap-icon://approvals";
					break;
				case 5: // Aguardando aprovação
					sIcone = "sap-icon://lateness";
					break;
				}

				return sIcone;
			},

			_resolverTooltip: function (iStatus) {
				var sTooltip;

				switch (iStatus) {
				case 1: // Fechado e não enviado
					sTooltip = this.getResourceBundle().getText("viewTAXListagemEmpresaTooltipIcones1");
					break;
				case 2: // Não iniciado
					sTooltip = this.getResourceBundle().getText("viewTAXListagemEmpresaTooltipIcones2");
					break;
				case 3: // Em andamento
					sTooltip = this.getResourceBundle().getText("viewTAXListagemEmpresaTooltipIcones3");
					break;
				case 4: // Enviado
					sTooltip = this.getResourceBundle().getText("viewTAXListagemEmpresaTooltipIcones4");
					break;
				case 5: // Aguardando aprovação
					sTooltip = this.getResourceBundle().getText("viewTAXListagemEmpresaTooltipIcones5");
					break;
				}

				return sTooltip;
			},

			onFiltrarListagemEmpresas: function () {
				this._filterDialog.open();
			}
		});
	}
);