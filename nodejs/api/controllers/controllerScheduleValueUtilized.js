'use strict';

const utils = require('./utils');
const model = require('../models/modelScheduleValueUtilized');

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
			let msg = 'Erro inesperado no método "controllerScheduleValueUtilized/listarRegistros": ' + e.message;
			const error = new Error(msg);
			next(error);
		}
	},

	criarRegistro: (req, res, next) => {
		try {
			let aParam = utils.getAvailableFields(model, req.body);

			aParam = aParam.concat(utils.getIdentityFields(model));
			
			aParam.push({
				isIdLog: true,
				 valor: req
			});

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
			let msg = 'Erro inesperado no método "controllerScheduleValueUtilized/criarRegistro": ' + e.message;
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
			let msg = 'Erro inesperado no método "controllerScheduleValueUtilized/lerRegistro": ' + e.message;
			const error = new Error(msg);
			next(error);
		}
	},

	atualizarRegistro: (req, res, next) => {
		try {
			let oCondition = utils.getKeyFieldsInParams(model, req.params);

			let aParam = utils.getAvailableFields(model, req.body);
			
			aParam.push({
				isIdLog: true,
				 valor: req
			});

			model.atualizar(oCondition, aParam, (err, result) => {
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
			let msg = 'Erro inesperado no método "controllerScheduleValueUtilized/atualizarRegistro": ' + e.message;
			const error = new Error(msg);
			next(error);
		}
	},

	excluirRegistro: (req, res, next) => {
		try {
			let aParam = utils.getKeyFieldsInParams(model, req.params);
			
			aParam.push({
				isIdLog: true,
				 valor: req
			});

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
			let msg = 'Erro inesperado no método "controllerScheduleValueUtilized/excluirRegistro": ' + e.message;
			const error = new Error(msg);
			next(error);
		}
	},

	deepQuery: (req, res, next) => {
		res.send('TODO: DeepQuery da Entidade ScheduleValueUtilized');

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
		let msg = 'Erro inesperado no método "controllerScheduleValueUtilized/deepQuery": ' + e.message;
		const error = new Error(msg);
		next(error);
		}*/
	}
};