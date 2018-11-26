"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_diferenca_opcao",
			identity: true
		},
		nome: {
			nome: "nome"
		},
		fkDominioDiferencaTipo: {
			nome: "fk_dominio_diferenca_tipo.id_dominio_diferenca_tipo",
			number: true
		}
	}
};

module.exports = db.model("VGT.DIFERENCA_OPCAO", oSketch);