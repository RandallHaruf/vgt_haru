"use strict";

module.exports = function (aRoutes) {
	var domAliquotaTipo = require("../controllers/controllerDomAliquotaTipo");
	var express = require("express");
	
	aRoutes.push(express.Router().get("/DominioAliquotaTipo", domAliquotaTipo.listarRegistros));
};