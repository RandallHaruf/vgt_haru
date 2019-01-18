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
			nome: "fk_id_dominio_periodicidade.id_periodicidade_obrigacao",
			number: true
		},
		fkIdDominioObrigacaoStatus: {
			nome: "fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status",
			number: true
		},
		fkIdDominioObrigacaoAcessoriaTipo: {
			nome: "fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo",
			number: true
		},
		anoObrigacao: {
			nome: "ano_obrigacao"
		}
	} 	
};

module.exports = db.model("VGT.MODELO_OBRIGACAO", oSketch);