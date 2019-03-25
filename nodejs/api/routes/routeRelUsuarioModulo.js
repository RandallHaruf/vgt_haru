"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRelUsuarioModulo");
	var express = require("express");

	aRoutes.push(express.Router().get("/RelUsuarioModulo", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RelUsuarioModulo", controller.criarRegistro));

	aRoutes.push(express.Router().get("/RelUsuarioModulo/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/RelUsuarioModulo/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RelUsuarioModulo/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/RelUsuarioModulo", controller.deepQuery));
};