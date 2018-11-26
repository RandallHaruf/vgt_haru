"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_dominio_obrigacao_acessoria_tipo"
		}, 
		tipo: {
			nome: "tipo"
		}
	} 	
};

module.exports = db.model("VGT.DOMINIO_OBRIGACAO_ACESSORIA_TIPO", oSketch);