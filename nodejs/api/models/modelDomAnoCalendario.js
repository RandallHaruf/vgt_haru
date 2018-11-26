"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_dominio_ano_calendario"
		},
		anoCalendario: {
			nome: "ano_calendario"
		}
	}
};

module.exports = db.model("VGT.DOMINIO_ANO_CALENDARIO", oSketch);