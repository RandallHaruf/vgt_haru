"use strict";

var model = require("../models/modelSchedule");

module.exports = {

	listarRegistros: function (req, res) {
		
		var aParams = [];
		
		if (req.query.tipo) {
			aParams.push({
				coluna: model.colunas.fkDominioScheduleTipo,
				valor: req.query.tipo
			});
		}
		
		if (req.query.idRelTaxPackagePeriodo) {
			aParams.push({
				coluna: model.colunas.fkRelTaxPackagePeriodo,
				valor: req.query.idRelTaxPackagePeriodo
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
			coluna: model.colunas.fy,
			valor: req.body.fy ? req.body.fy : null
		}, {
			coluna: model.colunas.yearOfExpiration,
			valor: req.body.yearOfExpiration ? req.body.yearOfExpiration : null
		}, {
			coluna: model.colunas.openingBalance,
			valor: req.body.openingBalance ? req.body.openingBalance : null
		}, {
			coluna: model.colunas.currentYearValue,
			valor: req.body.currentYearValue ? req.body.currentYearValue : null
		}, {
			coluna: model.colunas.currentYearValueUtilized,
			valor: req.body.currentYearValueUtilized ? req.body.currentYearValueUtilized : null
		}, {
			coluna: model.colunas.adjustments,
			valor: req.body.adjustments ? req.body.adjustments : null
		}, {
			coluna: model.colunas.justificativa,
			valor: req.body.justificativa ? req.body.justificativa : null
		}, {
			coluna: model.colunas.currentYearValueExpired,
			valor: req.body.currentYearValueExpired ? req.body.currentYearValueExpired : null
		}, {
			coluna: model.colunas.closingBalance,
			valor: req.body.closingBalance ? req.body.closingBalance : null
		}, {
			coluna: model.colunas.obs,
			valor: req.body.obs ? req.body.obs : null
		}, {
			coluna: model.colunas.fkRelTaxPackagePeriodo,
			valor: req.body.fkRelTaxPackagePeriodo ? Number(req.body.fkRelTaxPackagePeriodo) : null
		}, {
			coluna: model.colunas.fkDominioScheduleTipo,
			valor: req.body.fkDominioScheduleTipo ? Number(req.body.fkDominioScheduleTipo) : null
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
			coluna: model.colunas.fy,
			valor: req.body.fy ? req.body.fy : null
		}, {
			coluna: model.colunas.yearOfExpiration,
			valor: req.body.yearOfExpiration ? req.body.yearOfExpiration : null
		}, {
			coluna: model.colunas.openingBalance,
			valor: req.body.openingBalance ? req.body.openingBalance : null
		}, {
			coluna: model.colunas.currentYearValue,
			valor: req.body.currentYearValue ? req.body.currentYearValue : null
		}, {
			coluna: model.colunas.currentYearValueUtilized,
			valor: req.body.currentYearValueUtilized ? req.body.currentYearValueUtilized : null
		}, {
			coluna: model.colunas.adjustments,
			valor: req.body.adjustments ? req.body.adjustments : null
		}, {
			coluna: model.colunas.justificativa,
			valor: req.body.justificativa ? req.body.justificativa : null
		}, {
			coluna: model.colunas.currentYearValueExpired,
			valor: req.body.currentYearValueExpired ? req.body.currentYearValueExpired : null
		}, {
			coluna: model.colunas.closingBalance,
			valor: req.body.closingBalance ? req.body.closingBalance : null
		}, {
			coluna: model.colunas.obs,
			valor: req.body.obs ? req.body.obs : null
		}, {
			coluna: model.colunas.fkRelTaxPackagePeriodo,
			valor: req.body.fkRelTaxPackagePeriodo ? Number(req.body.fkRelTaxPackagePeriodo) : null
		}, {
			coluna: model.colunas.fkDominioScheduleTipo,
			valor: req.body.fkDominioScheduleTipo ? Number(req.body.fkDominioScheduleTipo) : null
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
		res.send("TODO: DeepQuery da Entidade Schedule");

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