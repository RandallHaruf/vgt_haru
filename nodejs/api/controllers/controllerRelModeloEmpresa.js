"use strict";

var model = require("../models/modelRelModeloEmpresa");

module.exports = {

	listarRegistros: function (req, res) {
/*		var aParams = [];

		if (req.query.fkEmpresa) {
			aParams.push({
				coluna: model.colunas.fkEmpresa,
				valor: req.query.fkEmpresa ? req.query.fkEmpresa : null
			});
		}

		model.listar(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});	
		*/
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
		}, {
			coluna: model.colunas.indAtivo,
			valor: req.body.indAtivo ? req.body.indAtivo : null
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
		}, {
			coluna: model.colunas.indAtivo,
			valor: req.body.indAtivo ? req.body.indAtivo : null
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
//		res.send("TODO: DeepQuery da Entidade RelModeloEmpresa");

		var sStatement =
			' SELECT ' 
			+ ' tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" "tblRelModeloEmpresa.fk_id_modelo_obrigacao.id_modelo", '
			+ ' tblRelModeloEmpresa."fk_id_empresa.id_empresa" "tblRelModeloEmpresa.fk_id_empresa.id_empresa", '
	        + ' tblEmpresa."nome" "tblEmpresa.nome", '
	        + ' tblEmpresa."id_empresa" "tblEmpresa.id_empresa", '	        
			+ ' tblModeloObrigacao."nome_obrigacao" "tblModeloObrigacao.nome_obrigacao", '
			+ ' tblModeloObrigacao."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" "tblModeloObrigacao.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status", '
			+ ' tblRelModeloEmpresa."id_rel_modelo_empresa" "tblRelModeloEmpresa.id_rel_modelo_empresa", '
			+ ' tblRelModeloEmpresa."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" "tblRelModeloEmpresa.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status", '
			+ ' tblDominioStatusObrigacao."descricao" "tblDominioStatusObrigacao.descricao",'
	    	+ ' tblRelModeloEmpresa."ind_ativo" "tblRelModeloEmpresa.ind_ativo", '			
	    	+ ' tblRelModeloEmpresa."prazo_entrega_customizado" "tblRelModeloEmpresa.prazo_entrega_customizado" '
			+ ' FROM "VGT.REL_MODELO_EMPRESA" tblRelModeloEmpresa ' 
			+ ' inner join "VGT.EMPRESA" tblEmpresa on tblRelModeloEmpresa."fk_id_empresa.id_empresa" = tblEmpresa."id_empresa" '
			+ ' inner join "VGT.MODELO_OBRIGACAO" tblModeloObrigacao on tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" = tblModeloObrigacao."id_modelo"'
			+ ' left outer join "VGT.DOMINIO_STATUS_OBRIGACAO" tblDominioStatusObrigacao on tblRelModeloEmpresa."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" = tblDominioStatusObrigacao."id_status_obrigacao"';
			
			var oWhere = [];
			var aParams = [];
			
		if (req.query.idStatus) {
			oWhere.push(' tblRelModeloEmpresa."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" = ? ');
			aParams.push(req.query.idStatus);
		}
		
		if (req.query.idEmpresa) {
			oWhere.push(' tblRelModeloEmpresa."fk_id_empresa.id_empresa" = ? ');
			aParams.push(req.query.idEmpresa);
		}
		if (req.query.idEmpresaNaQualMeRelaciono) {
			oWhere.push(' tblEmpresa."id_empresa" = ? ');
			aParams.push(req.query.idEmpresaNaQualMeRelaciono);
		}		
		if (req.query.idModelo) {
			oWhere.push(' tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" = ? ');
			aParams.push(req.query.idModelo);
		}
		
		
		if (req.query.idObrigacaoStatus) {
			oWhere.push(' tblDominioStatusObrigacao."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" = ? ');
			aParams.push(req.query.idObrigacaoStatus);
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