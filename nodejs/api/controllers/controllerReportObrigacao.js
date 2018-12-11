"use strict";
var db = require("../db");
//var model = require("../models/modelReportObrigacao");

module.exports = {

	deepQuery: function (req, res) {
	
		var sStatement = 
			'select '
			+'tblObrigacao."id_obrigacao" "tblObrigacao.id_obrigacao", '
			+'tblObrigacao."prazo_entrega" "tblObrigacao.prazo_entrega", '
			+'tblObrigacao."extensao" "tblObrigacao.extensao", '
			+'tblObrigacao."obrigacao_inicial" "tblObrigacao.obrigacao_inicial", '
			+'tblObrigacao."suporte_contratado" "tblObrigacao.suporte_contratado", '
			+'tblObrigacao."suporte" "tblObrigacao.suporte", '
			+'tblObrigacao."observacoes" "tblObrigacao.observacoes", '
			+'tblObrigacao."fk_dominio_status_obrigacao.id_status_obrigacao" "tblObrigacao.fk_dominio_status_obrigacao.id_status_obrigacao", '
			+'tblObrigacao."fk_dominio_pais.id_dominio_pais" "tblObrigacao.fk_dominio_pais.id_dominio_pais", '
			+'tblObrigacao."fk_dominio_periodicidade_obrigacao.id_periodicidade_obrigacao" "tblObrigacao.fk_dominio_periodicidade_obrigacao.id_periodicidade_obrigacao", '
			+'tblObrigacao."fk_empresa.id_empresa" "tblObrigacao.fk_empresa.id_empresa", '
			+'tblObrigacao."fk_obrigacao_acessoria.id_obrigacao_acessoria" "tblObrigacao.fk_obrigacao_acessoria.id_obrigacao_acessoria", '
			+'tblObrigacao."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" "tblObrigacao.fk_dominio_ano_fiscal.id_dominio_ano_fiscal", '
			+'tblObrigacao."fk_dominio_aprovacao_obrigacao.id_aprovacao_obrigacao" "tblObrigacao.fk_dominio_aprovacao_obrigacao.id_aprovacao_obrigacao", '
			+'tblObrigacao."motivo_reprovacao" "tblObrigacao.motivo_reprovacao", '
			+'tblDominioStatusObrigacao."id_status_obrigacao" "tblDominioStatusObrigacao.id_status_obrigacao", '
			+'tblDominioStatusObrigacao."descricao" "tblDominioStatusObrigacao.descricao", '
			+'tblDominioPais."id_dominio_pais" "tblDominioPais.id_dominio_pais",'
			+'tblDominioPais."pais" "tblDominioPais.pais",'
			+'tblDominioPeriodicidadeObrigacao."id_periodicidade_obrigacao" "tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao",  '
			+'tblDominioPeriodicidadeObrigacao."descricao" "tblDominioPeriodicidadeObrigacao.descricao", '
			+'tblEmpresa."id_empresa" "tblEmpresa.id_empresa", '
			+'tblEmpresa."nome" "tblEmpresa.nome", '
			+'tblEmpresa."num_hfm_sap" "tblEmpresa.num_hfm_sap", '
			+'tblEmpresa."tin" "tblEmpresa.tin", '
			+'tblEmpresa."jurisdicao_tin" "tblEmpresa.jurisdicao_tin", '
			+'tblEmpresa."ni" "tblEmpresa.ni", '
			+'tblEmpresa."jurisdicao_ni" "tblEmpresa.jurisdicao_ni", '
			+'tblEmpresa."endereco" "tblEmpresa.endereco", '
			+'tblEmpresa."fy_start_date" "tblEmpresa.fy_start_date", '
			+'tblEmpresa."fy_end_date" "tblEmpresa.fy_end_date", '
			+'tblEmpresa."lbc_nome" "tblEmpresa.lbc_nome", '
			+'tblEmpresa."lbc_email" "tblEmpresa.lbc_email", '
			+'tblEmpresa."comentarios" "tblEmpresa.comentarios", '
			+'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario", '
			+'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status", '
			+'tblEmpresa."fk_aliquota.id_aliquota" "tblEmpresa.fk_aliquota.id_aliquota", '
			+'tblEmpresa."fk_pais.id_pais" "tblEmpresa.fk_pais.id_pais", '
			+'tblObrigacaoAcessoria."id_obrigacao_acessoria" "tblObrigacaoAcessoria.id_obrigacao_acessoria", '
			+'tblObrigacaoAcessoria."nome" "tblObrigacaoAcessoria.nome", '
			+'tblObrigacaoAcessoria."data_inicio" "tblObrigacaoAcessoria.data_inicio", '
			+'tblObrigacaoAcessoria."fk_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" "tblObrigacaoAcessoria.fk_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo", '
			+'tblObrigacaoAcessoria."data_fim" "tblObrigacaoAcessoria.data_fim", '
			+'tblDominioAnoFiscal."id_dominio_ano_fiscal" "tblDominioAnoFiscal.id_dominio_ano_fiscal", '
			+'tblDominioAnoFiscal."ano_fiscal" "tblDominioAnoFiscal.ano_fiscal", '
			+'tblDominioObrigacaoAcessoriaTipo."id_dominio_obrigacao_acessoria_tipo" "tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo", '
			+'tblDominioObrigacaoAcessoriaTipo."tipo" "tblDominioObrigacaoAcessoriaTipo.tipo" '
			+'from "VGT.OBRIGACAO" tblObrigacao  '
			+'left outer join "VGT.DOMINIO_STATUS_OBRIGACAO" tblDominioStatusObrigacao on tblObrigacao."fk_dominio_status_obrigacao.id_status_obrigacao" = tblDominioStatusObrigacao."id_status_obrigacao"  '
			+'left outer join "VGT.DOMINIO_PAIS" tblDominioPais  on tblObrigacao."fk_dominio_pais.id_dominio_pais" = tblDominioPais."id_dominio_pais"  '
			+'left outer join "VGT.DOMINIO_PERIODICIDADE_OBRIGACAO" tblDominioPeriodicidadeObrigacao on tblObrigacao."fk_dominio_periodicidade_obrigacao.id_periodicidade_obrigacao" = tblDominioPeriodicidadeObrigacao."id_periodicidade_obrigacao"  '
			+'left outer join "VGT.EMPRESA" tblEmpresa  on tblObrigacao."fk_empresa.id_empresa" = tblEmpresa."id_empresa"  '
			+'left Outer Join "VGT.OBRIGACAO_ACESSORIA" tblObrigacaoAcessoria On tblObrigacao."fk_obrigacao_acessoria.id_obrigacao_acessoria" = tblObrigacaoAcessoria."id_obrigacao_acessoria"  '
			+'left Outer Join "VGT.DOMINIO_ANO_FISCAL" tblDominioAnoFiscal On tblObrigacao."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" = tblDominioAnoFiscal."id_dominio_ano_fiscal"  '
			+'left Outer Join "VGT.DOMINIO_OBRIGACAO_ACESSORIA_TIPO" tblDominioObrigacaoAcessoriaTipo on tblDominioObrigacaoAcessoriaTipo."id_dominio_obrigacao_acessoria_tipo" = tblObrigacaoAcessoria."fk_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo"';

		var oWhere = [];
		var aParams = [];
		var stringtemporaria = "";
		var filtro = "";
		var aEntrada = req.body.parametros ? JSON.parse(req.body.parametros) : [];

		for (var i = 0; i < aEntrada.length; i++) {
			filtro = "";			
			if (aEntrada[i] !== null){
				stringtemporaria = "";
				for (var k = 0; k < aEntrada[i].length; k++) {
					switch (i){
						case 0:
							filtro = ' tblDominioObrigacaoAcessoriaTipo."id_dominio_obrigacao_acessoria_tipo" = ? ';
							break;
						case 1:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;
						case 2:
							filtro = ' tblDominioPais."id_dominio_pais" = ? ';
							break;
						case 3:
							filtro = ' tblObrigacaoAcessoria."id_obrigacao_acessoria" = ? ';
							break;
						case 4:
							filtro = ' tblDominioPeriodicidadeObrigacao."id_periodicidade_obrigacao" = ? ';
							break;
						case 5:
							filtro = ' tblDominioAnoFiscal."id_dominio_ano_fiscal" = ? ';
							break;
						case 6:
							filtro = ' tblObrigacao."prazo_entrega" >=  ? ';
							break;
						case 7:
							filtro = ' tblObrigacao."prazo_entrega" <= ? ';
							break;
						case 8:
							filtro = ' tblObrigacao."extensao" >= ? ';
							break;
						case 9:
							filtro = ' tblObrigacao."extensao" <= ? ';
							break;
						case 10:
							filtro = ' tblDominioStatusObrigacao."id_status_obrigacao" = ? ';
							break;	
						case 11:
							filtro = ' tblObrigacao."obrigacao_inicial" = ? ';
							break;		
						case 12:
							filtro = ' tblObrigacao."suporte_contratado" = ? ';
							break;								
					}
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

		if (oWhere.length > 0) {
			sStatement += " where";

			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}
		
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
		
		switch(aEntrada[13][0]){
			case "tblDominioObrigacaoAcessoriaTipo.tipo":
				stringDistinct = 'Select distinct "tblDominioObrigacaoAcessoriaTipo.tipo", "tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo" from (';
				break;
			case "tblEmpresa.nome":
				stringDistinct = 'Select distinct "tblEmpresa.nome", "tblEmpresa.id_empresa" from (';
				break;		
			case "tblDominioPais.pais":
				stringDistinct = 'Select distinct "tblDominioPais.pais", "tblDominioPais.id_dominio_pais" from (';
				break;	
			case "tblObrigacaoAcessoria.nome":
				stringDistinct = 'Select distinct "tblObrigacaoAcessoria.nome", "tblObrigacaoAcessoria.id_obrigacao_acessoria" from (';
				break;	
			case "tblDominioPeriodicidadeObrigacao.descricao":
				stringDistinct = 'Select distinct "tblDominioPeriodicidadeObrigacao.descricao", "tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao" from (';
				break;	
			case "tblDominioAnoFiscal.ano_fiscal":
				stringDistinct = 'Select distinct "tblDominioAnoFiscal.ano_fiscal", "tblDominioAnoFiscal.id_dominio_ano_fiscal" from (';
				break;	
			case "tblDominioStatusObrigacao.descricao":
				stringDistinct = 'Select distinct "tblDominioStatusObrigacao.descricao", "tblDominioStatusObrigacao.id_status_obrigacao" from (';
				break;	
			case "tblObrigacao.prazo_entrega":
				stringDistinct = 'Select min("tblObrigacao.prazo_entrega") "min(tblObrigacao.prazo_entrega)" , max("tblObrigacao.prazo_entrega") "max(tblObrigacao.prazo_entrega)" from (';
				break;
			case "tblObrigacao.extensao":
				stringDistinct = 'Select min("tblObrigacao.extensao") "min(tblObrigacao.extensao)" , max("tblObrigacao.extensao") "max(tblObrigacao.extensao)" from (';
				break;				
		}
		
		var sStatement = 
			stringDistinct
			+'select '
			+'tblObrigacao."id_obrigacao" "tblObrigacao.id_obrigacao", '
			+'tblObrigacao."prazo_entrega" "tblObrigacao.prazo_entrega", '
			+'tblObrigacao."extensao" "tblObrigacao.extensao", '
			+'tblObrigacao."obrigacao_inicial" "tblObrigacao.obrigacao_inicial", '
			+'tblObrigacao."suporte_contratado" "tblObrigacao.suporte_contratado", '
			+'tblObrigacao."suporte" "tblObrigacao.suporte", '
			+'tblObrigacao."observacoes" "tblObrigacao.observacoes", '
			+'tblObrigacao."fk_dominio_status_obrigacao.id_status_obrigacao" "tblObrigacao.fk_dominio_status_obrigacao.id_status_obrigacao", '
			+'tblObrigacao."fk_dominio_pais.id_dominio_pais" "tblObrigacao.fk_dominio_pais.id_dominio_pais", '
			+'tblObrigacao."fk_dominio_periodicidade_obrigacao.id_periodicidade_obrigacao" "tblObrigacao.fk_dominio_periodicidade_obrigacao.id_periodicidade_obrigacao", '
			+'tblObrigacao."fk_empresa.id_empresa" "tblObrigacao.fk_empresa.id_empresa", '
			+'tblObrigacao."fk_obrigacao_acessoria.id_obrigacao_acessoria" "tblObrigacao.fk_obrigacao_acessoria.id_obrigacao_acessoria", '
			+'tblObrigacao."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" "tblObrigacao.fk_dominio_ano_fiscal.id_dominio_ano_fiscal", '
			+'tblObrigacao."fk_dominio_aprovacao_obrigacao.id_aprovacao_obrigacao" "tblObrigacao.fk_dominio_aprovacao_obrigacao.id_aprovacao_obrigacao", '
			+'tblObrigacao."motivo_reprovacao" "tblObrigacao.motivo_reprovacao", '
			+'tblDominioStatusObrigacao."id_status_obrigacao" "tblDominioStatusObrigacao.id_status_obrigacao", '
			+'tblDominioStatusObrigacao."descricao" "tblDominioStatusObrigacao.descricao", '
			+'tblDominioPais."id_dominio_pais" "tblDominioPais.id_dominio_pais",'
			+'tblDominioPais."pais" "tblDominioPais.pais",'
			+'tblDominioPeriodicidadeObrigacao."id_periodicidade_obrigacao" "tblDominioPeriodicidadeObrigacao.id_periodicidade_obrigacao",  '
			+'tblDominioPeriodicidadeObrigacao."descricao" "tblDominioPeriodicidadeObrigacao.descricao", '
			+'tblEmpresa."id_empresa" "tblEmpresa.id_empresa", '
			+'tblEmpresa."nome" "tblEmpresa.nome", '
			+'tblEmpresa."num_hfm_sap" "tblEmpresa.num_hfm_sap", '
			+'tblEmpresa."tin" "tblEmpresa.tin", '
			+'tblEmpresa."jurisdicao_tin" "tblEmpresa.jurisdicao_tin", '
			+'tblEmpresa."ni" "tblEmpresa.ni", '
			+'tblEmpresa."jurisdicao_ni" "tblEmpresa.jurisdicao_ni", '
			+'tblEmpresa."endereco" "tblEmpresa.endereco", '
			+'tblEmpresa."fy_start_date" "tblEmpresa.fy_start_date", '
			+'tblEmpresa."fy_end_date" "tblEmpresa.fy_end_date", '
			+'tblEmpresa."lbc_nome" "tblEmpresa.lbc_nome", '
			+'tblEmpresa."lbc_email" "tblEmpresa.lbc_email", '
			+'tblEmpresa."comentarios" "tblEmpresa.comentarios", '
			+'tblEmpresa."fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario" "tblEmpresa.fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario", '
			+'tblEmpresa."fk_dominio_empresa_status.id_dominio_empresa_status" "tblEmpresa.fk_dominio_empresa_status.id_dominio_empresa_status", '
			+'tblEmpresa."fk_aliquota.id_aliquota" "tblEmpresa.fk_aliquota.id_aliquota", '
			+'tblEmpresa."fk_pais.id_pais" "tblEmpresa.fk_pais.id_pais", '
			+'tblObrigacaoAcessoria."id_obrigacao_acessoria" "tblObrigacaoAcessoria.id_obrigacao_acessoria", '
			+'tblObrigacaoAcessoria."nome" "tblObrigacaoAcessoria.nome", '
			+'tblObrigacaoAcessoria."data_inicio" "tblObrigacaoAcessoria.data_inicio", '
			+'tblObrigacaoAcessoria."fk_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" "tblObrigacaoAcessoria.fk_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo", '
			+'tblObrigacaoAcessoria."data_fim" "tblObrigacaoAcessoria.data_fim", '
			+'tblDominioAnoFiscal."id_dominio_ano_fiscal" "tblDominioAnoFiscal.id_dominio_ano_fiscal", '
			+'tblDominioAnoFiscal."ano_fiscal" "tblDominioAnoFiscal.ano_fiscal", '
			+'tblDominioObrigacaoAcessoriaTipo."id_dominio_obrigacao_acessoria_tipo" "tblDominioObrigacaoAcessoriaTipo.id_dominio_obrigacao_acessoria_tipo", '
			+'tblDominioObrigacaoAcessoriaTipo."tipo" "tblDominioObrigacaoAcessoriaTipo.tipo" '
			+'from "VGT.OBRIGACAO" tblObrigacao  '
			+'left outer join "VGT.DOMINIO_STATUS_OBRIGACAO" tblDominioStatusObrigacao on tblObrigacao."fk_dominio_status_obrigacao.id_status_obrigacao" = tblDominioStatusObrigacao."id_status_obrigacao"  '
			+'left outer join "VGT.DOMINIO_PAIS" tblDominioPais  on tblObrigacao."fk_dominio_pais.id_dominio_pais" = tblDominioPais."id_dominio_pais"  '
			+'left outer join "VGT.DOMINIO_PERIODICIDADE_OBRIGACAO" tblDominioPeriodicidadeObrigacao on tblObrigacao."fk_dominio_periodicidade_obrigacao.id_periodicidade_obrigacao" = tblDominioPeriodicidadeObrigacao."id_periodicidade_obrigacao"  '
			+'left outer join "VGT.EMPRESA" tblEmpresa  on tblObrigacao."fk_empresa.id_empresa" = tblEmpresa."id_empresa"  '
			+'left Outer Join "VGT.OBRIGACAO_ACESSORIA" tblObrigacaoAcessoria On tblObrigacao."fk_obrigacao_acessoria.id_obrigacao_acessoria" = tblObrigacaoAcessoria."id_obrigacao_acessoria"  '
			+'left Outer Join "VGT.DOMINIO_ANO_FISCAL" tblDominioAnoFiscal On tblObrigacao."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" = tblDominioAnoFiscal."id_dominio_ano_fiscal"  '
			+'left Outer Join "VGT.DOMINIO_OBRIGACAO_ACESSORIA_TIPO" tblDominioObrigacaoAcessoriaTipo on tblDominioObrigacaoAcessoriaTipo."id_dominio_obrigacao_acessoria_tipo" = tblObrigacaoAcessoria."fk_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo"';		

		for (var i = 0; i < aEntrada.length - 1; i++) {
			filtro = "";
			if (aEntrada[i] !== null){
				stringtemporaria = "";
				for (var k = 0; k < aEntrada[i].length; k++) {
					switch (i){
						case 0:
							filtro = ' tblDominioObrigacaoAcessoriaTipo."id_dominio_obrigacao_acessoria_tipo" = ? ';
							break;
						case 1:
							filtro = ' tblEmpresa."id_empresa" = ? ';
							break;
						case 2:
							filtro = ' tblDominioPais."id_dominio_pais" = ? ';
							break;
						case 3:
							filtro = ' tblObrigacaoAcessoria."id_obrigacao_acessoria" = ? ';
							break;
						case 4:
							filtro = ' tblDominioPeriodicidadeObrigacao."id_periodicidade_obrigacao" = ? ';
							break;
						case 5:
							filtro = ' tblDominioAnoFiscal."id_dominio_ano_fiscal" = ? ';
							break;
						case 6:
							filtro = ' tblObrigacao."prazo_entrega" >=  ? ';
							break;
						case 7:
							filtro = ' tblObrigacao."prazo_entrega" <= ? ';
							break;
						case 8:
							filtro = ' tblObrigacao."extensao" >= ? ';
							break;
						case 9:
							filtro = ' tblObrigacao."extensao" <= ? ';
							break;
						case 10:
							filtro = ' tblDominioStatusObrigacao."id_status_obrigacao" = ? ';
							break;	
						case 11:
							filtro = ' tblObrigacao."obrigacao_inicial" = ? ';
							break;		
						case 12:
							filtro = ' tblObrigacao."suporte_contratado" = ? ';
							break;							
					}
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

		if (oWhere.length > 0) {
			sStatement += " where";

			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}
		
		sStatement += ")";
		
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