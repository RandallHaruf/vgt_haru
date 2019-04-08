sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"ui5ns/ui5/model/formatter",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/model/Constants"
	],
	function (BaseController, JSONModel, formatter, NodeAPI, Constants) {
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
					idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
				};

				this.getRouter().navTo("taxPackageResumoTrimestre", {
					parametros: JSON.stringify(oParametros)
				});
			},

			_onRouteMatched: function (oEvent) {
				this.setBusy(this.byId("tabelaEmpresas"), false);

				if (this.isIFrame()) {
					this.mostrarAcessoRapidoInception();
				}

				var that = this;
				var parametro = JSON.parse(oEvent.getParameter("arguments").parametros).idAnoCalendario;

				NodeAPI.listarRegistros("DominioAnoCalendario", function (response) {
					if (response) {
						that.getModel().setProperty("/DominioAnoCalendario", response);
						that.getModel().setProperty("/AnoCalendarioSelecionado", parametro);
						that._atualizarDados();
					}
				});
			},

			_atualizarDados: function () {
				var sIdAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado");

				var that = this;

				this.byId("tabelaEmpresas").setBusyIndicatorDelay(100);
				this.byId("tabelaEmpresas").setBusy(true);

				NodeAPI.listarRegistros(
					"TaxPackageListagemEmpresas?anoCalendario=" + sIdAnoCalendario + "&full=" + (this.isIFrame() ? "true" : "false"),
					function (response) {
						if (response && response.success) {
							for (var i = 0, length = response.result.length; i < length; i++) {
								var obj = response.result[i];
								obj.iconeStatusPrimeiroPeriodo = that._resolverIcone(obj.status_primeiro_periodo);
								obj.iconeStatusSegundoPeriodo = that._resolverIcone(obj.status_segundo_periodo);
								obj.iconeStatusTerceiroPeriodo = that._resolverIcone(obj.status_terceiro_periodo);
								obj.iconeStatusQuartoPeriodo = that._resolverIcone(obj.status_quarto_periodo);
								obj.iconeStatusAnual = that._resolverIcone(obj.status_anual);
							}
							that.getModel().setProperty("/Empresa", response.result);
						}

						that.byId("tabelaEmpresas").setBusy(false);
					});
			},

			_resolverIcone: function (iStatus) {
				var sIcone;

				switch (iStatus) {
				case 1: // fechado não enviado
					sIcone = "sap-icon://decline";
					break;
				case 2: // não iniciado
					sIcone = "sap-icon://begin";
					break;
				case 3: // em andamento
					sIcone = "sap-icon://process";
					break;
				case 4: // enviado
					sIcone = "sap-icon://approvals";
					break;
				case 5: // Aguardando aprovação
					sIcone = "sap-icon://lateness";
					break;
				}

				return sIcone;
			}
		});
	}
);