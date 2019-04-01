"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		fkRelModeloEmpresa: {
			nome: "fk_id_rel_modelo_empresa.id_rel_modelo_empresa",
			key: true
		},
		fkDominioAnoCalendarioInicial: {
			nome: "fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario",
			key: true
		},
		fkDominioAnoCalendarioFinal: {
			nome: "fk_dominio_ano_calendario_final.id_dominio_ano_calendario",
			key: true
		}
	}
};

module.exports = db.model("VGT.VIGENCIA_CUSTOMIZADA", oSketch);