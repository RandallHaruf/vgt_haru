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
		}, {
			coluna: model.colunas.fkDominioAprovacaoObrigacao,
			valor: req.body.fkDominioAprovacaoObrigacao ? Number(req.body.fkDominioAprovacaoObrigacao) : null
		}, {
			coluna: model.colunas.motivoReprovacao,
			valor: req.body.motivoReprovacao ? req.body.motivoReprovacao : null
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
		}, {
			coluna: model.colunas.fkDominioAprovacaoObrigacao,
			valor: req.body.fkDominioAprovacaoObrigacao ? Number(req.body.fkDominioAprovacaoObrigacao) : null
		}, {
			coluna: model.colunas.motivoReprovacao,
			valor: req.body.motivoReprovacao ? req.body.motivoReprovacao : null
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
		//res.send("TODO: DeepQuery da Entidade Obrigacao");

		var sStatement =
			'select tblObrigacao.*, ' +
			' tblStatusObrigacao."id_status_obrigacao" tblStatusObrigacaoID , tblStatusObrigacao."descricao" tblStatusObrigacaoDescricao , ' +
			' tblPais.*, tblPeriodicidadeObrigacao.*, tblEmpresa.*, ' +
			' tblObrigacaoAcessoria."id_obrigacao_acessoria" tblObrigacaoAcessoriaID , ' +
			' tblObrigacaoAcessoria."nome" tblObrigacaoAcessoriaNome , ' + ' tblObrigacaoAcessoria."data_inicio" tblObrigacaoAcessoriaDTInicio , ' +
			' tblObrigacaoAcessoria."fk_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" tblObrigacaoAcessoriaIdTipo ,  ' +
			' tblObrigacaoAcessoria."data_fim" tblObrigacaoAcessoriaDTFim , ' + ' tblAnoFiscal.* ' + ' from "VGT.OBRIGACAO" tblObrigacao ' +
			' left outer join "VGT.DOMINIO_STATUS_OBRIGACAO" tblStatusObrigacao ' +
			' on tblObrigacao."fk_dominio_status_obrigacao.id_status_obrigacao" = tblStatusObrigacao."id_status_obrigacao" ' +
			' left outer join "VGT.DOMINIO_PAIS" tblPais ' + ' on tblObrigacao."fk_dominio_pais.id_dominio_pais" = tblPais."id_dominio_pais" ' +
			' left outer join "VGT.DOMINIO_PERIODICIDADE_OBRIGACAO" tblPeriodicidadeObrigacao ' +
			' on tblObrigacao."fk_dominio_periodicidade_obrigacao.id_periodicidade_obrigacao" = tblPeriodicidadeObrigacao."id_periodicidade_obrigacao" ' +
			' left outer join "VGT.EMPRESA" tblEmpresa ' + ' on tblObrigacao."fk_empresa.id_empresa" = tblEmpresa."id_empresa" ' +
			' left Outer Join "VGT.OBRIGACAO_ACESSORIA" tblObrigacaoAcessoria ' +
			' On tblObrigacao."fk_obrigacao_acessoria.id_obrigacao_acessoria" = tblObrigacaoAcessoria."id_obrigacao_acessoria" ' +
			' left Outer Join "VGT.DOMINIO_ANO_FISCAL" tblAnoFiscal ' +
			' On tblObrigacao."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" = tblAnoFiscal."id_dominio_ano_fiscal" ';

		var oWhere = [];
		var aParams = [];

		if (req.query.idEmpresa) {
			oWhere.push(' tblEmpresa."id_empresa" = ? ');
			aParams.push(req.query.idEmpresa);
		}

		if (req.query.idTipo) {
			oWhere.push(' tblObrigacaoAcessoria."id_obrigacao_acessoria" = ? ');
			aParams.push(req.query.idTipo);
		}

		if (req.query.idStatus) {
			oWhere.push(' tblObrigacao."fk_dominio_status_obrigacao.id_status_obrigacao" = ? ');
			aParams.push(req.query.idStatus);
		}

		if (req.query.idAnoFiscal) {
			oWhere.push(' tblObrigacao."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" = ? ');
			aParams.push(req.query.idAnoFiscal);
		}

		if (req.query.idAprovacao) {
			oWhere.push(' tblObrigacao."fk_dominio_aprovacao_obrigacao.id_aprovacao_obrigacao" = ? ');
			aParams.push(req.query.idAprovacao);
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

		sStatement += ' Order By tblEmpresa."id_empresa"';

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