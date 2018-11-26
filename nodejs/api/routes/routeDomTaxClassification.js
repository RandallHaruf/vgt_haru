"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDomTaxClassification");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioTaxClassification", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DominioTaxClassification", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioTaxClassification/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DominioTaxClassification/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DominioTaxClassification/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DominioTaxClassification", controller.deepQuery));
};