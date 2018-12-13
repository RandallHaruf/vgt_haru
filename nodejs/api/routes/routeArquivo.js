"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerArquivo");
	var express = require("express");
	var multer = require("multer");
	var upload = multer();
	
	aRoutes.push(express.Router().get("/ListarArquivos", controller.listarArquivos));
	aRoutes.push(express.Router().get("/DownloadArquivo", controller.downloadArquivo));
	aRoutes.push(express.Router().post("/UploadArquivo", upload.single("file"), controller.uploadArquivo));
	aRoutes.push(express.Router().delete("/ExcluirArquivo/:idRegistro", controller.excluirArquivo));
};