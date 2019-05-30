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
				var oModel = new JSONModel();
				oModel.setSizeLimit(500);
				this.setModel(oModel);
				
				if (this.isVisualizacaoUsuario()) {
					this.getRouter().getRoute("ttcListagemEmpresas").attachPatternMatched(this._onRouteMatched, this);
				}
			},

            onBaixarModeloImport: function (oEvent) {
				window.location = Constants.urlBackend + "TTC/DownloadModeloImport";
			},
            
			onTrocarAnoCalendario: function (oEvent) {
				this._atualizarDados();
			},

			onSelecionarEmpresa: function (oEvent) {
				if (this.isVisualizacaoUsuario()) {
					this.setBusy(this.byId("tabelaEmpresas"), true);
	
					var oEmpresaSelecionada = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
					var sIdAnoCalendarioSelecionado = this.getModel().getProperty("/AnoCalendarioSelecionado");
					var nomeUsuario = this.getModel().getProperty("/NomeUsuario");
	
					this.getRouter().navTo("ttcResumoTrimestre", {
						oEmpresa: this.toURIComponent(oEmpresaSelecionada),
						idAnoCalendario: this.toURIComponent(sIdAnoCalendarioSelecionado),
						nomeUsuario: this.toURIComponent(nomeUsuario)
					});
				}
				else {
					var objSelecionado = oEvent.getSource().getBindingContext().getObject();
					
					this._inceptionParams.router.navToDetalhes({
						oPeriodo: {
						    id_periodo: objSelecionado.idPeriodo,
						    numero_ordem: objSelecionado.numeroOrdem,
						    periodo_traduzido: objSelecionado.labelTrimestre
						},
						oEmpresa: {
							"fk_pais.id_pais": objSelecionado.fkPais,
							id_empresa: objSelecionado.idEmpresa,
							nome: objSelecionado.nomeEmpresa
						},
						oAnoCalendario: {
							idAnoCalendario: objSelecionado.idAnoCalendario,
							anoCalendario: objSelecionado.anoCalendario
						},
						isPendente: true,
						nomeUsuario: '',
						_targetInceptionParams: this._inceptionParams
					});
				}
			},

			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			_onRouteMatched: function (oEvent) {
				var that = this;

				var parametro;
				var usuario;
				var atualizarDados = false;

				if (this.isVisualizacaoAdmin()) {
					this._inceptionParams = oEvent;
					parametro = oEvent.params.idAnoCalendarioCorrente;
					usuario = '';
					
					// Sempre invalida o atualizar dados, pois no retorno do detalhe para o resumo esse parametro
					// é recebido de volta e impede a atualizacao da tabela/reconstrução do filtro. É preciso manter o estado anterior ao detalhamento.
					// O único momento que este valor é true é no clique do botão de visualizar o TTC no admin.
					atualizarDados = oEvent.params.atualizarDados;
					oEvent.params.atualizarDados = false;
					
					this.mostrarAcessoRapidoInception();
				}
				else {
					parametro = this.fromURIComponent(oEvent.getParameter("arguments").parametros).idAnoCalendario;
					usuario = this.fromURIComponent(oEvent.getParameter("arguments").parametros).nomeUsuario;
				}

				that.getModel().setProperty("/AnoCalendarioSelecionado", parametro);
				that.getModel().setProperty("/NomeUsuario", usuario);
				this.getModel().setProperty('/IsAreaUsuario', !this.isIFrame());
				
				if (this.isVisualizacaoAdmin()) {
					if (atualizarDados) {
						this._montarFiltroAdmin();
						this._atualizarDados({
							filtroAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
						});
					}
				}
				else {
					NodeAPI.listarRegistros("DominioAnoCalendario", function (response) {
						if (response) {
							that.getModel().setProperty("/DominioAnoCalendario", response);
	
							that._atualizarDados();
						}
					});
				}
			},

			_atualizarDados: function (oFiltro) {
				if (this.isVisualizacaoAdmin())	{
					this._atualizarDadosAdmin(oFiltro);
				}
				else {
					this._atualizarDadosUsuario();
				}
			},

			_atualizarDadosAdmin: function (oFiltro) {
				var thisController = this;
				
				thisController.setBusy(thisController.byId("tabelaAdmin"), true);
				
				NodeAPI.pListarRegistros('TTC/ResumoEmpresaAdmin', oFiltro ? oFiltro : ''/*{
					anoCalendario: thisController.getModel().getProperty("/AnoCalendarioSelecionado")
				}*/).then(function (res) {
					for (var i = 0; i < res.result.length; i++) {
						res.result[i].labelTrimestre = Utils.traduzTrimestreTTC(res.result[i].numeroOrdem, thisController);
						res.result[i].labelEnviado = Utils.traduzStatusEnvioTrimestreTTC(res.result[i].indEnviado, thisController);
						res.result[i].iconeEnviado = res.result[i].indEnviado ? 'sap-icon://accept' : 'sap-icon://decline';
					}
					
					thisController.getModel().setProperty('/ResumoEmpresaAdmin', res.result);
				}).finally(function () {
					thisController.setBusy(thisController.byId('tabelaAdmin'), false);
				});	
			},

			_atualizarDadosUsuario: function () {
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
			
			_montarFiltroAdmin: function () {
				var that = this;
				
				Utils.criarDialogFiltroManual([{
					text: that.getResourceBundle().getText('viewGeralMoeda'),
					key: 'filtroMoeda',
					items: {
						loadFrom: 'DominioMoeda',
						path: '/EasyFilterMoeda',
						text: 'nome',
						key: 'id_dominio_moeda'
					}
                }, {
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
                    that.getModel().setProperty("/EasyFilterMoeda", Utils.orderByArrayParaBox(res[0].map(obj => {
                    	obj.nome = obj.acronimo + ' - ' + obj.nome;
                    	return obj;
                    }), "nome"));
                    
                    that.getModel().setProperty("/EasyFilterAnoCalendario", res[1]);
                    
                    that.getModel().setProperty("/EasyFilterRegiao", Utils.orderByArrayParaBox(res[2].map(obj => { 
                    	obj.regiao = Utils.traduzPaisRegiao(obj.id_dominio_pais_regiao, that);
                    	return obj;
                	}), "regiao"));
                	
                    that.getModel().setProperty("/EasyFilterPais", Utils.orderByArrayParaBox(res[3].map(obj => {
                    	obj.nomePais = Utils.traduzDominioPais(obj.fkDominioPais, that);
                    	return obj;
                	}), "nomePais"));
                    
                    that.getModel().setProperty("/EasyFilterPeriodo", Utils.orderByArrayParaBox([
                    	{
                    		periodo: that.getResourceBundle().getText('viewGeralPeriodo1'),
                    		numero_ordem: 1
                    	},
                    	{
                    		periodo: that.getResourceBundle().getText('viewGeralPeriodo2'),
                    		numero_ordem: 2
                    	},
                    	{
                    		periodo: that.getResourceBundle().getText('viewGeralPeriodo3'),
                    		numero_ordem: 3
                    	},
                    	{
                    		periodo: that.getResourceBundle().getText('viewGeralPeriodo4'),
                    		numero_ordem: 4
                    	}
                    ], "periodo"));
                    
                    that.getModel().setProperty("/EasyFilterStatus", Utils.orderByArrayParaBox([
                    	{
                    		label_status: that.getResourceBundle().getText('viewGeralEnviadoTTC'),
                    		status: 1
                    	},
                    	{
                    		label_status: that.getResourceBundle().getText('viewGeralNaoEnviadoTTC'),
                    		status: 0
                    	}
                    ], "label_status"));
                }));
			},
			
			onFiltrarListagemEmpresas : function () {
               this._filterDialog.open();             
            }
		});
	}
);