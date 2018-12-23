"use strict";

var db = require("../db");

module.exports = {
	listarTaxPackage: function (req, res) {
		if (req.query.idRelTaxPackagePeriodo) {
			var sIdRelTaxPackagePeriodo = req.query.idRelTaxPackagePeriodo;
			
			// Carrega o tax reconciliation
			var sQuery = 
				'select * from "VGT.TAX_RECONCILIATION" taxRecon '
				+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
				+ 'on taxRecon."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo" '
				+ 'inner join "VGT.PERIODO" periodo '
				+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
				+ 'where taxRecon."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ?';
			var aParams = [sIdRelTaxPackagePeriodo];
			
			var resultTaxRecon = db.executeStatementSync(sQuery, aParams);
			
			/*for (var i = 0, length = resultTaxRecon.length; i < length; i++) {
				resultTaxRecon[i].ind_ativo = (resultTaxRecon[i].ind_ativo === 1);
			}*/
			
			var oTaxReconciliation = resultTaxRecon[0];
			
			if (oTaxReconciliation && oTaxReconciliation.id_tax_reconciliation) {
			
				oTaxReconciliation.ind_ativo = true;
			}
				
				// Carrega a moeda
				sQuery = 
					'select taxPackage."fk_dominio_moeda.id_dominio_moeda" '
					+ 'from "VGT.REL_TAX_PACKAGE_PERIODO" rel '
					+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
					+ 'on rel."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '
					+ 'where '
					+ 'rel."id_rel_tax_package_periodo" = ?';
				aParams = [sIdRelTaxPackagePeriodo];
				
				var resultMoeda = db.executeStatementSync(sQuery, aParams);
				
				// Carrega as diferencas
				sQuery =
					'select * '
					+ 'from "VGT.REL_TAX_PACKAGE_PERIODO" rel '
					+ 'inner join "VGT.PERIODO" periodo '
					+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
					+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
					+ 'on rel."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '
					+ 'where '
					+ 'rel."id_rel_tax_package_periodo" = ? ';
				aParams = [sIdRelTaxPackagePeriodo];
				
				var resultRel = db.executeStatementSync(sQuery, aParams);
				
				var resultDiferenca = [];
				var aDiferenca = [];
				
				if (resultRel) {
					sQuery =
						'select * '
						+ 'from "VGT.DIFERENCA" diferenca '
						+ 'left outer join "VGT.DIFERENCA_OPCAO" diferencaOpcao '
						+ 'on diferenca."fk_diferenca_opcao.id_diferenca_opcao" = diferencaOpcao."id_diferenca_opcao" '
						+ 'left outer join "VGT.DOMINIO_DIFERENCA_TIPO" dominioTipo '
						+ 'on diferencaOpcao."fk_dominio_diferenca_tipo.id_dominio_diferenca_tipo" = dominioTipo."id_dominio_diferenca_tipo" '
						+ 'inner join "VGT.REL_TAX_RECONCILIATION_DIFERENCA" rel '
						+ 'on diferenca."id_diferenca" = rel."fk_diferenca.id_diferenca" '
						+ 'inner join "VGT.TAX_RECONCILIATION" taxRecon '
						+ 'on rel."fk_tax_reconciliation.id_tax_reconciliation" = taxRecon."id_tax_reconciliation" '
						+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" relTaxPackagePeriodo '
						+ 'on taxRecon."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = relTaxPackagePeriodo."id_rel_tax_package_periodo" '
						+ 'inner join "VGT.PERIODO" periodo '
						+ 'on relTaxPackagePeriodo."fk_periodo.id_periodo" = periodo."id_periodo" '
						+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
						+ 'on relTaxPackagePeriodo."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '
						+ 'where '
						+ 'periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
						+ 'and periodo."numero_ordem" <= ? '
						+ 'and taxPackage."fk_empresa.id_empresa" = ? ';
						
					aParams = [resultRel[0]["fk_dominio_ano_calendario.id_dominio_ano_calendario"], resultRel[0].numero_ordem, resultRel[0]["fk_empresa.id_empresa"]];
					
					resultDiferenca = db.executeStatementSync(sQuery, aParams);
					
					for (var i = 0; i < resultDiferenca.length; i++) {
						if (resultDiferenca[i].numero_ordem >= 6 && i < resultDiferenca - 1) {
							resultDiferenca.splice(i, 1);
						}
					}
					
					for (var i = 0; i < resultDiferenca.length; i++) {
						var oDiferenca = resultDiferenca[i];
						
						var oDiferencaEncontrada = aDiferenca.find(function (obj) {
							return obj.id_diferenca === oDiferenca.id_diferenca;	
						});
						
						if (oDiferencaEncontrada) {
							switch (true) {
								case oDiferenca.numero_ordem === 1:
									oDiferencaEncontrada.valor1 = oDiferenca.valor;
									break;
								case oDiferenca.numero_ordem === 2:
									oDiferencaEncontrada.valor2 = oDiferenca.valor;
									break;
								case oDiferenca.numero_ordem === 3:
									oDiferencaEncontrada.valor3 = oDiferenca.valor;
									break;
								case oDiferenca.numero_ordem === 4:
									oDiferencaEncontrada.valor4 = oDiferenca.valor;
									break;
								case oDiferenca.numero_ordem === 5:
									oDiferencaEncontrada.valor5 = oDiferenca.valor;
									break;
								case oDiferenca.numero_ordem >= 6:
									oDiferencaEncontrada.valor6 = oDiferenca.valor;
									break;
							}
						}
						else {
							switch (true) {
								case oDiferenca.numero_ordem === 1:
									oDiferenca.valor1 = oDiferenca.valor;
									break;
								case oDiferenca.numero_ordem === 2:
									oDiferenca.valor2 = oDiferenca.valor;
									break;
								case oDiferenca.numero_ordem === 3:
									oDiferenca.valor3 = oDiferenca.valor;
									break;
								case oDiferenca.numero_ordem === 4:
									oDiferenca.valor4 = oDiferenca.valor;
									break;
								case oDiferenca.numero_ordem === 5:
									oDiferenca.valor5 = oDiferenca.valor;
									break;
								case oDiferenca.numero_ordem >= 6:
									oDiferenca.valor6 = oDiferenca.valor;
									break;
							}
							
							aDiferenca.push(oDiferenca);
						}
					}
					/*for (var i = 0; i < resultDiferenca.length; i++) {
						var oDiferenca = resultDiferenca[i];
						
						oDiferenca.valor1 = oDiferenca.numero_ordem === 1 ? oDiferenca.valor : null;
						oDiferenca.valor2 = oDiferenca.numero_ordem === 2 ? oDiferenca.valor : null;
						oDiferenca.valor3 = oDiferenca.numero_ordem === 3 ? oDiferenca.valor : null;
						oDiferenca.valor4 = oDiferenca.numero_ordem === 4 ? oDiferenca.valor : null;
						oDiferenca.valor5 = oDiferenca.numero_ordem === 5 ? oDiferenca.valor : null;
						oDiferenca.valor6 = oDiferenca.numero_ordem >= 6 ? oDiferenca.valor : null;	
					}*/
				}
				/*sQuery =
					'select * '
					+ 'from "VGT.DIFERENCA" diferenca '
					+ 'inner join "VGT.DIFERENCA_OPCAO" diferencaOpcao '
					+ 'on diferenca."fk_diferenca_opcao.id_diferenca_opcao" = diferencaOpcao."id_diferenca_opcao" '
					+ 'inner join "VGT.DOMINIO_DIFERENCA_TIPO" dominioTipo '
					+ 'on diferencaOpcao."fk_dominio_diferenca_tipo.id_dominio_diferenca_tipo" = dominioTipo."id_dominio_diferenca_tipo" '
					+ 'where '
					+ 'diferenca."fk_tax_reconciliation.id_tax_reconciliation" = ?';
				aParams = [oTaxReconciliation.id_tax_reconciliation];
					
				var resultDiferenca = db.executeStatementSync(sQuery, aParams);
				
				for (var i = 0, length = resultDiferenca.length; i < length; i++) {
					var oDiferenca = resultDiferenca[i];
					
					oDiferenca.valor1 = oTaxReconciliation.numero_ordem === 1 ? oDiferenca.valor : null;
					oDiferenca.valor2 = oTaxReconciliation.numero_ordem === 2 ? oDiferenca.valor : null;
					oDiferenca.valor3 = oTaxReconciliation.numero_ordem === 3 ? oDiferenca.valor : null;
					oDiferenca.valor4 = oTaxReconciliation.numero_ordem === 4 ? oDiferenca.valor : null;
					oDiferenca.valor5 = oTaxReconciliation.numero_ordem === 5 ? oDiferenca.valor : null;
					oDiferenca.valor6 = oTaxReconciliation.numero_ordem >= 6 ? oDiferenca.valor : null;
				}*/
				
				var response = JSON.stringify({
					taxReconciliation: resultTaxRecon && resultTaxRecon.length > 0 ? resultTaxRecon : null,
					diferencaPermanente: aDiferenca.filter(obj => obj.id_dominio_diferenca_tipo === 1),
					diferencaTemporaria: aDiferenca.filter(obj => obj.id_dominio_diferenca_tipo === 2),
					moeda: resultMoeda && resultMoeda.length > 0 ? resultMoeda[0]["fk_dominio_moeda.id_dominio_moeda"] : null
				});
			//}
			/*else {
				response = JSON.stringify(null);
			}*/
			
			res.send(response);
		}
		else {
			res.send(JSON.stringify({
				success: false,
				error: {
					message: "É preciso estipular o id do relacionamento do tax package com o período selecionado."
				}
			}));
		}
	},
	
	inserirTaxPackage: function (req, res) {
		if (req.body.taxPackage) {
			
			var oTaxPackage = JSON.parse(req.body.taxPackage),
				sIdTaxPackage = oTaxPackage.periodo.id_tax_package,
				sIdMoeda = oTaxPackage.moeda, 
				sIdRelTaxPackagePeriodo = oTaxPackage.periodo.id_rel_tax_package_periodo,
				//sIdPeriodo = oTaxPackage.periodo.id_periodo,
				oTaxReconciliation = oTaxPackage.taxReconciliationRcRfIt.find(obj => obj.ind_ativo === true),
				sIncomeTaxDetails = oTaxPackage.incomeTaxDetails,
				aDiferencaPermanente = oTaxPackage.diferencasPermanentes,
				aDiferencaTemporaria = oTaxPackage.diferencasTemporarias,
				iNumeroOrdemPeriodo = oTaxPackage.periodo.numero_ordem,
				aRespostaItemToReport = oTaxPackage.respostaItemToReport,
				/*oLossSchedule = oTaxPackage.lossSchedule,
				oCreditSchedule = oTaxPackage.creditSchedule,*/
				aLossSchedule = oTaxPackage.lossSchedule,
				aCreditSchedule = oTaxPackage.creditSchedule,
				aOtherTax = oTaxPackage.otherTaxes,
				aIncentivoFiscal = oTaxPackage.incentivosFiscais,
				aWHT = oTaxPackage.wht,
				aAntecipacao = oTaxPackage.antecipacoes,
				aOutrasAntecipacoes = oTaxPackage.outrasAntecipacoes;
			
			atualizarMoeda(sIdTaxPackage, sIdMoeda);
			
			var sIdTaxReconciliation = inserirTaxReconciliation(sIdRelTaxPackagePeriodo, oTaxReconciliation, sIncomeTaxDetails);
			
			var sChaveValorDiferenca = pegarChaveValorDiferenca(iNumeroOrdemPeriodo);
			
			inserirDiferenca(sIdTaxReconciliation, aDiferencaPermanente, sChaveValorDiferenca);
			inserirDiferenca(sIdTaxReconciliation, aDiferencaTemporaria, sChaveValorDiferenca);
			
			inserirRespostaItemToReport(sIdRelTaxPackagePeriodo, aRespostaItemToReport);
			
			inserirSchedule(aLossSchedule);
			inserirSchedule(aCreditSchedule);
			
			inserirTaxasMultiplas(sIdTaxReconciliation, aOtherTax, aIncentivoFiscal, aWHT, aOutrasAntecipacoes);
			
			inserirAntecipacoes(sIdTaxReconciliation, aAntecipacao);
			
			res.send(JSON.stringify({
				success: true
			}));
		}
		else {
			res.send(JSON.stringify({
				success: false,
				error: {
					message: "Sem dados para inserir"
				}
			}));
		}
	},
	
	criarScheduleParaNovoPeriodo: function (req, res) {
		if (req.query.parametros) {
			var oParams = JSON.parse(req.query.parametros),
				oPeriodo = oParams.periodo,
				oEmpresa = oParams.empresa,
				oAnoCalendario = oParams.anoCalendario,
				sIdTipoSchedule = oParams.tipo,
				aSchedule = [],
				oSchedule;
			
			/*
			@NOVO_SCHEDULE - descomentar
			var sQuery, aParams;
			
			// pegar id de todos os anos fiscais iguais ou anteriores ao ano calendario corrente
			sQuery = 'select * from "VGT.DOMINIO_ANO_FISCAL" where "ano_fiscal" <= ?';
			aParams = [oAnoCalendario.anoCalendario];
			
			var aAnoFiscal = db.executeStatementSync(sQuery, aParams);
			
			// pegar o id do ano calendario anterior ao ano calendario corrente
			sQuery = 'select * from "VGT.DOMINIO_ANO_CALENDARIO" where "ano_calendario" = ?';
			aParams = [oAnoCalendario.anoCalendario - 1];
			
			var resultAnoCalendarioAnterior = db.executeStatementSync(sQuery, aParams);
			
			// pegar a prescrição cadastrada para o pais vinculado a empresa
			sQuery = 'select * from "VGT.PAIS" where "id_pais" = ?';
			aParams = [oEmpresa["fk_pais.id_pais"]];
			
			var resultPais = db.executeStatementSync(sQuery, aParams),
				prescricao = 0;
			
			if (resultPais) {
				if (Number(sIdTipoSchedule) === 1) {
					// Pega prescricao de Loss
					prescricao = resultPais[0].prescricao_prejuizo ? resultPais[0].prescricao_prejuizo : 0;
				}
				else {
					// Pega prescricao de Credito
					prescricao = resultPais[0].prescricao_credito ? resultPais[0].prescricao_credito : 0;
				}
			}
				
			if (resultAnoCalendarioAnterior) {
				var iIdAnoCalendarioAnterior = resultAnoCalendarioAnterior[0].id_dominio_ano_calendario;
			
				// carregar o retrato de schedule do ultimo periodo do ano calendario anterior	
				sQuery = 
					'select * '
					+ 'from "VGT.SCHEDULE" schedule '
					+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
					+ 'on schedule."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo" '
					+ 'inner join "VGT.PERIODO" periodo '
					+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
					+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
					+ 'on rel."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '
					+ 'where '
					+ 'schedule."fk_dominio_schedule_tipo.id_dominio_schedule_tipo" = ? ' 
					+ 'and periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
					+ 'and taxPackage."fk_empresa.id_empresa" = ? '
					+ 'and periodo."fk_dominio_modulo.id_dominio_modulo" = 2 ' // tax package
					+ 'and periodo."numero_ordem" = ( '
						+ 'select MAX(periodo2."numero_ordem") '
						+ 'from "VGT.SCHEDULE" schedule2 '
						+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel2 '
						+ 'on schedule2."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel2."id_rel_tax_package_periodo" '
						+ 'inner join "VGT.PERIODO" periodo2 '
						+ 'on rel2."fk_periodo.id_periodo" = periodo2."id_periodo" '
						+ 'inner join "VGT.TAX_PACKAGE" taxPackage2 '
						+ 'on rel2."fk_tax_package.id_tax_package" = taxPackage2."id_tax_package" '
						+ 'where '
						+ 'schedule2."fk_dominio_schedule_tipo.id_dominio_schedule_tipo" = ? '
						+ 'and periodo2."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
						+ 'and taxPackage2."fk_empresa.id_empresa" = ? '
						+ 'and periodo2."fk_dominio_modulo.id_dominio_modulo" = 2 ' // tax package
					+ ') ';
				
				aParams = [sIdTipoSchedule, iIdAnoCalendarioAnterior, oEmpresa.id_empresa, sIdTipoSchedule, iIdAnoCalendarioAnterior, oEmpresa.id_empresa];
				
				var resultRetratoScheduleAnoAnterior = db.executeStatementSync(sQuery, aParams);
				
				if (resultRetratoScheduleAnoAnterior && resultRetratoScheduleAnoAnterior.length > 0) {
					// para cada ano fiscal
					for (var i = 0, length = aAnoFiscal.length; i < length; i++) {
						var oAnoFiscal = aAnoFiscal[i];	
						
						// - Se existir um registro deste ano fiscal no retrato de schedule, 
						var oAnoFiscalNoRetrato = resultRetratoScheduleAnoAnterior.find(function (obj) {
							return obj["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"] === oAnoFiscal.id_dominio_ano_fiscal;
						});
						
						if (oAnoFiscalNoRetrato) {
							// utilizar o seu closing balance como opening  balance do registro equivalente no ano calendario corrente
							aSchedule.push({
								"fy": oAnoFiscal.ano_fiscal,
								"year_of_expiration": oAnoFiscal.ano_fiscal + prescricao,
								"opening_balance": (oAnoFiscalNoRetrato && oAnoFiscalNoRetrato.closing_balance) ? oAnoFiscalNoRetrato.closing_balance : 0,
								"current_year_value": 0,
								"current_year_value_utilized": 0,
								"adjustments": 0,
								"justificativa": null,
								"current_year_value_expired": 0,
								"closing_balance": (oAnoFiscalNoRetrato && oAnoFiscalNoRetrato.closing_balance) ? oAnoFiscalNoRetrato.closing_balance : 0,
								"obs": null,
								"fk_rel_tax_package_periodo.id_rel_tax_package_periodo": oPeriodo.id_rel_tax_package_periodo,
								"fk_dominio_schedule_tipo.id_dominio_schedule_tipo": Number(sIdTipoSchedule),
								"fk_dominio_ano_fiscal.id_dominio_ano_fiscal": oAnoFiscal.id_dominio_ano_fiscal,
								"ind_corrente": Number(oAnoCalendario.anoCalendario) === oAnoFiscal.ano_fiscal
							});
						}
						else {
							// - Se não, criar um registro zerado desse ano fiscal no retrato corrente
							aSchedule.push({
								"fy": oAnoFiscal.ano_fiscal,
								"year_of_expiration": oAnoFiscal.ano_fiscal + prescricao,
								"opening_balance": 0,
								"current_year_value": 0,
								"current_year_value_utilized": 0,
								"adjustments": 0,
								"justificativa": null,
								"current_year_value_expired": 0,
								"closing_balance": 0,
								"obs": null,
								"fk_rel_tax_package_periodo.id_rel_tax_package_periodo": oPeriodo.id_rel_tax_package_periodo,
								"fk_dominio_schedule_tipo.id_dominio_schedule_tipo": Number(sIdTipoSchedule),
								"fk_dominio_ano_fiscal.id_dominio_ano_fiscal": oAnoFiscal.id_dominio_ano_fiscal,
								"ind_corrente": Number(oAnoCalendario.anoCalendario) === oAnoFiscal.ano_fiscal
							});
						}
					}
				}
				else {
					for (var i = 0, length = aAnoFiscal.length; i < length; i++) {
						var oAnoFiscal = aAnoFiscal[i];	
						
						aSchedule.push({
							"fy": oAnoFiscal.ano_fiscal,
							"year_of_expiration": oAnoFiscal.ano_fiscal + prescricao,
							"opening_balance": 0,
							"current_year_value": 0,
							"current_year_value_utilized": 0,
							"adjustments": 0,
							"justificativa": null,
							"current_year_value_expired": 0,
							"closing_balance": 0,
							"obs": null,
							"fk_rel_tax_package_periodo.id_rel_tax_package_periodo": oPeriodo.id_rel_tax_package_periodo,
							"fk_dominio_schedule_tipo.id_dominio_schedule_tipo": Number(sIdTipoSchedule),
							"fk_dominio_ano_fiscal.id_dominio_ano_fiscal": oAnoFiscal.id_dominio_ano_fiscal,
							"ind_corrente": Number(oAnoCalendario.anoCalendario) === oAnoFiscal.ano_fiscal
						});
					}
				}
			}
			else {
				for (var i = 0, length = aAnoFiscal.length; i < length; i++) {
					var oAnoFiscal = aAnoFiscal[i];	
					
					aSchedule.push({
						"fy": oAnoFiscal.ano_fiscal,
						"year_of_expiration": oAnoFiscal.ano_fiscal + prescricao,
						"opening_balance": 0,
						"current_year_value": 0,
						"current_year_value_utilized": 0,
						"adjustments": 0,
						"justificativa": null,
						"current_year_value_expired": 0,
						"closing_balance": 0,
						"obs": null,
						"fk_rel_tax_package_periodo.id_rel_tax_package_periodo": oPeriodo.id_rel_tax_package_periodo,
						"fk_dominio_schedule_tipo.id_dominio_schedule_tipo": Number(sIdTipoSchedule),
						"fk_dominio_ano_fiscal.id_dominio_ano_fiscal": oAnoFiscal.id_dominio_ano_fiscal,
						"ind_corrente": Number(oAnoCalendario.anoCalendario) === oAnoFiscal.ano_fiscal
					});
				}
			}
			
			res.send(JSON.stringify(aSchedule));*/
			
			// @NOVO_SCHEDULE - comentar
			var sQuery, aParams, result;
			
			sQuery = 'select * from "VGT.DOMINIO_ANO_CALENDARIO" where "ano_calendario" = ?';
			aParams = [oAnoCalendario.anoCalendario - 1];
			
			result = db.executeStatementSync(sQuery, aParams);
			
			if (result) {
				var idAnoCalendarioAnterior = result[0].id_dominio_ano_calendario;
				
				sQuery = 
					'select * '
					+ 'from "VGT.SCHEDULE" schedule '
					+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
					+ 'on schedule."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo" '
					+ 'inner join "VGT.PERIODO" periodo '
					+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
					+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
					+ 'on rel."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '
					+ 'where '
					+ 'schedule."fk_dominio_schedule_tipo.id_dominio_schedule_tipo" = ? ' 
					+ 'and periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
					+ 'and taxPackage."fk_empresa.id_empresa" = ? '
					+ 'and periodo."fk_dominio_modulo.id_dominio_modulo" = 2 ' // tax package
					+ 'and periodo."numero_ordem" = ( '
						+ 'select MAX(periodo."numero_ordem") '
						+ 'from "VGT.SCHEDULE" schedule '
						+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
						+ 'on schedule."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo" '
						+ 'inner join "VGT.PERIODO" periodo '
						+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
						+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
						+ 'on rel."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '
						+ 'where '
						+ 'schedule."fk_dominio_schedule_tipo.id_dominio_schedule_tipo" = ? '
						+ 'and periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
						+ 'and taxPackage."fk_empresa.id_empresa" = ? '
						+ 'and periodo."fk_dominio_modulo.id_dominio_modulo" = 2 ' // tax package
					+ ') ';
				
				aParams = [sIdTipoSchedule, idAnoCalendarioAnterior, oEmpresa.id_empresa, sIdTipoSchedule, idAnoCalendarioAnterior, oEmpresa.id_empresa];
				
				result = db.executeStatementSync(sQuery, aParams);
				
				if (result && result.length > 0) {
					oSchedule = result[0];
				}
			}
			
			// Se não, é preciso criar um vazio com as informações do ano corrente pegando a prescrição cadastrada para o pais da empresa
			sQuery = 'select * from "VGT.PAIS" where "id_pais" = ?';
			aParams = [oEmpresa["fk_pais.id_pais"]];
			
			result = db.executeStatementSync(sQuery, aParams);
			
			if (result) {
				var prescricao;
				
				if (Number(sIdTipoSchedule) === 1) {
					// Pega prescricao de Loss
					prescricao = result[0].prescricao_prejuizo ? result[0].prescricao_prejuizo : 0;
				}
				else {
					// Pega prescricao de Credito
					prescricao = result[0].prescricao_credito ? result[0].prescricao_credito : 0;
				}
				
				var iAnoCalendario = Number(oAnoCalendario.anoCalendario);
				var iAnoCorrente = (new Date()).getFullYear();
			
				oSchedule = {
					"fy": iAnoCalendario,
					"year_of_expiration": iAnoCorrente + prescricao,
					"opening_balance": (oSchedule && oSchedule.id_schedule) ? oSchedule.closing_balance : 0,
					"current_year_value": 0,
					"current_year_value_utilized": 0,
					"adjustments": null,
					"justificativa": null,
					"current_year_value_expired": null,
					"closing_balance": 0,
					"obs": null,
					"fk_rel_tax_package_periodo.id_rel_tax_package_periodo": oPeriodo.id_rel_tax_package_periodo,
					"fk_dominio_schedule_tipo.id_dominio_schedule_tipo": Number(sIdTipoSchedule),
					"ind_corrente": true
				};
			}
			
			res.send(JSON.stringify(oSchedule)); 
		}
		else {
			res.send(JSON.stringify({
				success: false,
				error: {
					message: "Não foram enviados os parâmetro obrigatórios"
				}
			}));
		}
	},
	
	/*criarScheduleParaNovoPeriodo: function (req, res) {
		if (req.query.parametros) {
			var oParams = JSON.parse(req.query.parametros),
				oPeriodo = oParams.periodo,
				oEmpresa = oParams.empresa,
				oAnoCalendario = oParams.anoCalendario,
				sIdTipoSchedule = oParams.tipo,
				oSchedule;
			
			var sQuery, aParams, result;
			
			sQuery = 'select * from "VGT.DOMINIO_ANO_CALENDARIO" where "ano_calendario" = ?';
			aParams = [oAnoCalendario.anoCalendario - 1];
			
			result = db.executeStatementSync(sQuery, aParams);
			
			if (result) {
				var idAnoCalendarioAnterior = result[0].id_dominio_ano_calendario;
				
				sQuery = 
					'select * '
					+ 'from "VGT.SCHEDULE" schedule '
					+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
					+ 'on schedule."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo" '
					+ 'inner join "VGT.PERIODO" periodo '
					+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
					+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
					+ 'on rel."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '
					+ 'where '
					+ 'schedule."fk_dominio_schedule_tipo.id_dominio_schedule_tipo" = ? ' 
					+ 'and periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
					+ 'and taxPackage."fk_empresa.id_empresa" = ? '
					+ 'and periodo."fk_dominio_modulo.id_dominio_modulo" = 2 ' // tax package
					+ 'and periodo."numero_ordem" = ( '
						+ 'select MAX(periodo."numero_ordem") '
						+ 'from "VGT.SCHEDULE" schedule '
						+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
						+ 'on schedule."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo" '
						+ 'inner join "VGT.PERIODO" periodo '
						+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
						+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
						+ 'on rel."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '
						+ 'where '
						+ 'schedule."fk_dominio_schedule_tipo.id_dominio_schedule_tipo" = ? '
						+ 'and periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
						+ 'and taxPackage."fk_empresa.id_empresa" = ? '
						+ 'and periodo."fk_dominio_modulo.id_dominio_modulo" = 2 ' // tax package
					+ ') ';
				
				aParams = [sIdTipoSchedule, idAnoCalendarioAnterior, oEmpresa.id_empresa, sIdTipoSchedule, idAnoCalendarioAnterior, oEmpresa.id_empresa];
				
				result = db.executeStatementSync(sQuery, aParams);
				
				if (result && result.length > 0) {
					oSchedule = result[0];
				}
			}
			
			// Se não, é preciso criar um vazio com as informações do ano corrente pegando a prescrição cadastrada para o pais da empresa
			sQuery = 'select * from "VGT.PAIS" where "id_pais" = ?';
			aParams = [oEmpresa["fk_pais.id_pais"]];
			
			result = db.executeStatementSync(sQuery, aParams);
			
			if (result) {
				var prescricao;
				
				if (Number(sIdTipoSchedule) === 1) {
					// Pega prescricao de Loss
					prescricao = result[0].prescricao_prejuizo ? result[0].prescricao_prejuizo : 0;
				}
				else {
					// Pega prescricao de Credito
					prescricao = result[0].prescricao_credito ? result[0].prescricao_credito : 0;
				}
				
				var iAnoCalendario = Number(oAnoCalendario.anoCalendario);
				var iAnoCorrente = (new Date()).getFullYear();
			
				oSchedule = {
					"fy": iAnoCalendario,
					"year_of_expiration": iAnoCorrente + prescricao,
					"opening_balance": (oSchedule && oSchedule.id_schedule) ? oSchedule.closing_balance : 0,
					"current_year_value": 0,
					"current_year_value_utilized": 0,
					"adjustments": null,
					"justificativa": null,
					"current_year_value_expired": null,
					"closing_balance": 0,
					"obs": null,
					"fk_rel_tax_package_periodo.id_rel_tax_package_periodo": oPeriodo.id_rel_tax_package_periodo,
					"fk_dominio_schedule_tipo.id_dominio_schedule_tipo": Number(sIdTipoSchedule),
					"ind_corrente": true
				};
				
				
			}
			
			res.send(JSON.stringify(oSchedule)); 
		}
		else {
			res.send(JSON.stringify({
				success: false,
				error: {
					message: "Não foram enviados os parâmetro obrigatórios"
				}
			}));
		}
	},*/
	
	listarHistoricoSchedule: function (req, res) {
		if (req.query.parametros) {
			var oParams = JSON.parse(req.query.parametros),
				oEmpresa = oParams.empresa,
				oAnoCalendario = oParams.anoCalendario,
				sIdTipoSchedule = oParams.tipo,
				aSchedule = [];
			
			var sQuery, aParams, result;
			
			sQuery = 'select * from "VGT.DOMINIO_ANO_CALENDARIO" where "ano_calendario" <= ?';
			aParams = [oAnoCalendario.anoCalendario - 1];
			
			result = db.executeStatementSync(sQuery, aParams);
			
			if (result && result.length > 0) {
				for (var i = 0, length = result.length; i < length; i++) {
					var idAnoCalendario = result[i].id_dominio_ano_calendario;
					
					sQuery = 
						'select * '
						+ 'from "VGT.SCHEDULE" schedule '
						+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
						+ 'on schedule."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo" '
						+ 'inner join "VGT.PERIODO" periodo '
						+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
						+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
						+ 'on rel."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '
						+ 'where '
						+ 'schedule."fk_dominio_schedule_tipo.id_dominio_schedule_tipo" = ? ' 
						+ 'and periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
						+ 'and taxPackage."fk_empresa.id_empresa" = ? '
						+ 'and periodo."fk_dominio_modulo.id_dominio_modulo" = 2 ' // tax package
						+ 'and periodo."numero_ordem" = ( '
							+ 'select MAX(periodo."numero_ordem") '
							+ 'from "VGT.SCHEDULE" schedule '
							+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
							+ 'on schedule."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo" '
							+ 'inner join "VGT.PERIODO" periodo '
							+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
							+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
							+ 'on rel."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '
							+ 'where '
							+ 'schedule."fk_dominio_schedule_tipo.id_dominio_schedule_tipo" = ? '
							+ 'and periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
							+ 'and taxPackage."fk_empresa.id_empresa" = ? '
							+ 'and periodo."fk_dominio_modulo.id_dominio_modulo" = 2 ' // tax package
						+ ') ';
					
					aParams = [sIdTipoSchedule, idAnoCalendario, oEmpresa.id_empresa, sIdTipoSchedule, idAnoCalendario, oEmpresa.id_empresa];
					
					var result2 = db.executeStatementSync(sQuery, aParams);
					
					if (result2 && result2.length > 0) {
						aSchedule.push(result2[0]);
					}
				}
			}
			
			res.send(JSON.stringify(aSchedule)); 
		}
		else {
			res.send(JSON.stringify({
				success: false,
				error: {
					message: "Não foram enviados os parâmetro obrigatórios"
				}
			}));
		}
	},
	
	listagemEmpresas: function (req, res) {
		if (req.query.anoCalendario) {
			var sQuery = 
				'select empresa."id_empresa", '
				+ 'empresa."nome" "empresa",  '
				+ 'empresa."num_hfm_sap", '
				+ 'empresa."tin", '
				+ 'empresa."jurisdicao_tin", '
				+ 'empresa."ni", '
				+ 'empresa."jurisdicao_ni", '
				+ 'empresa."endereco", '
				+ 'empresa."fy_start_date", '
				+ 'empresa."fy_end_date", '
				+ 'empresa."lbc_nome", '
				+ 'empresa."lbc_email", '
				+ 'empresa."comentarios", '
				+ 'empresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario", '
				+ 'empresa."fk_dominio_empresa_status.id_dominio_empresa_status", '
				+ 'empresa."fk_aliquota.id_aliquota", '
				+ 'empresa."fk_pais.id_pais", '
				+ 'pais."id_pais", '
				+ 'pais."prescricao_prejuizo", '
				+ 'pais."limite_utilizacao_prejuizo", '
				+ 'pais."prescricao_credito", '
				+ 'pais."fk_dominio_pais.id_dominio_pais", '
				+ 'pais."fk_dominio_pais_status.id_dominio_pais_status", '
				+ 'pais."fk_aliquota.id_aliquota", '
				+ 'pais."fk_dominio_pais_regiao.id_dominio_pais_regiao", '
				+ 'primeiro_periodo."status_envio" "status_primeiro_periodo",  '
				+ 'segundo_periodo."status_envio" "status_segundo_periodo", '
				+ 'terceiro_periodo."status_envio" "status_terceiro_periodo", '
				+ 'quarto_periodo."status_envio" "status_quarto_periodo", '
				+ 'anual."status_envio" "status_anual", '
				+ 'count(retificadoras."id_tax_reconciliation") "qte_retificadoras" '
				+ 'from "VGT.EMPRESA" empresa '
				+ 'inner join "VGT.PAIS" pais '
				+ 'on empresa."fk_pais.id_pais" = pais."id_pais" '
				+ 'left outer join ( '
				+ 'select *  '
				+ 'from "VGT.TAX_PACKAGE" taxPackage '
				+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
				+ 'on taxPackage."id_tax_package" = rel."fk_tax_package.id_tax_package" '
				+ 'inner join "VGT.PERIODO" periodo '
				+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
				+ 'where '
				+ 'periodo."numero_ordem" = 1 '
				+ ') primeiro_periodo '
				+ 'on empresa."id_empresa" = primeiro_periodo."fk_empresa.id_empresa" '
				+ 'left outer join ( '
				+ 'select *  '
				+ 'from "VGT.TAX_PACKAGE" taxPackage '
				+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
				+ 'on taxPackage."id_tax_package" = rel."fk_tax_package.id_tax_package" '
				+ 'inner join "VGT.PERIODO" periodo '
				+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
				+ 'where '
				+ 'periodo."numero_ordem" = 2 '
				+ ') segundo_periodo '
				+ 'on empresa."id_empresa" = segundo_periodo."fk_empresa.id_empresa" '
				+ 'left outer join ( '
				+ 'select *  '
				+ 'from "VGT.TAX_PACKAGE" taxPackage '
				+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
				+ 'on taxPackage."id_tax_package" = rel."fk_tax_package.id_tax_package" '
				+ 'inner join "VGT.PERIODO" periodo '
				+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
				+ 'where '
				+ 'periodo."numero_ordem" = 3 '
				+ ') terceiro_periodo '
				+ 'on empresa."id_empresa" = terceiro_periodo."fk_empresa.id_empresa" '
				+ 'left outer join ( '
				+ 'select * ' 
				+ 'from "VGT.TAX_PACKAGE" taxPackage '
				+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
				+ 'on taxPackage."id_tax_package" = rel."fk_tax_package.id_tax_package" '
				+ 'inner join "VGT.PERIODO" periodo '
				+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
				+ 'where '
				+ 'periodo."numero_ordem" = 4 '
				+ ') quarto_periodo '
				+ 'on empresa."id_empresa" = quarto_periodo."fk_empresa.id_empresa" '
				+ 'left outer join ( '
				+ 'select * ' 
				+ 'from "VGT.TAX_PACKAGE" taxPackage '
				+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
				+ 'on taxPackage."id_tax_package" = rel."fk_tax_package.id_tax_package" '
				+ 'inner join "VGT.PERIODO" periodo '
				+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
				+ 'where '
				+ 'periodo."numero_ordem" = 5 '
				+ ') anual '
				+ 'on empresa."id_empresa" = anual."fk_empresa.id_empresa" '
				+ 'left outer join ( '
				+ 'select *  '
				+ 'from "VGT.TAX_PACKAGE" taxPackage '
				+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
				+ 'on taxPackage."id_tax_package" = rel."fk_tax_package.id_tax_package" '
				+ 'inner join "VGT.PERIODO" periodo '
				+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
				+ 'left outer join "VGT.TAX_RECONCILIATION" taxReconciliation '
				+ 'on taxReconciliation."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo" '
				+ 'where '
				+ 'periodo."numero_ordem" >= 6 '
				+ ') retificadoras '
				+ 'on empresa."id_empresa" = retificadoras."fk_empresa.id_empresa" '
				+ 'where  '
				+ 'primeiro_periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
				+ 'and segundo_periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
				+ 'and terceiro_periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
				+ 'and quarto_periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
				+ 'and anual."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
				+ 'and retificadoras."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
				+ 'group by empresa."id_empresa", '
				+ 'empresa."nome",  '
				+ 'empresa."num_hfm_sap", '
				+ 'empresa."tin", '
				+ 'empresa."jurisdicao_tin", '
				+ 'empresa."ni", '
				+ 'empresa."jurisdicao_ni", '
				+ 'empresa."endereco", '
				+ 'empresa."fy_start_date", '
				+ 'empresa."fy_end_date", '
				+ 'empresa."lbc_nome", '
				+ 'empresa."lbc_email", '
				+ 'empresa."comentarios", '
				+ 'empresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario", '
				+ 'empresa."fk_dominio_empresa_status.id_dominio_empresa_status", '
				+ 'empresa."fk_aliquota.id_aliquota", '
				+ 'empresa."fk_pais.id_pais",  '
				+ 'pais."id_pais", '
				+ 'pais."prescricao_prejuizo", '
				+ 'pais."limite_utilizacao_prejuizo", '
				+ 'pais."prescricao_credito", '
				+ 'pais."fk_dominio_pais.id_dominio_pais", '
				+ 'pais."fk_dominio_pais_status.id_dominio_pais_status", '
				+ 'pais."fk_aliquota.id_aliquota", '
				+ 'pais."fk_dominio_pais_regiao.id_dominio_pais_regiao", '
				+ 'primeiro_periodo."status_envio",  '
				+ 'segundo_periodo."status_envio",  '
				+ 'terceiro_periodo."status_envio", '
				+ 'quarto_periodo."status_envio",  '
				+ 'anual."status_envio" ';
				
			var aParams = [req.query.anoCalendario, req.query.anoCalendario, req.query.anoCalendario, req.query.anoCalendario, req.query.anoCalendario, req.query.anoCalendario];
			
			db.executeStatement({
				statement: sQuery,
				parameters: aParams
			}, function (err, result) {
				if (err) {
					res.send(JSON.stringify({
						success: false,
						error: err
					}));
				}
				else {
					var auth = require("../auth")();
					
					res.send(JSON.stringify({
						success: true,
						result: auth.filtrarEmpresas(req, result, "id_empresa")
					}));
				}
			});
		}
		else {
			res.send(JSON.stringify({
				success: false,
				error: {
					message: "Não foi enviado ano calendário como filtro"
				}
			}));
		}
	},
	
	encerrarTrimestre: function (req, res) {
		if (req.body.relTaxPackagePeriodo && isNumber(req.body.relTaxPackagePeriodo)) {
				
			//if (pagamentosObrigatoriosDeclarados(Number(req.body.idEmpresa), Number(req.body.idPeriodo))) {
			var sQuery =
				'update "VGT.REL_TAX_PACKAGE_PERIODO" '
				+ 'set "ind_ativo" = ?, '
				+ '"data_envio" = ?, '
				+ '"status_envio" = ? '
				+ 'where '
				+ '"id_rel_tax_package_periodo" = ? ',
				aParams = [false, jsDateObjectToSqlDateString(new Date()), 4 /* enviado */, Number(req.body.relTaxPackagePeriodo)];
				
			db.executeStatement({
				statement: sQuery,
				parameters: aParams
			}, function (err, result) {
				if (err) {
					res.send(JSON.stringify(err));
				}	
				else {
					res.send(JSON.stringify({
						success: true,
						result: result
					}));
				}
			});
			/*} 
			else {
				res.send(JSON.stringify({
					success: false,
					message: "Não foi possível encerrar o período.\nExistem pagamentos obrigatórios para o seu país que não foram declarados ou marcados como N/A."
				}));	
			}*/
		}
		else {
			res.send(JSON.stringify({
				success: false,
				message: "ID do relacionamento do Tax Package com o Período é obrigatório"
			}));
		}
	}
};

