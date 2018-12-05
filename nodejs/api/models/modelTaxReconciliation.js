"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_tax_reconciliation",
			identity: true
		},
		rc_statutory_gaap_profit_loss_before_tax: {
			nome: "rc_statutory_gaap_profit_loss_before_tax"
		},
        rc_current_income_tax_current_year: {
            nome: "rc_current_income_tax_current_year"
        },
        rc_current_income_tax_previous_year: {
            nome:"rc_current_income_tax_previous_year"
        },
        rc_deferred_income_tax: {
            nome:"rc_deferred_income_tax"
        },
        rc_non_recoverable_wht: {
            nome: "rc_non_recoverable_wht"
        },
        rc_statutory_provision_for_income_tax: {
            nome: "rc_statutory_provision_for_income_tax"
        },
        rc_statutory_gaap_profit_loss_after_tax: {
            nome: "rc_statutory_gaap_profit_loss_after_tax"
        },
        rf_taxable_income_loss_before_losses_and_tax_credits: {
            nome: "rf_taxable_income_loss_before_losses_and_tax_credits"
        },        
        rf_total_losses_utilized: {
            nome: "rf_total_losses_utilized"
        },
        rf_taxable_income_loss_after_losses: {
            nome: "rf_taxable_income_loss_after_losses"
        },
        rf_income_tax_before_other_taxes_and_credits: {
            nome: "rf_income_tax_before_other_taxes_and_credits"
        },
        rf_other_taxes: {
            nome: "rf_other_taxes"
        },
        rf_incentivos_fiscais: {
            nome: "rf_incentivos_fiscais"
        },
        rf_total_other_taxes_and_tax_credits: {
            nome: "rf_total_other_taxes_and_tax_credits"
        },
        rf_net_local_tax: {
            nome: "rf_net_local_tax"
        },
        rf_wht: {
            nome: "rf_wht"
        },
        rf_overpayment_from_prior_year_applied_to_current_year: {
            nome: "rf_overpayment_from_prior_year_applied_to_current_year"
        },
        rf_total_interim_taxes_payments_antecipacoes: {
            nome: "rf_total_interim_taxes_payments_antecipacoes"
        },
        rf_tax_due_overpaid: {
            nome: "rf_tax_due_overpaid"
        },
        it_income_tax_as_per_the_statutory_financials: {
			nome: "it_income_tax_as_per_the_statutory_financials"
		},
        it_income_tax_as_per_the_tax_return: {
			nome: "it_income_tax_as_per_the_tax_return"
		},
        it_jurisdiction_tax_rate_average: {
			nome: "it_jurisdiction_tax_rate_average"
		},
        it_statutory_tax_rate_average: {
			nome: "it_statutory_tax_rate_average"
		},
        it_effective_tax_rate_as_per_the_statutory_financials: {
			nome: "it_effective_tax_rate_as_per_the_statutory_financials"
		},
        it_effective_tax_rate_as_per_the_tax_return: {
			nome: "it_effective_tax_rate_as_per_the_tax_return"
		},
        it_details_if_tax_returns_income_differs_from_fs: {
			nome: "it_details_if_tax_returns_income_differs_from_fs"
		},
        fkRelTaxPackagePeriodo: {
            nome: "fk_rel_tax_package_periodo",
            number: true
        }                
	}
};

module.exports = db.model("VGT.TAX_RECONCILIATION", oSketch);