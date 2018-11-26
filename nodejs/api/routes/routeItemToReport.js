"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerItemToReport");
	var express = require("express");

	aRoutes.push(express.Router().get("/ItemToReport", controller.listarRegistros));
	aRoutes.push(express.Router().post("/ItemToReport", controller.criarRegistro));

	aRoutes.push(express.Router().get("/ItemToReport/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/ItemToReport/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/ItemToReport/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/ItemToReport", controller.deepQuery));
};