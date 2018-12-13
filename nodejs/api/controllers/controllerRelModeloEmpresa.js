"use strict";

var model = require("../models/modelRelModeloEmpresa");

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
			coluna: model.colunas.fkIdModeloObrigacao,
			valor: req.body.fkIdModeloObrigacao ? Number(req.body.fkIdModeloObrigacao) : null
		}, {
			coluna: model.colunas.fkIdEmpresa,
			valor: req.body.fkIdEmpresa ? Number(req.body.fkIdEmpresa) : null
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
			coluna: model.colunas.fkIdModeloObrigacao,
			valor: req.body.fkIdModeloObrigacao ? Number(req.body.fkIdModeloObrigacao) : null
		}, {
			coluna: model.colunas.fkIdEmpresa,
			valor: req.body.fkIdEmpresa ? Number(req.body.fkIdEmpresa) : null
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
		res.send("TODO: DeepQuery da Entidade RelModeloEmpresa");

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