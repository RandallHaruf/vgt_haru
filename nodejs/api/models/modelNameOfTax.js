'use strict';

const db = require('../db');

let oModel = db.model('VGT.NAME_OF_TAX', {
	colunas: {
		id: { 
			nome: "id_name_of_tax",
			identity: true
		},
		nameOfTax: {
			nome: "name_of_tax"
		},
		fkTax: {
			nome: "fk_tax.id_tax",
			number: true
		},
		indDefault: {
			nome: "ind_default"
		}
	}
});

oModel.canDelete = function (entryId) {
	return new Promise((resolve, reject) => {
		let sQuery = 
		'select ( '
			+ '(select count(*) '
			+ 'from "VGT.NAME_OF_TAX" tblNameOfTax '
			+ 'inner join "VGT.REL_PAIS_NAME_OF_TAX" tblRelPaisNameOfTax '
				+ 'on tblNameOfTax."id_name_of_tax" = tblRelPaisNameOfTax."fk_name_of_tax.id_name_of_tax" '
			+ 'where '
			+ 'tblNameOfTax."id_name_of_tax" = ?) '
		+ ') "qte_vinculos" '
		+ 'from "DUMMY" ',
		aParam = [entryId];
	
		try {
			db.executeStatement({
				statement: sQuery,
				parameters: aParam
			}, (err, result) => {
				if (err) {
					reject(new Error('Erro no método "canDelete" do model "Name of Tax".\n' + err.message));
				}
				else {
					resolve(result && result.length && result[0].qte_vinculos === 0);
				}
			});
		} 
		catch (e) {
			reject(new Error('Erro no método "canDelete" do model "Name of Tax".\n' + e.message));
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
					},{
						isIdLog: true,
						valor: req
					}], (err, result) => {
						if (err) {
							reject(new Error('Erro no método "delete" do model "Name of Tax".\n' + err.message));
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
				reject(new Error('Erro no método "delete" do model "Name of Tax".\n' + err.message));
			});
	});
};

module.exports = oModel;