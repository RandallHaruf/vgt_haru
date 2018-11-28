"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerEmpresa");
	var express = require("express");

	aRoutes.push(express.Router().get("/Empresa", controller.listarRegistros));
	aRoutes.push(express.Router().post("/Empresa", controller.criarRegistro));

	aRoutes.push(express.Router().get("/Empresa/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/Empresa/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/Empresa/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/Empresa", controller.deepQuery));
	aRoutes.push(express.Router().get("/DeepQuery/Empresa/:idRegistro", controller.deepQuery));
};