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
				
				if (req.body._assunto != "" && req.body._corpo != ""){
				
					var aEmail = [];
	
					for (var i = 0, length = result.length; i < length; i++) {
						aEmail.push(result[i].email);
					}
					var emailCC = (req.body._emailCC == "" ? "gabriel.botelho@tenti.com.br" : req.body._emailCC);
					sendEmails.sendEmail({
						to: aEmail,
						cc: emailCC,
						subject: req.body._assunto,
						body:{ 
								isHtml: true,
								content: req.body._corpo
						     }
					}, function (sucesso) {
						res.send(JSON.stringify(sucesso));
					}, function (err2) {
						res.send(JSON.stringify(err2));
					});
				}
			}
			});
	}
};