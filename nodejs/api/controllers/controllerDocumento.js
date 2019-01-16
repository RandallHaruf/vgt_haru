// Desenvolvido por Luiz Fernandes Mais criado Por Pernil
"use strict";

var db = require("../db");

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

		var sStatement =   'SELECT '
						  +'tblRespostaObrigacao.*, '
						  +'tblDominioAnoFiscal.*, '
						  +'tblModeloObrigacao.*, '
                          +'tblDominioObrigacaoStatus .*, '
                          +'tblPeriodicidade.*, '
						  +'tblEmpresa.*, '
						  +'tblDocumentoObrigacao.*, '
						  +'tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo", '
						  +'tblRelModeloEmpresa."fk_id_empresa.id_empresa", '
						  +'tblRelModeloEmpresa."id_rel_modelo_empresa", '
						  +'tblRelModeloEmpresa."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" statusRel, '
						  +'tblRelModeloEmpresa."prazo_entrega_customizado", '
						  +'tblRelModeloEmpresa."ind_ativo" '
						  +'FROM "VGT.RESPOSTA_OBRIGACAO" tblRespostaObrigacao '
						  +'LEFT OUTER JOIN "VGT.REL_MODELO_EMPRESA" tblRelModeloEmpresa '
						  +'ON tblRespostaObrigacao."fk_id_rel_modelo_empresa.id_rel_modelo_empresa" = tblRelModeloEmpresa."id_rel_modelo_empresa" '
						  +'LEFT OUTER JOIN "VGT.DOMINIO_ANO_FISCAL" tblDominioAnoFiscal '
						  +'ON tblRespostaObrigacao."fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal" = tblDominioAnoFiscal."id_dominio_ano_fiscal" '
						  +'LEFT OUTER JOIN "VGT.MODELO_OBRIGACAO" tblModeloObrigacao '
						  +'ON tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" = tblModeloObrigacao."id_modelo" '
						  +'LEFT OUTER JOIN "VGT.DOMINIO_OBRIGACAO_STATUS" tblDominioObrigacaoStatus '
						  +'ON tblRespostaObrigacao."fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status" = tblDominioObrigacaoStatus."id_dominio_obrigacao_status" '
						  +'LEFT OUTER JOIN "VGT.DOMINIO_PERIODICIDADE_OBRIGACAO" tblPeriodicidade '
						  +'ON tblModeloObrigacao."fk_id_dominio_periodicidade.id_periodicidade_obrigacao" = tblPeriodicidade."id_periodicidade_obrigacao" '
						  +'LEFT OUTER JOIN "VGT.EMPRESA" tblEmpresa '
						  +'ON tblRelModeloEmpresa."fk_id_empresa.id_empresa" = tblEmpresa."id_empresa" '
						  +'INNER JOIN "VGT.DOCUMENTO_OBRIGACAO" tblDocumentoObrigacao '
						  +'ON tblRespostaObrigacao."id_resposta_obrigacao" = tblDocumentoObrigacao."fk_id_resposta_obrigacao.id_resposta_obrigacao" ';
		var oWhere = [];
		var aParams = [];
		
		if (req.query.anoCalendario) {
			oWhere.push(' tblRespostaObrigacao."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" = ? ');
			aParams.push(req.query.anoCalendario);
		}
		
		if (req.query.IndAtivoRel) {
			oWhere.push(' (tblRelModeloEmpresa."ind_ativo" = ? OR tblRespostaObrigacao."fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status" != 4)');
			aParams.push(req.query.IndAtivoRel);
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
	}
};