sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Validador",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, NodeAPI, Validador, Utils) {
		return BaseController.extend("ui5ns.ui5.controller.admin.Pais", {

			onTrocarAnoCompliance: function (oEvent) {
				var iAnoObrigacaoCompliance = this.getModel().getProperty("/objeto/anoObrigacaoCompliance") ? Math.abs(this.getModel().getProperty(
					"/objeto/anoObrigacaoCompliance")) : 0;
				this.getModel().setProperty("/objeto/anoObrigacaoCompliance", iAnoObrigacaoCompliance);
			},

			onTrocarAnoBeps: function (oEvent) {
				var iAnoObrigacaoBeps = this.getModel().getProperty("/objeto/anoObrigacaoBeps") ? Math.abs(this.getModel().getProperty(
					"/objeto/anoObrigacaoBeps")) : 0;
				this.getModel().setProperty("/objeto/anoObrigacaoBeps", iAnoObrigacaoBeps);
			},

			/* Métodos a implementar */
			_validarFormulario: function () {

				var sIdFormulario = "#" + this.byId("formularioObjeto").getDomRef().id;

				var oValidacao = Validador.validarFormularioAdmin({
					aInputObrigatorio: jQuery(sIdFormulario + " input[aria-required=true]"),
					aDropdownObrigatorio: [
						this.byId("comboboxtPais"),
						this.byId("selectRegiao"),
						this.byId("selectStatus")
						/*,
												this.byId("selectAliquotaVigente")*/
					]
				});

				if (!oValidacao.formularioValido) {
					sap.m.MessageBox.warning(oValidacao.mensagem, {
						title: "Aviso"
					});
				}

				return oValidacao.formularioValido;
			},

			_resolverHistoricoAliquota: function (callback) {
				callback();
				/*
				// @pedsf - Codigo comentado em 13/03/19.
				// Histórico de alíquota já não é mais utilizado e estava causando erro ao atualizar pais sem aliquota.
				
				var that = this;

				var oHistoricoAtual = this.getModel().getProperty("/HistoricoAtual");
				var sIdAliquotaVigente = this.getModel().getProperty("/idAliquotaVigente");
				var sIdAliquotaNova = this.getModel().getProperty("/objeto/fkAliquota");

				// Se existe valor de alíquota vigente e ele é diferente da nova alíquota selecionada..
				if (sIdAliquotaVigente && sIdAliquotaVigente !== "0" && sIdAliquotaVigente !== sIdAliquotaNova) {
					// Atualiza o registro de histórico atual com a data fim de troca de alíquota
					NodeAPI.atualizarRegistro("HistoricoPaisAliquota", oHistoricoAtual.id_hs_pais_aliquota, {
						fkPais: this.getModel().getProperty("/idObjeto"),
						fkAliquota: sIdAliquotaVigente,
						dataInicio: oHistoricoAtual.data_inicio_rel,
						dataFim: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate()
					}, function (response) {
						// Caso a nova alíquota selecionada seja válida..
						if (sIdAliquotaNova && sIdAliquotaNova !== "0") {
							// Cria um registro de histórico para ela..
							NodeAPI.criarRegistro("HistoricoPaisAliquota", {
								fkPais: that.getModel().getProperty("/idObjeto"),
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
					NodeAPI.criarRegistro("HistoricoPaisAliquota", {
						fkPais: this.getModel().getProperty("/idObjeto"),
						fkAliquota: sIdAliquotaNova,
						dataInicio: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate()
					}, function (resp) {
						callback();
					});
				} else {
					// Para todos os outros casos a alíquota não foi alterada
					callback();
				}*/
			},

			_carregarObjetos: function (oParam) {
				var that = this;
				this.setBusy(this.byId("tabelaObjetos"), true);
				that.getModel().setProperty("/objetos", null);

				/*this.byId("easyFilter").loadFrom()
					.then(function (res) {
						for (var i = 0, length = res[0].length; i < length; i++) {
							res[0][i]["nomePais"] = Utils.traduzDominioPais(res[0][i]["fkDominioPais"], that);
						}
						that.getModel().setProperty("/EasyFilterPais", Utils.orderByArrayParaBox(res[0], "nomePais"));
						
						for (var i = 0, length = res[1].length; i < length; i++) {
							res[1][i]["status"] = Utils.traduzStatusTiposPais(res[1][i]["id_dominio_pais_status"], that);
						}
						that.getModel().setProperty("/EasyFilterStatus", Utils.orderByArrayParaBox(res[1], "status"));
						
						that.getModel().setProperty("/EasyFilterNameTax", Utils.orderByArrayParaBox(res[2], "nome"));
					})
					.catch(function (err) {
						console.log(err);
					});*/
					
				this._montarFiltro(oParam.manterFiltro);

				NodeAPI.listarRegistros("DeepQuery/Pais", function (response) {
					var aResponse = response;
					for (var i = 0, length = aResponse.length; i < length; i++) {
						aResponse[i]["descricaoStatus"] = Utils.traduzStatusTiposPais(aResponse[i]["fkDominioPaisStatus"], that);
						aResponse[i]["nomePais"] = Utils.traduzDominioPais(aResponse[i]["fkDominioPais"], that);
						aResponse[i]["valorAliquota"] = aResponse[i]["valorAliquota"] ? Number(aResponse[i]["valorAliquota"]).toFixed(2) + "%" : that.getResourceBundle()
							.getText("viewPaisAdminNenhumaAliquotaVigente");
					}
					that.getModel().setProperty("/objetos", aResponse);
					that.setBusy(that.byId("tabelaObjetos"), false);
					/*that.byId("easyFilter").clear();*/
				});
			},
			
			_montarFiltro: function (bManterFiltro){
				var that = this;
				if (!bManterFiltro) {
					Utils.criarDialogFiltro("tabelaObjetos", [{
						text: this.getResourceBundle().getText("viewGeralPais"),
						applyTo: 'id',
						items: {
							loadFrom: 'DeepQuery/Pais',
							path: '/EasyFilterPais',
							text: 'nomePais',
							key: 'id'
						}
					}, {
						text: this.getResourceBundle().getText("viewGeralStatus"),
						applyTo: 'fkDominioPaisStatus',
						items: {
							loadFrom: 'DominioPaisStatus',
							path: '/EasyFilterStatus',
							text: 'status',
							key: 'id_dominio_pais_status'
						}
					}, {
						text: this.getResourceBundle().getText("viewGeralNomeT"),
						applyTo: 'fkAliquota',
						items: {
							loadFrom: 'Aliquota',
							path: '/EasyFilterNameTax',
							text: 'nome',
							key: 'id_aliquota'
						}
					}], this, function (params) {
						console.log(params);
					});
				}
					this._loadFrom().then((function (res) {
						for (var i = 0, length = res[0].length; i < length; i++) {
							res[0][i]["nomePais"] = Utils.traduzDominioPais(res[0][i]["fkDominioPais"], that);
						}
						that.getModel().setProperty("/EasyFilterPais", Utils.orderByArrayParaBox(res[0], "nomePais"));
						
						for (var i = 0, length = res[1].length; i < length; i++) {
							res[1][i]["status"] = Utils.traduzStatusTiposPais(res[1][i]["id_dominio_pais_status"], that);
						}
						that.getModel().setProperty("/EasyFilterStatus", Utils.orderByArrayParaBox(res[1], "status"));
						
						that.getModel().setProperty("/EasyFilterNameTax", Utils.orderByArrayParaBox(res[2], "nome"));
					}));
			},
			
			onFiltrarPaises: function () {
               this._filterDialog.open();             
           },

			_carregarCamposFormulario: function () {
				var that = this;

				NodeAPI.listarRegistros("DominioPais", function (response) {
					response.unshift({
						id: null,
						nome: ""
					});
					var aPais = response;
					for (var i = 0, length = aPais.length; i < length; i++) {
						aPais[i]["pais"] = Utils.traduzDominioPais(aPais[i]["id_dominio_pais"], that);
					}
					that.getModel().setProperty("/DominioPais", Utils.orderByArrayParaBox(aPais, "pais"));
				});

				NodeAPI.listarRegistros("DominioPaisStatus", function (response) {
					response.unshift({});
					//response.unshift({ id: null, descricao: "" });					
					var aResponse = response;
					for (var i = 0, length = aResponse.length; i < length; i++) {
						aResponse[i]["status"] = Utils.traduzStatusTiposPais(aResponse[i]["id_dominio_pais_status"], that);
					}
					that.getModel().setProperty("/DominioPaisStatus", Utils.orderByArrayParaBox(aResponse, "status"));
					//that.getModel().setProperty("/DominioPaisStatus", response);
				});

				NodeAPI.listarRegistros("DominioPaisRegiao", function (response) {
					response.unshift({
						id: null,
						descricao: ""
					});
					var aResponseRegiao = response;
					for (var i = 0, length = aResponseRegiao.length; i < length; i++) {
						aResponseRegiao[i]["regiao"] = Utils.traduzPaisRegiao(aResponseRegiao[i]["id_dominio_pais_regiao"], that);
					}
					that.getModel().setProperty("/DominioPaisRegiao", Utils.orderByArrayParaBox(aResponseRegiao, "regiao"));
				});

				NodeAPI.listarRegistros("Aliquota?tipo=pais", function (response) {
					response.unshift({
						id: null,
						descricao: ""
					});
					that.getModel().setProperty("/Aliquotas", response);
				});
			},

			_carregarObjetoSelecionado: function (iIdObjeto) {
				var that = this;
				that.getModel().setProperty("/showHistoricoAliquotas", false);

				that.setBusy(that.byId("paginaObjeto"), true);
				// Carrega o objeto com o id selecionado
				NodeAPI.lerRegistro("Pais", iIdObjeto, function (response) {
					var oPais = response;

					var obj = {
						id: oPais["id"],
						idDominioPais: oPais["fk_dominio_pais.id_dominio_pais"],
						idStatus: oPais["fk_dominio_pais_status.id_dominio_pais_status"],
						idRegiao: oPais["fk_dominio_pais_regiao.id_dominio_pais_regiao"],
						prescricaoPrejuizo: oPais["prescricao_prejuizo"],
						limiteUtilizacaoPrejuizo: oPais["limite_utilizacao_prejuizo"],
						prescricaoCredito: oPais["prescricao_credito"],
						fkAliquota: oPais["fk_aliquota.id_aliquota"],
						indExtensaoCompliance: oPais["ind_extensao_compliance"],
						indExtensaoComplianceFlag: oPais["ind_extensao_compliance"] ? true : false,
						indExtensaoBeps: oPais["ind_extensao_beps"],
						indExtensaoBepsFlag: oPais["ind_extensao_beps"] ? true : false,
						anoObrigacaoCompliance: oPais.ano_obrigacao_compliance,
						anoObrigacaoBeps: oPais.ano_obrigacao_beps
					};

					that.getModel().setProperty("/objeto", obj);
					that.getModel().setProperty("/idAliquotaVigente", obj.fkAliquota);

					that.setBusy(that.byId("paginaObjeto"), false);

					// Carrega o histórico de alíquotas desse país
					NodeAPI.listarRegistros("DeepQuery/HistoricoPaisAliquota/" + iIdObjeto + "&-1", function (resp) {
						if (resp && resp.length > 0) {
							that.getModel().setProperty("/objeto/historicoAliquotas", resp);

							// Se existe um registro de histórico para esse país que não possua data fim ele é o registro da alíquota vigente
							//var obj = resp.find(x => x.data_fim_rel === null);
							var historico = resp.find(function (x) {
								return x.data_fim_rel === null;
							});
							that.getModel().setProperty("/HistoricoAtual", historico);
						}
					});
				});
			},

			_limparFormulario: function () {
				this.getModel().setProperty("/objeto", {});
				this.getModel().setProperty("/HistoricoAtual", {});
				this.getModel().setProperty("/idAliquotaVigente", 0);
				this.getModel().setProperty("/showHistoricoAliquotas", false);
			},

			_atualizarObjeto: function () {
				var that = this;
				that.byId("btnCancelarP").setEnabled(false);
				that.byId("btnSalvarP").setEnabled(false);
				that.setBusy(that.byId("btnSalvarP"), true);

				var obj = this.getModel().getProperty("/objeto");
				var idObjeto = this.getModel().getProperty("/idObjeto");

				NodeAPI.atualizarRegistro("Pais", idObjeto, {
					prescricaoPrejuizo: obj.prescricaoPrejuizo,
					limitacaoUtilizacaoPrejuizo: obj.limiteUtilizacaoPrejuizo,
					prescricaoCredito: obj.prescricaoCredito,
					fkDomPais: obj.idDominioPais,
					fkDomPaisStatus: obj.idStatus,
					fkAliquota: obj.fkAliquota,
					fkDomPaisRegiao: obj.idRegiao,
					indExtensaoCompliance: obj.indExtensaoComplianceFlag ? true : false,
					indExtensaoBeps: obj.indExtensaoBepsFlag ? true : false,
					anoObrigacaoCompliance: obj.anoObrigacaoCompliance,
					anoObrigacaoBeps: obj.anoObrigacaoBeps
				}, function (response) {
					that._resolverHistoricoAliquota(function () {
						that.byId("btnCancelarP").setEnabled(true);
						that.byId("btnSalvarP").setEnabled(true);
						that.setBusy(that.byId("btnSalvarP"), false);
						that._navToPaginaListagem();
					});
				});
			},

			_inserirObjeto: function () {
				var that = this;
				that.byId("btnCancelarP").setEnabled(false);
				that.byId("btnSalvarP").setEnabled(false);
				that.setBusy(that.byId("btnSalvarP"), true);
				var obj = this.getModel().getProperty("/objeto");

				NodeAPI.criarRegistro("Pais", {
					prescricaoPrejuizo: obj.prescricaoPrejuizo,
					limitacaoUtilizacaoPrejuizo: obj.limiteUtilizacaoPrejuizo,
					prescricaoCredito: obj.prescricaoCredito,
					fkDomPais: obj.idDominioPais,
					fkDomPaisStatus: obj.idStatus,
					fkAliquota: obj.fkAliquota,
					fkDomPaisRegiao: obj.idRegiao,
					indExtensaoCompliance: obj.indExtensaoComplianceFlag ? true : false,
					indExtensaoBeps: obj.indExtensaoBepsFlag ? true : false,
					anoObrigacaoCompliance: obj.anoObrigacaoCompliance,
					anoObrigacaoBeps: obj.anoObrigacaoBeps
				}, function (response) {
					// Se foi selecionada uma alíquota válida na criação do país
					if (obj.fkAliquota && obj.fkAliquota > 0) {
						// Cria seu registro inicial de histórico
						NodeAPI.criarRegistro("HistoricoPaisAliquota", {
							fkPais: JSON.parse(response)[0].generated_id,
							fkAliquota: obj.fkAliquota,
							dataInicio: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate()
						}, function (resp) {
							that.byId("btnCancelarP").setEnabled(true);
							that.byId("btnSalvarP").setEnabled(true);
							that.setBusy(that.byId("btnSalvarP"), false);
							that._navToPaginaListagem();
						});
					} else {
						// Se não, apenas retorna
						that._navToPaginaListagem();
					}
				});
			},

			_navToPaginaListagem: function () {
				this.byId("myNav").to(this.byId("paginaListagem"), "flip", {
					manterFiltro: true
				});
			},

			/* Métodos fixos */
			onInit: function () {
				var that = this;

				var oModel = new sap.ui.model.json.JSONModel({
					objetos: [],
					DominioPais: [],
					DominioPaisStatus: [],
					DominioPaisRegiao: [],
					Aliquotas: [],
					objeto: {},
					idObjeto: 0,
					idAliquotaVigente: 0,
					isUpdate: false,
					showHistoricoAliquotas: false
				});

				oModel.setSizeLimit(300);

				that.setModel(oModel);

				this.byId("paginaListagem").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarObjetos(oEvent && oEvent.data ? oEvent.data : {});
					}
				});

				this.byId("paginaObjeto").addEventDelegate({
					onAfterShow: function (oEvent) {
						that._carregarCamposFormulario();

						if (oEvent.data.path) {
							that.getModel().setProperty("/isUpdate", true);
							that.getModel().setProperty("/idObjeto", that.getModel().getObject(oEvent.data.path).id);

							that._carregarObjetoSelecionado(that.getModel().getObject(oEvent.data.path).id);
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