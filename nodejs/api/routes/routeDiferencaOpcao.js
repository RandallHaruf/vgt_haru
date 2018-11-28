"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDiferencaOpcao");
	var express = require("express");

	aRoutes.push(express.Router().get("/DiferencaOpcao", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DiferencaOpcao", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DiferencaOpcao/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DiferencaOpcao/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DiferencaOpcao/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DiferencaOpcao", controller.deepQuery));
};