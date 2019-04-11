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
	//Agora que nao estamos mais em horario de verão sao 3 horas de diferenca
	require('./ttc/encerrarPeriodoAnteriorAbrirPeriodoCorrente')();
	require('./ttc/notificarProximidadeEncerramentoPeriodo')();
	require('./Compliance_Beps/marcarComAtrasoObrigacoesVencidas')();
	require('./taxPackage/encerrarPeriodoAnteriorAbrirPeriodoCorrente')();
	require('./ttc/notificarAdministradorSolicitacao')();
	require('./taxPackage/notificarAdministradorSolicitacao')();
	require('./ttc/encerrarReabertura')();
	require('./taxPackage/encerrarReabertura')();
};