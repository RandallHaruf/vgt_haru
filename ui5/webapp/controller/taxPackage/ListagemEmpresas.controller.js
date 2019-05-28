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
				this.setModel(new JSONModel({}));

				this.getRouter().getRoute("taxPackageListagemEmpresas").attachPatternMatched(this._onRouteMatched, this);
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
			},

			_onRouteMatched: function (oEvent) {
				this.setBusy(this.byId("tabelaEmpresas"), false);

				if (this.isIFrame()) {
					this.mostrarAcessoRapidoInception();
				}

				var that = this;
				var anoCalendario = this.fromURIComponent(oEvent.getParameter("arguments").parametros).idAnoCalendario;
				var nomeUsuario = this.fromURIComponent(oEvent.getParameter("arguments").parametros).nomeUsuario;

				NodeAPI.listarRegistros("DominioAnoCalendario", function (response) {
					if (response) {
						that.getModel().setProperty("/DominioAnoCalendario", response);
						that.getModel().setProperty("/AnoCalendarioSelecionado", anoCalendario);
						that.getModel().setProperty("/NomeUsuario", nomeUsuario);
						that._atualizarDados();
					}
				});
			},

			_atualizarDados: function () {
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
					"TaxPackageListagemEmpresas?anoCalendario=" + sIdAnoCalendario + "&full=" + (this.isIFrame() ? "true" : "false") + "&moduloAtual=taxpackage",
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
			
			onFiltrarListagemEmpresas : function () {
               this._filterDialog.open();             
            }
		});
	}
);