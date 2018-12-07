"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRequisicaoReaberturaTaxPackage");
	var express = require("express");

	aRoutes.push(express.Router().get("/RequisicaoReaberturaTaxPackage", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RequisicaoReaberturaTaxPackage", controller.criarRegistro));

	aRoutes.push(express.Router().get("/RequisicaoReaberturaTaxPackage/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/RequisicaoReaberturaTaxPackage/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RequisicaoReaberturaTaxPackage/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/RequisicaoReaberturaTaxPackage", controller.deepQuery));
};