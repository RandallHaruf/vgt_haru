"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerRelEmpresaObrigacaoAcessoria");
	var express = require("express");

	aRoutes.push(express.Router().get("/RelacionamentoEmpresaObrigacaoAcessoria", controller.listarRegistros));
	aRoutes.push(express.Router().post("/RelacionamentoEmpresaObrigacaoAcessoria", controller.criarRegistro));

	aRoutes.push(express.Router().get("/RelacionamentoEmpresaObrigacaoAcessoria/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/RelacionamentoEmpresaObrigacaoAcessoria/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/RelacionamentoEmpresaObrigacaoAcessoria/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/RelacionamentoEmpresaObrigacaoAcessoria", controller.deepQuery));
	aRoutes.push(express.Router().get("/DeepQuery/RelacionamentoEmpresaObrigacaoAcessoria/:idEmpresa&:idObrigacaoAcessoria", controller.deepQuery));
};