"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "fk_usuario.id_usuario",			
			number: true
		},
		modulo: {
			nome: "fk_dominio_modulo_id_dominio_modulo",
			number: true		
		}
	}
};

module.exports = db.model("VGT.REL_USUARIO_MODULO", oSketch);