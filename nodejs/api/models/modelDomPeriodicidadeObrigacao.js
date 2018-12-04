"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_periodicidade_obrigacao",
			identity: true
		},
		descricao: {
			nome: "descricao"
		}
	}
};

module.exports = db.model("VGT.DOMINIO_PERIODICIDADE_OBRIGACAO", oSketch);