function isNumber (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function jsDateObjectToSqlDateString (oDate) {
	return oDate.getFullYear() + "-" + (oDate.getMonth() + 1) + "-" + oDate.getDate();
}

function atualizarMoeda (sIdTaxPackage, sFkMoeda) {
	var sQuery = 'update "VGT.TAX_PACKAGE" set "fk_dominio_moeda.id_dominio_moeda" = ? where "id_tax_package" = ?',
		aParams = [sFkMoeda, sIdTaxPackage];
	
	var result = db.executeStatementSync(sQuery, aParams);
	
	return result === 1;
}

function inserirTaxReconciliation (sFkRelTaxPackagePeriodo, oTaxReconciliation, sIncomeTaxDetails) {
	var sQuery, aParams, result, sIdTaxReconciliation;	
	
	if (oTaxReconciliation.id_tax_reconciliation) {
		// update
		sQuery = 
			'update "VGT.TAX_RECONCILIATION" ' 
				+ 'set "rc_statutory_gaap_profit_loss_before_tax" = ?, '
				+ '"rc_current_income_tax_current_year" = ?, '
				+ '"rc_current_income_tax_previous_year" = ?, '
				+ '"rc_deferred_income_tax" = ?, '
				+ '"rc_non_recoverable_wht" = ?, '
				+ '"rc_statutory_provision_for_income_tax" = ?, '
				+ '"rc_statutory_gaap_profit_loss_after_tax" = ?, '
				+ '"rf_taxable_income_loss_before_losses_and_tax_credits" = ?, '
				+ '"rf_total_losses_utilized" = ?,  '
				+ '"rf_taxable_income_loss_after_losses" = ?, '
				+ '"rf_income_tax_before_other_taxes_and_credits" = ?, '
				+ '"rf_other_taxes" = ?, '
				+ '"rf_incentivos_fiscais" = ?, '
				+ '"rf_total_other_taxes_and_tax_credits" = ?, '				
				+ '"rf_net_local_tax" = ?, '
				+ '"rf_wht" = ?, '
				+ '"rf_overpayment_from_prior_year_applied_to_current_year" = ?, '
				+ '"rf_total_interim_taxes_payments_antecipacoes" = ?, '
				+ '"rf_tax_due_overpaid" = ?, '
				+ '"it_income_tax_as_per_the_statutory_financials" = ?, '
				+ '"it_income_tax_as_per_the_tax_return" = ?, '
				+ '"it_jurisdiction_tax_rate_average" = ?, '
				+ '"it_statutory_tax_rate_average" = ?, '
				+ '"it_effective_tax_rate_as_per_the_statutory_financials" = ?, '
				+ '"it_effective_tax_rate_as_per_the_tax_return" = ?, '
				+ '"it_details_if_tax_returns_income_differs_from_fs"  = ? '
				+ 'where "id_tax_reconciliation" = ?';
				
		aParams = [
			oTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax ,
			oTaxReconciliation.rc_current_income_tax_current_year ,
			oTaxReconciliation.rc_current_income_tax_previous_year ,
			oTaxReconciliation.rc_deferred_income_tax ,
			oTaxReconciliation.rc_non_recoverable_wht ,
			oTaxReconciliation.rc_statutory_provision_for_income_tax ,
			oTaxReconciliation.rc_statutory_gaap_profit_loss_after_tax ,
			oTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits ,
			oTaxReconciliation.rf_total_losses_utilized ,
			oTaxReconciliation.rf_taxable_income_loss_after_losses ,
			oTaxReconciliation.rf_income_tax_before_other_taxes_and_credits ,
			oTaxReconciliation.rf_other_taxes ,
			oTaxReconciliation.rf_incentivos_fiscais ,
			oTaxReconciliation.rf_total_other_taxes_and_tax_credits ,
			oTaxReconciliation.rf_net_local_tax ,
			oTaxReconciliation.rf_wht ,
			oTaxReconciliation.rf_overpayment_from_prior_year_applied_to_current_year ,
			oTaxReconciliation.rf_total_interim_taxes_payments_antecipacoes ,
			oTaxReconciliation.rf_tax_due_overpaid ,
			oTaxReconciliation.it_income_tax_as_per_the_statutory_financials ,
			oTaxReconciliation.it_income_tax_as_per_the_tax_return ,
			oTaxReconciliation.it_jurisdiction_tax_rate_average ,
			oTaxReconciliation.it_statutory_tax_rate_average ,
			oTaxReconciliation.it_effective_tax_rate_as_per_the_statutory_financials ,
			oTaxReconciliation.it_effective_tax_rate_as_per_the_tax_return,
			sIncomeTaxDetails,
			oTaxReconciliation.id_tax_reconciliation
		];
		
		db.executeStatementSync(sQuery, aParams);
		
		sIdTaxReconciliation = oTaxReconciliation.id_tax_reconciliation;
	}
	else {
		// insert		
		sQuery = 
			'insert into "VGT.TAX_RECONCILIATION" ( ' 
				+ '"id_tax_reconciliation", '
				+ '"rc_statutory_gaap_profit_loss_before_tax", '
				+ '"rc_current_income_tax_current_year", '
				+ '"rc_current_income_tax_previous_year", '
				+ '"rc_deferred_income_tax", '
				+ '"rc_non_recoverable_wht", '
				+ '"rc_statutory_provision_for_income_tax", '
				+ '"rc_statutory_gaap_profit_loss_after_tax", '
				+ '"rf_taxable_income_loss_before_losses_and_tax_credits", '
				+ '"rf_total_losses_utilized", '
				+ '"rf_taxable_income_loss_after_losses", '
				+ '"rf_income_tax_before_other_taxes_and_credits", '
				+ '"rf_other_taxes", '
				+ '"rf_incentivos_fiscais", '
				+ '"rf_total_other_taxes_and_tax_credits", '				
				+ '"rf_net_local_tax", '
				+ '"rf_wht", '
				+ '"rf_overpayment_from_prior_year_applied_to_current_year", '
				+ '"rf_total_interim_taxes_payments_antecipacoes", '
				+ '"rf_tax_due_overpaid", '
				+ '"it_income_tax_as_per_the_statutory_financials", '
				+ '"it_income_tax_as_per_the_tax_return", '
				+ '"it_jurisdiction_tax_rate_average", '
				+ '"it_statutory_tax_rate_average", '
				+ '"it_effective_tax_rate_as_per_the_statutory_financials", '
				+ '"it_effective_tax_rate_as_per_the_tax_return", '
				+ '"it_details_if_tax_returns_income_differs_from_fs", '
				+ '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo") '
			+ 'values ('
				+ '"identity_VGT.TAX_RECONCILIATION_id_tax_reconciliation".nextval, '
				+ '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
				
		aParams = [
			oTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax ,
			oTaxReconciliation.rc_current_income_tax_current_year ,
			oTaxReconciliation.rc_current_income_tax_previous_year ,
			oTaxReconciliation.rc_deferred_income_tax ,
			oTaxReconciliation.rc_non_recoverable_wht ,
			oTaxReconciliation.rc_statutory_provision_for_income_tax ,
			oTaxReconciliation.rc_statutory_gaap_profit_loss_after_tax ,
			oTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits ,
			oTaxReconciliation.rf_total_losses_utilized ,
			oTaxReconciliation.rf_taxable_income_loss_after_losses ,
			oTaxReconciliation.rf_income_tax_before_other_taxes_and_credits ,
			oTaxReconciliation.rf_other_taxes ,
			oTaxReconciliation.rf_incentivos_fiscais ,
			oTaxReconciliation.rf_total_other_taxes_and_tax_credits ,
			oTaxReconciliation.rf_net_local_tax ,
			oTaxReconciliation.rf_wht ,
			oTaxReconciliation.rf_overpayment_from_prior_year_applied_to_current_year ,
			oTaxReconciliation.rf_total_interim_taxes_payments_antecipacoes ,
			oTaxReconciliation.rf_tax_due_overpaid ,
			oTaxReconciliation.it_income_tax_as_per_the_statutory_financials ,
			oTaxReconciliation.it_income_tax_as_per_the_tax_return ,
			oTaxReconciliation.it_jurisdiction_tax_rate_average ,
			oTaxReconciliation.it_statutory_tax_rate_average ,
			oTaxReconciliation.it_effective_tax_rate_as_per_the_statutory_financials ,
			oTaxReconciliation.it_effective_tax_rate_as_per_the_tax_return,
			sIncomeTaxDetails,
			sFkRelTaxPackagePeriodo
		];
					
					
		result = db.executeStatementSync(sQuery, aParams);
		
		if (result === 1) {
			sQuery = 'select MAX("id_tax_reconciliation") "generated_id" from "VGT.TAX_RECONCILIATION"';
			
			result = db.executeStatementSync(sQuery, []);
			
			sIdTaxReconciliation = result[0].generated_id;
		}		
	}
	
	return sIdTaxReconciliation;
}

function pegarChaveValorDiferenca (iNumeroOrdemPeriodo) {
	switch (true) {
		case iNumeroOrdemPeriodo === 1:
			return "valor1";
		case iNumeroOrdemPeriodo === 2:
			return "valor2";
		case iNumeroOrdemPeriodo === 3:
			return "valor3";
		case iNumeroOrdemPeriodo === 4:
			return "valor4";
		case iNumeroOrdemPeriodo === 5:
			return "valor5";
		case iNumeroOrdemPeriodo >= 6:
			return "valor6";
	}
}

function inserirDiferenca (sFkTaxReconciliation, aDiferenca, sChaveValorDiferenca) {
	var sQuery, aParams;
	
	for (var i = 0, length = aDiferenca.length; i < length; i++) {
		var oDiferenca = aDiferenca[i];
		
		// Se a diferença ja existe
		if (oDiferenca.id_diferenca) {
			sQuery = 
				'select * from "VGT.REL_TAX_RECONCILIATION_DIFERENCA" rel '
				+ 'where '
				+ 'rel."fk_diferenca.id_diferenca" = ? '
				+ 'and rel."fk_tax_reconciliation.id_tax_reconciliation" = ?';
			aParams = [oDiferenca.id_diferenca, sFkTaxReconciliation];
			
			var result = db.executeStatementSync(sQuery, aParams);
			
			// Caso o relacionamento com o tax reconciliation corrente ja existe, atualiza ele
			if (result && result.length > 0) {
				sQuery = 'update "VGT.REL_TAX_RECONCILIATION_DIFERENCA" set "valor" = ? where "fk_tax_reconciliation.id_tax_reconciliation" = ? and "fk_diferenca.id_diferenca" = ?';
				aParams = [oDiferenca[sChaveValorDiferenca], sFkTaxReconciliation, oDiferenca.id_diferenca];
				db.executeStatementSync(sQuery, aParams);
			}
			// Se nao, insere o relacionamento
			else {
				sQuery = 'insert into "VGT.REL_TAX_RECONCILIATION_DIFERENCA"("fk_tax_reconciliation.id_tax_reconciliation", "fk_diferenca.id_diferenca", "valor") values(?, ?, ?)';
				aParams = [sFkTaxReconciliation, oDiferenca.id_diferenca, oDiferenca[sChaveValorDiferenca]];
				db.executeStatementSync(sQuery, aParams);
			}
			
			// Atualiza outro e fk_tipo
			sQuery = 'update "VGT.DIFERENCA" set "outro" = ?, "fk_diferenca_opcao.id_diferenca_opcao" = ? where "id_diferenca" = ?';
			aParams = [oDiferenca.outro, oDiferenca["fk_diferenca_opcao.id_diferenca_opcao"] ? oDiferenca["fk_diferenca_opcao.id_diferenca_opcao"] : null, oDiferenca.id_diferenca];
			
			db.executeStatementSync(sQuery, aParams);
		}
		else {
			// cria a diferenca e o relacioanemtno
			sQuery = 'insert into "VGT.DIFERENCA"("id_diferenca", "outro", "fk_diferenca_opcao.id_diferenca_opcao") values ("identity_VGT.DIFERENCA_id_diferenca".nextval, ?, ?)';
			aParams = [oDiferenca.outro, oDiferenca["fk_diferenca_opcao.id_diferenca_opcao"] ? oDiferenca["fk_diferenca_opcao.id_diferenca_opcao"] : null];
			
			db.executeStatementSync(sQuery, aParams);
			
			sQuery = 'select MAX("id_diferenca") "id_diferenca_criada" from "VGT.DIFERENCA"';
			
			var result = db.executeStatementSync(sQuery);
			
			sQuery = 'insert into "VGT.REL_TAX_RECONCILIATION_DIFERENCA"("fk_tax_reconciliation.id_tax_reconciliation", "fk_diferenca.id_diferenca", "valor") values(?, ?, ?)';
				
			aParams = [sFkTaxReconciliation, result[0].id_diferenca_criada, oDiferenca[sChaveValorDiferenca]];
			
			db.executeStatementSync(sQuery, aParams);
		}
	}
}

/*function inserirDiferenca (sFkTaxReconciliation, aDiferenca, sChaveValorDiferenca) {
	var sQuery, aParams;
	
	for (var i = 0, length = aDiferenca.length; i < length; i++) {
		var oDiferenca = aDiferenca[i];
		
		if (oDiferenca.id_diferenca) {
			// update		
			sQuery = 
				'update "VGT.DIFERENCA" '
					+ 'set "outro" = ?, '
					+ '"fk_diferenca_opcao.id_diferenca_opcao" = ?, '
					+ '"fk_tax_reconciliation.id_tax_reconciliation" = ?, '
					+ '"valor" = ? '
				+ 'where "id_diferenca" = ? ';
						
			aParams = [oDiferenca.outro, oDiferenca["fk_diferenca_opcao.id_diferenca_opcao"], sFkTaxReconciliation, oDiferenca[sChaveValorDiferenca], oDiferenca.id_diferenca];
			
			db.executeStatementSync(sQuery, aParams);					
		}
		else {
			// insert
			sQuery = 
				'insert into "VGT.DIFERENCA" ('
					+ '"id_diferenca", ' 
					+ '"outro", '
					+ '"fk_diferenca_opcao.id_diferenca_opcao", '
					+ '"fk_tax_reconciliation.id_tax_reconciliation", '
					+ '"valor") '
				+ 'values ( '
					+ '"identity_VGT.DIFERENCA_id_diferenca".nextval, '
					+ '?, ?, ?, ?)';
		
			aParams = [oDiferenca.outro, oDiferenca["fk_diferenca_opcao.id_diferenca_opcao"], sFkTaxReconciliation, oDiferenca[sChaveValorDiferenca]];
			
			db.executeStatementSync(sQuery, aParams);					
		}
	}
}*/

function inserirRespostaItemToReport (sFkRelTaxPackagePeriodo, aRespostaItemToReport) {
	var sQuery, aParams, result;
	
	for (var i = 0, length = aRespostaItemToReport.length; i < length; i++) {
		var oRespostaItemToReport = aRespostaItemToReport[i],
			sIdRespostaItemToReport;
		
		if (oRespostaItemToReport.id_resposta_item_to_report) {
			// update
			sQuery = 'update "VGT.RESPOSTA_ITEM_TO_REPORT" '
						+ 'set "fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ?, '
						+ '"fk_item_to_report.id_item_to_report" = ?, '
						+ '"ind_se_aplica" = ?, '
						+ '"resposta" = ? '
						+ 'where '
						+ '"id_resposta_item_to_report" = ? ';
			
			var bSeAplica = oRespostaItemToReport.ind_se_aplica ? oRespostaItemToReport.ind_se_aplica : false;
			
			aParams = [sFkRelTaxPackagePeriodo, oRespostaItemToReport.fkItemToReport, bSeAplica, oRespostaItemToReport.resposta, oRespostaItemToReport.id_resposta_item_to_report];
			
			db.executeStatementSync(sQuery, aParams);
			
			sIdRespostaItemToReport = oRespostaItemToReport.id_resposta_item_to_report;
		}
		else {
			// insert
			sQuery = 'insert into "VGT.RESPOSTA_ITEM_TO_REPORT"( '
						+ '"id_resposta_item_to_report", '
						+ '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo", '
						+ '"fk_item_to_report.id_item_to_report", '
						+ '"ind_se_aplica", '
						+ '"resposta") '
					+ 'values ('
						+ '"identity_VGT.RESPOSTA_ITEM_TO_REPORT_id_resposta_item_to_report".nextval, '
						+ '?, ?, ?, ?)';
			
			var bSeAplica = oRespostaItemToReport.ind_se_aplica ? oRespostaItemToReport.ind_se_aplica : false;
			
			aParams = [sFkRelTaxPackagePeriodo, oRespostaItemToReport.fkItemToReport, bSeAplica, oRespostaItemToReport.resposta];
			
			result = db.executeStatementSync(sQuery, aParams);
			
			if (result === 1) {
				sQuery = 'select MAX("id_resposta_item_to_report") "generated_id" from "VGT.RESPOSTA_ITEM_TO_REPORT"';
				
				result = db.executeStatementSync(sQuery, []);
				
				sIdRespostaItemToReport = result[0].generated_id;
			}	
		}
		
		inserirAnoFiscalRespostaItemToReport(sIdRespostaItemToReport, oRespostaItemToReport.relAnoFiscal ? oRespostaItemToReport.relAnoFiscal : []);
	}
}

function inserirAnoFiscalRespostaItemToReport (sFkRespostaItemToReport, aAnoFiscal) {
	var sQuery, aParams, result;
	
	sQuery = 'select * from "VGT.REL_RESPOSTA_ITEM_TO_REPORT_ANO_FISCAL" where "fk_resposta_item_to_report.id_resposta_item_to_report" = ? ';
	aParams = [sFkRespostaItemToReport];
	
	result = db.executeStatementSync(sQuery, aParams);
	
	for (var i = 0, length = aAnoFiscal.length; i < length; i++) {
		var sIdAnoFiscalEnviado = aAnoFiscal[i];
		
		var oRel = result.find(function (obj) {
			return Number(obj["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]) === Number(sIdAnoFiscalEnviado);
		});
		
		if (!oRel) {
			sQuery = 'insert into "VGT.REL_RESPOSTA_ITEM_TO_REPORT_ANO_FISCAL"("fk_resposta_item_to_report.id_resposta_item_to_report", "fk_dominio_ano_fiscal.id_dominio_ano_fiscal") values (?, ?)';
			aParams = [sFkRespostaItemToReport, sIdAnoFiscalEnviado];
			
			db.executeStatementSync(sQuery, aParams);
		}
	}
	
	for (var i = 0, length = result.length; i < length; i++) {
		var sIdAnoFiscalPersistido = result[i]["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"];
		
		var sIdAnoFiscalEnviado = aAnoFiscal.find(function (sIdEnviado) {
			return Number(sIdEnviado) === sIdAnoFiscalPersistido;
		});
		
		if (!sIdAnoFiscalEnviado) {
			sQuery = 'delete from "VGT.REL_RESPOSTA_ITEM_TO_REPORT_ANO_FISCAL" where "fk_resposta_item_to_report.id_resposta_item_to_report" = ? and "fk_dominio_ano_fiscal.id_dominio_ano_fiscal" = ?';
			aParams = [sFkRespostaItemToReport, sIdAnoFiscalPersistido];
			
			db.executeStatementSync(sQuery, aParams);
		}
	}
}

/*
@NOVO_SCHEDULE - descomentar
function inserirSchedule(aSchedule) {
	var sQuery, aParams;
	
	if (aSchedule && aSchedule.length > 0) {
		for (var i = 0, length = aSchedule.length; i < length; i++) {
			var oSchedule = aSchedule[i];
			
			if (oSchedule.id_schedule) {
				sQuery = 
					'update "VGT.SCHEDULE" '
					+ 'set "fy" = ?, '
					+ '"year_of_expiration" = ?, '
					+ '"opening_balance" = ?, '
					+ '"adjustments" = ?, '
					+ '"justificativa" = ?, '
					+ '"closing_balance" = ?, '
					+ '"obs" = ?, '
					+ '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ?, '
					+ '"current_year_value" = ?, '
					+ '"current_year_value_utilized" = ?, '
					+ '"current_year_value_expired" = ?, '
					+ '"fk_dominio_schedule_tipo.id_dominio_schedule_tipo" = ?, '
					+ '"fk_dominio_ano_fiscal.id_dominio_ano_fiscal" = ?'
					+ 'where "id_schedule" = ? ';
				aParams = [
					oSchedule.fy,
					oSchedule.year_of_expiration,
					oSchedule.opening_balance,
					oSchedule.adjustments,
					oSchedule.justificativa,
					oSchedule.closing_balance,
					oSchedule.obs,
					oSchedule["fk_rel_tax_package_periodo.id_rel_tax_package_periodo"],
					oSchedule.current_year_value,
					oSchedule.current_year_value_utilized,
					oSchedule.current_year_value_expired,
					oSchedule["fk_dominio_schedule_tipo.id_dominio_schedule_tipo"],
					oSchedule["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"],
					oSchedule.id_schedule
				];
			}
			else {
				sQuery  = 
					'INSERT INTO "VGT.SCHEDULE"("id_schedule", '
					+ '"fy", '
					+ '"year_of_expiration", '
					+ '"opening_balance", '
					+ '"adjustments", '
					+ '"justificativa", '
					+ '"closing_balance", '
					+ '"obs", '
					+ '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo", '
					+ '"current_year_value", '
					+ '"current_year_value_utilized", '
					+ '"current_year_value_expired", '
					+ '"fk_dominio_schedule_tipo.id_dominio_schedule_tipo", '
					+ '"fk_dominio_ano_fiscal.id_dominio_ano_fiscal") ' 
					+ ' VALUES( '
					+ '"identity_VGT.SCHEDULE_id_schedule".nextval, '
					+ '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) '; 
					
				aParams = [
					oSchedule.fy,
					oSchedule.year_of_expiration,
					oSchedule.opening_balance,
					oSchedule.adjustments,
					oSchedule.justificativa,
					oSchedule.closing_balance,
					oSchedule.obs,
					oSchedule["fk_rel_tax_package_periodo.id_rel_tax_package_periodo"],
					oSchedule.current_year_value,
					oSchedule.current_year_value_utilized,
					oSchedule.current_year_value_expired,
					oSchedule["fk_dominio_schedule_tipo.id_dominio_schedule_tipo"],
					oSchedule["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]
				];
			}
			
			db.executeStatementSync(sQuery, aParams);
		}
	}
}*/

// @NOVO_SCHEDULE - comentar
function inserirSchedule(oSchedule) {
	var sQuery, aParams;
	
	if (oSchedule) {
		if (oSchedule.id_schedule) {
			sQuery = 
				'update "VGT.SCHEDULE" '
				+ 'set "fy" = ?, '
				+ '"year_of_expiration" = ?, '
				+ '"opening_balance" = ?, '
				+ '"adjustments" = ?, '
				+ '"justificativa" = ?, '
				+ '"closing_balance" = ?, '
				+ '"obs" = ?, '
				+ '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ?, '
				+ '"current_year_value" = ?, '
				+ '"current_year_value_utilized" = ?, '
				+ '"current_year_value_expired" = ?, '
				+ '"fk_dominio_schedule_tipo.id_dominio_schedule_tipo" = ? '
				+ 'where "id_schedule" = ? ';
			aParams = [
				oSchedule.fy,
				oSchedule.year_of_expiration,
				oSchedule.opening_balance,
				oSchedule.adjustments,
				oSchedule.justificativa,
				oSchedule.closing_balance,
				oSchedule.obs,
				oSchedule["fk_rel_tax_package_periodo.id_rel_tax_package_periodo"],
				oSchedule.current_year_value,
				oSchedule.current_year_value_utilized,
				oSchedule.current_year_value_expired,
				oSchedule["fk_dominio_schedule_tipo.id_dominio_schedule_tipo"],
				oSchedule.id_schedule
			];
		}
		else {
			sQuery  = 
				'INSERT INTO "VGT.SCHEDULE"("id_schedule", '
				+ '"fy", '
				+ '"year_of_expiration", '
				+ '"opening_balance", '
				+ '"adjustments", '
				+ '"justificativa", '
				+ '"closing_balance", '
				+ '"obs", '
				+ '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo", '
				+ '"current_year_value", '
				+ '"current_year_value_utilized", '
				+ '"current_year_value_expired", '
				+ '"fk_dominio_schedule_tipo.id_dominio_schedule_tipo") '
				+ ' VALUES( '
				+ '"identity_VGT.SCHEDULE_id_schedule".nextval, '
				+ '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) '; 
				
			aParams = [
				oSchedule.fy,
				oSchedule.year_of_expiration,
				oSchedule.opening_balance,
				oSchedule.adjustments,
				oSchedule.justificativa,
				oSchedule.closing_balance,
				oSchedule.obs,
				oSchedule["fk_rel_tax_package_periodo.id_rel_tax_package_periodo"],
				oSchedule.current_year_value,
				oSchedule.current_year_value_utilized,
				oSchedule.current_year_value_expired,
				oSchedule["fk_dominio_schedule_tipo.id_dominio_schedule_tipo"]
			];
		}
		
		db.executeStatementSync(sQuery, aParams);
	}
}

function inserirTaxasMultiplas (sFkTaxReconciliation, aOtherTax, aIncentivoFiscal, aWHT, aOutrasAntecipacoes) {
	var aTaxaMultipla = aOtherTax.concat(aIncentivoFiscal);
	aTaxaMultipla = aTaxaMultipla.concat(aWHT);
	aTaxaMultipla = aTaxaMultipla.concat(aOutrasAntecipacoes);
	
	var sQuery, aParams;
	
	sQuery = 'select * from "VGT.TAXA_MULTIPLA" where "fk_tax_reconciliation.id_tax_reconciliation" = ? ';
	aParams = [sFkTaxReconciliation];
	
	var result = db.executeStatementSync(sQuery, aParams),
		aTaxaMultiplaPersistida = [];
	
	if (result && result.length > 0) {
		aTaxaMultiplaPersistida = result;
	}
	
	for (var i = 0, length = aTaxaMultiplaPersistida.length; i < length; i++) {
		var oTaxaMultiplaPersistida = aTaxaMultiplaPersistida[i];
		
		var oTaxaMultiplaEnviada = aTaxaMultipla.find(function (obj) {
			return oTaxaMultiplaPersistida.id_taxa_multipla === obj.id_taxa_multipla;
		});
		
		if (!oTaxaMultiplaEnviada) {
			sQuery = 'delete from "VGT.TAXA_MULTIPLA" where "id_taxa_multipla" = ?';
			aParams = [oTaxaMultiplaPersistida.id_taxa_multipla];
			
			db.executeStatementSync(sQuery, aParams);
		}
	}
	
	for (var i = 0, length = aTaxaMultipla.length; i < length; i++) {
		var oTaxaMultipla = aTaxaMultipla[i];
		
		if (oTaxaMultipla.id_taxa_multipla) {
			// update
			sQuery = 
				'update "VGT.TAXA_MULTIPLA" set '
				+ '"descricao" = ?, '
				+ '"valor" = ?, '
				+ '"fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla" = ?, '
				+ '"fk_tax_reconciliation.id_tax_reconciliation" = ? '
				+ 'where '
				+ '"id_taxa_multipla" = ? ';
			aParams = [oTaxaMultipla.descricao, oTaxaMultipla.valor, oTaxaMultipla["fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla"], sFkTaxReconciliation, oTaxaMultipla.id_taxa_multipla];
		}
		else {
			// insert
			sQuery = 
				'insert into "VGT.TAXA_MULTIPLA"( '
				+ '"id_taxa_multipla", '
				+ '"descricao", '
				+ '"valor", '
				+ '"fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla", '
				+ '"fk_tax_reconciliation.id_tax_reconciliation") values ('
				+ '"identity_VGT.TAXA_MULTIPLA_id_taxa_multipla".nextval, ?, ?, ?, ?)';
			aParams = [oTaxaMultipla.descricao, oTaxaMultipla.valor, oTaxaMultipla["fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla"], sFkTaxReconciliation];
		}
		
		db.executeStatementSync(sQuery, aParams);
	}
}

function inserirAntecipacoes (sFkTaxReconciliation, aAntecipacao) {
	var sQuery, aParams;
	
	for (var i = 0, length = aAntecipacao.length; i < length; i++) {
		var oAntecipacao = aAntecipacao[i];
		
		if (!oAntecipacao.id_antecipacao && oAntecipacao.selecionado) {
			sQuery = 
				'insert into "VGT.ANTECIPACAO"( '
				+ '"id_antecipacao", '
				+ '"fk_pagamento.id_pagamento", '
				+ '"fk_tax_reconciliation.id_tax_reconciliation") values ('
				+ '"identity_VGT.ANTECIPACAO_id_antecipacao".nextval, ?, ?)';
			aParams = [oAntecipacao.id_pagamento, sFkTaxReconciliation];
			
			db.executeStatementSync(sQuery, aParams);
		}
	}
	
	sQuery = 'select * from "VGT.ANTECIPACAO" where "fk_tax_reconciliation.id_tax_reconciliation" = ?';
	aParams = [sFkTaxReconciliation];
	
	var result = db.executeStatementSync(sQuery, aParams);
	
	if (result) {
		for (var i = 0, length = result.length; i < length; i++) {
			var oAntecipacaoPersistida = result[i];
			
			var oAntecipacaoEnviada = aAntecipacao.find(function (obj) {
				return obj.id_antecipacao === oAntecipacaoPersistida.id_antecipacao;
			});
			
			if (oAntecipacaoEnviada && !oAntecipacaoEnviada.selecionado) {
				sQuery = 'delete from "VGT.ANTECIPACAO" where "id_antecipacao" = ?';
				aParams = [oAntecipacaoPersistida.id_antecipacao];
				
				db.executeStatementSync(sQuery, aParams);
			}
		}
	}
}