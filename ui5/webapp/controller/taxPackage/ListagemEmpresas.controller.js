sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"sap/ui/core/routing/History",
		"sap/ui/model/json/JSONModel",
		"ui5ns/ui5/model/formatter",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/jszip",
		"ui5ns/ui5/lib/XLSX",
		"ui5ns/ui5/lib/FileSaver"
	],
	function (BaseController, History, JSONModel, formatter, NodeAPI) {
		"use strict";

		BaseController.extend("ui5ns.ui5.controller.taxPackage.ListagemEmpresas", {

			formatter: formatter,

			onInit: function () {
				/*var oModel = new JSONModel({
					Companies: [
						{
							name: "CompanyA",
							primeiroTrimestre: "sap-icon://accept",
							segundoTrimestre: "sap-icon://decline",
							terceiroTrimestre: "sap-icon://decline",
							quartoTrimestre: "sap-icon://decline",
							anual: "sap-icon://decline",
							qteRetificadoras: 0
						}
					]
				});
				
				this.setModel(oModel, "companies");*/
				this.setModel(new sap.ui.model.json.JSONModel({}));

				this.getRouter().getRoute("taxPackageListagemEmpresas").attachPatternMatched(this._onRouteMatched, this);
			},

			onBaixarModeloImport: function (oEvent) {
				var wopts = { bookType:'xlsx', bookSST:false, type:'array' };
				
				var workbook = {
					"Directory": {
						"workbooks": [
							"/xl/workbook.xml"
						],
						"sheets": [
							"/xl/worksheets/sheet1.xml",
							"/xl/worksheets/sheet2.xml",
							"/xl/worksheets/sheet3.xml",
							"/xl/worksheets/sheet4.xml",
							"/xl/worksheets/sheet5.xml",
							"/xl/worksheets/sheet6.xml"
						],
						"charts": [],
						"dialogs": [],
						"macros": [],
						"rels": [],
						"strs": [
							"/xl/sharedStrings.xml"
						],
						"comments": [],
						"links": [],
						"coreprops": [
							"/docProps/core.xml"
						],
						"extprops": [
							"/docProps/app.xml"
						],
						"custprops": [],
						"themes": [
							"/xl/theme/theme1.xml"
						],
						"styles": [
							"/xl/styles.xml"
						],
						"vba": [],
						"drawings": [],
						"TODO": [],
						"xmlns": "http://schemas.openxmlformats.org/package/2006/content-types",
						"calcchain": "",
						"sst": "/xl/sharedStrings.xml",
						"style": "/xl/styles.xml",
						"defaults": {
							"bin": "application/vnd.openxmlformats-officedocument.spreadsheetml.printerSettings",
							"rels": "application/vnd.openxmlformats-package.relationships+xml",
							"xml": "application/xml"
						}
					},
					"Workbook": {
						"AppVersion": {
							"appName": "xl",
							"appname": "xl",
							"lastEdited": "7",
							"lastedited": "7",
							"lowestEdited": "7",
							"lowestedited": "7",
							"rupBuild": "20730",
							"rupbuild": "20730"
						},
						"WBProps": {
							"defaultThemeVersion": 166925,
							"allowRefreshQuery": false,
							"autoCompressPictures": true,
							"backupFile": false,
							"checkCompatibility": false,
							"CodeName": "",
							"date1904": false,
							"filterPrivacy": false,
							"hidePivotFieldList": false,
							"promptedSolutions": false,
							"publishItems": false,
							"refreshAllConnections": false,
							"saveExternalLinkValues": true,
							"showBorderUnselectedTables": true,
							"showInkAnnotation": true,
							"showObjects": "all",
							"showPivotChartFilter": false,
							"updateLinks": "userSet"
						},
						"WBView": [{
							"xWindow": "0",
							"xwindow": "0",
							"yWindow": "0",
							"ywindow": "0",
							"windowWidth": "28800",
							"windowwidth": "28800",
							"windowHeight": "11925",
							"windowheight": "11925",
							"uid": "{765EFFEA-488F-4D4B-98B5-FD731DEFDE36}",
							"activeTab": 0,
							"autoFilterDateGrouping": true,
							"firstSheet": 0,
							"minimized": false,
							"showHorizontalScroll": true,
							"showSheetTabs": true,
							"showVerticalScroll": true,
							"tabRatio": 600,
							"visibility": "visible"
						}],
						"Sheets": [{
							"name": "Accounting Result",
							"sheetId": "1",
							"sheetid": "1",
							"id": "rId1",
							"Hidden": 0
						}, {
							"name": "Permanent Differences",
							"sheetId": "2",
							"sheetid": "2",
							"id": "rId2",
							"Hidden": 0
						}, {
							"name": "Temporary Differences",
							"sheetId": "3",
							"sheetid": "3",
							"id": "rId3",
							"Hidden": 0
						}, {
							"name": "Other Taxes",
							"sheetId": "4",
							"sheetid": "4",
							"id": "rId4",
							"Hidden": 0
						}, {
							"name": "Tax Incentives",
							"sheetId": "5",
							"sheetid": "5",
							"id": "rId5",
							"Hidden": 0
						}, {
							"name": "WHT",
							"sheetId": "6",
							"sheetid": "6",
							"id": "rId6",
							"Hidden": 0
						}],
						"CalcPr": {
							"calcId": "191029",
							"calcid": "191029",
							"calcCompleted": "true",
							"calcMode": "auto",
							"calcOnSave": "true",
							"concurrentCalc": "true",
							"fullCalcOnLoad": "false",
							"fullPrecision": "true",
							"iterate": "false",
							"iterateCount": "100",
							"iterateDelta": "0.001",
							"refMode": "A1"
						},
						"Names": [],
						"xmlns": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
					},
					"Props": {
						"LastAuthor": "Pedro Soares Ferraz",
						"Author": "Pedro Soares Ferraz",
						"CreatedDate": "2019-04-02T17:14:38.000Z",
						"ModifiedDate": "2019-04-03T12:41:19.000Z",
						"Application": "Microsoft Excel",
						"AppVersion": "16.0300",
						"Company": "",
						"DocSecurity": "0",
						"HyperlinksChanged": false,
						"SharedDoc": false,
						"LinksUpToDate": false,
						"ScaleCrop": false,
						"Worksheets": 6,
						"SheetNames": [
							"Accounting Result",
							"Permanent Differences",
							"Temporary Differences",
							"Other Taxes",
							"Tax Incentives",
							"WHT"
						]
					},
					"Custprops": {},
					"Deps": {},
					"Sheets": {
						"Accounting Result": {
							"!ref": "A1:E1",
							"A1": {
								"t": "s",
								"v": "Statutory GAAP Profit / (loss) before tax",
								"r": "<t>Statutory GAAP Profit / (loss) before tax</t>",
								"h": "Statutory GAAP Profit / (loss) before tax",
								"w": "Statutory GAAP Profit / (loss) before tax"
							},
							"B1": {
								"t": "s",
								"v": "Current income tax – Current year",
								"r": "<t>Current income tax – Current year</t>",
								"h": "Current income tax – Current year",
								"w": "Current income tax – Current year"
							},
							"C1": {
								"t": "s",
								"v": "Current income tax – Previous Year",
								"r": "<t>Current income tax – Previous Year</t>",
								"h": "Current income tax – Previous Year",
								"w": "Current income tax – Previous Year"
							},
							"D1": {
								"t": "s",
								"v": "Deferred Income Tax",
								"r": "<t>Deferred Income Tax</t>",
								"h": "Deferred Income Tax",
								"w": "Deferred Income Tax"
							},
							"E1": {
								"t": "s",
								"v": "Non- Recoverable WHT",
								"r": "<t>Non- Recoverable WHT</t>",
								"h": "Non- Recoverable WHT",
								"w": "Non- Recoverable WHT"
							},
							"!margins": {
								"left": 0.511811024,
								"right": 0.511811024,
								"top": 0.787401575,
								"bottom": 0.787401575,
								"header": 0.31496062,
								"footer": 0.31496062
							}
						},
						"Permanent Differences": {
							//"!ref": "A1:F21",
							"A1": {
								"t": "s",
								"v": "Type",
								"r": "<t>Type</t>",
								"h": "Type",
								"w": "Type"
							},
							"B1": {
								"t": "s",
								"v": "Other",
								"r": "<t>Other</t>",
								"h": "Other",
								"w": "Other"
							},
							"C1": {
								"t": "s",
								"v": "Value",
								"r": "<t>Value</t>",
								"h": "Value",
								"w": "Value"
							},
							/*"E2": {
								"t": "n",
								"v": 1,
								"w": "1"
							},
							"F2": {
								"t": "s",
								"v": "Meals and entertaining including gifts",
								"r": "<t>Meals and entertaining including gifts</t>",
								"h": "Meals and entertaining including gifts",
								"w": "Meals and entertaining including gifts"
							},
							"E3": {
								"t": "n",
								"v": 2,
								"w": "2"
							},
							"F3": {
								"t": "s",
								"v": "Amortization",
								"r": "<t>Amortization</t>",
								"h": "Amortization",
								"w": "Amortization"
							},
							"E4": {
								"t": "n",
								"v": 3,
								"w": "3"
							},
							"F4": {
								"t": "s",
								"v": "Goodwill",
								"r": "<t>Goodwill</t>",
								"h": "Goodwill",
								"w": "Goodwill"
							},
							"E5": {
								"t": "n",
								"v": 4,
								"w": "4"
							},
							"F5": {
								"t": "s",
								"v": "Tax exempt interest",
								"r": "<t>Tax exempt interest</t>",
								"h": "Tax exempt interest",
								"w": "Tax exempt interest"
							},
							"E6": {
								"t": "n",
								"v": 5,
								"w": "5"
							},
							"F6": {
								"t": "s",
								"v": "Interest",
								"r": "<t>Interest</t>",
								"h": "Interest",
								"w": "Interest"
							},
							"E7": {
								"t": "n",
								"v": 6,
								"w": "6"
							},
							"F7": {
								"t": "s",
								"v": "Penalties/fines",
								"r": "<t>Penalties/fines</t>",
								"h": "Penalties/fines",
								"w": "Penalties/fines"
							},
							"E8": {
								"t": "n",
								"v": 7,
								"w": "7"
							},
							"F8": {
								"t": "s",
								"v": "Legal and professional fees",
								"r": "<t>Legal and professional fees</t>",
								"h": "Legal and professional fees",
								"w": "Legal and professional fees"
							},
							"E9": {
								"t": "n",
								"v": 8,
								"w": "8"
							},
							"F9": {
								"t": "s",
								"v": "Dividend income",
								"r": "<t>Dividend income</t>",
								"h": "Dividend income",
								"w": "Dividend income"
							},
							"E10": {
								"t": "n",
								"v": 11,
								"w": "11"
							},
							"F10": {
								"t": "s",
								"v": "Capital gains",
								"r": "<t>Capital gains</t>",
								"h": "Capital gains",
								"w": "Capital gains"
							},
							"E11": {
								"t": "n",
								"v": 27,
								"w": "27"
							},
							"F11": {
								"t": "s",
								"v": "Research and development",
								"r": "<t>Research and development</t>",
								"h": "Research and development",
								"w": "Research and development"
							},
							"E12": {
								"t": "n",
								"v": 28,
								"w": "28"
							},
							"F12": {
								"t": "s",
								"v": "Travel and subsistence",
								"r": "<t>Travel and subsistence</t>",
								"h": "Travel and subsistence",
								"w": "Travel and subsistence"
							},
							"E13": {
								"t": "n",
								"v": 29,
								"w": "29"
							},
							"F13": {
								"t": "s",
								"v": "Advertising (including sponsorship costs)",
								"r": "<t>Advertising (including sponsorship costs)</t>",
								"h": "Advertising (including sponsorship costs)",
								"w": "Advertising (including sponsorship costs)"
							},
							"E14": {
								"t": "n",
								"v": 30,
								"w": "30"
							},
							"F14": {
								"t": "s",
								"v": "Higher rates on foreign earnings",
								"r": "<t>Higher rates on foreign earnings</t>",
								"h": "Higher rates on foreign earnings",
								"w": "Higher rates on foreign earnings"
							},
							"E15": {
								"t": "n",
								"v": 31,
								"w": "31"
							},
							"F15": {
								"t": "s",
								"v": "State / local taxes",
								"r": "<t>State / local taxes</t>",
								"h": "State / local taxes",
								"w": "State / local taxes"
							},
							"E16": {
								"t": "n",
								"v": 32,
								"w": "32"
							},
							"F16": {
								"t": "s",
								"v": "Other permanent differences",
								"r": "<t>Other permanent differences</t>",
								"h": "Other permanent differences",
								"w": "Other permanent differences"
							},
							"E17": {
								"t": "n",
								"v": 15,
								"w": "15"
							},
							"F17": {
								"t": "s",
								"v": "Management fee, recharges and headquarter allocations",
								"r": "<t>Management fee, recharges and headquarter allocations</t>",
								"h": "Management fee, recharges and headquarter allocations",
								"w": "Management fee, recharges and headquarter allocations"
							},
							"E18": {
								"t": "n",
								"v": 33,
								"w": "33"
							},
							"F18": {
								"t": "s",
								"v": "Donations",
								"r": "<t>Donations</t>",
								"h": "Donations",
								"w": "Donations"
							},
							"E19": {
								"t": "n",
								"v": 34,
								"w": "34"
							},
							"F19": {
								"t": "s",
								"v": "Foreign Exchange",
								"r": "<t>Foreign Exchange</t>",
								"h": "Foreign Exchange",
								"w": "Foreign Exchange"
							},
							"E20": {
								"t": "n",
								"v": 35,
								"w": "35"
							},
							"F20": {
								"t": "s",
								"v": "Items disallowed due to insuficient documentation",
								"r": "<t>Items disallowed due to insuficient documentation</t>",
								"h": "Items disallowed due to insuficient documentation",
								"w": "Items disallowed due to insuficient documentation"
							},
							"E21": {
								"t": "n",
								"v": 122
							},
							"F21": {
								"v": "Minha diferença customizada"
							},*/
							"!margins": {
								"left": 0.511811024,
								"right": 0.511811024,
								"top": 0.787401575,
								"bottom": 0.787401575,
								"header": 0.31496062,
								"footer": 0.31496062
							}
						},
						"Temporary Differences": {
							//"!ref": "A1:F17",
							"A1": {
								"t": "s",
								"v": "Type",
								"r": "<t>Type</t>",
								"h": "Type",
								"w": "Type"
							},
							"B1": {
								"t": "s",
								"v": "Other",
								"r": "<t>Other</t>",
								"h": "Other",
								"w": "Other"
							},
							"C1": {
								"t": "s",
								"v": "Value",
								"r": "<t>Value</t>",
								"h": "Value",
								"w": "Value"
							},
							/*"E2": {
								"t": "n",
								"v": 9,
								"w": "9"
							},
							"F2": {
								"t": "s",
								"v": "Tangible fixed assets",
								"r": "<t>Tangible fixed assets</t>",
								"h": "Tangible fixed assets",
								"w": "Tangible fixed assets"
							},
							"E3": {
								"t": "n",
								"v": 10,
								"w": "10"
							},
							"F3": {
								"t": "s",
								"v": "Intangible assets",
								"r": "<t>Intangible assets</t>",
								"h": "Intangible assets",
								"w": "Intangible assets"
							},
							"E4": {
								"t": "n",
								"v": 12,
								"w": "12"
							},
							"F4": {
								"t": "s",
								"v": "Impairment",
								"r": "<t>Impairment</t>",
								"h": "Impairment",
								"w": "Impairment"
							},
							"E5": {
								"t": "n",
								"v": 13,
								"w": "13"
							},
							"F5": {
								"t": "s",
								"v": "Pensions and post retirement benefits",
								"r": "<t>Pensions and post retirement benefits</t>",
								"h": "Pensions and post retirement benefits",
								"w": "Pensions and post retirement benefits"
							},
							"E6": {
								"t": "n",
								"v": 14,
								"w": "14"
							},
							"F6": {
								"t": "s",
								"v": "Revenue recognition",
								"r": "<t>Revenue recognition</t>",
								"h": "Revenue recognition",
								"w": "Revenue recognition"
							},
							"E7": {
								"t": "n",
								"v": 16,
								"w": "16"
							},
							"F7": {
								"t": "s",
								"v": "Allowance for doubtful debt",
								"r": "<t>Allowance for doubtful debt</t>",
								"h": "Allowance for doubtful debt",
								"w": "Allowance for doubtful debt"
							},
							"E8": {
								"t": "n",
								"v": 17,
								"w": "17"
							},
							"F8": {
								"t": "s",
								"v": "Accrued expenses and provisions",
								"r": "<t>Accrued expenses and provisions</t>",
								"h": "Accrued expenses and provisions",
								"w": "Accrued expenses and provisions"
							},
							"E9": {
								"t": "n",
								"v": 18,
								"w": "18"
							},
							"F9": {
								"t": "s",
								"v": "Amortization",
								"r": "<t>Amortization</t>",
								"h": "Amortization",
								"w": "Amortization"
							},
							"E10": {
								"t": "n",
								"v": 19,
								"w": "19"
							},
							"F10": {
								"t": "s",
								"v": "Inventory reserve",
								"r": "<t>Inventory reserve</t>",
								"h": "Inventory reserve",
								"w": "Inventory reserve"
							},
							"E11": {
								"t": "n",
								"v": 20,
								"w": "20"
							},
							"F11": {
								"t": "s",
								"v": "Interest",
								"r": "<t>Interest</t>",
								"h": "Interest",
								"w": "Interest"
							},
							"E12": {
								"t": "n",
								"v": 21,
								"w": "21"
							},
							"F12": {
								"t": "s",
								"v": "Rolled over gains",
								"r": "<t>Rolled over gains</t>",
								"h": "Rolled over gains",
								"w": "Rolled over gains"
							},
							"E13": {
								"t": "n",
								"v": 22,
								"w": "22"
							},
							"F13": {
								"t": "s",
								"v": "Financial instruments",
								"r": "<t>Financial instruments</t>",
								"h": "Financial instruments",
								"w": "Financial instruments"
							},
							"E14": {
								"t": "n",
								"v": 23,
								"w": "23"
							},
							"F14": {
								"t": "s",
								"v": "Share based payments",
								"r": "<t>Share based payments</t>",
								"h": "Share based payments",
								"w": "Share based payments"
							},
							"E15": {
								"t": "n",
								"v": 25,
								"w": "25"
							},
							"F15": {
								"t": "s",
								"v": "Foreign exchange",
								"r": "<t>Foreign exchange</t>",
								"h": "Foreign exchange",
								"w": "Foreign exchange"
							},
							"E16": {
								"t": "n",
								"v": 26,
								"w": "26"
							},
							"F16": {
								"t": "s",
								"v": "Other employee benefits",
								"r": "<t>Other employee benefits</t>",
								"h": "Other employee benefits",
								"w": "Other employee benefits"
							},
							"E17": {
								"t": "n",
								"v": 24,
								"w": "24"
							},
							"F17": {
								"t": "s",
								"v": "Other temporary differences - Provide details",
								"r": "<t>Other temporary differences - Provide details</t>",
								"h": "Other temporary differences - Provide details",
								"w": "Other temporary differences - Provide details"
							},*/
							"!margins": {
								"left": 0.511811024,
								"right": 0.511811024,
								"top": 0.787401575,
								"bottom": 0.787401575,
								"header": 0.31496062,
								"footer": 0.31496062
							}
						},
						"Other Taxes": {
							"!ref": "A1:B1",
							"A1": {
								"t": "s",
								"v": "Description",
								"r": "<t>Description</t>",
								"h": "Description",
								"w": "Description"
							},
							"B1": {
								"t": "s",
								"v": "Value",
								"r": "<t>Value</t>",
								"h": "Value",
								"w": "Value"
							},
							"!margins": {
								"left": 0.511811024,
								"right": 0.511811024,
								"top": 0.787401575,
								"bottom": 0.787401575,
								"header": 0.31496062,
								"footer": 0.31496062
							}
						},
						"Tax Incentives": {
							"!ref": "A1:B1",
							"A1": {
								"t": "s",
								"v": "Description",
								"r": "<t>Description</t>",
								"h": "Description",
								"w": "Description"
							},
							"B1": {
								"t": "s",
								"v": "Value",
								"r": "<t>Value</t>",
								"h": "Value",
								"w": "Value"
							},
							"!margins": {
								"left": 0.511811024,
								"right": 0.511811024,
								"top": 0.787401575,
								"bottom": 0.787401575,
								"header": 0.31496062,
								"footer": 0.31496062
							}
						},
						"WHT": {
							"!ref": "A1:B1",
							"A1": {
								"t": "s",
								"v": "Description",
								"r": "<t>Description</t>",
								"h": "Description",
								"w": "Description"
							},
							"B1": {
								"t": "s",
								"v": "Value",
								"r": "<t>Value</t>",
								"h": "Value",
								"w": "Value"
							},
							"!margins": {
								"left": 0.511811024,
								"right": 0.511811024,
								"top": 0.787401575,
								"bottom": 0.787401575,
								"header": 0.31496062,
								"footer": 0.31496062
							}
						}
					},
					"SheetNames": [
						"Accounting Result",
						"Permanent Differences",
						"Temporary Differences",
						"Other Taxes",
						"Tax Incentives",
						"WHT"
					],
					"Strings": [{
						"t": "Statutory GAAP Profit / (loss) before tax",
						"r": "<t>Statutory GAAP Profit / (loss) before tax</t>",
						"h": "Statutory GAAP Profit / (loss) before tax"
					}, {
						"t": "Current income tax – Current year",
						"r": "<t>Current income tax – Current year</t>",
						"h": "Current income tax – Current year"
					}, {
						"t": "Current income tax – Previous Year",
						"r": "<t>Current income tax – Previous Year</t>",
						"h": "Current income tax – Previous Year"
					}, {
						"t": "Deferred Income Tax",
						"r": "<t>Deferred Income Tax</t>",
						"h": "Deferred Income Tax"
					}, {
						"t": "Non- Recoverable WHT",
						"r": "<t>Non- Recoverable WHT</t>",
						"h": "Non- Recoverable WHT"
					}, {
						"t": "Type",
						"r": "<t>Type</t>",
						"h": "Type"
					}, {
						"t": "Other",
						"r": "<t>Other</t>",
						"h": "Other"
					}, {
						"t": "Value",
						"r": "<t>Value</t>",
						"h": "Value"
					}, {
						"t": "Description",
						"r": "<t>Description</t>",
						"h": "Description"
					}, {
						"t": "Meals and entertaining including gifts",
						"r": "<t>Meals and entertaining including gifts</t>",
						"h": "Meals and entertaining including gifts"
					}, {
						"t": "Amortization",
						"r": "<t>Amortization</t>",
						"h": "Amortization"
					}, {
						"t": "Goodwill",
						"r": "<t>Goodwill</t>",
						"h": "Goodwill"
					}, {
						"t": "Tax exempt interest",
						"r": "<t>Tax exempt interest</t>",
						"h": "Tax exempt interest"
					}, {
						"t": "Interest",
						"r": "<t>Interest</t>",
						"h": "Interest"
					}, {
						"t": "Penalties/fines",
						"r": "<t>Penalties/fines</t>",
						"h": "Penalties/fines"
					}, {
						"t": "Legal and professional fees",
						"r": "<t>Legal and professional fees</t>",
						"h": "Legal and professional fees"
					}, {
						"t": "Dividend income",
						"r": "<t>Dividend income</t>",
						"h": "Dividend income"
					}, {
						"t": "Capital gains",
						"r": "<t>Capital gains</t>",
						"h": "Capital gains"
					}, {
						"t": "Research and development",
						"r": "<t>Research and development</t>",
						"h": "Research and development"
					}, {
						"t": "Travel and subsistence",
						"r": "<t>Travel and subsistence</t>",
						"h": "Travel and subsistence"
					}, {
						"t": "Advertising (including sponsorship costs)",
						"r": "<t>Advertising (including sponsorship costs)</t>",
						"h": "Advertising (including sponsorship costs)"
					}, {
						"t": "Higher rates on foreign earnings",
						"r": "<t>Higher rates on foreign earnings</t>",
						"h": "Higher rates on foreign earnings"
					}, {
						"t": "State / local taxes",
						"r": "<t>State / local taxes</t>",
						"h": "State / local taxes"
					}, {
						"t": "Other permanent differences",
						"r": "<t>Other permanent differences</t>",
						"h": "Other permanent differences"
					}, {
						"t": "Management fee, recharges and headquarter allocations",
						"r": "<t>Management fee, recharges and headquarter allocations</t>",
						"h": "Management fee, recharges and headquarter allocations"
					}, {
						"t": "Donations",
						"r": "<t>Donations</t>",
						"h": "Donations"
					}, {
						"t": "Foreign Exchange",
						"r": "<t>Foreign Exchange</t>",
						"h": "Foreign Exchange"
					}, {
						"t": "Items disallowed due to insuficient documentation",
						"r": "<t>Items disallowed due to insuficient documentation</t>",
						"h": "Items disallowed due to insuficient documentation"
					}, {
						"t": "Tangible fixed assets",
						"r": "<t>Tangible fixed assets</t>",
						"h": "Tangible fixed assets"
					}, {
						"t": "Intangible assets",
						"r": "<t>Intangible assets</t>",
						"h": "Intangible assets"
					}, {
						"t": "Impairment",
						"r": "<t>Impairment</t>",
						"h": "Impairment"
					}, {
						"t": "Pensions and post retirement benefits",
						"r": "<t>Pensions and post retirement benefits</t>",
						"h": "Pensions and post retirement benefits"
					}, {
						"t": "Revenue recognition",
						"r": "<t>Revenue recognition</t>",
						"h": "Revenue recognition"
					}, {
						"t": "Allowance for doubtful debt",
						"r": "<t>Allowance for doubtful debt</t>",
						"h": "Allowance for doubtful debt"
					}, {
						"t": "Accrued expenses and provisions",
						"r": "<t>Accrued expenses and provisions</t>",
						"h": "Accrued expenses and provisions"
					}, {
						"t": "Inventory reserve",
						"r": "<t>Inventory reserve</t>",
						"h": "Inventory reserve"
					}, {
						"t": "Rolled over gains",
						"r": "<t>Rolled over gains</t>",
						"h": "Rolled over gains"
					}, {
						"t": "Financial instruments",
						"r": "<t>Financial instruments</t>",
						"h": "Financial instruments"
					}, {
						"t": "Share based payments",
						"r": "<t>Share based payments</t>",
						"h": "Share based payments"
					}, {
						"t": "Foreign exchange",
						"r": "<t>Foreign exchange</t>",
						"h": "Foreign exchange"
					}, {
						"t": "Other employee benefits",
						"r": "<t>Other employee benefits</t>",
						"h": "Other employee benefits"
					}, {
						"t": "Other temporary differences - Provide details",
						"r": "<t>Other temporary differences - Provide details</t>",
						"h": "Other temporary differences - Provide details"
					}],
					"Styles": {
						"Fonts": [{
							"sz": 11,
							"color": {
								"theme": 1
							},
							"name": "Calibri",
							"family": 2,
							"scheme": "minor"
						}, {
							"bold": 1,
							"sz": 11,
							"color": {
								"theme": 1
							},
							"name": "Calibri",
							"family": 2,
							"scheme": "minor"
						}, {
							"sz": 11,
							"color": {
								"rgb": "333333"
							},
							"name": "Arial",
							"family": 2
						}],
						"Fills": [{
							"patternType": "none"
						}, {
							"patternType": "gray125"
						}],
						"Borders": [{}],
						"CellXf": [{
							"numFmtId": 0,
							"numfmtid": "0",
							"fontId": 0,
							"fontid": "0",
							"fillId": 0,
							"fillid": "0",
							"borderId": 0,
							"borderid": "0",
							"xfId": 0,
							"xfid": "0"
						}, {
							"numFmtId": 0,
							"numfmtid": "0",
							"fontId": 1,
							"fontid": "1",
							"fillId": 0,
							"fillid": "0",
							"borderId": 0,
							"borderid": "0",
							"xfId": 0,
							"xfid": "0",
							"applyFont": true,
							"applyfont": "1"
						}, {
							"numFmtId": 0,
							"numfmtid": "0",
							"fontId": 2,
							"fontid": "2",
							"fillId": 0,
							"fillid": "0",
							"borderId": 0,
							"borderid": "0",
							"xfId": 0,
							"xfid": "0",
							"applyFont": true,
							"applyfont": "1"
						}, {
							"numFmtId": 0,
							"numfmtid": "0",
							"fontId": 0,
							"fontid": "0",
							"fillId": 0,
							"fillid": "0",
							"borderId": 0,
							"borderid": "0",
							"xfId": 0,
							"xfid": "0",
							"applyFont": true,
							"applyfont": "1"
						}, {
							"numFmtId": 0,
							"numfmtid": "0",
							"fontId": 0,
							"fontid": "0",
							"fillId": 0,
							"fillid": "0",
							"borderId": 0,
							"borderid": "0",
							"xfId": 0,
							"xfid": "0",
							"applyAlignment": true,
							"applyalignment": "1",
							"alignment": {
								"vertical": "center",
								"wrapText": "1"
							}
						}, {
							"numFmtId": 0,
							"numfmtid": "0",
							"fontId": 0,
							"fontid": "0",
							"fillId": 0,
							"fillid": "0",
							"borderId": 0,
							"borderid": "0",
							"xfId": 0,
							"xfid": "0",
							"applyAlignment": true,
							"applyalignment": "1",
							"alignment": {
								"vertical": "center"
							}
						}, {
							"numFmtId": 0,
							"numfmtid": "0",
							"fontId": 0,
							"fontid": "0",
							"fillId": 0,
							"fillid": "0",
							"borderId": 0,
							"borderid": "0",
							"xfId": 0,
							"xfid": "0",
							"applyAlignment": true,
							"applyalignment": "1"
						}]
					},
					"Themes": {},
					"SSF": {
						"0": "General",
						"1": "0",
						"2": "0.00",
						"3": "#,##0",
						"4": "#,##0.00",
						"9": "0%",
						"10": "0.00%",
						"11": "0.00E+00",
						"12": "# ?/?",
						"13": "# ??/??",
						"14": "m/d/yy",
						"15": "d-mmm-yy",
						"16": "d-mmm",
						"17": "mmm-yy",
						"18": "h:mm AM/PM",
						"19": "h:mm:ss AM/PM",
						"20": "h:mm",
						"21": "h:mm:ss",
						"22": "m/d/yy h:mm",
						"37": "#,##0 ;(#,##0)",
						"38": "#,##0 ;[Red](#,##0)",
						"39": "#,##0.00;(#,##0.00)",
						"40": "#,##0.00;[Red](#,##0.00)",
						"45": "mm:ss",
						"46": "[h]:mm:ss",
						"47": "mmss.0",
						"48": "##0.0E+0",
						"49": "@",
						"56": "\"上午/下午 \"hh\"時\"mm\"分\"ss\"秒 \"",
						"65535": "General"
					}
				};

				NodeAPI.pListarRegistros("DiferencaOpcao")
					.then(function (res) {
						var inserirLinhas = function (worksheet, iOpcao) {
							var aOpcao = res.filter(function (obj) {
								return Number(obj["fk_dominio_diferenca_tipo.id_dominio_diferenca_tipo"]) === iOpcao;
							});
							
							var i = 0,
								linhaPlanilha = i + 2;
							
							for (var length = aOpcao.length; i < length; i++, linhaPlanilha++) {
								var oOpcao = aOpcao[i];
								
								worksheet["E" + (linhaPlanilha)] = { v: oOpcao.id_diferenca_opcao, t: "n" };
								worksheet["F" + (linhaPlanilha)] = { v: oOpcao.nome };
							}	
							
							worksheet["!ref"] = "A1:F" + linhaPlanilha;
						};
						
						inserirLinhas(workbook.Sheets["Permanent Differences"], 1);
						inserirLinhas(workbook.Sheets["Temporary Differences"], 2);
						
						var wbout = XLSX.write(workbook, wopts);
						
						saveAs(new Blob([wbout], {
							type: "application/octet-stream"
						}), "test.xlsx");
					})
					.catch(function (err) {
						alert(err.status + ' - ' + err.statusText);	
					});
			},

			navToHome: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			onNavToReport: function () {
				this.getRouter().navTo("taxPackageRelatorio");
			},

			onNavBack: function () {
				this.getRouter().navTo("selecaoModulo");
			},

			onTrocarAnoCalendario: function () {
				//alert("Trocou ano calendário");
				//sap.m.MessageToast.show("Trocou ano calendário");
				this._atualizarDados();
			},

			onSelecionarEmpresa: function (oEvent) {
				this.setBusy(this.byId("tabelaEmpresas"), true);

				var oEmpresa = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				delete oEmpresa.iconeStatusPrimeiroPeriodo;
				delete oEmpresa.iconeStatusSegundoPeriodo;
				delete oEmpresa.iconeStatusTerceiroPeriodo;
				delete oEmpresa.iconeStatusQuartoPeriodo;
				delete oEmpresa.iconeStatusAnual;

				var oParametros = {
					empresa: oEmpresa,
					idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionado")
				};

				this.getRouter().navTo("taxPackageResumoTrimestre", {
					parametros: JSON.stringify(oParametros)
				});
			},

			_onRouteMatched: function (oEvent) {
				this.setBusy(this.byId("tabelaEmpresas"), false);

				if (this.isIFrame()) {
					this.mostrarAcessoRapidoInception();
				}

				var that = this;
				var parametro = JSON.parse(oEvent.getParameter("arguments").parametros).idAnoCalendario;

				NodeAPI.listarRegistros("DominioAnoCalendario", function (response) {
					if (response) {
						that.getModel().setProperty("/DominioAnoCalendario", response);
						that.getModel().setProperty("/AnoCalendarioSelecionado", parametro);
						that._atualizarDados();
						/*
						var oAnoCorrente = response.find(function (element) {
							return element.ano_calendario === (new Date()).getFullYear();
						});
					
						if (oAnoCorrente) {
							that.getModel().setProperty("/AnoCalendarioSelecionado", oAnoCorrente.id_dominio_ano_calendario);      
							
							that._atualizarDados();
						}*/
					}
				});
			},

			_atualizarDados: function () {
				var sIdAnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado");

				var that = this;

				this.byId("tabelaEmpresas").setBusyIndicatorDelay(100);
				this.byId("tabelaEmpresas").setBusy(true);

				NodeAPI.listarRegistros("TaxPackageListagemEmpresas?anoCalendario=" + sIdAnoCalendario + "&full=" + (this.isIFrame() ? "true" :
					"false"), function (response) {
					if (response && response.success) {
						for (var i = 0, length = response.result.length; i < length; i++) {
							var obj = response.result[i];
							obj.iconeStatusPrimeiroPeriodo = that._resolverIcone(obj.status_primeiro_periodo);
							obj.iconeStatusSegundoPeriodo = that._resolverIcone(obj.status_segundo_periodo);
							obj.iconeStatusTerceiroPeriodo = that._resolverIcone(obj.status_terceiro_periodo);
							obj.iconeStatusQuartoPeriodo = that._resolverIcone(obj.status_quarto_periodo);
							obj.iconeStatusAnual = that._resolverIcone(obj.status_anual);
						}
						that.getModel().setProperty("/Empresa", response.result);
					}

					that.byId("tabelaEmpresas").setBusy(false);
				});
			},

			_resolverIcone: function (iStatus) {
				var sIcone;

				switch (iStatus) {
				case 1: // fechado não enviado
					sIcone = "sap-icon://decline";
					break;
				case 2: // não iniciado
					sIcone = "sap-icon://begin";
					break;
				case 3: // em andamento
					sIcone = "sap-icon://process";
					break;
				case 4: // enviado
					sIcone = "sap-icon://approvals";
					break;
				case 5: // Aguardando aprovação
					sIcone = "sap-icon://lateness";
					break;
				}

				return sIcone;
			}
		});
	}
);