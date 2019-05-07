"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRelTaxPackagePeriodo");
	var express = require("express");

	aRoutes.push(express.Router().get("/RelacionamentoTaxPackagePeriodo", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RelacionamentoTaxPackagePeriodo", controller.criarRegistro));

	aRoutes.push(express.Router().get("/RelacionamentoTaxPackagePeriodo/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/RelacionamentoTaxPackagePeriodo/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RelacionamentoTaxPackagePeriodo/:idRegistro", controller.excluirRegistro));
	aRoutes.push(express.Router().get("/RelacionamentoTaxPackagePeriodo/:idRegistro/LimparDados", controller.limparDados));
	aRoutes.push(express.Router().get("/RelacionamentoTaxPackagePeriodo/:idRegistro/CopiarDadosPeriodoAnterior", controller.copiarDadosPeriodoAnterior));
	aRoutes.push(express.Router().get("/RelacionamentoTaxPackagePeriodo/:idRegistro/IsPrimeiraEdicao", controller.isPrimeiraEdicao));

	aRoutes.push(express.Router().get("/DeepQuery/RelacionamentoTaxPackagePeriodo", controller.deepQuery));
};