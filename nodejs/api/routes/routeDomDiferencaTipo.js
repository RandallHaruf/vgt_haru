"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDomDiferencaTipo");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioDiferencaTipo", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DominioDiferencaTipo", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioDiferencaTipo/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DominioDiferencaTipo/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DominioDiferencaTipo/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DominioDiferencaTipo", controller.deepQuery));
};