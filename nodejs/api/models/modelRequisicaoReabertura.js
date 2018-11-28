"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_requisicao_reabertura",
			identity: true
		}, 
		dataRequisicao: {
			nome: "data_requisicao"
		}, 
		idUsuario: {
			nome: "id_usuario",
			number: true
		}, 
		nomeUsuario: {
			nome: "nome_usuario"
		}, 
		justificativa: {
			nome: "justificativa"
		}, 
		resposta: {
			nome: "resposta"
		}, 
		fkDominioRequisicaoReaberturaStatus: {
			nome: "fk_dominio_requisicao_reabertura_status.id_dominio_requisicao_reabertura_status",
			number: true
		}, 
		fkEmpresa: {
			nome: "fk_empresa.id_empresa",
			number: true
		}, 
		fkPeriodo: {
			nome: "fk_periodo.id_periodo",
			number: true
		}
	} 	
};

module.exports = db.model("VGT.REQUISICAO_REABERTURA", oSketch);