'use strict';

const db = require('../db');

let oModel = db.model('VGT.DIFERENCA', {
	colunas: {
		id: {
			nome: "id_diferenca",
			identity: true
		},
		outro: {
			nome: "outro"
		},
		indEnviada: {
			nome: "ind_enviada"	
		},
		fkDiferencaOpcao: {
			nome: "fk_diferenca_opcao.id_diferenca_opcao",
			number: true
		}
	}
});

oModel.setarComoEnviada = (relTaxPackagePeriodo) => {
	return new Promise((resolve, reject) => {
		if (!relTaxPackagePeriodo) {
			const error = new Error('Parâmetro "relTaxPackagePeriodo" é obrigatório');
			reject(error);
		}
		
		let sQuery = 
			'update "VGT.DIFERENCA" '
			+ 'set "ind_enviada" = true '
			+ 'where '
			+ '"id_diferenca" in ('
				+ 'select "id_diferenca" '
				+ 'from "VGT.DIFERENCA" diferenca '
				+ 'inner join "VGT.REL_TAX_RECONCILIATION_DIFERENCA" rel '
				+ 'on diferenca."id_diferenca" = rel."fk_diferenca.id_diferenca" '
				+ 'inner join "VGT.TAX_RECONCILIATION" taxRecon '
				+ 'on taxRecon."id_tax_reconciliation" = rel."fk_tax_reconciliation.id_tax_reconciliation" '
				+ 'where '
				+ 'taxRecon."fk_rel_tax_package_periodo.id_rel_tax_package_periodo" = ? '
			+ ')';
			
		db.executeStatement({
			statement: sQuery,
			parameters: [relTaxPackagePeriodo]
		}, (err, result) => {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});	
	});
}

module.exports = oModel;