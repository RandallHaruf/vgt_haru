"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDominioModulo");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioModulo", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DominioModulo", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioModulo/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DominioModulo/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DominioModulo/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DominioModulo", controller.deepQuery));
};