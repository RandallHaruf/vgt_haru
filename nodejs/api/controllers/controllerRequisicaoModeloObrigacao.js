'use strict';

const utils = require('./utils');
const model = require('../models/modelRequisicaoModeloObrigacao');

module.exports = {

	listarRegistros: (req, res, next) => {
		try {
			let aParam = utils.getAvailableFields(model, req.query);

			model.listar(aParam, (err, result) => {
				if (err) {
					next(err);
				} else {
					res.status(200).json({
						result: result
					});
				}
			});
		} catch (e) {
			console.log(e);
			let msg = 'Erro inesperado no método "controllerRequisicaoModeloObrigacao/listarRegistros": ' + e.message;
			const error = new Error(msg);
			next(error);
		}
	},

	criarRegistro: (req, res, next) => {
		try {
			let aParam = utils.getAvailableFields(model, req.body);

			aParam = aParam.concat(utils.getIdentityFields(model));
			//Criar o modeloObrigacao
			model.inserir(aParam, (err, result) => {
				if (err) {
					next(err);
				} else {
					
					res.status(200).json({
						result: result[0]
					});
				}
			});
		} catch (e) {
			console.log(e);
			let msg = 'Erro inesperado no método "controllerRequisicaoModeloObrigacao/criarRegistro": ' + e.message;
			const error = new Error(msg);
			next(error);
		}
	},

	lerRegistro: (req, res, next) => {
		try {
			let aParam = utils.getKeyFieldsInParams(model, req.params);

			model.listar(aParam, (err, result) => {
				if (err) {
					next(err);
				} else {
					if (result && result.length > 0) {
						res.status(200).json({
							result: result[0]
						});
					} else {
						const error = new Error('Registro não encontrado');
						error.status = 404;
						next(error);
					}
				}
			});
		} catch (e) {
			console.log(e);
			let msg = 'Erro inesperado no método "controllerRequisicaoModeloObrigacao/lerRegistro": ' + e.message;
			const error = new Error(msg);
			next(error);
		}
	},

	atualizarRegistro: (req, res, next) => {
		try {
			let oCondition = utils.getKeyFieldsInParams(model, req.params);

			let aParam = utils.getAvailableFields(model, req.body);

			model.atualizar(oCondition, aParam, (err, result) => {
				if (err) {
					next(err);
				} else {
					if (result) {
						//Aqui temos que criar a relacao modelo empresa com a empresa e o id do modelo obrigacao que estão presentes na requsicao que foi aceita além de colocar o status da modelo obrigacao como aceito para aparecer nas listagens da tela de empresa
						res.status(200).json({
							result: result
						});
					} else {
						const error = new Error('Registro não encontrado');
						error.status = 404;
						next(error);
					}
				}
			});
		} catch (e) {
			console.log(e);
			let msg = 'Erro inesperado no método "controllerRequisicaoModeloObrigacao/atualizarRegistro": ' + e.message;
			const error = new Error(msg);
			next(error);
		}
	},

	excluirRegistro: (req, res, next) => {
		try {
			let aParam = utils.getKeyFieldsInParams(model, req.params);

			model.excluir(aParam, (err, result) => {
				if (err) {
					next(err);
				} else {
					if (result) {
						res.status(200).json({
							result: result
						});
					} else {
						const error = new Error('Registro não encontrado');
						error.status = 404;
						next(error);
					}
				}
			});
		} catch (e) {
			console.log(e);
			let msg = 'Erro inesperado no método "controllerRequisicaoModeloObrigacao/excluirRegistro": ' + e.message;
			const error = new Error(msg);
			next(error);
		}
	},

	deepQuery: (req, res, next) => {
		res.send('TODO: DeepQuery da Entidade RequisicaoModeloObrigacao');

		/*let sStatement = 'select * from "DUMMY"';

		try {
		model.execute({
		statement: sStatement
		}, (err, result) => {
		if (err) {
		next(err);
		} else {
		res.status(200).json({
		result: result
		});
		}
		});
		} catch (e) {
		console.log(e);
		let msg = 'Erro inesperado no método "controllerRequisicaoModeloObrigacao/deepQuery": ' + e.message;
		const error = new Error(msg);
		next(error);
		}*/
	}
};