"use strict";

var aliquota = require("../models/modelAliquota");
const modelValorAliquota = require('../models/modelValorAliquota');
const modelPais = require('../models/modelPais');
const modelEmpresa = require('../models/modelEmpresa');
const db = require('../db');

function adicionarAliquotas(req, iIdImposto, aValorAliquota, callback) {
	const selecionarValorAliquota = function () {
		return new Promise(function (resolve, reject) {
			modelValorAliquota.listar([{
				coluna: modelValorAliquota.colunas.fkAliquota,
				valor: iIdImposto
			}], function (err, result) {
				if (err) {
					reject(err);
				}
				else {
					resolve(result);
				}
			});
		});
	};
	
	const excluirValorAliquota = function (iIdValorAliquota) {
		return new Promise(function (resolve, reject) {
			modelValorAliquota.excluir([{
				coluna: modelValorAliquota.colunas.id,
				valor: iIdValorAliquota
			}, {
				isIdLog: true,
				valor: req
			}], function (err, result) {
				if (err) {
					reject(err);
				}
				else {
					resolve(result);
				}
			});
		});
	};
	
	const atualizarValorAliquota = function (iIdValorAliquota, aParam) {
		aParam.push({
			isIdLog: true,
			valor: req
		});
		
		return new Promise(function (resolve, reject) {
			modelValorAliquota.atualizar({
				coluna: modelValorAliquota.colunas.id,
				valor: iIdValorAliquota
			}, aParam, function (err, result) {
				if (err) {
					reject(err);
				}
				else {
					resolve(result);
				}
			});
		});
	};
	
	const inserirValorAliquota = function (aParam) {
		aParam.push({
			coluna: modelValorAliquota.colunas.id
		}, {
			isIdLog: true,
			valor: req
		});
		
		return new Promise(function (resolve, reject) {
			modelValorAliquota.inserir(aParam, function (err, result) {
				if (err) {
					reject(err);
				}
				else {
					resolve(result);
				}
			});
		});
	};
	
	selecionarValorAliquota()
		.then(function (aValorAliquotaPersistido) {
			var aPromiseDelete = [];
			
			for (var i = 0, length = aValorAliquotaPersistido.length; i < length; i++) {
				var oValorAliquotaPersistido = aValorAliquotaPersistido[i];
		
				var oValorAliquotaEnviado = aValorAliquota.find(function (obj) {
					return oValorAliquotaPersistido.id_valor_aliquota === obj.id_valor_aliquota;
				});
				
				if (!oValorAliquotaEnviado) {
					aPromiseDelete.push(excluirValorAliquota(oValorAliquotaPersistido.id_valor_aliquota));
				}
			}
			
			return Promise.all(aPromiseDelete);
		})
		.then(function (resDelete) {
			var aPromiseInsertUpdate = [];
			
			for (var i = 0, length = aValorAliquota.length; i < length; i++) {
				var oValorAliquota = aValorAliquota[i];
				
				if (oValorAliquota.id_valor_aliquota) {
					aPromiseInsertUpdate.push(
						atualizarValorAliquota(oValorAliquota.id_valor_aliquota, [{
							coluna: modelValorAliquota.colunas.valor,
							valor: oValorAliquota.valor
						}, {
							coluna: modelValorAliquota.colunas.fkAliquota,
							valor: iIdImposto
						}, {
							coluna: modelValorAliquota.colunas.fkDominioAnoFiscal,
							valor: oValorAliquota[modelValorAliquota.colunas.fkDominioAnoFiscal.nome]
						}])
					);
				}
				else {
					aPromiseInsertUpdate.push(
						inserirValorAliquota([{
							coluna: modelValorAliquota.colunas.valor,
							valor: oValorAliquota.valor
						}, {
							coluna: modelValorAliquota.colunas.fkAliquota,
							valor: iIdImposto
						}, {
							coluna: modelValorAliquota.colunas.fkDominioAnoFiscal,
							valor: oValorAliquota[modelValorAliquota.colunas.fkDominioAnoFiscal.nome]
						}])
					);
				}
			}
			
			return Promise.all(aPromiseInsertUpdate);
		})
		.then(function (resInsertUpdate) {
			if (callback) {
				callback(null, resInsertUpdate);
			}
		})
		.catch(function (err) {
			if (callback) {
				callback(err, null);
			}
		});
}

