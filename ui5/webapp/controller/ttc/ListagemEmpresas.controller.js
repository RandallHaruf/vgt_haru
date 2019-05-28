sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/jQueryMask",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, JSONModel, NodeAPI, JQueryMask, Constants, Utils) {
		"use strict";

		BaseController.extend("ui5ns.ui5.controller.ttc.ListagemEmpresas", {

			onInit: function () {
				//sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR"); // força formatação de números a PT-BR

				this.setModel(new JSONModel());

				this.getRouter().getRoute("ttcListagemEmpresas").attachPatternMatched(this._onRouteMatched, this);
			},

            onBaixarModeloImport: function (oEvent) {
				window.location = Constants.urlBackend + "TTC/DownloadModeloImport";
			},
            
			onTrocarAnoCalendario: function (oEvent) {
				this._atualizarDados();
			},

			onSelecionarEmpresa: function (oEvent) {
				this.setBusy(this.byId("tabelaEmpresas"), true);

				var oEmpresaSelecionada = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				var sIdAnoCalendarioSelecionado = this.getModel().getProperty("/AnoCalendarioSelecionado");
				var nomeUsuario = this.getModel().getProperty("/NomeUsuario");

				this.getRouter().navTo("ttcResumoTrimestre", {
					oEmpresa: this.toURIComponent(oEmpresaSelecionada),
					idAnoCalendario: this.toURIComponent(sIdAnoCalendarioSelecionado),
					nomeUsuario: this.toURIComponent(nomeUsuario)
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
				var usuario = this.fromURIComponent(oEvent.getParameter("arguments").parametros).nomeUsuario;

				that.getModel().setProperty("/AnoCalendarioSelecionado", parametro);
				that.getModel().setProperty("/NomeUsuario", usuario);

				NodeAPI.listarRegistros("DominioAnoCalendario", function (response) {
					if (response) {
						that.getModel().setProperty("/DominioAnoCalendario", response);

						that._atualizarDados();
					}
				});
			},

			_atualizarDados: function () {
				var that = this;
				
				if (true) { // Condicao para reconstruir, normalmente ao vir da view de seleção de módulo
                    Utils.criarDialogFiltro("tabelaEmpresas", [{
						text: this.getResourceBundle().getText("viewGeralEmpresa"),
						applyTo: 'id_empresa',
						items: {
							loadFrom: 'DeepQuery/Empresa?moduloAtual=ttc',
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


				var sIdAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado");

				this.byId("tabelaEmpresas").setBusyIndicatorDelay(100);
				this.byId("tabelaEmpresas").setBusy(true);

				NodeAPI.listarRegistros("ResumoEmpresaTTC?anoCalendario=" + sIdAnoCalendario + "&full=" + (this.isIFrame() ? "true" : "false") + "&moduloAtual=ttc",
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
			},
			
			onFiltrarListagemEmpresas : function () {
               this._filterDialog.open();             
            }
		});
	}
);