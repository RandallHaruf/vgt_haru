"use strict";

var model = require("../models/modelRequisicaoReabertura");

module.exports = {

	listarRegistros: function (req, res) {
		/*var aParametros = [];
		
		if (req.query.empresa) {
			aParametros.push({
				coluna: model.colunas.fkEmpresa,
				valor: req.body.id_empresa ? req.body.id_empresa : null
			},
			{
				coluna: model.colunas.fkEmpresa,
				valor: req.body.id_empresa ? req.body.id_empresa : null
			}
			);
		} */
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
			coluna: model.colunas.dataRequisicao,
			valor: req.body.dataRequisicao ? req.body.dataRequisicao : null
		}, {
			coluna: model.colunas.idUsuario,
			valor: req.body.idUsuario ? Number(req.body.idUsuario) : null
		}, {
			coluna: model.colunas.nomeUsuario,
			valor: req.body.nomeUsuario ? req.body.nomeUsuario : null
		}, {
			coluna: model.colunas.justificativa,
			valor: req.body.justificativa ? req.body.justificativa : null
		}, {
			coluna: model.colunas.resposta,
			valor: req.body.resposta ? req.body.resposta : null
		}, {
			coluna: model.colunas.fkDominioRequisicaoReaberturaStatus,
			valor: req.body.fkDominioRequisicaoReaberturaStatus ? Number(req.body.fkDominioRequisicaoReaberturaStatus) : null
		}, {
			coluna: model.colunas.fkEmpresa,
			valor: req.body.fkEmpresa ? Number(req.body.fkEmpresa) : null
		}, {
			coluna: model.colunas.fkPeriodo,
			valor: req.body.fkPeriodo ? Number(req.body.fkPeriodo) : null
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
			coluna: model.colunas.dataRequisicao,
			valor: req.body.dataRequisicao ? req.body.dataRequisicao : null
		}, {
			coluna: model.colunas.idUsuario,
			valor: req.body.idUsuario ? Number(req.body.idUsuario) : null
		}, {
			coluna: model.colunas.nomeUsuario,
			valor: req.body.nomeUsuario ? req.body.nomeUsuario : null
		}, {
			coluna: model.colunas.justificativa,
			valor: req.body.justificativa ? req.body.justificativa : null
		}, {
			coluna: model.colunas.resposta,
			valor: req.body.resposta ? req.body.resposta : null
		}, {
			coluna: model.colunas.fkDominioRequisicaoReaberturaStatus,
			valor: req.body.fkDominioRequisicaoReaberturaStatus ? Number(req.body.fkDominioRequisicaoReaberturaStatus) : null
		}, {
			coluna: model.colunas.fkEmpresa,
			valor: req.body.fkEmpresa ? Number(req.body.fkEmpresa) : null
		}, {
			coluna: model.colunas.fkPeriodo,
			valor: req.body.fkPeriodo ? Number(req.body.fkPeriodo) : null
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
		res.send("TODO: DeepQuery da Entidade RequisicaoReabertura");

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