"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRelModeloEmpresa");
	var express = require("express");

	aRoutes.push(express.Router().get("/RelModeloEmpresa", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RelModeloEmpresa", controller.criarRegistro));

	aRoutes.push(express.Router().get("/RelModeloEmpresa/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/RelModeloEmpresa/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RelModeloEmpresa/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/RelModeloEmpresa", controller.deepQuery));
};