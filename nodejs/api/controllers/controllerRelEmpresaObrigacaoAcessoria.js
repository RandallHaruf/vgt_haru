"use strict";

var model = require("../models/modelRelEmpresaObrigacaoAcessoria");

module.exports = {

	listarRegistros: function (req, res) {
		var aParams = [];

		if (req.query.fkEmpresa) {
			aParams.push({
				coluna: model.colunas.fkEmpresa,
				valor: req.query.fkEmpresa ? req.query.fkEmpresa : null
			});
		}

		if (req.query.indicadorHistorico) {
			aParams.push({
				coluna: model.colunas.indicadorHistorico,
				valor: req.query.indicadorHistorico ? req.query.indicadorHistorico : null
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
			coluna: model.colunas.fkEmpresa,
			valor: req.body.fkEmpresa ? req.body.fkEmpresa : null
		}, {
			coluna: model.colunas.fkObrigacaoAcessoria,
			valor: req.body.fkObrigacaoAcessoria ? req.body.fkObrigacaoAcessoria : null
		}, {
			coluna: model.colunas.dataInicio,
			valor: req.body.dataInicio ? req.body.dataInicio : null
		}, {
			coluna: model.colunas.dataFim,
			valor: req.body.dataFim ? req.body.dataFim : null
		}, {
			coluna: model.colunas.indicadorHistorico,
			valor: req.body.indicadorHistorico ? req.body.indicadorHistorico : null
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
			coluna: model.colunas.fkEmpresa,
			valor: req.body.fkEmpresa ? req.body.fkEmpresa : null
		}, {
			coluna: model.colunas.fkObrigacaoAcessoria,
			valor: req.body.fkObrigacaoAcessoria ? req.body.fkObrigacaoAcessoria : null
		}, {
			coluna: model.colunas.dataInicio,
			valor: req.body.dataInicio ? req.body.dataInicio : null
		}, {
			coluna: model.colunas.dataFim,
			valor: req.body.dataFim ? req.body.dataFim : null
		}, {
			coluna: model.colunas.indicadorHistorico,
			valor: req.body.indicadorHistorico ? req.body.indicadorHistorico : null
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
			'select '
			+ 'rel."id" "id_rel", '
			+ 'rel."data_inicio" "data_inicio_rel", '
			+ 'rel."data_fim" "data_fim_rel", '
			+ 'rel."fk_empresa.id_empresa", '
			+ 'rel."fk_obrigacao_acessoria.id_obrigacao_acessoria",  '
			+ 'rel."ind_historico", '
			+ 'obrigacao."nome", '
			+ 'tipoObrigacao."tipo" '
			+ 'from "VGT.REL_EMPRESA_OBRIGACAO_ACESSORIA" rel '
			+ 'inner join "VGT.OBRIGACAO_ACESSORIA" obrigacao '
			+ 'on rel."fk_obrigacao_acessoria.id_obrigacao_acessoria" = obrigacao."id_obrigacao_acessoria" '
			+ 'left outer join "VGT.DOMINIO_OBRIGACAO_ACESSORIA_TIPO" tipoObrigacao '
			+ 'on obrigacao."fk_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" = tipoObrigacao."id_dominio_obrigacao_acessoria_tipo" ';
			
		var aParams = [];
			
		if (req.params.idEmpresa && req.params.idEmpresa !== "-1") {
			sStatement += 'where rel."fk_empresa.id_empresa" = ? ';
			aParams.push(req.params.idEmpresa);
			
			if (req.query.indicadorHistorico) {
				sStatement += 'and rel."ind_historico" = ?';
				aParams.push(req.query.indicadorHistorico);
			}
		}
		 
		model.execute({
			statement: sStatement,
			parameters: aParams
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