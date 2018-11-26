"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		fkDominioPais: {
			nome: "fk_dominio_pais.id_dominio_pais"
		}, 
		fkNameOfTax: {
			nome: "fk_name_of_tax.id_name_of_tax"
		}
	} 	
};

module.exports = db.model("VGT.REL_PAIS_NAME_OF_TAX", oSketch);