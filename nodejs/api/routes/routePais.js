"use strict";

module.exports = function (aRoutes) {
	var pais = require("../controllers/controllerPais");
	var express = require("express");

	aRoutes.push(express.Router().get("/Pais", pais.listarRegistros));
	aRoutes.push(express.Router().post("/Pais", pais.criarRegistro));

	aRoutes.push(express.Router().get("/Pais/:idPais", pais.lerRegistro));
	aRoutes.push(express.Router().get("/Pais/:idPais/NameOfTax", pais.lerRelacionamentoNameOfTax));
	aRoutes.push(express.Router().put("/Pais/:idPais", pais.atualizarRegistro));
	aRoutes.push(express.Router().delete("/Pais/:idPais", pais.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/Pais", pais.deepQuery));
	aRoutes.push(express.Router().get("/DeepQuery/Pais/:idRegistro", pais.deepQuery));
	aRoutes.push(express.Router().get("/DeepQuery/DominioPaisNameOfTax", pais.deepQueryNameOfTax));
};