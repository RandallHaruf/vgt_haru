sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/model/Constants",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, Constants, Validador,NodeAPI, Utils) {
		return BaseController.extend("ui5ns.ui5.controller.admin.CadastroAliquotasTaxPackage", {
			
			onTrocarValorAliquota: function (oEvent) {
				if (!Validador.isNumber(Utils.limparMascaraDecimal(oEvent.getSource().getValue()))) {
					oEvent.getSource().setValue(0);

					var dialog = new sap.m.Dialog({
						title: this.getResourceBundle().getText("viewGeralAviso"),
						type: "Message",
						content: new sap.m.Text({
							text: this.getResourceBundle().getText("viewGeralValorInseridoNaoValido")
						}),
						endButton: new sap.m.Button({
							text: "OK",
							press: function () {
								dialog.close();
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					});
					
					dialog.open();
				}
			},
			
			onTrocarAnoFiscalAliquota: function (oEvent) {
				var idAnoFiscal = oEvent.getSource().getBindingContext().getObject()["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"];
				
				var aliquotaComAnoFiscalSelecionado = this.getModel().getProperty("/Aliquotas").filter(function (obj) {
					return obj["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"] === idAnoFiscal;
				});
				
				if (aliquotaComAnoFiscalSelecionado.length > 1) {
					jQuery.sap.require("sap.m.MessageBox");
							
					sap.m.MessageBox.show(this.getResourceBundle().getText("viewAdminCadastroAliquotasMensagemAliquotaRepetida"), {
						title: this.getResourceBundle().getText("viewGeralAviso")
					});
					
					oEvent.getSource().getBindingContext().getObject()["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"] = null;
				}
			},
			
			onExcluirAliquota: function (oEvent) {
				var that = this;

				var oExcluir = oEvent.getSource().getBindingContext().getObject();
				var aAliquotas = this.getModel().getProperty("/Aliquotas");

				var dialog = new sap.m.Dialog({
					title: this.getResourceBundle().getText("ViewDetalheTrimestreJSTextsConfirmation"),
					type: "Message",
					content: new sap.m.Text({
						text: this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsVocetemcertezaquedesejaexcluiralinha")
					}),
					beginButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralSim"),
						press: function () {
							for (var i = 0; i < aAliquotas.length; i++) {
								if (aAliquotas[i] === oExcluir) {
									aAliquotas.splice(i, 1);
									that.getModel().refresh();
									break;
								}
							}

							dialog.close();
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
			
			onAdicionarAliquota: function (oEvent) {
				this.getModel().getProperty("/Aliquotas").unshift({
					"fk_dominio_ano_fiscal.id_dominio_ano_fiscal": null,
					valor: 0
				});
				this.getModel().refresh();
			},

			/* Métodos a implementar */
			_validarFormulario: function () {
				var	msg = "",
					bFormularioValido = true,
					sIdFormulario = "#" + this.byId("formularioObjeto").getDomRef().id;

				var oValidacao = Validador.validarFormularioAdmin({
					aInputObrigatorio: jQuery(sIdFormulario + " input[aria-required=true]"),
					aDropdownObrigatorio: [
						this.byId("selectTipo")
					]/*,
					oPeriodoObrigatorio: {
						dataInicio: this.byId("dataInicio"),
						dataFim: this.byId("dataFim")
					}*/
				});
				
				if (!oValidacao.formularioValido) {
					msg += oValidacao.mensagem + "\n";
					bFormularioValido = false;
					/*sap.m.MessageBox.warning(oValidacao.mensagem, {
						title: "Aviso"
					});*/
				}

				var bValorAliquotaValido = true,
					sMensagemValidacaoAliquota = "- " + this.getResourceBundle().getText("viewAdminCadastroAliquotasMensagemAliquotaSemVigencia"),
					aValorAliquota = this.getModel().getProperty("/Aliquotas");
				
				for (var i = 0, length = aValorAliquota.length; i < length; i++) {
					var oValorAliquota = aValorAliquota[i];
					
					if (!oValorAliquota["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]) {
						bValorAliquotaValido = false;
					}
				}
				
				if (!bValorAliquotaValido) {
					msg += sMensagemValidacaoAliquota + "\n";
					bFormularioValido = false;
				}
				
				if (!bFormularioValido) {
					sap.m.MessageBox.warning(msg, {
						title: this.getResourceBundle().getText("viewGeralAviso")
					});
				}

				return bFormularioValido;
			},

			_carregarObjetos: function () {
				var that = this;
				that.setBusy(that.byId("paginaListagem"), true);
				that.getModel().setProperty("/objetos", null);
				jQuery.ajax(Constants.urlBackend + "/DeepQuery/Aliquota", {
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						var aResponse = response;
						for (var i = 0, length = aResponse.length; i < length; i++) {
							aResponse[i]["tipo"] = Utils.traduzTiposAliquota(aResponse[i]["id_dominio_aliquota_tipo"], that);
						}
						that.getModel().setProperty("/objetos", aResponse);
						that.setBusy(that.byId("paginaListagem"), false);
					}
				});
			},

			_carregarCamposFormulario: function () {
				var that = this;
				
				jQuery.ajax(Constants.urlBackend + "/DominioAliquotaTipo", {
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					dataType: "json",
					success: function (response) {
						response.unshift({
							id: null,
							nome: ""
						});
						var aResponse = response;
						for (var i = 0, length = aResponse.length; i < length; i++) {
							aResponse[i]["tipo"] = Utils.traduzTiposAliquota(aResponse[i]["id_dominio_aliquota_tipo"], that);
						}
						that.getModel().setProperty("/DominioAliquotaTipo", Utils.orderByArrayParaBox(aResponse,"tipo"));

						//that.getModel().setProperty("/DominioAliquotaTipo", response);
					}
				});
				
				NodeAPI.pListarRegistros("DominioAnoFiscal")
					.then(function (res) {
						res.unshift({});
						that.getModel().setProperty("/DominioAnoFiscal", res);
					});
			},

			_carregarObjetoSelecionado: function (iIdObjeto) {
				var that = this;
				
				that.setBusy(that.byId("paginaObjeto"), true);
				
				var promise1 = NodeAPI.pLerRegistro("Aliquota", iIdObjeto),
					promise2 = NodeAPI.pListarRegistros("ValorAliquota", {
						fkAliquota: iIdObjeto
					});
					
				Promise.all([
						promise1,
						promise2
					])
					.then(function (aResponse) {
						// carga do imposto que vem no response[0]
						var oRegistro = JSON.parse(aResponse[0])[0]; // parse é um detalhe pela rota ser padrão velho
						var obj = {
							nome: oRegistro["nome"],
							valor: oRegistro["valor"],
							dataInicio: oRegistro["data_inicio"],
							dataFim: oRegistro["data_fim"],
							idTipo: oRegistro["fk_dominio_aliquota_tipo.id_dominio_aliquota_tipo"]
						};

						that.getModel().setProperty("/objeto", obj);
						
						// carga das aliquotas que vem no response[1]
						var aValorAliquota = aResponse[1].result;
						
						aValorAliquota.sort(function (x, y) {
							return Number(y["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]) - Number(x["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]);
					    });
					    
						that.getModel().setProperty("/Aliquotas", aValorAliquota);
						
						that.setBusy(that.byId("paginaObjeto"), false);
					})
					.catch(function (err) {
						alert(err.status + ' - ' + err.statusText);	
						
						that.setBusy(that.byId("paginaObjeto"), false);
					});
			},

			_limparFormulario: function () {
				this.getModel().setProperty("/objeto", {});
				this.getModel().setProperty("/Aliquotas", []);
			},

			_atualizarObjeto: function () {
				var that = this;
				that.byId("botaoCancelar").setEnabled(false);
				that.byId("botaoSalvar").setEnabled(false);
				that.setBusy(that.byId("botaoSalvar"), true);
				var obj = this.getModel().getProperty("/objeto");
				var idObjeto = this.getModel().getProperty("/idObjeto");
				var aValorAliquota = this.getModel().getProperty("/Aliquotas");

				jQuery.ajax(Constants.urlBackend + "Aliquota/" + idObjeto, {
					type: "PUT",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: {
						nome: obj.nome,
						valor: obj.valor,
						dataInicio: obj.dataInicio,
						dataFim: obj.dataFim,
						fkTipo: obj.idTipo,
						aliquotas: JSON.stringify(aValorAliquota)
					},
					success: function (response) {
						that.byId("botaoCancelar").setEnabled(true);
						that.byId("botaoSalvar").setEnabled(true);
						that.setBusy(that.byId("botaoSalvar"), false);

						that._navToPaginaListagem();
					}
				});
			},

			_inserirObjeto: function () {
				var that = this;
				that.byId("botaoCancelar").setEnabled(false);
				that.byId("botaoSalvar").setEnabled(false);
				that.setBusy(that.byId("botaoSalvar"), true);
				var obj = this.getModel().getProperty("/objeto");
				var aValorAliquota = this.getModel().getProperty("/Aliquotas");

				jQuery.ajax(Constants.urlBackend + "Aliquota", {
					type: "POST",
					xhrFields: {
						withCredentials: true
					},
					crossDomain: true,
					data: {
						nome: obj.nome,
						valor: obj.valor,
						dataInicio: obj.dataInicio,
						dataFim: obj.dataFim,
						fkTipo: obj.idTipo,
						aliquotas: JSON.stringify(aValorAliquota)
					},
					success: function (response) {
						that.byId("botaoCancelar").setEnabled(true);
						that.byId("botaoSalvar").setEnabled(true);
						that.setBusy(that.byId("botaoSalvar"), false);
						that._navToPaginaListagem();
					}
				});
			},

			_navToPaginaListagem: function () {
				this.byId("myNav").to(this.byId("paginaListagem"), "flip");
			},

			/* Métodos fixos */
			onInit: function () {
				sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR");
				
				var that = this;

				that.setModel(new sap.ui.model.json.JSONModel({
					objetos: [],
					DominioAliquotaTipo: [],
					DominioAnoFiscal: [],
					objeto: {},
					idObjeto: 0,
					isUpdate: false,
					Aliquotas: []
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
							that.getModel().setProperty("/isUpdate", true);
							that.getModel().setProperty("/idObjeto", that.getModel().getObject(oEvent.data.path).id_aliquota);

							that._carregarObjetoSelecionado(that.getModel().getObject(oEvent.data.path).id_aliquota);
						} else {
							that.getModel().setProperty("/isUpdate", false);
						}
					},

					onAfterHide: function (oEvent) {
						that._limparFormulario();
					}
				});
			},

			onNovoObjeto: function (oEvent) {
				Utils.displayFormat(this);
				this.byId("myNav").to(this.byId("paginaObjeto"), "flip");
			},

			onAbrirObjeto: function (oEvent) {
				Utils.displayFormat(this);
				this.byId("myNav").to(this.byId("paginaObjeto"), "flip", {
					path: oEvent.getSource().getBindingContext().getPath()
				});
			},

			onSalvar: function (oEvent) {
				if (this._validarFormulario()) {
					if (this.getModel().getProperty("/isUpdate")) {
						this._atualizarObjeto();
					} else {
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
		return BaseController.extend("ui5ns.ui5.controller.admin.CadastroAliquotasTaxPackage", {
			onInit: function () {
				var that = this;
				
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