"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDomAnoFiscal");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioAnoFiscal", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DominioAnoFiscal", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioAnoFiscal/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DominioAnoFiscal/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DominioAnoFiscal/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DominioAnoFiscal", controller.deepQuery));
};