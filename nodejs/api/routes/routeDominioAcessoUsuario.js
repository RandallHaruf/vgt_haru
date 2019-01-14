"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDominioAcessoUsuario");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioAcessoUsuario", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DominioAcessoUsuario", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioAcessoUsuario/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DominioAcessoUsuario/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DominioAcessoUsuario/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DominioAcessoUsuario", controller.deepQuery));
};