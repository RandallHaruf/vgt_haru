"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRequisicaoEncerramentoPeriodoTaxPackage");
	var express = require("express");

	aRoutes.push(express.Router().get("/RequisicaoEncerramentoPeriodoTaxPackage", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RequisicaoEncerramentoPeriodoTaxPackage", controller.criarRegistro));

	aRoutes.push(express.Router().get("/RequisicaoEncerramentoPeriodoTaxPackage/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/RequisicaoEncerramentoPeriodoTaxPackage/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RequisicaoEncerramentoPeriodoTaxPackage/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/RequisicaoEncerramentoPeriodoTaxPackage", controller.deepQuery));
};