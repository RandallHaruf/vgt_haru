"use strict";

module.exports = function (aRoutes) {
var controller = require("../controllers/controllerReportTaxPackage");
var express = require("express");

aRoutes.push(express.Router().post("/DeepQuery/ReportTaxPackage", controller.deepQuery));
aRoutes.push(express.Router().post("/DeepQueryDistinct/ReportTaxPackage", controller.deepQueryDistinct));

};