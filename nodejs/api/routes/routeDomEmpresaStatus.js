"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDomEmpresaStatus");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioEmpresaStatus", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DominioEmpresaStatus", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioEmpresaStatus/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DominioEmpresaStatus/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DominioEmpresaStatus/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DominioEmpresaStatus", controller.deepQuery));
};