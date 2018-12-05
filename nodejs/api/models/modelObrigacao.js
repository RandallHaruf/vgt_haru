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
			nome: "fk_dominio_pais.id_dominio_pais",
			number: true
		},
		fkDominioPeriocidadeObrigacao: {
			nome: "fk_dominio_periodicidade_obrigacao.id_periodicidade_obrigacao",
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
		fkAnoFiscal: {
			nome: "fk_dominio_ano_fiscal.id_dominio_ano_fiscal",
			number: true
		},
		fkDominioAprovacaoObrigacao: {
			nome: "fk_dominio_aprovacao_obrigacao",
			number: true
		},
		motivoReprovacao: {
			nome: "motivo_reprovacao"
		}
	} 	
};

module.exports = db.model("VGT.OBRIGACAO", oSketch);