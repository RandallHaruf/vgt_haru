"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id__status_obrigacao",
			identity: true
		},
		descricao: {
			nome: "descricao"	
	        }        
	}
};

module.exports = db.model("VGT.DOMINIO_STATUS_OBRIGACAO", oSketch);