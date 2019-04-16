"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_requisicao_modelo_obrigacao",
			key: true,
			identity: true
		},
		dataRequisicao: {
			nome: "data_requisicao"
		},
		justificativa: {
			nome: "justificativa"
		},
		resposta: {
			nome: "resposta"
		},
		dataResposta: {
			nome: "data_resposta"
		},
		fkUsuario: {
			nome: "fk_usuario.id_usuario"
		},
		fkEmpresa: {
			nome: "fk_empresa.id_empresa"
		},
		fkModeloObrigacao: {
			nome: "fk_modelo_obrigacao.id_modelo"
		},
		fkDominioRequisicaoModeloObrigacaoStatus: {
			nome: "fk_dominio_requisicao_modelo_obrigacao_status.id_dominio_requisicao_modelo_obrigacao_status"
		}
	}
};

module.exports = db.model("VGT.REQUISICAO_MODELO_OBRIGACAO", oSketch);