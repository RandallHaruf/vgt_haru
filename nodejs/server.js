/*eslint no-console: 0*/
/*"use strict";

var http = require("http");
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var db = require("./api/db.js");
var routes = require("./api/routes/routes.js");
var jobs = require("./jobs/jobs.js");

var port = process.env.PORT || 3000;
var server = http.createServer();
var app = express();

app.use(require("express-fileupload")());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({origin: "*"}));

//db.connect();

routes(app);
jobs();

server.on("request", app);

server.listen(port, function() {
	console.info("HTTP Server: " + server.address().port);
});*/

var port = process.env.PORT || 3000;

var cors = require("cors");
var express = require('express');
var session = require('express-session');
var crypto = require('crypto');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var MemoryStore = require('memorystore')(session);
var routes = require("./api/routes/routes.js");
var jobs = require("./jobs/jobs.js");
var app = express();

app.use(cookieParser());

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

/*app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());*/

/*var whitelist = ["https://webidetesting7283801-p2000895628trial.dispatcher.hanatrial.ondemand.com"];
var corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true
};

app.use(cors(corsOptions));*/

app.use(cors());
/*app.use(cors({
	origin: "*"
	//origin: "https://webidetesting7283801-p2000895628trial.dispatcher.hanatrial.ondemand.com"
}));*/

app.use(session({
	secret: crypto.randomBytes(20).toString('hex'),
	resave: false,
	saveUninitialized: false,
	store: new MemoryStore({
		checkPeriod: 86400000 // prune expired entries every 24h
	})
}));

app.use(function (req, res, next) {
	if (req.session.qteRequest) {
		req.session.qteRequest++;
	} else {
		req.session.qteRequest = 1;
	}

	console.log("Foram realizadas " + req.session.qteRequest + " requests nesta sessão.");
	next();
});

routes(app);
jobs();

app.listen(port, function () {
	console.log("Nodejs API: " + port);
	/*console.log("CREATE API " + process.env.CREATE_API);*/
});

/*if (process.env.CREATE_API) {
	const fs = require('fs');
	
	fs.appendFileSync('./message.txt', 'data to append');
}*/