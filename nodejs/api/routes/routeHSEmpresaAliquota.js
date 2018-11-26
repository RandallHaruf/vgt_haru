"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerHSEmpresaAliquota");
	var express = require("express");
	
	aRoutes.push(express.Router().get("/HistoricoEmpresaAliquota", controller.listarRegistros));
	aRoutes.push(express.Router().post("/HistoricoEmpresaAliquota", controller.criarRegistro));
	
	aRoutes.push(express.Router().get("/HistoricoEmpresaAliquota/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/HistoricoEmpresaAliquota/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/HistoricoEmpresaAliquota/:idRegistro", controller.excluirRegistro));
	
	aRoutes.push(express.Router().get("/DeepQuery/HistoricoEmpresaAliquota/", controller.deepQuery));
	aRoutes.push(express.Router().get("/DeepQuery/HistoricoEmpresaAliquota/:idEmpresa&:idAliquota", controller.deepQuery));
};