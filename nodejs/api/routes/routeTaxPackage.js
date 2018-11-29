"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerTaxPackage");
	var express = require("express");
	
	aRoutes.push(express.Router().post("/InserirTaxPackage", controller.inserirTaxPackage));
};