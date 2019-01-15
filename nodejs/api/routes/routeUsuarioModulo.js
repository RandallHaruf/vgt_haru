"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerUsuarioModulo");
	var express = require("express");

	aRoutes.push(express.Router().get("/UsuarioModulo", controller.listarRegistros));
	aRoutes.push(express.Router().post("/UsuarioModulo", controller.criarRegistro));

	aRoutes.push(express.Router().get("/UsuarioModulo/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/UsuarioModulo/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/UsuarioModulo/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/UsuarioModulo", controller.deepQuery));
};