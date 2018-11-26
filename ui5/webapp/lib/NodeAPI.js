sap.ui.define(
	[],
	function () {
		var urlBackend = "https://p2000950797trial-sdomainvgt-spcvgt-nodejs.cfapps.eu10.hana.ondemand.com/node/"; //app de prod haruf.randall@gmail.com endpoint eu10
		//var urlBackend = "https://dvmpa6yjbo5a0zzv-vgt-nodejs.cfapps.eu10.hana.ondemand.com/node/"; // app de dev da nuvem peusoaresf@yahoo.com.br endpoint eu10
		//var urlBackend = "https://p2000895628trial-trial-dev-nodejs.cfapps.eu10.hana.ondemand.com/node/"; // app publicado na nuvem peusoaresf@yahoo.com.br endpoint eu10
		
		//var urlBackend = "/backend/";
		
		return {
			
			listarRegistros: function (sEntidade, callback) {
				return jQuery.ajax(urlBackend + sEntidade, {
					type: "GET",
					dataType: "json",
					success: function (response) {
						if (callback) {
							callback(response);
						}
					}
				});
			},
			
			criarRegistro: function (sEntidade, oData, callback) {
				jQuery.ajax(urlBackend + sEntidade, {
					type: "POST",
					data: oData,
					success: function (response) {
						if (callback) {
							callback(response);
						}
					}
				});	
			},
			
			lerRegistro: function (sEntidade, sIdRegistro, callback)  {
				jQuery.ajax(urlBackend + sEntidade + "/" + sIdRegistro, {
					type: "GET",
					dataType: "json",
					success: function (response) {
						if (callback) {
							callback(response[0]);
						}
					}
				});
			},
			
			atualizarRegistro: function (sEntidade, sIdRegistro, oParameters, callback) {
				jQuery.ajax(urlBackend + sEntidade + "/" + sIdRegistro, {
					type: "PUT",
					data: oParameters,
					success: function (response) {
						if (callback) {
							callback(response);
						}		
					}
				});
			},
			
			excluirRegistro: function (sEntidade, sIdRegistro, callback) {
				jQuery.ajax(urlBackend + sEntidade + "/" + sIdRegistro, {
					type: "DELETE",
					success: function (response) {
						if (callback) {
							callback(response);
						}
					}
				});
			}
		};	
	}
);