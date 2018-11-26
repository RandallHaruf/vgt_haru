sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/Constants"
	],
	function (BaseController, Constants) {
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
				//var that = this;
				
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
						
						/*that.setModel(new sap.ui.model.json.JSONModel({
							objetos: that._dadosObjetos
						}));*/
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
			
			onAbrirObjeto: function (oEvent) {
				this.byId("myNav").to(this.byId("paginaObjeto"), "flip", {
					path: oEvent.getSource().getBindingContext().getPath()
				});
			},
			
			onSalvar: function (oEvent) {
				var sIdObjetoSelecionado = this._idObjetoSelecionado;
				if (sIdObjetoSelecionado) {
					//alert("Atualizar alterações");
					sap.m.MessageToast.show("Atualizar alterações");
				}
				else {
					//alert("Inserir novo objeto");
					sap.m.MessageToast.show("Inserir novo objeto");
					
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
			}
		});
	}
);