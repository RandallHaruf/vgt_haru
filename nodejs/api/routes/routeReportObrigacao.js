"use strict";

module.exports = function (aRoutes) {
var controller = require("../controllers/controllerReportObrigacao");
var express = require("express");
/*
aRoutes.push(express.Router().get("/ReportObrigacao", controller.listarRegistros));
aRoutes.push(express.Router().post("/ReportObrigacao", controller.criarRegistro));

aRoutes.push(express.Router().get("/ReportObrigacao/:idRegistro", controller.lerRegistro));
aRoutes.push(express.Router().put("/ReportObrigacao/:idRegistro", controller.atualizarRegistro));
aRoutes.push(express.Router().delete("/ReportObrigacao/:idRegistro", controller.excluirRegistro));
*/
aRoutes.push(express.Router().get("/DeepQuery/ReportObrigacao", controller.deepQuery));
};
