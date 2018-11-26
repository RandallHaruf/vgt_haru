"use strict";
var pessoa = require("../models/modelPessoa");

module.exports = {

	listarTodasPessoas: function (req, res) {
		pessoa.listar([], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	criarPessoa: function (req, res) {
		var sNome = req.body.nome;
		var iIdade = req.body.idade;
		var iAltura = req.body.altura;
		
		var aParams = [{
			coluna: pessoa.colunas.id
		}, {
			coluna: pessoa.colunas.nome,
			valor: sNome
		}, {
			coluna: pessoa.colunas.idade,
			valor: Number(iIdade)
		}, {
			coluna: pessoa.colunas.altura,
			valor: Number(iAltura)
		}];
		
		pessoa.inserir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	lerPessoa: function (req, res) {
		pessoa.listar([
			{
				coluna: pessoa.colunas.id,
				valor: req.params.idPessoa
			}
		], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	atualizarPessoa: function (req, res) {
		console.log("REQUEST: " + JSON.stringify(req.params) + JSON.stringify(req.body));
		
		var idPessoa = req.params.idPessoa;
		
		var sNome = req.body.nome;
		var iIdade = req.body.idade;
		var iAltura = req.body.altura;
		
		var oCondition = {
			coluna: pessoa.colunas.id,
			valor: idPessoa
		};
		
		var aParams = [{
			coluna: pessoa.colunas.nome,
			valor: sNome
		}, {
			coluna: pessoa.colunas.idade,
			valor: Number(iIdade)
		}, {
			coluna: pessoa.colunas.altura,
			valor: Number(iAltura)
		}];
		
		pessoa.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	},
	
	excluirPessoa: function (req, res) {
		pessoa.excluir([
			{
				coluna: pessoa.colunas.id,
				valor: req.params.idPessoa
			}	
		], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			}
			else {
				res.send(JSON.stringify(result));
			}
		});
	}
};