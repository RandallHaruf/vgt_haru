"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_requisicao_reabertura_tax_package",
			identity: true
		},
		dataRequisicao: {
			nome: "data_requisicao"
		},
        idUsuario: {
            nome: "id_usuario"
        },
        nomeUsuario: {
            nome:"nome_usuario"
        },
        justificativa: {
            nome:"justificativa"
        },
        resposta: {
            nome: "resposta"
        },
        fkDominioRequisicaoReaberturaStatus: {
            nome: "fk_dominio_requisicao_reabertura_status.id_dominio_requisicao_reabertura_status",
            number: true
        },              
        fkIdRelTaxPackagePeriodo: {
            nome: "fk_id_rel_tax_package_periodo.id_rel_tax_package_periodo",
            number: true
        }
	}
};

module.exports = db.model("VGT.REQUISICAO_REABERTURA_TAX_PACKAGE", oSketch);