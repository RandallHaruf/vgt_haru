'use strict';

const db = require('../../api/db.js');
const scheduler = require('node-schedule');
const emailSend = require('../../api/controllers/controllerEmailSend');

const retornaRequisicoesAtrasadasTTC = () => {
	let sQuery =
		'SELECT * FROM "VGT.REQUISICAO_REABERTURA" AS tblRequisicaoReabertura '
		+'WHERE ADD_DAYS(TO_DATE(tblRequisicaoReabertura."data_requisicao"), 3) < current_date '
		+'AND tblRequisicaoReabertura."fk_dominio_requisicao_reabertura_status.id_dominio_requisicao_reabertura_status" = 1; ';
		
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

/*const retornaEmailsAdmin = () =>{
	let sQuery =
		'SELECT tblUsuario."email" FROM "VGT.USUARIO" as tblUsuario '
        +'WHERE tblUsuario."fk_dominio_tipo_acesso.id_tipo_acesso" > 0 ';
		
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
};*/

const verificaAtrasosEMandaEmail = () => {
	Promise.all(
			[
				retornaRequisicoesAtrasadasTTC()
			]
		).then((results) => {
			var aRequisicoesAtrasadas = results[0];
			if(aRequisicoesAtrasadas.length){
				var sAssunto = "You have a pending TTC reopening request";
				var sCorpo = "<p>"
							 +"One or more TTC reopening requests have been pending for more than 3 days."	
				             +"</p>"
				             +"<p>"
							 +"Best Regards"	
				             +"</p>";
				emailSend.comunicaReabertura(sCorpo,sAssunto)
				.then((res) => {
					console.log(res);
				})
				.catch((err) => {
					console.log(err)
				});
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
	scheduler.scheduleJob('0 0 * * *', verificaAtrasosEMandaEmail.bind());
};