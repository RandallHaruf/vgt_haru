"use strict";

var model = require("../models/modelRelTaxPackagePeriodo");

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
			coluna: model.colunas.fkTaxPackage,
			valor: req.body.fkTaxPackage ? Number(req.body.fkTaxPackage) : null
		}, {
			coluna: model.colunas.fkPeriodo,
			valor: req.body.fkPeriodo ? Number(req.body.fkPeriodo) : null
		}, {
			coluna: model.colunas.indAtivo,
			valor: req.body.indAtivo ? req.body.indAtivo : null
		}, {
			coluna: model.colunas.statusEnvio,
			valor: req.body.statusEnvio ? req.body.statusEnvio : null
		}, {
			coluna: model.colunas.dataEnvio,
			valor: req.body.dataEnvio ? req.body.dataEnvio : null
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
			coluna: model.colunas.fkTaxPackage,
			valor: req.body.fkTaxPackage ? Number(req.body.fkTaxPackage) : null
		}, {
			coluna: model.colunas.fkPeriodo,
			valor: req.body.fkPeriodo ? Number(req.body.fkPeriodo) : null
		}, {
			coluna: model.colunas.indAtivo,
			valor: req.body.indAtivo ? req.body.indAtivo : null
		}, {
			coluna: model.colunas.statusEnvio,
			valor: req.body.statusEnvio ? req.body.statusEnvio : null
		}, {
			coluna: model.colunas.dataEnvio,
			valor: req.body.dataEnvio ? req.body.dataEnvio : null
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
			'select * '
			+ 'from "VGT.REL_TAX_PACKAGE_PERIODO" rel '
			+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
			+ 'on rel."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '
			+ 'inner join "VGT.PERIODO" periodo '
			+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" ';
			/*where
			taxPackage."fk_empresa.id_empresa" = ?
			and periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ?
			and periodo."fk_dominio_modulo.id_dominio_modulo" = ? */

		var oWhere = [];
		var aParams = [];

		if (req.query.empresa) {
			oWhere.push(' taxPackage."fk_empresa.id_empresa" = ? ');
			aParams.push(req.query.empresa);
		}

		if (req.query.anoCalendario) {
			oWhere.push(' periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? ');
			aParams.push(req.query.anoCalendario);
		}

		if (req.query.modulo) {
			oWhere.push(' periodo."fk_dominio_modulo.id_dominio_modulo" = ? ');
			aParams.push(req.query.modulo);
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

		sStatement += ' order by periodo."numero_ordem" ';

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