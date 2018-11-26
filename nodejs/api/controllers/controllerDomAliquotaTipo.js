"use strict";
var domAliquotaTipo = require("../models/modelDomAliquotaTipo");
var basicController = require("./basicController");

module.exports = {
	
	listarRegistros: function (req, res) {
		basicController.listarTodas(req, res, domAliquotaTipo);
	}
};