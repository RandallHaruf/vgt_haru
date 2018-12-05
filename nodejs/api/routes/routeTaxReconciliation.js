"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerTaxReconciliation");
	var express = require("express");

	aRoutes.push(express.Router().get("/TaxReconciliation", controller.listarRegistros));
	aRoutes.push(express.Router().post("/TaxReconciliation", controller.criarRegistro));

	aRoutes.push(express.Router().get("/TaxReconciliation/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/TaxReconciliation/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/TaxReconciliation/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/TaxReconciliation", controller.deepQuery));
};