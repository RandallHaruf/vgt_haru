"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_valor_aliquota",			
			identity: true,
			key: true
		},
		valor: {
			nome: "valor"						
		},
		fkAliquota: {
			nome: "fk_aliquota.id_aliquota"			
		},
		fkDominioAnoFiscal: {
			nome: "fk_dominio_ano_fiscal.id_dominio_ano_fiscal"			
		}
	}
};

module.exports = db.model("VGT.VALOR_ALIQUOTA", oSketch);