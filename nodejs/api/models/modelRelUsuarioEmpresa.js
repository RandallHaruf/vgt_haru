"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		fkUsuario: {
            nome: "fk_usuario.id_usuario",
            number: true
        },
        fkEmpresa:{
        	nome: "fk_empresa.id_empresa",
        	number: true
        }
	}
};

module.exports = db.model("VGT.REL_USUARIO_EMPRESA", oSketch);