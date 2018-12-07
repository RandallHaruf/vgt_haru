"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerTaxaMultipla");
	var express = require("express");

	aRoutes.push(express.Router().get("/TaxaMultipla", controller.listarRegistros));
	aRoutes.push(express.Router().post("/TaxaMultipla", controller.criarRegistro));

	aRoutes.push(express.Router().get("/TaxaMultipla/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/TaxaMultipla/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/TaxaMultipla/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/TaxaMultipla", controller.deepQuery));
};