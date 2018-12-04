"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerObrigacao");
	var express = require("express");

	aRoutes.push(express.Router().get("/Obrigacao", controller.listarRegistros));
	aRoutes.push(express.Router().post("/Obrigacao", controller.criarRegistro));

	aRoutes.push(express.Router().get("/Obrigacao/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/Obrigacao/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/Obrigacao/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/Obrigacao", controller.deepQuery));
};