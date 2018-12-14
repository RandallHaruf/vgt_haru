sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/jQueryMask",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, NodeAPI, Validador, jQueryMask, Utils) {
		"use strict";

		return BaseController.extend("ui5ns.ui5.controller.ttc.DetalheTrimestre", {
			onInit: function () {
				var that = this;
				
				//jQuery(".money input").mask("000.000.000.000.000,00", {reverse: true});
				
				/*this._dadosPagamentos =  [
					{
						"isNA": false,
						"idClassification": 1,
						"classification": "Tax Borne",
						"fk_category.id_tax_category": 1,
						"category": "Taxes on Profits",
						"fk_tax.id_tax": 1,
						"tax": "Corporate Income Tax",
						"nameOfTax": "",
						"nameOfGov": "",
						"idJurisdicao": 1,
						"jurisdicao": "Federal",
						"idPais": 1,
						"state": "Rio de Janeiro",
						"city": "Rio de Janeiro",
						"anoFiscal": 2015,
						"description": "",
						"dateOfPayment": "2018-05-15",
						"currency": "USD",
						"currencyRate": 1.2,
						"idTypeOfTransaction": 1,
						"typeOfTransaction": "Cash Installment/Settlement",
						"otherSpecify": "",
						"principal": 999999999.99,
						"interest": 999999999.99,
						"fine": 999999999.99,
						"value":999999999.99,
						"valueUSD": 999999999.99,
						"numberOfDocument": "",
						"beneficiaryCompany": "",
						opcoesNameOfTax: []
					},
					{
						"isNA": false,
						"idClassification": 1,
						"classification": "Tax Borne",
						"fk_category.id_tax_category": 1,
						"category": "Taxes on Profits",
						"fk_tax.id_tax": 1,
						"tax": "Corporate Income Tax",
						"nameOfTax": "",
						"nameOfGov": "",
						"idJurisdicao": 1,
						"jurisdicao": "Federal",
						"idPais": 1,
						"state": "Rio de Janeiro",
						"city": "Rio de Janeiro",
						"anoFiscal": 2016,
						"description": "",
						"dateOfPayment": "2018-05-18",
						"currency": "USD",
						"currencyRate": 1.2,
						"idTypeOfTransaction": 1,
						"typeOfTransaction": "Cash Installment/Settlement",
						"otherSpecify": "",
						"principal": 999999999.99,
						"interest": 999999999.99,
						"fine": 999999999.99,
						"value":999999999.99,
						"valueUSD": 999999999.99,
						"numberOfDocument": "",
						"beneficiaryCompany": "",
						opcoesNameOfTax: []
					},
					{
						"isNA": false,
						"idClassification": 2,
						"classification": "Tax Collected",
						"fk_category.id_tax_category": 1,
						"category": "Taxes on Profits",
						"fk_tax.id_tax": 2,
						"tax": "Taxes withheld on payments of dividends (only) to overseas group companies",
						"nameOfTax": "",
						"nameOfGov": "",
						"idJurisdicao": 2,
						"jurisdicao": "Estadual",
						"idPais": 1,
						"state": "Rio de Janeiro",
						"city": "Rio de Janeiro",
						"anoFiscal": 2016,
						"description": "",
						"dateOfPayment": "2018-05-16",
						"currency": "GBP",
						"currencyRate": 1.8,
						"idTypeOfTransaction": 1,
						"typeOfTransaction": "Cash Installment/Settlement",
						"otherSpecify": "",
						"principal": 999999999.99,
						"interest": 999999999.99,
						"fine": 999999999.99,
						"value":999999999.99,
						"valueUSD": 999999999.99,
						"numberOfDocument": "",
						"beneficiaryCompany": "",
						opcoesNameOfTax: []
					}
				];*/

				this._dadosPagamentosBorne = [];
				this._dadosPagamentosCollected = [];

				var oModel = new sap.ui.model.json.JSONModel({
					ValueState: sap.ui.core.ValueState.Error,
					 MinDate: null,
					 MaxDate: null,
					"pagamentos": that._dadosPagamentos,
					"opcoesClassification": [{
						"id": 1,
						"texto": "Tax Borne"
					}, {
						"id": 2,
						"texto": "Tax Collected"
					}],
					"opcoesCategory": [{
						"id": 1,
						"texto": "Taxes on Profits"
					}, {
						"id": 2,
						"texto": "Taxes on People"
					}],
					"opcoesTax": [{
						"id": 1,
						"texto": "Corporate Income Tax",
						"idClassification": 1,
						"fk_category.id_tax_category": 1
					}, {
						"id": 2,
						"texto": "Taxes withheld on payments of dividends (only) to overseas group companies",
						"idClassification": 2,
						"fk_category.id_tax_category": 1
					}],
					"opcoesJurisdicao": [{
						"id": 1,
						"texto": "Federal"
					}, {
						"id": 2,
						"texto": "Estadual"
					}, {
						"id": 3,
						"texto": "Municipal"
					}],
					"opcoesPais": [{
						"id": 1,
						"texto": "Brasil"
					}],
					"opcoesAnoFiscal": [{
						"texto": 2015
					}, {
						"texto": 2016
					}, {
						"texto": 2017
					}, {
						"texto": 2018
					}],
					"opcoesCurrency": [{
						"texto": "USD"
					}, {
						"texto": "GBP"
					}, {
						"texto": "BRL"
					}],
					"opcoesTypeOfTransaction": [{
						"id": 1,
						"texto": "Cash Installment/Settlement"
					}, {
						"id": 2,
						"texto": "Cash refund/reimbursment (negative value)"
					}, {
						"id": 3,
						"texto": "Payment with income tax credits"
					}, {
						"id": 4,
						"texto": "Payment with other tax credits"
					}, {
						"id": 5,
						"texto": "Other (specify)"
					}],
					Borne: {
						Pagamentos: that._dadosPagamentosBorne,
						TaxCategory: [],
						Tax: [],
						NameOfTax: []
					},
					Collected: {
						Pagamentos: that._dadosPagamentosCollected,
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
				if(sIdJurisdicao == "1"){//Federal
					oPagamento.estadoValueState = sap.ui.core.ValueState.None;
					oPagamento.cidadeValueState = sap.ui.core.ValueState.None;
				}
				else if (sIdJurisdicao == "2"){ //Estadual
					if(oPagamento["estado"] == "" || oPagamento["estado"] === null){
						oPagamento.estadoValueState = sap.ui.core.ValueState.Error;
					}
					oPagamento.cidadeValueState = sap.ui.core.ValueState.None;
				}
				else if (sIdJurisdicao == "3") {//Municipal
					if(oPagamento["estado"] == "" || oPagamento["estado"] === null){
						oPagamento.estadoValueState = sap.ui.core.ValueState.Error;
					}
					if(oPagamento["cidade"] == "" || oPagamento["cidade"] === null){
						oPagamento.cidadeValueState = sap.ui.core.ValueState.Error;
					}
				}
				
			},
			onPreencherEstado: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();
				var sTextoCampo = oEvent.getSource().getValue();
				if(oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] == 2 || oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] == 3){
					if(sTextoCampo != "" && sTextoCampo != undefined && sTextoCampo !== null){
					oPagamento.estadoValueState = sap.ui.core.ValueState.None;
					}
					else{
						oPagamento.estadoValueState = sap.ui.core.ValueState.Error;
					}
				}
			},
			onPreencherCidade: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();
				var sTextoCampo = oEvent.getSource().getValue();
				
				if(oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] == 3){
					if(sTextoCampo != "" && sTextoCampo != undefined && sTextoCampo != null){
					oPagamento.cidadeValueState = sap.ui.core.ValueState.None;
					}
					else{
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
				oObject["data_pagamento"] = "";
				oObject["juros"] = "";
				oObject["multa"] = "";
				oObject["total"] = "0";
				oObject["numero_documento"] = "";
				
				// Insere o objeto duplicado no índice
				aDadosPagamentos.splice(index, 0, oObject);
				
				this.getModel().refresh();
			},

			onExcluirLinha: function (oEvent) {
				var that = this;

				var oExcluir = oEvent.getSource().getBindingContext().getObject();
				var aDadosPagamentos = this._getDadosPagamentos(oEvent.getSource().getBindingContext().getPath());

				var dialog = new sap.m.Dialog({
					title: this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsConfirmation"),
					type: "Message",
					content: new sap.m.Text({
						text: this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsVocetemcertezaquedesejaexcluiralinha")
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
				
				if (oPagamento.ind_nao_aplicavel) {
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
					oPagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"] = null;
					oPagamento["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"] = null;
					oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] = null;
					oPagamento["fk_dominio_pais.id_dominio_pais"] = null;
				}
			},
			onPreencherEntidade: function (oEvent){
				var oPagamento = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				var sEntidade = oEvent.getSource().getValue();
				var aAllTaxas = this.getModel().getProperty("/Collected/Tax").concat(this.getModel().getProperty("/Borne/Tax"));
				for(var j = 0; j< aAllTaxas.length; j++){
					if(aAllTaxas[j]["id_tax"] == oPagamento["fk_tax.id_tax"]){
						if(aAllTaxas[j]["tax"] !== null && aAllTaxas[j]["tax"] != undefined && aAllTaxas[j]["tax"] != ""){
							if(aAllTaxas[j]["tax"].toLowerCase() == "Tax Withheld on payments to overseas group companies".toLowerCase()){
								if(sEntidade == "" || sEntidade === null || sEntidade == undefined){
									oPagamento.entidadeValueState = sap.ui.core.ValueState.Error;			
								}
								else{
									oPagamento.entidadeValueState = sap.ui.core.ValueState.None;
								}
							}	
						}
					}
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
				if((oTax.tax) != undefined && (oTax.tax) !== null){
					if ((oTax.tax).toLowerCase() === "Tax Withheld on payments to overseas group companies".toLowerCase()){
						if (oPagamento["entidade_beneficiaria"] == "" || oPagamento["entidade_beneficiaria"] === null || oPagamento["entidade_beneficiaria"] === undefined) {
							oPagamento.entidadeValueState = sap.ui.core.ValueState.Error;
						}
					}
					else {
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
				
			},
			
			onCalcularTotal: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();
				
				/*var fPrincipal = Utils.stringMoedaParaFloat(oPagamento.principal),
					fJuros = Utils.stringMoedaParaFloat(oPagamento.juros),
					fMulta = Utils.stringMoedaParaFloat(oPagamento.multa);*/
					
				var fPrincipal = oPagamento.principal ? Number(oPagamento.principal) : 0,
					fJuros = oPagamento.juros ? Number(oPagamento.juros) : 0,
					fMulta = oPagamento.multa ? Number(oPagamento.multa) : 0;
				
				oPagamento.total = (fPrincipal + fJuros + fMulta).toFixed(2);
				this.getModel().refresh();
				
				jQuery(".money.total input").trigger("input");
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
					that.getRouter().navTo("ttcListagemEmpresas");
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
					case iNumeroOrdem === 1://sLabelBanco.includes("1"):
						sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo1");
						break;
					case iNumeroOrdem === 2://sLabelBanco.includes("2"):
						sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo2");
						break;
					case iNumeroOrdem === 3://sLabelBanco.includes("3"):
						sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo3");
						break;
					case iNumeroOrdem === 4://sLabelBanco.includes("4"):
						sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo4");
						break;
					case iNumeroOrdem === 5://sLabelBanco === "anual":
						sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo5");
						break;
					case iNumeroOrdem >= 6://sLabelBanco === "retificadora":
						sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo6");
						break;
				}
				
				return sLabelTraduzido;
			},

			_onRouteMatched: function (oEvent) {
				var oParameters = JSON.parse(oEvent.getParameter("arguments").oParameters);

				this.getModel().setProperty("/Empresa", oParameters.oEmpresa);
				this.getModel().setProperty("/Periodo", oParameters.oPeriodo);
				this.getModel().setProperty("/AnoCalendario", oParameters.oAnoCalendario);
				this.getModel().setProperty("/LabelPeriodo", this._pegarLabelPeriodoDetalheTrimestre(oParameters.oPeriodo.numero_ordem));

				this._resolverMinMaxDate(oParameters.oPeriodo);
			
				var that = this;

				NodeAPI.listarRegistros("Pais/" + this.getModel().getProperty("/Empresa")["fk_pais.id_pais"] , function (response) { // Pegando pais pela fk da empresa
					if (response) {
						that.getModel().setProperty("/Pais", response);
					}
				});

				NodeAPI.listarRegistros("TaxCategory?classification=1", function (response) { // Classification=Borne
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/Borne/TaxCategory", response);
					}
				});
				
				NodeAPI.listarRegistros("TaxCategory?classification=2", function (response) { // Classification=Collected
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/Collected/TaxCategory", response);
					}
				});

				NodeAPI.listarRegistros("DeepQuery/Tax?classification=1", function (response) { // Classification=Borne
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/Borne/Tax", response);
					}
				});

				NodeAPI.listarRegistros("DeepQuery/Tax?classification=2", function (response) { // Classification=Collected
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/Collected/Tax", response);
					}
				});
				
				NodeAPI.listarRegistros("Pais/" + oParameters.oEmpresa["fk_pais.id_pais"] + "/NameOfTax?default=true", function (response) {
					if (response) {
						that.getModel().setProperty("/NameOfTaxPadrao", response);
					}
				});

				NodeAPI.listarRegistros("DominioJurisdicao", function (response) {
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/DominioJurisdicao", response);
					}
				});

				NodeAPI.listarRegistros("DominioPais", function (response) {
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/DominioPais", response);
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
						response.unshift({});
						that.getModel().setProperty("/DominioMoeda", response);
					}
				});

				NodeAPI.listarRegistros("DominioTipoTransacao", function (response) {
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/DominioTipoTransacao", response);
					}
				});

				this._carregarPagamentos();
			},

			_confirmarCancelamento: function (onConfirm) {
				var dialog = new sap.m.Dialog({
					title: this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsConfirmation"),
					type: "Message",
					content: new sap.m.Text({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewDetalhesTrimestreJStextsVocêtemcertezaquedesejacancelaraedição")
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
						text:  this.getView().getModel("i18n").getResourceBundle().getText("viewGeralCancelar"),
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

				this.getRouter().navTo("ttcResumoTrimestre", {
					oEmpresa: JSON.stringify(oEmpresaSelecionada),
					idAnoCalendario: sIdAnoCalendarioSelecionado
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
					NodeAPI.listarRegistros("/DeepQuery/Pagamento?empresa=" + sIdEmpresa + "&periodo=" + sIdPeriodo + "&tax_classification=2")  // tax_classification = COLLECTED
				).done(function (response1, response2) {
					if (response1) {
						for (var i = 0; i < response1[0].length; i++) {
							// VERIFICAR JURISDICAO
							response1[0][i].estadoValueState = sap.ui.core.ValueState.None;
							response1[0][i].cidadeValueState = sap.ui.core.ValueState.None;
							response1[0][i].entidadeValueState = sap.ui.core.ValueState.None;
							/*response1[0][i].principal = response1[0][i].principal ? Number(response1[0][i].principal).toFixed(2) : 0;
							response1[0][i].juros = response1[0][i].juros ? Number(response1[0][i].juros).toFixed(2) : 0;
							response1[0][i].multa = response1[0][i].multa ? Number(response1[0][i].multa).toFixed(2) : 0;
							response1[0][i].total = response1[0][i].total ? Number(response1[0][i].total).toFixed(2) : 0;*/
							that._dadosPagamentosBorne.push(response1[0][i]);
							(function (counter) {
								NodeAPI.listarRegistros("Pais/" + sIdPais + "/NameOfTax?default=true&tax=" + response1[0][counter].id_tax, function (innerResponse1) {
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
							/*response1[0][j].principal = response1[0][j].principal ? Number(response1[0][j].principal).toFixed(2) : 0;
							response1[0][j].juros = response1[0][j].juros ? Number(response1[0][j].juros).toFixed(2) : 0;
							response1[0][j].multa = response1[0][j].multa ? Number(response1[0][j].multa).toFixed(2) : 0;
							response1[0][j].total = response1[0][j].total ? Number(response1[0][j].total).toFixed(2) : 0;*/
							that._dadosPagamentosCollected.push(response2[0][j]);
							(function (counter) {
								NodeAPI.listarRegistros("Pais/" + sIdPais + "/NameOfTax?default=true&tax=" + response2[0][counter].id_tax, function (innerResponse2) {
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

				/*this._dadosPagamentosBorne.length = 0;
				this._dadosPagamentosBorne.push({
					"id_pagamento": 1,
					"ind_nao_aplicavel": false,
					"administracao_governamental": "TESTE",
					"estado": "TESTE",
					"cidade": "TESTE",
					"projeto": "TESTE",
					"descricao": "TESTE",
					"data_pagamento": "2018-10-09",
					"tipo_transacao_outros": "TESTE",
					"principal": 999999999.99,
					"juros": 999999999.99,
					"multa": 999999999.99,
					"total": 999999999.99,
					"numero_documento": "AAAAAAAA",
					"entidade_beneficiaria": "TESTE",
					"fk_dominio_moeda.id_dominio_moeda": 1,
					"fk_dominio_tipo_transacao.id_dominio_tipo_transacao": 1,
					"fk_dominio_ano_fiscal.id_dominio_ano_fiscal": 1,
					"fk_jurisdicao.id_dominio_jurisdicao": 1,
					"fk_dominio_pais.id_dominio_pais": 1,
					"fk_name_of_tax.id_name_of_tax": null,
					"fk_empresa.id_empresa": 1,
					"fk_periodo.id_periodo": 4,
					"opcoesNameOfTax": [],
					"fk_category.id_tax_category": null,
					"fk_tax.id_tax": null,
					"name_of_tax": ""
				}, {
					"id_pagamento": 1,
					"ind_nao_aplicavel": false,
					"administracao_governamental": "TESTE",
					"estado": "TESTE",
					"cidade": "TESTE",
					"projeto": "TESTE",
					"descricao": "TESTE",
					"data_pagamento": "2018-10-09",
					"tipo_transacao_outros": "TESTE",
					"principal": 999999999.99,
					"juros": 999999999.99,
					"multa": 999999999.99,
					"total": 999999999.99,
					"numero_documento": "AAAAAAAA",
					"entidade_beneficiaria": "TESTE",
					"fk_dominio_moeda.id_dominio_moeda": 1,
					"fk_dominio_tipo_transacao.id_dominio_tipo_transacao": 1,
					"fk_dominio_ano_fiscal.id_dominio_ano_fiscal": 1,
					"fk_jurisdicao.id_dominio_jurisdicao": 1,
					"fk_dominio_pais.id_dominio_pais": 1,
					"fk_name_of_tax.id_name_of_tax": 78,
					"fk_empresa.id_empresa": 1,
					"fk_periodo.id_periodo": 4,
					"opcoesNameOfTax": [],
					"fk_category.id_tax_category": null,
					"fk_tax.id_tax": 1,
					"name_of_tax": "Meu Name of Tax Customizado"
				});
				
				this._dadosPagamentosCollected.length = 0;
				this._dadosPagamentosCollected.push({
					"id_pagamento": 2,
					"ind_nao_aplicavel": false,
					"administracao_governamental": "TESTE",
					"estado": "TESTE",
					"cidade": "TESTE",
					"projeto": "TESTE",
					"descricao": "TESTE",
					"data_pagamento": "2018-10-09",
					"tipo_transacao_outros": "TESTE",
					"principal": 999999999.99,
					"juros": 999999999.99,
					"multa": 999999999.99,
					"total": 999999999.99,
					"numero_documento": "AAAAAAAA",
					"entidade_beneficiaria": "TESTE",
					"fk_dominio_moeda.id_dominio_moeda": 1,
					"fk_dominio_tipo_transacao.id_dominio_tipo_transacao": 1,
					"fk_dominio_ano_fiscal.id_dominio_ano_fiscal": 1,
					"fk_jurisdicao.id_dominio_jurisdicao": 1,
					"fk_dominio_pais.id_dominio_pais": 1,
					"fk_name_of_tax.id_name_of_tax": null,
					"fk_empresa.id_empresa": 1,
					"fk_periodo.id_periodo": 4,
					"opcoesNameOfTax": [],
					"fk_category.id_tax_category": null,
					"fk_tax.id_tax": null,
					"name_of_tax": ""
				});
				
				this.getModel().refresh();*/
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
					"entidadeValueState": sap.ui.core.ValueState.None
				};
			},

			_inserirPagamentos: function (callback) {
				this.byId("dynamicPage").setBusyIndicatorDelay(100);
				this.byId("dynamicPage").setBusy(true);

				var sIdEmpresa = this.getModel().getProperty("/Empresa").id_empresa,
					sIdPeriodo = this.getModel().getProperty("/Periodo").id_periodo,
					aPagamentos = this._dadosPagamentosBorne.concat(this._dadosPagamentosCollected);

				for (var i = 0; i < aPagamentos.length; i++) {
					delete aPagamentos[i].opcoesNameOfTax;
					
					/*aPagamentos[i].principal = Utils.stringMoedaParaFloat(aPagamentos[i].principal);
					aPagamentos[i].juros = Utils.stringMoedaParaFloat(aPagamentos[i].juros);
					aPagamentos[i].multa = Utils.stringMoedaParaFloat(aPagamentos[i].multa);*/
				}

				var that = this;

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
			},

			_limparModel: function () {
				this._dadosPagamentosBorne.length = 0;
				this._dadosPagamentosCollected.length = 0;
			},
			
			_resolverMinMaxDate: function (oPeriodo) {
				var oMinDate,
					oMaxDate,
					iCurrentYear = new Date().getFullYear();
				
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
							text: this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsTodososcamposmarcadossãodepreenchimentoobrigatório")
						}),
						endButton: new sap.m.Button({
							text:  this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsFechar"),
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
					oButton.setEnabled(false);
				
					this._inserirPagamentos(function (response) {
						oButton.setEnabled(true);
	
						var json = JSON.parse(response);
						
						if (callback) {
							callback(json);
						}
					});
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
					for(var j = 0; j< aAllTaxas.length; j++){
						if(aAllTaxas[j]["id_tax"] == oPagamento["fk_tax.id_tax"]){
							if(aAllTaxas[j]["tax"] !== null && aAllTaxas[j]["tax"] != undefined && aAllTaxas[j]["tax"] != ""){
								if(aAllTaxas[j]["tax"].toLowerCase() == "Tax Withheld on payments to overseas group companies".toLowerCase()){
								boolEntidadeBeneficiaria = true;
								}	
							}
						}
					}
					
					//verifica a necessidade de Estado e cidade
					var JurisdicaoTest = "";
					if(oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] == 1){
						JurisdicaoTest = false;
					}
					else if (oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] == 2){
						JurisdicaoTest = !oPagamento.estado;
					}
					else if (oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] == 3){
						JurisdicaoTest = (!oPagamento.estado || !oPagamento.cidade);
					}
					
					//var achouValor = aAllTaxas.find()
					if ((!oPagamento.ind_nao_aplicavel
							&& (!oPagamento["fk_tax.id_tax"]
							|| !oPagamento["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]
							|| !oPagamento["fk_dominio_moeda.id_dominio_moeda"]
							|| !oPagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"]
							|| ((boolEntidadeBeneficiaria == false) ? (false) : (!oPagamento.entidade_beneficiaria))
							|| !oPagamento["fk_dominio_pais.id_dominio_pais"]
							|| !oPagamento.principal
							|| !oPagamento["fk_jurisdicao.id_dominio_jurisdicao"]
                            //|| ((oPagamento["fk_jurisdicao.id_dominio_jurisdicao"] == 1) ? (false) : (!oPagamento.estado || !oPagamento.cidade))
                            || JurisdicaoTest
							|| !oPagamento.data_pagamento
							|| !oPagamento.name_of_tax
							|| !Validador.isNumber(oPagamento.principal)))
							|| (!oPagamento.ind_nao_aplicavel 
								&& (!oPagamento["fk_tax.id_tax"] 
								|| !oPagamento.name_of_tax))) {
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
			onTipoTransacaoChange: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();
				if (oPagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"] == 2) {
					oPagamento[""] = (Math.abs(oPagamento[""])) * -1;
				}
			}
		});
	}
);