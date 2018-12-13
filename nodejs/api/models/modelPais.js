"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_pais",
			identity: true
		}, 
		prescricaoPrejuizo: {
			nome: "prescricao_prejuizo"
		}, 
		limitacaoUtilizacaoPrejuizo: {
			nome: "limite_utilizacao_prejuizo"
		}, 
		prescricaoCredito: {
			nome: "prescricao_credito"
		},
		indExtensaoCompliance: {
			nome: "ind_extensao_compliance"
		},
		indExtensaoBeps: {
			nome: "ind_extensao_beps"
		},
		fkDomPais: {
			nome: "fk_dominio_pais.id_dominio_pais",
			number: true
		},
		fkDomPaisStatus: {
			nome: "fk_dominio_pais_status.id_dominio_pais_status",
			number: true
		},
		fkAliquota: {
			nome: "fk_aliquota.id_aliquota",
			number: true
		},
		fkDomPaisRegiao: {
			nome: "fk_dominio_pais_regiao.id_dominio_pais_regiao",
			number: true
		}
	} 	
};

module.exports = db.model("VGT.PAIS", oSketch);