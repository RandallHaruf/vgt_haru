"use strict";

var model = require("../models/modelRelPaisNameOfTax");

module.exports = {

	listarRegistros: function (req, res) {
		var aParams = [];
		
		if (req.query.fkNameOfTax) {
			aParams.push({
				coluna: model.colunas.fkNameOfTax,
				valor: req.query.fkNameOfTax ? req.query.fkNameOfTax : null
			});
		}
		
		model.listar(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	criarRegistro: function (req, res) {

		var aParams = [{
			coluna: model.colunas.fkDominioPais,
			valor: req.body.fkDominioPais ? req.body.fkDominioPais : null
		}, {
			coluna: model.colunas.fkNameOfTax,
			valor: req.body.fkNameOfTax ? req.body.fkNameOfTax : null
		}, {
			isIdLog: true,
			valor: req
		}];

		model.inserir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	/*lerRegistro: function (req, res) {
		model.listar([{
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},*/

	/*atualizarRegistro: function (req, res) {

		var oCondition = {
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		};

		var aParams = [{
			coluna: model.colunas.fkDominioPais,
			valor: req.body.fkDominioPais ? req.body.fkDominioPais : null
		}, {
			coluna: model.colunas.fkNameOfTax,
			valor: req.body.fkNameOfTax ? req.body.fkNameOfTax : null
		}];

		model.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},*/

	excluirRegistro: function (req, res) {
		var aParams = [{
			isIdLog: true,
			valor: req
		}];
		
		if (req.params.fkPais && req.params.fkPais != "-1") {
			aParams.push({
				coluna: model.colunas.fkDominioPais,
				valor: req.params.fkPais ? req.params.fkPais : null
			});
		}
		
		if (req.params.fkNameOfTax && req.params.fkNameOfTax != "-1") {
			aParams.push({
				coluna: model.colunas.fkNameOfTax,
				valor: req.params.fkNameOfTax
			});
		}
		
		model.excluir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	deepQuery: function (req, res) {
		res.send("TODO: DeepQuery da Entidade RelacionamentoPaisNameOfTax");

		/*var sStatement = 'select * from "DUMMY"';

		model.execute({
		statement: sStatement
		}, function (err, result) {
		if (err) {
		res.send(JSON.stringify(err));
		}
		else {
		res.send(JSON.stringify(result));
		}
		});*/
	}
};