"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_modelo",
			identity: true
		},
		nomeObrigacao: {
			nome: "nome_obrigacao"
		},
		dataInicial: {
			nome: "data_inicial"
		},
		dataFinal: {
			nome: "data_final"
		},
		prazoEntrega: {
			nome: "prazo_entrega"
		},
		fkIdPais: {
			nome: "fk_id_pais.id_pais",
			number: true
		},
		fkIdDominioPeriodicidade: {
			nome: "fk_id_dominio_periodicidade.id_dominio_periodicidade",
			number: true
		},
		fkIdDominioObrigacaoStatus: {
			nome: "fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status",
			number: true
		}
	} 	
};

module.exports = db.model("VGT.MODELO_OBRIGACAO", oSketch);