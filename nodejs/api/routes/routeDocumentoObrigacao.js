"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDocumentoObrigacao");
	var express = require("express");

	aRoutes.push(express.Router().get("/DocumentoObrigacao", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DocumentoObrigacao", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DocumentoObrigacao/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DocumentoObrigacao/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DocumentoObrigacao/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DocumentoObrigacao", controller.deepQuery));
};