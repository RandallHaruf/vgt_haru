"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_rel_tax_package_periodo",
			identity: true
		},
		fkTaxPackage: {
			nome: "fk_tax_package.id_tax_package",
			number: true
		}, 
		fkPeriodo: {
			nome: "fk_periodo.id_periodo",
			number: true
		},
		indAtivo: {
			nome: "ind_ativo"
		},
		statusEnvio: {
			nome: "status_envio"
		},
		dataEnvio: {
			nome: "data_envio"
		}
	} 	
};

module.exports = db.model("VGT.REL_TAX_PACKAGE_PERIODO", oSketch);