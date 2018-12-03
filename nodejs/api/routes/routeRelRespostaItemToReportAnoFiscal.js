"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRelRespostaItemToReportAnoFiscal");
	var express = require("express");

	aRoutes.push(express.Router().get("/RelacionamentoRespostaItemToReportAnoFiscal", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RelacionamentoRespostaItemToReportAnoFiscal", controller.criarRegistro));

	aRoutes.push(express.Router().get("/RelacionamentoRespostaItemToReportAnoFiscal/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/RelacionamentoRespostaItemToReportAnoFiscal/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RelacionamentoRespostaItemToReportAnoFiscal/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/RelacionamentoRespostaItemToReportAnoFiscal", controller.deepQuery));
};