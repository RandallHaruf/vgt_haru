"use strict";

var db = require("../db");

let oModel = db.model('VGT.DIFERENCA_OPCAO', {
	colunas: {
		id: { 
			nome: 'id_diferenca_opcao',
			identity: true
		},
		nome: {
			nome: 'nome'
		},
		indDuplicavel: {
			nome: 'ind_duplicavel'	
		},		
		fkDominioDiferencaTipo: {
			nome: 'fk_dominio_diferenca_tipo.id_dominio_diferenca_tipo',
			number: true
		}
	} 	
});

/*
var oSketch = {
	colunas: {
		id: {
			nome: "id_diferenca_opcao",
			identity: true
		},
		nome: {
			nome: "nome"
		},
		indDuplicavel: {
			nome: "ind_duplicavel"	
		},
		fkDominioDiferencaTipo: {
			nome: "fk_dominio_diferenca_tipo.id_dominio_diferenca_tipo",
			number: true
		}
	}
};*/

oModel.canDelete = function (entryId, req) {
	return new Promise((resolve, reject) => {
		let sQuery = 
			'select '
			+'( '
			+'SELECT count(*) '
			+'FROM "VGT.DIFERENCA_OPCAO" tblDiferencaOpcao '
			+'INNER JOIN "VGT.DIFERENCA" tblDiferenca on tblDiferencaOpcao."id_diferenca_opcao" = tblDiferenca."fk_diferenca_opcao.id_diferenca_opcao" '
			+'WHERE '
			+'tblDiferencaOpcao."id_diferenca_opcao" = ? '
			+') "qte_vinculos" '
			+'from "DUMMY" ',
			aParam = [entryId];
	
		try {
			db.executeStatement({
				statement: sQuery,
				parameters: aParam
			}, (err, result) => {
				if (err) {
					console.log(err);
					reject(new Error('Erro no método "canDelete" do model "DiferencaOpcao".\n' + err.message));
				}
				else {
					resolve(result && result.length && result[0].qte_vinculos === 0);
				}
			}, {
			idUsuario: req
			});
		} 
		catch (e) {
			console.log(e);
			reject(new Error('Erro no método "canDelete" do model "DiferencaOpcao".\n' + e.message));
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
							reject(new Error('Erro no método "delete" do model "DiferencaOpcao".\n' + err.message));
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
				reject(new Error('Erro no método "delete" do model "DiferencaOpcao".\n' + err.message));
			});
	});
};

module.exports = oModel;
//module.exports = db.model("VGT.DIFERENCA_OPCAO", oSketch);