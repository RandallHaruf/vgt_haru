"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerHSPaisAliquota");
	var express = require("express");
	
	aRoutes.push(express.Router().get("/HistoricoPaisAliquota", controller.listarRegistros));
	aRoutes.push(express.Router().post("/HistoricoPaisAliquota", controller.criarRegistro));
	
	aRoutes.push(express.Router().get("/HistoricoPaisAliquota/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/HistoricoPaisAliquota/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/HistoricoPaisAliquota/:idRegistro", controller.excluirRegistro));
	
	aRoutes.push(express.Router().get("/DeepQuery/HistoricoPaisAliquota/", controller.deepQuery));
	aRoutes.push(express.Router().get("/DeepQuery/HistoricoPaisAliquota/:idPais&:idAliquota", controller.deepQuery));
};