"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRelEmpresaPeriodo");
	var express = require("express");

	aRoutes.push(express.Router().get("/RelacionamentoEmpresaPeriodo", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RelacionamentoEmpresaPeriodo", controller.criarRegistro));

	aRoutes.push(express.Router().get("/RelacionamentoEmpresaPeriodo/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/RelacionamentoEmpresaPeriodo/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RelacionamentoEmpresaPeriodo/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/RelacionamentoEmpresaPeriodo", controller.deepQuery));
};