"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerModeloObrigacao");
	var express = require("express");

	aRoutes.push(express.Router().get("/ModeloObrigacao", controller.listarRegistros));
	aRoutes.push(express.Router().post("/ModeloObrigacao", controller.criarRegistro));

	aRoutes.push(express.Router().get("/ModeloObrigacao/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/ModeloObrigacao/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/ModeloObrigacao/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/ModeloObrigacao", controller.deepQuery));
};