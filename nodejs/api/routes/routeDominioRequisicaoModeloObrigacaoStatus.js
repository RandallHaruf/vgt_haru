"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDomRequisicaoModeloObrigacaoStatus");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioRequisicaoModeloObrigacaoStatus", controller.listarRegistros));
	//aRoutes.push(express.Router().post("/DominioRequisicaoModeloObrigacaoStatus", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioRequisicaoModeloObrigacaoStatus/:idRegistro", controller.lerRegistro));
	//aRoutes.push(express.Router().put("/DominioRequisicaoModeloObrigacaoStatus/:idRegistro", controller.atualizarRegistro));
	//aRoutes.push(express.Router().delete("/DominioRequisicaoModeloObrigacaoStatus/:idRegistro", controller.excluirRegistro));

	//aRoutes.push(express.Router().get("/DeepQuery/DominioRequisicaoModeloObrigacaoStatus", controller.deepQuery));
};