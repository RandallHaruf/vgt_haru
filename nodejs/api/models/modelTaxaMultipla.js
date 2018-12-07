"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_taxa_multipla",
			identity: true
		},
		descricao: {
			nome: "descricao"
		},
		valor: {
			nome: "valor"
		},
		fkDominioTipoTaxaMultipla: {
			nome: "fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla",
			number: true
		},
		fkTaxReconciliation: {
			nome: "fk_tax_reconciliation.id_tax_reconciliation",
			number: true
		}
	} 	
};

module.exports = db.model("VGT.TAXA_MULTIPLA", oSketch);