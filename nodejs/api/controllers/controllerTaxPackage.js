"use strict";

const db = require("../db");
const modelDiferenca = require('../models/modelDiferenca');
const modelDiferencaOpcao = require('../models/modelDiferencaOpcao');
const Excel = require('exceljs');
const QueryBuildHelper = require('../QueryBuildHelper.js');

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
			
			var resultTaxRecon = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
			
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
				
				var resultMoeda = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
				
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
				
				var resultRel = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
				
				var resultDiferenca = [];
				var aDiferenca = [];
				
				if (resultRel) {
					sQuery =
						'select diferenca.*, '
						+ 'diferencaOpcao.*, '
						+ 'dominioTipo.*, '
						+ 'rel.*, '
						+ 'taxRecon."id_tax_reconciliation", '
						+ 'periodo.*, '
						+ 'taxPackage."id_tax_package" '
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
						+ 'and taxPackage."fk_empresa.id_empresa" = ? '
						+ 'order by periodo."numero_ordem", relTaxPackagePeriodo."id_rel_tax_package_periodo" ';
						
					aParams = [resultRel[0]["fk_dominio_ano_calendario.id_dominio_ano_calendario"], resultRel[0].numero_ordem, resultRel[0]["fk_empresa.id_empresa"]];
					
					resultDiferenca = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
					
					for (var i = 0; i < resultDiferenca.length; i++) {
						if (resultDiferenca[i].numero_ordem === 6 && i < resultDiferenca - 1) {
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
								case oDiferenca.numero_ordem === 6:
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
								case oDiferenca.numero_ordem === 6:
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
				aDiferencaPermanenteExcluida = oTaxPackage.diferencasPermanentesExcluidas,
				aDiferencaTemporaria = oTaxPackage.diferencasTemporarias,
				aDiferencaTemporariaExcluida = oTaxPackage.diferencasTemporariasExcluidas,
				iNumeroOrdemPeriodo = oTaxPackage.periodo.numero_ordem,
				aRespostaItemToReport = oTaxPackage.respostaItemToReport,
				/*oLossSchedule = oTaxPackage.lossSchedule,
				oCreditSchedule = oTaxPackage.creditSchedule,*/
				aLossSchedule = oTaxPackage.lossSchedule,
				aTotalLossesUtilized = oTaxPackage.totalLossesUtilized,
				aCreditSchedule = oTaxPackage.creditSchedule,
				aOverpaymentFromPriorYearAppliedToCurrentYear = oTaxPackage.overpaymentFromPriorYearAppliedToCurrentYear,
				aOtherTax = oTaxPackage.otherTaxes,
				aIncentivoFiscal = oTaxPackage.incentivosFiscais,
				aWHT = oTaxPackage.wht,
				aAntecipacao = oTaxPackage.antecipacoes,
				aOutrasAntecipacoes = oTaxPackage.outrasAntecipacoes;
			
			atualizarMoeda(oTaxPackage.periodo, sIdMoeda, req);
			//atualizarMoeda(sIdTaxPackage, sIdMoeda);
			atualizarStatus(sIdRelTaxPackagePeriodo, req);
			
			var sIdTaxReconciliation = inserirTaxReconciliation(sIdRelTaxPackagePeriodo, oTaxReconciliation, sIncomeTaxDetails, req);
			
			var sChaveValorDiferenca = pegarChaveValorDiferenca(iNumeroOrdemPeriodo);
			
			inserirDiferenca(sIdTaxReconciliation, aDiferencaPermanente, sChaveValorDiferenca, req);
			inserirDiferenca(sIdTaxReconciliation, aDiferencaTemporaria, sChaveValorDiferenca, req);
			
			excluirDiferenca(aDiferencaPermanenteExcluida.concat(aDiferencaTemporariaExcluida), req);
			
			inserirRespostaItemToReport(sIdRelTaxPackagePeriodo, aRespostaItemToReport, req);
			
			inserirSchedule(aLossSchedule, req);
			inserirSchedule(aCreditSchedule, req);
			
			inserirScheduleValueUtilized(sIdTaxReconciliation, aTotalLossesUtilized, aOverpaymentFromPriorYearAppliedToCurrentYear, req);
			
			inserirTaxasMultiplas(sIdTaxReconciliation, aOtherTax, aIncentivoFiscal, aWHT, aOutrasAntecipacoes, req);
			
			inserirAntecipacoes(sIdTaxReconciliation, aAntecipacao, req);
			
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
			
			
			//@NOVO_SCHEDULE - descomentar
			var sQuery, aParams;
			
			// pegar id de todos os anos fiscais iguais ou anteriores ao ano calendario corrente
			sQuery = 'select * from "VGT.DOMINIO_ANO_FISCAL" where "ano_fiscal" <= ?';
			aParams = [oAnoCalendario.anoCalendario];
			
			var aAnoFiscal = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
			
			// pegar o id do ano calendario anterior ao ano calendario corrente
			sQuery = 'select * from "VGT.DOMINIO_ANO_CALENDARIO" where "ano_calendario" = ?';
			aParams = [oAnoCalendario.anoCalendario - 1];
			
			var resultAnoCalendarioAnterior = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
			
			// pegar a prescrição cadastrada para o pais vinculado a empresa
			sQuery = 'select * from "VGT.PAIS" where "id_pais" = ?';
			aParams = [oEmpresa["fk_pais.id_pais"]];
			
			var resultPais = db.executeStatementSync(sQuery, aParams, { idUsuario: req }),
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
				
			if (resultAnoCalendarioAnterior && resultAnoCalendarioAnterior[0]) {
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
				
				var resultRetratoScheduleAnoAnterior = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
				
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
			
			res.send(JSON.stringify(aSchedule));
			
			/*
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
			
			res.send(JSON.stringify(oSchedule)); */
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
			
			result = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
			
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
					
					var result2 = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
					
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
			/*var sQuery = 
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
				+ 'empresa."fk_aliquota.id_aliquota" "fk_imposto_empresa", '
				+ 'empresa."fk_pais.id_pais", '
				+ 'pais."id_pais", '
				+ 'pais."prescricao_prejuizo", '
				+ 'pais."limite_utilizacao_prejuizo", '
				+ 'pais."prescricao_credito", '
				+ 'pais."fk_dominio_pais.id_dominio_pais", '
				+ 'pais."fk_dominio_pais_status.id_dominio_pais_status", '
				+ 'pais."fk_aliquota.id_aliquota" "fk_imposto_pais", '
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
				+ 'anual."status_envio" ';*/
				
			var sQuery =
				'select  '
				+ 'empresa."id_empresa", '
				+ 'empresa."nome" "empresa", '
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
				+ 'empresa."fk_aliquota.id_aliquota" "fk_imposto_empresa", '
				+ 'empresa."fk_pais.id_pais", '
				+ 'pais."id_pais", '
				+ 'pais."prescricao_prejuizo", '
				+ 'pais."limite_utilizacao_prejuizo", '
				+ 'pais."prescricao_credito", '
				+ 'pais."fk_dominio_pais.id_dominio_pais", '
				+ 'pais."fk_dominio_pais_status.id_dominio_pais_status", '
				+ 'pais."fk_aliquota.id_aliquota" "fk_imposto_pais", '
				+ 'pais."fk_dominio_pais_regiao.id_dominio_pais_regiao", '
				+ 'COALESCE(primeiroPeriodo."status_envio", 1) "status_primeiro_periodo", ' 
				+ 'COALESCE(segundoPeriodo."status_envio", 1) "status_segundo_periodo", '
				+ 'COALESCE(terceiroPeriodo."status_envio", 1) "status_terceiro_periodo", '
				+ 'COALESCE(quartoPeriodo."status_envio", 1) "status_quarto_periodo", '
				+ 'COALESCE(anual."status_envio", 1) "status_anual", '
				+ 'COALESCE(retificadoras."qte_retificadoras", 0) "qte_retificadoras" '
				+ 'from "VGT.EMPRESA" empresa '
				+ 'inner join "VGT.PAIS" pais '
				+ 'on empresa."fk_pais.id_pais" = pais."id_pais" '
				+ 'inner join ( '
				+ 'select t."id_empresa", t."id_periodo", MAX(rel."status_envio") "status_envio" '
				+ 'from ( '
				+ 'select *  '
				+ 'from "VGT.EMPRESA" empresa '
				+ 'inner join "VGT.PERIODO" periodo '
				+ 'on periodo."id_periodo" in ( '
				+ 'select "id_periodo" '
				+ 'from "VGT.PERIODO"  '
				+ 'where '
				+ '"numero_ordem" = 1 '
				+ 'and "fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
				+ 'and "fk_dominio_modulo.id_dominio_modulo" = 2 '
				+ ') '
				+ ') t '
				+ 'left outer join "VGT.TAX_PACKAGE" taxPackage '
				+ 'on t."id_empresa" = taxPackage."fk_empresa.id_empresa" '
				+ 'left outer join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
				+ 'on taxPackage."id_tax_package" = rel."fk_tax_package.id_tax_package" '
				+ 'and t."id_periodo" = rel."fk_periodo.id_periodo" '
				+ 'group by t."id_empresa", t."id_periodo" '
				+ ') primeiroPeriodo '
				+ 'on empresa."id_empresa" = primeiroPeriodo."id_empresa" '
				+ 'inner join ( '
				+ 'select t."id_empresa", t."id_periodo", MAX(rel."status_envio") "status_envio" '
				+ 'from ( '
				+ 'select *  '
				+ 'from "VGT.EMPRESA" empresa '
				+ 'inner join "VGT.PERIODO" periodo '
				+ 'on periodo."id_periodo" in ( '
				+ 'select "id_periodo" '
				+ 'from "VGT.PERIODO"  '
				+ 'where '
				+ '"numero_ordem" = 2 '
				+ 'and "fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
				+ 'and "fk_dominio_modulo.id_dominio_modulo" = 2 '
				+ ') '
				+ ') t '
				+ 'left outer join "VGT.TAX_PACKAGE" taxPackage '
				+ 'on t."id_empresa" = taxPackage."fk_empresa.id_empresa" '
				+ 'left outer join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
				+ 'on taxPackage."id_tax_package" = rel."fk_tax_package.id_tax_package" '
				+ 'and t."id_periodo" = rel."fk_periodo.id_periodo" '
				+ 'group by t."id_empresa", t."id_periodo" '
				+ ') segundoPeriodo '
				+ 'on empresa."id_empresa" = segundoPeriodo."id_empresa" '
				+ 'inner join ( '
				+ 'select t."id_empresa", t."id_periodo", MAX(rel."status_envio") "status_envio" '
				+ 'from ( '
				+ 'select *  ' 
				+ 'from "VGT.EMPRESA" empresa '
				+ 'inner join "VGT.PERIODO" periodo '
				+ 'on periodo."id_periodo" in ( '
				+ 'select "id_periodo" '
				+ 'from "VGT.PERIODO"  '
				+ 'where '
				+ '"numero_ordem" = 3 '
				+ 'and "fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
				+ 'and "fk_dominio_modulo.id_dominio_modulo" = 2 '
				+ ') '
				+ ') t '
				+ 'left outer join "VGT.TAX_PACKAGE" taxPackage '
				+ 'on t."id_empresa" = taxPackage."fk_empresa.id_empresa" '
				+ 'left outer join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
				+ 'on taxPackage."id_tax_package" = rel."fk_tax_package.id_tax_package" '
				+ 'and t."id_periodo" = rel."fk_periodo.id_periodo" '
				+ 'group by t."id_empresa", t."id_periodo" '
				+ ') terceiroPeriodo '
				+ 'on empresa."id_empresa" = terceiroPeriodo."id_empresa" '
				+ 'inner join ( '
				+ 'select t."id_empresa", t."id_periodo", MAX(rel."status_envio") "status_envio" '
				+ 'from ( '
				+ 'select *  '
				+ 'from "VGT.EMPRESA" empresa '
				+ 'inner join "VGT.PERIODO" periodo '
				+ 'on periodo."id_periodo" in ( '
				+ 'select "id_periodo" '
				+ 'from "VGT.PERIODO"  '
				+ 'where '
				+ '"numero_ordem" = 4 '
				+ 'and "fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
				+ 'and "fk_dominio_modulo.id_dominio_modulo" = 2 '
				+ ') '
				+ ') t '
				+ 'left outer join "VGT.TAX_PACKAGE" taxPackage '
				+ 'on t."id_empresa" = taxPackage."fk_empresa.id_empresa" '
				+ 'left outer join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
				+ 'on taxPackage."id_tax_package" = rel."fk_tax_package.id_tax_package" '
				+ 'and t."id_periodo" = rel."fk_periodo.id_periodo" '
				+ 'group by t."id_empresa", t."id_periodo" '
				+ ') quartoPeriodo '
				+ 'on empresa."id_empresa" = quartoPeriodo."id_empresa" '
				+ 'inner join ( '
				+ 'select t."id_empresa", t."id_periodo", MAX(rel."status_envio") "status_envio" '
				+ 'from ( '
				+ 'select *  '
				+ 'from "VGT.EMPRESA" empresa '
				+ 'inner join "VGT.PERIODO" periodo '
				+ 'on periodo."id_periodo" in ( '
				+ 'select "id_periodo" '
				+ 'from "VGT.PERIODO"  '
				+ 'where '
				+ '"numero_ordem" = 5 '
				+ 'and "fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
				+ 'and "fk_dominio_modulo.id_dominio_modulo" = 2 '
				+ ') '
				+ ') t '
				+ 'left outer join "VGT.TAX_PACKAGE" taxPackage '
				+ 'on t."id_empresa" = taxPackage."fk_empresa.id_empresa" '
				+ 'left outer join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
				+ 'on taxPackage."id_tax_package" = rel."fk_tax_package.id_tax_package" '
				+ 'and t."id_periodo" = rel."fk_periodo.id_periodo" '
				+ 'group by t."id_empresa", t."id_periodo" '
				+ ') anual '
				+ 'on empresa."id_empresa" = anual."id_empresa" '
				+ 'left outer join (  '
				+ 'select taxPackage."fk_empresa.id_empresa" "id_empresa", count(taxReconciliation."id_tax_reconciliation") "qte_retificadoras" '
				+ 'from "VGT.TAX_PACKAGE" taxPackage  '
				+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel  '
				+ 'on taxPackage."id_tax_package" = rel."fk_tax_package.id_tax_package"  '
				+ 'left outer join "VGT.TAX_RECONCILIATION" taxReconciliation  '
				+ 'on taxReconciliation."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo"  '
				+ 'where  '
				+ 'rel."fk_periodo.id_periodo" in ( '
				+ 'select "id_periodo" '
				+ 'from "VGT.PERIODO"  '
				+ 'where '
				+ '"numero_ordem" = 6 '
				+ 'and "fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
				+ 'and "fk_dominio_modulo.id_dominio_modulo" = 2 '
				+ ') '
				+ 'group by taxPackage."fk_empresa.id_empresa" '
				+ ') retificadoras 		 '
				+ 'on empresa."id_empresa" = retificadoras."id_empresa" '
				+ 'where '
				+ 'year(coalesce(empresa."data_encerramento", \'2999-01-01\')) >= ( ' 
				+ 'select "ano_calendario" '
				+ 'from "VGT.DOMINIO_ANO_CALENDARIO" '
				+ 'where "id_dominio_ano_calendario" = ?)';
				
			var aParams = [req.query.anoCalendario, req.query.anoCalendario, req.query.anoCalendario, req.query.anoCalendario, req.query.anoCalendario, req.query.anoCalendario, req.query.anoCalendario];
			
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
			var requerAprovacao = req.body.requerAprovacao == "true";
			
			var sQuery =
				'update "VGT.REL_TAX_PACKAGE_PERIODO" '
				+ 'set "ind_ativo" = ?, '
				+ '"data_envio" = ?, '
				+ '"status_envio" = ? '
				+ 'where '
				+ '"id_rel_tax_package_periodo" = ? ',
				aParams = [false, jsDateObjectToSqlDateString(new Date()), (requerAprovacao ? 5 : 4) /* aguardando : enviado */, Number(req.body.relTaxPackagePeriodo)];
				
			db.executeStatement({
				statement: sQuery,
				parameters: aParams
			}, function (err, result) {
				if (err) {
					res.send(JSON.stringify(err));
				}	
				else {
					if (requerAprovacao) {
						sQuery = 
							'insert into "VGT.REQUISICAO_ENCERRAMENTO_PERIODO_TAX_PACKAGE" ('
							+ '"id_requisicao_encerramento_periodo_tax_package", '
							+ '"data_requisicao", '
							+ '"fk_dominio_requisicao_encerramento_periodo_status.id_dominio_requisicao_encerramento_periodo_status", '
							+ '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo", '
							+ '"fk_usuario.id_usuario") ' 
							+ 'values ("identity_VGT.REQUISICAO_ENCERRAMENTO_PERIODO_TAX_PACKAGE_id_requisicao_encerramento_periodo_tax_package".nextval, CURRENT_DATE, 1, ?, ?)'; // abre como pending (id = 1)
						aParams = [req.body.relTaxPackagePeriodo, req.session.usuario.id];
						
						db.executeStatement({
							statement: sQuery,
							parameters: aParams
						}, function (err2, result2) {
							if (err2) {
								res.send(JSON.stringify(err2));
							}	
							else {
								res.send(JSON.stringify({
									success: true,
									result: result2
								}));
							}
						}, {
							idUsuario: req
						});
					}
					else {
						modelDiferenca.setarComoEnviada(req.body.relTaxPackagePeriodo)
							.catch((err) => {
								console.log(err);
							});
						
						// Se é um período que não requer aprovação de envio,
						// submete ele a procedure de atualização do schedule imediatamente para
						// saber se é preciso atualizar as informações de schedule no banco
						db.executeStatement({
							statement: 'call "atualizar_schedule"(?)',
							parameters: [req.body.relTaxPackagePeriodo]
						}, function (err2, result2) {
							if (err2) {
								res.send(JSON.stringify(err2));
							}	
							else {
								res.send(JSON.stringify({
									success: true,
									result: result2
								}));
							}
						}, {
							idUsuario: req
						});	
					}
				}
			}, {
				idUsuario: req
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
	},
	
	checarDeclaracaoEnviada: function (req, res) {
		if (req.query.idRelTaxPackagePeriodo && isNumber(req.query.idRelTaxPackagePeriodo)) {
			
			var sQuery = 'select * from "VGT.DECLARACAO" where "fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ?',
				aParam = [req.query.idRelTaxPackagePeriodo];
				
			db.executeStatement({
				statement: sQuery,
				parameters: aParam
			}, function (err, result) {
				if (err) {
					res.send(JSON.stringify(err));
				}	
				else {
					var declaracao = result.filter(function (obj) {
						return obj.ind_declaracao;	
					});
					
					res.send(JSON.stringify({
						success: true,
						result: declaracao && declaracao.length
					}));
				}
			});
		}	
		else {
			res.send(JSON.stringify({
				success: false,
				error: {
					message: "Não foi enviado o ID do período a ser verificado."
				}
			}));
		}
	},
	
	downloadModeloImport: function (req, res, next) {
		const configurarPastaDiferenca = (workbook, sNomePasta, sColunaDados, qteRegistros) => {
			var worksheet = workbook.getWorksheet(sNomePasta);
					
			for (var i = 2; i <= 1000; i++) {
	        	worksheet.getCell('A' + i).dataValidation = {
				    type: 'list',
				    allowBlank: true,
				    formulae: ["Dados!$" + sColunaDados + "$1:$" + sColunaDados + "$" + qteRegistros],
				    showErrorMessage: true,
				    errorStyle: 'error'
				};
	        }
	        
	        worksheet.getColumn('AB').hidden = true;
		};
		
		const inserirDados = (worksheet, aDado, sColuna1, sColuna2) => {
			for (var i = 0; i < aDado.length; i++) {
	        	worksheet.getCell(sColuna1 + (i + 1)).value = aDado[i].nome;
	        	worksheet.getCell(sColuna2 + (i + 1)).value = aDado[i].id_diferenca_opcao;
	        }
		};
		
		var folder = "download/",
			sheet = "ModelImportTaxPackage.xlsx",
			tmpSheet = `tmp_${(new Date()).getTime()}_${sheet}`;
			
		try {
			var workbook = new Excel.Workbook();
			
			Promise.all([
					modelDiferencaOpcao.listar([ { coluna: modelDiferencaOpcao.colunas.fkDominioDiferencaTipo, valor: 1 } ]),
					modelDiferencaOpcao.listar([ { coluna: modelDiferencaOpcao.colunas.fkDominioDiferencaTipo, valor: 2 } ]),
					workbook.xlsx.readFile(folder + sheet)
				])
				.then(function (res) {
					var resOpcaoPermanente = res[0].sort((a,b) => (a.nome > b.nome) ? 1 : ((b.nome > a.nome) ? -1 : 0)), 
						resOpcaoTemporaria = res[1].sort((a,b) => (a.nome > b.nome) ? 1 : ((b.nome > a.nome) ? -1 : 0));
						
					configurarPastaDiferenca(workbook, 'Temporary Differences', 'A', resOpcaoTemporaria.length);
					configurarPastaDiferenca(workbook, 'Permanent Differences', 'D', resOpcaoPermanente.length);
			        
			        var worksheet = workbook.getWorksheet('Dados');
			        
			        inserirDados(worksheet, resOpcaoTemporaria, 'A', 'B');
			        inserirDados(worksheet, resOpcaoPermanente, 'D', 'E');
			        
			        worksheet.state = 'veryHidden';
			        
			        return workbook.xlsx.writeFile(folder + tmpSheet);
				})
				.then(function () {
					res.download(folder + tmpSheet, sheet);
				})
				.catch((err) => {
					console.log(err);
			    	const error = new Error("Erro ao baixar arquivo: " + err.message);
					next(error);
			    });
		}
		catch (e) {
			console.log(e);
			const error = new Error("Erro ao baixar arquivo: " + e.message);
			next(error);
		}
	},
	
	resumoEmpresaAdmin: function (req, res, next) {
		let sQuery =
			 'select '
			 + 'dominioAnoCalendario."id_dominio_ano_calendario" "idAnoCalendario", '
			 + 'dominioAnoCalendario."ano_calendario" "anoCalendario", '
			 + 'pais."id_pais" "idPais", '
			 + 'pais."fk_aliquota.id_aliquota" "fkTributoPais", '
			 + 'pais."prescricao_prejuizo" "prescricaoPrejuizoPais", '
			 + 'pais."prescricao_credito" "prescricaoCreditoPais", '
			 + 'empresa."id_empresa" "idEmpresa", '
			 + 'empresa."nome" "nomeEmpresa", '
			 + 'empresa."tin", '
			 + 'empresa."fy_start_date" "fyStartDate", '
			 + 'empresa."fy_end_date" "fyEndDate", '
			 + 'empresa."fk_aliquota.id_aliquota" "fkTributoEmpresa", '
			 + 'relTaxPackagePeriodo."id_rel_tax_package_periodo" "idRelTaxPackagePeriodo", '
			 + 'relTaxPackagePeriodo."fk_tax_package.id_tax_package" "fkTaxPackage", '
			 + 'periodo."numero_ordem" "numeroOrdem", '
			 + 'relTaxPackagePeriodo."status_envio" "statusEnvio", '
			 + 'countRetificadora."numero_retificadora" "numeroRetificadora", '
			 + '( '
			 + 'case '
			 + 'when periodo."numero_ordem" = 6 '
			 + 'and requisicaoReabertura."id_requisicao_reabertura_tax_tackage" is not null '
			 + 'then 1 '
			 + 'else 0 '
			 + 'end '
			 + ') "indMostrarRetificadora" '
			 + 'from "VGT.EMPRESA" empresa '
			 + 'inner join "VGT.PAIS" pais '
			 + 'on empresa."fk_pais.id_pais" = pais."id_pais" '
			 + 'inner join "VGT.TAX_PACKAGE" taxPackage '
			 + 'on empresa."id_empresa" = taxPackage."fk_empresa.id_empresa" '
			 + 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" relTaxPackagePeriodo '
			 + 'on taxPackage."id_tax_package" = relTaxPackagePeriodo."fk_tax_package.id_tax_package" '
			 + 'inner join "VGT.PERIODO" periodo '
			 + 'on relTaxPackagePeriodo."fk_periodo.id_periodo" = periodo."id_periodo" '
			 + 'inner join "VGT.DOMINIO_ANO_CALENDARIO" dominioAnoCalendario '
			 + 'on periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = dominioAnoCalendario."id_dominio_ano_calendario" '
			 + 'left outer join ( '
			 + 'select '
			 + '"id_rel_tax_package_periodo", '
			 + '"fk_tax_package.id_tax_package", '
			 + 'row_number() over ( '
			 + 'partition by "fk_tax_package.id_tax_package" '
			 + 'order by "id_rel_tax_package_periodo" '
			 + ') "numero_retificadora" '
			 + 'from "VGT.REL_TAX_PACKAGE_PERIODO" '
			 + 'inner join "VGT.PERIODO" '
			 + 'on "fk_periodo.id_periodo" = "id_periodo" '
			 + 'where '
			 + '"numero_ordem" = 6 '
			 + ') countRetificadora '
			 + 'on relTaxPackagePeriodo."id_rel_tax_package_periodo" = countRetificadora."id_rel_tax_package_periodo" '
			 + 'left outer join ( '
			 + 'select '
			 + '"id_requisicao_reabertura_tax_tackage", '
			 + '"fk_id_rel_tax_package_periodo.id_rel_tax_package_periodo", '
			 + 'row_number() over ( '
			 + 'partition by "fk_id_rel_tax_package_periodo.id_rel_tax_package_periodo" '
			 + 'order by "id_requisicao_reabertura_tax_tackage" '
			 + ') as "rownumberReabertura" '
			 + 'from "VGT.REQUISICAO_REABERTURA_TAX_PACKAGE" '
			 + 'where '
			 + '"fk_dominio_requisicao_reabertura_status.id_dominio_requisicao_reabertura_status" = 2 '
			 + ') requisicaoReabertura '
			 + 'on requisicaoReabertura."fk_id_rel_tax_package_periodo.id_rel_tax_package_periodo" = relTaxPackagePeriodo."id_rel_tax_package_periodo" '
			 + 'and requisicaoReabertura."rownumberReabertura" = 1 ',
			 aParam = [];
		
		let queryBuildHelper = new QueryBuildHelper({
			initialStatement: sQuery
		});
		
		queryBuildHelper
			.where('dominioAnoCalendario."id_dominio_ano_calendario"')
				.in(req.query.filtroAnoCalendario)
			.and('empresa."fk_pais.id_pais"')
				.in(req.query.filtroPais)
			.and('pais."fk_dominio_pais_regiao.id_dominio_pais_regiao"')
				.in(req.query.filtroRegiao)
			.and('relTaxPackagePeriodo."status_envio"')
				.in(req.query.filtroStatus)
			.and('periodo."numero_ordem"')
				.in(req.query.filtroPeriodo);
			
		sQuery = queryBuildHelper.getStatement();
		aParam = queryBuildHelper.getParameters();	
			
		sQuery += 'order by "nomeEmpresa", "anoCalendario", "numeroOrdem", "idRelTaxPackagePeriodo" ';
		
		sQuery = 
			'select * '
			+ 'from ( '
			+ sQuery
			+ ') t '
			+ 'where '
			+ 't."numeroOrdem" <= 5 '
			+ 'or (t."numeroOrdem" = 6 and t."indMostrarRetificadora" = 1) ';
		
		db.executeStatement({
			statement: sQuery,
			parameters: aParam
		}, (err, result) => {
			if (err) {
				console.log(err);
				next(err);
			}
			else {
				res.status(200).json({
					result: result
				});
			}
		});
	}
};

function isNumber (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function jsDateObjectToSqlDateString (oDate) {
	return oDate.getFullYear() + "-" + (oDate.getMonth() + 1) + "-" + oDate.getDate();
}

/*function atualizarMoeda (sIdTaxPackage, sFkMoeda) {
	var sQuery = 'update "VGT.TAX_PACKAGE" set "fk_dominio_moeda.id_dominio_moeda" = ? where "id_tax_package" = ?',
		aParams = [sFkMoeda, sIdTaxPackage];
	
	var result = db.executeStatementSync(sQuery, aParams);
	
	return result === 1;
}*/

function atualizarMoeda (oPeriodo, idMoeda, req) {
	switch (oPeriodo.numero_ordem) {
		case 1:
		case 2:
		case 3:
		case 4:
			// Atualizar moeda dos vínculos de períodos 1 a 4
			var sQuery = 
				'update "VGT.REL_TAX_PACKAGE_PERIODO" '
				+ 'set "fk_dominio_moeda_rel.id_dominio_moeda" = ? '
				+ 'where '
				+ '"id_rel_tax_package_periodo" in ( '
					+ 'select "id_rel_tax_package_periodo" '
					+ 'from "VGT.REL_TAX_PACKAGE_PERIODO" rel '
					+ 'inner join "VGT.PERIODO" periodo '
					+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
					+ 'where '
					+ 'rel."fk_tax_package.id_tax_package" = ? '
					+ 'and periodo."numero_ordem" in (1,2,3,4) '
				+ ') ',
				aParam = [idMoeda, oPeriodo["fk_tax_package.id_tax_package"]];
				
			db.executeStatementSync(sQuery, aParam, { idUsuario: req });
			break;
		case 5:
		case 6:
			// Atualizar moeda dos vínculos de períodos 5 e o último 6 que esteja aberto
			var sQuery = 
				'update "VGT.REL_TAX_PACKAGE_PERIODO" '
				+ 'set "fk_dominio_moeda_rel.id_dominio_moeda" = ? '
				+ 'where '
				+ '"id_rel_tax_package_periodo" in ( '
					+ 'select "id_rel_tax_package_periodo" '
					+ 'from "VGT.REL_TAX_PACKAGE_PERIODO" rel  '
					+ 'inner join "VGT.PERIODO" periodo  '
					+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo"  '
					+ 'where  '
					+ 'rel."fk_tax_package.id_tax_package" = ? '
					+ 'and ( '
						+ 'periodo."numero_ordem" = 5  '
						+ 'or "id_rel_tax_package_periodo" = ( '
							+ 'select MAX("id_rel_tax_package_periodo") '
							+ 'from "VGT.REL_TAX_PACKAGE_PERIODO" '
							+ 'inner join "VGT.PERIODO" periodo  '
							+ 'on "fk_periodo.id_periodo" = "id_periodo"  '
							+ 'where '
								+ '"fk_tax_package.id_tax_package" = ? '
								+ 'and "numero_ordem" = 6 '
								+ 'and "ind_ativo" = true '
						+ ') '
					+ ') '
				+ ')', 
				aParam = [idMoeda, oPeriodo["fk_tax_package.id_tax_package"], oPeriodo["fk_tax_package.id_tax_package"]];
				
			db.executeStatementSync(sQuery, aParam, { idUsuario: req });
			break;
	}
}

function atualizarStatus (sIdRelTaxPackagePeriodo, req) {
	var sQuery = 'update "VGT.REL_TAX_PACKAGE_PERIODO" set "status_envio" = ? where "id_rel_tax_package_periodo" = ?',
		aParam = [3, sIdRelTaxPackagePeriodo]; // em andamento
	
	var result = db.executeStatementSync(sQuery, aParam, { idUsuario: req });
	
	return result === 1;
}

function inserirTaxReconciliation (sFkRelTaxPackagePeriodo, oTaxReconciliation, sIncomeTaxDetails, req) {
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
				+ '"rf_taxable_income_deductions" = ?, '		
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
			oTaxReconciliation.rf_taxable_income_deductions ,				
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
		
		db.executeStatementSync(sQuery, aParams, { idUsuario: req });
		
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
				+ '"rf_taxable_income_deductions", '					
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
				+ '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
				
		aParams = [
			oTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax ,
			oTaxReconciliation.rc_current_income_tax_current_year ,
			oTaxReconciliation.rc_current_income_tax_previous_year ,
			oTaxReconciliation.rc_deferred_income_tax ,
			oTaxReconciliation.rc_non_recoverable_wht ,
			oTaxReconciliation.rc_statutory_provision_for_income_tax ,
			oTaxReconciliation.rc_statutory_gaap_profit_loss_after_tax ,
			oTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits ,
			oTaxReconciliation.rf_taxable_income_deductions ,		
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
					
					
		result = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
		
		if (result === 1) {
			sQuery = 'select MAX("id_tax_reconciliation") "generated_id" from "VGT.TAX_RECONCILIATION"';
			
			result = db.executeStatementSync(sQuery, [], { idUsuario: req });
			
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
		case iNumeroOrdemPeriodo === 6:
			return "valor6";
	}
}

function inserirDiferenca (sFkTaxReconciliation, aDiferenca, sChaveValorDiferenca, req) {
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
			
			var result = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
			
			// Caso o relacionamento com o tax reconciliation corrente ja existe, atualiza ele
			if (result && result.length > 0) {
				sQuery = 'update "VGT.REL_TAX_RECONCILIATION_DIFERENCA" set "valor" = ? where "fk_tax_reconciliation.id_tax_reconciliation" = ? and "fk_diferenca.id_diferenca" = ?';
				aParams = [oDiferenca[sChaveValorDiferenca], sFkTaxReconciliation, oDiferenca.id_diferenca];
				db.executeStatementSync(sQuery, aParams, { idUsuario: req });
			}
			// Se nao, insere o relacionamento
			else {
				sQuery = 'insert into "VGT.REL_TAX_RECONCILIATION_DIFERENCA"("fk_tax_reconciliation.id_tax_reconciliation", "fk_diferenca.id_diferenca", "valor") values(?, ?, ?)';
				aParams = [sFkTaxReconciliation, oDiferenca.id_diferenca, oDiferenca[sChaveValorDiferenca]];
				db.executeStatementSync(sQuery, aParams, { idUsuario: req });
			}
			
			// Atualiza outro e fk_tipo
			sQuery = 'update "VGT.DIFERENCA" set "outro" = ?, "fk_diferenca_opcao.id_diferenca_opcao" = ? where "id_diferenca" = ?';
			aParams = [oDiferenca.outro, oDiferenca["fk_diferenca_opcao.id_diferenca_opcao"] ? oDiferenca["fk_diferenca_opcao.id_diferenca_opcao"] : null, oDiferenca.id_diferenca];
			
			db.executeStatementSync(sQuery, aParams, { idUsuario: req });
		}
		else {
			// cria a diferenca e o relacioanemtno
			sQuery = 'insert into "VGT.DIFERENCA"("id_diferenca", "outro", "fk_diferenca_opcao.id_diferenca_opcao") values ("identity_VGT.DIFERENCA_id_diferenca".nextval, ?, ?)';
			aParams = [oDiferenca.outro, oDiferenca["fk_diferenca_opcao.id_diferenca_opcao"] ? oDiferenca["fk_diferenca_opcao.id_diferenca_opcao"] : null];
			
			db.executeStatementSync(sQuery, aParams, { idUsuario: req });
			
			sQuery = 'select MAX("id_diferenca") "id_diferenca_criada" from "VGT.DIFERENCA"';
			
			var result = db.executeStatementSync(sQuery, [], { idUsuario: req });
			
			sQuery = 'insert into "VGT.REL_TAX_RECONCILIATION_DIFERENCA"("fk_tax_reconciliation.id_tax_reconciliation", "fk_diferenca.id_diferenca", "valor") values(?, ?, ?)';
				
			aParams = [sFkTaxReconciliation, result[0].id_diferenca_criada, oDiferenca[sChaveValorDiferenca]];
			
			db.executeStatementSync(sQuery, aParams, { idUsuario: req });
		}
	}
}

function excluirDiferenca(aDiferencaExcluida, req) {
	for (var i = 0, length = aDiferencaExcluida.length; i < length; i++) {
		var idDiferencaExcluida = aDiferencaExcluida[i];
		
		db.executeStatementSync(
			'delete from "VGT.REL_TAX_RECONCILIATION_DIFERENCA" where "fk_diferenca.id_diferenca" = ?', [idDiferencaExcluida], { idUsuario: req });
		db.executeStatementSync(
			'delete from "VGT.DIFERENCA" where "id_diferenca" = ?', [idDiferencaExcluida], { idUsuario: req });
	}
}

function inserirRespostaItemToReport (sFkRelTaxPackagePeriodo, aRespostaItemToReport, req) {
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
			
			db.executeStatementSync(sQuery, aParams, { idUsuario: req });
			
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
			
			result = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
			
			if (result === 1) {
				sQuery = 'select MAX("id_resposta_item_to_report") "generated_id" from "VGT.RESPOSTA_ITEM_TO_REPORT"';
				
				result = db.executeStatementSync(sQuery, [], { idUsuario: req });
				
				sIdRespostaItemToReport = result[0].generated_id;
			}	
		}
		
		inserirAnoFiscalRespostaItemToReport(sIdRespostaItemToReport, oRespostaItemToReport.relAnoFiscal ? oRespostaItemToReport.relAnoFiscal : [], req);
	}
}

function inserirAnoFiscalRespostaItemToReport (sFkRespostaItemToReport, aAnoFiscal, req) {
	var sQuery, aParams, result;
	
	sQuery = 'select * from "VGT.REL_RESPOSTA_ITEM_TO_REPORT_ANO_FISCAL" where "fk_resposta_item_to_report.id_resposta_item_to_report" = ? ';
	aParams = [sFkRespostaItemToReport];
	
	result = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
	
	for (var i = 0, length = aAnoFiscal.length; i < length; i++) {
		var sIdAnoFiscalEnviado = aAnoFiscal[i];
		
		var oRel = result.find(function (obj) {
			return Number(obj["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]) === Number(sIdAnoFiscalEnviado);
		});
		
		if (!oRel) {
			sQuery = 'insert into "VGT.REL_RESPOSTA_ITEM_TO_REPORT_ANO_FISCAL"("fk_resposta_item_to_report.id_resposta_item_to_report", "fk_dominio_ano_fiscal.id_dominio_ano_fiscal") values (?, ?)';
			aParams = [sFkRespostaItemToReport, sIdAnoFiscalEnviado];
			
			db.executeStatementSync(sQuery, aParams, { idUsuario: req });
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
			
			db.executeStatementSync(sQuery, aParams, { idUsuario: req });
		}
	}
}

function inserirSchedule(aSchedule, req) {
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
			
			db.executeStatementSync(sQuery, aParams, { idUsuario: req });
		}
	}
}

function inserirScheduleValueUtilized(sFkTaxReconciliation, aTotalLossesUtilized, aOverpaymentFromPriorYearApplierToCurrentYear, req) {
	var aValuesUtilized = aTotalLossesUtilized.concat(aOverpaymentFromPriorYearApplierToCurrentYear);
	
	var sQuery, aParams;
	
	sQuery = 'select * from "VGT.SCHEDULE_VALUE_UTILIZED" where "fk_tax_reconciliation.id_tax_reconciliation" = ? ';
	aParams = [sFkTaxReconciliation];
	
	var result = db.executeStatementSync(sQuery, aParams, { idUsuario: req }),
		aValuesUtilizedPersistido = [];
	
	if (result && result.length > 0) {
		aValuesUtilizedPersistido = result;
	}
	
	for (var i = 0, length = aValuesUtilizedPersistido.length; i < length; i++) {
		var oValueUtilizedPersistido = aValuesUtilizedPersistido[i];
		
		var oValueUtilizedEnviado = aValuesUtilized.find(function (obj) {
			return oValueUtilizedPersistido.id_schedule_value_utilized === obj.id_schedule_value_utilized;
		});
		
		if (!oValueUtilizedEnviado) {
			sQuery = 'delete from "VGT.SCHEDULE_VALUE_UTILIZED" where "id_schedule_value_utilized" = ?';
			aParams = [oValueUtilizedPersistido.id_schedule_value_utilized];
			
			db.executeStatementSync(sQuery, aParams, { idUsuario: req });
		}
	}
	
	for (var i = 0, length = aValuesUtilized.length; i < length; i++) {
		var oValueUtilized = aValuesUtilized[i];
		
		if (oValueUtilized.id_schedule_value_utilized) {
			// update
			sQuery = 
				'update "VGT.SCHEDULE_VALUE_UTILIZED" set '
				+ '"schedule_fy" = ?, '
				+ '"valor" = ?, '
				+ '"obs" = ?, '
				+ '"fk_dominio_schedule_value_utilized_tipo.id_dominio_schedule_value_utilized_tipo" = ?, '
				+ '"fk_tax_reconciliation.id_tax_reconciliation" = ? '
				+ 'where '
				+ '"id_schedule_value_utilized" = ? ';
			aParams = [oValueUtilized.schedule_fy, oValueUtilized.valor, oValueUtilized.obs, oValueUtilized["fk_dominio_schedule_value_utilized_tipo.id_dominio_schedule_value_utilized_tipo"], sFkTaxReconciliation, oValueUtilized.id_schedule_value_utilized];
		}
		else {
			// insert
			sQuery = 
				'insert into "VGT.SCHEDULE_VALUE_UTILIZED"( '
				+ '"id_schedule_value_utilized", '
				+ '"schedule_fy", '
				+ '"valor", '
				+ '"obs", '
				+ '"fk_dominio_schedule_value_utilized_tipo.id_dominio_schedule_value_utilized_tipo", '
				+ '"fk_tax_reconciliation.id_tax_reconciliation") values ('
				+ '"identity_VGT.SCHEDULE_VALUE_UTILIZED_id_schedule_value_utilized".nextval, ?, ?, ?, ?, ?)';
			aParams = [oValueUtilized.schedule_fy, oValueUtilized.valor, oValueUtilized.obs, oValueUtilized["fk_dominio_schedule_value_utilized_tipo.id_dominio_schedule_value_utilized_tipo"], sFkTaxReconciliation];
		}
		
		db.executeStatementSync(sQuery, aParams, { idUsuario: req });
	}
}

function inserirTaxasMultiplas (sFkTaxReconciliation, aOtherTax, aIncentivoFiscal, aWHT, aOutrasAntecipacoes, req) {
	var aTaxaMultipla = aOtherTax.concat(aIncentivoFiscal);
	aTaxaMultipla = aTaxaMultipla.concat(aWHT);
	aTaxaMultipla = aTaxaMultipla.concat(aOutrasAntecipacoes);
	
	var sQuery, aParams;
	
	sQuery = 'select * from "VGT.TAXA_MULTIPLA" where "fk_tax_reconciliation.id_tax_reconciliation" = ? ';
	aParams = [sFkTaxReconciliation];
	
	var result = db.executeStatementSync(sQuery, aParams, { idUsuario: req }),
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
			
			db.executeStatementSync(sQuery, aParams, { idUsuario: req });
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
		
		db.executeStatementSync(sQuery, aParams, { idUsuario: req });
	}
}

function inserirAntecipacoes (sFkTaxReconciliation, aAntecipacao, req) {
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
			
			var res = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
			
			if (res) {
				var resGeneratedId = db.executeStatementSync('select MAX("id_antecipacao") "generated_id" from "VGT.ANTECIPACAO"', [], { idUsuario: req });
				
				oAntecipacao.id_antecipacao = resGeneratedId[0].generated_id;
			}
		}
	}
	
	sQuery = 'select * from "VGT.ANTECIPACAO" where "fk_tax_reconciliation.id_tax_reconciliation" = ?';
	aParams = [sFkTaxReconciliation];
	
	var result = db.executeStatementSync(sQuery, aParams, { idUsuario: req });
	
	if (result) {
		for (var i = 0, length = result.length; i < length; i++) {
			var oAntecipacaoPersistida = result[i];
			
			var oAntecipacaoEnviada = aAntecipacao.find(function (obj) {
				return obj.id_antecipacao === oAntecipacaoPersistida.id_antecipacao;
			});
			
			// 10/04/19 @pedsf - A segunda condição foi adicionado para casos onde o objeto relacionado ao persistido nem chegou ao backend.
			// Isso ocorre quando o pagamento originario foi excluido ou ele foi desflagado no admin como exportado para o TaxP.
			if ((oAntecipacaoEnviada && !oAntecipacaoEnviada.selecionado) || !oAntecipacaoEnviada) {
				sQuery = 'delete from "VGT.ANTECIPACAO" where "id_antecipacao" = ?';
				aParams = [oAntecipacaoPersistida.id_antecipacao];
				
				db.executeStatementSync(sQuery, aParams, { idUsuario: req });
			}
		}
	}
}