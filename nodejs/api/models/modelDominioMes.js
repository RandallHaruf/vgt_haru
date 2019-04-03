"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_dominio_mes",
			key: true
		},
		nomeMes: {
			nome: "nome_mes"
		},
		mes: {
			nome: "mes"
		}
	}
};

module.exports = db.model("VGT.DOMINIO_MES", oSketch);