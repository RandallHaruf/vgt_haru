"use strict";

var db = require("../db");
const QueryBuildHelper = require("../QueryBuildHelper");
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

	/*listarArquivos: function (req, res) {
		var conn = db.getConnection();

		var aParam = [],
			sQuery =
			' SELECT "id_arquivo_cambio_ttc", "mimetype", "tamanho", "data_upload", "nome_arquivo" FROM "VGT.DOCUMENTO_OBRIGACAO" ';

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
	},*/

	downloadArquivo: function (req, res) {
		if (req.query.arquivo) {
			var conn = db.getConnection();
			conn.exec(
				'select * from "VGT.DOCUMENTO_TTC" where "id_documento_ttc" = ?', [req.query.arquivo],
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
				});
		} else {
			res.send(JSON.stringify({
				success: false,
				error: {
					message: "ID de arquivo não especificado"
				}
			}));
		}
	},
	
	downloadModeloHistoricoCambio: function (req, res) {
		var folder = "download/";
			
		res.download(folder + "modeloCambioTTC.csv");
	},
	
	downloadExemploHistoricoCambio: function (req, res) {
		var folder = "download/";
			
		res.download(folder + "exemploCambioTTC.csv");
	},

	uploadArquivo: function (req, res, next) {
		// Assumindo que temos req.files (buffer da tabela arquivo_cambio_ttc)
		
		var verificarTodosValores = function (){
			var retorno = false;
			if(req.body["fk_periodo.id_periodo"] && req.body["fk_empresa.id_empresa"] && req.body["fk_categoria.id_categoria"]){
				retorno = true;
			}
			return retorno;
		}
		if (req.file && verificarTodosValores()){
			var oConnection = db.getConnection();
			var periodo = req.body["fk_periodo.id_periodo"];
			var empresa = req.body["fk_empresa.id_empresa"];
			var categoria = req.body["fk_categoria.id_categoria"];
			
			var sQueryArquivo =
					'INSERT INTO "VGT.DOCUMENTO_TTC"(' + '"id_documento_ttc", ' + '"dados_arquivo", ' + '"mimetype", ' + '"tamanho", ' +
					'"data_upload", ' + '"nome_arquivo", ' + '"fk_usuario.id_usuario", ' +
					'"fk_periodo.id_periodo", ' 
					+'"fk_empresa.id_empresa", '
					+'"fk_category.id_tax_category") '
					+ ' values(' +
					'"identity_VGT.DOCUMENTO_TTC_id_documento_ttc".nextval, ' + '?, ' + '?, ' + '?,' + 'CURRENT_DATE, ' + '?, ' + '?, ' + '?, ' + '?, ' + '?) ';
			var aParamArquivo = [
				req.file.buffer,
				req.file.mimetype,
				req.file.size,
				req.file.originalname,
				req.session.usuario.id,
				periodo,
				empresa,
				categoria
			];
			console.log(sQueryArquivo);
			oConnection.exec(sQueryArquivo, aParamArquivo, function (err, result) {
				if (err) {
					console.log(err);
					next(JSON.stringify(err));
				} else {
					res.send(JSON.stringify({
						success: true,
						result: result
					}));
				}
			}); 
		}else {
			res.send(JSON.stringify({
				success: false,
				error: {
					"message": "Nem todos valores necessários foram informados"
				}
			}));
		}
	},

	excluirArquivo: function (req, res) {
		
		if (req.body.idDocumentosParaApagar) {
			let queryHelper = new QueryBuildHelper({
				initialStatement: 'delete from "VGT.DOCUMENTO_TTC"'
			});
			
			queryHelper
				.where('"id_documento_ttc"')
					.in(req.body.idDocumentosParaApagar);
			
			let statement = queryHelper.getStatement();
			let param = queryHelper.getParameters();
			
			var conn = db.getConnection(),
				sQuery = statement,//'delete from "VGT.DOCUMENTO_TTC" where "id_documento_ttc" in (?)',
				aParam = param;//[sIdDocumentosTTC];
				console.log(sQuery);
				console.log(param);
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
					message: "Documentos para apagar não foram informados"
				}
			}));
		}
	},
	listarTodosArquivos: function (req, res, next) {
		var sStatement = 'select '
							+'tblDocumentoTTC."id_documento_ttc", '
							+'tblDocumentoTTC."nome_arquivo", '
							+'tblDocumentoTTC."fk_periodo.id_periodo", '
							+'tblDocumentoTTC."fk_empresa.id_empresa", '
							+'tblDocumentoTTC."fk_category.id_tax_category" ' 
							+'from "VGT.DOCUMENTO_TTC" tblDocumentoTTC ';
		var oWhere = [];
		var aParams = [];

		if (req.query.idPeriodo) {
			oWhere.push(' tblDocumentoTTC."fk_periodo.id_periodo" = ? ');
			aParams.push(req.query.idPeriodo);
		}

		if (req.query.idEmpresa) {
			oWhere.push(' tblDocumentoTTC."fk_empresa.id_empresa" = ? ');
			aParams.push(req.query.idEmpresa);
		}
		
		if (req.query.idTaxCategory) {
			oWhere.push(' tblDocumentoTTC."fk_category.id_tax_category" = ? ');
			aParams.push(req.query.idTaxCategory);
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

		var conn = db.getConnection();
		conn.exec(sStatement, aParams, function (err, result) {
			closeConnection(conn);
			if (err) {
				const error = new Error("Erro ao listar arquivos");
				next(error);
			} else {
				res.status(200).json({
					result: result
				});
			}
		});
	}
};


