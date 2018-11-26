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
					case "sap-icon://accept":
						return "green";
					case "sap-icon://decline":
						return "red";
					default:
						return "";
				}
			}
		};
	}
);