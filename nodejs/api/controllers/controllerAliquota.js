"use strict";
var aliquota = require("../models/modelAliquota");

module.exports = {

	listarRegistros: function (req, res) {
		var aParams = [];
		
		if (req.query.tipo) {
			aParams.push({
				coluna: aliquota.colunas.fkTipo,
				valor: req.query.tipo.toLowerCase() === "pais" ? 1 : 2
			});
		}
		
		aliquota.listar(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	criarRegistro: function (req, res) {
		var nome = req.body.nome ? req.body.nome : null;
		var valor = req.body.valor ? Number(req.body.valor) : null;
		var dataInicio = req.body.dataInicio ? req.body.dataInicio : null;
		var dataFim = req.body.dataFim ? req.body.dataFim : null;
		var fkTipo = req.body.fkTipo ? req.body.fkTipo : null;
		
		var aParams = [{
			coluna: aliquota.colunas.id
		}, {
			coluna: aliquota.colunas.nome,
			valor: nome
		}, {
			coluna: aliquota.colunas.valor,
			valor: valor
		}, {
			coluna: aliquota.colunas.dataInicio,
			valor: dataInicio
		}, {
			coluna: aliquota.colunas.dataFim,
			valor: dataFim
		}, {
			coluna: aliquota.colunas.fkTipo,
			valor: fkTipo
		}];
		
		aliquota.inserir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	lerRegistro: function (req, res) {
		aliquota.listar([{
			coluna: aliquota.colunas.id,
			valor: Number(req.params.idAliquota)
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	atualizarRegistro: function (req, res) {
		console.log("REQUEST: " + JSON.stringify(req.params) + JSON.stringify(req.body));
		
		var idAliquota = req.params.idAliquota;
		
		var nome = req.body.nome ? req.body.nome : null;
		var valor = req.body.valor ? Number(req.body.valor) : null;
		var dataInicio = req.body.dataInicio ? req.body.dataInicio : null;
		var dataFim = req.body.dataFim ? req.body.dataFim : null;
		var fkTipo = req.body.fkTipo ? req.body.fkTipo : null;
		
		var oCondition = {
			coluna: aliquota.colunas.id,
			valor: idAliquota
		};
		
		var aParams = [{
			coluna: aliquota.colunas.nome,
			valor: nome
		}, {
			coluna: aliquota.colunas.valor,
			valor: valor
		}, {
			coluna: aliquota.colunas.dataInicio,
			valor: dataInicio
		}, {
			coluna: aliquota.colunas.dataFim,
			valor: dataFim
		}, {
			coluna: aliquota.colunas.fkTipo,
			valor: fkTipo
		}];
		
		aliquota.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	excluirRegistro: function (req, res) {
		aliquota.excluir([{
			coluna: aliquota.colunas.id,
			valor: req.params.idAliquota
		}], function (err, result) {
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
			'select *  '
			+ 'from "VGT.ALIQUOTA" aliquota '
			+ 'left outer join "VGT.DOMINIO_ALIQUOTA_TIPO" tipo '
			+ 'on aliquota."fk_dominio_aliquota_tipo.id_dominio_aliquota_tipo" = tipo."id_dominio_aliquota_tipo" ';
		
		aliquota.execute({
			statement: sStatement
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	}
};