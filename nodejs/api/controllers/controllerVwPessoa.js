"use strict";
var vwPessoa = require("../models/modelVwPessoa");
var basicController = require("./basicController");

module.exports = {
	
	listarTodasPessoas: function (req, res) {
		basicController.listarTodas(req, res, vwPessoa);
	},
	
	lerPessoa: function (req, res) {
		basicController.ler(req, res, vwPessoa);
	}
};