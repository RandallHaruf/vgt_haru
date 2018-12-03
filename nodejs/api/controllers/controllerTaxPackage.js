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
			
			for (var i = 0, length = resultTaxRecon.length; i < length; i++) {
				resultTaxRecon[i].ind_ativo = (resultTaxRecon[i].ind_ativo === 1);
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
			var oTaxReconciliation = resultTaxRecon[0];
			
			sQuery =
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
			}
			
			res.send(JSON.stringify({
				taxReconciliation: resultTaxRecon,
				diferencaPermanente: resultDiferenca.filter(obj => obj.id_dominio_diferenca_tipo === 1),
				diferencaTemporaria: resultDiferenca.filter(obj => obj.id_dominio_diferenca_tipo === 2)
			}));
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
				aRespostaItemToReport = oTaxPackage.respostaItemToReport;
			
			atualizarMoeda(sIdTaxPackage, sIdMoeda);
			
			var sIdTaxReconciliation = inserirTaxReconciliation(sIdRelTaxPackagePeriodo, oTaxReconciliation, sIncomeTaxDetails);
			
			var sChaveValorDiferenca = pegarChaveValorDiferenca(iNumeroOrdemPeriodo);
			
			inserirDiferenca(sIdTaxReconciliation, aDiferencaPermanente, sChaveValorDiferenca);
			inserirDiferenca(sIdTaxReconciliation, aDiferencaTemporaria, sChaveValorDiferenca);
			
			inserirRespostaItemToReport(sIdRelTaxPackagePeriodo, aRespostaItemToReport);
			
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
	}
};

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
}

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