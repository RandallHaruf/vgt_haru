"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRequisicaoModeloObrigacao");
	var express = require("express");

	aRoutes.push(express.Router().get("/RequisicaoModeloObrigacao", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RequisicaoModeloObrigacao", controller.criarRegistro));

	aRoutes.push(express.Router().get("/RequisicaoModeloObrigacao/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/RequisicaoModeloObrigacao/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RequisicaoModeloObrigacao/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/RequisicaoModeloObrigacao", controller.deepQuery));
};