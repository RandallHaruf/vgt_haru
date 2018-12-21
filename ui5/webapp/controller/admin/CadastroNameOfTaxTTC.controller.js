sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Validador"
	],
	function (BaseController, NodeAPI, Validador) {
		return BaseController.extend("ui5ns.ui5.controller.admin.CadastroNameOfTaxTTC", {
			
			/* Métodos a implementar */
			onTextSearch: function (oEvent) {
				var sQuery = oEvent ? oEvent.getParameter("query") : null;
				this._oTxtFilter = null;
	
				if (sQuery !== null) {
					this._oTxtFilter = new sap.ui.model.Filter([
						new sap.ui.model.Filter("pais", sap.ui.model.FilterOperator.Contains, sQuery)
					], false);
				}
	
				this.getView().getModel().setProperty("/filterValue", sQuery);
	
				if (oEvent && this._oTxtFilter) {
					this.byId("tablePais").getBinding("rows").filter(this._oTxtFilter, "Application");
				}
			},
			
			onDesabilitar: function (oEvent) {
				var nome = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath()).nome;
				var that = this;
				jQuery.sap.require("sap.m.MessageBox");
			  sap.m.MessageBox.confirm(that.getResourceBundle().getText("ViewGeralDesabilitarNomeTaxa") , {
					title: "Info",
					onClose: function(oAction) { 
						if (sap.m.MessageBox.Action.OK === oAction) {
							 sap.m.MessageToast.show(that.getResourceBundle().getText("viewGeralToastDesabilitarNameOfTax") + nome);	
						}
					}
				});
			},
			
			onExcluir: function (oEvent) {
				var that = this;
				var idExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath())[this._nomeColunaIdentificadorNaListagemObjetos];
				
				jQuery.sap.require("sap.m.MessageBox");
				 sap.m.MessageBox.confirm(that.getResourceBundle().getText("ViewGeralExcluirNomeTaxa") , {
					title: "Info",
					onClose: function(oAction) { 
						if (sap.m.MessageBox.Action.OK === oAction) {
							NodeAPI.excluirRegistro("NameOfTax", idExcluir, function (response) {
								that._carregarObjetos();	
							});
						}
					}
				});
			},
			
			onTrocarClassification: function (oEvent) {
				this.getModel().setProperty("/TaxCategory", {});
				this.getModel().setProperty("/Tax", {});
				
				var idClassification = oEvent.getSource().getSelectedKey();
				
				if (idClassification) {
					this._carregarCategory(idClassification);
				}
			},
			
			onTrocarCategory: function (oEvent) {
				this.getModel().setProperty("/Tax", {});
				
				var idCategory = oEvent.getSource().getSelectedKey();
				
				if (idCategory) {
					this._carregarTax(idCategory);
				}
			},
			
			_nomeColunaIdentificadorNaListagemObjetos: "id_name_of_tax",
			
			_validarFormulario: function () {
				
				var sIdFormulario = "#" + this.byId("formularioObjeto").getDomRef().id;
				
				var oValidacao = Validador.validarFormularioAdmin({
					aInputObrigatorio: jQuery(sIdFormulario + " input[aria-required=true]"),
					aDropdownObrigatorio: [
						this.byId("selectClassification"), 
						this.byId("selectCategory"),
						this.byId("selectTax")
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
					category: "Tax on Profits",
					tax: "Tax 1",
					nome: "Name of Tax 1"
				}, {
					id: "2",
					classification: "Tax Borne",
					category: "Tax on Profits",
					tax: "Tax 1",
					nome: "Name of Tax 3"
				}, {
					id: "3",
					classification: "Tax Collected",
					category: "Tax on Profits",
					tax: "Tax 2",
					nome: "Name of Tax 3"
				}, {
					id: "4",
					classification: "Tax Borne",
					category: "Tax on People",
					tax: "Tax 3",
					nome: "Name of Tax 4"
				}]);
				
				this.getModel().setProperty("/paises", [{
					nome: "Brasil"
				}, {
					nome: "Canadá"
				}, {
					nome: "Estados Unidos"
				}]);*/
				
				var that = this;
				
				NodeAPI.listarRegistros("DeepQuery/NameOfTax?indDefault=true", function (response) {
					that.getModel().setProperty("/objetos", response);
				});
				
				NodeAPI.listarRegistros("DominioPais", function (response) {
					that.getModel().setProperty("/DominioPais", response); 
				});
			},
			
			_carregarCamposFormulario: function () {
				var that = this;
				
				NodeAPI.listarRegistros("DominioTaxClassification", function (response) {
					response.unshift({ "id_dominio_tax_classification": null, "classification": ""  });
					that.getModel().setProperty("/DominioTaxClassification", response);
				});
			},
			
			_carregarCategory: function (sIdClassification) {
				var that = this;
				
				NodeAPI.listarRegistros("TaxCategory?classification=" + sIdClassification, function (response) {
					response.unshift({ "id_tax_category": null, "category": ""  });
					that.getModel().setProperty("/TaxCategory", response);
				});
			},
			
			_carregarTax: function (sIdCategory) {
				var that = this;
				
				NodeAPI.listarRegistros("Tax?category=" + sIdCategory, function (response) {
					response.unshift({ "id_tax": null, "tax": ""  });
					that.getModel().setProperty("/Tax", response);
				});
			},
			
			_carregarObjetoSelecionado: function (iIdObjeto) {
				/*this.getModel().setProperty("/objeto", {
					id: iIdObjeto,
					nome: "Name of Tax"
				});*/
				
				var that = this;
				
				NodeAPI.lerRegistro("DeepQuery/NameOfTax", iIdObjeto, function (response) {
					that.getModel().setProperty("/objeto", {
						classification: response["id_dominio_tax_classification"],
						category: response["id_tax_category"],
						tax: response["id_tax"],
						nameOfTax: response["name_of_tax"]
					});
					
					that._carregarCategory(response["id_dominio_tax_classification"]);
					that._carregarTax(response["id_tax_category"]);
				});
				
				NodeAPI.listarRegistros("RelacionamentoPaisNameOfTax?fkNameOfTax=" + iIdObjeto, function (response) {
					that._resolverVinculoPais(response);
				});
			},
			
			_limparFormulario: function () {
				// Limpar o filtro da tabela de países
				this.byId("searchPais").fireSearch({
					query: ""
				});
				// Limpar outras propriedades do modelo
				this.getModel().setProperty("/TaxCategory", {});
				this.getModel().setProperty("/Tax", {});
				this.getModel().setProperty("/objeto", {});
			},
			
			_atualizarObjeto: function (sIdObjeto) {
				/*sap.m.MessageToast.show("Atualizar Objeto");
				this._navToPaginaListagem();*/
				
				var that = this;
				
				var obj = this.getModel().getProperty("/objeto");
				
				NodeAPI.atualizarRegistro("NameOfTax", sIdObjeto, {
					nameOfTax: obj.nameOfTax,
					fkTax: obj.tax,
					idPaises: JSON.stringify(that._getIdsPaisesSelecionados())
				}, function (response) {
					that._navToPaginaListagem();		
				});
			},
			
			_inserirObjeto: function () {
				/*sap.m.MessageToast.show("Inserir Objeto");
				this._navToPaginaListagem();	*/
				
				var that = this;
				
				var obj = this.getModel().getProperty("/objeto");
				
				NodeAPI.criarRegistro("NameOfTax", {
					indDefault: true,
					nameOfTax: obj.nameOfTax,
					fkTax: obj.tax,
					idPaises: JSON.stringify(that._getIdsPaisesSelecionados())
				}, function (response) {
					that._navToPaginaListagem();		
				});
			},
			
			_getIdsPaisesSelecionados: function () {
				var aIds = [];
				
				var aDominioPais = this.getModel().getProperty("/DominioPais");
					
				for (var i = 0; i < aDominioPais.length; i++) {
					
					var oPais = aDominioPais[i];
					
					if (oPais.selecionado) {
						aIds.push(oPais["id_dominio_pais"]);
					}
				}
				
				return aIds;
			},
			
			_resolverVinculoPais: function (response) {
				var aDominioPais = this.getModel().getProperty("/DominioPais");
					
				for (var i = 0; i < aDominioPais.length; i++) {
					
					var oPais = aDominioPais[i];
					
					//var aux = response.find(x => x["fk_dominio_pais.id_dominio_pais"] === oPais["id_dominio_pais"]);
					var aux = response.find(function (x) {
						return x["fk_dominio_pais.id_dominio_pais"] === oPais["id_dominio_pais"];
					});
					
					if (aux) {
						oPais.selecionado = true;
					}
				}
			},
			
			_navToPaginaListagem: function () {
				this.byId("myNav").to(this.byId("paginaListagem"), "flip");
			},
			
			/* Métodos fixos */
			onInit: function () {
				var that = this;
				
				that.setModel(new sap.ui.model.json.JSONModel({
					paises: [],
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