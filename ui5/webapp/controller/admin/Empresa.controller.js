sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, NodeAPI, Validador, Utils) {
		jQuery.sap.require("sap.m.MessageBox");

		return BaseController.extend("ui5ns.ui5.controller.admin.Empresa", {

			/* Métodos a implementar */
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
				NodeAPI.listarRegistros("DeepQuery/Empresa", function (response) {

					var aResponse = response;
					for (var i = 0, length = aResponse.length; i < length; i++) {
						aResponse[i]["status"] = Utils.traduzEmpresaStatusTipo(aResponse[i]["id_dominio_empresa_status"], that);
					}
					that.getModel().setProperty("/objetos", aResponse);

					that.setBusy(that.byId("tabelaObjetos"), false);
				});

				NodeAPI.listarRegistros("DeepQuery/DominioAnoCalendario", function (response) {
					that.getModel().setProperty("/DominioAnoCalendario", response);
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
					that.getModel().setProperty("/idAliquotaVigente", response["fk_aliquota.id_aliquota"]);

					that.setBusy(that.byId("formularioObjeto"), false);

					var pais = that.getModel().getProperty("/objeto/fk_pais.id_pais");
					NodeAPI.listarRegistros("DeepQuery/ModeloObrigacao?idRegistro=" + pais, function (res) {
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
				this.getModel().setProperty("/DominioEmpresaTipoSocietario", {});
				this.getModel().setProperty("/DominioEmpresaStatus", {});
				this.getModel().setProperty("/Pais", {});
				this.getModel().setProperty("/Aliquota", {});
				this.getModel().setProperty("/objeto", {});
				this.getModel().setProperty("/showHistorico", false);
				this.getModel().setProperty("/HistoricoAtual", {});
				this.getModel().setProperty("/idAliquotaVigente", 0);
				this.getModel().setProperty("/ModeloObrigacao", {});
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
						fkTipoSocietario: obj["fk_dominio_empresa_tipo_societario.id_dominio_empresa_tipo_societario"],
						fkStatus: obj["fk_dominio_empresa_status.id_dominio_empresa_status"],
						fkAliquota: obj["fk_aliquota.id_aliquota"],
						fkPais: obj["fk_pais.id_pais"]
							/*,
													obrigacoes: JSON.stringify(this._getSelecaoObrigacoes())*/
					}, function (response) {
						NodeAPI.listarRegistros("DeepQuery/RelModeloEmpresa?idEmpresaNaQualMeRelaciono=" + sIdObjeto, function (resp) {
							var aObrigacoesSelecionadas = that._getSelecaoObrigacoes(resp);
							var DmenosX = that.getModel().getProperty("/DmenosXAnos");
							var AnoCalendario = that.getModel().getProperty("/DominioAnoCalendario");

							for (var i = 0; i < aObrigacoesSelecionadas["inserir"].length; i++) {
								var oObrigacoesInserir = aObrigacoesSelecionadas["inserir"][i];
								NodeAPI.criarRegistro("RelModeloEmpresa", {
									fkIdModeloObrigacao: oObrigacoesInserir["tblModeloObrigacao.id_modelo"],
									fkIdEmpresa: sIdObjeto, //modelosObrigacao[k]["tblModeloObrigacao.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status"],
									prazoEntregaCustomizado: oObrigacoesInserir["data_selecionada"],
									indAtivo: true
								}, function (res) {
									/*var DmenosX = then.getModel().getProperty("/DmenosXAnos");
									var AnoCalendario = then.getModel().getProperty("/DominioAnoCalendario");*/
									for (var k = 0; k < AnoCalendario.length; k++) {
										var oAnoCalendario = AnoCalendario[k];
										NodeAPI.criarRegistro("RespostaObrigacao", {
											suporteContratado: null,
											suporteEspecificacao: null,
											suporteValor: null,
											dataExtensao: null,
											fkIdDominioMoeda: null,
											fkIdRelModeloEmpresa: JSON.parse(res)[0].generated_id,
											fkIdDominioObrigacaoStatusResposta: 4,
											fkIdDominioAnoFiscal: oAnoCalendario["id_dominio_ano_calendario"] - DmenosX[0]["anoObrigacaoCompliance"], //ALTERAR PARA AMARRACAO COM D-1 DE PAIS
											fkIdDominioAnoCalendario: oAnoCalendario["id_dominio_ano_calendario"],
											data_conclusao: null
										}, function (re) {});
									}
								});
							}
							for (var i = 0; i < aObrigacoesSelecionadas["desabilitar"].length; i++) {
								var oObrigacoesDesabilitar = aObrigacoesSelecionadas["desabilitar"][i];
								NodeAPI.atualizarRegistro("RelModeloEmpresa", oObrigacoesDesabilitar["idRelModeloEmpresa"], {
									fkIdModeloObrigacao: oObrigacoesDesabilitar["tblModeloObrigacao.id_modelo"],
									fkIdEmpresa: sIdObjeto, //modelosObrigacao[k]["tblModeloObrigacao.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status"],
									prazoEntregaCustomizado: oObrigacoesDesabilitar["data_selecionada"],
									indAtivo: false
								}, function (res) {});
							}
							for (var i = 0; i < aObrigacoesSelecionadas["habilitar"].length; i++) {
								var oObrigacoesHabilitar = aObrigacoesSelecionadas["habilitar"][i];
								NodeAPI.atualizarRegistro("RelModeloEmpresa", oObrigacoesHabilitar["idRelModeloEmpresa"], {
									fkIdModeloObrigacao: oObrigacoesHabilitar["tblModeloObrigacao.id_modelo"],
									fkIdEmpresa: sIdObjeto, //modelosObrigacao[k]["tblModeloObrigacao.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status"],
									prazoEntregaCustomizado: oObrigacoesHabilitar["data_selecionada"],
									indAtivo: true
								}, function (res) {});
							}
							for (var i = 0; i < aObrigacoesSelecionadas["atualizar"].length; i++) {
								var oObrigacoesAtualizar = aObrigacoesSelecionadas["atualizar"][i];
								NodeAPI.atualizarRegistro("RelModeloEmpresa", oObrigacoesAtualizar["idRelModeloEmpresa"], {
									fkIdModeloObrigacao: oObrigacoesAtualizar["tblModeloObrigacao.id_modelo"],
									fkIdEmpresa: sIdObjeto, //modelosObrigacao[k]["tblModeloObrigacao.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status"],
									prazoEntregaCustomizado: oObrigacoesAtualizar["data_selecionada"],
									indAtivo: oObrigacoesAtualizar["indAtivo"]
								}, function (res) {});
							}
						});

						that._resolverHistoricoAliquota(function () {
							that.byId("btnCancelar").setEnabled(true);
							that.byId("btnSalvar").setEnabled(true);
							that.setBusy(that.byId("btnSalvar"), false);
							that._navToPaginaListagem();
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
								NodeAPI.criarRegistro("RelModeloEmpresa", {
									fkIdModeloObrigacao: modelosObrigacao[k]["tblModeloObrigacao.id_modelo"],
									fkIdEmpresa: JSON.parse(response)[0].generated_id, //modelosObrigacao[k]["tblModeloObrigacao.fk_id_dominio_obrigacao_status.id_dominio_obrigacao_status"],
									prazoEntregaCustomizado: modelosObrigacao[k]["data_selecionada"],
									indAtivo: true
								}, function (res) {
									var DmenosX = then.getModel().getProperty("/DmenosXAnos");
									var AnoCalendario = then.getModel().getProperty("/DominioAnoCalendario");
									for (var i = 0; i < AnoCalendario.length; i++) {
										var oAnoCalendario = AnoCalendario[i];
										NodeAPI.criarRegistro("RespostaObrigacao", {
											suporteContratado: null,
											suporteEspecificacao: null,
											suporteValor: null,
											dataExtensao: null,
											fkIdDominioMoeda: null,
											fkIdRelModeloEmpresa: JSON.parse(res)[0].generated_id,
											fkIdDominioObrigacaoStatusResposta: 4,
											fkIdDominioAnoFiscal: oAnoCalendario["id_dominio_ano_calendario"] - DmenosX[0]["anoObrigacaoCompliance"], //ALTERAR PARA AMARRACAO COM D-1 DE PAIS
											fkIdDominioAnoCalendario: oAnoCalendario["id_dominio_ano_calendario"],
											data_conclusao: null
										}, function (re) {

										});
									}
								});
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
						return (x["tblRelModeloEmpresa.fk_id_modelo_obrigacao.id_modelo"] === oObrigacao["tblModeloObrigacao.id_modelo"] && !!x[
							"tblRelModeloEmpresa.ind_ativo"] === true);

					});

					if (aux) {
						oObrigacao.selecionadaInicialmente = true;
						oObrigacao.selecionada = true;
						oObrigacao.data_selecionada = aux["tblRelModeloEmpresa.prazo_entrega_customizado"];
					}
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