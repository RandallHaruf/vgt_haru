"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_hs_empresa_aliquota",
			identity: true
		},
		fkEmpresa: {
			nome: "fk_empresa.id_empresa",
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

module.exports = db.model("VGT.HS_EMPRESA_ALIQUOTA", oSketch);