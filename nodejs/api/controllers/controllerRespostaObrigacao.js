"use strict";

var model = require("../models/modelRespostaObrigacao");

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
			coluna: model.colunas.suporteContratado,
			valor: req.body.suporteContratado ? req.body.suporteContratado : null
		}, {
			coluna: model.colunas.suporteEspecificacao,
			valor: req.body.suporteEspecificacao ? req.body.suporteEspecificacao : null
		}, {
			coluna: model.colunas.suporteValor,
			valor: req.body.suporteValor ? req.body.suporteValor : null
		}, {
			coluna: model.colunas.fkIdDominioMoeda,
			valor: req.body.fkIdDominioMoeda ? Number(req.body.fkIdDominioMoeda) : null
		}, {
			coluna: model.colunas.fkIdRelModeloEmpresa,
			valor: req.body.fkIdRelModeloEmpresa ? Number(req.body.fkIdRelModeloEmpresa) : null
		}, {
			coluna: model.colunas.fkIdDominioAnoFiscal,
			valor: req.body.fkIdDominioAnoFiscal ? Number(req.body.fkIdDominioAnoFiscal) : null
		}, {
			coluna: model.colunas.fkIdDominioAnoCalendario,
			valor: req.body.fkIdDominioAnoCalendario ? Number(req.body.fkIdDominioAnoCalendario) : null
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
			coluna: model.colunas.suporteContratado,
			valor: req.body.suporteContratado ? req.body.suporteContratado : null
		}, {
			coluna: model.colunas.suporteEspecificacao,
			valor: req.body.suporteEspecificacao ? req.body.suporteEspecificacao : null
		}, {
			coluna: model.colunas.suporteValor,
			valor: req.body.suporteValor ? req.body.suporteValor : null
		}, {
			coluna: model.colunas.fkIdDominioMoeda,
			valor: req.body.fkIdDominioMoeda ? Number(req.body.fkIdDominioMoeda) : null
		}, {
			coluna: model.colunas.fkIdRelModeloEmpresa,
			valor: req.body.fkIdRelModeloEmpresa ? Number(req.body.fkIdRelModeloEmpresa) : null
		}, {
			coluna: model.colunas.fkIdDominioAnoFiscal,
			valor: req.body.fkIdDominioAnoFiscal ? Number(req.body.fkIdDominioAnoFiscal) : null
		}, {
			coluna: model.colunas.fkIdDominioAnoCalendario,
			valor: req.body.fkIdDominioAnoCalendario ? Number(req.body.fkIdDominioAnoCalendario) : null
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
		res.send("TODO: DeepQuery da Entidade RespostaObrigacao");

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