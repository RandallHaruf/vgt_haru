"use strict";
var db = require("../db");

var oSketch = {
	colunas: {
		id: { 
			nome: "id_resposta_obrigacao",
			identity: true
		},
		suporteContratado: {
			nome: "suporte_contratado"
		},
		suporteEspecificacao: {
			nome: "suporte_especificacao"
		},
		suporteValor: {
			nome: "suporte_valor"
		},
		fkIdDominioMoeda: {
			nome: "fk_id_dominio_moeda.id_dominio_moeda",
			number: true
		},
		fkIdRelModeloEmpresa: {
			nome: "fk_id_rel_modelo_empresa.id_rel_modelo_empresa",
			number: true
		},
		fkIdDominioAnoFiscal: {
			nome: "fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal",
			number: true
		},
		fkIdDominioAnoCalendario:{
			nome: "fk_id_dominio_ano_calendario.id_dominio_ano_calendario",
			number: true
		},
		fkIdDominioObrigacaoStatusResposta:{
			nome: "fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status",
			number: true
		},
		dataExtensao:{
			nome: "data_extensao"
		},
		dataConclusao:{
			nome: "data_conclusao"
		},
		// Indicador de que em algum momento algum usuário entrou no formulário de obrigação e SALVOU qualquer alteração.
		// Indicador necessário para que a query que calcula as situações das respostas indique corretamente que respostas futuras estão com status NÃO INICIADA ao invés de AGUARDANDO.
		// Como TODAS as respostas físicas não são mais necessárias em banco, assim que um usuário entra em qualquer formulário de qualquer resposta, um registro "inicial" é criado com essa flag igual a FALSE,
		// apenas para permitir que o usuário consiga fazer upload de arquivos pela PRIMEIRA VEZ para uma resposta. Mesmo que o usuário CANCELE o primeiro formulário de edição, o registro permanece no banco,
		// mas por possuir flag FALSE a query indica corretamente que ela não foi iniciada.
		indIniciada: {
			nome: "ind_iniciada"
		}
	} 	
};

var oModel = db.model("VGT.RESPOSTA_OBRIGACAO", oSketch);

