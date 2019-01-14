"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_tipo_acesso",
			identity: true
		},
		descricao: {
			nome: "descricao"
		}
	}
};

module.exports = db.model("VGT.DOMINIO_ACESSO_USUARIO", oSketch);