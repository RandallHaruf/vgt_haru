"use strict";
var db = require("../db");

module.exports = {

	deepQuery: function (req, res) {
	//IMPLEMENTAR QUERY CORRETA
		var sStatement = 
			'SELECT  '
			+'tblEmpresa."id_empresa" AS "tblEmpresa.id_empresa",  '
			+'tblEmpresa."nome" AS "tblEmpresa.nome",  '
			+'tblEmpresa."num_hfm_sap" AS "tblEmpresa.num_hfm_sap",  '
			+'tblEmpresa."tin" AS "tblEmpresa.tin",  '
			+'tblEmpresa."jurisdicao_tin" AS "tblEmpresa.jurisdicao_tin",  '
			+'tblEmpresa."ni" AS "tblEmpresa.ni",  '
			+'tblEmpresa."jurisdicao_ni" AS "tblEmpresa.jurisdicao_ni",  '
			+'tblEmpresa."endereco" AS "tblEmpresa.endereco",  '
			+'tblEmpresa."fy_start_date" AS "tblEmpresa.fy_start_date",  '
			+'tblEmpresa."fy_end_date" AS "tblEmpresa.fy_end_date",  '
			+'tblEmpresa."lbc_nome" AS "tblEmpresa.lbc_nome",  '
			+'tblEmpresa."lbc_email" AS "tblEmpresa.lbc_email",  '
			+'tblEmpresa."comentarios" AS "tblEmpresa.comentarios",  '
			+'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" AS "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario",  '
			+'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" AS "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status",  '
			+'tblEmpresa."fk_aliquota.id_aliquota" AS "tblEmpresa.fk_aliquota.id_aliquota",  '
			+'tblEmpresa."fk_pais.id_pais" AS "tblEmpresa.fk_pais.id_pais",  '
			+'tblTaxPackage."fk_empresa.id_empresa" AS "tblTaxPackage.fk_empresa.id_empresa",  '
			+'tblTaxPackage."fk_dominio_moeda.id_dominio_moeda" AS "tblTaxPackage.fk_dominio_moeda.id_dominio_moeda",  '
			+'tblTaxPackage."id_tax_package" AS "tblTaxPackage.id_tax_package",  '
			+'tblDominioMoeda."id_dominio_moeda" AS "tblDominioMoeda.id_dominio_moeda",  '
			+'tblDominioMoeda."acronimo" AS "tblDominioMoeda.acronimo",  '
			+'tblDominioMoeda."nome" AS "tblDominioMoeda.nome",  '
			+'tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" AS "tblRelTaxPackagePeriodo.id_rel_tax_package_periodo",  '
			+'tblRelTaxPackagePeriodo."fk_tax_package.id_tax_package" AS "tblRelTaxPackagePeriodo.fk_tax_package.id_tax_package",  '
			+'tblRelTaxPackagePeriodo."fk_periodo.id_periodo" AS "tblRelTaxPackagePeriodo.fk_periodo.id_periodo",  '
			+'tblRelTaxPackagePeriodo."ind_ativo" AS "tblRelTaxPackagePeriodo.ind_ativo",  '
			+'tblRelTaxPackagePeriodo."status_envio" AS "tblRelTaxPackagePeriodo.status_envio",  '
			+'tblRelTaxPackagePeriodo."data_envio" AS "tblRelTaxPackagePeriodo.data_envio",  '
			+'tblPeriodo."id_periodo" AS "tblPeriodo.id_periodo",  '
			+'tblPeriodo."periodo" AS "tblPeriodo.periodo",  '
			+'tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" AS "tblPeriodo.fk_dominio_ano_calendario.id_dominio_ano_calendario",  '
			+'tblPeriodo."fk_dominio_modulo.id_dominio_modulo" AS "tblPeriodo.fk_dominio_modulo.id_dominio_modulo",  '
			+'tblPeriodo."numero_ordem" AS "tblPeriodo.numero_ordem",  '
			+'tblDominioAnoCalendario."id_dominio_ano_calendario" AS "tblDominioAnoCalendario.id_dominio_ano_calendario",  '
			+'tblDominioAnoCalendario."ano_calendario" AS "tblDominioAnoCalendario.ano_calendario",  '
			+'tblDominioModulo."id_dominio_modulo" AS "tblDominioModulo.id_dominio_modulo",  '
			+'tblDominioModulo."modulo" AS "tblDominioModulo.modulo",  '
			+'tblTaxReconciliation."id_tax_reconciliation" AS "tblTaxReconciliation.id_tax_reconciliation",  '
			+'tblTaxReconciliation."rc_statutory_gaap_profit_loss_before_tax" AS "tblTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax",  '
			+'tblTaxReconciliation."rc_current_income_tax_current_year" AS "tblTaxReconciliation.rc_current_income_tax_current_year",  '
			+'tblTaxReconciliation."rc_current_income_tax_previous_year" AS "tblTaxReconciliation.rc_current_income_tax_previous_year",  '
			+'tblTaxReconciliation."rc_deferred_income_tax" AS "tblTaxReconciliation.rc_deferred_income_tax",  '
			+'tblTaxReconciliation."rc_non_recoverable_wht" AS "tblTaxReconciliation.rc_non_recoverable_wht",  '
			+'tblTaxReconciliation."rc_statutory_provision_for_income_tax" AS "tblTaxReconciliation.rc_statutory_provision_for_income_tax",  '
			+'tblTaxReconciliation."rc_statutory_gaap_profit_loss_after_tax" AS "tblTaxReconciliation.rc_statutory_gaap_profit_loss_after_tax",  '
			+'tblTaxReconciliation."rf_taxable_income_loss_before_losses_and_tax_credits" AS "tblTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits",  '
			+'tblTaxReconciliation."rf_total_losses_utilized" AS "tblTaxReconciliation.rf_total_losses_utilized",  '
			+'tblTaxReconciliation."rf_taxable_income_loss_after_losses" AS "tblTaxReconciliation.rf_taxable_income_loss_after_losses",  '
			+'tblTaxReconciliation."rf_income_tax_before_other_taxes_and_credits" AS "tblTaxReconciliation.rf_income_tax_before_other_taxes_and_credits",  '
			+'tblTaxReconciliation."rf_other_taxes" AS "tblTaxReconciliation.rf_other_taxes",  '
			+'tblTaxReconciliation."rf_incentivos_fiscais" AS "tblTaxReconciliation.rf_incentivos_fiscais",  '
			+'tblTaxReconciliation."rf_total_other_taxes_and_tax_credits" AS "tblTaxReconciliation.rf_total_other_taxes_and_tax_credits",  '
			+'tblTaxReconciliation."rf_net_local_tax" AS "tblTaxReconciliation.rf_net_local_tax",  '
			+'tblTaxReconciliation."rf_wht" AS "tblTaxReconciliation.rf_wht",  '
			+'tblTaxReconciliation."rf_overpayment_from_prior_year_applied_to_current_year" AS "tblTaxReconciliation.rf_overpayment_from_prior_year_applied_to_current_year",  '
			+'tblTaxReconciliation."rf_total_interim_taxes_payments_antecipacoes" AS "tblTaxReconciliation.rf_total_interim_taxes_payments_antecipacoes",  '
			+'tblTaxReconciliation."rf_tax_due_overpaid" AS "tblTaxReconciliation.rf_tax_due_overpaid",  '
			+'tblTaxReconciliation."it_income_tax_as_per_the_statutory_financials" AS "tblTaxReconciliation.it_income_tax_as_per_the_statutory_financials",  '
			+'tblTaxReconciliation."it_income_tax_as_per_the_tax_return" AS "tblTaxReconciliation.it_income_tax_as_per_the_tax_return",  '
			+'tblTaxReconciliation."it_jurisdiction_tax_rate_average" AS "tblTaxReconciliation.it_jurisdiction_tax_rate_average",  '
			+'tblTaxReconciliation."it_statutory_tax_rate_average" AS "tblTaxReconciliation.it_statutory_tax_rate_average",  '
			+'tblTaxReconciliation."it_effective_tax_rate_as_per_the_statutory_financials" AS "tblTaxReconciliation.it_effective_tax_rate_as_per_the_statutory_financials",  '
			+'tblTaxReconciliation."it_effective_tax_rate_as_per_the_tax_return" AS "tblTaxReconciliation.it_effective_tax_rate_as_per_the_tax_return",  '
			+'tblTaxReconciliation."it_details_if_tax_returns_income_differs_from_fs" AS "tblTaxReconciliation.it_details_if_tax_returns_income_differs_from_fs",  '
			+'tblTaxReconciliation."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" AS "tblTaxReconciliation.fk_rel_tax_package_periodo.id_rel_tax_package_periodo" '
			+'FROM "VGT.EMPRESA" AS tblEmpresa '
			+'INNER JOIN "VGT.TAX_PACKAGE" AS tblTaxPackage '
			+'ON tblTaxPackage."fk_empresa.id_empresa" = tblEmpresa."id_empresa" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_MOEDA" AS tblDominioMoeda '
			+'ON tblDominioMoeda."id_dominio_moeda" = tblTaxPackage."fk_dominio_moeda.id_dominio_moeda" '
			+'INNER JOIN "VGT.REL_TAX_PACKAGE_PERIODO" AS tblRelTaxPackagePeriodo '
			+'ON tblRelTaxPackagePeriodo."fk_tax_package.id_tax_package" = tblTaxPackage."id_tax_package" '
			+'INNER JOIN "VGT.PERIODO" AS tblPeriodo '
			+'ON tblRelTaxPackagePeriodo."fk_periodo.id_periodo" = tblPeriodo."id_periodo" '
			+'INNER JOIN "VGT.DOMINIO_ANO_CALENDARIO" AS tblDominioAnoCalendario '
			+'ON tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = tblDominioAnoCalendario."id_dominio_ano_calendario" '
			+'INNER JOIN "VGT.DOMINIO_MODULO" AS tblDominioModulo '
			+'ON tblPeriodo."fk_dominio_modulo.id_dominio_modulo" = tblDominioModulo."id_dominio_modulo" '
			+'LEFT OUTER JOIN "VGT.TAX_RECONCILIATION" AS tblTaxReconciliation '
			+'ON tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" = tblTaxReconciliation."fk_rel_tax_package_periodo.id_rel_tax_package_periodo"';	

		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];

		if (req.session.usuario.nivelAcesso === 0 && req.session.usuario.empresas.length > 0){
			var aEmpresas = req.session.usuario.empresas;
			aEntrada[4] = [];
			for(var j = 0; j < req.session.usuario.empresas.length;j++){
				aEntrada[4].push(JSON.stringify(aEmpresas[j]));
			}
		}

		for (var i = 0; i < aEntrada.length; i++) {
			filtro = "";			
			if (aEntrada[i] !== null){
				stringtemporaria = "";
				for (var k = 0; k < aEntrada[i].length; k++) {
					switch (i){
						case 0:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;
						case 1:
							filtro = ' tblDominioAnoCalendario."id_dominio_ano_calendario" = ? ';
							break;
						case 2:
							filtro = ' tblPeriodo."id_periodo" = ? ';
							break;
						case 3:
							filtro = ' tblDominioMoeda."id_dominio_moeda" = ? ';
							break;
						case 4:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;							
					}
					if(aEntrada[i].length == 1){
						oWhere.push(filtro);
						aParams.push(aEntrada[i][k]);								
					}	 
					else{
						k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
						aParams.push(aEntrada[i][k]);
					}
				}	
			}
		}

		sStatement += " where"
			+' tblDominioAnoCalendario."ano_calendario" <= year(CURRENT_DATE) '
			+'AND tblDominioModulo."id_dominio_modulo" = 2 ';
		
		if (oWhere.length > 0) {
			sStatement += ' AND ';
			
			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}
		
		sStatement +=' ORDER BY tblEmpresa."id_empresa"';
		
		db.executeStatement({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	deepQueryDistinct: function (req, res) {
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var stringDistinct = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];
		
		switch(aEntrada[5][0]){
			case "tblEmpresa.nome":
				stringDistinct = 'Select distinct "tblEmpresa.id_empresa" , "tblEmpresa.nome"  from (';
				break;
			case "tblDominioAnoCalendario.ano_calendario":
				stringDistinct = 'Select distinct "tblDominioAnoCalendario.id_dominio_ano_calendario" , "tblDominioAnoCalendario.ano_calendario" from (';
				break;		
			case "tblPeriodo.id_periodo":
				stringDistinct = 'select distinct "tblPeriodo.id_periodo", "tblPeriodo.periodo" , "tblDominioAnoCalendario.ano_calendario" from (';
				break;	
			case "tblDominioMoeda.acronimo":
				stringDistinct = 'Select distinct "tblDominioMoeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome" from (';
				break;	
		}
		
		var sStatement = 
			stringDistinct
			+'SELECT  '
			+'tblEmpresa."id_empresa" AS "tblEmpresa.id_empresa",  '
			+'tblEmpresa."nome" AS "tblEmpresa.nome",  '
			+'tblEmpresa."num_hfm_sap" AS "tblEmpresa.num_hfm_sap",  '
			+'tblEmpresa."tin" AS "tblEmpresa.tin",  '
			+'tblEmpresa."jurisdicao_tin" AS "tblEmpresa.jurisdicao_tin",  '
			+'tblEmpresa."ni" AS "tblEmpresa.ni",  '
			+'tblEmpresa."jurisdicao_ni" AS "tblEmpresa.jurisdicao_ni",  '
			+'tblEmpresa."endereco" AS "tblEmpresa.endereco",  '
			+'tblEmpresa."fy_start_date" AS "tblEmpresa.fy_start_date",  '
			+'tblEmpresa."fy_end_date" AS "tblEmpresa.fy_end_date",  '
			+'tblEmpresa."lbc_nome" AS "tblEmpresa.lbc_nome",  '
			+'tblEmpresa."lbc_email" AS "tblEmpresa.lbc_email",  '
			+'tblEmpresa."comentarios" AS "tblEmpresa.comentarios",  '
			+'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" AS "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario",  '
			+'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" AS "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status",  '
			+'tblEmpresa."fk_aliquota.id_aliquota" AS "tblEmpresa.fk_aliquota.id_aliquota",  '
			+'tblEmpresa."fk_pais.id_pais" AS "tblEmpresa.fk_pais.id_pais",  '
			+'tblTaxPackage."fk_empresa.id_empresa" AS "tblTaxPackage.fk_empresa.id_empresa",  '
			+'tblTaxPackage."fk_dominio_moeda.id_dominio_moeda" AS "tblTaxPackage.fk_dominio_moeda.id_dominio_moeda",  '
			+'tblTaxPackage."id_tax_package" AS "tblTaxPackage.id_tax_package",  '
			+'tblDominioMoeda."id_dominio_moeda" AS "tblDominioMoeda.id_dominio_moeda",  '
			+'tblDominioMoeda."acronimo" AS "tblDominioMoeda.acronimo",  '
			+'tblDominioMoeda."nome" AS "tblDominioMoeda.nome",  '
			+'tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" AS "tblRelTaxPackagePeriodo.id_rel_tax_package_periodo",  '
			+'tblRelTaxPackagePeriodo."fk_tax_package.id_tax_package" AS "tblRelTaxPackagePeriodo.fk_tax_package.id_tax_package",  '
			+'tblRelTaxPackagePeriodo."fk_periodo.id_periodo" AS "tblRelTaxPackagePeriodo.fk_periodo.id_periodo",  '
			+'tblRelTaxPackagePeriodo."ind_ativo" AS "tblRelTaxPackagePeriodo.ind_ativo",  '
			+'tblRelTaxPackagePeriodo."status_envio" AS "tblRelTaxPackagePeriodo.status_envio",  '
			+'tblRelTaxPackagePeriodo."data_envio" AS "tblRelTaxPackagePeriodo.data_envio",  '
			+'tblPeriodo."id_periodo" AS "tblPeriodo.id_periodo",  '
			+'tblPeriodo."periodo" AS "tblPeriodo.periodo",  '
			+'tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" AS "tblPeriodo.fk_dominio_ano_calendario.id_dominio_ano_calendario",  '
			+'tblPeriodo."fk_dominio_modulo.id_dominio_modulo" AS "tblPeriodo.fk_dominio_modulo.id_dominio_modulo",  '
			+'tblPeriodo."numero_ordem" AS "tblPeriodo.numero_ordem",  '
			+'tblDominioAnoCalendario."id_dominio_ano_calendario" AS "tblDominioAnoCalendario.id_dominio_ano_calendario",  '
			+'tblDominioAnoCalendario."ano_calendario" AS "tblDominioAnoCalendario.ano_calendario",  '
			+'tblDominioModulo."id_dominio_modulo" AS "tblDominioModulo.id_dominio_modulo",  '
			+'tblDominioModulo."modulo" AS "tblDominioModulo.modulo",  '
			+'tblTaxReconciliation."id_tax_reconciliation" AS "tblTaxReconciliation.id_tax_reconciliation",  '
			+'tblTaxReconciliation."rc_statutory_gaap_profit_loss_before_tax" AS "tblTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax",  '
			+'tblTaxReconciliation."rc_current_income_tax_current_year" AS "tblTaxReconciliation.rc_current_income_tax_current_year",  '
			+'tblTaxReconciliation."rc_current_income_tax_previous_year" AS "tblTaxReconciliation.rc_current_income_tax_previous_year",  '
			+'tblTaxReconciliation."rc_deferred_income_tax" AS "tblTaxReconciliation.rc_deferred_income_tax",  '
			+'tblTaxReconciliation."rc_non_recoverable_wht" AS "tblTaxReconciliation.rc_non_recoverable_wht",  '
			+'tblTaxReconciliation."rc_statutory_provision_for_income_tax" AS "tblTaxReconciliation.rc_statutory_provision_for_income_tax",  '
			+'tblTaxReconciliation."rc_statutory_gaap_profit_loss_after_tax" AS "tblTaxReconciliation.rc_statutory_gaap_profit_loss_after_tax",  '
			+'tblTaxReconciliation."rf_taxable_income_loss_before_losses_and_tax_credits" AS "tblTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits",  '
			+'tblTaxReconciliation."rf_total_losses_utilized" AS "tblTaxReconciliation.rf_total_losses_utilized",  '
			+'tblTaxReconciliation."rf_taxable_income_loss_after_losses" AS "tblTaxReconciliation.rf_taxable_income_loss_after_losses",  '
			+'tblTaxReconciliation."rf_income_tax_before_other_taxes_and_credits" AS "tblTaxReconciliation.rf_income_tax_before_other_taxes_and_credits",  '
			+'tblTaxReconciliation."rf_other_taxes" AS "tblTaxReconciliation.rf_other_taxes",  '
			+'tblTaxReconciliation."rf_incentivos_fiscais" AS "tblTaxReconciliation.rf_incentivos_fiscais",  '
			+'tblTaxReconciliation."rf_total_other_taxes_and_tax_credits" AS "tblTaxReconciliation.rf_total_other_taxes_and_tax_credits",  '
			+'tblTaxReconciliation."rf_net_local_tax" AS "tblTaxReconciliation.rf_net_local_tax",  '
			+'tblTaxReconciliation."rf_wht" AS "tblTaxReconciliation.rf_wht",  '
			+'tblTaxReconciliation."rf_overpayment_from_prior_year_applied_to_current_year" AS "tblTaxReconciliation.rf_overpayment_from_prior_year_applied_to_current_year",  '
			+'tblTaxReconciliation."rf_total_interim_taxes_payments_antecipacoes" AS "tblTaxReconciliation.rf_total_interim_taxes_payments_antecipacoes",  '
			+'tblTaxReconciliation."rf_tax_due_overpaid" AS "tblTaxReconciliation.rf_tax_due_overpaid",  '
			+'tblTaxReconciliation."it_income_tax_as_per_the_statutory_financials" AS "tblTaxReconciliation.it_income_tax_as_per_the_statutory_financials",  '
			+'tblTaxReconciliation."it_income_tax_as_per_the_tax_return" AS "tblTaxReconciliation.it_income_tax_as_per_the_tax_return",  '
			+'tblTaxReconciliation."it_jurisdiction_tax_rate_average" AS "tblTaxReconciliation.it_jurisdiction_tax_rate_average",  '
			+'tblTaxReconciliation."it_statutory_tax_rate_average" AS "tblTaxReconciliation.it_statutory_tax_rate_average",  '
			+'tblTaxReconciliation."it_effective_tax_rate_as_per_the_statutory_financials" AS "tblTaxReconciliation.it_effective_tax_rate_as_per_the_statutory_financials",  '
			+'tblTaxReconciliation."it_effective_tax_rate_as_per_the_tax_return" AS "tblTaxReconciliation.it_effective_tax_rate_as_per_the_tax_return",  '
			+'tblTaxReconciliation."it_details_if_tax_returns_income_differs_from_fs" AS "tblTaxReconciliation.it_details_if_tax_returns_income_differs_from_fs",  '
			+'tblTaxReconciliation."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" AS "tblTaxReconciliation.fk_rel_tax_package_periodo.id_rel_tax_package_periodo" '
			+'FROM "VGT.EMPRESA" AS tblEmpresa '
			+'INNER JOIN "VGT.TAX_PACKAGE" AS tblTaxPackage '
			+'ON tblTaxPackage."fk_empresa.id_empresa" = tblEmpresa."id_empresa" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_MOEDA" AS tblDominioMoeda '
			+'ON tblDominioMoeda."id_dominio_moeda" = tblTaxPackage."fk_dominio_moeda.id_dominio_moeda" '
			+'INNER JOIN "VGT.REL_TAX_PACKAGE_PERIODO" AS tblRelTaxPackagePeriodo '
			+'ON tblRelTaxPackagePeriodo."fk_tax_package.id_tax_package" = tblTaxPackage."id_tax_package" '
			+'INNER JOIN "VGT.PERIODO" AS tblPeriodo '
			+'ON tblRelTaxPackagePeriodo."fk_periodo.id_periodo" = tblPeriodo."id_periodo" '
			+'INNER JOIN "VGT.DOMINIO_ANO_CALENDARIO" AS tblDominioAnoCalendario '
			+'ON tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = tblDominioAnoCalendario."id_dominio_ano_calendario" '
			+'INNER JOIN "VGT.DOMINIO_MODULO" AS tblDominioModulo '
			+'ON tblPeriodo."fk_dominio_modulo.id_dominio_modulo" = tblDominioModulo."id_dominio_modulo" '
			+'LEFT OUTER JOIN "VGT.TAX_RECONCILIATION" AS tblTaxReconciliation '
			+'ON tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" = tblTaxReconciliation."fk_rel_tax_package_periodo.id_rel_tax_package_periodo"';		

		if (req.session.usuario.nivelAcesso === 0 && req.session.usuario.empresas.length > 0){
			var aEmpresas = req.session.usuario.empresas;
			aEntrada[4] = [];
			for(var j = 0; j < req.session.usuario.empresas.length;j++){
				aEntrada[4].push(JSON.stringify(aEmpresas[j]));
			}
		}

		for (var i = 0; i < aEntrada.length - 1; i++) {
			filtro = "";
			if (aEntrada[i] !== null){
				stringtemporaria = "";
				for (var k = 0; k < aEntrada[i].length; k++) {
					switch (i){
						case 0:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;
						case 1:
							filtro = ' tblDominioAnoCalendario."id_dominio_ano_calendario" = ? ';
							break;
						case 2:
							filtro = ' tblPeriodo."id_periodo" = ? ';
							break;
						case 3:
							filtro = ' tblDominioMoeda."id_dominio_moeda" = ? ';
							break;			
						case 4:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;							
					}
					if(aEntrada[i].length == 1){
						oWhere.push(filtro);
						aParams.push(aEntrada[i][k]);								
					}	 
					else{
						k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
						aParams.push(aEntrada[i][k]);
					}
				}	
			}
		}
		sStatement += " where"
			+' tblDominioAnoCalendario."ano_calendario" <= year(CURRENT_DATE) '
			+'AND tblDominioModulo."id_dominio_modulo" = 2 ';
		
		if (oWhere.length > 0) {
			sStatement += ' AND ';
			
			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}
		
		sStatement += ")";
		
		db.executeStatement({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	}	
};