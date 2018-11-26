"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_tax_category",
			identity: true
		},
		category: {
			nome: "category"
		},
		fkDominioTaxClassification: {
			nome: "fk_dominio_tax_classification.id_dominio_tax_classification",
			number: true
		}
	} 	
};

module.exports = db.model("VGT.TAX_CATEGORY", oSketch);