'use strict';

const utils = require('./utils');
const model = require('../models/modelRequisicaoModeloObrigacao');
const modelRelModeloEmpresa = require('../models/modelRelModeloEmpresa');
const modelModeloObrigacao = require('../models/modelModeloObrigacao');

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
			let aParamModeloObrigacao = utils.getAvailableFields(modelModeloObrigacao, req.body);
			
			aParam = aParam.concat(utils.getIdentityFields(model));
			aParamModeloObrigacao = aParamModeloObrigacao.concat(utils.getIdentityFields(modelModeloObrigacao));
			
			//Criar o modeloObrigacao
			if(aParamModeloObrigacao.length && aParam.length){
				modelModeloObrigacao.inserir(aParamModeloObrigacao, (err, result) => {
					if (err) {
						next(err);
					} else {
						model.inserir(aParam, (err2, result2) => {
							if (err2) {
								next(err2);
							} else {
								res.status(200).json({
									result: result2[0]
								});
							}
						});		
					}
				});				
			}else{
				next(new Error('Parametros obrigatorios não foram enviados'))
			}

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
						if(req.body["fkDominioRequisicaoModeloObrigacaoStatus"]==2){
							//Aqui temos que criar a relacao modelo empresa com a empresa e o id do modelo obrigacao que estão presentes na requsicao que foi aceita além de colocar o status da modelo obrigacao como aceito para aparecer nas listagens da tela de empresa
							let fkModeloObrigacao = req.body["fkModeloObrigacao"];
							let fkEmpresa = req.body["fkEmpresa"];
							
							modelModeloObrigacao.atualizar({
								coluna: modelModeloObrigacao.colunas.id,
								valor: fkModeloObrigacao
							},[{
								coluna: modelModeloObrigacao.colunas.fkIdDominioObrigacaoStatus,
								valor: 2
							}], (err2, result2) => {
								if (err2) {
									next(err2);
								} else {
									modelRelModeloEmpresa.inserir([{
										coluna:modelRelModeloEmpresa.colunas.id
									},{
										coluna: modelRelModeloEmpresa.colunas.fkIdModeloObrigacao,
										valor: fkModeloObrigacao
									},{
										coluna:modelRelModeloEmpresa.colunas.fkIdEmpresa,
										valor: fkEmpresa
									},{
										coluna:modelRelModeloEmpresa.colunas.indAtivo,
										valor: true
									}], (err3, result3) => {
										if (err3) {
											next(err3);
										} else {
											res.status(200).json({
												result: result3[0]
											});
										}										
									});	
								}							
							});
						}
						else{
							res.status(200).json({
								result: result
							});							
						}
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

	deepQuery: function (req, res) {
		var sStatement = 
			'select '
			+'* ,tblUsuario."nome" AS "nome_usuario"'
			+'from '
			+'"VGT.REQUISICAO_MODELO_OBRIGACAO" tblRequisicaoModeloObrigacao '
			+'INNER JOIN "VGT.DOMINIO_REQUISICAO_MODELO_OBRIGACAO_STATUS" tblDominioRequisicaoModeloObrigacaoStatus '
			+'ON tblDominioRequisicaoModeloObrigacaoStatus."id_dominio_requisicao_modelo_obrigacao_status" = tblRequisicaoModeloObrigacao."fk_dominio_requisicao_modelo_obrigacao_status.id_dominio_requisicao_modelo_obrigacao_status" '
			+'INNER JOIN "VGT.USUARIO" tblUsuario '
			+'ON tblUsuario."id_usuario" = tblRequisicaoModeloObrigacao."fk_usuario.id_usuario" '
			+'INNER JOIN "VGT.EMPRESA" tblEmpresa '
			+'ON tblEmpresa."id_empresa" = tblRequisicaoModeloObrigacao."fk_empresa.id_empresa" '
			+'INNER JOIN "VGT.MODELO_OBRIGACAO" tblModeloObrigacao '
			+'ON tblModeloObrigacao."id_modelo" = tblRequisicaoModeloObrigacao."fk_modelo_obrigacao.id_modelo" ';
			
		var oWhere = [];
		var aParams = [];

		if (req.query.idStatus) {
			oWhere.push(' tblRequisicaoModeloObrigacao."fk_dominio_requisicao_modelo_obrigacao_status.id_dominio_requisicao_modelo_obrigacao_status" = ? ');
			aParams.push(req.query.idStatus);
		}
		
		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};
		
		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/ req.session.usuario.empresas.length > 0){
			var aEmpresas = req.session.usuario.empresas;
			var stringtemporaria = "";
			var filtro = ' tblEmpresa."id_empresa" = ? ';
			for(var j = 0; j < req.session.usuario.empresas.length;j++){
				if(aEmpresas.length == 1){
					oWhere.push(filtro);
					aParams.push(aEmpresas[j]);								
				}	 
				else{
					j == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : j == aEmpresas.length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
					aParams.push(aEmpresas[j]);
				}				
			}
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
		
		sStatement += ' Order By tblEmpresa."nome"';

		model.execute({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				var idUsuario = req.session.usuario.id;
				for (var i = 0; i < result.length; i++){
					var oCorrente = result[i];
					if (oCorrente.id_usuario == idUsuario) {
						oCorrente.btnSalvarHabilitado = false;
					}
					else {
						oCorrente.btnSalvarHabilitado = true;
					}
				}
				
				res.send(JSON.stringify(result));
			}
		});
	}
};
/*
	deepQuery: (req, res, next) => {


	}*/
