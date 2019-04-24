sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/models",
		"sap/ui/model/Filter",
		"sap/m/MessageToast",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/lib/Arquivo",
		"sap/m/MessageBox"
	],
	function (BaseController, models, Filter, MessageToast, NodeAPI, Utils, Arquivo,MessageBox) {
		return BaseController.extend("ui5ns.ui5.controller.compliance.ListagemObrigacoes", {

			onInit: function (oEvent) {
				this.setModel(models.createViewModelParaComplianceListagemObrigacoes(), "viewModel");
				this.setModel(new sap.ui.model.json.JSONModel({
					RepositorioDocumento: [],
					FiltroEmpresa: [],
					ValorFiltroEmpresa: [],
					//FiltroTipoObrigacao: [],
					FiltroNomeObrigacao: [],
					ValorFiltroNomeObrigacao: [],
					ValorFiltroNomeArquivo: ""
				}));
				var hoje = new Date();
				this.getModel().setProperty("/startDate",new Date(JSON.stringify(hoje.getFullYear()),"0","1"));
				this.getRouter().getRoute("complianceListagemObrigacoes").attachPatternMatched(this._onRouteMatched, this);
			},

			_onRouteMatched: function (oEvent) {
				var that = this;
				
				if (this.isIFrame()) {
					this.mostrarAcessoRapidoInception();
					this._parametroInception = "full=true";
					that.getModel().setProperty("/isIFrame",true);
				} else {
					this._parametroInception = "full=false";
					that.getModel().setProperty("/isIFrame",false);
				}
				
				/*NodeAPI.pListarRegistros("DominioObrigacaoAcessoriaTipo")
					.then(function (res) {
						that.getModel().setProperty("/FiltroTipoObrigacao", res);
					});*/
				
				this.getModel().setProperty("/RepositorioDocumento", []);
				this.getModel().setProperty("/Linguagem", sap.ui.getCore().getConfiguration().getLanguage().toUpperCase());
				this.carregarFiltroEmpresa();
				this.carregarFiltroAnoCalendario();
				this.getModel().setProperty("/IdEmpresaSelecionado", JSON.parse(oEvent.getParameter("arguments").parametros).idEmpresaCalendario);
				this.getModel().setProperty("/AnoCalendarioSelecionado", JSON.parse(oEvent.getParameter("arguments").parametros).idAnoCalendario);
				//this._atualizarDados();
				this._atualizarDadosFiltrado();
				this.setBusy(this.byId("tabelaObrigacoes"), false);
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
					
					/*oTable.addColumn(new sap.m.Column({
						vAlign: "Middle",
						demandPopin: true,
						minScreenWidth: "Large"
					}).setHeader(new sap.m.Text({
						text: "Tipo"
					})));*/
					
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
					
					/*var oTextTipo = new sap.m.Text({
						text: "{tipo}"
					});*/
					
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
							//new sap.ui.model.Sorter("tipo"),
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
							//dialog.destroy();
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
					
					/*var oFilterItemTipo = new sap.m.ViewSettingsFilterItem({
						text: "Tipo",
						key: "filtroTipo",
						multiSelect: true
					});
					
					oFilterItemTipo.bindItems({
						path: "/FiltroTipoObrigacao",
						template: new sap.m.ViewSettingsItem({ text: "{tipo}", key: "{id_dominio_obrigacao_acessoria_tipo}" })
					});
					
					oFilterDialog.addFilterItem(oFilterItemTipo);*/
					
					var oFilterItemEmpresa = new sap.m.ViewSettingsFilterItem({
						text: that.getResourceBundle().getText("viewGeralEmpresa"),
						key: "filtroEmpresa",
						multiSelect: true
					});
					
					oFilterItemEmpresa.bindItems({
						path: "/FiltroEmpresa",
						template: new sap.m.ViewSettingsItem({ text: "{nome}", key: "{id_empresa}" })
					});
					
					oFilterDialog.addFilterItem(oFilterItemEmpresa);
					
					var oFilterItemNomeObrigacao = new sap.m.ViewSettingsFilterItem({
						text: that.getResourceBundle().getText("viewComplianceListagemObrigacoesNomeObrigacao"),
						key: "filtroNomeObrigacao",
						multiSelect: true
					});
					
					oFilterItemNomeObrigacao.bindItems({
						path: "/FiltroNomeObrigacao",
						template: new sap.m.ViewSettingsItem({ text: "{nome}", key: "{nome}" })
					});
					
					oFilterDialog.addFilterItem(oFilterItemNomeObrigacao);
					
					this.getView().addDependent(oFilterDialog);
					
					this._oFilterDialog = oFilterDialog;
				}
				
				this._oFilterDialog.open();
			},

			_onConfirmarFiltroArquivos: function (oEvent) {
				var aFiltroEmpresa = this.getModel().getProperty("/ValorFiltroEmpresa"),
					//aFiltroTipo = [],
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
							/*case "filtroTipo":
								aFiltroTipo.push(oEvent.getParameter("filterItems")[i].getKey());
								break;*/
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
				if (!this._filtrosRapidos) {
					var that = this;
					this._filtrosRapidos = {
						naoIniciada: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro2"))],
						emAndamento: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro3"))],
						emAtraso: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro4"))],
						entregueNoPrazo: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro5"))],
						entregueForaPrazo: [new Filter("status", "EQ", that.getResourceBundle().getText("viewComplianceListagemObrigacoesTextoFiltro6"))]
					};
				}

				var sKey = oEvent.getParameter("key");
				var oFilter = this._filtrosRapidos[sKey];
				var oBinding = this.byId("tabelaObrigacoes").getBinding("items");

				oBinding.filter(oFilter);

				var oAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado") ? this.getModel().getProperty(
					"/AnoCalendarioSelecionado") : "";
				var CampoAnoEstaPreenchido = (oAnoCalendario ? "&ListarAteAnoAtualMaisUm=1" : "");
				this._atualizarDadosFiltrado();
				/*if (!!CampoAnoEstaPreenchido) {
					this._atualizarDadosFiltrado();
				}
				else{
					this._atualizarDados();
				}*/
			},

			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			navToListagemRequisicoes: function () {
				var oParametros = {
					empresa: this.getModel().getProperty("/IdEmpresaSelecionado"),
					anoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
				};

				this.getRouter().navTo("complianceListagemRequisicoes", {
					parametros: JSON.stringify(oParametros)
				});
			},

			onNavToReport: function () {
				this.getRouter().navTo("complianceRelatorio");
			},

			onTerminouAtualizar: function (oEvent) {
				//MessageToast.show("Atualizar contadores");	
				//this._atualizarDados();
				/*var existeEmpresa = this.getModel().getProperty("/AnoCalendarioSelecionado") ? this.getModel().getProperty(
					"/AnoCalendarioSelecionado") : "";
				if () {
					
				}*/

			},

			onTrocarAnoCalendario: function (oEvent) {
				//MessageToast.show("Filtrar tabela por ano calendário: " + oEvent.getSource().getSelectedItem().getText());	
				this._atualizarDadosFiltrado();
			},

			onTrocarEmpresa: function (oEvent) {
				//MessageToast.show("Filtrar tabela por empresas: " + oEvent.getSource().getSelectedItem().getText());
				this._atualizarDadosFiltrado();
			},

			onBuscarDocumentos: function (oEvent) {
				this.getRouter().navTo("complianceRepositorioDocumentos");
			},

			onNovaObrigacao: function (oEvent) {
				var oParametros = {
					empresa: this.getModel().getProperty("/Empresa"),
					anoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
				};
				
				this.getRouter().navTo("complianceFormularioNovaObrigacao", {
					parametros: JSON.stringify(oParametros)
				});
			},
			
			//CODIGO DO CALENDARIO START--------------------
			//----------------------------------------------
			handleAppointmentSelect: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					sSelected;
				if (oAppointment) {
					/*sSelected = oAppointment.getSelected() ? "selected" : "deselected";
					MessageBox.show("'" + oAppointment.getTitle() + "' " + sSelected + ". \n Selected appointments: " + this.byId("PC1").getSelectedAppointments().length);*/
					var split = oEvent.mParameters.appointment.sId.split("-");
					var oParametros = {
						Obrigacao: oEvent.getSource().mBindingInfos.rows.binding.oList[0].appointments[split[split.length-1]].codigo,
						idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
					};		
					this.getRouter().navTo("complianceFormularioDetalhesObrigacao", {
						parametros: JSON.stringify(oParametros)
	
					});					
				} else {
					var aAppointments = oEvent.getParameter("appointments");
					var sValue = aAppointments.length + " Appointments selected";
					MessageBox.show(sValue);
				}
			},
			//----------------------------------------------
			//CODIGO DO CALENDARIO END--------------------
			
			onDetalharObrigacao: function (oEvent) {
				this.setBusy(this.byId("tabelaObrigacoes"), true);
				var oParametros = {
					Obrigacao: this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()),
					idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
				};

				this.getRouter().navTo("complianceFormularioDetalhesObrigacao", {
					parametros: JSON.stringify(oParametros)

				});
			},

			onNavBack: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			_carregarFiltroNomeObrigacao: function () {
				var aDoc = this.getModel().getProperty("/RepositorioDocumento");	
				
				var distinctResult = aDoc.reduce(function (distinctObject, element) {
					if (distinctObject.strings.indexOf(element.nome_obrigacao) === -1) {
						distinctObject.strings.push(element.nome_obrigacao);
						distinctObject.objects.push({ nome: element.nome_obrigacao });
					}
					return distinctObject;
				}, { strings: [], objects: [] });
				
				this.getModel().setProperty("/FiltroNomeObrigacao", distinctResult.objects);
			},

			carregarFiltroEmpresa: function () {
				var that = this;
				NodeAPI.listarRegistros("Empresa?" + this._parametroInception, function (response) {
					response = Utils.orderByArrayParaBox(response, "nome");
					that.getModel().setProperty("/FiltroEmpresa", response.concat());
					response.unshift({
						id: null,
						nome: that.getResourceBundle().getText("viewGeralTodos")
					});
					that.getModel().setProperty("/Empresa", response);
				});
			},

			carregarFiltroAnoCalendario: function () {
				var that = this;
				NodeAPI.listarRegistros("DeepQuery/DominioAnoCalendarioAteCorrente", function (response) {
					response.unshift({
						id: null,
						ano_calendario: that.getResourceBundle().getText("viewGeralTodos")
					});
					that.getModel().setProperty("/DominioAnoCalendario", response);
				});
			},

			_atualizarDados: function () {
				var that = this;

				var oEmpresa = this.getModel().getProperty("/IdEmpresaSelecionado") ? this.getModel().getProperty("/IdEmpresaSelecionado") : "";
				var oAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado") ? this.getModel().getProperty(
					"/AnoCalendarioSelecionado") : "";
				var oStatus = this.getView().byId('iconTabBarObrigacoes').getSelectedKey();
				if (oStatus == '0') {
					oStatus = '';
				}

				NodeAPI.listarRegistros("DeepQuery/RespostaObrigacao?tipoObrigacao=[2]&empresa=[" + oEmpresa + "]&anoCalendario=[" + oAnoCalendario +
					"]&" + this._parametroInception +
					"&statusResposta=&statusModelo=2&IndAtivoRel=true&ListarAteAnoAtual=true",
					function (response) { // 2 COMPLIANCE
						if (response) {
							var Todos = 0,
								NaoIniciada = 0,
								Aguardando = 0,
								EmAtraso = 0,
								EntregueNoPrazo = 0,
								EntregueForaPrazo = 0;
							for (var i = 0, length = response.length; i < length; i++) {
								switch (response[i]["status_obrigacao_calculado"]) {
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
							that.getModel().setProperty("/Contadores", {
								modelTodos: Todos,
								modelNaoIniciada: NaoIniciada,
								modelAguardando: Aguardando,
								modelEmAtraso: EmAtraso,
								modelEntregueNoPrazo: EntregueNoPrazo,
								modelEntregueForaPrazo: EntregueForaPrazo
							});
							//that.getModel().setProperty("/Obrigacao", response);

						}
					});

				NodeAPI.listarRegistros("DeepQuery/RespostaObrigacao?tipoObrigacao=[2]&empresa=[" + oEmpresa + "]&anoCalendario=[" + oAnoCalendario +
					"]&" + this._parametroInception +
					"&statusResposta=[" + oStatus + "]&statusModelo=2&IndAtivoRel=true&ListarAteAnoAtual=true",
					function (response) { // 2 COMPLIANCE
						if (response) {
							for (var i = 0, length = response.length; i < length; i++) {
								/*response[i]["label_prazo_entrega"] = 
									(response[i]["prazo_entrega_customizado"] !== null) 
									? response[i]["ano_calendario"] + "-" + response[i]["prazo_entrega_customizado"].substring(5, 7) + "-" + response[i]["prazo_entrega_customizado"].substring(8, 10) 
									: response[i]["ano_calendario"] + "-" + response[i]["prazo_entrega"].substring(5, 7) + '-' + response[i]["prazo_entrega"].substring(8, 10);*/
								response[i]["label_prazo_entrega"] = response[i]["prazo_entrega_calculado"];

								response[i]["prazo_entrega_customizado"] =
									(response[i]["prazo_entrega_customizado"] !== null) ? response[i]["ano_calendario"] + "-" + response[i][
										"prazo_entrega_customizado"
									].substring(5, 7) + "-" + response[i]["prazo_entrega_customizado"].substring(8, 10) : null;
							}
							that.getModel().setProperty("/Obrigacao", response);
						}
					});
			},

			_atualizarDadosFiltrado: function () {
				var that = this;

				var oEmpresa = this.getModel().getProperty("/IdEmpresaSelecionado") ? this.getModel().getProperty("/IdEmpresaSelecionado") : "";
				var oAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado") ? this.getModel().getProperty(
					"/AnoCalendarioSelecionado") : "";
				var oStatus = this.getView().byId('iconTabBarObrigacoes').getSelectedKey();
				var campoAnoEstaVazio = (!oAnoCalendario ? "&ListarAteAnoAtualMaisUm=1" : "");
				if (oStatus == '0') {
					oStatus = '';
				}

				NodeAPI.listarRegistros("DeepQuery/RespostaObrigacao?tipoObrigacao=[2]&empresa=[" + oEmpresa + "]&anoCalendario=[" + oAnoCalendario +
					"]&" + this._parametroInception +
					"&statusResposta=&statusModelo=2&IndAtivoRel=true&ListarSomenteEmVigencia=1" + campoAnoEstaVazio,
					function (response) { // 2 COMPLIANCE
						if (response) {
							var Todos = 0,
								NaoIniciada = 0,
								Aguardando = 0,
								EmAtraso = 0,
								EntregueNoPrazo = 0,
								EntregueForaPrazo = 0;
							for (var i = 0, length = response.length; i < length; i++) {
								switch (response[i]["status_obrigacao_calculado"]) {
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
							that.getModel().setProperty("/Contadores", {
								modelTodos: Todos,
								modelNaoIniciada: NaoIniciada,
								modelAguardando: Aguardando,
								modelEmAtraso: EmAtraso,
								modelEntregueNoPrazo: EntregueNoPrazo,
								modelEntregueForaPrazo: EntregueForaPrazo
							});
							//that.getModel().setProperty("/Obrigacao", response);
						}
					});

				NodeAPI.listarRegistros("DeepQuery/RespostaObrigacao?tipoObrigacao=[2]&empresa=[" + oEmpresa + "]&anoCalendario=[" + oAnoCalendario +
					"]&" + this._parametroInception +
					"&statusResposta=[" + oStatus + "]&statusModelo=2&IndAtivoRel=true&ListarSomenteEmVigencia=1" + campoAnoEstaVazio,
					function (response) { // 1 COMPLIANCE
						if (response) {
							for (var i = 0, length = response.length; i < length; i++) {
								/*response[i]["label_prazo_entrega"] = 
									(response[i]["prazo_entrega_customizado"] !== null) 
									? response[i]["ano_calendario"] + "-" + response[i]["prazo_entrega_customizado"].substring(5, 7) + "-" + response[i]["prazo_entrega_customizado"].substring(8, 10) 
									: response[i]["ano_calendario"] + "-" + response[i]["prazo_entrega"].substring(5, 7) + '-' + response[i]["prazo_entrega"].substring(8, 10);*/
								response[i]["label_prazo_entrega"] = response[i]["prazo_entrega_calculado"];

								response[i]["prazo_entrega_customizado"] =
									(response[i]["prazo_entrega_customizado"] !== null) ? response[i]["ano_calendario"] + "-" + response[i][
										"prazo_entrega_customizado"
									].substring(5, 7) + "-" + response[i]["prazo_entrega_customizado"].substring(8, 10) : null;

								response[i]["pais"] = Utils.traduzDominioPais(response[i]["fk_dominio_pais.id_dominio_pais"], that);
								response[i]["descricao_obrigacao_status"] = Utils.traduzStatusObrigacao(response[i]["status_obrigacao_calculado"], that);
								response[i]["descricao"] = Utils.traduzPeriodo(response[i]["fk_id_dominio_periodicidade.id_periodicidade_obrigacao"], that);
							}
							that.getModel().setProperty("/Obrigacao", response);
							//CODIGO DO CALENDARIO START--------------------
							//----------------------------------------------
							var aRegistro = that.getModel().getProperty("/Obrigacao");
							var people = [];
							var appointments = [];
							var headers = [];
							var cor;
							for (var i = 0, length = aRegistro.length; i < length; i++) {
								cor = "";
								switch(aRegistro[i]["status_obrigacao_calculado"]){
										case 1:
											cor = "rgb(94, 105, 110)";
											break;										
										case 4:
											cor = "rgb(66, 124, 172)";
											break;
										case 5:
											cor = "rgb(187, 0, 0)";
											break;	
										case 6:
											cor = "rgb(43, 124, 43)";
											break;											
										case 7:
											cor = "rgb(231, 140, 7)";
											break;											
								}
								if(cor){
									appointments.push({
										codigo:aRegistro[i],
										start:Utils.bancoParaJsDate(aRegistro[i]["prazo_entrega_calculado"]),
										end:new Date(Utils.bancoParaJsDate(aRegistro[i]["prazo_entrega_calculado"]).setHours(23,59,59)),
										title:aRegistro[i]["nome"] + "\n" + aRegistro[i]["nome_obrigacao"],
										type: "Type02",
										color: cor,
										tentative: false										
									});										
								}
	
							}
							people.push({
								pic: "sap-icon://add",
								name: "John Miller",
								role: "team member",
								appointments: appointments
							});
							that.getModel().setProperty("/people", people);
							//----------------------------------------------
							//CODIGO DO CALENDARIO END -----------------------
						}
					});
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
				
				//if (aTipo && aTipo.length) oQueryString.tipo = JSON.stringify(aTipo);
				
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
			},

			_parametroInception: "full=true"
		});
	}
);