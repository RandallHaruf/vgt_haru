"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerScheduleValueUtilized");
	var express = require("express");

	aRoutes.push(express.Router().get("/ScheduleValueUtilized", controller.listarRegistros));
	aRoutes.push(express.Router().post("/ScheduleValueUtilized", controller.criarRegistro));

	aRoutes.push(express.Router().get("/ScheduleValueUtilized/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/ScheduleValueUtilized/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/ScheduleValueUtilized/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/ScheduleValueUtilized", controller.deepQuery));
};