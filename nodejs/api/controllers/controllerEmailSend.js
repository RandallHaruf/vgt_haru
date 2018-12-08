var sendEmails = require("../../jobs/sendEmails.js");
var db = require("../db.js");
var modelUsuario = require("../models/modelUsuario.js");

module.exports = {
	comunicarAdmin: function (req, res) {
		modelUsuario.listar([{
			coluna: modelUsuario.colunas.fkDominioTipoAcesso,
			valor: 1
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				var aEmail = [];

				for (var i = 0, length = result.length; i < length; i++) {
					aEmail.push(result[i].email);
				}

				sendEmails.sendEmail({
					to: aEmail,
					subject: req.body._assunto,
					content: req.body._corpo,
					body: "html"
				}, function (sucesso) {
					res.send(JSON.stringify(sucesso));
				}, function (err2) {
					res.send(JSON.stringify(err2));
				});
			}
		});
		/*db.executeStatement({
			statement: 'select * from "VGT.USUARIO" where "fk_dominio_tipo_acesso.id_tipo_acesso" = ?',
			parameters: [1]
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				var aEmail = [];

				for (var i = 0, length = result.length; i < length; i++) {
					aEmail.push(result[i].email);
				}

				sendEmails.sendEmail({
					to: aEmail,
					subject: req.body._assunto,
					content: req.body._corpo,
					body: "html"
				}, function (sucesso) {
					res.send(JSON.stringify(sucesso));
				}, function (err2) {
					res.send(JSON.stringify(err2));
				});
			}
		});*/
	}
};