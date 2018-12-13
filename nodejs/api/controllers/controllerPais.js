"use strict";

var pais = require("../models/modelPais");

module.exports = {

	listarRegistros: function (req, res) {
		pais.listar([], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	criarRegistro: function (req, res) {
		var iPrescricaoPrejuizo = req.body.prescricaoPrejuizo ? Number(req.body.prescricaoPrejuizo) : null;
		var sLimitacaoUtilizacaoPrejuizo = req.body.limitacaoUtilizacaoPrejuizo ? req.body.limitacaoUtilizacaoPrejuizo : null; 
		var iPescricaoCredito = req.body.prescricaoCredito ? Number(req.body.prescricaoCredito) : null;
		var iFkDomPais = req.body.fkDomPais ? Number(req.body.fkDomPais) : null;
		var iFkDomPaisStatus = req.body.fkDomPaisStatus ? Number(req.body.fkDomPaisStatus) : null;
		var iFkAliquota = req.body.fkAliquota ? Number(req.body.fkAliquota) : null;
		var iFkDomPaisRegiao = req.body.fkDomPaisRegiao ? Number(req.body.fkDomPaisRegiao) : null;
		var bExtensaoCompliance = req.body.indExtensaoCompliance ? req.body.indExtensaoCompliance : null;
		var bExtensaoBeps = req.body.indExtensaoBeps ? req.body.indExtensaoBeps : null;
		
		var aParams = [{
			coluna: pais.colunas.id
		}, {
			coluna: pais.colunas.prescricaoPrejuizo,
			valor: iPrescricaoPrejuizo
		}, {
			coluna: pais.colunas.limitacaoUtilizacaoPrejuizo,
			valor: sLimitacaoUtilizacaoPrejuizo
		}, {
			coluna: pais.colunas.prescricaoCredito,
			valor: iPescricaoCredito
		}, {
			coluna: pais.colunas.indExtensaoCompliance,
			valor: bExtensaoCompliance
		}, {
			coluna: pais.colunas.indExtensaoBeps,
			valor: bExtensaoBeps
		},   {
			coluna: pais.colunas.fkDomPais,
			valor: iFkDomPais
		}, {
			coluna: pais.colunas.fkDomPaisStatus,
			valor: iFkDomPaisStatus
		}, {
			coluna: pais.colunas.fkAliquota,
			valor: iFkAliquota
		}, {
			coluna: pais.colunas.fkDomPaisRegiao,
			valor: iFkDomPaisRegiao
		}];
		
		pais.inserir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	lerRegistro: function (req, res) {
		pais.listar([{
			coluna: pais.colunas.id,
			valor: req.params.idPais
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	lerRelacionamentoNameOfTax: function (req, res) {
		pais.listar([{
			coluna: pais.colunas.id,
			valor: req.params.idPais
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				var sIdDominioPais = result[0]["fk_dominio_pais.id_dominio_pais"];
				
				var sStatement =
					'select * '
					+ 'from "VGT.REL_PAIS_NAME_OF_TAX" rel '
					+ 'inner join "VGT.NAME_OF_TAX" nameOfTax '
					+ 'on rel."fk_name_of_tax.id_name_of_tax" = nameOfTax."id_name_of_tax" ';
					
				var aWhere = [];
				var aParams = [];
				
				aWhere.push(' rel."fk_dominio_pais.id_dominio_pais" = ? ');
				aParams.push(sIdDominioPais);
				
				if (req.query.default) {
					aWhere.push(' nameOfTax."ind_default" = ? ');
					aParams.push(req.query.default);
				}
			
				if (req.query.tax) {
					aWhere.push(' nameOfTax."fk_tax.id_tax" = ? ');
					aParams.push(req.query.tax);
				}
				
				if (aWhere.length > 0) {
					sStatement += ' where ';
					for (var i = 0; i < aWhere.length; i++) {
						if (i !== 0) {
							sStatement += ' and ';
						}
						sStatement += aWhere[i];
					}
				}
				
				pais.execute({
					statement: sStatement,
					parameters: aParams
				}, function (err2, result2) {
					if (err2) {
						res.send(JSON.stringify(err2));
					}
					else {
						res.send(JSON.stringify(result2));
					}
				});
			}
		});
	},
	
	atualizarRegistro: function (req, res) {
		console.log("REQUEST: " + JSON.stringify(req.params) + JSON.stringify(req.body));
		
		var idPais = req.params.idPais;
		
		var iPrescricaoPrejuizo = req.body.prescricaoPrejuizo ? Number(req.body.prescricaoPrejuizo) : null;
		var sLimitacaoUtilizacaoPrejuizo = req.body.limitacaoUtilizacaoPrejuizo ? req.body.limitacaoUtilizacaoPrejuizo : null; 
		var iPescricaoCredito = req.body.prescricaoCredito ? Number(req.body.prescricaoCredito) : null;
		var iFkDomPais = req.body.fkDomPais ? Number(req.body.fkDomPais) : null;
		var iFkDomPaisStatus = req.body.fkDomPaisStatus ? Number(req.body.fkDomPaisStatus) : null;
		var iFkAliquota = req.body.fkAliquota ? Number(req.body.fkAliquota) : null;
		var iFkDomPaisRegiao = req.body.fkDomPaisRegiao ? Number(req.body.fkDomPaisRegiao) : null;
		var bExtensaoCompliance = req.body.indExtensaoCompliance ? req.body.indExtensaoCompliance : null;
		var bExtensaoBeps = req.body.indExtensaoBeps ? req.body.indExtensaoBeps : null;
		
		var oCondition = {
			coluna: pais.colunas.id,
			valor: idPais
		};
		
		var aParams = [{
			coluna: pais.colunas.prescricaoPrejuizo,
			valor: iPrescricaoPrejuizo
		}, {
			coluna: pais.colunas.limitacaoUtilizacaoPrejuizo,
			valor: sLimitacaoUtilizacaoPrejuizo
		}, {
			coluna: pais.colunas.prescricaoCredito,
			valor: iPescricaoCredito
		}, {
			coluna: pais.colunas.indExtensaoCompliance,
			valor: bExtensaoCompliance
		}, {
			coluna: pais.colunas.indExtensaoBeps,
			valor: bExtensaoBeps
		}, {
			coluna: pais.colunas.fkDomPais,
			valor: iFkDomPais
		}, {
			coluna: pais.colunas.fkDomPaisStatus,
			valor: iFkDomPaisStatus
		}, {
			coluna: pais.colunas.fkAliquota,
			valor: iFkAliquota
		}, {
			coluna: pais.colunas.fkDomPaisRegiao,
			valor: iFkDomPaisRegiao
		}];
		
		pais.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	excluirRegistro: function (req, res) {
		pais.excluir([{
			coluna: pais.colunas.id,
			valor: req.params.idPais
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
			'select pais."id_pais" "id", '
			+ 'pais."prescricao_prejuizo" "prescricaoPrejuizo", '
			+ 'pais."limite_utilizacao_prejuizo" "limiteUtilizacaoPrejuizo", '
			+ 'pais."prescricao_credito" "prescricaoCredito", '
			+ 'pais."fk_dominio_pais.id_dominio_pais" "fkDominioPais", '
			+ 'dom_pais."pais" "nomePais", '
			+ 'pais."fk_dominio_pais_status.id_dominio_pais_status" "fkDominioPaisStatus", '
			+ 'dom_pais_status."status" "descricaoStatus", '
			+ 'pais."fk_dominio_pais_regiao.id_dominio_pais_regiao" "fkDominioPaisRegiao", '
			+ 'dom_pais_regiao."regiao" "nomeRegiao", '
			+ 'pais."fk_aliquota.id_aliquota" "fkAliquota", '
			+ 'aliquota."nome" "nomeAliquota", '
			+ 'aliquota."valor" "valorAliquota", '
			+ 'aliquota."data_inicio" "dataInicioAliquota", '
			+ 'aliquota."data_fim" "dataFimAliquota", '
			+ 'aliquota."fk_dominio_aliquota_tipo.id_dominio_aliquota_tipo" "fkTipoAliquota" '
			+ 'from "VGT.PAIS" pais '
			+ 'left outer join "VGT.DOMINIO_PAIS" dom_pais '
			+ 'on pais."fk_dominio_pais.id_dominio_pais" = dom_pais."id_dominio_pais" '
			+ 'left outer join "VGT.DOMINIO_PAIS_STATUS" dom_pais_status '
			+ 'on pais."fk_dominio_pais_status.id_dominio_pais_status" = dom_pais_status."id_dominio_pais_status" '
			+ 'left outer join "VGT.ALIQUOTA" aliquota '
			+ 'on pais."fk_aliquota.id_aliquota" = aliquota."id_aliquota" ' 
			+ 'left outer join "VGT.DOMINIO_PAIS_REGIAO" dom_pais_regiao '
			+ 'on pais."fk_dominio_pais_regiao.id_dominio_pais_regiao" = dom_pais_regiao."id_dominio_pais_regiao" ';
		
		var oWhere = [];
		var aParams = [];

		if (req.params.idRegistro) {
			oWhere.push(' pais."id_pais" = ? ');
			aParams.push(req.params.idRegistro);
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
		
		pais.execute({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	}
};