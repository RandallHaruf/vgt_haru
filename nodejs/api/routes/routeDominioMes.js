"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDominioMes");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioMes", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DominioMes", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioMes/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DominioMes/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DominioMes/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DominioMes", controller.deepQuery));
};