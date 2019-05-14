"use strict";

var model = require("../models/modelHSEmpresaAliquota");

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
			coluna: model.colunas.fkEmpresa,
			valor: req.body.fkEmpresa ? Number(req.body.fkEmpresa) : null
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
			coluna: model.colunas.fkEmpresa,
			valor: req.body.fkEmpresa ? Number(req.body.fkEmpresa) : null
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
			+ 'hs."fk_empresa.id_empresa", '
			+ 'hs."fk_aliquota.id_aliquota", '
			+ 'hs."id_hs_empresa_aliquota", '
			+ 'hs."data_inicio" "data_inicio_rel", '
			+ 'hs."data_fim" "data_fim_rel", '
			+ 'empresa."id_empresa", '
			+ 'empresa."nome", '
	        + 'aliquota."id_aliquota", '
	        + 'aliquota."nome", '
	        + 'aliquota."valor", '
	        + 'aliquota."fk_dominio_aliquota_tipo.id_dominio_aliquota_tipo" '
			+ 'from "VGT.HS_EMPRESA_ALIQUOTA" hs '
			+ 'inner join "VGT.EMPRESA" empresa '
			+ 'on hs."fk_empresa.id_empresa" = empresa."id_empresa" '
			+ 'inner join "VGT.ALIQUOTA" aliquota '
			+ 'on hs."fk_aliquota.id_aliquota" = aliquota."id_aliquota" ';
			
		var aValues = [];
			
		var sWhere = "";
			
		if (req.params.idEmpresa && req.params.idEmpresa !== "-1") {
			sWhere += 'where empresa."id_empresa" = ? ';
			aValues.push(Number(req.params.idEmpresa));
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