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
					case "sap-icon://approvals": // enviado
						return "green";
					case "sap-icon://process": // em andamento
						return "#4285f4";
					case "sap-icon://lateness": // aguardando aprovação de envio
						return "orange";
					case "sap-icon://decline": // fechado não enviado
					case "sap-icon://begin": // não iniciado
						return "red";
					default:
						return "";
				}
			}
		};
	}
);