sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/models",
		"sap/ui/model/Filter",
		"sap/m/MessageToast",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/lib/Arquivo",
		"sap/m/MessageBox",
		"ui5ns/ui5//model/Constants",
		"ui5ns/ui5//model/enums/PerfilUsuario"
	],
	function (BaseController, models, Filter, MessageToast, NodeAPI, Utils, Arquivo, MessageBox, Constants, PerfilUsuario) {

		return BaseController.extend("ui5ns.ui5.controller.compliance.ListagemObrigacoes", {

			onInit: function (oEvent) {
				this.setModel(new sap.ui.model.json.JSONModel({
					RepositorioDocumento: [],
					FiltroEmpresa: [],
					ValorFiltroEmpresa: [],
					FiltroNomeObrigacao: [],
					ValorFiltroNomeObrigacao: [],
					ValorFiltroNomeArquivo: "",
					isUser: false,
					FiltrosTabela: {}
				}));
				
				var hoje = new Date();
				this.getModel().setProperty("/startDate", new Date(JSON.stringify(hoje.getFullYear()), "0", "1"));

				if (this.isVisualizacaoUsuario()) {
					this.getRouter().getRoute("complianceListagemObrigacoes").attachPatternMatched(this._onRouteMatched, this);
				}
			},

			_onRouteMatched: function (oEvent) {
				var that = this;
				var oEventoInicial = jQuery.extend(true, {}, oEvent);
				
				this.setBusy(this.getView(), false);

				fetch(Constants.urlBackend + "verifica-auth", {
						credentials: "include"
					})
					.then((res) => {
						res.json()
							.then((response) => {

								if (response.success) {
									if (this.isVisualizacaoUsuario() && (response.nivelAcesso == PerfilUsuario.USER || response.nivelAcesso == PerfilUsuario.USER_ADMIN)) {
										that.getModel().setProperty("/isUser", true);
									}
									continuarRouteMatched(oEventoInicial);
								} else {
									sap.m.MessageToast.show(response.error.msg);
									that.getRouter().navTo("login");
								}
							})
							.catch((err) => {
								sap.m.MessageToast.show(err);
								that.getRouter().navTo("login");
							});
					})
					.catch((err) => {
						sap.m.MessageToast.show(err);
						that.getRouter().navTo("login");
					});

				var continuarRouteMatched = function (event) {
					var anoCalendario;
					var nomeUsuario = '';
					var empresa = '';
					var atualizarDados = true;

					if (that.isIFrame()) {
						that.mostrarAcessoRapidoInception();
						that.getModel().setProperty("/isIFrame", true);

						anoCalendario = event.params.idAnoCalendarioCorrente;
						atualizarDados = event.params.atualizarDados;
						
						event.params.atualizarDados = false;
						
						that._inceptionParams = event;
					} else {
						that.getModel().setProperty("/isIFrame", false);

						anoCalendario = that.fromURIComponent(event.getParameter("arguments").parametros).idAnoCalendario;
						nomeUsuario = that.fromURIComponent(event.getParameter("arguments").parametros).nomeUsuario;
						empresa = that.fromURIComponent(event.getParameter("arguments").parametros).idEmpresaCalendario;
						
						// Verificao apenas para garantir o boolean em caso do parametro não existir,
						// pois ele apenas é passado ao vir da pagina de selecao de módulo
						atualizarDados = that.fromURIComponent(event.getParameter("arguments").parametros).atualizarDados;
						atualizarDados = atualizarDados ? atualizarDados : false;
					}

					that.getModel().setProperty('/IsAreaUsuario', !that.isIFrame());
					that.getModel().setProperty("/RepositorioDocumento", []);
					that.getModel().setProperty("/Linguagem", sap.ui.getCore().getConfiguration().getLanguage().toUpperCase());
					that.getModel().setProperty("/IdEmpresaSelecionado", empresa);
					that.getModel().setProperty("/AnoCalendarioSelecionado", anoCalendario);
					that.getModel().setProperty("/NomeUsuario", nomeUsuario);
					
					if (atualizarDados || !that._filterDialog) {
						that.getModel().setProperty('/FiltrosTabela', {});
						that.getModel().setProperty('/FiltrosTabela/anoCalendario', anoCalendario);
					
						that._montarFiltro();
						that._atualizarRespostasEContador();
					}
					else {
						that._atualizarRespostas();
					}
				}
			},

			_montarFiltro: function () {
				var that = this;

				var config = [{
					text: that.getResourceBundle().getText('viewGeralAnoCalendario'),
					key: 'anoCalendario',
					defaultKey: this.getModel().getProperty("/AnoCalendarioSelecionado"),
					items: {
						loadFrom: 'DeepQuery/DominioAnoCalendarioAteCorrente',
						path: '/EasyFilterAnoCalendario',
						text: 'ano_calendario',
						key: 'id_dominio_ano_calendario'
					}
				}, {
					text: that.getResourceBundle().getText('viewPaisRegião'),
					key: 'regiao',
					items: {
						loadFrom: 'DominioPaisRegiao',
						path: '/EasyFilterRegiao',
						text: 'regiao',
						key: 'id_dominio_pais_regiao'
					}
				}, {
					text: that.getResourceBundle().getText('viewRelatorioPais'),
					key: 'pais',
					items: {
						loadFrom: 'DeepQuery/Pais',
						path: '/EasyFilterPais',
						text: 'nomePais',
						key: 'id'
					}
				}, {
					text: that.getResourceBundle().getText('viewGeralEmpresa'),
					key: 'empresa',
					items: {
						loadFrom: 'Empresa?full=' + (this.isVisualizacaoAdmin() ? 'true' : 'false') + '&moduloAtual=' + (this.isVisualizacaoAdmin() ? 'beps,compliance' : 'compliance'),
						path: '/EasyFilterEmpresa',
						text: 'nome',
						key: 'id_empresa'
					}
				}];
				
				if (this.isVisualizacaoAdmin()) {
					config.push({
						text: that.getResourceBundle().getText('viewGeralTipo'),
						key: 'tipoObrigacao',
						items: {
							path: '/EasyFilterTipoObrigacao',
							text: 'tipo',
							key: 'id'
						}
					});
					
					this.getModel().setProperty('/EasyFilterTipoObrigacao', [{
						id: 1,
						tipo: 'Beps'
					}, {
						id: 2,
						tipo: 'Compliance'
					}])
				}

				Utils.criarDialogFiltroManual(config, this, function (params) {
					console.log(params);
					that.getModel().setProperty('/FiltrosTabela', params.filterSelection);
					that._atualizarRespostasEContador();
				});

				this._loadFrom().then((function (res) {
					that.getModel().setProperty("/EasyFilterAnoCalendario", res[0].sort(function (a, b) {
						return b.ano_calendario - a.ano_calendario;
					}));

					that.getModel().setProperty("/EasyFilterRegiao", Utils.orderByArrayParaBox(res[1].map(obj => {
						obj.regiao = Utils.traduzPaisRegiao(obj.id_dominio_pais_regiao, that);
						return obj;
					}), "regiao"));

					that.getModel().setProperty("/EasyFilterPais", Utils.orderByArrayParaBox(res[2].map(obj => {
						obj.nomePais = Utils.traduzDominioPais(obj.fkDominioPais, that);
						return obj;
					}), "nomePais"));
					
					that.getModel().setProperty("/EasyFilterEmpresa", res[3]);
				}));
			},

			onFiltrarListagemEmpresas: function () {
				this._filterDialog.open();
			},

			_atualizarRespostasEContador: function () {
				this._atualizarDadosComNovoFiltro(true);
			},
			
			_atualizarRespostas: function () {
				this._atualizarDadosComNovoFiltro(false);
			},

			_atualizarDadosComNovoFiltro: function (bAtualizarContador) {
				var thisController = this;

				thisController.setBusy(thisController.getView(), true);

				var aPromise = [];
				
				if (bAtualizarContador) {
					aPromise.push(thisController._pAtualizarContador());
				}
				
				aPromise.push(thisController._pAtualizarRespostas());

				Promise.all(aPromise)
					.catch(function (err) {
						console.log(err);
						thisController.showError(err);
					})
					.finally(function () {
						thisController.setBusy(thisController.getView(), false);
					});
			},

			_pAtualizarContador: function () {
				var thisController = this;

				return new Promise(function (resolve, reject) {
					var oFiltro = thisController._getFiltroSemStatus();

					NodeAPI.pListarRegistros('DeepQuery/RespostaObrigacao', oFiltro)
						.then(function (res) {
							thisController.getModel().setProperty("/Contadores", thisController._getContagem(res));
							resolve();
						})
						.catch(function (err) {
							reject(err);
						});
				});
			},

			_pAtualizarRespostas: function () {
				var thisController = this;
				
				thisController.getModel().setProperty("/Obrigacao", []);

				return new Promise(function (resolve, reject) {
					var oFiltro = thisController._getFiltroSemStatus();

					oFiltro.statusResposta = thisController._getSelecaoStatus();

					NodeAPI.pListarRegistros('DeepQuery/RespostaObrigacao', oFiltro)
						.then(function (res) {
							thisController.getModel().setProperty("/Obrigacao", thisController._traduzirRespostas(res));
							resolve();
						})
						.catch(function (err) {
							reject(err);
						});
				});
			},

			_getContagem: function (respostas) {
				var Todos = 0,
					NaoIniciada = 0,
					Aguardando = 0,
					EmAtraso = 0,
					EntregueNoPrazo = 0,
					EntregueForaPrazo = 0;

				for (var i = 0, length = respostas.length; i < length; i++) {
					switch (respostas[i]["status_obrigacao_calculado"]) {
					case 4:
						NaoIniciada++;
						break;
					case 1:
						Aguardando++;
						break;
					case 5:
						EmAtraso++;
						break;
					case 6:
						EntregueNoPrazo++;
						break;
					case 7:
						EntregueForaPrazo++;
						break;
					}
					Todos++;
				}

				return {
					modelTodos: Todos,
					modelNaoIniciada: NaoIniciada,
					modelAguardando: Aguardando,
					modelEmAtraso: EmAtraso,
					modelEntregueNoPrazo: EntregueNoPrazo,
					modelEntregueForaPrazo: EntregueForaPrazo
				};
			},

			_traduzirRespostas: function (respostas) {
				var thisController = this,
					copiaRespostas = respostas.slice();

				for (var i = 0, length = respostas.length; i < length; i++) {
					var resposta = copiaRespostas[i];

					resposta.label_prazo_entrega = resposta.prazo_entrega_calculado;

					resposta.prazo_entrega_customizado =
						(resposta.prazo_entrega_customizado !== null) ? resposta.ano_calendario + "-" + resposta.prazo_entrega_customizado.substring(5, 7) +
						"-" + resposta.prazo_entrega_customizado.substring(8, 10) : null;

					resposta.pais = Utils.traduzDominioPais(resposta["fk_dominio_pais.id_dominio_pais"], thisController);
					resposta.descricao_obrigacao_status = Utils.traduzStatusObrigacao(resposta.status_obrigacao_calculado, thisController);
					resposta.descricao = Utils.traduzPeriodo(resposta["fk_id_dominio_periodicidade.id_periodicidade_obrigacao"], thisController);
				}

				return copiaRespostas;
			},

			_getFiltroSemStatus: function () {
				var oFiltro = this.getModel().getProperty('/FiltrosTabela');

				oFiltro.full = (this.isVisualizacaoAdmin() ? 'true' : 'false');
				oFiltro.moduloAtual = (this.isVisualizacaoAdmin() ? 'beps,compliance' : 'compliance');

				if (this.isVisualizacaoUsuario()) {
					oFiltro.tipoObrigacao = 2; // força tipo compliance
				}

				return oFiltro;
			},

			_getSelecaoStatus: function () {
				var status = this.getView().byId('iconTabBarObrigacoes').getSelectedKey();
				if (status == '0') {
					status = '';
				}
				return status;
			},

			onProcurarArquivos: function (oEvent) {
				var that = this;

				if (!this._dialogProcurarArquivos) {
					var oVBox = new sap.m.VBox();

					var oToolbar = new sap.m.Toolbar();

					oToolbar.addContent(new sap.m.Input({
						placeholder: "{i18n>viewComplianceListagemObrigacoesNomeArquivo}",
						value: "{/ValorFiltroNomeArquivo}"
					}).attachChange(function (event) {
						that._listarArquivos();
					}));

					oToolbar.addContent(new sap.m.ToolbarSpacer());

					var oFilterButton = new sap.m.Button({
						icon: "sap-icon://filter",
						tooltip: "{i18n>viewGeralTooltipVisualizarOpcoesFiltro}",
						type: "Transparent"
					}).attachPress(function (event) {
						that._onFiltrarArquivos(event);
					});

					oToolbar.addContent(oFilterButton);

					var oScrollContainer = new sap.m.ScrollContainer({
						width: "100%",
						height: "500px",
						vertical: true
					});

					oVBox.addItem(oToolbar);

					var oTable = new sap.m.Table({
						id: "tabelaProcurarArquivos",
						growing: true
					});

					/* Colunas */
					oTable.addColumn(new sap.m.Column({
						hAlign: "Center",
						vAlign: "Middle"
					}).setHeader(new sap.m.Text({
						text: "{i18n>viewComplianceListagemObrigacoesNomeArquivo}"
					})));

					oTable.addColumn(new sap.m.Column({
						hAlign: "Center",
						vAlign: "Middle",
						demandPopin: true,
						minScreenWidth: "Large"
					}).setHeader(new sap.m.Text({
						text: "{i18n>viewComplianceListagemObrigacoesNomeObrigacao}"
					})));

					oTable.addColumn(new sap.m.Column({
						width: "50px"
					}));

					/* Template das células */
					var oTextNome = new sap.m.Text({
						text: "{nome_arquivo}"
					});

					var oTextObrigacao = new sap.m.Text({
						text: "{nome_obrigacao}"
					});

					var oButtonDownload = new sap.m.Button({
						icon: "sap-icon://download-from-cloud",
						type: "Accept",
						enabled: "{btnDownloadEnabled}"
					}).attachPress(function (event) {
						that._onBaixarArquivo(event);
					});

					var oTemplate = new sap.m.ColumnListItem({
						cells: [oTextNome, /*oTextTipo,*/ oTextObrigacao, oButtonDownload]
					});

					oTable.bindItems({
						path: "/RepositorioDocumento",
						template: oTemplate,
						sorter: [
							new sap.ui.model.Sorter("nome_empresa", false, true),
							new sap.ui.model.Sorter("nome_obrigacao"),
							new sap.ui.model.Sorter("nome_arquivo")
						]
					});

					oScrollContainer.addContent(oTable);

					oVBox.addItem(oScrollContainer);

					var dialog = new sap.m.Dialog({
						title: "{i18n>viewComplianceListagemObrigacoesProcurarArquivo}",
						showHeader: true,
						type: "Message",
						content: oVBox,
						endButton: new sap.m.Button({
							text: "OK",
							press: function () {
								dialog.close();
							}
						}),
						afterClose: function () {
							// dialog.destroy();
							that.getModel().setProperty("/RepositorioDocumento", []);
							that.getModel().setProperty("/ValorFiltroEmpresa", []);
							that.getModel().setProperty("/ValorFiltroNomeObrigacao", []);
							that.getModel().setProperty("/ValorFiltroNomeArquivo", "");
							that.getView().removeDependent(that._oFilterDialog);
							that._oFilterDialog = null;
						}
					}).addStyleClass("sapUiNoContentPadding");

					this.getView().addDependent(dialog);

					this._dialogProcurarArquivos = dialog;
				}

				this._dialogProcurarArquivos.open();

				this._listarArquivos();
			},

			_onFiltrarArquivos: function (oEvent) {
				var that = this;

				if (!this._oFilterDialog) {
					var oFilterDialog = new sap.m.ViewSettingsDialog();

					oFilterDialog.attachConfirm(function (event) {
						that._onConfirmarFiltroArquivos(event);
					});

					var oFilterItemEmpresa = new sap.m.ViewSettingsFilterItem({
						text: that.getResourceBundle().getText("viewGeralEmpresa"),
						key: "filtroEmpresa",
						multiSelect: true
					});

					oFilterItemEmpresa.bindItems({
						path: "/EasyFilterEmpresa",
						template: new sap.m.ViewSettingsItem({
							text: "{nome}",
							key: "{id_empresa}"
						})
					});

					oFilterDialog.addFilterItem(oFilterItemEmpresa);

					var oFilterItemNomeObrigacao = new sap.m.ViewSettingsFilterItem({
						text: that.getResourceBundle().getText("viewComplianceListagemObrigacoesNomeObrigacao"),
						key: "filtroNomeObrigacao",
						multiSelect: true
					});

					oFilterItemNomeObrigacao.bindItems({
						path: "/FiltroNomeObrigacao",
						template: new sap.m.ViewSettingsItem({
							text: "{nome}",
							key: "{nome}"
						})
					});

					oFilterDialog.addFilterItem(oFilterItemNomeObrigacao);

					this.getView().addDependent(oFilterDialog);

					this._oFilterDialog = oFilterDialog;
				}

				this._oFilterDialog.open();
			},

			_onConfirmarFiltroArquivos: function (oEvent) {
				var aFiltroEmpresa = this.getModel().getProperty("/ValorFiltroEmpresa"),
					aFiltroNomeObrigacao = this.getModel().getProperty("/ValorFiltroNomeObrigacao");

				// Reseta os valores de filtros anteriores
				aFiltroEmpresa.length = 0;
				aFiltroNomeObrigacao.length = 0;

				// Preenche os novos valores de filtro
				if (oEvent.getParameter("filterItems") && oEvent.getParameter("filterItems").length) {
					for (var i = 0, length = oEvent.getParameter("filterItems").length; i < length; i++) {
						switch (oEvent.getParameter("filterItems")[i].getParent().getKey()) {
						case "filtroEmpresa":
							aFiltroEmpresa.push(oEvent.getParameter("filterItems")[i].getKey());
							break;
						case "filtroNomeObrigacao":
							aFiltroNomeObrigacao.push(oEvent.getParameter("filterItems")[i].getKey());
							break;
						}
					}
				}

				this._listarArquivos();
			},

			_onBaixarArquivo: function (oEvent) {
				var that = this,
					oButton = oEvent.getSource(),
					oArquivo = oEvent.getSource().getBindingContext().getObject();

				oArquivo.btnDownloadEnabled = false;
				this.getModel().refresh();
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

			onFiltrar: function (oEvent) {
				this._atualizarRespostas();
			},

			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			navToListagemRequisicoes: function () {
				var oParametros = {
					empresa: this.getModel().getProperty("/IdEmpresaSelecionado"),
					anoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado"),
					nomeUsuario: this.getModel().getProperty("/NomeUsuario")
				};

				this.getRouter().navTo("complianceListagemRequisicoes", {
					parametros: this.toURIComponent(oParametros)
				});
			},

			onNovaObrigacao: function (oEvent) {
				var oParametros = {
					empresa: this.getModel().getProperty("/IdEmpresaSelecionado"),
					anoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado"),
					nomeUsuario: this.getModel().getProperty("/NomeUsuario")
				};

				this.getRouter().navTo("complianceFormularioNovaObrigacao", {
					parametros: this.toURIComponent(oParametros)
				});
			},

			//CODIGO DO CALENDARIO START--------------------
			handleAppointmentSelect: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					sSelected;
				if (oAppointment) {
					var split = oEvent.mParameters.appointment.sId.split("-");
					var oParametros = {
						Obrigacao: oEvent.getSource().mBindingInfos.rows.binding.oList[0].appointments[split[split.length - 1]].codigo,
						idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
					};
					this.getRouter().navTo("complianceFormularioDetalhesObrigacao", {
						parametros: this.toURIComponent(oParametros)

					});
				} else {
					var aAppointments = oEvent.getParameter("appointments");
					var sValue = aAppointments.length + " Appointments selected";
					MessageBox.show(sValue);
				}
			},
			//CODIGO DO CALENDARIO END--------------------

			onDetalharObrigacao: function (oEvent) {
				var thisController = this;
				
				thisController.setBusy(thisController.getView(), true);
				
				var oParametros = {
					Obrigacao: this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()),
					idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado"),
					nomeUsuario: this.getModel().getProperty("/NomeUsuario")
				};
				
				if (this.isVisualizacaoUsuario()) {
					this.getRouter().navTo("complianceFormularioDetalhesObrigacao", {
						parametros: this.toURIComponent(oParametros)
					});
				}
				else {
					oParametros._targetInceptionParams = this._inceptionParams;
					
					this._inceptionParams.router.navToDetalhes(oParametros);
				}
			},

			_carregarFiltroNomeObrigacao: function () {
				var aDoc = this.getModel().getProperty("/RepositorioDocumento");

				var distinctResult = aDoc.reduce(function (distinctObject, element) {
					if (distinctObject.strings.indexOf(element.nome_obrigacao) === -1) {
						distinctObject.strings.push(element.nome_obrigacao);
						distinctObject.objects.push({
							nome: element.nome_obrigacao
						});
					}
					return distinctObject;
				}, {
					strings: [],
					objects: []
				});

				this.getModel().setProperty("/FiltroNomeObrigacao", distinctResult.objects);
			},

			_listarArquivos: function () {
				var that = this,
					aValorFiltroEmpresa = this.getModel().getProperty("/ValorFiltroEmpresa"),
					aValorFiltroNomeObrigacao = this.getModel().getProperty("/ValorFiltroNomeObrigacao"),
					sValorFiltroNomeArquivo = this.getModel().getProperty("/ValorFiltroNomeArquivo");

				this.setBusy(sap.ui.getCore().byId("tabelaProcurarArquivos"), true);

				var oQueryString = {};

				if (aValorFiltroEmpresa && aValorFiltroEmpresa.length) {
					oQueryString.empresa = JSON.stringify(aValorFiltroEmpresa);
				}
				
				if (aValorFiltroNomeObrigacao && aValorFiltroNomeObrigacao.length) {
					oQueryString.nomeObrigacao = JSON.stringify(aValorFiltroNomeObrigacao);
				}

				if (sValorFiltroNomeArquivo) {
					oQueryString.nomeArquivo = sValorFiltroNomeArquivo;
				}

				// Fixa a pesquisa por documentos relacionados a obrigações do tipo COMPLIANCE
				oQueryString.tipo = JSON.stringify([2]);
				oQueryString.full = this.isIFrame() ? true : false;

				NodeAPI.pListarRegistros("DeepQuery/Documento", oQueryString)
					.then(function (res) {
						that.getModel().setProperty("/RepositorioDocumento", res.result);
						// Carrega o filtro de nome de obrigação apenas na listagem geral (evita que as opções desapareçam)
						if (!sValorFiltroNomeArquivo && !aValorFiltroEmpresa.length && !aValorFiltroNomeObrigacao.length) {
							that._carregarFiltroNomeObrigacao();
						}
						that.setBusy(sap.ui.getCore().byId("tabelaProcurarArquivos"), false);
					});
			}
		});
	}
);