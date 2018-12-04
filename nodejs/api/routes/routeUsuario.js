"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerUsuario");
	var express = require("express");

	aRoutes.push(express.Router().get("/Usuario", controller.listarRegistros));
	aRoutes.push(express.Router().post("/Usuario", controller.criarRegistro));

	aRoutes.push(express.Router().get("/Usuario/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/Usuario/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/Usuario/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/Usuario", controller.deepQuery));
};