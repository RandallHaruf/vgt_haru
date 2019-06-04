sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/lib/jszip",
		"ui5ns/ui5/lib/XLSX"
	],
	function (BaseController, NodeAPI, Validador, Utils) {
		"use strict";

		return BaseController.extend("ui5ns.ui5.controller.ttc.DetalheTrimestre", {
			onInit: function () {
				//sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR");

				this._dadosPagamentosBorne = [];
				this._dadosPagamentosCollected = [];
				this.emBrancoTraduzido = this.getResourceBundle().getText("emBrancoTraduzido");
				
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
					},
					documentosVigentes: [],
					linhasDocumentos: [],
					documentosNaoVigentes: []
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
				}, true);
            },
			
			onImportarDadosSubstituir: function(oEvent){
				var aDocumentosVigentes = this.getModel().getProperty("/documentosVigentes");
				if(aDocumentosVigentes.length){
						var dialog = new sap.m.Dialog({
							title: "Nova Diferença",
							content: oForm,
							beginButton: new sap.m.Button({
								text: "salvar",
								press: function () {
									this.getModel().setProperty("/substituirDados", true);
									this.onImportarDados(oEvent);
									dialog.close();
								}.bind(this)
							}),
							endButton: new sap.m.Button({
								text: "sair",
								press: function () {
									dialog.close();
								}.bind(this)
							}),
							afterClose: function() {
								dialog.destroy();
							}
						});
		
						// to get access to the global model
						this.getView().addDependent(dialog);
						
						dialog.open();
					}
					else{
						this.getModel().setProperty("/substituirDados", true);
						this.onImportarDados(oEvent);
					}
			},
			
			onImportarDadosAdicionar: function(oEvent){
				this.getModel().setProperty("/substituirDados", false);
				this.onImportarDados(oEvent);
			},
			
			onImportarDados: function (oEvent){
				var that = this,
					eventSource = oEvent.getSource();
				try {
					if (eventSource.getValue()) {
						var file = eventSource.oFileUpload.files[0];
		
						var reader = new FileReader();
		
						reader.onload = function (e) {
							try {
								var data = e.target.result;
			
								var workbook = that._lerPlanilha(data);
								var bSubstituirDados = that.getModel().getProperty("/substituirDados");
								that._importarValores(bSubstituirDados, workbook,that);
								
								eventSource.setValue("");
							}
							catch (err) {
								eventSource.setValue("");
								that._exibirErroImportacao(err.message);
							}
						};
		
						reader.onerror = function (ex) {
							eventSource.setValue("");
							that._exibirErroImportacao(ex.message);
						};
		
						reader.readAsBinaryString(file);
					}
				}
				catch (e) {
					eventSource.setValue("");
					this._exibirErroImportacao(e.message);
				}
			},
			
			_lerPlanilha: function (data) {
				var that = this;
				
				var workbook = XLSX.read(data, {
					type: 'binary'
				});	
				
				try {
					if (workbook.Sheets["Borne"]["A1"].v === "Tax"
						&& workbook.Sheets["Borne"]["B1"].v === "Goverment administration/body (payee name)"
						&& workbook.Sheets["Borne"]["C1"].v === "Jurisdiction"
						&& workbook.Sheets["Borne"]["D1"].v === "Country"
						&& workbook.Sheets["Borne"]["E1"].v === "State"
						&& workbook.Sheets["Borne"]["F1"].v === "City"
						&& workbook.Sheets["Borne"]["G1"].v === "Project"
						&& workbook.Sheets["Borne"]["H1"].v === "Fiscal Year"
						&& workbook.Sheets["Borne"]["I1"].v === "Description"
						&& workbook.Sheets["Borne"]["J1"].v === "Date of Payment (MM/DD/YYYY)"
						&& workbook.Sheets["Borne"]["K1"].v === "Currency"
						&& workbook.Sheets["Borne"]["L1"].v === "Type of Transaction"
						&& workbook.Sheets["Borne"]["M1"].v === "Other Type of Transactions"
						&& workbook.Sheets["Borne"]["N1"].v === "Value"
						&& workbook.Sheets["Borne"]["O1"].v === "Interest"
						&& workbook.Sheets["Borne"]["P1"].v === "Fine"
						&& workbook.Sheets["Borne"]["Q1"].v === "Total Value"
						&& workbook.Sheets["Borne"]["R1"].v === "Document ID"
						&& workbook.Sheets["Borne"]["S1"].v === "Beneficiary entity"
						&& workbook.Sheets["Collected"]["A1"].v === "Tax"
						&& workbook.Sheets["Collected"]["B1"].v === "Goverment administration/body (payee name)"
						&& workbook.Sheets["Collected"]["C1"].v === "Jurisdiction"
						&& workbook.Sheets["Collected"]["D1"].v === "Country"
						&& workbook.Sheets["Collected"]["E1"].v === "State"
						&& workbook.Sheets["Collected"]["F1"].v === "City"
						&& workbook.Sheets["Collected"]["G1"].v === "Project"
						&& workbook.Sheets["Collected"]["H1"].v === "Fiscal Year"
						&& workbook.Sheets["Collected"]["I1"].v === "Description"
						&& workbook.Sheets["Collected"]["J1"].v === "Date of Payment (MM/DD/YYYY)"
						&& workbook.Sheets["Collected"]["K1"].v === "Currency"
						&& workbook.Sheets["Collected"]["L1"].v === "Type of Transaction"
						&& workbook.Sheets["Collected"]["M1"].v === "Other Type of Transactions"
						&& workbook.Sheets["Collected"]["N1"].v === "Value"
						&& workbook.Sheets["Collected"]["O1"].v === "Interest"
						&& workbook.Sheets["Collected"]["P1"].v === "Fine"
						&& workbook.Sheets["Collected"]["Q1"].v === "Total Value"
						&& workbook.Sheets["Collected"]["R1"].v === "Document ID"
						&& workbook.Sheets["Collected"]["S1"].v === "Beneficiary entity"
						&& workbook.Sheets["Dados"]) {
						var ws = workbook.Sheets["Dados"];
						return workbook;	
					}
					else {
						throw new Error(that.getResourceBundle().getText("viewGeralPlanilhaForaDoPadrao"));
					}
				}
				catch (e) {
					console.log("Planilha fora do padrão: " + e.message)
					throw new Error(that.getResourceBundle().getText("viewGeralPlanilhaForaDoPadrao") + ": \n" + e.message);
				}
			},
			
			_exibirErroImportacao: function (sErro) {
				var conteudo;
				if(typeof sErro == "object"){
					if(Array.isArray(sErro)){
						var oVBox = new sap.m.VBox();
	
						var oHBox = new sap.m.HBox({
							justifyContent: "Center"
						}).addItem(new sap.m.Text({
							
						}).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBottom"));
	
						oVBox.addItem(oHBox);
	
						var criarPainelTax = function (oMsgErro) {
							if (oMsgErro.erros.length) {
								var erros = "";
								for(let i = 0; i< oMsgErro.erros.length; i++){
									erros += (erros.length != 0 ? "\n-" + oMsgErro.erros[i] : "-" + oMsgErro.erros[i]);
								}
								var oPanel = new sap.m.Panel({
									expandable: true,
									expanded: false,
									headerText: oMsgErro.title
								});
	
								var oHBoxInterno = new sap.m.VBox();
	
								var oText = new sap.m.Text({
									text: erros
								});

								oHBoxInterno.addItem(oText);
								oPanel.addContent(oHBoxInterno);
								oVBox.addItem(oPanel);
							}
						};
						for(let i = 0; i < sErro.length; i++){
							criarPainelTax(sErro[i]);
						}
						conteudo = oVBox;
					}
				}
				else{
					conteudo = new sap.m.Text({
							text: sErro
						});
				}
				var scrolContainer = new sap.m.ScrollContainer({
					width:"450px",
					height:"450px",
					vertical:true
					});
					scrolContainer.addContent(conteudo);
				var dialog = new sap.m.Dialog({
					title: this.getResourceBundle().getText("viewGeralMensagemErroImport"),
					type: "Message",
					content: scrolContainer,
					width:"300px",
					height:"450px",
					endButton: new sap.m.Button({
						text: "OK",
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
			
			_importarValores: function (bSubstituir,planilha,that){
				if(bSubstituir)	{
					that.getModel().setProperty("/Borne/Pagamentos",[]);
					that.getModel().setProperty("/Collected/Pagamentos",[]);
					that._dadosPagamentosBorne = [];
					that._dadosPagamentosCollected = [];
				}
				var borne = XLSX.utils.sheet_to_row_object_array(planilha.Sheets["Borne"], {'date_format':'dd/mm/yyyy'});
				var collected = XLSX.utils.sheet_to_row_object_array(planilha.Sheets["Collected"], {'date_format':'dd/mm/yyyy'});
				var aPagamentosBorne = that.getModel().getProperty("/Borne/Pagamentos");
				var aPagamentosBorneAux = [];
				var aPagamentosCollected = that.getModel().getProperty("/Collected/Pagamentos");
				var aPagamentosCollectedAux = [];
				var pagamento;
				var aErrosTotais = [];
				var fkEmpresa = this.getModel().getProperty("/Empresa").id_empresa;
				var fkPeriodo = this.getModel().getProperty("/Periodo").id_periodo;
				that._limparLinhasBorne();
				for(let i = 0; i < borne.length; i++){
					let tipoTransacao;
					var valoresCorretos = true;
					switch(borne[i]["Type of Transaction"]){
						case "Cash Installment/Settlement":
							tipoTransacao = 1;
							break;
						case "Cash refund/reimbursement (negative value)":
							tipoTransacao = 2;
							if(Math.sign(borne[i]["Value"]) != -1 || Math.sign(borne[i]["Interest"]) != -1 || Math.sign(borne[i]["Fine"]) != -1){
								valoresCorretos = false;
							}
							break;
						case "Other (specify)":
							tipoTransacao = 5;
							break;
						case "Payment with income tax credits":
							tipoTransacao = 3;
							break;
						case "Payment with other tax credits":
							tipoTransacao = 4;
							break;
					}
					
					if(this.checarLinhaPreenchida(borne[i])){
						if(borne[i]["Tax KEY"] && borne[i]["Country KEY"] && borne[i]["Fiscal Year KEY"] && borne[i]["Currency KEY"] && valoresCorretos) {
							pagamento = {};
							let jurisdicao;
							
							switch(borne[i]["Jurisdiction"]){
								case "City":
									jurisdicao = 3;
									break;
								case "Federal":
									jurisdicao = 1;
									break;
								case "State":
									jurisdicao = 2;
									break;
							}
							pagamento["id_pagamento"] = -1;
							pagamento["ind_nao_aplicavel"] = false;
							pagamento["fk_tax.id_tax"] = Number(borne[i]["Tax KEY"]);
							pagamento.administracao_governamental = borne[i]["Goverment administration/body (payee name)"] ? borne[i]["Goverment administration/body (payee name)"] : "";
							pagamento["fk_jurisdicao.id_dominio_jurisdicao"] = jurisdicao;
							pagamento["fk_dominio_pais.id_dominio_pais"] = Number(borne[i]["Country KEY"]);
							pagamento["estado"] = borne[i]["State"] ? borne[i]["State"] : "";
							pagamento["cidade"] = borne[i]["City"] ? borne[i]["City"] : "";
							pagamento["projeto"] = borne[i]["Project"] ? borne[i]["Project"] : "";
							pagamento["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"] = Number(borne[i]["Fiscal Year KEY"]);
							pagamento["descricao"] = borne[i]["Description"] ? borne[i]["Description"] : "";
							pagamento["data_pagamento"] = borne[i]["Date of Payment (MM/DD/YYYY)"] ? convertExcelNumberToData(borne[i]["Date of Payment (MM/DD/YYYY)"]) : "";
							pagamento["AcroNome"] = borne[i]["Currency"] ? borne[i]["Currency"] : "";
							pagamento["fk_dominio_moeda.id_dominio_moeda"] = Number(borne[i]["Currency KEY"]);
							pagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"] = tipoTransacao;
							pagamento["tipo_transacao_outros"] = borne[i]["Other Type of Transactions"] ? borne[i]["Other Type of Transactions"] : "";
							pagamento["principal"] = borne[i]["Value"] ? borne[i]["Value"] : "0";
							pagamento["juros"] = borne[i]["Interest"] ? borne[i]["Interest"] : "0";
							pagamento["multa"] = borne[i]["Fine"] ? Number(borne[i]["Fine"]) : "0";
							//pagamento["total"] = Number(borne[i]["Total Value"]);
							pagamento["numero_documento"] = borne[i]["Document ID"] ? borne[i]["Document ID"] : null;
							pagamento["entidade_beneficiaria"] = borne[i]["Beneficiary entity"] ? borne[i]["Beneficiary entity"] : null;
							pagamento["fk_empresa.id_empresa"] = fkEmpresa;
					        pagamento["fk_periodo.id_periodo"] = fkPeriodo;
					        pagamento["novo"] = "Success";
							this.onTrocarJurisdicaoImport(pagamento);
							this.onTrocarPaisImport(pagamento);
							this.onTrocarAnoFiscalImport(pagamento);
							this.onTrocarTipoTransacaoImport(pagamento);
							this.onTrocarTaxImport(pagamento,"Borne");
							this.onCalcularTotalImport(pagamento);
							aPagamentosBorneAux.push(pagamento);
						}
						else{
							var oErro = {};
							oErro.erros = [];
							if(!borne[i]["Tax KEY"]){
								oErro.erros.push(that.getResourceBundle().getText("viewTTCTaxaObrigatoria"));
							}
							if(!borne[i]["Country KEY"]){
								oErro.erros.push(that.getResourceBundle().getText("viewTTCPaisObrigatorio"));
							}
							if(!borne[i]["Fiscal Year KEY"]){
								oErro.erros.push(that.getResourceBundle().getText("viewTTCAnoFiscalObrigatorio"));
							}
							if(!borne[i]["Currency KEY"]){
								oErro.erros.push(that.getResourceBundle().getText("viewTTCMoedaObrigatorio"));
							}
							if(!valoresCorretos){
								oErro.erros.push(that.getResourceBundle().getText("viewTTCSinalValor"));
							}
							oErro.title = that.getResourceBundle().getText("viewTTCErroLinha") + " " + (i + 2) + " " + that.getResourceBundle().getText("viewTTCAbaBorne");
							aErrosTotais.push(oErro);
						}
					}
				}	
					
				that._limparLinhasCollected();
				for(let i = 0; i < collected.length; i++){
					let tipoTransacao;
					var valoresCorretos = true;
					switch(collected[i]["Type of Transaction"]){
						case "Cash Installment/Settlement":
							tipoTransacao = 1;
							break;
						case "Cash refund/reimbursement (negative value)":
							tipoTransacao = 2;
							if(Math.sign(borne[i]["Value"]) != -1 || Math.sign(borne[i]["Interest"]) != -1 || Math.sign(borne[i]["Fine"]) != -1){
								valoresCorretos = false;
							}
							break;
						case "Other (specify)":
							tipoTransacao = 5;
							break;
						case "Payment with income tax credits":
							tipoTransacao = 3;
							break;
						case "Payment with other tax credits":
							tipoTransacao = 4;
							break;
					}
					
					if(this.checarLinhaPreenchida(collected[i])){
						if(collected[i]["Tax KEY"] && collected[i]["Country KEY"] && collected[i]["Fiscal Year KEY"] && collected[i]["Currency KEY"] && valoresCorretos) {
							pagamento = {};
							let jurisdicao;
							
							switch(collected[i]["Jurisdiction"]){
								case "City":
									jurisdicao = 3;
									break;
								case "Federal":
									jurisdicao = 1;
									break;
								case "State":
									jurisdicao = 2;
									break;
							}
							pagamento["id_pagamento"] = -1;
							pagamento["ind_nao_aplicavel"] = false;
							pagamento["fk_tax.id_tax"] = Number(collected[i]["Tax KEY"]);
							pagamento.administracao_governamental = collected[i]["Goverment administration/body (payee name)"] ? collected[i]["Goverment administration/body (payee name)"] : "";
							pagamento["fk_jurisdicao.id_dominio_jurisdicao"] = jurisdicao;
							pagamento["fk_dominio_pais.id_dominio_pais"] = Number(collected[i]["Country KEY"]);
							pagamento["estado"] = collected[i]["State"] ? collected[i]["State"] : "";
							pagamento["cidade"] = collected[i]["City"] ? collected[i]["City"] : "";
							pagamento["projeto"] = collected[i]["Project"] ? collected[i]["Project"] : "";
							pagamento["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"] = Number(collected[i]["Fiscal Year KEY"]);
							pagamento["descricao"] = collected[i]["Description"] ? collected[i]["Description"] : "";
							pagamento["data_pagamento"] = collected[i]["Date of Payment (MM/DD/YYYY)"] ? convertExcelNumberToData(collected[i]["Date of Payment (MM/DD/YYYY)"]) : "";
							pagamento["AcroNome"] = collected[i]["Currency"] ? collected[i]["Currency"] : "";
							pagamento["fk_dominio_moeda.id_dominio_moeda"] = Number(collected[i]["Currency KEY"]);
							pagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"] = tipoTransacao;
							pagamento["tipo_transacao_outros"] = collected[i]["Other Type of Transactions"] ? collected[i]["Other Type of Transactions"] : "";
							pagamento["principal"] = collected[i]["Value"] ? collected[i]["Value"] : "0";
							pagamento["juros"] = collected[i]["Interest"] ? collected[i]["Interest"] : "0";
							pagamento["multa"] = collected[i]["Fine"] ? collected[i]["Fine"] : "0";
							//pagamento["total"] = Number(collected[i]["Total Value"]);
							pagamento["numero_documento"] = collected[i]["Document ID"] ? collected[i]["Document ID"] : null;
							pagamento["entidade_beneficiaria"] = collected[i]["Beneficiary entity"] ? collected[i]["Beneficiary entity"] : null;
							pagamento["fk_empresa.id_empresa"] = fkEmpresa;
					        pagamento["fk_periodo.id_periodo"] = fkPeriodo;
							this.onTrocarJurisdicaoImport(pagamento);
							this.onTrocarPaisImport(pagamento);
							this.onTrocarAnoFiscalImport(pagamento);
							this.onTrocarTipoTransacaoImport(pagamento);
							this.onTrocarTaxImport(pagamento,"Collected");
							this.onCalcularTotalImport(pagamento);
							aPagamentosCollectedAux.push(pagamento);
						}
						else{
							var oErro = {};
							oErro.erros = [];
							if(!collected[i]["Tax KEY"]){
								oErro.erros.push(that.getResourceBundle().getText("viewTTCTaxaObrigatoria"));
							}
							if(!collected[i]["Country KEY"]){
								oErro.erros.push(that.getResourceBundle().getText("viewTTCPaisObrigatorio"));
							}
							if(!collected[i]["Fiscal Year KEY"]){
								oErro.erros.push(that.getResourceBundle().getText("viewTTCAnoFiscalObrigatorio"));
							}
							if(!collected[i]["Currency KEY"]){
								oErro.erros.push(that.getResourceBundle().getText("viewTTCMoedaObrigatorio"));
							}
							if(!valoresCorretos){
								oErro.erros.push(that.getResourceBundle().getText("viewTTCSinalValor"));
							}
							oErro.title = that.getResourceBundle().getText("viewTTCErroLinha") + " " + (i + 2) + " " + that.getResourceBundle().getText("viewTTCAbaCollected");
							aErrosTotais.push(oErro);
						}
					}
				}
				if(aErrosTotais.length){
					that._exibirErroImportacao(aErrosTotais);
				}
				else{
					var aPagamentosB = aPagamentosBorne.concat(aPagamentosBorneAux);
					var aPagamentosC = aPagamentosCollected.concat(aPagamentosCollectedAux);
					that._dadosPagamentosBorne = aPagamentosB;
					that._dadosPagamentosCollected = aPagamentosC;
					that.getModel().setProperty("/Borne/Pagamentos", aPagamentosB);
					that.getModel().setProperty("/Collected/Pagamentos", aPagamentosC);
					that.getModel().refresh();
					that.byId("tableBorne").refreshRows();
					that._paintNewLine("tableBorne");
                    that._remontarAbaDocumentos();
					//that.byId("tableCollected").refreshRows();
					//this._paintNewLine("tableCollected");
				}
				that.getModel().setProperty("/ContadorBorne", that._dadosPagamentosBorne.length);
				that.getModel().setProperty("/ContadorCollected", that._dadosPagamentosCollected.length);
				
				function convertExcelNumberToData(ExcelData){
					var data = new Date((ExcelData - (25567 + 1))*86400*1000);
					return data.getFullYear() + "-" + data.getMonth() + "-" + data.getDate();
				}
			},
			
			checarLinhaPreenchida: function (linha){
				var retorno = false;
				if(linha["Tax KEY"] || linha["Goverment administration/body (payee name)"] || linha["Jurisdiction"] || linha["Country KEY"]
				|| linha["State"] || linha["City"] || linha["Project"] || linha["Fiscal Year KEY"] || linha["Description"] || linha["Date of Payment (MM/DD/YYYY)"] 
				|| linha["Currency"] || linha["Currency KEY"] || linha["Type of Transaction"] || linha["Other Type of Transactions"] || linha["Value"] 
				|| linha["Interest"] || linha["Fine"] || linha["Document ID"] || linha["Beneficiary entity"]){
					retorno = true;	
				}
				return retorno;
			},			

			onSalvar: function (oEvent) {
				var that = this;

				this._salvar(oEvent, function (response) {

					if (response.success) {
						sap.m.MessageToast.show(that.getResourceBundle().getText("viewDetalheTrimestreSalvoSucesso"));
					} else {
						sap.m.MessageToast.show(that.getResourceBundle().getText("viewDetalheTrimestreErro") + response.error.message);
					}
				}, false);
			},

			onCancelar: function (oEvent) {
				var that = this;

				this._confirmarCancelamento(function () {
					that._navToResumoTrimestre();
				});
			},

			onNovoPagamentoBorne: function (oEvent) {
				this._limparLinhasBorne();
				this._dadosPagamentosBorne.unshift(this._novoPagamento());
				this.getModel().refresh();
				this._paintNewLine("tableBorne");
				this.getModel().setProperty("/ContadorBorne", this._dadosPagamentosBorne.length);
			},
			
			_limparLinhasBorne: function (){
				var aPagamentos = this._dadosPagamentosBorne;
				for(let i = 0; i < aPagamentos.length; i++){
					aPagamentos[i]["novo"] = "None";
				}
				this.getModel().refresh();
			},

			onNovoPagamentoCollected: function (oEvent) {
				this._limparLinhasCollected();
				this._dadosPagamentosCollected.unshift(this._novoPagamento());
				this.getModel().refresh();
				this._paintNewLine("tableCollected");
				this.getModel().setProperty("/ContadorCollected", this._dadosPagamentosCollected.length);
			},
			
			_limparLinhasCollected: function (){
				var aPagamentos = this._dadosPagamentosCollected;
				for(let i = 0; i < aPagamentos.length; i++){
					aPagamentos[i]["novo"] = "None";
				}
				this.getModel().refresh();
			},

			onTrocarJurisdicao: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();
				var aJurisdicao = this.getModel().getProperty("/DominioJurisdicao");
				var sIdJurisdicao = oEvent.getSource().getSelectedKey();
				
				for(let i=0; i< aJurisdicao.length; i++){
					if(aJurisdicao[i]["id_dominio_jurisdicao"] == sIdJurisdicao){
						oPagamento["nome_jurisdicao"] = aJurisdicao[i]["jurisdicao"];
					}
				}
				
				
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
			
			onTrocarPais: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();
				var aPais = this.getModel().getProperty("/DominioPais");
				var sIdPais = oEvent.getSource().getSelectedKey();
				
				for(let i=0; i< aPais.length; i++){
					if(aPais[i]["id_dominio_pais"] == sIdPais){
						oPagamento["nome_pais"] = aPais[i]["pais"];
					}
				}
			},
			
			onTrocarAnoFiscal: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();
				var aAnoFiscal = this.getModel().getProperty("/DominioAnoFiscal");
				var sIdAnoFiscal = oEvent.getSource().getSelectedKey();
				
				for(let i=0; i< aAnoFiscal.length; i++){
					if(aAnoFiscal[i]["id_dominio_ano_fiscal"] == sIdAnoFiscal){
						oPagamento["nome_ano_fiscal"] = aAnoFiscal[i]["ano_fiscal"];
					}
				}
			},
			
			onTrocarAnoFiscalImport: function (oPagamento) {
				var aAnoFiscal = this.getModel().getProperty("/DominioAnoFiscal");
				var sIdAnoFiscal = oPagamento["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"];
				
				for(let i=0; i< aAnoFiscal.length; i++){
					if(aAnoFiscal[i]["id_dominio_ano_fiscal"] == sIdAnoFiscal){
						oPagamento["nome_ano_fiscal"] = aAnoFiscal[i]["ano_fiscal"];
					}
				}
			},

			onTrocarPaisImport: function (oPagamento) {
				var aPais = this.getModel().getProperty("/DominioPais");
				var sIdPais = oPagamento["fk_dominio_pais.id_dominio_pais"];
				
				for(let i=0; i< aPais.length; i++){
					if(aPais[i]["id_dominio_pais"] == sIdPais){
						oPagamento["nome_pais"] = aPais[i]["pais"];
					}
				}
			},

			onTrocarJurisdicaoImport: function (oPagamento) {
				var sIdJurisdicao = oPagamento["fk_jurisdicao.id_dominio_jurisdicao"];
				var aJurisdicao = this.getModel().getProperty("/DominioJurisdicao");
				
				for(let i=0; i< aJurisdicao.length; i++){
					if(aJurisdicao[i]["id_dominio_jurisdicao"] == sIdJurisdicao){
						oPagamento["nome_jurisdicao"] = aJurisdicao[i]["jurisdicao"];
					}
				}
				
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
				sPath.toUpperCase().indexOf("BORNE") > -1 ? this._limparLinhasBorne() : this._limparLinhasCollected();
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
				oObject.novo = "Success";

				// Insere o objeto duplicado no índice
				aDadosPagamentos.splice(index, 0, oObject);

				this.getModel().refresh();
				this.getModel().setProperty(sPath.toUpperCase().indexOf("BORNE") > -1 ? "/ContadorBorne" : "/ContadorCollected", aDadosPagamentos.length);
				this._paintNewLine(sPath.toUpperCase().indexOf("BORNE") > -1 ? "tableBorne" : "tableCollected")
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
				var sPath = oEvent.getSource().getBindingContext().getPath();
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
							that.getModel().setProperty(sPath.toUpperCase().indexOf("BORNE") > -1 ? "/ContadorBorne" : "/ContadorCollected",
								aDadosPagamentos.length);
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
					} else {
						oPagamento.entidadeValueState = sap.ui.core.ValueState.None;
					}
				} else {
					oPagamento.entidadeValueState = sap.ui.core.ValueState.None;
				}
			},

            verificarPendenciaDeDocumento: function (oTaxAnterior){
				var aLinhasDocumentos = this.getModel().getProperty("/linhasDocumentos");
				var bTemDocumentoPraEssaCategoria = false;
				var iNumeroLinhasDessaCategoria = 1;
				var aPagamentos = this._dadosPagamentosBorne.concat(this._dadosPagamentosCollected);
				for(let i = 0; i < aLinhasDocumentos.length; i++){
					if(aLinhasDocumentos[i]["fk_category.id_tax_category"] == oTaxAnterior["fk_category.id_tax_category"] && aLinhasDocumentos[i]["fk_documento_ttc.id_documento_ttc"]){
						bTemDocumentoPraEssaCategoria = true;
					}
				}
				if(bTemDocumentoPraEssaCategoria){
					for(let i =0; i < aPagamentos.length; i++){
						if(aPagamentos[i]["fk_category.id_tax_category"] == oTaxAnterior["fk_category.id_tax_category"]){
							iNumeroLinhasDessaCategoria++;
						}
					}
				}
				if(bTemDocumentoPraEssaCategoria && iNumeroLinhasDessaCategoria === 1){
					return true;
				}
				else{
					return false;
				}
			},

			onTrocarTax: function (oEvent) {
				// Pega o objeto do tax para ser capaz de recuperar a fk de category
				var sTaxPath = oEvent.getSource().getSelectedItem().getBindingContext().getPath(),
					oTax = this.getModel().getObject(sTaxPath);

				var aTaxCategory = this.getModel().getProperty("/Borne/TaxCategory").concat(this.getModel().getProperty("/Collected/TaxCategory"));


				// Pega o objeto do pagamento e seta sua category como a category do tax selecionado
				var oPagamento = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()),
					oTaxAnterior = oPagamento["tax_anterior"];
                oPagamento["fk_category.id_tax_category"] = oTax["fk_category.id_tax_category"];
				
				var bPendencia = this.verificarPendenciaDeDocumento(oTaxAnterior);
				if(bPendencia){
					oPagamento["fk_category.id_tax_category"] = oTaxAnterior["fk_category.id_tax_category"];
					oPagamento["fk_tax.id_tax"] = oTaxAnterior["id_tax"];
					var dialog = new sap.m.Dialog({
						title: "por favor me traduza Aviso",
						content: new sap.m.Label({
							text:"Por favor me traduza e aqui colocar titulo:Voce nao pode mudar essa taxa pois existe um documento"
						}),
						endButton: new sap.m.Button({
							text: "por favor me traduza OK",
							press: function () {
								dialog.close();
							}.bind(this)
						}),
						afterClose: function() {
							dialog.destroy();
						}
					});
					this.getView().addDependent(dialog);
					dialog.open();
				}
				else{
					if(oTax){
						oPagamento.tax = oTax.tax;
						oPagamento["tax_anterior"] = oTax;
						for(let i =0; i < aTaxCategory.length; i++){
							if(aTaxCategory[i]["id_tax_category"] == oTax["fk_category.id_tax_category"]){
								var oTaxCategory = aTaxCategory[i];
								oPagamento.category = oTaxCategory["category"];
							}
						}
					}
					
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
				}
				this._remontarAbaDocumentos();
			},

			onTrocarTaxImport: function (oPagamento,grupoPagamento) {
				var aTax = this.getModel().getProperty("/" + grupoPagamento + "/Tax");
				var aTaxCategory = this.getModel().getProperty("/" + grupoPagamento + "/TaxCategory");
				var	oTax;
				for(let i = 0; i < aTax.length; i++){
					if(aTax[i]["id_tax"] == oPagamento["fk_tax.id_tax"]){
						oTax = aTax[i];
					}
				}

				// Pega o objeto do pagamento e seta sua category como a category do tax selecionado
				oPagamento["fk_category.id_tax_category"] = oTax["fk_category.id_tax_category"];

				if(oTax){
					oPagamento.tax = oTax.tax;
					for(let i =0; i < aTaxCategory.length; i++){
						if(aTaxCategory[i]["id_tax_category"] == oTax["fk_category.id_tax_category"]){
							var oTaxCategory = aTaxCategory[i];
							oPagamento.category = oTaxCategory["category"];
						}
					}
				}
				
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
                that._remontarAbaDocumentos();
			},

			onCalcularTotalImport: function (oPagamento) {
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
			
			_paintNewLine: function (tabela){
				/*this.byId(tabela).refreshRows();
				var aRows = this.byId(tabela).selectAll("rows")._aRowClones;
				for(let i = 0; i < aRows.length; i++){
					if(aRows[i].getBindingContext()){
						var oPagamento = aRows[i].getBindingContext().getObject();
						if(oPagamento){
							if(oPagamento["novo"] == "None"){
								aRows[i].addStyleClass("linhaPintada");
							}
						}
					}
				}*/
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

			_onRouteMatched: function (oEvent) {
				this.byId("tableBorne").setFixedColumnCount(3);
				this.byId("tableCollected").setFixedColumnCount(3);
				var oParameters = this.fromURIComponent(oEvent.getParameter("arguments").oParameters);
				Utils.displayFormat(this);
				this.getModel().setProperty("/Empresa", oParameters.oEmpresa);
				this.getModel().setProperty("/Periodo", oParameters.oPeriodo);
				this.getModel().setProperty("/AnoCalendario", oParameters.oAnoCalendario);
				this.getModel().setProperty("/LabelPeriodo", this._pegarLabelPeriodoDetalheTrimestre(oParameters.oPeriodo.numero_ordem));
				this.getModel().setProperty("/NomeUsuario", oParameters.nomeUsuario);
				
				this._montarFiltro();
				
				this._resolverMinMaxDate(oParameters.oPeriodo);
				
				/*Utils.criarDialogFiltro("tableBorne", [{
					text: this.getResourceBundle().getText("viewGeralPais"),
					applyTo: 'fk_dominio_pais.id_dominio_pais',
					items: {
						loadFrom: 'DominioPais',
						path: '/EasyFilterPais',
						text: 'pais',
						key: 'id_dominio_pais'
					}
				}], this, function (params) {
					console.log(params);
				});*/
				
				var that = this;

				NodeAPI.listarRegistros("Pais/" + this.getModel().getProperty("/Empresa")["fk_pais.id_pais"], function (response) { // Pegando pais pela fk da empresa
					if (response) {
						that.getModel().setProperty("/Pais", response);
					}
				});

				NodeAPI.listarRegistros("TaxCategory?classification=1", function (response) { // Classification=Borne
					if (response) {
						response.unshift({"id_tax_category":0,"category": ""});
						that.getModel().setProperty("/Borne/TaxCategory", Utils.orderByArrayParaBox(response, "category"));
					}
				});

				NodeAPI.listarRegistros("TaxCategory?classification=2", function (response) { // Classification=Collected
					if (response) {
						response.unshift({"id_tax_category":0,"category": ""});
						that.getModel().setProperty("/Collected/TaxCategory", Utils.orderByArrayParaBox(response, "category"));
					}
				});

				NodeAPI.listarRegistros("DeepQuery/Tax?classification=1", function (response) { // Classification=Borne
					if (response) {
						response.unshift({"id_tax":0,"tax": ""});
						that.getModel().setProperty("/Borne/Tax", Utils.orderByArrayParaBox(response, "tax"));
					}
				});

				NodeAPI.listarRegistros("DeepQuery/Tax?classification=2", function (response) { // Classification=Collected
					if (response) {
						response.unshift({"id_tax":0,"tax": ""});
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
						response.unshift({"id_dominio_jurisdicao":0,"jurisdicao":""});
						for (var i = 0, length = response.length; i < length; i++) {
							response[i]["jurisdicao"] = Utils.traduzJurisdicao(response[i]["id_dominio_jurisdicao"], that);
						}
						that.getModel().setProperty("/DominioJurisdicao", Utils.orderByArrayParaBox(response, "jurisdicao"));
					}
				});

				NodeAPI.listarRegistros("DominioPais", function (response) {
					if (response) {
						response.unshift({"id_dominio_pais":0,"pais":""});
						for (var i = 0, length = response.length; i < length; i++) {
							response[i]["pais"] = Utils.traduzDominioPais(response[i]["id_dominio_pais"], that);
						}
						that.getModel().setProperty("/DominioPais", Utils.orderByArrayParaBox(response, "pais"));
					}
				});

				NodeAPI.listarRegistros("DominioAnoFiscal", function (response) {
					if (response) {
						response.unshift({"id_dominio_ano_fiscal":0,"ano_fiscal":""});
						that.getModel().setProperty("/DominioAnoFiscal", response);
					}
				});

				NodeAPI.listarRegistros("DominioMoeda", function (response) {
					if (response) {
						response.unshift({"id_dominio_moeda":0,"AcroNome":""});
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
						response.unshift({"id_dominio_tipo_transacao":0,"tipo_transacao":""});
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

			_carregarPagamentos: function () {
				this._dadosPagamentosBorne.length = 0;
				this._dadosPagamentosCollected.length = 0;

				var sIdEmpresa = this.getModel().getProperty("/Empresa").id_empresa;
				var sIdPeriodo = this.getModel().getProperty("/Periodo").id_periodo;
				var sIdPais = this.getModel().getProperty("/Empresa")["fk_pais.id_pais"];

				var countBorne = 0,
					countCollected = 0;

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
                            response1[0][i]["tax_anterior"] = {
								"id_tax": Number(response1[0][i]["fk_tax.id_tax"]),
								"fk_category.id_tax_category": Number(response1[0][i]["fk_category.id_tax_category"])
							};
	
							response1[0][i].principal = response1[0][i].principal ? Number(response1[0][i].principal) : 0;
							response1[0][i].juros = response1[0][i].juros ? Number(response1[0][i].juros) : 0;
							response1[0][i].multa = response1[0][i].multa ? Number(response1[0][i].multa) : 0;
							response1[0][i].total = response1[0][i].total ? Number(response1[0][i].total) : 0;
							

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
							countBorne++;
							
							that.onTrocarJurisdicaoImport(response1[0][i]);
							that.onTrocarPaisImport(response1[0][i]);
							that.onTrocarAnoFiscalImport(response1[0][i]);
							that.onTrocarTipoTransacaoImport(response1[0][i]);
						}
						that.getModel().setProperty("/ContadorBorne", that._dadosPagamentosBorne.length);
					}

					if (response2) {
						for (var j = 0; j < response2[0].length; j++) {
							response2[0][j].estadoValueState = sap.ui.core.ValueState.None;
							response2[0][j].cidadeValueState = sap.ui.core.ValueState.None;
							response2[0][j].entidadeValueState = sap.ui.core.ValueState.None;
							response2[0][j].fkDominioTipoTransacaoAnterior = response2[0][j]["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"];
                            response2[0][j]["tax_anterior"] = {
								"id_tax": Number(response2[0][j]["fk_tax.id_tax"]),
								"fk_category.id_tax_category": Number(response2[0][j]["fk_category.id_tax_category"])
							};

							response2[0][j].principal = response2[0][j].principal ? Number(response2[0][j].principal) : 0;
							response2[0][j].juros = response2[0][j].juros ? Number(response2[0][j].juros) : 0;
							response2[0][j].multa = response2[0][j].multa ? Number(response2[0][j].multa) : 0;
							response2[0][j].total = response2[0][j].total ? Number(response2[0][j].total) : 0;

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
							countCollected++;
							
							that.onTrocarJurisdicaoImport(response2[0][j]);
							that.onTrocarPaisImport(response2[0][j]);
							that.onTrocarAnoFiscalImport(response2[0][j]);
							that.onTrocarTipoTransacaoImport(response2[0][j]);
							
						}
					}
					/*that.getModel().setProperty("/ContadorCollected", countCollected);*/
					that.getModel().refresh();
					that.getModel().setProperty("/ContadorCollected", that._dadosPagamentosCollected.length);
                    that._remontarAbaDocumentos();
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
					"fk_dominio_moeda.id_dominio_moeda": 0,
					"fk_dominio_tipo_transacao.id_dominio_tipo_transacao": 0,
					"fk_dominio_ano_fiscal.id_dominio_ano_fiscal": 0,
					"fk_jurisdicao.id_dominio_jurisdicao": 0,
					"fk_dominio_pais.id_dominio_pais": this.getModel().getProperty("/Pais")[0]["fk_dominio_pais.id_dominio_pais"],
					"fk_name_of_tax.id_name_of_tax": null,
					"fk_empresa.id_empresa": this.getModel().getProperty("/Empresa").id_empresa,
					"fk_periodo.id_periodo": this.getModel().getProperty("/Periodo").id_periodo,
					"opcoesNameOfTax": [],
					"fk_category.id_tax_category": 0,
					"fk_tax.id_tax": 0,
					"name_of_tax": "",
					"estadoValueState": sap.ui.core.ValueState.None,
					"cidadeValueState": sap.ui.core.ValueState.None,
					"entidadeValueState": sap.ui.core.ValueState.None,
					"AcroNome": "",
					"novo": "Success"
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

			_salvar: function (oEvent, callback, exibirmsg) {
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
					}, exibirmsg);
				}
			},

			_checarTaxDeclarados: function (callback, exibirmsg) {
				var that = this;
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

					if (exibirmsg) {

						var dialog = new sap.m.Dialog({
							contentHeight: "150px",
							title: this.getResourceBundle().getText("viewGeralAviso"),
							type: "Message",
							content: oVBox,
							beginButton: new sap.m.Button({
								text: this.getResourceBundle().getText("viewGeralCancelar"),
								press: function () {
									dialog.close();
								}
							}),
							endButton: new sap.m.Button({
								text: this.getResourceBundle().getText("viewGeralContinuar"),
								press: function () {
									if (callback) {
										callback();
										sap.m.MessageToast.show(that.getResourceBundle().getText("viewDetalheTrimestreSalvoSucesso"));
									}
									dialog.close();
								}
							}),
							afterClose: function () {
								dialog.destroy();
							}
						}).addStyleClass("sapUiNoContentPadding");

						dialog.open();
					}

					if (!exibirmsg) {
						if (callback) {
							callback();
						}
					}
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
				var aTipoTransacao = this.getModel().getProperty("/DominioTipoTransacao");
				var sIdTipoTransacao = oPagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"];
				
				for(let i = 0; i < aTipoTransacao.length; i++){
					if(aTipoTransacao[i]["id_dominio_tipo_transacao"] == sIdTipoTransacao){
						oPagamento["nome_tipo_transacao"] = aTipoTransacao[i]["tipo_transacao"];
					}
				}
				
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
				} else if(oPagamento.tipo_transacao_outros == ""){
					oPagamento["tipo_transacao_outros_value_state"] = sap.ui.core.ValueState.Error;
				}

				oPagamento.fkDominioTipoTransacaoAnterior = oPagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"];

				this.getModel().refresh();
			},
			
			onTrocarTipoTransacaoImport: function (oPagamento) {
				var aTipoTransacao = this.getModel().getProperty("/DominioTipoTransacao");
				var sIdTipoTransacao = oPagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"];
				
				for(let i = 0; i < aTipoTransacao.length; i++){
					if(aTipoTransacao[i]["id_dominio_tipo_transacao"] == sIdTipoTransacao){
						oPagamento["nome_tipo_transacao"] = aTipoTransacao[i]["tipo_transacao"];
					}
				}

				var isOtherSpecify = function () {
					return oPagamento["fk_dominio_tipo_transacao.id_dominio_tipo_transacao"] == 5;
				};

				if (!isOtherSpecify()) {
					oPagamento.tipo_transacao_outros = "";
					oPagamento["tipo_transacao_outros_value_state"] = sap.ui.core.ValueState.None;
				} else if(oPagamento.tipo_transacao_outros == ""){
					oPagamento["tipo_transacao_outros_value_state"] = sap.ui.core.ValueState.Error;
				}

				this.getModel().refresh();
			},
			
			onTrocarTipoTransacaoOutros: function (oEvent) {
				var oPagamento = oEvent.getSource().getBindingContext().getObject();
				if (oPagamento["tipo_transacao_outros"]) {
					oPagamento["tipo_transacao_outros_value_state"] = sap.ui.core.ValueState.None;
				} else {
					oPagamento["tipo_transacao_outros_value_state"] = sap.ui.core.ValueState.Error;
				}		
                },
			
			onEnviarDocumento: function (oEvent){
				var oLinhaDocumento = oEvent.getSource().getBindingContext().getObject();
				var oFileUploader = oEvent.oSource.oParent.mAggregations.items[0];
				var oDocumento = oFileUploader.oFileUpload.files[0];
				var nome_documento = oFileUploader.getValue();
				var aDocumentosVigentes = this.getModel().getProperty("/documentosVigentes");
				var oDocumentoAtual = {};
				if(nome_documento && oDocumento){
					oFileUploader.clear();
					oDocumentoAtual["persistido"] = false;
					oDocumentoAtual["dados"] = oDocumento;
					oDocumentoAtual["fk_category.id_tax_category"] = oLinhaDocumento["fk_category.id_tax_category"];
					oDocumentoAtual["fk_periodo.id_periodo"] = oLinhaDocumento["fk_periodo.id_periodo"];
					oDocumentoAtual["nome_documento"] = nome_documento;
					oDocumentoAtual["id_documento_ttc"] = -1;
					oLinhaDocumento["nome_documento"] = nome_documento;
					oLinhaDocumento["persistido"] = false;
					oLinhaDocumento["fk_documento_ttc.id_documento_ttc"] = -1;
					aDocumentosVigentes.push(oDocumentoAtual);
					this.getModel().refresh();
				}
			},
			
			onExcluirDocumento: function (oEvent){
				var oLinhaDocumento = oEvent.getSource().getBindingContext().getObject();
				var aDocumentosVigentes = this.getModel().getProperty("/documentosVigentes");
				var aDocumentosNaoVigentes = this.getModel().getProperty("/documentosNaoVigentes");
				var novoDocumentoNaoVigente = {};
				for(let i =0; i < aDocumentosVigentes.length; i++){
					if(oLinhaDocumento["fk_category.id_tax_category"] == aDocumentosVigentes[i]["fk_category.id_tax_category"]
					   && oLinhaDocumento["fk_periodo.id_periodo"] == aDocumentosVigentes[i]["fk_periodo.id_periodo"])
					{
						novoDocumentoNaoVigente["fk_periodo.id_periodo"] = aDocumentosVigentes[i]["fk_periodo.id_periodo"];
						novoDocumentoNaoVigente["fk_category.id_tax_category"] = aDocumentosVigentes[i]["fk_category.id_tax_category"];
						novoDocumentoNaoVigente["nome_documento"] = aDocumentosVigentes[i]["nome_documento"];
						novoDocumentoNaoVigente["persistido"] = aDocumentosVigentes[i]["persistido"];
						novoDocumentoNaoVigente["id_documento_ttc"] = aDocumentosVigentes[i]["id_documento_ttc"];
						aDocumentosVigentes.splice(i,1);
						oLinhaDocumento["nome_documento"] = "";
						oLinhaDocumento["fk_documento_ttc.id_documento_ttc"] = 0;
						oLinhaDocumento["persistido"] = undefined;
						oLinhaDocumento["valor_total"] = 0;
					}
				}
				this.getModel().refresh();
				aDocumentosNaoVigentes.push(novoDocumentoNaoVigente);
			},
			
			_remontarAbaDocumentos: function () {
				var aPagamentosBorne = Utils.orderByArrayParaBox(this._dadosPagamentosBorne.slice(0),'category');
				var aPagamentosCollected = Utils.orderByArrayParaBox(this._dadosPagamentosCollected.slice(0), 'category');
				var aDocumentosVigentes = this.getModel().getProperty("/documentosVigentes");
				var linhasDocumentos = [];
				var insereArrayNoLinhasDocumentos = function (array, classificacao){
					var categoriaCorrente = -1;
					var objLinhaDocumento = {};
					var idDaLinha = 0;
					for(let i = 0; i < array.length; i++){
						if(array[i]["fk_category.id_tax_category"]){
							if(array[i]["fk_category.id_tax_category"] == categoriaCorrente){
								linhasDocumentos[linhasDocumentos.length -1]["valor_total"] = Number(array[i]["total"]) + linhasDocumentos[linhasDocumentos.length -1]["valor_total"];
							}
							else{
								idDaLinha++;
								categoriaCorrente = array[i]["fk_category.id_tax_category"];
								objLinhaDocumento = {};
								objLinhaDocumento["id_linha_documento"] = idDaLinha;
								objLinhaDocumento["classificacao"] = classificacao;
								objLinhaDocumento["category"] = array[i]["category"];
								objLinhaDocumento["fk_category.id_tax_category"] = array[i]["fk_category.id_tax_category"];
								objLinhaDocumento["fk_periodo.id_periodo"] = array[i]["fk_periodo.id_periodo"];
								objLinhaDocumento["valor_total"] = Number(array[i]["total"]);
								for(let j = 0; j < aDocumentosVigentes.length; j++){
									if(array[i]["fk_periodo.id_periodo"] == aDocumentosVigentes[j]["fk_periodo.id_periodo"]
									   && array[i]["fk_category.id_tax_category"] == aDocumentosVigentes[j]["fk_category.id_tax_category"])
								    {
										objLinhaDocumento["nome_documento"] = aDocumentosVigentes[j]["nome_documento"];
										objLinhaDocumento["fk_documento_ttc.id_documento_ttc"] = aDocumentosVigentes[j]["id_documento_ttc"];
										objLinhaDocumento["persistido"] = aDocumentosVigentes[j]["persistido"];
									}
								}
								linhasDocumentos.push(objLinhaDocumento);
							}
						}
					}
				}
				insereArrayNoLinhasDocumentos(aPagamentosBorne, "Borne");
				insereArrayNoLinhasDocumentos(aPagamentosCollected, "Collected");
				this.getModel().setProperty("/linhasDocumentos", linhasDocumentos);
			}	
		});
	}
);