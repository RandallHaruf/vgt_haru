"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_dominio_pais_status"
		},
		status: {
			nome: "status"
		}
	}
};

module.exports = db.model("VGT.DOMINIO_PAIS_STATUS", oSketch);