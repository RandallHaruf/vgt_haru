"use strict";

var model = require("../models/modelRespostaObrigacao");
const auth = require("../auth.js")();
const QueryBuildHelper = require('../QueryBuildHelper.js');

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
			coluna: model.colunas.suporteContratado,
			valor: req.body.suporteContratado ? req.body.suporteContratado : null
		}, {
			coluna: model.colunas.suporteEspecificacao,
			valor: req.body.suporteEspecificacao ? req.body.suporteEspecificacao : null
		}, {
			coluna: model.colunas.suporteValor,
			valor: req.body.suporteValor ? req.body.suporteValor : null
		}, {
			coluna: model.colunas.fkIdDominioMoeda,
			valor: req.body.fkIdDominioMoeda ? Number(req.body.fkIdDominioMoeda) : null
		}, {
			coluna: model.colunas.fkIdRelModeloEmpresa,
			valor: req.body.fkIdRelModeloEmpresa ? Number(req.body.fkIdRelModeloEmpresa) : null
		}, {
			coluna: model.colunas.fkIdDominioAnoFiscal,
			valor: req.body.fkIdDominioAnoFiscal ? Number(req.body.fkIdDominioAnoFiscal) : null
		}, {
			coluna: model.colunas.fkIdDominioAnoCalendario,
			valor: req.body.fkIdDominioAnoCalendario ? Number(req.body.fkIdDominioAnoCalendario) : null
		}, {
			coluna: model.colunas.fkIdDominioObrigacaoStatusResposta,
			valor: req.body.fkIdDominioObrigacaoStatusResposta ? Number(req.body.fkIdDominioObrigacaoStatusResposta) : null
		}, {
			coluna: model.colunas.dataExtensao,
			valor: req.body.dataExtensao ? req.body.dataExtensao : null
		}, {
			coluna: model.colunas.dataConclusao,
			valor: req.body.dataConclusao ? req.body.dataConclusao : null
		}, {
			coluna: model.colunas.indIniciada,
			valor: req.body.indIniciada ? req.body.indIniciada : null
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
			coluna: model.colunas.suporteContratado,
			valor: req.body.suporteContratado ? req.body.suporteContratado : null
		}, {
			coluna: model.colunas.suporteEspecificacao,
			valor: req.body.suporteEspecificacao ? req.body.suporteEspecificacao : null
		}, {
			coluna: model.colunas.suporteValor,
			valor: req.body.suporteValor ? req.body.suporteValor : null
		}, {
			coluna: model.colunas.fkIdDominioMoeda,
			valor: req.body.fkIdDominioMoeda ? Number(req.body.fkIdDominioMoeda) : null
		}, {
			coluna: model.colunas.fkIdRelModeloEmpresa,
			valor: req.body.fkIdRelModeloEmpresa ? Number(req.body.fkIdRelModeloEmpresa) : null
		}, {
			coluna: model.colunas.fkIdDominioAnoFiscal,
			valor: req.body.fkIdDominioAnoFiscal ? Number(req.body.fkIdDominioAnoFiscal) : null
		}, {
			coluna: model.colunas.fkIdDominioAnoCalendario,
			valor: req.body.fkIdDominioAnoCalendario ? Number(req.body.fkIdDominioAnoCalendario) : null
		}, {
			coluna: model.colunas.fkIdDominioObrigacaoStatusResposta,
			valor: req.body.fkIdDominioObrigacaoStatusResposta ? Number(req.body.fkIdDominioObrigacaoStatusResposta) : null
		}, {
			coluna: model.colunas.dataExtensao,
			valor: req.body.dataExtensao ? req.body.dataExtensao : null
		}, {
			coluna: model.colunas.dataConclusao,
			valor: req.body.dataConclusao ? req.body.dataConclusao : null
		}, {
			coluna: model.colunas.indIniciada,
			valor: req.body.indIniciada ? req.body.indIniciada : null
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

	marcaRespostasComoExcluidas: function (req, res) {
		var sStatement =
			'update "VGT.RESPOSTA_OBRIGACAO" set "fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status" = 3 where "id_resposta_obrigacao" in( ' +
			'select tblRespostaObrigacao."id_resposta_obrigacao" ' + 'from "VGT.EMPRESA" tblEmpresa ' +
			'left outer join "VGT.REL_MODELO_EMPRESA" tblRelModeloEmpresa on tblRelModeloEmpresa."fk_id_empresa.id_empresa" = tblEmpresa."id_empresa" ' +
			'left outer join "VGT.RESPOSTA_OBRIGACAO" tblRespostaObrigacao on tblRespostaObrigacao."fk_id_rel_modelo_empresa.id_rel_modelo_empresa" = tblRelModeloEmpresa."id_rel_modelo_empresa" ';

		var oWhere = [];
		var aParams = [];
		if (req.query.empresa) {
			oWhere.push(' tblEmpresa."id_empresa" = ? ');
			aParams.push(req.query.empresa);
		}
		if (req.query.anoCalendario) {
			oWhere.push(' tblRespostaObrigacao."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" > ? ');
			aParams.push(req.query.anoCalendario);
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
		sStatement += ' )';

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
	},

	deepQuery: function (req, res) {
		var sStatement = model.pegarQueryRespostaObrigacaoCalculada(
			req.query.tipoObrigacao ? req.query.tipoObrigacao.split(',') : [],
			req.query.anoCalendario ? req.query.anoCalendario.split(',') : [], 
			req.query.empresa ? req.query.empresa.split(',') : [], 
			req.query.statusResposta ? req.query.statusResposta.split(',') : []
		);
		
		let queryBuildHelper = new QueryBuildHelper({
			initialStatement: sStatement
		});
		
		queryBuildHelper
			.where('vw_resposta_obrigacao."fk_pais.id_pais"')
				.in(req.query.pais)
			.and('vw_resposta_obrigacao."fk_dominio_pais_regiao.id_dominio_pais_regiao"')	
				.in(req.query.regiao);
		
		model.execute({
			statement: queryBuildHelper.getStatement(),
			parameters: queryBuildHelper.getParameters()
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(auth.filtrarEmpresas(req, result, "id_empresa")));
			}
		}, {
			idUsuario: req
		});
	}
};