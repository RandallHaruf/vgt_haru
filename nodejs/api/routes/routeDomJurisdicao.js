"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDomJurisdicao");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioJurisdicao", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DominioJurisdicao", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioJurisdicao/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DominioJurisdicao/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DominioJurisdicao/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DominioJurisdicao", controller.deepQuery));
};