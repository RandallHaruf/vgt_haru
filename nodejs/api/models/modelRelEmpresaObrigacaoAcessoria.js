"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id",
			identity: true
		},
		fkEmpresa: {
			nome: "fk_empresa.id_empresa"
		},
		fkObrigacaoAcessoria: {
			nome: "fk_obrigacao_acessoria.id_obrigacao_acessoria"
		},
		dataInicio: {
			nome: "data_inicio"
		},
		dataFim: {
			nome: "data_fim"
		},
		indicadorHistorico: {
			nome: "ind_historico"
		}
	} 	
};

module.exports = db.model("VGT.REL_EMPRESA_OBRIGACAO_ACESSORIA", oSketch);