"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_schedule_value_utilized",
			identity: true,
			key: true
		},
		scheduleFY: {
			nome: "schedule_fy"
		},
		valor: {
			nome: "valor"
		},
		obs: {
			nome: "obs"
		},
		fkDominioScheduleValueUtilizedTipo: {
			nome: "fk_dominio_schedule_value_utilized_tipo.id_dominio_schedule_value_utilized_tipo"
		},
		fkTaxReconciliation: {
			nome: "fk_tax_reconciliation.id_tax_reconciliation"
		}
	} 	
};

module.exports = db.model("VGT.SCHEDULE_VALUE_UTILIZED", oSketch);