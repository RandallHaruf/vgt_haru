"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerReportTTC");
	var express = require("express");

	aRoutes.push(express.Router().get("/ReportTTC", controller.listarRegistros));
	aRoutes.push(express.Router().post("/ReportTTC", controller.criarRegistro));

	aRoutes.push(express.Router().get("/ReportTTC/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/ReportTTC/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/ReportTTC/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/ReportTTC", controller.deepQuery));
	aRoutes.push(express.Router().get("/DeepQuery/ReportTTC/:idRegistro", controller.deepQuery));
};