sap.ui.define(
	[
		"ui5ns/ui5/model/Constants"
	],
	function (Constants) {
		var urlBackend = Constants.urlBackend;
	
		var encodeQueryString = function (oQueryString) {
			var encodedQueryString = "";
			
			if (oQueryString) {
				var aKey = Object.keys(oQueryString);
				
				for (var i = 0, length = aKey.length; i < length; i++) {
					if (i !== 0) {
						encodedQueryString += "&";
					}
					
					encodedQueryString += aKey[i] + "=" + encodeURIComponent(oQueryString[aKey[i]]);
				}
			}
			
			return encodedQueryString;
		};

		return {

			get: function (sRota, oParam) {
				return new Promise(function (resolve, reject) {
					var encodedQueryString;
					if (oParam) {
						encodedQueryString = encodeQueryString(oParam.queryString);
					}
						
					jQuery.ajax(urlBackend + sRota + (encodedQueryString ? "?" + encodedQueryString : ""), {
						type: "GET",
						xhrFields: {
							withCredentials: true
						},
						crossDomain: true
					}).then(function (response) {
						resolve(response);
					}, function (err) {
						reject(err);
					});
				});
			},

			pListarRegistros: function (sEntidade, oQueryString) {
				var encodedQueryString;
				if (oQueryString) {
					encodedQueryString = encodeQueryString(oQueryString);
				}
					
				return new Promise(function (resolve, reject) {
					jQuery.ajax(urlBackend + sEntidade + (encodedQueryString ? "?" + encodedQueryString : ""), {
						type: "GET",
						xhrFields: {
							withCredentials: true
						},
						crossDomain: true,
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
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						if (callback) {
							callback(response);
						}
					}
				});
			},

			pCriarRegistro: function (sEntidade, oData) {
				return new Promise(function (resolve, reject) {
					jQuery.ajax(urlBackend + sEntidade, {
						type: "POST",
						xhrFields: {
							withCredentials: true
						},
						crossDomain: true,
						data: oData
					}).then(function (response) {
						resolve(response);
					}, function (err) {
						reject(err);
					});
				});
			},

			criarRegistro: function (sEntidade, oData, callback) {
				jQuery.ajax(urlBackend + sEntidade, {
					type: "POST",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: oData,
					success: function (response) {
						if (callback) {
							callback(response);
						}
					}
				});
			},

			pLerRegistro: function (sEntidade, sIdRegistro) {
				return new Promise(function (resolve, reject) {
					jQuery.ajax(urlBackend + sEntidade + "/" + sIdRegistro, {
						type: "GET",
						xhrFields: {
							withCredentials: true
						},
						crossDomain: true
					}).then(function (response) {
						resolve(response);
					}, function (err) {
						reject(err);
					});
				});
			},

			lerRegistro: function (sEntidade, sIdRegistro, callback) {
				jQuery.ajax(urlBackend + sEntidade + "/" + sIdRegistro, {
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						if (callback) {
							callback(response[0]);
						}
					}
				});
			},

			pAtualizarRegistro: function (sEntidade, sIdRegistro, oData) {
				return new Promise(function (resolve, reject) {
					jQuery.ajax(urlBackend + sEntidade + "/" + sIdRegistro, {
						type: "PUT",
						xhrFields: {
							withCredentials: true
						},
						crossDomain: true,
						data: oData
					}).then(function (response) {
						resolve(response);
					}, function (err) {
						reject(err);
					});
				});
			},

			atualizarRegistro: function (sEntidade, sIdRegistro, oParameters, callback) {
				jQuery.ajax(urlBackend + sEntidade + "/" + sIdRegistro, {
					type: "PUT",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: oParameters,
					success: function (response) {
						if (callback) {
							callback(response);
						}
					}
				});
			},

			pExcluirRegistro: function (sEntidade, sIdRegistro) {
				return new Promise(function (resolve, reject) {
					jQuery.ajax(urlBackend + sEntidade + "/" + sIdRegistro, {
						type: "DELETE",
						xhrFields: {
							withCredentials: true
						},
						crossDomain: true
					}).then(function (response) {
						resolve(response);
					}, function (err) {
						reject(err);
					});
				});
			},

			excluirRegistro: function (sEntidade, sIdRegistro, callback) {
				jQuery.ajax(urlBackend + sEntidade + "/" + sIdRegistro, {
					type: "DELETE",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
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