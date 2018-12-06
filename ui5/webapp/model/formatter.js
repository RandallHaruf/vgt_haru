sap.ui.define(
	[],
	function () {
		"use strict";
		
		return {
			statusColor: function (sValue) {
				switch (sValue) {
					case "1":
						return "vermelho";
					default:
						return "";
				}
			},
			
			taxPackageIconeListagemEmpresas: function (sIcon) {
				switch (sIcon) {
					case "sap-icon://approvals":
						return "green";
					case "sap-icon://process":
						return "yellow";
					case "sap-icon://decline":
					case "sap-icon://begin":
						return "red";
					default:
						return "";
				}
			}
		};
	}
);