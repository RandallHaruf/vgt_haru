//modelDomRequisicaoModeloObrigacaoStatus
"use strict";

var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_dominio_requisicao_modelo_obrigacao_status"
		},
		status: {
			nome: "status_requisicao_obrigacao"
		}
	}
};

module.exports = db.model("VGT.DOMINIO_REQUISICAO_MODELO_OBRIGACAO_STATUS", oSketch);