"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_dominio_modulo",
			identity: true
		},
		modulo: {
			nome: "modulo"
		}
	}
};

module.exports = db.model("VGT.DOMINIO_MODULO", oSketch);