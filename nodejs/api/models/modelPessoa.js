"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_pessoa",
			identity: true
		}, 
		nome: {
			nome: "nome"
		}, 
		idade: {
			nome: "idade"
		}, 
		altura: {
			nome: "altura"
		}
	} 	
};

module.exports = db.model("artifact.PESSOA", oSketch);