"use strict";

var model = require("../models/modelDiferenca");

module.exports = {

	listarRegistros: function (req, res) {
		model.listar([], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	criarRegistro: function (req, res) {

		var aParams = [{
			coluna: model.colunas.id
		}, {
			coluna: model.colunas.outro,
			valor: req.body.outro ? req.body.outro : null
		}, {
			coluna: model.colunas.valor,
			valor: req.body.valor ? req.body.valor : null
		}, {
			coluna: model.colunas.fkTaxReconciliation,
			valor: req.body.fkTaxReconciliation ? Number(req.body.fkTaxReconciliation) : null
		}, {
			coluna: model.colunas.fkPagamento,
			valor: req.body.fkPagamento ? Number(req.body.fkPagamento) : null
		}, {
			coluna: model.colunas.fkAgregadoDiferenca,
			valor: req.body.fkAgregadoDiferenca ? Number(req.body.fkAgregadoDiferenca) : null
		}];

		model.inserir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	lerRegistro: function (req, res) {
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
	},

	atualizarRegistro: function (req, res) {

		var oCondition = {
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		};

		var aParams = [{
			coluna: model.colunas.outro,
			valor: req.body.outro ? req.body.outro : null
		}, {
			coluna: model.colunas.valor,
			valor: req.body.valor ? req.body.valor : null
		}, {
			coluna: model.colunas.fkTaxReconciliation,
			valor: req.body.fkTaxReconciliation ? Number(req.body.fkTaxReconciliation) : null
		}, {
			coluna: model.colunas.fkPagamento,
			valor: req.body.fkPagamento ? Number(req.body.fkPagamento) : null
		}, {
			coluna: model.colunas.fkAgregadoDiferenca,
			valor: req.body.fkAgregadoDiferenca ? Number(req.body.fkAgregadoDiferenca) : null
		}];

		model.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	excluirRegistro: function (req, res) {
		model.excluir([{
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	deepQuery: function (req, res) {
		res.send("TODO: DeepQuery da Entidade Diferenca");

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