"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerNameOfTax");
	var express = require("express");

	aRoutes.push(express.Router().get("/NameOfTax", controller.listarRegistros));
	aRoutes.push(express.Router().post("/NameOfTax", controller.criarRegistro));

	aRoutes.push(express.Router().get("/NameOfTax/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/NameOfTax/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/NameOfTax/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/NameOfTax", controller.deepQuery));
	aRoutes.push(express.Router().get("/DeepQuery/NameOfTax/:idRegistro", controller.deepQuery));
};