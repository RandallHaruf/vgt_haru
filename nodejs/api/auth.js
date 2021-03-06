"use strict";

const passwordValidator = require("password-validator");
const bcrypt = require("bcryptjs");
const db = require("./db");

const closeConnection = function (oConnection) {
	try {
		if (oConnection) {
			oConnection.close();
		}
	} catch (e) {
		console.log(e);
	}
};

const getModulos = function (sUserId) {
	return new Promise(function (resolve, reject) {
		db.executeStatement({
			statement: 'select * from "VGT.REL_USUARIO_MODULO" where "fk_usuario.id_usuario" = ?',
			parameters: [sUserId]
		}, function (err, result) {
			if (err) {
				reject(err);
			} else {
				let aModulo = [];

				for (let i = 0, length = result.length; i < length; i++) {
					aModulo.push(result[i]["fk_dominio_modulo.id_dominio_modulo"]);
				}

				resolve(aModulo);
			}
		});
	});
};

const getEmpresas = function (sUserId) {
	return new Promise(function (resolve, reject) {
		db.executeStatement({
			statement: 'select * from "VGT.REL_USUARIO_EMPRESA" where "fk_usuario.id_usuario" = ?',
			parameters: [sUserId]
		}, function (err, result) {
			if (err) {
				reject(err);
			} else {
				let aEmpresa = [];

				for (let i = 0, length = result.length; i < length; i++) {
					aEmpresa.push(result[i]["fk_empresa.id_empresa"]);
				}

				resolve(aEmpresa);
			}
		});
	});
};

const registrarAcesso = function (idUsuario, req) {
	db.executeStatement({
		statement: 'upsert "VGT.ACESSO" ("fk_usuario.id_usuario", "datahora_acesso") '
					+ 'values(?, CURRENT_TIMESTAMP) where "fk_usuario.id_usuario" = ? ', 
		parameters: [idUsuario, idUsuario]
	}, function (err, result) { }, {
		idUsuario: req
	});
};

const login = function (req, res) {
	if (req.body.usuario && req.body.senha) {
		let conn = db.getConnection();
		
		conn.exec(
			'select "id_usuario", '
			+ '"nome", '
			+ '"email", '
			+ '"contato", '
			+ '"user", '
			+ '"pass", '
			+ '"ind_ativo", '
			+ '"fk_dominio_tipo_acesso.id_tipo_acesso" '
			+ 'from "VGT.USUARIO" WHERE "user" = ?', 
			[ req.body.usuario ],
			function (err, result) {
				if (err) {
					req.session = {
						autenticado: false
					};
					res.send(JSON.stringify(err));
				} 
				else if (result.length === 0 || !result[0].ind_ativo) {
					req.session = {
						autenticado: false
					};

					res.status(401).send({
						success: false,
						error: {
							msg: "Usuário ou senha incorretos."
						}
					});
				} 
				else {
					let _passwordMatch = false;
					
					bcrypt.compare(req.body.senha, result[0].pass, function (err, resp) {
						_passwordMatch = resp;

						if (result.length && _passwordMatch) {
							req.session = {
								autenticado: true
							};

							req.session.usuario = {
								id: result[0].id_usuario,
								nome: result[0].nome,
								email: result[0].email,
								contato: result[0].contato,
								nivelAcesso: result[0]["fk_dominio_tipo_acesso.id_tipo_acesso"],
								host: req.get('host')
							};

							registrarAcesso(result[0].id_usuario, req);

							// Carrega os modulos e as empresas que o usuario pode visualizar/acessar
							getModulos(result[0].id_usuario)
								.then(function (aModulo) {
									req.session.usuario.modulos = aModulo;

									return getEmpresas(result[0].id_usuario);
								})
								.then(function (aEmpresa) {
									req.session.usuario.empresas = aEmpresa;

									retornarAmbienteLogado()
									.then(function(responseAmbiente){
										req.session.usuario.ambiente = responseAmbiente[0].valor;
										res.send(JSON.stringify({
											success: true,
											msg: "Usuário autenticado com sucesso."
										}));
									})
									.catch(function (errAmbiente){
										console.log("erro" + JSON.stringify(errAmbiente));
										req.session = {
											autenticado: false
										};
										res.send({
											success: false,
											error: {
												msg: "Erro ao carregar ambiente logado"
											}
										});
									})
								})
								.catch(function (err2) {
									req.session = {
										autenticado: false
									};

									res.send({
										success: false,
										error: {
											msg: "Erro ao carregar módulos e empresas do usuário."
										}
									});
								});
						} else {
							req.session = {
								autenticado: false
							};

							res.send({
								success: false,
								error: {
									msg: "Usuário ou senha incorretos."
								}
							});
						}
					});

				}

				closeConnection(conn);
			}
		);
	} else {
		req.session = {
			autenticado: false
		};

		res.send({
			success: false,
			error: {
				msg: "Usuário ou senha não informados."
			}
		});
	}
};

const deslogar = function (req, res) {
	// Remove o registro de acesso do usuário
	db.executeStatement({
		statement: 'delete from "VGT.ACESSO" where "fk_usuario.id_usuario" = ?', 
		parameters: [req.session.usuario.id]
	}, function (err, result) { 
		if (err) {
			console.log(err);
		}
		
		req.session = null;
		
		res.send();
	}, {
		idUsuario: req
	});
};

