"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDeclaracao");
	var express = require("express");
	var multer = require("multer");
	var upload = multer();

	/*aRoutes.push(express.Router().get("/Declaracao", controller.listarRegistros));
	aRoutes.push(express.Router().post("/Declaracao", controller.criarRegistro));

	aRoutes.push(express.Router().get("/Declaracao/:idRegistro", controller.lerRegistro));
	aRoutes.push(express.Router().put("/Declaracao/:idRegistro", controller.atualizarRegistro));
	aRoutes.push(express.Router().delete("/Declaracao/:idRegistro", controller.excluirRegistro));

	aRoutes.push(express.Router().get("/DeepQuery/Declaracao", controller.deepQuery));*/
	
	aRoutes.push(express.Router().get("/ListarDeclaracoes", controller.listarArquivos));
	aRoutes.push(express.Router().get("/DownloadDeclaracao", controller.downloadArquivo));
	aRoutes.push(express.Router().post("/UploadDeclaracao", upload.single("file"), controller.uploadArquivo));
	aRoutes.push(express.Router().delete("/ExcluirDeclaracao/:idRegistro", controller.excluirArquivo));
};