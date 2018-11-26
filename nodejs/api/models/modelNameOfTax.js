"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_name_of_tax",
			identity: true
		},
		nameOfTax: {
			nome: "name_of_tax"
		},
		fkTax: {
			nome: "fk_tax.id_tax",
			number: true
		},
		indDefault: {
			nome: "ind_default"
		}
	} 	
};

module.exports = db.model("VGT.NAME_OF_TAX", oSketch);