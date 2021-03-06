var Email = require("../../utils/sendEmails.js");
var db = require("../db.js");
var modelUsuario = require("../models/modelUsuario.js");
var config = require("../../config.json");
const appConfig = require("../../utils/appConfig.js");
let sendEmails = new Email();

module.exports = {
	comunicarAdmin: function (req, res) {
		if (req.body._assunto != "" && req.body._corpo != "") {
			var emailCC = "";
			//var EmailDestino = config.emailComunicacao;
			var nomeUser = req.session.usuario.nome;
			var corpoAux = req.body._corpo;
			var EmailDestino = "";
			appConfig.get(appConfig.EMAIL_QUE_RECEBE)
			.then((email) => {
				EmailDestino = email;
				continuaDisparoEmail();
			})
			.catch((erro) => {
				res.send(JSON.stringify(erro));
			})
			function continuaDisparoEmail(){
				if (req.body._boolEmailCC == true || req.body._boolEmailCC == "true") {
					emailCC = (req.session.usuario.email);
				}
				if (req.body.IdUsuario) {
					modelUsuario.listar([{
						coluna: modelUsuario.colunas.id,
						valor: req.body.IdUsuario
					}], function (err, result) {
						if (err) {
							res.send(JSON.stringify(err));
						} else {
							EmailDestino = result[0]["email"];
							nomeUser = result[0]["nome"];
							corpoAux = corpoAux.replace("User", nomeUser);
	
							sendEmails.send({
								to: EmailDestino,
								cc: emailCC,
								subject: req.body._assunto,
								body: {
									isHtml: true,
									content: "<style>p{font-family:arial!impor}</style>" + corpoAux
								}
							}, function (sucesso) {
								res.send(JSON.stringify(sucesso));
							}, function (err2) {
								res.send(JSON.stringify(err2));
							});
	
						}
					});
				} else {
					corpoAux = corpoAux.replace("User", nomeUser);
	
					sendEmails.send({
						to: EmailDestino,
						cc: emailCC,
						subject: req.body._assunto,
						body: {
							isHtml: true,
							content: corpoAux
						}
					}, function (sucesso) {
						res.send(JSON.stringify(sucesso));
					}, function (err2) {
						res.send(JSON.stringify(err2));
					});
				}	
			}
		}
	},
	
	comunicarSenha: function (EmailUsuario,NomeUsuario,Password){
		if(EmailUsuario != "" && NomeUsuario != "" && Password != ""){
			var emailDestino = EmailUsuario;
			var emailAssunto = "Profile information";
			var corpoEmail = "<style>p{font-family:arial!important}</style>"
			+"<p>Dear " + NomeUsuario + ",</p>"
			+"<p>Your password is: " + Password + "</p>";
			
			return new Promise(function (resolve, reject) {
				sendEmails.send({
						to: emailDestino,
						subject: emailAssunto,
						body: {
							isHtml: true,
							content: corpoEmail
						}
					}, function (sucesso) {
						resolve(JSON.stringify(sucesso));
					}, function (err2) {
						reject(JSON.stringify(err2));
					});	
			});
		}
	},
	
	comunicaReabertura: function (sBody,sAssunto){
		if(sBody && sAssunto){
			//var EmailDestino = config.emailComunicacao;
			var EmailDestino = "";
			appConfig.get(appConfig.EMAIL_QUE_RECEBE)
			.then((email) => {
				EmailDestino = email;
				continuaDisparoEmail();
			})
			.catch((erro) => {
				res.send(JSON.stringify(erro));
			})
			function continuaDisparoEmail(){
				return new Promise(function (resolve, reject) {
				sendEmails.send({
						to: EmailDestino,
						subject: sAssunto,
						body: {
							isHtml: true,
							content: sBody
						}
					}, function (sucesso) {
						resolve(JSON.stringify(sucesso));
					}, function (err2) {
						reject(JSON.stringify(err2));
					});	
				});
			}
		}
	}
};