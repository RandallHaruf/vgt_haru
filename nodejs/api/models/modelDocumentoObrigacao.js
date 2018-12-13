"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_documento",
			identity: true
		},
		fkIdRespostaObrigacao: {
			nome: "fk_id_resposta_obrigacao.id_resposta_obrigacao",
			number: true
		},
		dadosArquivo: {
			nome: "dados_arquivo"
		},
		mimetype: {
			nome: "mimetype"
		},
		tamanho: {
			nome: "tamanho"
		},
		dataUpload: {
			nome: "data_upload"
		},
		fkIdUsuario: {
			nome: "fk_id_usuario.id_usuario",
			number: true
		}
	}
};

module.exports = db.model("VGT.DOCUMENTO_OBRIGACAO", oSketch);