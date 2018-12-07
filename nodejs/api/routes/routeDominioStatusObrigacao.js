"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDominioStatusObrigacao");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioStatusObrigacao", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DominioStatusObrigacao", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioStatusObrigacao/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DominioStatusObrigacao/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DominioStatusObrigacao/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DominioStatusObrigacao", controller.deepQuery));
};