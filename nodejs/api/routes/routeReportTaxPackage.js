"use strict";

module.exports = function (aRoutes) {
var controller = require("../controllers/controllerReportTaxPackage");
var express = require("express");

aRoutes.push(express.Router().post("/DeepQuery/ReportTaxPackage", controller.deepQuery));
aRoutes.push(express.Router().post("/DeepQueryDistinct/ReportTaxPackage", controller.deepQueryDistinct));

//aRoutes.push(express.Router().post("/DeepQueryLOSSSCHEDULE/ReportTaxPackage", controller.deepQueryLOSSSCHEDULE));
aRoutes.push(express.Router().post("/DeepQueryDistinctLOSSSCHEDULE/ReportTaxPackage", controller.deepQueryDistinctLOSSSCHEDULE));
aRoutes.push(express.Router().post("/DeepQueryDistinctCREDITSCHEDULE/ReportTaxPackage", controller.deepQueryDistinctCREDITSCHEDULE));
aRoutes.push(express.Router().post("/DeepQueryDistinctAccountingResult/ReportTaxPackage", controller.deepQueryDistinctAccountingResult));
aRoutes.push(express.Router().post("/DeepQueryDistinctFiscalResult/ReportTaxPackage", controller.deepQueryDistinctFiscalResult));
aRoutes.push(express.Router().post("/DeepQueryDistinctIncomeTax/ReportTaxPackage", controller.deepQueryDistinctIncomeTax));
aRoutes.push(express.Router().post("/DeepQueryDistinctTemporaryAndPermanentDifferences/ReportTaxPackage", controller.deepQueryDistinctTemporaryAndPermanentDifferences));
};