sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/Arquivo",
	],
	function (BaseController, NodeAPI, Utils, Validador, Arquivo) {
		"use strict";

		return BaseController.extend("ui5ns.ui5.controller.ttc.VisualizacaoTrimestre", {
			onInit: function (oEvent) {
				//sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR");

				this.setModel(new sap.ui.model.json.JSONModel({
					Pagamentos: {
						Borne: [],
						Collected: []
					}

				}));

				if (this.isVisualizacaoUsuario()) {
					this.getRouter().getRoute("ttcVisualizacaoTrimestre").attachPatternMatched(this._onRouteMatched, this);
				}
			},

			_formatDate: function (date) {
				var that = this;

				var d = new Date(date),
					month = '' + (d.getMonth() + 1),
					day = '' + d.getDate(),
					year = d.getFullYear();

				if (month.length < 2) month = '0' + month;
				if (day.length < 2) day = '0' + day;

				return [year, month, day].join('-');
			},

			onReabrirPeriodo: function (oPeriodo) {
				var that = this;

				var oParams = {};

				oParams.oPeriodo = that.getModel().getProperty("/Periodo");
				oParams.oEmpresa = that.getModel().getProperty("/Empresa");

				var oForm = new sap.ui.layout.form.Form({
					editable: true
				}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
					singleContainerFullSize: false
				}));

				var oFormContainer = new sap.ui.layout.form.FormContainer();

				var oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralEmpresa}"
				}).addField(new sap.m.Text({
					text: "{/Empresa/nome}"
				}));

				oFormContainer.addFormElement(oFormElement);

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralPeriodo}"
				}).addField(new sap.m.Text({
					text: "{/Periodo/periodo}"
				}));

				oFormContainer.addFormElement(oFormElement);

				var oTextArea = new sap.m.TextArea({
					rows: 5
				});

				oFormElement = new sap.ui.layout.form.FormElement({
					label: "{i18n>viewGeralJustificativa}"
				}).addField(oTextArea);

				oFormContainer.addFormElement(oFormElement);

				oForm.addFormContainer(oFormContainer);

				var dialog = new sap.m.Dialog({
					title: "{i18n>viewGeralNovaRequisicao}",
					content: oForm,
					beginButton: new sap.m.Button({
						text: "{i18n>viewGeralSalvar}",
						press: function () {
							NodeAPI.criarRegistro("RequisicaoReabertura", {
								dataRequisicao: this._formatDate(new Date()),
								idUsuario: "1",
								nomeUsuario: "Haru_Int",
								justificativa: oTextArea.getValue(),
								resposta: "",
								fkDominioRequisicaoReaberturaStatus: "1",
								fkEmpresa: oParams.oEmpresa.id_empresa,
								fkPeriodo: oParams.oPeriodo.id_periodo,
								nomeEmpresa: oParams.oEmpresa.nome
							});
							sap.m.MessageToast.show(this.getResourceBundle().getText("viewResumoTrimestreToast"));

							//desabilita o botao d reabetura apos o pedido de solicitacao
							if (this.byId("btnReabrir").getVisible(true))
								this.byId("btnReabrir").setVisible(false);

							dialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "{i18n>viewGeralSair}",
						press: function () {
							dialog.close();
						}.bind(this)
					}),
					afterClose: function () {
						that.getView().removeDependent(dialog);
						dialog.destroy();
					}
				});

				// to get access to the global model
				this.getView().addDependent(dialog);

				dialog.open();
			},
			
			onMudarLinhasExibidasBorne: function(oEvent, e) {
				var that = this,
						numeroLinhasBorne = this.getModel().getProperty("/numeroLinhasBorne"),
						isNum = /^\d+$/.test(numeroLinhasBorne);
				if (isNum){
					if (numeroLinhasBorne > 50) {
						 that._confirmarLinhas();
						 return false;
					}
					else{
						this.byId("tableBorne").setVisibleRowCount(Number(numeroLinhasBorne));
					}
				}
			},
			
			onMudarLinhasExibidasCollected: function(oEvent, e){
				var that = this,
						numeroLinhasCollected = this.getModel().getProperty("/numeroLinhasCollected"),
						isNum = /^\d+$/.test(numeroLinhasCollected);
				if (isNum){
					if (numeroLinhasCollected > 50) {
						 that._confirmarLinhas();
						 return false;
					}
					else{
						this.byId("tableCollected").setVisibleRowCount(Number(numeroLinhasCollected));
					}
				}
			},
			
			_confirmarLinhas: function (onConfirm) {
				var dialog = new sap.m.Dialog({
					title: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralAviso"),
					type: "Message",
					content: new sap.m.Text({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralValor")
					}),
					endButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("Ok"),
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				dialog.open();
			},
			
			onFiltrarBorne: function () {
				this.filterDialogBorne.open();
			},
			
			onFiltrarCollected: function () {
				this.filterDialogCollected.open();
			},
			
			_montarFiltro: function (bManterFiltro) {
				var that = this;
				
				Utils.criarDialogFiltro("tableBorne", [{
					text: this.getResourceBundle().getText("viewGeralPais"),
					applyTo: 'fk_dominio_pais.id_dominio_pais',
					items: {
						loadFrom: 'DominioPais',
						path: '/EasyFilterBorneDominioPais',
						text: 'pais',
						key: 'id_dominio_pais'
					}
				}, {
					text: this.getResourceBundle().getText("viewGeralCategoria"),
					applyTo: 'fk_category.id_tax_category',
					items: {
						loadFrom: "TaxCategory?classification=1",
						path: '/EasyFilterBorneTaxCategory',
						text: 'category',
						key: 'id_tax_category'
					}
				}, {
					text: this.getResourceBundle().getText("viewGeralTaxa"),
					applyTo: 'fk_tax.id_tax',
					items: {
						loadFrom: "DeepQuery/Tax?classification=1",
						path: '/EasyFilterBorneTax',
						text: 'tax',
						key: 'id_tax'
					}
				}, {
					text: this.getResourceBundle().getText("viewGeralJurisdicao"),
					applyTo: 'fk_jurisdicao.id_dominio_jurisdicao',
					items: {
						loadFrom: "DominioJurisdicao",
						path: '/EasyFilterBorneJurisdicao',
						text: 'jurisdicao',
						key: 'id_dominio_jurisdicao'
					}
				}, {
					text: this.getResourceBundle().getText("viewGeralAnoFiscal"),
					applyTo: 'fk_dominio_ano_fiscal.id_dominio_ano_fiscal',
					items: {
						loadFrom: "DominioAnoFiscal",
						path: '/EasyFilterBorneAnoFiscal',
						text: 'ano_fiscal',
						key: 'id_dominio_ano_fiscal'
					}
				}, {
					text: this.getResourceBundle().getText("ViewRelatorioCurrency"),
					applyTo: 'fk_dominio_moeda.id_dominio_moeda',
					items: {
						loadFrom: "DominioMoeda",
						path: '/EasyFilterBorneMoeda',
						text: 'AcroNome',
						key: 'id_dominio_moeda'
					}
				}, {
					text: this.getResourceBundle().getText("ViewRelatorioTipoDeTransacao"),
					applyTo: 'fk_dominio_tipo_transacao.id_dominio_tipo_transacao',
					items: {
						loadFrom: "DominioTipoTransacao",
						path: '/EasyFilterBorneTipoTransacao',
						text: 'tipo_transacao',
						key: 'id_dominio_tipo_transacao'
					}
				}], this, function (params) {
					
				}, "filterDialogBorne");

				Utils.criarDialogFiltro("tableCollected", [{
					text: this.getResourceBundle().getText("viewGeralPais"),
					applyTo: 'fk_dominio_pais.id_dominio_pais',
					items: {
						loadFrom: 'DominioPais',
						path: '/EasyFilterCollectedDominioPais',
						text: 'pais',
						key: 'id_dominio_pais'
					}
				}, {
					text: this.getResourceBundle().getText("viewGeralCategoria"),
					applyTo: 'fk_category.id_tax_category',
					items: {
						loadFrom: "TaxCategory?classification=2",
						path: '/EasyFilterCollectedTaxCategory',
						text: 'category',
						key: 'id_tax_category'
					}
				}, {
					text: this.getResourceBundle().getText("viewGeralTaxa"),
					applyTo: 'fk_tax.id_tax',
					items: {
						loadFrom: "DeepQuery/Tax?classification=2",
						path: '/EasyFilterCollectedTax',
						text: 'tax',
						key: 'id_tax'
					}
				}, {
					text: this.getResourceBundle().getText("viewGeralJurisdicao"),
					applyTo: 'fk_jurisdicao.id_dominio_jurisdicao',
					items: {
						loadFrom: "DominioJurisdicao",
						path: '/EasyFilterCollectedJurisdicao',
						text: 'jurisdicao',
						key: 'id_dominio_jurisdicao'
					}
				}, {
					text: this.getResourceBundle().getText("viewGeralAnoFiscal"),
					applyTo: 'fk_dominio_ano_fiscal.id_dominio_ano_fiscal',
					items: {
						loadFrom: "DominioAnoFiscal",
						path: '/EasyFilterCollectedAnoFiscal',
						text: 'ano_fiscal',
						key: 'id_dominio_ano_fiscal'
					}
				}, {
					text: this.getResourceBundle().getText("ViewRelatorioCurrency"),
					applyTo: 'fk_dominio_moeda.id_dominio_moeda',
					items: {
						loadFrom: "DominioMoeda",
						path: '/EasyFilterCollectedMoeda',
						text: 'AcroNome',
						key: 'id_dominio_moeda'
					}
				}, {
					text: this.getResourceBundle().getText("ViewRelatorioTipoDeTransacao"),
					applyTo: 'fk_dominio_tipo_transacao.id_dominio_tipo_transacao',
					items: {
						loadFrom: "DominioTipoTransacao",
						path: '/EasyFilterCollectedTipoTransacao',
						text: 'tipo_transacao',
						key: 'id_dominio_tipo_transacao'
					}
				}], this, function (params) {
					
				}, "filterDialogCollected");


				this._loadFrom_filterDialogBorne().then((function (res) {
					for (var i = 0, length = res[0].length; i < length; i++) {
						res[0][i]["pais"] = Utils.traduzDominioPais(res[0][i]["id_dominio_pais"], that);
					}
					res[0] = Utils.orderByArrayParaBox(res[0], "pais");
					res[0].unshift({"id_dominio_pais":0,"pais":that.emBrancoTraduzido});
					that.getModel().setProperty("/EasyFilterBorneDominioPais", res[0]);
					
					res[1] = Utils.orderByArrayParaBox(res[1], "category");
					res[1].unshift({"id_tax_category":0,"category":that.emBrancoTraduzido});
					that.getModel().setProperty("/EasyFilterBorneTaxCategory", res[1]);
					
					res[2] = Utils.orderByArrayParaBox(res[2], "tax");
					res[2].unshift({"id_tax":0,"tax": that.emBrancoTraduzido});
					that.getModel().setProperty("/EasyFilterBorneTax", res[2]);
					
					for (var i = 0, length = res[3].length; i < length; i++) {
						res[3][i]["jurisdicao"] = Utils.traduzJurisdicao(res[3][i]["id_dominio_jurisdicao"], that);
					}
					res[3] = Utils.orderByArrayParaBox(res[3], "jurisdicao");
					res[3].unshift({"id_dominio_jurisdicao":0,"jurisdicao":that.emBrancoTraduzido});
					that.getModel().setProperty("/EasyFilterBorneJurisdicao",res[3]);
					
					res[4].unshift({"id_dominio_ano_fiscal":0,"ano_fiscal":that.emBrancoTraduzido});
					that.getModel().setProperty("/EasyFilterBorneAnoFiscal", res[4]);
					
					for (var i = 0; i < res[5].length; i++) {
						res[5][i].AcroNome = res[5][i]["acronimo"] + " - " + res[5][i]["nome"];
					}
					res[5] = Utils.orderByArrayParaBox(res[5], "AcroNome");
					res[5].unshift({"id_dominio_moeda":0,"AcroNome":that.emBrancoTraduzido});
					that.getModel().setProperty("/EasyFilterBorneMoeda", res[5]);
					
					for (var i = 0, length = res[6].length; i < length; i++) {
						res[6][i]["tipo_transacao"] = Utils.traduzTipoTransacao(res[6][i]["id_dominio_tipo_transacao"], that);
					}
					res[6] = Utils.orderByArrayParaBox(res[6],"tipo_transacao");
					res[6].unshift({"id_dominio_tipo_transacao":0,"tipo_transacao":that.emBrancoTraduzido});
					that.getModel().setProperty("/EasyFilterBorneTipoTransacao", res[6]);
				}));
				this._loadFrom_filterDialogCollected().then((function (res) {
					for (var i = 0, length = res[0].length; i < length; i++) {
						res[0][i]["pais"] = Utils.traduzDominioPais(res[0][i]["id_dominio_pais"], that);
					}
					res[0] = Utils.orderByArrayParaBox(res[0], "pais");
					res[0].unshift({"id_dominio_pais":0,"pais":that.emBrancoTraduzido});
					that.getModel().setProperty("/EasyFilterCollectedDominioPais", res[0]);
					
					res[1] = Utils.orderByArrayParaBox(res[1], "category");
					res[1].unshift({"id_tax_category":0,"category":that.emBrancoTraduzido});
					that.getModel().setProperty("/EasyFilterCollectedTaxCategory", res[1]);
					
					res[2] = Utils.orderByArrayParaBox(res[2], "tax");
					res[2].unshift({"id_tax":0,"tax": that.emBrancoTraduzido});
					that.getModel().setProperty("/EasyFilterCollectedTax", res[2]);
					
					for (var i = 0, length = res[3].length; i < length; i++) {
						res[3][i]["jurisdicao"] = Utils.traduzJurisdicao(res[3][i]["id_dominio_jurisdicao"], that);
					}
					res[3] = Utils.orderByArrayParaBox(res[3], "jurisdicao");
					res[3].unshift({"id_dominio_jurisdicao":0,"jurisdicao":that.emBrancoTraduzido});
					that.getModel().setProperty("/EasyFilterCollectedJurisdicao",res[3]);
					
					res[4].unshift({"id_dominio_ano_fiscal":0,"ano_fiscal":that.emBrancoTraduzido});
					that.getModel().setProperty("/EasyFilterCollectedAnoFiscal", res[4]);
					
					for (var i = 0; i < res[5].length; i++) {
						res[5][i].AcroNome = res[5][i]["acronimo"] + " - " + res[5][i]["nome"];
					}
					res[5] = Utils.orderByArrayParaBox(res[5], "AcroNome");
					res[5].unshift({"id_dominio_moeda":0,"AcroNome":that.emBrancoTraduzido});
					that.getModel().setProperty("/EasyFilterCollectedMoeda", res[5]);
					
					for (var i = 0, length = res[6].length; i < length; i++) {
						res[6][i]["tipo_transacao"] = Utils.traduzTipoTransacao(res[6][i]["id_dominio_tipo_transacao"], that);
					}
					res[6] = Utils.orderByArrayParaBox(res[6],"tipo_transacao");
					res[6].unshift({"id_dominio_tipo_transacao":0,"tipo_transacao":that.emBrancoTraduzido});
					that.getModel().setProperty("/EasyFilterCollectedTipoTransacao",res[6]);
				}));
			},

			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");

				if (!this.byId("btnReabrir").getVisible())
					this.byId("btnReabrir").setVisible(true);
			},

			navToPage2: function () {
				
				if (this.isVisualizacaoUsuario()) {
					var usuario = this.getModel().getProperty("/NomeUsuario");
					
					this.getRouter().navTo("ttcListagemEmpresas", {
						parametros: this.toURIComponent({
							idAnoCalendario: this.getModel().getProperty("/AnoCalendario").idAnoCalendario,
							nomeUsuario: usuario
						})
					});

					if (!this.byId("btnReabrir").getVisible())
						this.byId("btnReabrir").setVisible(true);
				}
				else {
					this._inceptionParams._targetInceptionParams.params.idAnoCalendarioCorrente = this.getModel().getProperty("/AnoCalendario").idAnoCalendario;
					this._inceptionParams._targetInceptionParams.router.navToListagem(this._inceptionParams._targetInceptionParams);
				}
			},

			navToPage3: function () {
				var oEmpresaSelecionada = this.getModel().getProperty("/Empresa");
				var sIdAnoCalendarioSelecionado = this.getModel().getProperty("/AnoCalendario").idAnoCalendario;

				this.getRouter().navTo("ttcResumoTrimestre", {
					oEmpresa: this.toURIComponent(oEmpresaSelecionada),
					idAnoCalendario: this.toURIComponent(sIdAnoCalendarioSelecionado),
					nomeUsuario: this.toURIComponent(this.getModel().getProperty("/NomeUsuario"))
				});

				if (!this.byId("btnReabrir").getVisible())
					this.byId("btnReabrir").setVisible(true);
			},

			_recarregarArquivos: function(){
				var that = this;
				var oEmpresa = this.getModel().getProperty("/Empresa");
				var oPeriodo = this.getModel().getProperty("/Periodo");
				var iIdEmpresa = oEmpresa.id_empresa;
				var iIdPeriodo = oPeriodo.id_periodo;
				
				NodeAPI.pListarRegistros("DeepQuery/ListarTodosDocumentosTTC?idPeriodo=" + iIdPeriodo + "&idEmpresa" + iIdEmpresa)
				.then(function(response){
					for(let i =0; i < response.result.length; i++){
						response.result[i]["persistido"] = true;
					}
					that.getModel().setProperty("/documentosVigentes",response.result);
					that.getModel().setProperty("/documentosNaoVigentes",[]);
					that._remontarAbaDocumentos();
				})
				.catch(function(err){
					console.log(err);
				});
				
			},

			onBaixarDocumento: function (oEvent){
				var oButton = oEvent.getSource();
				var sIdDocumento = oEvent.getSource().getBindingContext().getObject()["fk_documento_ttc.id_documento_ttc"];
				var that = this;
				this.setBusy(oButton, true);

				Arquivo.download("DownloadDocumentoTTC?arquivo=" + sIdDocumento)
					.then(function (response) {
						Arquivo.salvar(response[0].nome_arquivo, response[0].mimetype, response[0].dados_arquivo.data);

						that.setBusy(oButton, false);
						that.getModel().refresh();
					})
					.catch(function (err) {
						sap.m.MessageToast.show(that.getResourceBundle().getText("viewTAXResumoTrimestreAnexarDeclaracaoErroAoBaixarArquivo"));
						that.setBusy(oButton, false);
						that.getModel().refresh();
					});
			},

			_onRouteMatched: function (oEvent) {
				var that = this;
				
				var countBorne = 0,
					countCollected = 0;
					
				var oParameters;
					
				if (this.isIFrame()) {
					this.mostrarAcessoRapidoInception();
					this.byId("btnReabrir").setVisible(false);
					this._inceptionParams = oEvent;
					oParameters = oEvent;
				}
				else {
					oParameters = this.fromURIComponent(oEvent.getParameter("arguments").oParameters);
				}

				if (!this.isIFrame()) {

					//oculta o botao de reabertura caso ja exista uma reabertura solicitada para o periodo
					if (oParameters.isPendente) {
						this.byId("btnReabrir").setVisible(false);
					} else if (!oParameters.isPendente) {
						// tratamento para checar se o usuario alterou intencionalmente a o parametro da url
						if (!this.byId("btnReabrir").getVisible()) {
							this.byId("btnReabrir").setVisible(false);
						} else
						if (this.byId("btnReabrir").getVisible())
							this.byId("btnReabrir").setVisible(true);
					}
				}
				
				
				this.byId("tableBorne").setFixedColumnCount(3);
				this.byId("tableCollected").setFixedColumnCount(3);

				oParameters.oPeriodo.periodo = Utils.traduzTrimestreTTC(oParameters.oPeriodo.numero_ordem, that);
				
				Utils.displayFormat(this);
				this.getModel().setProperty("/Empresa", oParameters.oEmpresa);
				this.getModel().setProperty("/Periodo", oParameters.oPeriodo);
				this.getModel().setProperty("/AnoCalendario", oParameters.oAnoCalendario);
				this.getModel().setProperty("/NomeUsuario", oParameters.nomeUsuario);
				this.getModel().setProperty('/IsAreaUsuario', !this.isIFrame());
				
				this._recarregarArquivos();
				
				this._montarFiltro();

				
				var sIdEmpresa = oParameters.oEmpresa.id_empresa,
					sIdPeriodo = oParameters.oPeriodo.id_periodo;

				this.byId("tableBorne").setBusyIndicatorDelay(100);
				this.byId("tableBorne").setBusy(true);

				Promise.all([
					NodeAPI.pListarRegistros("/DeepQuery/Pagamento?full=true&empresa=" + sIdEmpresa + "&periodo=" + sIdPeriodo + "&tax_classification=1"),
					NodeAPI.pListarRegistros("/DeepQuery/Pagamento?full=true&empresa=" + sIdEmpresa + "&periodo=" + sIdPeriodo + "&tax_classification=2")
					])
				.then(function (response){
					var responseBorne = response[0];
					var responseCollected = response[1];
					
					//Borne
					
					for (var i = 0; i < responseBorne.length; i++) {
						responseBorne[i].icone_aplicavel = responseBorne[i].ind_nao_aplicavel ? "sap-icon://accept" : "sap-icon://decline";
						responseBorne[i]["pais"] = Utils.traduzDominioPais(responseBorne[i]["fk_dominio_pais.id_dominio_pais"], that);
						countBorne++;
					}
					that.getModel().setProperty("/ContadorBorne", countBorne);
					that.getModel().setProperty("/Pagamentos/Borne", responseBorne);
					//Collected
					
					for (var i = 0; i < responseCollected.length; i++) {
						responseCollected[i].icone_aplicavel = responseCollected[i].ind_nao_aplicavel ? "sap-icon://accept" : "sap-icon://decline";
						responseCollected[i]["pais"] = Utils.traduzDominioPais(responseCollected[i]["fk_dominio_pais.id_dominio_pais"], that);
						countCollected++;
					}
					that.getModel().setProperty("/ContadorCollected", countCollected);
					that.getModel().setProperty("/Pagamentos/Collected", responseCollected);
					
					that.byId("tableBorne").setBusy(false);
					that.byId("tableCollected").setBusy(false);
					that._remontarAbaDocumentos();
				})
				.catch(function (err){
					console.log(err);
				})
			},
			
			_remontarAbaDocumentos: function () {
				let dadosPagamentosBorne = this.getModel().getProperty("/Pagamentos/Borne"),
					dadosPagamentosCollected = this.getModel().getProperty("/Pagamentos/Collected");
				var aPagamentosBorne = Utils.orderByArrayParaBox(dadosPagamentosBorne.slice(0), 'category');
				var aPagamentosCollected = Utils.orderByArrayParaBox(dadosPagamentosCollected.slice(0), 'category');
				var aDocumentosVigentes = this.getModel().getProperty("/documentosVigentes");
				var linhasDocumentos = [];
				var insereArrayNoLinhasDocumentos = function (array, classificacao) {
					var categoriaCorrente = -1;
					var objLinhaDocumento = {};
					var idDaLinha = 0;
					for (let i = 0; i < array.length; i++) {
						if (array[i]["fk_category.id_tax_category"]) {
							if (array[i]["fk_category.id_tax_category"] == categoriaCorrente) {
								linhasDocumentos[linhasDocumentos.length - 1]["valor_total"] = Number(array[i]["total"]) + linhasDocumentos[linhasDocumentos.length -
									1]["valor_total"];
							} else {
								idDaLinha++;
								categoriaCorrente = array[i]["fk_category.id_tax_category"];
								objLinhaDocumento = {};
								objLinhaDocumento["id_linha_documento"] = idDaLinha;
								objLinhaDocumento["classificacao"] = classificacao;
								objLinhaDocumento["category"] = array[i]["category"];
								objLinhaDocumento["fk_category.id_tax_category"] = array[i]["fk_category.id_tax_category"];
								objLinhaDocumento["fk_periodo.id_periodo"] = array[i]["fk_periodo.id_periodo"];
								objLinhaDocumento["valor_total"] = Number(array[i]["total"]);
								for (let j = 0; j < aDocumentosVigentes.length; j++) {
									if (array[i]["fk_periodo.id_periodo"] == aDocumentosVigentes[j]["fk_periodo.id_periodo"] && array[i][
											"fk_category.id_tax_category"
										] == aDocumentosVigentes[j]["fk_category.id_tax_category"]) {
										objLinhaDocumento["nome_arquivo"] = aDocumentosVigentes[j]["nome_arquivo"];
										objLinhaDocumento["fk_documento_ttc.id_documento_ttc"] = aDocumentosVigentes[j]["id_documento_ttc"];
										objLinhaDocumento["persistido"] = aDocumentosVigentes[j]["persistido"];
									}
								}
								linhasDocumentos.push(objLinhaDocumento);
							}
						}
					}
				}
				insereArrayNoLinhasDocumentos(aPagamentosBorne, this.getResourceBundle().getText("viewGeralBorne"));
				insereArrayNoLinhasDocumentos(aPagamentosCollected, this.getResourceBundle().getText("viewGeralCollected"));
				this.getModel().setProperty("/linhasDocumentos", linhasDocumentos);
				this.getModel().setProperty("/ContadorDocumentos", linhasDocumentos.length);
			}
		});
	});