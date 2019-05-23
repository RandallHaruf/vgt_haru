"use strict";

var db = require("../db");
var model = require("../models/modelPagamento");

function isNumber (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function inserirLoteDePagamento (oConnection, aPagamentos, sIdEmpresa, sIdPeriodo, req) {
	// Exclui todos os name of tax NÃO DEFAULT associados aos pagamentos
	var aParams = [sIdEmpresa, sIdPeriodo],
		sQuery = 'delete from "VGT.NAME_OF_TAX"  '
				+ 'where ' 
				+ '"id_name_of_tax" in ' 
				+ '(select "fk_name_of_tax.id_name_of_tax" from "VGT.PAGAMENTO" where "fk_empresa.id_empresa" = ? and "fk_periodo.id_periodo" = ?) ' 
				+ 'and "ind_default" = false';

	model.executeSync(sQuery, aParams, { connection: oConnection, idUsuario: req });

	// Exclui todos os pagamentos dessa empresa neste periodo
	sQuery = 'delete from "VGT.PAGAMENTO" where "fk_empresa.id_empresa" = ? and "fk_periodo.id_periodo" = ?';

	model.executeSync(sQuery, aParams, { connection: oConnection, idUsuario: req });

	// Percorre cada pagamento enviado
	for (var i = 0; i < aPagamentos.length; i++) {
		var oPagamento = aPagamentos[i];
		
		var idNameOfTax = null;
		var bCriarNameOfTax = false;
		
		// Se o fk do name_of_tax for valido
		if (oPagamento[model.colunas.fkNameOfTax.nome]) {
			// Faz uma consulta na tabela de name_of_tax
			var sStm = 'select * from "VGT.NAME_OF_TAX" where "id_name_of_tax" = ?',
				aParameters = [oPagamento[model.colunas.fkNameOfTax.nome]];
				
			var result1 = model.executeSync(sStm, aParameters, { connection: oConnection, idUsuario: req });
			
			// Caso este ID exista..
			if (result1 && result1.length > 0) {
				// Significa que é um name_of_tax default e será usado neste pagamento
				idNameOfTax = oPagamento[model.colunas.fkNameOfTax.nome];
			}
			else {
				// Se não, é um name_of_tax não default que deve ser criado
				bCriarNameOfTax = true;
			}
		}
		else {
			// Se não, é um name_of_tax não default que deve ser criado
			bCriarNameOfTax = true;
		}
		
		// Caso o name_of_tax seja não default
		if (bCriarNameOfTax) {
			// Cria um registro com ind_default setado para false
			var sStm2 = 'insert into "VGT.NAME_OF_TAX"("id_name_of_tax", "name_of_tax", "fk_tax.id_tax", "ind_default") '
						+ 'values("identity_VGT.NAME_OF_TAX_id_name_of_tax".nextval, ?, ?, false)',
				aParameters2 = [oPagamento.name_of_tax, oPagamento["fk_tax.id_tax"]];
			
			var result2 = model.executeSync(sStm2, aParameters2, { connection: oConnection, idUsuario: req });
				
			// Se a inserção ocorreu com sucesso
			if (isNumber(result2) && Number(result2) === 1) {
				// Recupera qual foi o ultimo id gerado
				var sGeneratedId = 'select MAX("id_name_of_tax") "generated_id" from "VGT.NAME_OF_TAX"';
				
				var result3 = model.executeSync(sGeneratedId, [], { connection: oConnection, idUsuario: req });
				if (result3) {
					// Este ID será usado como id de name_of_Tax do pagamento corrente
					idNameOfTax = result3[0].generated_id;		
				}
			}
		}
		
		// Insere o novo pagamento
		model.inserirSync([{
			// 10/04/19 @pedsf - Foi preciso "sobrescrever" a coluna de id que estava sendo passada ao método inserir,
			// para ser capaz de gerar um comando de insert que persista o registro com uma PK de valor previamente conhecido, ao invés de 
			// um novo através do sequenciador. Isso permite que para pagamentos que ja foram inseridos alguma vez o seu ID seja mantido.
			// Ao chegar neste ponto da request, os objetos de pagamentos que já foram persistidos em algum momento conhecem
			// o seu ID original (ou seja, valor diferente de -1), o que significa que é preciso desabilitar o comportamento
			// padrão de disparo de sequence e utilizar efetivamente a proprieadade "valor" passada pelo objeto coluna.
			// Esta mudança foi necessária ao perceber que pagamentos vínculados a antecipações do TAX PACKAGE precisam manter seus IDs
			// para que a referência da antecipação não seja perdida.
			coluna: { 
				nome: model.colunas.id.nome,
				identity: (Number(oPagamento[model.colunas.id.nome]) === -1)
			},
			valor: oPagamento[model.colunas.id.nome]
		}, {
			coluna: model.colunas.indNaoAplicavel,
			valor: oPagamento[model.colunas.indNaoAplicavel.nome] ? oPagamento[model.colunas.indNaoAplicavel.nome] : false
		}, {
			coluna: model.colunas.administracaoGovernamental,
			valor: oPagamento[model.colunas.administracaoGovernamental.nome] ? oPagamento[model.colunas.administracaoGovernamental.nome] : null
		}, {
			coluna: model.colunas.estado,
			valor: oPagamento[model.colunas.estado.nome] ? oPagamento[model.colunas.estado.nome] : null
		}, {
			coluna: model.colunas.cidade,
			valor: oPagamento[model.colunas.cidade.nome] ? oPagamento[model.colunas.cidade.nome] : null
		}, {
			coluna: model.colunas.projeto,
			valor: oPagamento[model.colunas.projeto.nome] ? oPagamento[model.colunas.projeto.nome] : null
		}, {
			coluna: model.colunas.descricao,
			valor: oPagamento[model.colunas.descricao.nome] ? oPagamento[model.colunas.descricao.nome] : null
		}, {
			coluna: model.colunas.dataPagamento,
			valor: oPagamento[model.colunas.dataPagamento.nome] ? oPagamento[model.colunas.dataPagamento.nome] : null
		}, {
			coluna: model.colunas.tipoTransacaoOutros,
			valor: oPagamento[model.colunas.tipoTransacaoOutros.nome] ? oPagamento[model.colunas.tipoTransacaoOutros.nome] : null
		}, {
			coluna: model.colunas.principal,
			valor: oPagamento[model.colunas.principal.nome] ? oPagamento[model.colunas.principal.nome] : null
		}, {
			coluna: model.colunas.juros,
			valor: oPagamento[model.colunas.juros.nome] ? oPagamento[model.colunas.juros.nome] : null
		}, {
			coluna: model.colunas.multa,
			valor: oPagamento[model.colunas.multa.nome] ? oPagamento[model.colunas.multa.nome] : null
		}, {
			coluna: model.colunas.total,
			valor: oPagamento[model.colunas.total.nome] ? oPagamento[model.colunas.total.nome] : null
		}, {
			coluna: model.colunas.numeroDocumento,
			valor: oPagamento[model.colunas.numeroDocumento.nome] ? oPagamento[model.colunas.numeroDocumento.nome] : null
		}, {
			coluna: model.colunas.entidadeBeneficiaria,
			valor: oPagamento[model.colunas.entidadeBeneficiaria.nome] ? oPagamento[model.colunas.entidadeBeneficiaria.nome] : null
		}, {
			coluna: model.colunas.fkMoeda,
			valor: oPagamento[model.colunas.fkMoeda.nome] ? oPagamento[model.colunas.fkMoeda.nome] : null
		}, {
			coluna: model.colunas.fkTipoTransacao,
			valor: oPagamento[model.colunas.fkTipoTransacao.nome] ? oPagamento[model.colunas.fkTipoTransacao.nome] : null
		}, {
			coluna: model.colunas.fkAnoFiscal,
			valor: oPagamento[model.colunas.fkAnoFiscal.nome] ? oPagamento[model.colunas.fkAnoFiscal.nome] : null
		}, {
			coluna: model.colunas.fkJurisdicao,
			valor: oPagamento[model.colunas.fkJurisdicao.nome] ? oPagamento[model.colunas.fkJurisdicao.nome] : null
		}, {
			coluna: model.colunas.fkPais,
			valor: oPagamento[model.colunas.fkPais.nome] ? oPagamento[model.colunas.fkPais.nome] : null
		}, {
			coluna: model.colunas.fkNameOfTax,
			valor: idNameOfTax
		}, {
			coluna: model.colunas.fkEmpresa,
			valor: oPagamento[model.colunas.fkEmpresa.nome] ? oPagamento[model.colunas.fkEmpresa.nome] : null
		}, {
			coluna: model.colunas.fkPeriodo,
			valor: oPagamento[model.colunas.fkPeriodo.nome] ? oPagamento[model.colunas.fkPeriodo.nome] : null
		}], { connection: oConnection, idUsuario: req });
	}
}

module.exports = {

	listarRegistros: function (req, res) {
		var aParams = [];

		if (req.query.empresa) {
			aParams.push({
				coluna: model.colunas.fkEmpresa,
				valor: req.query.empresa
			});
		}

		if (req.query.periodo) {
			aParams.push({
				coluna: model.colunas.fkPeriodo,
				valor: req.query.periodo
			});
		}

		model.listar(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	criarRegistro: function (req, res) {
		if (req.body.pagamentos) {
			var sIdEmpresa = req.body.empresa,
				sIdPeriodo = req.body.periodo,
				aPagamentos = JSON.parse(req.body.pagamentos);

			var response = {
				success: true
			};
			
			var oConnection;

			try {
				oConnection = db.getConnection();
				oConnection.setAutoCommit(false);
				
				inserirLoteDePagamento(oConnection, aPagamentos, sIdEmpresa, sIdPeriodo, req);
			
				oConnection.commit();
			} catch (e) {
				console.log(e);
				response.success = false;
				response.error = e;
				if (oConnection) {
					oConnection.rollback();
				}
			} finally {
				if (oConnection) {
					oConnection.setAutoCommit(true);
					oConnection.close();
				}
			}

			res.send(JSON.stringify(response));
		} else {
			var aParams = [{
				coluna: model.colunas.id
			}, {
				coluna: model.colunas.indNaoAplicavel,
				valor: req.body.indNaoAplicavel ? req.body.indNaoAplicavel : null
			}, {
				coluna: model.colunas.administracaoGovernamental,
				valor: req.body.administracaoGovernamental ? req.body.administracaoGovernamental : null
			}, {
				coluna: model.colunas.estado,
				valor: req.body.estado ? req.body.estado : null
			}, {
				coluna: model.colunas.cidade,
				valor: req.body.cidade ? req.body.cidade : null
			}, {
				coluna: model.colunas.projeto,
				valor: req.body.projeto ? req.body.projeto : null
			}, {
				coluna: model.colunas.descricao,
				valor: req.body.descricao ? req.body.descricao : null
			}, {
				coluna: model.colunas.dataPagamento,
				valor: req.body.dataPagamento ? req.body.dataPagamento : null
			}, {
				coluna: model.colunas.tipoTransacaoOutros,
				valor: req.body.tipoTransacaoOutros ? req.body.tipoTransacaoOutros : null
			}, {
				coluna: model.colunas.principal,
				valor: req.body.principal ? Number(req.body.principal) : null
			}, {
				coluna: model.colunas.juros,
				valor: req.body.juros ? Number(req.body.juros) : null
			}, {
				coluna: model.colunas.multa,
				valor: req.body.multa ? Number(req.body.multa) : null
			}, {
				coluna: model.colunas.total,
				valor: req.body.total ? Number(req.body.total) : null
			}, {
				coluna: model.colunas.numeroDocumento,
				valor: req.body.numeroDocumento ? req.body.numeroDocumento : null
			}, {
				coluna: model.colunas.entidadeBeneficiaria,
				valor: req.body.entidadeBeneficiaria ? req.body.entidadeBeneficiaria : null
			}, {
				coluna: model.colunas.fkMoeda,
				valor: req.body.fkMoeda ? Number(req.body.fkMoeda) : null
			}, {
				coluna: model.colunas.fkTipoTransacao,
				valor: req.body.fkTipoTransacao ? Number(req.body.fkTipoTransacao) : null
			}, {
				coluna: model.colunas.fkAnoFiscal,
				valor: req.body.fkAnoFiscal ? Number(req.body.fkAnoFiscal) : null
			}, {
				coluna: model.colunas.fkJurisdicao,
				valor: req.body.fkJurisdicao ? Number(req.body.fkJurisdicao) : null
			}, {
				coluna: model.colunas.fkPais,
				valor: req.body.fkPais ? Number(req.body.fkPais) : null
			}, {
				coluna: model.colunas.fkNameOfTax,
				valor: req.body.fkNameOfTax ? Number(req.body.fkNameOfTax) : null
			}, {
				coluna: model.colunas.fkEmpresa,
				valor: req.body.fkEmpresa ? Number(req.body.fkEmpresa) : null
			}, {
				coluna: model.colunas.fkPeriodo,
				valor: req.body.fkPeriodo ? Number(req.body.fkPeriodo) : null
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
		}
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
			coluna: model.colunas.indNaoAplicavel,
			valor: req.body.indNaoAplicavel ? req.body.indNaoAplicavel : null
		}, {
			coluna: model.colunas.administracaoGovernamental,
			valor: req.body.administracaoGovernamental ? req.body.administracaoGovernamental : null
		}, {
			coluna: model.colunas.estado,
			valor: req.body.estado ? req.body.estado : null
		}, {
			coluna: model.colunas.cidade,
			valor: req.body.cidade ? req.body.cidade : null
		}, {
			coluna: model.colunas.projeto,
			valor: req.body.projeto ? req.body.projeto : null
		}, {
			coluna: model.colunas.descricao,
			valor: req.body.descricao ? req.body.descricao : null
		}, {
			coluna: model.colunas.dataPagamento,
			valor: req.body.dataPagamento ? req.body.dataPagamento : null
		}, {
			coluna: model.colunas.tipoTransacaoOutros,
			valor: req.body.tipoTransacaoOutros ? req.body.tipoTransacaoOutros : null
		}, {
			coluna: model.colunas.principal,
			valor: req.body.principal ? Number(req.body.principal) : null
		}, {
			coluna: model.colunas.juros,
			valor: req.body.juros ? Number(req.body.juros) : null
		}, {
			coluna: model.colunas.multa,
			valor: req.body.multa ? Number(req.body.multa) : null
		}, {
			coluna: model.colunas.total,
			valor: req.body.total ? Number(req.body.total) : null
		}, {
			coluna: model.colunas.numeroDocumento,
			valor: req.body.numeroDocumento ? req.body.numeroDocumento : null
		}, {
			coluna: model.colunas.entidadeBeneficiaria,
			valor: req.body.entidadeBeneficiaria ? req.body.entidadeBeneficiaria : null
		}, {
			coluna: model.colunas.fkMoeda,
			valor: req.body.fkMoeda ? Number(req.body.fkMoeda) : null
		}, {
			coluna: model.colunas.fkTipoTransacao,
			valor: req.body.fkTipoTransacao ? Number(req.body.fkTipoTransacao) : null
		}, {
			coluna: model.colunas.fkAnoFiscal,
			valor: req.body.fkAnoFiscal ? Number(req.body.fkAnoFiscal) : null
		}, {
			coluna: model.colunas.fkJurisdicao,
			valor: req.body.fkJurisdicao ? Number(req.body.fkJurisdicao) : null
		}, {
			coluna: model.colunas.fkPais,
			valor: req.body.fkPais ? Number(req.body.fkPais) : null
		}, {
			coluna: model.colunas.fkNameOfTax,
			valor: req.body.fkNameOfTax ? Number(req.body.fkNameOfTax) : null
		}, {
			coluna: model.colunas.fkEmpresa,
			valor: req.body.fkEmpresa ? Number(req.body.fkEmpresa) : null
		}, {
			coluna: model.colunas.fkPeriodo,
			valor: req.body.fkPeriodo ? Number(req.body.fkPeriodo) : null
		}, {
			isIdLog: true,
			valor: req
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
			'select * '
			+ 'from "VGT.PAGAMENTO" pagamento '
			+ 'left outer join "VGT.NAME_OF_TAX" nameOfTax '
			+ 'on pagamento."fk_name_of_tax.id_name_of_tax" = nameOfTax."id_name_of_tax" '
			+ 'left outer join "VGT.TAX" tax '
			+ 'on nameOfTax."fk_tax.id_tax" = tax."id_tax" '
			+ 'left outer join "VGT.TAX_CATEGORY" category '
			+ 'on tax."fk_category.id_tax_category" = category."id_tax_category" ';
			
		if (req.query.full) {
			sStatement = 
				'select * '
				+ 'from "VGT.PAGAMENTO" pagamento '
				+ 'left outer join "VGT.DOMINIO_MOEDA" moeda '
				+ 'on pagamento."fk_dominio_moeda.id_dominio_moeda" = moeda."id_dominio_moeda" '
				+ 'left outer join "VGT.DOMINIO_TIPO_TRANSACAO" transacao '
				+ 'on pagamento."fk_dominio_tipo_transacao.id_dominio_tipo_transacao" = transacao."id_dominio_tipo_transacao" '
				+ 'left outer join "VGT.DOMINIO_ANO_FISCAL" anoFiscal '
				+ 'on pagamento."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" = anoFiscal."id_dominio_ano_fiscal" '
				+ 'left outer join "VGT.DOMINIO_JURISDICAO" jurisdicao  '
				+ 'on pagamento."fk_jurisdicao.id_dominio_jurisdicao" = jurisdicao."id_dominio_jurisdicao" '
				+ 'left outer join "VGT.DOMINIO_PAIS" pais '
				+ 'on pagamento."fk_dominio_pais.id_dominio_pais" = pais."id_dominio_pais" '
				+ 'left outer join "VGT.NAME_OF_TAX" nameOfTax '
				+ 'on pagamento."fk_name_of_tax.id_name_of_tax" = nameOfTax."id_name_of_tax" '
				+ 'left outer join "VGT.TAX" tax '
				+ 'on nameOfTax."fk_tax.id_tax" = tax."id_tax" '
				+ 'left outer join "VGT.TAX_CATEGORY" category  '
				+ 'on tax."fk_category.id_tax_category" = category."id_tax_category" '
				+ 'left outer join "VGT.EMPRESA" empresa '
				+ 'on pagamento."fk_empresa.id_empresa" = empresa."id_empresa" '
				+ 'left outer join "VGT.PERIODO" periodo '
				+ 'on pagamento."fk_periodo.id_periodo" = periodo."id_periodo" ';
		}
			
		var oWhere = [];
		var aParams = [];
		
		if (req.query.empresa) {
			oWhere.push(' pagamento."fk_empresa.id_empresa" = ? ');
			aParams.push(req.query.empresa);
		}
		
		if (req.query.periodo) {
			oWhere.push(' pagamento."fk_periodo.id_periodo" = ? ');
			aParams.push(req.query.periodo);
		}
		
		if (req.query.tax_classification) {
			oWhere.push(' category."fk_dominio_tax_classification.id_dominio_tax_classification" = ? ');
			aParams.push(req.query.tax_classification);
		}
		
		if (req.query.taxIsExportavelTaxPackage) {
			oWhere.push(' tax."ind_exportavel_tax_package" = ? ');
			aParams.push(req.query.taxIsExportavelTaxPackage);
		}
		
		if (req.query.anoFiscal) {
			oWhere.push(' pagamento."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" = ? ');
			aParams.push(req.query.anoFiscal);
		}
		
		if(req.query.filtrarPrincipalPositivo){
			oWhere.push(' pagamento."principal" > ?');
			aParams.push(0);
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
		sStatement += ' order by pagamento."data_pagamento" desc ';
		model.execute({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				for (var i = 0, length = result.length; i < length; i++) {
					result[i].ind_nao_aplicavel = result[i].ind_nao_aplicavel ? true : false;
				}
				res.send(JSON.stringify(result));
			}
		});
	}
};