"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_antecipacao",
			identity: true
		},
		valor: {
			nome: "valor"
		},
		descricao: {
			nome: "descricao"
		},
		fkTaxReconciliation: {
			nome: "fk_tax_reconciliation.id_tax_reconciliation",
			number: true
		},
		fkPagamento: {
			nome: "fk_pagamento"
		}
	}
};

module.exports = db.model("VGT.ANTECIPACAO", oSketch);