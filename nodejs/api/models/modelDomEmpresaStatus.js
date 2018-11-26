"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_dominio_empresa_status"
		}, 
		status: {
			nome: "status"
		}
	} 	
};

module.exports = db.model("VGT.DOMINIO_EMPRESA_STATUS", oSketch);