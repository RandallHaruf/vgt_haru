sap.ui.define(
	[
		"ui5ns/ui5/lib/Validador",
		"sap/m/Popover",
		"ui5ns/ui5/lib/NodeAPI",
		"sap/m/Button",
		"sap/m/Input",
		"sap/m/Label",
		"sap/m/CheckBox",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/lib/jszip",
		"ui5ns/ui5/lib/XLSX",
		"ui5ns/ui5/lib/FileSaver"
	],
	function (Validador, Popover, NodeAPI, Button, Input, Label, CheckBox, Utils) {
		return {
			limparMascaraDecimal: function (sValor, that) {
				if (that && !that.isPTBR()) {
					return sValor.replace(/\,/g, "");
				} else {
					return sValor.replace(/\./g, "").replace(",", ".");
				}
			},

			getPeriodoEdicaoTaxPackage: function (iAno) {
				// Se não foi passado um ano que se deseja conhecer seu periodo de edição, retorna o período do ano corrente
				if (!iAno) {
					var now = new Date(),
						dataInicio,
						dataFim;

					if (now.getMonth() === 0 && now.getDate() >= 1 && now.getDate() <= 31) {
						dataInicio = new Date(now.getFullYear() - 1, 0, 31);
						dataFim = new Date(now.getFullYear(), 0, 31);
					} else {
						dataInicio = new Date(now.getFullYear(), 0, 31);
						dataFim = new Date(now.getFullYear() + 1, 0, 31);
					}

					return {
						inicio: dataInicio,
						fim: dataFim
					};
				} else {
					return {
						inicio: new Date(iAno, 0, 31),
						fim: new Date(iAno + 1, 0, 31)
					};
				}
			},
			aplicarMascara: function (numero, that) {
				if (that.isPTBR()) {
					return numero ? Number(numero).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "0";
				} else {
					return numero ? Number(numero).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
				}
			},
			conteudoView: function (nomeDoIdDaTabela, that, propriedadeDaTabela) {
				var cabecalho;
				var atributo;
				var array = []
				for (var k = 0, length = that.byId(nomeDoIdDaTabela).getColumns().length /*that.byId(nomeDoIdDaTabela).getColCount()-2*/ ; k < length; k++) {
					visibilidade = that.byId(nomeDoIdDaTabela).getColumns()[k].mAggregations.header.oParent.mProperties.visible ? true : false;
					cabecalho = that.byId(nomeDoIdDaTabela).getColumns()[k].mAggregations.header.mProperties.text //Nome do Cabeçalho 
					atributo = that.byId(nomeDoIdDaTabela).mBindingInfos.items.template.mAggregations.cells[k].mBindingInfos.text.parts[0].path // nome do atributo
					array.push({
						textoNomeDaColuna: cabecalho,
						propriedadeDoValorDaLinha: atributo,
						visible: visibilidade
					});
				}
				that.getModel().setProperty(propriedadeDaTabela, array);
			},
			dataExportReport: function (that, tipo, nomeAba, nomeReport) {
				var array = that.getModel().getProperty("/TabelaDaView");
				var coluna = [];
				var excel = [];
				for (var k = 0, length = array.length; k < length; k++) {
					if (array[k]["visible"]) {
						coluna.push({
							name: array[k]["textoNomeDaColuna"],
							template: {
								content: "{" + array[k]["propriedadeDoValorDaLinha"] + "}"
							}
						})
						excel.push(array[k]["textoNomeDaColuna"]);
					}
				}
				var valores = that.getModel().getProperty(tipo);
				var wsAccountResultData = [];
				wsAccountResultData.push(excel);
				for (var i = 0, length = valores.length; i < length; i++) {
					excel = [];
					for (var j = 0, length2 = array.length; j < length2; j++) {
						if (array[j]["visible"]) {
							excel.push(valores[i][array[j]["propriedadeDoValorDaLinha"]]);
						}
					}
					wsAccountResultData.push(excel);
				};

				var wbTaxPackage = XLSX.utils.book_new();
				var wsAccountResultName = that.getResourceBundle().getText(nomeAba);
				var wsAccountResult = XLSX.utils.aoa_to_sheet(wsAccountResultData);
				XLSX.utils.book_append_sheet(wbTaxPackage, wsAccountResult, wsAccountResultName);
				var wopts = {};
				var formato = "";
				if (tipo === "/XLSX") {
					wopts = {
						bookType: 'xlsx' /*, bookSST:false*/ ,
						type: 'array'
					};
					formato = ".xlsx";
				} else if (tipo === "/TXT") {
					wopts = {
						bookType: 'txt' /*, bookSST:false*/ ,
						type: 'array'
					};
					formato = ".txt";
				} else {
					wopts = {
						bookType: 'csv' /*, bookSST:false*/ ,
						type: 'array'
					};
					formato = ".csv";
				}
				var wbout = XLSX.write(wbTaxPackage, wopts);
				saveAs(new Blob([wbout], {
						type: "application/octet-stream"
					}),
					this.dateNowParaArquivo() + "_" + that.getResourceBundle().getText("viewGeralRelatorio") + "_" + that.getResourceBundle().getText(
						nomeReport) + formato);
			},
			ajustaRem: function (that, array, campoNumerico, nomeDoCabecalho, remInicial, remProporcional, remfixo) {
				//this = Para setar a Propriedade Desejada com nome /rem+campoNumerico
				//array = Array com um numero que voce quer que o rem da coluna fique proporcional ao maior valor que ocorra dele
				//campoNumerico = nome string do campo no qual esta o valor da coluna
				//remInicial = width inicial desejado
				//remProporcional = Proporção da notação cientifica do valor que sera aplicada			
				//valores ideais remInicial = 3 e remProporcional = 1.35
				var ordenadorAdjustments = array.slice();
				ordenadorAdjustments.sort(function (x, y) {
					return Number((Math.abs(Number(y[campoNumerico])) ? Math.abs(Number(y[campoNumerico])) : y[campoNumerico] ? y[campoNumerico].length :
						0) - (Math.abs(Number(x[campoNumerico])) ? Math.abs(Number(x[campoNumerico])) : x[campoNumerico] ? x[campoNumerico].length : 0));
				});
				var numero = (Math.abs(Number(ordenadorAdjustments[0][campoNumerico]) ? Number(ordenadorAdjustments[0][campoNumerico]) : 10 ** (
					Number(ordenadorAdjustments[0][campoNumerico] ? ordenadorAdjustments[0][campoNumerico].length : 0) / 5)) + 1).toExponential(0).split(
					"+");
				var texto = 5 + (nomeDoCabecalho.length / 10);
				remfixo
					? that.getModel().setProperty("/rem" + campoNumerico, remfixo + "rem") : that.getModel().setProperty("/rem" + campoNumerico, JSON.stringify(
						Math.max((remInicial + (Number(numero[numero.length - 1])) / remProporcional), (texto))) + "rem");
			},
			stringMoedaParaFloat: function (sMoeda) {
				var fConversao = 0.00;
				if (sMoeda) {
					var sTemporario = sMoeda.replace(/\./g, "").replace(/,/g, ".");
					if (Validador.isNumber(sTemporario)) {
						fConversao = parseFloat(sTemporario);
					}
				}
				return fConversao;
			},

			formataData: function (sData) {
				var fDataNoPadrao = "";
				var lingua = sap.ui.getCore().getConfiguration().getLanguage();
				switch (lingua) {
				case "pt-BR":
					if (sData) {
						fDataNoPadrao = sData.getDate().toString().padStart(2, "0") + "/" + (sData.getMonth() + 1).toString().padStart(2, "0") + "/" +
							sData.getFullYear().toString();
					}
					break;
				case "en-US":
					if (sData) {
						fDataNoPadrao = (sData.getMonth() + 1).toString().padStart(2, "0") + "/" + sData.getDate().toString().padStart(2, "0") + "/" +
							sData.getFullYear().toString();
					}
					break;
				}

				return fDataNoPadrao;
			},

			dateNowParaBanco: function () {
				var Data = new Date();
				var fDataNoPadrao = Data.getDate().toString().padStart(2, "0") + "/" + (Data.getMonth() + 1).toString().padStart(2, "0") + "/" + Data
					.getFullYear().toString();
				return fDataNoPadrao;
			},

			stringDataDoBancoParaStringDDMMYYYY: function (dataString) {
				//PASSAR DIRETO DO BANCO NO FORMATO "yyyy-MM-dd"
				var lingua = sap.ui.getCore().getConfiguration().getLanguage();
				var DataFinal = "";
				switch (lingua) {
				case "pt-BR":
					DataFinal = dataString.substring(8, 10) + "/" + dataString.substring(5, 7) + "/" + dataString.substring(4, 0);
					break;
				case "en-US":
					DataFinal = dataString.substring(5, 7) + "/" + dataString.substring(8, 10) + "/" + dataString.substring(4, 0);
					break;
				}
				return DataFinal;
			},

			stringDatacomBarraParaBanco: function (dataString) {
				var DataFinal = "";
				if (dataString) {
					DataFinal = dataString.substring(6, 10) + "-" + dataString.substring(3, 5) + "-" + dataString.substring(0, 2);
				}
				return DataFinal;
			},

			bancoParaJsDate: function (dataString) {
				//PASSAR DIRETO DO BANCO NO FORMATO "yyyy-MM-dd"
				var DataFinal = null;
				if (dataString) {
					DataFinal = new Date(dataString.substring(0, 4), dataString.substring(5, 7) - 1, dataString.substring(8, 10));
				}

				return DataFinal;
			},

			orderByArrayParaBox: function (array, stringOrderBy) {
				array.sort(function (x, y) {
					if (x[stringOrderBy]) {
						return y[stringOrderBy] ? x[stringOrderBy].localeCompare(y[stringOrderBy]) : 1;
					} else if (y[stringOrderBy]) {
						return x[stringOrderBy] ? y[stringOrderBy].localeCompare(x[stringOrderBy]) : -1;
					}
				});
				return array;
			},

			displayFormat: function (that) {
				var lingua = sap.ui.getCore().getConfiguration().getLanguage();
				var formatFull = "";
				var formatSemAno = "";
				switch (lingua) {
				case "pt-BR":
					formatFull = "dd/MM/yyyy";
					formatSemAno = "dd/MM";
					break;
				case "en-US":
					formatFull = "MM/dd/yyyy";
					formatSemAno = "MM/dd";
					break;
				}
				that.getModel().setProperty("/displayFormatFull", formatFull);
				that.getModel().setProperty("/displayFormatSemAno", formatSemAno);
			},

			traduzStatusTiposPais: function (id, that) {

				var traducao = "";
				switch (id) {
				case 1:
					traducao = that.getResourceBundle().getText("viewPaisTipo1");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewPaisTipo2");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("viewPaisTipo3");
					break;
				case 4:
					traducao = that.getResourceBundle().getText("viewPaisTipo4");
					break;
				}
				return traducao;
			},

			traduzNomeMes: function (id, that) {

				var traducao = "";
				switch (id) {
				case 1:
					traducao = that.getResourceBundle().getText("NomesMes1");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("NomesMes2");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("NomesMes3");
					break;
				case 4:
					traducao = that.getResourceBundle().getText("NomesMes4");
					break;
				case 5:
					traducao = that.getResourceBundle().getText("NomesMes5");
					break;
				case 6:
					traducao = that.getResourceBundle().getText("NomesMes6");
					break;
				case 7:
					traducao = that.getResourceBundle().getText("NomesMes7");
					break;
				case 8:
					traducao = that.getResourceBundle().getText("NomesMes8");
					break;
				case 9:
					traducao = that.getResourceBundle().getText("NomesMes9");
					break;
				case 10:
					traducao = that.getResourceBundle().getText("NomesMes10");
					break;
				case 11:
					traducao = that.getResourceBundle().getText("NomesMes11");
					break;
				case 12:
					traducao = that.getResourceBundle().getText("NomesMes12");
					break;
				}
				return traducao;
			},

			traduzDominioTaxClassification: function (id, that) {

				var traducao = "";
				switch (id) {
				case 1:
					traducao = that.getResourceBundle().getText("viewGeralDominioTaxClassificationTipo1");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewGeralDominioTaxClassificationTipo2");
					break;
				}
				return traducao;
			},
			traduzJurisdicao: function (id, that) {

				var traducao = "";
				switch (id) {
				case 1:
					traducao = that.getResourceBundle().getText("viewGeralFederal");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewGeralState");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("viewGeralCity");
					break;
				}
				return traducao;
			},
			traduzTipoTransacao: function (id, that) {

				var traducao = "";
				switch (id) {

				case 1:
					traducao = that.getResourceBundle().getText("viewGeralCashInstallmentSettlement");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewGeralCashRefundReimbursementNegativeValue");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("viewGeralPaymentWithIncomeTaxCredits");
					break;
				case 4:
					traducao = that.getResourceBundle().getText("viewGeralPaymentWithOtherTaxCredits");
					break;
				case 5:
					traducao = that.getResourceBundle().getText("viewGeralOtherSpecify");
					break;
				}
				return traducao;
			},
			traduzEmpresaStatusTipo: function (id, that) {

				var traducao = "";
				switch (id) {

				case 1:
					traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo1");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo2");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo3");
					break;
				case 4:
					traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo4");
					break;
				case 5:
					traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo5");
					break;
				case 6:
					traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo6");
					break;
				case 7:
					traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo7");
					break;
				case 8:
					traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo8");
					break;
				}
				return traducao;
			},

			traduzEmpresatraducao: function (id, that) {

				var traducao = "";
				switch (id) {
				case 1:
					traducao = that.getResourceBundle().getText("viewEmpresatraducaoTipo1");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewEmpresatraducaoTipo2");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("viewEmpresatraducaoTipo3");
					break;
				case 4:
					traducao = that.getResourceBundle().getText("viewEmpresatraducaoTipo4");
					break;
				}
				return traducao;
			},

			traduzTTCRequisicaoReaberturaPeriodoStatus: function (id, that) {

				var traducao = "";
				switch (id) {
				case 1:
					traducao = that.getResourceBundle().getText("viewTTCRequisicaoReaberturaPeriodoStatus1");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewTTCRequisicaoReaberturaPeriodoStatus2");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("viewTTCRequisicaoReaberturaPeriodoStatus3");
					break;
				}
				return traducao;
			},

			traduzEmpresaTipoSocietario: function (id, that) {

				var traducao = "";
				switch (id) {
				case 1:
					traducao = that.getResourceBundle().getText("viewEmpresaTipoSocietarioTipo1");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewEmpresaTipoSocietarioTipo2");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("viewEmpresaTipoSocietarioTipo3");
					break;
				case 4:
					traducao = that.getResourceBundle().getText("viewEmpresaTipoSocietarioTipo4");
					break;
				}
				return traducao;
			},

			traduzObrigacaoPeriodo: function (id, that) {

				var traducao = "";
				switch (id) {
				case 1:
					traducao = that.getResourceBundle().getText("viewGeralSemanal");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewGeralQuinzenal");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("viewGeralMensal");
					break;
				case 4:
					traducao = that.getResourceBundle().getText("viewGeralBimestral");
					break;
				case 5:
					traducao = that.getResourceBundle().getText("viewGeralTrimestral");
					break;
				case 6:
					traducao = that.getResourceBundle().getText("viewGeralSemestral");
					break;
				case 7:
					traducao = that.getResourceBundle().getText("viewGeralAnual");
					break;
				}
				return traducao;
			},

			traduzStatusObrigacao: function (id, that) {

				var traducao = "";
				switch (id) {
				case 1:
					traducao = that.getResourceBundle().getText("viewGeralPending");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewGeralActive");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("viewGeralExcluded");
					break;
				case 4:
					traducao = that.getResourceBundle().getText("viewGeralNotStarted");
					break;
				case 5:
					traducao = that.getResourceBundle().getText("viewGeralDelayed");
					break;
				case 6:
					traducao = that.getResourceBundle().getText("viewGeralDeliveredOnTime");
					break;
				case 7:
					traducao = that.getResourceBundle().getText("viewGeralDeliveredAfterDeadline");
					break;
				}
				return traducao;
			},

			traduzPeriodo: function (id, that) {

				var traducao = "";
				switch (id) {
				case 1:
					traducao = that.getResourceBundle().getText("viewGeralSemanal");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewGeralQuinzenal");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("viewGeralMensal");
					break;
				case 4:
					traducao = that.getResourceBundle().getText("viewGeralBimestral");
					break;
				case 5:
					traducao = that.getResourceBundle().getText("viewGeralTrimestral");
					break;
				case 6:
					traducao = that.getResourceBundle().getText("viewGeralSemestral");
					break;
				case 7:
					traducao = that.getResourceBundle().getText("viewGeralAnual");
					break;
				}
				return traducao;
			},

			traduzTiposAliquota: function (id, that) {

				var traducao = "";
				switch (id) {
				case 1:
					traducao = that.getResourceBundle().getText("viewGeralPais");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewGeralEmpresa");
					break;
				}
				return traducao;
			},

			traduzPaisRegiao: function (id, that) {

				var traducao = "";
				switch (id) {
				case 1:
					traducao = that.getResourceBundle().getText("viewPaisRegiaoTipo1");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewPaisRegiaoTipo2");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("viewPaisRegiaoTipo3");
					break;
				case 4:
					traducao = that.getResourceBundle().getText("viewPaisRegiaoTipo4");
					break;
				case 5:
					traducao = that.getResourceBundle().getText("viewPaisRegiaoTipo5");
					break;
				case 6:
					traducao = that.getResourceBundle().getText("viewPaisRegiaoTipo6");
					break;
				case 7:
					traducao = that.getResourceBundle().getText("viewPaisRegiaoTipo7");
					break;
				}
				return traducao;
			},

			traduzTrimestre: function (id, that) {

				var traducao = "";
				switch (id) {

				case 1:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo1");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo2");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo3");
					break;
				case 4:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo4");
					break;
				case 5:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo5");
					break;
				case 6:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo6");
					break;
				}
				return traducao;
			},
			traduzTrimestreTaxPackage: function (id, that) {

				var traducao = "";
				switch (id) {

				case 1:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo1");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo2");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo3");
					break;
				case 4:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo4");
					break;
				case 5:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo5");
					break;
				case 6:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo6");
					break;
				}
				return traducao;
			},			
			traduzTrimestreTTC: function (id, that) {

				var traducao = "";
				switch (id) {

				case 1:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo7");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo8");
					break;
				case 3:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo9");
					break;
				case 4:
					traducao = that.getResourceBundle().getText("viewGeralPeriodo10");
					break;

				}
				return traducao;
			},
			traduzDominioDiferencaTipo: function (id, that) {

				var traducao = "";
				switch (id) {
				case 1:
					traducao = that.getResourceBundle().getText("viewGeralDominioDiferencaTipo1");
					break;
				case 2:
					traducao = that.getResourceBundle().getText("viewGeralDominioDiferencaTipo2");
					break;
				}
				return traducao;
			},

			traduzDominioPais: function (id, that) {

				var traducao = "";
				switch (id) {
				case 1:
					traducao = that.getResourceBundle().getText('viewPais1');
					break;
				case 2:
					traducao = that.getResourceBundle().getText('viewPais2');
					break;
				case 3:
					traducao = that.getResourceBundle().getText('viewPais3');
					break;
				case 4:
					traducao = that.getResourceBundle().getText('viewPais4');
					break;
				case 5:
					traducao = that.getResourceBundle().getText('viewPais5');
					break;
				case 6:
					traducao = that.getResourceBundle().getText('viewPais6');
					break;
				case 7:
					traducao = that.getResourceBundle().getText('viewPais7');
					break;
				case 8:
					traducao = that.getResourceBundle().getText('viewPais8');
					break;
				case 9:
					traducao = that.getResourceBundle().getText('viewPais9');
					break;
				case 10:
					traducao = that.getResourceBundle().getText('viewPais10');
					break;
				case 11:
					traducao = that.getResourceBundle().getText('viewPais11');
					break;
				case 12:
					traducao = that.getResourceBundle().getText('viewPais12');
					break;
				case 13:
					traducao = that.getResourceBundle().getText('viewPais13');
					break;
				case 14:
					traducao = that.getResourceBundle().getText('viewPais14');
					break;
				case 15:
					traducao = that.getResourceBundle().getText('viewPais15');
					break;
				case 16:
					traducao = that.getResourceBundle().getText('viewPais16');
					break;
				case 17:
					traducao = that.getResourceBundle().getText('viewPais17');
					break;
				case 18:
					traducao = that.getResourceBundle().getText('viewPais18');
					break;
				case 19:
					traducao = that.getResourceBundle().getText('viewPais19');
					break;
				case 20:
					traducao = that.getResourceBundle().getText('viewPais20');
					break;
				case 21:
					traducao = that.getResourceBundle().getText('viewPais21');
					break;
				case 22:
					traducao = that.getResourceBundle().getText('viewPais22');
					break;
				case 23:
					traducao = that.getResourceBundle().getText('viewPais23');
					break;
				case 24:
					traducao = that.getResourceBundle().getText('viewPais24');
					break;
				case 25:
					traducao = that.getResourceBundle().getText('viewPais25');
					break;
				case 26:
					traducao = that.getResourceBundle().getText('viewPais26');
					break;
				case 27:
					traducao = that.getResourceBundle().getText('viewPais27');
					break;
				case 28:
					traducao = that.getResourceBundle().getText('viewPais28');
					break;
				case 29:
					traducao = that.getResourceBundle().getText('viewPais29');
					break;
				case 30:
					traducao = that.getResourceBundle().getText('viewPais30');
					break;
				case 31:
					traducao = that.getResourceBundle().getText('viewPais31');
					break;
				case 32:
					traducao = that.getResourceBundle().getText('viewPais32');
					break;
				case 33:
					traducao = that.getResourceBundle().getText('viewPais33');
					break;
				case 34:
					traducao = that.getResourceBundle().getText('viewPais34');
					break;
				case 35:
					traducao = that.getResourceBundle().getText('viewPais35');
					break;
				case 36:
					traducao = that.getResourceBundle().getText('viewPais36');
					break;
				case 37:
					traducao = that.getResourceBundle().getText('viewPais37');
					break;
				case 38:
					traducao = that.getResourceBundle().getText('viewPais38');
					break;
				case 39:
					traducao = that.getResourceBundle().getText('viewPais39');
					break;
				case 40:
					traducao = that.getResourceBundle().getText('viewPais40');
					break;
				case 41:
					traducao = that.getResourceBundle().getText('viewPais41');
					break;
				case 42:
					traducao = that.getResourceBundle().getText('viewPais42');
					break;
				case 43:
					traducao = that.getResourceBundle().getText('viewPais43');
					break;
				case 44:
					traducao = that.getResourceBundle().getText('viewPais44');
					break;
				case 45:
					traducao = that.getResourceBundle().getText('viewPais45');
					break;
				case 46:
					traducao = that.getResourceBundle().getText('viewPais46');
					break;
				case 47:
					traducao = that.getResourceBundle().getText('viewPais47');
					break;
				case 48:
					traducao = that.getResourceBundle().getText('viewPais48');
					break;
				case 49:
					traducao = that.getResourceBundle().getText('viewPais49');
					break;
				case 50:
					traducao = that.getResourceBundle().getText('viewPais50');
					break;
				case 51:
					traducao = that.getResourceBundle().getText('viewPais51');
					break;
				case 52:
					traducao = that.getResourceBundle().getText('viewPais52');
					break;
				case 53:
					traducao = that.getResourceBundle().getText('viewPais53');
					break;
				case 54:
					traducao = that.getResourceBundle().getText('viewPais54');
					break;
				case 55:
					traducao = that.getResourceBundle().getText('viewPais55');
					break;
				case 56:
					traducao = that.getResourceBundle().getText('viewPais56');
					break;
				case 57:
					traducao = that.getResourceBundle().getText('viewPais57');
					break;
				case 58:
					traducao = that.getResourceBundle().getText('viewPais58');
					break;
				case 59:
					traducao = that.getResourceBundle().getText('viewPais59');
					break;
				case 60:
					traducao = that.getResourceBundle().getText('viewPais60');
					break;
				case 61:
					traducao = that.getResourceBundle().getText('viewPais61');
					break;
				case 62:
					traducao = that.getResourceBundle().getText('viewPais62');
					break;
				case 63:
					traducao = that.getResourceBundle().getText('viewPais63');
					break;
				case 64:
					traducao = that.getResourceBundle().getText('viewPais64');
					break;
				case 65:
					traducao = that.getResourceBundle().getText('viewPais65');
					break;
				case 66:
					traducao = that.getResourceBundle().getText('viewPais66');
					break;
				case 67:
					traducao = that.getResourceBundle().getText('viewPais67');
					break;
				case 68:
					traducao = that.getResourceBundle().getText('viewPais68');
					break;
				case 69:
					traducao = that.getResourceBundle().getText('viewPais69');
					break;
				case 70:
					traducao = that.getResourceBundle().getText('viewPais70');
					break;
				case 71:
					traducao = that.getResourceBundle().getText('viewPais71');
					break;
				case 72:
					traducao = that.getResourceBundle().getText('viewPais72');
					break;
				case 73:
					traducao = that.getResourceBundle().getText('viewPais73');
					break;
				case 74:
					traducao = that.getResourceBundle().getText('viewPais74');
					break;
				case 75:
					traducao = that.getResourceBundle().getText('viewPais75');
					break;
				case 76:
					traducao = that.getResourceBundle().getText('viewPais76');
					break;
				case 77:
					traducao = that.getResourceBundle().getText('viewPais77');
					break;
				case 78:
					traducao = that.getResourceBundle().getText('viewPais78');
					break;
				case 79:
					traducao = that.getResourceBundle().getText('viewPais79');
					break;
				case 80:
					traducao = that.getResourceBundle().getText('viewPais80');
					break;
				case 81:
					traducao = that.getResourceBundle().getText('viewPais81');
					break;
				case 82:
					traducao = that.getResourceBundle().getText('viewPais82');
					break;
				case 83:
					traducao = that.getResourceBundle().getText('viewPais83');
					break;
				case 84:
					traducao = that.getResourceBundle().getText('viewPais84');
					break;
				case 85:
					traducao = that.getResourceBundle().getText('viewPais85');
					break;
				case 86:
					traducao = that.getResourceBundle().getText('viewPais86');
					break;
				case 87:
					traducao = that.getResourceBundle().getText('viewPais87');
					break;
				case 88:
					traducao = that.getResourceBundle().getText('viewPais88');
					break;
				case 89:
					traducao = that.getResourceBundle().getText('viewPais89');
					break;
				case 90:
					traducao = that.getResourceBundle().getText('viewPais90');
					break;
				case 91:
					traducao = that.getResourceBundle().getText('viewPais91');
					break;
				case 92:
					traducao = that.getResourceBundle().getText('viewPais92');
					break;
				case 93:
					traducao = that.getResourceBundle().getText('viewPais93');
					break;
				case 94:
					traducao = that.getResourceBundle().getText('viewPais94');
					break;
				case 95:
					traducao = that.getResourceBundle().getText('viewPais95');
					break;
				case 96:
					traducao = that.getResourceBundle().getText('viewPais96');
					break;
				case 97:
					traducao = that.getResourceBundle().getText('viewPais97');
					break;
				case 98:
					traducao = that.getResourceBundle().getText('viewPais98');
					break;
				case 99:
					traducao = that.getResourceBundle().getText('viewPais99');
					break;
				case 100:
					traducao = that.getResourceBundle().getText('viewPais100');
					break;
				case 101:
					traducao = that.getResourceBundle().getText('viewPais101');
					break;
				case 102:
					traducao = that.getResourceBundle().getText('viewPais102');
					break;
				case 103:
					traducao = that.getResourceBundle().getText('viewPais103');
					break;
				case 104:
					traducao = that.getResourceBundle().getText('viewPais104');
					break;
				case 105:
					traducao = that.getResourceBundle().getText('viewPais105');
					break;
				case 106:
					traducao = that.getResourceBundle().getText('viewPais106');
					break;
				case 107:
					traducao = that.getResourceBundle().getText('viewPais107');
					break;
				case 108:
					traducao = that.getResourceBundle().getText('viewPais108');
					break;
				case 109:
					traducao = that.getResourceBundle().getText('viewPais109');
					break;
				case 110:
					traducao = that.getResourceBundle().getText('viewPais110');
					break;
				case 111:
					traducao = that.getResourceBundle().getText('viewPais111');
					break;
				case 112:
					traducao = that.getResourceBundle().getText('viewPais112');
					break;
				case 113:
					traducao = that.getResourceBundle().getText('viewPais113');
					break;
				case 114:
					traducao = that.getResourceBundle().getText('viewPais114');
					break;
				case 115:
					traducao = that.getResourceBundle().getText('viewPais115');
					break;
				case 116:
					traducao = that.getResourceBundle().getText('viewPais116');
					break;
				case 117:
					traducao = that.getResourceBundle().getText('viewPais117');
					break;
				case 118:
					traducao = that.getResourceBundle().getText('viewPais118');
					break;
				case 119:
					traducao = that.getResourceBundle().getText('viewPais119');
					break;
				case 120:
					traducao = that.getResourceBundle().getText('viewPais120');
					break;
				case 121:
					traducao = that.getResourceBundle().getText('viewPais121');
					break;
				case 122:
					traducao = that.getResourceBundle().getText('viewPais122');
					break;
				case 123:
					traducao = that.getResourceBundle().getText('viewPais123');
					break;
				case 124:
					traducao = that.getResourceBundle().getText('viewPais124');
					break;
				case 125:
					traducao = that.getResourceBundle().getText('viewPais125');
					break;
				case 126:
					traducao = that.getResourceBundle().getText('viewPais126');
					break;
				case 127:
					traducao = that.getResourceBundle().getText('viewPais127');
					break;
				case 128:
					traducao = that.getResourceBundle().getText('viewPais128');
					break;
				case 129:
					traducao = that.getResourceBundle().getText('viewPais129');
					break;
				case 130:
					traducao = that.getResourceBundle().getText('viewPais130');
					break;
				case 131:
					traducao = that.getResourceBundle().getText('viewPais131');
					break;
				case 132:
					traducao = that.getResourceBundle().getText('viewPais132');
					break;
				case 133:
					traducao = that.getResourceBundle().getText('viewPais133');
					break;
				case 134:
					traducao = that.getResourceBundle().getText('viewPais134');
					break;
				case 135:
					traducao = that.getResourceBundle().getText('viewPais135');
					break;
				case 136:
					traducao = that.getResourceBundle().getText('viewPais136');
					break;
				case 137:
					traducao = that.getResourceBundle().getText('viewPais137');
					break;
				case 138:
					traducao = that.getResourceBundle().getText('viewPais138');
					break;
				case 139:
					traducao = that.getResourceBundle().getText('viewPais139');
					break;
				case 140:
					traducao = that.getResourceBundle().getText('viewPais140');
					break;
				case 141:
					traducao = that.getResourceBundle().getText('viewPais141');
					break;
				case 142:
					traducao = that.getResourceBundle().getText('viewPais142');
					break;
				case 143:
					traducao = that.getResourceBundle().getText('viewPais143');
					break;
				case 144:
					traducao = that.getResourceBundle().getText('viewPais144');
					break;
				case 145:
					traducao = that.getResourceBundle().getText('viewPais145');
					break;
				case 146:
					traducao = that.getResourceBundle().getText('viewPais146');
					break;
				case 147:
					traducao = that.getResourceBundle().getText('viewPais147');
					break;
				case 148:
					traducao = that.getResourceBundle().getText('viewPais148');
					break;
				case 149:
					traducao = that.getResourceBundle().getText('viewPais149');
					break;
				case 150:
					traducao = that.getResourceBundle().getText('viewPais150');
					break;
				case 151:
					traducao = that.getResourceBundle().getText('viewPais151');
					break;
				case 152:
					traducao = that.getResourceBundle().getText('viewPais152');
					break;
				case 153:
					traducao = that.getResourceBundle().getText('viewPais153');
					break;
				case 154:
					traducao = that.getResourceBundle().getText('viewPais154');
					break;
				case 155:
					traducao = that.getResourceBundle().getText('viewPais155');
					break;
				case 156:
					traducao = that.getResourceBundle().getText('viewPais156');
					break;
				case 157:
					traducao = that.getResourceBundle().getText('viewPais157');
					break;
				case 158:
					traducao = that.getResourceBundle().getText('viewPais158');
					break;
				case 159:
					traducao = that.getResourceBundle().getText('viewPais159');
					break;
				case 160:
					traducao = that.getResourceBundle().getText('viewPais160');
					break;
				case 161:
					traducao = that.getResourceBundle().getText('viewPais161');
					break;
				case 162:
					traducao = that.getResourceBundle().getText('viewPais162');
					break;
				case 163:
					traducao = that.getResourceBundle().getText('viewPais163');
					break;
				case 164:
					traducao = that.getResourceBundle().getText('viewPais164');
					break;
				case 165:
					traducao = that.getResourceBundle().getText('viewPais165');
					break;
				case 166:
					traducao = that.getResourceBundle().getText('viewPais166');
					break;
				case 167:
					traducao = that.getResourceBundle().getText('viewPais167');
					break;
				case 168:
					traducao = that.getResourceBundle().getText('viewPais168');
					break;
				case 169:
					traducao = that.getResourceBundle().getText('viewPais169');
					break;
				case 170:
					traducao = that.getResourceBundle().getText('viewPais170');
					break;
				case 171:
					traducao = that.getResourceBundle().getText('viewPais171');
					break;
				case 172:
					traducao = that.getResourceBundle().getText('viewPais172');
					break;
				case 173:
					traducao = that.getResourceBundle().getText('viewPais173');
					break;
				case 174:
					traducao = that.getResourceBundle().getText('viewPais174');
					break;
				case 175:
					traducao = that.getResourceBundle().getText('viewPais175');
					break;
				case 176:
					traducao = that.getResourceBundle().getText('viewPais176');
					break;
				case 177:
					traducao = that.getResourceBundle().getText('viewPais177');
					break;
				case 178:
					traducao = that.getResourceBundle().getText('viewPais178');
					break;
				case 179:
					traducao = that.getResourceBundle().getText('viewPais179');
					break;
				case 180:
					traducao = that.getResourceBundle().getText('viewPais180');
					break;
				case 181:
					traducao = that.getResourceBundle().getText('viewPais181');
					break;
				case 182:
					traducao = that.getResourceBundle().getText('viewPais182');
					break;
				case 183:
					traducao = that.getResourceBundle().getText('viewPais183');
					break;
				case 184:
					traducao = that.getResourceBundle().getText('viewPais184');
					break;
				case 185:
					traducao = that.getResourceBundle().getText('viewPais185');
					break;
				case 186:
					traducao = that.getResourceBundle().getText('viewPais186');
					break;
				case 187:
					traducao = that.getResourceBundle().getText('viewPais187');
					break;
				case 188:
					traducao = that.getResourceBundle().getText('viewPais188');
					break;
				case 189:
					traducao = that.getResourceBundle().getText('viewPais189');
					break;
				case 190:
					traducao = that.getResourceBundle().getText('viewPais190');
					break;
				case 191:
					traducao = that.getResourceBundle().getText('viewPais191');
					break;
				case 192:
					traducao = that.getResourceBundle().getText('viewPais192');
					break;
				case 193:
					traducao = that.getResourceBundle().getText('viewPais193');
					break;
				case 194:
					traducao = that.getResourceBundle().getText('viewPais194');
					break;
				case 195:
					traducao = that.getResourceBundle().getText('viewPais195');
					break;
				case 196:
					traducao = that.getResourceBundle().getText('viewPais196');
					break;
				case 197:
					traducao = that.getResourceBundle().getText('viewPais197');
					break;
				case 198:
					traducao = that.getResourceBundle().getText('viewPais198');
					break;
				case 199:
					traducao = that.getResourceBundle().getText('viewPais199');
					break;
				case 200:
					traducao = that.getResourceBundle().getText('viewPais200');
					break;
				case 201:
					traducao = that.getResourceBundle().getText('viewPais201');
					break;
				}
				return traducao;
			},

			traduzCategoriaPagamento: function (nome, that) {
				var traducao = "";
				switch (nome) {
				case "Borne":
					traducao = that.getResourceBundle().getText("viewGeralBorne");
					break;
				case "Collected":
					traducao = that.getResourceBundle().getText("viewGeralCollected");
					break;
				}
				return traducao;
			},

			_reportAdicionar: function (sProperty, that) {
				if (that.getModel().getProperty(sProperty) ? false : true) {
					that.getModel().setProperty(sProperty, []);
				}
				that.getModel().getProperty(sProperty).unshift({
					descricao: null,
					descricaoValueState: sap.ui.core.ValueState.Error,
					parametros: JSON.stringify(that.getModel().getProperty("/Preselecionado"))
				});
				//that.getModel().refresh();
			},

			_dialogSalvar: function (sProperty, that, id) {
				var self = this;
				self._reportAdicionar(sProperty, that);
				var lista = that.getModel().getProperty(sProperty);
				var dialog = new sap.m.Dialog({
					title: that.getResourceBundle().getText("viewGeralGravarVisao"),
					contentWidth: "250px",
					showHeader: true,
					content: [
						new Label({
							required: true,
							text: that.getResourceBundle().getText("viewGeralVisao")
						}),
						new Input({
							value: "{descricao}",
							valueState: "{descricaoValueState}",
							valueStateText: "{i18n>viewGeralCampoNaoPodeSerVazio}"
						}).attachChange(function (oEvent) {
							var obj = oEvent.getSource().mProperties;
							var nomeIgual = lista.find(function (oLista) {		
								return (oLista["descricao"] == obj.value);
							});	
							if (nomeIgual){
								obj.repetido = true;
							}						
							else{
								obj.descricaoValueState = obj.value ? sap.ui.core.ValueState.None : sap.ui.core.ValueState.Error;
								obj.descricao = obj.value;
								obj.repetido = false;
							}							

						}),
						new CheckBox({
							text: that.getResourceBundle().getText("viewGeralDeterminalComoPadrao")
						})
					],
					escapeHandler: function(oPromise){
						oPromise.reject();
					},					
					endButton: new sap.m.Button({
						text: that.getResourceBundle().getText("viewGeralSalvar"),
						press: function () {
							that.setBusy(dialog.getEndButton(),true);
							that.setBusy(dialog.getBeginButton(),true);							
							var aTaxa = that.getModel().getProperty(sProperty),
								bValido = true;
							aTaxa[0].descricao = this.getParent().mAggregations.content[1].mProperties.descricao;
							aTaxa[0].descricaoValueState = this.getParent().mAggregations.content[1].mProperties.descricaoValueState;
							aTaxa[0].ind_default = this.getParent().mAggregations.content[2].mProperties.selected;
							aTaxa[0].repetido = this.getParent().mAggregations.content[1].mProperties.repetido;
							
							if (aTaxa && aTaxa.length) {
								var aTaxaSemDescricao = aTaxa.filter(function (obj) {
									return !obj.descricao;
								});

								if (aTaxaSemDescricao.length) {
									bValido = false;
								}
							}
							if(aTaxa[0].repetido == true){
								bValido = false;
								var errorMsg = that.getResourceBundle().getText("viewGeralErrMsg")
							}


							if (bValido) {
								//that.onAplicarRegras();
								var aPromise = [];
								var nome;
								//that.setBusy(that._dialogFiltro, true);
								for (var i = 0, length = aTaxa.length; i < length; i++) {
									if (aTaxa[i]["descricaoValueState"] === "None" && !aTaxa[i][id]) {
										nome = aTaxa[i]["descricao"];
										
										aPromise.push(NodeAPI.pCriarRegistro("TemplateReport", {
											tela: that.oView.mProperties.viewName,
											parametros: aTaxa[i]["parametros"],
											isIFrame: that.isIFrame() ? "true" : "false",
											descricao: aTaxa[i]["descricao"],
											indDefault: aTaxa[i]["ind_default"],
											usarSession: 1
										}).catch(
											function (err) {
												return err;
											}
										));
									} else if (aTaxa[i]["descricaoValueState"] === "None" && aTaxa[i][id]) {
										aPromise.push(NodeAPI.pAtualizarRegistro("TemplateReport", aTaxa[i][id], {
											tela: that.oView.mProperties.viewName,
											parametros: aTaxa[i]["parametros"],
											isIFrame: that.isIFrame() ? "true" : "false",
											descricao: aTaxa[i]["descricao"],
											indDefault: aTaxa[i]["ind_default"],
											usarSession: 1
										}).catch(
											function (err) {
												return err;
											}
										));
									}
								}

								Promise.all(aPromise)
									.then(function (res) {
										console.log(res);
										//that.setBusy(that._dialogFiltro, false);
										that.getModel().setProperty("/NomeReport",nome);
										dialog.close();
									})
									.catch(function (err){
										console.log(err);
									});
							} else {
								jQuery.sap.require("sap.m.MessageBox");
								if(errorMsg){
									sap.m.MessageBox.show(errorMsg, {
										title: that.getResourceBundle().getText("viewGeralAviso")
									});									
								}else{
									sap.m.MessageBox.show(that.getResourceBundle().getText(
										"ViewDetalheTrimestreJSTextsTodososcamposmarcadossãodepreenchimentoobrigatório"), {
										title: that.getResourceBundle().getText("viewGeralAviso")
									});									
								}
								that.setBusy(dialog.getEndButton(),false);
								that.setBusy(dialog.getBeginButton(),false);								
							}
						}
					}),
					beginButton: new sap.m.Button({
						text: that.getResourceBundle().getText("viewGeralCancelar"),
						press: function () {
							that.setBusy(dialog.getEndButton(),true);
							that.setBusy(dialog.getBeginButton(),true);	
							dialog.close();	
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				}).addStyleClass("sapUiContentPadding");
				dialog.open();

			},

			_dialogAdministrar: function (sProperty, that, id, excluirProperty) {
				var self = this;

				var oTable = new sap.m.Table({
					inset: false
				});

				oTable.addColumn(new sap.m.Column({
					width: "250px"
				}).setHeader(new sap.m.Text({
					text: "{i18n>viewGeralVisao}"
				})));
				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle",
					width: "90px"
				}).setHeader(new sap.m.Text({
					text: "{i18n>viewGeralPadrao}"
				})));
				oTable.addColumn(new sap.m.Column({
					width: "50px"
				}));

				var oInputDescricao = new sap.m.Input({
					value: "{descricao}",
					valueState: "{descricaoValueState}",
					valueStateText: "{i18n>viewGeralCampoNaoPodeSerVazio}"
				}).attachChange(function (oEvent) {
					var obj = oEvent.getSource().getBindingContext().getObject();
					obj.descricaoValueState = obj.descricao ? sap.ui.core.ValueState.None : sap.ui.core.ValueState.Error;
				});

				var oDefault = new sap.m.RadioButton({
					selected: "{ind_default}"
				}).attachSelect(function(oEvent4){
					var obj = oEvent4.getSource().getBindingContext().getObject();
					obj.selectionBoxChanged = true;
				});

				var oBtnExcluir = new sap.m.Button({
					icon: "sap-icon://sys-cancel",
					type: "Transparent",
					tooltip: "{i18n>viewGeralExcluirLinha}"
				}).attachPress(oTable, function (oEvent2) {
					self._reportExcluir(oEvent2, sProperty, excluirProperty, that, id);
				}, that);

				var oTemplate = new sap.m.ColumnListItem({
					//cells: [oBtnExcluir, oInputDescricao, oBtnSelecionar]
					cells: [oInputDescricao, oDefault, oBtnExcluir]
				});

				oTable.bindItems({
					path: sProperty,
					template: oTemplate
				});

				var dialog = new sap.m.Dialog({
					title: "{i18n>viewGeralAdministrarVisoes}",
					contentWidth: "600px",
					showHeader: true,
					content: [
						oTable
					],
					escapeHandler: function(oPromise){
						oPromise.reject();
					},
					endButton: new sap.m.Button({
						text: "OK",
						press: function () {
								that.setBusy(dialog.getEndButton(),true);
								that.setBusy(dialog.getBeginButton(),true);
								var aTaxa = that.getModel().getProperty(sProperty),
									bValido = true;
	
								if (aTaxa && aTaxa.length) {
									var aTaxaSemDescricao = aTaxa.filter(function (obj) {
										return !obj.descricao;
									});
	
									if (aTaxaSemDescricao.length) {
										bValido = false;
									}
								}
							
								if (bValido) {
									
									//that.onAplicarRegras();
									var excluir = that.getModel().getProperty("/Excluir");
									var aPromise = [];
									//that.setBusy(that._dialogFiltro, true);
									for (var i = 0, length = excluir.length; i < length; i++) {
										aPromise.push(
											NodeAPI.pExcluirRegistro("TemplateReport", excluir[i]).catch(
												function(err){
													return err;
												}
											)
										);						
									}
									for (var i = 0, length = aTaxa.length; i < length; i++) {
										if (aTaxa[i]["descricaoValueState"] === "None" && !aTaxa[i][id]) {
											aPromise.push(NodeAPI.pCriarRegistro("TemplateReport", {
													tela: that.oView.mProperties.viewName,
													parametros: aTaxa[i]["parametros"],
													isIFrame: that.isIFrame() ? "true" : "false",
													descricao: aTaxa[i]["descricao"],
													indDefault: aTaxa[i]["in_default"],
													usarSession: 1
												}).catch(
												function(err){
													return err;
												}
											)
											);
										}
										else if((aTaxa[i]["descricaoValueState"] === "None" && aTaxa[i][id]) || aTaxa[i]["selectionBoxChanged"]){
											aPromise.push(NodeAPI.pAtualizarRegistro("TemplateReport", aTaxa[i][id],{
													tela: that.oView.mProperties.viewName,
													parametros: aTaxa[i]["parametros"],
													isIFrame: that.isIFrame() ? "true" : "false",
													descricao: aTaxa[i]["descricao"],
													indDefault: aTaxa[i]["ind_default"],
													usarSession: 1
												}).catch(
												function(err){
													return err;
												}
											)
											);							
										}
									}
									
									Promise.all(aPromise)
										.then(function (res) {
											console.log(res);
											//that.setBusy(that._dialogFiltro, false);
											dialog.close();
										})
										.catch(function (err){
											console.log(err);
										});
								} else {
									jQuery.sap.require("sap.m.MessageBox");
									sap.m.MessageBox.show(that.getResourceBundle().getText(
										"ViewDetalheTrimestreJSTextsTodososcamposmarcadossãodepreenchimentoobrigatório"), {
										title: that.getResourceBundle().getText("viewGeralAviso")
									});
									that.setBusy(dialog.getEndButton(),false);
									that.setBusy(dialog.getBeginButton(),false);
								}
							}
						}),							

					beginButton: new sap.m.Button({
						text: "{i18n>viewGeralCancelar}",
						press: function () {
							that.setBusy(dialog.getEndButton(),true);
							that.setBusy(dialog.getBeginButton(),true);
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				}).addStyleClass("sapUiContentPadding");
				that.getView().addDependent(dialog);

				dialog.open();
			},

			_reportExcluir: function (oEvent, sProperty, excluirProperty, that, id) {
				var array = that.getModel().getProperty(sProperty);
				var oExcluir = oEvent.getSource().getBindingContext().getObject();
				if(oExcluir.ind_default==false){
					var oWhere = that.getModel().getProperty(excluirProperty);
					for (var i = 0, length = array.length; i < length; i++) {
						if (array[i] === oExcluir) {
							if (array[i][id]) {
								oWhere.push(array[i][id]);
							}
							array.splice(i, 1);
						}
					}
					that.getModel().refresh();					
				}else{
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.show(that.getResourceBundle().getText(
						"viewGeralNaoPodeExcluirPadrao"), {
						title: that.getResourceBundle().getText("viewGeralAviso")
					});					
				}

			},

			_reportSelecionar: function (oEvent, sProperty, that) {

				var aTaxaMultipla = that.getModel().getProperty(sProperty);
				var oSelecionado = oEvent.getSource().getBindingContext().getObject();
				that.getModel().setProperty("/Preselecionado", JSON.parse(oSelecionado["parametros"]));
				that.getModel().setProperty("/NomeReport",oSelecionado["descricao"]);
				that.onTemplateGet();

			},

			_dialogReport: function (sTitulo, sProperty, excluirProperty, that, id, oEvent) {
				var self = this;
				that.getModel().setProperty("/Excluir", []);
				if (!that._dialogFiltro) {

					var oTable = new sap.m.Table({
						inset: false
					});
					oTable.addColumn(new sap.m.Column({
						vAlign: "Middle"
					}));
					var oVisao = new sap.m.Text({
						text: "{descricao}"
					});

					var oTemplate = new sap.m.ColumnListItem({
						type: "Active",
						cells: [oVisao]
					}).attachPress(oTable, function (oEvent3) {
						self._reportSelecionar(oEvent3, sProperty, that);
					}, that);

					oTable.bindItems({
						path: sProperty,
						template: oTemplate
					});

					var popover = new Popover({
						title: "{i18n>viewGeralMinhasVisoes}",
						placement: sap.m.PlacementType.Bottom,
						contentHeight: "380px",
						contentWidth: "400px",
						content: [
							oTable
						]
					});

					that.getView().addDependent(popover);

					var oToolbar = new sap.m.Toolbar();
					oToolbar.addContent(new sap.m.ToolbarSpacer());
					oToolbar.addContent(new sap.m.Button({
						text: "{i18n>viewGeralGravarComo}"
					}).attachPress(oTable, function () {
						self._dialogSalvar(sProperty, that, id);
					}, that));

					oToolbar.addContent(new sap.m.Button({
						text: "{i18n>viewGeralAdministrar}"
					}).attachPress(oTable, function () {
						self._dialogAdministrar(sProperty, that, id, excluirProperty);
					}, that));

					popover.setFooter(oToolbar);
					popover.setVerticalScrolling(true);
					that._dialogFiltro = popover;
				}
				that._dialogFiltro.openBy(oEvent.getSource());
			},

			dateNowParaArquivo: function () {
				var Data = new Date();
				var fDataNoPadrao = Data.getDate().toString().padStart(2, "0") + "_" + (Data.getMonth() + 1).toString().padStart(2, "0") + "_" +
					Data.getFullYear().toString();
				return fDataNoPadrao;
			},
			
			criarDialogFiltro: function (sIdTabela, filtrarPor, that, confirmCallback) {
				
				that.byId(sIdTabela).getBinding("items").filter([], false);                         
				
				var oFilterDialog = new sap.m.ViewSettingsDialog();
			
				oFilterDialog.attachConfirm(function (event) {
					var filterSelection = {};
					var filterItems = event.getParameter("filterItems");
			
					if (filterItems && filterItems.length) {
						for (var i = 0, length = filterItems.length; i < length; i++) {
							var filterItem = filterItems[i],
								parentKey = filterItem.getParent().getKey();
							
							if (parentKey) {
								if (filterSelection[parentKey] && filterSelection[parentKey].length) {
									filterSelection[parentKey].push(filterItem.getKey());
								}
								else {
									filterSelection[parentKey] = [filterItem.getKey()];
								}
							}
						}
					}
					
					var	oParent = that.byId(sIdTabela),
						filteredItemsCount = -1;
					
					if (oParent) {
						var filterKeys = Object.keys(filterSelection);
						
						var parentBinding = oParent.getBinding("items");
						var filters = [];
						
						for (var i = 0, length = filterKeys.length; i < length; i++) {
							var column = filterKeys[i];
							var values = filterSelection[column];
							var aux = [];
							
							for (var j = 0, length2 = values.length; j < length2; j++) {
								aux.push(new sap.ui.model.Filter(column, sap.ui.model.FilterOperator.EQ, values[j]));
							}
							
							if (aux.length) {
								filters.push(new sap.ui.model.Filter(aux, false));
							}
						}
						
						parentBinding.filter(filters.length ? filters : [], false);
						
						filteredItemsCount = parentBinding.iLength;
					}
					
					if (confirmCallback) {
						confirmCallback({
							filterSelection: filterSelection,
							filteredItemsCount: filteredItemsCount
						});
					}
				});
				
				var aPromise = [];
				
				for (var i = 0, length = filtrarPor.length; i < length; i++) {
					var item = filtrarPor[i];
					
					var oFilterItemEmpresa = new sap.m.ViewSettingsFilterItem({
						text: item.text,
						key: item.applyTo,
						multiSelect: true
					});
					
					oFilterItemEmpresa.bindItems({
						path: item.items.path,
						template: new sap.m.ViewSettingsItem({ text: '{' + item.items.text + '}', key: '{' + item.items.key + '}' })
					});
					
					oFilterDialog.addFilterItem(oFilterItemEmpresa);
					
					aPromise.push(NodeAPI.pListarRegistros(item.items.loadFrom));
				}
				
				that.getView().addDependent(oFilterDialog);
				
				that._filterDialog = oFilterDialog;
				that._loadFrom = Promise.all(aPromise);
				
				return oFilterDialog;
			}
		};
	}

);