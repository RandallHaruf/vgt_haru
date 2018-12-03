"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		fkRespostaItemToReport: {
			nome: "fk_resposta_item_to_report.id_resposta_item_to_report"
		}, 
		fkDominioAnoFiscal: {
			nome: "fk_dominio_ano_fiscal.id_dominio_ano_fiscal"
		}
	} 	
};

module.exports = db.model("VGT.REL_RESPOSTA_ITEM_TO_REPORT_ANO_FISCAL", oSketch);