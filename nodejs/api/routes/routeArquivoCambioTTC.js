"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerArquivoCambioTTC");
	var express = require("express");
	var multer = require("multer");
	var upload = multer();
	
	aRoutes.push(express.Router().get("/DeepQuery/ListarTodosDocumentosCambio", controller.listarTodosArquivos));
	aRoutes.push(express.Router().get("/DownloadCambioTTC", controller.downloadArquivo));
	aRoutes.push(express.Router().post("/UploadCambioTTC", upload.single("file"), controller.uploadArquivo));
	aRoutes.push(express.Router().delete("/ExcluirDocumento/:idRegistro", controller.excluirArquivo));
	aRoutes.push(express.Router().get("/DownloadModeloHistoricoCambio", controller.downloadModeloHistoricoCambio));
	aRoutes.push(express.Router().get("/DownloadExemploHistoricoCambio", controller.downloadExemploHistoricoCambio));
};