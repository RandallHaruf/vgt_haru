"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDomObrigacaoAcessoriaTipo");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioObrigacaoAcessoriaTipo", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DominioObrigacaoAcessoriaTipo", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioObrigacaoAcessoriaTipo/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DominioObrigacaoAcessoriaTipo/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DominioObrigacaoAcessoriaTipo/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DominioObrigacaoAcessoriaTipo", controller.deepQuery));
};