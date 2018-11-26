
"use strict";

module.exports = function (aRoutes) {
	var aliquota = require("../controllers/controllerAliquota");
	var express = require("express");
	
	aRoutes.push(express.Router().get("/Aliquota", aliquota.listarRegistros));
	aRoutes.push(express.Router().post("/Aliquota", aliquota.criarRegistro));
	
	aRoutes.push(express.Router().get("/Aliquota/:idAliquota", aliquota.lerRegistro));
	aRoutes.push(express.Router().put("/Aliquota/:idAliquota", aliquota.atualizarRegistro));
	aRoutes.push(express.Router().delete("/Aliquota/:idAliquota", aliquota.excluirRegistro));
	
	aRoutes.push(express.Router().get("/DeepQuery/Aliquota", aliquota.deepQuery));
};