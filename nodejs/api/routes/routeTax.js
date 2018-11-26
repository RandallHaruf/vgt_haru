"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerTax");
	var express = require("express");

	aRoutes.push(express.Router().get("/Tax", controller.listarRegistros));
	aRoutes.push(express.Router().post("/Tax", controller.criarRegistro));

	aRoutes.push(express.Router().get("/Tax/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().get("/Tax/:idRegistro/NameOfTax", controller.lerRelacionamentoNameOfTax));
	aRoutes.push(express.Router().put("/Tax/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/Tax/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/Tax", controller.deepQuery));
	aRoutes.push(express.Router().get("/DeepQuery/Tax/:idRegistro", controller.deepQuery));
};