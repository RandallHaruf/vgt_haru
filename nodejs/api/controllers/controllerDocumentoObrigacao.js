"use strict";

var model = require("../models/modelDocumentoObrigacao");

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
			coluna: model.colunas.fkIdRespostaObrigacao,
			valor: req.body.fkIdRespostaObrigacao ? Number(req.body.fkIdRespostaObrigacao) : null
		}, {
			coluna: model.colunas.dadosArquivo,
			valor: req.body.dadosArquivo ? req.body.dadosArquivo : null
		}, {
			coluna: model.colunas.mimetype,
			valor: req.body.mimetype ? req.body.mimetype : null
		}, {
			coluna: model.colunas.tamanho,
			valor: req.body.tamanho ? req.body.tamanho : null
		}, {
			coluna: model.colunas.dataUpload,
			valor: req.body.dataUpload ? req.body.dataUpload : null
		}, {
			coluna: model.colunas.fkIdUsuario,
			valor: req.body.fkIdUsuario ? Number(req.body.fkIdUsuario) : null
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
			coluna: model.colunas.fkIdRespostaObrigacao,
			valor: req.body.fkIdRespostaObrigacao ? Number(req.body.fkIdRespostaObrigacao) : null
		},/* {
			coluna: model.colunas.dadosArquivo,
			valor: req.body.dadosArquivo ? req.body.dadosArquivo : null
		},*/ {
			coluna: model.colunas.mimetype,
			valor: req.body.mimetype ? req.body.mimetype : null
		}, {
			coluna: model.colunas.tamanho,
			valor: req.body.tamanho ? req.body.tamanho : null
		}, {
			coluna: model.colunas.dataUpload,
			valor: req.body.dataUpload ? req.body.dataUpload : null
		}, {
			coluna: model.colunas.fkIdUsuario,
			valor: req.body.fkIdUsuario ? Number(req.body.fkIdUsuario) : null
		}, {
			coluna: model.colunas.indConclusao,
			valor: req.body.indConclusao ? Number(req.body.indConclusao) : null
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

	excluirRegistro: function (req, res) {
		model.excluir([{
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		}, {
			isIdLog: true,
			valor: req
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	deepQuery: function (req, res) {
		res.send("TODO: DeepQuery da Entidade DocumentoObrigacao");

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