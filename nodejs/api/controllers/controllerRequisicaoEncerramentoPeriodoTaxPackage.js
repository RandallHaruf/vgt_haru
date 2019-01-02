"use strict";

var model = require("../models/modelRequisicaoEncerramentoPeriodoTaxPackage");

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
			coluna: model.colunas.dataRequisicao,
			valor: req.body.dataRequisicao ? req.body.dataRequisicao : null
		}, {
			coluna: model.colunas.observacao,
			valor: req.body.observacao ? req.body.observacao : null
		}, {
			coluna: model.colunas.resposta,
			valor: req.body.resposta ? req.body.resposta : null
		}, {
			coluna: model.colunas.fkDominioRequisicaoEncerramentoPeriodoStatus,
			valor: req.body.fkDominioRequisicaoEncerramentoPeriodoStatus ? Number(req.body.fkDominioRequisicaoEncerramentoPeriodoStatus) : null
		}, {
			coluna: model.colunas.fkUsuario,
			valor: req.body.fkUsuario ? Number(req.body.fkUsuario) : null
		}, {
			coluna: model.colunas.fkRelTaxPackagePeriodo,
			valor: req.body.fkRelTaxPackagePeriodo ? Number(req.body.fkRelTaxPackagePeriodo) : null
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
			coluna: model.colunas.dataRequisicao,
			valor: req.body.dataRequisicao ? req.body.dataRequisicao : null
		}, {
			coluna: model.colunas.observacao,
			valor: req.body.observacao ? req.body.observacao : null
		}, {
			coluna: model.colunas.resposta,
			valor: req.body.resposta ? req.body.resposta : null
		}, {
			coluna: model.colunas.fkDominioRequisicaoEncerramentoPeriodoStatus,
			valor: req.body.fkDominioRequisicaoEncerramentoPeriodoStatus ? Number(req.body.fkDominioRequisicaoEncerramentoPeriodoStatus) : null
		}, {
			coluna: model.colunas.fkUsuario,
			valor: req.body.fkUsuario ? Number(req.body.fkUsuario) : null
		}, {
			coluna: model.colunas.fkRelTaxPackagePeriodo,
			valor: req.body.fkRelTaxPackagePeriodo ? Number(req.body.fkRelTaxPackagePeriodo) : null
		}];

		model.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (req.body.atualizarPeriodo) {
					
					var iStatusEnvio = Number(req.body.fkDominioRequisicaoEncerramentoPeriodoStatus) === 2 ? 4 : 3; // aprovado ? enviado : em andamento
					var indAtivo = iStatusEnvio === 3;
					
					var sQuery = 
						'update "VGT.REL_TAX_PACKAGE_PERIODO" set '
						+ '"status_envio" = ?, '
						+ '"ind_ativo" = ? '
						+ 'where "id_rel_tax_package_periodo" = ? ',
						aParam = [iStatusEnvio, indAtivo, req.body.fkRelTaxPackagePeriodo];
					
					model.execute({
						statement: sQuery,
						parameters: aParam
					}, function (err2, result2) {
						if (err2) {
							res.send(JSON.stringify(err2));
						}	
						else {
							res.send(JSON.stringify(result2));
						}
					});
				}
				else {
					res.send(JSON.stringify(result));
				}
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
			'select req.*, rel.*, taxPackage.*, empresa."nome" "nome_empresa", domStatus.*, usuario."nome" "nome_usuario", periodo.*, anoCalendario.* '
			+ 'from "VGT.REQUISICAO_ENCERRAMENTO_PERIODO_TAX_PACKAGE" req '
			+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel '
			+ 'on req."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo" '
			+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
			+ 'on rel."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '
			+ 'inner join "VGT.EMPRESA" empresa '
			+ 'on taxPackage."fk_empresa.id_empresa" = empresa."id_empresa" '
			+ 'inner join "VGT.USUARIO" usuario '
			+ 'on req."fk_usuario.id_usuario" = usuario."id_usuario" '
			+ 'inner join "VGT.DOMINIO_REQUISICAO_ENCERRAMENTO_PERIODO_STATUS" domStatus '
			+ 'on req."fk_dominio_requisicao_encerramento_periodo_status.id_dominio_requisicao_encerramento_periodo_status" = domStatus."id_dominio_requisicao_encerramento_periodo_status" '
			+ 'inner join "VGT.PERIODO" periodo ' 
			+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
			+ 'inner join "VGT.DOMINIO_ANO_CALENDARIO" anoCalendario '
			+ 'on periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = anoCalendario."id_dominio_ano_calendario" ';
			
		var aWhere = [];
		var aParams = [];
		
		if (req.query.requisicao) {
			aWhere.push(' req."id_requisicao_encerramento_periodo_tax_package" = ? ');
			aParams.push(req.query.requisicao);
		}
		
		if (req.query.status) {
			aWhere.push(' req."fk_dominio_requisicao_encerramento_periodo_status.id_dominio_requisicao_encerramento_periodo_status" = ? ');
			aParams.push(req.query.status);
		}
		
		if (aWhere.length > 0) {
			sStatement += "where ";

			for (var i = 0; i < aWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += aWhere[i];
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
		});
	}
};