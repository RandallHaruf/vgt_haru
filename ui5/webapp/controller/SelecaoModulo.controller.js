sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/control/NumericIcon",
		"ui5ns/ui5/model/Constants"
	],
	function (BaseController, NumericIcon, Constants) {
		return BaseController.extend("ui5ns.ui5.controller.SelecaoModulo", {

			_atualizarDados: function () {
				var that = this;
				
				this._listarArquivos()
					.then(function (response) {
						that.getModel().setProperty("/Arquivos", response);
					})
					.catch(function (err) {
						sap.m.MessageToast.show(err);
					});
			},

			_listarArquivos: function () {
				return new Promise(function (resolve, reject) {
					jQuery.ajax({
						url: "https://kwbklufmudxr7o61-vgt-haru-nodejs.cfapps.eu10.hana.ondemand.com/node/ListarArquivos",
						type: "GET",
						dataType: "json"
					}).then(function (response) {
						if (response.success) {
							resolve(response.result);
						}
						else {
							reject(response);
						}
					}, function (err) {
						reject(err.status);
					});
				});
			},
			
			_salvarArquivo: function (sNome, sTipo, aDataArray) {
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
			
			_downloadArquivo: function (sIdArquivo) {
				return new Promise(function (resolve, reject) {
					jQuery.ajax({
						url: "https://kwbklufmudxr7o61-vgt-haru-nodejs.cfapps.eu10.hana.ondemand.com/node/DownloadArquivo?arquivo=" + sIdArquivo,
						type: "GET",
						dataType: "json"
					}).then(function (response) {
						if (response.success) {
							resolve(response.result);
						}
						else {
							reject(response);
						}
					}, function (err) {
						reject(err.status);
					});
				});
			},
			
			_uploadArquivo: function (sNome, oArquivo) {
				return new Promise(function (resolve, reject) {
					var formData = new FormData();
					formData.append("file", oArquivo);
					formData.append("filename", sNome);
	
					jQuery.ajax({
						url: "https://kwbklufmudxr7o61-vgt-haru-nodejs.cfapps.eu10.hana.ondemand.com/node/UploadArquivo",
						data: formData,
						type: "POST",
						contentType: false,
						processData: false,
						dataType: "json"
					}).then(function (response) {
						if (response.success) {
							resolve(response.result);
						}
						else {
							reject(response);
						}
					}, function (err) {
						reject(err.status);
					});	
				});
			},
			
			_excluirArquivo: function (sIdArquivo) {
				return new Promise(function (resolve, reject) {
					jQuery.ajax({
						url: "https://kwbklufmudxr7o61-vgt-haru-nodejs.cfapps.eu10.hana.ondemand.com/node/ExcluirArquivo/" + sIdArquivo,
						type: "DELETE",
						dataType: "json"
					}).then(function (response) {
						if (response.success) {
							resolve(response.result);
						}
						else {
							reject(response);
						}
					}, function (err) {
						reject(err.status);
					});	
				});
			},

			onBaixarArquivo: function (oEvent) {
				var that = this,
					oArquivo = oEvent.getSource().getBindingContext().getObject();
				
				this._downloadArquivo(oArquivo.id_arquivo)
					.then(function (response) {
						that._salvarArquivo(response[0].nome_arquivo, response[0].mimetype, response[0].arquivo.data);
					})
					.catch(function (err) {
						sap.m.MessageToast.show(err);
					});
			},

			onEnviarArquivo: function (oEvent) {
				var that = this,
					oFileUploader = this.getView().byId("fileUploader"),
					oBtnEnviar = oEvent.getSource();
				
				if (oFileUploader.getValue()) {
					oBtnEnviar.setEnabled(false);
					
					this._uploadArquivo(oFileUploader.getValue(), oFileUploader.oFileUpload.files[0])
						.then(function (response) {
							sap.m.MessageToast.show(response);
							that._atualizarDados();
							oFileUploader.setValue("");
							oBtnEnviar.setEnabled(true);
						})
						.catch(function (err) {
							sap.m.MessageToast.show(err);
							oBtnEnviar.setEnabled(true);
						});
				}
				else {
					sap.m.MessageToast.show("Selecione um arquivo");
				}
			},

			onExcluirArquivo: function (oEvent) {
				var that = this,
					oArquivo = oEvent.getSource().getBindingContext().getObject();
				
				this._excluirArquivo(oArquivo.id_arquivo)
					.then(function (response) {
						sap.m.MessageToast.show(response);
						that._atualizarDados();
					})
					.catch(function (err) {
						sap.m.MessageToast.show(err);
					});
			},

			onInit: function () {
				this.setModel(new sap.ui.model.json.JSONModel({
					Periodos: [{
						periodo: "1º trimestre",
						n1: 1,
						n2: 2
					}, {
						periodo: "2º trimestre",
						n1: 5,
						n2: 2
					}]
				}));
				
				this._atualizarDados();
				
				/*this.byId("vemNimim").addItem(new NumericIcon({
					icon: new sap.ui.core.Icon({
						src: "sap-icon://message-warning"
					}),
					number: 2,
					color: "#900"
				}));*/

				/*var that = this;
				jQuery("#" + this.byId("painelTTC").getDomRef().id).click(function () {
					that.getRouter().navTo("ttcListagemEmpresas");
				});*/

				this.byId("selectIdioma").setSelectedKey(sap.ui.getCore().getConfiguration().getLanguage());
			},

			navToTTC: function (oEvent) {
				this.getRouter().navTo("ttcListagemEmpresas");
			},

			navToTaxPackage: function (oEvent) {
				this.getRouter().navTo("taxPackageListagemEmpresas");
			},

			navToCompliance: function (oEvent) {
				this.getRouter().navTo("complianceListagemObrigacoes");
			},

			navToBeps: function (oEvent) {
				this.getRouter().navTo("bepsListagemObrigacoes");
			},

			navToAdmin: function (oEvent) {
				this.getRouter().navTo("adminInicio");
			},

			onNavToComunicacao: function (oEvent) {
				this.getRouter().navTo("comunicacao");
			},

			onTrocarIdioma: function (oEvent) {
				var sCodigoIdioma = oEvent.getSource().getSelectedKey();

				if (sCodigoIdioma.toUpperCase() !== sap.ui.getCore().getConfiguration().getLanguage().toUpperCase()) {
					sap.ui.getCore().getConfiguration().setLanguage(sCodigoIdioma);
				}
			}

		});
	}
);