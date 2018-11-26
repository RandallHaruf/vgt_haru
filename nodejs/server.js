/*eslint no-console: 0*/
"use strict";

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
});