const verificaAuth = function (req, res) {
	if (req.session.autenticado && req.session.usuario.host === req.get('host')) {
		registrarAcesso(req.session.usuario.id, req);
		
		res.send({
			success: true,
			msg: "Usuário já autenticado.",
			modulos: req.session.usuario.modulos,
			nome: req.session.usuario.nome,
			id: req.session.usuario.id,
			nivelAcesso:req.session.usuario.nivelAcesso,
			ambiente: req.session.usuario.ambiente
		});
	} else {
		req.session = {
			autenticado: false
		};

		res.send({
			success: false,
			msg: "Usuário não autenticado."
		});
	}
};

const criarUsuario = function (req, res) {
	if (req.body.usuario) {
		let conn = db.getConnection();
		let _usuario = req.body.usuario;
		let _passwordSchema = new passwordValidator();

		_passwordSchema
			.is().min(10)
			.is().max(100)
			.has().uppercase()
			.has().lowercase()
			.has().symbols()
			.has().digits()
			.has().not().spaces()
			.is().not().oneOf(['1234567891', '0000000000']);

		let senhaErros = _passwordSchema.validate(_usuario.pass, {
			list: true
		});

		if (senhaErros.length) {
			return res.send({
				success: false,
				listaErros: senhaErros
			});
		}

		bcrypt.hash(_usuario.pass, 5, function (err, hash) {
			if (err) {
				return res.send({
					success: false,
					error: {
						message: err
					}
				});
			}

			_usuario.pass = hash;

			conn.exec(
				'INSERT INTO "VGT.USUARIO" VALUES (incUsuarios.nextval, ?, ?, ?, ?, ?, ?, ?)', [_usuario.nome, _usuario.email, _usuario.contato,
					_usuario.user, _usuario.pass, _usuario.indAtivo, _usuario.tipoAceito
				],
				function (err, result) {
					if (err) {
						console.log(err);
						res.send({
							success: false,
							error: {
								message: err
							}
						});
					} else {
						res.send({
							msg: "Usuário criado com sucesso."
						});
					}

					return closeConnection(conn);
				}
			);
		});
	} else {
		res.send({
			success: false,
			error: {
				message: "Erro ao enviar as propriedades para o servidor."
			}
		});
	}
};

function encrypt(sPassword) {
	return new Promise(function (resolve, reject) {
		bcrypt.hash(sPassword, 5, function (err, hash) {
			if (err) {
				reject();
			}
			else{
				resolve(hash);	
			}
		});
	});
}

module.exports = function (app) {
	if (app) {
		app.use(function (req, res, next) {
			if (req.session.autenticado) {
				if (req.originalUrl === "/node/login") {
					return res.send({
						success: true,
						msg: "Usuário autenticado com sucesso."
					});
				}
	
				return next();
			} else {
				if (req.originalUrl === "/node/login") {
					req.session = null;
					return next();
				}
	
				return res.status(401).send({
					success: false,
					error: {
						msg: "Usuário não autenticado."
					}
				});
			}
		});
	
		app.post("/node/login", login);
		app.get("/node/deslogar", deslogar);
		app.get("/node/verifica-auth", verificaAuth);
		app.post("/node/criar-usuario", criarUsuario);
	}
	
	return {
		encrypt: encrypt,
		
		filtrarEmpresas: function (req, aEmpresa, sNomeCampoIdEmpresa) {
			if (req.session && req.session.autenticado) {
				// O Nivel de acesso não controla mais o filtro da lista de empresas.
				// Todos os usuarios são submetidos ao filtro de empresa, salvo quando estão dentro do inception, que o filtro é burlado
				//if (req.session.usuario.nivelAcesso === 0) {
				if(req.query && req.query.full && req.query.full == "true"){
					return aEmpresa;
				}
				else{
					if(req.query.moduloAtual){
						aEmpresa = filtrarEmpresasPorModulo(req.query.moduloAtual, aEmpresa, sNomeCampoIdEmpresa);
					}
					return aEmpresa.filter(function (obj) {
						return req.session.usuario.empresas.includes(obj[sNomeCampoIdEmpresa]);
					});
				}
				/*}
				else {
					return aEmpresa;
				}*/
			}
			else {
				return [];
			}
		}
	};
};

function filtrarEmpresasPorModulo(moduloAtual, aEmpresa, sNomeCampoIdEmpresa) {
	var aModulo = moduloAtual.toLowerCase().split(',');
	
	var sQuery = 
		'Select * from "VGT.REL_EMPRESA_MODULO" '
		+ 'where "fk_dominio_modulo.id_dominio_modulo" in ( ',
		aParam = [];
	
	for (let i = 0; i < aModulo.length; i++) {
		let id;
		
		switch (aModulo[i]) {
			case 'ttc': 
				id = 1;
				break;
			case 'compliance':
				id = 3;
				break;
			case 'taxpackage':
				id = 2;
				break;
			case 'beps':
				id = 4;
				break;
		}
		
		if (i !== 0) {
			sQuery += ' , ';
		}
		
		sQuery += ' ? ';
		aParam.push(id);
	}
	
	sQuery += ' ) ';
	
	var aEmpresaFiltrado = [];
	var aEmpresasModulo = db.executeStatementSync(sQuery, aParam);
	
	for (let i = 0; i < aEmpresa.length; i++) {
		for (let j = 0; j < aEmpresasModulo.length; j++) {
			if (aEmpresa[i][sNomeCampoIdEmpresa] == aEmpresasModulo[j]["fk_empresa.id_empresa"]) {
				aEmpresaFiltrado.push(aEmpresa[i]);
			}
		}
	}
	
	return aEmpresaFiltrado;
}

function retornarAmbienteLogado(){
	return new Promise(function(resolve,reject){
		db.executeStatement({
			statement:'select * from "VGT.APP_CONFIG" where "chave" = \'ambienteLogado\''
			},
			function (err, result) {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			}
		);
	});
};