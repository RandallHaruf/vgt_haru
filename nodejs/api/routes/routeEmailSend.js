"use strict";

module.exports = function (aRoutes) {
	var controller = require("../controllers/controllerEmailSend");
	var express = require("express");

	aRoutes.push(express.Router().post("/EmailSend", controller.comunicarAdmin));

};