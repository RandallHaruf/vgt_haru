sap.ui.define(
	[
		"ui5ns/ui5/model/Constants"
	],
	function (Constants) {
		return {
			
			listar: function (sRota) {
				return new Promise(function (resolve, reject) {
					jQuery.ajax({
						url: Constants.urlBackend + sRota,
						type: "GET",
						xhrFields: {
							withCredentials: true
						},
						crossDomain: true,
						dataType: "json"
					}).then(function (response) {
						if (response.success) {
							resolve(response.result);
						} else {
							reject(response);
						}
					}, function (err) {
						reject(err.status);
					});
				});
			},
			
			upload: function (oArquivo, sNomeArquivo, sRota, oData, options) {
				return new Promise(function (resolve, reject) {
					var formData = new FormData();
					formData.append("file", oArquivo);
					formData.append("filename", sNomeArquivo);
					
					var aKey = Object.keys(oData);
					
					for (var i = 0; i < aKey.length; i++) {
						formData.append(aKey[i], oData[aKey[i]]);
					}

					jQuery.ajax({
						url: Constants.urlBackend + sRota,
						data: formData,
						type: "POST",
						xhrFields: {
							withCredentials: true
						},
						crossDomain: true,
						contentType: false,
						processData: false,
						dataType: "json",
						xhr: function () {
							var xhr = new XMLHttpRequest();
							
							if (options && options.onProgress) {
								xhr.upload.addEventListener('progress', function (e) {
									if (e.lengthComputable) {
										options.onProgress(parseInt((e.loaded / e.total) * 100, 10));
									}
									else {
										console.log('Length not computable.');
									}
								});
							}
							
							return xhr;
						}
					}).then(function (response) {
						if (response.success) {
							resolve(response.result);
						} else {
							reject(response);
						}
					}, function (err) {
						reject(err.status);
					});
				});
			},
			
			download: function (sRota) {
				return new Promise(function (resolve, reject) {
					jQuery.ajax({
						//url: "https://kwbklufmudxr7o61-vgt-haru-nodejs.cfapps.eu10.hana.ondemand.com/node/DownloadArquivo?arquivo=" + sIdArquivo,
						url: Constants.urlBackend + sRota,
						type: "GET",
						xhrFields: {
							withCredentials: true
						},
						crossDomain: true,
						dataType: "json"
					}).then(function (response) {
						if (response.success) {
							resolve(response.result);
						} else {
							reject(response);
						}
					}, function (err) {
						reject(err.status);
					});
				});
			},
			
			salvar: function (sNome, sTipo, aDataArray) {
				var a = document.createElement("a");
				document.body.appendChild(a);
				a.style = "display: none";
				var blob = new Blob([new Uint8Array(aDataArray)], {
					type: sTipo
				});
				var url = window.URL.createObjectURL(blob);
				a.href = url;
				a.download = sNome;
				a.click();
				window.URL.revokeObjectURL(url);
			},
			
			excluir: function (sRota) {
				return new Promise(function (resolve, reject) {
					jQuery.ajax({
						//url: "https://kwbklufmudxr7o61-vgt-haru-nodejs.cfapps.eu10.hana.ondemand.com/node/ExcluirArquivo/" + sIdArquivo,
						url: Constants.urlBackend + sRota,
						type: "DELETE",
						xhrFields: {
							withCredentials: true
						},
						crossDomain: true,
						dataType: "json"
					}).then(function (response) {
						if (response.success) {
							resolve(response.result);
						} else {
							reject(response);
						}
					}, function (err) {
						reject(err.status);
					});
				});
			}
			
		};
	}
);