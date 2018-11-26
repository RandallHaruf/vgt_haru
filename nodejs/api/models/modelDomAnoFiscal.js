"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_dominio_ano_fiscal"
		},
		anoCalendario: {
			nome: "ano_fiscal"
		}
	}
};

module.exports = db.model("VGT.DOMINIO_ANO_FISCAL", oSketch);