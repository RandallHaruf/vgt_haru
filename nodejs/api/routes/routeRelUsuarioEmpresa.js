"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRelUsuarioEmpresa");
	var express = require("express");

	aRoutes.push(express.Router().get("/RelUsuarioEmpresa", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RelUsuarioEmpresa", controller.criarRegistro));

	aRoutes.push(express.Router().get("/RelUsuarioEmpresa/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/RelUsuarioEmpresa/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RelUsuarioEmpresa/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/RelUsuarioEmpresa", controller.deepQuery));
};