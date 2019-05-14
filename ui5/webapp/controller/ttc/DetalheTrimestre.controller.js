sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, NodeAPI, Validador, Utils) {
		"use strict";

		return BaseController.extend("ui5ns.ui5.controller.ttc.DetalheTrimestre", {
			onInit: function () {
				//sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR");

				this._dadosPagamentosBorne = [];
				this._dadosPagamentosCollected = [];

				var oModel = new sap.ui.model.json.JSONModel({
					ValueState: sap.ui.core.ValueState.Error,
					MinDate: null,
					MaxDate: null,
					pagamentos: this._dadosPagamentos,
					Borne: {
						Pagamentos: this._dadosPagamentosBorne,
						TaxCategory: [],
						Tax: [],
						NameOfTax: []
					},
					Collected: {
						Pagamentos: this._dadosPagamentosCollected,
						TaxCategory: [],
						Tax: [],
						NameOfTax: []
					}
				});

				oModel.setSizeLimit(300);

				this.setModel(oModel);

				this.getRouter().getRoute("ttcDetalheTrimestre").attachPatternMatched(this._onRouteMatched, this);
			},

			onSalvarFechar: function (oEvent) {
				var that = this;

				this._salvar(oEvent, function (response) {
					if (response.success) {
						that._navToResumoTrimestre();
					} else {
						sap.m.MessageToast.show(that.getResourceBundle().getText("viewDetalheTrimestreErro") + response.error.message);
					}
				});
			},

			onSalvar: function (oEvent) {
				var that = this;

				this._salvar(oEvent, function (response) {

					if (response.success) {
						sap.m.MessageToast.show(that.getResourceBundle().getText("viewDetalheTrimestreSalvoSucesso"));
					} else {
						sap.m.MessageToast.show(that.getResourceBundle().getText("viewDetalheTrimestreErro") + response.error.message);
					}
				});
			},

			onCancelar: function (oEvent) {
				var that = this;

				this._confirmarCancelamento(function () {
					that._navToResumoTrimestre();
				});
			},

			onNovoPagamentoBorne: function (oEvent) {
				this._dadosPagamentosBorne.unshift(this._novoPagamento());

				this.getModel().refresh();
			},

			onNovoPagamentoCollected: function (oEvent) {
				this._dadosPagamentosCollected.unshift(this._novoPagamento());

				this.getModel().refresh();
			},

			onTrocarJurisdicao: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();

				var sIdJurisdicao = oEvent.getSource().getSelectedKey();
				if (sIdJurisdicao == "1") { //Federal
					oPagamento.estadoValueState = sap.ui.core.ValueState.None;
					oPagamento.cidadeValueState = sap.ui.core.ValueState.None;
				} else if (sIdJurisdicao == "2") { //Estadual
					if (oPagamento.estado == "" || oPagamento.estado === null) {
						oPagamento.estadoValueState = sap.ui.core.ValueState.Error;
					}
					oPagamento.cidadeValueState = sap.ui.core.ValueState.None;
				} else if (sIdJurisdicao == "3") { //Municipal
					if (oPagamento.estado == "" || oPagamento.estado === null) {
						oPagamento.estadoValueState = sap.ui.core.ValueState.Error;
					}
					if (oPagamento.cidade == "" || oPagamento.cidade === null) {
						oPagamento.cidadeValueState = sap.ui.core.ValueState.Error;
					}
				}

			},

			onPreencherEstado: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();
				var sTextoCampo = oEvent.getSource().getValue();
				if (oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] == 2 || oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] == 3) {
					if (sTextoCampo != "" && sTextoCampo != undefined && sTextoCampo !== null) {
						oPagamento.estadoValueState = sap.ui.core.ValueState.None;
					} else {
						oPagamento.estadoValueState = sap.ui.core.ValueState.Error;
					}
				}
			},

			onPreencherCidade: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();
				var sTextoCampo = oEvent.getSource().getValue();

				if (oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] == 3) {
					if (sTextoCampo != "" && sTextoCampo != undefined && sTextoCampo != null) {
						oPagamento.cidadeValueState = sap.ui.core.ValueState.None;
					} else {
						oPagamento.cidadeValueState = sap.ui.core.ValueState.Error;
					}
				}

			},

			onDuplicarLinha: function (oEvent) {
				var sPath = oEvent.getSource().getBindingContext().getPath();
				var aDadosPagamentos = this._getDadosPagamentos(sPath);

				// É preciso criar uma cópia do objeto para inserir aos dados do model.
				// Se inserir a referência existente no model, ambas as linhas apontam ao mesmo objeto tendo seus valores atualizados ao mesmo tempo.
				var oObject = jQuery.extend(true, {}, oEvent.getSource().getBindingContext().getObject());
				oObject.principal = 0;

				// O índice do objeto duplicado é o índice do objeto original + 1
				var index = Number(sPath.substring(sPath.lastIndexOf("/") + 1, sPath.length)) + 1;

				//Limpa Valores não utilizados do objeto copiado
				oObject.data_pagamento = "";
				oObject.juros = "";
				oObject.multa = "";
				oObject.total = "0";
				oObject.numero_documento = "";
				oObject.id_pagamento = -1;

				// Insere o objeto duplicado no índice
				aDadosPagamentos.splice(index, 0, oObject);

				this.getModel().refresh();
			},

			handleSuggest: function (oEvent) {
				var oInput = oEvent.getSource();
				if (!oInput.getSuggestionItems().length) {
					oInput.bindAggregation("suggestionItems", {
						path: 'opcoesNameOfTax',
						template: new sap.ui.core.Item({
							text: "{name_of_tax}"
						})
					});
				}
			},

			handleSuggest2: function (oEvent) {
				var oInput = oEvent.getSource();
				if (!oInput.getSuggestionItems().length) {
					oInput.bindAggregation("suggestionItems", {
						path: '/DominioMoeda',
						template: new sap.ui.core.Item({
							text: "{AcroNome}"
						})
					});
				}
			},

			onExcluirLinha: function (oEvent) {
				var that = this;

				var oExcluir = oEvent.getSource().getBindingContext().getObject();
				var aDadosPagamentos = this._getDadosPagamentos(oEvent.getSource().getBindingContext().getPath());

				var dialog = new sap.m.Dialog({
					title: this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsConfirmation"),
					type: "Message",
					content: new sap.m.Text({
						text: this.getView().getModel("i18n").getResourceBundle().getText(
							"ViewDetalheTrimestreJSTextsVocetemcertezaquedesejaexcluiralinha")
					}),
					beginButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralSim"),
						press: function () {
							for (var i = 0; i < aDadosPagamentos.length; i++) {
								if (aDadosPagamentos[i] === oExcluir) {
									aDadosPagamentos.splice(i, 1);
									that.getModel().refresh();
									break;
								}
							}

							dialog.close();
						}
					}),
					endButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralCancelar"),
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

			onTrocarIndNaoAplicavel: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();

				if (!!oPagamento.ind_nao_aplicavel) {
					oPagamento.administracao_governamental = "";
					oPagamento.estado = "";
					oPagamento.cidade = "";
					oPagamento.projeto = "";
					oPagamento.descricao = "";
					oPagamento.data_pagamento = null;
					oPagamento.tipo_transacao_outros = "";
					oPagamento.principal = 0;
					oPagamento.juros = 0;
					oPagamento.multa = 0;
					oPagamento.total = 0;
					oPagamento.numero_documento = "";
					oPagamento.entidade_beneficiaria = "";
					oPagamento["fk_dominio_moeda.id_dominio_moeda"] = null;
					oPagamento["AcroNome"] = "";
					oPagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"] = null;
					oPagamento["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"] = null;
					oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] = null;
					oPagamento["fk_dominio_pais.id_dominio_pais"] = null;
				}
			},

			onPreencherEntidade: function (oEvent) {
				var oPagamento = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				//var sEntidade = oEvent.getSource().getValue();
				/*var aAllTaxas = this.getModel().getProperty("/Collected/Tax").concat(this.getModel().getProperty("/Borne/Tax"));
				for (var j = 0; j < aAllTaxas.length; j++) {
					if (aAllTaxas[j]["id_tax"] == oPagamento["fk_tax.id_tax"]) {
						if (aAllTaxas[j]["tax"] !== null && aAllTaxas[j]["tax"] != undefined && aAllTaxas[j]["tax"] != "") {
							if (aAllTaxas[j]["tax"].toLowerCase() == "Tax Withheld on payments to overseas group companies".toLowerCase()) {
								if (sEntidade == "" || sEntidade === null || sEntidade == undefined) {
									oPagamento.entidadeValueState = sap.ui.core.ValueState.Error;
								} else {
									oPagamento.entidadeValueState = sap.ui.core.ValueState.None;
								}
							}
						}
					}
				}*/
				if (oPagamento["ind_requer_beneficiary_company"]) {
					if (oPagamento.entidade_beneficiaria == "" || oPagamento.entidade_beneficiaria == null) {
						oPagamento.entidadeValueState = sap.ui.core.ValueState.Error;;	
					}else{
						oPagamento.entidadeValueState = sap.ui.core.ValueState.None;
					}
				} 
				else{
					oPagamento.entidadeValueState = sap.ui.core.ValueState.None;
				}
			},

			onTrocarTax: function (oEvent) {
				// Pega o objeto do tax para ser capaz de recuperar a fk de category
				var sTaxPath = oEvent.getSource().getSelectedItem().getBindingContext().getPath(),
					oTax = this.getModel().getObject(sTaxPath);

				// Pega o objeto do pagamento e seta sua category como a category do tax selecionado
				var oPagamento = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				oPagamento["fk_category.id_tax_category"] = oTax["fk_category.id_tax_category"];

				//Verifica se o campo de entidade deve ser marcado como obrigatorio ou nao...
				if ((oTax.tax) != undefined && (oTax.tax) !== null) {
					if ((oTax.tax).toLowerCase() === "Tax Withheld on payments to overseas group companies".toLowerCase()) {
						if (oPagamento["entidade_beneficiaria"] == "" || oPagamento["entidade_beneficiaria"] === null || oPagamento[
								"entidade_beneficiaria"] === undefined) {
							oPagamento.entidadeValueState = sap.ui.core.ValueState.Error;
						}
					} else {
						oPagamento.entidadeValueState = sap.ui.core.ValueState.None;
					}
				}

				var that = this;

				// Limpa as opções de name of tax..
				oPagamento.opcoesNameOfTax = [];
				oPagamento.name_of_tax = "";
				oPagamento["fk_name_of_tax.id_name_of_tax"] = "";

				// Caso o tax selecionado seja valido, recupera a lista de name of tax padrão relacionado ao país da empresa e este tax
				if (oTax.id_tax) {
					var idPais = this.getModel().getProperty("/Empresa")["fk_pais.id_pais"];
					NodeAPI.listarRegistros("Pais/" + idPais + "/NameOfTax?default=true&tax=" + oTax.id_tax, function (response) {
						if (response) {
							response.unshift({});
							oPagamento.opcoesNameOfTax = response;
							that.getModel().refresh();
						}
					});
				}

				if (oTax["ind_requer_beneficiary_company"]) {
					if (oPagamento.entidade_beneficiaria == "" ||
						oPagamento.entidade_beneficiaria === null ||
						oPagamento["entidade_beneficiaria"] === undefined) {
						oPagamento.entidadeValueState = sap.ui.core.ValueState.Error;
					}
				} else
					oPagamento.entidadeValueState = sap.ui.core.ValueState.None;
			},

			onCalcularTotal: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();

				if (oPagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"] == 2) {
					oPagamento.principal = Math.abs(oPagamento.principal ? oPagamento.principal : 0) * -1;
					oPagamento.juros = Math.abs(oPagamento.juros ? oPagamento.juros : 0) * -1;
					oPagamento.multa = Math.abs(oPagamento.multa ? oPagamento.multa : 0) * -1;
				}

				var fPrincipal = oPagamento.principal ? Number(oPagamento.principal) : 0,
					fJuros = oPagamento.juros ? Number(oPagamento.juros) : 0,
					fMulta = oPagamento.multa ? Number(oPagamento.multa) : 0;

				oPagamento.total = (fPrincipal + fJuros + fMulta).toFixed(2);
				this.getModel().refresh();
			},

			navToHome: function () {
				var that = this;
				this._confirmarCancelamento(function () {
					that._limparModel();
					that.getRouter().navTo("selecaoModulo");
				});
			},

			navToPage2: function () {
				var that = this;
				this._confirmarCancelamento(function () {
					that._limparModel();
					that.getRouter().navTo("ttcListagemEmpresas", {
						parametros: that.toURIComponent({
							idAnoCalendario: that.getModel().getProperty("/AnoCalendario")["idAnoCalendario"],
							nomeUsuario: that.getModel().getProperty("/NomeUsuario")
						})
					});
				});
			},

			navToPage3: function () {
				var that = this;

				this._confirmarCancelamento(function () {
					that._navToResumoTrimestre();
				});
			},

			_pegarLabelPeriodoDetalheTrimestre: function (iNumeroOrdem) {
				var sLabelTraduzido;

				//sLabelBanco = sLabelBanco.toLowerCase().trim();
				switch (true) {
				case iNumeroOrdem === 1: //sLabelBanco.includes("1"):
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo1");
					break;
				case iNumeroOrdem === 2: //sLabelBanco.includes("2"):
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo2");
					break;
				case iNumeroOrdem === 3: //sLabelBanco.includes("3"):
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo3");
					break;
				case iNumeroOrdem === 4: //sLabelBanco.includes("4"):
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo4");
					break;
				case iNumeroOrdem === 5: //sLabelBanco === "anual":
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo5");
					break;
				case iNumeroOrdem >= 6: //sLabelBanco === "retificadora":
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo6");
					break;
				}

				return sLabelTraduzido;
			},

			_onRouteMatched: function (oEvent) {
				var oParameters = this.fromURIComponent(oEvent.getParameter("arguments").oParameters);
				Utils.displayFormat(this);
				this.getModel().setProperty("/Empresa", oParameters.oEmpresa);
				this.getModel().setProperty("/Periodo", oParameters.oPeriodo);
				this.getModel().setProperty("/AnoCalendario", oParameters.oAnoCalendario);
				this.getModel().setProperty("/LabelPeriodo", this._pegarLabelPeriodoDetalheTrimestre(oParameters.oPeriodo.numero_ordem));
				this.getModel().setProperty("/NomeUsuario", oParameters.nomeUsuario);

				this._resolverMinMaxDate(oParameters.oPeriodo);

				var that = this;

				NodeAPI.listarRegistros("Pais/" + this.getModel().getProperty("/Empresa")["fk_pais.id_pais"], function (response) { // Pegando pais pela fk da empresa
					if (response) {
						that.getModel().setProperty("/Pais", response);
					}
				});

				NodeAPI.listarRegistros("TaxCategory?classification=1", function (response) { // Classification=Borne
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/Borne/TaxCategory", Utils.orderByArrayParaBox(response, "category"));
					}
				});

				NodeAPI.listarRegistros("TaxCategory?classification=2", function (response) { // Classification=Collected
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/Collected/TaxCategory", Utils.orderByArrayParaBox(response, "category"));
					}
				});

				NodeAPI.listarRegistros("DeepQuery/Tax?classification=1", function (response) { // Classification=Borne
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/Borne/Tax", Utils.orderByArrayParaBox(response, "tax"));
					}
				});

				NodeAPI.listarRegistros("DeepQuery/Tax?classification=2", function (response) { // Classification=Collected
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/Collected/Tax", Utils.orderByArrayParaBox(response, "tax"));
					}
				});

				NodeAPI.listarRegistros("Pais/" + oParameters.oEmpresa["fk_pais.id_pais"] + "/NameOfTax?default=true", function (response) {
					if (response) {
						that.getModel().setProperty("/NameOfTaxPadrao", Utils.orderByArrayParaBox(response, "name_of_tax"));
					}
				});

				NodeAPI.listarRegistros("DominioJurisdicao", function (response) {
					if (response) {
						response.unshift({});
						for (var i = 0, length = response.length; i < length; i++) {
							response[i]["jurisdicao"] = Utils.traduzJurisdicao(response[i]["id_dominio_jurisdicao"], that);
						}
						that.getModel().setProperty("/DominioJurisdicao", Utils.orderByArrayParaBox(response, "jurisdicao"));
					}
				});

				NodeAPI.listarRegistros("DominioPais", function (response) {
					if (response) {
						response.unshift({});
						for (var i = 0, length = response.length; i < length; i++) {
							response[i]["pais"] = Utils.traduzDominioPais(response[i]["id_dominio_pais"], that);
						}
						that.getModel().setProperty("/DominioPais", Utils.orderByArrayParaBox(response, "pais"));
					}
				});

				NodeAPI.listarRegistros("DominioAnoFiscal", function (response) {
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/DominioAnoFiscal", response);
					}
				});

				NodeAPI.listarRegistros("DominioMoeda", function (response) {
					if (response) {
						//response.unshift({});
						for (var i = 0; i < response.length; i++) {
							var oResponse = response[i];
							response[i].AcroNome = response[i]["acronimo"] + " - " + response[i]["nome"];
						}
						that.getModel().setProperty("/DominioMoeda", Utils.orderByArrayParaBox(response, "AcroNome"));
						that._carregarPagamentos();
					}
				});

				NodeAPI.listarRegistros("DominioTipoTransacao", function (response) {
					if (response) {
						response.unshift({});
						for (var i = 0, length = response.length; i < length; i++) {
							response[i]["tipo_transacao"] = Utils.traduzTipoTransacao(response[i]["id_dominio_tipo_transacao"], that);
						}
						that.getModel().setProperty("/DominioTipoTransacao", Utils.orderByArrayParaBox(response, "tipo_transacao"));
					}
				});

				//this._carregarPagamentos();
			},

			_confirmarCancelamento: function (onConfirm) {
				var dialog = new sap.m.Dialog({
					title: this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsConfirmation"),
					type: "Message",
					content: new sap.m.Text({
						text: this.getView().getModel("i18n").getResourceBundle().getText(
							"viewDetalhesTrimestreJStextsVocêtemcertezaquedesejacancelaraedição")
					}),
					beginButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralSim"),
						press: function () {
							dialog.close();
							if (onConfirm) {
								onConfirm();
							}
						}
					}),
					endButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralCancelar"),
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

			_navToResumoTrimestre: function () {
				this._limparModel();

				var oEmpresaSelecionada = this.getModel().getProperty("/Empresa");
				var sIdAnoCalendarioSelecionado = this.getModel().getProperty("/AnoCalendario").idAnoCalendario;
				var nomeUsuario = this.getModel().getProperty("/NomeUsuario");

				this.getRouter().navTo("ttcResumoTrimestre", {
					oEmpresa: this.toURIComponent(oEmpresaSelecionada),
					idAnoCalendario: this.toURIComponent(sIdAnoCalendarioSelecionado),
					nomeUsuario: this.toURIComponent(nomeUsuario)
				});
			},

			_carregarPagamentos: function () {
				this._dadosPagamentosBorne.length = 0;
				this._dadosPagamentosCollected.length = 0;

				var sIdEmpresa = this.getModel().getProperty("/Empresa").id_empresa;
				var sIdPeriodo = this.getModel().getProperty("/Periodo").id_periodo;
				var sIdPais = this.getModel().getProperty("/Empresa")["fk_pais.id_pais"];

				var that = this;

				this.byId("dynamicPage").setBusyIndicatorDelay(100);
				this.byId("dynamicPage").setBusy(true);

				jQuery.when(
					NodeAPI.listarRegistros("/DeepQuery/Pagamento?empresa=" + sIdEmpresa + "&periodo=" + sIdPeriodo + "&tax_classification=1"), // tax_classification = BORNE
					NodeAPI.listarRegistros("/DeepQuery/Pagamento?empresa=" + sIdEmpresa + "&periodo=" + sIdPeriodo + "&tax_classification=2") // tax_classification = COLLECTED
				).done(function (response1, response2) {
					if (response1) {
						for (var i = 0; i < response1[0].length; i++) {
							// VERIFICAR JURISDICAO
							response1[0][i].estadoValueState = sap.ui.core.ValueState.None;
							response1[0][i].cidadeValueState = sap.ui.core.ValueState.None;
							response1[0][i].entidadeValueState = sap.ui.core.ValueState.None;
							response1[0][i].fkDominioTipoTransacaoAnterior = response1[0][i]["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"];

							var aDominioMoedas = that.getModel().getProperty("/DominioMoeda");
							var encontrada = aDominioMoedas.find(function (x) {
								//return x["fk_obrigacao_acessoria.id_obrigacao_acessoria"] === oObrigacao["id_obrigacao_acessoria"];
								//return x["fk_id_modelo_obrigacao.id_modelo"] === oObrigacao["tblModeloObrigacao.id_modelo"];
								return (x["id_dominio_moeda"] === response1[0][i]["fk_dominio_moeda.id_dominio_moeda"]);
							});
							if (encontrada) {
								response1[0][i]["AcroNome"] = encontrada["AcroNome"];
							} else {
								response1[0][i]["AcroNome"] = "";
							}
							

							/*response1[0][i].principal = response1[0][i].principal ? Number(response1[0][i].principal).toFixed(2) : 0;
							response1[0][i].juros = response1[0][i].juros ? Number(response1[0][i].juros).toFixed(2) : 0;
							response1[0][i].multa = response1[0][i].multa ? Number(response1[0][i].multa).toFixed(2) : 0;
							response1[0][i].total = response1[0][i].total ? Number(response1[0][i].total).toFixed(2) : 0;*/
							that._dadosPagamentosBorne.push(response1[0][i]);
							(function (counter) {
								NodeAPI.listarRegistros("Pais/" + sIdPais + "/NameOfTax?default=true&tax=" + response1[0][counter].id_tax, function (
									innerResponse1) {
									if (innerResponse1) {
										innerResponse1.unshift({});
										that._dadosPagamentosBorne[counter].opcoesNameOfTax = innerResponse1;
										that.getModel().refresh();
									}
								});
							})(i);
						}
					}

					if (response2) {
						for (var j = 0; j < response2[0].length; j++) {
							response2[0][j].estadoValueState = sap.ui.core.ValueState.None;
							response2[0][j].cidadeValueState = sap.ui.core.ValueState.None;
							response2[0][j].entidadeValueState = sap.ui.core.ValueState.None;
							response2[0][j].fkDominioTipoTransacaoAnterior = response2[0][j]["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"];

							var aDominioMoedas = that.getModel().getProperty("/DominioMoeda");
							var encontrada = aDominioMoedas.find(function (x) {
								//return x["fk_obrigacao_acessoria.id_obrigacao_acessoria"] === oObrigacao["id_obrigacao_acessoria"];
								//return x["fk_id_modelo_obrigacao.id_modelo"] === oObrigacao["tblModeloObrigacao.id_modelo"];
								return (x["id_dominio_moeda"] === response2[0][j]["fk_dominio_moeda.id_dominio_moeda"]);
							});
							if (encontrada) {
								response2[0][j]["AcroNome"] = encontrada["AcroNome"];
							} else {
								response2[0][j]["AcroNome"] = "";
							}
						
							/*response1[0][j].principal = response1[0][j].principal ? Number(response1[0][j].principal).toFixed(2) : 0;
							response1[0][j].juros = response1[0][j].juros ? Number(response1[0][j].juros).toFixed(2) : 0;
							response1[0][j].multa = response1[0][j].multa ? Number(response1[0][j].multa).toFixed(2) : 0;
							response1[0][j].total = response1[0][j].total ? Number(response1[0][j].total).toFixed(2) : 0;*/
							that._dadosPagamentosCollected.push(response2[0][j]);
							(function (counter) {
								NodeAPI.listarRegistros("Pais/" + sIdPais + "/NameOfTax?default=true&tax=" + response2[0][counter].id_tax, function (
									innerResponse2) {
									if (innerResponse2) {
										innerResponse2.unshift({});
										that._dadosPagamentosCollected[counter].opcoesNameOfTax = innerResponse2;
										that.getModel().refresh();
									}
								});
							})(j);
						}
					}

					that.getModel().refresh();
					that.byId("dynamicPage").setBusy(false);
				});
			},

			_getDadosPagamentos: function (sObjectPath) {
				return sObjectPath.toUpperCase().indexOf("BORNE") > -1 ? this._dadosPagamentosBorne : this._dadosPagamentosCollected;
			},

			_novoPagamento: function () {
				return {
					"id_pagamento": -1,
					"ind_nao_aplicavel": false,
					"administracao_governamental": "",
					"estado": "",
					"cidade": "",
					"projeto": "",
					"descricao": "",
					"data_pagamento": null,
					"tipo_transacao_outros": "",
					"principal": 0,
					"juros": 0,
					"multa": 0,
					"total": 0,
					"numero_documento": "",
					"entidade_beneficiaria": "",
					"fk_dominio_moeda.id_dominio_moeda": null,
					"fk_dominio_tipo_transacao.id_dominio_tipo_transacao": null,
					"fk_dominio_ano_fiscal.id_dominio_ano_fiscal": null,
					"fk_jurisdicao.id_dominio_jurisdicao": null,
					"fk_dominio_pais.id_dominio_pais": this.getModel().getProperty("/Pais")[0]["fk_dominio_pais.id_dominio_pais"],
					"fk_name_of_tax.id_name_of_tax": null,
					"fk_empresa.id_empresa": this.getModel().getProperty("/Empresa").id_empresa,
					"fk_periodo.id_periodo": this.getModel().getProperty("/Periodo").id_periodo,
					"opcoesNameOfTax": [],
					"fk_category.id_tax_category": null,
					"fk_tax.id_tax": null,
					"name_of_tax": "",
					"estadoValueState": sap.ui.core.ValueState.None,
					"cidadeValueState": sap.ui.core.ValueState.None,
					"entidadeValueState": sap.ui.core.ValueState.None,
					"AcroNome": ""
				};
			},

			_inserirPagamentos: function (callback, oButton) {
				this.byId("dynamicPage").setBusyIndicatorDelay(100);
				this.byId("dynamicPage").setBusy(true);

				var sIdEmpresa = this.getModel().getProperty("/Empresa").id_empresa,
					sIdPeriodo = this.getModel().getProperty("/Periodo").id_periodo,
					aPagamentos = this._dadosPagamentosBorne.concat(this._dadosPagamentosCollected);

				var continua = true;
				var MoedaSelecionada;
				var aDominioMoedas = this.getModel().getProperty("/DominioMoeda");

				var nameOfTaxSelecionado;
				var aDominioNameOfTax;
				for (var i = 0; i < aPagamentos.length; i++) {
					//delete aPagamentos[i].opcoesNameOfTax;
					aDominioNameOfTax = aPagamentos[i]["opcoesNameOfTax"];
					MoedaSelecionada = aPagamentos[i]["AcroNome"];

					nameOfTaxSelecionado = aPagamentos[i]["name_of_tax"];

					var encontradaName = aDominioNameOfTax.find(function (x) {
						return (x["name_of_tax"] === nameOfTaxSelecionado);
					});
					if (encontradaName) {
						aPagamentos[i]["fk_name_of_tax.id_name_of_tax"] = encontradaName["id_name_of_tax"];
					}

					var encontrada = aDominioMoedas.find(function (x) {
						//return x["fk_obrigacao_acessoria.id_obrigacao_acessoria"] === oObrigacao["id_obrigacao_acessoria"];
						//return x["fk_id_modelo_obrigacao.id_modelo"] === oObrigacao["tblModeloObrigacao.id_modelo"];
						return (x["AcroNome"] === MoedaSelecionada);

					});
					if (encontrada) {
						aPagamentos[i]["fk_dominio_moeda.id_dominio_moeda"] = encontrada["id_dominio_moeda"];
					} else {
						continua = false;
					}
					if ((!!aPagamentos[i]["ind_nao_aplicavel"]) == true) {
						continua = true;
					}
					/*aPagamentos[i].principal = Utils.stringMoedaParaFloat(aPagamentos[i].principal);
					aPagamentos[i].juros = Utils.stringMoedaParaFloat(aPagamentos[i].juros);
					aPagamentos[i].multa = Utils.stringMoedaParaFloat(aPagamentos[i].multa);*/
				}

				var that = this;
				if (continua) {
					NodeAPI.criarRegistro("/Pagamento", {
						empresa: sIdEmpresa,
						periodo: sIdPeriodo,
						pagamentos: JSON.stringify(aPagamentos)
					}, function (response) {
						that.byId("dynamicPage").setBusy(false);
						if (callback) {
							callback(response);
						}
					});
				} else {
					var that = this;
					var dialog = new sap.m.Dialog({
						title: this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsAtencao"),
						type: "Message",
						content: new sap.m.Text({
							text: this.getView().getModel("i18n").getResourceBundle().getText(
								"viewTTCDetalheTrimestreMoedaNaoValidaJs")
						}),
						endButton: new sap.m.Button({
							text: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralFechar"),
							press: function () {
								dialog.close();
							}
						}),
						afterClose: function () {
							dialog.destroy();
							that.byId("dynamicPage").setBusy(false);
							oButton.setEnabled(true);
						}
					});
					dialog.open();
				}

			},

			_limparModel: function () {
				this._dadosPagamentosBorne.length = 0;
				this._dadosPagamentosCollected.length = 0;
			},

			_resolverMinMaxDate: function (oPeriodo) {
				var oMinDate,
					oMaxDate,
					iCurrentYear = this.getModel().getProperty("/AnoCalendario").anoCalendario;

				switch (oPeriodo.numero_ordem) {
				case 1:
					// 01 jan a 31 mar
					oMinDate = new Date(iCurrentYear, 0, 1);
					oMaxDate = new Date(iCurrentYear, 2, 31);
					break;
				case 2:
					// 01 abr a 30 jun
					oMinDate = new Date(iCurrentYear, 3, 1);
					oMaxDate = new Date(iCurrentYear, 5, 30);
					break;
				case 3:
					// 01 jul a 30 set
					oMinDate = new Date(iCurrentYear, 6, 1);
					oMaxDate = new Date(iCurrentYear, 8, 30);
					break;
				case 4:
					// 01 out a 31 dez
					oMinDate = new Date(iCurrentYear, 9, 1);
					oMaxDate = new Date(iCurrentYear, 11, 31);
					break;
				}

				this.getModel().setProperty("/MinDate", oMinDate);
				this.getModel().setProperty("/MaxDate", oMaxDate);
				this.getModel().refresh();
			},

			_salvar: function (oEvent, callback) {
				var that = this,
					oButton = oEvent.getSource(),
					dialog = null;

				if (!this._isFormularioValido()) {
					dialog = new sap.m.Dialog({
						title: this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsAtencao"),
						type: "Message",
						content: new sap.m.Text({
							text: this.getView().getModel("i18n").getResourceBundle().getText(
								"ViewDetalheTrimestreJSTextsTodososcamposmarcadossãodepreenchimentoobrigatório")
						}),
						endButton: new sap.m.Button({
							text: this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsFechar"),
							press: function () {
								dialog.close();
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					});

					dialog.open();
				}
				/*else if (!this._existemPagamentosObrigatorios()) {
					dialog = new sap.m.Dialog({
						title: "Atenção",
						type: "Message",
						content: new sap.m.Text({
							text: "Existem pagamentos obrigatórios não declarados.\nDeseja mesmo continuar?"
						}),
						beginButton: new sap.m.Button({
							text: "Continuar",
							press: function () {
								dialog.close();
								oButton.setEnabled(false);
				
								that._inserirPagamentos(function (response) {
									oButton.setEnabled(true);
				
									var json = JSON.parse(response);
									
									if (callback) {
										callback(json);
									}
								});
							}
						}),	
						endButton: new sap.m.Button({
							text: "Cancelar",
							press: function () {
								dialog.close();
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					});
	
					dialog.open();
				}*/
				else {
					this._checarTaxDeclarados(function () {
						oButton.setEnabled(false);

						that._inserirPagamentos(function (response) {
							oButton.setEnabled(true);

							var json = JSON.parse(response);

							if (callback) {
								callback(json);
							}
						}, oButton);
					});
				}
			},

			_checarTaxDeclarados: function (callback) {
				var aPagamento = this._dadosPagamentosBorne.concat(this._dadosPagamentosCollected);

				var aTax = this.getModel().getProperty("/Borne/Tax").concat(this.getModel().getProperty("/Collected/Tax")).filter(function (obj) {
					return obj.id_tax;
				});

				var msgBorne = [];
				var msgCollected = [];

				for (var i = 0, length = aTax.length; i < length; i++) {
					var oPagamentoComTax = aPagamento.filter(function (obj) {
						return Number(obj["fk_tax.id_tax"]) === Number(aTax[i].id_tax);
					});

					if (!oPagamentoComTax.length) {
						if (aTax[i].id_dominio_tax_classification === 1) {
							msgBorne.push(aTax[i].tax);
						} else {
							msgCollected.push(aTax[i].tax);
						}
					}
				}

				if (msgBorne.length || msgCollected.length) {
					var oVBox = new sap.m.VBox();

					var oHBox = new sap.m.HBox({
						justifyContent: "Center"
					}).addItem(new sap.m.Text({
						text: this.getResourceBundle().getText("viewTTCDetalheTrimestreMensagemAvisoImpostoNaoDeclarado")
					}).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBottom"));

					oVBox.addItem(oHBox);

					var criarPainelTax = function (aMsgTax, sTitulo) {
						if (aMsgTax.length) {
							var oPanel = new sap.m.Panel({
								expandable: true,
								expanded: false,
								headerText: sTitulo
							});

							var oHBoxInterno = new sap.m.VBox();

							for (var i = 0, length = aMsgTax.length; i < length; i++) {
								var oText = new sap.m.Text({
									text: aMsgTax[i]
								}).addStyleClass("bulletItem");

								oHBoxInterno.addItem(oText);
							}

							oPanel.addContent(oHBoxInterno);

							oVBox.addItem(oPanel);
						}
					};

					criarPainelTax(msgBorne, this.getResourceBundle().getText("viewGeralBorne"));

					criarPainelTax(msgCollected, this.getResourceBundle().getText("viewGeralCollected"));

					var dialog = new sap.m.Dialog({
						contentHeight: "150px",
						title: this.getResourceBundle().getText("viewGeralAviso"),
						type: "Message",
						content: oVBox,
						endButton: new sap.m.Button({
							text: this.getResourceBundle().getText("viewGeralContinuar"),
							press: function () {
								dialog.close();
							}
						}),
						afterClose: function () {
							dialog.destroy();

							if (callback) {
								callback();
							}
						}
					}).addStyleClass("sapUiNoContentPadding");

					dialog.open();
				} else {
					if (callback) {
						callback();
					}
				}
			},

			_isFormularioValido: function () {
				var bValido = true,
					aPagamentos = this._dadosPagamentosBorne.concat(this._dadosPagamentosCollected);

				for (var i = 0, length = aPagamentos.length; i < length && bValido; i++) {
					var oPagamento = aPagamentos[i];
					
					//Verifica a necessidade de Entidade
					var boolEntidadeBeneficiaria = false;
					var aAllTaxas = this.getModel().getProperty("/Collected/Tax").concat(this.getModel().getProperty("/Borne/Tax"));
					for (var j = 0; j < aAllTaxas.length; j++) {
						if (aAllTaxas[j]["id_tax"] == oPagamento["fk_tax.id_tax"] && aAllTaxas[j]["tax"] && aAllTaxas[j]["ind_requer_beneficiary_company"]) {
							boolEntidadeBeneficiaria = true;
							break;
						}
					}

					//verifica a necessidade de Estado e cidade
					var JurisdicaoTest = "";
					if (oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] == 1) {
						JurisdicaoTest = false;
					} else if (oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] == 2) {
						JurisdicaoTest = !oPagamento.estado;
					} else if (oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] == 3) {
						JurisdicaoTest = (!oPagamento.estado || !oPagamento.cidade);
					}

					//verificar a necessidade de outros tipos de transacao
					var OutrosTiposTest = false;
					if (oPagamento["tipo_transacao_outros_value_state"] == sap.ui.core.ValueState.Error) {
						OutrosTiposTest = true;
					}

					//var achouValor = aAllTaxas.find()
					if ((!!!oPagamento.ind_nao_aplicavel && (!oPagamento["fk_tax.id_tax"] || !oPagamento[
								"fk_dominio_ano_fiscal.id_dominio_ano_fiscal"] ||
							/*!oPagamento["fk_dominio_moeda.id_dominio_moeda"] ||*/
							!oPagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"] || ((
								boolEntidadeBeneficiaria == false) ? (false) : (!oPagamento.entidade_beneficiaria)) || !oPagamento[
								"fk_dominio_pais.id_dominio_pais"] || !oPagamento.principal || !oPagamento["fk_jurisdicao.id_dominio_jurisdicao"]
							//|| ((oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] == 1) ? (false) : (!oPagamento.estado || !oPagamento.cidade))
							|| JurisdicaoTest || OutrosTiposTest || !oPagamento.data_pagamento || !oPagamento.name_of_tax || !Validador.isNumber(
								oPagamento
								.principal))) || (!!
							!
							oPagamento.ind_nao_aplicavel && (!oPagamento["fk_tax.id_tax"] || !oPagamento.name_of_tax))) {
						bValido = false;
					}
				}

				return bValido;
			},

			_existemPagamentosObrigatorios: function () {
				var bExiste = true,
					aPagamentos = this._dadosPagamentosBorne.concat(this._dadosPagamentosCollected);

				var aNameOfTaxPadrao = this.getModel().getProperty("/NameOfTaxPadrao");

				if (aNameOfTaxPadrao) {
					for (var i = 0, length = aNameOfTaxPadrao.length; i < length && bExiste; i++) {

						var oPagamento = aPagamentos.find(function (pagamento) {
							var fkNameOfTax = -1;
							if (Validador.isNumber(pagamento["fk_name_of_tax.id_name_of_tax"])) {
								fkNameOfTax = Number(pagamento["fk_name_of_tax.id_name_of_tax"]);
							}
							return fkNameOfTax === aNameOfTaxPadrao[i].id_name_of_tax;
						});

						if (!oPagamento) {
							bExiste = false;
						}
					}
				}

				return bExiste;
			},

			onTrocarTipoTransacao: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();

				var entrouEmCashRefund = function () {
					return oPagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"] == 2 && oPagamento.fkDominioTipoTransacaoAnterior != 2;
				};

				var saiuDeCashRefund = function () {
					return oPagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"] != 2 && oPagamento.fkDominioTipoTransacaoAnterior == 2;
				};

				var isOtherSpecify = function () {
					return oPagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"] == 5;
				};

				if (entrouEmCashRefund() || saiuDeCashRefund()) {
					oPagamento.principal = 0;
					oPagamento.juros = 0;
					oPagamento.multa = 0;
					this.onCalcularTotal(oEvent);
				}

				if (!isOtherSpecify()) {
					oPagamento.tipo_transacao_outros = "";
					oPagamento["tipo_transacao_outros_value_state"] = sap.ui.core.ValueState.None;
				} else {
					oPagamento["tipo_transacao_outros_value_state"] = sap.ui.core.ValueState.Error;
				}

				oPagamento.fkDominioTipoTransacaoAnterior = oPagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"];

				this.getModel().refresh();
			},
			onTrocarTipoTransacaoOutros: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();
				if (oPagamento["tipo_transacao_outros"]) {
					oPagamento["tipo_transacao_outros_value_state"] = sap.ui.core.ValueState.None;
				} else {
					oPagamento["tipo_transacao_outros_value_state"] = sap.ui.core.ValueState.Error;
				}
			}
		});
	}
);