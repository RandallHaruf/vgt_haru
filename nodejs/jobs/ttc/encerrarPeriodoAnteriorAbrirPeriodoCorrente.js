'use strict';

const db = require('../../api/db.js');
const scheduler = require('node-schedule');

const atualizarRelacionamentos = (bAtivo, iNumeroOrdem, iAnoCalendario) => {
	let sQuery =
		'update "VGT.REL_EMPRESA_PERIODO" set '
		+ '"ind_ativo" = ? '
		+ 'where '
		+ '"fk_periodo.id_periodo" in ( '
		+ 'select periodo."id_periodo"  '
		+ 'from "VGT.PERIODO" periodo '
		+ 'inner join "VGT.DOMINIO_ANO_CALENDARIO" anoCalendario '
		+ 'on periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = anoCalendario."id_dominio_ano_calendario" '
		+ 'where '
		+ 'periodo."fk_dominio_modulo.id_dominio_modulo" = 1 '
		+ 'and periodo."numero_ordem" = ? '
		+ 'and anoCalendario."ano_calendario" = ? '
		+ '); ',
		aParam = [bAtivo, iNumeroOrdem, iAnoCalendario];
		
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

const criarRelacionamentoPeriodoCorrente = (iAnoCorrente, iNumeroOrdemCorrente) => {
	const pegarPeriodo = (iAno, iNumeroOrdem) => {
		let sQuery = 
			'select periodo."id_periodo" '
			+ 'from "VGT.PERIODO" periodo '
			+ 'inner join "VGT.DOMINIO_ANO_CALENDARIO" anoCalendario '
			+ 'on periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = anoCalendario."id_dominio_ano_calendario" '
			+ 'where '
			+ 'periodo."fk_dominio_modulo.id_dominio_modulo" = 1 '
			+ 'and anoCalendario."ano_calendario" = ? '
			+ 'and periodo."numero_ordem" = ?';
		
		return new Promise((resolve, reject) => {
			db.executeStatement({
				statement: sQuery,
				parameters: [iAno, iNumeroOrdem]
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
	
	const pegarEmpresas = () => {
		return new Promise((resolve, reject) => {
			db.executeStatement({
				statement: 'select * from "VGT.EMPRESA"'
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
	
	const criarRelacionamento = (idPeriodo, idEmpresa, indAtivo = true) => {
		let sQuery = 
			'insert into "VGT.REL_EMPRESA_PERIODO"("fk_empresa.id_empresa", "fk_periodo.id_periodo", "ind_ativo", "ind_enviado") values(?, ?, ?, ?)';	
		
		return new Promise((resolve, reject) => {
			db.executeStatement({
				statement: sQuery,
				parameters: [idEmpresa, idPeriodo, indAtivo, false]
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
	
	return new Promise((resolve, reject) => {
		let aPromise = [];
		
		aPromise.push(pegarEmpresas());
		aPromise.push(pegarPeriodo(iAnoCorrente, iNumeroOrdemCorrente));
		
		Promise.all(aPromise)
			.then((res) => {
				let aEmpresa = res[0],
					oPeriodoCorrente = res[1][0];
				
				let aPromiseCriar = [];
				
				for (let i = 0, length = aEmpresa.length; i < length; i++) {
					let idEmpresa = aEmpresa[i].id_empresa;
					
					aPromiseCriar.push(criarRelacionamento(oPeriodoCorrente.id_periodo, idEmpresa));
				}	
				
				Promise.all(aPromiseCriar)
					.then((resCriar) => {
						resolve();
					})
					.catch((err) => {
						reject(err);
					});
			}).catch((err) => {
				reject(err);
			});
	});
};

const encerrarPeriodoAnteriorAbrirPeriodoCorrente = (numeroOrdemAnterior, numeroOrdemCorrente) => {
	let iAnoCorrente = (new Date()).getFullYear(),
		iAnoAnterior = numeroOrdemAnterior > numeroOrdemCorrente ? iAnoCorrente - 1 : iAnoCorrente;
		
	criarRelacionamentoPeriodoCorrente(iAnoCorrente, numeroOrdemCorrente)
		.then(() => {
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
		})
		.catch((err) => {
			console.log(err);	
		});
};

module.exports = () => {
	/**
	 * https://crontab.guru/#0_0_20_1_*
	 * Encerramento do quarto período do ano anterior e abertura do primeiro período do ano corrente em 20/01/xx às 00h00
	 **/
	scheduler.scheduleJob('0 0 20 1 *', encerrarPeriodoAnteriorAbrirPeriodoCorrente.bind(null, 4, 1));
	
	/**
	 * https://crontab.guru/#0_0_20_4_*
	 * Encerramento do primeiro período do ano corrente e abertura do segundo período do ano corrente em 20/04/xx às 00h00
	 **/
	scheduler.scheduleJob('0 0 20 4 *', encerrarPeriodoAnteriorAbrirPeriodoCorrente.bind(null, 1, 2));
	
	/**
	 * https://crontab.guru/#0_0_20_7_*
	 * Encerramento do segundo período do ano corrente e abertura do terceiro período do ano corrente em 20/07/xx às 00h00
	 **/
	scheduler.scheduleJob('0 0 20 7 *', encerrarPeriodoAnteriorAbrirPeriodoCorrente.bind(null, 2, 3));
	
	/**
	 * https://crontab.guru/#0_0_20_10_*
	 * Encerramento do terceiro período do ano corrente e abertura do quarto período do ano corrente em 20/10/xx às 00h00
	 **/
	scheduler.scheduleJob('0 0 20 10 *', encerrarPeriodoAnteriorAbrirPeriodoCorrente.bind(null, 3, 4));
};