'use strict';

const db = require('../db');
const modelTaxReconciliation = require('./modelTaxReconciliation');
const modelRespostaItemToReport = require('./modelRespostaItemToReport');

let oModel = db.model('VGT.REL_TAX_PACKAGE_PERIODO', {
	colunas: {
		id: {
			nome: 'id_rel_tax_package_periodo',
			identity: true
		},
		fkTaxPackage: {
			nome: 'fk_tax_package.id_tax_package',
			number: true
		}, 
		fkPeriodo: {
			nome: 'fk_periodo.id_periodo',
			number: true
		},
		indAtivo: {
			nome: 'ind_ativo'
		},
		statusEnvio: {
			nome: 'status_envio'
		},
		dataEnvio: {
			nome: 'data_envio'
		}
	} 	
});

oModel.exists = (idRelTaxPackagePeriodo) => {
	return new Promise((resolve, reject) => {
		oModel.listar([{
			coluna: oModel.colunas.id,
			valor: idRelTaxPackagePeriodo
		}], (err, result) => {
			if (err) {
				reject(err);
			}
			else {
				if (result && result.length) {
					resolve();
				}
				else {
					reject(new Error('O registro requisitado não existe'));
				}
			}
		});
	});
};

oModel.copiarDadosPeriodoAnterior = (idRelTaxPackagePeriodo) => {
	return new Promise((resolve, reject) => {
		oModel.exists(idRelTaxPackagePeriodo)
			.then(() => {
				return oModel.getIdRelTaxPackagePeriodoAnterior(idRelTaxPackagePeriodo);
			})
			.then((idRelTaxPackagePeriodoAnterior) => {
				if (idRelTaxPackagePeriodoAnterior) {
					return oModel.copiarDados(idRelTaxPackagePeriodoAnterior, idRelTaxPackagePeriodo);	
				}
				else {
					reject(new Error('Não existe período anterior para realizar a cópia.'));
				}
			})
			.then(() => {
				resolve();
			})
			.catch((err) => {
				reject(new Error('Erro inesperado ao copiar dados.\n' + err.message));
			});	
	});
};

