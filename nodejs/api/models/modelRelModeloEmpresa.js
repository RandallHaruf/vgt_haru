"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_rel_modelo_empresa",
			identity: true
		},
		fkIdModeloObrigacao: {
			nome: "fk_id_modelo_obrigacao.id_modelo",
			number: true
		},
		fkIdEmpresa: {
			nome: "fk_id_empresa.id_empresa",
			number: true
		},
		fkIdDominioObrigacaoStatus: {
			nome: "fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status",
			number: true
		},
		prazoEntregaCustomizado:{
			nome: "prazo_entrega_customizado"
		},
		indAtivo:{
			nome: "ind_ativo"
		}
	} 	
};

module.exports = db.model("VGT.REL_MODELO_EMPRESA", oSketch);