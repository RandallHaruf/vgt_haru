"use strict";

var db = require("../db");

function isNumber (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function jsDateObjectToSqlDateString (oDate) {
	return oDate.getFullYear() + "-" + (oDate.getMonth() + 1) + "-" + oDate.getDate();
}

function pegarDataInicioFimMes (sAnoCalendario, iMes) {
	var date = new Date();
	var primeiroDia = new Date(sAnoCalendario, iMes, 1);
	var ultimoDia = new Date(sAnoCalendario, iMes + 1, 0);
	
	return {
		dataInicio: jsDateObjectToSqlDateString(primeiroDia),
		dataFim: jsDateObjectToSqlDateString(ultimoDia)
	};
}

function pegarDataInicioFimTrimestre (sAnoCalendario, iMeses) {
	var oDataInicioFimMesInicioTrimestre = pegarDataInicioFimMes(sAnoCalendario, iMeses[0]);
	var oDataInicioFimMesFimTrimestre = pegarDataInicioFimMes(sAnoCalendario, iMeses[2]);
	
	return {
		dataInicio: oDataInicioFimMesInicioTrimestre.dataInicio,
		dataFim: oDataInicioFimMesFimTrimestre.dataFim
	};
}

function pegarResumo (aTrimestre, aMeses, sIdEmpresa, sIdAnoCalendario, sAnoCalendario) {
	for (var i = 0; i < aTrimestre.length; i++) {
		
		var idMoeda = aTrimestre[i].id_moeda;
		var idClasse = aTrimestre[i].id_classe;
		
		var sQuery = 
			'select SUM(pagamento."total") "total" '
			+ 'from "VGT.PAGAMENTO" pagamento '
			+ 'inner join "VGT.DOMINIO_MOEDA" moeda '
			+ 'on pagamento."fk_dominio_moeda.id_dominio_moeda" = moeda."id_dominio_moeda" '
			+ 'inner join "VGT.NAME_OF_TAX" nameOfTax '
			+ 'on pagamento."fk_name_of_tax.id_name_of_tax" = nameOfTax."id_name_of_tax" '
			+ 'inner join "VGT.TAX" tax '
			+ 'on nameOfTax."fk_tax.id_tax" = tax."id_tax" '
			+ 'inner join "VGT.TAX_CATEGORY" taxCategory '
			+ 'on tax."fk_category.id_tax_category" = taxCategory."id_tax_category" '
			+ 'inner join "VGT.REL_EMPRESA_PERIODO" rel '
			+ 'on pagamento."fk_periodo.id_periodo" = rel."fk_periodo.id_periodo" '
			+ 'and rel."fk_empresa.id_empresa" = ? '
			+ 'inner join "VGT.PERIODO" periodo '
			+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
			+ 'where '
			+ 'pagamento."data_pagamento" between ? and ? '
			+ 'and pagamento."fk_dominio_moeda.id_dominio_moeda" = ? '
			+ 'and taxCategory."fk_dominio_tax_classification.id_dominio_tax_classification" = ? '
			+ 'and periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
			+ 'and pagamento."fk_empresa.id_empresa" = ? ';
				
		var oDataInicioFim1 = pegarDataInicioFimMes(sAnoCalendario, aMeses[0]);
		var aParams1 = [sIdEmpresa, oDataInicioFim1.dataInicio, oDataInicioFim1.dataFim, idMoeda, idClasse, sIdAnoCalendario, sIdEmpresa];
		
		var oDataInicioFim2 = pegarDataInicioFimMes(sAnoCalendario, aMeses[1]);
		var aParams2 = [sIdEmpresa, oDataInicioFim2.dataInicio, oDataInicioFim2.dataFim, idMoeda, idClasse, sIdAnoCalendario, sIdEmpresa];
		
		var oDataInicioFim3 = pegarDataInicioFimMes(sAnoCalendario, aMeses[2]);
		var aParams3 = [sIdEmpresa, oDataInicioFim3.dataInicio, oDataInicioFim3.dataFim, idMoeda, idClasse, sIdAnoCalendario, sIdEmpresa];
		
		var result1 = db.executeStatementSync(sQuery, aParams1);
		if (result1 && result1.length > 0) {
			aTrimestre[i].primeiroValor = result1[0].total;
		}
		
		var result2 = db.executeStatementSync(sQuery, aParams2);
		if (result2 && result2.length > 0) {
			aTrimestre[i].segundoValor = result2[0].total;
		}
		
		var result3 = db.executeStatementSync(sQuery, aParams3);
		if (result3 && result3.length > 0) {
			aTrimestre[i].terceiroValor = result3[0].total;
		}
		
		aTrimestre[i].total = 0;
		
		if (isNumber(aTrimestre[i].primeiroValor)) {
			aTrimestre[i].total += Number(aTrimestre[i].primeiroValor);
		}
		
		if (isNumber(aTrimestre[i].segundoValor)) {
			aTrimestre[i].total += Number(aTrimestre[i].segundoValor);
		}
		
		if (isNumber(aTrimestre[i].terceiroValor)) {
			aTrimestre[i].total += Number(aTrimestre[i].terceiroValor);
		}
	}
}

function pegarResumoTrimestre (iTrimestre, sIdAnoCalendario, sIdEmpresa, sAnoCalendario) {
	var aMeses;
	
	if (iTrimestre === 1) {
		aMeses = [0, 1, 2];
	}
	else if (iTrimestre === 2) {
		aMeses = [3, 4, 5];
	}
	else if (iTrimestre === 3) {
		aMeses = [6, 7, 8];
	}
	else {
		aMeses = [9, 10, 11];
	}
	
	var oDataInicioFimTrimestre = pegarDataInicioFimTrimestre(sAnoCalendario, aMeses);
	
	var sQuery = 
		'select distinct moeda."id_dominio_moeda", moeda."acronimo" '
		+ 'from "VGT.PAGAMENTO" pagamento '
		+ 'inner join "VGT.DOMINIO_MOEDA" moeda '
		+ 'on pagamento."fk_dominio_moeda.id_dominio_moeda" = moeda."id_dominio_moeda" '
		+ 'inner join "VGT.NAME_OF_TAX" nameOfTax '
		+ 'on pagamento."fk_name_of_tax.id_name_of_tax" = nameOfTax."id_name_of_tax" '
		+ 'inner join "VGT.TAX" tax '
		+ 'on nameOfTax."fk_tax.id_tax" = tax."id_tax" '
		+ 'inner join "VGT.TAX_CATEGORY" taxCategory '
		+ 'on tax."fk_category.id_tax_category" = taxCategory."id_tax_category" '
		+ 'inner join "VGT.REL_EMPRESA_PERIODO" rel '
		+ 'on pagamento."fk_periodo.id_periodo" = rel."fk_periodo.id_periodo" '
		+ 'and pagamento."fk_empresa.id_empresa" = rel."fk_empresa.id_empresa" '
		+ 'where '
		+ 'pagamento."data_pagamento" between ? and ? '
		+ 'and rel."fk_empresa.id_empresa" = ? '
		+ 'and pagamento."fk_periodo.id_periodo" in ( '
		+ 'select periodo."id_periodo" '
		+ 'from "VGT.REL_EMPRESA_PERIODO" rel '
		+ 'inner join "VGT.PERIODO" periodo '
		+ 'on rel."fk_periodo.id_periodo" = periodo."id_periodo" '
		+ 'where '
		+ 'periodo."fk_dominio_modulo.id_dominio_modulo" = 1 '
		+ 'and periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
		+ 'and rel."fk_empresa.id_empresa" = ? '
		+ ') ';
		
	var aParams = [oDataInicioFimTrimestre.dataInicio, oDataInicioFimTrimestre.dataFim, sIdEmpresa, sIdAnoCalendario, sIdEmpresa];
	
	var resultado = db.executeStatementSync(sQuery, aParams);
	
	var aTrimestre = [];
	
	if (resultado && resultado.length > 0) {
		for (var i = 0; i < resultado.length; i++) {
			var oRegistro1 = {
				"id_moeda": resultado[i].id_dominio_moeda,
				"moeda": resultado[i].acronimo,
				"id_classe": 1,
		        "categoria": "Borne",
		        "primeiroValor": 0,
		        "segundoValor": 0,
		        "terceiroValor": 0,
		        "total": 0
			};
			
			var oRegistro2 = {
				"id_moeda": resultado[i].id_dominio_moeda,
				"moeda": resultado[i].acronimo,
				"id_classe": 2,
		        "categoria": "Collected",
		        "primeiroValor": 0,
		        "segundoValor": 0,
		        "terceiroValor": 0,
		        "total": 0
			};
				
			aTrimestre.push(oRegistro1);
			aTrimestre.push(oRegistro2);
		}
	}
	
	pegarResumo(aTrimestre, aMeses, sIdEmpresa, sIdAnoCalendario, sAnoCalendario);
	
	return aTrimestre;
}

function pegarResumoEmpresa (aPagamentosBorne, aPagamentosCollected) {
	var aResumoEmpresa = [];
	
	for (var i = 0; i < aPagamentosBorne.length; i++) {
		var oTotalMoedaBorne = aPagamentosBorne[i];
		
		var oPagamentoEncontrado = aResumoEmpresa.find(function (obj) {
			return obj.id_empresa === oTotalMoedaBorne.id_empresa && obj.moeda === oTotalMoedaBorne.acronimo;
		});
		
		if (oPagamentoEncontrado) {
			oPagamentoEncontrado.borne = oTotalMoedaBorne.total;
		}
		else {
			aResumoEmpresa.push({
				"fk_pais.id_pais": oTotalMoedaBorne["fk_pais.id_pais"],
				id_empresa: oTotalMoedaBorne.id_empresa,
				nome: oTotalMoedaBorne.nome,
				moeda: oTotalMoedaBorne.acronimo,
				borne: Number(oTotalMoedaBorne.total)
			});
		}
	}
	
	for (var i = 0; i < aPagamentosCollected.length; i++) {
		var oTotalMoedaCollected = aPagamentosCollected[i];
		
		var oPagamentoEncontrado = aResumoEmpresa.find (function(obj) {
			return obj.id_empresa === oTotalMoedaCollected.id_empresa && obj.moeda === oTotalMoedaCollected.acronimo;
		});
		
		if (oPagamentoEncontrado) {
			oPagamentoEncontrado.collected = oTotalMoedaCollected.total;
		}
		else {
			aResumoEmpresa.push({
				"fk_pais.id_pais": oTotalMoedaCollected["fk_pais.id_pais"],
				id_empresa: oTotalMoedaCollected.id_empresa,
				nome: oTotalMoedaCollected.nome,
				moeda: oTotalMoedaCollected.acronimo,
				collected: Number(oTotalMoedaCollected.total)
			});
		}
	}
	
	for (var i = 0; i < aResumoEmpresa.length; i++) {
		aResumoEmpresa[i].total = 0;
		
		if (aResumoEmpresa[i].borne && isNumber(aResumoEmpresa[i].borne)) {
			aResumoEmpresa[i].total += Number(aResumoEmpresa[i].borne);
		}
		else {
			aResumoEmpresa[i].borne = 0;
		}
		
		if (aResumoEmpresa[i].collected && isNumber(aResumoEmpresa[i].collected)) {
			aResumoEmpresa[i].total += Number(aResumoEmpresa[i].collected);
		}
		else {
			aResumoEmpresa[i].collected = 0;
		}
	}
				
	return aResumoEmpresa;
}

function pegarImpostosNaoDeclarados(iIdEmpresa, iIdPeriodo) {
	var sQuery = 
		'select * '
		+ 'from "VGT.TAX" tax '
		+ 'where '
		+ 'tax."id_tax" not in ( '
		+ 'select nameOfTax."fk_tax.id_tax" '
		+ 'from "VGT.PAGAMENTO" pagamento '
		+ 'inner join "VGT.NAME_OF_TAX" nameOfTax '
		+ 'on pagamento."fk_name_of_tax.id_name_of_tax" = nameOfTax."id_name_of_tax" '
		+ 'where '
		+ 'pagamento."fk_empresa.id_empresa" = ? '
		+ 'and pagamento."fk_periodo.id_periodo" = ? '
		+ ') ',
		aParam = [iIdEmpresa, iIdPeriodo];
		
	return new Promise(function (resolve, reject) {
		db.executeStatement({
			statement: sQuery,
			parameters: aParam
		}, function (err, result) {
			if (err) {
				reject(err);
			}
			else {
				resolve(result);
			}
		});
	});
}

/*function pagamentosObrigatoriosDeclarados(iIdEmpresa, iIdPeriodo) {
	var bPagamentosDeclarados = false;
	
	var aParams = [iIdEmpresa, iIdPeriodo, iIdEmpresa],
		sQuery = 
		'select 1 '
		+ 'from "VGT.EMPRESA" empresa '
		+ 'inner join "VGT.PAIS" pais '
		+ 'on empresa."fk_pais.id_pais" = pais."id_pais" '
		+ 'inner join "VGT.REL_PAIS_NAME_OF_TAX" rel '
		+ 'on pais."fk_dominio_pais.id_dominio_pais" = rel."fk_dominio_pais.id_dominio_pais" '
		+ 'inner join "VGT.NAME_OF_TAX" nameOfTax '
		+ 'on rel."fk_name_of_tax.id_name_of_tax" = nameOfTax."id_name_of_tax" '
		+ 'inner join "VGT.PAGAMENTO" pagamento '
		+ 'on nameOfTax."id_name_of_tax" = pagamento."fk_name_of_tax.id_name_of_tax" '
		+ 'where  '
		+ 'empresa."id_empresa" = ? '
		+ 'and nameOfTax."ind_default" = true '
		+ 'and pagamento."fk_periodo.id_periodo" = ? '
		+ 'having count(*) > 0 and count(*) >= ( '
		+ 'select count(*) '
		+ 'from "VGT.EMPRESA" empresa2 '
		+ 'inner join "VGT.PAIS" pais2 '
		+ 'on empresa2."fk_pais.id_pais" = pais2."id_pais" '
		+ 'inner join "VGT.REL_PAIS_NAME_OF_TAX" rel2 '
		+ 'on pais2."fk_dominio_pais.id_dominio_pais" = rel2."fk_dominio_pais.id_dominio_pais" '
		+ 'inner join "VGT.NAME_OF_TAX" nameOfTax '
		+ 'on rel2."fk_name_of_tax.id_name_of_tax" = nameOfTax."id_name_of_tax" '
		+ 'where '
		+ 'empresa2."id_empresa" = ? '
		+ 'and nameOfTax."ind_default" = true '
		+ '); ';
		
	var result = db.executeStatementSync(sQuery, aParams);
	
	// Se retornou alguma coisa é porque o número de pagamentos
	// obrigatórios declarados é igual ou maior que o número de pagamentos obrigatórios
	if (result && result.length > 0) {
		bPagamentosDeclarados = true;
	}
	
	return bPagamentosDeclarados;
}*/

module.exports = {
	verificarImpostosNaoDeclarados: function (req, res, next) {
		if (req.query.idPeriodo && isNumber(req.query.idPeriodo)
			&& req.query.idEmpresa && isNumber(req.query.idEmpresa)) {
			pegarImpostosNaoDeclarados(Number(req.query.idEmpresa), Number(req.query.idPeriodo))
				.then(function (aImpostoNaoDeclarado) {
					res.status(200).json({
						result: aImpostoNaoDeclarado
					});
				})
				.catch(function (err) {
					next(err);
				});
		}
		else {
			var msg = "ID do período e ID da empresa são obrigatórios";
			var error = new Error(msg);
			error.status = 400;
			next(error);
		}
	},
	
	encerrarTrimestre: function (req, res) {
		if (req.body.idPeriodo && isNumber(req.body.idPeriodo)
			&& req.body.idEmpresa && isNumber(req.body.idEmpresa)) {
				
			//if (pagamentosObrigatoriosDeclarados(Number(req.body.idEmpresa), Number(req.body.idPeriodo))) {
				var aParams = [false, Number(req.body.idEmpresa), Number(req.body.idPeriodo)],
					sQuery =
					'update "VGT.REL_EMPRESA_PERIODO" '
					+ 'set "ind_ativo" = ? '
					+ 'where '
					+ '"fk_empresa.id_empresa" = ? '
					+ 'and "fk_periodo.id_periodo" = ? ';
					
				db.executeStatement({
					statement: sQuery,
					parameters: aParams
				}, function (err, result) {
					if (err) {
						res.send(JSON.stringify(err));
					}	
					else {
						res.send(JSON.stringify({
							success: true,
							result: result
						}));
					}
				});
			//}
			/*else {
				res.send(JSON.stringify({
					success: false,
					message: "Não foi possível encerrar o período.\nExistem pagamentos obrigatórios para o seu país que não foram declarados ou marcados como N/A."
				}));	
			}*/
		}
		else {
			res.send(JSON.stringify({
				success: false,
				message: "ID do período e ID da empresa são obrigatórios"
			}));
		}
	},
	
	listarResumoTrimeste: function (req, res) {
		var sIdEmpresa = req.query.empresa,
			oAnoCalendario = JSON.parse(req.query.anoCalendario);
		
		var oResumoTrimestre = {};
		
		oResumoTrimestre.PrimeiroPeriodo = pegarResumoTrimestre(1, oAnoCalendario.id_dominio_ano_calendario, sIdEmpresa, oAnoCalendario.ano_calendario);
		oResumoTrimestre.SegundoPeriodo  = pegarResumoTrimestre(2, oAnoCalendario.id_dominio_ano_calendario, sIdEmpresa, oAnoCalendario.ano_calendario);
		oResumoTrimestre.TerceiroPeriodo = pegarResumoTrimestre(3, oAnoCalendario.id_dominio_ano_calendario, sIdEmpresa, oAnoCalendario.ano_calendario);
		oResumoTrimestre.QuartoPeriodo   = pegarResumoTrimestre(4, oAnoCalendario.id_dominio_ano_calendario, sIdEmpresa, oAnoCalendario.ano_calendario);
		
		res.send(JSON.stringify(oResumoTrimestre));
	},
	
	listarResumoEmpresa: function (req, res) {
		var aIdEmpresa = req.query.empresas ? JSON.parse(req.query.empresas) : null,
			sIdAnoCalendario = req.query.anoCalendario;
		
		var aParams = [1, sIdAnoCalendario], // Primeira consulta vai ser sobre TAX BORNE
			sQuery = 
			/*'select empresa."id_empresa", empresa."nome", moeda."acronimo", SUM(pagamento."total") "total" '
			+ 'from "VGT.PAGAMENTO" pagamento '
			+ 'inner join "VGT.DOMINIO_MOEDA" moeda '
			+ 'on pagamento."fk_dominio_moeda.id_dominio_moeda" = moeda."id_dominio_moeda" '
			+ 'inner join "VGT.NAME_OF_TAX" nameOfTax '
			+ 'on pagamento."fk_name_of_tax.id_name_of_tax" = nameOfTax."id_name_of_tax" '
			+ 'inner join "VGT.TAX" tax '
			+ 'on nameOfTax."fk_tax.id_tax" = tax."id_tax" '
			+ 'inner join "VGT.TAX_CATEGORY" category '
			+ 'on tax."fk_category.id_tax_category" = category."id_tax_category" '
			+ 'inner join "VGT.EMPRESA" empresa '
			+ 'on pagamento."fk_empresa.id_empresa" = empresa."id_empresa" '
			+ 'inner join "VGT.PERIODO" periodo '
			+ 'on pagamento."fk_periodo.id_periodo" = periodo."id_periodo" '
			+ 'where '
			+ 'category."fk_dominio_tax_classification.id_dominio_tax_classification" = ? '
			+ 'and periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? ';*/
			'select empresa."fk_pais.id_pais", empresa."id_empresa", empresa."nome", pagamentos."acronimo", pagamentos."total" '
			+ 'from "VGT.EMPRESA" empresa '
			+ 'left outer join ( '
			+ 'select pagamento."fk_empresa.id_empresa", moeda."acronimo", SUM(pagamento."total") "total"  '
			+ 'from "VGT.PAGAMENTO" pagamento '
			+ 'inner join "VGT.DOMINIO_MOEDA" moeda  '
			+ 'on pagamento."fk_dominio_moeda.id_dominio_moeda" = moeda."id_dominio_moeda"  '
			+ 'inner join "VGT.NAME_OF_TAX" nameOfTax  '
			+ 'on pagamento."fk_name_of_tax.id_name_of_tax" = nameOfTax."id_name_of_tax"  '
			+ 'inner join "VGT.TAX" tax  '
			+ 'on nameOfTax."fk_tax.id_tax" = tax."id_tax"  '
			+ 'inner join "VGT.TAX_CATEGORY" category  '
			+ 'on tax."fk_category.id_tax_category" = category."id_tax_category"  '
			+ 'inner join "VGT.PERIODO" periodo  '
			+ 'on pagamento."fk_periodo.id_periodo" = periodo."id_periodo"  '
			+ 'where category."fk_dominio_tax_classification.id_dominio_tax_classification" = ?  '
			+ 'and periodo."fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
			+ 'group by pagamento."fk_empresa.id_empresa", moeda."acronimo"  '
			+ ') pagamentos '
			+ 'on empresa."id_empresa" = pagamentos."fk_empresa.id_empresa" ';
			
		if (aIdEmpresa && aIdEmpresa.length > 0) {
			sQuery += 'and empresa."id_empresa" in ( ';
			
			for (var i = 0; i < aIdEmpresa.length; i++) {
				if (i !== 0) {
					sQuery += ' , ';
				}
				sQuery += ' ? ';
			}
			
			sQuery += ') ';
			
			aParams = aParams.concat(aIdEmpresa);
		}
		
		//sQuery += 'group by empresa."id_empresa", empresa."nome", moeda."acronimo" ';
		
		db.executeStatement({
			statement: sQuery,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				aParams[0] = 2; // TAX COLLECTED
				
				db.executeStatement({
					statement: sQuery,
					parameters: aParams
				}, function (err2, result2) {
					if (err2) {
						res.send(JSON.stringify(err2));
					}	
					else {
						var aResumoEmpresa = pegarResumoEmpresa(result, result2);
						
						// Percorre o resumo e caso algum apareça mais de uma 
						// vez para a mesma empresa, vasculha o array por
						// entradas sem moeda e as remove
						for (var j = 0; j < aResumoEmpresa.length; j++) {
							var oResumoEmpresa = aResumoEmpresa[j];
							
							var aRegistros = aResumoEmpresa.filter(function (obj) { 
								return obj.id_empresa === oResumoEmpresa.id_empresa; 
							});
							
							if (aRegistros && aRegistros.length >= 2) {
								for (var k = 0; k < aResumoEmpresa.length; k++) {
									var oResumoEmpresa2 = aResumoEmpresa[k];
									
									if (oResumoEmpresa2.id_empresa === oResumoEmpresa.id_empresa 
											&& !oResumoEmpresa2.moeda) {
										aResumoEmpresa.splice(k, 1);
									}
								}
							}
						}
						
						var auth = require("../auth")();
						
						res.send(JSON.stringify(auth.filtrarEmpresas(req, aResumoEmpresa, "id_empresa")));
					}
				});
			}
		});
	}
};