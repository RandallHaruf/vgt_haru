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
				'select * from "VGT.ARQUIVO_CAMBIO_TTC" where "id_arquivo_cambio_ttc" = ?', [req.query.arquivo],
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
	
	downloadModeloHistoricoCambio: function (req, res) {
		var folder = "download/";
			
		res.download(folder + "modeloCambioTTC.csv");
	},
	
	downloadExemploHistoricoCambio: function (req, res) {
		var folder = "download/";
			
		res.download(folder + "exemploCambioTTC.csv");
	},

	uploadArquivo: function (req, res, next) {
		// Assumindo que temos req.files (buffer da tabela arquivo_cambio_ttc) req.body.jsonCambio (objeto pra colocar na tabela de cambio_ttc)
		if (req.file && req.body.aCambio){
			var idArquivoVelho = "";
			var idArquivoNovo = "";
			var oConnection = db.getConnection();
			var aCambios = JSON.parse(req.body.aCambio);
			
			db.executeStatement({
				statement: 'select "VGT.ARQUIVO_CAMBIO_TTC"."id_arquivo_cambio_ttc" from "VGT.ARQUIVO_CAMBIO_TTC" where "VGT.ARQUIVO_CAMBIO_TTC"."fk_id_dominio_mes.id_dominio_mes" = ? and "VGT.ARQUIVO_CAMBIO_TTC"."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" = ?',
				parameters: [
						req.body.idMes,
						req.body.idAnoCalendario
					]
			}, function (err, result) {
				if (err) {
					next(JSON.stringify(err));
				}else {
					if(result.length){
						idArquivoVelho = result[0]["id_arquivo_cambio_ttc"];	
					}
					db.executeStatement({
						statement: 'delete from "VGT.ARQUIVO_CAMBIO_TTC" where "VGT.ARQUIVO_CAMBIO_TTC"."fk_id_dominio_mes.id_dominio_mes" = ? and "VGT.ARQUIVO_CAMBIO_TTC"."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" = ?',
						parameters: [
								req.body.idMes,
								req.body.idAnoCalendario
							]
					}, function (err, result) {
						if (err) {
							next(err);
						}else {//INSERT
							var sQueryArquivo =
									'INSERT INTO "VGT.ARQUIVO_CAMBIO_TTC"(' + '"id_arquivo_cambio_ttc", ' + '"arquivo", ' + '"mimetype", ' + '"tamanho", ' +
									'"data_upload", ' + '"nome_arquivo", ' + '"fk_id_dominio_mes.id_dominio_mes", ' +
									'"fk_id_dominio_ano_calendario.id_dominio_ano_calendario") ' + ' values(' +
									'"identity_VGT.ARQUIVO_CAMBIO_TTC_id_arquivo_cambio_ttc".nextval, ' + '?, ' + '?, ' + '?,' + 'CURRENT_DATE, ' + '?, ' + '?, ' + '?) ';
							var aParamArquivo = [
								req.file.buffer,
								req.file.mimetype,
								req.file.size,
								req.file.originalname,
								req.body.idMes,
								req.body.idAnoCalendario
							];
							oConnection.exec(sQueryArquivo, aParamArquivo, function (err, result) {
								if (err) {
									console.log(err);
									next(JSON.stringify(err));
								} else {
									db.executeStatement({
										statement: 'select "VGT.ARQUIVO_CAMBIO_TTC"."id_arquivo_cambio_ttc" from "VGT.ARQUIVO_CAMBIO_TTC" where "VGT.ARQUIVO_CAMBIO_TTC"."fk_id_dominio_mes.id_dominio_mes" = ? and "VGT.ARQUIVO_CAMBIO_TTC"."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" = ?',
										parameters: [
												req.body.idMes,
												req.body.idAnoCalendario
											]
									}, function (err, result) {
										if (err) {
											next(JSON.stringify(err));
										}else {
											if(result.length){
												idArquivoNovo = result[0]["id_arquivo_cambio_ttc"];	
											}
											try {
												oConnection.setAutoCommit(false);
												deletarCambios(idArquivoVelho, oConnection);
												for(let i =0; i < aCambios.length; i++){
													inserirCambio(aCambios[i], oConnection, idArquivoNovo)
												}
												oConnection.commit();
												res.send(JSON.stringify({
													success: true,
													result:result
												}))
											} catch (e) {
												console.log(e);
												res.success = false;
												res.error = e;
												if (oConnection) {
													oConnection.rollback();
												}
												next(JSON.stringify(e));
											} finally {
												if (oConnection) {
													oConnection.setAutoCommit(true);
													oConnection.close();
												}
											}
										}
									});
								}
							}); 
						}
					});
				}
			});
		}
		

		/*oConnection.exec();
		
		db.executeStatement({
			statement: 'select * from "DUMMY"'
		}, function (err, result) {
			
		}, {
			connection: oConnection
		});*/
		var aCambios = [
			{
				Moeda: "AFN",
				Dolar: 1.68,
				Real: 1.8,
				Data: "2018-02-10"
			},
			{
				Moeda: "AFN",
				Dolar: 1.68,
				Real: 1.8,
				Data: "2018-02-10"
			},
			{
				Moeda: "AFN",
				Dolar: 1.68,
				Real: 1.8,
				Data: "2018-02-10",
				DarMerda: true
			},
			{
				Moeda: "AFN",
				Dolar: 1.68,
				Real: 1.8,
				Data: "2018-02-10"
			},
			{
				Moeda: "AFN",
				Dolar: 1.68,
				Real: 1.8,
				Data: "2018-02-10"
			}
		];
		
		/*inserirCambio(aCambios, oConnection, 1)
			.then((res) =>{
				if (res.length > 0) {
					console.log(res);

					if (oConnection) {
						oConnection.rollback();
					}
	
					const error = new Error("Erro ao realizar upload do arquivo.");
					next(error);
				}
				else {
					oConnection.commit();
	
					if (oConnection) {
						oConnection.setAutoCommit(true); // trauma do java
						oConnection.close();
					}
					res.send(true);
				}
			})
			.catch((err) => {
				console.log(err);

				if (oConnection) {
					oConnection.rollback();
				}

				const error = new Error("Erro ao realizar upload do arquivo: " + err.message);
				next(error);
			})*/
			
		/*selectIdArquivo()
			.then((res) => {
				return updateArquivo()
			})
			.then(() => {
				return removerCambio();
			})
			.then(() => {
				return inserirCambio();
			})
			.then(() => {
				oConnection.commit();

				if (oConnection) {
					oConnection.setAutoCommit(true); // trauma do java
					oConnection.close();
				}

				res.send(); // sucesso
			})
			.catch(() => {
				console.log(e);

				if (oConnection) {
					oConnection.rollback();
				}

				const error = new Error("Erro ao realizar upload do arquivo: " + e.message);
				next(error);
			});*/

		/*if (req.file) {
			//console.log("arquivo", req.file);
			//console.log(req.file.buffer.constructor.name);

			var idRespostaObrigacao = req.body.id ? req.body.id : null;
			var Confirmado = req.body.indConclusao ? req.body.indConclusao : null;

			var sQuery =
				'INSERT INTO "VGT.ARQUIVO_CAMBIO_TTC"(' + '"id_arquivo_cambio_ttc", ' + '"arquivo", ' + '"mimetype", ' + '"tamanho", ' +
				'"data_upload", ' + '"nome_arquivo", ' + '"fk_id_dominio_mes.id_dominio_mes", ' +
				'"fk_id_dominio_ano_calendario.id_dominio_ano_calendario") ' + ' values(' +
				'"identity_VGT.ARQUIVO_CAMBIO_TTC_id_arquivo_cambio_ttc".nextval, ' + '?, ' + '?, ' + '?,' + 'CURRENT_DATE, ' + '?, ' + '?, ' + '?) ';

			var aParam = [
				req.file.buffer,
				req.file.mimetype,
				req.file.size,
				req.file.originalname,
				req.body.idMes,
				req.body.idAnoCalendario
			];

			var conn = db.getConnection();


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
		}*/
	},

	excluirArquivo: function (req, res) {
		if (req.params.idRegistro) {
			//console.log("arquivo", req.file);
			//console.log(req.file.buffer.constructor.name);

			var conn = db.getConnection(),
				sQuery = 'delete from "VGT.ARQUIVO_CAMBIO_TTC" where "id_arquivo_cambio_ttc" = ?',
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
	listarTodosArquivos: function (req, res, next) {
		var sStatement = 'select tblArquivoCambio.*, tblDominioMes.*,tblDominioAnoCalendario.* from ' +
			'"VGT.ARQUIVO_CAMBIO_TTC" tblArquivoCambio ' + 'inner join "VGT.DOMINIO_MES" as tblDominioMes ' +
			'on tblArquivoCambio."fk_id_dominio_mes.id_dominio_mes" = tblDominioMes."id_dominio_mes" ' +
			'inner join "VGT.DOMINIO_ANO_CALENDARIO" as tblDominioAnoCalendario ' +
			'on tblArquivoCambio."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" = tblDominioAnoCalendario."id_dominio_ano_calendario" ';

		var oWhere = [];
		var aParams = [];

		if (req.query.idMes) {
			oWhere.push(' tblArquivoCambio."fk_id_dominio_mes.id_dominio_mes" = ? ');
			aParams.push(req.query.idMes);
		}

		if (req.query.idAnoCalendario) {
			oWhere.push(' tblArquivoCambio."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" = ? ');
			aParams.push(req.query.idAnoCalendario);
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
function inserirCambio(oCambio, oConnection, idArquivo){
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
		}
	);
}

function pegarIdMoeda(Acronimo, oConnection){
	var result = db.executeStatementSync(
		'Select "VGT.DOMINIO_MOEDA"."id_dominio_moeda" from "VGT.DOMINIO_MOEDA" where "VGT.DOMINIO_MOEDA"."acronimo" =  ?',
		[Acronimo], {
			connection: oConnection
		}
	);
	
	if (result && result.length) {
		return result[0]["id_dominio_moeda"];
	}
}

function deletarCambios(idArquivoVelho, oConnection){
	db.executeStatementSync(
		'delete from "VGT.CAMBIO_TTC" where "VGT.CAMBIO_TTC"."fk_arquivo_cambio_ttc.id_arquivo_cambio_ttc" = ?',
		[idArquivoVelho ? idArquivoVelho : 0], {
				connection: oConnection
		}
	);
}