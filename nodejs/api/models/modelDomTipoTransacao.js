"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_dominio_tipo_transacao"
		},
		tipoTransacao: {
			nome: "tipo_transacao"
		}
	}
};

module.exports = db.model("VGT.DOMINIO_TIPO_TRANSACAO", oSketch);