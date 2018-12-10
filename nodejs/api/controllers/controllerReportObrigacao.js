"use strict";
var db = require("../db");
//var model = require("../models/modelReportObrigacao");

module.exports = {

	deepQuery: function (req, res) {
	
		var sStatement = 
			' select tblObrigacao.*, '
			+' tblStatusObrigacao."id_status_obrigacao" tblStatusObrigacaoID , '
			+' tblStatusObrigacao."descricao" tblStatusObrigacaoDescricao , '
			+' tblPais.*, '
			+' tblPeriodicidadeObrigacao.*, '
			+' tblEmpresa.*, '
			+' tblObrigacaoAcessoria."id_obrigacao_acessoria" tblObrigacaoAcessoriaID , '
			+' tblObrigacaoAcessoria."nome" tblObrigacaoAcessoriaNome , '
			+' tblObrigacaoAcessoria."data_inicio" tblObrigacaoAcessoriaDTInicio , '
			+' tblObrigacaoAcessoria."fk_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" tblObrigacaoAcessoriaIdTipo ,  '
			+' tblObrigacaoAcessoria."data_fim" tblObrigacaoAcessoriaDTFim ,  '
			+' tblAnoFiscal.*  ,'
			+' tblDominioObrigacaoAcessoriaTipo.*'
			+' from "VGT.OBRIGACAO" tblObrigacao '
			+' left outer join "VGT.DOMINIO_STATUS_OBRIGACAO" tblStatusObrigacao on tblObrigacao."fk_dominio_status_obrigacao.id_status_obrigacao" = tblStatusObrigacao."id_status_obrigacao" '
			+' left outer join "VGT.DOMINIO_PAIS" tblPais  on tblObrigacao."fk_dominio_pais.id_dominio_pais" = tblPais."id_dominio_pais" '
			+' left outer join "VGT.DOMINIO_PERIODICIDADE_OBRIGACAO" tblPeriodicidadeObrigacao on tblObrigacao."fk_dominio_periodicidade_obrigacao.id_periodicidade_obrigacao" = tblPeriodicidadeObrigacao."id_periodicidade_obrigacao" '
			+' left outer join "VGT.EMPRESA" tblEmpresa  on tblObrigacao."fk_empresa.id_empresa" = tblEmpresa."id_empresa" '
			+' left Outer Join "VGT.OBRIGACAO_ACESSORIA" tblObrigacaoAcessoria On tblObrigacao."fk_obrigacao_acessoria.id_obrigacao_acessoria" = tblObrigacaoAcessoria."id_obrigacao_acessoria" '
			+' left Outer Join "VGT.DOMINIO_ANO_FISCAL" tblAnoFiscal On tblObrigacao."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" = tblAnoFiscal."id_dominio_ano_fiscal" '
			+' left Outer Join "VGT.DOMINIO_OBRIGACAO_ACESSORIA_TIPO" tblDominioObrigacaoAcessoriaTipo on tblDominioObrigacaoAcessoriaTipo."id_dominio_obrigacao_acessoria_tipo" = tblObrigacaoAcessoria."fk_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo"';
			
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
							filtro = ' tblPais."id_dominio_pais" = ? ';
							break;
						case 3:
							filtro = ' tblObrigacaoAcessoria."id_obrigacao_acessoria" = ? ';
							break;
						case 4:
							filtro = ' tblPeriodicidadeObrigacao."id_periodicidade_obrigacao" = ? ';
							break;
						case 5:
							filtro = ' tblAnoFiscal."id_dominio_ano_fiscal" = ? ';
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
							filtro = ' tblStatusObrigacao."id_status_obrigacao" = ? ';
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
			case "tipo":
				stringDistinct = aEntrada[13] +'" "tipo" , "id_dominio_obrigacao_acessoria_tipo"';
				break;
			case "nome":
				stringDistinct = aEntrada[13] +'" "nome", "id_empresa" "id_empresa"';
				break;		
			case "pais":
				stringDistinct = aEntrada[13] +'" "pais", "id_dominio_pais" "id_dominio_pais"';
				break;	
			case "TBLOBRIGACAOACESSORIANOME":
				stringDistinct = aEntrada[13] +'" "nome", "TBLOBRIGACAOACESSORIAID" "id_obrigacao_acessoria"';
				break;	
			case "descricao":
				stringDistinct = aEntrada[13] +'" "descricao", "id_periodicidade_obrigacao" "id_periodicidade_obrigacao"';
				break;	
			case "ano_fiscal":
				stringDistinct = aEntrada[13] +'" "ano_fiscal", "id_dominio_ano_fiscal" "id_dominio_ano_fiscal"';
				break;	
			case "TBLSTATUSOBRIGACAODESCRICAO":
				stringDistinct = aEntrada[13] +'" "descricao", "TBLSTATUSOBRIGACAOID" "id_status_obrigacao"';
				break;	
		}
		
		var sStatement = 
			'Select distinct "'
			+ stringDistinct		
			+' from ('
			+' select tblObrigacao.*, '
			+' tblStatusObrigacao."id_status_obrigacao" tblStatusObrigacaoID , '
			+' tblStatusObrigacao."descricao" tblStatusObrigacaoDescricao , '
			+' tblPais.*, '
			+' tblPeriodicidadeObrigacao.*, '
			+' tblEmpresa.*, '
			+' tblObrigacaoAcessoria."id_obrigacao_acessoria" tblObrigacaoAcessoriaID , '
			+' tblObrigacaoAcessoria."nome" tblObrigacaoAcessoriaNome , '
			+' tblObrigacaoAcessoria."data_inicio" tblObrigacaoAcessoriaDTInicio , '
			+' tblObrigacaoAcessoria."fk_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo" tblObrigacaoAcessoriaIdTipo ,  '
			+' tblObrigacaoAcessoria."data_fim" tblObrigacaoAcessoriaDTFim ,  '
			+' tblAnoFiscal.*  ,'
			+' tblDominioObrigacaoAcessoriaTipo.*'
			+' from "VGT.OBRIGACAO" tblObrigacao '
			+' left outer join "VGT.DOMINIO_STATUS_OBRIGACAO" tblStatusObrigacao on tblObrigacao."fk_dominio_status_obrigacao.id_status_obrigacao" = tblStatusObrigacao."id_status_obrigacao" '
			+' left outer join "VGT.DOMINIO_PAIS" tblPais  on tblObrigacao."fk_dominio_pais.id_dominio_pais" = tblPais."id_dominio_pais" '
			+' left outer join "VGT.DOMINIO_PERIODICIDADE_OBRIGACAO" tblPeriodicidadeObrigacao on tblObrigacao."fk_dominio_periodicidade_obrigacao.id_periodicidade_obrigacao" = tblPeriodicidadeObrigacao."id_periodicidade_obrigacao" '
			+' left outer join "VGT.EMPRESA" tblEmpresa  on tblObrigacao."fk_empresa.id_empresa" = tblEmpresa."id_empresa" '
			+' left Outer Join "VGT.OBRIGACAO_ACESSORIA" tblObrigacaoAcessoria On tblObrigacao."fk_obrigacao_acessoria.id_obrigacao_acessoria" = tblObrigacaoAcessoria."id_obrigacao_acessoria" '
			+' left Outer Join "VGT.DOMINIO_ANO_FISCAL" tblAnoFiscal On tblObrigacao."fk_dominio_ano_fiscal.id_dominio_ano_fiscal" = tblAnoFiscal."id_dominio_ano_fiscal" '
			+' left Outer Join "VGT.DOMINIO_OBRIGACAO_ACESSORIA_TIPO" tblDominioObrigacaoAcessoriaTipo on tblDominioObrigacaoAcessoriaTipo."id_dominio_obrigacao_acessoria_tipo" = tblObrigacaoAcessoria."fk_dominio_obrigacao_acessoria_tipo.id_dominio_obrigacao_acessoria_tipo"';
			

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
							filtro = ' tblPais."id_dominio_pais" = ? ';
							break;
						case 3:
							filtro = ' tblObrigacaoAcessoria."id_obrigacao_acessoria" = ? ';
							break;
						case 4:
							filtro = ' tblPeriodicidadeObrigacao."id_periodicidade_obrigacao" = ? ';
							break;
						case 5:
							filtro = ' tblAnoFiscal."id_dominio_ano_fiscal" = ? ';
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
							filtro = ' tblStatusObrigacao."id_status_obrigacao" = ? ';
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