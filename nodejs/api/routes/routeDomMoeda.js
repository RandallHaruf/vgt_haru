"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDomMoeda");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioMoeda", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DominioMoeda", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioMoeda/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DominioMoeda/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DominioMoeda/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DominioMoeda", controller.deepQuery));
};