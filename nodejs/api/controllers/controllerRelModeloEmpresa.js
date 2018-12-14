"use strict";

var model = require("../models/modelRelModeloEmpresa");

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
			coluna: model.colunas.fkIdModeloObrigacao,
			valor: req.body.fkIdModeloObrigacao ? Number(req.body.fkIdModeloObrigacao) : null
		}, {
			coluna: model.colunas.fkIdEmpresa,
			valor: req.body.fkIdEmpresa ? Number(req.body.fkIdEmpresa) : null
		}, {
			coluna: model.colunas.fkIdDominioObrigacaoStatus,
			valor: req.body.fkIdDominioObrigacaoStatus ? Number(req.body.fkIdDominioObrigacaoStatus) : null
		}, {
			coluna: model.colunas.prazoEntregaCustomizado,
			valor: req.body.prazoEntregaCustomizado ? req.body.prazoEntregaCustomizado : null
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
			coluna: model.colunas.fkIdModeloObrigacao,
			valor: req.body.fkIdModeloObrigacao ? Number(req.body.fkIdModeloObrigacao) : null
		}, {
			coluna: model.colunas.fkIdEmpresa,
			valor: req.body.fkIdEmpresa ? Number(req.body.fkIdEmpresa) : null
		}, {
			coluna: model.colunas.fkIdDominioObrigacaoStatus,
			valor: req.body.fkIdDominioObrigacaoStatus ? Number(req.body.fkIdDominioObrigacaoStatus) : null
		}, {
			coluna: model.colunas.prazoEntregaCustomizado,
			valor: req.body.prazoEntregaCustomizado ? req.body.prazoEntregaCustomizado : null
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
		res.send("TODO: DeepQuery da Entidade RelModeloEmpresa");

		var sStatement =
			' SELECT ' 
			+ ' ME."fk_id_modelo_obrigacao.id_modelo", '
			+ ' ME."fk_id_empresa.id_empresa", '
	        + ' EM."nome", '
			+ ' OB."nome_obrigacao", '
			+ ' OB."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status"'
			+ ' ME."id_rel_modelo_empresa", '
			+ ' ME."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status", '
			+ ' SO."descricao",'
	    	+ ' ME."prazo_entrega_customizado" '
			+ ' FROM "VGT.REL_MODELO_EMPRESA" ME ' 
			+ ' inner join "VGT.EMPRESA" EM on ME."fk_id_empresa.id_empresa" = EM."id_empresa" '
			+ ' inner join "VGT.MODELO_OBRIGACAO" OB on ME."fk_id_modelo_obrigacao.id_modelo" = OB."id_modelo"'
			+ ' inner join "VGT.DOMINIO_STATUS_OBRIGACAO" SO on ME."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" = SO."id_status_obrigacao"';
			
			var oWhere = [];
			var aParams = [];
			
		if (req.query.status) {
			oWhere.push(' ME."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" = ? ');
			aParams.push(req.query.status);
		}
		
		if (req.query.idempresa) {
			oWhere.push(' ME."fk_id_empresa.id_empresa" = ? ');
			aParams.push(req.query.idempresa);
		}
		
		if (req.query.idmodelo) {
			oWhere.push(' ME."fk_id_modelo_obrigacao.id_modelo" = ? ');
			aParams.push(req.query.idmodelo);
		}
		
		
		if (req.query.statusModulo) {
			oWhere.push(' OB."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" = ? ');
			aParams.push(req.query.statusModulo);
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

		model.execute({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				for (var i = 0, length = result.length; i < length; i++) {
					result[i].ind_nao_aplicavel = result[i].ind_nao_aplicavel ? true : false;
				}
				res.send(JSON.stringify(result));
			}
		});
	}
};