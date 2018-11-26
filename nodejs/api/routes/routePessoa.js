"use strict";

module.exports = function (aRoutes) {
	var pessoa = require("../controllers/controllerPessoa");
	var express = require("express");
	
	aRoutes.push(express.Router().get("/Pessoas", pessoa.listarTodasPessoas));
	aRoutes.push(express.Router().post("/Pessoas", pessoa.criarPessoa));
	
	aRoutes.push(express.Router().get("/Pessoas/:idPessoa", pessoa.lerPessoa));
	aRoutes.push(express.Router().put("/Pessoas/:idPessoa", pessoa.atualizarPessoa));
	aRoutes.push(express.Router().delete("/Pessoas/:idPessoa", pessoa.excluirPessoa));
};