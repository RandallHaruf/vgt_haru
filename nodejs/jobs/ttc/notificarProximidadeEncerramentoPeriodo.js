'use strict';

const db = require('../../api/db.js');
const scheduler = require('node-schedule');
const disparaEmail = require("../../utils/sendEmails");

const send_Not_Email = (numOrdem, anoCal, qtdDia) => {
	// PROD
	var caminho = "https://tenti-tecnologia-e-engenharia-ltda---epp-prod-ui5.cfapps.eu10.hana.ondemand.com/ui5/index.html";
	// DEV
	//var caminho = "https://tenti-tecnologia-e-engenharia-ltda---epp-dev-ui5.cfapps.eu10.hana.ondemand.com/ui5/index.html";
	
	let sQuery =
	
		' Select Empr."id_empresa" "Empr.id_empresa", Empr."nome" "Empr.nome", Usu."nome" "Usu.nome", Usu."email" "Usu.email" '
		+ ' From "VGT.REL_EMPRESA_PERIODO" REmp '
		+ ' left join "VGT.PERIODO" Per ' 
		+ ' on Per."id_periodo" = REmp."fk_periodo.id_periodo" ' 
		+ ' left join "VGT.DOMINIO_ANO_CALENDARIO" DACal ' 
		+ ' on DACal."id_dominio_ano_calendario" = Per."fk_dominio_ano_calendario.id_dominio_ano_calendario" ' 
		+ ' join "VGT.EMPRESA" Empr ' 
		+ ' on Empr."id_empresa" = REmP."fk_empresa.id_empresa" ' 
		+ ' left join "VGT.REL_USUARIO_EMPRESA" RUsuEmp '
		+ ' on RUsuEmp."fk_empresa.id_empresa" = Empr."id_empresa" '
		+ ' left join "VGT.USUARIO" Usu '
		+ ' on Usu."id_usuario" = RUsuEmp."fk_usuario.id_usuario" '
		+ ' Where REmp."ind_ativo" = true '
		+ ' And REmp."ind_enviado" = false '
		+ ' And Usu."ind_ativo" = true '
		+ ' And Per."fk_dominio_modulo.id_dominio_modulo" = 1 '
		+ ' And Per."numero_ordem" = ? '
		+ ' And DACal."ano_calendario" = ? '
		+ ' Order By Usu."nome" ', 
	aParam = [numOrdem, anoCal];
	
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
				var Retorno = result;
				for(var i = 0; i < Retorno.length; i++){
					var nome = Retorno[i]['Empr.nome'];
					var lbc_nome = Retorno[i]['Usu.nome']; 
					var lbc_email = "fms.catarino@gmail.com" ; //Retorno[i]['Usu.email'];
					var vSubj = '';
					var vHtml = '';
					
					switch(qtdDia){
						case 15: 
							vSubj = 'TTC - Pending information – '+numOrdem+' Quarter of '+ anoCal;
							vHtml = '<!DOCTYPE html><html><body><p style="font-family:Arial, Helvetica; font-size:12px">Dear '+lbc_nome+',<br><br>Please access the TTC module at <a href="' + caminho + '">Vale Global Tax (VGT)</a> and complete the information of the previous quarter, for the following Entity(ies):<br><br>'+nome+'<br><br><strong><span style="text-decoration: underline;">Your deadline is due in '+qtdDia+' days.</span></strong> Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
							break;
						case 5: 
							vSubj = 'TTC - Pending information – '+numOrdem+' Quarter of '+ anoCal;
							vHtml = '<!DOCTYPE html><html><body><p style="font-family:Arial, Helvetica; font-size:12px">Dear '+lbc_nome+',<br><br>Please access the TTC module at <a href="' + caminho + '">Vale Global Tax (VGT)</a> and complete the information of the previous quarter, for the following Entity(ies):<br><br>'+nome+'<br><br><strong><span style="text-decoration: underline;">Your deadline is due in '+qtdDia+' days.</span></strong> Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
							break;
						case 3: 
							vSubj = 'TTC - URGENT Pending information – '+numOrdem+' Quarter of '+ anoCal;
							vHtml = '<!DOCTYPE html><html><body><p style="font-family:Arial, Helvetica; font-size:12px">Dear '+lbc_nome+'/Country Manager<br><br>This is a reminder regarding the TTC module at <a href="' + caminho + '">Vale Global Tax (VGT)</a>, for the following Entity(ies):<br><br>'+nome+'<br><br><strong><span style="text-decoration: underline;">Your deadline is due in '+qtdDia+' days.</span></strong><br><br>Please enter the system ASAP and complete the information of the previous quarter. Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
							break;
						case 2: 
							vSubj = 'TTC - URGENT Pending information – '+numOrdem+' Quarter of '+ anoCal;
							vHtml = '<!DOCTYPE html><html><body><p style="font-family:Arial, Helvetica; font-size:12px">Dear '+lbc_nome+'/Country Manager<br><br>This is a reminder regarding the TTC module at <a href="' + caminho + '">Vale Global Tax (VGT)</a>, for the following Entity(ies):<br><br>'+nome+'<br><br><strong><span style="text-decoration: underline;">Your deadline is due in '+qtdDia+' days.</span></strong><br><br>Please enter the system ASAP and complete the information of the previous quarter. Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
							break;
						case 1: 
							vSubj = 'TTC - URGENT Pending information – '+numOrdem+' Quarter of '+ anoCal;
							vHtml = '<!DOCTYPE html><html><body><p style="font-family:Arial, Helvetica; font-size:12px">Dear '+lbc_nome+'/Country Manager<br><br><strong><span style="text-decoration: underline;">Today is the LAST day</span></strong> to complete the TTC module at <a href="' + caminho + '">Vale Global Tax (VGT)</a>, for the following Entity(ies):<br><br>'+nome+'<br><br>Please enter the system WITHOUT FURTHER DELAY and complete the information of the previous quarter.<br>Notice that after this date, the previous quarter will be locked. Any change will have to be justified and will require authorization. Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
							break;
					}
							disparaEmail.sendEmail({
								to: lbc_email,
								subject: vSubj,
								body: {
									isHtml: true,
									content: vHtml
								}
							}, function(vSuc){ 
								console.log(vSuc);
							}, function(vErr){
								console.log(vErr);
							});
				}
			}
		});
	});
};



