"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDomAnoCalendario");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioAnoCalendario", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DominioAnoCalendario", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioAnoCalendario/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DominioAnoCalendario/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DominioAnoCalendario/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DominioAnoCalendario", controller.deepQuery));
};