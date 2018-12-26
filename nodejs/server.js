var port = process.env.PORT || 3000;

var cors = require("cors");
var express = require("express");
var cookieSession = require("cookie-session");
var bodyParser = require("body-parser");
var routes = require("./api/routes/routes.js");
var jobs = require("./jobs/jobs.js");
var auth = require("./api/auth.js");
var app = express();

app.use(bodyParser.json({
	limit: "50mb"
}));
app.use(bodyParser.urlencoded({
	limit: "50mb",
	extended: true,
	parameterLimit: 50000
}));

var whitelist = [
	"https://webidetesting7283801-p2000969321trial.dispatcher.hanatrial.ondemand.com",
	"https://webidetesting7283801-p2000895628trial.dispatcher.hanatrial.ondemand.com",
	"https://webidetesting7283801-p2000968011trial.dispatcher.hanatrial.ondemand.com",
	"https://webidetesting7283801-p2000968010trial.dispatcher.hanatrial.ondemand.com",
	"https://webidetesting7283801-p2000965014trial.dispatcher.hanatrial.ondemand.com",
	"https://webidetesting7283801-p2000965144trial.dispatcher.hanatrial.ondemand.com"
];

var corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	optionsSuccessStatus: 204,
	credentials: true
};

app.use(cors(corsOptions));
app.set("trust proxy", 1);

app.use(cookieSession({
	name: "hnck",
	secret: "tempSecret123",
	secure: true,
	httpOnly: false,
	path: "/",
	domain: ".ondemand.com",
	maxAge: 60000 * 60 * 24 * 3 // 3 dias
}));

auth(app);
routes(app);
jobs();

app.listen(port, function () {
	console.log("Nodejs server: " + port);
});
/*

// SCRIPT PARA ENCRIPTAR SENHA DE USUARIOS INSERIDOS NA MÃO

const db = require("./api/db.js");
const bcrypt = require("bcryptjs");

const getUsuarios = function () {
	return new Promise(function (resolve, reject) {
		db.executeStatement({
			statement: 'select * from "VGT.USUARIO"'
		}, function (err, result) {
			if (err) {
				reject(err);
			}	
			else {
				resolve(result);
			}
		});
	});
};

const hashPassword = function (sPassword) {
	return new Promise(function (resolve, reject) {
		bcrypt.hash(sPassword, 5, function (err, hash) {
			if (err) {
				reject(err);
			}
			else {
				resolve(hash);	
			}
		});	
	});
};

const updateUsuario = function (sIdUsuario, sHash) {
	return new Promise(function (resolve, reject) {
		db.executeStatement({
			statement: 'update "VGT.USUARIO" set "pass" = ? where "id_usuario" = ?',
			parameters: [sHash, sIdUsuario]
		}, function (err, result) {
			if (err) {
				reject(err);
			}
			else {
				resolve(result);
			}
		});
	});
};

getUsuarios()
	.then(function (result) {
		for (let i = 0, length = result.length; i < length; i++) {
			hashPassword(result[i].pass)
				.then(function (hash) {
					return updateUsuario(result[i].id_usuario, hash);
				})
				.then(function (res) {
					console.log(res);
				})
				.catch(function (reject) {
					console.log(reject);	
				});
		}
	})
	.catch(function (err) {
		console.log(err);	
	});*/