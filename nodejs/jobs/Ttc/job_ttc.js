"use strict";
var disparaEmail = require("../sendEmails");
var db = require("../../api/db");

function updt_Quarter(numOrdem, IndAtivo, anoCal) {
// FECHA O 4 TRIMESTRE
	//console.log('numOrdem: '+numOrdem);
	//console.log('IndAtivo: '+IndAtivo);
	//console.log('anoCal: '+anoCal);
	
}

function send_Not_Email(numOrdem, anoCal, qtdDia) {
	var DLaft = qtdDia;
	var Qter = numOrdem;
	
	db.executeStatement({
	statement: 'Select Empr."nome", Empr."lbc_nome", Empr."lbc_email" From "VGT.REL_EMPRESA_PERIODO" REmp left join "VGT.PERIODO" Per on Per."id_periodo" = REmp."fk_periodo.id_periodo" left join "VGT.DOMINIO_ANO_CALENDARIO" DACal on DACal."id_dominio_ano_calendario" = Per."fk_dominio_ano_calendario.id_dominio_ano_calendario" join "VGT.EMPRESA" Empr on Empr."id_empresa" = REmP."fk_empresa.id_empresa" Where REmp."ind_ativo" = true And Per."fk_dominio_modulo.id_dominio_modulo" = 1 And Per."numero_ordem" = ? And DACal."ano_calendario" = ?',
	parameters:[Qter, anoCal]
	}, function (err, results) {
		if (err) {
			console.log("Erro " + err);
		}
		else {
			var Retorno = results;
			for(var i = 0; i < Retorno.length; i++){
				var nome = Retorno[i]['nome'];
				var lbc_nome = Retorno[i]['lbc_nome'];
				var lbc_email = Retorno[i]['lbc_email'];
				var vSubj = '';
				var vHtml = '';
				
				switch(DLaft){
					case 15: 
						vSubj = 'TTC - Pending information – '+Qter+' Quarter';
						vHtml = '<!DOCTYPE html><html><body><p>Dear '+lbc_nome+',<br><br>Please access the TTC module at Vale Global Tax (VGT) – inserir hiperlink and complete the information of the previous quarter, for the following Entity(ies):<br><br>'+nome+'<br><br>Your deadline is due in '+DLaft+' days. Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
						break;
					case 5: 
						vSubj = 'TTC - Pending information – '+Qter+' Quarter';
						vHtml = '<!DOCTYPE html><html><body><p>Dear '+lbc_nome+',<br><br>Please access the TTC module at Vale Global Tax (VGT) – inserir hiperlink and complete the information of the previous quarter, for the following Entity(ies):<br><br>'+nome+'<br><br>Your deadline is due in '+DLaft+' days. Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
						break;
					case 3: 
						vSubj = 'TTC - URGENT Pending information – '+Qter+' Quarter';
						vHtml = '<!DOCTYPE html><html><body><p>Dear '+lbc_nome+'/Country Manager<br><br>This is a reminder regarding the TTC module at Vale Global Tax (VGT) – inserir hiperlink, for the following Entity(ies):<br><br>'+nome+'<br><br>Your deadline is due in '+DLaft+' days.<br><br>Please enter the system ASAP and complete the information of the previous quarter. Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
						break;
					case 2: 
						vSubj = 'TTC - URGENT Pending information – '+Qter+' Quarter';
						vHtml = '<!DOCTYPE html><html><body><p>Dear '+lbc_nome+'/Country Manager<br><br>This is a reminder regarding the TTC module at Vale Global Tax (VGT) – inserir hiperlink, for the following Entity(ies):<br><br>'+nome+'<br><br>Your deadline is due in '+DLaft+' days.<br><br>Please enter the system ASAP and complete the information of the previous quarter. Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
						break;
					case 1: 
						vSubj = 'TTC - URGENT Pending information – '+Qter+' Quarter';
						vHtml = '<!DOCTYPE html><html><body><p>Dear '+lbc_nome+'/Country Manager<br><br>Today is the LAST day to complete the TTC module at Vale Global Tax (VGT) – inserir hiperlink, for the following Entity(ies):<br><br>'+nome+'<br><br>Please enter the system WITHOUT FURTHER DELAY and complete the information of the previous quarter.<br>Notice that after this date, the previous quarter will be locked. Any change will have to be justified and will require authorization. Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>';
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

	/*
		disparaEmail.sendEmail({
			to: 'fms.catarino@gmail.com',
			subject: 'Teste: '+datetime,
			body: {
				isHtml: true,
				content: '<html>OLAAA</html>'
			}
		}, function(vSuc){
			//console.log(vSuc);
		}, function(vErr){
			//console.log(vErr);
		});
	*/
}

module.exports = function () {
	var schedule = require('node-schedule');
	
	var anoCal = (new Date()).getFullYear();
	
	/*
	schedule.scheduleJob('/3 * * * * *', function () {
		//console.log("Disparos do job");
	
		var DLaft = 15;
		var Qter = 4;
		
		db.executeStatement({
		statement: 'Select Empr."nome", Empr."lbc_nome", Empr."lbc_email" From "VGT.REL_EMPRESA_PERIODO" REmp left join "VGT.PERIODO" Per on Per."id_periodo" = REmp."fk_periodo.id_periodo" left join "VGT.DOMINIO_ANO_CALENDARIO" DACal on DACal."id_dominio_ano_calendario" = Per."fk_dominio_ano_calendario.id_dominio_ano_calendario" join "VGT.EMPRESA" Empr on Empr."id_empresa" = REmP."fk_empresa.id_empresa" Where REmp."ind_ativo" = true And Per."fk_dominio_modulo.id_dominio_modulo" = 1 And Per."numero_ordem" = 4 And DACal."ano_calendario" = 2018'
		}, function (err, results) {
			if (err) {
				console.log("Erro " + err);
			}
			else {
				var Retorno = JSON.parse(JSON.stringify(results));
				for(var i = 0; i < Retorno.length; i++){
					var nome = Retorno[i]['nome'];
					var lbc_nome = Retorno[i]['lbc_nome'];
					var lbc_email = Retorno[i]['lbc_email'];
					
					
							disparaEmail.sendEmail({
								to: lbc_email,
								subject: 'TTC - Pending information – '+Qter+' Quarter',
								body: {
									isHtml: true,
									content: '<!DOCTYPE html><html><body><p>Dear '+lbc_nome+',<br><br>Please access the TTC module at Vale Global Tax (VGT) – inserir hiperlink and complete the information of the previous quarter, for the following Entity(ies):<br><br>'+nome+'<br><br>Your deadline is due in '+DLaft+' days. Should you have any question or require any support, please don’t hesitate to contact us at L-Vale-Global-Tax@vale.com.<br><br>Thank you in advance for your support.<br><br>Global Tax Team</p></body></html>'
								}
							}, function(vSuc){
								console.log(vSuc);
							}, function(vErr){
								console.log(vErr);
							});
					
					
				    console.log("Nome: " + nome);
				    console.log("lbc_nome: " + lbc_nome);
				    console.log("lbc_email: " + lbc_email);
				    console.log("=======");
				}
			}
		});
	
	});	*/
	
	
	
	//===============================
	// Datas de Fechamento do Trimestre
	var dt_4Q_Close = new Date(anoCal, 0, 20, 0, 0, 0);
	var dt_1Q_Close = new Date(anoCal, 3, 20, 0, 0, 0);
	var dt_2Q_Close = new Date(anoCal, 6, 20, 0, 0, 0);
	var dt_3Q_Close = new Date(anoCal, 9, 20, 0, 0, 0);
	
	var TTC_1Q_Close = schedule.scheduleJob(dt_1Q_Close, updt_Quarter.bind(null, 1, false, anoCal));
	var TTC_2Q_Close = schedule.scheduleJob(dt_2Q_Close, updt_Quarter.bind(null, 2, false, anoCal));
	var TTC_3Q_Close = schedule.scheduleJob(dt_3Q_Close, updt_Quarter.bind(null, 3, false, anoCal));
	var TTC_4Q_Close = schedule.scheduleJob(dt_4Q_Close, updt_Quarter.bind(null, 4, false, anoCal));
	//===============================
	
	//===============================
	// Datas de Abertura do Trimestre
	var dt_4Q_Open = new Date(anoCal, 9, 21, 0, 0, 0);
	var dt_1Q_Open = new Date(anoCal, 0, 21, 0, 0, 0);
	var dt_2Q_Open = new Date(anoCal, 3, 21, 0, 0, 0);
	var dt_3Q_Open = new Date(anoCal, 6, 21, 0, 0, 0);
	
	var TTC_1Q_Open = schedule.scheduleJob(dt_1Q_Open, updt_Quarter.bind(null, 1, true, anoCal));
	var TTC_2Q_Open = schedule.scheduleJob(dt_2Q_Open, updt_Quarter.bind(null, 2, true, anoCal));
	var TTC_3Q_Open = schedule.scheduleJob(dt_3Q_Open, updt_Quarter.bind(null, 3, true, anoCal));
	var TTC_4Q_Open = schedule.scheduleJob(dt_4Q_Open, updt_Quarter.bind(null, 4, true, anoCal));
	//===============================
	
	//===============================
	// Datas de Envio de Email Notif. Faltando 15 Dias Fechamento Trimestre
	/*
	var dt_Close_1Q_15d_Us = new Date(anoCal, 3, 5, 0, 0, 0);
	var dt_Close_2Q_15d_Us = new Date(anoCal, 6, 5, 0, 0, 0);
	var dt_Close_3Q_15d_Us = new Date(anoCal, 9, 5, 0, 0, 0);
	var dt_Close_4Q_15d_Us = new Date(anoCal, 0, 5, 0, 0, 0);
	*/
	
	// TESTE DIA 23 SIMULANDO 15 dias por 15 mins Antes dos horarios de fechamento
	var dt_Close_1Q_15d_Us = new Date(anoCal, 10, 23, 12, 45, 0);
	var dt_Close_2Q_15d_Us = new Date(anoCal, 10, 23, 13, 45, 0);
	var dt_Close_3Q_15d_Us = new Date(anoCal, 10, 23, 14, 45, 0);
	var dt_Close_4Q_15d_Us = new Date(anoCal, 10, 23, 15, 45, 0);
	
	var TTC_Close_1Q_15d_Us = schedule.scheduleJob(dt_Close_1Q_15d_Us, send_Not_Email.bind(null, 1, anoCal, 15));
	var TTC_Close_2Q_15d_Us = schedule.scheduleJob(dt_Close_2Q_15d_Us, send_Not_Email.bind(null, 2, anoCal, 15));
	var TTC_Close_3Q_15d_Us = schedule.scheduleJob(dt_Close_3Q_15d_Us, send_Not_Email.bind(null, 3, anoCal, 15));
	var TTC_Close_4Q_15d_Us = schedule.scheduleJob(dt_Close_4Q_15d_Us, send_Not_Email.bind(null, 4, anoCal, 15));
	//===============================
	
	//===============================
	// Datas de Envio de Email Notif. Faltando 5 Dias Fechamento Trimestre
	/*
	var dt_Close_1Q_5d_Us = new Date(anoCal, 3, 15, 0, 0, 0);
	var dt_Close_2Q_5d_Us = new Date(anoCal, 6, 15, 0, 0, 0);
	var dt_Close_3Q_5d_Us = new Date(anoCal, 9, 15, 0, 0, 0);
	var dt_Close_4Q_5d_Us = new Date(anoCal, 0, 15, 0, 0, 0);
	*/
	
	// TESTE DIA 23 SIMULANDO 5 dias por 5 mins Antes dos horarios de fechamento
	var dt_Close_1Q_5d_Us = new Date(anoCal, 10, 23, 12, 55, 0);
	var dt_Close_2Q_5d_Us = new Date(anoCal, 10, 23, 13, 55, 0);
	var dt_Close_3Q_5d_Us = new Date(anoCal, 10, 23, 14, 55, 0);
	var dt_Close_4Q_5d_Us = new Date(anoCal, 10, 23, 15, 55, 0);
	
	
	var TTC_Close_1Q_5d_Us = schedule.scheduleJob(dt_Close_1Q_5d_Us, send_Not_Email.bind(null, 1, anoCal, 5));
	var TTC_Close_2Q_5d_Us = schedule.scheduleJob(dt_Close_2Q_5d_Us, send_Not_Email.bind(null, 2, anoCal, 5));
	var TTC_Close_3Q_5d_Us = schedule.scheduleJob(dt_Close_3Q_5d_Us, send_Not_Email.bind(null, 3, anoCal, 5));
	var TTC_Close_4Q_5d_Us = schedule.scheduleJob(dt_Close_4Q_5d_Us, send_Not_Email.bind(null, 4, anoCal, 5));
	//===============================
	
	//===============================
	// Datas de Envio de Email Notif. Faltando 3 Dias Fechamento Trimestre
	/*
	var dt_Close_1Q_3d_UsMa = new Date(anoCal, 3, 17, 0, 0, 0);
	var dt_Close_2Q_3d_UsMa = new Date(anoCal, 6, 17, 0, 0, 0);
	var dt_Close_3Q_3d_UsMa = new Date(anoCal, 9, 17, 0, 0, 0);
	var dt_Close_4Q_3d_UsMa = new Date(anoCal, 0, 17, 0, 0, 0);
	*/
	
	// TESTE DIA 23 SIMULANDO 3 dias por 3 mins Antes dos horarios de fechamento
	var dt_Close_1Q_3d_UsMa = new Date(anoCal, 10, 23, 12, 57, 0);
	var dt_Close_2Q_3d_UsMa = new Date(anoCal, 10, 23, 13, 57, 0);
	var dt_Close_3Q_3d_UsMa = new Date(anoCal, 10, 23, 14, 57, 0);
	var dt_Close_4Q_3d_UsMa = new Date(anoCal, 10, 23, 15, 57, 0);
	
	
	var TTC_Close_1Q_3d_UsMa = schedule.scheduleJob(dt_Close_1Q_3d_UsMa, send_Not_Email.bind(null, 1, anoCal, 3));
	var TTC_Close_2Q_3d_UsMa = schedule.scheduleJob(dt_Close_2Q_3d_UsMa, send_Not_Email.bind(null, 2, anoCal, 3));
	var TTC_Close_3Q_3d_UsMa = schedule.scheduleJob(dt_Close_3Q_3d_UsMa, send_Not_Email.bind(null, 3, anoCal, 3));
	var TTC_Close_4Q_3d_UsMa = schedule.scheduleJob(dt_Close_4Q_3d_UsMa, send_Not_Email.bind(null, 4, anoCal, 3));
	//===============================
	
	//===============================
	// Datas de Envio de Email Notif. Faltando 2 Dias Fechamento Trimestre
	/*
	var dt_Close_1Q_2d_UsMa = new Date(anoCal, 3, 18, 0, 0, 0);
	var dt_Close_2Q_2d_UsMa = new Date(anoCal, 6, 18, 0, 0, 0);
	var dt_Close_3Q_2d_UsMa = new Date(anoCal, 9, 18, 0, 0, 0);
	var dt_Close_4Q_2d_UsMa = new Date(anoCal, 0, 18, 0, 0, 0);
	*/
	
	// TESTE DIA 23 SIMULANDO 2 dias por 2 mins Antes dos horarios de fechamento
	var dt_Close_1Q_2d_UsMa = new Date(anoCal, 10, 23, 12, 58, 0);
	var dt_Close_2Q_2d_UsMa = new Date(anoCal, 10, 23, 13, 58, 0);
	var dt_Close_3Q_2d_UsMa = new Date(anoCal, 10, 23, 14, 58, 0);
	var dt_Close_4Q_2d_UsMa = new Date(anoCal, 10, 23, 15, 58, 0);
	
	
	var TTC_Close_1Q_2d_UsMa = schedule.scheduleJob(dt_Close_1Q_2d_UsMa, send_Not_Email.bind(null, 1, anoCal, 2));
	var TTC_Close_2Q_2d_UsMa = schedule.scheduleJob(dt_Close_2Q_2d_UsMa, send_Not_Email.bind(null, 2, anoCal, 2));
	var TTC_Close_3Q_2d_UsMa = schedule.scheduleJob(dt_Close_3Q_2d_UsMa, send_Not_Email.bind(null, 3, anoCal, 2));
	var TTC_Close_4Q_2d_UsMa = schedule.scheduleJob(dt_Close_4Q_2d_UsMa, send_Not_Email.bind(null, 4, anoCal, 2));
	//===============================
	
	//===============================
	// Datas de Envio de Email Notif. Faltando 1 Dia Fechamento Trimestre
	/*
	var dt_Close_1Q_1d_UsMa = new Date(anoCal, 3, 19, 0, 0, 0);
	var dt_Close_2Q_1d_UsMa = new Date(anoCal, 6, 19, 0, 0, 0);
	var dt_Close_3Q_1d_UsMa = new Date(anoCal, 9, 19, 0, 0, 0);
	var dt_Close_4Q_1d_UsMa = new Date(anoCal, 0, 19, 0, 0, 0);
	*/
	
	// TESTE DIA 23 SIMULANDO 1 dia por 1 min Antes dos horarios de fechamento
	var dt_Close_1Q_1d_UsMa = new Date(anoCal, 10, 23, 12, 59, 0);
	var dt_Close_2Q_1d_UsMa = new Date(anoCal, 10, 23, 13, 59, 0);
	var dt_Close_3Q_1d_UsMa = new Date(anoCal, 10, 23, 14, 59, 0);
	var dt_Close_4Q_1d_UsMa = new Date(anoCal, 10, 23, 15, 59, 0);
	
	
	var TTC_Close_1Q_1d_UsMa = schedule.scheduleJob(dt_Close_1Q_1d_UsMa, send_Not_Email.bind(null, 1, anoCal, 1));
	var TTC_Close_2Q_1d_UsMa = schedule.scheduleJob(dt_Close_2Q_1d_UsMa, send_Not_Email.bind(null, 2, anoCal, 1));
	var TTC_Close_3Q_1d_UsMa = schedule.scheduleJob(dt_Close_3Q_1d_UsMa, send_Not_Email.bind(null, 3, anoCal, 1));
	var TTC_Close_4Q_1d_UsMa = schedule.scheduleJob(dt_Close_4Q_1d_UsMa, send_Not_Email.bind(null, 4, anoCal, 1));
	//===============================

	


	
	
	
	
};