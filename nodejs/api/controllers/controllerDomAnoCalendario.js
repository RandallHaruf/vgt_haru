"use strict";

var model = require("../models/modelDomAnoCalendario");

module.exports = {

	listarRegistros: function (req, res) {
		model.listar([], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (req.query.full && req.query.full == "true") {
					res.send(JSON.stringify(result));
				}
				else {
					var iAnoCorrente = (new Date()).getFullYear();
					res.send(JSON.stringify(result.filter(function(obj) {
						return obj.ano_calendario <= iAnoCorrente;
					})));
				}
			}
		});
	},

	criarRegistro: function (req, res) {

		var aParams = [{
			coluna: model.colunas.id,
			valor: req.body.id ? req.body.id : null
		}, {
			coluna: model.colunas.anoCalendario,
			valor: req.body.anoCalendario ? req.body.anoCalendario : null
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
			coluna: model.colunas.anoCalendario,
			valor: req.body.anoCalendario ? req.body.anoCalendario : null
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
			+' tblDominioAnoCalendario."id_dominio_ano_calendario", '
			+' tblDominioAnoCalendario."ano_calendario" '
			+' FROM "VGT.DOMINIO_ANO_CALENDARIO" tblDominioAnoCalendario ';
			
		var oWhere = [];
		var aParams = [];

		if (req.params.idRegistro) {
			oWhere.push(' tblDominioAnoCalendario."id_dominio_ano_calendario" = ? ');
			aParams.push(req.params.idRegistro);
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
		else{
			sStatement += 'where tblDominioAnoCalendario."ano_calendario" >= year(CURRENT_DATE)';
		}

		sStatement += ' Order By tblDominioAnoCalendario."ano_calendario"';
		
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
	},
	deepQuery2: function (req, res) {
		var sStatement = 
			'SELECT '
			+' tblDominioAnoCalendario."id_dominio_ano_calendario", '
			+' tblDominioAnoCalendario."ano_calendario" '
			+' FROM "VGT.DOMINIO_ANO_CALENDARIO" tblDominioAnoCalendario '
			+' where tblDominioAnoCalendario."ano_calendario" >= 2018 and tblDominioAnoCalendario."ano_calendario" <= (year(CURRENT_DATE) + 1) ';


		

		sStatement += ' Order By tblDominioAnoCalendario."ano_calendario"';
		
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