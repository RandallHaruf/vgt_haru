"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		fkUsuario: {
            nome: "fk_usuario.id_usuario",
            number: true
        },
        fkModulo:{
        	nome: "fk_dominio_modulo.id_dominio_modulo",
        	number: true
        }
	}
};

module.exports = db.model("VGT.REL_USUARIO_MODULO", oSketch);