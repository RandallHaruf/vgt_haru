"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_dominio_jurisdicao"
		}, 
		jurisdicao: {
			nome: "jurisdicao"
		}
	} 	
};

module.exports = db.model("VGT.DOMINIO_JURISDICAO", oSketch);