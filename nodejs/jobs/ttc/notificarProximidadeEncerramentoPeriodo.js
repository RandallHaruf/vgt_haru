'use strict';

const db = require('../../api/db.js');
const scheduler = require('node-schedule');
const Email = require("../../utils/sendEmails.js");
const disparaEmail = new Email();

const send_Not_Email = (numOrdem, qtdDia) => {
	// PROD
	//var caminho = "https://tenti-tecnologia-e-engenharia-ltda---epp-prod-ui5.cfapps.eu10.hana.ondemand.com/ui5/index.html";
	// DEV
	var caminho = "https://tenti-tecnologia-e-engenharia-ltda---epp-dev-ui5.cfapps.eu10.hana.ondemand.com/ui5/index.html";

	let anoCal = (numOrdem === 4) ? (new Date()).getFullYear() - 1 : (new Date()).getFullYear();

	let sQuery =
		' Select Empr."id_empresa" "Empr.id_empresa", Empr."nome" "Empr.nome", Usu."nome" "Usu.nome", Usu."email" "Usu.email", Usu."email_gestor" "Usu.email_gestor" '
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
		
	db.executeStatement({
		statement: sQuery,
		parameters: aParam
	}, (err, result) => {
		if (err) {
			console.log(err);
		} else {
			var Retorno = result;
			var mapaEmails = {};
			
			for (var i = 0; i < Retorno.length; i++) {
				var nome = Retorno[i]['Empr.nome'];
				var lbc_nome = Retorno[i]['Usu.nome'];
				var lbc_email = Retorno[i]['Usu.email'];
				var emailGestor = Retorno[i]['Usu.email_gestor'];
				
				if (lbc_email) {
					if (mapaEmails[lbc_nome]) {
						mapaEmails[lbc_nome].empresas += `${nome}<br/>`;
					}
					else {
						mapaEmails[lbc_nome] = {
							lbc_email: lbc_email,
							emailGestor: emailGestor,
							empresas: `${nome}<br/>`
						};
					}
				}
			}
			
			for (var i = 0; i < Object.keys(mapaEmails).length; i++) {
				var lbc_nome = Object.keys(mapaEmails)[i];
				var nome = mapaEmails[lbc_nome].empresas;
				var lbc_email = mapaEmails[lbc_nome].lbc_email;
				var emailGestor = mapaEmails[lbc_nome].emailGestor;
				var vSubj = '';
				var vHtml = '';
				
				switch (numOrdem) {
					case 1:
						numOrdem = "1ˢᵗ Quarter";
						break;
					case 2:
						numOrdem = "2ⁿᵈ Quarter";
						break;
					case 3:
						numOrdem = "3ʳᵈ Quarter";
						break;
					case 4:
						numOrdem = "4ᵗʰ Quarter";
						break;
				}
				
				switch (qtdDia) {
					case 15:
						vSubj = 'TTC - Pending information – ' + numOrdem + ' of ' + anoCal;
						vHtml = '<!DOCTYPE html><html><body><p style="font-family:Arial!important; font-size:12px">Dear ' + lbc_nome +
							',<br><br>Please access the TTC module at <a href="' + caminho +
							'">Vale Global Tax (VGT)</a> and complete the information of the previous quarter, for the following Entity(ies):<br><br>' +
							nome + '<br><br><strong><span style="text-decoration: underline;">Your deadline is due in ' + qtdDia +
							' days.</span></strong> Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
						break;
					case 5:
						vSubj = 'TTC - Pending information – ' + numOrdem + ' of ' + anoCal;
						vHtml = '<!DOCTYPE html><html><body><p style="font-family:Arial!important; font-size:12px">Dear ' + lbc_nome +
							',<br><br>Please access the TTC module at <a href="' + caminho +
							'">Vale Global Tax (VGT)</a> and complete the information of the previous quarter, for the following Entity(ies):<br><br>' +
							nome + '<br><br><strong><span style="text-decoration: underline;">Your deadline is due in ' + qtdDia +
							' days.</span></strong> Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
						break;
					case 3:
						vSubj = 'TTC - URGENT Pending information – ' + numOrdem + ' of ' + anoCal;
						vHtml = '<!DOCTYPE html><html><body><p style="font-family:Arial!important; font-size:12px">Dear ' + lbc_nome +
							'/Country Manager<br><br>This is a reminder regarding the TTC module at <a href="' + caminho +
							'">Vale Global Tax (VGT)</a>, for the following Entity(ies):<br><br>' + nome +
							'<br><br><strong><span style="text-decoration: underline;">Your deadline is due in ' + qtdDia +
							' days.</span></strong><br><br>Please enter the system ASAP and complete the information of the previous quarter. Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
						break;
					case 2:
						vSubj = 'TTC - URGENT Pending information – ' + numOrdem + ' of ' + anoCal;
						vHtml = '<!DOCTYPE html><html><body><p style="font-family:Arial!important; font-size:12px">Dear ' + lbc_nome +
							'/Country Manager<br><br>This is a reminder regarding the TTC module at <a href="' + caminho +
							'">Vale Global Tax (VGT)</a>, for the following Entity(ies):<br><br>' + nome +
							'<br><br><strong><span style="text-decoration: underline;">Your deadline is due in ' + qtdDia +
							' days.</span></strong><br><br>Please enter the system ASAP and complete the information of the previous quarter. Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
						break;
					case 1:
						vSubj = 'TTC - URGENT Pending information – ' + numOrdem + ' of ' + anoCal;
						vHtml = '<!DOCTYPE html><html><body><p style="font-family:Arial!important; font-size:12px">Dear ' + lbc_nome +
							'/Country Manager<br><br><strong><span style="text-decoration: underline;">Today is the LAST day</span></strong> to complete the TTC module at <a href="' +
							caminho + '">Vale Global Tax (VGT)</a>, for the following Entity(ies):<br><br>' + nome +
							'<br><br>Please enter the system WITHOUT FURTHER DELAY and complete the information of the previous quarter.<br>Notice that after this date, the previous quarter will be locked. Any change will have to be justified and will require authorization. Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
						break;
				}
				
				(function (delay, to, cc, subject, html) {
					setTimeout(function () {
						disparaEmail.send({
							to: to,
							cc: cc,
							subject: subject,
							body: {
								isHtml: true,
								content: html
							}
						}, function (vSuc) { }, function (vErr) {
							console.log(vErr);
						});
					}, delay);
				}) (i * 1000, lbc_email, ((qtdDia === 3 || qtdDia === 2 || qtdDia === 1) ? emailGestor : ""), vSubj, vHtml);
			}
		}
	});
};

