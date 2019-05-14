/*"use strict";

var model = require("../models/modelDeclaracao");

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
			coluna: model.colunas.nomeArquivo,
			valor: req.body.nomeArquivo ? req.body.nomeArquivo : null
		}, {
			coluna: model.colunas.dadosArquivo,
			valor: req.body.dadosArquivo ? req.body.dadosArquivo : null
		}, {
			coluna: model.colunas.mimetype,
			valor: req.body.mimetype ? req.body.mimetype : null
		}, {
			coluna: model.colunas.tamanho,
			valor: req.body.tamanho ? req.body.tamanho : null
		}, {
			coluna: model.colunas.dataUpload,
			valor: req.body.dataUpload ? req.body.dataUpload : null
		}, {
			coluna: model.colunas.dataEnvioDeclaracao,
			valor: req.body.dataEnvioDeclaracao ? req.body.dataEnvioDeclaracao : null
		}, {
			coluna: model.colunas.indDeclaracao,
			valor: req.body.indDeclaracao ? req.body.indDeclaracao : null
		}, {
			coluna: model.colunas.fkRelTaxPackagePeriodo,
			valor: req.body.fkRelTaxPackagePeriodo ? req.body.fkRelTaxPackagePeriodo : null
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
			coluna: model.colunas.nomeArquivo,
			valor: req.body.nomeArquivo ? req.body.nomeArquivo : null
		}, {
			coluna: model.colunas.dadosArquivo,
			valor: req.body.dadosArquivo ? req.body.dadosArquivo : null
		}, {
			coluna: model.colunas.mimetype,
			valor: req.body.mimetype ? req.body.mimetype : null
		}, {
			coluna: model.colunas.tamanho,
			valor: req.body.tamanho ? req.body.tamanho : null
		}, {
			coluna: model.colunas.dataUpload,
			valor: req.body.dataUpload ? req.body.dataUpload : null
		}, {
			coluna: model.colunas.dataEnvioDeclaracao,
			valor: req.body.dataEnvioDeclaracao ? req.body.dataEnvioDeclaracao : null
		}, {
			coluna: model.colunas.indDeclaracao,
			valor: req.body.indDeclaracao ? req.body.indDeclaracao : null
		}, {
			coluna: model.colunas.fkRelTaxPackagePeriodo,
			valor: req.body.fkRelTaxPackagePeriodo ? req.body.fkRelTaxPackagePeriodo : null
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
		res.send("TODO: DeepQuery da Entidade Declaracao");
	}
};*/

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
		
		var aParam = [],
			sQuery = 'select "id_declaracao", "nome_arquivo", "mimetype", "tamanho", "data_upload", "data_envio_declaracao", "ind_declaracao", "fk_rel_tax_package_periodo.id_rel_tax_package_periodo" from "VGT.DECLARACAO" ';
		
		if (req.query.idRelTaxPackagePeriodo) {
			aParam.push(req.query.idRelTaxPackagePeriodo);
			
			sQuery += 'where "fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ? ';
		}
		
		sQuery += 'order by "ind_declaracao", "data_upload" ';
		
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
	},
	
	downloadArquivo: function (req, res) {
		if (req.query.arquivo) {
			var conn = db.getConnection();
			
			console.log(req.query.arquivo);
			
			conn.exec(
				'select * from "VGT.DECLARACAO" where "id_declaracao" = ?',
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
			
			var dataEnvioDeclaracao = req.body.dataEnvioDeclaracao ? req.body.dataEnvioDeclaracao : null;
			
			var conn = db.getConnection(),
				sQuery = 'insert into "VGT.DECLARACAO"("id_declaracao", "dados_arquivo", "nome_arquivo", "mimetype", "tamanho", "data_upload", "data_envio_declaracao", "ind_declaracao", "fk_rel_tax_package_periodo.id_rel_tax_package_periodo") '
				+ 'values("identity_VGT.DECLARACAO_id_declaracao".nextval, ?, ?, ?, ?, CURRENT_DATE, ?, ?, ?)',
				aParam = [req.file.buffer, req.file.originalname, req.file.mimetype, req.file.size, dataEnvioDeclaracao, req.body.indDeclaracao, req.body.fkRelTaxPackagePeriodo];
				
			console.log(sQuery);
			console.log(JSON.stringify(aParam));
				
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
				sQuery = 'delete from "VGT.DECLARACAO" where "id_declaracao" = ?',
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