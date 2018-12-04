"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerSchedule");
	var express = require("express");

	aRoutes.push(express.Router().get("/Schedule", controller.listarRegistros));
	aRoutes.push(express.Router().post("/Schedule", controller.criarRegistro));

	aRoutes.push(express.Router().get("/Schedule/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/Schedule/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/Schedule/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/Schedule", controller.deepQuery));
};