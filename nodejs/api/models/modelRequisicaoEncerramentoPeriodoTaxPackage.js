"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_requisicao_encerramento_periodo_tax_package",
			identity: true
		}, 
		dataRequisicao: {
			nome: "data_requisicao"
		}, 
		observacao: {
			nome: "observacao"
		}, 
		resposta: {
			nome: "resposta"
		}, 
		fkDominioRequisicaoEncerramentoPeriodoStatus: {
			nome: "fk_dominio_requisicao_encerramento_periodo_status.id_dominio_requisicao_encerramento_periodo_status",
			number: true
		}, 
		fkUsuario: {
			nome: "fk_usuario.id_usuario",
			number: true
		}, 
		fkRelTaxPackagePeriodo: {
			nome: "fk_rel_tax_package_periodo.id_rel_tax_package_periodo",
			number: true
		}
	} 	
};

module.exports = db.model("VGT.REQUISICAO_ENCERRAMENTO_PERIODO_TAX_PACKAGE", oSketch);