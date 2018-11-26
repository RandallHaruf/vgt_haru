"use strict";
var domPaisStatus = require("../models/modelDomPaisStatus");
var basicController = require("./basicController");

module.exports = {
	
	listarRegistros: function (req, res) {
		basicController.listarTodas(req, res, domPaisStatus);
	}
};