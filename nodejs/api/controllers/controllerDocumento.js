// Desenvolvido por Luiz Fernandes Mais criado Por Pernil
"use strict";

var db = require("../db");
var modelRespostaObrigacao = require('../models/modelRespostaObrigacao');

function closeConnection(oConnection) {
	try {
		if (oConnection) {
			oConnection.close();
		}
	} catch (e) {
		console.log(e);
	}
}

module.exports = {

	listarArquivos: function (req, res) {
		var conn = db.getConnection();

		var aParam = [],
			sQuery =
			' SELECT "id_documento", "fk_id_resposta_obrigacao.id_resposta_obrigacao", "mimetype", "tamanho", "data_upload", "nome_arquivo", "fk_id_usuario.id_usuario", "ind_conclusao" FROM "VGT.DOCUMENTO_OBRIGACAO" ';

		if (req.query.id) {
			aParam.push(req.query.id);

			sQuery += ' where "fk_id_resposta_obrigacao.id_resposta_obrigacao" = ? ';
		}

		sQuery += ' order by "id_documento", "data_upload" ';

		conn.exec(sQuery, aParam, function (err, result) {
			if (err) {
				console.log(err);
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify({
					success: true,
					result: result
				}));
			}

			closeConnection(conn);
		});
	},

	downloadArquivo: function (req, res) {
		if (req.query.arquivo) {
			var conn = db.getConnection();

			conn.exec(
				'select * from "VGT.DOCUMENTO_OBRIGACAO" where "id_documento" = ?', [req.query.arquivo],
				function (err, result) {
					if (err) {
						console.log(err);
						res.send(JSON.stringify(err));
					} else {
						res.send(JSON.stringify({
							success: true,
							result: result
						}));
					}

					closeConnection(conn);
				}
			);
		} else {
			res.send(JSON.stringify({
				success: false,
				error: {
					message: "ID de arquivo não especificado"
				}
			}));
		}
	},

	uploadArquivo: function (req, res) {
		if (req.file) {
			//console.log("arquivo", req.file);
			//console.log(req.file.buffer.constructor.name);

			var idRespostaObrigacao = req.body.id ? req.body.id : null;
			var Confirmado = req.body.indConclusao ? req.body.indConclusao : null;

			var sQuery =
				'INSERT INTO "VGT.DOCUMENTO_OBRIGACAO"(' 
				+ '"id_documento", ' 
				+ '"fk_id_resposta_obrigacao.id_resposta_obrigacao", ' 
				+ '"dados_arquivo", ' 
				+ '"mimetype", ' 
				+ '"tamanho", ' 
				+ '"data_upload", ' 
				+ '"nome_arquivo", ' 
				+ '"fk_id_usuario.id_usuario", ' 
				+ '"ind_conclusao") ' 
				+ ' values(' 
				+ '"identity_VGT.DOCUMENTO_OBRIGACAO_id_documento".nextval, ' 
				+ '?, ' 
				+ '?, ' 
				+ '?,' 
				+ '?, '
				+ 'CURRENT_DATE, ' 
				+ '?, ' 
				+ '?, ' 
				+ '?) ';

			var aParam = [
				idRespostaObrigacao,
				req.file.buffer,
				req.file.mimetype,
				req.file.size,
				req.file.originalname,
				1,
				Confirmado
			];

			var conn = db.getConnection();

			/*console.log(sQuery);
			console.log(JSON.stringify(aParam));*/

			conn.exec(sQuery, aParam, function (err, result) {
				if (err) {
					console.log(err);
					res.send(JSON.stringify(err));
				} else {
					res.send(JSON.stringify({
						success: true,
						result: result
					}));
				}

				closeConnection(conn);
			});
		} else {
			res.send(JSON.stringify({
				success: false,
				error: {
					message: "Arquivo não enviado ou inválido"
				}
			}));
		}
	},

	excluirArquivo: function (req, res) {
		if (req.params.idRegistro) {
			//console.log("arquivo", req.file);
			//console.log(req.file.buffer.constructor.name);

			var conn = db.getConnection(),
				sQuery = 'delete from "VGT.DOCUMENTO_OBRIGACAO" where "id_documento" = ?',
				aParam = [req.params.idRegistro];

			conn.exec(sQuery, aParam, function (err, result) {
				if (err) {
					console.log(err);
					res.send(JSON.stringify(err));
				} else {
					res.send(JSON.stringify({
						success: true,
						result: result
					}));
				}

				closeConnection(conn);
			});
		} else {
			res.send(JSON.stringify({
				success: false,
				error: {
					message: "ID do Arquivo não especificado"
				}
			}));
		}
	},
	
	listarTodosArquivos: function (req, res) {

		var sStatement =  'SELECT * FROM ( ' 
						  +'SELECT '
						  +'tblRespostaObrigacao.*, '
						  +'tblModeloObrigacao.*, '
						  +'tblDominioAnoCalendario.*, '
                          +'tblDominioObrigacaoStatus .*, '
                          +'tblPeriodicidade.*, '
						  +'tblEmpresa.*, '
						  +'tblDocumentoObrigacao."nome_arquivo", '
						  +'tblDocumentoObrigacao."id_documento", '
						  +'tblDocumentoObrigacao."data_upload", '
						  +'(tblDominioAnoCalendario."ano_calendario" - COALESCE(tblModeloObrigacao."ano_obrigacao", '
						  +'case tblModeloObrigacao."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" '
						  +'when 1 then tblPais."ano_obrigacao_beps" '
						  +'when 2 then tblPais."ano_obrigacao_compliance" '
						  +'end '
						  +')) "ano_fiscal", '
						  +'tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo", '
						  +'tblRelModeloEmpresa."fk_id_empresa.id_empresa", '
						  +'tblRelModeloEmpresa."id_rel_modelo_empresa", '
						  +'tblRelModeloEmpresa."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" statusRel, '
						  +'tblRelModeloEmpresa."prazo_entrega_customizado", '
						  +'tblRelModeloEmpresa."ind_ativo" '
						  +'FROM "VGT.RESPOSTA_OBRIGACAO" tblRespostaObrigacao '
						  +'LEFT OUTER JOIN "VGT.REL_MODELO_EMPRESA" tblRelModeloEmpresa '
						  +'ON tblRespostaObrigacao."fk_id_rel_modelo_empresa.id_rel_modelo_empresa" = tblRelModeloEmpresa."id_rel_modelo_empresa" '
						  +'LEFT OUTER JOIN "VGT.MODELO_OBRIGACAO" tblModeloObrigacao '
						  +'ON tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" = tblModeloObrigacao."id_modelo" '
						  +'LEFT OUTER JOIN "VGT.DOMINIO_OBRIGACAO_STATUS" tblDominioObrigacaoStatus '
						  +'ON tblRespostaObrigacao."fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status" = tblDominioObrigacaoStatus."id_dominio_obrigacao_status" '
						  +'LEFT OUTER JOIN "VGT.DOMINIO_PERIODICIDADE_OBRIGACAO" tblPeriodicidade '
						  +'ON tblModeloObrigacao."fk_id_dominio_periodicidade.id_periodicidade_obrigacao" = tblPeriodicidade."id_periodicidade_obrigacao" '
						  +'LEFT OUTER JOIN "VGT.EMPRESA" tblEmpresa '
						  +'ON tblRelModeloEmpresa."fk_id_empresa.id_empresa" = tblEmpresa."id_empresa" '
						  +'LEFT outer join "VGT.DOMINIO_ANO_CALENDARIO" tblDominioAnoCalendario '
						  +'ON tblRespostaObrigacao."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" = tblDominioAnoCalendario."id_dominio_ano_calendario" '
						  + 'left outer join "VGT.PAIS" tblPais '
						  + 'on tblModeloObrigacao."fk_id_pais.id_pais" = tblPais."id_pais" '
						  +'INNER JOIN "VGT.DOCUMENTO_OBRIGACAO" tblDocumentoObrigacao '
						  +'ON tblRespostaObrigacao."id_resposta_obrigacao" = tblDocumentoObrigacao."fk_id_resposta_obrigacao.id_resposta_obrigacao" ';
		var oWhere = [];
		var aParams = [];
		
		/*if (req.query.anoFiscal) {
			var Interrogacoes = "";
			var aAnoFiscal = JSON.parse(req.query.anoFiscal);
			for (var i = 0; i< aAnoFiscal.length; i++){
				Interrogacoes += (Interrogacoes === "" ? "" : ",") + "?";
				aParams.push(req.query.aAnoFiscal[i]);
			}
			oWhere.push(' "ano_fiscal" in (' + Interrogacoes + ') ');
		}*/
		
		if (req.query.IndAtivoRel) {
			oWhere.push(' (tblRelModeloEmpresa."ind_ativo" = ? OR tblRespostaObrigacao."fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status" != 4)');
			aParams.push(req.query.IndAtivoRel);
		}
		
		if (req.query.idEmpresa) {
			var Interrogacoes = "";
			var aIdEmpresa = JSON.parse(req.query.idEmpresa);
			for (var i = 0; i< aIdEmpresa.length; i++){
				Interrogacoes += (Interrogacoes === "" ? "" : ",") + "?";
				aParams.push(Number(aIdEmpresa[i]));
			}
			oWhere.push(' tblEmpresa."id_empresa" in (' + Interrogacoes + ') ');
		}
		if (req.query.idObrigacoes) {
			var Interrogacoes2 = "";
			var aidObrigacoes = JSON.parse(req.query.idObrigacoes);
			for (var j = 0; j< aidObrigacoes.length; j++){
				Interrogacoes2 += (Interrogacoes2 === "" ? "" : ",") + "?";
				aParams.push(Number(aidObrigacoes[j]));
			}
			oWhere.push(' tblModeloObrigacao."id_modelo" in (' + Interrogacoes2 + ') ');
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
		
		if (req.query.ListarSomenteEmVigencia){
			if (oWhere.length > 0) {
				sStatement += ' and ((year(tblModeloObrigacao."data_inicial") <= tblDominioAnoCalendario."ano_calendario") and (year(tblModeloObrigacao."data_final") >= tblDominioAnoCalendario."ano_calendario")) ';		
			}		
			else{
				sStatement += ' where ((year(tblModeloObrigacao."data_inicial") <= tblDominioAnoCalendario."ano_calendario") and (year(tblModeloObrigacao."data_final") >= tblDominioAnoCalendario."ano_calendario")) ';
			}
		}
		sStatement += ')';
		if (req.query.anoFiscal){
			var aAnoFiscal = JSON.parse(req.query.anoFiscal);
			var strAnoFiscal = "";
			for (var i = 0; i< aAnoFiscal.length; i++){
				strAnoFiscal += (strAnoFiscal === "" ? "" : ",") + aAnoFiscal[i];
			}
			sStatement += ' where "ano_fiscal" in (' + strAnoFiscal + ') ';
		}
		console.log(sStatement);
		
		var conn = db.getConnection();

		conn.exec(sStatement,aParams, function (err, result) {
		closeConnection(conn);
		if (err) {
		res.send(JSON.stringify(err));
		}
		else {
			var auth = require("../auth")();
		res.send(JSON.stringify(auth.filtrarEmpresas(req, result, "id_empresa")));
		}
		});
	},
	
	/**
	* 05/04/2019 @pedsf - Novo método para listar arquivos de respostas de obrigações 
	* que re-utiliza as mesmas validações aplicadas na listagem de obrigações do compliance/beps
	**/
	deepQuery: function (req, res, next) {
		try {
			var aFiltroEmpresa = req.query.empresa ? JSON.parse(req.query.empresa) : [],
				aFiltroTipo = req.query.tipo ? JSON.parse(req.query.tipo) : [],
				aFiltroNomeObrigacao = req.query.nomeObrigacao ? JSON.parse(req.query.nomeObrigacao) : [];
			
			var sQuery = 
				'select t."id_documento", '
				+ 't."nome_arquivo", '
				+ 't."id_empresa", '
				+ 't."nome" "nome_empresa", '
				+ 't."id_modelo" "id_modelo_obrigacao", '
				+ 't."nome_obrigacao", '
				+ 't."tipo" '
				+ 'from ('
				+ modelRespostaObrigacao.pegarQueryRespostaObrigacaoCalculada()
				+ 'inner join "VGT.DOCUMENTO_OBRIGACAO" doc '
				+ 'on vw_resposta_obrigacao."id_resposta_obrigacao" = doc."fk_id_resposta_obrigacao.id_resposta_obrigacao" '
				+ 'inner join "VGT.DOMINIO_OBRIGACAO_ACESSORIA_TIPO" tipoObrigacao '
				+ 'on vw_resposta_obrigacao."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" = tipoObrigacao."id_dominio_obrigacao_acessoria_tipo" ) t ',
				aParam = [];
			
			if (req.query.nomeArquivo || aFiltroEmpresa.length || aFiltroTipo.length || aFiltroNomeObrigacao.length) {
				sQuery += ' where ';
			}
			
			
			if (req.query.nomeArquivo) {
				sQuery += ' UPPER(t."nome_arquivo") like ? ';
				aParam.push('%' + req.query.nomeArquivo.toUpperCase() + '%');
			}
			
			sQuery = concatenarIn(sQuery, 't."id_empresa"', aFiltroEmpresa, aParam, req.query.nomeArquivo);
			sQuery = concatenarIn(sQuery, 't."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo"', aFiltroTipo, aParam, ((req.query.nomeArquivo || aFiltroEmpresa.length) && aFiltroTipo.length));
			sQuery = concatenarIn(sQuery, 't."nome_obrigacao"', aFiltroNomeObrigacao, aParam, ((req.query.nomeArquivo || aFiltroEmpresa.length || aFiltroTipo.length) && aFiltroNomeObrigacao.length));
			
			db.executeStatement({
				statement: sQuery,
				parameters: aParam
			}, (err, result) => {
				if (err) {
					console.log(err);
					next(err);
				}	
				else {
					var auth = require("../auth")();
					res.status(200).json({
						result: auth.filtrarEmpresas(req, result, "id_empresa")
					});
				}
			});
		}
		catch (e) {
			console.log(e);
			next("Erro inesperado ao listar arquivos: " + err.message);
		}
	}
};

function concatenarIn(sStatement, sNomeColuna, aValor, aParam, bAnd) {
	if (aValor.length) {
		sStatement += (bAnd ? ' and ' : ' ') + sNomeColuna + ' in ('
					
		for (var i = 0, length = aValor.length; i < length; i++) {
			if (i !== 0) {
				sStatement += ',';
			}
			sStatement += '?';
			aParam.push(aValor[i]);
		}
		
		sStatement += ') ';
	}
	
	return sStatement;
}