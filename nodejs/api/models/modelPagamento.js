"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_pagamento",
			identity: true
		}, 
		indNaoAplicavel: {
			nome: "ind_nao_aplicavel"	
		},
		administracaoGovernamental: {
			nome: "administracao_governamental"
		}, 
		estado: {
			nome: "estado"
		}, 
		cidade: {
			nome: "cidade"
		}, 
		projeto: {
			nome: "projeto"
		}, 
		descricao: {
			nome: "descricao"
		}, 
		dataPagamento: {
			nome: "data_pagamento"
		}, 
		tipoTransacaoOutros: {
			nome: "tipo_transacao_outros"
		}, 
		principal: {
			nome: "principal",
			number: true
		}, 
		juros: {
			nome: "juros",
			number: true
		}, 
		multa: {
			nome: "multa",
			number: true
		}, 
		total: {
			nome: "total",
			number: true
		}, 
		numeroDocumento: {
			nome: "numero_documento"
		},
		entidadeBeneficiaria: {
			nome: "entidade_beneficiaria"
		},
		fkMoeda: {
			nome: "fk_dominio_moeda.id_dominio_moeda",
			number: true
		},
		fkTipoTransacao: {
			nome: "fk_dominio_tipo_transacao.id_dominio_tipo_transacao",
			number: true
		},
		fkAnoFiscal: {
			nome: "fk_dominio_ano_fiscal.id_dominio_ano_fiscal",
			number: true
		},
		fkJurisdicao: {
			nome: "fk_jurisdicao.id_dominio_jurisdicao",
			number: true
		},
		fkPais: {
			nome: "fk_dominio_pais.id_dominio_pais",
			number: true
		},
		fkNameOfTax: {
			nome: "fk_name_of_tax.id_name_of_tax",
			number: true
		},
		fkEmpresa: {
			nome: "fk_empresa.id_empresa",
			number: true
		},
		fkPeriodo: {
			nome: "fk_periodo.id_periodo",
			number: true
		}
	} 	
};

module.exports = db.model("VGT.PAGAMENTO", oSketch);