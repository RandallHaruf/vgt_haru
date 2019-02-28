"use strict";
var nodemailer = require("nodemailer");


	/*
	oProperties = {
		to: string,
		subject: string,
		body: {
			isHtml: boolean,
			content: string
		}
	}*/

module.exports = {
	sendEmail: (oProperties, onSuccess, onError) => {
		
		
		var sSender = "vgt@tenti.com.br";
		var sSenderPassword = "Tenti@2018!";
		
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
};