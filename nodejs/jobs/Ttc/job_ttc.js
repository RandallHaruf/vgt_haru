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

	
}

module.exports = function () {
	var schedule = require('node-schedule');
	
	var anoCal = (new Date()).getFullYear();
	
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
	var dt_Close_1Q_15d_Us = new Date(anoCal, 3, 5, 0, 0, 0);
	var dt_Close_2Q_15d_Us = new Date(anoCal, 6, 5, 0, 0, 0);
	var dt_Close_3Q_15d_Us = new Date(anoCal, 9, 5, 0, 0, 0);
	var dt_Close_4Q_15d_Us = new Date(anoCal, 0, 5, 0, 0, 0);
	
	var TTC_Close_1Q_15d_Us = schedule.scheduleJob(dt_Close_1Q_15d_Us, send_Not_Email.bind(null, 1, anoCal, 15));
	var TTC_Close_2Q_15d_Us = schedule.scheduleJob(dt_Close_2Q_15d_Us, send_Not_Email.bind(null, 2, anoCal, 15));
	var TTC_Close_3Q_15d_Us = schedule.scheduleJob(dt_Close_3Q_15d_Us, send_Not_Email.bind(null, 3, anoCal, 15));
	var TTC_Close_4Q_15d_Us = schedule.scheduleJob(dt_Close_4Q_15d_Us, send_Not_Email.bind(null, 4, anoCal, 15));
	//===============================
	
	//===============================
	// Datas de Envio de Email Notif. Faltando 5 Dias Fechamento Trimestre
	var dt_Close_1Q_5d_Us = new Date(anoCal, 3, 15, 0, 0, 0);
	var dt_Close_2Q_5d_Us = new Date(anoCal, 6, 15, 0, 0, 0);
	var dt_Close_3Q_5d_Us = new Date(anoCal, 9, 15, 0, 0, 0);
	var dt_Close_4Q_5d_Us = new Date(anoCal, 0, 15, 0, 0, 0);
	
	var TTC_Close_1Q_5d_Us = schedule.scheduleJob(dt_Close_1Q_5d_Us, send_Not_Email.bind(null, 1, anoCal, 5));
	var TTC_Close_2Q_5d_Us = schedule.scheduleJob(dt_Close_2Q_5d_Us, send_Not_Email.bind(null, 2, anoCal, 5));
	var TTC_Close_3Q_5d_Us = schedule.scheduleJob(dt_Close_3Q_5d_Us, send_Not_Email.bind(null, 3, anoCal, 5));
	var TTC_Close_4Q_5d_Us = schedule.scheduleJob(dt_Close_4Q_5d_Us, send_Not_Email.bind(null, 4, anoCal, 5));
	//===============================
	
	//===============================
	// Datas de Envio de Email Notif. Faltando 3 Dias Fechamento Trimestre
	var dt_Close_1Q_3d_UsMa = new Date(anoCal, 3, 17, 0, 0, 0);
	var dt_Close_2Q_3d_UsMa = new Date(anoCal, 6, 17, 0, 0, 0);
	var dt_Close_3Q_3d_UsMa = new Date(anoCal, 9, 17, 0, 0, 0);
	var dt_Close_4Q_3d_UsMa = new Date(anoCal, 0, 17, 0, 0, 0);
	
	var TTC_Close_1Q_3d_UsMa = schedule.scheduleJob(dt_Close_1Q_3d_UsMa, send_Not_Email.bind(null, 1, anoCal, 3));
	var TTC_Close_2Q_3d_UsMa = schedule.scheduleJob(dt_Close_2Q_3d_UsMa, send_Not_Email.bind(null, 2, anoCal, 3));
	var TTC_Close_3Q_3d_UsMa = schedule.scheduleJob(dt_Close_3Q_3d_UsMa, send_Not_Email.bind(null, 3, anoCal, 3));
	var TTC_Close_4Q_3d_UsMa = schedule.scheduleJob(dt_Close_4Q_3d_UsMa, send_Not_Email.bind(null, 4, anoCal, 3));
	//===============================
	
	//===============================
	// Datas de Envio de Email Notif. Faltando 2 Dias Fechamento Trimestre
	var dt_Close_1Q_2d_UsMa = new Date(anoCal, 3, 18, 0, 0, 0);
	var dt_Close_2Q_2d_UsMa = new Date(anoCal, 6, 18, 0, 0, 0);
	var dt_Close_3Q_2d_UsMa = new Date(anoCal, 9, 18, 0, 0, 0);
	var dt_Close_4Q_2d_UsMa = new Date(anoCal, 0, 18, 0, 0, 0);
	
	var TTC_Close_1Q_2d_UsMa = schedule.scheduleJob(dt_Close_1Q_2d_UsMa, send_Not_Email.bind(null, 1, anoCal, 2));
	var TTC_Close_2Q_2d_UsMa = schedule.scheduleJob(dt_Close_2Q_2d_UsMa, send_Not_Email.bind(null, 2, anoCal, 2));
	var TTC_Close_3Q_2d_UsMa = schedule.scheduleJob(dt_Close_3Q_2d_UsMa, send_Not_Email.bind(null, 3, anoCal, 2));
	var TTC_Close_4Q_2d_UsMa = schedule.scheduleJob(dt_Close_4Q_2d_UsMa, send_Not_Email.bind(null, 4, anoCal, 2));
	//===============================
	
	//===============================
	// Datas de Envio de Email Notif. Faltando 1 Dia Fechamento Trimestre
	var dt_Close_1Q_1d_UsMa = new Date(anoCal, 3, 19, 0, 0, 0);
	var dt_Close_2Q_1d_UsMa = new Date(anoCal, 6, 19, 0, 0, 0);
	var dt_Close_3Q_1d_UsMa = new Date(anoCal, 9, 19, 0, 0, 0);
	var dt_Close_4Q_1d_UsMa = new Date(anoCal, 0, 19, 0, 0, 0);
	
	var TTC_Close_1Q_1d_UsMa = schedule.scheduleJob(dt_Close_1Q_1d_UsMa, send_Not_Email.bind(null, 1, anoCal, 1));
	var TTC_Close_2Q_1d_UsMa = schedule.scheduleJob(dt_Close_2Q_1d_UsMa, send_Not_Email.bind(null, 2, anoCal, 1));
	var TTC_Close_3Q_1d_UsMa = schedule.scheduleJob(dt_Close_3Q_1d_UsMa, send_Not_Email.bind(null, 3, anoCal, 1));
	var TTC_Close_4Q_1d_UsMa = schedule.scheduleJob(dt_Close_4Q_1d_UsMa, send_Not_Email.bind(null, 4, anoCal, 1));
	//===============================

	


	
	
	
	
};