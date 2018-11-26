"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_item_to_report",
			identity: true
		},
		pergunta: {
			nome: "pergunta"
		},
		flagSimNao: {
			nome: "flag_sim_nao"
		},
		flagAno: {
			nome: "flag_ano"
		}
	} 	
};

module.exports = db.model("VGT.ITEM_TO_REPORT", oSketch);