'use strict';

/*
const email = require('../utils/sendEmails.js');

const enviarEmail = (conteudo) => {
	email.sendEmail({
		to: 'psoaresferraz@gmail.com',
		subject: 'Teste CRON ' + (new Date()).toString(),
		body: {
			isHtml: true,
			content: '<p><strong>' + conteudo + '</strong></p>'
		}
	});
};
*/

module.exports = function () {
	/* Servidor está com 2 horas a mais que o horário de brasília */
	
	require('./ttc/encerrarPeriodoAnteriorAbrirPeriodoCorrente')();
	require('./ttc/notificarProximidadeEncerramentoPeriodo')();
	require('./Compliance_Beps/marcarComAtrasoObrigacoesVencidas')();
	require('./taxPackage/encerrarPeriodoAnteriorAbrirPeriodoCorrente')();
};