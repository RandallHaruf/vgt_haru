sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/model/Constants"
	],
	function (BaseController, NodeAPI, Validador , Utils, Constants) {
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
							/*NodeAPI.excluirRegistro("NameOfTax", idExcluir, function (response) {
								that._carregarObjetos();	
							});*/
							NodeAPI.pExcluirRegistro("NameOfTax", idExcluir)
								.then(function (res) {
									that._carregarObjetos({
										manterFiltro: true
									});
								})
								.catch(function (err) {
									that.showError(err);
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
			
			_carregarObjetos: function (oParams) {
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
				that.getModel().setProperty("/objetos", null);
				
				that._montarFiltro(oParams.manterFiltro);
				
				that.setBusy(that.byId("paginaListagem"), true);				
				NodeAPI.listarRegistros("DeepQuery/NameOfTax?indDefault=true", function (response) {
						var aResponse = response;
						for (var i = 0, length = aResponse.length; i < length; i++) {
							aResponse[i]["classification"] = Utils.traduzDominioTaxClassification(aResponse[i]["id_dominio_tax_classification"],that);
						}
						that.getModel().setProperty("/objetos", aResponse);	
						that.setBusy(that.byId("paginaListagem"), false);
					//that.getModel().setProperty("/objetos", response);
				});
				
				
				/*NodeAPI.listarRegistros("DominioPais", function (responsePais) {
					that.setBusy(that.byId("paginaListagem"), false);
						var aPais = responsePais;
						for (var i = 0, length = aPais.length; i < length; i++) {
							aPais[i]["pais"] = Utils.traduzDominioPais(aPais[i]["id_dominio_pais"],that);
						}
					that.getModel().setProperty("/DominioPais", Utils.orderByArrayParaBox(responsePais,"pais")); 
				});*/
			},
			
			_montarFiltro: function(manterFiltro){
				var that = this;
				if(!manterFiltro){
					Utils.criarDialogFiltro("tabelaObjetos", [{
						text: this.getResourceBundle().getText("viewGeralClassificacao"),
						applyTo: 'id_dominio_tax_classification',
						items: {
							loadFrom: 'DominioTaxClassification',
							path: '/EasyFilterClaissificacao',
							text: 'classification',
							key: 'id_dominio_tax_classification'
						}
					}, {
						text: this.getResourceBundle().getText("viewGeralCategoria"),
						applyTo: 'id_tax_category',
						items: {
							loadFrom: 'TaxCategory',
							path: '/EasyFilterCategoria',
							text: 'category',
							key: 'id_tax_category'
						}
					}, {
						text: this.getResourceBundle().getText("viewGeralTaxa"),
						applyTo: 'id_tax',
						items: {
							loadFrom: 'TAX',
							path: '/EasyFilterTaxa',
							text: 'tax',
							key: 'id_tax'
						}
					}, {
						text: this.getResourceBundle().getText("viewGeralNomeT"),
						applyTo: 'id_name_of_tax',
						items: {
							loadFrom: 'DeepQuery/NameOfTax?indDefault=true',
							path: '/EasyFilterNomeDaTaxa',
							text: 'name_of_tax',
							key: 'id_name_of_tax'
						}
					}], this, function (params) {
						console.log(params);
					});
				}
				this._loadFrom().then((function (res) {
					for (var i = 0, length = res[0].length; i < length; i++) {
						res[0][i]["classification"] = Utils.traduzDominioTaxClassification(res[0][i]["id_dominio_tax_classification"], that);
					}
					that.getModel().setProperty("/EasyFilterClaissificacao", Utils.orderByArrayParaBox(res[0], "classification"));
					
					that.getModel().setProperty("/EasyFilterCategoria", Utils.orderByArrayParaBox(res[1], "category"));
					
					that.getModel().setProperty("/EasyFilterTaxa", Utils.orderByArrayParaBox(res[2], "tax"));
					
					that.getModel().setProperty("/EasyFilterNomeDaTaxa", Utils.orderByArrayParaBox(res[3], "name_of_tax"));
				}));
			},
			
			_carregarCamposFormulario: function (oEvent) {
				var that = this;
				
				var idObjeto = that.getModel().getObject(oEvent.data.path) ? that.getModel().getObject(oEvent.data.path)[that._nomeColunaIdentificadorNaListagemObjetos] : 0;
				
				NodeAPI.listarRegistros("DominioTaxClassification", function (response) {
					response.unshift({ "id_dominio_tax_classification": null, "classification": ""  });
						var aResponse = response;
						for (var i = 0, length = aResponse.length; i < length; i++) {
							aResponse[i]["classification"] = Utils.traduzDominioTaxClassification(aResponse[i]["id_dominio_tax_classification"],that);
						}
						that.getModel().setProperty("/DominioTaxClassification", Utils.orderByArrayParaBox(aResponse,"classification"));						
					//that.getModel().setProperty("/DominioTaxClassification", response);
				});
				that.setBusy(that.byId("tablePais"), true);
				that._carregarPaises(idObjeto);
				
			},
			
			_carregarCategory: function (sIdClassification) {
				var that = this;
				
				NodeAPI.listarRegistros("TaxCategory?classification=" + sIdClassification, function (response) {
					response.unshift({ "id_tax_category": null, "category": ""  });
					that.getModel().setProperty("/TaxCategory", Utils.orderByArrayParaBox(response,"category"));
				});
			},
			
			_carregarTax: function (sIdCategory) {
				var that = this;
				
				NodeAPI.listarRegistros("Tax?category=" + sIdCategory, function (response) {
					response.unshift({ "id_tax": null, "tax": ""  });
					that.getModel().setProperty("/Tax", Utils.orderByArrayParaBox(response,"tax"));
				});
			},
			
			_carregarObjetoSelecionado: function (iIdObjeto) {
				/*this.getModel().setProperty("/objeto", {
					id: iIdObjeto,
					nome: "Name of Tax"
				});*/
				
				var that = this;

				that.setBusy(that.byId("formularioObjeto"), true);				
				NodeAPI.lerRegistro("DeepQuery/NameOfTax", iIdObjeto, function (response) {
					that.getModel().setProperty("/objeto", {
						classification: response["id_dominio_tax_classification"],
						category: response["id_tax_category"],
						tax: response["id_tax"],
						nameOfTax: response["name_of_tax"]
					});
					
					that._carregarCategory(response["id_dominio_tax_classification"]);
					that._carregarTax(response["id_tax_category"]);

					that.setBusy(that.byId("formularioObjeto"), false);					
				});

			},
			
			_limparFormulario: function () {
				// Limpar o filtro da tabela de países
				this.byId("searchPais").fireSearch({
					query: ""
				});
				// Limpar outras propriedades do modelo
				this.getModel().setProperty("/TaxCategory", {});
				this.getModel().setProperty("/DominioPais", {});
				this.getModel().setProperty("/idObjeto", {});
				this.getModel().setProperty("/Tax", {});
				this.getModel().setProperty("/objeto", {});
			},
			
			_atualizarObjeto: function (sIdObjeto) {
				/*sap.m.MessageToast.show("Atualizar Objeto");
				this._navToPaginaListagem();*/
				
				var that = this;
				that.byId("btnCancelar").setEnabled(false);
				that.byId("btnSalvar").setEnabled(false);
				that.setBusy(that.byId("btnSalvar"), true);
				
				var obj = this.getModel().getProperty("/objeto");
				
				NodeAPI.atualizarRegistro("NameOfTax", sIdObjeto, {
					nameOfTax: obj.nameOfTax,
					fkTax: obj.tax,
					idPaises: JSON.stringify(that._getIdsPaisesSelecionados())
				}, function (response) {
					that.byId("btnCancelar").setEnabled(true);
					that.byId("btnSalvar").setEnabled(true);
					that.setBusy(that.byId("btnSalvar"), false);
					that._navToPaginaListagem();		
				});
			},

			_inserirObjeto: function () {
				/*sap.m.MessageToast.show("Inserir Objeto");
				this._navToPaginaListagem();	*/
				
				var that = this;
				that.byId("btnCancelar").setEnabled(false);
				that.byId("btnSalvar").setEnabled(false);
				that.setBusy(that.byId("btnSalvar"), true);
				
				var obj = this.getModel().getProperty("/objeto");
				
				NodeAPI.criarRegistro("NameOfTax", {
					indDefault: true,
					nameOfTax: obj.nameOfTax,
					fkTax: obj.tax,
					idPaises: JSON.stringify(that._getIdsPaisesSelecionados())
				}, function (response) {
					that.byId("btnCancelar").setEnabled(true);
					that.byId("btnSalvar").setEnabled(true);
					that.setBusy(that.byId("btnSalvar"), false);
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
			
			_carregarPaisesComPagamento: function (response, idObjeto){
				var that = this;
				$.ajax({
					type:"GET",
					url: Constants.urlBackend + "DeepQuery/DominioPaisNameOfTax?idNameOfTax=" + idObjeto,
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true
				}).done(function(responseRespostaNameOfTax) {
					var aRespostaNameOfTax = JSON.parse(responseRespostaNameOfTax);
					var aPais = that.getModel().getProperty("/DominioPais");
					for (var i = 0, length = aPais.length; i < length; i++) {
						for (var j = 0; j < aRespostaNameOfTax.length; j++){
							if(aPais[i].id_dominio_pais == aRespostaNameOfTax[j]["fk_dominio_pais.id_dominio_pais"]){
								aPais[i].naoTenhoResposta = false;
							}
						}
					}
					that.setBusy(that.byId("tablePais"), false);
					that._resolverVinculoPais(response);
				}).fail(function (err) {
					that.setBusy(that.byId("paginaListagem"), false);
				});
			},
			
			_carregarPaises: function (idObjeto) {
				var that = this;
				$.ajax({
					type:"GET",
					url: Constants.urlBackend + "DeepQuery/DominioPaisNameOfTax",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true
				}).done(function(responsePais) {
					var aPais = JSON.parse(responsePais);
					for (var i = 0, length = aPais.length; i < length; i++) {
						aPais[i]["pais"] = Utils.traduzDominioPais(aPais[i]["id_dominio_pais"],that);
					}
					that.getModel().setProperty("/DominioPais", Utils.orderByArrayParaBox(aPais,"pais"));
					if(!idObjeto){
						that.setBusy(that.byId("tablePais"), false);	
					}else{
						NodeAPI.listarRegistros("RelacionamentoPaisNameOfTax?fkNameOfTax=" + idObjeto, function (response) {
							that._carregarPaisesComPagamento(response, idObjeto);
						});
					}
					
				}).fail(function (err) {
					that.setBusy(that.byId("paginaListagem"), false);
				});
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

				    aDominioPais.sort(function(x, y) {
				        // true values first
				        return (x.selecionado === y.selecionado)? 0 : x.selecionado? -1 : 1;
				        // false values first
				        // return (x === y)? 0 : x? 1 : -1;
				    });
				}
				this.getModel().refresh();
			},
			
			_navToPaginaListagem: function () {
				this.byId("myNav").to(this.byId("paginaListagem"), "flip", {
					manterFiltro: true
				});
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
						that._carregarObjetos(oEvent && oEvent.data ? oEvent.data : {});
					}	
				});
				
				this.byId("paginaObjeto").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarCamposFormulario(oEvent);
						
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
			},
			
			onFiltrarNameOfTaxTTC: function () {
                this._filterDialog.open();             
            }

		});
	}
);