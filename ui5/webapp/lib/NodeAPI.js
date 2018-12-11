sap.ui.define(
	[
		"ui5ns/ui5/model/Constants"	
	],
	function (Constants) {
		var urlBackend = Constants.urlBackend;
		
		//var urlBackend = "/backend/";
		
		return {
			
			pListarRegistros: function (sEntidade) {
				return new Promise(function (resolve, reject) {
					jQuery.ajax(urlBackend + sEntidade, {
						type: "GET",
						dataType: "json"
					}).then(function (response) {
						resolve(response);
					}, function (err) {
						reject(err);
					});
				});
			},
			
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