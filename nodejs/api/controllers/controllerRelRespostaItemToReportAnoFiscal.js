"use strict";

var model = require("../models/modelRelRespostaItemToReportAnoFiscal");

module.exports = {

	listarRegistros: function (req, res) {
		var aParams = [];

		if (req.query.respostaItemToReport) {
			aParams.push({
				coluna: model.colunas.fkRespostaItemToReport,
				valor: req.query.respostaItemToReport
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
			coluna: model.colunas.fkRespostaItemToReport,
			valor: req.body.fkRespostaItemToReport ? req.body.fkRespostaItemToReport : null
		}, {
			coluna: model.colunas.fkDominioAnoFiscal,
			valor: req.body.fkDominioAnoFiscal ? req.body.fkDominioAnoFiscal : null
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
			coluna: model.colunas.fkRespostaItemToReport,
			valor: req.body.fkRespostaItemToReport ? req.body.fkRespostaItemToReport : null
		}, {
			coluna: model.colunas.fkDominioAnoFiscal,
			valor: req.body.fkDominioAnoFiscal ? req.body.fkDominioAnoFiscal : null
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
		var sStatement = 
			'select * '
			+ 'from "VGT.REL_RESPOSTA_ITEM_TO_REPORT_ANO_FISCAL" rel '
			+ 'inner join "VGT.DOMINIO_ANO_FISCAL" anoFiscal '
			+ 'on rel."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" = anoFiscal."id_dominio_ano_fiscal" '
			+ 'where '
			+ 'rel."fk_resposta_item_to_report.id_resposta_item_to_report" = ?';
		var aParam = [];
		
		if (req.query.respostaItemToReport) {
			aParam.push(req.query.respostaItemToReport);
		}

		model.execute({
			statement: sStatement,
			parameters: aParam
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		}, {
			idUsuario: req
		});
	}
};