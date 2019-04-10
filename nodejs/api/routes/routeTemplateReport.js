"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerTemplateReport");
	var express = require("express");

	aRoutes.push(express.Router().get("/TemplateReport", controller.listarRegistros));
	aRoutes.push(express.Router().post("/TemplateReport", controller.criarRegistro));

	aRoutes.push(express.Router().get("/TemplateReport/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/TemplateReport/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/TemplateReport/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/TemplateReport", controller.deepQuery));
	aRoutes.push(express.Router().get("/DeepQuery/TemplateReport/:idRegistro", controller.deepQuery));
};