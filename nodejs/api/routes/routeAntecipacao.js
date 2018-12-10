"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerAntecipacao");
	var express = require("express");

	aRoutes.push(express.Router().get("/Antecipacao", controller.listarRegistros));
	aRoutes.push(express.Router().post("/Antecipacao", controller.criarRegistro));

	aRoutes.push(express.Router().get("/Antecipacao/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/Antecipacao/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/Antecipacao/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/Antecipacao", controller.deepQuery));
};