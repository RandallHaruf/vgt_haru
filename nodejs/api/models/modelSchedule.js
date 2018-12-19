"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_schedule",
			identity: true
		},
		fy: {
			nome: "fy"
		},
		yearOfExpiration: {
			nome: "year_of_expiration"
		},
		openingBalance: {
			nome: "opening_balance"
		},
		currentYearValue: {
			nome: "current_year_value"
		},
		currentYearValueUtilized: {
			nome: "current_year_value_utilized"
		},
		adjustments: {
			nome: "adjustments"
		},
		justificativa: {
			nome: "justificativa"
		},
		currentYearValueExpired: {
			nome: "current_year_value_expired"
		},
		closingBalance: {
			nome: "closing_balance"
		},
		obs: {
			nome: "obs"
		},	
		fkRelTaxPackagePeriodo: {
			nome: "fk_rel_tax_package_periodo.id_rel_tax_package_periodo",
			number: true
		},
		fkDominioScheduleTipo: {
			nome: "fk_dominio_schedule_tipo.id_dominio_schedule_tipo",
			number: true
		},
		fkDominioAnoFiscal: {
			nome: "fk_dominio_ano_fiscal.id_dominio_ano_fiscal",
			number: true
		}
	} 	
};

module.exports = db.model("VGT.SCHEDULE", oSketch);