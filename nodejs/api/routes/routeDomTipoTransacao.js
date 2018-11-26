"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDomTipoTransacao");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioTipoTransacao", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DominioTipoTransacao", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioTipoTransacao/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DominioTipoTransacao/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DominioTipoTransacao/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DominioTipoTransacao", controller.deepQuery));
};