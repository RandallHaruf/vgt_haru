"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRelPaisNameOfTax");
	var express = require("express");

	aRoutes.push(express.Router().get("/RelacionamentoPaisNameOfTax", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RelacionamentoPaisNameOfTax", controller.criarRegistro));

	//aRoutes.push(express.Router().get("/RelacionamentoPaisNameOfTax/:idRegistro", controller.lerRegistro));
	//aRoutes.push(express.Router().put("/RelacionamentoPaisNameOfTax/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RelacionamentoPaisNameOfTax/:fkPais&:fkNameOfTax", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/RelacionamentoPaisNameOfTax", controller.deepQuery));
};