oModel.pegarQueryRespostaObrigacaoCalculada = function (aIdTipoObrigacao, aIdAnoCalendario, aIdEmpresa, aIdStatusResposta) {
	const concatenarIn = function (stm, aIds) {
		for (var i = 0, length = aIds.length; i < length; i++) {
			if (i !== 0) {
				stm += ' , ';
			}
			stm += aIds[i];
		}
		stm += ') ';
		
		return stm;
	};
	
	var statement =	
		'select t.*, '
			+ '(case  '
				+ 'when t."data_conclusao" is not null then ( '
					+ 'case '
						+ 'when t."data_conclusao" <= t."prazo_entrega_para_calculo_status" then 6  '// entregue no tempo
						+ 'else 7  '// entregue com atraso
					+ 'end '
				+ ') '
				+ 'when t."prazo_entrega_para_calculo_status" < CURRENT_DATE then 5  '// em atraso
				+ 'else ( '
					+ 'case ' 
						//+ 'when t."id_resposta_obrigacao" is not null then 1  '// em andamento
						+ 'when t."ind_iniciada" = true then 1 '
						+ 'else 4  '// nao iniciado
					+ 'end '
				+ ') '
			+ 'end) "status_obrigacao_calculado", '
			+ '( '
				+ 'select "id_dominio_ano_fiscal" '
				+ 'from "VGT.DOMINIO_ANO_FISCAL" '
					+ 'where '
						+ '"ano_fiscal" = t."ano_fiscal_calculado" '
			+ ') "id_ano_fiscal_calculado" '
		+ 'from (' 
			+ 'select relModeloEmpresa."fk_id_modelo_obrigacao.id_modelo", '
			+ 'relModeloEmpresa."fk_id_empresa.id_empresa", '
			+ 'relModeloEmpresa."id_rel_modelo_empresa", '
			+ 'relModeloEmpresa."prazo_entrega_customizado", '
			+ 'relModeloEmpresa."ind_ativo", '
			+ 'modeloObrigacao.*, '
			+ 'empresa.*, '
			+ 'pais."fk_dominio_pais.id_dominio_pais", '
			+ 'pais."fk_dominio_pais_regiao.id_dominio_pais_regiao", '
			+ 'pais."ind_extensao_compliance", '
			+ 'pais."ind_extensao_beps", '
			+ 'anoCalendario.*,  '
			+ 'respostaObrigacao.*, '
			+ 'moeda."id_dominio_moeda", '
			+ '(anoCalendario."ano_calendario" -  '
				+ 'coalesce(modeloObrigacao."ano_obrigacao",  '
					+ 'case modeloObrigacao."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo"  '
					  + 'when 1 then pais."ano_obrigacao_beps"  '
					  + 'when 2 then pais."ano_obrigacao_compliance"  '
					+ 'end)  '
			+ ') "ano_fiscal_calculado", '
			+ 'coalesce(respostaObrigacao."data_extensao", '
					+ 'ADD_YEARS( '
						+ 'COALESCE(relModeloEmpresa."prazo_entrega_customizado", modeloObrigacao."prazo_entrega"), '
						+ '(anoCalendario."ano_calendario" -  '
							+ 'YEAR(COALESCE(relModeloEmpresa."prazo_entrega_customizado", modeloObrigacao."prazo_entrega")) '
						+ ') '
					+ ') '
				+ ') "prazo_entrega_para_calculo_status", '
				+ 'ADD_YEARS( '
					+ 'COALESCE(relModeloEmpresa."prazo_entrega_customizado", modeloObrigacao."prazo_entrega"), '
					+ '(anoCalendario."ano_calendario" -  '
						+ 'YEAR(COALESCE(relModeloEmpresa."prazo_entrega_customizado", modeloObrigacao."prazo_entrega")) '
					+ ') '
				+ ') "prazo_entrega_calculado" '
		+ 'from "VGT.REL_MODELO_EMPRESA" relModeloEmpresa   '
			+ 'inner join "VGT.MODELO_OBRIGACAO" modeloObrigacao  '
				+ 'on relModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" = modeloObrigacao."id_modelo"  '
			+ 'inner join "VGT.EMPRESA" empresa '
				+ 'on relModeloEmpresa."fk_id_empresa.id_empresa" = empresa."id_empresa"  '
			+ 'inner join "VGT.PAIS" pais '
				+ 'on modeloObrigacao."fk_id_pais.id_pais" = pais."id_pais" '
			+ 'inner join "VGT.DOMINIO_ANO_CALENDARIO" anoCalendario  '
				+ 'on anoCalendario."ano_calendario" in ( '
					+ 'select "ano_calendario" '
					+ 'from "VGT.DOMINIO_ANO_CALENDARIO" '
					+ 'where ';
				
	if (aIdAnoCalendario && aIdAnoCalendario.length) {
		statement += '"id_dominio_ano_calendario" in (';
		
		statement = concatenarIn(statement, aIdAnoCalendario);
	}
	else {
		statement += '"ano_calendario" >= 2018 and "ano_calendario" <= year(CURRENT_DATE)+1 ';
	}
					
	statement += 
				')  '
			+ 'left outer join "VGT.RESPOSTA_OBRIGACAO" respostaObrigacao  '
				+ 'on relModeloEmpresa."id_rel_modelo_empresa" = respostaObrigacao."fk_id_rel_modelo_empresa.id_rel_modelo_empresa"  '
					+ 'and anoCalendario."id_dominio_ano_calendario" = respostaObrigacao."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" '
			+ 'left outer join "VGT.DOMINIO_MOEDA" moeda '
				+ 'ON respostaObrigacao."fk_id_dominio_moeda.id_dominio_moeda" = moeda."id_dominio_moeda"  '
				
	if (aIdTipoObrigacao && aIdTipoObrigacao.length) {
		statement += 
			'where '
				+ 'modeloObrigacao."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" in (';
				
		statement = concatenarIn(statement, aIdTipoObrigacao);
	}
		
	if (aIdEmpresa && aIdEmpresa.length) {
		if (aIdTipoObrigacao && aIdTipoObrigacao.length) {
			statement += ' and ';
		}
		else {
			statement += ' where ';
		}
		statement += ' relModeloEmpresa."fk_id_empresa.id_empresa" in (';
		
		statement = concatenarIn(statement, aIdEmpresa);
	}
		
	statement += 
			'and (('
				+ '( '
					+ 'select count(*)  '
					+ 'from "VGT.VIGENCIA_CUSTOMIZADA" vigencia '
						+ 'inner join "VGT.DOMINIO_ANO_CALENDARIO" ano '
							+ 'on ano."id_dominio_ano_calendario" between vigencia."fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"  '
									+ 'and vigencia."fk_dominio_ano_calendario_final.id_dominio_ano_calendario" '
					+ 'where vigencia."fk_id_rel_modelo_empresa.id_rel_modelo_empresa" =  relModeloEmpresa."id_rel_modelo_empresa" '
				+ ') > 0 '
				+ 'and '
				+ 'anoCalendario."id_dominio_ano_calendario" in ( '
					+ 'select ano."id_dominio_ano_calendario"  '
					+ 'from "VGT.VIGENCIA_CUSTOMIZADA" vigencia '
						+ 'inner join "VGT.DOMINIO_ANO_CALENDARIO" ano '
							+ 'on ano."id_dominio_ano_calendario" between vigencia."fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"  '
									+ 'and vigencia."fk_dominio_ano_calendario_final.id_dominio_ano_calendario" '
					+ 'where '
					+ 'vigencia."fk_id_rel_modelo_empresa.id_rel_modelo_empresa" =  relModeloEmpresa."id_rel_modelo_empresa" '
					+ 'and ano."ano_calendario" <= ( '
							+ 'select year("data_final") '
							+ 'from "VGT.MODELO_OBRIGACAO" '
							+ 'where '
							+ '"id_modelo" = modeloObrigacao."id_modelo" '
						+ ') '
					+ 'and ano."ano_calendario" >= ( '
							+ 'select year("data_inicial") '
							+ 'from "VGT.MODELO_OBRIGACAO" '
							+ 'where '
							+ '"id_modelo" = modeloObrigacao."id_modelo" '
						+ ') '
				+ ') '
			+') or ('
				+ '( '
					+ 'select count(*)  '
					+ 'from "VGT.VIGENCIA_CUSTOMIZADA" vigencia '
						+ 'inner join "VGT.DOMINIO_ANO_CALENDARIO" ano '
							+ 'on ano."id_dominio_ano_calendario" between vigencia."fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"  '
									+ 'and vigencia."fk_dominio_ano_calendario_final.id_dominio_ano_calendario" '
					+ 'where vigencia."fk_id_rel_modelo_empresa.id_rel_modelo_empresa" =  relModeloEmpresa."id_rel_modelo_empresa" '
				+ ') <= 0 '
				+ 'and '
				+ 'anoCalendario."id_dominio_ano_calendario" in ( '
					+ 'select ano."id_dominio_ano_calendario" '
					+ 'from "VGT.MODELO_OBRIGACAO" modelo '
						+ 'inner join "VGT.DOMINIO_ANO_CALENDARIO" ano  '
							+ 'on ano."ano_calendario" between year(modelo."data_inicial") and year(modelo."data_final")  '
					+ 'where '
						+ 'modelo."id_modelo" = modeloObrigacao."id_modelo" '
				+ ') '
			+ ')) '
			// + 'and anoCalendario."ano_calendario" <= year(coalesce(empresa."data_encerramento", \'2999-01-01\')) '; // Deve ser descomentado se o filtro de empresa vendida for aplicado sobre o ANO_CALENDARIO
	+ ') t '
	+ 'where '
		+ 't."ano_fiscal_calculado" <= year(coalesce(t."data_encerramento", \'2999-01-01\')) '; // Deve ser descomentado se o filtro de empresa vendida for aplicado sobre o ANO_FISCAL
		
		
	statement = 'select * from (' + statement + ') t2 where (t2."ind_ativo" = true or (t2."id_resposta_obrigacao" is not null and t2."status_obrigacao_calculado" != 4)) '
		
	if (aIdStatusResposta && aIdStatusResposta.length) {
		statement += 'and t2."status_obrigacao_calculado" in (';
		
		statement = concatenarIn(statement, aIdStatusResposta);
	}
		
	return 'select * from (' + statement + ') vw_resposta_obrigacao ';
}
	
module.exports = oModel;