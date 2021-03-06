"use strict";

var db = require('../db');
var model = require("../models/modelRequisicaoReaberturaTaxPackage");
var modelRelTaxPackagePeriodo = require("../models/modelRelTaxPackagePeriodo");

module.exports = {

	listarRegistros: function (req, res) {
		var aParam = [];
	/*	if (req.query.empresa) {
			aParam.push({
				coluna: model.colunas.fkEmpresa.id_empresa,
				valor: Number(req.query.empresa)
			});
		} */

		if (req.query.reltaxperiodo) {
			aParam.push({
				coluna: model.colunas.fkIdRelTaxPackagePeriodo,
				valor: Number(req.query.reltaxperiodo)
			});
		}

		if (req.query.status) {
			aParam.push({
				coluna: model.colunas.fkDominioRequisicaoReaberturaStatus,
				valor: Number(req.query.status)
			});
		} 
		
		model.listar(aParam, function (err, result) {
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
			coluna: model.colunas.dataRequisicao,
			valor: req.body.dataRequisicao ? req.body.dataRequisicao : null
		}, {
			coluna: model.colunas.idUsuario,
			valor: req.body.idUsuario ? req.session.usuario.id : null
		}, {
			coluna: model.colunas.nomeUsuario,
			valor: req.body.nomeUsuario ? req.session.usuario.nome : null
		}, {
			coluna: model.colunas.justificativa,
			valor: req.body.justificativa ? req.body.justificativa : null
		}, {
			coluna: model.colunas.resposta,
			valor: req.body.resposta ? req.body.resposta : null
		}, {
			coluna: model.colunas.fkDominioRequisicaoReaberturaStatus,
			valor: req.body.fkDominioRequisicaoReaberturaStatus ? Number(req.body.fkDominioRequisicaoReaberturaStatus) : null
		}, {
			coluna: model.colunas.fkIdRelTaxPackagePeriodo,
			valor: req.body.fkIdRelTaxPackagePeriodo ? Number(req.body.fkIdRelTaxPackagePeriodo) : null
		}, {
			coluna: model.colunas.dataResposta,
			valor: req.body.dataResposta ? req.body.dataResposta : null
		}, {
			isIdLog: true,
			valor: req
		}];

		model.inserir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
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
			coluna: model.colunas.dataRequisicao,
			valor: req.body.dataRequisicao ? req.body.dataRequisicao : null
		}, {
			coluna: model.colunas.idUsuario,
			valor: req.body.idUsuario ? req.body.idUsuario : null
		}, {
			coluna: model.colunas.nomeUsuario,
			valor: req.body.nomeUsuario ? req.body.nomeUsuario : null
		}, {
			coluna: model.colunas.justificativa,
			valor: req.body.justificativa ? req.body.justificativa : null
		}, {
			coluna: model.colunas.resposta,
			valor: req.body.resposta ? req.body.resposta : null
		}, {
			coluna: model.colunas.fkDominioRequisicaoReaberturaStatus,
			valor: req.body.fkDominioRequisicaoReaberturaStatus ? Number(req.body.fkDominioRequisicaoReaberturaStatus) : null
		}, {
			coluna: model.colunas.fkIdRelTaxPackagePeriodo,
			valor: req.body.fkIdRelTaxPackagePeriodo ? Number(req.body.fkIdRelTaxPackagePeriodo) : null
		}, {
			coluna: model.colunas.dataResposta,
			valor: req.body.dataResposta ? req.body.dataResposta : null
		}, {
			isIdLog: true,
			valor: req
		}];

		model.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				
				// Atualiza o periodo caso tenha sido aprovação do admin
				if (req.body.reabrirPeriodo && req.body.fkDominioRequisicaoReaberturaStatus && Number(req.body.fkDominioRequisicaoReaberturaStatus) === 2) { 
					var sComando = 
						'select * '
						+ 'from "VGT.REL_TAX_PACKAGE_PERIODO" '
						+ 'inner join "VGT.PERIODO" '
						+ 'on "fk_periodo.id_periodo" = "id_periodo" '
						+ 'inner join "VGT.TAX_PACKAGE" '
						+ 'on "fk_tax_package.id_tax_package" = "id_tax_package" '
						+ 'where "id_rel_tax_package_periodo" = ?';
						
					db.executeStatement({
						statement: sComando,
						parameters: [req.body.fkIdRelTaxPackagePeriodo]
					}, (err3, result3) => {
						if (err3) {
							console.log(err3);
						}
						else {
							const atualizacaoNormal = () => {
								var sQuery = 'update "VGT.REL_TAX_PACKAGE_PERIODO" set "ind_ativo" = ?, "status_envio" = ? where "id_rel_tax_package_periodo" = ? '; 
								var aParam = [true, 2, req.body.fkIdRelTaxPackagePeriodo];
								
								model.execute({
									statement: sQuery,
									parameters: aParam
								}, function (err2) {
									if (err2) {
										console.log(err2);
									}
								}, {
									idUsuario: req
								});
							};
							
							if (result3 && result3.length) {
								if (result3[0].numero_ordem === 6) {
									let fkTaxPackage = result3[0]["fk_tax_package.id_tax_package"],
										fkPeriodo = result3[0]["fk_periodo.id_periodo"];
									
									modelRelTaxPackagePeriodo.isPrimeiraRetificadora(result3[0]["fk_empresa.id_empresa"], result3[0]["fk_dominio_ano_calendario.id_dominio_ano_calendario"])
										.then((bIsPrimeiraRetificadora) => {
											if (bIsPrimeiraRetificadora) {
												atualizacaoNormal();
											}
											else {
												modelRelTaxPackagePeriodo.inserir([{
													coluna: modelRelTaxPackagePeriodo.colunas.id
												}, {
													coluna: modelRelTaxPackagePeriodo.colunas.fkTaxPackage,
													valor: fkTaxPackage
												}, {
													coluna: modelRelTaxPackagePeriodo.colunas.fkPeriodo,
													valor: fkPeriodo 
												}, {
													coluna: modelRelTaxPackagePeriodo.colunas.indAtivo,
													valor: true
												}, {
													coluna: modelRelTaxPackagePeriodo.colunas.statusEnvio,
													valor: 2 // not started
												}], (err4, result4) => {
													if (err4) {
														console.log(err4);
													}
													else {
														if (result4 && result4.length) {
															model.atualizar(oCondition, [{
																coluna: model.colunas.fkIdRelTaxPackagePeriodo,
																valor: result4[0].generated_id
															}], (err5, result5) => {
																console.log(err5);
															});
														}
													}
												});
											}
										})
										.catch((err) => {
											console.log(err);
										});
								}
								else {
									atualizacaoNormal();
								}
							}
							else {
								atualizacaoNormal();
							}
						}
					});
				}
				
				res.send(JSON.stringify(result));
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

		var sStatement =
			  ' select tblRequisicaoTaxPackage.*,tblRequisicaoTaxPackageStatus.*,tblTaxPackagePeriodo.*,tblTaxPackage.*,tblPeriodo.*,tblEmpresa.*,tblAnoCalendario.* from "VGT.REQUISICAO_REABERTURA_TAX_PACKAGE" tblRequisicaoTaxPackage '
			+ ' inner join "VGT.DOMINIO_REQUISICAO_REABERTURA_STATUS" tblRequisicaoTaxPackageStatus '
			+ ' on tblRequisicaoTaxPackage."fk_dominio_requisicao_reabertura_status.id_dominio_requisicao_reabertura_status" = tblRequisicaoTaxPackageStatus."id_dominio_requisicao_reabertura_status" '
			+ ' inner join "VGT.REL_TAX_PACKAGE_PERIODO" tblTaxPackagePeriodo '
			+ ' on tblRequisicaoTaxPackage."fk_id_rel_tax_package_periodo.id_rel_tax_package_periodo" = tblTaxPackagePeriodo."id_rel_tax_package_periodo" '
			+ ' inner join "VGT.TAX_PACKAGE" tblTaxPackage '
			+ ' on tblTaxPackagePeriodo."fk_tax_package.id_tax_package" = tblTaxPackage."id_tax_package" '
			+ ' inner join "VGT.PERIODO" tblPeriodo '
			+ ' on tblTaxPackagePeriodo."fk_periodo.id_periodo" = tblPeriodo."id_periodo" '
			+ ' inner join "VGT.DOMINIO_ANO_CALENDARIO" tblAnoCalendario '
			+ ' on tblPeriodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = tblAnoCalendario."id_dominio_ano_calendario" '
			+ ' inner join "VGT.EMPRESA" tblEmpresa'
			+ ' on tblTaxPackage."fk_empresa.id_empresa" = tblEmpresa."id_empresa" ';


		var oWhere = [];
		var aParams = [];
		
		if (req.query.empresa) {
			oWhere.push(' tblEmpresa."id_empresa" = ? ');
			aParams.push(req.query.empresa);
		}

		if (req.query.status) {
			oWhere.push(' tblRequisicaoTaxPackageStatus."id_dominio_requisicao_reabertura_status" = ? ');
			aParams.push(req.query.status);
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
		}, {
			idUsuario: req
		});
	}
};