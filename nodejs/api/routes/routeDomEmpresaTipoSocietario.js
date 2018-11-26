"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDomEmpresaTipoSocietario");
	var express = require("express");

	aRoutes.push(express.Router().get("/DominioEmpresaTipoSocietario", controller.listarRegistros));
	aRoutes.push(express.Router().post("/DominioEmpresaTipoSocietario", controller.criarRegistro));

	aRoutes.push(express.Router().get("/DominioEmpresaTipoSocietario/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/DominioEmpresaTipoSocietario/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/DominioEmpresaTipoSocietario/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/DominioEmpresaTipoSocietario", controller.deepQuery));
};