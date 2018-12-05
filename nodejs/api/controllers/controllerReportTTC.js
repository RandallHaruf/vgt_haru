"use strict";

var model = require("../models/modelReportTTC");

module.exports = {

	listarRegistros: function (req, res) {
		model.listar([], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	criarRegistro: function (req, res) {

		var aParams = [{
			coluna: model.colunas.id
		}, {
			coluna: model.colunas.nome,
			valor: req.body.nome ? req.body.nome : null
		}, {
			coluna: model.colunas.numHFMSAP,
			valor: req.body.numHFMSAP ? req.body.numHFMSAP : null
		}, {
			coluna: model.colunas.tin,
			valor: req.body.tin ? req.body.tin : null
		}, {
			coluna: model.colunas.jurisdicaoTIN,
			valor: req.body.jurisdicaoTIN ? req.body.jurisdicaoTIN : null
		}, {
			coluna: model.colunas.ni,
			valor: req.body.ni ? req.body.ni : null
		}, {
			coluna: model.colunas.jurisdicaoNi,
			valor: req.body.jurisdicaoNi ? req.body.jurisdicaoNi : null
		}, {
			coluna: model.colunas.endereco,
			valor: req.body.endereco ? req.body.endereco : null
		}, {
			coluna: model.colunas.fyStartDate,
			valor: req.body.fyStartDate ? req.body.fyStartDate : null
		}, {
			coluna: model.colunas.fyEndDate,
			valor: req.body.fyEndDate ? req.body.fyEndDate : null
		}, {
			coluna: model.colunas.lbcNome,
			valor: req.body.lbcNome ? req.body.lbcNome : null
		}, {
			coluna: model.colunas.lbcEmail,
			valor: req.body.lbcEmail ? req.body.lbcEmail : null
		}, {
			coluna: model.colunas.comentarios,
			valor: req.body.comentarios ? req.body.comentarios : null
		}, {
			coluna: model.colunas.fkTipoSocietario,
			valor: req.body.fkTipoSocietario ? Number(req.body.fkTipoSocietario) : null
		}, {
			coluna: model.colunas.fkStatus,
			valor: req.body.fkStatus ? Number(req.body.fkStatus) : null
		}, {
			coluna: model.colunas.fkAliquota,
			valor: req.body.fkAliquota ? Number(req.body.fkAliquota) : null
		}, {
			coluna: model.colunas.fkPais,
			valor: req.body.fkPais ? Number(req.body.fkPais) : null
		}];

		model.inserir(aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	lerRegistro: function (req, res) {
		model.listar([{
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	atualizarRegistro: function (req, res) {

		var oCondition = {
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		};

		var aParams = [{
			coluna: model.colunas.nome,
			valor: req.body.nome ? req.body.nome : null
		}, {
			coluna: model.colunas.numHFMSAP,
			valor: req.body.numHFMSAP ? req.body.numHFMSAP : null
		}, {
			coluna: model.colunas.tin,
			valor: req.body.tin ? req.body.tin : null
		}, {
			coluna: model.colunas.jurisdicaoTIN,
			valor: req.body.jurisdicaoTIN ? req.body.jurisdicaoTIN : null
		}, {
			coluna: model.colunas.ni,
			valor: req.body.ni ? req.body.ni : null
		}, {
			coluna: model.colunas.jurisdicaoNi,
			valor: req.body.jurisdicaoNi ? req.body.jurisdicaoNi : null
		}, {
			coluna: model.colunas.endereco,
			valor: req.body.endereco ? req.body.endereco : null
		}, {
			coluna: model.colunas.fyStartDate,
			valor: req.body.fyStartDate ? req.body.fyStartDate : null
		}, {
			coluna: model.colunas.fyEndDate,
			valor: req.body.fyEndDate ? req.body.fyEndDate : null
		}, {
			coluna: model.colunas.lbcNome,
			valor: req.body.lbcNome ? req.body.lbcNome : null
		}, {
			coluna: model.colunas.lbcEmail,
			valor: req.body.lbcEmail ? req.body.lbcEmail : null
		}, {
			coluna: model.colunas.comentarios,
			valor: req.body.comentarios ? req.body.comentarios : null
		}, {
			coluna: model.colunas.fkTipoSocietario,
			valor: req.body.fkTipoSocietario ? Number(req.body.fkTipoSocietario) : null
		}, {
			coluna: model.colunas.fkStatus,
			valor: req.body.fkStatus ? Number(req.body.fkStatus) : null
		}, {
			coluna: model.colunas.fkAliquota,
			valor: req.body.fkAliquota ? Number(req.body.fkAliquota) : null
		}, {
			coluna: model.colunas.fkPais,
			valor: req.body.fkPais ? Number(req.body.fkPais) : null
		}];

		model.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	excluirRegistro: function (req, res) {
		model.excluir([{
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	deepQuery: function (req, res) {
		res.send("TODO: DeepQuery da Entidade ReportTTC");

		/*var sStatement = 'select * from "DUMMY"';

		model.execute({
		statement: sStatement
		}, function (err, result) {
		if (err) {
		res.send(JSON.stringify(err));
		}
		else {
		res.send(JSON.stringify(result));
		}
		});*/
	}
};