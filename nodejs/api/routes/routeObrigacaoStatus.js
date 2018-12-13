"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerObrigacaoStatus");
	var express = require("express");

	aRoutes.push(express.Router().get("/ObrigacaoStatus", controller.listarRegistros));
	aRoutes.push(express.Router().post("/ObrigacaoStatus", controller.criarRegistro));

	aRoutes.push(express.Router().get("/ObrigacaoStatus/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/ObrigacaoStatus/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/ObrigacaoStatus/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/ObrigacaoStatus", controller.deepQuery));
};