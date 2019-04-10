"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_tax",
			identity: true
		},
		tax: {
			nome: "tax"
		},
		fkCategory: {
			nome: "fk_category.id_tax_category",
			number: true
		},
		indExportavelTaxPackage: {
			nome: "ind_exportavel_tax_package"
		}
	} 	
};

module.exports = db.model("VGT.TAX", oSketch);