"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerDocumentoTTC");
	var express = require("express");
	var multer = require("multer");
	var upload = multer();
	
	aRoutes.push(express.Router().get("/DeepQuery/ListarTodosDocumentosTTC", controller.listarTodosArquivos));
	aRoutes.push(express.Router().get("/DownloadDocumentoTTC", controller.downloadArquivo));
	aRoutes.push(express.Router().post("/UploadDocumentoTTC", upload.single("file"), controller.uploadArquivo));
	aRoutes.push(express.Router().delete("/ExcluirDocumentosTTC", controller.excluirArquivo));
};