"use strict";

var db = require("../db");

module.exports = {
	inserirTaxPackage: function (req, res) {
		if (req.body.taxPackage) {
			console.log(req.body.taxPackage);
			res.send("Sucesso");
		}
		else {
			res.send("Erro");
		}
	}
};