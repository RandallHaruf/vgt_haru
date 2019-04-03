sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/lib/Arquivo",
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/Label',
		'sap/m/Select',
		'sap/ui/unified/FileUploader'
	],
	function (BaseController, Constants, NodeAPI, Utils, Arquivo, Button, Dialog, Label, Select, FileUploader) {
		return BaseController.extend("ui5ns.ui5.controller.admin.CambioTTC", {
			/*handleUploadPress: function(oEvent) {
				var oFileUploader = this.byId("fileUploader");
				var oFileInput = oFileUploader.getFocusDomRef();
				if (!oFileUploader.getValue()) {
					sap.m.MessageToast.show("Choose a file first");
					return;
				}
				
				var formData = new FormData();
				formData.append("file", oFileInput.files[0]);
				
				jQuery.ajax(Constants.urlBackend + "PlanilhaCambioTTC", {
					type: "POST",
					cache: false,
					contentType: false,
					processData: false,
					data: formData,
					success: function (response) {
						alert(JSON.stringify(response));
						oFileUploader.setValue("");
					}
				});
				
			},
	
			handleTypeMissmatch: function(oEvent) {
				var aFileTypes = oEvent.getSource().getFileType();
				jQuery.each(aFileTypes, function(key, value) {aFileTypes[key] = "*." +  value;});
				var sSupportedFileTypes = aFileTypes.join(", ");
				sap.m.MessageToast.show("The file type *." + oEvent.getParameter("fileType") +
										" is not supported. Choose one of the following types: " +
										sSupportedFileTypes);
			},*/
			
			onInit: function () {
				var that = this;
				
				var oModel = new sap.ui.model.json.JSONModel({
					historico: [{
						nome: "Arquivo1",
						link: "files/cambio.csv",
						data: "10/05/2017"
					}]
				});
				
				this.setModel(oModel);
				
				this._dadosObjetos = [
					{
						id: "1",
						nome: "Alíquota 1",
						tipo: "Empresa",
						valor: "28%"
					},
					{
						id: "2",
						nome: "Alíquota 2",
						tipo: "País",
						valor: "22%"
					}
				];
				
				this.byId("paginaListagem").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarFormulario();
					}	
				});
				
				/*this.byId("paginaObjeto").addEventDelegate({
					onAfterShow: function (oEvent) {
						if (oEvent.data.path) {
							var oSelectedObject = that.getModel().getObject(oEvent.data.path);
							
							// É preciso pegar o id do objeto selecionado e enviar uma request
							// para preencher as informações do mesmo
							that._idObjetoSelecionado = oSelectedObject.id;
							//that.byId("selectPais").setSelectedKey(oSelectedObject.id);
							that.byId("inputNomeAliquota").setValue(oSelectedObject.nome);
						}
					},
					
					onAfterHide: function (oEvent) {
						// Limpar campos do formulário após sair da página
						var idDiv = that.byId("paginaObjeto").getDomRef().id;
						
						$("#" + idDiv + " input").val("");
						$("#" + idDiv + " select").val("");
						
						that._idObjetoSelecionado = "";
					}
				});*/
			},
			
			onNovoObjeto: function (oEvent) {
				this.byId("myNav").to(this.byId("paginaObjeto"), "flip");
			},
			
			recarregarObjetos: function () {
				var that = this;
				that.getModel().setProperty("/arquivosCambio", null);
				
				
				var Mes = this.getModel().getProperty("/IdMesSelecionado");
				var AnoCalendario = this.getModel().getProperty("/AnoCalendarioSelecionado");
				
				that.setBusy(that.byId("paginaListagem"), true);
				NodeAPI.pListarRegistros("DeepQuery/ListarTodosDocumentosCambio",{
					idMes: Mes,
					idAnoCalendario:AnoCalendario
				})
				.then(function (response){
					var aResponse = response.result;
					for (var i = 0, length = aResponse.length; i < length; i++) {
						aResponse[i]["nome_mes"] = Utils.traduzNomeMes(aResponse[i]["id_dominio_mes"], that);
					}
					that.getModel().setProperty("/arquivosCambio", aResponse);
					that.setBusy(that.byId("paginaListagem"), false);
				})
				.catch(function (err){
					alert(err);
				});
			},
			
			onSalvar: function (oEvent) {
				var sIdObjetoSelecionado = this._idObjetoSelecionado;
				var that=this;
				if (sIdObjetoSelecionado) {
					//alert("Atualizar alterações");
				sap.m.MessageToast.show(that.getResourceBundle().getText("viewGeralAAlterações"));

				}
				else {
					//alert("Inserir novo objeto");
				   sap.m.MessageToast.show(that.getResourceBundle().getText("viewGeralInserirNovoObj"));
					
					// Novo objeto
					var id = jQuery.now().toString();
					var nome = this.byId("inputNomeAliquota").getValue();
					
					this._dadosObjetos.push({
						id: id,
						nome: nome
					});
				}
				
				this.byId("myNav").to(this.byId("paginaListagem"), "flip");
			},
			
			onCancelar: function (oEvent) {
				this.byId("myNav").to(this.byId("paginaListagem"), "flip");
			},
			
			_carregarFormulario: function (oEvent){
				var that = this;
				return new Promise(function (resolve, reject) {
					Promise.all([
							NodeAPI.pListarRegistros("DominioMes"),
							NodeAPI.pListarRegistros("DominioAnoCalendario")
						])
						.then(function (res) {
							var mesVazio = {
								nome_mes: that.getResourceBundle().getText("viewCambioSelectMes"),
								mes: null,
								id_dominio_mes: null
							};
							for (var i = 0, length = res[0].result.length; i < length; i++) {
								res[0].result[i]["nome_mes"] = Utils.traduzNomeMes(res[0].result[i]["id_dominio_mes"], that);
							}
							res[0].result.unshift(mesVazio);
							that.getModel().setProperty("/DominioMes",res[0].result);
							that.getModel().setProperty("/DominioMesInsert",res[0].result);
							
							var anoVazio = {
								id_dominio_ano_calendario: null,
								ano_calendario: that.getResourceBundle().getText("viewCambioSelectAno")
							};
							res[1].unshift(anoVazio);
							that.getModel().setProperty("/DominioAnoCalendario",res[1]);
							that.getModel().setProperty("/DominioAnoCalendarioInsert",res[1]);
							
							that.recarregarObjetos();
							
							resolve();
						})	
						.catch(function (err) {
							reject(err);
						});
				});
			},
			
			onAbrirObjeto: function (oEvent) {
				var that = this,
					oButton = oEvent.getSource(),
					oArquivo = oEvent.getSource().getBindingContext().getObject();

				oArquivo.btnExcluirEnabled = false;
				oArquivo.btnDownloadEnabled = false;
				this.getModel().refresh();
				this.setBusy(oButton, true);

				Arquivo.download("DownloadCambioTTC?arquivo=" + oArquivo.id_arquivo_cambio_ttc)
					.then(function (response) {
						Arquivo.salvar(response[0].nome_arquivo, response[0].mimetype, response[0].arquivo.data);

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
			},
			
			onEnviarArquivo: function (oEvent, fileUploader) {
				var that = this;
				//var oFileUploader = this.getView().byId("fileUploader");
				var oFileUploader = fileUploader
				var oBtnEnviar = oEvent.getSource();

				var oData = {
					idMes: this.getModel().getProperty("/IdMesSelecionadoInsert"),
					idAnoCalendario: this.getModel().getProperty("/AnoCalendarioSelecionadoInsert")
				};
				
				if(oData.idMes != "" && oData.idMes != undefined && oData.idMes != null && oData.idAnoCalendario != "" && oData.idAnoCalendario != undefined && oData.idAnoCalendario != null){
					if (oFileUploader.getValue()) {
						oBtnEnviar.setEnabled(false);
						this.setBusy(oBtnEnviar, true);
						var file = oFileUploader.oFileUpload.files[0];
						var nomeFile = oFileUploader.getValue();
						//oData.aCambio = (JSON.stringify(handleFiles(file)));
						if(handleFiles(file, nomeFile, oData)){
							sap.m.MessageToast.show(that.getResourceBundle().getText("viewGeralErroLerArquivo"));
							oFileUploader.setValue("");
							oBtnEnviar.setEnabled(true);
							that.setBusy(oBtnEnviar, false);
						}
						/*Arquivo.upload(oFileUploader.oFileUpload.files[0], oFileUploader.getValue(), "UploadCambioTTC", oData)
							.then(function (response) {
								//sap.m.MessageToast.show(response);
								oFileUploader.setValue("");
								oBtnEnviar.setEnabled(true);
								that.setBusy(oBtnEnviar, false);
							})
							.catch(function (err) {
								sap.m.MessageToast.show(err);
								oBtnEnviar.setEnabled(true);
								that.setBusy(oBtnEnviar, false);
							});*/
					} else {
						//sap.m.MessageToast.show("Selecione um arquivo");
						sap.m.MessageToast.show(that.getResourceBundle().getText("viewGeralSelecioneArquivo"));
					}	
				}
				else{
					sap.m.MessageToast.show(that.getResourceBundle().getText("viewGeralSelecioneMesAno"));
				}
				function resolverAjax(aCambio, file, nomeFile, oData){
					oData.aCambio = (JSON.stringify(aCambio));
					Arquivo.upload(file, nomeFile, "UploadCambioTTC", oData)
					.then(function (response) {
						sap.m.MessageToast.show(that.getResourceBundle().getText("viewGeralArquivoSucesso"));
						that.recarregarObjetos();
						that.getModel().setProperty("/IdMesSelecionadoInsert",null);
						that.getModel().setProperty("/AnoCalendarioSelecionadoInsert",null);
						oFileUploader.setValue("");
						oBtnEnviar.setEnabled(true);
						that.setBusy(oBtnEnviar, false);
					})
					.catch(function (err) {
						sap.m.MessageToast.show(err);
						oBtnEnviar.setEnabled(true);
						that.setBusy(oBtnEnviar, false);
					});
				}
				
				function handleFiles(file, nomeFile, oData) {
					var reader = new FileReader();
					reader.onerror = function (){
				      return true;
				    };
					reader.onload = function (event) {
						var csvText = event.target.result;
						if (csvText.indexOf('\r') >= 0) {
							csvText = csvText.replace(/\n/g, "");
							var aux = csvText.split('\r');
						} else {
							csvText = csvText.replace(/\r/g, "");
							var aux = csvText.split('\n');
						}
						var colunas = aux[0].split(';');
						var cambios = [];
						for (let i = 1; i < aux.length; i++) {
							var aux2 = aux[i].split(';');
							var obj = {
								Moeda: aux2[0],
								Dolar: aux2[1],
								Real:  aux2[2],
								Data:  aux2[3]
							};		
							cambios.push(obj);
						}
						resolverAjax(cambios, file, nomeFile, oData);
					}
					reader.readAsText(file);	
				}
			},
			onAbrirDialogArquivo: function (oEvent){
				var that = this;
				
				if (!this.DialogArquivo) {
					var form = new sap.ui.layout.form.Form({
					}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
						singleContainerFullSize: false
					}));
					
					var formContainer = new sap.ui.layout.form.FormContainer({
					});
					
					var formElement1 = new sap.ui.layout.form.FormElement({
					});
					
					var formElement2 = new sap.ui.layout.form.FormElement({
					});
					
					var formElement3 = new sap.ui.layout.form.FormElement({
					});
					
					var formElement4 = new sap.ui.layout.form.FormElement({
					});
					
					var labelMes = new Label({
						text:"{i18n>viewCambioTituloMes}"
					});
					var itemSelectTemplateMes = new sap.ui.core.Item({
				        key : "{id_dominio_mes}",
				        text : "{nome_mes}"
				    });
				    var selectMes = new Select({
								tooltip:"{i18n>viewCambioSelectMes}",
								id:"selectDominioMesInsert",
								selectedKey:"{/IdMesSelecionadoInsert}"
							});
					selectMes.setModel(sap.ui.getCore().getModel(""));
					selectMes.bindAggregation("items","/DominioMesInsert",itemSelectTemplateMes);
					
					var labelAno = new Label({
						text:"{i18n>viewCambioTituloAno}"	
					});
					var itemSelectTemplateAno = new sap.ui.core.Item({
				        key : "{id_dominio_ano_calendario}",
				        text : "{ano_calendario}"
				    });
				    var selectAno = new Select({
						tooltip:"{i18n>viewCambioSelectAno}",
						id:"selectAnoCalendarioInsert",
						selectedKey:"{/AnoCalendarioSelecionadoInsert}"
					});
					selectAno.setModel(sap.ui.getCore().getModel(""));
					selectAno.bindAggregation("items","/DominioAnoCalendarioInsert",itemSelectTemplateAno);
				    
				    var fileUploader = new FileUploader({
						id:"fileUploader",
						name:"myFileUpload",
						width:"200px",
						tooltip:"{i18n>viewGeralEnviarArquivoNodejs}",
						buttonText:"{i18n>viewGeralEscolhaUmArquivo}",
						placeholder:"{i18n>viewGeralplaceholderEscolhaUmArquivo}",
						fileType:"csv"
					});
					
					var btnUpload = new Button({
						id:"btnEnviar",
						icon:"sap-icon://upload"
					}).attachPress(function (ev) {
						that.onEnviarArquivo(ev, fileUploader);
					});
				    
				    formElement1.setLabel(labelMes);
				    formElement1.addField(selectMes);
				    formElement2.setLabel(labelAno);
				    formElement2.addField(selectAno);
				    
				    formElement3.addField(fileUploader);
				    formElement4.addField(btnUpload);
				    
				    formContainer.addFormElement(formElement1);
				    formContainer.addFormElement(formElement2);
				    formContainer.addFormElement(formElement3);
				    formContainer.addFormElement(formElement4);
				    
				    form.addFormContainer(formContainer);
					
					this.DialogArquivo = new Dialog({
						title: this.getResourceBundle().getText("viewCambioEnvioArquivo"),
						contentWidth: "430px",
						contentHeight: "300px",
						resizable: true,
						content: [
							form
						],
						beginButton: new Button({
							text: 'Close',
							press: function () {
								this.DialogArquivo.close();
								that.getModel().setProperty("/IdMesSelecionadoInsert",null);
								that.getModel().setProperty("/AnoCalendarioSelecionadoInsert",null);
								fileUploader.setValue("");
							}.bind(this)
						})
					});
	
					this.getView().addDependent(this.DialogArquivo);
					this.DialogArquivo.open();
				}
				else{
					this.DialogArquivo.open();
				}
			}
		});
	}
);