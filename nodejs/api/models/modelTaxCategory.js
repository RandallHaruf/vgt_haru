'use strict';

const db = require('../db');

let oModel = db.model('VGT.TAX_CATEGORY', {
	colunas: {
		id: { 
			nome: 'id_tax_category',
			identity: true
		},
		category: {
			nome: 'category'
		},
		fkDominioTaxClassification: {
			nome: 'fk_dominio_tax_classification.id_dominio_tax_classification',
			number: true
		}
	} 	
});

/*
oModel.canDelete = function (entryId) {
	return new Promise((resolve, reject) => {
		let sQuery = 
			'select ((select count(*) '
			+ 'from "VGT.TAX"  '
			+ 'where '
			+ '"fk_category.id_tax_category" = ?)  '
			+ '+ (select count(*) '
			+ 'from "VGT.NAME_OF_TAX" nameOfTax '
			+ 'inner join "VGT.TAX" tax '
			+ 'on nameOfTax."fk_tax.id_tax" = tax."id_tax" '
			+ 'where '
			+ 'tax."fk_category.id_tax_category" = ?) '
			+ '+ (select count(*) '
			+ 'from "VGT.PAGAMENTO" pagamento '
			+ 'inner join "VGT.NAME_OF_TAX" nameOfTax '
			+ 'on pagamento."fk_name_of_tax.id_name_of_tax" = nameOfTax."id_name_of_tax" '
			+ 'inner join "VGT.TAX" tax '
			+ 'on nameOfTax."fk_tax.id_tax" = tax."id_tax" '
			+ 'where '
			+ 'tax."fk_category.id_tax_category" = ?)) "qte_vinculos" '
			+ 'from "DUMMY" ',
			aParam = [entryId, entryId, entryId];
	
		try {
			db.executeStatement({
				statement: sQuery,
				parameters: aParam
			}, (err, result) => {
				if (err) {
					console.log(err);
					reject(new Error('Erro no método "canDelete" do model "TaxCategory".\n' + err.message));
				}
				else {
					resolve(result && result.length && result[0].qte_vinculos === 0);
				}
			});
		} 
		catch (e) {
			console.log(e);
			reject(new Error('Erro no método "canDelete" do model "TaxCategory".\n' + e.message));
		}	
	});
};
*/

oModel.canDelete = function (entryId) {
	return new Promise((resolve, reject) => {
		let sQuery = 
		'select ( '
			+ '(select count(*) '
			+ 'from "VGT.TAX" tax '
			+ 'where '
			+ 'tax."fk_category.id_tax_category" = ?) '
		+ ') "qte_vinculos" ' 
		+ 'from "DUMMY" ',
		aParam = [entryId];
	
		try {
			db.executeStatement({
				statement: sQuery,
				parameters: aParam
			}, (err, result) => {
				if (err) {
					console.log(err);
					reject(new Error('Erro no método "canDelete" do model "TaxCategory".\n' + err.message));
				}
				else {
					resolve(result && result.length && result[0].qte_vinculos === 0);
				}
			});
		} 
		catch (e) {
			console.log(e);
			reject(new Error('Erro no método "canDelete" do model "TaxCategory".\n' + e.message));
		}	
	});
};

oModel.delete = function (entryId) {
	return new Promise((resolve, reject) => {
		this.canDelete(entryId)
			.then((bCanDelete) => {
				if (bCanDelete) {
					this.excluir([{
						coluna: this.colunas.id,
						valor: entryId
					}], (err, result) => {
						if (err) {
							reject(new Error('Erro no método "delete" do model "TaxCategory".\n' + err.message));
						} 
						else {
							resolve(result);
						}
					});
				}
				else {
					const error = new Error('Não é possível excluir o registro requisitado pois ele possui dependentes.');
					error.code = 'D1';
					reject(error);
				}
			})
			.catch((err) => {
				reject(new Error('Erro no método "delete" do model "TaxCategory".\n' + err.message));
			});
	});
};

module.exports = oModel;