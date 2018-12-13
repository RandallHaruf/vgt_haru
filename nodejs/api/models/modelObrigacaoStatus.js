"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_obrigacao_status",
			identity: true
		},
		descricaoObrigacaoStatus: {
			nome: "descricao_obrigacao_status"
		}
	} 	
};

module.exports = db.model("VGT.DOMINIO_OBRIGACAO_STATUS", oSketch);