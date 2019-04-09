sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/lib/Arquivo"
	],
	function (BaseController, NodeAPI, Validador, Utils, Arquivo) {
		return BaseController.extend("ui5ns.ui5.controller.admin.ListaArquivosComplianceBeps", {

			onInit: function () {
				var that = this;

				that.setModel(new sap.ui.model.json.JSONModel({
					FiltroTipoObrigacao: [],
					FiltroEmpresa: [],
					FiltroNomeObrigacao: [],
					FiltroAnoFiscal: [],
					ValorFiltroTipoObrigacao: [],
					ValorFiltroEmpresa: [],
					ValorFiltroNomeObrigacao: [],
					ValorFiltroAnoFiscal: [],
					ValorFiltroNomeArquivo: "",
					objetos: []
				}));

				this.byId("paginaListagem").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarObjetos();
					}
				});
			},

			onBaixarArquivo: function (oEvent) {
				var that = this,
					oButton = oEvent.getSource(),
					oArquivo = oEvent.getSource().getBindingContext().getObject();

				oArquivo.btnDownloadEnabled = false;
				this.setBusy(oButton, true);

				Arquivo.download("DownloadDocumento?arquivo=" + oArquivo.id_documento)
					.then(function (response) {
						Arquivo.salvar(response[0].nome_arquivo, response[0].mimetype, response[0].dados_arquivo.data);
						oArquivo.btnDownloadEnabled = true;
						that.setBusy(oButton, false);
						that.getModel().refresh();
					})
					.catch(function (err) {
						sap.m.MessageToast.show(that.getResourceBundle().getText("ViewGeralErrSelecionarArquivo") + oArquivo.nome_arquivo);
						oArquivo.btnDownloadEnabled = true;
						that.setBusy(oButton, false);
						that.getModel().refresh();
					});
			},
			
			onAbrirConfiguracaoFiltro: function (oEvent) {
				var that = this;
				
				if (!this._oFilterDialog) {
					var oFilterDialog = new sap.m.ViewSettingsDialog();
				
					oFilterDialog.attachConfirm(function (event) {
						that._onConfirmarFiltroArquivos(event);
					});
					
					var oFilterItemEmpresa = new sap.m.ViewSettingsFilterItem({
						text: "{i18n>viewGeralEmpresa}",
						key: "filtroEmpresa",
						multiSelect: true
					});
					
					oFilterItemEmpresa.bindItems({
						path: "/FiltroEmpresa",
						template: new sap.m.ViewSettingsItem({ text: "{nome}", key: "{id_empresa}" })
					});
					
					oFilterDialog.addFilterItem(oFilterItemEmpresa);
					
					var oFilterItemTipo = new sap.m.ViewSettingsFilterItem({
						text: "{i18n>viewArquivosAdminTipoObrigacao}",
						key: "filtroTipo",
						multiSelect: true
					});
					
					oFilterItemTipo.bindItems({
						path: "/FiltroTipoObrigacao",
						template: new sap.m.ViewSettingsItem({ text: "{tipo}", key: "{id_dominio_obrigacao_acessoria_tipo}" })
					});
					
					oFilterDialog.addFilterItem(oFilterItemTipo);
					
					var oFilterItemNomeObrigacao = new sap.m.ViewSettingsFilterItem({
						text: "{i18n>viewComplianceListagemObrigacoesNomeObrigacao}",
						key: "filtroNomeObrigacao",
						multiSelect: true
					});
					
					oFilterItemNomeObrigacao.bindItems({
						path: "/FiltroNomeObrigacao",
						template: new sap.m.ViewSettingsItem({ text: "{nome}", key: "{nome}" })
					});
					
					oFilterDialog.addFilterItem(oFilterItemNomeObrigacao);
					
					var oFilterAnoFiscal = new sap.m.ViewSettingsFilterItem({
						text: "{i18n>viewArquivosAdminAnoFiscal}",
						key: "filtroAnoFiscal",
						multiSelect: true
					});
					
					oFilterAnoFiscal.bindItems({
						path: "/FiltroAnoFiscal",
						template: new sap.m.ViewSettingsItem({ text: "{ano_fiscal}", key: "{id_dominio_ano_fiscal}" })
					});
					
					oFilterDialog.addFilterItem(oFilterAnoFiscal);
					
					this.getView().addDependent(oFilterDialog);
					
					this._oFilterDialog = oFilterDialog;
				}
				
				this._oFilterDialog.open();
			},
			
			_listarArquivos: function () {
				var that = this, 
					aValorFiltroEmpresa = this.getModel().getProperty("/ValorFiltroEmpresa"),
					aValorFiltroTipoObrigacao = this.getModel().getProperty("/ValorFiltroTipoObrigacao")
					aValorFiltroNomeObrigacao = this.getModel().getProperty("/ValorFiltroNomeObrigacao"),
					aValorFiltroAnoFiscal = this.getModel().getProperty("/ValorFiltroAnoFiscal"),
					sValorFiltroNomeArquivo = this.getModel().getProperty("/ValorFiltroNomeArquivo");
				
				this.setBusy(this.byId("tabelaObjetos"), true);
				
				var oQueryString = {};
				
				if (aValorFiltroEmpresa && aValorFiltroEmpresa.length) {
					oQueryString.empresa = JSON.stringify(aValorFiltroEmpresa);
				}
				
				if (aValorFiltroTipoObrigacao && aValorFiltroTipoObrigacao.length) {
					oQueryString.tipo = JSON.stringify(aValorFiltroTipoObrigacao);
				}
				
				if (aValorFiltroNomeObrigacao && aValorFiltroNomeObrigacao.length) {
					oQueryString.nomeObrigacao = JSON.stringify(aValorFiltroNomeObrigacao);
				}
				
				if (aValorFiltroAnoFiscal && aValorFiltroAnoFiscal.length) {
					oQueryString.anoFiscal = JSON.stringify(aValorFiltroAnoFiscal);
				}
				
				if (sValorFiltroNomeArquivo) {
					oQueryString.nomeArquivo = sValorFiltroNomeArquivo;
				}
				
				// Não realiza filtro por empresa do usuário logado
				oQueryString.full = true;
				
				NodeAPI.pListarRegistros("DeepQuery/Documento", oQueryString)
					.then(function (res) {
						that.getModel().setProperty("/objetos", res.result);	
						// Carrega o filtro de nome de obrigação apenas na listagem geral (evita que as opções desapareçam)
						if (!sValorFiltroNomeArquivo 
							&& !aValorFiltroEmpresa.length 
							&& !aValorFiltroTipoObrigacao.length
							&& !aValorFiltroNomeObrigacao.length
							&& !aValorFiltroAnoFiscal.length) {
							that._carregarFiltroNomeObrigacao();
						}
						that.setBusy(that.byId("tabelaObjetos"), false);
					});	
			},
			
			_carregarFiltroNomeObrigacao: function () {
				var aDoc = this.getModel().getProperty("/objetos");	
				
				var distinctResult = aDoc.reduce(function (distinctObject, element) {
					if (distinctObject.strings.indexOf(element.nome_obrigacao) === -1) {
						distinctObject.strings.push(element.nome_obrigacao);
						distinctObject.objects.push({ nome: element.nome_obrigacao });
					}
					return distinctObject;
				}, { strings: [], objects: [] });
				
				this.getModel().setProperty("/FiltroNomeObrigacao", Utils.orderByArrayParaBox(distinctResult.objects, "nome"));
			},
			
			_onConfirmarFiltroArquivos: function (oEvent) {
				var aFiltroEmpresa = this.getModel().getProperty("/ValorFiltroEmpresa"),
					aFiltroTipoObrigacao = this.getModel().getProperty("/ValorFiltroTipoObrigacao"),
					aFiltroNomeObrigacao = this.getModel().getProperty("/ValorFiltroNomeObrigacao"),
					aFiltroAnoFiscal = this.getModel().getProperty("/ValorFiltroAnoFiscal");
					
				// Reseta os valores de filtros anteriores
				aFiltroEmpresa.length = 0;
				aFiltroTipoObrigacao.length = 0;
				aFiltroNomeObrigacao.length = 0;
				aFiltroAnoFiscal.length = 0;
				
				// Preenche os novos valores de filtro
				if (oEvent.getParameter("filterItems") && oEvent.getParameter("filterItems").length) {
					for (var i = 0, length = oEvent.getParameter("filterItems").length; i < length; i++) {
						switch (oEvent.getParameter("filterItems")[i].getParent().getKey()) {
							case "filtroEmpresa":
								aFiltroEmpresa.push(oEvent.getParameter("filterItems")[i].getKey());
								break;
							case "filtroTipo":
								aFiltroTipoObrigacao.push(oEvent.getParameter("filterItems")[i].getKey());
								break;
							case "filtroNomeObrigacao":
								aFiltroNomeObrigacao.push(oEvent.getParameter("filterItems")[i].getKey());
								break;
							case "filtroAnoFiscal":
								aFiltroAnoFiscal.push(oEvent.getParameter("filterItems")[i].getKey());
								break;
						}
					}
				}
				
				this._listarArquivos();
			},
			
			_carregarObjetos: function () {
				var that = this;
				
				this._limparFiltros();
				this._listarArquivos();
				 
				 //FiltroTipoObrigacao FiltroEmpresa FiltroNomeObrigacao FiltroAnoFiscal
				 
				NodeAPI.pListarRegistros("DominioObrigacaoAcessoriaTipo")
					.then(function (res) {
						that.getModel().setProperty("/FiltroTipoObrigacao", Utils.orderByArrayParaBox(res, "tipo"));
					});
					
				NodeAPI.pListarRegistros("Empresa?full=true")
					.then(function (res) {
						that.getModel().setProperty("/FiltroEmpresa", Utils.orderByArrayParaBox(res, "nome"));
					});
					
				NodeAPI.pListarRegistros("DominioAnoFiscal")
					.then(function (res) {
						that.getModel().setProperty("/FiltroAnoFiscal", res);
					});

				/*var that = this;
				that.getModel().setProperty("/objetos", null);
				
				if(this.getModel().getProperty("PrimeiraVez") == 0 || this.getModel().getProperty("PrimeiraVez") == undefined || this.getModel().getProperty("PrimeiraVez") == ""){
					this.getModel().setProperty("PrimeiraVez", 1);
					NodeAPI.listarRegistros("Empresa?full=true", function (response) {
						that.getModel().setProperty("/Empresas", response);
					});
					NodeAPI.listarRegistros("ModeloObrigacao", function (response) {
						that.getModel().setProperty("/Obrigacoes", response);
					});
					NodeAPI.listarRegistros("DominioAnoFiscal", function (response) {
						that.getModel().setProperty("/AnosFiscais", response);
					});
				}*/
				
			    /*var AnoFiscal = this.getModel().getProperty("/IdAnosFiscaisSelecionadas")  ? "&anoFiscal=" + JSON.parse(this.getModel().getProperty("/IdAnosFiscaisSelecionadas")) : "";
				var Empresa = this.getModel().getProperty("/IdEmpresasSelecionadas")  ? "&idEmpresa=" + JSON.parse(this.getModel().getProperty("/IdEmpresasSelecionadas")) : "";
				var NomeObrigacao = this.getModel().getProperty("/IdNomeObrigacoesSelecionadas")  ? "&idObrigacoes=" + JSON.parse(this.getModel().getProperty("/IdNomeObrigacoesSelecionadas")) : "";
				
				that.setBusy(that.byId("paginaListagem"), true);
				NodeAPI.listarRegistros("DeepQuery/ListarTodosDocumentos?ListarSomenteEmVigencia=1&IndAtivoRel=1" + AnoFiscal + Empresa + NomeObrigacao, function (response) {
					var aResponse = response;
					for (var i = 0, length = aResponse.length; i < length; i++) {
						aResponse[i]["Tipo"] = aResponse[i]["fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo"] == 1 ? "Beps" : "Compliance";
					}
					that.getModel().setProperty("/objetos", aResponse);
					that.setBusy(that.byId("paginaListagem"), false);
				});*/
			},
			
			_limparFiltros: function () {
				var aFiltroEmpresa = this.getModel().getProperty("/ValorFiltroEmpresa"),
					aFiltroTipoObrigacao = this.getModel().getProperty("/ValorFiltroTipoObrigacao"),
					aFiltroNomeObrigacao = this.getModel().getProperty("/ValorFiltroNomeObrigacao"),
					aFiltroAnoFiscal = this.getModel().getProperty("/ValorFiltroAnoFiscal");
					
				// Reseta os valores de filtros anteriores
				aFiltroEmpresa.length = 0;
				aFiltroTipoObrigacao.length = 0;
				aFiltroNomeObrigacao.length = 0;
				aFiltroAnoFiscal.length = 0;
				
				this.getModel().setProperty("/ValorFiltroNomeArquivo", "");
				
				if (this._oFilterDialog) {
					// Se desfaz do dialog para limpar as seleções
					this.getView().removeDependent(this._oFilterDialog);
					this._oFilterDialog.destroy();
					this._oFilterDialog = null;
				}
			}
		});
	}
);