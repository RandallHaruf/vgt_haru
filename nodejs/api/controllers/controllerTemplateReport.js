"use strict";

const utils = require('./utils');
const model = require("../models/modelTemplateReport");

module.exports = {

	listarRegistros: (req, res, next) => {
		try {
			let aParam = utils.getAvailableFields(model, req.query);
			if(req.query.usarSession){
				aParam.push({
					coluna: model.colunas.fkUsuario,
					valor: req.session.usuario.id
				});
			}
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
			let msg = 'Erro inesperado no método "controllerTemplateReport/listarRegistros": ' + e.message;
			const error = new Error(msg);
			next(error);
		}
	},

	criarRegistro: (req, res, next) => {
		try {
			let aParam = utils.getAvailableFields(model, req.body);
			if(req.body.usarSession){
				aParam.push({
					coluna: model.colunas.fkUsuario,
					valor: req.session.usuario.id
				});
			}
			aParam = aParam.concat(utils.getIdentityFields(model));

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
			let msg = 'Erro inesperado no método "controllerTemplateReport/criarRegistro": ' + e.message;
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
			let msg = 'Erro inesperado no método "controllerTemplateReport/lerRegistro": ' + e.message;
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
			let msg = 'Erro inesperado no método "controllerTemplateReport/atualizarRegistro": ' + e.message;
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
			let msg = 'Erro inesperado no método "controllerTemplateReport/excluirRegistro": ' + e.message;
			const error = new Error(msg);
			next(error);
		}
	},

	deepQuery: function (req, res) {
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var stringDistinct = "";
		var stringDistinctFilter = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];
		/*
		if(aEntrada[5] == null || aEntrada[5] == undefined){
			stringDistinct = 'Select * from (';	
			stringDistinctFilter = 'order by "tblEmpresa.nome" asc, "tblDominioAnoCalendario.ano_calendario" desc, "tblPeriodo.numero_ordem" asc';
		}
		else{
			switch(aEntrada[5][0]){
				case "tblEmpresa.nome":
					stringDistinct = 'Select distinct "tblEmpresa.id_empresa" , "tblEmpresa.nome"  from (';
					break;
				case "tblDominioAnoCalendario.ano_calendario":
					stringDistinct = 'Select distinct "tblDominioAnoCalendario.id_dominio_ano_calendario" , "tblDominioAnoCalendario.ano_calendario" from (';
					stringDistinctFilter = 'order by "tblDominioAnoCalendario.ano_calendario"';
					break;		
				case "tblPeriodo.id_periodo":
					stringDistinct = 'select distinct "tblPeriodo.numero_ordem" from (';
					break;	
				case "tblDominioMoeda.acronimo":
					stringDistinct = 'Select distinct "tblDominioMoeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome" from (';
					break;	
			}			
		}*/
		var sStatement = 
		'SELECT'
		+'tblTemplateReport."id_template_report" AS "tblTemplateReport.id_template_report", '
		+'tblTemplateReport."tela" AS "tblTemplateReport.tela", '
		+'tblTemplateReport."parametros" AS "tblTemplateReport.parametros", '
		+'tblTemplateReport."fk_usuario.id_usuario" AS "fk_usuario.id_usuario", '
		+'tblTemplateReport."isIFrame" AS "isIFrame" '
		+' from '
		+'"VGT.TEMPLATE_REPORT" AS tblTemplateReport';
		
		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};
		aEntrada[1].push(req.session.usuario.id);
		aEntrada[2].push(isFull());

		for (var i = 0; i < aEntrada.length - 1; i++) {
			filtro = "";
			if (aEntrada[i] !== null){
				stringtemporaria = "";
				for (var k = 0; k < aEntrada[i].length; k++) {
					switch (i){
						case 0:
							filtro = ' tblTemplateReport."tela" = ? ';
							break;
						case 1:
							filtro = ' tblTemplateReport."fk_usuario.id_usuario" = ? ';
							break;
						case 2:
							filtro = ' tblTemplateReport."ind_isIFrame" = ? ';
							break;
					}
					if(aEntrada[i].length == 1){
						oWhere.push(filtro);
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}
					}	 
					else{
						k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
						if(aEntrada[i][k] != ""){
							aParams.push(aEntrada[i][k]);	
						}
					}	
				}	
			}
		}

		if (oWhere.length > 0) {
			sStatement += ' where ';
			
			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}

		db.executeStatement({
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