'use strict';

const db = require('../../api/db.js');
const scheduler = require('node-schedule');

const retornaPeriodosReabertosUltrapassados = () => {
	let sQuery =
		'select * from ( '
			+ 'select rel.*, taxPackage.*,periodo.*, '
			+ 'DAYS_BETWEEN(CURRENT_DATE,ADD_DAYS(TO_DATE(tblRequisicao."data_resposta"),5)) as "DiasRestantes" '
			+ 'from "VGT.REL_TAX_PACKAGE_PERIODO" rel '
			+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
				+ 'on rel."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '
			+ 'inner join "VGT.PERIODO" periodo '
				+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
			+ 'left outer join ( '
				+ 'select "VGT.REQUISICAO_REABERTURA_TAX_PACKAGE".* ,  row_number() over (partition by "fk_id_rel_tax_package_periodo.id_rel_tax_package_periodo" order by "id_requisicao_reabertura_tax_tackage" desc) as rownumber from "VGT.REQUISICAO_REABERTURA_TAX_PACKAGE" '
			+ ') tblRequisicao '
				+ 'on tblRequisicao."fk_id_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo" '
			+ 'where (tblRequisicao.ROWNUMBER = 1) '
			+ 'and "ind_ativo" = true '
			+ 'and "fk_dominio_requisicao_reabertura_status.id_dominio_requisicao_reabertura_status" = 2 '
		+ ') tblRequisicoesPeriodosAtivos '
		+ 'where "DiasRestantes" <= 0 ';

	return new Promise((resolve, reject) => {
		db.executeStatement({
			statement: sQuery
		}, (err, result) => {
			if (err) {
				reject(err);
			} else {
				console.log(JSON.stringify(result));
				resolve(result);
			}
		});
	});
};

const fechaPeriodosUltrapassados = (oPeriodo) => {
	let sQuery =
		'update "VGT.REL_TAX_PACKAGE_PERIODO" set "ind_ativo" = ? where "id_rel_tax_package_periodo" = ?';

	let aParametros = [
			false,
			oPeriodo.id_rel_tax_package_periodo
		];
	return new Promise((resolve, reject) => {
		db.executeStatement({
			statement: sQuery,
			parameters: aParametros
		}, (err, result) => {
			if (err) {
				reject();
			} else {
				resolve();
			}
		});
	});	
};

const verificaAberturasUltrapassadasEFechar = () => {
	Promise.all(
			[
				retornaPeriodosReabertosUltrapassados()
			]
		).then((results) => {
			var aPeriodosReabertosUltrapassados = results[0];
			if (aPeriodosReabertosUltrapassados.length) {
				var quantidadeRegistrosSucesso = 0;
				for(let i =0; i < aPeriodosReabertosUltrapassados.length; i++){
					var oPeriodo = aPeriodosReabertosUltrapassados[i];
					fechaPeriodosUltrapassados(oPeriodo)
					.then(() =>{
						console.log("Um período foi fechado pelo job");
					})
					.catch(() => {
						
					})
				}
			}
		})
		.catch((err) => {
			console.log(err);
		});
}

module.exports = () => {
	/**
	 * https://crontab.guru/#0_0_*_*_*
	 * Verifica se há necessidade de mandar email de atraso de requisicoes diariamente
	 **/
	//scheduler.scheduleJob('0 0 * * *', verificaAtrasosEMandaEmail.bind());
	scheduler.scheduleJob('0 3 * * *', verificaAberturasUltrapassadasEFechar.bind());
};