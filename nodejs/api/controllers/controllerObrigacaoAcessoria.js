"use strict";

var model = require("../models/modelObrigacaoAcessoria");

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
			coluna: model.colunas.nome,
			valor: req.body.nome ? req.body.nome : null
		}, {
			coluna: model.colunas.dataInicio,
			valor: req.body.dataInicio ? req.body.dataInicio : null
		}, {
			coluna: model.colunas.dataFim,
			valor: req.body.dataFim ? req.body.dataFim : null
		}, {
			coluna: model.colunas.fkDominioObrigacaoAcessoriaTipo,
			valor: req.body.fkDominioObrigacaoAcessoriaTipo ? Number(req.body.fkDominioObrigacaoAcessoriaTipo) : null
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
			coluna: model.colunas.nome,
			valor: req.body.nome ? req.body.nome : null
		}, {
			coluna: model.colunas.dataInicio,
			valor: req.body.dataInicio ? req.body.dataInicio : null
		}, {
			coluna: model.colunas.dataFim,
			valor: req.body.dataFim ? req.body.dataFim : null
		}, {
			coluna: model.colunas.fkDominioObrigacaoAcessoriaTipo,
			valor: req.body.fkDominioObrigacaoAcessoriaTipo ? Number(req.body.fkDominioObrigacaoAcessoriaTipo) : null
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
		var sStatement = 
			'select * '
			+ 'from "VGT.OBRIGACAO_ACESSORIA" obrigacao '
			+ 'left outer join "VGT.DOMINIO_OBRIGACAO_ACESSORIA_TIPO" tipo '
			+ 'on obrigacao."fk_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" = tipo."id_dominio_obrigacao_acessoria_tipo" ';

		model.execute({
			statement: sStatement
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	}
};