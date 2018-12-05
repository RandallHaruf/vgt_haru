"use strict";

var model = require("../models/modelTaxReconciliation");

module.exports = {

	listarRegistros: function (req, res) {
		model.listar([], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	criarRegistro: function (req, res) {

		var aParams = [{
			coluna: model.colunas.id
		}, {
			coluna: model.colunas.rc_statutory_gaap_profit_loss_before_tax,
			valor: req.body.rc_statutory_gaap_profit_loss_before_tax ? req.body.rc_statutory_gaap_profit_loss_before_tax : null
		}, {
			coluna: model.colunas.rc_current_income_tax_current_year,
			valor: req.body.rc_current_income_tax_current_year ? req.body.rc_current_income_tax_current_year : null
		}, {
			coluna: model.colunas.rc_current_income_tax_previous_year,
			valor: req.body.rc_current_income_tax_previous_year ? req.body.rc_current_income_tax_previous_year : null
		}, {
			coluna: model.colunas.rc_deferred_income_tax,
			valor: req.body.rc_deferred_income_tax ? req.body.rc_deferred_income_tax : null
		}, {
			coluna: model.colunas.rc_non_recoverable_wht,
			valor: req.body.rc_non_recoverable_wht ? req.body.rc_non_recoverable_wht : null
		}, {
			coluna: model.colunas.rc_statutory_provision_for_income_tax,
			valor: req.body.rc_statutory_provision_for_income_tax ? req.body.rc_statutory_provision_for_income_tax : null
		}, {
			coluna: model.colunas.rc_statutory_gaap_profit_loss_after_tax,
			valor: req.body.rc_statutory_gaap_profit_loss_after_tax ? req.body.rc_statutory_gaap_profit_loss_after_tax : null
		}, {
			coluna: model.colunas.rf_taxable_income_loss_before_losses_and_tax_credits,
			valor: req.body.rf_taxable_income_loss_before_losses_and_tax_credits ? req.body.rf_taxable_income_loss_before_losses_and_tax_credits : null
		}, {
			coluna: model.colunas.rf_total_losses_utilized,
			valor: req.body.rf_total_losses_utilized ? req.body.rf_total_losses_utilized : null
		}, {
			coluna: model.colunas.rf_taxable_income_loss_after_losses,
			valor: req.body.rf_taxable_income_loss_after_losses ? req.body.rf_taxable_income_loss_after_losses : null
		}, {
			coluna: model.colunas.rf_income_tax_before_other_taxes_and_credits,
			valor: req.body.rf_income_tax_before_other_taxes_and_credits ? req.body.rf_income_tax_before_other_taxes_and_credits : null
		}, {
			coluna: model.colunas.rf_other_taxes,
			valor: req.body.rf_other_taxes ? req.body.rf_other_taxes : null
		}, {
			coluna: model.colunas.rf_incentivos_fiscais,
			valor: req.body.rf_incentivos_fiscais ? req.body.rf_incentivos_fiscais : null
		}, {
			coluna: model.colunas.rf_total_other_taxes_and_tax_credits,
			valor: req.body.rf_total_other_taxes_and_tax_credits ? req.body.rf_total_other_taxes_and_tax_credits : null
		}, {
			coluna: model.colunas.rf_net_local_tax,
			valor: req.body.rf_net_local_tax ? req.body.rf_net_local_tax : null
		}, {
			coluna: model.colunas.rf_wht,
			valor: req.body.rf_wht ? req.body.rf_wht : null
		}, {
			coluna: model.colunas.rf_overpayment_from_prior_year_applied_to_current_year,
			valor: req.body.rf_overpayment_from_prior_year_applied_to_current_year ? req.body.rf_overpayment_from_prior_year_applied_to_current_year : null
		}, {
			coluna: model.colunas.rf_total_interim_taxes_payments_antecipacoes,
			valor: req.body.rf_total_interim_taxes_payments_antecipacoes ? req.body.rf_total_interim_taxes_payments_antecipacoes : null
		}, {
			coluna: model.colunas.rf_tax_due_overpaid,
			valor: req.body.rf_tax_due_overpaid ? req.body.rf_tax_due_overpaid : null
		}, {
			coluna: model.colunas.it_income_tax_as_per_the_statutory_financials,
			valor: req.body.it_income_tax_as_per_the_statutory_financials ? req.body.it_income_tax_as_per_the_statutory_financials : null
		}, {
			coluna: model.colunas.it_income_tax_as_per_the_tax_return,
			valor: req.body.it_income_tax_as_per_the_tax_return ? req.body.it_income_tax_as_per_the_tax_return : null
		}, {
			coluna: model.colunas.it_jurisdiction_tax_rate_average,
			valor: req.body.it_jurisdiction_tax_rate_average ? req.body.it_jurisdiction_tax_rate_average : null
		}, {
			coluna: model.colunas.it_statutory_tax_rate_average,
			valor: req.body.it_statutory_tax_rate_average ? req.body.it_statutory_tax_rate_average : null
		}, {
			coluna: model.colunas.it_effective_tax_rate_as_per_the_statutory_financials,
			valor: req.body.it_effective_tax_rate_as_per_the_statutory_financials ? req.body.it_effective_tax_rate_as_per_the_statutory_financials : null
		}, {
			coluna: model.colunas.it_effective_tax_rate_as_per_the_tax_return,
			valor: req.body.it_effective_tax_rate_as_per_the_tax_return ? req.body.it_effective_tax_rate_as_per_the_tax_return : null
		}, {
			coluna: model.colunas.it_details_if_tax_returns_income_differs_from_fs,
			valor: req.body.it_details_if_tax_returns_income_differs_from_fs ? req.body.it_details_if_tax_returns_income_differs_from_fs : null
		}, {
			coluna: model.colunas.fkRelTaxPackagePeriodo,
			valor: req.body.fkRelTaxPackagePeriodo ? req.body.fkRelTaxPackagePeriodo : null
		}];

		model.inserir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	lerRegistro: function (req, res) {
		model.listar([{
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	atualizarRegistro: function (req, res) {

		var oCondition = {
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		};

		var aParams = [{
			coluna: model.colunas.rc_statutory_gaap_profit_loss_before_tax,
			valor: req.body.rc_statutory_gaap_profit_loss_before_tax ? req.body.rc_statutory_gaap_profit_loss_before_tax : null
		}, {
			coluna: model.colunas.rc_current_income_tax_current_year,
			valor: req.body.rc_current_income_tax_current_year ? req.body.rc_current_income_tax_current_year : null
		}, {
			coluna: model.colunas.rc_current_income_tax_previous_year,
			valor: req.body.rc_current_income_tax_previous_year ? req.body.rc_current_income_tax_previous_year : null
		}, {
			coluna: model.colunas.rc_deferred_income_tax,
			valor: req.body.rc_deferred_income_tax ? req.body.rc_deferred_income_tax : null
		}, {
			coluna: model.colunas.rc_non_recoverable_wht,
			valor: req.body.rc_non_recoverable_wht ? req.body.rc_non_recoverable_wht : null
		}, {
			coluna: model.colunas.rc_statutory_provision_for_income_tax,
			valor: req.body.rc_statutory_provision_for_income_tax ? req.body.rc_statutory_provision_for_income_tax : null
		}, {
			coluna: model.colunas.rc_statutory_gaap_profit_loss_after_tax,
			valor: req.body.rc_statutory_gaap_profit_loss_after_tax ? req.body.rc_statutory_gaap_profit_loss_after_tax : null
		}, {
			coluna: model.colunas.rf_taxable_income_loss_before_losses_and_tax_credits,
			valor: req.body.rf_taxable_income_loss_before_losses_and_tax_credits ? req.body.rf_taxable_income_loss_before_losses_and_tax_credits : null
		}, {
			coluna: model.colunas.rf_total_losses_utilized,
			valor: req.body.rf_total_losses_utilized ? req.body.rf_total_losses_utilized : null
		}, {
			coluna: model.colunas.rf_taxable_income_loss_after_losses,
			valor: req.body.rf_taxable_income_loss_after_losses ? req.body.rf_taxable_income_loss_after_losses : null
		}, {
			coluna: model.colunas.rf_income_tax_before_other_taxes_and_credits,
			valor: req.body.rf_income_tax_before_other_taxes_and_credits ? req.body.rf_income_tax_before_other_taxes_and_credits : null
		}, {
			coluna: model.colunas.rf_other_taxes,
			valor: req.body.rf_other_taxes ? req.body.rf_other_taxes : null
		}, {
			coluna: model.colunas.rf_incentivos_fiscais,
			valor: req.body.rf_incentivos_fiscais ? req.body.rf_incentivos_fiscais : null
		}, {
			coluna: model.colunas.rf_total_other_taxes_and_tax_credits,
			valor: req.body.rf_total_other_taxes_and_tax_credits ? req.body.rf_total_other_taxes_and_tax_credits : null
		}, {
			coluna: model.colunas.rf_net_local_tax,
			valor: req.body.rf_net_local_tax ? req.body.rf_net_local_tax : null
		}, {
			coluna: model.colunas.rf_wht,
			valor: req.body.rf_wht ? req.body.rf_wht : null
		}, {
			coluna: model.colunas.rf_overpayment_from_prior_year_applied_to_current_year,
			valor: req.body.rf_overpayment_from_prior_year_applied_to_current_year ? req.body.rf_overpayment_from_prior_year_applied_to_current_year : null
		}, {
			coluna: model.colunas.rf_total_interim_taxes_payments_antecipacoes,
			valor: req.body.rf_total_interim_taxes_payments_antecipacoes ? req.body.rf_total_interim_taxes_payments_antecipacoes : null
		}, {
			coluna: model.colunas.rf_tax_due_overpaid,
			valor: req.body.rf_tax_due_overpaid ? req.body.rf_tax_due_overpaid : null
		}, {
			coluna: model.colunas.it_income_tax_as_per_the_statutory_financials,
			valor: req.body.it_income_tax_as_per_the_statutory_financials ? req.body.it_income_tax_as_per_the_statutory_financials : null
		}, {
			coluna: model.colunas.it_income_tax_as_per_the_tax_return,
			valor: req.body.it_income_tax_as_per_the_tax_return ? req.body.it_income_tax_as_per_the_tax_return : null
		}, {
			coluna: model.colunas.it_jurisdiction_tax_rate_average,
			valor: req.body.it_jurisdiction_tax_rate_average ? req.body.it_jurisdiction_tax_rate_average : null
		}, {
			coluna: model.colunas.it_statutory_tax_rate_average,
			valor: req.body.it_statutory_tax_rate_average ? req.body.it_statutory_tax_rate_average : null
		}, {
			coluna: model.colunas.it_effective_tax_rate_as_per_the_statutory_financials,
			valor: req.body.it_effective_tax_rate_as_per_the_statutory_financials ? req.body.it_effective_tax_rate_as_per_the_statutory_financials : null
		}, {
			coluna: model.colunas.it_effective_tax_rate_as_per_the_tax_return,
			valor: req.body.it_effective_tax_rate_as_per_the_tax_return ? req.body.it_effective_tax_rate_as_per_the_tax_return : null
		}, {
			coluna: model.colunas.it_details_if_tax_returns_income_differs_from_fs,
			valor: req.body.it_details_if_tax_returns_income_differs_from_fs ? req.body.it_details_if_tax_returns_income_differs_from_fs : null
		}, {
			coluna: model.colunas.fkRelTaxPackagePeriodo,
			valor: req.body.fkRelTaxPackagePeriodo ? req.body.fkRelTaxPackagePeriodo : null
		}];

		model.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	excluirRegistro: function (req, res) {
		model.excluir([{
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	deepQuery: function (req, res) {
		res.send("TODO: DeepQuery da Entidade TaxReconciliation");

		/*var sStatement = 'select * from "DUMMY"';

		model.execute({
		statement: sStatement
		}, function (err, result) {
		if (err) {
		res.send(JSON.stringify(err));
		}
		else {
		res.send(JSON.stringify(result));
		}
		});*/
	}
};