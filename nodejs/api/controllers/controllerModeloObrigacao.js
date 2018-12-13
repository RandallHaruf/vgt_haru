"use strict";

var model = require("../models/modelModeloObrigacao");

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
			coluna: model.colunas.nomeObrigacao,
			valor: req.body.nomeObrigacao ? req.body.nomeObrigacao : null
		}, {
			coluna: model.colunas.dataInicial,
			valor: req.body.dataInicial ? req.body.dataInicial : null
		}, {
			coluna: model.colunas.dataFinal,
			valor: req.body.dataFinal ? req.body.dataFinal : null
		}, {
			coluna: model.colunas.prazoEntrega,
			valor: req.body.prazoEntrega ? req.body.prazoEntrega : null
		}, {
			coluna: model.colunas.fkIdPais,
			valor: req.body.fkIdPais ? Number(req.body.fkIdPais) : null
		}, {
			coluna: model.colunas.fkIdDominioPeriodicidade,
			valor: req.body.fkIdDominioPeriodicidade ? Number(req.body.fkIdDominioPeriodicidade) : null
		}, {
			coluna: model.colunas.fkIdDominioObrigacaoStatus,
			valor: req.body.fkIdDominioObrigacaoStatus ? Number(req.body.fkIdDominioObrigacaoStatus) : null
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
			coluna: model.colunas.nomeObrigacao,
			valor: req.body.nomeObrigacao ? req.body.nomeObrigacao : null
		}, {
			coluna: model.colunas.dataInicial,
			valor: req.body.dataInicial ? req.body.dataInicial : null
		}, {
			coluna: model.colunas.dataFinal,
			valor: req.body.dataFinal ? req.body.dataFinal : null
		}, {
			coluna: model.colunas.prazoEntrega,
			valor: req.body.prazoEntrega ? req.body.prazoEntrega : null
		}, {
			coluna: model.colunas.fkIdPais,
			valor: req.body.fkIdPais ? Number(req.body.fkIdPais) : null
		}, {
			coluna: model.colunas.fkIdDominioPeriodicidade,
			valor: req.body.fkIdDominioPeriodicidade ? Number(req.body.fkIdDominioPeriodicidade) : null
		}, {
			coluna: model.colunas.fkIdDominioObrigacaoStatus,
			valor: req.body.fkIdDominioObrigacaoStatus ? Number(req.body.fkIdDominioObrigacaoStatus) : null
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
		res.send("TODO: DeepQuery da Entidade ModeloObrigacao");

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