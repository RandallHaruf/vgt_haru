sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/control/NumericIcon",
		"ui5ns/ui5/model/Constants"
	],
	function (BaseController, NumericIcon, Constants) {
		return BaseController.extend("ui5ns.ui5.controller.SelecaoModulo", {
			
			onStartUpload: function (oEvent) {
				var that = this,
					oButton = oEvent.getSource(),
					oUploadCollection = this.byId("UploadCollection");

				var aFile = oUploadCollection.getItems();

				oButton.setEnabled(false);
				this.setBusy(oButton, true);

				var aPromise = [];

				for (var i = 0; i < aFile.length; i++) {
					var oUploadCollectionItem = aFile[i];
					var oFileUploader = this.byId(oUploadCollectionItem.getFileUploader());

					//aPromise.push(this._uploadArquivo(oFileUploader.getValue(), oFileUploader.oFileUpload.files[0]));

					(function (oItem) {
						that._uploadArquivo(oFileUploader.getValue(), oFileUploader.oFileUpload.files[0])
							.then(function (response) {
								oUploadCollection.removeItem(oItem);
								that._atualizarDados();

								if (oUploadCollection.getItems().length === 0) {
									that.setBusy(oButton, false);
									oButton.setEnabled(true);
								}
							})
							.catch(function (err) {
								sap.m.MessageToast.show("Erro ao carregar arquivo: " + oFileUploader.getValue());
								//if (oUploadCollection.getItems().length === 0) {
								that.setBusy(oButton, false);
								oButton.setEnabled(true);
								//}
							});
					})(oUploadCollectionItem);

					//alert(this.byId(oFile.getFileUploader()).oFileUpload.files[0]);

					/*this._uploadArquivo(oFileUploader.getValue(), oFileUploader.oFileUpload.files[0])
						.then(function (response) {
							sap.m.MessageToast.show(response);
							oFileUploader.setValue("");
							that.setBusy(oButton, false); 
						})
						.catch(function (err) {
							sap.m.MessageToast.show(err);
							that.setBusy(oButton, false); 
						});*/
				}

				/*Promise.all(aPromise)
					.then(function (response) {
						for (var i = aPromise.length - 1; i >= 0; i--) {
							sap.m.MessageToast.show(response[i]);
							//that.byId(aFile[i].getFileUploader()).setValue("");
							//oUploadCollection.removeItem(i);
							oUploadCollection.removeItem(aFile[i]);
						}	
						
						that.setBusy(oButton, false); 
						oButton.setEnabled(true);
						that._atualizarDados();
					})
					.catch(function (err) {
						sap.m.MessageToast.show(err);
						that.setBusy(oButton, false); 
						oButton.setEnabled(true);
					});*/

				/*var oTextArea = this.byId("TextArea");
				var cFiles = oUploadCollection.getItems().length;
				var uploadInfo = cFiles + " file(s)";
	
				if (cFiles > 0) {
					oUploadCollection.upload();
	
					if (oTextArea.getValue().length === 0) {
						uploadInfo = uploadInfo + " without notes";
					} else {
						uploadInfo = uploadInfo + " with notes";
					}
	
					MessageToast.show("Method Upload is called (" + uploadInfo + ")");
					MessageBox.information("Uploaded " + uploadInfo);
					oTextArea.setValue("");
				}	*/
			},

			_atualizarDados: function () {
				var that = this;

				this._listarArquivos()
					.then(function (response) {
						if (response[0]) {
							response[0].label_declaracao = "Declaração: SIM.\nEnvio Declaração: 11/12/2018";
						}
						for (var i = 1; i < response.length; i++) {
							response[i].label_declaracao = "Declaração: NÃO";
						}
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
						} else {
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
						} else {
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
						} else {
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
						} else {
							reject(response);
						}
					}, function (err) {
						reject(err.status);
					});
				});
			},

			_confirmarExclusao: function (onConfirm) {
				var dialog = new sap.m.Dialog({
					title: this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsConfirmation"),
					type: "Message",
					content: new sap.m.Text({
						text: "Você tem certeza que deseja excluir este arquivo?"
					}),
					beginButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralSim"),
						press: function () {
							dialog.close();
							if (onConfirm) {
								onConfirm();
							}
						}
					}),
					endButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralCancelar"),
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				dialog.open();
			},

			onBaixarArquivo: function (oEvent) {
				var that = this,
					oButton = oEvent.getSource(),
					oArquivo = oEvent.getSource().getBindingContext().getObject();

				oArquivo.btnExcluirEnabled = false;
				oArquivo.btnDownloadEnabled = false;
				this.getModel().refresh();
				this.setBusy(oButton, true);

				this._downloadArquivo(oArquivo.id_arquivo)
					.then(function (response) {
						that._salvarArquivo(response[0].nome_arquivo, response[0].mimetype, response[0].arquivo.data);

						oArquivo.btnExcluirEnabled = true;
						oArquivo.btnDownloadEnabled = true;
						that.setBusy(oButton, false);
						that.getModel().refresh();
					})
					.catch(function (err) {
						sap.m.MessageToast.show("Erro ao baixar arquivo: " + oArquivo.nome_arquivo);

						oArquivo.btnExcluirEnabled = true;
						oArquivo.btnDownloadEnabled = true;
						that.setBusy(oButton, false);
						that.getModel().refresh();
					});

				/*$.ajax({
					url: "https://kwbklufmudxr7o61-vgt-haru-nodejs.cfapps.eu10.hana.ondemand.com/node/Pais",
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					success: function (response) {
						alert(response);
					}
				});*/
			},

			onEnviarArquivo: function (oEvent) {
				var that = this,
					oFileUploader = this.getView().byId("fileUploader"),
					oBtnEnviar = oEvent.getSource();

				if (oFileUploader.getValue()) {
					oBtnEnviar.setEnabled(false);
					this.setBusy(oBtnEnviar, true);

					this._uploadArquivo(oFileUploader.getValue(), oFileUploader.oFileUpload.files[0])
						.then(function (response) {
							sap.m.MessageToast.show(response);
							that._atualizarDados();
							oFileUploader.setValue("");
							oBtnEnviar.setEnabled(true);
							that.getModel().setProperty("/IsDeclaracao", false);
							that.getModel().setProperty("/DataEnvioDeclaracao", null);
							that.setBusy(oBtnEnviar, false);
						})
						.catch(function (err) {
							sap.m.MessageToast.show(err);
							oBtnEnviar.setEnabled(true);
							that.setBusy(oBtnEnviar, false);
						});
				} else {
					sap.m.MessageToast.show("Selecione um arquivo");
				}
			},

			onExcluirArquivo: function (oEvent) {
				var that = this,
					oButton = oEvent.getSource(),
					oArquivo = oEvent.getSource().getBindingContext().getObject();

				this._confirmarExclusao(function () {
					oArquivo.btnExcluirEnabled = false;
					oArquivo.btnDownloadEnabled = false;
					that.getModel().refresh();
					that.setBusy(oButton, true);

					that._excluirArquivo(oArquivo.id_arquivo)
						.then(function (response) {
							sap.m.MessageToast.show(response);
							that._atualizarDados();

							oArquivo.btnExcluirEnabled = true;
							oArquivo.btnDownloadEnabled = true;
							that.setBusy(oButton, false);
							that.getModel().refresh();
						})
						.catch(function (err) {
							sap.m.MessageToast.show("Erro ao excluir arquivo: " + oArquivo.nome_arquivo);

							oArquivo.btnExcluirEnabled = true;
							oArquivo.btnDownloadEnabled = true;
							that.setBusy(oButton, false);
							that.getModel().refresh();
						});
				});
			},

			calcular: function (oEvent) {
				var fValor1 = this.getModel().getProperty("/Valor1");
				
				var fTotalValores = 0,
					aValor = this.getModel().getProperty("/Valores");
				
				for (var i = 0, length = aValor.length; i < length; i++) {
					fTotalValores += aValor[i].valor;
				}
				
				var fTotal = fValor1 + fTotalValores;
				
				this.getModel().setProperty("/Total", fTotal);
			},
	
			onInit: function () {
				//sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR");

				this.getView().setModel(new sap.ui.model.json.JSONModel({
					Valor1: null,
					Valores: [{
						valor: 15
					}, {
						valor: 23.56
					}]
				}));

				//this._atualizarDados();

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