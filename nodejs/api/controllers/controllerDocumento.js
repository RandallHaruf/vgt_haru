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
	}
};