module.exports = () => {
	// https://crontab.guru/
	
	let iAnoCorrente = (new Date()).getFullYear(),
		iAnoAnterior = iAnoCorrente - 1 ;
		
		console.log("DATA: "+(new Date()).toUTCString());
		
	// TESTE 21/01/2019 17:24 (Servidor está 2 horas a frente.)
	//scheduler.scheduleJob('24 17 21 1 *', send_Not_Email.bind(null, 1, iAnoCorrente, 15));
	
	// TESTE 18/02/2019 19:38 (Servidor está 3 horas a frente.)
	scheduler.scheduleJob('52 19 18 2 *', send_Not_Email.bind(null, 1, iAnoCorrente, 15));
	scheduler.scheduleJob('53 19 18 2 *', send_Not_Email.bind(null, 1, iAnoCorrente, 5));
	scheduler.scheduleJob('54 19 18 2 *', send_Not_Email.bind(null, 1, iAnoCorrente, 3));
	scheduler.scheduleJob('55 19 18 2 *', send_Not_Email.bind(null, 1, iAnoCorrente, 2));
	scheduler.scheduleJob('56 19 18 2 *', send_Not_Email.bind(null, 1, iAnoCorrente, 1));
		
		
	
	// ====================
	//   4 TRIMESTRE 
	//   20 de Janeiro
	// ====================
		
	// 15 dias para o Fechamento do 4 Trimestre
	scheduler.scheduleJob('0 0 05 1 *', send_Not_Email.bind(null, 4, iAnoAnterior, 15));
	// 05 dias para o Fechamento do 4 Trimestre
	scheduler.scheduleJob('0 0 15 1 *', send_Not_Email.bind(null, 4, iAnoAnterior, 5));
	// 03 dias para o Fechamento do 4 Trimestre
	scheduler.scheduleJob('0 0 17 1 *', send_Not_Email.bind(null, 4, iAnoAnterior, 3));
	// 02 dias para o Fechamento do 4 Trimestre
	scheduler.scheduleJob('0 0 18 1 *', send_Not_Email.bind(null, 4, iAnoAnterior, 2));
	// 01 dia para o Fechamento do 4 Trimestre
	scheduler.scheduleJob('0 0 19 1 *', send_Not_Email.bind(null, 4, iAnoAnterior, 1));
	
	
	// ====================
	//   1 TRIMESTRE
	//   20 de Abril
	// ====================
		
	// 15 dias para o Fechamento do 1 Trimestre
	scheduler.scheduleJob('0 0 05 4 *', send_Not_Email.bind(null, 1, iAnoCorrente, 15));
	// 05 dias para o Fechamento do 1 Trimestre
	scheduler.scheduleJob('0 0 15 4 *', send_Not_Email.bind(null, 1, iAnoCorrente, 5));
	// 03 dias para o Fechamento do 1 Trimestre
	scheduler.scheduleJob('0 0 17 4 *', send_Not_Email.bind(null, 1, iAnoCorrente, 3));
	// 02 dias para o Fechamento do 1 Trimestre
	scheduler.scheduleJob('0 0 18 4 *', send_Not_Email.bind(null, 1, iAnoCorrente, 2));
	// 01 dia para o Fechamento do 1 Trimestre
	scheduler.scheduleJob('0 0 19 4 *', send_Not_Email.bind(null, 1, iAnoCorrente, 1));
	
	
	// ====================
	//   2 TRIMESTRE
	//   20 de Julho
	// ====================
		
	// 15 dias para o Fechamento do 2 Trimestre
	scheduler.scheduleJob('0 0 05 7 *', send_Not_Email.bind(null, 2, iAnoCorrente, 15));
	// 05 dias para o Fechamento do 2 Trimestre
	scheduler.scheduleJob('0 0 15 7 *', send_Not_Email.bind(null, 2, iAnoCorrente, 5));
	// 03 dias para o Fechamento do 2 Trimestre
	scheduler.scheduleJob('0 0 17 7 *', send_Not_Email.bind(null, 2, iAnoCorrente, 3));
	// 02 dias para o Fechamento do 2 Trimestre
	scheduler.scheduleJob('0 0 18 7 *', send_Not_Email.bind(null, 2, iAnoCorrente, 2));
	// 01 dia para o Fechamento do 2 Trimestre
	scheduler.scheduleJob('0 0 19 7 *', send_Not_Email.bind(null, 2, iAnoCorrente, 1));
	
	
	// ====================
	//   3 TRIMESTRE
	//   20 de Outubro
	// ====================
		
	// 15 dias para o Fechamento do 3 Trimestre
	scheduler.scheduleJob('0 0 05 10 *', send_Not_Email.bind(null, 3, iAnoCorrente, 15));
	// 05 dias para o Fechamento do 3 Trimestre
	scheduler.scheduleJob('0 0 15 10 *', send_Not_Email.bind(null, 3, iAnoCorrente, 5));
	// 03 dias para o Fechamento do 3 Trimestre
	scheduler.scheduleJob('0 0 17 10 *', send_Not_Email.bind(null, 3, iAnoCorrente, 3));
	// 02 dias para o Fechamento do 3 Trimestre
	scheduler.scheduleJob('0 0 18 10 *', send_Not_Email.bind(null, 3, iAnoCorrente, 2));
	// 01 dia para o Fechamento do 3 Trimestre
	scheduler.scheduleJob('0 0 19 10 *', send_Not_Email.bind(null, 3, iAnoCorrente, 1));
};