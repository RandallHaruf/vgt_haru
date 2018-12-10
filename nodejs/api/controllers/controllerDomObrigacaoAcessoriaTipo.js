"use strict";

var model = require("../models/modelDomObrigacaoAcessoriaTipo");

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
			coluna: model.colunas.id,
			valor: req.body.id ? req.body.id : null
		}, {
			coluna: model.colunas.tipo,
			valor: req.body.tipo ? req.body.tipo : null
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
			coluna: model.colunas.id,
			valor: req.body.id ? req.body.id : null
		}, {
			coluna: model.colunas.tipo,
			valor: req.body.tipo ? req.body.tipo : null
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
			'SELECT ' 
			+ '"id_dominio_obrigacao_acessoria_tipo" , '
			+'"tipo" '
			+'FROM "VGT.DOMINIO_OBRIGACAO_ACESSORIA_TIPO" as tipoObrigacao ';
			
		var oWhere = [];
		var aParams = [];

		if (req.query.idRegistro) {
			oWhere.push(' tipoObrigacao."id_dominio_obrigacao_acessoria_tipo" = ? ');
			aParams.push(req.query.idRegistro);
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
		
		//sStatement += ' Order By empresa."nome"';

		model.execute({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	}
};