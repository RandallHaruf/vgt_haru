"use strict";

var model = require("../models/modelDiferencaOpcao");

module.exports = {

	listarRegistros: function (req, res) {
		var aParams = [];
		
		if (req.query.tipo) {
			aParams.push({
				coluna: model.colunas.fkDominioDiferencaTipo,
				valor: Number(req.query.tipo)
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
			coluna: model.colunas.nome,
			valor: req.body.nome ? req.body.nome : null
		}, {
			coluna: model.colunas.indDuplicavel,
			valor: req.body.indDuplicavel ? req.body.indDuplicavel : null
		}, {
			coluna: model.colunas.fkDominioDiferencaTipo,
			valor: req.body.fkDominioDiferencaTipo ? Number(req.body.fkDominioDiferencaTipo) : null
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
			coluna: model.colunas.indDuplicavel,
			valor: req.body.indDuplicavel ? req.body.indDuplicavel : null
		}, {
			coluna: model.colunas.fkDominioDiferencaTipo,
			valor: req.body.fkDominioDiferencaTipo ? Number(req.body.fkDominioDiferencaTipo) : null
		}];

		model.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},
/*
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
	},*/
	excluirRegistro: function (req, res, next) {
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
		var sStatement =
			'select * ' 
			+ 'from "VGT.DIFERENCA_OPCAO" diferenca ' 
			+ 'inner join "VGT.DOMINIO_DIFERENCA_TIPO" tipo ' 
			+ 'on diferenca."fk_dominio_diferenca_tipo.id_dominio_diferenca_tipo" = tipo."id_dominio_diferenca_tipo" ';

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