oModel.limparDados = (idRelTaxPackagePeriodoDestino) => {
	return new Promise((resolve, reject) => {
		
		let connection = db.getConnection();
			connection.setAutoCommit(false);
			
		const execute = (statement, parameters) => {
			return new Promise((resolve, reject) => {
				db.executeStatement({
					statement: statement,
					parameters: parameters
				}, (err, result) => {
					if (err) {
						reject(err);
					}	
					else {
						resolve();
					}
				}, {
					connection: connection
				});
			});
		};
	
		let sComandoLimparMoeda = 
			'update "VGT.REL_TAX_PACKAGE_PERIODO" set '
			 + '"fk_dominio_moeda_rel.id_dominio_moeda" = NULL '
			 + 'where '
			 + '"id_rel_tax_package_periodo" = ? ';
			
		let sComandoLimparDiferenca =
			'delete from "VGT.REL_TAX_RECONCILIATION_DIFERENCA" '
			 + 'where '
			 + '"fk_tax_reconciliation.id_tax_reconciliation" in ( '
			 + 'select "id_tax_reconciliation" '
			 + 'from "VGT.TAX_RECONCILIATION" '
			 + 'where '
			 + '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ? '
			 + '); ';
	
		let sComandoLimparTaxReconciliation =
			'delete from "VGT.TAX_RECONCILIATION" where "fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ? ';
			
		let sComandoLimparSchedule = 
			'delete from "VGT.SCHEDULE" where "fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ?';
			
		let sComandoLimparScheduleValueUtilized =
			'delete from "VGT.SCHEDULE_VALUE_UTILIZED" '
			 + 'where '
			 + '"id_schedule_value_utilized" in ( '
			 + 'select "id_schedule_value_utilized" '
			 + 'from "VGT.SCHEDULE_VALUE_UTILIZED" '
			 + 'inner join "VGT.TAX_RECONCILIATION" '
			 + 'on "fk_tax_reconciliation.id_tax_reconciliation" = "id_tax_reconciliation" '
			 + 'where '
			 + '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ?) ';
		
		let sComandoLimparAntecipacao = 
			'delete from "VGT.ANTECIPACAO" '
			 + 'where '
			 + '"id_antecipacao" in ( '
			 + 'select "id_antecipacao" '
			 + 'from "VGT.ANTECIPACAO" '
			 + 'inner join "VGT.TAX_RECONCILIATION" '
			 + 'on "fk_tax_reconciliation.id_tax_reconciliation" = "id_tax_reconciliation" '
			 + 'where '
			 + '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ? '
			 + '); ';
			 
		let sComandoLimparTaxaMultipla = 
			'delete from "VGT.TAXA_MULTIPLA" '
			 + 'where '
			 + '"id_taxa_multipla" in ( '
			 + 'select "id_taxa_multipla" '
			 + 'from "VGT.TAXA_MULTIPLA" '
			 + 'inner join "VGT.TAX_RECONCILIATION" '
			 + 'on "fk_tax_reconciliation.id_tax_reconciliation" = "id_tax_reconciliation" '
			 + 'where '
			 + '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ? '
			 + '); '

		let sComandoLimparRelRespostaItemToReportAnoFiscal =
			'delete from "VGT.REL_RESPOSTA_ITEM_TO_REPORT_ANO_FISCAL" '
			 + 'where '
			 + '"fk_resposta_item_to_report.id_resposta_item_to_report" in ( '
			 + 'select "id_resposta_item_to_report" '
			 + 'from "VGT.RESPOSTA_ITEM_TO_REPORT" '
			 + 'where '
			 + '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ? '
			 + ') ';
	
		let ComandoLimparRespostaItemToReport = 
			'delete from "VGT.RESPOSTA_ITEM_TO_REPORT" where "fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ?';
			
		let aParam = [idRelTaxPackagePeriodoDestino];
		
		execute(sComandoLimparMoeda, aParam)
			.then(res =>  execute(sComandoLimparDiferenca, aParam))
			.then(res =>  execute(sComandoLimparTaxReconciliation, aParam))
			.then(res =>  execute(sComandoLimparSchedule, aParam))
			.then(res =>  execute(sComandoLimparScheduleValueUtilized, aParam))
			.then(res =>  execute(sComandoLimparAntecipacao, aParam))
			.then(res =>  execute(sComandoLimparTaxaMultipla, aParam))
			.then(res =>  execute(sComandoLimparRelRespostaItemToReportAnoFiscal, aParam))
			.then(res =>  execute(ComandoLimparRespostaItemToReport, aParam))
			.then(() => {
				connection.commit();
				connection.close();
				resolve();
			})
			.catch((err) => {
				connection.rollback();
				connection.close();
				reject(err);	
			});	
	});
};

