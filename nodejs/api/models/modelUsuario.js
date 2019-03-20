"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_usuario",
			identity: true
		},
		nome: {
			nome: "nome"
		},
        email: {
            nome: "email"
        },
        contato: {
            nome:"contato"
        },
        user: {
            nome:"user"
        },
        pass: {
            nome: "pass"
        },
        indAtivo: {
            nome: "ind_ativo"
        },
        fkDominioTipoAcesso: {
            nome: "fk_dominio_tipo_acesso.id_tipo_acesso",
            number: true
        },
        emailGestor: {
        	nome: "email_gestor"
        }
	}
};

module.exports = db.model("VGT.USUARIO", oSketch);