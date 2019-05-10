"use strict";
var db = require("../db");
//var model = require("../models/modelReportObrigacao");
var model = require("../models/modelRespostaObrigacao");

module.exports = {

	deepQuery: function (req, res) {
	
		var sStatement = 
			'SELECT '
			+'tblRespostaObrigacao."id_resposta_obrigacao" AS "tblRespostaObrigacao.id_resposta_obrigacao",  '
			+'tblRespostaObrigacao."suporte_contratado" AS "tblRespostaObrigacao.suporte_contratado",  '
			+'tblRespostaObrigacao."suporte_especificacao" AS "tblRespostaObrigacao.suporte_especificacao",  '
			+'tblRespostaObrigacao."suporte_valor" AS "tblRespostaObrigacao.suporte_valor",  '
			+'tblRespostaObrigacao."fk_id_dominio_moeda.id_dominio_moeda" AS "tblRespostaObrigacao.fk_id_dominio_moeda.id_dominio_moeda",  '
			+'tblRespostaObrigacao."fk_id_rel_modelo_empresa.id_rel_modelo_empresa" AS "tblRespostaObrigacao.fk_id_rel_modelo_empresa.id_rel_modelo_empresa",  '
			+'tblRespostaObrigacao."fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal" AS "tblRespostaObrigacao.fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal",  '
			+'tblRespostaObrigacao."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" AS "tblRespostaObrigacao.fk_id_dominio_ano_calendario.id_dominio_ano_calendario",  '
			+'tblRespostaObrigacao."fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status" AS "tblRespostaObrigacao.fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status",  '
			+'tblRespostaObrigacao."data_extensao" AS "tblRespostaObrigacao.data_extensao",  '
			+'tblRespostaObrigacao."data_conclusao" AS "tblRespostaObrigacao.data_conclusao",  '
			+'tblDominioMoeda."id_dominio_moeda" AS "tblDominioMoeda.id_dominio_moeda",  '
			+'tblDominioMoeda."acronimo" AS "tblDominioMoeda.acronimo",  '
			+'tblDominioMoeda."nome" AS "tblDominioMoeda.nome",  '
			+'tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" AS "tblRelModeloEmpresa.fk_id_modelo_obrigacao.id_modelo",  '
			+'tblRelModeloEmpresa."fk_id_empresa.id_empresa" AS "tblRelModeloEmpresa.fk_id_empresa.id_empresa",  '
			+'tblRelModeloEmpresa."id_rel_modelo_empresa" AS "tblRelModeloEmpresa.id_rel_modelo_empresa",  '
			+'tblRelModeloEmpresa."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" AS "tblRelModeloEmpresa.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status",  '
			+'tblRelModeloEmpresa."prazo_entrega_customizado" AS "tblRelModeloEmpresa.prazo_entrega_customizado",  '
			+'tblRelModeloEmpresa."ind_ativo" AS "tblRelModeloEmpresa.ind_ativo",  '
			+'tblDominioAnoFiscal."id_dominio_ano_fiscal" AS "tblDominioAnoFiscal.id_dominio_ano_fiscal",  '
			+'tblDominioAnoFiscal."ano_fiscal" AS "tblDominioAnoFiscal.ano_fiscal",  '
			+'tblDominioAnoCalendario."id_dominio_ano_calendario" AS "tblDominioAnoCalendario.id_dominio_ano_calendario",  '
			+'tblDominioAnoCalendario."ano_calendario" AS "tblDominioAnoCalendario.ano_calendario",  '
			+'tblModeloObrigacao."id_modelo" AS "tblModeloObrigacao.id_modelo",  '
			+'tblModeloObrigacao."nome_obrigacao" AS "tblModeloObrigacao.nome_obrigacao",  '
			+'tblModeloObrigacao."data_inicial" AS "tblModeloObrigacao.data_inicial",  '
			+'tblModeloObrigacao."data_final" AS "tblModeloObrigacao.data_final",  '
			+'tblModeloObrigacao."prazo_entrega" AS "tblModeloObrigacao.prazo_entrega",  '
			+'tblModeloObrigacao."fk_id_pais.id_pais" AS "tblModeloObrigacao.fk_id_pais.id_pais",  '
			+'tblModeloObrigacao."fk_id_dominio_periodicidade.id_periodicidade_obrigacao" AS "tblModeloObrigacao.fk_id_dominio_periodicidade.id_periodicidade_obrigacao",  '
			+'tblModeloObrigacao."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" AS "tblModeloObrigacao.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status",  '
			+'tblModeloObrigacao."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" AS "tblModeloObrigacao.fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo",  '
			+'tblDominioObrigacaoStatus."id_dominio_obrigacao_status" AS "tblDominioObrigacaoStatus.id_dominio_obrigacao_status",  '
			+'tblDominioObrigacaoStatus."descricao_obrigacao_status" AS "tblDominioObrigacaoStatus.descricao_obrigacao_status",  '
			+'tblPais."id_pais" AS "tblPais.id_pais",  '
			+'tblPais."prescricao_prejuizo" AS "tblPais.prescricao_prejuizo",  '
			+'tblPais."limite_utilizacao_prejuizo" AS "tblPais.limite_utilizacao_prejuizo",  '
			+'tblPais."prescricao_credito" AS "tblPais.prescricao_credito",  '
			+'tblPais."fk_dominio_pais.id_dominio_pais" AS "tblPais.fk_dominio_pais.id_dominio_pais",  '
			+'tblPais."fk_dominio_pais_status.id_dominio_pais_status" AS "tblPais.fk_dominio_pais_status.id_dominio_pais_status",  '
			+'tblPais."fk_aliquota.id_aliquota" AS "tblPais.fk_aliquota.id_aliquota",  '
			+'tblPais."fk_dominio_pais_regiao.id_dominio_pais_regiao" AS "tblPais.fk_dominio_pais_regiao.id_dominio_pais_regiao",  '
			+'tblPais."ind_extensao_compliance" AS "tblPais.ind_extensao_compliance",  '
			+'tblPais."ind_extensao_beps" AS "tblPais.ind_extensao_beps",  '
			+'tblPais."ano_obrigacao_compliance" AS "tblPais.ano_obrigacao_compliance",  '
			+'tblPais."ano_obrigacao_beps" AS "tblPais.ano_obrigacao_beps",  '
			+'tblDominioPais."id_dominio_pais" AS "tblDominioPais.id_dominio_pais",  '
			+'tblDominioPais."pais" AS "tblDominioPais.pais",  '
			+'tblDominioPeriodicidadeObrigacao."id_periodicidade_obrigacao" AS "tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao",  '
			+'tblDominioPeriodicidadeObrigacao."descricao" AS "tblDominioPeriodicidadeObrigacao.descricao",  '
			+'tblEmpresa."id_empresa" AS "tblEmpresa.id_empresa",  '
			+'tblEmpresa."nome" AS "tblEmpresa.nome",  '
			+'tblEmpresa."num_hfm_sap" AS "tblEmpresa.num_hfm_sap",  '
			+'tblEmpresa."tin" AS "tblEmpresa.tin",  '
			+'tblEmpresa."jurisdicao_tin" AS "tblEmpresa.jurisdicao_tin",  '
			+'tblEmpresa."ni" AS "tblEmpresa.ni",  '
			+'tblEmpresa."jurisdicao_ni" AS "tblEmpresa.jurisdicao_ni",  '
			+'tblEmpresa."endereco" AS "tblEmpresa.endereco",  '
			+'tblEmpresa."fy_start_date" AS "tblEmpresa.fy_start_date",  '
			+'tblEmpresa."fy_end_date" AS "tblEmpresa.fy_end_date",  '
			+'tblEmpresa."lbc_nome" AS "tblEmpresa.lbc_nome",  '
			+'tblEmpresa."lbc_email" AS "tblEmpresa.lbc_email",  '
			+'tblEmpresa."comentarios" AS "tblEmpresa.comentarios",  '
			+'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" AS "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario",  '
			+'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" AS "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status",  '
			+'tblEmpresa."fk_aliquota.id_aliquota" AS "tblEmpresa.fk_aliquota.id_aliquota",  '
			+'tblEmpresa."fk_pais.id_pais" AS "tblEmpresa.fk_pais.id_pais", '
			+'COALESCE(tblRelModeloEmpresa."prazo_entrega_customizado", tblModeloObrigacao."prazo_entrega") AS "prazo_de_entrega_calculado", '
			+'tblDominioObrigacaoAcessoriaTipo."id_dominio_obrigacao_acessoria_tipo" AS "tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo", '
			+'tblDominioObrigacaoAcessoriaTipo."tipo" AS "tblDominioObrigacaoAcessoriaTipo.tipo" '
			+'FROM "VGT.RESPOSTA_OBRIGACAO" AS tblRespostaObrigacao '
			+'LEFT OUTER JOIN "VGT.DOMINIO_MOEDA" AS tblDominioMoeda '
			+'ON tblRespostaObrigacao."fk_id_dominio_moeda.id_dominio_moeda" = tblDominioMoeda."id_dominio_moeda" '
			+'LEFT OUTER JOIN "VGT.REL_MODELO_EMPRESA" AS tblRelModeloEmpresa '
			+'ON tblRespostaObrigacao."fk_id_rel_modelo_empresa.id_rel_modelo_empresa" = tblRelModeloEmpresa."id_rel_modelo_empresa" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_ANO_FISCAL" AS tblDominioAnoFiscal '
			+'ON tblRespostaObrigacao."fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal" = tblDominioAnoFiscal."id_dominio_ano_fiscal" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_ANO_CALENDARIO" AS tblDominioAnoCalendario '
			+'ON tblRespostaObrigacao."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" = tblDominioAnoCalendario."id_dominio_ano_calendario" '
			+'LEFT OUTER JOIN "VGT.MODELO_OBRIGACAO" AS tblModeloObrigacao '
			+'ON tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" = tblModeloObrigacao."id_modelo" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_OBRIGACAO_STATUS" AS tblDominioObrigacaoStatus '
			+'ON tblRespostaObrigacao."fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status" = tblDominioObrigacaoStatus."id_dominio_obrigacao_status" '
			+'LEFT OUTER JOIN "VGT.PAIS" AS tblPais '
			+'ON tblModeloObrigacao."fk_id_pais.id_pais" = tblPais."id_pais" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_PAIS" AS tblDominioPais '
			+'ON tblPais."fk_dominio_pais.id_dominio_pais" = tblDominioPais."id_dominio_pais" '
			+'left outer JOIN "VGT.DOMINIO_PERIODICIDADE_OBRIGACAO" AS tblDominioPeriodicidadeObrigacao '
			+'ON tblModeloObrigacao."fk_id_dominio_periodicidade.id_periodicidade_obrigacao" = tblDominioPeriodicidadeObrigacao."id_periodicidade_obrigacao" '
			+'left outer JOIN "VGT.EMPRESA" AS tblEmpresa '
			+'ON tblRelModeloEmpresa."fk_id_empresa.id_empresa" = tblEmpresa."id_empresa" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_OBRIGACAO_ACESSORIA_TIPO" AS tblDominioObrigacaoAcessoriaTipo '
			+'on tblDominioObrigacaoAcessoriaTipo."id_dominio_obrigacao_acessoria_tipo" = tblModeloObrigacao."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" ';


		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];
		var PrazoGEque = null;
		var PrazoLEque = null;
		if(aEntrada[6]!==null && aEntrada[6]!==undefined){
			PrazoGEque = aEntrada[6][0]; 
		}
		if(aEntrada[7]!==null && aEntrada[7]!==undefined){
			PrazoLEque = aEntrada[7][0]; 	
		}
		
		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};
		
		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/ req.session.usuario.empresas.length > 0){
			var aEmpresas = req.session.usuario.empresas;
			if (aEntrada[13] === null){
				aEntrada[13] = [];
			}
			for(var j = 0; j < req.session.usuario.empresas.length;j++){
				aEntrada[13].push(JSON.stringify(aEmpresas[j]));
			}
		}		
		
		for (var i = 0; i < aEntrada.length; i++) {
			filtro = "";			
			if (aEntrada[i] !== null){
				stringtemporaria = "";
				for (var k = 0; k < aEntrada[i].length; k++) {
					switch (i){
						case 0:
							filtro = ' tblModeloObrigacao."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" = ? ';
							break;
						case 1:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;
						case 2:
							filtro = ' tblDominioPais."id_dominio_pais" = ? ';
							break;
						case 3:
							filtro = ' tblModeloObrigacao."id_modelo" =  ? ';
							break;
						case 4:
							filtro = ' tblDominioPeriodicidadeObrigacao."id_periodicidade_obrigacao" = ? ';
							break;
						case 5:
							filtro = ' tblDominioAnoFiscal."id_dominio_ano_fiscal" = ? ';
							break;
					/*	case 6:
							filtro = ' tblObrigacao."prazo_entrega" >=  ? ';
							break;
						case 7:
							filtro = ' tblObrigacao."prazo_entrega" <= ? ';
							break;*/
						case 8:
							filtro = ' tblRespostaObrigacao."data_extensao" >= ? ';
							break;
						case 9:
							filtro = ' tblRespostaObrigacao."data_extensao" <= ? ';
							break;
						case 10:
							filtro = ' tblDominioObrigacaoStatus."id_dominio_obrigacao_status" = ? ';
							break;	
						case 11:
							filtro = ' tblDominioAnoCalendario."id_dominio_ano_calendario" = ? ';
							break;		
						case 12:
							if(aEntrada[i][k]==="true"){
								filtro = ' tblRespostaObrigacao."suporte_contratado" = ? ';
							}
							else{
								filtro = ' (tblRespostaObrigacao."suporte_contratado" = ? or tblRespostaObrigacao."suporte_contratado" is NULL) ';
							}
							break;	
						case 13:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;							
					}
					
					if(i !== 6 && i !== 7){
						if(aEntrada[i].length == 1 ){
							oWhere.push(filtro);
							aParams.push(aEntrada[i][k]);								
						}	 
						else{
							k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
							aParams.push(aEntrada[i][k]);
						}
					}	
					
				}	
			}
		}

		sStatement += ' where tblModeloObrigacao."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" = 2 and tblRelModeloEmpresa."ind_ativo" = true and tblDominioAnoCalendario."ano_calendario" <= year(CURRENT_DATE) + 1';

		if (oWhere.length > 0) {
			sStatement += " and ";

			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}
		
		if(PrazoGEque!==null || PrazoLEque!==null){
			sStatement = 'select * from (' + sStatement + ') where ';
			if(PrazoGEque!==null){
				sStatement+=' (EXTRACT(month from "prazo_de_entrega_calculado") > EXTRACT(month from ?) or ((EXTRACT(month from "prazo_de_entrega_calculado") = EXTRACT(month from ?)) and (EXTRACT(day from "prazo_de_entrega_calculado") >= EXTRACT(day from ?)))) ';
				aParams.push(PrazoGEque);
				aParams.push(PrazoGEque);
				aParams.push(PrazoGEque);
			}
			if(PrazoGEque!==null && PrazoLEque!==null){
				sStatement+=' and ';
			}
			if(PrazoLEque!==null){
				sStatement+='(EXTRACT(month from "prazo_de_entrega_calculado") < EXTRACT(month from ?) or ((EXTRACT(month from "prazo_de_entrega_calculado") = EXTRACT(month from ?)) and (EXTRACT(day from "prazo_de_entrega_calculado") <= EXTRACT(day from ?))))';
				aParams.push(PrazoLEque);
				aParams.push(PrazoLEque);
				aParams.push(PrazoLEque);
			}
		}
		
		sStatement+=' order by "tblDominioObrigacaoAcessoriaTipo.tipo" , "tblDominioPais.pais" , "tblEmpresa.nome" , "tblModeloObrigacao.nome_obrigacao" , "tblDominioAnoCalendario.ano_calendario"';
		
		db.executeStatement({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	deepQueryDistinct: function (req, res) {
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var stringDistinct = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];
		var PrazoGEque = null;
		var PrazoLEque = null;
		
		if(aEntrada[6]!==null && aEntrada[6]!==undefined){
			PrazoGEque = aEntrada[6][0]; 
		}
		if(aEntrada[7]!==null && aEntrada[7]!==undefined){
			PrazoLEque = aEntrada[7][0]; 	
		}
		
		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};
		
		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/ req.session.usuario.empresas.length > 0){
			var aEmpresas = req.session.usuario.empresas;
			if (aEntrada[13] === null){
				aEntrada[13] = [];
			}
			for(var j = 0; j < req.session.usuario.empresas.length;j++){
				aEntrada[13].push(JSON.stringify(aEmpresas[j]));
			}
		}
		
		switch(aEntrada[14][0]){
			case "tblDominioObrigacaoAcessoriaTipo.tipo":
				stringDistinct = 'Select distinct "tblDominioObrigacaoAcessoriaTipo.tipo", "tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo" from (';
				break;
			case "tblEmpresa.nome":
				stringDistinct = 'Select distinct "tblEmpresa.nome", "tblEmpresa.id_empresa" from (';
				break;		
			case "tblDominioPais.pais":
				stringDistinct = 'Select distinct "tblDominioPais.pais", "tblDominioPais.id_dominio_pais" from (';
				break;	
			case "tblModeloObrigacao.nome_obrigacao":
				stringDistinct = 'Select distinct "tblModeloObrigacao.nome_obrigacao", "tblModeloObrigacao.id_modelo" from (';
				break;	
			case "tblDominioPeriodicidadeObrigacao.descricao":
				stringDistinct = 'Select distinct "tblDominioPeriodicidadeObrigacao.descricao", "tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao" from (';
				break;	
			case "tblDominioAnoFiscal.ano_fiscal":
				stringDistinct = 'Select distinct "tblDominioAnoFiscal.ano_fiscal", "tblDominioAnoFiscal.id_dominio_ano_fiscal" from (';
				break;	
			case "tblDominioObrigacaoStatus.descricao_obrigacao_status":
				stringDistinct = 'Select distinct "tblDominioObrigacaoStatus.descricao_obrigacao_status", "tblDominioObrigacaoStatus.id_dominio_obrigacao_status" from (';
				break;	
			case "prazo_de_entrega_calculado":
				stringDistinct = 'Select min("prazo_de_entrega_calculado") "min(prazo_de_entrega_calculado)" , max("prazo_de_entrega_calculado") "max(prazo_de_entrega_calculado)" from (';
				break;
			case "tblRespostaObrigacao.data_extensao":
				stringDistinct = 'Select min("tblRespostaObrigacao.data_extensao") "min(tblRespostaObrigacao.data_extensao)" , max("tblRespostaObrigacao.data_extensao") "max(tblRespostaObrigacao.data_extensao)" from (';
				break;	
			case "tblDominioAnoCalendario.ano_calendario":
				stringDistinct = 'Select distinct "tblDominioAnoCalendario.ano_calendario", "tblDominioAnoCalendario.id_dominio_ano_calendario" from (';
				break;				
		}
		
		var sStatement = 
			'SELECT '
			+'tblRespostaObrigacao."id_resposta_obrigacao" AS "tblRespostaObrigacao.id_resposta_obrigacao",  '
			+'tblRespostaObrigacao."suporte_contratado" AS "tblRespostaObrigacao.suporte_contratado",  '
			+'tblRespostaObrigacao."suporte_especificacao" AS "tblRespostaObrigacao.suporte_especificacao",  '
			+'tblRespostaObrigacao."suporte_valor" AS "tblRespostaObrigacao.suporte_valor",  '
			+'tblRespostaObrigacao."fk_id_dominio_moeda.id_dominio_moeda" AS "tblRespostaObrigacao.fk_id_dominio_moeda.id_dominio_moeda",  '
			+'tblRespostaObrigacao."fk_id_rel_modelo_empresa.id_rel_modelo_empresa" AS "tblRespostaObrigacao.fk_id_rel_modelo_empresa.id_rel_modelo_empresa",  '
			+'tblRespostaObrigacao."fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal" AS "tblRespostaObrigacao.fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal",  '
			+'tblRespostaObrigacao."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" AS "tblRespostaObrigacao.fk_id_dominio_ano_calendario.id_dominio_ano_calendario",  '
			+'tblRespostaObrigacao."fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status" AS "tblRespostaObrigacao.fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status",  '
			+'tblRespostaObrigacao."data_extensao" AS "tblRespostaObrigacao.data_extensao",  '
			+'tblRespostaObrigacao."data_conclusao" AS "tblRespostaObrigacao.data_conclusao",  '
			+'tblDominioMoeda."id_dominio_moeda" AS "tblDominioMoeda.id_dominio_moeda",  '
			+'tblDominioMoeda."acronimo" AS "tblDominioMoeda.acronimo",  '
			+'tblDominioMoeda."nome" AS "tblDominioMoeda.nome",  '
			+'tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" AS "tblRelModeloEmpresa.fk_id_modelo_obrigacao.id_modelo",  '
			+'tblRelModeloEmpresa."fk_id_empresa.id_empresa" AS "tblRelModeloEmpresa.fk_id_empresa.id_empresa",  '
			+'tblRelModeloEmpresa."id_rel_modelo_empresa" AS "tblRelModeloEmpresa.id_rel_modelo_empresa",  '
			+'tblRelModeloEmpresa."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" AS "tblRelModeloEmpresa.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status",  '
			+'tblRelModeloEmpresa."prazo_entrega_customizado" AS "tblRelModeloEmpresa.prazo_entrega_customizado",  '
			+'tblRelModeloEmpresa."ind_ativo" AS "tblRelModeloEmpresa.ind_ativo",  '
			+'tblDominioAnoFiscal."id_dominio_ano_fiscal" AS "tblDominioAnoFiscal.id_dominio_ano_fiscal",  '
			+'tblDominioAnoFiscal."ano_fiscal" AS "tblDominioAnoFiscal.ano_fiscal",  '
			+'tblDominioAnoCalendario."id_dominio_ano_calendario" AS "tblDominioAnoCalendario.id_dominio_ano_calendario",  '
			+'tblDominioAnoCalendario."ano_calendario" AS "tblDominioAnoCalendario.ano_calendario",  '
			+'tblModeloObrigacao."id_modelo" AS "tblModeloObrigacao.id_modelo",  '
			+'tblModeloObrigacao."nome_obrigacao" AS "tblModeloObrigacao.nome_obrigacao",  '
			+'tblModeloObrigacao."data_inicial" AS "tblModeloObrigacao.data_inicial",  '
			+'tblModeloObrigacao."data_final" AS "tblModeloObrigacao.data_final",  '
			+'tblModeloObrigacao."prazo_entrega" AS "tblModeloObrigacao.prazo_entrega",  '
			+'tblModeloObrigacao."fk_id_pais.id_pais" AS "tblModeloObrigacao.fk_id_pais.id_pais",  '
			+'tblModeloObrigacao."fk_id_dominio_periodicidade.id_periodicidade_obrigacao" AS "tblModeloObrigacao.fk_id_dominio_periodicidade.id_periodicidade_obrigacao",  '
			+'tblModeloObrigacao."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" AS "tblModeloObrigacao.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status",  '
			+'tblModeloObrigacao."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" AS "tblModeloObrigacao.fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo",  '
			+'tblDominioObrigacaoStatus."id_dominio_obrigacao_status" AS "tblDominioObrigacaoStatus.id_dominio_obrigacao_status",  '
			+'tblDominioObrigacaoStatus."descricao_obrigacao_status" AS "tblDominioObrigacaoStatus.descricao_obrigacao_status",  '
			+'tblPais."id_pais" AS "tblPais.id_pais",  '
			+'tblPais."prescricao_prejuizo" AS "tblPais.prescricao_prejuizo",  '
			+'tblPais."limite_utilizacao_prejuizo" AS "tblPais.limite_utilizacao_prejuizo",  '
			+'tblPais."prescricao_credito" AS "tblPais.prescricao_credito",  '
			+'tblPais."fk_dominio_pais.id_dominio_pais" AS "tblPais.fk_dominio_pais.id_dominio_pais",  '
			+'tblPais."fk_dominio_pais_status.id_dominio_pais_status" AS "tblPais.fk_dominio_pais_status.id_dominio_pais_status",  '
			+'tblPais."fk_aliquota.id_aliquota" AS "tblPais.fk_aliquota.id_aliquota",  '
			+'tblPais."fk_dominio_pais_regiao.id_dominio_pais_regiao" AS "tblPais.fk_dominio_pais_regiao.id_dominio_pais_regiao",  '
			+'tblPais."ind_extensao_compliance" AS "tblPais.ind_extensao_compliance",  '
			+'tblPais."ind_extensao_beps" AS "tblPais.ind_extensao_beps",  '
			+'tblPais."ano_obrigacao_compliance" AS "tblPais.ano_obrigacao_compliance",  '
			+'tblPais."ano_obrigacao_beps" AS "tblPais.ano_obrigacao_beps",  '
			+'tblDominioPais."id_dominio_pais" AS "tblDominioPais.id_dominio_pais",  '
			+'tblDominioPais."pais" AS "tblDominioPais.pais",  '
			+'tblDominioPeriodicidadeObrigacao."id_periodicidade_obrigacao" AS "tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao",  '
			+'tblDominioPeriodicidadeObrigacao."descricao" AS "tblDominioPeriodicidadeObrigacao.descricao",  '
			+'tblEmpresa."id_empresa" AS "tblEmpresa.id_empresa",  '
			+'tblEmpresa."nome" AS "tblEmpresa.nome",  '
			+'tblEmpresa."num_hfm_sap" AS "tblEmpresa.num_hfm_sap",  '
			+'tblEmpresa."tin" AS "tblEmpresa.tin",  '
			+'tblEmpresa."jurisdicao_tin" AS "tblEmpresa.jurisdicao_tin",  '
			+'tblEmpresa."ni" AS "tblEmpresa.ni",  '
			+'tblEmpresa."jurisdicao_ni" AS "tblEmpresa.jurisdicao_ni",  '
			+'tblEmpresa."endereco" AS "tblEmpresa.endereco",  '
			+'tblEmpresa."fy_start_date" AS "tblEmpresa.fy_start_date",  '
			+'tblEmpresa."fy_end_date" AS "tblEmpresa.fy_end_date",  '
			+'tblEmpresa."lbc_nome" AS "tblEmpresa.lbc_nome",  '
			+'tblEmpresa."lbc_email" AS "tblEmpresa.lbc_email",  '
			+'tblEmpresa."comentarios" AS "tblEmpresa.comentarios",  '
			+'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" AS "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario",  '
			+'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" AS "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status",  '
			+'tblEmpresa."fk_aliquota.id_aliquota" AS "tblEmpresa.fk_aliquota.id_aliquota",  '
			+'tblEmpresa."fk_pais.id_pais" AS "tblEmpresa.fk_pais.id_pais", '
			+'COALESCE(tblRelModeloEmpresa."prazo_entrega_customizado", tblModeloObrigacao."prazo_entrega") AS "prazo_de_entrega_calculado", '
			+'tblDominioObrigacaoAcessoriaTipo."id_dominio_obrigacao_acessoria_tipo" AS "tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo", '
			+'tblDominioObrigacaoAcessoriaTipo."tipo" AS "tblDominioObrigacaoAcessoriaTipo.tipo" '
			+'FROM "VGT.RESPOSTA_OBRIGACAO" AS tblRespostaObrigacao '
			+'LEFT OUTER JOIN "VGT.DOMINIO_MOEDA" AS tblDominioMoeda '
			+'ON tblRespostaObrigacao."fk_id_dominio_moeda.id_dominio_moeda" = tblDominioMoeda."id_dominio_moeda" '
			+'LEFT OUTER JOIN "VGT.REL_MODELO_EMPRESA" AS tblRelModeloEmpresa '
			+'ON tblRespostaObrigacao."fk_id_rel_modelo_empresa.id_rel_modelo_empresa" = tblRelModeloEmpresa."id_rel_modelo_empresa" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_ANO_FISCAL" AS tblDominioAnoFiscal '
			+'ON tblRespostaObrigacao."fk_id_dominio_ano_fiscal.id_dominio_ano_fiscal" = tblDominioAnoFiscal."id_dominio_ano_fiscal" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_ANO_CALENDARIO" AS tblDominioAnoCalendario '
			+'ON tblRespostaObrigacao."fk_id_dominio_ano_calendario.id_dominio_ano_calendario" = tblDominioAnoCalendario."id_dominio_ano_calendario" '
			+'LEFT OUTER JOIN "VGT.MODELO_OBRIGACAO" AS tblModeloObrigacao '
			+'ON tblRelModeloEmpresa."fk_id_modelo_obrigacao.id_modelo" = tblModeloObrigacao."id_modelo" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_OBRIGACAO_STATUS" AS tblDominioObrigacaoStatus '
			+'ON tblRespostaObrigacao."fk_id_dominio_obrigacao_status_resposta.id_dominio_obrigacao_status" = tblDominioObrigacaoStatus."id_dominio_obrigacao_status" '
			+'LEFT OUTER JOIN "VGT.PAIS" AS tblPais '
			+'ON tblModeloObrigacao."fk_id_pais.id_pais" = tblPais."id_pais" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_PAIS" AS tblDominioPais '
			+'ON tblPais."fk_dominio_pais.id_dominio_pais" = tblDominioPais."id_dominio_pais" '
			+'left outer JOIN "VGT.DOMINIO_PERIODICIDADE_OBRIGACAO" AS tblDominioPeriodicidadeObrigacao '
			+'ON tblModeloObrigacao."fk_id_dominio_periodicidade.id_periodicidade_obrigacao" = tblDominioPeriodicidadeObrigacao."id_periodicidade_obrigacao" '
			+'left outer JOIN "VGT.EMPRESA" AS tblEmpresa '
			+'ON tblRelModeloEmpresa."fk_id_empresa.id_empresa" = tblEmpresa."id_empresa" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_OBRIGACAO_ACESSORIA_TIPO" AS tblDominioObrigacaoAcessoriaTipo '
			+'on tblDominioObrigacaoAcessoriaTipo."id_dominio_obrigacao_acessoria_tipo" = tblModeloObrigacao."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" ';


		for (var i = 0; i < aEntrada.length - 1; i++) {
			filtro = "";
			if (aEntrada[i] !== null){
				stringtemporaria = "";
				for (var k = 0; k < aEntrada[i].length; k++) {
					switch (i){
						case 0:
							filtro = ' tblModeloObrigacao."fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" = ? ';
							break;
						case 1:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;
						case 2:
							filtro = ' tblDominioPais."id_dominio_pais" = ? ';
							break;
						case 3:
							filtro = ' tblModeloObrigacao."id_modelo" =  ? ';
							break;
						case 4:
							filtro = ' tblDominioPeriodicidadeObrigacao."id_periodicidade_obrigacao" = ? ';
							break;
						case 5:
							filtro = ' tblDominioAnoFiscal."id_dominio_ano_fiscal" = ? ';
							break;
					/*	case 6:
							filtro = ' tblObrigacao."prazo_entrega" >=  ? ';
							break;
						case 7:
							filtro = ' tblObrigacao."prazo_entrega" <= ? ';
							break;*/
						case 8:
							filtro = ' tblRespostaObrigacao."data_extensao" >= ? ';
							break;
						case 9:
							filtro = ' tblRespostaObrigacao."data_extensao" <= ? ';
							break;
						case 10:
							filtro = ' tblDominioObrigacaoStatus."id_dominio_obrigacao_status" = ? ';
							break;	
						case 11:
							filtro = ' tblDominioAnoCalendario."id_dominio_ano_calendario" = ? ';
							break;		
						case 12:
							if(aEntrada[i][k]==="true"){
								filtro = ' tblRespostaObrigacao."suporte_contratado" = ? ';
							}
							else{
								filtro = ' (tblRespostaObrigacao."suporte_contratado" = ? or tblRespostaObrigacao."suporte_contratado" is NULL) ';
							}
							break;		
						case 13:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;								
					}
					if(i !== 6 && i !== 7){	
						if(aEntrada[i].length == 1){
							oWhere.push(filtro);
							aParams.push(aEntrada[i][k]);								
						}	 
						else{
							k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
							aParams.push(aEntrada[i][k]);
						}
					}	
				}	
			}
		}
		
		sStatement += ' where tblModeloObrigacao."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" = 2 and tblRelModeloEmpresa."ind_ativo" = true and tblDominioAnoCalendario."ano_calendario" <= year(CURRENT_DATE) + 1';
		
		if (oWhere.length > 0) {
			sStatement += ' and ';

			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}
		
		if(PrazoGEque!==null || PrazoLEque!==null){
			sStatement = 'select * from (' + sStatement + ') where ';
			if(PrazoGEque!==null){
				//sStatement+=' "prazo_de_entrega_calculado" >=  ? ';
				sStatement+=' (EXTRACT(month from "prazo_de_entrega_calculado") > EXTRACT(month from ?) or ((EXTRACT(month from "prazo_de_entrega_calculado") = EXTRACT(month from ?)) and (EXTRACT(day from "prazo_de_entrega_calculado") >= EXTRACT(day from ?)))) ';
				aParams.push(PrazoGEque);
				aParams.push(PrazoGEque);
				aParams.push(PrazoGEque);
			}
			if(PrazoGEque!==null && PrazoLEque!==null){
				sStatement+=' and ';
			}
			if(PrazoLEque!==null){
				//sStatement+=' "prazo_de_entrega_calculado" <=  ? ';
				sStatement+='(EXTRACT(month from "prazo_de_entrega_calculado") < EXTRACT(month from ?) or ((EXTRACT(month from "prazo_de_entrega_calculado") = EXTRACT(month from ?)) and (EXTRACT(day from "prazo_de_entrega_calculado") <= EXTRACT(day from ?))))';
				aParams.push(PrazoLEque);
				aParams.push(PrazoLEque);
				aParams.push(PrazoLEque);
			}
		}		
		
		sStatement = stringDistinct + sStatement + ")";
		
		//sStatement+=' order by tblDominioPais."pais" , tblEmpresa."nome"';
		
		db.executeStatement({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},
	deepQueryNewDistinct: function (req, res) {
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var stringDistinct = "";
		var stringDistinctFilter = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];
		var PrazoGEque = null;
		var PrazoLEque = null;
		
		if(aEntrada[6]!==null && aEntrada[6]!==undefined){
			PrazoGEque = aEntrada[6][0]; 
		}
		if(aEntrada[7]!==null && aEntrada[7]!==undefined){
			PrazoLEque = aEntrada[7][0]; 	
		}
		
		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};
		
		if (!isFull() && /*req.session.usuario.nivelAcesso === 0 &&*/ req.session.usuario.empresas.length > 0){
			var aEmpresas = req.session.usuario.empresas;
			if (aEntrada[13] === null){
				aEntrada[13] = [];
			}
			for(var j = 0; j < req.session.usuario.empresas.length;j++){
				aEntrada[13].push(JSON.stringify(aEmpresas[j]));
			}
		}
		var posicaoDoArrayParaDistinct = 19;
		if(aEntrada[posicaoDoArrayParaDistinct] == null || aEntrada[posicaoDoArrayParaDistinct] == undefined){
			stringDistinct = 
				'Select '
				+'"tblDominioMoeda.nome", '
				+'"tblDominioMoeda.acronimo", '
				+'"tblDocumentoObrigacao.ind_conclusao", '
				+'"tblDocumentoObrigacao.data_upload", '
				+'"tblDominioObrigacaoAcessoriaTipo.tipo", '
				+'"tblDominioPais.pais", '
				+'"tblDominioPeriodicidadeObrigacao.descricao", '
				+'"tblDominioObrigacaoStatus.descricao_obrigacao_status" , '
				+'"tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo", '
				+'"tblEmpresa.nome", '
				+'"tblEmpresa.id_empresa", '
				+'"tblDominioPais.id_dominio_pais", '
				+'"tblModeloObrigacao.nome_obrigacao", '
				+'"tblModeloObrigacao.id_modelo", '
				+'"tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao", '
				+'"tblDominioAnoFiscal.ano_fiscal", '
				+'"tblDominioAnoFiscal.id_dominio_ano_fiscal", '
				+'"tblDominioAnoCalendario.id_dominio_ano_calendario", '
				+'"tblDominioAnoCalendario.ano_calendario", '
				+'"prazo_de_entrega_calculado", '
				+'"tblRespostaObrigacao.data_extensao", '
				+'"tblDominioObrigacaoStatus.id_dominio_obrigacao_status", '
				+'"tblRespostaObrigacao.suporte_contratado", '
				+'"tblRespostaObrigacao.suporte_especificacao", '
				+'"tblRespostaObrigacao.suporte_valor", '
				+'"tblRespostaObrigacao.data_conclusao", '
				+'"tblResposataObrigacao.fk_id_dominio_moeda.id_dominio_moeda", '
				+'"tblRespostaObrigacao.id_resposta_obrigacao" '
				+'from (';	
			stringDistinctFilter = 'order by "tblDominioObrigacaoAcessoriaTipo.tipo","tblDominioPais.pais" ,"tblEmpresa.nome" asc, "tblDominioAnoCalendario.ano_calendario" desc';
		}
		else{
			switch(aEntrada[posicaoDoArrayParaDistinct][0]){
				case "tblDominioObrigacaoAcessoriaTipo.tipo":
					stringDistinct = 'Select distinct "tblDominioObrigacaoAcessoriaTipo.tipo", "tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo" from (';
					break;
				case "tblEmpresa.nome":
					stringDistinct = 'Select distinct "tblEmpresa.nome", "tblEmpresa.id_empresa" from (';
					break;		
				case "tblDominioPais.pais":
					stringDistinct = 'Select distinct "tblDominioPais.pais", "tblDominioPais.id_dominio_pais" from (';
					break;	
				case "tblModeloObrigacao.nome_obrigacao":
					stringDistinct = 'Select distinct "tblModeloObrigacao.nome_obrigacao", "tblModeloObrigacao.id_modelo","tblDominioPais.pais", "tblDominioPais.id_dominio_pais" from (';
					break;	
				case "tblDominioPeriodicidadeObrigacao.descricao":
					stringDistinct = 'Select distinct "tblDominioPeriodicidadeObrigacao.descricao", "tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao" from (';
					break;	
				case "tblDominioAnoFiscal.ano_fiscal":
					stringDistinct = 'Select distinct "tblDominioAnoFiscal.ano_fiscal", "tblDominioAnoFiscal.id_dominio_ano_fiscal" from (';
					break;	
				case "tblDominioObrigacaoStatus.descricao_obrigacao_status":
					stringDistinct = 'Select distinct "tblDominioObrigacaoStatus.descricao_obrigacao_status", "tblDominioObrigacaoStatus.id_dominio_obrigacao_status" from (';
					break;	
				case "prazo_de_entrega_calculado":
					stringDistinct = 'Select min("prazo_de_entrega_calculado") "min(prazo_de_entrega_calculado)" , max("prazo_de_entrega_calculado") "max(prazo_de_entrega_calculado)" from (';
					break;
				case "tblRespostaObrigacao.data_extensao":
					stringDistinct = 'Select min("tblRespostaObrigacao.data_extensao") "min(tblRespostaObrigacao.data_extensao)" , max("tblRespostaObrigacao.data_extensao") "max(tblRespostaObrigacao.data_extensao)" from (';
					break;	
				case "tblDominioAnoCalendario.ano_calendario":
					stringDistinct = 'Select distinct "tblDominioAnoCalendario.ano_calendario", "tblDominioAnoCalendario.id_dominio_ano_calendario" from (';
					break;		
				case "tblDominioMoeda.nome":
					stringDistinct = 'Select distinct "tblResposataObrigacao.fk_id_dominio_moeda.id_dominio_moeda" , "tblDominioMoeda.acronimo" , "tblDominioMoeda.nome" from (';
					break;
				case "tblRespostaObrigacao.data_conclusao":
					stringDistinct = 'Select min("tblRespostaObrigacao.data_conclusao") "min(tblRespostaObrigacao.data_conclusao)" , max("tblRespostaObrigacao.data_conclusao") "max(tblRespostaObrigacao.data_conclusao)" from (';
					break;	
				case "tblDocumentoObrigacao.data_upload":
					stringDistinct = 'Select min("tblDocumentoObrigacao.data_upload") "min(tblDocumentoObrigacao.data_upload)" , max("tblDocumentoObrigacao.data_upload") "max(tblDocumentoObrigacao.data_upload)" from (';
					break;						
			}			
		}		

		
		var sStatement = 
			'Select '
			+'"nome" AS "tblDominioMoeda.nome", '
			+'"acronimo" AS "tblDominioMoeda.acronimo", '
			+'"ind_conclusao" AS "tblDocumentoObrigacao.ind_conclusao", '
			+'"data_upload" AS "tblDocumentoObrigacao.data_upload", '
			+'* '
			+'from '
			+'( '	
			+'Select *, '
			+'"tipo" AS "tblDominioObrigacaoAcessoriaTipo.tipo", '
			+'"pais" AS "tblDominioPais.pais", '
			+'"descricao" AS "tblDominioPeriodicidadeObrigacao.descricao", '
			+'"descricao_obrigacao_status" AS "tblDominioObrigacaoStatus.descricao_obrigacao_status" '
			+'from  '
			+'(	'
			+'SELECT '
			+'"fk_id_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" AS "tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo", '
			+'"nome" AS "tblEmpresa.nome", '
			+'"fk_id_empresa.id_empresa" AS "tblEmpresa.id_empresa", '
			+'"fk_dominio_pais.id_dominio_pais" AS "tblDominioPais.id_dominio_pais", '
			+'"nome_obrigacao" AS "tblModeloObrigacao.nome_obrigacao", '
			+'"id_modelo" AS "tblModeloObrigacao.id_modelo", '
			+'"fk_id_dominio_periodicidade.id_periodicidade_obrigacao" AS "tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao", '
			+'"ano_fiscal_calculado" AS "tblDominioAnoFiscal.ano_fiscal", '
			+'"id_ano_fiscal_calculado" AS "tblDominioAnoFiscal.id_dominio_ano_fiscal", '
			+'"id_dominio_ano_calendario" AS "tblDominioAnoCalendario.id_dominio_ano_calendario", '
			+'"ano_calendario" AS "tblDominioAnoCalendario.ano_calendario", '
			+'"prazo_entrega_calculado" AS "prazo_de_entrega_calculado", '
			+'"data_extensao" AS "tblRespostaObrigacao.data_extensao", '
			+'"status_obrigacao_calculado" AS "tblDominioObrigacaoStatus.id_dominio_obrigacao_status", '
			+'"suporte_contratado" AS "tblRespostaObrigacao.suporte_contratado", '
			+'"suporte_especificacao" AS "tblRespostaObrigacao.suporte_especificacao", '
			+'"suporte_valor" AS "tblRespostaObrigacao.suporte_valor", '
			+'"data_conclusao" AS "tblRespostaObrigacao.data_conclusao", '
			+'"fk_id_dominio_moeda.id_dominio_moeda" AS "tblResposataObrigacao.fk_id_dominio_moeda.id_dominio_moeda", '
			+'"id_resposta_obrigacao" AS "tblRespostaObrigacao.id_resposta_obrigacao" '
			+' from ('
			+model.pegarQueryRespostaObrigacaoCalculada()
			+'))t3 '
			+'LEFT OUTER JOIN "VGT.DOMINIO_OBRIGACAO_ACESSORIA_TIPO" tblDominioObrigacaoAcessoriaTipo ON tblDominioObrigacaoAcessoriaTipo."id_dominio_obrigacao_acessoria_tipo" = t3."tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_PAIS" tblDominioPais ON tblDominioPais."id_dominio_pais" = t3."tblDominioPais.id_dominio_pais" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_PERIODICIDADE_OBRIGACAO" tblDominioPeriodicidadeObrigacao ON tblDominioPeriodicidadeObrigacao."id_periodicidade_obrigacao" = t3."tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_OBRIGACAO_STATUS" tblDominioObrigacaoStatus ON tblDominioObrigacaoStatus."id_dominio_obrigacao_status" = t3."tblDominioObrigacaoStatus.id_dominio_obrigacao_status" '
			+')t4 '
			+'LEFT OUTER JOIN "VGT.DOMINIO_MOEDA" tblDominioMoeda ON tblDominioMoeda."id_dominio_moeda" = t4."tblResposataObrigacao.fk_id_dominio_moeda.id_dominio_moeda" '
			+'LEFT OUTER JOIN "VGT.DOCUMENTO_OBRIGACAO" tblDocumentoObrigacao '
			+ 'ON tblDocumentoObrigacao."fk_id_resposta_obrigacao.id_resposta_obrigacao" = t4."tblRespostaObrigacao.id_resposta_obrigacao" '
			+ 'and tblDocumentoObrigacao."ind_conclusao" = true ';



		for (var i = 0; i < aEntrada.length - 1; i++) {
			filtro = "";
			if (aEntrada[i] !== null){
				stringtemporaria = "";
				for (var k = 0; k < aEntrada[i].length; k++) {
					switch (i){
						case 0:
							filtro = ' "tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo" = ? ';
							break;
						case 1:
							filtro = ' "tblEmpresa.id_empresa" = ? ';
							break;
						case 2:
							filtro = ' "tblDominioPais.id_dominio_pais" = ? ';
							break;
						case 3:
							filtro = ' "tblModeloObrigacao.id_modelo" =  ? ';
							break;
						case 4:
							filtro = ' "tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao" = ? ';
							break;
						case 5:
							filtro = ' "tblDominioAnoFiscal.id_dominio_ano_fiscal" = ? ';
							break;
					/*	case 6:
							filtro = ' tblObrigacao."prazo_entrega" >=  ? ';
							break;
						case 7:
							filtro = ' tblObrigacao."prazo_entrega" <= ? ';
							break;*/
						case 8:
							filtro = ' "tblRespostaObrigacao.data_extensao" >= ? ';
							break;
						case 9:
							filtro = ' "tblRespostaObrigacao.data_extensao" <= ? ';
							break;
						case 10:
							filtro = ' "tblDominioObrigacaoStatus.id_dominio_obrigacao_status" = ? ';
							break;	
						case 11:
							filtro = ' "tblDominioAnoCalendario.id_dominio_ano_calendario" = ? ';
							break;		
						case 12:
							if(aEntrada[i][k]==="true"){
								filtro = ' "tblRespostaObrigacao.suporte_contratado" = ? ';
							}
							else{
								filtro = ' ("tblRespostaObrigacao.suporte_contratado" = ? or "tblRespostaObrigacao.suporte_contratado" is NULL) ';
							}
							break;		
						case 13:
							filtro = ' "tblEmpresa.id_empresa" = ? ';
							break;		
						case 14:
							filtro = ' "tblResposataObrigacao.fk_id_dominio_moeda.id_dominio_moeda" = ? ';
							break;	
						case 15:
							filtro = ' "tblRespostaObrigacao.data_conclusao" >= ? ';
							break;
						case 16:
							filtro = ' "tblRespostaObrigacao.data_conclusao" <= ? ';
							break;	
						case 17:
							filtro = ' "tblDocumentoObrigacao.data_upload" >= ? and "tblDocumentoObrigacao.ind_conclusao" = true';
							break;
						case 18:
							filtro = ' "tblDocumentoObrigacao.data_upload" <= ? and "tblDocumentoObrigacao.ind_conclusao" = true';
							break;							
					}
					if(i !== 6 && i !== 7){	
						if(aEntrada[i].length == 1){
							oWhere.push(filtro);
							aParams.push(aEntrada[i][k]);								
						}	 
						else{
							k == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : k == aEntrada[i].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
							aParams.push(aEntrada[i][k]);
						}
					}	
				}	
			}
		}
		
		//sStatement += ' where tblModeloObrigacao."fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status" = 2 and tblRelModeloEmpresa."ind_ativo" = true and tblDominioAnoCalendario."ano_calendario" <= year(CURRENT_DATE) + 1';
		
		if (oWhere.length > 0) {
			sStatement += ' where ';

			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}
		
		if(PrazoGEque!==null || PrazoLEque!==null){
			sStatement = 'select * from (' + sStatement + ') where ';
			if(PrazoGEque!==null){
				//sStatement+=' "prazo_de_entrega_calculado" >=  ? ';
				sStatement+=' (EXTRACT(month from "prazo_de_entrega_calculado") > EXTRACT(month from ?) or ((EXTRACT(month from "prazo_de_entrega_calculado") = EXTRACT(month from ?)) and (EXTRACT(day from "prazo_de_entrega_calculado") >= EXTRACT(day from ?)))) ';
				aParams.push(PrazoGEque);
				aParams.push(PrazoGEque);
				aParams.push(PrazoGEque);
			}
			if(PrazoGEque!==null && PrazoLEque!==null){
				sStatement+=' and ';
			}
			if(PrazoLEque!==null){
				//sStatement+=' "prazo_de_entrega_calculado" <=  ? ';
				sStatement+='(EXTRACT(month from "prazo_de_entrega_calculado") < EXTRACT(month from ?) or ((EXTRACT(month from "prazo_de_entrega_calculado") = EXTRACT(month from ?)) and (EXTRACT(day from "prazo_de_entrega_calculado") <= EXTRACT(day from ?))))';
				aParams.push(PrazoLEque);
				aParams.push(PrazoLEque);
				aParams.push(PrazoLEque);
			}
		}		
		
		sStatement = stringDistinct + sStatement + ")" + stringDistinctFilter;
		
		//sStatement+=' order by tblDominioPais."pais" , tblEmpresa."nome"';
		
		db.executeStatement({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	}	
};