"use strict";

//var db = require("../db");
var model = require("../models/modelUsuario");
//var modelEmpresa = require("../models/modelEmpresa");
var modelRelUsuarioEmpresa = require("../models/modelRelUsuarioEmpresa");
//var modelDominioModulo = require("../models/modelDominioModulo");
var modelRelUsuarioModulo = require("../models/modelRelUsuarioModulo");
var controllerEmailSend = require("./controllerEmailSend");
var auth = require("../auth")();

/*function adicionarRegistrosRelacionados(iIdUsuario, aRegistroRelacionado) {
	const vincular = function (oRegistroRelacionado) {
		let isDominioModulo = oRegistroRelacionado.id_dominio_modulo ? true : false,
			modelRegistro = isDominioModulo ? modelDominioModulo : modelEmpresa,
			modelRelacionamento = isDominioModulo ? modelRelUsuarioModulo : modelRelUsuarioEmpresa,
			fkRelacionada = isDominioModulo ? "fkDominioModulo" : "fkEmpresa";

		return new Promise(function (resolve, reject) {
			modelRelacionamento.listar([{
				coluna: model.colunas.id,
				valor: oRegistroRelacionado[modelRegistro.colunas.id.nome]
			}], function (err, result) {
				if (err) {
					reject(err);
				} else {
					if (result && !result.length) {
						modelRelacionamento.inserir([{
							coluna: modelRelacionamento.colunas.fkUsuario,
							valor: iIdUsuario
						}, {
							coluna: modelRelacionamento.colunas[fkRelacionada],
							valor: oRegistroRelacionado[modelRegistro.colunas.id.nome]
						}], function (err2, result2) {
							if (err2) {
								reject(err2);
							} else {
								resolve(result2);
							}
						});
					}
				}
			});
		});
	};

	const desvincular = function (oRegistroRelacionado) {
		let isDominioModulo = oRegistroRelacionado.id_dominio_modulo ? true : false,
			tabela = isDominioModulo ? "VGT.REL_USUARIO_MODULO" : "VGT.REL_USUARIO_EMPRESA",
			fkRelacionada = isDominioModulo ? "fk_dominio_modulo.id_dominio_modulo" : "fk_empresa.id_empresa";

		return new Promise(function (resolve, reject) {
			var sQuery = 
				'delete from "' + tabela + '" '
				+ 'where '
				+ '"fk_usuario.id_usuario" = ? '
				+ 'and "' + fkRelacionada + '" =  ? ',
				aParam = [iIdUsuario, oRegistroRelacionado[isDominioModulo ? "fkDominioModulo" : "fkEmpresa"]];
			
			db.executeStatement({
				statement: sQuery,
				parameters: aParam
			}, function (err, result) {
				if (err) {
					reject(err);
				}
				else {
					resolve(result);
				}
			});
		});
	};

	return new Promise(function (resolve, reject) {
		var aPromise = [];

		for (var i = 0, length = aRegistroRelacionado.length; i < length; i++) {
			var oRegistroRelacionado = aRegistroRelacionado[i];

			if (oRegistroRelacionado.selecionada == "true") {
				aPromise.push(vincular(oRegistroRelacionado));
			} else {
				aPromise.push(desvincular(oRegistroRelacionado));
			}
		}

		if (iTipoParaDesvincular) {
			aPromise.push(desvincularTipo());
		}

		Promise.all(aPromise)
			.then(function () {
				resolve();
			})
			.catch(function (err) {
				reject(err);
			});
	});
}*/

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

	criarRegistro: function (req, res, next) {
		const continuaCadastro = function (hash) {
			var aParams = [{
				coluna: model.colunas.id
			}, {
				coluna: model.colunas.nome,
				valor: req.body.nome ? req.body.nome : null
			}, {
				coluna: model.colunas.email,
				valor: req.body.email ? req.body.email : null
			}, {
				coluna: model.colunas.contato,
				valor: req.body.contato ? req.body.contato : null
			}, {
				coluna: model.colunas.user,
				valor: req.body.user ? req.body.user : null
			}, {
				coluna: model.colunas.pass,
				valor: hash //req.body.pass ? req.body.pass : null
			}, {
				coluna: model.colunas.indAtivo,
				valor: req.body.indAtivo ? req.body.indAtivo : null
			}, {
				coluna: model.colunas.fkDominioTipoAcesso,
				valor: req.body.fkDominioTipoAcesso ? req.body.fkDominioTipoAcesso : null
			}, {
				coluna: model.colunas.emailGestor,
				valor: req.body.emailGestor ? req.body.emailGestor : null
			}, {
				isIdLog: true,
				valor: req
			}];
		
			model.inserir(aParams, function (err, result) {
				if (err) {
					res.send(JSON.stringify(err));
				} else {
		
					var idUsuario = result[0].generated_id;
		
					Promise.all([
						deleteRelUsuarios('"VGT.REL_USUARIO_MODULO"', idUsuario, req.body.modulos, req),
						inserirRelUsuario('"VGT.REL_USUARIO_MODULO"', idUsuario, req.body.modulos, req),
						deleteRelUsuarios('"VGT.REL_USUARIO_EMPRESA"', idUsuario, req.body.empresas, req),
						inserirRelUsuario('"VGT.REL_USUARIO_EMPRESA"', idUsuario, req.body.empresas, req)
						])
						.then (function (aResponse) {
							controllerEmailSend.comunicarSenha(req.body.email,req.body.nome,novaSenha);
							res.send(JSON.stringify(result));
						})
						.catch(function (err) {
							console.log(err);
							let msg = 'Erro inesperado no método "controllerUsuario/atualizarRegistro": ' + err.message;
							const error = new Error(msg);
							next(error);
						});
		
				}
			});
		};
		
		var novaSenha = gerarNovaSenha();
		
		auth.encrypt(novaSenha)
			.then(function (hash) {
				continuaCadastro(hash);
			})
			.catch(function (err) {
				console.log(err);
				let msg = 'Erro inesperado no método "controllerUsuario/criarRegistro": ' + err.message;
				const error = new Error(msg);
				next(error);
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

	atualizarRegistro: function (req, res, next) {

		var oCondition = {
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		};

		var aParams = [{
			coluna: model.colunas.nome,
			valor: req.body.nome ? req.body.nome : null
		}, {
			coluna: model.colunas.email,
			valor: req.body.email ? req.body.email : null
		}, {
			coluna: model.colunas.contato,
			valor: req.body.contato ? req.body.contato : null
		}, {
			coluna: model.colunas.user,
			valor: req.body.user ? req.body.user : null
		}/*, {
			coluna: model.colunas.pass,
			valor: req.body.pass ? req.body.pass : null
		}*/, {
			coluna: model.colunas.indAtivo,
			valor: req.body.indAtivo ? req.body.indAtivo : null
		}, {
			coluna: model.colunas.fkDominioTipoAcesso,
			valor: req.body.fkDominioTipoAcesso ? req.body.fkDominioTipoAcesso : null
		}, {
			coluna: model.colunas.emailGestor,
			valor: req.body.emailGestor ? req.body.emailGestor : null
		}, {
			isIdLog: true,
			valor: req
		}];

		model.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				var idUsuario = req.params.idRegistro;

				Promise.all([
					deleteRelUsuarios('"VGT.REL_USUARIO_MODULO"', idUsuario, req.body.modulos, req),
					inserirRelUsuario('"VGT.REL_USUARIO_MODULO"', idUsuario, req.body.modulos, req),
					deleteRelUsuarios('"VGT.REL_USUARIO_EMPRESA"', idUsuario, req.body.empresas, req),
					inserirRelUsuario('"VGT.REL_USUARIO_EMPRESA"', idUsuario, req.body.empresas, req)
					])
					.then (function (aResponse) {
						res.send(JSON.stringify(result));
					})
					.catch(function (err) {
						console.log(err);
						let msg = 'Erro inesperado no método "controllerUsuario/atualizarRegistro": ' + err.message;
						const error = new Error(msg);
						next(error);
					});
			}
		});
	},

	excluirRegistro: function (req, res) {
		model.excluir([{
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		}, {
			isIdLog: true,
			valor: req
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	deepQuery: function (req, res) {
		//res.send("TODO: DeepQuery da Entidade Usuario");

		var sStatement = 'select tblUsuario.*,tblDominioAcesso.* from "VGT.USUARIO" tblUsuario ' +
			'left outer join "VGT.DOMINIO_ACESSO_USUARIO" tblDominioAcesso ' +
			'on tblUsuario."fk_dominio_tipo_acesso.id_tipo_acesso" = tblDominioAcesso."id_tipo_acesso"';

		var oWhere = [];
		var aParams = [];

		if (req.query.tipoAcesso) {
			oWhere.push(' tblUsuario."fk_dominio_tipo_acesso.id_tipo_acesso" = ? ');
			aParams.push(req.query.tipoAcesso);
		}
		if (req.query.idObjeto) {
			oWhere.push(' tblUsuario."id_usuario" = ? ');
			aParams.push(req.query.idObjeto);
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
				res.send(JSON.stringify(result));
			}
		}, {
			idUsuario: req
		});
	},
	
	resetarSenha: function(req,res, next) {
		var idUsuario = req.params.idRegistro,
			novaSenha = gerarNovaSenha(),
			hash,
			email,
			nome;
		
		auth.encrypt(novaSenha)
			.then((response) => {
				console.log(novaSenha);
				hash = response;
				return pegarEmail(idUsuario);
			})
			.then((retorno) => {
				console.log(222222);
				email = retorno[0].email;
				nome = retorno[0].nome;
				return atualizarSenha(idUsuario, hash);
			})
			.then(() => {
				console.log(33333);
				return controllerEmailSend.comunicarSenha(email,nome,novaSenha);
			})
			.then(() => {
				res.send();
			})
			.catch((err) => {
				console.log(err);
				let msg = 'Erro inesperado no método "controllerUsuario/resetarSenha": ' + err.message;
				const error = new Error(msg);
				next(error);
			});
		
		/*return new Promise(function (resolve, reject) {
			model.execute({
				statement: sStatement
			}, function (err, result) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});*/
	}
	
};

function pegarEmail(idUsuario) {
	var sStatement = 'SELECT "VGT.USUARIO"."nome","VGT.USUARIO"."email" FROM "VGT.USUARIO" WHERE "VGT.USUARIO"."id_usuario" = ' + idUsuario;
	return new Promise(function (resolve, reject) {
		model.execute({
			statement: sStatement
		}, function (err, result) {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
}

function atualizarSenha(idUsuario,sHash, req) {
	var sStatement = 'UPDATE "VGT.USUARIO" SET "VGT.USUARIO"."pass" = \'' + sHash + '\' WHERE "VGT.USUARIO"."id_usuario" = ' + idUsuario;
	return new Promise(function (resolve, reject) {
		model.execute({
			statement: sStatement
		}, function (err, result) {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		}, {
			idUsuario: req
		});
	});
}

function deleteRelUsuarios(sTblName, iIdUsuario, aIdRels, req) {
	var sStatement = "delete from " + sTblName + " ";
	var sIdRels = "";
	if (sTblName == '"VGT.REL_USUARIO_MODULO"') {
		if(aIdRels){
			for (var i = 0; i < aIdRels.length; i++) {
				sIdRels += (sIdRels != "" ? ",'" : "'") + aIdRels[i]["id_dominio_modulo"] + "'";
			}	
			sStatement += " where " + sTblName + ".\"fk_dominio_modulo.id_dominio_modulo\" NOT IN (" + sIdRels + ") ";
		}
	} else {
		if(aIdRels){
			for (var i = 0; i < aIdRels.length; i++) {
				sIdRels += (sIdRels != "" ? ",'" : "'") + aIdRels[i]["id_empresa"] + "'";
			}
			sStatement += " where " + sTblName + ".\"fk_empresa.id_empresa\" NOT IN (" + sIdRels + ") ";
		}
	}
	
	if(aIdRels){
		sStatement += "and " + sTblName + ".\"fk_usuario.id_usuario\" = " + iIdUsuario;
	}
	else{
		sStatement += "where " + sTblName + ".\"fk_usuario.id_usuario\" = " + iIdUsuario;
	}
	

	return new Promise(function (resolve, reject) {
		model.execute({
			statement: sStatement
		}, function (err, result) {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		}, {
			idUsuario: req
		});
	});
}

function inserirRelUsuario(sTblName, iIdUsuario, aIdRels, req) {
	
	const inserir = function (idRel) {
		var sStatement = "upsert ";
		if (sTblName == '"VGT.REL_USUARIO_MODULO"') {
			sStatement += sTblName + " values (" + iIdUsuario + ", " + idRel + ") where " + sTblName + ".\"fk_dominio_modulo.id_dominio_modulo\" = " + idRel + " ";
		} else {
			sStatement += sTblName + " values (" + iIdUsuario + ", " + idRel + ") where " + sTblName + ".\"fk_empresa.id_empresa\" = " + idRel + " ";
		}
		
		sStatement += "and " + sTblName + ".\"fk_usuario.id_usuario\" = " + iIdUsuario;	
		
		
		return new Promise(function (resolve, reject) {
			model.execute({
				statement: sStatement
			}, function (err, result) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			}, {
				idUsuario: req
			});
		});
	};
	
	var aPromise = [];
	
	if(aIdRels){
		for (let i = 0, length = aIdRels.length; i < length; i++) {
			aPromise.push(inserir((sTblName == '"VGT.REL_USUARIO_MODULO"') ? aIdRels[i].id_dominio_modulo : aIdRels[i].id_empresa));
		}
	}
	
	
	return Promise.all(aPromise);
}

function gerarNovaSenha() {
	var senha = Math.random().toString(36).slice(-6);
	var letrasMaiusculas = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
	var caracteresEspeciais = ["!","@","#","$","%","¨","*"];
	senha += letrasMaiusculas[gerarNumeroAleatorioIntervalo(letrasMaiusculas.length - 1, 0)];//Adiciona letra maiscula
	senha += letrasMaiusculas[gerarNumeroAleatorioIntervalo(letrasMaiusculas.length - 1, 0)].toLowerCase();//Adiciona letra maiscula
	senha += caracteresEspeciais[gerarNumeroAleatorioIntervalo(caracteresEspeciais.length - 1, 0)];//Adiciona caracter especial
	senha += gerarNumeroAleatorioIntervalo(9,0);
	return senha;
}
function gerarNumeroAleatorioIntervalo(max,min){
	return Math.floor(Math.random() * (max - min + 1) + min);
}