"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDiferenca");
	var express = require("express");

	aRoutes.push(express.Router().get("/Diferenca", controller.listarRegistros));
	aRoutes.push(express.Router().post("/Diferenca", controller.criarRegistro));

	aRoutes.push(express.Router().get("/Diferenca/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/Diferenca/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/Diferenca/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/Diferenca", controller.deepQuery));
};