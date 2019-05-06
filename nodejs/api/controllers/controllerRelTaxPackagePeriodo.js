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
		/*var sStatement =
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
		
		var sStatement = 
			'select '
			+ 'rel.*, taxPackage.*,periodo.*, '
			+ 'DAYS_BETWEEN(CURRENT_DATE,ADD_DAYS(TO_DATE(tblRequisicao."data_resposta"),5)) as "DiasRestantes", '
			+ '(case '
				+ 'when tblRequisicaoEncerramento."id_requisicao_encerramento_periodo_tax_package" is null '
					+ 'then false '
				+ 'else true '
			+ 'end) "ind_exibir_retificadora" '
			+ 'from "VGT.REL_TAX_PACKAGE_PERIODO" rel '
			+ 'inner join "VGT.TAX_PACKAGE" taxPackage '
				+ 'on rel."fk_tax_package.id_tax_package" = taxPackage."id_tax_package" '
			+ 'inner join "VGT.PERIODO" periodo '
				+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
			+ 'left outer join ( '
				+ 'select "VGT.REQUISICAO_REABERTURA_TAX_PACKAGE".* ,  row_number() over (partition by "fk_id_rel_tax_package_periodo.id_rel_tax_package_periodo" order by "id_requisicao_reabertura_tax_tackage" desc) as rownumber from "VGT.REQUISICAO_REABERTURA_TAX_PACKAGE" '
			+ ') tblRequisicao '
				+ 'on tblRequisicao."fk_id_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo" '
			+ 'left outer join ( '
				+ 'select "id_requisicao_encerramento_periodo_tax_package", "fk_rel_tax_package_periodo.id_rel_tax_package_periodo", '
				+ 'row_number() over ( '
					+ 'partition by "fk_rel_tax_package_periodo.id_rel_tax_package_periodo"  '
					+ 'order by "id_requisicao_encerramento_periodo_tax_package") as "rownumber_req_encerramento" '
				+ 'from "VGT.REQUISICAO_ENCERRAMENTO_PERIODO_TAX_PACKAGE" '
				+ 'where '
					+ '"fk_dominio_requisicao_encerramento_periodo_status.id_dominio_requisicao_encerramento_periodo_status" = 2' 
			+ ') tblRequisicaoEncerramento '
				+ 'on tblRequisicaoEncerramento."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = rel."id_rel_tax_package_periodo" ';
		
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
			sStatement += " and (tblRequisicao.ROWNUMBER = 1 or tblRequisicao.ROWNUMBER is null) and (tblRequisicaoEncerramento.\"rownumber_req_encerramento\" = 1 or tblRequisicaoEncerramento.\"rownumber_req_encerramento\" is null)"
		}else{
			sStatement += " where (tblRequisicao.ROWNUMBER = 1 or tblRequisicao.ROWNUMBER is null) and (tblRequisicaoEncerramento.\"rownumber_req_encerramento\" = 1 or tblRequisicaoEncerramento.\"rownumber_req_encerramento\" is null)"
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
	},
	
	copiarDadosPeriodoAnterior: function (req, res) {
		model.copiarDadosPeriodoAnterior(req.params.idRegistro)
			.then(() => {
				res.status(200).json({
					result: 'Cópia realizada com sucesso'
				});
			})
			.catch((err) => {
				next(err);
			});
	};
};