/*function inserirCambio(aCambios, oConnection, idArquivo) {

	const select = function (oCambio) {
		return new Promise(function (resolve, reject) {
			db.executeStatement({
				statement: 'Select "VGT.DOMINIO_MOEDA"."id_dominio_moeda" from "VGT.DOMINIO_MOEDA" where "VGT.DOMINIO_MOEDA"."acronimo" =  ?',
				parameters: [oCambio["Moeda"]]
			}, function (err, result) {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			}, {
				connection: oConnection
			});
		});
	};

	const inserirDeFato = function (oCambio, idMoeda) {
		var sTblName = '"VGT.CAMBIO_TTC"';
		var sStatement = "insert into ";
		sStatement += sTblName + ' values ( "identity_VGT.CAMBIO_TTC_id_cambio_ttc".nextval", ' + oCambio["Data"] + ', ' + idMoeda + ', ' +
			oCambio["Dolar"] + ', ' + oCambio["Real"] + ', ' + idArquivo + ')';
		return new Promise(function (resolve, reject) {
			db.executeStatement({
				statement: sStatement,
				parameters: [
						oCambio["Data"],
						
					]
			}, function (err, result) {
				if (err || oCambio.darMerda) {
					reject(err);
				}else{
					resolve();
				}
			}, {
				connection: oConnection
			});
		});
	};

	const inserir = function (oCambio) {
		new Promise(function (resolve, reject) {
			select(oCambio)
				.then((res) => {
					// se tem id
					if (res.length) {
						var idMoeda = res[0]["id_dominio_moeda"];
						return inserirDeFato(oCambio, idMoeda);
					} else {
						// se nao tem id
						resolve();
					}
				})
				.then(() => {
					resolve();
				})
				.catch((err) => {
					reject(err);
				});
		});
	};

	const inserir = function (oCambio) {
		var sTblName = '"VGT.CAMBIO_TTC"';
		var sStatement = "insert into ";
		new Promise(function (resolve, reject) {
			db.executeStatement({
				statement: 'Select "VGT.DOMINIO_MOEDA"."id_dominio_moeda" from "VGT.DOMINIO_MOEDA" where "VGT.DOMINIO_MOEDA"."acronimo" =  ' +
					oCambio["Moeda"]
			}, function (err, result) {
				if (result) {
					idMoeda = result[0]["id_dominio_moeda"];
					resolverStatementERetornarPromise();
				} else {
					resolve();
				}
			}, {
				connection: oConnetion
			})
		});

		function resolverStatementERetornarPromise() {
			sStatement += sTblName + ' values ( "identity_VGT.CAMBIO_TTC_id_cambio_ttc".nextval", ' + oCambio["Data"] + ', ' + idMoeda + ', ' +
				oCambio["Dolar"] + ', ' + oCambio[Real] + ', ' + idArquivo + ')';
			return new Promise(function (resolve, reject) {
				db.executeStatement({
					statement: sStatement
				}, function (err, result) {

				}, {
					connection: oConnection
				});
			});
		}
	};

	var aPromise = [];

	if (aCambios) {
		for (let i = 0, length = aCambios.length; i < length; i++) {
			aPromise.push(inserir(aCambios[i]).catch(err => { return err }));
		}
	}

	return Promise.all(aPromise);
}*/
function inserirCambio(oCambio, oConnection, idArquivo, req){
	var idMoeda = pegarIdMoeda(oCambio["Moeda"], oConnection);
	var sTblName = '"VGT.CAMBIO_TTC"';
	var sStatement = "insert into ";
	sStatement += sTblName + ' values ( "identity_VGT.CAMBIO_TTC_id_cambio_ttc".nextval, ?, ?, ?, ?, ?)';
	db.executeStatementSync(
		sStatement,
		[
				oCambio["Data"],
				idMoeda,
				oCambio["Dolar"],
				oCambio["Real"],
				idArquivo
		],
		{
			connection: oConnection
		});
}

function pegarIdMoeda(Acronimo, oConnection, req){
	var result = db.executeStatementSync(
		'Select "VGT.DOMINIO_MOEDA"."id_dominio_moeda" from "VGT.DOMINIO_MOEDA" where "VGT.DOMINIO_MOEDA"."acronimo" =  ?',
		[Acronimo], {
			connection: oConnection
		});
	
	if (result && result.length) {
		return result[0]["id_dominio_moeda"];
	}
}

function deletarCambios(idArquivoVelho, oConnection, req){
	db.executeStatementSync(
		'delete from "VGT.CAMBIO_TTC" where "VGT.CAMBIO_TTC"."fk_arquivo_cambio_ttc.id_arquivo_cambio_ttc" = ?',
		[idArquivoVelho ? idArquivoVelho : 0], {
			connection: oConnection
		});
}