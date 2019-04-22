"use strict";

var model = require("../models/modelModeloObrigacao");

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
			coluna: model.colunas.nomeObrigacao,
			valor: req.body.nomeObrigacao ? req.body.nomeObrigacao : null
		}, {
			coluna: model.colunas.dataInicial,
			valor: req.body.dataInicial ? req.body.dataInicial : null
		}, {
			coluna: model.colunas.dataFinal,
			valor: req.body.dataFinal ? req.body.dataFinal : null
		}, {
			coluna: model.colunas.prazoEntrega,
			valor: req.body.prazoEntrega ? req.body.prazoEntrega : null
		}, {
			coluna: model.colunas.fkIdPais,
			valor: req.body.fkIdPais ? Number(req.body.fkIdPais) : null
		}, {
			coluna: model.colunas.fkIdDominioPeriodicidade,
			valor: req.body.fkIdDominioPeriodicidade ? Number(req.body.fkIdDominioPeriodicidade) : null
		}, {
			coluna: model.colunas.fkIdDominioObrigacaoStatus,
			valor: req.body.fkIdDominioObrigacaoStatus ? Number(req.body.fkIdDominioObrigacaoStatus) : null
		}, {
			coluna: model.colunas.fkIdDominioObrigacaoAcessoriaTipo,
			valor: req.body.fkIdDominioObrigacaoAcessoriaTipo ? Number(req.body.fkIdDominioObrigacaoAcessoriaTipo) : null
		}, {
			coluna: model.colunas.anoObrigacao,
			valor: req.body.anoObrigacao ? req.body.anoObrigacao : null
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
			coluna: model.colunas.nomeObrigacao,
			valor: req.body.nomeObrigacao ? req.body.nomeObrigacao : null
		}, {
			coluna: model.colunas.dataInicial,
			valor: req.body.dataInicial ? req.body.dataInicial : null
		}, {
			coluna: model.colunas.dataFinal,
			valor: req.body.dataFinal ? req.body.dataFinal : null
		}, {
			coluna: model.colunas.prazoEntrega,
			valor: req.body.prazoEntrega ? req.body.prazoEntrega : null
		}, {
			coluna: model.colunas.fkIdPais,
			valor: req.body.fkIdPais ? Number(req.body.fkIdPais) : null
		}, {
			coluna: model.colunas.fkIdDominioPeriodicidade,
			valor: req.body.fkIdDominioPeriodicidade ? Number(req.body.fkIdDominioPeriodicidade) : null
		}, {
			coluna: model.colunas.fkIdDominioObrigacaoStatus,
			valor: req.body.fkIdDominioObrigacaoStatus ? Number(req.body.fkIdDominioObrigacaoStatus) : null
		}, {
			coluna: model.colunas.fkIdDominioObrigacaoAcessoriaTipo,
			valor: req.body.fkIdDominioObrigacaoAcessoriaTipo ? Number(req.body.fkIdDominioObrigacaoAcessoriaTipo) : null
		}, {
			coluna: model.colunas.anoObrigacao,
			valor: req.body.anoObrigacao ? req.body.anoObrigacao : null
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
			'select  ' + 'tblModeloObrigacao."id_modelo" "tblModeloObrigacao.id_modelo", ' +
			'tblModeloObrigacao."nome_obrigacao" "tblModeloObrigacao.nome_obrigacao", ' +
			'tblModeloObrigacao."data_inicial" "tblModeloObrigacao.data_inicial", ' +
			'tblModeloObrigacao."data_final" "tblModeloObrigacao.data_final", ' +
			'tblModeloObrigacao."prazo_entrega" "tblModeloObrigacao.prazo_entrega", ' +
			'tblModeloObrigacao."fk_id_pais.id_pais" "tblModeloObrigacao.fk_id_pais.id_pais", ' +
			'tblModeloObrigacao."fk_id_dominio_periodicidade.id_periodicidade_obrigacao" "tblModeloObrigacao.fk_id_dominio_periodicidade.id_periodicidade_obrigacao", ' +
			'tblModeloObrigacao."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" "tblModeloObrigacao.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status", ' +
			'tblPais."id_pais" "tblPais.id_pais", ' + 'tblPais."prescricao_prejuizo" "tblPais.prescricao_prejuizo", ' +
			'tblPais."limite_utilizacao_prejuizo" "tblPais.limite_utilizacao_prejuizo", ' +
			'tblPais."prescricao_credito" "tblPais.prescricao_credito", ' +
			'tblPais."fk_dominio_pais.id_dominio_pais" "tblPais.fk_dominio_pais.id_dominio_pais", ' +
			'tblPais."fk_dominio_pais_status.id_dominio_pais_status" "tblPais.fk_dominio_pais_status.id_dominio_pais_status", ' +
			'tblPais."fk_aliquota.id_aliquota" "tblPais.fk_aliquota.id_aliquota", ' +
			'tblPais."fk_dominio_pais_regiao.id_dominio_pais_regiao" "tblPais.fk_dominio_pais_regiao.id_dominio_pais_regiao", ' +
			'tblPais."ind_extensao_compliance" "tblPais.ind_extensao_compliance", ' + 'tblPais."ind_extensao_beps" "tblPais.ind_extensao_beps", ' +
			'tblDominioPais."id_dominio_pais" "tblDominioPais.id_dominio_pais", ' + 'tblDominioPais."pais" "tblDominioPais.pais" , ' +
			'tblDominioPaisStatus."id_dominio_pais_status" "tblDominioPaisStatus.id_dominio_pais_status", ' +
			'tblDominioPaisStatus."status" "tblDominioPaisStatus.status", ' +
			'tblDominioPaisRegiao."id_dominio_pais_regiao" "tblDominioPaisRegiao.id_dominio_pais_regiao", ' +
			'tblDominioPaisRegiao."regiao" "tblDominioPaisRegiao.regiao", ' +
			'tblPeriodicidade."id_periodicidade_obrigacao" "tblPeriodicidade.id_periodicidade_obrigacao", ' +
			'tblPeriodicidade."descricao" "tblPeriodicidade.descricao", ' +
			'tblDominioObrigacaoStatus."id_dominio_obrigacao_status" "tblDominioObrigacaoStatus.id_dominio_obrigacao_status", ' +
			'tblDominioObrigacaoStatus."descricao_obrigacao_status" "tblDominioObrigacaoStatus.descricao_obrigacao_status", ' +
			'tblTipoObrigacao."id_dominio_obrigacao_acessoria_tipo" "tblTipoObrigacao.id_dominio_obrigacao_acessoria_tipo", ' +
			'tblTipoObrigacao."tipo" "tblTipoObrigacao.tipo" ' + 'from "VGT.MODELO_OBRIGACAO" tblModeloObrigacao ' +
			'left outer JOIN "VGT.PAIS" tblPais ' + 'on tblModeloObrigacao."fk_id_pais.id_pais" = tblPais."id_pais" ' +
			'left outer join "VGT.DOMINIO_PAIS" tblDominioPais  ' +
			'on tblDominioPais."id_dominio_pais" = tblPais."fk_dominio_pais.id_dominio_pais" ' +
			'left outer join "VGT.DOMINIO_PAIS_STATUS" tblDominioPaisStatus  ' +
			'on tblDominioPaisStatus."id_dominio_pais_status" = tblPais."fk_dominio_pais_status.id_dominio_pais_status" ' +
			'left outer join "VGT.DOMINIO_PAIS_REGIAO" tblDominioPaisRegiao ' +
			'on tblDominioPaisRegiao."id_dominio_pais_regiao" = tblPais."fk_dominio_pais_regiao.id_dominio_pais_regiao" ' +
			'left outer join "VGT.DOMINIO_PERIODICIDADE_OBRIGACAO" tblPeriodicidade ' +
			'on tblModeloObrigacao."fk_id_dominio_periodicidade.id_periodicidade_obrigacao" = tblPeriodicidade."id_periodicidade_obrigacao" ' +
			'left outer join "VGT.DOMINIO_OBRIGACAO_ACESSORIA_TIPO" tblTipoObrigacao ' +
			'on tblModeloObrigacao."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" = tblTipoObrigacao."id_dominio_obrigacao_acessoria_tipo" ' +
			'left outer join "VGT.DOMINIO_OBRIGACAO_STATUS" tblDominioObrigacaoStatus on tblModeloObrigacao."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" = tblDominioObrigacaoStatus."id_dominio_obrigacao_status" ';

		var oWhere = [];
		var aParams = [];

		if (req.query.idRegistro) {
			oWhere.push(' tblPais."id_pais" = ? ');
			aParams.push(req.query.idRegistro);
		}
		if (req.query.idStatus) {
			oWhere.push(' tblDominioObrigacaoStatus."id_dominio_obrigacao_status" = ? ');
			aParams.push(req.query.idStatus);
		}
		if (req.query.idModeloObrigacao) {
			oWhere.push('tblModeloObrigacao."id_modelo" = ? ');
			aParams.push(req.query.idModeloObrigacao);
		}
		if (req.param.idRegistro) {
			oWhere.push(' tblPais."id_pais" = ? ');
			aParams.push(req.param.idRegistro);
		}
		if (req.param.idStatus) {
			oWhere.push(' tblDominioObrigacaoStatus."id_dominio_obrigacao_status" = ? ');
			aParams.push(req.param.idStatus);
		}
		if (req.param.idModeloObrigacao) {
			oWhere.push('tblModeloObrigacao."id_modelo" = ? ');
			aParams.push(req.param.idModeloObrigacao);
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

		sStatement += ' Order By "tblDominioPais.pais" ';

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