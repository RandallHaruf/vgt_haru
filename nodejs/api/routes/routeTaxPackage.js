"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerTaxPackage");
	var express = require("express");
	
	aRoutes.push(express.Router().get("/TaxPackage", controller.listarTaxPackage)); 
	aRoutes.push(express.Router().post("/InserirTaxPackage", controller.inserirTaxPackage));
	aRoutes.push(express.Router().get("/ScheduleParaNovoPeriodo", controller.criarScheduleParaNovoPeriodo));
	aRoutes.push(express.Router().get("/TaxPackageListagemEmpresas", controller.listagemEmpresas)); 
	aRoutes.push(express.Router().get("/AgregadoDiferencaCorrente", controller.listarAgregadoDiferencaCorrente)); 
};