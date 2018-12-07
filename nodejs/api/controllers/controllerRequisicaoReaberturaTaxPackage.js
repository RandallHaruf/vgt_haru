"use strict";

var model = require("../models/modelRequisicaoReaberturaTaxPackage");

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
			coluna: model.colunas.idUsuario,
			valor: req.body.idUsuario ? req.body.idUsuario : null
		}, {
			coluna: model.colunas.nomeUsuario,
			valor: req.body.nomeUsuario ? req.body.nomeUsuario : null
		}, {
			coluna: model.colunas.justificativa,
			valor: req.body.justificativa ? req.body.justificativa : null
		}, {
			coluna: model.colunas.resposta,
			valor: req.body.resposta ? req.body.resposta : null
		}, {
			coluna: model.colunas.fkDominioRequisicaoReaberturaStatus,
			valor: req.body.fkDominioRequisicaoReaberturaStatus ? Number(req.body.fkDominioRequisicaoReaberturaStatus) : null
		}, {
			coluna: model.colunas.fkIdRelTaxPackagePeriodo,
			valor: req.body.fkIdRelTaxPackagePeriodo ? Number(req.body.fkIdRelTaxPackagePeriodo) : null
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
			coluna: model.colunas.idUsuario,
			valor: req.body.idUsuario ? req.body.idUsuario : null
		}, {
			coluna: model.colunas.nomeUsuario,
			valor: req.body.nomeUsuario ? req.body.nomeUsuario : null
		}, {
			coluna: model.colunas.justificativa,
			valor: req.body.justificativa ? req.body.justificativa : null
		}, {
			coluna: model.colunas.resposta,
			valor: req.body.resposta ? req.body.resposta : null
		}, {
			coluna: model.colunas.fkDominioRequisicaoReaberturaStatus,
			valor: req.body.fkDominioRequisicaoReaberturaStatus ? Number(req.body.fkDominioRequisicaoReaberturaStatus) : null
		}, {
			coluna: model.colunas.fkIdRelTaxPackagePeriodo,
			valor: req.body.fkIdRelTaxPackagePeriodo ? Number(req.body.fkIdRelTaxPackagePeriodo) : null
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
			  'select tblRequisicaoTaxPackage.*,tblRequisicaoTaxPackageStatus.*,tblTaxPackagePeriodo.*,tblTaxPackage.*,tblPeriodo.*,tblEmpresa.* from "VGT.REQUISICAO_REABERTURA_TAX_PACKAGE" tblRequisicaoTaxPackage '
			+ 'inner join "VGT.DOMINIO_REQUISICAO_REABERTURA_STATUS" tblRequisicaoTaxPackageStatus '
			+ 'on tblRequisicaoTaxPackage."fk_dominio_requisicao_reabertura_status.id_dominio_requisicao_reabertura_status" = tblRequisicaoTaxPackageStatus."id_dominio_requisicao_reabertura_status" '
			+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" tblTaxPackagePeriodo '
			+ 'on tblRequisicaoTaxPackage."fk_id_rel_tax_package_periodo.id_rel_tax_package_periodo" = tblTaxPackagePeriodo."id_rel_tax_package_periodo" '
			+ 'inner join "VGT.TAX_PACKAGE" tblTaxPackage '
			+ 'on tblTaxPackagePeriodo."fk_tax_package.id_tax_package" = tblTaxPackage."id_tax_package" '
			+ 'inner join "VGT.PERIODO" tblPeriodo '
			+ 'on tblTaxPackagePeriodo."fk_periodo.id_periodo" = tblPeriodo."id_periodo" '
			+ 'inner join "VGT.EMPRESA" tblEmpresa'
			+ 'on tblTaxPackage."fk_empresa.id_empresa" = tblEmpresa."id_empresa" ';


		var oWhere = [];
		var aParams = [];


		if (oWhere.length > 0) {
			sStatement += "where ";

			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}

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