"use strict";
var db = require("../db");
function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}
module.exports = {

	deepQuery: function (req, res) {

		var sStatement =
			'SELECT * FROM ('
			+'SELECT '
			+'"tblEmpresa.id_empresa", '
			+'"tblEmpresa.nome", '
			+'"tblDominioAnoCalendario.id_dominio_ano_calendario", '
			+'"tblDominioAnoCalendario.ano_calendario", '
			+'"tblPeriodo.periodo", '
			+'"tblPeriodo.numero_ordem", '
			+'"tblDominioMoeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome", '
			+'"tblItemToReport.id_item_to_report", '
			+'"tblItemToReport.flag_ano", '
			+'"tblItemToReport.flag_sim_nao", '
			+'"tblItemToReport.pergunta", '
			+'"tblRespostaItemToReport.ind_se_aplica", '
			+'"tblRespostaItemToReport.resposta", '
			+'STRING_AGG(TO_VARCHAR("tblDominioAnoFiscal.ano_fiscal"),\',\' ORDER BY "tblDominioAnoFiscal.id_dominio_ano_fiscal") AS "Ano_Fiscal_Agregado", '
			+'STRING_AGG(TO_VARCHAR("tblDominioAnoFiscal.id_dominio_ano_fiscal",\'0000\'),\',\' ORDER BY "tblDominioAnoFiscal.id_dominio_ano_fiscal") AS "Ano_Fiscal_Filtro" '
			+'FROM ( '
			+'SELECT tblEmpresa."id_empresa" AS "tblEmpresa.id_empresa",  '
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
			+'tblTaxReconciliation."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" AS "tblTaxReconciliation.fk_rel_tax_package_periodo.id_rel_tax_package_periodo", '
			+'tblRespostaItemToReport."id_resposta_item_to_report" AS "tblRespostaItemToReport.id_resposta_item_to_report", '
			+'tblRespostaItemToReport."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" AS "tblRespostaItemToReport.fk_rel_tax_package_periodo.id_rel_tax_package_periodo", '
			+'tblRespostaItemToReport."fk_item_to_report.id_item_to_report" AS "tblRespostaItemToReport.fk_item_to_report.id_item_to_report", '
			+'tblRespostaItemToReport."ind_se_aplica" AS "tblRespostaItemToReport.ind_se_aplica", '
			+'tblRespostaItemToReport."resposta" AS "tblRespostaItemToReport.resposta", '
			+'tblItemToReport."id_item_to_report" AS "tblItemToReport.id_item_to_report", '
			+'tblItemToReport."pergunta" AS "tblItemToReport.pergunta", '
			+'tblItemToReport."flag_sim_nao" AS "tblItemToReport.flag_sim_nao", '
			+'tblItemToReport."flag_ano" AS "tblItemToReport.flag_ano", '
			+'tblRelRespostaItemToReportAnoFiscal."fk_resposta_item_to_report.id_resposta_item_to_report" AS "tblRelRespostaItemToReportAnoFiscal.fk_resposta_item_to_report.id_resposta_item_to_report", '
			+'tblRelRespostaItemToReportAnoFiscal."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" AS "tblRelRespostaItemToReportAnoFiscal.fk_dominio_ano_fiscal.id_dominio_ano_fiscal", '
			+'tblDominioAnoFiscal."id_dominio_ano_fiscal" AS "tblDominioAnoFiscal.id_dominio_ano_fiscal", '
			+'tblDominioAnoFiscal."ano_fiscal" AS "tblDominioAnoFiscal.ano_fiscal" '
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
			+'ON tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" = tblTaxReconciliation."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" '
			+'LEFT OUTER JOIN "VGT.RESPOSTA_ITEM_TO_REPORT" AS tblRespostaItemToReport '
			+'ON tblRespostaItemToReport."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" '
			+'LEFT OUTER JOIN "VGT.ITEM_TO_REPORT" AS tblItemToReport '
			+'ON tblItemToReport."id_item_to_report" = tblRespostaItemToReport."fk_item_to_report.id_item_to_report" '
			+'LEFT OUTER JOIN "VGT.REL_RESPOSTA_ITEM_TO_REPORT_ANO_FISCAL" AS tblRelRespostaItemToReportAnoFiscal '
			+'ON tblRelRespostaItemToReportAnoFiscal."fk_resposta_item_to_report.id_resposta_item_to_report" = tblRespostaItemToReport."id_resposta_item_to_report" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_ANO_FISCAL" AS tblDominioAnoFiscal  '
			+'ON tblDominioAnoFiscal."id_dominio_ano_fiscal" = tblRelRespostaItemToReportAnoFiscal."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" ';	


		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];

		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};

		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/ req.session.usuario.empresas.length > 0){
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
					if (i != 9){//pular o parametro 9
						switch (i){
							case 0:
								filtro = ' tblEmpresa."id_empresa" = ? ';
								break;
							case 1:
								filtro = ' tblDominioAnoCalendario."id_dominio_ano_calendario" = ? ';
								break;
							case 2:
								//filtro = ' tblPeriodo."id_periodo" = ? ';
								filtro = ' tblPeriodo."numero_ordem" = ? ';		
								break;
							case 3:
								filtro = ' tblDominioMoeda."id_dominio_moeda" = ? ';
								break;
							case 4:
								filtro = ' tblEmpresa."id_empresa" = ? ';
								break;	
							case 5:
								filtro = ' tblItemToReport."flag_sim_nao" = ? ';
								break;	
							case 6:
								filtro = ' tblItemToReport."flag_ano" = ? ';
								break;	
							case 7:
								filtro = ' tblItemToReport."pergunta" = ? ';	
								break;	
							case 8:
								filtro = ' tblRespostaItemToReport."ind_se_aplica" = ? ';
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
		sStatement +=
			') group by "tblItemToReport.id_item_to_report", '
			+'"tblItemToReport.flag_ano", '
			+'"tblItemToReport.flag_sim_nao", '
			+'"tblItemToReport.pergunta", '
			+'"tblRespostaItemToReport.ind_se_aplica", '
			+'"tblRespostaItemToReport.resposta", '
			+'"tblEmpresa.nome", '
			+'"tblEmpresa.id_empresa", '
			+'"tblDominioAnoCalendario.ano_calendario", '
			+'"tblDominioAnoCalendario.id_dominio_ano_calendario", '
			+'"tblPeriodo.periodo", '
			+'"tblPeriodo.numero_ordem", '
			+'"tblDominioMoeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome" )';
		oWhere = [];
		if (aEntrada[9] !== null){
			sStatement += " Where "
			stringtemporaria = "";
			filtro = ' "Ano_Fiscal_Filtro" like ? ';	
			for (i = 0; i < aEntrada[9].length; i++) {
				if(aEntrada[9].length == 1){
					oWhere.push(filtro);
					aParams.push('%'+aEntrada[9][i]+'%');								
				}	 
				else{
					i == 0 ? stringtemporaria = stringtemporaria + filtro : i == aEntrada[9].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
					aParams.push('%'+aEntrada[9][i]+'%');
				}					
			}			
		}

		if (oWhere.length > 0) {
			for (i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}		
			
		sStatement +=' order by "tblEmpresa.nome" asc, "tblDominioAnoCalendario.ano_calendario" desc, "tblPeriodo.numero_ordem" asc';
		
		db.executeStatement({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		}, {
			idUsuario: req
		});
	},
	
	deepQueryDistinct: function (req, res) {
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var stringDistinct = "";
		var stringDistinctFilter = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];
		
		switch(aEntrada[10][0]){
			case "tblEmpresa.nome":
				stringDistinct = 'Select distinct "tblEmpresa.id_empresa" , "tblEmpresa.nome"  from (';
				break;
			case "tblDominioAnoCalendario.ano_calendario":
				stringDistinct = 'Select distinct "tblDominioAnoCalendario.id_dominio_ano_calendario" , "tblDominioAnoCalendario.ano_calendario" from (';
				//stringDistinctFilter = 'order by "tblDominioAnoCalendario.ano_calendario"';	
				break;		
			case "tblPeriodo.id_periodo":
				//stringDistinct = 'select distinct "tblPeriodo.id_periodo", "tblPeriodo.periodo" , "tblDominioAnoCalendario.ano_calendario" , "tblPeriodo.numero_ordem" from (';
				stringDistinct = 'select distinct "tblPeriodo.numero_ordem" from (';
				break;	
			case "tblDominioMoeda.acronimo":
				stringDistinct = 'Select distinct "tblDominioMoeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome" from (';
				break;	
			case "tblItemToReport.pergunta":
				stringDistinct = 'Select distinct "tblItemToReport.pergunta" from (';
				stringDistinctFilter = 'where "tblItemToReport.pergunta" is not null';
				break;		
			case "tblItemToReport.flag_ano":
				stringDistinct = 'Select distinct "tblItemToReport.flag_ano" from (';
				stringDistinctFilter = 'where "tblItemToReport.flag_ano" is not null';
				break;	
			case "tblItemToReport.flag_sim_nao":
				stringDistinct = 'Select distinct "tblItemToReport.flag_sim_nao" from (';
				stringDistinctFilter = 'where "tblItemToReport.flag_sim_nao" is not null';
				break;	
			case "tblRespostaItemToReport.ind_se_aplica":
				stringDistinct = 'Select distinct "tblRespostaItemToReport.ind_se_aplica" from (';
				stringDistinctFilter = 'where "tblRespostaItemToReport.ind_se_aplica" is not null';
				break;			
			case "tblDominioAnoFiscal.ano_fiscal":
				stringDistinct = 'Select distinct "Ano_Fiscal_Agregado","Ano_Fiscal_Filtro" from (';
				stringDistinctFilter = 'where "Ano_Fiscal_Agregado" is not null ';
				break;					
		}
		
		var sStatement = 
			stringDistinct
			+'SELECT '
			+'"tblEmpresa.id_empresa", '
			+'"tblEmpresa.nome", '
			+'"tblDominioAnoCalendario.id_dominio_ano_calendario", '
			+'"tblDominioAnoCalendario.ano_calendario", '
			+'"tblPeriodo.periodo", '
			+'"tblPeriodo.numero_ordem", '
			+'"tblDominioMoeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome", '
			+'"tblItemToReport.id_item_to_report", '
			+'"tblItemToReport.flag_ano", '
			+'"tblItemToReport.flag_sim_nao", '
			+'"tblItemToReport.pergunta", '
			+'"tblRespostaItemToReport.ind_se_aplica", '
			+'"tblRespostaItemToReport.resposta", '
			+'STRING_AGG(TO_VARCHAR("tblDominioAnoFiscal.ano_fiscal"),\',\' ORDER BY "tblDominioAnoFiscal.id_dominio_ano_fiscal") AS "Ano_Fiscal_Agregado", '
			+'STRING_AGG(TO_VARCHAR("tblDominioAnoFiscal.id_dominio_ano_fiscal",\'0000\'),\',\' ORDER BY "tblDominioAnoFiscal.id_dominio_ano_fiscal") AS "Ano_Fiscal_Filtro" '
			+'FROM ( '
			+'SELECT tblEmpresa."id_empresa" AS "tblEmpresa.id_empresa",  '
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
			+'tblTaxReconciliation."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" AS "tblTaxReconciliation.fk_rel_tax_package_periodo.id_rel_tax_package_periodo", '
			+'tblRespostaItemToReport."id_resposta_item_to_report" AS "tblRespostaItemToReport.id_resposta_item_to_report", '
			+'tblRespostaItemToReport."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" AS "tblRespostaItemToReport.fk_rel_tax_package_periodo.id_rel_tax_package_periodo", '
			+'tblRespostaItemToReport."fk_item_to_report.id_item_to_report" AS "tblRespostaItemToReport.fk_item_to_report.id_item_to_report", '
			+'tblRespostaItemToReport."ind_se_aplica" AS "tblRespostaItemToReport.ind_se_aplica", '
			+'tblRespostaItemToReport."resposta" AS "tblRespostaItemToReport.resposta", '
			+'tblItemToReport."id_item_to_report" AS "tblItemToReport.id_item_to_report", '
			+'tblItemToReport."pergunta" AS "tblItemToReport.pergunta", '
			+'tblItemToReport."flag_sim_nao" AS "tblItemToReport.flag_sim_nao", '
			+'tblItemToReport."flag_ano" AS "tblItemToReport.flag_ano", '
			+'tblRelRespostaItemToReportAnoFiscal."fk_resposta_item_to_report.id_resposta_item_to_report" AS "tblRelRespostaItemToReportAnoFiscal.fk_resposta_item_to_report.id_resposta_item_to_report", '
			+'tblRelRespostaItemToReportAnoFiscal."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" AS "tblRelRespostaItemToReportAnoFiscal.fk_dominio_ano_fiscal.id_dominio_ano_fiscal", '
			+'tblDominioAnoFiscal."id_dominio_ano_fiscal" AS "tblDominioAnoFiscal.id_dominio_ano_fiscal", '
			+'tblDominioAnoFiscal."ano_fiscal" AS "tblDominioAnoFiscal.ano_fiscal" '
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
			+'ON tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" = tblTaxReconciliation."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" '
			+'LEFT OUTER JOIN "VGT.RESPOSTA_ITEM_TO_REPORT" AS tblRespostaItemToReport '
			+'ON tblRespostaItemToReport."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" '
			+'LEFT OUTER JOIN "VGT.ITEM_TO_REPORT" AS tblItemToReport '
			+'ON tblItemToReport."id_item_to_report" = tblRespostaItemToReport."fk_item_to_report.id_item_to_report" '
			+'LEFT OUTER JOIN "VGT.REL_RESPOSTA_ITEM_TO_REPORT_ANO_FISCAL" AS tblRelRespostaItemToReportAnoFiscal '
			+'ON tblRelRespostaItemToReportAnoFiscal."fk_resposta_item_to_report.id_resposta_item_to_report" = tblRespostaItemToReport."id_resposta_item_to_report" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_ANO_FISCAL" AS tblDominioAnoFiscal  '
			+'ON tblDominioAnoFiscal."id_dominio_ano_fiscal" = tblRelRespostaItemToReportAnoFiscal."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" ';	

		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};

		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/ req.session.usuario.empresas.length > 0){
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
					if(i != 9){
						switch (i){
							case 0:
								filtro = ' tblEmpresa."id_empresa" = ? ';
								break;
							case 1:
								filtro = ' tblDominioAnoCalendario."id_dominio_ano_calendario" = ? ';
								break;
							case 2:
								//filtro = ' tblPeriodo."id_periodo" = ? ';
								filtro = ' tblPeriodo."numero_ordem" = ? ';
								break;
							case 3:
								filtro = ' tblDominioMoeda."id_dominio_moeda" = ? ';
								break;			
							case 4:
								filtro = ' tblEmpresa."id_empresa" = ? ';
								break;	
							case 5:
								filtro = ' tblItemToReport."flag_sim_nao" = ? ';
								break;	
							case 6:
								filtro = ' tblItemToReport."flag_ano" = ? ';
								break;	
							case 7:
								filtro = ' tblItemToReport."pergunta" = ? ';	
								break;	
							case 8:
								filtro = ' tblRespostaItemToReport."ind_se_aplica" = ? ';
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
		sStatement +=
			') group by "tblItemToReport.id_item_to_report", '
			+'"tblItemToReport.flag_ano", '
			+'"tblItemToReport.flag_sim_nao", '
			+'"tblItemToReport.pergunta", '
			+'"tblRespostaItemToReport.ind_se_aplica", '
			+'"tblRespostaItemToReport.resposta", '
			+'"tblEmpresa.nome", '
			+'"tblEmpresa.id_empresa", '
			+'"tblDominioAnoCalendario.ano_calendario", '
			+'"tblDominioAnoCalendario.id_dominio_ano_calendario", '
			+'"tblPeriodo.periodo", '
			+'"tblPeriodo.numero_ordem", '
			+'"tblDominioMoeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome" ';
			
		sStatement += ") " + stringDistinctFilter;
		
		oWhere = [];
		if (aEntrada[9] !== null){
			if(stringDistinctFilter == ""){
				sStatement += " Where "
			}
			else{
				sStatement += " and " 
			}
			stringtemporaria = "";
			filtro = ' "Ano_Fiscal_Filtro" like ? ';	
			for (i = 0; i < aEntrada[9].length; i++) {
				if(aEntrada[9].length == 1){
					oWhere.push(filtro);
					aParams.push('%'+aEntrada[9][i]+'%');								
				}	 
				else{
					i == 0 ? stringtemporaria = stringtemporaria + filtro : i == aEntrada[9].length - 1 ? (stringtemporaria = stringtemporaria +  ' or ' + filtro , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or ' + filtro; 
					aParams.push('%'+aEntrada[9][i]+'%');
				}					
			}			
		}

		if (oWhere.length > 0) {
			for (i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}			
		
		db.executeStatement({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		}, {
			idUsuario: req
		});
	},
	deepQueryLOSSSCHEDULE: function (req, res) {
//USO DESCONTINUADO
		var sStatement =
			  'SELECT '
			  +'tblEmpresa."id_empresa" AS "tblEmpresa.id_empresa", '
			  +'tblEmpresa."nome" AS "tblEmpresa.nome", '
			  +'tblEmpresa."num_hfm_sap" AS "tblEmpresa.num_hfm_sap", '
			  +'tblEmpresa."tin" AS "tblEmpresa.tin",  '
			  +'tblEmpresa."jurisdicao_tin" AS "tblEmpresa.jurisdicao_tin",  '
			  +'tblEmpresa."ni" AS "tblEmpresa.ni", '
			  +'tblEmpresa."jurisdicao_ni" AS "tblEmpresa.jurisdicao_ni", '
			  +'tblEmpresa."endereco" AS "tblEmpresa.endereco", '
			  +'tblEmpresa."fy_start_date" AS "tblEmpresa.fy_start_date", '
			  +'tblEmpresa."fy_end_date" AS "tblEmpresa.fy_end_date", '
			  +'tblEmpresa."lbc_nome" AS "tblEmpresa.lbc_nome", '
			  +'tblEmpresa."lbc_email" AS "tblEmpresa.lbc_email", ' 
			  +'tblEmpresa."comentarios" AS "tblEmpresa.comentarios", '
			  +'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" AS "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario", '
			  +'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" AS "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status", '
			  +'tblEmpresa."fk_aliquota.id_aliquota" AS "tblEmpresa.fk_aliquota.id_aliquota", '
			  +'tblEmpresa."fk_pais.id_pais" AS "tblEmpresa.fk_pais.id_pais", '
			  +'tblTaxPackage."fk_empresa.id_empresa" AS "tblTaxPackage.fk_empresa.id_empresa", '
			  +'tblTaxPackage."fk_dominio_moeda.id_dominio_moeda" AS "tblTaxPackage.fk_dominio_moeda.id_dominio_moeda", '
			  +'tblTaxPackage."id_tax_package" AS "tblTaxPackage.id_tax_package", '
			  +'tblDominioMoeda."id_dominio_moeda" AS "tblDominioMoeda.id_dominio_moeda", '
			  +'tblDominioMoeda."acronimo" AS "tblDominioMoeda.acronimo", ' 
			  +'tblDominioMoeda."nome" AS "tblDominioMoeda.nome", '
			  +'tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" AS "tblRelTaxPackagePeriodo.id_rel_tax_package_periodo", '
			  +'tblRelTaxPackagePeriodo."fk_tax_package.id_tax_package" AS "tblRelTaxPackagePeriodo.fk_tax_package.id_tax_package", '
			  +'tblRelTaxPackagePeriodo."fk_periodo.id_periodo" AS "tblRelTaxPackagePeriodo.fk_periodo.id_periodo", '
			  +'tblRelTaxPackagePeriodo."ind_ativo" AS "tblRelTaxPackagePeriodo.ind_ativo", '
			  +'tblRelTaxPackagePeriodo."status_envio" AS "tblRelTaxPackagePeriodo.status_envio", '
			  +'tblRelTaxPackagePeriodo."data_envio" AS "tblRelTaxPackagePeriodo.data_envio", '
			  +'tblPeriodo."id_periodo" AS "tblPeriodo.id_periodo", '
			  +'tblPeriodo."periodo" AS "tblPeriodo.periodo", '
			  +'tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" AS "tblPeriodo.fk_dominio_ano_calendario.id_dominio_ano_calendario", '
			  +'tblPeriodo."fk_dominio_modulo.id_dominio_modulo" AS "tblPeriodo.fk_dominio_modulo.id_dominio_modulo", '
			  +'tblPeriodo."numero_ordem" AS "tblPeriodo.numero_ordem", '
			  +'tblDominioAnoCalendario."id_dominio_ano_calendario" AS "tblDominioAnoCalendario.id_dominio_ano_calendario", '
			  +'tblDominioAnoCalendario."ano_calendario" AS "tblDominioAnoCalendario.ano_calendario", '
			  +'tblDominioModulo."id_dominio_modulo" AS "tblDominioModulo.id_dominio_modulo", '
			  +'tblDominioModulo."modulo" AS "tblDominioModulo.modulo", '
			  +'tblSchedule."id_schedule" AS "tblSchedule.id_schedule", '
			  +'tblSchedule."fy" AS "tblSchedule.fy", '
			  +'tblSchedule."year_of_expiration" AS "tblSchedule.year_of_expiration", '
			  +'tblSchedule."opening_balance" AS "tblSchedule.opening_balance", '
			  +'tblSchedule."current_year_value" AS "tblSchedule.current_year_value", '
			  +'tblSchedule."current_year_value_utilized" AS "tblSchedule.current_year_value_utilized", '				  
			  +'tblSchedule."adjustments" AS "tblSchedule.adjustments", '
			  +'tblSchedule."justificativa" AS "tblSchedule.justificativa", '
			  +'tblSchedule."current_year_value_expired" AS "tblSchedule.current_year_value_expired", '
			  +'tblSchedule."closing_balance" AS "tblSchedule.closing_balance", '
			  +'tblSchedule."obs" AS "tblSchedule.obs", '
			  +'tblSchedule."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" AS "tblSchedule.fk_rel_tax_package_periodo.id_rel_tax_package_periodo", '
			  +'tblSchedule."fk_dominio_schedule_tipo.id_dominio_schedule_tipo" AS "tblSchedule.fk_dominio_schedule_tipo.id_dominio_schedule_tipo", '
			  +'tblSchedule."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" AS "tblSchedule.fk_dominio_ano_fiscal.id_dominio_ano_fiscal" '
			  +'FROM '
			  +'"VGT.EMPRESA" AS tblEmpresa '
			  +'INNER JOIN "VGT.TAX_PACKAGE" AS tblTaxPackage ON tblTaxPackage."fk_empresa.id_empresa" = tblEmpresa."id_empresa" '
			  +'LEFT OUTER JOIN "VGT.DOMINIO_MOEDA" AS tblDominioMoeda ON tblDominioMoeda."id_dominio_moeda" = tblTaxPackage."fk_dominio_moeda.id_dominio_moeda" '
			  +'INNER JOIN "VGT.REL_TAX_PACKAGE_PERIODO" AS tblRelTaxPackagePeriodo ON tblRelTaxPackagePeriodo."fk_tax_package.id_tax_package" = tblTaxPackage."id_tax_package" '
			  +'INNER JOIN "VGT.PERIODO" AS tblPeriodo ON tblRelTaxPackagePeriodo."fk_periodo.id_periodo" = tblPeriodo."id_periodo" '
			  +'INNER JOIN "VGT.DOMINIO_ANO_CALENDARIO" AS tblDominioAnoCalendario ON tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = tblDominioAnoCalendario."id_dominio_ano_calendario" '
			  +'INNER JOIN "VGT.DOMINIO_MODULO" AS tblDominioModulo ON tblPeriodo."fk_dominio_modulo.id_dominio_modulo" = tblDominioModulo."id_dominio_modulo" '
			  +'INNER JOIN "VGT.SCHEDULE" AS tblSchedule ON tblSchedule."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" '
			  +'INNER JOIN "VGT.DOMINIO_ANO_FISCAL" AS tblDominioAnoFiscal ON tblDominioAnoFiscal."id_dominio_ano_fiscal" = tblSchedule."fk_dominio_ano_fiscal.id_dominio_ano_fiscal"';


		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];

		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};

		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/ req.session.usuario.empresas.length > 0){
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
							filtro = ' tblPeriodo."numero_ordem" = ? ';		
							break;
						case 3:
							if(aEntrada[i][k] == ""){
								filtro = ' tblDominioMoeda."id_dominio_moeda" is null ';
							}
							else{
								filtro = ' tblDominioMoeda."id_dominio_moeda" = ? ';
							}
							break;
						case 4:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;	
					}
					if(aEntrada[i].length == 1){
						oWhere.push(filtro);
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}								
					}	 
					else{
						k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}
					}
				}	
			}
		}

		sStatement += " where"
			+' tblDominioAnoCalendario."ano_calendario" <= year(CURRENT_DATE) '
			+'AND tblDominioModulo."id_dominio_modulo" = 2 '
			+'AND tblSchedule."fk_dominio_schedule_tipo.id_dominio_schedule_tipo" = 1';
		
		if (oWhere.length > 0) {
			sStatement += ' AND ';
			
			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}

		sStatement +=' ORDER BY "tblEmpresa.id_empresa"';
		
		db.executeStatement({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		}, {
			idUsuario: req
		});
	},
	
	deepQueryDistinctLOSSSCHEDULE: function (req, res) {
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var stringDistinct = "";
		var stringDistinctFilter = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];
		
		if(aEntrada[6] == null || aEntrada[6] == undefined){
			stringDistinct = 'Select * from (';	
			stringDistinctFilter = 'order by "tblEmpresa.nome" asc, "tblDominioAnoCalendario.ano_calendario" desc, "tblPeriodo.numero_ordem" asc, "tblSchedule.fy" desc';
		}
		else{
			switch(aEntrada[6][0]){
				case "tblEmpresa.nome":
					stringDistinct = 'Select distinct "tblEmpresa.id_empresa" , "tblEmpresa.nome"  from (';
					break;
				case "tblDominioAnoCalendario.ano_calendario":
					stringDistinct = 'Select distinct "tblDominioAnoCalendario.id_dominio_ano_calendario" , "tblDominioAnoCalendario.ano_calendario" from (';
					stringDistinctFilter = 'order by "tblDominioAnoCalendario.ano_calendario"';					
					break;		
				case "tblPeriodo.id_periodo":
					stringDistinct = 'select distinct "tblPeriodo.numero_ordem" from (';
					break;	
				case "tblDominioMoeda.acronimo":
					stringDistinct = 'Select distinct "tblDominioMoeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome" from (';
					break;	
				case "tblSchedule.fy":
					stringDistinct = 'Select distinct "tblSchedule.fy" from (';
					stringDistinctFilter = 'order by "tblSchedule.fy" desc';					
					break;					
			}			
		}
		
		var sStatement = 
			stringDistinct
			  +'SELECT '
			  +'tblEmpresa."id_empresa" AS "tblEmpresa.id_empresa", '
			  +'tblEmpresa."nome" AS "tblEmpresa.nome", '
			  +'tblEmpresa."num_hfm_sap" AS "tblEmpresa.num_hfm_sap", '
			  +'tblEmpresa."tin" AS "tblEmpresa.tin",  '
			  +'tblEmpresa."jurisdicao_tin" AS "tblEmpresa.jurisdicao_tin",  '
			  +'tblEmpresa."ni" AS "tblEmpresa.ni", '
			  +'tblEmpresa."jurisdicao_ni" AS "tblEmpresa.jurisdicao_ni", '
			  +'tblEmpresa."endereco" AS "tblEmpresa.endereco", '
			  +'tblEmpresa."fy_start_date" AS "tblEmpresa.fy_start_date", '
			  +'tblEmpresa."fy_end_date" AS "tblEmpresa.fy_end_date", '
			  +'tblEmpresa."lbc_nome" AS "tblEmpresa.lbc_nome", '
			  +'tblEmpresa."lbc_email" AS "tblEmpresa.lbc_email", ' 
			  +'tblEmpresa."comentarios" AS "tblEmpresa.comentarios", '
			  +'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" AS "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario", '
			  +'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" AS "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status", '
			  +'tblEmpresa."fk_aliquota.id_aliquota" AS "tblEmpresa.fk_aliquota.id_aliquota", '
			  +'tblEmpresa."fk_pais.id_pais" AS "tblEmpresa.fk_pais.id_pais", '
			  +'tblTaxPackage."fk_empresa.id_empresa" AS "tblTaxPackage.fk_empresa.id_empresa", '
			  +'tblTaxPackage."fk_dominio_moeda.id_dominio_moeda" AS "tblTaxPackage.fk_dominio_moeda.id_dominio_moeda", '
			  +'tblTaxPackage."id_tax_package" AS "tblTaxPackage.id_tax_package", '
			  +'tblDominioMoeda."id_dominio_moeda" AS "tblDominioMoeda.id_dominio_moeda", '
			  +'tblDominioMoeda."acronimo" AS "tblDominioMoeda.acronimo", ' 
			  +'tblDominioMoeda."nome" AS "tblDominioMoeda.nome", '
			  +'tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" AS "tblRelTaxPackagePeriodo.id_rel_tax_package_periodo", '
			  +'tblRelTaxPackagePeriodo."fk_tax_package.id_tax_package" AS "tblRelTaxPackagePeriodo.fk_tax_package.id_tax_package", '
			  +'tblRelTaxPackagePeriodo."fk_periodo.id_periodo" AS "tblRelTaxPackagePeriodo.fk_periodo.id_periodo", '
			  +'tblRelTaxPackagePeriodo."ind_ativo" AS "tblRelTaxPackagePeriodo.ind_ativo", '
			  +'tblRelTaxPackagePeriodo."status_envio" AS "tblRelTaxPackagePeriodo.status_envio", '
			  +'tblRelTaxPackagePeriodo."data_envio" AS "tblRelTaxPackagePeriodo.data_envio", '
			  +'tblPeriodo."id_periodo" AS "tblPeriodo.id_periodo", '
			  +'tblPeriodo."periodo" AS "tblPeriodo.periodo", '
			  +'tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" AS "tblPeriodo.fk_dominio_ano_calendario.id_dominio_ano_calendario", '
			  +'tblPeriodo."fk_dominio_modulo.id_dominio_modulo" AS "tblPeriodo.fk_dominio_modulo.id_dominio_modulo", '
			  +'tblPeriodo."numero_ordem" AS "tblPeriodo.numero_ordem", '
			  +'tblDominioAnoCalendario."id_dominio_ano_calendario" AS "tblDominioAnoCalendario.id_dominio_ano_calendario", '
			  +'tblDominioAnoCalendario."ano_calendario" AS "tblDominioAnoCalendario.ano_calendario", '
			  +'tblDominioModulo."id_dominio_modulo" AS "tblDominioModulo.id_dominio_modulo", '
			  +'tblDominioModulo."modulo" AS "tblDominioModulo.modulo", '
			  +'tblSchedule."id_schedule" AS "tblSchedule.id_schedule", '
			  +'tblSchedule."fy" AS "tblSchedule.fy", '
			  +'tblSchedule."year_of_expiration" AS "tblSchedule.year_of_expiration", '
			  +'tblSchedule."opening_balance" AS "tblSchedule.opening_balance", '
			  +'tblSchedule."current_year_value" AS "tblSchedule.current_year_value", '
			  +'tblSchedule."current_year_value_utilized" AS "tblSchedule.current_year_value_utilized", '			  
			  +'tblSchedule."adjustments" AS "tblSchedule.adjustments", '
			  +'tblSchedule."justificativa" AS "tblSchedule.justificativa", '
			  +'tblSchedule."current_year_value_expired" AS "tblSchedule.current_year_value_expired", '
			  +'tblSchedule."closing_balance" AS "tblSchedule.closing_balance", '
			  +'tblSchedule."obs" AS "tblSchedule.obs", '
			  +'tblSchedule."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" AS "tblSchedule.fk_rel_tax_package_periodo.id_rel_tax_package_periodo", '
			  +'tblSchedule."fk_dominio_schedule_tipo.id_dominio_schedule_tipo" AS "tblSchedule.fk_dominio_schedule_tipo.id_dominio_schedule_tipo", '
			  +'tblSchedule."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" AS "tblSchedule.fk_dominio_ano_fiscal.id_dominio_ano_fiscal" '
			  +'FROM '
			  +'"VGT.EMPRESA" AS tblEmpresa '
			  +'INNER JOIN "VGT.TAX_PACKAGE" AS tblTaxPackage ON tblTaxPackage."fk_empresa.id_empresa" = tblEmpresa."id_empresa" '
			  +'LEFT OUTER JOIN "VGT.DOMINIO_MOEDA" AS tblDominioMoeda ON tblDominioMoeda."id_dominio_moeda" = tblTaxPackage."fk_dominio_moeda.id_dominio_moeda" '
			  +'INNER JOIN "VGT.REL_TAX_PACKAGE_PERIODO" AS tblRelTaxPackagePeriodo ON tblRelTaxPackagePeriodo."fk_tax_package.id_tax_package" = tblTaxPackage."id_tax_package" '
			  +'INNER JOIN "VGT.PERIODO" AS tblPeriodo ON tblRelTaxPackagePeriodo."fk_periodo.id_periodo" = tblPeriodo."id_periodo" '
			  +'INNER JOIN "VGT.DOMINIO_ANO_CALENDARIO" AS tblDominioAnoCalendario ON tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = tblDominioAnoCalendario."id_dominio_ano_calendario" '
			  +'INNER JOIN "VGT.DOMINIO_MODULO" AS tblDominioModulo ON tblPeriodo."fk_dominio_modulo.id_dominio_modulo" = tblDominioModulo."id_dominio_modulo" '
			  +'INNER JOIN "VGT.SCHEDULE" AS tblSchedule ON tblSchedule."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" '
			  +'INNER JOIN "VGT.DOMINIO_ANO_FISCAL" AS tblDominioAnoFiscal ON tblDominioAnoFiscal."id_dominio_ano_fiscal" = tblSchedule."fk_dominio_ano_fiscal.id_dominio_ano_fiscal"';

		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};

		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/ req.session.usuario.empresas.length > 0){
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
							//filtro = ' tblPeriodo."id_periodo" = ? ';
							filtro = ' tblPeriodo."numero_ordem" = ? ';
							break;
						case 3:
							if(aEntrada[i][k] == ""){
								filtro = ' tblDominioMoeda."id_dominio_moeda" is null ';
							}
							else{
								filtro = ' tblDominioMoeda."id_dominio_moeda" = ? ';
							}
							break;			
						case 4:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;	
						case 5:
							filtro = ' tblSchedule."fy" = ? ';
							break;								
					}
					if(aEntrada[i].length == 1){
						oWhere.push(filtro);
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}								
					}	 
					else{
						k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}	
					}	
				}	
			}
		}
		sStatement += " where"
			+' tblDominioAnoCalendario."ano_calendario" <= year(CURRENT_DATE) '
			+'AND tblDominioModulo."id_dominio_modulo" = 2 '
			+'AND tblSchedule."fk_dominio_schedule_tipo.id_dominio_schedule_tipo" = 1';
		
		if (oWhere.length > 0) {
			sStatement += ' AND ';
			
			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}

		sStatement += ") " + stringDistinctFilter;
		
		db.executeStatement({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		}, {
			idUsuario: req
		});
	},
	deepQueryDistinctCREDITSCHEDULE: function (req, res) {
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var stringDistinct = "";
		var stringDistinctFilter = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];
		
		if(aEntrada[6] == null || aEntrada[6] == undefined){
			stringDistinct = 'Select * from (';	
			stringDistinctFilter = 'order by "tblEmpresa.nome" asc, "tblDominioAnoCalendario.ano_calendario" desc, "tblPeriodo.numero_ordem" asc, "tblSchedule.fy" desc';
		}
		else{
			switch(aEntrada[6][0]){
				case "tblEmpresa.nome":
					stringDistinct = 'Select distinct "tblEmpresa.id_empresa" , "tblEmpresa.nome"  from (';
					break;
				case "tblDominioAnoCalendario.ano_calendario":
					stringDistinct = 'Select distinct "tblDominioAnoCalendario.id_dominio_ano_calendario" , "tblDominioAnoCalendario.ano_calendario" from (';
					stringDistinctFilter = 'order by "tblDominioAnoCalendario.ano_calendario"';					
					break;		
				case "tblPeriodo.id_periodo":
					stringDistinct = 'select distinct "tblPeriodo.numero_ordem" from (';
					break;	
				case "tblDominioMoeda.acronimo":
					stringDistinct = 'Select distinct "tblDominioMoeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome" from (';
					break;	
				case "tblSchedule.fy":
					stringDistinct = 'Select distinct "tblSchedule.fy" from (';
					stringDistinctFilter = 'order by "tblSchedule.fy" desc';					
					break;						
			}			
		}

		
		var sStatement = 
			stringDistinct
			  +'SELECT '
			  +'tblEmpresa."id_empresa" AS "tblEmpresa.id_empresa", '
			  +'tblEmpresa."nome" AS "tblEmpresa.nome", '
			  +'tblEmpresa."num_hfm_sap" AS "tblEmpresa.num_hfm_sap", '
			  +'tblEmpresa."tin" AS "tblEmpresa.tin",  '
			  +'tblEmpresa."jurisdicao_tin" AS "tblEmpresa.jurisdicao_tin",  '
			  +'tblEmpresa."ni" AS "tblEmpresa.ni", '
			  +'tblEmpresa."jurisdicao_ni" AS "tblEmpresa.jurisdicao_ni", '
			  +'tblEmpresa."endereco" AS "tblEmpresa.endereco", '
			  +'tblEmpresa."fy_start_date" AS "tblEmpresa.fy_start_date", '
			  +'tblEmpresa."fy_end_date" AS "tblEmpresa.fy_end_date", '
			  +'tblEmpresa."lbc_nome" AS "tblEmpresa.lbc_nome", '
			  +'tblEmpresa."lbc_email" AS "tblEmpresa.lbc_email", ' 
			  +'tblEmpresa."comentarios" AS "tblEmpresa.comentarios", '
			  +'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" AS "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario", '
			  +'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" AS "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status", '
			  +'tblEmpresa."fk_aliquota.id_aliquota" AS "tblEmpresa.fk_aliquota.id_aliquota", '
			  +'tblEmpresa."fk_pais.id_pais" AS "tblEmpresa.fk_pais.id_pais", '
			  +'tblTaxPackage."fk_empresa.id_empresa" AS "tblTaxPackage.fk_empresa.id_empresa", '
			  +'tblTaxPackage."fk_dominio_moeda.id_dominio_moeda" AS "tblTaxPackage.fk_dominio_moeda.id_dominio_moeda", '
			  +'tblTaxPackage."id_tax_package" AS "tblTaxPackage.id_tax_package", '
			  +'tblDominioMoeda."id_dominio_moeda" AS "tblDominioMoeda.id_dominio_moeda", '
			  +'tblDominioMoeda."acronimo" AS "tblDominioMoeda.acronimo", ' 
			  +'tblDominioMoeda."nome" AS "tblDominioMoeda.nome", '
			  +'tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" AS "tblRelTaxPackagePeriodo.id_rel_tax_package_periodo", '
			  +'tblRelTaxPackagePeriodo."fk_tax_package.id_tax_package" AS "tblRelTaxPackagePeriodo.fk_tax_package.id_tax_package", '
			  +'tblRelTaxPackagePeriodo."fk_periodo.id_periodo" AS "tblRelTaxPackagePeriodo.fk_periodo.id_periodo", '
			  +'tblRelTaxPackagePeriodo."ind_ativo" AS "tblRelTaxPackagePeriodo.ind_ativo", '
			  +'tblRelTaxPackagePeriodo."status_envio" AS "tblRelTaxPackagePeriodo.status_envio", '
			  +'tblRelTaxPackagePeriodo."data_envio" AS "tblRelTaxPackagePeriodo.data_envio", '
			  +'tblPeriodo."id_periodo" AS "tblPeriodo.id_periodo", '
			  +'tblPeriodo."periodo" AS "tblPeriodo.periodo", '
			  +'tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" AS "tblPeriodo.fk_dominio_ano_calendario.id_dominio_ano_calendario", '
			  +'tblPeriodo."fk_dominio_modulo.id_dominio_modulo" AS "tblPeriodo.fk_dominio_modulo.id_dominio_modulo", '
			  +'tblPeriodo."numero_ordem" AS "tblPeriodo.numero_ordem", '
			  +'tblDominioAnoCalendario."id_dominio_ano_calendario" AS "tblDominioAnoCalendario.id_dominio_ano_calendario", '
			  +'tblDominioAnoCalendario."ano_calendario" AS "tblDominioAnoCalendario.ano_calendario", '
			  +'tblDominioModulo."id_dominio_modulo" AS "tblDominioModulo.id_dominio_modulo", '
			  +'tblDominioModulo."modulo" AS "tblDominioModulo.modulo", '
			  +'tblSchedule."id_schedule" AS "tblSchedule.id_schedule", '
			  +'tblSchedule."fy" AS "tblSchedule.fy", '
			  +'tblSchedule."year_of_expiration" AS "tblSchedule.year_of_expiration", '
			  +'tblSchedule."opening_balance" AS "tblSchedule.opening_balance", '
			  +'tblSchedule."current_year_value" AS "tblSchedule.current_year_value", '
			  +'tblSchedule."current_year_value_utilized" AS "tblSchedule.current_year_value_utilized", '			  
			  +'tblSchedule."adjustments" AS "tblSchedule.adjustments", '
			  +'tblSchedule."justificativa" AS "tblSchedule.justificativa", '
			  +'tblSchedule."current_year_value_expired" AS "tblSchedule.current_year_value_expired", '
			  +'tblSchedule."closing_balance" AS "tblSchedule.closing_balance", '
			  +'tblSchedule."obs" AS "tblSchedule.obs", '
			  +'tblSchedule."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" AS "tblSchedule.fk_rel_tax_package_periodo.id_rel_tax_package_periodo", '
			  +'tblSchedule."fk_dominio_schedule_tipo.id_dominio_schedule_tipo" AS "tblSchedule.fk_dominio_schedule_tipo.id_dominio_schedule_tipo", '
			  +'tblSchedule."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" AS "tblSchedule.fk_dominio_ano_fiscal.id_dominio_ano_fiscal" '
			  +'FROM '
			  +'"VGT.EMPRESA" AS tblEmpresa '
			  +'INNER JOIN "VGT.TAX_PACKAGE" AS tblTaxPackage ON tblTaxPackage."fk_empresa.id_empresa" = tblEmpresa."id_empresa" '
			  +'LEFT OUTER JOIN "VGT.DOMINIO_MOEDA" AS tblDominioMoeda ON tblDominioMoeda."id_dominio_moeda" = tblTaxPackage."fk_dominio_moeda.id_dominio_moeda" '
			  +'INNER JOIN "VGT.REL_TAX_PACKAGE_PERIODO" AS tblRelTaxPackagePeriodo ON tblRelTaxPackagePeriodo."fk_tax_package.id_tax_package" = tblTaxPackage."id_tax_package" '
			  +'INNER JOIN "VGT.PERIODO" AS tblPeriodo ON tblRelTaxPackagePeriodo."fk_periodo.id_periodo" = tblPeriodo."id_periodo" '
			  +'INNER JOIN "VGT.DOMINIO_ANO_CALENDARIO" AS tblDominioAnoCalendario ON tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = tblDominioAnoCalendario."id_dominio_ano_calendario" '
			  +'INNER JOIN "VGT.DOMINIO_MODULO" AS tblDominioModulo ON tblPeriodo."fk_dominio_modulo.id_dominio_modulo" = tblDominioModulo."id_dominio_modulo" '
			  +'INNER JOIN "VGT.SCHEDULE" AS tblSchedule ON tblSchedule."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" '
			  +'INNER JOIN "VGT.DOMINIO_ANO_FISCAL" AS tblDominioAnoFiscal ON tblDominioAnoFiscal."id_dominio_ano_fiscal" = tblSchedule."fk_dominio_ano_fiscal.id_dominio_ano_fiscal"';

		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};

		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/ req.session.usuario.empresas.length > 0){
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
							//filtro = ' tblPeriodo."id_periodo" = ? ';
							filtro = ' tblPeriodo."numero_ordem" = ? ';
							break;
						case 3:
							if(aEntrada[i][k] == ""){
								filtro = ' tblDominioMoeda."id_dominio_moeda" is null ';
							}
							else{
								filtro = ' tblDominioMoeda."id_dominio_moeda" = ? ';
							}
							break;			
						case 4:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;	
						case 5:
							filtro = ' tblSchedule."fy" = ? ';
							break;								
					}
					if(aEntrada[i].length == 1){
						oWhere.push(filtro);
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}									
					}	 
					else{
						k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}	
					}	
				}	
			}
		}
		sStatement += " where"
			+' tblDominioAnoCalendario."ano_calendario" <= year(CURRENT_DATE) '
			+'AND tblDominioModulo."id_dominio_modulo" = 2 '
			+'AND tblSchedule."fk_dominio_schedule_tipo.id_dominio_schedule_tipo" = 2';
		
		if (oWhere.length > 0) {
			sStatement += ' AND ';
			
			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}

		sStatement += ") " + stringDistinctFilter;
		
		db.executeStatement({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		}, {
			idUsuario: req
		});
	},
	deepQueryDistinctAccountingResult: function (req, res) {
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var stringDistinct = "";
		var stringDistinctFilter = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];
		
		if(aEntrada[5] == null || aEntrada[5] == undefined){
			stringDistinct = 'Select * from (';	
			stringDistinctFilter = 'order by "tblEmpresa.nome" asc, "tblDominioAnoCalendario.ano_calendario" desc, "tblPeriodo.numero_ordem" asc';
		}
		else{
			switch(aEntrada[5][0]){
				case "tblEmpresa.nome":
					stringDistinct = 'Select distinct "tblEmpresa.id_empresa" , "tblEmpresa.nome"  from (';
					break;
				case "tblDominioAnoCalendario.ano_calendario":
					stringDistinct = 'Select distinct "tblDominioAnoCalendario.id_dominio_ano_calendario" , "tblDominioAnoCalendario.ano_calendario" from (';
					stringDistinctFilter = 'order by "tblDominioAnoCalendario.ano_calendario"';
					break;		
				case "tblPeriodo.id_periodo":
					stringDistinct = 'select distinct "tblPeriodo.numero_ordem" from (';
					break;	
				case "tblDominioMoeda.acronimo":
					stringDistinct = 'Select distinct "tblDominioMoeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome" from (';
					break;	
			}			
		}

		
		var sStatement = 
			stringDistinct 
			+'SELECT tblEmpresa."id_empresa" AS "tblEmpresa.id_empresa", '
			+'tblEmpresa."nome" AS "tblEmpresa.nome", '
			+'tblEmpresa."num_hfm_sap" AS "tblEmpresa.num_hfm_sap", '
			+'tblEmpresa."tin" AS "tblEmpresa.tin", '
			+'tblEmpresa."jurisdicao_tin" AS "tblEmpresa.jurisdicao_tin", '
			+'tblEmpresa."ni" AS "tblEmpresa.ni", '
			+'tblEmpresa."jurisdicao_ni" AS "tblEmpresa.jurisdicao_ni", '
			+'tblEmpresa."endereco" AS "tblEmpresa.endereco", '
			+'tblEmpresa."fy_start_date" AS "tblEmpresa.fy_start_date", '
			+'tblEmpresa."fy_end_date" AS "tblEmpresa.fy_end_date", '
			+'tblEmpresa."lbc_nome" AS "tblEmpresa.lbc_nome", '
			+'tblEmpresa."lbc_email" AS "tblEmpresa.lbc_email", '
			+'tblEmpresa."comentarios" AS "tblEmpresa.comentarios", '
			+'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" AS "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario", '
			+'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" AS "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status", '
			+'tblEmpresa."fk_aliquota.id_aliquota" AS "tblEmpresa.fk_aliquota.id_aliquota", '
			+'tblEmpresa."fk_pais.id_pais" AS "tblEmpresa.fk_pais.id_pais", '
			+'tblTaxPackage."fk_empresa.id_empresa" AS "tblTaxPackage.fk_empresa.id_empresa", '
			+'tblTaxPackage."fk_dominio_moeda.id_dominio_moeda" AS "tblTaxPackage.fk_dominio_moeda.id_dominio_moeda", '
			+'tblTaxPackage."id_tax_package" AS "tblTaxPackage.id_tax_package", '
			+'tblDominioMoeda."id_dominio_moeda" AS "tblDominioMoeda.id_dominio_moeda", '
			+'tblDominioMoeda."acronimo" AS "tblDominioMoeda.acronimo", '
			+'tblDominioMoeda."nome" AS "tblDominioMoeda.nome", '
			+'tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" AS "tblRelTaxPackagePeriodo.id_rel_tax_package_periodo", '
			+'tblRelTaxPackagePeriodo."fk_tax_package.id_tax_package" AS "tblRelTaxPackagePeriodo.fk_tax_package.id_tax_package", '
			+'tblRelTaxPackagePeriodo."fk_periodo.id_periodo" AS "tblRelTaxPackagePeriodo.fk_periodo.id_periodo", '
			+'tblRelTaxPackagePeriodo."ind_ativo" AS "tblRelTaxPackagePeriodo.ind_ativo", '
			+'tblRelTaxPackagePeriodo."status_envio" AS "tblRelTaxPackagePeriodo.status_envio", '
			+'tblRelTaxPackagePeriodo."data_envio" AS "tblRelTaxPackagePeriodo.data_envio", '
			+'tblPeriodo."id_periodo" AS "tblPeriodo.id_periodo", '
			+'tblPeriodo."periodo" AS "tblPeriodo.periodo", '
			+'tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" AS "tblPeriodo.fk_dominio_ano_calendario.id_dominio_ano_calendario", '
			+'tblPeriodo."fk_dominio_modulo.id_dominio_modulo" AS "tblPeriodo.fk_dominio_modulo.id_dominio_modulo", '
			+'tblPeriodo."numero_ordem" AS "tblPeriodo.numero_ordem", '
			+'tblDominioAnoCalendario."id_dominio_ano_calendario" AS "tblDominioAnoCalendario.id_dominio_ano_calendario", '
			+'tblDominioAnoCalendario."ano_calendario" AS "tblDominioAnoCalendario.ano_calendario", '
			+'tblDominioModulo."id_dominio_modulo" AS "tblDominioModulo.id_dominio_modulo", '
			+'tblDominioModulo."modulo" AS "tblDominioModulo.modulo", '
			+'tblTaxReconciliation."rc_statutory_gaap_profit_loss_before_tax" AS "tblTaxReconciliation.rc_statutory_gaap_profit_loss_before_tax", '
			+'tblTaxReconciliation."rc_current_income_tax_current_year" AS "tblTaxReconciliation.rc_current_income_tax_current_year", '
			+'tblTaxReconciliation."rc_current_income_tax_previous_year" AS "tblTaxReconciliation.rc_current_income_tax_previous_year", '
			+'tblTaxReconciliation."rc_deferred_income_tax" AS "tblTaxReconciliation.rc_deferred_income_tax", '
			+'tblTaxReconciliation."rc_non_recoverable_wht" AS "tblTaxReconciliation.rc_non_recoverable_wht", '
			+'tblTaxReconciliation."rc_statutory_provision_for_income_tax" AS "tblTaxReconciliation.rc_statutory_provision_for_income_tax", '
			+'tblTaxReconciliation."rc_statutory_gaap_profit_loss_after_tax" AS "tblTaxReconciliation.rc_statutory_gaap_profit_loss_after_tax" '
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
			+'INNER JOIN "VGT.TAX_RECONCILIATION" AS tblTaxReconciliation '
			+'ON tblTaxReconciliation."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" ';


		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};

		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/ req.session.usuario.empresas.length > 0){
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
							//filtro = ' tblPeriodo."id_periodo" = ? ';
							filtro = ' tblPeriodo."numero_ordem" = ? ';
							break;
						case 3:
							if(aEntrada[i][k] == ""){
								filtro = ' tblDominioMoeda."id_dominio_moeda" is null ';
							}
							else{
								filtro = ' tblDominioMoeda."id_dominio_moeda" = ? ';
							}
							break;			
						case 4:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;	
					}
					if(aEntrada[i].length == 1){
						oWhere.push(filtro);
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}								
					}	 
					else{
						k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}
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

		sStatement += ") " + stringDistinctFilter;
		
		db.executeStatement({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		}, {
			idUsuario: req
		});
	},
	deepQueryDistinctFiscalResult: function (req, res) {
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var stringDistinct = "";
		var stringDistinctFilter = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];
		
		if(aEntrada[5] == null || aEntrada[5] == undefined){
			stringDistinct = 'Select * from (';	
			stringDistinctFilter = 'order by "tblEmpresa.nome" asc, "tblDominioAnoCalendario.ano_calendario" desc, "tblPeriodo.numero_ordem" asc';
		}
		else{
			switch(aEntrada[5][0]){
				case "tblEmpresa.nome":
					stringDistinct = 'Select distinct "tblEmpresa.id_empresa" , "tblEmpresa.nome"  from (';
					break;
				case "tblDominioAnoCalendario.ano_calendario":
					stringDistinct = 'Select distinct "tblDominioAnoCalendario.id_dominio_ano_calendario" , "tblDominioAnoCalendario.ano_calendario" from (';
					stringDistinctFilter = 'order by "tblDominioAnoCalendario.ano_calendario"';
					break;		
				case "tblPeriodo.id_periodo":
					stringDistinct = 'select distinct "tblPeriodo.numero_ordem" from (';
					break;	
				case "tblDominioMoeda.acronimo":
					stringDistinct = 'Select distinct "tblDominioMoeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome" from (';
					break;	
			}			
		}

		
		var sStatement = 
			stringDistinct 
			+'SELECT tblEmpresa."id_empresa" AS "tblEmpresa.id_empresa", '
			+'tblEmpresa."nome" AS "tblEmpresa.nome", '
			+'tblEmpresa."num_hfm_sap" AS "tblEmpresa.num_hfm_sap", '
			+'tblEmpresa."tin" AS "tblEmpresa.tin", '
			+'tblEmpresa."jurisdicao_tin" AS "tblEmpresa.jurisdicao_tin", '
			+'tblEmpresa."ni" AS "tblEmpresa.ni", '
			+'tblEmpresa."jurisdicao_ni" AS "tblEmpresa.jurisdicao_ni", '
			+'tblEmpresa."endereco" AS "tblEmpresa.endereco", '
			+'tblEmpresa."fy_start_date" AS "tblEmpresa.fy_start_date", '
			+'tblEmpresa."fy_end_date" AS "tblEmpresa.fy_end_date", '
			+'tblEmpresa."lbc_nome" AS "tblEmpresa.lbc_nome", '
			+'tblEmpresa."lbc_email" AS "tblEmpresa.lbc_email", '
			+'tblEmpresa."comentarios" AS "tblEmpresa.comentarios", '
			+'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" AS "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario", '
			+'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" AS "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status", '
			+'tblEmpresa."fk_aliquota.id_aliquota" AS "tblEmpresa.fk_aliquota.id_aliquota", '
			+'tblEmpresa."fk_pais.id_pais" AS "tblEmpresa.fk_pais.id_pais", '
			+'tblTaxPackage."fk_empresa.id_empresa" AS "tblTaxPackage.fk_empresa.id_empresa", '
			+'tblTaxPackage."fk_dominio_moeda.id_dominio_moeda" AS "tblTaxPackage.fk_dominio_moeda.id_dominio_moeda", '
			+'tblTaxPackage."id_tax_package" AS "tblTaxPackage.id_tax_package", '
			+'tblDominioMoeda."id_dominio_moeda" AS "tblDominioMoeda.id_dominio_moeda", '
			+'tblDominioMoeda."acronimo" AS "tblDominioMoeda.acronimo", '
			+'tblDominioMoeda."nome" AS "tblDominioMoeda.nome", '
			+'tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" AS "tblRelTaxPackagePeriodo.id_rel_tax_package_periodo", '
			+'tblRelTaxPackagePeriodo."fk_tax_package.id_tax_package" AS "tblRelTaxPackagePeriodo.fk_tax_package.id_tax_package", '
			+'tblRelTaxPackagePeriodo."fk_periodo.id_periodo" AS "tblRelTaxPackagePeriodo.fk_periodo.id_periodo", '
			+'tblRelTaxPackagePeriodo."ind_ativo" AS "tblRelTaxPackagePeriodo.ind_ativo", '
			+'tblRelTaxPackagePeriodo."status_envio" AS "tblRelTaxPackagePeriodo.status_envio", '
			+'tblRelTaxPackagePeriodo."data_envio" AS "tblRelTaxPackagePeriodo.data_envio", '
			+'tblPeriodo."id_periodo" AS "tblPeriodo.id_periodo", '
			+'tblPeriodo."periodo" AS "tblPeriodo.periodo", '
			+'tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" AS "tblPeriodo.fk_dominio_ano_calendario.id_dominio_ano_calendario", '
			+'tblPeriodo."fk_dominio_modulo.id_dominio_modulo" AS "tblPeriodo.fk_dominio_modulo.id_dominio_modulo", '
			+'tblPeriodo."numero_ordem" AS "tblPeriodo.numero_ordem", '
			+'tblDominioAnoCalendario."id_dominio_ano_calendario" AS "tblDominioAnoCalendario.id_dominio_ano_calendario", '
			+'tblDominioAnoCalendario."ano_calendario" AS "tblDominioAnoCalendario.ano_calendario", '
			+'tblDominioModulo."id_dominio_modulo" AS "tblDominioModulo.id_dominio_modulo", '
			+'tblDominioModulo."modulo" AS "tblDominioModulo.modulo", '
			+'tblTaxReconciliation."rf_taxable_income_loss_before_losses_and_tax_credits" AS "tblTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits", '
			+'tblTaxReconciliation."rf_total_losses_utilized" AS "tblTaxReconciliation.rf_total_losses_utilized", '
			+'tblTaxReconciliation."rf_taxable_income_loss_after_losses" AS "tblTaxReconciliation.rf_taxable_income_loss_after_losses", '
			+'tblTaxReconciliation."rf_income_tax_before_other_taxes_and_credits" AS "tblTaxReconciliation.rf_income_tax_before_other_taxes_and_credits", '
			+'tblTaxReconciliation."rf_other_taxes" AS "tblTaxReconciliation.rf_other_taxes", '
			+'tblTaxReconciliation."rf_incentivos_fiscais" AS "tblTaxReconciliation.rf_incentivos_fiscais", '
			+'tblTaxReconciliation."rf_total_other_taxes_and_tax_credits" AS "tblTaxReconciliation.rf_total_other_taxes_and_tax_credits", '
			+'tblTaxReconciliation."rf_net_local_tax" AS "tblTaxReconciliation.rf_net_local_tax", '
			+'tblTaxReconciliation."rf_wht" AS "tblTaxReconciliation.rf_wht", '
			+'tblTaxReconciliation."rf_overpayment_from_prior_year_applied_to_current_year" AS "tblTaxReconciliation.rf_overpayment_from_prior_year_applied_to_current_year", '
			+'tblTaxReconciliation."rf_total_interim_taxes_payments_antecipacoes" AS "tblTaxReconciliation.rf_total_interim_taxes_payments_antecipacoes", '
			+'tblTaxReconciliation."rf_tax_due_overpaid" AS "tblTaxReconciliation.rf_tax_due_overpaid" '
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
			+'INNER JOIN "VGT.TAX_RECONCILIATION" AS tblTaxReconciliation '
			+'ON tblTaxReconciliation."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" ';


		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};

		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/ req.session.usuario.empresas.length > 0){
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
							//filtro = ' tblPeriodo."id_periodo" = ? ';
							filtro = ' tblPeriodo."numero_ordem" = ? ';
							break;
						case 3:
							if(aEntrada[i][k] == ""){
								filtro = ' tblDominioMoeda."id_dominio_moeda" is null ';
							}
							else{
								filtro = ' tblDominioMoeda."id_dominio_moeda" = ? ';
							}
							break;			
						case 4:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;	
					}
					if(aEntrada[i].length == 1){
						oWhere.push(filtro);
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}								
					}	 
					else{
						k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}
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

		sStatement += ") " + stringDistinctFilter;
		
		db.executeStatement({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		}, {
			idUsuario: req
		});
	},
	deepQueryDistinctIncomeTax: function (req, res) {
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var stringDistinct = "";
		var stringDistinctFilter = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];
		
		if(aEntrada[5] == null || aEntrada[5] == undefined){
			stringDistinct = 'Select * from (';	
			stringDistinctFilter = 'order by "tblEmpresa.nome" asc, "tblDominioAnoCalendario.ano_calendario" desc, "tblPeriodo.numero_ordem" asc';
		}
		else{
			switch(aEntrada[5][0]){
				case "tblEmpresa.nome":
					stringDistinct = 'Select distinct "tblEmpresa.id_empresa" , "tblEmpresa.nome"  from (';
					break;
				case "tblDominioAnoCalendario.ano_calendario":
					stringDistinct = 'Select distinct "tblDominioAnoCalendario.id_dominio_ano_calendario" , "tblDominioAnoCalendario.ano_calendario" from (';
					stringDistinctFilter = 'order by "tblDominioAnoCalendario.ano_calendario"';
					break;		
				case "tblPeriodo.id_periodo":
					stringDistinct = 'select distinct "tblPeriodo.numero_ordem" from (';
					break;	
				case "tblDominioMoeda.acronimo":
					stringDistinct = 'Select distinct "tblDominioMoeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome" from (';
					break;	
			}			
		}

		
		var sStatement = 
			stringDistinct 
			+'SELECT tblEmpresa."id_empresa" AS "tblEmpresa.id_empresa", '
			+'tblEmpresa."nome" AS "tblEmpresa.nome", '
			+'tblEmpresa."num_hfm_sap" AS "tblEmpresa.num_hfm_sap", '
			+'tblEmpresa."tin" AS "tblEmpresa.tin", '
			+'tblEmpresa."jurisdicao_tin" AS "tblEmpresa.jurisdicao_tin", '
			+'tblEmpresa."ni" AS "tblEmpresa.ni", '
			+'tblEmpresa."jurisdicao_ni" AS "tblEmpresa.jurisdicao_ni", '
			+'tblEmpresa."endereco" AS "tblEmpresa.endereco", '
			+'tblEmpresa."fy_start_date" AS "tblEmpresa.fy_start_date", '
			+'tblEmpresa."fy_end_date" AS "tblEmpresa.fy_end_date", '
			+'tblEmpresa."lbc_nome" AS "tblEmpresa.lbc_nome", '
			+'tblEmpresa."lbc_email" AS "tblEmpresa.lbc_email", '
			+'tblEmpresa."comentarios" AS "tblEmpresa.comentarios", '
			+'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" AS "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario", '
			+'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" AS "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status", '
			+'tblEmpresa."fk_aliquota.id_aliquota" AS "tblEmpresa.fk_aliquota.id_aliquota", '
			+'tblEmpresa."fk_pais.id_pais" AS "tblEmpresa.fk_pais.id_pais", '
			+'tblTaxPackage."fk_empresa.id_empresa" AS "tblTaxPackage.fk_empresa.id_empresa", '
			+'tblTaxPackage."fk_dominio_moeda.id_dominio_moeda" AS "tblTaxPackage.fk_dominio_moeda.id_dominio_moeda", '
			+'tblTaxPackage."id_tax_package" AS "tblTaxPackage.id_tax_package", '
			+'tblDominioMoeda."id_dominio_moeda" AS "tblDominioMoeda.id_dominio_moeda", '
			+'tblDominioMoeda."acronimo" AS "tblDominioMoeda.acronimo", '
			+'tblDominioMoeda."nome" AS "tblDominioMoeda.nome", '
			+'tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" AS "tblRelTaxPackagePeriodo.id_rel_tax_package_periodo", '
			+'tblRelTaxPackagePeriodo."fk_tax_package.id_tax_package" AS "tblRelTaxPackagePeriodo.fk_tax_package.id_tax_package", '
			+'tblRelTaxPackagePeriodo."fk_periodo.id_periodo" AS "tblRelTaxPackagePeriodo.fk_periodo.id_periodo", '
			+'tblRelTaxPackagePeriodo."ind_ativo" AS "tblRelTaxPackagePeriodo.ind_ativo", '
			+'tblRelTaxPackagePeriodo."status_envio" AS "tblRelTaxPackagePeriodo.status_envio", '
			+'tblRelTaxPackagePeriodo."data_envio" AS "tblRelTaxPackagePeriodo.data_envio", '
			+'tblPeriodo."id_periodo" AS "tblPeriodo.id_periodo", '
			+'tblPeriodo."periodo" AS "tblPeriodo.periodo", '
			+'tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" AS "tblPeriodo.fk_dominio_ano_calendario.id_dominio_ano_calendario", '
			+'tblPeriodo."fk_dominio_modulo.id_dominio_modulo" AS "tblPeriodo.fk_dominio_modulo.id_dominio_modulo", '
			+'tblPeriodo."numero_ordem" AS "tblPeriodo.numero_ordem", '
			+'tblDominioAnoCalendario."id_dominio_ano_calendario" AS "tblDominioAnoCalendario.id_dominio_ano_calendario", '
			+'tblDominioAnoCalendario."ano_calendario" AS "tblDominioAnoCalendario.ano_calendario", '
			+'tblDominioModulo."id_dominio_modulo" AS "tblDominioModulo.id_dominio_modulo", '
			+'tblDominioModulo."modulo" AS "tblDominioModulo.modulo", '
			+'tblTaxReconciliation."it_income_tax_as_per_the_statutory_financials" AS "tblTaxReconciliation.it_income_tax_as_per_the_statutory_financials", '
			+'tblTaxReconciliation."it_income_tax_as_per_the_tax_return" AS "tblTaxReconciliation.it_income_tax_as_per_the_tax_return", '
			+'tblTaxReconciliation."it_jurisdiction_tax_rate_average" AS "tblTaxReconciliation.it_jurisdiction_tax_rate_average", '
			+'tblTaxReconciliation."it_statutory_tax_rate_average" AS "tblTaxReconciliation.it_statutory_tax_rate_average", '
			+'tblTaxReconciliation."it_effective_tax_rate_as_per_the_statutory_financials" AS "tblTaxReconciliation.it_effective_tax_rate_as_per_the_statutory_financials", '
			+'tblTaxReconciliation."it_effective_tax_rate_as_per_the_tax_return" AS "tblTaxReconciliation.it_effective_tax_rate_as_per_the_tax_return", '
			+'tblTaxReconciliation."it_details_if_tax_returns_income_differs_from_fs" AS "tblTaxReconciliation.it_details_if_tax_returns_income_differs_from_fs" '
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
			+'INNER JOIN "VGT.TAX_RECONCILIATION" AS tblTaxReconciliation '
			+'ON tblTaxReconciliation."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" ';


		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};

		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/ req.session.usuario.empresas.length > 0){
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
							//filtro = ' tblPeriodo."id_periodo" = ? ';
							filtro = ' tblPeriodo."numero_ordem" = ? ';
							break;
						case 3:
							if(aEntrada[i][k] == ""){
								filtro = ' tblDominioMoeda."id_dominio_moeda" is null ';
							}
							else{
								filtro = ' tblDominioMoeda."id_dominio_moeda" = ? ';
							}
							break;			
						case 4:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;	
					}
					if(aEntrada[i].length == 1){
						oWhere.push(filtro);
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}
					}	 
					else{
						k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}
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

		sStatement += ") " + stringDistinctFilter;
		
		db.executeStatement({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		}, {
			idUsuario: req
		});
	},
	deepQueryDistinctTemporaryAndPermanentDifferences: function (req, res) {
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var stringDistinct = "";
		var stringDistinctFilter = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];
		
		if(aEntrada[7] == null || aEntrada[7] == undefined){
			stringDistinct = 'Select * from (';	
			stringDistinctFilter = 'order by "tblEmpresa.nome" asc, "tblDominioAnoCalendario.ano_calendario" desc, "tblPeriodo.numero_ordem" asc';
		}
		else{
			switch(aEntrada[7][0]){
				case "tblEmpresa.nome":
					stringDistinct = 'Select distinct "tblEmpresa.id_empresa" , "tblEmpresa.nome"  from (';
					break;
				case "tblDominioAnoCalendario.ano_calendario":
					stringDistinct = 'Select distinct "tblDominioAnoCalendario.id_dominio_ano_calendario" , "tblDominioAnoCalendario.ano_calendario" from (';
					stringDistinctFilter = 'order by "tblDominioAnoCalendario.ano_calendario"';
					break;		
				case "tblPeriodo.id_periodo":
					stringDistinct = 'select distinct "tblPeriodo.numero_ordem" from (';
					break;	
				case "tblDominioMoeda.acronimo":
					stringDistinct = 'Select distinct "tblDominioMoeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome" from (';
					break;	
				case "tblDiferencaOpcao.nome":
					stringDistinct = 'select distinct "tblDiferencaOpcao.nome","tblDiferencaOpcao.id_diferenca_opcao" from (';
					break;	
				case "tblDominioDiferencaTipo.tipo":
					stringDistinct = 'Select distinct "tblDominioDiferencaTipo.tipo" , "tblDominioDiferencaTipo.id_dominio_diferenca_tipo" from (';
					break;						
			}			
		}

		
		var sStatement = 
			stringDistinct 
			+'SELECT tblEmpresa."id_empresa" AS "tblEmpresa.id_empresa", '
			+'tblEmpresa."nome" AS "tblEmpresa.nome", '
			+'tblEmpresa."num_hfm_sap" AS "tblEmpresa.num_hfm_sap", '
			+'tblEmpresa."tin" AS "tblEmpresa.tin", '
			+'tblEmpresa."jurisdicao_tin" AS "tblEmpresa.jurisdicao_tin", '
			+'tblEmpresa."ni" AS "tblEmpresa.ni", '
			+'tblEmpresa."jurisdicao_ni" AS "tblEmpresa.jurisdicao_ni", '
			+'tblEmpresa."endereco" AS "tblEmpresa.endereco", '
			+'tblEmpresa."fy_start_date" AS "tblEmpresa.fy_start_date", '
			+'tblEmpresa."fy_end_date" AS "tblEmpresa.fy_end_date", '
			+'tblEmpresa."lbc_nome" AS "tblEmpresa.lbc_nome", '
			+'tblEmpresa."lbc_email" AS "tblEmpresa.lbc_email", '
			+'tblEmpresa."comentarios" AS "tblEmpresa.comentarios", '
			+'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" AS "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario", '
			+'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" AS "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status", '
			+'tblEmpresa."fk_aliquota.id_aliquota" AS "tblEmpresa.fk_aliquota.id_aliquota", '
			+'tblEmpresa."fk_pais.id_pais" AS "tblEmpresa.fk_pais.id_pais", '
			+'tblTaxPackage."fk_empresa.id_empresa" AS "tblTaxPackage.fk_empresa.id_empresa", '
			+'tblTaxPackage."fk_dominio_moeda.id_dominio_moeda" AS "tblTaxPackage.fk_dominio_moeda.id_dominio_moeda", '
			+'tblTaxPackage."id_tax_package" AS "tblTaxPackage.id_tax_package", '
			+'tblDominioMoeda."id_dominio_moeda" AS "tblDominioMoeda.id_dominio_moeda", '
			+'tblDominioMoeda."acronimo" AS "tblDominioMoeda.acronimo", '
			+'tblDominioMoeda."nome" AS "tblDominioMoeda.nome", '
			+'tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" AS "tblRelTaxPackagePeriodo.id_rel_tax_package_periodo", '
			+'tblRelTaxPackagePeriodo."fk_tax_package.id_tax_package" AS "tblRelTaxPackagePeriodo.fk_tax_package.id_tax_package", '
			+'tblRelTaxPackagePeriodo."fk_periodo.id_periodo" AS "tblRelTaxPackagePeriodo.fk_periodo.id_periodo", '
			+'tblRelTaxPackagePeriodo."ind_ativo" AS "tblRelTaxPackagePeriodo.ind_ativo", '
			+'tblRelTaxPackagePeriodo."status_envio" AS "tblRelTaxPackagePeriodo.status_envio", '
			+'tblRelTaxPackagePeriodo."data_envio" AS "tblRelTaxPackagePeriodo.data_envio", '
			+'tblPeriodo."id_periodo" AS "tblPeriodo.id_periodo", '
			+'tblPeriodo."periodo" AS "tblPeriodo.periodo", '
			+'tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" AS "tblPeriodo.fk_dominio_ano_calendario.id_dominio_ano_calendario", '
			+'tblPeriodo."fk_dominio_modulo.id_dominio_modulo" AS "tblPeriodo.fk_dominio_modulo.id_dominio_modulo", '
			+'tblPeriodo."numero_ordem" AS "tblPeriodo.numero_ordem", '
			+'tblDominioAnoCalendario."id_dominio_ano_calendario" AS "tblDominioAnoCalendario.id_dominio_ano_calendario", '
			+'tblDominioAnoCalendario."ano_calendario" AS "tblDominioAnoCalendario.ano_calendario", '
			+'tblDominioModulo."id_dominio_modulo" AS "tblDominioModulo.id_dominio_modulo", '
			+'tblDominioModulo."modulo" AS "tblDominioModulo.modulo", '
			+'tblTaxReconciliation."rf_taxable_income_loss_before_losses_and_tax_credits" AS "tblTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits", '
			+'tblTaxReconciliation."rf_total_losses_utilized" AS "tblTaxReconciliation.rf_total_losses_utilized", '
			+'tblTaxReconciliation."rf_taxable_income_loss_after_losses" AS "tblTaxReconciliation.rf_taxable_income_loss_after_losses", '
			+'tblTaxReconciliation."rf_income_tax_before_other_taxes_and_credits" AS "tblTaxReconciliation.rf_income_tax_before_other_taxes_and_credits", '
			+'tblTaxReconciliation."rf_other_taxes" AS "tblTaxReconciliation.rf_other_taxes", '
			+'tblTaxReconciliation."rf_incentivos_fiscais" AS "tblTaxReconciliation.rf_incentivos_fiscais", '
			+'tblTaxReconciliation."rf_total_other_taxes_and_tax_credits" AS "tblTaxReconciliation.rf_total_other_taxes_and_tax_credits", '
			+'tblTaxReconciliation."rf_net_local_tax" AS "tblTaxReconciliation.rf_net_local_tax", '
			+'tblTaxReconciliation."rf_wht" AS "tblTaxReconciliation.rf_wht", '
			+'tblTaxReconciliation."rf_overpayment_from_prior_year_applied_to_current_year" AS "tblTaxReconciliation.rf_overpayment_from_prior_year_applied_to_current_year", '
			+'tblTaxReconciliation."rf_total_interim_taxes_payments_antecipacoes" AS "tblTaxReconciliation.rf_total_interim_taxes_payments_antecipacoes", '
			+'tblTaxReconciliation."rf_tax_due_overpaid" AS "tblTaxReconciliation.rf_tax_due_overpaid", '
			+'tblRelTaxReconciliationDiferenca."fk_tax_reconciliation.id_tax_reconciliation" AS "tblRelTaxReconciliationDiferenca.fk_tax_reconciliation.id_tax_reconciliation", '
			+'tblRelTaxReconciliationDiferenca."fk_diferenca.id_diferenca" AS "tblRelTaxReconciliationDiferenca.fk_diferenca.id_diferenca", '
			+'tblRelTaxReconciliationDiferenca."valor" AS "tblRelTaxReconciliationDiferenca.valor", '			
			+'tblDiferenca."id_diferenca" AS "tblDiferenca.id_diferenca", '
			+'tblDiferenca."outro" AS "tblDiferenca.outro", '
			+'tblDiferenca."fk_diferenca_opcao.id_diferenca_opcao" AS "tblDiferenca.fk_diferenca_opcao.id_diferenca_opcao", '
			+'tblDiferenca."ind_enviada" AS "tblDiferenca.ind_enviada", '
			+'tblDiferencaOpcao."id_diferenca_opcao" AS "tblDiferencaOpcao.id_diferenca_opcao", '
			+'tblDiferencaOpcao."nome" AS "tblDiferencaOpcao.nome", '
			+'tblDiferencaOpcao."fk_dominio_diferenca_tipo.id_dominio_diferenca_tipo" AS "tblDiferencaOpcao.fk_dominio_diferenca_tipo.id_dominio_diferenca_tipo", '
			+'tblDiferencaOpcao."ind_duplicavel" AS "tblDiferencaOpcao.ind_duplicavel", '
			+'tblDominioDiferencaTipo."id_dominio_diferenca_tipo" AS "tblDominioDiferencaTipo.id_dominio_diferenca_tipo", '
			+'tblDominioDiferencaTipo."tipo" AS "tblDominioDiferencaTipo.tipo" '	
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
			+'INNER JOIN "VGT.TAX_RECONCILIATION" AS tblTaxReconciliation '
			+'ON tblTaxReconciliation."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = tblRelTaxPackagePeriodo."id_rel_tax_package_periodo" '
	        +'INNER JOIN "VGT.REL_TAX_RECONCILIATION_DIFERENCA" AS tblRelTaxReconciliationDiferenca ON tblRelTaxReconciliationDiferenca."fk_tax_reconciliation.id_tax_reconciliation" = tblTaxReconciliation."id_tax_reconciliation" '
	        +'INNER JOIN "VGT.DIFERENCA" AS tblDiferenca ON tblDiferenca."id_diferenca" = tblRelTaxReconciliationDiferenca."fk_diferenca.id_diferenca" '
	        +'INNER JOIN "VGT.DIFERENCA_OPCAO" AS tblDiferencaOpcao ON tblDiferencaOpcao."id_diferenca_opcao" = tblDiferenca."fk_diferenca_opcao.id_diferenca_opcao" '
	        +'INNER JOIN "VGT.DOMINIO_DIFERENCA_TIPO" AS tblDominioDiferencaTipo ON tblDominioDiferencaTipo."id_dominio_diferenca_tipo" = tblDiferencaOpcao."fk_dominio_diferenca_tipo.id_dominio_diferenca_tipo"	';


		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};

		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/ req.session.usuario.empresas.length > 0){
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
							//filtro = ' tblPeriodo."id_periodo" = ? ';
							filtro = ' tblPeriodo."numero_ordem" = ? ';
							break;
						case 3:
							if(aEntrada[i][k] == ""){
								filtro = ' tblDominioMoeda."id_dominio_moeda" is null ';
							}
							else{
								filtro = ' tblDominioMoeda."id_dominio_moeda" = ? ';
							}
							break;			
						case 4:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;	
						case 5:
							filtro = ' tblDiferencaOpcao."id_diferenca_opcao" = ? ';
							break;	
						case 6:
							filtro = ' tblDominioDiferencaTipo."id_dominio_diferenca_tipo" = ? ';
							break;								
					}
					if(aEntrada[i].length == 1){
						oWhere.push(filtro);
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}								
					}	 
					else{
						k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}
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

		sStatement += ") " + stringDistinctFilter;
		
		db.executeStatement({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		}, {
			idUsuario: req
		});
	}	
};