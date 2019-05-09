"use strict";
const nodemailer = require("nodemailer");
const appConfig = require("./appConfig.js");
const crypt = require("./crypt.js");

	/*
	oProperties = {
		to: string,
		subject: string,
		body: {
			isHtml: boolean,
			content: string
		}
	}*/

function Email() {
	// Podemos ter um mecanismo de se não passado como parametro email E senha
	// a instancia acessa o banco para consulta-los
	this._email = "";
	this._senha = "";
};

Email.prototype.send = function ({ to, cc, subject, body }, onSuccess, onError) {
	var that = this;
	if(this._email == "" && this._senha == ""){
		appConfig.get([appConfig.EMAIL_QUE_ENVIA,appConfig.SENHA_EMAIL_QUE_ENVIA])
		.then((valores) => {
			this._email = valores.emailQueEnvia;
			this._senha = crypt.decrypt(valores.senhaEmailQueEnvia);
			continuaDisparoEmail(that);
		})
		.catch((error) => {
			console.log(error);
		})
	}
	else{
		continuaDisparoEmail(that);
	}
	function continuaDisparoEmail(that){
		let oTransporter = nodemailer.createTransport({
			host: "smtp.office365.com", // Office 365 server
			port: 587,  				// secure SMTP
			secure: false,				// false for TLS - as a boolean not string - but the default is false so just remove this completely
			auth: {
				user: that._email.toString(),
				pass: that._senha.toString()
			},	
			tls: {
				ciphers: 'SSLv3'
			},
			requireTLS: true
		});
		
		let oMailOptions = {
			from: that._email.toString(),
			to: to,
			cc: cc,
			subject: subject
		};
	
		let sBodyType = body.isHtml ? "html" : "text";		
		oMailOptions[sBodyType] = body.content;		
		
		oTransporter.sendMail(oMailOptions, (error, info) => {
			if (error) {
				console.log(error);							
				if (onError) {
					onError(error);
				}
			}
			else {
				console.log("Email sent: " + info.response);				
				if (onSuccess) {
					onSuccess(info);
				}
			}
		});
	};
	
};

/*let Email = require('sendEmail');

let email = new Email({ email: "meuemaiL", senha: "123" });
email.send({ to: '', cc: ''})*/

module.exports = Email;

/*module.exports = {
	
	sendEmail: (oProperties, onSuccess, onError) => {
		
		// COnta inativada em 11/03/2019 Motivo: Blacklist
		//var sSender = "vgt@tenti.com.br";
		//var sSenderPassword = "Tenti@2018!";
		// COnta inativada em 08/05/2019 Motivo: Blacklist
		//var sSender = "valeglobaltax@tenti.com.br";
		//var sSenderPassword = "60$Z,TBJ~3Dlz4.Z";
		
		
		var oTransporter = nodemailer.createTransport({
			host: "smtp.office365.com", // Office 365 server
			port: 587,     // secure SMTP
			secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
			auth: {
				user: sSender,
				pass: sSenderPassword
			},
			tls: {
				ciphers: 'SSLv3'
			},
			requireTLS: true
		});
		var oMailOptions = {
			from: sSender,
			to: oProperties.to,
			cc: oProperties.cc,
			subject: oProperties.subject
		};

		var sBodyType = oProperties.body.isHtml ? "html" : "text";		
		oMailOptions[sBodyType] = oProperties.body.content;		
		
		oTransporter.sendMail(oMailOptions, (error, info) => {
			if (error) {
				if (onError) {
					onError(error);
				}
				console.log(error);							
			}
			else {
				if (onSuccess) {
					onSuccess(info);
				}
				console.log("Email sent: " + info.response);				
			}
		});
	}
};*/