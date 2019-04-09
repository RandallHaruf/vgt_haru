'use strict';

const db = require('../../api/db.js');
const scheduler = require('node-schedule');
const emailSend = require('../../api/controllers/controllerEmailSend');


const retornaRequisicoesAtrasadasReaberturaTaxPackage = () => {
	let sQuery =
		'SELECT * FROM "VGT.REQUISICAO_REABERTURA_TAX_PACKAGE" tblRequisicaoReaberturaTaxPackage '
		+'WHERE ADD_DAYS(TO_DATE(tblRequisicaoReaberturaTaxPackage."data_requisicao"), 3) < current_date '
		+'AND tblRequisicaoReaberturaTaxPackage."fk_dominio_requisicao_reabertura_status.id_dominio_requisicao_reabertura_status" = 1; ';
		
	return new Promise((resolve, reject) => {
		db.executeStatement({
			statement: sQuery
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

const retornaRequisicoesAtrasadasEncerramentoTaxPackage = () => {
	let sQuery =
		'SELECT * FROM "VGT.REQUISICAO_ENCERRAMENTO_PERIODO_TAX_PACKAGE" tblRequisicaoEncerramentoTaxPackage '
		+'WHERE ADD_DAYS(TO_DATE(tblRequisicaoEncerramentoTaxPackage."data_requisicao"), 3) < current_date  '
		+'AND tblRequisicaoEncerramentoTaxPackage."fk_dominio_requisicao_encerramento_periodo_status.id_dominio_requisicao_encerramento_periodo_status" = 1; ';
		
	return new Promise((resolve, reject) => {
		db.executeStatement({
			statement: sQuery
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


const verificaAtrasosEMandaEmail = () => {
	Promise.all(
			[
				retornaRequisicoesAtrasadasReaberturaTaxPackage(),
				retornaRequisicoesAtrasadasEncerramentoTaxPackage()
			]
		).then((results) => {
			var aRequisicoesAtrasadasReabertura = results[0];
			if(aRequisicoesAtrasadasReabertura.length){
				
				var sAssunto = "You have a pending TaxPackage reopening request";
				var sCorpo = "<p>"
							 +"One or more TaxPackage reopening requests have been pending for more than 3 days."	
				             +"</p>"
				             +"<p>"
							 +"Best Regards"	
				             +"</p>";
				emailSend.comunicaReabertura(sCorpo,sAssunto);
			}
			var aRequisicoesAtrasadasEncerramento = results[1];
			if(aRequisicoesAtrasadasEncerramento.length){
				
				var sAssunto = "You have a pending TaxPackage closing request";
				var sCorpo = "<p>"
							 +"One or more TaxPackage closing requests have been pending for more than 3 days."	
				             +"</p>"
				             +"<p>"
							 +"Best Regards"	
				             +"</p>";
				emailSend.comunicaReabertura(sCorpo,sAssunto);
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
	//verificaAtrasosEMandaEmail();
	scheduler.scheduleJob('0 0 * * *', verificaAtrasosEMandaEmail.bind());
};