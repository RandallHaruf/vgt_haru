"use strict";

var model = require("../models/modelObrigacao");

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
			coluna: model.colunas.prazo_entrega,
			valor: req.body.prazo_entrega ? req.body.prazo_entrega : null
		}, {
			coluna: model.colunas.extensao,
			valor: req.body.extensao ? req.body.extensao : null
		}, {
			coluna: model.colunas.obrigacao_inicial,
			valor: req.body.obrigacao_inicial ? req.body.obrigacao_inicial : null
		}, {
			coluna: model.colunas.suporte_contratado,
			valor: req.body.suporte_contratado ? req.body.suporte_contratado : null
		}, {
			coluna: model.colunas.suporte,
			valor: req.body.suporte ? req.body.suporte : null
		}, {
			coluna: model.colunas.observacoes,
			valor: req.body.observacoes ? req.body.observacoes : null
		}, {
			coluna: model.colunas.fkDominioStatusObrigacao,
			valor: req.body.fkDominioStatusObrigacao ? Number(req.body.fkDominioStatusObrigacao) : null
		}, {
			coluna: model.colunas.fkDominioPais,
			valor: req.body.fkDominioPais ? Number(req.body.fkDominioPais) : null
		}, {
			coluna: model.colunas.fkDominioPeriocidadeObrigacao,
			valor: req.body.fkDominioPeriocidadeObrigacao ? Number(req.body.fkDominioPeriocidadeObrigacao) : null
		}, {
			coluna: model.colunas.fkEmpresa,
			valor: req.body.fkEmpresa ? Number(req.body.fkEmpresa) : null
		}, {
			coluna: model.colunas.fkObrigacaoAcessoria,
			valor: req.body.fkObrigacaoAcessoria ? Number(req.body.fkObrigacaoAcessoria) : null
		}, {
			coluna: model.colunas.fkAnoFiscal,
			valor: req.body.fkAnoFiscal ? Number(req.body.fkAnoFiscal) : null
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
			coluna: model.colunas.prazo_entrega,
			valor: req.body.prazo_entrega ? req.body.prazo_entrega : null
		}, {
			coluna: model.colunas.extensao,
			valor: req.body.extensao ? req.body.extensao : null
		}, {
			coluna: model.colunas.obrigacao_inicial,
			valor: req.body.obrigacao_inicial ? req.body.obrigacao_inicial : null
		}, {
			coluna: model.colunas.suporte_contratado,
			valor: req.body.suporte_contratado ? req.body.suporte_contratado : null
		}, {
			coluna: model.colunas.suporte,
			valor: req.body.suporte ? req.body.suporte : null
		}, {
			coluna: model.colunas.observacoes,
			valor: req.body.observacoes ? req.body.observacoes : null
		}, {
			coluna: model.colunas.fkDominioStatusObrigacao,
			valor: req.body.fkDominioStatusObrigacao ? Number(req.body.fkDominioStatusObrigacao) : null
		}, {
			coluna: model.colunas.fkDominioPais,
			valor: req.body.fkDominioPais ? Number(req.body.fkDominioPais) : null
		}, {
			coluna: model.colunas.fkDominioPeriocidadeObrigacao,
			valor: req.body.fkDominioPeriocidadeObrigacao ? Number(req.body.fkDominioPeriocidadeObrigacao) : null
		}, {
			coluna: model.colunas.fkEmpresa,
			valor: req.body.fkEmpresa ? Number(req.body.fkEmpresa) : null
		}, {
			coluna: model.colunas.fkObrigacaoAcessoria,
			valor: req.body.fkObrigacaoAcessoria ? Number(req.body.fkObrigacaoAcessoria) : null
		}, {
			coluna: model.colunas.fkAnoFiscal,
			valor: req.body.fkAnoFiscal ? Number(req.body.fkAnoFiscal) : null
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
		res.send("TODO: DeepQuery da Entidade Obrigacao");

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