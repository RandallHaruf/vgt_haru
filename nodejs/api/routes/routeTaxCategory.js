"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerTaxCategory");
	var express = require("express");

	aRoutes.push(express.Router().get("/TaxCategory", controller.listarRegistros));
	aRoutes.push(express.Router().post("/TaxCategory", controller.criarRegistro));

	aRoutes.push(express.Router().get("/TaxCategory/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/TaxCategory/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/TaxCategory/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/TaxCategory", controller.deepQuery));
};