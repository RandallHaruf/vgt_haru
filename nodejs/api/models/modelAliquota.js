"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_aliquota",
			identity: true
		},
		nome: {
			nome: "nome"
		},
		valor: {
			nome: "valor"
		},
		dataInicio: {
			nome: "data_inicio"
		},
		dataFim: {
			nome: "data_fim"
		},
		fkTipo: {
			nome: "fk_dominio_aliquota_tipo.id_dominio_aliquota_tipo"
		}
	}
};

module.exports = db.model("VGT.ALIQUOTA", oSketch);