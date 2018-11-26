"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_hs_pais_aliquota",
			identity: true
		},
		fkPais: {
			nome: "fk_pais.id_pais",
			number: true
		},
		fkAliquota: {
			nome: "fk_aliquota.id_aliquota",
			number: true
		},
		dataInicio: {
			nome: "data_inicio"
		},
		dataFim: {
			nome: "data_fim"
		}
	}
};

module.exports = db.model("VGT.HS_PAIS_ALIQUOTA", oSketch);