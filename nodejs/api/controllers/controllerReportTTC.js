"use strict";

var model = require("../models/modelReportTTC");

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
			'SELECT '
			+'tblEmpresa."id_empresa" "tblEmpresa.id_empresa", '
			+'tblEmpresa."nome" "tblEmpresa.nome", '
			+'tblEmpresa."num_hfm_sap" "tblEmpresa.num_hfm_sap", '
			+'tblEmpresa."tin" "tblEmpresa.tin", '
			+'tblEmpresa."jurisdicao_tin" "tblEmpresa.jurisdicao_tin", '
			+'tblEmpresa."ni" "tblEmpresa.ni", '
			+'tblEmpresa."jurisdicao_ni" "tblEmpresa.jurisdicao_ni", '
			+'tblEmpresa."endereco" "tblEmpresa.endereco", '
			+'tblEmpresa."fy_start_date" "tblEmpresa.fy_start_date", '
			+'tblEmpresa."fy_end_date" "tblEmpresa.fy_end_date", '
			+'tblEmpresa."lbc_nome" "tblEmpresa.lbc_nome", '
			+'tblEmpresa."lbc_email" "tblEmpresa.lbc_email", '
			+'tblEmpresa."comentarios" "tblEmpresa.comentarios", '
			+'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario", '
			+'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status", '
			+'tblEmpresa."fk_aliquota.id_aliquota" "tblEmpresa.fk_aliquota.id_aliquota", '
			+'tblEmpresa."fk_pais.id_pais" "tblEmpresa.fk_pais.id_pais", '
			+'tblPagamento."id_pagamento" "tblPagamento.id_pagamento", '
			+'tblPagamento."ind_nao_aplicavel" "tblPagamento.ind_nao_aplicavel", '
			+'tblPagamento."administracao_governamental" "tblPagamento.administracao_governamental", '
			+'tblPagamento."estado" "tblPagamento.estado", '
			+'tblPagamento."cidade" "tblPagamento.cidade", '
			+'tblPagamento."projeto" "tblPagamento.projeto", '
			+'tblPagamento."descricao" "tblPagamento.descricao", '
			+'tblPagamento."data_pagamento" "tblPagamento.data_pagamento", '
			+'tblPagamento."tipo_transacao_outros" "tblPagamento.tipo_transacao_outros", '
			+'tblPagamento."principal" "tblPagamento.principal", '
			+'tblPagamento."juros" "tblPagamento.juros", '
			+'tblPagamento."multa" "tblPagamento.multa", '
			+'tblPagamento."total" "tblPagamento.total", '
			+'tblPagamento."numero_documento" "tblPagamento.numero_documento", '
			+'tblPagamento."entidade_beneficiaria" "tblPagamento.entidade_beneficiaria", '
			+'tblPagamento."fk_dominio_moeda.id_dominio_moeda" "tblPagamento.fk_dominio_moeda.id_dominio_moeda", '
			+'tblPagamento."fk_dominio_tipo_transacao.id_dominio_tipo_transacao" "tblPagamento.fk_dominio_tipo_transacao.id_dominio_tipo_transacao", '
			+'tblPagamento."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" "tblPagamento.fk_dominio_ano_fiscal.id_dominio_ano_fiscal", '
			+'tblPagamento."fk_jurisdicao.id_dominio_jurisdicao" "tblPagamento.fk_jurisdicao.id_dominio_jurisdicao", '
			+'tblPagamento."fk_dominio_pais.id_dominio_pais" "tblPagamento.fk_dominio_pais.id_dominio_pais", '
			+'tblPagamento."fk_name_of_tax.id_name_of_tax" "tblPagamento.fk_name_of_tax.id_name_of_tax", '
			+'tblPagamento."fk_empresa.id_empresa" "tblPagamento.fk_empresa.id_empresa", '
			+'tblPagamento."fk_periodo.id_periodo" "tblPagamento.fk_periodo.id_periodo", '
			+'tblNameOfTax."id_name_of_tax" "tblNameOfTax.id_name_of_tax", '
			+'tblNameOfTax."name_of_tax" "tblNameOfTax.name_of_tax", '
			+'tblNameOfTax."fk_tax.id_tax" "tblNameOfTax.fk_tax.id_tax", '
			+'tblNameOfTax."ind_default" "tblNameOfTax.ind_default", '
			+'tblTax."id_tax" "tblTax.id_tax", '
			+'tblTax."tax" "tblTax.tax", '
			+'tblTax."fk_category.id_tax_category" "tblTax.fk_category.id_tax_category", '
			+'tblTaxCategory."id_tax_category" "tblTaxCategory.id_tax_category", '
			+'tblTaxCategory."category" "tblTaxCategory.category", '
			+'tblTaxCategory."fk_dominio_tax_classification.id_dominio_tax_classification" "tblTaxCategory.fk_dominio_tax_classification.id_dominio_tax_classification", '
			+'tblDominioTaxClassification."id_dominio_tax_classification" "tblDominioTaxClassification.id_dominio_tax_classification", '
			+'tblDominioTaxClassification."classification" "tblDominioTaxClassification.classification", '
			+'tblDominioJurisdicao."id_dominio_jurisdicao" "tblDominioJurisdicao.id_dominio_jurisdicao", '
			+'tblDominioJurisdicao."jurisdicao" "tblDominioJurisdicao.jurisdicao", '
			+'tblDominioPais."id_dominio_pais" "tblDominioPais.id_dominio_pais", '
			+'tblDominioPais."pais" "tblDominioPais.pais", '
			+'tblDominioAnoFiscal."id_dominio_ano_fiscal" "tblDominioAnoFiscal.id_dominio_ano_fiscal", '
			+'tblDominioAnoFiscal."ano_fiscal" "tblDominioAnoFiscal.ano_fiscal", '
			+'tblDominioMoeda."id_dominio_moeda" "tblDominioMoeda.id_dominio_moeda", '
			+'tblDominioMoeda."acronimo" "tblDominioMoeda.acronimo", '
			+'tblDominioMoeda."nome" "tblDominioMoeda.nome", '
			+'tblDominioTipoTransacao."id_dominio_tipo_transacao" "tblDominioTipoTransacao.id_dominio_tipo_transacao", '
			+'tblDominioTipoTransacao."tipo_transacao" "tblDominioTipoTransacao.tipo_transacao", '
			+'TO_NVARCHAR(tblPagamento."total" * tblCambioTTC."cambio_usd",\'00.0000\') "conversao_usd", '
			+'TO_NVARCHAR(tblPagamento."total" * tblCambioTTC."cambio_brl",\'00.0000\') "conversao_brl" '
			+'FROM "VGT.EMPRESA" AS tblEmpresa '
			+'INNER JOIN "VGT.PAGAMENTO" AS tblPagamento ON tblPagamento."fk_empresa.id_empresa" = tblEmpresa."id_empresa" '
			+'INNER JOIN "VGT.NAME_OF_TAX" AS tblNameOfTax ON tblNameOfTax."id_name_of_tax" = tblPagamento."fk_name_of_tax.id_name_of_tax" '
			+'INNER JOIN "VGT.TAX" AS tblTax ON tblTax."id_tax" = tblNameOfTax."fk_tax.id_tax" '
			+'INNER JOIN "VGT.TAX_CATEGORY" AS tblTaxCategory ON tblTaxCategory."id_tax_category" = tblTax."fk_category.id_tax_category" '
			+'INNER JOIN "VGT.DOMINIO_TAX_CLASSIFICATION" AS tblDominioTaxClassification ON tblDominioTaxClassification."id_dominio_tax_classification" = tblTaxCategory."fk_dominio_tax_classification.id_dominio_tax_classification" '
			+'INNER JOIN "VGT.DOMINIO_JURISDICAO" AS tblDominioJurisdicao ON tblDominioJurisdicao."id_dominio_jurisdicao" = tblPagamento."fk_jurisdicao.id_dominio_jurisdicao" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_PAIS" AS tblDominioPais ON tblDominioPais."id_dominio_pais" = tblPagamento."fk_dominio_pais.id_dominio_pais" '
			+'INNER JOIN "VGT.DOMINIO_ANO_FISCAL" AS tblDominioAnoFiscal ON tblDominioAnoFiscal."id_dominio_ano_fiscal" = tblPagamento."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" '
			+'INNER JOIN "VGT.DOMINIO_MOEDA" AS tblDominioMoeda ON tblDominioMoeda."id_dominio_moeda" = tblPagamento."fk_dominio_moeda.id_dominio_moeda" '
			+'INNER JOIN "VGT.DOMINIO_TIPO_TRANSACAO" AS tblDominioTipoTransacao ON tblDominioTipoTransacao."id_dominio_tipo_transacao" = tblPagamento."fk_dominio_tipo_transacao.id_dominio_tipo_transacao"'
			+'LEFT OUTER JOIN "VGT.CAMBIO_TTC" AS tblCambioTTC ON tblCambioTTC."data" = tblPagamento."data_pagamento" and tblCambioTTC."fk_dominio_moeda.id_dominio_moeda" = tblPagamento."fk_dominio_moeda.id_dominio_moeda"';
	
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];

		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};

		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/ req.session.usuario.empresas.length > 0){
			var aEmpresas = req.session.usuario.empresas;
			if (aEntrada[12] === null){
				aEntrada[12] = [];
			}
			for(var j = 0; j < req.session.usuario.empresas.length;j++){
				aEntrada[12].push(JSON.stringify(aEmpresas[j]));
			}
		}

		for (var i = 0; i < aEntrada.length; i++) {
			filtro = "";			
			if (aEntrada[i] !== null){
				stringtemporaria = "";
				for (var k = 0; k < aEntrada[i].length; k++) {
					switch (i){
						case 0:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;
						case 1:
							filtro = ' tblDominioTaxClassification."id_dominio_tax_classification" = ? ';
							break;
						case 2:
							filtro = ' tblTaxCategory."id_tax_category" = ? ';
							break;
						case 3:
							filtro = ' tblTax."id_tax" = ? ';
							break;
						case 4:
							filtro = ' tblNameOfTax."id_name_of_tax" = ? ';
							break;
						case 5:
							filtro = ' tblDominioJurisdicao."id_dominio_jurisdicao" = ? ';
							break;
						case 6:
							filtro = ' tblDominioPais."id_dominio_pais" = ? ';
							break;
						case 7:
							filtro = ' tblDominioAnoFiscal."id_dominio_ano_fiscal" = ? ';
							break;
						case 8:
							filtro = ' tblDominioMoeda."id_dominio_moeda" = ? ';
							break;
						case 9:
							filtro = ' tblDominioTipoTransacao."id_dominio_tipo_transacao" = ? ';
							break;
						case 10:
							filtro = ' tblPagamento."data_pagamento" >= ? ';
							break;	
						case 11:
							filtro = ' tblPagamento."data_pagamento" <= ? ';
							break;	
						case 12:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;							
					}
					if(aEntrada[i].length == 1){
						oWhere.push(filtro);
						aParams.push(aEntrada[i][k]);								
					}	 
					else{
						k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
						aParams.push(aEntrada[i][k]);
					}
				}	
			}
		}

		if (oWhere.length > 0) {
			sStatement += " where";

			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}
		sStatement+=' order by tblEmpresa."id_empresa", tblDominioTaxClassification."classification" , tblTaxCategory."category" ';
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
	},
	
	deepQueryDistinct: function (req, res) { 
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var stringDistinct = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];

		switch(aEntrada[13][0]){
			case "tblEmpresa.nome":
				stringDistinct = 'Select distinct "tblEmpresa.nome", "tblEmpresa.id_empresa" from (';
				break;			
			case "tblDominioTaxClassification.classification":
				stringDistinct = 'Select distinct "tblDominioTaxClassification.id_dominio_tax_classification", "tblDominioTaxClassification.classification" from (';
				break;
			case "tblTaxCategory.category":
				stringDistinct = 'Select distinct "tblTaxCategory.id_tax_category", "tblTaxCategory.category" from (';
				break;	
			case "tblTax.tax":
				stringDistinct = 'Select distinct "tblTax.id_tax", "tblTax.tax" from (';
				break;	
			case "tblNameOfTax.name_of_tax":
				stringDistinct = 'Select distinct "tblNameOfTax.id_name_of_tax" , "tblNameOfTax.name_of_tax" from (';
				break;	
			case "tblDominioJurisdicao.jurisdicao":
				stringDistinct = 'Select distinct "tblDominioJurisdicao.id_dominio_jurisdicao" , "tblDominioJurisdicao.jurisdicao" from (';
				break;		
			case "tblDominioPais.pais":
				stringDistinct = 'Select distinct "tblDominioPais.id_dominio_pais", "tblDominioPais.pais" from (';
				break;					
			case "tblDominioAnoFiscal.ano_fiscal":
				stringDistinct = 'Select distinct "tblDominioAnoFiscal.id_dominio_ano_fiscal", "tblDominioAnoFiscal.ano_fiscal" from (';
				break;	
			case "tblPagamento.data_pagamento":
				stringDistinct = 'Select distinct min("tblPagamento.data_pagamento") "min(tblPagamento.data_pagamento)", max("tblPagamento.data_pagamento") "max(tblPagamento.data_pagamento)" from (';
				break;	
			case "tblDominioMoeda.acronimo":
				stringDistinct = 'Select distinct "tblDominioMoeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome" from (';
				break;
			case "tblDominioTipoTransacao.tipo_transacao":
				stringDistinct = 'Select distinct "tblDominioTipoTransacao.id_dominio_tipo_transacao" , "tblDominioTipoTransacao.tipo_transacao" from (';
				break;				
		}
		
		var sStatement = 
			stringDistinct
			+'SELECT '
			+'tblEmpresa."id_empresa" "tblEmpresa.id_empresa", '
			+'tblEmpresa."nome" "tblEmpresa.nome", '
			+'tblEmpresa."num_hfm_sap" "tblEmpresa.num_hfm_sap", '
			+'tblEmpresa."tin" "tblEmpresa.tin", '
			+'tblEmpresa."jurisdicao_tin" "tblEmpresa.jurisdicao_tin", '
			+'tblEmpresa."ni" "tblEmpresa.ni", '
			+'tblEmpresa."jurisdicao_ni" "tblEmpresa.jurisdicao_ni", '
			+'tblEmpresa."endereco" "tblEmpresa.endereco", '
			+'tblEmpresa."fy_start_date" "tblEmpresa.fy_start_date", '
			+'tblEmpresa."fy_end_date" "tblEmpresa.fy_end_date", '
			+'tblEmpresa."lbc_nome" "tblEmpresa.lbc_nome", '
			+'tblEmpresa."lbc_email" "tblEmpresa.lbc_email", '
			+'tblEmpresa."comentarios" "tblEmpresa.comentarios", '
			+'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario", '
			+'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status", '
			+'tblEmpresa."fk_aliquota.id_aliquota" "tblEmpresa.fk_aliquota.id_aliquota", '
			+'tblEmpresa."fk_pais.id_pais" "tblEmpresa.fk_pais.id_pais", '
			+'tblPagamento."id_pagamento" "tblPagamento.id_pagamento", '
			+'tblPagamento."ind_nao_aplicavel" "tblPagamento.ind_nao_aplicavel", '
			+'tblPagamento."administracao_governamental" "tblPagamento.administracao_governamental", '
			+'tblPagamento."estado" "tblPagamento.estado", '
			+'tblPagamento."cidade" "tblPagamento.cidade", '
			+'tblPagamento."projeto" "tblPagamento.projeto", '
			+'tblPagamento."descricao" "tblPagamento.descricao", '
			+'tblPagamento."data_pagamento" "tblPagamento.data_pagamento", '
			+'tblPagamento."tipo_transacao_outros" "tblPagamento.tipo_transacao_outros", '
			+'tblPagamento."principal" "tblPagamento.principal", '
			+'tblPagamento."juros" "tblPagamento.juros", '
			+'tblPagamento."multa" "tblPagamento.multa", '
			+'tblPagamento."total" "tblPagamento.total", '
			+'tblPagamento."numero_documento" "tblPagamento.numero_documento", '
			+'tblPagamento."entidade_beneficiaria" "tblPagamento.entidade_beneficiaria", '
			+'tblPagamento."fk_dominio_moeda.id_dominio_moeda" "tblPagamento.fk_dominio_moeda.id_dominio_moeda", '
			+'tblPagamento."fk_dominio_tipo_transacao.id_dominio_tipo_transacao" "tblPagamento.fk_dominio_tipo_transacao.id_dominio_tipo_transacao", '
			+'tblPagamento."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" "tblPagamento.fk_dominio_ano_fiscal.id_dominio_ano_fiscal", '
			+'tblPagamento."fk_jurisdicao.id_dominio_jurisdicao" "tblPagamento.fk_jurisdicao.id_dominio_jurisdicao", '
			+'tblPagamento."fk_dominio_pais.id_dominio_pais" "tblPagamento.fk_dominio_pais.id_dominio_pais", '
			+'tblPagamento."fk_name_of_tax.id_name_of_tax" "tblPagamento.fk_name_of_tax.id_name_of_tax", '
			+'tblPagamento."fk_empresa.id_empresa" "tblPagamento.fk_empresa.id_empresa", '
			+'tblPagamento."fk_periodo.id_periodo" "tblPagamento.fk_periodo.id_periodo", '
			+'tblNameOfTax."id_name_of_tax" "tblNameOfTax.id_name_of_tax", '
			+'tblNameOfTax."name_of_tax" "tblNameOfTax.name_of_tax", '
			+'tblNameOfTax."fk_tax.id_tax" "tblNameOfTax.fk_tax.id_tax", '
			+'tblNameOfTax."ind_default" "tblNameOfTax.ind_default", '
			+'tblTax."id_tax" "tblTax.id_tax", '
			+'tblTax."tax" "tblTax.tax", '
			+'tblTax."fk_category.id_tax_category" "tblTax.fk_category.id_tax_category", '
			+'tblTaxCategory."id_tax_category" "tblTaxCategory.id_tax_category", '
			+'tblTaxCategory."category" "tblTaxCategory.category", '
			+'tblTaxCategory."fk_dominio_tax_classification.id_dominio_tax_classification" "tblTaxCategory.fk_dominio_tax_classification.id_dominio_tax_classification", '
			+'tblDominioTaxClassification."id_dominio_tax_classification" "tblDominioTaxClassification.id_dominio_tax_classification", '
			+'tblDominioTaxClassification."classification" "tblDominioTaxClassification.classification", '
			+'tblDominioJurisdicao."id_dominio_jurisdicao" "tblDominioJurisdicao.id_dominio_jurisdicao", '
			+'tblDominioJurisdicao."jurisdicao" "tblDominioJurisdicao.jurisdicao", '
			+'tblDominioPais."id_dominio_pais" "tblDominioPais.id_dominio_pais", '
			+'tblDominioPais."pais" "tblDominioPais.pais", '
			+'tblDominioAnoFiscal."id_dominio_ano_fiscal" "tblDominioAnoFiscal.id_dominio_ano_fiscal", '
			+'tblDominioAnoFiscal."ano_fiscal" "tblDominioAnoFiscal.ano_fiscal", '
			+'tblDominioMoeda."id_dominio_moeda" "tblDominioMoeda.id_dominio_moeda", '
			+'tblDominioMoeda."acronimo" "tblDominioMoeda.acronimo", '
			+'tblDominioMoeda."nome" "tblDominioMoeda.nome", '
			+'tblDominioTipoTransacao."id_dominio_tipo_transacao" "tblDominioTipoTransacao.id_dominio_tipo_transacao", '
			+'tblDominioTipoTransacao."tipo_transacao" "tblDominioTipoTransacao.tipo_transacao" '
			+'FROM "VGT.EMPRESA" AS tblEmpresa '
			+'INNER JOIN "VGT.PAGAMENTO" AS tblPagamento ON tblPagamento."fk_empresa.id_empresa" = tblEmpresa."id_empresa" '
			+'INNER JOIN "VGT.NAME_OF_TAX" AS tblNameOfTax ON tblNameOfTax."id_name_of_tax" = tblPagamento."fk_name_of_tax.id_name_of_tax" '
			+'INNER JOIN "VGT.TAX" AS tblTax ON tblTax."id_tax" = tblNameOfTax."fk_tax.id_tax" '
			+'INNER JOIN "VGT.TAX_CATEGORY" AS tblTaxCategory ON tblTaxCategory."id_tax_category" = tblTax."fk_category.id_tax_category" '
			+'INNER JOIN "VGT.DOMINIO_TAX_CLASSIFICATION" AS tblDominioTaxClassification ON tblDominioTaxClassification."id_dominio_tax_classification" = tblTaxCategory."fk_dominio_tax_classification.id_dominio_tax_classification" '
			+'INNER JOIN "VGT.DOMINIO_JURISDICAO" AS tblDominioJurisdicao ON tblDominioJurisdicao."id_dominio_jurisdicao" = tblPagamento."fk_jurisdicao.id_dominio_jurisdicao" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_PAIS" AS tblDominioPais ON tblDominioPais."id_dominio_pais" = tblPagamento."fk_dominio_pais.id_dominio_pais" '
			+'INNER JOIN "VGT.DOMINIO_ANO_FISCAL" AS tblDominioAnoFiscal ON tblDominioAnoFiscal."id_dominio_ano_fiscal" = tblPagamento."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" '
			+'INNER JOIN "VGT.DOMINIO_MOEDA" AS tblDominioMoeda ON tblDominioMoeda."id_dominio_moeda" = tblPagamento."fk_dominio_moeda.id_dominio_moeda" '
			+'INNER JOIN "VGT.DOMINIO_TIPO_TRANSACAO" AS tblDominioTipoTransacao ON tblDominioTipoTransacao."id_dominio_tipo_transacao" = tblPagamento."fk_dominio_tipo_transacao.id_dominio_tipo_transacao"';

		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};
		
		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/req.session.usuario.empresas.length > 0) {
			var aEmpresas = req.session.usuario.empresas;
			if (aEntrada[12] === null){
				aEntrada[12] = [];
			}
			for(var j = 0; j < req.session.usuario.empresas.length;j++){
				aEntrada[12].push(JSON.stringify(aEmpresas[j]));
			}
		}			
		
		for (var i = 0; i < aEntrada.length - 1; i++) {
			filtro = "";			
			if (aEntrada[i] !== null){
				stringtemporaria = "";
				for (var k = 0; k < aEntrada[i].length; k++) {
					switch (i){
						case 0:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;
						case 1:
							filtro = ' tblDominioTaxClassification."id_dominio_tax_classification" = ? ';
							break;
						case 2:
							filtro = ' tblTaxCategory."id_tax_category" = ? ';
							break;
						case 3:
							filtro = ' tblTax."id_tax" = ? ';
							break;
						case 4:
							filtro = ' tblNameOfTax."id_name_of_tax" = ? ';
							break;
						case 5:
							filtro = ' tblDominioJurisdicao."id_dominio_jurisdicao" = ? ';
							break;
						case 6:
							filtro = ' tblDominioPais."id_dominio_pais" = ? ';
							break;
						case 7:
							filtro = ' tblDominioAnoFiscal."id_dominio_ano_fiscal" = ? ';
							break;
						case 8:
							filtro = ' tblDominioMoeda."id_dominio_moeda" = ? ';
							break;
						case 9:
							filtro = ' tblDominioTipoTransacao."id_dominio_tipo_transacao" = ? ';
							break;
						case 10:
							filtro = ' tblPagamento."data_pagamento" >= ? ';
							break;	
						case 11:
							filtro = ' tblPagamento."data_pagamento" <= ? ';
							break;	
						case 12:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;							
					}
					if(aEntrada[i].length == 1){
						oWhere.push(filtro);
						aParams.push(aEntrada[i][k]);								
					}	 
					else{
						k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
						aParams.push(aEntrada[i][k]);
					}
				}	
			}
		}

		if (oWhere.length > 0) {
			sStatement += " where";

			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}
		
		sStatement += ")";
		
		
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