"use strict";

var hana = require("@sap/hana-client");
var cfenv = require("cfenv");

function log (oConnection, sStatement, aParameter, idUsuario) {
	try {
		if (sStatement.toUpperCase().indexOf("DELETE") > -1
			|| sStatement.toUpperCase().indexOf("INSERT") > -1
			|| sStatement.toUpperCase().indexOf("UPDATE") > -1
			|| sStatement.toUpperCase().indexOf("UPSERT") > -1) {
			var jsonInteracao = JSON.stringify({
				statement: sStatement,
				parameters: aParameter
			});
			
			var sQuery = 
				'insert into "VGT.LOG"("id_log", "id_usuario", "datahora_operacao", "json_interacao_banco") '
				+ 'values ("identity_VGT.LOG_id_log".nextval, ?, CURRENT_TIMESTAMP, ?)',
				aParam = [(idUsuario ? idUsuario.session.usuario.id : 0), jsonInteracao];
			
			oConnection.exec(sQuery, aParam);
		}
	}
	catch (e) {
		console.log("Erro ao logar operação");
		console.log(e);
	}
}

function generateInsertObject (sTabela, aParams) {
	var sGeneratedIdStm = "";
	var sStatement = 'insert into "' + sTabela + '"(';
	var sValues = " values(";
	var aValues = [];
	
	for (var i = 0; i < aParams.length; i++) {
		var oParam = aParams[i];
		
		sStatement += (sStatement.endsWith("(") ? "" : ",") + "\"" + oParam.coluna.nome + "\"";
		
		if (oParam.coluna.identity) {
			/*sGeneratedIdStm = 'select top 1 "' + oParam.coluna.nome + '" "generated_id" ' 
							+ 'from "' + sTabela + '" order by "' + oParam.coluna.nome + '" desc';*/
			sGeneratedIdStm = 'select MAX("' + oParam.coluna.nome + '") "generated_id" from "' + sTabela + '"';
			
			var sNomeSequence = "\"identity_" + sTabela + "_" + oParam.coluna.nome + "\"";
			
			sValues += (sValues.endsWith("(") ? sNomeSequence + ".nextval" : "," + sNomeSequence + ".nextval");
		}
		else {
			sValues += (sValues.endsWith("(") ? "?" : ",?");
			aValues.push(oParam.valor);
		}
	}
	
	sStatement += ") ";
	sValues += ") ";
	sStatement += sValues;
	
	return {
		generatedIdStm: sGeneratedIdStm,
		statement: sStatement,
		values: aValues
	};
}

