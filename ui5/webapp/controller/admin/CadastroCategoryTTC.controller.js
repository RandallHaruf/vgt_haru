sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/Validador"
	],
	function (BaseController, Constants, Validador) {
		return BaseController.extend("ui5ns.ui5.controller.admin.CadastroCategoryTTC", {
			
			/* Métodos a implementar */
			onDesabilitar: function (oEvent) {
				var nome = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()).nome;
				
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm("Você tem certeza que deseja desabilitar esta Category?" , {
					title: "Confirm",
					onClose: function(oAction) { 
						if (sap.m.MessageBox.Action.OK === oAction) {
							sap.m.MessageToast.show("Desabilitar Category: " + nome);	
						}
					}
				});
			},
			
			onExcluir: function (oEvent) {
				var that = this; 
				//var nome = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()).nome;
				var idExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath())[this._nomeColunaIdentificadorNaListagemObjetos];
				
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.confirm("Você tem certeza que deseja excluir esta Category?" , {
					title: "Confirm",
					onClose: function(oAction) { 
						if (sap.m.MessageBox.Action.OK === oAction) {
							//sap.m.MessageToast.show("Excluir Category: " + nome);	
							
							jQuery.ajax(Constants.urlBackend + "TaxCategory/" + idExcluir, {
								type: "DELETE",
								dataType: "json",
								success: function (response) {
									//that.getModel().setProperty("/objetos", response);
									that._carregarObjetos();
								}
							});
						}
					}
				});
			},
			
			_nomeColunaIdentificadorNaListagemObjetos: "id_tax_category",
			
			_validarFormulario: function () {
				
				var sIdFormulario = "#" + this.byId("formularioObjeto").getDomRef().id;
				
				var oValidacao = Validador.validarFormularioAdmin({
					aInputObrigatorio: jQuery(sIdFormulario + " input[aria-required=true]"),
					aDropdownObrigatorio: [
						this.byId("selectClassification")
					]
				});
				
				if (!oValidacao.formularioValido) {
					sap.m.MessageBox.warning(oValidacao.mensagem, {
						title: "Aviso"
					});
				}
				
				return oValidacao.formularioValido;
			},
			
			_carregarObjetos: function () {
				/*this.getModel().setProperty("/objetos", [{
					id: "1",
					classification: "Tax Borne",
					nome: "Tax on Profits"
				}, {
					id: "2",
					classification: "Tax Collected",
					nome: "Other taxes"
				}]);*/
				
				var that = this;
				
				jQuery.ajax(Constants.urlBackend + "DeepQuery/TaxCategory", {
					type: "GET",
					dataType: "json",
					success: function (response) {
						that.getModel().setProperty("/objetos", response);
					}
				});
			},
			
			_carregarCamposFormulario: function () {
				var that = this;
				
				jQuery.ajax(Constants.urlBackend + "DominioTaxClassification", {
					type: "GET",
					dataType: "json",
					success: function (response) {
						response.unshift({ id: 0, nome: "" });
						that.getModel().setProperty("/DominioTaxClassification", response);
					}
				});
				
				/*
				jQuery.ajax("https://3cmwthhrqctaqsr8-app-nodejs.cfapps.us10.hana.ondemand.com/node/DominioPaisStatus", {
					type: "GET",
					dataType: "json",
					success: function (response) {
						response.unshift({ id: 0, descricao: "" });
						that.getModel().setProperty("/DominioPaisStatus", response);
					}
				});*/
			},
			
			_carregarObjetoSelecionado: function (iIdObjeto) {
				/*this.getModel().setProperty("/objeto", {
					id: iIdObjeto,
					nome: "Nome da Categoria"
				});*/
				
				var that = this;
				
				jQuery.ajax(Constants.urlBackend + "TaxCategory/" + iIdObjeto, {
					type: "GET",
					dataType: "json",
					success: function (response) {
						var oObjeto = response[0];
						var obj = {
							category: oObjeto["category"],
							fkDominioTaxClassification: oObjeto["fk_dominio_tax_classification.id_dominio_tax_classification"]
						};
						
						that.getModel().setProperty("/objeto", obj);
					}
				});
			},
			
			_limparFormulario: function () {
				this.getModel().setProperty("/objeto", {});
			},
			
			_atualizarObjeto: function (iIdObjeto) {
				/*sap.m.MessageToast.show("Atualizar Objeto");
				this._navToPaginaListagem();*/
				
				var that = this;
				
				var obj = this.getModel().getProperty("/objeto");
				
				jQuery.ajax(Constants.urlBackend + "TaxCategory/" + iIdObjeto, {
					type: "PUT",
					data: {
						category: obj.category,
						fkDominioTaxClassification: obj.fkDominioTaxClassification    
					},
					success: function (response) {
						that._navToPaginaListagem();		
					}
				});
			},
			
			_inserirObjeto: function () {
				/*sap.m.MessageToast.show("Inserir Objeto");
				this._navToPaginaListagem();*/		
				
				var that = this;
				
				var obj = this.getModel().getProperty("/objeto");
				
				jQuery.ajax(Constants.urlBackend + "TaxCategory", {
					type: "POST",
					data: {
						category: obj.category,
						fkDominioTaxClassification: obj.fkDominioTaxClassification    
					},
					success: function (response) {
						that._navToPaginaListagem();		
					}
				});
			},
			
			_navToPaginaListagem: function () {
				this.byId("myNav").to(this.byId("paginaListagem"), "flip");
			},
			
			/* Métodos fixos */
			onInit: function () {
				var that = this;
				
				that.setModel(new sap.ui.model.json.JSONModel({
					//DominioPais: [],
					//DominioPaisStatus: [],
					objetos: [],
					objeto: { },
					isUpdate: false
				}));
				
				this.byId("paginaListagem").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarObjetos();
					}	
				});
				
				this.byId("paginaObjeto").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarCamposFormulario();
						
						if (oEvent.data.path) {
							var id = that.getModel().getObject(oEvent.data.path)[that._nomeColunaIdentificadorNaListagemObjetos];
							
							that.getModel().setProperty("/isUpdate", true);
							that.getModel().setProperty("/idObjeto", id);
							
							that._carregarObjetoSelecionado(id);
						}
						else {
							that.getModel().setProperty("/isUpdate", false);
						}
					},
					
					onAfterHide: function (oEvent) {
						that._limparFormulario();
					}
				});
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
				if (this._validarFormulario()) {
					if (this.getModel().getProperty("/isUpdate")) {
						this._atualizarObjeto(this.getModel().getProperty("/idObjeto"));
					}
					else {
						this._inserirObjeto();
					}
				}
			},
			
			onCancelar: function (oEvent) {
				this.byId("myNav").to(this.byId("paginaListagem"), "flip");
			}
		});
	}
);

/*sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController"
	],
	function (BaseController) {
		return BaseController.extend("ui5ns.ui5.controller.admin.CadastroCategoryTTC", {
			onInit: function () {
				var that = this;
				
				this._dadosObjetos = [
					{
						id: "1",
						classification: "Tax Borne",
						nome: "Tax on Profits"
					},
					{
						id: "2",
						classification: "Tax Collected",
						nome: "Other taxes"
					}
				];
				
				this.byId("paginaListagem").addEventDelegate({
					onAfterShow: function (oEvent) {
						
						that.setModel(new sap.ui.model.json.JSONModel({
							objetos: that._dadosObjetos
						}));
					}	
				});
				
				this.byId("paginaObjeto").addEventDelegate({
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
				});
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
					alert("Atualizar alterações");
				}
				else {
					alert("Inserir novo objeto");
					
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
);*/