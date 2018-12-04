"use strict";

var model = require("../models/modelUsuario");

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
			coluna: model.colunas.email,
			valor: req.body.email ? req.body.email : null
		}, {
			coluna: model.colunas.contato,
			valor: req.body.contato ? req.body.contato : null
		}, {
			coluna: model.colunas.user,
			valor: req.body.user ? req.body.user : null
		}, {
			coluna: model.colunas.pass,
			valor: req.body.pass ? req.body.pass : null
		}, {
			coluna: model.colunas.indAtivo,
			valor: req.body.indAtivo ? req.body.indAtivo : null
		}, {
			coluna: model.colunas.fkDominioDiferencaTipo,
			valor: req.body.fkDominioDiferencaTipo ? req.body.fkDominioDiferencaTipo : null
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
			coluna: model.colunas.email,
			valor: req.body.email ? req.body.email : null
		}, {
			coluna: model.colunas.contato,
			valor: req.body.contato ? req.body.contato : null
		}, {
			coluna: model.colunas.user,
			valor: req.body.user ? req.body.user : null
		}, {
			coluna: model.colunas.pass,
			valor: req.body.pass ? req.body.pass : null
		}, {
			coluna: model.colunas.indAtivo,
			valor: req.body.indAtivo ? req.body.indAtivo : null
		}, {
			coluna: model.colunas.fkDominioDiferencaTipo,
			valor: req.body.fkDominioDiferencaTipo ? req.body.fkDominioDiferencaTipo : null
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
		//res.send("TODO: DeepQuery da Entidade Usuario");
		
		var sStatement = 'select tblUsuario.* from "VGT.USUARIO" tblUsuario ';
		
		var oWhere = [];
		var aParams = [];
	
		if (req.query.tipoAcesso) {
			oWhere.push(' tblUsuario."fk_dominio_tipo_acesso.id_tipo_acesso" = ? ');
			aParams.push(req.query.tipoAcesso);
		}
		
		if (oWhere.length > 0) {
				sStatement += "where ";
	
				for (var i = 0; i < oWhere.length; i++) {
					if (i !== 0) {
						sStatement += " and ";
					}
					sStatement += oWhere[i];
				}
			}

		model.execute({
		statement: sStatement,
		parameters: aParams
		}, function (err, result) {
		if (err) {
		res.send(JSON.stringify(err));
		}
		else {
		res.send(JSON.stringify(result));
		}
		});
	}
};