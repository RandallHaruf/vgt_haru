"use strict";

var model = require("../models/modelTaxCategory");

module.exports = {

	listarRegistros: function (req, res) {
		var aParams = [];
		
		if (req.query.classification && !isNaN(req.query.classification)) {
			aParams.push({
				coluna: model.colunas.fkDominioTaxClassification,
				valor: Number(req.query.classification)
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
			coluna: model.colunas.id
		}, {
			coluna: model.colunas.category,
			valor: req.body.category ? req.body.category : null
		}, {
			coluna: model.colunas.fkDominioTaxClassification,
			valor: req.body.fkDominioTaxClassification ? Number(req.body.fkDominioTaxClassification) : null
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
			coluna: model.colunas.category,
			valor: req.body.category ? req.body.category : null
		}, {
			coluna: model.colunas.fkDominioTaxClassification,
			valor: req.body.fkDominioTaxClassification ? Number(req.body.fkDominioTaxClassification) : null
		}, {
			isIdLog: true,
			valor: req
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
		model.delete(req.params.idRegistro, req)
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
		var sStatement = 
			'select * '
			+ 'from "VGT.TAX_CATEGORY" category '
			+ 'left outer join "VGT.DOMINIO_TAX_CLASSIFICATION" classification '
			+ 'on category."fk_dominio_tax_classification.id_dominio_tax_classification" = classification."id_dominio_tax_classification" ';

		model.execute({
			statement: sStatement
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		}, {
			idUsuario: req
		});
	}
};