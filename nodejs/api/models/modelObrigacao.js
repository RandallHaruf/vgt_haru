"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_obrigacao",
			identity: true
		}, 
		prazo_entrega: {
			nome: "prazo_entrega"
		},
		extensao: {
			nome: "extensao"
		},
		obrigacao_inicial: {
			nome: "obrigacao_inicial"
		},
		suporte_contratado: {
			nome: "suporte_contratado"
		},
		suporte: {
			nome: "suporte"
		},
		observacoes: {
			nome: "observacoes"
		},
		fkDominioStatusObrigacao: {
			nome: "fk_dominio_status_obrigacao.id_status_obrigacao",
			number: true
		},
		fkDominioPais: {
			nome: "fk_dominio_pais.id_pais",
			number: true
		},
		fkDominioPeriocidadeObrigacao: {
			nome: "fk_dominio_periocidade_obrigacao.id_periocidade_obrigacao",
			number: true
		},
		fkEmpresa: {
			nome: "fk_empresa.id_empresa",
			number: true
		},
		fkObrigacaoAcessoria: {
			nome: "fk_obrigacao_acessoria.id_obrigacao_acessoria",
			number: true
		},
		fkObrigacaoAcessoria: {
			nome: "fk_obrigacao_acessoria.id_obrigacao_acessoria",
			number: true
		},
		fkAnoFiscal: {
			nome: "fk_Ano_Fiscal.id_dominio_fiscal",
			number: true
		},
	} 	
};

module.exports = db.model("VGT.OBRIGACAO", oSketch);