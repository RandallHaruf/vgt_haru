"use strict";

var model = require("../models/modelRespostaObrigacao");

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
		});
	},

	deepQuery: function (req, res) {

		var sStatement =
			'select * from ( ' +
			'select tblRespostaObrigacao.*,tblDominioAnoCalendario.*,tblModeloObrigacao.*,tblDominioObrigacaoStatus .*,tblPais.*,tblDominioPais.*,tblPeriodicidade.*, tblEmpresa.*, ' +
			'tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo", ' + 'tblRelModeloEmpresa."fk_id_empresa.id_empresa", ' +
			'tblRelModeloEmpresa."id_rel_modelo_empresa", ' +
			'tblRelModeloEmpresa."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" statusRel, ' +
			'tblRelModeloEmpresa."prazo_entrega_customizado", ' + 'tblRelModeloEmpresa."ind_ativo", ' +
			'(tblDominioAnoCalendario."ano_calendario" - COALESCE(tblModeloObrigacao."ano_obrigacao", ' +
			'case tblModeloObrigacao."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" ' +
			'when 1 then tblPais."ano_obrigacao_beps" ' + 'when 2 then tblPais."ano_obrigacao_compliance" ' + 'end ' + ')) "ano_fiscal", ' +
			'tblDominioMoeda."id_dominio_moeda", ' + 'tblDominioMoeda."acronimo", ' + 'tblDominioMoeda."nome" nome_moeda ' +
			'from "VGT.RESPOSTA_OBRIGACAO" tblRespostaObrigacao ' + 'left outer join "VGT.DOMINIO_MOEDA" tblDominioMoeda ' +
			'on tblRespostaObrigacao."fk_id_dominio_moeda.id_dominio_moeda" = tblDominioMoeda."id_dominio_moeda" ' +
			'left outer join "VGT.REL_MODELO_EMPRESA" tblRelModeloEmpresa ' +
			'on tblRespostaObrigacao."fk_id_rel_modelo_empresa.id_rel_modelo_empresa" = tblRelModeloEmpresa."id_rel_modelo_empresa" ' +
			'left outer join "VGT.DOMINIO_ANO_FISCAL" tblDominioAnoFiscal ' +
			'on tblRespostaObrigacao."fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal" = tblDominioAnoFiscal."id_dominio_ano_fiscal" ' +
			'left outer join "VGT.DOMINIO_ANO_CALENDARIO" tblDominioAnoCalendario ' +
			'on tblRespostaObrigacao."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" = tblDominioAnoCalendario."id_dominio_ano_calendario" ' +
			'left outer join "VGT.MODELO_OBRIGACAO" tblModeloObrigacao ' +
			'on tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" = tblModeloObrigacao."id_modelo" ' +
			'left outer join "VGT.DOMINIO_OBRIGACAO_STATUS" tblDominioObrigacaoStatus ' +
			'on tblRespostaObrigacao."fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status" = tblDominioObrigacaoStatus."id_dominio_obrigacao_status" ' +
			'left outer join "VGT.PAIS" tblPais ' + 'on tblModeloObrigacao."fk_id_pais.id_pais" = tblPais."id_pais" ' +
			'left outer join "VGT.DOMINIO_PAIS" tblDominioPais ' +
			'on tblPais."fk_dominio_pais.id_dominio_pais" = tblDominioPais."id_dominio_pais" ' +
			'left outer join "VGT.DOMINIO_PERIODICIDADE_OBRIGACAO" tblPeriodicidade ' +
			'on tblModeloObrigacao."fk_id_dominio_periodicidade.id_periodicidade_obrigacao" = tblPeriodicidade."id_periodicidade_obrigacao" ' +
			'left outer join "VGT.EMPRESA" tblEmpresa ' + 'on tblRelModeloEmpresa."fk_id_empresa.id_empresa" = tblEmpresa."id_empresa" ';

		var oWhere = [];
		var aParams = [];

		if (req.query.anoCalendario) {
			oWhere.push(' tblRespostaObrigacao."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" = ? ');
			aParams.push(req.query.anoCalendario);
		}

		if (req.query.empresa) {
			oWhere.push(' tblRelModeloEmpresa."fk_id_empresa.id_empresa" = ? ');
			aParams.push(req.query.empresa);
		}

		if (req.query.statusResp) {
			oWhere.push(' tblRespostaObrigacao."fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status" = ? ');
			aParams.push(req.query.statusResp);
		}

		if (req.query.tipo) {
			oWhere.push(' tblModeloObrigacao."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" = ? ');
			aParams.push(req.query.tipo);
		}

		if (req.query.statusModelo) {
			oWhere.push(' tblModeloObrigacao."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" = ? ');
			aParams.push(req.query.statusModelo);
		}

		if (req.query.IndAtivoRel) {
			oWhere.push(
				' (tblRelModeloEmpresa."ind_ativo" = ? OR tblRespostaObrigacao."fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status" != 4)'
			);
			aParams.push(req.query.IndAtivoRel);
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
		if (req.query.ListarDepoisDoAno) {
			oWhere.push(' tblRespostaObrigacao."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" > ? ');
			aParams.push(req.query.ListarDepoisDoAno);
		}
		if (req.query.ListarAteAnoAtual) {
			if (oWhere.length > 0) {
				sStatement += ' and tblDominioAnoCalendario."ano_calendario" <= year(CURRENT_DATE) ';
			} else {
				sStatement += ' where tblDominioAnoCalendario."ano_calendario" <= year(CURRENT_DATE) ';
			}
		}
		if (req.query.ListarAteAnoAtualMaisUm) {
			if (oWhere.length > 0) {
				sStatement += ' and (tblDominioAnoCalendario."ano_calendario" between 2018 and (year(CURRENT_DATE) + 1)) ';
			} else {
				sStatement += ' where (tblDominioAnoCalendario."ano_calendario" between 2018 and (year(CURRENT_DATE) + 1)) ';
			}
		}
		if (req.query.ListarSomenteEmVigencia) {
			if (oWhere.length > 0) {
				sStatement +=
					' and ((year(tblModeloObrigacao."data_inicial") <= tblDominioAnoCalendario."ano_calendario") and (year(tblModeloObrigacao."data_final") >= tblDominioAnoCalendario."ano_calendario")) ';
			} else {
				sStatement +=
					' where ((year(tblModeloObrigacao."data_inicial") <= tblDominioAnoCalendario."ano_calendario") and (year(tblModeloObrigacao."data_final") >= tblDominioAnoCalendario."ano_calendario")) ';
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
				var auth = require("../auth")();
				res.send(JSON.stringify(auth.filtrarEmpresas(req, result, "id_empresa")));
			}
		});
	}
};