'use strict';

const db = require('../db');

let oModel = db.model('VGT.ITEM_TO_REPORT', {
	colunas: {
		id: { 
			nome: "id_item_to_report",
			identity: true
		},
		pergunta: {
			nome: "pergunta"
		},
		flagSimNao: {
			nome: "flag_sim_nao"
		},
		flagAno: {
			nome: "flag_ano"
		}
	} 	
});

oModel.canDelete = function (entryId) {
	return new Promise((resolve, reject) => {
		let sQuery = 
		'select ('
			+ '(select count(*) '
			+ 'from "VGT.ITEM_TO_REPORT" tblItemToReport '
			+ 'inner join "VGT.RESPOSTA_ITEM_TO_REPORT" tblResItemToReport '
				+ 'on tblItemToReport."id_item_to_report" = tblResItemToReport."fk_item_to_report.id_item_to_report" '
			+ 'where '
			+ 'tblItemToReport."id_item_to_report" = ?) '
		+ ') "qte_vinculos" '
		+ 'from "DUMMY"',
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