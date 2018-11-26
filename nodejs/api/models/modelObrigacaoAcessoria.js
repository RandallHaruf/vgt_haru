"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_obrigacao_acessoria",
			identity: true
		}, 
		nome: {
			nome: "nome"
		},
		dataInicio: {
			nome: "data_inicio"
		},
		dataFim: {
			nome: "data_fim"
		},
		fkDominioObrigacaoAcessoriaTipo: {
			nome: "fk_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo",
			number: true
		}
	} 	
};

module.exports = db.model("VGT.OBRIGACAO_ACESSORIA", oSketch);