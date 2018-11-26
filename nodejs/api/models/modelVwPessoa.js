"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_pessoa",
			identity: true
		},
		nome: {
			nome: "nome"
		}
	}
};

module.exports = db.model("artifact.Views.VW_PESSOA", oSketch);