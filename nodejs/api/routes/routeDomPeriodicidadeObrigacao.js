"use strict";

module.exports = function (aRoutes) {
var controller = require("../controllers/controllerDomPeriodicidadeObrigacao");
var express = require("express");

aRoutes.push(express.Router().get("/DomPeriodicidadeObrigacao", controller.listarRegistros));
aRoutes.push(express.Router().post("/DomPeriodicidadeObrigacao", controller.criarRegistro));

aRoutes.push(express.Router().get("/DomPeriodicidadeObrigacao/:idRegistro", controller.lerRegistro));
aRoutes.push(express.Router().put("/DomPeriodicidadeObrigacao/:idRegistro", controller.atualizarRegistro));
aRoutes.push(express.Router().delete("/DomPeriodicidadeObrigacao/:idRegistro", controller.excluirRegistro));

aRoutes.push(express.Router().get("/DeepQuery/DomPeriodicidadeObrigacao", controller.deepQuery));
};
