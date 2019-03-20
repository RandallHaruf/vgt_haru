"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRespostaObrigacao");
	var express = require("express");

	aRoutes.push(express.Router().get("/RespostaObrigacao", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RespostaObrigacao", controller.criarRegistro));

	aRoutes.push(express.Router().get("/RespostaObrigacao/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/RespostaObrigacao/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RespostaObrigacao/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/RespostaObrigacao", controller.deepQuery));
	aRoutes.push(express.Router().get("/marcaRespostasComoExcluidas/RespostaObrigacao", controller.marcaRespostasComoExcluidas));
};