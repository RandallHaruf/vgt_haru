"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_resposta_item_to_report",
			identity: true
		},
		indSeAplica: {
			nome: "ind_se_aplica"
		},
		resposta: {
			nome: "resposta"
		},
		fkRelTaxPackagePeriodo: {
			nome: "fk_rel_tax_package_periodo.id_rel_tax_package_periodo",
			number: true
		},
		fkItemToReport: {
			nome: "fk_item_to_report.id_item_to_report",
			number: true
		}
	} 	
};

module.exports = db.model("VGT.RESPOSTA_ITEM_TO_REPORT", oSketch);