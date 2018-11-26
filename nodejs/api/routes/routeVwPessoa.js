"use strict";

module.exports = function (aRoutes) {
	var vwPessoa = require("../controllers/controllerVwPessoa");
	var express = require("express");
	
	aRoutes.push(express.Router().get("/VwPessoas", vwPessoa.listarTodasPessoas));
	
	aRoutes.push(express.Router().get("/VwPessoas/:idPessoa", vwPessoa.lerPessoa));
};