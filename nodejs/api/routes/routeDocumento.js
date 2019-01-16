"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDocumento");
	var express = require("express");
	var multer = require("multer");
	var upload = multer();
	
	aRoutes.push(express.Router().get("/ListarDocumento", controller.listarArquivos));
	aRoutes.push(express.Router().get("/DeepQuery/ListarTodosDocumentos", controller.listarTodosArquivos));
	aRoutes.push(express.Router().get("/DownloadDocumento", controller.downloadArquivo));
	aRoutes.push(express.Router().post("/UploadDocumento", upload.single("file"), controller.uploadArquivo));
	aRoutes.push(express.Router().delete("/ExcluirDocumento/:idRegistro", controller.excluirArquivo));
};