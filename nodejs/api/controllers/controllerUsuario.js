"use strict";

//var db = require("../db");
var model = require("../models/modelUsuario");
/*var modelEmpresa = require("../models/modelEmpresa");
var modelRelUsuarioEmpresa = require("../models/modelRelUsuarioEmpresa");
var modelDominioModulo = require("../models/modelDominioModulo");
var modelRelUsuarioModulo = require("../models/modelRelUsuarioModulo");*/

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

	criarRegistro: function (req, res) {

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
			valor: "$2a$05$vo2B9vu8Z0wANmDgdhVKkuu/rT0uIr9MY7htbM9GwmNt1.rtDkUDC" //req.body.pass ? req.body.pass : null
		}, {
			coluna: model.colunas.indAtivo,
			valor: req.body.indAtivo ? req.body.indAtivo : null
		}, {
			coluna: model.colunas.fkDominioTipoAcesso,
			valor: req.body.fkDominioTipoAcesso ? req.body.fkDominioTipoAcesso : null
		}];

		model.inserir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				console.log(req.body.modulos);
				console.log(req.body.empresas);

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
			valor: req.body.pass ? req.body.pass : null
		}, {
			coluna: model.colunas.indAtivo,
			valor: req.body.indAtivo ? req.body.indAtivo : null
		}, {
			coluna: model.colunas.fkDominioTipoAcesso,
			valor: req.body.fkDominioTipoAcesso ? req.body.fkDominioTipoAcesso : null
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
		});
	}
};