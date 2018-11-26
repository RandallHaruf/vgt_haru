"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_dominio_moeda"
		}, 
		acronimo: {
			nome: "acronimo"
		},
		nome: {
			nome: "nome"
		}
	} 	
};

module.exports = db.model("VGT.DOMINIO_MOEDA", oSketch);