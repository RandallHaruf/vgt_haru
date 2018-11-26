"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_dominio_aliquota_tipo"
		},
		tipo: {
			nome: "tipo"
		}
	}
};

module.exports = db.model("VGT.DOMINIO_ALIQUOTA_TIPO", oSketch);