"use strict";

var db = require("../db");

function closeConnection (oConnection) {
	try {
		if (oConnection) {
			oConnection.close();
		}
	}
	catch (e) {
		console.log(e);
	}
}

module.exports = {

	listarArquivos: function (req, res) {
		var conn = db.getConnection();
		
		conn.exec(
			'select "id_arquivo", "mimetype", "tamanho", "data_upload", "nome_arquivo" from "VGT.ARQUIVO"',
			function (err, result) {
				if (err) {
					console.log(err);
					res.send(JSON.stringify(err));
				}
				else {
					res.send(JSON.stringify({
						success: true,
						result: result
					}));
				}
				
				closeConnection(conn);
			}
		);
	},
	
	downloadArquivo: function (req, res) {
		if (req.query.arquivo) {
			var conn = db.getConnection();
			
			conn.exec(
				'select * from "VGT.ARQUIVO" where "id_arquivo" = ?',
				[req.query.arquivo],
				function (err, result) {
					if (err) {
						console.log(err);
						res.send(JSON.stringify(err));
					}
					else {
						res.send(JSON.stringify({
							success: true,
							result: result
						}));
					}
					
					closeConnection(conn);
				});
		}
		else {
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
			
			var conn = db.getConnection(),
				sQuery = 'insert into "VGT.ARQUIVO"("id_arquivo", "arquivo", "mimetype", "tamanho", "data_upload", "nome_arquivo") '
				+ 'values("identity_VGT.ARQUIVO_id_arquivo".nextval, ?, ?, ?, CURRENT_DATE, ?)',
				aParam = [req.file.buffer, req.file.mimetype, req.file.size, req.file.originalname];
				
			conn.exec(sQuery, aParam, function (err, result) {
				if (err) {
					console.log(err);
					res.send(JSON.stringify(err));
				}
				else {
					res.send(JSON.stringify({
						success: true,
						result: result
					}));
				}
				
				closeConnection(conn);
			});
		}
		else {
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
				sQuery = 'delete from "VGT.ARQUIVO" where "id_arquivo" = ?',
				aParam = [req.params.idRegistro];
				
			conn.exec(sQuery, aParam, function (err, result) {
				if (err) {
					console.log(err);
					res.send(JSON.stringify(err));
				}
				else {
					res.send(JSON.stringify({
						success: true,
						result: result
					}));
				}
				
				closeConnection(conn);
			});
		}
		else {
			res.send(JSON.stringify({
				success: false,
				error: {
					message: "ID do Arquivo não especificado"
				}
			}));
		}
	}
};