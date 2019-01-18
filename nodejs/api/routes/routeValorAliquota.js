"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerValorAliquota");
	var express = require("express");

	aRoutes.push(express.Router().get("/ValorAliquota", controller.listarRegistros));
	aRoutes.push(express.Router().post("/ValorAliquota", controller.criarRegistro));

	aRoutes.push(express.Router().get("/ValorAliquota/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/ValorAliquota/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/ValorAliquota/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/ValorAliquota", controller.deepQuery));
};