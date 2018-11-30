"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_dominio_requisicao_reabertura_status",
			identity: true
		}, 
		status: {
			nome: "status"
		}		
	} 	
};

module.exports = db.model("VGT.DOMINIO_REQUISICAO_REABERTURA_STATUS", oSketch);