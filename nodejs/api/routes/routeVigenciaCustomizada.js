"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerVigenciaCustomizada");
	var express = require("express");

	aRoutes.push(express.Router().get("/VigenciaCustomizada", controller.listarRegistros));
	aRoutes.push(express.Router().post("/VigenciaCustomizada", controller.criarRegistro));

	aRoutes.push(express.Router().get("/VigenciaCustomizada/:idRegistro&:idRegistro1&:idRegistro2", controller.lerRegistro));
	aRoutes.push(express.Router().put("/VigenciaCustomizada/:idRegistro&:idRegistro1&:idRegistro2", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/VigenciaCustomizada/:idRegistro&:idRegistro1&:idRegistro2", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/VigenciaCustomizada", controller.deepQuery));
};