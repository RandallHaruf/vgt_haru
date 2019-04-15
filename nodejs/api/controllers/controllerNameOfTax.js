"use strict";

var model = require("../models/modelNameOfTax");
var modelRelPaisNameOfTax = require("../models/modelRelPaisNameOfTax");

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
			coluna: model.colunas.nameOfTax,
			valor: req.body.nameOfTax ? req.body.nameOfTax : null
		}, {
			coluna: model.colunas.fkTax,
			valor: req.body.fkTax ? Number(req.body.fkTax) : null
		}, {
			coluna: model.colunas.indDefault,
			valor: req.body.indDefault ? req.body.indDefault : null
		}];
		
		model.inserir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				// Se foi enviado junto a request de inserir um name of tax,
				// uma lista de ids de paises é preciso inserir registros na tabela
				// de vínculo entre país e name of tax
				if (req.body.idPaises) {
					var idNameOfTax = result[0]["generated_id"];
					
					var aIdPaises = JSON.parse(req.body.idPaises);
					
					if (aIdPaises.length > 0) {
						for (var i = 0; i < aIdPaises.length; i++) {
							modelRelPaisNameOfTax.inserir([{
								coluna: modelRelPaisNameOfTax.colunas.fkDominioPais,
								valor: aIdPaises[i]
							}, {
								coluna: modelRelPaisNameOfTax.colunas.fkNameOfTax,
								valor: idNameOfTax
							}]);
						}
					}
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
			coluna: model.colunas.nameOfTax,
			valor: req.body.nameOfTax ? req.body.nameOfTax : null
		}, {
			coluna: model.colunas.fkTax,
			valor: req.body.fkTax ? Number(req.body.fkTax) : null
		}];

		model.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				// Se junto a request de atualizar um name of tax for enviada
				// uma lista de ids de paises é preciso excluir todos os vínculos existentes
				// anteriormente e inserir os novos
				if (req.body.idPaises) {
					modelRelPaisNameOfTax.excluir([{
						coluna: modelRelPaisNameOfTax.colunas.fkNameOfTax,
						valor: req.params.idRegistro
					}], function (err2) {
						if (!err2) {
							var aIdPaises = JSON.parse(req.body.idPaises);
					
							if (aIdPaises.length > 0) {
								for (var i = 0; i < aIdPaises.length; i++) {
									modelRelPaisNameOfTax.inserir([{
										coluna: modelRelPaisNameOfTax.colunas.fkDominioPais,
										valor: aIdPaises[i]
									}, {
										coluna: modelRelPaisNameOfTax.colunas.fkNameOfTax,
										valor: req.params.idRegistro
									}]);
								}
							}
						}
					});
				}
				res.send(JSON.stringify(result));
			}
		});
	},

	excluirRegistro: function (req, res, next) {
		/*model.excluir([{
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				// Ao excluir um name of tax é preciso excluir todos os vínculos dele com país
				modelRelPaisNameOfTax.excluir([{
					coluna: modelRelPaisNameOfTax.colunas.fkNameOfTax,
					valor: req.params.idRegistro
				}]);
				
				res.send(JSON.stringify(result));
			}
		});*/
		model.delete(req.params.idRegistro)
			.then((result) => {
				res.status(200).json({
					result: result
				});
			})
			.catch(function (err) {
				next(err);
			});
	},

	deepQuery: function (req, res) {
		var sStatement = 
			'select * '
			+ 'from "VGT.NAME_OF_TAX" nameOfTax '
			+ 'left outer join "VGT.TAX" tax '
			+ 'on nameOfTax."fk_tax.id_tax" = tax."id_tax" '
			+ 'left outer join "VGT.TAX_CATEGORY" taxCategory '
			+ 'on tax."fk_category.id_tax_category" = taxCategory."id_tax_category" '
			+ 'left outer join "VGT.DOMINIO_TAX_CLASSIFICATION" classification '
			+ 'on taxCategory."fk_dominio_tax_classification.id_dominio_tax_classification" = classification."id_dominio_tax_classification" ';

		/*var aParams = [];
			
		if (req.params && req.params.idRegistro) {
			sStatement += 'where nameOfTax."id_name_of_tax" = ?';
			aParams.push(req.params.idRegistro);
		}*/
		
		var oWhere = [];
		var aParams = [];
		
		if (req.params.idRegistro) {
			oWhere.push(' nameOfTax."id_name_of_tax" = ? ');
			aParams.push(req.params.idRegistro);
		}
		
		if (req.query.indDefault) {
			oWhere.push(' nameOfTax."ind_default" = ? ');
			aParams.push(req.query.indDefault);
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
				res.send(JSON.stringify(result));
			}
		});
	}
};