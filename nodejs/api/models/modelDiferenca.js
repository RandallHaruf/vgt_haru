"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_diferenca",
			identity: true
		},
		outro: {
			nome: "outro"
		},
		fkDiferencaOpcao: {
			nome: "fk_diferenca_opcao.id_diferenca_opcao",
			number: true
		}
	}
};

module.exports = db.model("VGT.DIFERENCA", oSketch);