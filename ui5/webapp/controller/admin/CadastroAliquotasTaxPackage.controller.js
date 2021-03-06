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
			
			_checarPeriodoCoincicente: function (oPeriodoAliquotaNovo) {
				var aPeriodoAliquota = this.getModel().getProperty("/PeriodoAliquota")
					bIsCoincidente = false;	
				
				// Checa se o novo período está contido em algum outro período estipulado
				for (var i = 0, length = aPeriodoAliquota.length; i < length; i++) {
					var oPeriodoAliquota = aPeriodoAliquota[i];
					
					if (oPeriodoAliquota !== oPeriodoAliquotaNovo) {
						if (oPeriodoAliquota.idAnoInicial && oPeriodoAliquota.idAnoFinal) {
							if (oPeriodoAliquotaNovo.idAnoInicial) {
								if (Number(oPeriodoAliquotaNovo.idAnoInicial) >= Number(oPeriodoAliquota.idAnoInicial)
									&& Number(oPeriodoAliquotaNovo.idAnoInicial) <= Number(oPeriodoAliquota.idAnoFinal)) {
									bIsCoincidente = true;
									break;
								}
							}
							
							if (oPeriodoAliquotaNovo.idAnoFinal) {
								if (Number(oPeriodoAliquotaNovo.idAnoFinal) >= Number(oPeriodoAliquota.idAnoInicial)
									&& Number(oPeriodoAliquotaNovo.idAnoFinal) <= Number(oPeriodoAliquota.idAnoFinal)) {
									bIsCoincidente = true;
									break;
								}
							}
						}
					}
				}
				
				// Se chegou nesse ponto e o novo periodo não está contido em nenhum outro, checa se ele contém algum período (apenas se ambos os anos estiverem selecionados)
				if (!bIsCoincidente && oPeriodoAliquotaNovo.idAnoInicial && oPeriodoAliquotaNovo.idAnoFinal) {
					var idAnoInicial = Number(oPeriodoAliquotaNovo.idAnoInicial);
					var idAnoFinal = Number(oPeriodoAliquotaNovo.idAnoFinal);
					
					for (var i = 0, length = aPeriodoAliquota.length; i < length; i++) {
						var oPeriodoAliquota = aPeriodoAliquota[i];
						
						if (oPeriodoAliquota !== oPeriodoAliquotaNovo) {
							if (oPeriodoAliquota.idAnoInicial) {
								if (Number(oPeriodoAliquota.idAnoInicial) >= idAnoInicial
									&& Number(oPeriodoAliquota.idAnoInicial) <= idAnoFinal) {
									bIsCoincidente = true;
									break;
								}
							}
							
							if (oPeriodoAliquota.idAnoFinal) {
								if (Number(oPeriodoAliquota.idAnoFinal) >= idAnoInicial
									&& Number(oPeriodoAliquota.idAnoFinal) <= idAnoFinal) {
									bIsCoincidente = true;
									break;
								}
							}
						}
					}
				}
				
				return bIsCoincidente;
			},
			
			_transformarAliquotasEmPeriodos: function () {
				var aAliquota = this.getModel().getProperty("/Aliquotas").sort(function (x, y) {
						return Number(x["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]) - Number(y["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]);
				    }),
					aPeriodoAliquota = [],
					iIndexPeriodoCorrente = -1,
					valorAnterior;
				
				for (var i = 0, length = aAliquota.length; i < length; i++) {
					var oAliquota = aAliquota[i];
					
					if (valorAnterior !== oAliquota.valor) {
						aPeriodoAliquota.push({
							idAnoInicial: oAliquota["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"],
							idAnoFinal: oAliquota["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"],
							valor: oAliquota.valor
						});
						
						iIndexPeriodoCorrente++;
					}
					else {
						aPeriodoAliquota[iIndexPeriodoCorrente].idAnoFinal = oAliquota["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"];
					}
					
					valorAnterior = oAliquota.valor;
				}
				
				aPeriodoAliquota.sort(function (a, b) {
					return b.idAnoInicial - a.idAnoInicial;
				});
				
				this.getModel().setProperty("/PeriodoAliquota", aPeriodoAliquota);
				this.getModel().refresh();
			},
			
			_refazerArrayAliquotas: function () {
				var aPeriodoAliquota = 	this.getModel().getProperty("/PeriodoAliquota"),
					aAliquota = [];
				
				for (var i = 0, length = aPeriodoAliquota.length; i < length; i++) {
					var oPeriodoAliquota = aPeriodoAliquota[i];
					
					if (oPeriodoAliquota.idAnoInicial && oPeriodoAliquota.idAnoFinal) {
						for (var j = Number(oPeriodoAliquota.idAnoInicial), length2 = Number(oPeriodoAliquota.idAnoFinal); j <= length2; j++) {
							aAliquota.push({
								"fk_dominio_ano_fiscal.id_dominio_ano_fiscal": j,
								valor: oPeriodoAliquota.valor
							});
						}
					}
				}
				
				this.getModel().setProperty("/Aliquotas", aAliquota);
				this.getModel().refresh();
			},
			
			onExcluirPeriodo: function (oEvent) {
				var that = this;

				var oExcluir = oEvent.getSource().getBindingContext().getObject();
				var aPeriodoAliquota = this.getModel().getProperty("/PeriodoAliquota");

				var dialog = new sap.m.Dialog({
					title: this.getResourceBundle().getText("ViewDetalheTrimestreJSTextsConfirmation"),
					type: "Message",
					content: new sap.m.Text({
						text: this.getView().getModel("i18n").getResourceBundle().getText("ViewDetalheTrimestreJSTextsVocetemcertezaquedesejaexcluiralinha")
					}),
					beginButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralSim"),
						press: function () {
							for (var i = 0; i < aPeriodoAliquota.length; i++) {
								if (aPeriodoAliquota[i] === oExcluir) {
									aPeriodoAliquota.splice(i, 1);
									that.getModel().refresh();
									break;
								}
							}
							
							that._refazerArrayAliquotas();

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
			
			onTrocarPeriodo: function (oEvent) {
				var obj = oEvent.getSource().getBindingContext().getObject();
				
				var aAliquota = this.getModel().getProperty("/Aliquotas"),
					iIdAnoSelecionado = oEvent.getSource().getSelectedKey(),
					iIdAnoSelecionado = iIdAnoSelecionado ? Number(iIdAnoSelecionado) : -1,
					// Indica que um mesmo periodo tem ano inicio e ano fim igual (o que não é problema)
					bPeriodoComAnoIgual = Number(obj.idAnoInicial) === Number(obj.idAnoFinal), 
					// Indica que o período contém algum outro, ou está contido em outro período (o que é problema)
					bPeriodoCoincidente = this._checarPeriodoCoincicente(obj);
				
				var aAliquotaComMesmoAno = aAliquota.filter(function (oAliquota) {
					return Number(oAliquota["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]) === iIdAnoSelecionado;
				});
			
				if (bPeriodoCoincidente || (!bPeriodoComAnoIgual && aAliquotaComMesmoAno.length > 1)) {
					jQuery.sap.require("sap.m.MessageBox");
							
					sap.m.MessageBox.show(this.getResourceBundle().getText("viewAdminCadastroAliquotasMensagemAliquotaRepetida"), {
						title: this.getResourceBundle().getText("viewGeralAviso")
					});
					
					oEvent.getSource().setSelectedKey(null);
				}
				else if (obj.idAnoInicial && obj.idAnoFinal && Number(obj.idAnoFinal) < Number(obj.idAnoInicial)) {
					jQuery.sap.require("sap.m.MessageBox");
							
					sap.m.MessageBox.show(this.getResourceBundle().getText("viewAdminCadastroAliquotasMensagemPeriodoAnoFimAnteriorAnoInicio"), {
						title: this.getResourceBundle().getText("viewGeralAviso")
					});
					
					oEvent.getSource().setSelectedKey(null);
				}
				
				this._refazerArrayAliquotas();
			},
			
			onAdicionarPeriodo: function (oEvent) {
				this.getModel().getProperty("/PeriodoAliquota").unshift({
					idAnoInicial: 0,
					idAnoFinal: 0,
					valor: 0
				});
				this.getModel().refresh();
			},
			
			onAdicionarLimite: function (oEvent) {
				var that = this;
				
				var oForm = new sap.ui.layout.form.Form({
					editable: true
				}).setLayout(new sap.ui.layout.form.ResponsiveGridLayout({
					singleContainerFullSize: false
				}));

				var oFormContainer = new sap.ui.layout.form.FormContainer();

				var oLabel = new sap.m.Label({
					text: "Ano Inicial"
				}).addStyleClass("sapMLabelRequired");

				var oSelectAnoInicial = new sap.m.Select()
					.bindItems({
						templateShareable: false,
						path: "/DominioAnoFiscal",
						template: new sap.ui.core.ListItem({
							key: "{id_dominio_ano_fiscal}",
							text: "{ano_fiscal}"
						})
					});

				oFormElement = new sap.ui.layout.form.FormElement()
					.setLabel(oLabel)
					.addField(oSelectAnoInicial);
					
				oFormContainer.addFormElement(oFormElement);
				
				oLabel = new sap.m.Label({
					text: "Ano Final"
				}).addStyleClass("sapMLabelRequired");
				
				var oSelectAnoFinal = new sap.m.Select()
					.bindItems({
						templateShareable: false,
						path: "/DominioAnoFiscal",
						template: new sap.ui.core.ListItem({
							key: "{id_dominio_ano_fiscal}",
							text: "{ano_fiscal}"
						})
					});
				
				oFormElement = new sap.ui.layout.form.FormElement()
					.setLabel(oLabel)
					.addField(oSelectAnoFinal);

				oFormContainer.addFormElement(oFormElement);
				
				oLabel = new sap.m.Label({
					text: "Valor"
				}).addStyleClass("sapMLabelRequired");

				var oInput = new sap.m.Input({
					value: "{path: '/valorJanela', type: 'sap.ui.model.type.Float', formatOptions: {minFractionDigits: 2, maxFractionDigits:2}}"
				}).attachChange(function (oEvent2) {
					that.onTrocarValorAliquota(oEvent2);
				});
				
				oFormElement = new sap.ui.layout.form.FormElement()
					.setLabel(oLabel)
					.addField(oInput);

				oFormContainer.addFormElement(oFormElement);

				oForm.addFormContainer(oFormContainer);
				
				var dialog = new sap.m.Dialog({
					showHeader: false,
					content: oForm,
					beginButton: new sap.m.Button({
						text: "Inserir",
						press: function () {
							if (!oSelectAnoInicial.getSelectedKey()
								|| !oSelectAnoFinal.getSelectedKey()
								|| !oInput.getValue()) {
								jQuery.sap.require("sap.m.MessageBox");
								sap.m.MessageBox.show(that.getResourceBundle().getText(
									"ViewDetalheTrimestreJSTextsTodososcamposmarcadossãodepreenchimentoobrigatório"), {
									title: that.getResourceBundle().getText("viewGeralAviso")
								});	
							}
							else if (Number(oSelectAnoInicial.getSelectedItem().getText()) > Number(oSelectAnoFinal.getSelectedItem().getText())) {
								jQuery.sap.require("sap.m.MessageBox");
								sap.m.MessageBox.show("Ano Inicial não pode ser anterior ao Ano Final", {
									title: that.getResourceBundle().getText("viewGeralAviso")
								});	
							}
							else {
								var anoInicial = Number(oSelectAnoInicial.getSelectedItem().getText()),
									anoFinal = Number(oSelectAnoFinal.getSelectedItem().getText());
									
								// criar um array com os objetos de dominioAnoFiscal da janela selecionada
								var aAnoFiscal = that.getModel().getProperty("/DominioAnoFiscal").filter(function (obj, x, y) {
									return Number(obj.ano_fiscal) >= anoInicial && Number(obj.ano_fiscal) <= anoFinal;
								});
								
								// para cada ano selecionado:
								// - caso ele não exista na lista de aliquotas, adicionar com o valor inserido para a janela;
								// - case ele já exista na lista de alíquotas, atualizar o valor pelo inserido para a janela;
								var aAliquota = this.getModel().getProperty("/Aliquotas"),
									novoValor = Utils.limparMascaraDecimal(oInput.getValue(), this);
								
								for (var i = 0; i < aAnoFiscal.length; i++) {
									var oAnoJaInserido = aAliquota.find(function (obj) {
										return obj["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"] === aAnoFiscal[i].id_dominio_ano_fiscal;	
									});
									
									if (oAnoJaInserido) {
										oAnoJaInserido.valor = novoValor;
									}
									else {
										aAliquota.unshift({
											"fk_dominio_ano_fiscal.id_dominio_ano_fiscal": aAnoFiscal[i].id_dominio_ano_fiscal,
											valor: novoValor
										});
									}
								}
								
								aAliquota.sort(function (a, b) {
									return b["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"] - a["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"];
								});
								
								// refresh do model
								this.getModel().refresh();
								
								dialog.close();
							}
						}
					}),
					endButton: new sap.m.Button({
						text: "Cancelar",
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						this.getModel().setProperty("/valorJanela", 0);
						dialog.destroy();
					}
				});

				this.getView().addDependent(dialog);

				dialog.open();	
			},
			
			onTextSearchPais: function (oEvent) {
				this.onTextSearch(oEvent, "nomePais", "/filterValuePais", "tabelaPaisAliquotas");
			},
			
			onTextSearchEmpresa: function (oEvent) {
				this.onTextSearch(oEvent, "nome", "/filterValueEmpresa", "tabelaEmpresaAliquotas");
			},
			
			onTextSearch: function (oEvent, sColuna, sFiltro, sIdTabela) {
				var sQuery = oEvent ? oEvent.getParameter("query") : null;
				this._oTxtFilter = null;
	
				if (sQuery !== null) {
					this._oTxtFilter = new sap.ui.model.Filter([
						new sap.ui.model.Filter(sColuna, sap.ui.model.FilterOperator.Contains, sQuery)
					], false);
				}
	
				this.getView().getModel().setProperty(sFiltro, sQuery);
	
				if (oEvent && this._oTxtFilter) {
					this.byId(sIdTabela).getBinding("rows").filter(this._oTxtFilter, "Application");
				}
			},
			
			onTrocarValorAliquota: function (oEvent) {
				Validador.validarNumeroInserido(oEvent, this);
				
				this._refazerArrayAliquotas();
			},
			
			onTrocarAnoFiscalAliquota: function (oEvent) {
				var idAnoFiscal = oEvent.getSource().getBindingContext().getObject()["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"];
				
				var aliquotaComAnoFiscalSelecionado = this.getModel().getProperty("/Aliquotas").filter(function (obj) {
					return Number(obj["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]) === Number(idAnoFiscal);
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
				
				var bPeriodoAliquotaValido = true,
					sMensagemValidacaoPeriodoAliquota = "- " + this.getResourceBundle().getText("viewAdminCadastroAliquotasMensagemAliquotaSemVigencia"),
					aPeriodoAliquota = this.getModel().getProperty("/PeriodoAliquota");
				
				for (var i = 0, length = aPeriodoAliquota.length; i < length; i++) {
					var oPeriodoAliquota = aPeriodoAliquota[i];
					
					if (!oPeriodoAliquota.idAnoInicial || !oPeriodoAliquota.idAnoFinal) {
						bValorAliquotaValido = false;
						break;
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
				
				NodeAPI.pListarRegistros("DominioAnoFiscal?full=true")
					.then(function (res) {
						res.unshift({});
						that.getModel().setProperty("/DominioAnoFiscal", res);
					});
					
				return new Promise(function (resolve, reject) {
					Promise.all([
							NodeAPI.pListarRegistros("Empresa?full=true"),
							NodeAPI.pListarRegistros("DeepQuery/Pais")
						])
						.then(function (res) {
							that.getModel().setProperty("/Empresa", res[0]);
							that.getModel().setProperty("/Pais", res[1]);
							resolve();
						})	
						.catch(function (err) {
							reject(err);
						});
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
						that.getModel().setProperty("/tipoInicial", obj.idTipo);
						
						that.getModel().setProperty("/Pais", that.getModel().getProperty("/Pais").map(function (pais) {
							pais.selecionada = Number(pais.fkAliquota) === Number(iIdObjeto);
							return pais;
						}));
						
						that.getModel().setProperty("/Empresa", that.getModel().getProperty("/Empresa").map(function (empresa) {
							empresa.selecionada = Number(empresa["fk_aliquota.id_aliquota"]) === Number(iIdObjeto);
							return empresa;
						}));
						
						// carga das aliquotas que vem no response[1]
						var aValorAliquota = aResponse[1].result;
						
						aValorAliquota.sort(function (x, y) {
							return Number(y["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]) - Number(x["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"]);
					    });
					    
						that.getModel().setProperty("/Aliquotas", aValorAliquota);
						
						that._transformarAliquotasEmPeriodos();
						
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
				this.getModel().setProperty("/Pais", []);
				this.getModel().setProperty("/Empresa", []);
				this.getModel().setProperty("/valorJanela", 0);
				this.getModel().setProperty("/PeriodoAliquota", []);
			},

			_atualizarObjeto: function () {
				var that = this;
				that.byId("botaoCancelar").setEnabled(false);
				that.byId("botaoSalvar").setEnabled(false);
				that.setBusy(that.byId("botaoSalvar"), true);
				var obj = this.getModel().getProperty("/objeto");
				var idObjeto = this.getModel().getProperty("/idObjeto");
				var aValorAliquota = this.getModel().getProperty("/Aliquotas");
				var aPais = this.getModel().getProperty("/Pais").map(function (pais) {
					pais.idTipo = 1;
					return pais;
				});
				var aEmpresa = this.getModel().getProperty("/Empresa").map(function (empresa) {
					empresa.idTipo = 2;
					return empresa;
				});

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
						aliquotas: JSON.stringify(aValorAliquota),
						registrosRelacionados: Number(obj.idTipo) === 1 ? aPais : aEmpresa,
						tipoParaDesvincular: this._pegarQualTipoPrecisaSerLimpo(this.getModel().getProperty("/tipoInicial"), obj.idTipo)
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
				var aPais = this.getModel().getProperty("/Pais").map(function (pais) {
					pais.idTipo = 1;
					return pais;
				});
				var aEmpresa = this.getModel().getProperty("/Empresa").map(function (empresa) {
					empresa.idTipo = 2;
					return empresa;
				});
				
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
						aliquotas: JSON.stringify(aValorAliquota),
						registrosRelacionados: Number(obj.idTipo) === 1 ? aPais : aEmpresa
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
			
			_pegarQualTipoPrecisaSerLimpo: function (tipoInicial, tipoCorrente) {
				var inicial = Number(tipoInicial),
					corrente = Number(tipoCorrente);
					
				// Se nada mudou retorna null
				if (inicial === corrente) {
					return null;
				}
				// Se algo mudou, retorna o inicial, pois ele é quem precisa ter seus vínculos removidos do banco
				else {
					return inicial;
				}
			},

			/* Métodos fixos */
			onInit: function () {
				//sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR");
				
				var that = this;

				that.setModel(new sap.ui.model.json.JSONModel({
					objetos: [],
					DominioAliquotaTipo: [],
					DominioAnoFiscal: [],
					objeto: {},
					idObjeto: 0,
					isUpdate: false,
					Aliquotas: [],
					valorJanela: 0,
					PeriodoAliquota: []
				}));

				this.byId("paginaListagem").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarObjetos();
					}
				});

				this.byId("paginaObjeto").addEventDelegate({
					onAfterShow: function (oEvent) {
						const execucaoNormal = function () {
							if (oEvent.data.path) {
								that.getModel().setProperty("/isUpdate", true);
								that.getModel().setProperty("/idObjeto", that.getModel().getObject(oEvent.data.path).id_aliquota);
	
								that._carregarObjetoSelecionado(that.getModel().getObject(oEvent.data.path).id_aliquota);
							} else {
								that.getModel().setProperty("/isUpdate", false);
							}
						};
						
						that._carregarCamposFormulario()
							.then(function () {
								execucaoNormal();	
							})
							.catch(function () {
								execucaoNormal();
							});
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