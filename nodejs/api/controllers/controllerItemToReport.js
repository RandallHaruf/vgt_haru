"use strict";

var model = require("../models/modelItemToReport");

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
			coluna: model.colunas.pergunta,
			valor: req.body.pergunta ? req.body.pergunta : null
		}, {
			coluna: model.colunas.flagSimNao,
			valor: req.body.flagSimNao ? req.body.flagSimNao : null
		}, {
			coluna: model.colunas.flagAno,
			valor: req.body.flagAno ? req.body.flagAno : null
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
			coluna: model.colunas.pergunta,
			valor: req.body.pergunta ? req.body.pergunta : null
		}, {
			coluna: model.colunas.flagSimNao,
			valor: req.body.flagSimNao ? req.body.flagSimNao : null
		}, {
			coluna: model.colunas.flagAno,
			valor: req.body.flagAno ? req.body.flagAno : null
		}];

		model.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	excluirRegistro: function (req, res, next) {
		/*model.excluir([{
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});*/
		model.delete(req.params.idRegistro)
			.then((result) => {
				res.status(200).json({
					result: result
				});
			})
			.catch(function (err) {
				next(err);
			});
	},

	deepQuery: function (req, res) {
		res.send("TODO: DeepQuery da Entidade ItemToReport");
	}
};