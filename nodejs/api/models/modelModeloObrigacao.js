"use strict";
var db = require("../db");

let oModel = db.model('VGT.MODELO_OBRIGACAO', {
	colunas: {
		id: { 
			nome: 'id_modelo',
			identity: true
		},
		nomeObrigacao: {
			nome: 'nome_obrigacao'
		},
		dataInicial: {
			nome: 'data_inicial'
		},
		dataFinal: {
			nome: 'data_final'
		},
		prazoEntrega: {
			nome: 'prazo_entrega'
		},
		fkIdPais: {
			nome: 'fk_id_pais.id_pais',
			number: true
		},
		fkIdDominioPeriodicidade: {
			nome: 'fk_id_dominio_periodicidade.id_periodicidade_obrigacao',
			number: true
		},
		fkIdDominioObrigacaoStatus: {
			nome: 'fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status',
			number: true
		},
		fkIdDominioObrigacaoAcessoriaTipo: {
			nome: 'fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo',
			number: true
		},
		anoObrigacao: {
			nome: 'ano_obrigacao'
		}
	} 	
});
/*
var oSketch = {
	colunas: {
		id: { 
			nome: "id_modelo",
			identity: true
		},
		nomeObrigacao: {
			nome: "nome_obrigacao"
		},
		dataInicial: {
			nome: "data_inicial"
		},
		dataFinal: {
			nome: "data_final"
		},
		prazoEntrega: {
			nome: "prazo_entrega"
		},
		fkIdPais: {
			nome: "fk_id_pais.id_pais",
			number: true
		},
		fkIdDominioPeriodicidade: {
			nome: "fk_id_dominio_periodicidade.id_periodicidade_obrigacao",
			number: true
		},
		fkIdDominioObrigacaoStatus: {
			nome: "fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status",
			number: true
		},
		fkIdDominioObrigacaoAcessoriaTipo: {
			nome: "fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo",
			number: true
		},
		anoObrigacao: {
			nome: "ano_obrigacao"
		}
	} 	
};*/

oModel.canDelete = function (entryId) {
	return new Promise((resolve, reject) => {
		let sQuery = 
			'select count(*) "qte_vinculos" from '
			+'( '
			+'select  '
			+'tblRelModeloEmpresa."fk_id_empresa.id_empresa" '
			+'from  '
			+'"VGT.EMPRESA" tblEmpresa '
			+'INNER JOIN "VGT.REL_MODELO_EMPRESA" tblRelModeloEmpresa ON tblRelModeloEmpresa."fk_id_empresa.id_empresa" = tblEmpresa."id_empresa" '
			+'INNER JOIN "VGT.MODELO_OBRIGACAO" tblModeloObrigacao ON tblModeloObrigacao."id_modelo" = tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" '
			+'WHERE tblRelModeloEmpresa."ind_ativo" = true  '
			+'and tblEmpresa."data_encerramento" is null '
			+'and tblModeloObrigacao."id_modelo" = ? '
			+'union '
			+'select '
			+'tblRelModeloEmpresa."fk_id_empresa.id_empresa" '
			+'from '
			+'"VGT.REL_MODELO_EMPRESA" tblRelModeloEmpresa '
			+'INNER JOIN "VGT.RESPOSTA_OBRIGACAO" tblRespostaObrigacao ON tblRespostaObrigacao."fk_id_rel_modelo_empresa.id_rel_modelo_empresa" = tblRelModeloEmpresa."id_rel_modelo_empresa" '
			+'INNER JOIN "VGT.MODELO_OBRIGACAO" tblModeloObrigacao ON tblModeloObrigacao."id_modelo" = tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" '
			+'where '
			+'tblModeloObrigacao."id_modelo" = ? '
			+'and tblRespostaObrigacao."ind_iniciada" = true '
			+')	',
			aParam = [entryId,entryId];
	
		try {
			db.executeStatement({
				statement: sQuery,
				parameters: aParam
			}, (err, result) => {
				if (err) {
					console.log(err);
					reject(new Error('Erro no método "canDelete" do model "ModeloObrigacao".\n' + err.message));
				}
				else {
					resolve(result && result.length && result[0].qte_vinculos === 0);
				}
			});
		} 
		catch (e) {
			console.log(e);
			reject(new Error('Erro no método "canDelete" do model "ModeloObrigacao".\n' + e.message));
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
							reject(new Error('Erro no método "delete" do model "ModeloObrigacao".\n' + err.message));
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
				reject(new Error('Erro no método "delete" do model "ModeloObrigacao".\n' + err.message));
			});
	});
};

module.exports = oModel;
//module.exports = db.model("VGT.MODELO_OBRIGACAO", oSketch);