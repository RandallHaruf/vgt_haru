'use strict';

const db = require('../db');

let oModel = db.model('VGT.TAX', {
	colunas: {
		id: { 
			nome: "id_tax",
			identity: true
		},
		tax: {
			nome: "tax"
		},
		fkCategory: {
			nome: "fk_category.id_tax_category",
			number: true
		},
		indExportavelTaxPackage: {
			nome: "ind_exportavel_tax_package"
		},
		indRequerBeneficiaryCompany: {
			nome: "ind_requer_beneficiary_company"
		}
	}
});

oModel.canDelete = function (entryId) {
	return new Promise((resolve, reject) => {
		let sQuery = 
		'select ( '
			+ '(select count(*) '
			+ 'from "VGT.NAME_OF_TAX" nameOfTax '
			+ 'inner join "VGT.TAX" tax '
				+ 'on nameOfTax."fk_tax.id_tax" = tax."id_tax" '
			+ 'where '
			+ 'tax."id_tax" = ?) '
		+ ') "qte_vinculos" '
		+ 'from "DUMMY" ',
		aParam = [entryId];
	
		try {
			db.executeStatement({
				statement: sQuery,
				parameters: aParam
			}, (err, result) => {
				if (err) {
					reject(new Error('Erro no método "canDelete" do model "Tax".\n' + err.message));
				}
				else {
					resolve(result && result.length && result[0].qte_vinculos === 0);
				}
			});
		} 
		catch (e) {
			reject(new Error('Erro no método "canDelete" do model "Tax".\n' + e.message));
		}	
	});
};

oModel.delete = function (entryId, req) {
	return new Promise((resolve, reject) => {
		this.canDelete(entryId)
			.then((bCanDelete) => {
				if (bCanDelete) {
					this.excluir([{
						coluna: this.colunas.id,
						valor: entryId
					}, {
						isIdLog: true,
						valor: req
					}], (err, result) => {
						if (err) {
							reject(new Error('Erro no método "delete" do model "Tax".\n' + err.message));
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
				reject(new Error('Erro no método "delete" do model "Tax".\n' + err.message));
			});
	});
};

module.exports = oModel;