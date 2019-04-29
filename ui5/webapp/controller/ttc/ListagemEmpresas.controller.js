sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/jQueryMask"
	],
	function (BaseController, JSONModel, NodeAPI, JQueryMask) {
		"use strict";

		BaseController.extend("ui5ns.ui5.controller.ttc.ListagemEmpresas", {

			onInit: function () {
				//sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR"); // força formatação de números a PT-BR

				this.setModel(new JSONModel());

				this.getRouter().getRoute("ttcListagemEmpresas").attachPatternMatched(this._onRouteMatched, this);
			},

			onTrocarAnoCalendario: function (oEvent) {
				this._atualizarDados();
			},

			onSelecionarEmpresa: function (oEvent) {
				this.setBusy(this.byId("tabelaEmpresas"), true);

				var oEmpresaSelecionada = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				var sIdAnoCalendarioSelecionado = this.getModel().getProperty("/AnoCalendarioSelecionado");

				this.getRouter().navTo("ttcResumoTrimestre", {
					oEmpresa: this.toURIComponent(oEmpresaSelecionada),
					idAnoCalendario: this.toURIComponent(sIdAnoCalendarioSelecionado)
				});
			},

			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			_onRouteMatched: function (oEvent) {
				var that = this;

				if (this.isIFrame()) {
					this.mostrarAcessoRapidoInception();
				}

				var parametro = this.fromURIComponent(oEvent.getParameter("arguments").parametros).idAnoCalendario;

				that.getModel().setProperty("/AnoCalendarioSelecionado", parametro);

				NodeAPI.listarRegistros("DominioAnoCalendario", function (response) {
					if (response) {
						that.getModel().setProperty("/DominioAnoCalendario", response);

						that._atualizarDados();
					}
				});
			},

			_atualizarDados: function () {
				var that = this;

				var sIdAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado");

				this.byId("tabelaEmpresas").setBusyIndicatorDelay(100);
				this.byId("tabelaEmpresas").setBusy(true);

				NodeAPI.listarRegistros("ResumoEmpresaTTC?anoCalendario=" + sIdAnoCalendario + "&full=" + (this.isIFrame() ? "true" : "false"),
					function (response) {
						if (response) {
							for (var i = 0; i < response.length; i++) {
								response[i].collected = (response[i].collected ? parseInt(response[i].collected, 10) : 0);
								response[i].total = (response[i].total ? parseInt(response[i].total, 10) : 0);
								response[i].borne = (response[i].borne ? parseInt(response[i].borne, 10) : 0);
							}
							that.getModel().setProperty("/Empresa", response);
						}

						that.byId("tabelaEmpresas").setBusy(false);
					});
			}
		});
	}
);