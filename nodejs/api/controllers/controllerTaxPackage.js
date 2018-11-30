"use strict";

var db = require("../db");

module.exports = {
	listarTaxPackage: function (req, res) {
		
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
				iNumeroOrdemPeriodo = oTaxPackage.periodo.numero_ordem;
			
			atualizarMoeda(sIdTaxPackage, sIdMoeda);
			
			var sIdTaxReconciliation = inserirTaxReconciliation(sIdRelTaxPackagePeriodo, oTaxReconciliation, sIncomeTaxDetails);
			
			var sChaveValorDiferenca = pegarChaveValorDiferenca(iNumeroOrdemPeriodo);
			
			inserirDiferenca(sIdTaxReconciliation, aDiferencaPermanente, sChaveValorDiferenca);
			inserirDiferenca(sIdTaxReconciliation, aDiferencaTemporaria, sChaveValorDiferenca);
			
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
				+ 'set "rc_current_income_tax_current_year" = ?, '
				+ 'set "rc_current_income_tax_previous_year" = ?, '
				+ 'set "rc_deferred_income_tax" = ?, '
				+ 'set "rc_non_recoverable_wht" = ?, '
				+ 'set "rc_statutory_provision_for_income_tax" = ?, '
				+ 'set "rc_statutory_gaap_profit_loss_after_tax" = ?, '
				+ 'set "rf_taxable_income_loss_before_losses_and_tax_credits" = ?, '
				+ 'set "rf_total_losses_utilized" = ?,  '
				+ 'set "rf_taxable_income_loss_after_losses" = ?, '
				+ 'set "rf_income_tax_before_other_taxes_and_credits" = ?, '
				+ 'set "rf_other_taxes" = ?, '
				+ 'set "rf_incentivos_fiscais" = ?, '
				+ 'set "rf_total_other_taxes_and_tax_credits" = ?, '				
				+ 'set "rf_net_local_tax" = ?, '
				+ 'set "rf_wht" = ?, '
				+ 'set "rf_overpayment_from_prior_year_applied_to_current_year" = ?, '
				+ 'set "rf_total_interim_taxes_payments_antecipacoes" = ?, '
				+ 'set "rf_tax_due_overpaid" = ?, '
				+ 'set "it_income_tax_as_per_the_statutory_financials" = ?, '
				+ 'set "it_income_tax_as_per_the_tax_return" = ?, '
				+ 'set "it_jurisdiction_tax_rate_average" = ?, '
				+ 'set "it_statutory_tax_rate_average" = ?, '
				+ 'set "it_effective_tax_rate_as_per_the_statutory_financials" = ?, '
				+ 'set "it_effective_tax_rate_as_per_the_tax_return" = ?, '
				+ 'set "it_details_if_tax_returns_income_differs_from_fs"  = ? '
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
					+ 'set "fk_diferenca_opcao.id_diferenca_opcao" = ?, '
					+ 'set "fk_tax_reconciliation.id_tax_reconciliation" = ?, '
					+ 'set "valor" = ? '
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