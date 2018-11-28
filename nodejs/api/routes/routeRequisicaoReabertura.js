"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRequisicaoReabertura");
	var express = require("express");

	aRoutes.push(express.Router().get("/RequisicaoReabertura", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RequisicaoReabertura", controller.criarRegistro));

	aRoutes.push(express.Router().get("/RequisicaoReabertura/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/RequisicaoReabertura/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RequisicaoReabertura/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/RequisicaoReabertura", controller.deepQuery));
};