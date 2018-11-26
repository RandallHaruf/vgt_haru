"use strict";

module.exports = function (aRoutes) {
	var domPaisRegiao = require("../controllers/controllerDomPaisRegiao");
	var express = require("express");
	
	aRoutes.push(express.Router().get("/DominioPaisRegiao", domPaisRegiao.listarRegistros));
};