'use strict';

const db = require('../../api/db.js');
const scheduler = require('node-schedule');

const marcarComAtrasoObrigacoesVencidas = () => {
let sQuery = 
	'update "VGT.RESPOSTA_OBRIGACAO" tblRespostaObrigacao '+
	'set tblRespostaObrigacao."fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status" = 5 '+
	'where tblRespostaObrigacao."id_resposta_obrigacao" in (select tblRespostaObrigacao."id_resposta_obrigacao" from "VGT.RESPOSTA_OBRIGACAO" tblRespostaObrigacao ' + 
	'left outer join "VGT.REL_MODELO_EMPRESA" tblRelModeloEmpresa on tblRelModeloEmpresa."id_rel_modelo_empresa" = tblRespostaObrigacao."fk_id_rel_modelo_empresa.id_rel_modelo_empresa" '+
	'left outer join "VGT.MODELO_OBRIGACAO" tblModeloObrigacao on tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" = tblModeloObrigacao."id_modelo" ' +
	'left outer join "VGT.DOMINIO_ANO_CALENDARIO" tblDominioAnoCalendario on tblRespostaObrigacao."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" = tblDominioAnoCalendario."id_dominio_ano_calendario" ' + 
	'where tblRespostaObrigacao."fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status" in (1,4) '+
	'and tblDominioAnoCalendario."ano_calendario" <= year(CURRENT_DATE) ' +
	'and coalesce(tblRespostaObrigacao."data_extensao",ADD_YEARS(COALESCE(tblRelModeloEmpresa."prazo_entrega_customizado",tblModeloObrigacao."prazo_entrega"),(tblDominioAnoCalendario."ano_calendario"-YEAR(COALESCE(tblRelModeloEmpresa."prazo_entrega_customizado",tblModeloObrigacao."prazo_entrega"))))) < CURRENT_DATE)';
	return new Promise((resolve, reject) => {
		db.executeStatement({
			statement: sQuery
		}, (err, result) => {
			if (err) {
				reject(err);
			}	
			else {
				resolve(result);
			}
		});
	});
};

module.exports = () => {
	/**
	 * https://crontab.guru/#0_23_*_*_*
	 * Todo dia as 23:00
	 **/
	scheduler.scheduleJob('0 1 * * *', marcarComAtrasoObrigacoesVencidas);

};