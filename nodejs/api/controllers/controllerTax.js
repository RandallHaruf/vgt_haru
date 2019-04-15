"use strict";

var model = require("../models/modelTax");
var modelNameOfTax = require("../models/modelNameOfTax");

module.exports = {

	listarRegistros: function (req, res) {
		var aParams = [];
		
		if (req.query.category && !isNaN(req.query.category)) {
			aParams.push({
				coluna: model.colunas.fkCategory,
				valor: Number(req.query.category)
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

		var aParams = [{
			coluna: model.colunas.id
		}, {
			coluna: model.colunas.tax,
			valor: req.body.tax ? req.body.tax : null
		}, {
			coluna: model.colunas.fkCategory,
			valor: req.body.fkCategory ? Number(req.body.fkCategory) : null
		}, {
			coluna: model.colunas.indExportavelTaxPackage,
			valor: req.body.indExportavelTaxPackage ? req.body.indExportavelTaxPackage : null
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
	
	lerRelacionamentoNameOfTax: function (req, res) {
		
		var aParams = [{
			coluna: modelNameOfTax.colunas.fkTax,
			valor: req.params.idRegistro
		}];
		
		if (req.query.default) {
			aParams.push({
				coluna: modelNameOfTax.colunas.indDefault,
				valor: req.query.default
			});
		}
		
		modelNameOfTax.listar(aParams, function (err, result) {
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
			coluna: model.colunas.tax,
			valor: req.body.tax ? req.body.tax : null
		}, {
			coluna: model.colunas.fkCategory,
			valor: req.body.fkCategory ? Number(req.body.fkCategory) : null
		}, {
			coluna: model.colunas.indExportavelTaxPackage,
			valor: req.body.indExportavelTaxPackage ? req.body.indExportavelTaxPackage : null
		}];

		model.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
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
			'select  *  '
			+ 'from "VGT.TAX" tax '
			+ 'left outer join "VGT.TAX_CATEGORY" category '
			+ 'on tax."fk_category.id_tax_category" = category."id_tax_category" '
			+ 'left outer join "VGT.DOMINIO_TAX_CLASSIFICATION" classification '
			+ 'on category."fk_dominio_tax_classification.id_dominio_tax_classification" = classification."id_dominio_tax_classification" ';
			
		var aWhere = [];
		var aParams = [];
			
		if (req.params && req.params.idRegistro) {
			/*sStatement += 'where tax."id_tax" = ?';*/
			aWhere.push(' tax."id_tax" = ? ');
			aParams.push(req.params.idRegistro);
		}
		
		if (req.query.classification) {
			aWhere.push(' classification."id_dominio_tax_classification" = ? ');
			aParams.push(req.query.classification);
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