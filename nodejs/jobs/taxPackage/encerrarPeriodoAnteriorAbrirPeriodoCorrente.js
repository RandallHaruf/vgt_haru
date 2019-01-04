'use strict';

const db = require('../../api/db.js');
const scheduler = require('node-schedule');

const atualizarRelacionamentos = (bAtivo, iNumeroOrdem, iAnoCalendario) => {
	let sQuery =
		'update "VGT.REL_TAX_PACKAGE_PERIODO" set '
		+ '"ind_ativo" = ?, '
		+ '"status_envio" = ? '
		+ 'where  '
		+ '"ind_ativo" = ?  '
		+ 'and "fk_periodo.id_periodo" in ( '
		+ 'select periodo."id_periodo" '
		+ 'from "VGT.PERIODO" periodo '
		+ 'inner join "VGT.DOMINIO_ANO_CALENDARIO" anoCalendario '
		+ 'on periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = anoCalendario."id_dominio_ano_calendario" '
		+ 'where '
		+ 'periodo."fk_dominio_modulo.id_dominio_modulo" = 2 '
		+ 'and periodo."numero_ordem" = ? '
		+ 'and anoCalendario."ano_calendario" = ? '
		+ '); ', 
		aParam = [bAtivo, (bAtivo ? 2 : 1), !bAtivo, iNumeroOrdem, iAnoCalendario]; // tem que ativar ? não iniciado : fechado sem enviar
		
	return new Promise((resolve, reject) => {
		db.executeStatement({
			statement: sQuery,
			parameters: aParam
		}, (err, result) => {
			if (err) {
				reject(err);
			}	
			else {
				resolve(result);
			}
		});
	});
};

const encerrarPeriodoAnteriorAbrirPeriodoCorrente = (numeroOrdemAnterior, numeroOrdemCorrente) => {
	let iAnoCorrente = (new Date()).getFullYear(),
		iAnoAnterior = numeroOrdemAnterior > numeroOrdemCorrente ? iAnoCorrente - 1 : iAnoCorrente;
		
	Promise.all([
			atualizarRelacionamentos(false, numeroOrdemAnterior, iAnoAnterior),
			atualizarRelacionamentos(true, numeroOrdemCorrente, iAnoCorrente)
		])
		.then((result) => {
			console.log(result);
		})
		.catch((err) => {
			console.log(err);	
		});
};

module.exports = () => {
	/**
	 * https://crontab.guru/#0_0_31_1_*
	 * Encerramento do quarto período do ano anterior e abertura do primeiro período do ano corrente em 31/01/xx às 00h00
	 **/
	scheduler.scheduleJob('0 0 31 1 *', encerrarPeriodoAnteriorAbrirPeriodoCorrente.bind(null, 4, 1));
	
	/**
	 * https://crontab.guru/#0_0_31_4_*
	 * Encerramento do primeiro período do ano corrente e abertura do segundo período do ano corrente em 31/04/xx às 00h00
	 **/
	scheduler.scheduleJob('0 0 31 4 *', encerrarPeriodoAnteriorAbrirPeriodoCorrente.bind(null, 1, 2));
	
	/**
	 * https://crontab.guru/#0_0_31_7_*
	 * Encerramento do segundo período do ano corrente e abertura do terceiro período do ano corrente em 31/07/xx às 00h00
	 **/
	scheduler.scheduleJob('0 0 31 7 *', encerrarPeriodoAnteriorAbrirPeriodoCorrente.bind(null, 2, 3));
	
	/**
	 * https://crontab.guru/#0_0_31_10_*
	 * Encerramento do terceiro período do ano corrente e abertura do quarto período do ano corrente em 31/10/xx às 00h00
	 **/
	scheduler.scheduleJob('0 0 31 10 *', encerrarPeriodoAnteriorAbrirPeriodoCorrente.bind(null, 3, 4));
};