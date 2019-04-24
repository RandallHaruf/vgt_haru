sap.ui.define(
[
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
],
function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createViewModelParaComplianceListagemObrigacoes: function () {
			var oModel = new JSONModel({
				"tabFilters": {
					"todas": 4,
					"naoIniciada": 1,
					"emAndamento": 3,
					"emAtraso": 0,
					"entregueNoPrazo": 0,
					"entregueForaPrazo": 0
				},
				"obrigacoes": [{
					"empresa": "Empresa A",
					"tipo": "CIT",
					"prazoEntrega": "03/03/2018",
					"extensao": "",
					"anoFiscal": 2017,
					"pais": "França",
					"periodicidade": "Anual",
					//"suporteContratado": "sap-icon://thumb-up",
					"suporteContratado": "Sim",
					"status": "Não Iniciada"
				}, {
					"empresa": "Empresa B",
					"tipo": "CIT",
					"prazoEntrega": "15/09/2018",
					"extensao": "15/11/2018",
					"anoFiscal": 2017,
					"pais": "Portugal",
					"periodicidade": "Anual",
					//"suporteContratado": "sap-icon://thumb-up",
					"suporteContratado": "Sim",
					"status": "Em andamento"
				}, {
					"empresa": "Empresa B",
					"tipo": "CIT",
					"prazoEntrega": "15/12/2018",
					"extensao": "",
					"anoFiscal": 2016,
					"pais": "Portugal",
					"periodicidade": "Anual",
					//"suporteContratado": "sap-icon://thumb-up",
					"suporteContratado": "Não",
					"status": "Em andamento"
				}, {
					"empresa": "Empresa C",
					"tipo": "CIT",
					"prazoEntrega": "22/12/2018",
					"extensao": "",
					"anoFiscal": 2018,
					"pais": "Suiça",
					"periodicidade": "Anual",
					//"suporteContratado": "sap-icon://thumb-up",
					"suporteContratado": "Não",
					"status": "Em andamento"
				}]
			});
			return oModel;
		},

		createViewModelParaBepsListagemObrigacoes: function () {
			var oModel = new JSONModel({
				"tabFilters": {
					"todas": 4,
					"naoIniciada": 1,
					"emAndamento": 3,
					"emAtraso": 0,
					"entregueNoPrazo": 0,
					"entregueForaPrazo": 0
				},
				"obrigacoes": [{
					"empresa": "Empresa A",
					"tipo": "CIT",
					"prazoEntrega": "03/03/2018",
					"extensao": "",
					"anoFiscal": 2017,
					"pais": "França",
					"periodicidade": "Anual",
					//"suporteContratado": "sap-icon://thumb-up",
					"suporteContratado": "Sim",
					"status": "Não Iniciada"
				}, {
					"empresa": "Empresa B",
					"tipo": "CIT",
					"prazoEntrega": "15/09/2018",
					"extensao": "15/11/2018",
					"anoFiscal": 2017,
					"pais": "Portugal",
					"periodicidade": "Anual",
					//"suporteContratado": "sap-icon://thumb-up",
					"suporteContratado": "Sim",
					"status": "Em andamento"
				}, {
					"empresa": "Empresa B",
					"tipo": "CIT",
					"prazoEntrega": "15/12/2018",
					"extensao": "",
					"anoFiscal": 2016,
					"pais": "Portugal",
					"periodicidade": "Anual",
					//"suporteContratado": "sap-icon://thumb-up",
					"suporteContratado": "Não",
					"status": "Em andamento"
				}, {
					"empresa": "Empresa C",
					"tipo": "CIT",
					"prazoEntrega": "22/12/2018",
					"extensao": "",
					"anoFiscal": 2018,
					"pais": "Suiça",
					"periodicidade": "Anual",
					//"suporteContratado": "sap-icon://thumb-up",
					"suporteContratado": "Não",
					"status": "Em andamento"
				}]
			});
			return oModel;
		},

		createDocumentsModelParaRepositorioCompliance: function () {
			return {
				"currentLocationText": "Anexos",
				"history": [],
				"items": [{
					"fileName": "Meu Arquivo",
					"mimeType": "text/plain",
					"url": "files/file.txt"
				}]
			};
			/*return {
				"currentLocationText": "Attachments",
				"history": [ ],
				"items": [
					{
						"documentId": "5082cc4d-da9f-2835-2c0a-8100ed47bcde",
						"fileName": "Notes.txt",
						"mimeType": "text/plain",
						"thumbnailUrl": "",
						"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Notes.txt"
					}
				]
			};*/
			/*return {
				"currentLocationText": "Attachments",
				"history": [ ],
				"items": [
					{
						"type": "folder",
						"documentId": "",
						"fileName": "My Documents",
						"mimeType": "",
						"thumbnailUrl": "sap-icon://folder-blank",
						"url": "",
						"items": [
							{
								"type": "folder",
								"documentId": "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
								"fileName": "Images",
								"mimeType": "image/jpg",
								"thumbnailUrl": "sap-icon://folder-blank",
								"url": "",
								"items": [
									{
										"documentId": "b68a7065-cc2a-2140-922d-e7528cd32172",
										"fileName": "Picture of a woman.png",
										"mimeType": "image/png",
										"thumbnailUrl": "test-resources/sap/m/images/Woman_04.png",
										"url": "test-resources/sap/m/images/Woman_04.png"
									}
								]
							}, {
								"documentId": "5082cc4d-da9f-2835-2c0a-8100ed47bcde",
								"fileName": "Notes.txt",
								"mimeType": "text/plain",
								"thumbnailUrl": "",
								"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Notes.txt"
							}
						]
					}, {
						"documentId": "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
						"fileName": "file.txt",
						"mimeType": "text/plain",
						"thumbnailUrl": "",
						"url": "files/file.txt"
					}, {
						"documentId": "5082cc4d-da9f-2835-2c0a-8100ed47bcde",
						"fileName": "Notes.txt",
						"mimeType": "text/plain",
						"thumbnailUrl": "",
						"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Notes.txt"
					}, {
						"documentId": "5082cc4d-da9f-2835-2c0a-8100ed47bcdf",
						"fileName": "Document.txt",
						"mimeType": "text/plain",
						"thumbnailUrl": "",
						"url": ""
					}, {
						"documentId": "1700ead2-3dfb-5a94-6f5c-cf1da409e028",
						"fileName": "Third Quarter Results.ppt",
						"mimeType": "application/vnd.ms-powerpoint",
						"thumbnailUrl": "",
						"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Third Quarter Results.ppt"
					}, {
						"documentId": "34e484e4-a523-6c50-685b-e5ae66069250",
						"fileName": "Business Plan Agenda.doc",
						"mimeType": "application/msword",
						"thumbnailUrl": "",
						"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Business Plan Agenda.doc"
					}, {
						"documentId": "bcc27c4d-a8ce-3ab6-e807-ec05119685a5",
						"fileName": "Business Plan Topics.xls",
						"mimeType": "application/msexcel",
						"thumbnailUrl": "",
						"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Business Plan Topics.xls"
					}, {
						"documentId": "6b6ccd2f-e5c2-15b7-3b67-191564850063",
						"fileName": "Instructions.pdf",
						"mimeType": "application/pdf",
						"thumbnailUrl": "",
						"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Instructions.pdf"
					}, {
						"documentId": "b68a7065-cc2a-2140-922d-e7528cd32172",
						"fileName": "Picture of a woman.png",
						"mimeType": "image/png",
						"thumbnailUrl": "test-resources/sap/m/images/Woman_04.png",
						"url": "test-resources/sap/m/images/Woman_04.png"
					}
				]
			};*/
		},

		createDocumentsModelParaRepositorioBeps: function () {
		return {
			"currentLocationText": "Anexos",
			"history": [],
			"items": [{
				"fileName": "Meu Arquivo",
				"mimeType": "text/plain",
				"url": "files/file.txt"
			}]
		};
		/*return {
			"currentLocationText": "Attachments",
			"history": [ ],
			"items": [
				{
					"documentId": "5082cc4d-da9f-2835-2c0a-8100ed47bcde",
					"fileName": "Notes.txt",
					"mimeType": "text/plain",
					"thumbnailUrl": "",
					"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Notes.txt"
				}
			]
		};*/
		/*return {
			"currentLocationText": "Attachments",
			"history": [ ],
			"items": [
				{
					"type": "folder",
					"documentId": "",
					"fileName": "My Documents",
					"mimeType": "",
					"thumbnailUrl": "sap-icon://folder-blank",
					"url": "",
					"items": [
						{
							"type": "folder",
							"documentId": "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
							"fileName": "Images",
							"mimeType": "image/jpg",
							"thumbnailUrl": "sap-icon://folder-blank",
							"url": "",
							"items": [
								{
									"documentId": "b68a7065-cc2a-2140-922d-e7528cd32172",
									"fileName": "Picture of a woman.png",
									"mimeType": "image/png",
									"thumbnailUrl": "test-resources/sap/m/images/Woman_04.png",
									"url": "test-resources/sap/m/images/Woman_04.png"
								}
							]
						}, {
							"documentId": "5082cc4d-da9f-2835-2c0a-8100ed47bcde",
							"fileName": "Notes.txt",
							"mimeType": "text/plain",
							"thumbnailUrl": "",
							"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Notes.txt"
						}
					]
				}, {
					"documentId": "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
					"fileName": "file.txt",
					"mimeType": "text/plain",
					"thumbnailUrl": "",
					"url": "files/file.txt"
				}, {
					"documentId": "5082cc4d-da9f-2835-2c0a-8100ed47bcde",
					"fileName": "Notes.txt",
					"mimeType": "text/plain",
					"thumbnailUrl": "",
					"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Notes.txt"
				}, {
					"documentId": "5082cc4d-da9f-2835-2c0a-8100ed47bcdf",
					"fileName": "Document.txt",
					"mimeType": "text/plain",
					"thumbnailUrl": "",
					"url": ""
				}, {
					"documentId": "1700ead2-3dfb-5a94-6f5c-cf1da409e028",
					"fileName": "Third Quarter Results.ppt",
					"mimeType": "application/vnd.ms-powerpoint",
					"thumbnailUrl": "",
					"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Third Quarter Results.ppt"
				}, {
					"documentId": "34e484e4-a523-6c50-685b-e5ae66069250",
					"fileName": "Business Plan Agenda.doc",
					"mimeType": "application/msword",
					"thumbnailUrl": "",
					"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Business Plan Agenda.doc"
				}, {
					"documentId": "bcc27c4d-a8ce-3ab6-e807-ec05119685a5",
					"fileName": "Business Plan Topics.xls",
					"mimeType": "application/msexcel",
					"thumbnailUrl": "",
					"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Business Plan Topics.xls"
				}, {
					"documentId": "6b6ccd2f-e5c2-15b7-3b67-191564850063",
					"fileName": "Instructions.pdf",
					"mimeType": "application/pdf",
					"thumbnailUrl": "",
					"url": "test-resources/sap/m/demokit/sample/UploadCollection/LinkedDocuments/Instructions.pdf"
				}, {
					"documentId": "b68a7065-cc2a-2140-922d-e7528cd32172",
					"fileName": "Picture of a woman.png",
					"mimeType": "image/png",
					"thumbnailUrl": "test-resources/sap/m/images/Woman_04.png",
					"url": "test-resources/sap/m/images/Woman_04.png"
				}
			]
		};*/
	}
	};
});