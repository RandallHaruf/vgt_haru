"use strict";

var model = require("../models/modelRespostaItemToReport");

module.exports = {

	listarRegistros: function (req, res) {

		var aParams = [];

		if (req.query.relTaxPackagePeriodo) {
			aParams.push({
				coluna: model.colunas.fkRelTaxPackagePeriodo,
				valor: req.query.relTaxPackagePeriodo
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
			coluna: model.colunas.indSeAplica,
			valor: req.body.indSeAplica ? req.body.indSeAplica : null
		}, {
			coluna: model.colunas.resposta,
			valor: req.body.resposta ? req.body.resposta : null
		}, {
			coluna: model.colunas.fkRelTaxPackagePeriodo,
			valor: req.body.fkRelTaxPackagePeriodo ? Number(req.body.fkRelTaxPackagePeriodo) : null
		}, {
			coluna: model.colunas.fkItemToReport,
			valor: req.body.fkItemToReport ? Number(req.body.fkItemToReport) : null
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
			coluna: model.colunas.indSeAplica,
			valor: req.body.indSeAplica ? req.body.indSeAplica : null
		}, {
			coluna: model.colunas.resposta,
			valor: req.body.resposta ? req.body.resposta : null
		}, {
			coluna: model.colunas.fkRelTaxPackagePeriodo,
			valor: req.body.fkRelTaxPackagePeriodo ? Number(req.body.fkRelTaxPackagePeriodo) : null
		}, {
			coluna: model.colunas.fkItemToReport,
			valor: req.body.fkItemToReport ? Number(req.body.fkItemToReport) : null
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
			'select *  ' 
			+ 'from "VGT.RESPOSTA_ITEM_TO_REPORT" resposta ' 
			+ 'inner join "VGT.REL_TAX_PACKAGE_PERIODO" rel ' 
			+ 'on resposta."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo" ' 
			+ 'inner join "VGT.PERIODO" periodo ' 
			+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
			+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
			+ 'on rel."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '; 

		var aWhere = [];
		var aParam = [];

		if (req.query.relTaxPackagePeriodo) {
			aWhere.push(' rel."id_rel_tax_package_periodo" = ? ');
			aParam.push(req.query.relTaxPackagePeriodo);
		}
		
		if (req.query.empresa) {
			aWhere.push(' taxPackage."fk_empresa.id_empresa" = ? ');
			aParam.push(req.query.empresa);
		}
		
		if (req.query.anoCalendario) {
			aWhere.push(' periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? ');
			aParam.push(req.query.anoCalendario);
		}
		
		if (req.query.numeroOrdem) {
			if (req.query.historico) {
				aWhere.push(' periodo."numero_ordem" < ? and periodo."numero_ordem" <= 5 ');
			}
			else {
				aWhere.push(' periodo."numero_ordem" = ?');
			}
			aParam.push(req.query.numeroOrdem);
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
			parameters: aParam
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	}
};