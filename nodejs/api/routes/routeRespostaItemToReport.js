"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRespostaItemToReport");
	var express = require("express");

	aRoutes.push(express.Router().get("/RespostaItemToReport", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RespostaItemToReport", controller.criarRegistro));

	aRoutes.push(express.Router().get("/RespostaItemToReport/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/RespostaItemToReport/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RespostaItemToReport/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/RespostaItemToReport", controller.deepQuery));
};