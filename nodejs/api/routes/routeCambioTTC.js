"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerCambioTTC");
	var express = require("express");
	
	aRoutes.push(express.Router().get("/PlanilhaCambioTTC", controller.downloadPlanilha));
	aRoutes.push(express.Router().post("/PlanilhaCambioTTC", controller.uploadPlanilha));
};