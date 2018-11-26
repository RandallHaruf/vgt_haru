"use strict";
var domPais = require("../models/modelDomPais");
var basicController = require("./basicController");

module.exports = {
	
	listarRegistros: function (req, res) {
		basicController.listarTodas(req, res, domPais);
	}
};