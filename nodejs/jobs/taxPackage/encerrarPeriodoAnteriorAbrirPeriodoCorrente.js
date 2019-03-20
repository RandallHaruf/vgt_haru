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

const criarRelacionamentoPeriodoCorrente = (iAnoCorrente, iNumeroOrdemCorrente) => {
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
	
	const pegarPeriodo = (iAno, iNumeroOrdem) => {
		let sQuery = 
			'select periodo."id_periodo" '
			+ 'from "VGT.PERIODO" periodo '
			+ 'inner join "VGT.DOMINIO_ANO_CALENDARIO" anoCalendario '
			+ 'on periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = anoCalendario."id_dominio_ano_calendario" '
			+ 'where '
			+ 'periodo."fk_dominio_modulo.id_dominio_modulo" = 2 '
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
	
	const pegarTaxPackage = (iAno, iNumeroOrdem, idEmpresa) => {
		// se for atualizacao de periodos com numero de ordem 1
		if (iNumeroOrdem === 1) {
			// criar uma referencia de tax package
			let sQueryInsert = 
				'insert into "VGT.TAX_PACKAGE"("id_tax_package", "fk_empresa.id_empresa", "fk_dominio_moeda.id_dominio_moeda") ' 
				+ 'values("identity_VGT.TAX_PACKAGE_id_tax_package".nextval, ?, null)';
			
			let resultInsert = db.executeStatementSync(sQueryInsert, [idEmpresa]);
			
			if (resultInsert !== 0) {
				let sQuerySelect = 'select MAX("id_tax_package") "generated_id" from "VGT.TAX_PACKAGE"';
					
				let resultSelect = db.executeStatementSync(sQuerySelect);
				
				return resultSelect[0].generated_id;
			}
			else {
				return -1;
			}
		}
		// se nao
		else {
			// recuperar o id de tax package que tenha alguma relacionamento com algum periodo do ano corrente e fk da empresa corrente
			let sQuerySelect = 
				'select distinct taxPackage."id_tax_package"  '
				+ 'from "VGT.TAX_PACKAGE" taxPackage '
				+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
				+ 'on taxPackage."id_tax_package" = rel."fk_tax_package.id_tax_package" '
				+ 'inner join "VGT.PERIODO" periodo '
				+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
				+ 'where '
				+ 'periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ( '
				+ 'select "id_dominio_ano_calendario" from "VGT.DOMINIO_ANO_CALENDARIO" where "ano_calendario" = ? '
				+ ') '
				+ 'and taxPackage."fk_empresa.id_empresa" = ? ',
				aParam = [iAno, idEmpresa];
				
			let resultSelect = db.executeStatementSync(sQuerySelect, aParam);
				
			return resultSelect[0].id_tax_package;
		}
	};
	
	const criarRelacionamento = (idTaxPackage, idPeriodo, indAtivo, statusEnvio) => {
		return new Promise((resolve, reject) => {
			let sQueryInsert = 
				'insert into "VGT.REL_TAX_PACKAGE_PERIODO"("id_rel_tax_package_periodo", "fk_tax_package.id_tax_package", "fk_periodo.id_periodo", "ind_ativo", "status_envio", "data_envio") '
				+ 'values("identity_VGT.REL_TAX_PACKAGE_PERIODO_id_rel_tax_package_periodo".nextval, ?, ?, ?, ?, null)',
				aParam = [idTaxPackage, idPeriodo, indAtivo, statusEnvio];
				
			db.executeStatement({
				statement: sQueryInsert,
				parameters: aParam
			}, (err, result) => {
				if (err) {
					reject(err);
				}
				else {
					resolve();
				}
			});	
		});
	};
		
	return new Promise((resolve, reject) => {
		let aPromise = [];
		
		// pegar lista de empresas
		aPromise.push(pegarEmpresas());
			
		// pegar periodo corrente
		aPromise.push(pegarPeriodo(iAnoCorrente, iNumeroOrdemCorrente));
		
		// se o numero de ordem corrente for igual a 4
		if (iNumeroOrdemCorrente === 4) {
			// pegar periodo anual e retificador tambem
			aPromise.push(pegarPeriodo(iAnoCorrente, 5));
			aPromise.push(pegarPeriodo(iAnoCorrente, 6));
		}
		
		Promise.all(aPromise)
			.then((res) => {
				let aEmpresa = res[0],
					oPeriodoCorrente = res[1][0],
					oPeriodoAnual = res[2] ? res[2][0] : null,
					oPeriodoRetificador = res[3] ? res[3][0] : null;
					
				let aPromiseCriar = [];
				
				// para cada empresa
				for (let i = 0, length = aEmpresa.length; i < length; i++) {
					let oEmpresa = aEmpresa[i];
					
					let idTaxPackage = pegarTaxPackage(iAnoCorrente, iNumeroOrdemCorrente, oEmpresa.id_empresa);
						
					// criar relacionamento entre o tax package e o periodo corrente com ind_ativo = true e status_envio = 2
					aPromiseCriar.push(criarRelacionamento(idTaxPackage, oPeriodoCorrente.id_periodo, true, 2));
					
					// se o numero de ordem corrente for igual a 4
					// criar relacionamento entre o tax package e o periodo anual e retificador com ind_ativo = false e status_envio = 1
					if (oPeriodoAnual) {
						aPromiseCriar.push(criarRelacionamento(idTaxPackage, oPeriodoAnual.id_periodo, false, 1));
					}
					if (oPeriodoRetificador) {
						aPromiseCriar.push(criarRelacionamento(idTaxPackage, oPeriodoRetificador.id_periodo, false, 1));
					}
				}
				
				Promise.all(aPromiseCriar)
					.then((resCriar) => {
						resolve();
					})
					.catch((err) => {
						reject(err);
					});
			})
			.catch((err) => {
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