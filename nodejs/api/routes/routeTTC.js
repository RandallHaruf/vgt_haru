"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerTTC");
	var express = require("express");

	aRoutes.push(express.Router().put("/EncerrarTrimestreTTC", controller.encerrarTrimestre));
	aRoutes.push(express.Router().get("/ResumoTrimestreTTC", controller.listarResumoTrimeste));
	aRoutes.push(express.Router().get("/ResumoEmpresaTTC", controller.listarResumoEmpresa));
	aRoutes.push(express.Router().get("/VerificarImpostoNaoDeclarado", controller.verificarImpostosNaoDeclarados));
};