sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/Utils",
		"ui5ns/ui5/model/Constants"
	],
	function (BaseController, NodeAPI, Validador, Utils, Constants) {
		jQuery.sap.require("sap.m.MessageBox");

		return BaseController.extend("ui5ns.ui5.controller.admin.Empresa", {

			/* Métodos a implementar */
			onAlterarVigencia: function (oEvent) {
				var obj = oEvent.getSource().getBindingContext().getObject(),
					anoInicial = obj["tblModeloObrigacao.data_inicial"].substring(0, 4),
					anoFinal = obj["tblModeloObrigacao.data_final"].substring(0, 4);

				this._dialogVigenciaCustomizada(obj, Number(anoInicial), Number(anoFinal), oEvent.getSource().getBindingContext().getPath() +
					"/vigenciaCustomizada");
			},

			_excluirPeriodo: function (oEvent, sCaminhoVigencia, oModeloObrigacao) {
				var that = this;

				var oExcluir = oEvent.getSource().getBindingContext().getObject();
				var aObjeto = this.getModel().getProperty(sCaminhoVigencia);

				var dialog = new sap.m.Dialog({
					title: this.getResourceBundle().getText("ViewDetalheTrimestreJSTextsConfirmation"),
					type: "Message",
					content: new sap.m.Text({
						text: this.getView().getModel("i18n").getResourceBundle().getText(
							"ViewDetalheTrimestreJSTextsVocetemcertezaquedesejaexcluiralinha")
					}),
					beginButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("viewGeralSim"),
						press: function () {
							if (!oExcluir.inserir) {
								oModeloObrigacao.vigenciaExcluida.push(oExcluir);
							}

							for (var i = 0; i < aObjeto.length; i++) {
								if (aObjeto[i] === oExcluir) {
									aObjeto.splice(i, 1);
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

			_dialogVigenciaCustomizada: function (oModeloObrigacao, iAnoInicioHerdado, iAnoFimHerdado, sCaminhoVigenciaCustomizada) {
				var that = this;

				var bHabilita = !!oModeloObrigacao.selecionada && !this.getModel().getProperty("/TravaCampo");

				var oTable = new sap.ui.table.Table({
					width: "400px",
					selectionMode: "None",
					rows: "{" + sCaminhoVigenciaCustomizada + "}",
					visibleRowCount: 4
				});

				var oToolbar = new sap.m.Toolbar();

				oToolbar.addContent(new sap.m.Text({
					text: "Original: " + iAnoInicioHerdado + " a " + iAnoFimHerdado
				}));

				oToolbar.addContent(new sap.m.ToolbarSpacer());

				var oButtonAdd = new sap.m.Button({
					icon: "sap-icon://add",
					type: "Transparent"
				}).attachPress(function () {
					that.getModel().getProperty(sCaminhoVigenciaCustomizada).unshift({
						inserir: true
					});
					that.getModel().refresh();
				}).setEnabled(bHabilita);

				oToolbar.addContent(oButtonAdd);

				oTable.addExtension(oToolbar);

				var oColumnDelete = new sap.ui.table.Column({
					width: "60px"
				});

				var oButtonDelete = new sap.m.Button({
					icon: "sap-icon://delete",
					type: "Reject",
					enabled: bHabilita
				}).attachPress(function (oEvent) {
					that._excluirPeriodo(oEvent, sCaminhoVigenciaCustomizada, oModeloObrigacao);
				});

				oColumnDelete.setTemplate(oButtonDelete);

				oTable.addColumn(oColumnDelete);

				var oColumnAnoInicial = new sap.ui.table.Column();

				oColumnAnoInicial.setLabel(new sap.m.Label({
					text: "{i18n>viewGeralAnoInicio}"
				}));

				var oSelectAnoInicial = new sap.m.Select({
						selectedKey: "{fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario}",
						width: "100%",
						enabled: bHabilita
					})
					.bindItems({
						templateShareable: false,
						path: "/DominioAnoCalendarioVigencia",
						template: new sap.ui.core.Item({
							key: "{id_dominio_ano_calendario}",
							text: "{ano_calendario}"
						})
					})
					.attachChange(function (oEvent) {
						var oPeriodo = oEvent.getSource().getBindingContext().getObject();
						if (!oPeriodo.inserir) {
							oPeriodo.atualizar = true;
						}
						that._validarPeriodo(oEvent, oPeriodo, sCaminhoVigenciaCustomizada);
					});

				oColumnAnoInicial.setTemplate(oSelectAnoInicial);

				oTable.addColumn(oColumnAnoInicial);

				var oColumnAnoFinal = new sap.ui.table.Column();

				oColumnAnoFinal.setLabel(new sap.m.Label({
					text: "{i18n>viewGeralAnoFim}"
				}));

				var oSelectAnoFinal = new sap.m.Select({
						selectedKey: "{fk_dominio_ano_calendario_final.id_dominio_ano_calendario}",
						width: "100%",
						enabled: bHabilita
					})
					.bindItems({
						templateShareable: false,
						path: "/DominioAnoCalendarioVigencia",
						template: new sap.ui.core.Item({
							key: "{id_dominio_ano_calendario}",
							text: "{ano_calendario}"
						})
					})
					.attachChange(function (oEvent) {
						var oPeriodo = oEvent.getSource().getBindingContext().getObject();
						if (!oPeriodo.inserir) {
							oPeriodo.atualizar = true;
						}
						that._validarPeriodo(oEvent, oPeriodo, sCaminhoVigenciaCustomizada);
					});

				oColumnAnoFinal.setTemplate(oSelectAnoFinal);

				oTable.addColumn(oColumnAnoFinal);

				var dialog = new sap.m.Dialog({
					title: that.getResourceBundle().getText("viewEmpresaAlterarVigencia"),
					content: oTable,
					endButton: new sap.m.Button({
						text: that.getResourceBundle().getText("viewGeralFechar"),
						press: function () {

							var aVigenciaCustomizada = that.getModel().getProperty(sCaminhoVigenciaCustomizada);

							var oVigenciaNaoPreenchida = aVigenciaCustomizada.find(function (oVigenciaCustomizada) {
								return (!oVigenciaCustomizada["fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"] ||
									!oVigenciaCustomizada["fk_dominio_ano_calendario_final.id_dominio_ano_calendario"]);
							});

							if (oVigenciaNaoPreenchida) {
								jQuery.sap.require("sap.m.MessageBox");

								sap.m.MessageBox.show(that.getResourceBundle().getText("viewAdminEmpresaPeriodoNaoPreenchido"), {
									title: that.getResourceBundle().getText("viewGeralAviso")
								});
							} else {
								dialog.close();
							}
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				// to get access to the global model
				this.getView().addDependent(dialog);

				dialog.open();
			},

			_validarPeriodo: function (oEvent, oPeriodoVigenciaNovo, sCaminhoVigencia) {

				var inicial = oPeriodoVigenciaNovo["fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"];
				var final = oPeriodoVigenciaNovo["fk_dominio_ano_calendario_final.id_dominio_ano_calendario"];
				var bIsAnoFimMaiorInicio = true;

				if (inicial && final && Number(final) < Number(inicial)) {
					jQuery.sap.require("sap.m.MessageBox");

					sap.m.MessageBox.show(this.getResourceBundle().getText("viewAdminCadastroAliquotasMensagemPeriodoAnoFimAnteriorAnoInicio"), {
						title: this.getResourceBundle().getText("viewGeralAviso")
					});

					oEvent.getSource().setSelectedKey(null);
					bIsAnoFimMaiorInicio = false;
				}

				if (bIsAnoFimMaiorInicio) {
					var aPeriodoVigencia = this.getModel().getProperty(sCaminhoVigencia),
						bIsCoincidente = false;

					// Checa se o novo período está contido em algum outro período estipulado
					for (var i = 0, length = aPeriodoVigencia.length; i < length; i++) {
						var oPeriodoVigencia = aPeriodoVigencia[i];

						if (oPeriodoVigencia !== oPeriodoVigenciaNovo) {
							if (oPeriodoVigencia["fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"] && oPeriodoVigencia[
									"fk_dominio_ano_calendario_final.id_dominio_ano_calendario"]) {
								if (oPeriodoVigenciaNovo["fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"]) {
									if (Number(oPeriodoVigenciaNovo["fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"]) >= Number(oPeriodoVigencia[
											"fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"]) && Number(oPeriodoVigenciaNovo[
											"fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"]) <=
										Number(oPeriodoVigencia["fk_dominio_ano_calendario_final.id_dominio_ano_calendario"])) {
										bIsCoincidente = true;
										break;
									}
								}

								if (oPeriodoVigenciaNovo["fk_dominio_ano_calendario_final.id_dominio_ano_calendario"]) {
									if (Number(oPeriodoVigenciaNovo["fk_dominio_ano_calendario_final.id_dominio_ano_calendario"]) >= Number(oPeriodoVigencia[
											"fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"]) && Number(oPeriodoVigenciaNovo[
											"fk_dominio_ano_calendario_final.id_dominio_ano_calendario"]) <=
										Number(oPeriodoVigencia["fk_dominio_ano_calendario_final.id_dominio_ano_calendario"])) {
										bIsCoincidente = true;
										break;
									}
								}
							}
						}
					}

					// Se chegou nesse ponto e o novo periodo não está contido em nenhum outro, checa se ele contém algum período (apenas se ambos os anos estiverem selecionados)
					if (!bIsCoincidente && oPeriodoVigenciaNovo["fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"] && oPeriodoVigenciaNovo[
							"fk_dominio_ano_calendario_final.id_dominio_ano_calendario"]) {
						var idAnoInicial = Number(oPeriodoVigenciaNovo["fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"]);
						var idAnoFinal = Number(oPeriodoVigenciaNovo["fk_dominio_ano_calendario_final.id_dominio_ano_calendario"]);

						for (var i = 0, length = aPeriodoVigencia.length; i < length; i++) {
							var oPeriodoVigencia = aPeriodoVigencia[i];

							if (oPeriodoVigencia !== oPeriodoVigenciaNovo) {
								if (oPeriodoVigencia["fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"]) {
									if (Number(oPeriodoVigencia["fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"]) >= idAnoInicial && Number(
											oPeriodoVigencia["fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"]) <= idAnoFinal) {
										bIsCoincidente = true;
										break;
									}
								}

								if (oPeriodoVigencia["fk_dominio_ano_calendario_final.id_dominio_ano_calendario"]) {
									if (Number(oPeriodoVigencia["fk_dominio_ano_calendario_final.id_dominio_ano_calendario"]) >= idAnoInicial && Number(
											oPeriodoVigencia["fk_dominio_ano_calendario_final.id_dominio_ano_calendario"]) <= idAnoFinal) {
										bIsCoincidente = true;
										break;
									}
								}
							}
						}
					}

					if (bIsCoincidente) {
						jQuery.sap.require("sap.m.MessageBox");

						sap.m.MessageBox.show(this.getResourceBundle().getText("viewAdminEmpresaPeriodoCoincidente"), {
							title: this.getResourceBundle().getText("viewGeralAviso")
						});

						oEvent.getSource().setSelectedKey(null);
					}
				}
			},

			onTextSearch: function (oEvent) {
				var sQuery = oEvent ? oEvent.getParameter("query") : null;
				this._oTxtFilter = null;

				if (sQuery !== null) {
					this._oTxtFilter = new sap.ui.model.Filter([
						new sap.ui.model.Filter("tblModeloObrigacao.nome_obrigacao", sap.ui.model.FilterOperator.Contains, sQuery)
					], false);
				}

				this.getView().getModel().setProperty("/filterValue", sQuery);

				if (oEvent && this._oTxtFilter) {
					this.byId("tableObrigacoes").getBinding("rows").filter(this._oTxtFilter, "Application");
				}
			},

			onTrocarData: function (oEvent) {
				var that = this;
				that.onValidarData(oEvent);
				if (Validador.periodoInvalido(this.byId("datepickerStartDate").getDateValue(), this.byId("datepickerEndDate").getDateValue())) {
					sap.m.MessageBox.warning(that.getResourceBundle().getText("viewAdminEmpresaControllerjsADataInícioNãoPodeSerPosteriorADataFim"), {
						title: "Aviso"
					});
				}
			},

			onTrocarEmail: function (oEvent) {
				var sEmail = oEvent.getSource().getValue();
				var that = this;
				if (sEmail !== "" && !Validador.emailValido(sEmail)) {
					sap.m.MessageBox.warning(that.getResourceBundle().getText("ViewGeralEmailNaoValido"), {
						title: "Aviso"
					});
				}
			},

			onChangeTin: function (oEvent) {
				var obj = this.getModel().getProperty("/objeto");
				if (obj["tin"]) {
					obj["valueStateJurisdicaoTin"] = sap.ui.core.ValueState.Error;
				} else {
					obj["valueStateJurisdicaoTin"] = sap.ui.core.ValueState.None;
					obj["jurisdicao_tin"] = "";
				}
			},

			onChangeNi: function (oEvent) {
				var obj = this.getModel().getProperty("/objeto");
				if (obj["ni"]) {
					obj["valueStateJurisdicaoNi"] = sap.ui.core.ValueState.Error;
				} else {
					obj["valueStateJurisdicaoNi"] = sap.ui.core.ValueState.None;
					obj["jurisdicao_ni"] = "";
				}
			},

			onPreencherJurisdicaoTin: function (oEvent) {
				var obj = this.getModel().getProperty("/objeto");
				if (!obj["jurisdicao_tin"]) {
					obj["valueStateJurisdicaoTin"] = sap.ui.core.ValueState.Error;
				} else {
					obj["valueStateJurisdicaoTin"] = sap.ui.core.ValueState.None;
				}
			},

			onPreencherJurisdicaoNi: function (oEvent) {
				var obj = this.getModel().getProperty("/objeto");
				if (!obj["jurisdicao_ni"]) {
					obj["valueStateJurisdicaoNi"] = sap.ui.core.ValueState.Error;
				} else {
					obj["valueStateJurisdicaoNi"] = sap.ui.core.ValueState.None;
				}
			},

			onPreencherStatus: function (oEvent) {
				var obj = this.getModel().getProperty("/objeto");
				if (obj["fk_dominio_empresa_status.id_dominio_empresa_status"] > 3 && obj["fk_dominio_empresa_status.id_dominio_empresa_status"] <
					7) {
					obj["data_liquidada_requerida"] = true;
					obj["data_liquidada_visible"] = true;
				} else {
					obj["data_liquidada_requerida"] = false;
					obj["data_liquidada_visible"] = false;
					obj["data_encerramento"] = undefined;
				}
			},

			_nomeColunaIdentificadorNaListagemObjetos: "id_empresa",

			_validarFormulario: function () {
				var obj = this.getModel().getProperty("/objeto");

				var sIdFormulario = "#" + this.byId("formularioObjeto").getDomRef().id;

				var oValidacao = Validador.validarFormularioAdmin({
					aInputObrigatorio: jQuery(sIdFormulario + " input[aria-required=true]"),
					aDropdownObrigatorio: [
						this.byId("selectTipoSocietario"),
						this.byId("comboboxPais")
					],
					oPeriodoObrigatorio: {
						dataInicio: this.byId("datepickerStartDate"),
						dataFim: this.byId("datepickerEndDate")
					},
					sEmail: this.byId("inputLBCEmail").getValue()
				});

				var continua = true;
				if (obj["ni"] && !obj["jurisdicao_ni"]) {
					continua = false;
					oValidacao.mensagem = this.getResourceBundle().getText("ViewGeralOrbigatorio");
				}
				if (obj["tin"] && !obj["jurisdicao_tin"]) {
					continua = false;
					oValidacao.mensagem = this.getResourceBundle().getText("ViewGeralOrbigatorio");
				}
				if (obj["fk_dominio_empresa_status.id_dominio_empresa_status"] > 3 && obj["fk_dominio_empresa_status.id_dominio_empresa_status"] <
					7 && !obj["data_encerramento"]) {
					continua = false;
					oValidacao.mensagem = this.getResourceBundle().getText("ViewGeralOrbigatorio");
				}
				oValidacao.formularioValido = (oValidacao.formularioValido && continua);
				if (!oValidacao.formularioValido) {
					sap.m.MessageBox.warning(oValidacao.mensagem, {
						title: ""
					});
				}

				return oValidacao.formularioValido;

				/*var campoObrigatorioVazio = false,
					periodoInvalido = false,
					emailInvalido = false;
				
				jQuery.each(jQuery("input[aria-required=true]"), function (index, element) {
					if (element.value.trim() === "") {
						campoObrigatorioVazio = true;
					}
				});
				
				jQuery.each([
					this.byId("selectTipoSocietario").getSelectedKey(), 
					this.byId("comboboxPais").getSelectedKey()
				], function (index, element) {
					if (!element) {
						campoObrigatorioVazio = true;
					}	
				});
				
				periodoInvalido = this._periodoInvalido(this.byId("datepickerStartDate").getDateValue(), this.byId("datepickerEndDate").getDateValue());
				
				emailInvalido = this.byId("inputLBCEmail").getValue() !== "" && !Validador.emailValido(this.byId("inputLBCEmail").getValue());
				
				var sMensagem = "";
				
				if (campoObrigatorioVazio) {
					sMensagem += "- Os campos destacados são de preenchimento obrigatório\n";
				}
				
				if (periodoInvalido) {
					sMensagem += "- A Data Início não pode ser posterior a Data Fim\n";
				}
				
				if (emailInvalido) {
					sMensagem += "- O email inserido não é válido\n";
				}
				
				sap.m.MessageBox.warning(sMensagem, {
					title: "Aviso"
				});
				
				// Se não houver mensagem de erro o formulário é válido
				return sMensagem === "";*/
			},

			_resolverHistoricoAliquota: function (callback) {
				var that = this;

				var oHistoricoAtual = this.getModel().getProperty("/HistoricoAtual");
				var sIdAliquotaVigente = this.getModel().getProperty("/idAliquotaVigente");
				var sIdAliquotaNova = this.getModel().getProperty("/objeto/fk_aliquota.id_aliquota");

				// Se existe valor de alíquota vigente e ele é diferente da nova alíquota selecionada..
				if (sIdAliquotaVigente && sIdAliquotaVigente !== "0" && sIdAliquotaVigente !== sIdAliquotaNova) {
					// Atualiza o registro de histórico atual com a data fim de troca de alíquota
					NodeAPI.atualizarRegistro("HistoricoEmpresaAliquota", oHistoricoAtual.id_hs_empresa_aliquota, {
						fkEmpresa: this.getModel().getProperty("/idObjeto"),
						fkAliquota: sIdAliquotaVigente,
						dataInicio: oHistoricoAtual.data_inicio_rel,
						dataFim: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate()
					}, function (response) {
						// Caso a nova alíquota selecionada seja válida..
						if (sIdAliquotaNova && sIdAliquotaNova !== "0") {
							// Cria um registro de histórico para ela..
							NodeAPI.criarRegistro("HistoricoEmpresaAliquota", {
								fkEmpresa: that.getModel().getProperty("/idObjeto"),
								fkAliquota: sIdAliquotaNova,
								dataInicio: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate()
							}, function (resp) {
								callback();
							});
						} else {
							// Se não apenas retorna
							callback();
						}
					});
				}
				// Se não existe alíquota vigente e a nova alíquota selecionada é valida..
				else if ((sIdAliquotaVigente === null || sIdAliquotaVigente === "0") && sIdAliquotaNova && sIdAliquotaNova !== "0") {
					// Cria seu registro de Histórico
					NodeAPI.criarRegistro("HistoricoEmpresaAliquota", {
						fkEmpresa: this.getModel().getProperty("/idObjeto"),
						fkAliquota: sIdAliquotaNova,
						dataInicio: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate()
					}, function (resp) {
						callback();
					});
				} else {
					// Para todos os outros casos a alíquota não foi alterada
					callback();
				}
			},

			_carregarObjetos: function () {
				/*this.getModel().setProperty("/objetos", [
					{
						id: 1,
						nome: "Empresa A"
					},
					{
						id: 2,
						nome: "Empresa B"
					}
				]);*/

				var that = this;
				that.setBusy(that.byId("tabelaObjetos"), true);
				that.getModel().setProperty("/objetos", null);
				NodeAPI.listarRegistros("DeepQuery/Empresa?full=true", function (response) {

					var aResponse = response;
					for (var i = 0, length = aResponse.length; i < length; i++) {
						aResponse[i]["status"] = Utils.traduzEmpresaStatusTipo(aResponse[i]["id_dominio_empresa_status"], that);
					}
					that.getModel().setProperty("/objetos", aResponse);

					that.setBusy(that.byId("tabelaObjetos"), false);
				});

				NodeAPI.listarRegistros("DominioAnoCalendario?full=true", function (response) {
					that.getModel().setProperty("/DominioAnoCalendario", response.slice()); // slice faz uma copia do array
					response.unshift({});
					that.getModel().setProperty("/DominioAnoCalendarioVigencia", response.slice()); // é necessário para que mudanças na segunda propriedade nao reflitam na primeira
				});
				NodeAPI.listarRegistros("DeepQuery/RelModeloEmpresa", function (response) {
					that.getModel().setProperty("/RelModeloEmpresa", response);
				});
			},

			onSelectChange: function () {
				var that = this;
				that.setBusy(that.byId("tableObrigacoes"), true);
				var obj = this.getModel().getProperty("/objeto/fk_pais.id_pais");
				if (obj) {
					NodeAPI.listarRegistros("DeepQuery/ModeloObrigacao?idRegistro=" + obj, function (response) {
						response = response.map(function (oRes) {
							oRes.vigenciaCustomizada = [];
							oRes.vigenciaExcluida = [];
							return oRes;
						});
						that.getModel().setProperty("/ModeloObrigacao", response);
						that.setBusy(that.byId("tableObrigacoes"), false);
					});
				} else {
					that.getModel().setProperty("/ModeloObrigacao", {});
					that.setBusy(that.byId("tableObrigacoes"), false);
				}

			},

			_carregarCamposFormulario: function () {
				var that = this;

				NodeAPI.listarRegistros("DeepQuery/Pais", function (response) {
					response.unshift({});
					var aPais = response;
					for (var i = 1; i < aPais.length; i++) {
						aPais[i]["nomePais"] =
							Utils.traduzDominioPais(aPais[i]["fkDominioPais"], that);
					}
					that.getModel().setProperty("/Pais", Utils.orderByArrayParaBox(aPais, "nomePais"));
				});

				NodeAPI.listarRegistros("DominioEmpresaTipoSocietario", function (response) {
					response.unshift({});
					var aDominioEmpresaTipoSocietario = response;
					for (var i = 1; i < aDominioEmpresaTipoSocietario.length; i++) {
						aDominioEmpresaTipoSocietario[i]["tipo_societario"] =
							Utils.traduzEmpresaTipoSocietario(aDominioEmpresaTipoSocietario[i]["id_dominio_empresa_tipo_societario"], that);
					}
					that.getModel().setProperty("/DominioEmpresaTipoSocietario", Utils.orderByArrayParaBox(aDominioEmpresaTipoSocietario,
						"tipo_societario"));
					//that.getModel().setProperty("/DominioEmpresaTipoSocietario", response);	
				});

				NodeAPI.listarRegistros("DominioEmpresaStatus", function (response) {
					response.unshift({});
					var aDominioEmpresaStatus = response;
					for (var i = 1; i < aDominioEmpresaStatus.length; i++) {
						aDominioEmpresaStatus[i]["status"] =
							Utils.traduzEmpresaStatusTipo(aDominioEmpresaStatus[i]["id_dominio_empresa_status"], that);
					}
					that.getModel().setProperty("/DominioEmpresaStatus", Utils.orderByArrayParaBox(aDominioEmpresaStatus, "status"));
					//that.onPreencherStatus();

				});

				NodeAPI.listarRegistros("Aliquota?tipo=empresa", function (response) {
					response.unshift({});
					that.getModel().setProperty("/Aliquota", response);
				});
			},

			_carregarObjetoSelecionado: function (iIdObjeto) {

				var that = this;

				this.getModel().setProperty("/showHistorico", false);

				that.setBusy(that.byId("formularioObjeto"), true);
				NodeAPI.lerRegistro("Empresa", iIdObjeto, function (response) {
					that.getModel().setProperty("/objeto", response);
					that.onPreencherStatus();
					that.getModel().setProperty("/idAliquotaVigente", response["fk_aliquota.id_aliquota"]);
					if (that.getModel().getProperty("/objeto/fk_dominio_empresa_status.id_dominio_empresa_status") > 3 && that.getModel().getProperty(
							"/objeto/fk_dominio_empresa_status.id_dominio_empresa_status") < 7) {
						that.getModel().setProperty("/TravaCampo", true);
					} else {
						that.getModel().setProperty("/TravaCampo", false);
					}
					that.setBusy(that.byId("formularioObjeto"), false);

					var pais = that.getModel().getProperty("/objeto/fk_pais.id_pais");
					NodeAPI.listarRegistros("DeepQuery/ModeloObrigacao?idRegistro=" + pais + "&idStatus=2", function (res) {
						that.getModel().setProperty("/ModeloObrigacao", res);
						NodeAPI.listarRegistros("DeepQuery/RelModeloEmpresa?idEmpresaNaQualMeRelaciono=" + iIdObjeto, function (r) {
							that._resolverVinculoObrigacoes(r);
						});
					});

					// Carrega o histórico de alíquotas dessa empresa
					NodeAPI.listarRegistros("DeepQuery/HistoricoEmpresaAliquota/" + iIdObjeto + "&-1", function (resp) {
						if (resp && resp.length > 0) {
							that.getModel().setProperty("/objeto/historicoAliquotas", resp);

							// Se existe um registro de histórico para essa empresa que não possua data fim ele é o registro da alíquota vigente
							//var obj = resp.find(x => x.data_fim_rel === null);
							var obj = resp.find(function (x) {
								return x.data_fim_rel === null;
							});
							that.getModel().setProperty("/HistoricoAtual", obj);
						}
					});
				});

				//NodeAPI.listarRegistros("RelacionamentoEmpresaObrigacaoAcessoria?fkEmpresa=" + iIdObjeto + "&indicadorHistorico=false", function (response) {

				//-----------------OLHAR UTILIDADE DEPOIS
				//-----------------OLHAR UTILIDADE DEPOIS
				//-----------------OLHAR UTILIDADE DEPOIS
				//-----------------OLHAR UTILIDADE DEPOIS
				//-----------------OLHAR UTILIDADE DEPOIS
				/*
				NodeAPI.listarRegistros("DeepQuery/RelModeloEmpresa/" + iIdObjeto , function (response) {
					that.getModel().setProperty("/objeto/historicoObrigacoes", response);	
				});
				*/
			},

			_limparFormulario: function () {
				// Limpar o filtro da tabela de obrigações
				/*this.byId("searchObrigacoes").fireSearch({
					query: ""
				});*/
				// Limpar outras propriedades do modelo
				this.getModel().setProperty("/DominioAnoCalendario", []);
				this.getModel().setProperty("/DominioAnoCalendarioVigencia", []);
				this.getModel().setProperty("/DominioEmpresaTipoSocietario", {});
				this.getModel().setProperty("/DominioEmpresaStatus", {});
				this.getModel().setProperty("/Pais", {});
				this.getModel().setProperty("/Aliquota", {});
				this.getModel().setProperty("/objeto", {});
				this.getModel().setProperty("/showHistorico", false);
				this.getModel().setProperty("/HistoricoAtual", {});
				this.getModel().setProperty("/idAliquotaVigente", 0);
				this.getModel().setProperty("/ModeloObrigacao", {});
				this.getModel().setProperty("/TravaCampo", false);
			},

			_atualizarObjeto: function (sIdObjeto) {
				/*sap.m.MessageToast.show("Atualizar Objeto");
				this._navToPaginaListagem();*/

				var that = this;
				that.byId("btnCancelar").setEnabled(false);
				that.byId("btnSalvar").setEnabled(false);
				that.setBusy(that.byId("btnSalvar"), true);

				var obj = this.getModel().getProperty("/objeto");
				NodeAPI.listarRegistros("DeepQuery/Pais/" + obj["fk_pais.id_pais"], function (resposta) {
					//response.unshift({ });
					that.getModel().setProperty("/DmenosXAnos", resposta);
					NodeAPI.atualizarRegistro("Empresa", sIdObjeto, {
						nome: obj["nome"],
						numHFMSAP: obj["num_hfm_sap"],
						tin: obj["tin"],
						jurisdicaoTIN: obj["jurisdicao_tin"],
						ni: obj["ni"],
						jurisdicaoNi: obj["jurisdicao_ni"],
						endereco: obj["endereco"],
						fyStartDate: obj["fy_start_date"],
						fyEndDate: obj["fy_end_date"],
						lbcNome: obj["lbc_nome"],
						lbcEmail: obj["lbc_email"],
						comentarios: obj["comentarios"],
						data_encerramento: obj["data_encerramento"],
						fkTipoSocietario: obj["fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario"],
						fkStatus: obj["fk_dominio_empresa_status.id_dominio_empresa_status"],
						fkAliquota: obj["fk_aliquota.id_aliquota"],
						fkPais: obj["fk_pais.id_pais"]
							/*,
													obrigacoes: JSON.stringify(this._getSelecaoObrigacoes())*/
					}, function (response) {
						NodeAPI.listarRegistros("DeepQuery/RelModeloEmpresa?idEmpresaNaQualMeRelaciono=" + sIdObjeto, function (resp) {
							var obj = that.getModel().getProperty("/objeto");
							var aObrigacoesSelecionadas = that._getSelecaoObrigacoes(resp);
							var DmenosX = that.getModel().getProperty("/DmenosXAnos");
							var AnoCalendario = that.getModel().getProperty("/DominioAnoCalendario");
							if (obj["data_encerramento"]) {
								/*var idDominioAno = that.getModel().getProperty("/DominioAnoCalendario").find(function (x) {
									return x.ano_calendario === Number(obj["data_encerramento"].substring(0, 4));
								});
								jQuery.ajax(Constants.urlBackend + "/marcaRespostasComoExcluidas/RespostaObrigacao?empresa=" + sIdObjeto +
									"&anoCalendario=" + idDominioAno["id_dominio_ano_calendario"], {
										type: "GET",
										xhrFields: {
											withCredentials: true
										},
										crossDomain: true,
										dataType: "json",
										success: function (respon) {
											var aResponse = respon;
										}
								});*/
							} else {
								for (var i = 0; i < aObrigacoesSelecionadas["inserir"].length; i++) {

									(function (oObrigacoesInserir) {
										NodeAPI.criarRegistro("RelModeloEmpresa", {
											fkIdModeloObrigacao: oObrigacoesInserir["tblModeloObrigacao.id_modelo"],
											fkIdEmpresa: sIdObjeto, //modelosObrigacao[k]["tblModeloObrigacao.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status"],
											prazoEntregaCustomizado: oObrigacoesInserir["data_selecionada"],
											indAtivo: true
										}, function (res) {
											var idRelModeloEmpresa = JSON.parse(res)[0].generated_id;

											that._persistirVigenciaCustomizada(oObrigacoesInserir, idRelModeloEmpresa);

											/*for (var k = 0; k < AnoCalendario.length; k++) {
												var oAnoCalendario = AnoCalendario[k];
												NodeAPI.criarRegistro("RespostaObrigacao", {
													suporteContratado: null,
													suporteEspecificacao: null,
													suporteValor: null,
													dataExtensao: null,
													fkIdDominioMoeda: null,
													fkIdRelModeloEmpresa: idRelModeloEmpresa,
													fkIdDominioObrigacaoStatusResposta: 4,
													fkIdDominioAnoFiscal: oAnoCalendario["id_dominio_ano_calendario"] - DmenosX[0]["anoObrigacaoCompliance"], //ALTERAR PARA AMARRACAO COM D-1 DE PAIS
													fkIdDominioAnoCalendario: oAnoCalendario["id_dominio_ano_calendario"],
													data_conclusao: null
												}, function (re) {});
											}*/
										});
									})(aObrigacoesSelecionadas["inserir"][i]);
								}
								for (var i = 0; i < aObrigacoesSelecionadas["desabilitar"].length; i++) {
									var oObrigacoesDesabilitar = aObrigacoesSelecionadas["desabilitar"][i];

									that._persistirVigenciaCustomizada(oObrigacoesDesabilitar, oObrigacoesDesabilitar["idRelModeloEmpresa"]);

									NodeAPI.atualizarRegistro("RelModeloEmpresa", oObrigacoesDesabilitar["idRelModeloEmpresa"], {
										fkIdModeloObrigacao: oObrigacoesDesabilitar["tblModeloObrigacao.id_modelo"],
										fkIdEmpresa: sIdObjeto, //modelosObrigacao[k]["tblModeloObrigacao.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status"],
										prazoEntregaCustomizado: oObrigacoesDesabilitar["data_selecionada"],
										indAtivo: false
									}, function (res) {});
								}
								for (var i = 0; i < aObrigacoesSelecionadas["habilitar"].length; i++) {
									var oObrigacoesHabilitar = aObrigacoesSelecionadas["habilitar"][i];

									that._persistirVigenciaCustomizada(oObrigacoesHabilitar, oObrigacoesHabilitar["idRelModeloEmpresa"]);

									NodeAPI.atualizarRegistro("RelModeloEmpresa", oObrigacoesHabilitar["idRelModeloEmpresa"], {
										fkIdModeloObrigacao: oObrigacoesHabilitar["tblModeloObrigacao.id_modelo"],
										fkIdEmpresa: sIdObjeto, //modelosObrigacao[k]["tblModeloObrigacao.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status"],
										prazoEntregaCustomizado: oObrigacoesHabilitar["data_selecionada"],
										indAtivo: true
									}, function (res) {});
								}
								for (var i = 0; i < aObrigacoesSelecionadas["atualizar"].length; i++) {
									var oObrigacoesAtualizar = aObrigacoesSelecionadas["atualizar"][i];

									that._persistirVigenciaCustomizada(oObrigacoesAtualizar, oObrigacoesAtualizar["idRelModeloEmpresa"]);

									NodeAPI.atualizarRegistro("RelModeloEmpresa", oObrigacoesAtualizar["idRelModeloEmpresa"], {
										fkIdModeloObrigacao: oObrigacoesAtualizar["tblModeloObrigacao.id_modelo"],
										fkIdEmpresa: sIdObjeto, //modelosObrigacao[k]["tblModeloObrigacao.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status"],
										prazoEntregaCustomizado: oObrigacoesAtualizar["data_selecionada"],
										indAtivo: oObrigacoesAtualizar["indAtivo"]
									}, function (res) {});
								}
							}
							
							that._resolverHistoricoAliquota(function () {
								that.byId("btnCancelar").setEnabled(true);
								that.byId("btnSalvar").setEnabled(true);
								that.setBusy(that.byId("btnSalvar"), false);
								that._navToPaginaListagem();
							});
						});
					});
				});
			},

			_inserirObjeto: function () {
				var that = this;
				that.byId("btnCancelar").setEnabled(false);
				that.byId("btnSalvar").setEnabled(false);
				that.setBusy(that.byId("btnSalvar"), true);
				var obj = this.getModel().getProperty("/objeto");

				NodeAPI.listarRegistros("DeepQuery/Pais/" + obj["fk_pais.id_pais"], function (resposta) {
					//response.unshift({ });
					that.getModel().setProperty("/DmenosXAnos", resposta);

					NodeAPI.criarRegistro("Empresa", {
						nome: obj["nome"],
						numHFMSAP: obj["num_hfm_sap"],
						tin: obj["tin"],
						jurisdicaoTIN: obj["jurisdicao_tin"],
						ni: obj["ni"],
						jurisdicaoNi: obj["jurisdicao_ni"],
						endereco: obj["endereco"],
						fyStartDate: obj["fy_start_date"],
						fyEndDate: obj["fy_end_date"],
						lbcNome: obj["lbc_nome"],
						lbcEmail: obj["lbc_email"],
						comentarios: obj["comentarios"],
						fkTipoSocietario: obj["fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario"],
						fkStatus: obj["fk_dominio_empresa_status.id_dominio_empresa_status"],
						fkAliquota: obj["fk_aliquota.id_aliquota"],
						fkPais: obj["fk_pais.id_pais"]
							/*,
													obrigacoes: JSON.stringify(that._getSelecaoObrigacoes())9*/
					}, function (response) {
						that.byId("btnSalvar").setEnabled(true);
						that.byId("btnCancelar").setEnabled(true);
						that.setBusy(that.byId("btnSalvar"), false);
						var then = that;
						var modelosObrigacao = that.getModel().getProperty("/ModeloObrigacao");

						//Cria o Registro de Rel_Modelo_Empresa
						for (var k = 0; k < modelosObrigacao.length; k++) {
							if (modelosObrigacao[k]["selecionada"] !== undefined) {
								(function (oModeloObrigacao) {
									NodeAPI.criarRegistro("RelModeloEmpresa", {
										fkIdModeloObrigacao: oModeloObrigacao["tblModeloObrigacao.id_modelo"],
										fkIdEmpresa: JSON.parse(response)[0].generated_id, //modelosObrigacao[k]["tblModeloObrigacao.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status"],
										prazoEntregaCustomizado: oModeloObrigacao["data_selecionada"],
										indAtivo: true
									}, function (res) {
										var idRelModeloEmpresa = JSON.parse(res)[0].generated_id;

										that._persistirVigenciaCustomizada(oModeloObrigacao, idRelModeloEmpresa);

										var DmenosX = then.getModel().getProperty("/DmenosXAnos");
										var AnoCalendario = then.getModel().getProperty("/DominioAnoCalendario");
										/*for (var i = 0; i < AnoCalendario.length; i++) {
											var oAnoCalendario = AnoCalendario[i];
											NodeAPI.criarRegistro("RespostaObrigacao", {
												suporteContratado: null,
												suporteEspecificacao: null,
												suporteValor: null,
												dataExtensao: null,
												fkIdDominioMoeda: null,
												fkIdRelModeloEmpresa: idRelModeloEmpresa,
												fkIdDominioObrigacaoStatusResposta: 4,
												fkIdDominioAnoFiscal: oAnoCalendario["id_dominio_ano_calendario"] - DmenosX[0]["anoObrigacaoCompliance"], //ALTERAR PARA AMARRACAO COM D-1 DE PAIS
												fkIdDominioAnoCalendario: oAnoCalendario["id_dominio_ano_calendario"],
												data_conclusao: null
											}, function (re) {

											});
										}*/
									});
								})(modelosObrigacao[k]);
							}
						}

						// Se foi selecionada uma alíquota válida na criação da empresa
						if (obj["fk_aliquota.id_aliquota"] && obj["fk_aliquota.id_aliquota"] > 0) {
							// Cria seu registro inicial de histórico
							NodeAPI.criarRegistro("HistoricoEmpresaAliquota", {
								fkEmpresa: JSON.parse(response)[0].generated_id,
								fkAliquota: obj["fk_aliquota.id_aliquota"],
								dataInicio: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate()
							}, function (resp) {
								that.byId("btnCancelar").setEnabled(true);
								that.byId("btnSalvar").setEnabled(true);
								that.setBusy(that.byId("btnSalvar"), false);
								that._navToPaginaListagem();
							});
						} else {
							// Se não, apenas retorna
							that.byId("btnCancelar").setEnabled(true);
							that.byId("btnSalvar").setEnabled(true);
							that.setBusy(that.byId("btnSalvar"), false);
							that._navToPaginaListagem();
						}
					});
				});

			},

			_getSelecaoObrigacoes: function (RelModeloEmpresaJaCriadas) {
				var oObrigacoes = {
					inserir: [],
					desabilitar: [],
					habilitar: [],
					atualizar: []
				};

				//var aObrigacoes = this.getModel().getProperty("/ObrigacaoAcessoria");
				var aObrigacoes = this.getModel().getProperty("/ModeloObrigacao");
				var aRelModeloEmpresaJaCriadas = RelModeloEmpresaJaCriadas;

				for (var i = 0; i < aObrigacoes.length; i++) {
					var oObrigacao = aObrigacoes[i];
					var habilitar = false;
					for (var j = 0; j < aRelModeloEmpresaJaCriadas.length; j++) {
						var oAchaIdRel = aRelModeloEmpresaJaCriadas[j];
						if (oAchaIdRel["tblRelModeloEmpresa.fk_id_modelo_obrigacao.id_modelo"] === oObrigacao["tblModeloObrigacao.id_modelo"]) {
							oObrigacao.idRelModeloEmpresa = oAchaIdRel["tblRelModeloEmpresa.id_rel_modelo_empresa"];
							oObrigacao.indAtivo = oAchaIdRel["tblRelModeloEmpresa.ind_ativo"];
							break;
						}
					}

					if (!oObrigacao.selecionadaInicialmente && oObrigacao.selecionada) {
						for (var k = 0; k < aRelModeloEmpresaJaCriadas.length; k++) {
							var oRelModeloEmpresaJaCriadas = aRelModeloEmpresaJaCriadas[k];
							if (oRelModeloEmpresaJaCriadas["tblRelModeloEmpresa.fk_id_modelo_obrigacao.id_modelo"] == oObrigacao[
									"tblModeloObrigacao.id_modelo"]) {
								habilitar = true;
								break;
							}
						}
						if (habilitar == true) {
							oObrigacoes.habilitar.push(oObrigacao);
						} else {
							oObrigacoes.inserir.push(oObrigacao);
						}
					} else if (oObrigacao.selecionadaInicialmente && !oObrigacao.selecionada) {
						oObrigacoes.desabilitar.push(oObrigacao);
					} else {
						oObrigacoes.atualizar.push(oObrigacao);
					}
				}

				return oObrigacoes;
			},

			_resolverVinculoObrigacoes: function (response) {
				/*ESTA FUNCAO VERIFICARA QUAIS MODELOS_OBRIGACAO DESTE PAIS ESTAO SELECIONADOS PARA ESTA EMPRESA
				ISTO SE DA ATRAVES DA VERIFICAÇÃO NA TABELA REL_MODELO_EMPRESA, QUE ESTA VINDO NO ARGUMENTO DESTA FUNCAO
				*/
				//var aObrigacoes = this.getModel().getProperty("/ObrigacaoAcessoria");
				var aObrigacoes = this.getModel().getProperty("/ModeloObrigacao");

				for (var i = 0; i < aObrigacoes.length; i++) {

					var oObrigacao = aObrigacoes[i];
					//NESTA ETAPA VOCE DEVE VERIFICAR QUAIS ID DE MODELO OBRIGACAO TAMBEM ESTAO NA REL_MODELO_EMPRESA
					//var aux = response.find(x => x["fk_obrigacao_acessoria.id_obrigacao_acessoria"] === oObrigacao["id_obrigacao_acessoria"]);
					var aux = response.find(function (x) {
						//return x["fk_obrigacao_acessoria.id_obrigacao_acessoria"] === oObrigacao["id_obrigacao_acessoria"];
						//return x["fk_id_modelo_obrigacao.id_modelo"] === oObrigacao["tblModeloObrigacao.id_modelo"];
						return (x["tblRelModeloEmpresa.fk_id_modelo_obrigacao.id_modelo"] === oObrigacao["tblModeloObrigacao.id_modelo"]);
					});

					if (aux) {
						if (!!aux["tblRelModeloEmpresa.ind_ativo"] === true) {
							oObrigacao.selecionadaInicialmente = true;
							oObrigacao.selecionada = true;
							oObrigacao.data_selecionada = aux["tblRelModeloEmpresa.prazo_entrega_customizado"];
						}
					}

					(function (modeloObrigacao) {
						if (aux) {
							NodeAPI.pListarRegistros("VigenciaCustomizada", {
									fkRelModeloEmpresa: aux["tblRelModeloEmpresa.id_rel_modelo_empresa"]
								})
								.then(function (res) {
									res.result = res.result.map(function (oVigencia) {
										oVigencia.fkAnoInicialPersistido = oVigencia["fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"];
										oVigencia.fkAnoFinalPersistido = oVigencia["fk_dominio_ano_calendario_final.id_dominio_ano_calendario"];
										return oVigencia;
									});
									res.result.sort(function (x, y) {
										return Number(y["fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"]) - Number(x[
											"fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"]);
									});
									modeloObrigacao.vigenciaCustomizada = res.result;
									modeloObrigacao.vigenciaExcluida = [];
								})
								.catch(function (err) {
									alert(err.status + " - " + err.statusText + "\n" + err.responseJSON.error.message);
								});
						} else {
							modeloObrigacao.vigenciaCustomizada = [];
							modeloObrigacao.vigenciaExcluida = [];
						}
					})(oObrigacao);
				}

				this.getModel().refresh();

				/*var aDominioPais = this.getModel().getProperty("/DominioPais");
					
				for (var i = 0; i < aDominioPais.length; i++) {
					
					var oPais = aDominioPais[i];
					
					var aux = response.find(x => x["fk_dominio_pais.id_dominio_pais"] === oPais["id_dominio_pais"]);
					
					if (aux) {
						oPais.selecionado = true;
					}
				}*/
			},

			_persistirVigenciaCustomizada: function (oModeloObrigacao, idRelModeloEmpresa) {
				for (var i = 0; i < oModeloObrigacao.vigenciaCustomizada.length; i++) {
					var oVigenciaCustomizada = oModeloObrigacao.vigenciaCustomizada[i];

					if (oVigenciaCustomizada.inserir) {
						NodeAPI.pCriarRegistro("VigenciaCustomizada", {
							fkRelModeloEmpresa: idRelModeloEmpresa,
							fkDominioAnoCalendarioInicial: oVigenciaCustomizada["fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"],
							fkDominioAnoCalendarioFinal: oVigenciaCustomizada["fk_dominio_ano_calendario_final.id_dominio_ano_calendario"]
						});
					} else if (oVigenciaCustomizada.atualizar) {
						var sId = oVigenciaCustomizada["fk_id_rel_modelo_empresa.id_rel_modelo_empresa"] + "&" + oVigenciaCustomizada.fkAnoInicialPersistido +
							"&" + oVigenciaCustomizada.fkAnoFinalPersistido

						NodeAPI.pAtualizarRegistro("VigenciaCustomizada", sId, {
							fkDominioAnoCalendarioInicial: oVigenciaCustomizada["fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"],
							fkDominioAnoCalendarioFinal: oVigenciaCustomizada["fk_dominio_ano_calendario_final.id_dominio_ano_calendario"]
						});
					}
				}

				for (var i = 0; i < oModeloObrigacao.vigenciaExcluida.length; i++) {
					var oVigenciaExcluida = oModeloObrigacao.vigenciaExcluida[i];

					var sId = oVigenciaExcluida["fk_id_rel_modelo_empresa.id_rel_modelo_empresa"] + "&" + oVigenciaExcluida[
						"fk_dominio_ano_calendario_inicial.id_dominio_ano_calendario"] + "&" + oVigenciaExcluida[
						"fk_dominio_ano_calendario_final.id_dominio_ano_calendario"];

					NodeAPI.pExcluirRegistro("VigenciaCustomizada", sId);
				}
			},

			_navToPaginaListagem: function () {
				this.byId("myNav").to(this.byId("paginaListagem"), "flip");
			},

			/* Métodos fixos */
			onInit: function () {
				var that = this;

				that.setModel(new sap.ui.model.json.JSONModel({
					objetos: [],
					objeto: {},
					isUpdate: false,
					showHistorico: false,
					idAliquotaVigente: 0
				}));

				this.byId("paginaListagem").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarObjetos(); //CARREGA OS OBJETOS DE EMPRESA E MODELOOBRIGACAO
					}
				});

				this.byId("paginaObjeto").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarCamposFormulario(); //PREENCHIMENTO DAS INFORMACOES NA PRIMEIRA TELA

						if (oEvent.data.path) {
							var id = that.getModel().getObject(oEvent.data.path)[that._nomeColunaIdentificadorNaListagemObjetos];

							that.getModel().setProperty("/isUpdate", true);
							that.getModel().setProperty("/idObjeto", id);

							that._carregarObjetoSelecionado(id); //CARREGA AS INFORMACOES DO ID SELECIONADO NO carregarCamposFormulario
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
				this.getModel().setProperty("/showHistorico", false);
				this.getModel().refresh();
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
						this._atualizarObjeto(this.getModel().getProperty("/idObjeto"));
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
		return BaseController.extend("ui5ns.ui5.controller.admin.Empresa", {
			onInit: function () {
				var that = this;
				
				this._modelEmpresasDados = [
					{
						id: "1",
						nome: "Empresa A"
					},
					{
						id: "2",
						nome: "Empresa B"
					}
				];
				
				this.byId("paginaListagem").addEventDelegate({
					onAfterShow: function (oEvent) {
						
						that.setModel(new sap.ui.model.json.JSONModel({
							empresas: that._modelEmpresasDados,
							obrigacoes: {
								cadastradas: [
									{
										tipo: "Compliance",
										nome: "Obrigação 1"
									},
									{
										tipo: "Beps",
										nome: "Obrigação 2"
									}
								],
								vinculadas: [
									{
										tipo: "Beps",
										nome: "Obrigação 3"
									}
								]
							}
						}));
						
						
					}	
				});
				
				this.byId("paginaObjeto").addEventDelegate({
					onAfterShow: function (oEvent) {
						//alert("Abrindo objeto: " + oEvent.data.path);
						//alert(JSON.stringify(that.getModel().getObject(oEvent.data.path)));
						if (oEvent.data.path) {
							var oSelectedObject = that.getModel().getObject(oEvent.data.path);
							
							// É preciso pegar o id do objeto selecionado e enviar uma request
							// para preencher as informações do mesmo
							that._idObjetoSelecionado = oSelectedObject.id;
							that.byId("inputNomeEmpresa").setValue(oSelectedObject.nome);
						}
					},
					
					onAfterHide: function (oEvent) {
						// Limpar campos do formulário após sair da página
						var idDiv = that.byId("paginaObjeto").getDomRef().id;
						
						$("#" + idDiv + " input").val("");
						
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
					var nome = this.byId("inputNomeEmpresa").getValue();
					
					this._modelEmpresasDados.push({
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