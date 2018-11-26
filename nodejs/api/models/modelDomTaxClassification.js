"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_dominio_tax_classification"
		},
		classification: {
			nome: "classification"
		}
	}
};

module.exports = db.model("VGT.DOMINIO_TAX_CLASSIFICATION", oSketch);