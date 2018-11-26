"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_dominio_pais"
		},
		pais: {
			nome: "pais"
		}
	}
};

module.exports = db.model("VGT.DOMINIO_PAIS", oSketch);