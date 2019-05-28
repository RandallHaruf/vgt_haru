"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRelEmpresaModulo");
	var express = require("express");

	aRoutes.push(express.Router().get("/RelEmpresaModulo", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RelEmpresaModulo", controller.criarRegistro));

	aRoutes.push(express.Router().get("/RelEmpresaModulo/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/RelEmpresaModulo/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RelEmpresaModulo/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/RelEmpresaModulo", controller.deepQuery));
};