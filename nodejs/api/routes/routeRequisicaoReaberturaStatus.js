"use strict";

module.exports = function (aRoutes) {
var controller = require("../controllers/controllerRequisicaoReaberturaStatus");
var express = require("express");

aRoutes.push(express.Router().get("/RequisicaoReaberturaStatus", controller.listarRegistros));
aRoutes.push(express.Router().post("/RequisicaoReaberturaStatus", controller.criarRegistro));

aRoutes.push(express.Router().get("/RequisicaoReaberturaStatus/:idRegistro", controller.lerRegistro));
aRoutes.push(express.Router().put("/RequisicaoReaberturaStatus/:idRegistro", controller.atualizarRegistro));
aRoutes.push(express.Router().delete("/RequisicaoReaberturaStatus/:idRegistro", controller.excluirRegistro));

aRoutes.push(express.Router().get("/DeepQuery/RequisicaoReaberturaStatus", controller.deepQuery));
};