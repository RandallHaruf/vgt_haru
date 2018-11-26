"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_dominio_diferenca_tipo"
		},
		tipo: {
			nome: "tipo"
		}
	}
};

module.exports = db.model("VGT.DOMINIO_DIFERENCA_TIPO", oSketch);