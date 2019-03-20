"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_empresa",
			identity: true
		}, 
		nome: {
			nome: "nome"
		},
		numHFMSAP: {
			nome: "num_hfm_sap"
		},
		tin: {
			nome: "tin"
		},
		jurisdicaoTIN: {
			nome: "jurisdicao_tin"
		},
		ni: {
			nome: "ni"
		},
		jurisdicaoNi: {
			nome: "jurisdicao_ni"
		},
		endereco: {
			nome: "endereco"
		},
		fyStartDate: {
			nome: "fy_start_date"
		},
		fyEndDate: {
			nome: "fy_end_date"
		},
		lbcNome: {
			nome: "lbc_nome"
		},
		lbcEmail: {
			nome: "lbc_email"
		},
		comentarios: {
			nome: "comentarios"
		},
		data_encerramento: {
			nome: "data_encerramento"
		},		
		fkTipoSocietario: {
			nome: "fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario",
			number: true
		},
		fkStatus: {
			nome: "fk_dominio_empresa_status.id_dominio_empresa_status",
			number: true
		},
		fkAliquota: {
			nome: "fk_aliquota.id_aliquota",
			number: true
		},
		fkPais: {
			nome: "fk_pais.id_pais",
			number: true
		}
	} 	
};

module.exports = db.model("VGT.EMPRESA", oSketch);