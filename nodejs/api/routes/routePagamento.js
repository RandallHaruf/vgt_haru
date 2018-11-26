"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerPagamento");
	var express = require("express");

	aRoutes.push(express.Router().get("/Pagamento", controller.listarRegistros));
	aRoutes.push(express.Router().post("/Pagamento", controller.criarRegistro));

	aRoutes.push(express.Router().get("/Pagamento/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/Pagamento/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/Pagamento/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/Pagamento", controller.deepQuery));
};