function adicionarRegistrosRelacionados(req, iIdImposto, aRegistroRelacionado, iTipoParaDesvincular) {
	const vincular = function (oRegistroRelacionado) {
		let modelRegistro = Number(oRegistroRelacionado.idTipo) === 1 ? modelPais : modelEmpresa;
		
		return new Promise(function (resolve, reject) {
			modelRegistro.atualizar({
				coluna: modelRegistro.colunas.id,
				valor: oRegistroRelacionado[Number(oRegistroRelacionado.idTipo) === 1 ? "id" : "id_empresa"]
			}, [{
				coluna: modelRegistro.colunas.fkAliquota,
				valor: iIdImposto
			}, {
				isIdLog: true,
				valor: req
			}], function (err, result) {
				if (err) {
					reject(err);
				}
				else {
					resolve(result);
				}
			});
		});
	};
	
	const desvincular = function (oRegistroRelacionado) {
		let modelRegistro = Number(oRegistroRelacionado.idTipo) === 1 ? modelPais : modelEmpresa;
		
		return new Promise(function (resolve, reject) {
			if (Number(oRegistroRelacionado[Number(oRegistroRelacionado.idTipo) === 1 ? "fkAliquota" : "fk_aliquota.id_aliquota"]) !== Number(iIdImposto)) {
				resolve();
			}
			else {
				modelRegistro.atualizar({
					coluna: modelRegistro.colunas.id,
					valor:  oRegistroRelacionado[Number(oRegistroRelacionado.idTipo) === 1 ? "id" : "id_empresa"]
				}, [{
					coluna: modelRegistro.colunas.fkAliquota,
					valor: null
				}, {
					isIdLog: true,
					valor: req
				}], function (err, result) {
					if (err) {
						reject(err);
					}
					else {
						resolve(result);
					}
				});
			}
		});
	};
	
	const desvincularTipo = function () {
		return new Promise(function (resolve, reject) {
			let sQuery = 
				'update ' + (Number(iTipoParaDesvincular) === 1 ? '"VGT.PAIS"' : '"VGT.EMPRESA"') + ' set '
				+ '"fk_aliquota.id_aliquota" = null '
				+ 'where '
				+ '"fk_aliquota.id_aliquota" = ?',
				aParam = [iIdImposto];
				
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
			}, {
				idUsuario: req
			});
		});
	};
	
	return new Promise(function (resolve, reject) {
		var aPromise = [];
	
		for (var i = 0, length = aRegistroRelacionado.length; i < length; i++) {
			var oRegistroRelacionado = aRegistroRelacionado[i];
		
			if (oRegistroRelacionado.selecionada == "true") {
				aPromise.push(vincular(oRegistroRelacionado));
			}
			else {
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
}

module.exports = {

	listarRegistros: function (req, res) {
		var aParams = [];
		
		if (req.query.tipo) {
			aParams.push({
				coluna: aliquota.colunas.fkTipo,
				valor: req.query.tipo.toLowerCase() === "pais" ? 1 : 2
			});
		}
		
		aliquota.listar(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	criarRegistro: function (req, res) {
		var nome = req.body.nome ? req.body.nome : null;
		var valor = req.body.valor ? Number(req.body.valor) : null;
		var dataInicio = req.body.dataInicio ? req.body.dataInicio : null;
		var dataFim = req.body.dataFim ? req.body.dataFim : null;
		var fkTipo = req.body.fkTipo ? req.body.fkTipo : null;
		
		var aParams = [{
			coluna: aliquota.colunas.id
		}, {
			coluna: aliquota.colunas.nome,
			valor: nome
		}, {
			coluna: aliquota.colunas.valor,
			valor: valor
		}, {
			coluna: aliquota.colunas.dataInicio,
			valor: dataInicio
		}, {
			coluna: aliquota.colunas.dataFim,
			valor: dataFim
		}, {
			coluna: aliquota.colunas.fkTipo,
			valor: fkTipo
		}, {
			isIdLog: true,
			valor: req
		}];
		
		aliquota.inserir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				var idAliquota = result[0].generated_id;
				
				const finalizarAtualizacao = function () {
					if (req.body.aliquotas) {
						adicionarAliquotas(req, idAliquota, JSON.parse(req.body.aliquotas), function (err2, result2) {
							if (err) {
								res.send(JSON.stringify(err2));
							}
							else {
								res.send(JSON.stringify(result2));
							}
						});
					}
					else {
						res.send(JSON.stringify(result));
					}
				};
				
				if (req.body.registrosRelacionados) {
					adicionarRegistrosRelacionados(req, idAliquota, req.body.registrosRelacionados) 
						.then(function (res) {
							finalizarAtualizacao();
						})	
						.catch(function (err) {
							res.send(JSON.stringify(err));
						});
				}
				else {
					finalizarAtualizacao();
				}
			}
		});
	},
	
	lerRegistro: function (req, res) {
		aliquota.listar([{
			coluna: aliquota.colunas.id,
			valor: Number(req.params.idAliquota)
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	atualizarRegistro: function (req, res) {
		//console.log("REQUEST: " + JSON.stringify(req.params) + JSON.stringify(req.body));
		
		var idAliquota = req.params.idAliquota;
		
		var nome = req.body.nome ? req.body.nome : null;
		var valor = req.body.valor ? Number(req.body.valor) : null;
		var dataInicio = req.body.dataInicio ? req.body.dataInicio : null;
		var dataFim = req.body.dataFim ? req.body.dataFim : null;
		var fkTipo = req.body.fkTipo ? req.body.fkTipo : null;
		
		var oCondition = {
			coluna: aliquota.colunas.id,
			valor: idAliquota
		};
		
		var aParams = [{
			coluna: aliquota.colunas.nome,
			valor: nome
		}, {
			coluna: aliquota.colunas.valor,
			valor: valor
		}, {
			coluna: aliquota.colunas.dataInicio,
			valor: dataInicio
		}, {
			coluna: aliquota.colunas.dataFim,
			valor: dataFim
		}, {
			coluna: aliquota.colunas.fkTipo,
			valor: fkTipo
		}, {
			isIdLog: true,
			valor: req
		}];
		
		aliquota.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				const finalizarAtualizacao = function () {
					if (req.body.aliquotas) {
						adicionarAliquotas(req, idAliquota, JSON.parse(req.body.aliquotas), function (err2, result2) {
							if (err) {
								res.send(JSON.stringify(err2));
							}
							else {
								res.send(JSON.stringify(result2));
							}
						});
					}
					else {
						res.send(JSON.stringify(result));
					}
				};
				
				if (req.body.registrosRelacionados) {
					adicionarRegistrosRelacionados(req, idAliquota, req.body.registrosRelacionados, req.body.tipoParaDesvincular) 
						.then(function (res) {
							finalizarAtualizacao();
						})	
						.catch(function (err) {
							res.send(JSON.stringify(err));
						});
				}
				else {
					finalizarAtualizacao();
				}
			}
		});
	},
	
	excluirRegistro: function (req, res) {
		aliquota.excluir([{
			coluna: aliquota.colunas.id,
			valor: req.params.idAliquota
		}, {
			isIdLog: true,
			valor: req
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	deepQuery: function (req, res) {
		var sStatement = 
			'select *  '
			+ 'from "VGT.ALIQUOTA" aliquota '
			+ 'left outer join "VGT.DOMINIO_ALIQUOTA_TIPO" tipo '
			+ 'on aliquota."fk_dominio_aliquota_tipo.id_dominio_aliquota_tipo" = tipo."id_dominio_aliquota_tipo" ';
		
		aliquota.execute({
			statement: sStatement
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		}, {
			idUsuario: req
		});
	}
};