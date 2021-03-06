"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_template_report",
			identity: true,
			key: true
		}, 
		tela: {
			nome: "tela"
		}, 
		parametros: {
			nome: "parametros"
		},  
		descricao: {
			nome: "descricao"
		}, 
		fkUsuario: {
			nome: "fk_usuario.id_usuario"
		}, 
		indDefault: {
			nome: "ind_default"
		}, 		
		isIFrame: {
			nome: "ind_isIFrame"
		}
	} 	
};

module.exports = db.model("VGT.TEMPLATE_REPORT", oSketch);