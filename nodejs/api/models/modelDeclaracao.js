"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: {
			nome: "id_declaracao",
			identity: true
		},
		nomeArquivo: {
			nome: "nome_arquivo"
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
        dataEnvioDeclaracao: {
            nome: "data_envio_declaracao"
        },
        indDeclaracao: {
            nome: "ind_declaracao"
        },
        fkRelTaxPackagePeriodo: {
            nome: "fk_rel_tax_package_periodo.id_rel_tax_package_periodo"
        }
	}
};

module.exports = db.model("VGT.DECLARACAO", oSketch);