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
		//res.send("TODO: DeepQuery da Entidade Obrigacao");

		var sStatement =
			  /*'Select TaxRec.*,RTP_Per.*,TaxPac.*,Perid.*,Moeda.* From "VGT.TAX_RECONCILIATION" TaxRec '
			+ 'LEFT OUTER JOIN "VGT.REL_TAX_PACKAGE_PERIODO" RTP_Per '*/
			'Select TaxRec.*,RTP_Per.*,TaxPac.*,Perid.*,Moeda.* From "VGT.REL_TAX_PACKAGE_PERIODO" RTP_Per  '
			+ 'LEFT OUTER JOIN "VGT.TAX_RECONCILIATION" TaxRec '
			+ 'On TaxRec."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = RTP_Per."id_rel_tax_package_periodo" '
			+ 'LEFT OUTER JOIN "VGT.TAX_PACKAGE" TaxPac '
            + 'ON RTP_Per."fk_tax_package.id_tax_package" = TaxPac."id_tax_package" '
            + 'LEFT OUTER JOIN "VGT.PERIODO" Perid '
			+ 'ON RTP_Per."fk_periodo.id_periodo" = Perid."id_periodo" '
            /*+ 'LEFT OUTER JOIN "VGT.DOMINIO_MOEDA" Moeda '
			+ 'ON TaxPac."fk_dominio_moeda.id_dominio_moeda" = Moeda."id_dominio_moeda" ';*/
			+ 'left outer join "VGT.DOMINIO_MOEDA" moeda '
			+ 'on RTP_Per."fk_dominio_moeda_rel.id_dominio_moeda" = moeda."id_dominio_moeda" ';
			
			var oWhere = [];
			var aParams = [];
	
			if (req.query.anoCalendario) {
				oWhere.push(' Perid."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? ');
				aParams.push(req.query.anoCalendario);
			}
			
			if (req.query.empresa) {
				oWhere.push(' TaxPac."fk_empresa.id_empresa" = ? ');
				aParams.push(req.query.empresa);
			}
			
			if (req.query.taxPackage) {
				oWhere.push(' TaxPac."id_tax_package" = ? ');
				aParams.push(req.query.taxPackage);
			}
			
			if (req.query.numeroOrdem) {
				if (req.query.historico) {
					oWhere.push(' Perid."numero_ordem" < ? ');
					aParams.push(req.query.numeroOrdem);
				}
				else {
					oWhere.push(' Perid."numero_ordem" = ? ');
					aParams.push(req.query.numeroOrdem);
				}
			}
	
			if (oWhere.length > 0) {
				sStatement += "where ";
	
				for (var i = 0; i < oWhere.length; i++) {
					if (i !== 0) {
						sStatement += " and ";
					}
					sStatement += oWhere[i];
				}
			}
			
			sStatement += ' order by Perid."numero_ordem" ';
			
			model.execute({
				statement: sStatement,
				parameters: aParams
			}, function (err, result) {
				if (err) {
					res.send(JSON.stringify(err));
				} else {
					if (req.query.historico) {
						for (var i = 0; i < result.length; i++) {
							var oTaxRecon = result[i];
							
							// Remove todas as retificadoras que não a última ou se não teve tax reconciliation preenchido
							if ((oTaxRecon.numero_ordem >= 6 && i < result.length - 1)) {
								result.splice(i, 1);
							}
						}
					}
					
					res.send(JSON.stringify(result));
				}
			});
	}
};