oModel.copiarDados = (idRelTaxPackagePeriodoOrigem, idRelTaxPackagePeriodoDestino) => {
	return new Promise((resolve, reject) => {
		console.log(`Copiar dados de ${idRelTaxPackagePeriodoOrigem} para ${idRelTaxPackagePeriodoDestino}`);
	
		let connection = db.getConnection();
		connection.setAutoCommit(false);
		
		const canCopy = () => {
			return new Promise((resolve, reject) => {
				db.executeStatement({
					statement: 
						'select * '
						+ 'from "VGT.TAX_RECONCILIATION" '
						+ 'where '
						+ '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ? ',
					parameters: [idRelTaxPackagePeriodoDestino]
				}, (err, result) => {
					if (err) {
						console.log(err);
						reject(err);
					}
					else {
						// Se existe tax reconciliation para o vínculo informado não permite a cópia
						resolve(!(result && result.length));	
					}
				});
			});
		};
		
		const copiarTaxReconciliation = (idTaxReconciliation) => {
			let sComando = 
				'insert into "VGT.TAX_RECONCILIATION" '
				+ '( '
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
					+ '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo" '
				+ ') '
				+ 'select  '
					//"identity_VGT.TAX_RECONCILIATION_id_tax_reconciliation".nextval, // gerar ID e passar direto já que ele será usado como FK em diversas tabelas. Essa solução com identity direto é util para as outras tabelas
					+ '?, '
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
					+ '?  '
				+ 'from "VGT.TAX_RECONCILIATION" '
				+ 'where  '
				+ '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ?'; 
				
			return new Promise((resolve, reject) => {
				db.executeStatement({
					statement: sComando,
					parameters: [idTaxReconciliation, idRelTaxPackagePeriodoDestino, idRelTaxPackagePeriodoOrigem]
				}, (err, result) => {
					if (err) {
						reject(err);
					}	
					else {
						resolve();
					}
				}, {
					connection: connection
				});
			});
		};
		
		const copiarSchedule = () => {
			let sComando = 
				'insert into "VGT.SCHEDULE" ( '
					+ '"id_schedule", '
					+ '"fy", '
					+ '"year_of_expiration", '
					+ '"opening_balance", '
					+ '"current_year_value", '
					+ '"current_year_value_utilized", '
					+ '"adjustments", '
					+ '"justificativa", '
					+ '"current_year_value_expired", '
					+ '"closing_balance", '
					+ '"obs", '
					+ '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo", '
					+ '"fk_dominio_schedule_tipo.id_dominio_schedule_tipo", '
					+ '"fk_dominio_ano_fiscal.id_dominio_ano_fiscal" '
				+ ') '
				+ 'select  '
					+ '"identity_VGT.SCHEDULE_id_schedule".nextval, '
					+ '"fy", '
					+ '"year_of_expiration", '
					+ '"opening_balance", '
					+ '"current_year_value", '
					+ '"current_year_value_utilized", '
					+ '"adjustments", '
					+ '"justificativa", '
					+ '"current_year_value_expired", '
					+ '"closing_balance", '
					+ '"obs", '
					+ '?, '
					+ '"fk_dominio_schedule_tipo.id_dominio_schedule_tipo", '
					+ '"fk_dominio_ano_fiscal.id_dominio_ano_fiscal" '
				+ 'from "VGT.SCHEDULE" '
				+ 'where '
					+ '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ? ';
					
			return new Promise((resolve, reject) => {
				db.executeStatement({
					statement: sComando,
					parameters: [idRelTaxPackagePeriodoDestino, idRelTaxPackagePeriodoOrigem]
				}, (err, result) => {
					if (err) {
						reject(err);
					}	
					else {
						resolve();
					}
				}, {
					connection: connection
				});
			});
		};
		
		const copiarScheduleValueUtilized = (idTaxReconciliation) => {
			let sComando =
				'insert into "VGT.SCHEDULE_VALUE_UTILIZED" ( '
				 + '"id_schedule_value_utilized", '
				 + '"schedule_fy", '
				 + '"valor", '
				 + '"obs", '
				 + '"fk_dominio_schedule_value_utilized_tipo.id_dominio_schedule_value_utilized_tipo", '
				 + '"fk_tax_reconciliation.id_tax_reconciliation" '
				 + ') '
				 + 'select '
				 + '"identity_VGT.SCHEDULE_VALUE_UTILIZED_id_schedule_value_utilized".nextval, '
				 + '"schedule_fy", '
				 + '"valor", '
				 + '"obs", '
				 + '"fk_dominio_schedule_value_utilized_tipo.id_dominio_schedule_value_utilized_tipo", '
				 + '? '
				 + 'from "VGT.SCHEDULE_VALUE_UTILIZED" valueUtilized '
				 + 'inner join "VGT.TAX_RECONCILIATION" taxRecon '
				 + 'on valueUtilized."fk_tax_reconciliation.id_tax_reconciliation" = taxRecon."id_tax_reconciliation" '
				 + 'where '
				 + 'taxRecon."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ? '
			
			return new Promise((resolve, reject) => {
				db.executeStatement({
					statement: sComando,
					parameters: [idTaxReconciliation, idRelTaxPackagePeriodoOrigem]
				}, (err, result) => {
					if (err) {
						reject(err);
					}	
					else {
						resolve();
					}
				}, {
					connection: connection
				});
			});
		};
		
		const copiarTaxaMultipla = (idTaxReconciliation) => {
			var sComando =
				'insert into "VGT.TAXA_MULTIPLA" ( '
				 + '"id_taxa_multipla", '
				 + '"descricao", '
				 + '"valor", '
				 + '"fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla", '
				 + '"fk_tax_reconciliation.id_tax_reconciliation" '
				 + ') '
				 + 'select '
				 + '"identity_VGT.TAXA_MULTIPLA_id_taxa_multipla".nextval, '
				 + '"descricao", '
				 + '"valor", '
				 + '"fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla", '
				 + '? '
				 + 'from "VGT.TAXA_MULTIPLA" taxaMultipla '
				 + 'inner join "VGT.TAX_RECONCILIATION" taxRecon '
				 + 'on taxaMultipla."fk_tax_reconciliation.id_tax_reconciliation" = taxRecon."id_tax_reconciliation" '
				 + 'where '
				 + 'taxRecon."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ? '
			
			return new Promise((resolve, reject) => {
				db.executeStatement({
					statement: sComando,
					parameters: [idTaxReconciliation, idRelTaxPackagePeriodoOrigem]
				}, (err, result) => {
					if (err) {
						reject(err);
					}	
					else {
						resolve();
					}
				}, {
					connection: connection
				});
			});
		};
		
		const copiarAntecipacao = (idTaxReconciliation) => {
			var sComando = 
				'insert into "VGT.ANTECIPACAO"( '
				 + '"id_antecipacao", '
				 + '"valor", '
				 + '"descricao", '
				 + '"fk_tax_reconciliation.id_tax_reconciliation", '
				 + '"fk_pagamento.id_pagamento" '
				 + ') '
				 + 'select '
				 + '"identity_VGT.ANTECIPACAO_id_antecipacao".nextval, '
				 + '"valor", '
				 + '"descricao", '
				 + '?, '
				 + '"fk_pagamento.id_pagamento" '
				 + 'from "VGT.ANTECIPACAO" '
				 + 'inner join "VGT.TAX_RECONCILIATION" '
				 + 'on "fk_tax_reconciliation.id_tax_reconciliation" = "id_tax_reconciliation" '
				 + 'where '
				 + '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ?';

			return new Promise((resolve, reject) => {
				db.executeStatement({
					statement: sComando,
					parameters: [idTaxReconciliation, idRelTaxPackagePeriodoOrigem]
				}, (err, result) => {
					if (err) {
						reject(err);
					}	
					else {
						resolve();
					}
				}, {
					connection: connection
				});
			});
		};
		
		const copiarRelTaxReconciliationDiferenca = (idTaxReconciliation) => {
			var sComando = 
				'insert into "VGT.REL_TAX_RECONCILIATION_DIFERENCA"( '
				 + '"fk_tax_reconciliation.id_tax_reconciliation", '
				 + '"fk_diferenca.id_diferenca", '
				 + '"valor" '
				 + ') '
				 + 'select '
				 + '?, '
				 + '"fk_diferenca.id_diferenca", '
				 + '"valor" '
				 + 'from "VGT.REL_TAX_RECONCILIATION_DIFERENCA" '
				 + 'inner join "VGT.TAX_RECONCILIATION" '
				 + 'on "fk_tax_reconciliation.id_tax_reconciliation" = "id_tax_reconciliation" '
				 + 'where '
				 + '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ? ';

			return new Promise((resolve, reject) => {
				db.executeStatement({
					statement: sComando,
					parameters: [idTaxReconciliation, idRelTaxPackagePeriodoOrigem]
				}, (err, result) => {
					if (err) {
						reject(err);
					}	
					else {
						resolve();
					}
				}, {
					connection: connection
				});
			});
		};
		
		const copiarRespostaItemToReport = () => {
			return new Promise((resolve, reject) => {
				let sComando = 
					'select * '
					 + 'from "VGT.RESPOSTA_ITEM_TO_REPORT" '
					 + 'left outer join "VGT.REL_RESPOSTA_ITEM_TO_REPORT_ANO_FISCAL" '
					 + 'on "id_resposta_item_to_report" = "fk_resposta_item_to_report.id_resposta_item_to_report" '
					 + 'where '
					 + '"fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ? '
					 + 'order by 1 '
	
				db.executeStatement({
					statement: sComando,
					parameters: [idRelTaxPackagePeriodoOrigem]
				}, (err, result) => {
					if (err) {
						reject(new Error(err.message));
					}	
					else {
						let respostas = {};
						
						for (let i = 0, length = result.length; i < length; i++) {
							var oEntry = result[i];
							
							if (respostas[oEntry.id_resposta_item_to_report]) {
								if (oEntry["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]) {
									respostas[oEntry.id_resposta_item_to_report].anoFiscal.push(oEntry["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]);
								}
							}
							else {
								respostas[oEntry.id_resposta_item_to_report] = {
									fkRelTaxPackagePeriodo: idRelTaxPackagePeriodoDestino,
									fkItemToReport: oEntry["fk_item_to_report.id_item_to_report"],
									indSeAplica: oEntry.ind_se_aplica,
									resposta: oEntry.resposta,
									anoFiscal: []	
								};
								
								if (oEntry["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]) {
									respostas[oEntry.id_resposta_item_to_report].anoFiscal.push(oEntry["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]);
								}
							}
						}
						
						let aPromiseInsertRepostaItemToReport = [];
						
						for (let i = 0, length = Object.keys(respostas).length; i < length; i++) {
							let idRespostaItemToReport = Object.keys(respostas)[i];
							
							aPromiseInsertRepostaItemToReport.push(new Promise((resolve2, reject2) => {
								modelRespostaItemToReport.inserir([{
									coluna: modelRespostaItemToReport.colunas.id
								}, {
									coluna: modelRespostaItemToReport.colunas.indSeAplica,
									valor: respostas[idRespostaItemToReport].indSeAplica
								}, {
									coluna: modelRespostaItemToReport.colunas.resposta,
									valor: respostas[idRespostaItemToReport].resposta
								}, {
									coluna: modelRespostaItemToReport.colunas.fkRelTaxPackagePeriodo,
									valor: respostas[idRespostaItemToReport].fkRelTaxPackagePeriodo
								}, {
									coluna: modelRespostaItemToReport.colunas.fkItemToReport,
									valor: respostas[idRespostaItemToReport].fkItemToReport
								}, {
									isConnection: true,
									connection: connection
								}], (err2, result2) => {
									if (err2) {
										reject2(new Error(err2.message));
									}
									else {
										if (result2 && result2.length) {
											resolve2({
												generatedId: result2[0].generated_id,
												anoFiscal: respostas[idRespostaItemToReport].anoFiscal
											});
										}
										else {
											reject2(new Error('Erro desconhecido ao copiar respostas do item to report'));
										}
									}
								})	
							}).catch(err3 => err3));
						}
						
						Promise.all(aPromiseInsertRepostaItemToReport)
							.then((res) => {
								let aError = res.filter(obj => obj instanceof Error);
								
								if (aError && aError.length) {
									reject(aError[0]);
								}
								else {
									let aPromiseInsertRelAnoFiscal = [];
									
									for (let i = 0, length = res.length; i < length; i++) {
										var oResult = res[i];
										
										for (let j = 0, length2 = oResult.anoFiscal.length; j < length2; j++) {
											aPromiseInsertRelAnoFiscal.push(new Promise((resolve3, reject3) => {
												db.executeStatement({
													statement: 
														'insert into "VGT.REL_RESPOSTA_ITEM_TO_REPORT_ANO_FISCAL" ( '
														 + '"fk_resposta_item_to_report.id_resposta_item_to_report", '
														 + '"fk_dominio_ano_fiscal.id_dominio_ano_fiscal" '
														 + ') '
														 + 'values (?, ?) ',
													parameters: [oResult.generatedId, oResult.anoFiscal[j]]
												}, (err5, result3) => {
													if (err5) {
														reject3(new Error(err5.message));
													}
													else {
														resolve3(result3);
													}
												}, {
													connection: connection
												});
											}).catch(err6 => err6));
										}
									}
									
									Promise.all(aPromiseInsertRelAnoFiscal)
										.then((res2) => {
											let aError2 = res2.filter(obj => obj instanceof Error);
								
											if (aError2 && aError2.length) {
												reject(aError2[0]);
											}
											else {
												resolve();
											}
										})
										.catch((err7) => {
											reject(err7);
										});
								}
							})
							.catch((err4) => {
								reject(err4);
							});
					}
				}, {
					connection: connection
				});
			});
		};
		
		const copiarMoeda = () => {
			var sComando = 
				'update "VGT.REL_TAX_PACKAGE_PERIODO" set '
				 + '"fk_dominio_moeda_rel.id_dominio_moeda" = ( '
				 + 'select "fk_dominio_moeda_rel.id_dominio_moeda" '
				 + 'from  "VGT.REL_TAX_PACKAGE_PERIODO" '
				 + 'where '
				 + '"id_rel_tax_package_periodo" = ? '
				 + ') '
				 + 'where '
				 + '"id_rel_tax_package_periodo" = ? ';

			return new Promise((resolve, reject) => {
				db.executeStatement({
					statement: sComando,
					parameters: [idRelTaxPackagePeriodoOrigem, idRelTaxPackagePeriodoDestino]
				}, (err, result) => {
					if (err) {
						reject(err);
					}	
					else {
						resolve();
					}
				}, {
					connection: connection
				});
			});
		};
		
		let idTaxReconciliation;
		
		Promise.all([
				oModel.exists(idRelTaxPackagePeriodoOrigem),
				oModel.exists(idRelTaxPackagePeriodoDestino)
			])
			.then(() => {
				return canCopy();
			})
			.then((bCanCopy) => {
				if (bCanCopy) {
					return modelTaxReconciliation.gerarId();
				}
				else {
					reject(new Error('Não é possível copiar informações para período que já possui dados declarados.'));
				}
			})
			.then((generatedId) => {
				idTaxReconciliation = generatedId;
				return copiarTaxReconciliation(generatedId);
			})
			.then(() => {
				return copiarSchedule();
			})
			.then(() => {
				return copiarScheduleValueUtilized(idTaxReconciliation);
			})
			.then(() => {
				return copiarTaxaMultipla(idTaxReconciliation);
			})
			.then(() => {
				return copiarAntecipacao(idTaxReconciliation);
			})
			.then(() => {
				return copiarRelTaxReconciliationDiferenca(idTaxReconciliation);
			})
			.then(() => {
				return copiarRespostaItemToReport();
			})
			.then(() => {
				return copiarMoeda();
			})
			.then(() => {
				connection.commit();
				connection.close();
				resolve();
			})
			.catch((err) => {
				connection.rollback();
				connection.close();
				reject(err);	
			});	
	});
};

oModel.getIdRelTaxPackagePeriodoAnterior = (idRelTaxPackagePeriodo) => {
	return new Promise((resolve, reject) => {
		oModel.exists(idRelTaxPackagePeriodo)
			.then(() => {
				db.executeStatement({
					statement: 
						'select t."id_rel_tax_package_periodo" ' 
						+ 'from ( ' 
							+ 'select  ' 
								+ 'row_number() over (order by rel."id_rel_tax_package_periodo" desc) as "row_number",  ' 
								+ 'rel.* ' 
							+ 'from "VGT.REL_TAX_PACKAGE_PERIODO" rel ' 
								+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel_filtro ' 
									+ 'on rel."fk_tax_package.id_tax_package" = rel_filtro."fk_tax_package.id_tax_package" ' 
							+ 'where ' 
								+ 'rel_filtro."id_rel_tax_package_periodo" = ? ' 
								+ 'and rel."id_rel_tax_package_periodo" < rel_filtro."id_rel_tax_package_periodo" ' 
						+ ') t ' 
						+ 'where ' 
							+ 't."row_number" = 1 ',
					parameters: [idRelTaxPackagePeriodo]
				}, (err, result) => {
					if (err) {
						console.log(err);
						reject(err);
					}
					else {
						resolve((result && result.length && result[0].id_rel_tax_package_periodo) ? Number(result[0].id_rel_tax_package_periodo) : 0);	
					}
				});
			})
			.catch((err) => {
				reject(err);	
			});
	});
};

oModel.isPrimeiraRetificadora = (idEmpresa, idAnoCalendario) => {
	return new Promise((resolve, reject) => {
		var sQuery =	
			'select  '
				+ '(case ' 
					+ 'when ( '
						+ 'select count(*)  '
						+ 'from "VGT.REL_TAX_PACKAGE_PERIODO"  '
						+ 'inner join "VGT.PERIODO"  '
						+ 'on "fk_periodo.id_periodo" = "id_periodo"  '
						+ 'inner join "VGT.TAX_PACKAGE"  '
						+ 'on "fk_tax_package.id_tax_package" = "id_tax_package"  '
						+ 'where "fk_empresa.id_empresa" = ? '
						+ 'and "fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
						+ 'and "numero_ordem" = 6 '
						+ 'and "data_envio" is not null '
						+ ') = 0 ' 
						+ 'then true '
					+ 'else false '
				+ 'end) "ind_primeira_retificadora" '
			+ 'from "DUMMY"	 ',
			aParam = [idEmpresa, idAnoCalendario];
		
		db.executeStatement({
			statement: sQuery,
			parameters: aParam
		}, (err, result) => {
			if (err) {
				console.log(err);
				reject(new Error('Erro no método "isPrimeiraRetificadora" do model "RelTaxPackagePeriodo".\n' + err.message));
			}
			else {
				if (result && result.length) {
					resolve(result[0].ind_primeira_retificadora);
				}
				else {
					reject(new Error('Erro no método "isPrimeiraRetificadora" do model "RelTaxPackagePeriodo".\n' + JSON.stringify(result)));
				}
			}
		});
	});
};

module.exports = oModel;