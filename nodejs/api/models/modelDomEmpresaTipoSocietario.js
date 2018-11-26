"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_dominio_empresa_tipo_societario"
		}, 
		tipoSocietario: {
			nome: "tipo_societario"
		}
	} 	
};

module.exports = db.model("VGT.DOMINIO_EMPRESA_TIPO_SOCIETARIO", oSketch);