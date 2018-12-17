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
		'select tblRespostaObrigacao.*,tblDominioAnoFiscal.*,tblDominioAnoCalendario.*,tblModeloObrigacao.*,tblDominioObrigacaoStatus .*,tblPais.*,tblDominioPais.*,tblPeriodicidade.*, tblEmpresa.*, '
		+ 'tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo", '
		+ 'tblRelModeloEmpresa."fk_id_empresa.id_empresa", '
		+ 'tblRelModeloEmpresa."id_rel_modelo_empresa", '
		+ 'tblRelModeloEmpresa."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" statusRel, '
		+ 'tblRelModeloEmpresa."prazo_entrega_customizado", '
		+ 'tblDominioMoeda."id_dominio_moeda", '
		+ 'tblDominioMoeda."acronimo", '
		+ 'tblDominioMoeda."nome" nome_moeda '
		+ 'from "VGT.RESPOSTA_OBRIGACAO" tblRespostaObrigacao ' 
		+ 'left outer join "VGT.DOMINIO_MOEDA" tblDominioMoeda '
		+ 'on tblRespostaObrigacao."fk_id_dominio_moeda.id_dominio_moeda" = tblDominioMoeda."id_dominio_moeda" '
		+ 'left outer join "VGT.REL_MODELO_EMPRESA" tblRelModeloEmpresa '
		+ 'on tblRespostaObrigacao."fk_id_rel_modelo_empresa.id_rel_modelo_empresa" = tblRelModeloEmpresa."id_rel_modelo_empresa" '
		+ 'left outer join "VGT.DOMINIO_ANO_FISCAL" tblDominioAnoFiscal '
		+ 'on tblRespostaObrigacao."fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal" = tblDominioAnoFiscal."id_dominio_ano_fiscal" '
		+ 'left outer join "VGT.DOMINIO_ANO_CALENDARIO" tblDominioAnoCalendario '
		+ 'on tblRespostaObrigacao."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" = tblDominioAnoCalendario."id_dominio_ano_calendario" '
		+ 'left outer join "VGT.MODELO_OBRIGACAO" tblModeloObrigacao '
		+ 'on tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" = tblModeloObrigacao."id_modelo" '
		+ 'left outer join "VGT.DOMINIO_OBRIGACAO_STATUS" tblDominioObrigacaoStatus '
		+ 'on tblRelModeloEmpresa."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" = tblDominioObrigacaoStatus."id_dominio_obrigacao_status" '
		+ 'left outer join "VGT.PAIS" tblPais '
		+ 'on tblModeloObrigacao."fk_id_pais.id_pais" = tblPais."id_pais" '
		+ 'left outer join "VGT.DOMINIO_PAIS" tblDominioPais '
		+ 'on tblPais."fk_dominio_pais.id_dominio_pais" = tblDominioPais."id_dominio_pais" '
		+ 'left outer join "VGT.DOMINIO_PERIODICIDADE_OBRIGACAO" tblPeriodicidade '
		+ 'on tblModeloObrigacao."fk_id_dominio_periodicidade.id_periodicidade_obrigacao" = tblPeriodicidade."id_periodicidade_obrigacao" '
		+ 'left outer join "VGT.EMPRESA" tblEmpresa '
		+ 'on tblRelModeloEmpresa."fk_id_empresa.id_empresa" = tblEmpresa."id_empresa" ';
		
		
		var oWhere = [];
		var aParams = [];
		
		if (req.query.anoCalendario) {
			oWhere.push(' tblRespostaObrigacao."fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal" = ? ');
			aParams.push(req.query.anoCalendario);
		}
		
		if (req.query.empresa) {
			oWhere.push(' tblRelModeloEmpresa."fk_id_empresa.id_empresa" = ? ');
			aParams.push(req.query.empresa);
		}
		
		if (req.query.statusRel) {
			oWhere.push(' tblRelModeloEmpresa."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" = ? ');
			aParams.push(req.query.statusRel);
		}
		
		if (req.query.tipo) {
			oWhere.push(' tblModeloObrigacao."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" = ? ');
			aParams.push(req.query.tipo);
		}
		
		if (req.query.statusModelo) {
			oWhere.push(' tblModeloObrigacao."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" = ? ');
			aParams.push(req.query.statusModelo);
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
		
		//sStatement += ' order by periodo."numero_ordem" ';

		model.execute({
		statement: sStatement,
		parameters: aParams
		}, function (err, result) {
		if (err) {
		res.send(JSON.stringify(err));
		}
		else {
		res.send(JSON.stringify(result));
		}
		});
	}
};