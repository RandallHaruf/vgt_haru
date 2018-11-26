"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		fkEmpresa: {
			nome: "fk_empresa.id_empresa"
		}, 
		fkPeriodo: {
			nome: "fk_periodo.id_periodo"
		},
		indicadorAtivo: {
			nome: "ind_ativo"
		}
	} 	
};

module.exports = db.model("VGT.REL_EMPRESA_PERIODO", oSketch);