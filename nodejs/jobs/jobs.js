'use strict';

module.exports = function () {
	/* Servidor está com 2 horas a mais que o horário de brasília */
	//Agora que nao estamos mais em horario de verão sao 3 horas de diferenca
	require('./ttc/encerrarPeriodoAnteriorAbrirPeriodoCorrente')();
	require('./ttc/notificarProximidadeEncerramentoPeriodo')();
	require('./ttc/notificarAdministradorSolicitacao')();
	require('./ttc/encerrarReabertura')();
	
	require('./taxPackage/encerrarPeriodoAnteriorAbrirPeriodoCorrente')();
	require('./taxPackage/notificarProximidadeEncerramentoPeriodo')();
	require('./taxPackage/notificarAdministradorSolicitacao')();
	require('./taxPackage/encerrarReabertura')();
};