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
			+'empresa."nome" as Empresa, '
			+'dominio_tax_classification."classification" as DominioTaxClassification, '
			+'tax_category."category" as TaxCategory, '
			+'tax."tax" as Tax, '
			+'name_of_tax."name_of_tax" as NameOfTax, '
			+'jurisdicao."jurisdicao" as DominioJurisdicao, '
			+'dominio_pais."pais" as DominioPais, '
			+'dominio_ano_fiscal."ano_fiscal" as DominioAnoFiscal, '
			+'dominio_moeda."acronimo" as DominioMoeda, '
			+'dominio_tipo_transacao."tipo_transacao" as DominioTipoTransacao, '
			+'pagamento."data_pagamento" as DataPagamento '
			+'FROM "VGT.EMPRESA" as empresa '
			+'inner join "VGT.PAGAMENTO" as pagamento on pagamento."fk_empresa.id_empresa" = empresa."id_empresa" '
			+'inner join "VGT.NAME_OF_TAX" as name_of_tax on name_of_tax."id_name_of_tax" = pagamento."fk_name_of_tax.id_name_of_tax" '
			+'inner join "VGT.TAX" as tax on tax."id_tax" = name_of_tax."fk_tax.id_tax" '
			+'inner join "VGT.TAX_CATEGORY" as tax_category on tax_category."id_tax_category" = tax."fk_category.id_tax_category" '
			+'inner join "VGT.DOMINIO_TAX_CLASSIFICATION"as dominio_tax_classification on dominio_tax_classification."id_dominio_tax_classification" = tax_category."fk_dominio_tax_classification.id_dominio_tax_classification" '
			+'inner join "VGT.DOMINIO_JURISDICAO" as jurisdicao on jurisdicao."id_dominio_jurisdicao" = pagamento."fk_jurisdicao.id_dominio_jurisdicao" '
			+'inner join "VGT.DOMINIO_PAIS" as dominio_pais on dominio_pais."id_dominio_pais" = pagamento."fk_dominio_pais.id_dominio_pais" '
			+'inner join "VGT.DOMINIO_ANO_FISCAL" as dominio_ano_fiscal on dominio_ano_fiscal."id_dominio_ano_fiscal" = pagamento."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" '
			+'inner join "VGT.DOMINIO_MOEDA" as dominio_moeda on dominio_moeda."id_dominio_moeda" = pagamento."fk_dominio_moeda.id_dominio_moeda" '
			+'inner join "VGT.DOMINIO_TIPO_TRANSACAO" as dominio_tipo_transacao on dominio_tipo_transacao."id_dominio_tipo_transacao" = pagamento."fk_dominio_tipo_transacao.id_dominio_tipo_transacao"';
			
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var filtro = ""
		//var aEntrada = [["1","2","3"],["1","2"],["1"],["1","2","3"],["1","2","3"],null,null,null,null,null]
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];

		for (var i = 0; i < aEntrada.length; i++) {
			if (aEntrada[i] !== null){
				stringtemporaria = "";
				for (var k = 0; k < aEntrada[i].length; k++) {
					switch (i){
						case 0:
							filtro = ' empresa."id_empresa" = ? ';
							break;
						case 1:
							filtro = ' dominio_tax_classification."id_dominio_tax_classification" = ? ';
							break;
						case 2:
							filtro = ' tax_category."id_tax_category" = ? ';
							break;
						case 3:
							filtro = ' tax."id_tax" = ? ';
							break;
						case 4:
							filtro = ' name_of_tax."id_name_of_tax" = ? ';
							break;
						case 5:
							filtro = ' jurisdicao."id_dominio_jurisdicao" = ? ';
							break;
						case 6:
							filtro = ' dominio_pais."id_dominio_pais" = ? ';
							break;
						case 7:
							filtro = ' dominio_ano_fiscal."id_dominio_ano_fiscal" = ? ';
							break;
						case 8:
							filtro = ' dominio_moeda."id_dominio_moeda" = ? ';
							break;
						case 9:
							filtro = ' dominio_tipo_transacao."id_dominio_tipo_transacao" = ? ';
							break;
					}
					if(aEntrada[i].length == 1){
						oWhere.push(filtro);
						aParams.push(aEntrada[i][k]);								
					}	
					else{
						k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')',oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro 
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