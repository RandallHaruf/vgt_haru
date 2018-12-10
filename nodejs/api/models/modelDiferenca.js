"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_diferenca",
			identity: true
		},
		outro: {
			nome: "outro"
		},
		valor: {
			nome: "valor"
		},
		fkTaxReconciliation: {
			nome: "fk_diferenca_opcao.id_diferenca_opcao",
			number: true
		},
		fkPagamento: {
			nome: "fk_tax_reconciliation.id_tax_reconciliation",
			number: true
		},
		fkAgregadoDiferenca: {
			nome: "fk_agregado_diferenca.id_agregado_diferenca",
			number: true
		}
	}
};

module.exports = db.model("VGT.DIFERENCA", oSketch);