module.exports = {
	connect: function () {
		var that = this;
		
		if (!this.Connection) {
			var dbHost = cfenv.getAppEnv().services.hanatrial[0].credentials.host;
			var dbPort = cfenv.getAppEnv().services.hanatrial[0].credentials.port;
			var dbUser = cfenv.getAppEnv().services.hanatrial[0].credentials.user;
			var dbPassword = cfenv.getAppEnv().services.hanatrial[0].credentials.password;
			var dbSchema = cfenv.getAppEnv().services.hanatrial[0].credentials.schema;
			
			/*
			var dbHost = "10.253.93.93";
			var dbPort = "30041";
			var dbUser = "SBSS_86302936179869899610709742088160654877333931947378923433898904987";
			var dbPassword = "Pf39ZyQ4SxmUeWTvY6JUQ5QU68GXHeScmWOt87qZlbhgyvTjQq4tVVEAwLydSbj4FAEWFhspMPklJTBUhnlhB_-DyRTf2sx.NpZcfCwlbsL0xS2HIIB_hAAfkY7G1lGu";
			var dbSchema = "HANASCHEMA_1";
			*/
			
			var sConnString = "serverNode=" + dbHost + ":" + dbPort + ";uid=" + dbUser + ";pwd=" + dbPassword + ";currentschema=" +dbSchema;
			
			var client = hana.createConnection();
			client.connect(sConnString, function (err) {
				if (err) {
					console.log(err);
				}
				else {
					that.Connection = client;
				}
			});
		}
	},
	
	getConnection: function () {
		var oConnection = null;
		
		try {
			if (cfenv.getAppEnv().services.hanatrial) {
				var dbHost = cfenv.getAppEnv().services.hanatrial[0].credentials.host,
					dbPort = cfenv.getAppEnv().services.hanatrial[0].credentials.port,
					dbUser = cfenv.getAppEnv().services.hanatrial[0].credentials.user,
					dbPassword = cfenv.getAppEnv().services.hanatrial[0].credentials.password,
					dbSchema = cfenv.getAppEnv().services.hanatrial[0].credentials.schema;
				
				var client = hana.createConnection(),
					sConnString = "serverNode=" + dbHost + ":" + dbPort + ";uid=" + dbUser + ";pwd=" + dbPassword + ";currentschema=" +dbSchema;
				
				client.connect(sConnString);
				
				oConnection = client;
			}
			else if (cfenv.getAppEnv().services.hana) {
				var dbHost = cfenv.getAppEnv().services.hana[0].credentials.host,
					dbPort = cfenv.getAppEnv().services.hana[0].credentials.port,
					dbUser = cfenv.getAppEnv().services.hana[0].credentials.user,
					dbPassword = cfenv.getAppEnv().services.hana[0].credentials.password,
					dbSchema = cfenv.getAppEnv().services.hana[0].credentials.schema,
					dbCertificate = cfenv.getAppEnv().services.hana[0].credentials.certificate;
				
				var client = hana.createConnection(),
					sConnString = "serverNode=" + dbHost + ":" + dbPort + ";encrypt=true;uid=" + dbUser + ";pwd=" + dbPassword + ";sslValidateCertificate=false;currentschema=" +dbSchema;
					//console.log("sConnString = "+ sConnString);
				
				client.connect(sConnString);
				
				oConnection = client;
			}
			else {
				throw new Error("Não existe variável de ambiente com credenciais do hanadb");
			}
		}
		catch (e) {
			console.log(e);
		}
		
		return oConnection;
	},
	
	closeConnection: function (oConnection) {
		try {
			if (oConnection) {
				oConnection.close();
			}
		}
		catch (e) {
			console.log(e);
		}
	},
	
	/*
	 * Funções para executar comandos SQL com conexão própria
	 */
	executeStatement: function (oStatement, callback, oSettings) {
		var that = this,
			oConnection;
		
		if (oSettings && oSettings.connection) {
			oConnection = oSettings.connection;
		}
		else {
			oConnection = this.getConnection();
		}
		
		if (oConnection) {
			console.log("\nSTATEMENT: " + oStatement.statement);
			if (oStatement.parameters) {
				console.log("- PARAMETERS: " + JSON.stringify(oStatement.parameters) + "\n");
			}
			
			oConnection.exec(oStatement.statement, oStatement.parameters, function (err, result) {
				if (!err) {
					log(oConnection, oStatement.statement, oStatement.parameters, oSettings ? oSettings.idUsuario : 0);	
				}
				if (callback) {
					callback(err, result);
				}
				if (!oSettings || !oSettings.connection) {
					that.closeConnection(oConnection);
				}
			});
		}
		else {
			console.log("\nNo connection to execute statement: " + oStatement.statement + "\n");
			if (oSettings && oSettings.noConnectionCallback) {
				oSettings.noConnectionCallback();
			}
		}
	},
	
	executeStatementSync: function (sStatement, aParams, oSettings) {
		var oConnection;
		
		if (oSettings && oSettings.connection) {
			oConnection = oSettings.connection;
		}
		else {
			oConnection = this.getConnection();
		}
		
		if (oConnection) {
			console.log("\nSTATEMENT: " + sStatement);
			if (aParams && aParams.length > 0) {
				console.log("- PARAMETERS: " + JSON.stringify(aParams) + "\n");
			}
			
			var resultSet = oConnection.exec(sStatement, aParams);
			
			log(oConnection, sStatement, aParams, oSettings ? oSettings.idUsuario : 0);
			
			if (!oSettings || !oSettings.connection) {
				this.closeConnection(oConnection);
			}
			return resultSet;
		}
		else {
			console.log("\nNo connection to execute statement: " + sStatement + "\n");
			if (oSettings && oSettings.noConnectionCallback) {
				oSettings.noConnectionCallback();
			}
		}
	},
	
	/*
	 * Funções para executar comandos SQL com conexão única do servidor - antigo
	 */
	/*executeStatement: function (oStatement, callback, noConnectionCallback) {
		console.log("\nSTATEMENT: " + oStatement.statement);
		if (oStatement.parameters) {
			console.log("PARAMETERS: " + JSON.stringify(oStatement.parameters) + "\n");
		}
		
		if (this.Connection) {
			this.Connection.exec(oStatement.statement, oStatement.parameters, callback);
		}
		else {
			console.log("\nNo connection to execute statement: " + oStatement.statement + "\n");
			if (noConnectionCallback) {
				noConnectionCallback();
			}
		}
	},
	
	executeStatementSync: function (sStatement, aParams, noConnectionCallback) {
		if (this.Connection) {
			console.log("\nSTATEMENT: " + sStatement);
			if (aParams && aParams.length > 0) {
				console.log("PARAMETERS: " + JSON.stringify(aParams) + "\n");
			}
			return this.Connection.exec(sStatement, aParams);
		}
		else {
			console.log("\nNo connection to execute statement: " + sStatement + "\n");
			if (noConnectionCallback) {
				noConnectionCallback();
			}
		}
	},*/
	
	model: function (sTabela, oSketch) {
		var that = this;
		
		return {
			colunas: oSketch.colunas,
			
			/*execute: function (oStatement, callback, noConnectionCallback) {
				that.executeStatement(oStatement, callback, noConnectionCallback);
			},
			
			executeSync: function (sStatement, aParams, noConnectionCallback) {
				that.executeStatementSync(sStatement, aParams, noConnectionCallback);	
			},*/
			
			execute: function (oStatement, callback, oSettings) {
				that.executeStatement(oStatement, callback, oSettings);
			},
			
			executeSync: function (sStatement, aParams, oSettings) {
				return that.executeStatementSync(sStatement, aParams, oSettings);	
			},
			
			/*setAutoCommit: function (sFlag) {
				that.Connection.setAutoCommit(sFlag);
			},
			
			commit: function () {
				that.Connection.commit();
			},
			
			rollback: function () {
				that.Connection.rollback();	
			},*/
			
			listar: function (aParams, callback) {
				return new Promise((resolve, reject) => {
					var sStatement = 'select * from "' + sTabela + '" ';
					var aParam = [];
					var sOrderBy = "";
					
					if (aParams.length !== 0) {
						sStatement += " where ";
						for (var i = 0; i < aParams.length; i++) {
							var oParam = aParams[i];
							
							if (oParam.isnull) {
								sStatement += "\"" + oParam.coluna.nome + "\" is null" + (i == aParams.length-1 ? "" : " and ");
							}
							else {
								sStatement += "\"" + oParam.coluna.nome + "\" = ? " + (i == aParams.length-1 ? "" : " and ");
								aParam.push(oParam.valor);
							}
							
							if (oParam.coluna.identity && sOrderBy !== "") {
								sOrderBy = ' order by "' +  oParam.coluna.nome + '"';
							}
						}
					}
					
					that.executeStatement({
						statement: sStatement,
						parameters: aParam
					}, function (err, result) {
						if (callback) {
							callback(err, result);
						}
						else {
							if (err) {
								reject(err);
							}
							else {
								resolve(result);
							}
						}
					});
				});
			},
			
			atualizar: function (oCondition, aParams, callback) {
				var sStatement = 'update "' + sTabela + '" set ';
				var aValues = [];
				var idLog;
				
				if (aParams.length !== 0) {
					for (var i = 0; i < aParams.length; i++) {
						var oParam = aParams[i];
						
						if (oParam.isIdLog) {
							idLog = oParam.valor;
						}
						else {
							sStatement += (sStatement.endsWith(" ") ? ' "' + oParam.coluna.nome + '" = ?' : ',"' + oParam.coluna.nome + '" = ?');
							
							aValues.push(oParam.valor);
						}
					}
				}
				
				if (oCondition.length) {
					sStatement += ' where ';
					
					for (var i = 0, length = oCondition.length; i < length; i++) {
						if (i !== 0) {
							sStatement += ' and ';
						}
						
						sStatement += ' "' + oCondition[i].coluna.nome + '" = ? ';
						aValues.push(oCondition[i].valor);	
					}
				}
				else {
					sStatement += ' where "' + oCondition.coluna.nome + '" = ? ';
					aValues.push(oCondition.valor);
				}
				
				that.executeStatement({
					statement: sStatement,
					parameters: aValues
				}, function (err, result) {
					if (callback) {
						callback(err, result);	
					}
				}, {
					idUsuario: idLog
				});
			},
			
			inserir: function (aParams, callback) {
				var sGeneratedIdStm = "";
				var sStatement = 'insert into "' + sTabela + '"(';
				var sValues = " values(";
				var aValues = [];
				var idLog;
				
				for (var i = 0; i < aParams.length; i++) {
					var oParam = aParams[i];
					
					if (oParam.isIdLog) {
						idLog = oParam.valor;
					}
					else {
						sStatement += (sStatement.endsWith("(") ? "" : ",") + "\"" + oParam.coluna.nome + "\"";
						
						if (oParam.coluna.identity) {
							/*sGeneratedIdStm = 'select top 1 "' + oParam.coluna.nome + '" "generated_id" ' 
											+ 'from "' + sTabela + '" order by "' + oParam.coluna.nome + '" desc';*/
							sGeneratedIdStm = 'select MAX("' + oParam.coluna.nome + '") "generated_id" from "' + sTabela + '"';
							
							var sNomeSequence = "\"identity_" + sTabela + "_" + oParam.coluna.nome + "\"";
							
							sValues += (sValues.endsWith("(") ? sNomeSequence + ".nextval" : "," + sNomeSequence + ".nextval");
						}
						else {
							sValues += (sValues.endsWith("(") ? "?" : ",?");
							aValues.push(oParam.valor);
						}
					}
				}
				
				sStatement += ") ";
				sValues += ") ";
				sStatement += sValues;
				
				if (sGeneratedIdStm === "") {
					that.executeStatement({
						statement: sStatement,
						parameters: aValues
					}, function (err, result) {
						if (callback) {
							callback(err, result);
						}
					}, {
						idUsuario: idLog
					});
				}
				else {
					var result1 = that.executeStatementSync(sStatement, aValues, { idUsuario: idLog });
					
					if (JSON.stringify(result1) === "1") {
						that.executeStatement({
							statement: sGeneratedIdStm
						}, function (err, result) {
							if (callback) {
								callback(err, result);
							}
						}, {
							idUsuario: idLog
						});
					}
					else {
						if (callback) {
							callback(result1, "");	
						}
					}
				}
			},
			
			inserirSync: function (aParams, oSettings) {
				var oInsertObject = generateInsertObject(sTabela, aParams),
					sGeneratedIdStm = oInsertObject.generatedIdStm,
					sStatement = oInsertObject.statement,
					aValues = oInsertObject.values;
					
				if (sGeneratedIdStm === "") {
					that.executeStatementSync(sStatement, aValues, oSettings);
				}
				else {
					var result1 = that.executeStatementSync(sStatement, aValues);
					
					if (JSON.stringify(result1) === "1") {
						that.executeStatementSync(sGeneratedIdStm, [], oSettings);
					}
				}
			},
			
			excluir: function (aParams, callback) {
				var sStatement = 'delete from "' + sTabela + '" where ';
				var idLog;
				
				if (aParams.length !== 0) {
					for (var i = 0; i < aParams.length; i++) {
						var oParam = aParams[i];
						
						if (oParam.isIdLog) {
							idLog = oParam.valor;
						}
						else {
							//sStatement += "\"" + oParam.coluna.nome + "\" = " + oParam.valor + (i === aParams.length-1 ? "" : " and ");
							sStatement += (sStatement.endsWith('where ') ? "" : " and ") + ' "' + oParam.coluna.nome + '" = ' + oParam.valor + " ";
						}
					}
				}
				
				that.executeStatement({
					statement: sStatement
				}, function (err, result) {
					if (callback) {
						callback(err, result);
					}
				}, {
					idUsuario: idLog
				});
			}
		};
	}
};