"use strict";

var model = require("../models/modelRelEmpresaPeriodo");

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
			coluna: model.colunas.fkEmpresa,
			valor: req.body.fkEmpresa ? req.body.fkEmpresa : null
		}, {
			coluna: model.colunas.fkPeriodo,
			valor: req.body.fkPeriodo ? req.body.fkPeriodo : null
		}, {
			coluna: model.colunas.indicadorAtivo,
			valor: req.body.indicadorAtivo ? req.body.indicadorAtivo : null
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
			coluna: model.colunas.fkPeriodo,
			valor: req.body.fkPeriodo ? req.body.fkPeriodo : null
		}, {
			coluna: model.colunas.indicadorAtivo,
			valor: req.body.indicadorAtivo ? req.body.indicadorAtivo : null
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
		//Antiga query antes da contagem de dias apos requisicao
		/*var sStatement = 
			'select * '
			+ 'from "VGT.REL_EMPRESA_PERIODO" rel '
			+ 'inner join "VGT.PERIODO" periodo '
			+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
			+ 'left outer join '';
			/*where
			rel."fk_empresa.id_empresa" = ?
			and rel."fk_periodo.id_periodo" = ?
			and periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario = ? "
			and periodo."fk_dominio_modulo.id_dominio_modulo" = ? */
		var sStatement = 
			'select '
			+ 'rel.*, '
			+ 'periodo.*, '
			+ 'tblRequisicao."fk_dominio_requisicao_reabertura_status.id_dominio_requisicao_reabertura_status", '
			+ 'DAYS_BETWEEN(CURRENT_DATE,ADD_DAYS(TO_DATE(tblRequisicao."data_resposta"),5)) as "DiasRestantes" '
			+ 'from "VGT.REL_EMPRESA_PERIODO" rel '
			+ 'inner join "VGT.PERIODO" periodo '
				+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
			+ 'left outer join ( '
				+ 'select '
				+ '"VGT.REQUISICAO_REABERTURA".*, '
				+ 'row_number() over (partition by "fk_empresa.id_empresa","fk_periodo.id_periodo" order by "id_requisicao_reabertura" desc) as rownumber '
				+ 'from "VGT.REQUISICAO_REABERTURA" '
			+ ') tblRequisicao '
				+ 'on tblRequisicao."fk_empresa.id_empresa" = rel."fk_empresa.id_empresa" '
				+ 'and tblRequisicao."fk_periodo.id_periodo" = rel."fk_periodo.id_periodo" ';
			
		var oWhere = [];
		var aParams = [];
		
		if (req.query.empresa) {
			oWhere.push(' rel."fk_empresa.id_empresa" = ? ');
			aParams.push(req.query.empresa);
		}
		
		if (req.query.periodo) {
			oWhere.push(' rel."fk_periodo.id_periodo" = ? ');
			aParams.push(req.query.periodo);
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
			sStatement += " and (tblRequisicao.ROWNUMBER = 1 or tblRequisicao.ROWNUMBER is null)";
		} else{
			sStatement += " where (tblRequisicao.ROWNUMBER = 1 or tblRequisicao.ROWNUMBER is null)";
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
		}, {
			idUsuario: req
		});
	}
};