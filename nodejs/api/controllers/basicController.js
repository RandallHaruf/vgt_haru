"use strict";

module.exports = {
	
	/* =========================================================== */
	/* Http Method: GET                                            */
	/* Route Format: /Records									   */
	/* =========================================================== */
	listarTodas: function (req, res, oModel) {
		oModel.listar([], function (err, result) {
			res.send(JSON.stringify(err ? err : result));
		});
	},
	
	/* =========================================================== */
	/* Http Method: GET                                            */
	/* Route Format: /Records/:recordId  						   */
	/* =========================================================== */
	ler: function (req, res, oModel) {
		var oParam = {};
		
		for (var property in oModel.colunas) {
		    if (oModel.colunas.hasOwnProperty(property) && oModel.colunas[property].identity) {
		        oParam.coluna = oModel.colunas[property];
		        for (var recordId in req.params) {
		        	if (req.params.hasOwnProperty(recordId)) {
		        		oParam.valor = req.params[recordId];
		        		break;
		        	}
		        }
		        break;
		    }
		}
		
		oModel.listar([oParam], function (err, result) {
			res.send(JSON.stringify(err ? err : result));
		});
	}
};