module.exports = () => {
	// https://crontab.guru/
	
	// ====================
	//   4 TRIMESTRE 
	//   20 de Janeiro
	// ====================

	// 15 dias para o Fechamento do 4 Trimestre
	scheduler.scheduleJob('0 0 05 1 *', send_Not_Email.bind(null, 4, 15));
	// 05 dias para o Fechamento do 4 Trimestre
	scheduler.scheduleJob('0 0 15 1 *', send_Not_Email.bind(null, 4, 5));
	// 03 dias para o Fechamento do 4 Trimestre
	scheduler.scheduleJob('0 0 17 1 *', send_Not_Email.bind(null, 4, 3));
	// 02 dias para o Fechamento do 4 Trimestre
	scheduler.scheduleJob('0 0 18 1 *', send_Not_Email.bind(null, 4, 2));
	// 01 dia para o Fechamento do 4 Trimestre
	scheduler.scheduleJob('0 0 19 1 *', send_Not_Email.bind(null, 4, 1));


	// ====================
	//   1 TRIMESTRE
	//   20 de Abril
	// ====================

	// 15 dias para o Fechamento do 1 Trimestre
	scheduler.scheduleJob('0 0 05 4 *', send_Not_Email.bind(null, 1, 15));
	// 05 dias para o Fechamento do 1 Trimestre
	scheduler.scheduleJob('0 0 15 4 *', send_Not_Email.bind(null, 1, 5));
	// 03 dias para o Fechamento do 1 Trimestre
	scheduler.scheduleJob('0 0 17 4 *', send_Not_Email.bind(null, 1, 3));
	// 02 dias para o Fechamento do 1 Trimestre
	scheduler.scheduleJob('0 0 18 4 *', send_Not_Email.bind(null, 1, 2));
	// 01 dia para o Fechamento do 1 Trimestre
	scheduler.scheduleJob('0 0 19 4 *', send_Not_Email.bind(null, 1, 1));

	// ====================
	//   2 TRIMESTRE
	//   20 de Julho
	// ====================

	// 15 dias para o Fechamento do 2 Trimestre
	scheduler.scheduleJob('0 0 05 7 *', send_Not_Email.bind(null, 2, 15));
	// 05 dias para o Fechamento do 2 Trimestre
	scheduler.scheduleJob('0 0 15 7 *', send_Not_Email.bind(null, 2, 5));
	// 03 dias para o Fechamento do 2 Trimestre
	scheduler.scheduleJob('0 0 17 7 *', send_Not_Email.bind(null, 2, 3));
	// 02 dias para o Fechamento do 2 Trimestre
	scheduler.scheduleJob('0 0 18 7 *', send_Not_Email.bind(null, 2, 2));
	// 01 dia para o Fechamento do 2 Trimestre
	scheduler.scheduleJob('0 0 19 7 *', send_Not_Email.bind(null, 2, 1));
	
	// ====================
	//   3 TRIMESTRE
	//   20 de Outubro
	// ====================

	// 15 dias para o Fechamento do 3 Trimestre
	scheduler.scheduleJob('0 0 05 10 *', send_Not_Email.bind(null, 3, 15));
	// 05 dias para o Fechamento do 3 Trimestre
	scheduler.scheduleJob('0 0 15 10 *', send_Not_Email.bind(null, 3, 5));
	// 03 dias para o Fechamento do 3 Trimestre
	scheduler.scheduleJob('0 0 17 10 *', send_Not_Email.bind(null, 3, 3));
	// 02 dias para o Fechamento do 3 Trimestre
	scheduler.scheduleJob('0 0 18 10 *', send_Not_Email.bind(null, 3, 2));
	// 01 dia para o Fechamento do 3 Trimestre
	scheduler.scheduleJob('0 0 19 10 *', send_Not_Email.bind(null, 3, 1));
};