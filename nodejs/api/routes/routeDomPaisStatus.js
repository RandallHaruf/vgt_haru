"use strict";

module.exports = function (aRoutes) {
	var domPaisStatus = require("../controllers/controllerDomPaisStatus");
	var express = require("express");
	
	aRoutes.push(express.Router().get("/DominioPaisStatus", domPaisStatus.listarRegistros));
};