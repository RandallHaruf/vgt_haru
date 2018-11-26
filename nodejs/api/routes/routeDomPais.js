"use strict";

module.exports = function (aRoutes) {
	var domPais = require("../controllers/controllerDomPais");
	var express = require("express");
	
	aRoutes.push(express.Router().get("/DominioPais", domPais.listarRegistros));
};