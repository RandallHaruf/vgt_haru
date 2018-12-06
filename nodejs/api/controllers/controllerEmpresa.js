"use strict";

var model = require("../models/modelEmpresa");
var modelRelEmpresaObrigacao = require("../models/modelRelEmpresaObrigacaoAcessoria");

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
		var that = this;

		var aParams = [{
			coluna: model.colunas.id
		}, {
			coluna: model.colunas.nome,
			valor: req.body.nome ? req.body.nome : null
		}, {
			coluna: model.colunas.numHFMSAP,
			valor: req.body.numHFMSAP ? req.body.numHFMSAP : null
		}, {
			coluna: model.colunas.tin,
			valor: req.body.tin ? req.body.tin : null
		}, {
			coluna: model.colunas.jurisdicaoTIN,
			valor: req.body.jurisdicaoTIN ? req.body.jurisdicaoTIN : null
		}, {
			coluna: model.colunas.ni,
			valor: req.body.ni ? req.body.ni : null
		}, {
			coluna: model.colunas.jurisdicaoNi,
			valor: req.body.jurisdicaoNi ? req.body.jurisdicaoNi : null
		}, {
			coluna: model.colunas.endereco,
			valor: req.body.endereco ? req.body.endereco : null
		}, {
			coluna: model.colunas.fyStartDate,
			valor: req.body.fyStartDate ? req.body.fyStartDate : null
		}, {
			coluna: model.colunas.fyEndDate,
			valor: req.body.fyEndDate ? req.body.fyEndDate : null
		}, {
			coluna: model.colunas.lbcNome,
			valor: req.body.lbcNome ? req.body.lbcNome : null
		}, {
			coluna: model.colunas.lbcEmail,
			valor: req.body.lbcEmail ? req.body.lbcEmail : null
		}, {
			coluna: model.colunas.comentarios,
			valor: req.body.comentarios ? req.body.comentarios : null
		}, {
			coluna: model.colunas.fkTipoSocietario,
			valor: req.body.fkTipoSocietario ? Number(req.body.fkTipoSocietario) : null
		}, {
			coluna: model.colunas.fkStatus,
			valor: req.body.fkStatus ? Number(req.body.fkStatus) : null
		}, {
			coluna: model.colunas.fkAliquota,
			valor: req.body.fkAliquota ? Number(req.body.fkAliquota) : null
		}, {
			coluna: model.colunas.fkPais,
			valor: req.body.fkPais ? Number(req.body.fkPais) : null
		}];

		model.inserir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				var idEmpresa = result[0].generated_id;
				
				vincularPeriodos(idEmpresa);
				
				// Se foi enviado junto a request de inserir uma empresa uma lista de ids de obrigações,
				//  é preciso inserir registros na tabela de vínculo entre empresa e obrigação acessória
				if (req.body.obrigacoes) {
					var oObrigacoes = JSON.parse(req.body.obrigacoes);

					vincularObrigacoes(idEmpresa, oObrigacoes);
				}

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
			coluna: model.colunas.numHFMSAP,
			valor: req.body.numHFMSAP ? req.body.numHFMSAP : null
		}, {
			coluna: model.colunas.tin,
			valor: req.body.tin ? req.body.tin : null
		}, {
			coluna: model.colunas.jurisdicaoTIN,
			valor: req.body.jurisdicaoTIN ? req.body.jurisdicaoTIN : null
		}, {
			coluna: model.colunas.ni,
			valor: req.body.ni ? req.body.ni : null
		}, {
			coluna: model.colunas.jurisdicaoNi,
			valor: req.body.jurisdicaoNi ? req.body.jurisdicaoNi : null
		}, {
			coluna: model.colunas.endereco,
			valor: req.body.endereco ? req.body.endereco : null
		}, {
			coluna: model.colunas.fyStartDate,
			valor: req.body.fyStartDate ? req.body.fyStartDate : null
		}, {
			coluna: model.colunas.fyEndDate,
			valor: req.body.fyEndDate ? req.body.fyEndDate : null
		}, {
			coluna: model.colunas.lbcNome,
			valor: req.body.lbcNome ? req.body.lbcNome : null
		}, {
			coluna: model.colunas.lbcEmail,
			valor: req.body.lbcEmail ? req.body.lbcEmail : null
		}, {
			coluna: model.colunas.comentarios,
			valor: req.body.comentarios ? req.body.comentarios : null
		}, {
			coluna: model.colunas.fkTipoSocietario,
			valor: req.body.fkTipoSocietario ? Number(req.body.fkTipoSocietario) : null
		}, {
			coluna: model.colunas.fkStatus,
			valor: req.body.fkStatus ? Number(req.body.fkStatus) : null
		}, {
			coluna: model.colunas.fkAliquota,
			valor: req.body.fkAliquota ? Number(req.body.fkAliquota) : null
		}, {
			coluna: model.colunas.fkPais,
			valor: req.body.fkPais ? Number(req.body.fkPais) : null
		}];

		model.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				// Se foi enviado junto a request de inserir uma empresa uma lista de ids de obrigações,
				//  é preciso inserir registros na tabela de vínculo entre empresa e obrigação acessória
				if (req.body.obrigacoes) {
					var idEmpresa = req.params.idRegistro;
					var oObrigacoes = JSON.parse(req.body.obrigacoes);

					vincularObrigacoes(idEmpresa, oObrigacoes);
				}

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
		var sStatement = 
			'select empresa.*, pais.*, dominioPais.*, status.*,'
			+ 'aliquota."id_aliquota", aliquota."nome" "nome_aliquota", aliquota."valor", aliquota."data_inicio", aliquota."data_fim", aliquota."fk_dominio_aliquota_tipo.id_dominio_aliquota_tipo", '
			+ 'societario."id_dominio_empresa_tipo_societario", societario."tipo_societario" '
			+ 'from "VGT.EMPRESA" empresa '
			+ 'left outer join "VGT.PAIS" pais '
			+ 'on empresa."fk_pais.id_pais" = pais."id_pais" '
			+ 'left outer join "VGT.DOMINIO_PAIS" dominioPais '
			+ 'on pais."fk_dominio_pais.id_dominio_pais" = dominioPais."id_dominio_pais" '
			+ 'left outer join "VGT.DOMINIO_EMPRESA_STATUS" status '
			+ 'on empresa."fk_dominio_empresa_status.id_dominio_empresa_status" = status."id_dominio_empresa_status" '
			+ 'left outer join "VGT.DOMINIO_EMPRESA_TIPO_SOCIETARIO" societario '
			+ 'on empresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" = societario."id_dominio_empresa_tipo_societario" '
			+ 'left outer join "VGT.ALIQUOTA" aliquota '
			+ 'on empresa."fk_aliquota.id_aliquota" = aliquota."id_aliquota" ';
			
		var oWhere = [];
		var aParams = [];

		if (req.query.idRegistro) {
			oWhere.push(' empresa."id_empresa" = ? ');
			aParams.push(req.query.idRegistro);
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
		
		sStatement += ' Order By empresa."nome"';

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

function pegarNumeroOrdemPeriodoCorrente(iAnoCorrente) {
	var oDataCorrente = new Date(),
		iNumeroOrdemPeriodoCorrente = -1;
	
	if (oDataCorrente >= (new Date(iAnoCorrente, 0, 1)) 
		&& oDataCorrente <= (new Date(iAnoCorrente, 2, 31))) {
		iNumeroOrdemPeriodoCorrente = 1;
	}
	else if (oDataCorrente >= (new Date(iAnoCorrente, 3, 1)) 
		&& oDataCorrente <= (new Date(iAnoCorrente, 5, 30))) {
		iNumeroOrdemPeriodoCorrente = 2;
	}
	else if (oDataCorrente >= (new Date(iAnoCorrente, 6, 1)) 
		&& oDataCorrente <= (new Date(iAnoCorrente, 8, 30))) {
		iNumeroOrdemPeriodoCorrente = 3;
	}
	else if (oDataCorrente >= (new Date(iAnoCorrente, 9, 1)) 
		&& oDataCorrente <= (new Date(iAnoCorrente, 11, 31))) {
		iNumeroOrdemPeriodoCorrente = 4;
	}
	
	return iNumeroOrdemPeriodoCorrente;
}

function vincularPeriodos(sIdEmpresa) {
	// Pega o ano corrente e o numero de ordem do período corrente
	var iAnoCorrente = (new Date()).getFullYear();
	var iNumeroOrdemPeriodoCorrente = pegarNumeroOrdemPeriodoCorrente(iAnoCorrente);
	
	var sQuery, aParams, result;
	
	// Vincular períodos do TTC ---------------------------------------
	
	// Seleciona todos os periodos vinculados ao TTC
	sQuery = 
		'select * from "VGT.PERIODO" periodo '
		+ 'inner join "VGT.DOMINIO_ANO_CALENDARIO" anoCalendario  '
		+ 'on periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = anoCalendario."id_dominio_ano_calendario" '
		+ 'where "fk_dominio_modulo.id_dominio_modulo" = 1';
	
	result = model.executeSync(sQuery);
	
	if (result && result.length > 0) {
		// Percorre todos os periodos
		for (var i = 0, length = result.length; i < length; i++) {
			var oPeriodo = result[i];
			
			// Adiciona um relacionamento do periodo com a empresa
			sQuery = 'insert into "VGT.REL_EMPRESA_PERIODO"("fk_empresa.id_empresa", "fk_periodo.id_periodo", "ind_ativo", "ind_enviado") values(?, ?, ?, ?)';
			
			// Seta a flag de periodo ativo caso o ano calendario e o numero de ordem do periodo sejam iguais ao corrente
			if (oPeriodo.ano_calendario === iAnoCorrente && oPeriodo.numero_ordem === iNumeroOrdemPeriodoCorrente) {
				aParams = [sIdEmpresa, oPeriodo.id_periodo, true, false];
			}
			else {
				aParams = [sIdEmpresa, oPeriodo.id_periodo, false, false];
			}
			
			model.executeSync(sQuery, aParams);
		}
	}
	
	// Vincular períodos do TAX PACKAGE -------------------------------------
	
	// Recupera o numero de anos calendarios cadastrados
	sQuery = 'select count(*) "qte_ano" from "VGT.DOMINIO_ANO_CALENDARIO"';
	
	result = model.executeSync(sQuery);
	
	if (result) {
		var iQteAnoCalendario = result[0]["qte_ano"];
		
		// Seleciona todos os periodos vinculados ao TAX PACKAGE
		sQuery = 
			'select * from "VGT.PERIODO" periodo '
			+ 'inner join "VGT.DOMINIO_ANO_CALENDARIO" anoCalendario  '
			+ 'on periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = anoCalendario."id_dominio_ano_calendario" '
			+ 'where "fk_dominio_modulo.id_dominio_modulo" = 2';
		result = model.executeSync(sQuery);
		var aPeriodo = result;
		
		// Percorre todos os IDs de ano calendario
		for (var i = 1; i <= iQteAnoCalendario; i++) {
			
			// Insere um tax package vinculado ao ano calendario e a empresa
			sQuery = 'insert into "VGT.TAX_PACKAGE"("id_tax_package", "fk_empresa.id_empresa", "fk_dominio_moeda.id_dominio_moeda") values("identity_VGT.TAX_PACKAGE_id_tax_package".nextval, ?, null)';
			aParams = [sIdEmpresa];
			
			result = model.executeSync(sQuery, aParams);
			
			if (result === 1) {
				
				// Recupera o id do tax package recem adicionado
				sQuery = 'select MAX("id_tax_package") "generated_id" from "VGT.TAX_PACKAGE"';
				
				result = model.executeSync(sQuery);
				
				var sIdTaxPackage = result[0].generated_id;
				
				// Pega todos os periodos que tenham relacionamento com o ano calendario
				var aPeriodoAno = aPeriodo.filter(function (obj) {
					return obj["fk_dominio_ano_calendario.id_dominio_ano_calendario"] === i;	
				});
				
				for (var j = 0, length = aPeriodoAno.length; j < length; j++) {
					
					var oPeriodo = aPeriodoAno[j];
					
					// Adiciona um relacionamento entre o tax package recem adicionado e o periodo
					sQuery = 'insert into "VGT.REL_TAX_PACKAGE_PERIODO"("id_rel_tax_package_periodo", "fk_tax_package.id_tax_package", "fk_periodo.id_periodo", "ind_ativo", "status_envio", "data_envio") '
							+ 'values("identity_VGT.REL_TAX_PACKAGE_PERIODO_id_rel_tax_package_periodo".nextval, ?, ?, ?, 1, null)';
					aParams = [sIdTaxPackage, oPeriodo.id_periodo];
					
					// Seta a flag de periodo ativo caso o ano calendario e o numero de ordem do periodo sejam iguais ao corrente
					if (oPeriodo.ano_calendario === iAnoCorrente && oPeriodo.numero_ordem === iNumeroOrdemPeriodoCorrente) {
						aParams = [sIdTaxPackage, oPeriodo.id_periodo, true];
					}
					else {
						aParams = [sIdTaxPackage, oPeriodo.id_periodo, false];
					}
					
					model.executeSync(sQuery, aParams);
				}
			}	
		}
	}
}

function vincularObrigacoes(sIdEmpresa, oObrigacoes) {
	if (oObrigacoes) {
		if (oObrigacoes.inserir && oObrigacoes.inserir.length > 0) {
			for (let i = 0; i < oObrigacoes.inserir.length; i++) {
				modelRelEmpresaObrigacao.inserir([{
					coluna: modelRelEmpresaObrigacao.colunas.id
				}, {
					coluna: modelRelEmpresaObrigacao.colunas.fkEmpresa,
					valor: sIdEmpresa
				}, {
					coluna: modelRelEmpresaObrigacao.colunas.fkObrigacaoAcessoria,
					valor: oObrigacoes.inserir[i]
				}, {
					coluna: modelRelEmpresaObrigacao.colunas.dataInicio,
					valor: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate()
				}]);
			}
		}

		if (oObrigacoes.remover && oObrigacoes.remover.length > 0) {
			for (let j = 0; j < oObrigacoes.remover.length; j++) {
				var oCondition = [{
					coluna: modelRelEmpresaObrigacao.colunas.fkEmpresa,
					valor: sIdEmpresa
				}, {
					coluna: modelRelEmpresaObrigacao.colunas.fkObrigacaoAcessoria,
					valor: oObrigacoes.remover[j]
				}, {
					coluna: modelRelEmpresaObrigacao.colunas.indicadorHistorico,
					valor: false
				}];

				modelRelEmpresaObrigacao.listar(oCondition, function (err, result) {
					if (!err) {
						var aParams = [{
							coluna: modelRelEmpresaObrigacao.colunas.fkEmpresa,
							valor: sIdEmpresa
						}, {
							coluna: modelRelEmpresaObrigacao.colunas.fkObrigacaoAcessoria,
							valor: result[0]["fk_obrigacao_acessoria.id_obrigacao_acessoria"]
						}, {
							coluna: modelRelEmpresaObrigacao.colunas.dataInicio,
							valor: result[0].data_inicio
						}, {
							coluna: modelRelEmpresaObrigacao.colunas.dataFim,
							valor: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate()
						}, {
							coluna: modelRelEmpresaObrigacao.colunas.indicadorHistorico,
							valor: true
						}];

						modelRelEmpresaObrigacao.atualizar({
							coluna: modelRelEmpresaObrigacao.colunas.id,
							valor: result[0].id
						}, aParams);
					}
				});
			}
		}
	}
}