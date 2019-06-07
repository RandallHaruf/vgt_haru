"use strict";
var db = require("../db");
//var model = require("../models/modelReportObrigacao");
var model = require("../models/modelRespostaObrigacao");

module.exports = {

	deepQueryNewDistinct: function (req, res) {
		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var stringDistinct = "";
		var stringDistinctFilter = "";
		var stringInnerJoinModulo = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : {};
		var PrazoGEque = null;
		var PrazoLEque = null;

		const isFull = function () {
			return (req.query && req.query.full && req.query.full == "true");
		};
		
		if (!isFull() && req.session.usuario.empresas.length > 0){
			var aEmpresas = req.session.usuario.empresas;

			aEntrada.EmpresasUsuario = [];
			for(var j = 0; j < req.session.usuario.empresas.length;j++){
				aEntrada.EmpresasUsuario.push(JSON.stringify(aEmpresas[j]));
			}			
			if(req.query.moduloAtual){
				stringInnerJoinModulo = 
				'INNER JOIN "VGT.REL_EMPRESA_MODULO" AS tblRelEmpresaModulo '
				+'ON t3."tblEmpresa.id_empresa" = tblRelEmpresaModulo."fk_empresa.id_empresa" and tblRelEmpresaModulo."fk_dominio_modulo.id_dominio_modulo" in (3,4) ';
			}				
		}

		if(!!!aEntrada.Distinct){	
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
			stringDistinctFilter = 
				'group by '
				+'"tblDominioMoeda.nome", '
				+'"tblDominioMoeda.acronimo", '
				+'"tblDocumentoObrigacao.ind_conclusao", '
				+'"tblDocumentoObrigacao.data_upload", '
				+'"tblDominioObrigacaoAcessoriaTipo.tipo", '
				+'"tblDominioPais.pais", '
				+'"tblDominioPeriodicidadeObrigacao.descricao", '
				+'"tblDominioObrigacaoStatus.descricao_obrigacao_status", '
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
				+'order by "tblDominioObrigacaoAcessoriaTipo.tipo","tblDominioPais.pais" ,"tblEmpresa.nome" asc, "tblDominioAnoCalendario.ano_calendario" desc';
		}
		else{
			switch(aEntrada.Distinct[0]){			
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
			+stringInnerJoinModulo
			+'LEFT OUTER JOIN "VGT.DOMINIO_OBRIGACAO_ACESSORIA_TIPO" tblDominioObrigacaoAcessoriaTipo ON tblDominioObrigacaoAcessoriaTipo."id_dominio_obrigacao_acessoria_tipo" = t3."tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_PAIS" tblDominioPais ON tblDominioPais."id_dominio_pais" = t3."tblDominioPais.id_dominio_pais" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_PERIODICIDADE_OBRIGACAO" tblDominioPeriodicidadeObrigacao ON tblDominioPeriodicidadeObrigacao."id_periodicidade_obrigacao" = t3."tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao" '
			+'LEFT OUTER JOIN "VGT.DOMINIO_OBRIGACAO_STATUS" tblDominioObrigacaoStatus ON tblDominioObrigacaoStatus."id_dominio_obrigacao_status" = t3."tblDominioObrigacaoStatus.id_dominio_obrigacao_status" '
			+')t4 '
			+'LEFT OUTER JOIN "VGT.DOMINIO_MOEDA" tblDominioMoeda ON tblDominioMoeda."id_dominio_moeda" = t4."tblResposataObrigacao.fk_id_dominio_moeda.id_dominio_moeda" '
			+'LEFT OUTER JOIN "VGT.DOCUMENTO_OBRIGACAO" tblDocumentoObrigacao '
			+ 'ON tblDocumentoObrigacao."fk_id_resposta_obrigacao.id_resposta_obrigacao" = t4."tblRespostaObrigacao.id_resposta_obrigacao" '
			+ 'and tblDocumentoObrigacao."ind_conclusao" = true ';

	
		var pulaAtributo;
		for (var atributo in aEntrada){
			filtro = "";
			stringtemporaria = "";
			var pulaAtributo = false;			
			for(var item in aEntrada[atributo]){
				switch (atributo){
					case "ObrigacaoAcessoriaTipo":
						filtro = ' "tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo" = ? ';
						break;
					case "Empresa":
						filtro = ' "tblEmpresa.id_empresa" = ? ';
						break;
					case "Pais":
						filtro = ' "tblDominioPais.id_dominio_pais" = ? ';
						break;
					case "ObrigacaoAcessoria":
						filtro = ' "tblModeloObrigacao.id_modelo" =  ? ';
						break;
					case "Periodicidade":
						filtro = ' "tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao" = ? ';
						break;
					case "AnoFiscal":
						filtro = ' "tblDominioAnoFiscal.id_dominio_ano_fiscal" = ? ';
						break;
					case "DataExtensaoInicio":
						filtro = ' "tblRespostaObrigacao.data_extensao" >= ? ';
						break;
					case "DataExtensaoFim":
						filtro = ' "tblRespostaObrigacao.data_extensao" <= ? ';
						break;
					case "StatusObrigacao":
						filtro = ' "tblDominioObrigacaoStatus.id_dominio_obrigacao_status" = ? ';
						break;	
					case "AnoCalendario":
						filtro = ' "tblDominioAnoCalendario.id_dominio_ano_calendario" = ? ';
						break;		
					case "CheckSuporteContratado":
						if(aEntrada[i][k]==="true"){
							filtro = ' "tblRespostaObrigacao.suporte_contratado" = ? ';
						}
						else{
							filtro = ' ("tblRespostaObrigacao.suporte_contratado" = ? or "tblRespostaObrigacao.suporte_contratado" is NULL) ';
						}
						break;		
					case "EmpresasUsuario":
						filtro = ' "tblEmpresa.id_empresa" = ? ';
						break;		
					case "Moeda":
						filtro = ' "tblResposataObrigacao.fk_id_dominio_moeda.id_dominio_moeda" = ? ';
						break;	
					case "DataConclusaoInicio":
						filtro = ' "tblRespostaObrigacao.data_conclusao" >= ? ';
						break;
					case "DataConclusaoFim":
						filtro = ' "tblRespostaObrigacao.data_conclusao" <= ? ';
						break;	
					case "DataUploadInicio":
						filtro = ' "tblDocumentoObrigacao.data_upload" >= ? and "tblDocumentoObrigacao.ind_conclusao" = true';
						break;
					case "DataUploadFim":
						filtro = ' "tblDocumentoObrigacao.data_upload" <= ? and "tblDocumentoObrigacao.ind_conclusao" = true';
						break;	
					default:
						pulaAtributo = true;
						break;
				}	
				if(!pulaAtributo){
					if(aEntrada[atributo].length == 1){
						oWhere.push(filtro);
						if(aEntrada[atributo][0] != ""){
							aParams.push(aEntrada[atributo][0]);	
						}	
					}else{
						item == 0 ? stringtemporaria = stringtemporaria + '(' + filtro : item == aEntrada[atributo].length - 1 ? (stringtemporaria = stringtemporaria +  ' or' + filtro + ')' , oWhere.push(stringtemporaria)) : stringtemporaria = stringtemporaria +  ' or' + filtro; 
						if(aEntrada[atributo][item] != ""){
							aParams.push(aEntrada[atributo][item]);	
						}
					}						
				}
			}
		}	

		if (oWhere.length > 0) {
			sStatement += ' where ';

			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}
		
		if(!!aEntrada.DataPrazoEntregaInicio){
			PrazoGEque = aEntrada.DataPrazoEntregaInicio[0]; 
		}
		if(!!aEntrada.DataPrazoEntregaFim){
			PrazoLEque = aEntrada.DataPrazoEntregaFim[0]; 	
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
		
		sStatement = stringDistinct + sStatement + ")" + stringDistinctFilter;
		
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