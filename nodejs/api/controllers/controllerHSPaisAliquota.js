"use strict";

var model = require("../models/modelHSPaisAliquota");

module.exports = {

	listarRegistros: function (req, res) {
		model.listar([], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	criarRegistro: function (req, res) {

		var aParams = [{
			coluna: model.colunas.id
		}, {
			coluna: model.colunas.fkPais,
			valor: req.body.fkPais ? Number(req.body.fkPais) : null
		}, {
			coluna: model.colunas.fkAliquota,
			valor: req.body.fkAliquota ? Number(req.body.fkAliquota) : null
		}, {
			coluna: model.colunas.dataInicio,
			valor: req.body.dataInicio ? req.body.dataInicio : null
		}, {
			coluna: model.colunas.dataFim,
			valor: req.body.dataFim ? req.body.dataFim : null
		}, {
			isIdLog: true,
			valor: req
		}];

		model.inserir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	lerRegistro: function (req, res) {
		model.listar([{
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	atualizarRegistro: function (req, res) {

		var oCondition = {
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		};

		var aParams = [{
			coluna: model.colunas.fkPais,
			valor: req.body.fkPais ? Number(req.body.fkPais) : null
		}, {
			coluna: model.colunas.fkAliquota,
			valor: req.body.fkAliquota ? Number(req.body.fkAliquota) : null
		}, {
			coluna: model.colunas.dataInicio,
			valor: req.body.dataInicio ? req.body.dataInicio : null
		}, {
			coluna: model.colunas.dataFim,
			valor: req.body.dataFim ? req.body.dataFim : null
		}, {
			isIdLog: true,
			valor: req
		}];

		model.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	excluirRegistro: function (req, res) {
		model.excluir([{
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		}, {
			isIdLog: true,
			valor: req
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	deepQuery: function (req, res) {
		var sStatement =
			'select '
			+ 'hs."fk_pais.id_pais", '
			+ 'hs."fk_aliquota.id_aliquota", '
			+ 'hs."id_hs_pais_aliquota", '
			+ 'hs."data_inicio" "data_inicio_rel", '
			+ 'hs."data_fim" "data_fim_rel", '
			+ 'pais."id_pais", '
			+ 'pais."prescricao_prejuizo", '
	        + 'pais."limite_utilizacao_prejuizo", '
	        + 'pais."prescricao_credito", '
	        + 'pais."fk_dominio_pais.id_dominio_pais", '
	        + 'pais."fk_dominio_pais_status.id_dominio_pais_status", '
	        + 'pais."fk_dominio_pais_regiao.id_dominio_pais_regiao", '
	        + 'aliquota."id_aliquota", '
	        + 'aliquota."nome", '
	        + 'aliquota."valor", '
	        + 'aliquota."fk_dominio_aliquota_tipo.id_dominio_aliquota_tipo" '
			+ 'from "VGT.HS_PAIS_ALIQUOTA" hs '
			+ 'inner join "VGT.PAIS" pais '
			+ 'on hs."fk_pais.id_pais" = pais."id_pais" '
			+ 'inner join "VGT.ALIQUOTA" aliquota '
			+ 'on hs."fk_aliquota.id_aliquota" = aliquota."id_aliquota" ';
			
		var aValues = [];
			
		var sWhere = "";
			
		if (req.params.idPais && req.params.idPais !== "-1") {
			sWhere += 'where pais."id_pais" = ? ';
			aValues.push(Number(req.params.idPais));
		}
		
		if (req.params.idAliquota && req.params.idAliquota !== "-1") {
			var sAliquota = 'aliquota."id_aliquota" = ? ';
			aValues.push(Number(req.params.idAliquota));
			
			if (sWhere === "") {
				sWhere = "where " + sAliquota;	
			}
			else {
				sWhere += " and " + sAliquota;
			}
		}
		
		model.execute({
			statement: sStatement + sWhere,
			parameters: aValues
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		}, {
			idUsuario: req
		});
	}
};

/*"use strict";
var hsPaisAliquota = require("../models/modelHSPaisAliquota");
var basicController = require("./basicController");

module.exports = {
	
	listarRegistros: function (req, res) {
		basicController.listarTodas(req, res, hsPaisAliquota);
	},
	
	criarRegistro: function (req, res) {
		var iFkPais = req.body.fkPais ? Number(req.body.fkPais) : null;
		var iFkAliquota = req.body.fkAliquota ? Number(req.body.fkAliquota) : null;
		
		var aParams = [{
			coluna: hsPaisAliquota.colunas.fkPais,
			valor: iFkPais
		}, {
			coluna: hsPaisAliquota.colunas.fkAliquota,
			valor: iFkAliquota
		}];
		
		hsPaisAliquota.inserir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	lerRegistro: function (req, res) {
		var aParams = [];
		
		if (req.params.idPais && req.params.idPais !== "-1") {
			aParams.push({
				coluna: hsPaisAliquota.colunas.fkPais,
				valor: Number(req.params.idPais)
			});
		}
		
		if (req.params.idAliquota && req.params.idAliquota !== "-1") {
			aParams.push({
				coluna: hsPaisAliquota.colunas.fkAliquota,
				valor: Number(req.params.idAliquota)
			});
		}
		
		hsPaisAliquota.listar(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	deepQuery: function (req, res) {
		var sStatement =
			'select * '
			+ 'from "VGT.HS_PAIS_ALIQUOTA" hs '
			+ 'inner join "VGT.PAIS" pais '
			+ 'on hs."fk_pais.id_pais" = pais."id_pais" '
			+ 'inner join "VGT.ALIQUOTA" aliquota '
			+ 'on hs."fk_aliquota.id_aliquota" = aliquota."id_aliquota" ';
			
		var aValues = [];
			
		var sWhere = "";
			
		if (req.params.idPais && req.params.idPais !== "-1") {
			sWhere += 'where pais."id_pais" = ? ';
			aValues.push(Number(req.params.idPais));
		}
		
		if (req.params.idAliquota && req.params.idAliquota !== "-1") {
			var sAliquota = 'aliquota."id_aliquota" = ? ';
			aValues.push(Number(req.params.idAliquota));
			
			if (sWhere === "") {
				sWhere = "where " + sAliquota;	
			}
			else {
				sWhere += " and " + sAliquota;
			}
		}
		
		hsPaisAliquota.execute({
			statement: sStatement + sWhere,
			parameters: aValues
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	}
};*/