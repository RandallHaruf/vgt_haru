"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerObrigacaoAcessoria");
	var express = require("express");

	aRoutes.push(express.Router().get("/ObrigacaoAcessoria", controller.listarRegistros));
	aRoutes.push(express.Router().post("/ObrigacaoAcessoria", controller.criarRegistro));

	aRoutes.push(express.Router().get("/ObrigacaoAcessoria/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/ObrigacaoAcessoria/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/ObrigacaoAcessoria/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/ObrigacaoAcessoria", controller.deepQuery));
};