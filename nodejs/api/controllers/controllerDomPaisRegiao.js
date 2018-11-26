"use strict";
var domPaisRegiao = require("../models/modelDomPaisRegiao");
var basicController = require("./basicController");

module.exports = {
	
	listarRegistros: function (req, res) {
		basicController.listarTodas(req, res, domPaisRegiao);
	}
};