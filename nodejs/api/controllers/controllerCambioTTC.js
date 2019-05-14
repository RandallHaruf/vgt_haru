"use strict";

var XLSX = require("xlsx");
//var config = require("../../config.js");

var diretorio = "/diretorio/xlsx"; //config.pathToUploads + "cambioTTC/";

function excelDateToString (date) {
	var oDate = new Date(Math.round((date - 25569) * 86400 * 1000));
	return oDate.getUTCFullYear() + "-" +
		("00" + (oDate.getUTCMonth() + 1)).slice(-2) + "-" +
		("00" + oDate.getUTCDate()).slice(-2);
}

function processarWorkbook (workbook, req) {		
	var worksheet = workbook.Sheets[workbook.SheetNames[0]];

	var aColunas = ["A", "B", "C", "D"];
	
	var aPropriedades = [];
	
	for (var i = 0; i < aColunas.length; i++) {
		var sCelula = aColunas[i] + 1;
		
		aPropriedades.push(worksheet[sCelula] ? worksheet[sCelula].v : undefined);
	}
	
	var iLinha = 2;
	var aMyWorksheet = [];		
	
	while (iLinha !== -1) {		
		
		var bLinhaValida = false;
		var oLinha = {};
		
		for (var i = 0; i < aColunas.length; i++) {
			var sCelula = aColunas[i] + iLinha;
			var valorCelula = worksheet[sCelula] ? worksheet[sCelula].v : undefined;				
		
			if (i === 3) {
				oLinha[aPropriedades[i]] = excelDateToString(valorCelula);
			}
			else {
				oLinha[aPropriedades[i]] = valorCelula; 			
			}
			
			if (valorCelula) {
				bLinhaValida = true;
			}
		}	

		if (bLinhaValida) {
			aMyWorksheet.push(oLinha);
			iLinha++;
		}
		else {
			iLinha = -1;
		}
	}
	
	//return JSON.stringify(aMyWorksheet);
	return aMyWorksheet;
}

function criarRegistroCaminhoArquivo (sCaminhoArquivo, callback) {
	console.log("Criar registro do arquivo: " + sCaminhoArquivo);
	
	callback(undefined, 1);
}

function inserirCambio (oRegistro, sIdCaminhoArquivo, callback) {
	console.log(" - Criar registro: " + JSON.stringify(oRegistro) + " para ID: " + sIdCaminhoArquivo);
	
	callback(undefined, 1);
}

module.exports = {
	
	downloadPlanilha: function (req, res) {
		res.download(diretorio + "Moedas.xlsx");
	},
	
	uploadPlanilha: function (req, res) {
		if (req.files) {
			var file = req.files.file,
				filename = (new Date()).getTime() + "_" + file.name;
				
			if (filename.endsWith(".xlsx")) {
				file.mv(diretorio + filename, function (err) {
					if (err) {		
						res.send("error " + err);
					}
					else {
						//res.send(processarWorkbook(workbook));
						
						criarRegistroCaminhoArquivo(diretorio + filename, function (err2, sIdCaminhoArquivo) {
							if (err2) {
								res.send("Erro ao criar registro do arquivo enviado: ", err2);
							}
							else {
								var workbook = XLSX.readFile(diretorio + filename);									
								
								var aDados = processarWorkbook(workbook);
								
								for (var i = 0; i < aDados.length; i++) {
									var oDado = aDados[i];
									
									inserirCambio(oDado, sIdCaminhoArquivo, function (err3, sIdRegistro) {
										if (err3) {
											res.send("Erro ao inserir registro de câmbio: ", err3);
										}
									});
								}
								
								res.send("Dados inseridos com sucesso");
							}
						});
					}
				});
			}
			else {
				res.send("O arquivo não é .xlsx");
			}
		}	
		else {
			res.send("Não foi enviado arquivo");
		}
	}
};