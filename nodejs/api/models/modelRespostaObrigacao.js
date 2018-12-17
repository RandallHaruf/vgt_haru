"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_resposta_obrigacao",
			identity: true
		},
		suporteContratado: {
			nome: "suporte_contratado"
		},
		suporteEspecificacao: {
			nome: "suporte_especificacao"
		},
		suporteValor: {
			nome: "suporte_valor"
		},
		fkIdDominioMoeda: {
			nome: "fk_id_dominio_moeda.id_dominio_moeda",
			number: true
		},
		fkIdRelModeloEmpresa: {
			nome: "fk_id_rel_modelo_empresa.id_rel_modelo_empresa",
			number: true
		},
		fkIdDominioAnoFiscal: {
			nome: "fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal",
			number: true
		},
		fkIdDominioAnoCalendario:{
			nome: "fk_id_dominio_ano_calendario.id_dominio_ano_calendario",
			number: true
		},
		fkIdDominioObrigacaoStatusResposta:{
			nome: "fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status",
			number: true
		}
	} 	
};

module.exports = db.model("VGT.RESPOSTA_OBRIGACAO", oSketch);