"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_dominio_pais_regiao"
		},
		regiao: {
			nome: "regiao"
		}
	}
};

module.exports = db.model("VGT.DOMINIO_PAIS_REGIAO", oSketch);