sap.ui.define(
	[
		"ui5ns/ui5/controller/BaseController",
		"ui5ns/ui5/lib/NodeAPI",
		"ui5ns/ui5/lib/Utils"
	],
	function (BaseController, NodeAPI, Utils) {
		"use strict";

		return BaseController.extend("ui5ns.ui5.controller.taxPackage.EdicaoTrimestre", {
			onInit: function () {
				//sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR");
				
				var oModel = new sap.ui.model.json.JSONModel({});
				oModel.setSizeLimit(300);

				this.setModel(oModel);
				this._zerarModel();
				
				this.getRouter().getRoute("taxPackageEdicaoTrimestre").attachPatternMatched(this._onRouteMatched, this);
			},

			_adicionarTaxaMultipla: function (sProperty, sFkTipo) {
				this.getModel().getProperty(sProperty).unshift({
					descricao: null,
					valor: 0,
					"fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla": sFkTipo
				});

				this.getModel().refresh();
			},

			_excluirTaxaMultipla: function (oEvent, sProperty) {
				var aTaxaMultipla = this.getModel().getProperty(sProperty);
				var oExcluir = oEvent.getSource().getBindingContext().getObject();

				for (var i = 0, length = aTaxaMultipla.length; i < length; i++) {
					if (aTaxaMultipla[i] === oExcluir) {
						aTaxaMultipla.splice(i, 1);
						break;
					}
				}

				this.getModel().refresh();
			},

			_dialogTaxaMultipla: function (sTitulo, sProperty, sFkTipo, isNegativo) {
				var oScrollContainer = new sap.m.ScrollContainer({
					horizontal: true,
					vertical: true,
					height: "330px"
				}).addStyleClass("sapUiNoContentPadding");

				/* Criação da tabela de inserção */
				var oTable = new sap.m.Table();

				/* Toolbar com título da tabela e botão de nova taxa */
				var oToolbar = new sap.m.Toolbar();

				oToolbar.addContent(new sap.m.ObjectIdentifier({
					title: sTitulo
				}));

				oToolbar.addContent(new sap.m.ToolbarSpacer());

				oToolbar.addContent(new sap.m.Button({
					text: "Nova",
					icon: "sap-icon://add",
					type: "Emphasized"
				}).attachPress(oTable, function () {
					this._adicionarTaxaMultipla(sProperty, sFkTipo);
				}, this));

				oTable.setHeaderToolbar(oToolbar);

				/* Colunas da tabela */
				oTable.addColumn(new sap.m.Column({
					width: "50px"
				}));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle"
				}).setHeader(new sap.m.Text({
					text: "Descrição"
				})));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle"
				}).setHeader(new sap.m.Text({
					text: "Valor"
				})));

				/* Template das células */
				var oBtnExcluir = new sap.m.Button({
					icon: "sap-icon://delete",
					type: "Reject"
				}).attachPress(oTable, function (oEvent2) {
					this._excluirTaxaMultipla(oEvent2, sProperty);
				}, this);

				var oInputDescricao = new sap.m.Input({
					value: "{descricao}"
				});

				var oInputValor = new sap.m.Input({
					type: "Number",
					value: "{valor}"
				}).attachChange(function (oEvent) {
					if (isNegativo) {
						oEvent.getSource().setValue(Math.abs(oEvent.getSource().getValue()) * -1);
					}
				});

				var oTemplate = new sap.m.ColumnListItem({
					cells: [oBtnExcluir, oInputDescricao, oInputValor]
				});

				oTable.bindItems({
					path: sProperty,
					template: oTemplate
				});

				oScrollContainer.addContent(oTable);

				var that = this;

				/* Criação do diálogo com base na tabela */
				var dialog = new sap.m.Dialog({
					contentWidth: "500px",
					showHeader: false,
					type: "Message",
					content: oScrollContainer,
					beginButton: new sap.m.Button({
						text: "Fechar",
						press: function () {
							dialog.close();
							that.onAplicarRegras();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				this.getView().addDependent(dialog);

				dialog.open();
			},

			onEditarOtherTaxes: function (oEvent) {
				this._dialogTaxaMultipla("Other Taxes", "/OtherTaxes", 1);
			},

			onEditarIncentivosFiscais: function (oEvent) {
				this._dialogTaxaMultipla("Incentivos Fiscais", "/IncentivosFiscais", 2, true);
			},

			onEditarWHT: function (oEvent) {
				this._dialogTaxaMultipla("WHT", "/WHT", 3, true);
			},

			onEditarAntecipacoes: function (oEvent) {
				/* Criação do scroll container */
				var oScrollContainer = new sap.m.ScrollContainer({
					horizontal: true,
					vertical: true,
					height: "400px"
				}).addStyleClass("sapUiNoContentPadding");

				/* Criação do painel com os valores declarados do TTC */
				var oPanelTTC = new sap.m.Panel({
					expandable: true,
					expanded: false,
					headerText: "Valores declarados no TTC",
					width: "auto"
				}).addStyleClass("sapUiResponsiveMargin sapUiNoContentPadding");

				/* Scroll Container da tabela do TTC que pode ser mt grande */
				var oScrollContainerTTC = new sap.m.ScrollContainer({
					horizontal: true
				}).addStyleClass("sapUiNoContentPadding");

				/* Criação da tabela de inserção */
				var oTable = new sap.m.Table();

				/* Colunas da tabela */
				oTable.addColumn(new sap.m.Column({
					width: "50px"
				}));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle",
					width: "150px"
				}).setHeader(new sap.m.Text({
					text: "Name of Tax"
				})));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle",
					width: "150px"
				}).setHeader(new sap.m.Text({
					text: "Data do Pagamento"
				})));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle",
					width: "150px"
				}).setHeader(new sap.m.Text({
					text: "Moeda"
				})));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle",
					width: "150px"
				}).setHeader(new sap.m.Text({
					text: "Principal"
				})));

				/* Template das células */
				var oCheckBox = new sap.m.CheckBox({
					selected: "{selecionado}"
				});

				var oTextNameOfTax = new sap.m.Text({
					text: "{name_of_tax}"
				});

				var oTextDataPagamento = new sap.m.Text({
					text: "{data_pagamento}"
				});

				var oTextAcronimo = new sap.m.Text({
					text: "{acronimo}"
				});

				var oTextPrincipal = new sap.m.Text({
					text: "{principal}"
				});

				var oTemplate = new sap.m.ColumnListItem({
					cells: [oCheckBox, oTextNameOfTax, oTextDataPagamento, oTextAcronimo, oTextPrincipal /*, oTextJuros, oTextMulta, oTextValor*/ ]
				});

				oTable.bindItems({
					path: "/PagamentosTTC",
					template: oTemplate
				});

				oPanelTTC.addContent(oTable);

				/* Criação do painel com os outros pagamentos declarados */
				var oPanelOutros = new sap.m.Panel({
					expandable: true,
					expanded: false,
					headerText: "Outros pagamentos",
					width: "auto"
				}).addStyleClass("sapUiResponsiveMargin sapUiNoContentPadding");

				/* Criação da tabela de inserção */
				oTable = new sap.m.Table();

				/* Toolbar com título da tabela e botão de nova taxa */
				var oToolbar = new sap.m.Toolbar();

				oToolbar.addContent(new sap.m.Button({
					text: "Nova",
					icon: "sap-icon://add",
					type: "Emphasized"
				}).attachPress(oTable, function () {
					this._adicionarTaxaMultipla("/OutrasAntecipacoes", 4);
				}, this));

				oTable.setHeaderToolbar(oToolbar);

				/* Colunas da tabela */
				oTable.addColumn(new sap.m.Column({
					width: "50px"
				}));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle"
				}).setHeader(new sap.m.Text({
					text: "Descrição"
				})));

				oTable.addColumn(new sap.m.Column({
					vAlign: "Middle"
				}).setHeader(new sap.m.Text({
					text: "Valor"
				})));

				/* Template das células */
				var oBtnExcluir = new sap.m.Button({
					icon: "sap-icon://delete",
					type: "Reject"
				}).attachPress(oTable, function (oEvent2) {
					this._excluirTaxaMultipla(oEvent2, "/OutrasAntecipacoes");
				}, this);

				var oInputDescricao = new sap.m.Input({
					value: "{descricao}"
				});

				var oInputValor = new sap.m.Input({
					type: "Number",
					value: "{valor}"
				}).attachChange(function (oEvent2) {
					oEvent2.getSource().setValue(Math.abs(oEvent2.getSource().getValue()) * -1);
				});

				oTemplate = new sap.m.ColumnListItem({
					cells: [oBtnExcluir, oInputDescricao, oInputValor]
				});

				oTable.bindItems({
					path: "/OutrasAntecipacoes",
					template: oTemplate
				});

				oScrollContainerTTC.addContent(oTable);
				oPanelOutros.addContent(oScrollContainerTTC);

				/* Adiciona os paineis ao container de rolagem */
				oScrollContainer.addContent(oPanelTTC);
				oScrollContainer.addContent(oPanelOutros);

				var that = this;

				/* Criação do diálogo com base na tabela */
				var dialog = new sap.m.Dialog({
					contentWidth: "700px",
					showHeader: false,
					type: "Message",
					content: oScrollContainer,
					beginButton: new sap.m.Button({
						text: "Fechar",
						press: function () {
							dialog.close();
							that.onAplicarRegras();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				}).addStyleClass("sapUiNoContentPadding");

				this.getView().addDependent(dialog);

				dialog.open();
			},

			onAplicarRegras: function (oEvent) {
				this._onAplicarFormulasRC();
				this._onCalcularTotalDiferenca();
				this._onCalcularTotalTaxasMultiplas();
				this._onCalcularTotalAntecipacoes();
				this._onAplicarFormulasRF();
				this._onAplicarFormulasIT();
				this._onAplicarFormulasSchedule();
				this._onCalcularTotalSchedule();
				this.getModel().refresh();
			},

			_onAplicarFormulasRC: function () {
				//var oResultadoContabil = oEvent.getSource().getBindingContext().getObject();
				if (this.getModel().getProperty("/TaxReconciliation")) {
					var oResultadoContabil = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
						return obj.ind_ativo === true;
					});

					var fValor1 = oResultadoContabil.rc_statutory_gaap_profit_loss_before_tax ? Number(oResultadoContabil.rc_statutory_gaap_profit_loss_before_tax) :
						0,
						fValor2 = oResultadoContabil.rc_current_income_tax_current_year ? Number(oResultadoContabil.rc_current_income_tax_current_year) :
						0,
						fValor3 = oResultadoContabil.rc_current_income_tax_previous_year ? Number(oResultadoContabil.rc_current_income_tax_previous_year) :
						0,
						fValor4 = oResultadoContabil.rc_deferred_income_tax ? Number(oResultadoContabil.rc_deferred_income_tax) : 0,
						fValor5 = oResultadoContabil.rc_non_recoverable_wht ? Number(oResultadoContabil.rc_non_recoverable_wht) : 0;

					oResultadoContabil.rc_statutory_provision_for_income_tax = fValor2 + fValor3 + fValor4 + fValor5;

					var fValor6 = oResultadoContabil.rc_statutory_provision_for_income_tax ? oResultadoContabil.rc_statutory_provision_for_income_tax :
						0;

					oResultadoContabil.rc_statutory_gaap_profit_loss_after_tax = fValor1 - fValor6;
				}
			},

			_onAplicarFormulasRF: function () {
				if (this.getModel().getProperty("/TaxReconciliation")) {
					var oResultadoFiscal = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
						return obj.ind_ativo === true;
					});

					var fValor1 = oResultadoFiscal.rc_statutory_gaap_profit_loss_before_tax ? Number(oResultadoFiscal.rc_statutory_gaap_profit_loss_before_tax) :
						0,
						fTotalDiferencaPermanente = this.getModel().getProperty("/TotalDiferencaPermanente") ? Number(this.getModel().getProperty(
							"/TotalDiferencaPermanente")) : 0,
						fTotalDiferencaTemporaria = this.getModel().getProperty("/TotalDiferencaTemporaria") ? Number(this.getModel().getProperty(
							"/TotalDiferencaTemporaria")) : 0;

					oResultadoFiscal.rf_taxable_income_loss_before_losses_and_tax_credits = fValor1 + fTotalDiferencaPermanente +
						fTotalDiferencaTemporaria;

					oResultadoFiscal.rf_total_losses_utilized = (oResultadoFiscal.rf_total_losses_utilized ? Math.abs(Number(oResultadoFiscal.rf_total_losses_utilized)) :
						0) * -1;

					oResultadoFiscal.rf_taxable_income_loss_after_losses = oResultadoFiscal.rf_taxable_income_loss_before_losses_and_tax_credits +
						oResultadoFiscal.rf_total_losses_utilized;

					oResultadoFiscal.it_statutory_tax_rate_average = oResultadoFiscal.it_statutory_tax_rate_average ? Number(oResultadoFiscal.it_statutory_tax_rate_average) :
						0;
					if (oResultadoFiscal.rf_taxable_income_loss_after_losses > 0 && oResultadoFiscal.it_statutory_tax_rate_average > 0) {
						oResultadoFiscal.rf_income_tax_before_other_taxes_and_credits = oResultadoFiscal.rf_taxable_income_loss_after_losses * (
							oResultadoFiscal.it_statutory_tax_rate_average / 100);
					} else {
						oResultadoFiscal.rf_income_tax_before_other_taxes_and_credits = 0;
					}

					var fValor2 = oResultadoFiscal.rf_other_taxes ? Number(oResultadoFiscal.rf_other_taxes) : 0,
						fValor3 = oResultadoFiscal.rf_incentivos_fiscais ? Number(oResultadoFiscal.rf_incentivos_fiscais) : 0;

					oResultadoFiscal.rf_total_other_taxes_and_tax_credits = fValor2 + fValor3;

					oResultadoFiscal.rf_net_local_tax = (oResultadoFiscal.rf_total_other_taxes_and_tax_credits ? Number(oResultadoFiscal.rf_total_other_taxes_and_tax_credits) :
						0) + (oResultadoFiscal.rf_income_tax_before_other_taxes_and_credits ? Number(oResultadoFiscal.rf_income_tax_before_other_taxes_and_credits) :
						0);

					oResultadoFiscal.rf_overpayment_from_prior_year_applied_to_current_year = oResultadoFiscal.rf_overpayment_from_prior_year_applied_to_current_year ?
						Math.abs(oResultadoFiscal.rf_overpayment_from_prior_year_applied_to_current_year) * -1 : 0;

					var fRfNetLocalTax = oResultadoFiscal.rf_net_local_tax ? Number(oResultadoFiscal.rf_net_local_tax) : 0,
						fRfWHT = oResultadoFiscal.rf_wht ? Number(oResultadoFiscal.rf_wht) : 0,
						fRfOverpaymentFromPriorYearAppliedToCurrentYear = oResultadoFiscal.rf_overpayment_from_prior_year_applied_to_current_year ?
						Number(oResultadoFiscal.rf_overpayment_from_prior_year_applied_to_current_year) : 0,
						fRfTotalInterimTaxesPaymentsAntecipacoes = oResultadoFiscal.rf_total_interim_taxes_payments_antecipacoes ? Number(
							oResultadoFiscal.rf_total_interim_taxes_payments_antecipacoes) : 0;

					oResultadoFiscal.rf_tax_due_overpaid = fRfNetLocalTax + fRfWHT + fRfOverpaymentFromPriorYearAppliedToCurrentYear +
						fRfTotalInterimTaxesPaymentsAntecipacoes;
				}
			},

			_onAplicarFormulasIT: function () {
				if (this.getModel().getProperty("/TaxReconciliation")) {
					var oIncomeTax = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
						return obj.ind_ativo === true;
					});

					var fRcStatutoryProvisionForIncomeTax = oIncomeTax.rc_statutory_provision_for_income_tax ? Number(oIncomeTax.rc_statutory_provision_for_income_tax) :
						0,
						fValor2 = oIncomeTax.rf_income_tax_before_other_taxes_and_credits ? Number(oIncomeTax.rf_income_tax_before_other_taxes_and_credits) :
						0;

					oIncomeTax.it_income_tax_as_per_the_statutory_financials = fRcStatutoryProvisionForIncomeTax;
					oIncomeTax.it_income_tax_as_per_the_tax_return = fValor2;

					var fRcStatutoryGaapProfitLossBeforeTax = oIncomeTax.rc_statutory_gaap_profit_loss_before_tax ? Number(oIncomeTax.rc_statutory_gaap_profit_loss_before_tax) :
						0,
						fValor4 = oIncomeTax.rf_net_local_tax ? Number(oIncomeTax.rf_net_local_tax) : 0;

					if (fRcStatutoryGaapProfitLossBeforeTax !== 0) {
						oIncomeTax.it_effective_tax_rate_as_per_the_statutory_financials = Number(parseFloat(fRcStatutoryProvisionForIncomeTax /
							fRcStatutoryGaapProfitLossBeforeTax).toFixed(2)) * 100;
						oIncomeTax.it_effective_tax_rate_as_per_the_tax_return = Number(parseFloat(fValor4 / fRcStatutoryGaapProfitLossBeforeTax).toFixed(
							2)) * 100;
					} else {
						if (fRcStatutoryProvisionForIncomeTax > 0) {
							oIncomeTax.it_effective_tax_rate_as_per_the_statutory_financials = 100;
						}
						if (fValor4 > 0) {
							oIncomeTax.it_effective_tax_rate_as_per_the_tax_return = 100;
						}
					}

					var fValor5 = oIncomeTax.it_income_tax_as_per_the_statutory_financials,
						fValor6 = oIncomeTax.it_income_tax_as_per_the_tax_return;

					// Se os impostos forem iguais
					if (fValor5 === fValor6) {
						// Não pede detalhes
						this.byId("textAreaIncomeTaxDetails").setEnabled(false);
					}
					// Se qualquer um dos dois forem 0
					else if (fValor5 === 0 || fValor6 === 0) {
						// pede detalhes
						this.byId("textAreaIncomeTaxDetails").setEnabled(true);
					} else {
						var variacao = fValor5 / fValor6;

						// Se a variação entre eles for menor que 0
						if (variacao < 0) {
							// pede detalhes
							this.byId("textAreaIncomeTaxDetails").setEnabled(true);
						}
						// Se eles exibirem 20% de diferença para mais ou para menos
						else if (variacao >= 1.2 || variacao <= 0.8) {
							// pede detalhe
							this.byId("textAreaIncomeTaxDetails").setEnabled(true);
						}
						// Se não
						else {
							// não pede detalhe
							this.byId("textAreaIncomeTaxDetails").setEnabled(false);
						}
					}
				}
			},

			_onAplicarFormulasSchedule: function () {

				var oTaxReconciliation = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
					return obj.ind_ativo === true;
				});

				if (this.getModel().getProperty("/LossSchedule")) {
					// Loss Schedule
					var oLossSchedule = this.getModel().getProperty("/LossSchedule").find(function (obj) {
						return obj.ind_corrente === true;
					});

					if (oLossSchedule) {
						if (oTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits < 0) {
							oLossSchedule.current_year_value = oTaxReconciliation.rf_taxable_income_loss_before_losses_and_tax_credits;
						} else {
							oLossSchedule.current_year_value = 0;
						}

						oLossSchedule.current_year_value_utilized = oTaxReconciliation.rf_total_losses_utilized ? Number(oTaxReconciliation.rf_total_losses_utilized) :
							0;

						var valor1 = oLossSchedule.opening_balance ? Number(oLossSchedule.opening_balance) : 0,
							valor2 = oLossSchedule.current_year_value ? Number(oLossSchedule.current_year_value) : 0,
							valor3 = oLossSchedule.current_year_value_utilized ? Number(oLossSchedule.current_year_value_utilized) : 0,
							valor4 = oLossSchedule.adjustments ? Number(oLossSchedule.adjustments) : 0,
							valor5 = oLossSchedule.current_year_value_expired ? Number(oLossSchedule.current_year_value_expired) : 0;

						oLossSchedule.closing_balance = valor1 + valor2 + valor3 + valor4 + valor5;
					}

					for (var i = 0, length = this.getModel().getProperty("/LossSchedule").length; i < length; i++) {
						var oLossSchedule = this.getModel().getProperty("/LossSchedule")[i];

						oLossSchedule.justificativaEnabled = (oLossSchedule.ind_corrente && oLossSchedule.adjustments) ? true : false;
					}
				}

				// Credit Schedule
				if (this.getModel().getProperty("/CreditSchedule")) {
					var oCreditSchedule = this.getModel().getProperty("/CreditSchedule").find(function (obj) {
						return obj.ind_corrente === true;
					});

					if (oCreditSchedule) {
						if (oTaxReconciliation.rf_tax_due_overpaid < 0) {
							oCreditSchedule.current_year_value = Math.abs(oTaxReconciliation.rf_tax_due_overpaid);
						} else {
							oCreditSchedule.current_year_value = 0;
						}

						oCreditSchedule.current_year_value_utilized = oTaxReconciliation.rf_overpayment_from_prior_year_applied_to_current_year ? Number(
							oTaxReconciliation.rf_overpayment_from_prior_year_applied_to_current_year) : 0;

						var valor6 = oCreditSchedule.opening_balance ? Number(oCreditSchedule.opening_balance) : 0,
							valor7 = oCreditSchedule.current_year_value ? Number(oCreditSchedule.current_year_value) : 0,
							valor8 = oCreditSchedule.current_year_value_utilized ? Number(oCreditSchedule.current_year_value_utilized) : 0,
							valor9 = oCreditSchedule.adjustments ? Number(oCreditSchedule.adjustments) : 0,
							valor10 = oCreditSchedule.current_year_value_expired ? Number(oCreditSchedule.current_year_value_expired) : 0;

						oCreditSchedule.closing_balance = valor6 + valor7 + valor8 + valor9 + valor10;
					}

					for (var i = 0, length = this.getModel().getProperty("/CreditSchedule").length; i < length; i++) {
						var oCreditSchedule = this.getModel().getProperty("/CreditSchedule")[i];

						oCreditSchedule.justificativaEnabled = (oCreditSchedule.ind_corrente && oCreditSchedule.adjustments) ? true : false;
					}
				}
			},

			_onCalcularTotalDiferenca: function () {
				var sChaveProcurar = "",
					fTotalDiferencaPermanente = 0,
					fTotalDiferencaTemporaria = 0,
					iNumeroOrdemPeriodo = this.getModel().getProperty("/Periodo").numero_ordem;

				switch (true) {
				case iNumeroOrdemPeriodo === 1:
					sChaveProcurar = "valor1";
					break;
				case iNumeroOrdemPeriodo === 2:
					sChaveProcurar = "valor2";
					break;
				case iNumeroOrdemPeriodo === 3:
					sChaveProcurar = "valor3";
					break;
				case iNumeroOrdemPeriodo === 4:
					sChaveProcurar = "valor4";
					break;
				case iNumeroOrdemPeriodo === 5:
					sChaveProcurar = "valor5";
					break;
				case iNumeroOrdemPeriodo >= 6:
					sChaveProcurar = "valor6";
					break;
				}

				if (sChaveProcurar) {
					var aDiferencasPermanentes = this.getModel().getProperty("/DiferencasPermanentes"),
						aDiferencasTemporarias = this.getModel().getProperty("/DiferencasTemporarias");

					for (var i = 0, length = aDiferencasPermanentes.length; i < length; i++) {
						var oDiferencaPermanente = aDiferencasPermanentes[i],
							fValor = oDiferencaPermanente[sChaveProcurar] ? Number(oDiferencaPermanente[sChaveProcurar]) : 0;

						fTotalDiferencaPermanente += fValor;
					}

					for (var i = 0, length = aDiferencasTemporarias.length; i < length; i++) {
						var oDiferencaTemporaria = aDiferencasTemporarias[i],
							fValor = oDiferencaTemporaria[sChaveProcurar] ? Number(oDiferencaTemporaria[sChaveProcurar]) : 0;

						fTotalDiferencaTemporaria += fValor;
					}
				}

				this.getModel().setProperty("/TotalDiferencaPermanente", fTotalDiferencaPermanente);
				this.getModel().setProperty("/TotalDiferencaTemporaria", fTotalDiferencaTemporaria);
			},

			_onCalcularTotalSchedule: function () {
				if (this.getModel().getProperty("/LossSchedule") && this.getModel().getProperty("/LossSchedule").length > 0) {

					var aLossSchedule = this.getModel().getProperty("/LossSchedule"),
						length = this.getModel().getProperty("/LossSchedule").length;

					var fTotalOpeningBalance = 0;
					var fTotalCurrentYearValue = 0;
					var fTotalCurrentYearValueUtilized = 0;
					var fTotalAdjustments = 0;
					var fTotalCurrentYearValueExpired = 0;
					var fTotalClosingBalance = 0;

					for (var i = 0; i < length; i++) {
						var oLossSchedule = aLossSchedule[i];

						fTotalOpeningBalance += oLossSchedule.opening_balance ? Number(oLossSchedule.opening_balance) : 0;
						fTotalCurrentYearValue += oLossSchedule.current_year_value ? Number(oLossSchedule.current_year_value) : 0;
						fTotalCurrentYearValueUtilized += oLossSchedule.current_year_value_utilized ? Number(oLossSchedule.current_year_value_utilized) :
							0;
						fTotalAdjustments += oLossSchedule.adjustments ? Number(oLossSchedule.adjustments) : 0;
						fTotalCurrentYearValueExpired += oLossSchedule.current_year_value_expired ? Number(oLossSchedule.current_year_value_expired) : 0;
						fTotalClosingBalance += oLossSchedule.closing_balance ? Number(oLossSchedule.closing_balance) : 0;
					}

					this.getModel().setProperty("/TotalLossSchedule/opening_balance", fTotalOpeningBalance);
					this.getModel().setProperty("/TotalLossSchedule/current_year_value", fTotalCurrentYearValue);
					this.getModel().setProperty("/TotalLossSchedule/current_year_value_utilized", fTotalCurrentYearValueUtilized);
					this.getModel().setProperty("/TotalLossSchedule/adjustments", fTotalAdjustments);
					this.getModel().setProperty("/TotalLossSchedule/current_year_value_expired", fTotalCurrentYearValueExpired);
					this.getModel().setProperty("/TotalLossSchedule/closing_balance", fTotalClosingBalance);
				}

				if (this.getModel().getProperty("/CreditSchedule") && this.getModel().getProperty("/CreditSchedule").length > 0) {

					var aCreditSchedule = this.getModel().getProperty("/CreditSchedule"),
						length = this.getModel().getProperty("/CreditSchedule").length;

					var fTotalOpeningBalance = 0;
					var fTotalCurrentYearValue = 0;
					var fTotalCurrentYearValueUtilized = 0;
					var fTotalAdjustments = 0;
					var fTotalCurrentYearValueExpired = 0;
					var fTotalClosingBalance = 0;

					for (var i = 0; i < length; i++) {
						var oCreditSchedule = aCreditSchedule[i];

						fTotalOpeningBalance += oCreditSchedule.opening_balance ? Number(oCreditSchedule.opening_balance) : 0;
						fTotalCurrentYearValue += oCreditSchedule.current_year_value ? Number(oCreditSchedule.current_year_value) : 0;
						fTotalCurrentYearValueUtilized += oCreditSchedule.current_year_value_utilized ? Number(oCreditSchedule.current_year_value_utilized) :
							0;
						fTotalAdjustments += oCreditSchedule.adjustments ? Number(oCreditSchedule.adjustments) : 0;
						fTotalCurrentYearValueExpired += oCreditSchedule.current_year_value_expired ? Number(oCreditSchedule.current_year_value_expired) :
							0;
						fTotalClosingBalance += oCreditSchedule.closing_balance ? Number(oCreditSchedule.closing_balance) : 0;
					}

					this.getModel().setProperty("/TotalCreditSchedule/opening_balance", fTotalOpeningBalance);
					this.getModel().setProperty("/TotalCreditSchedule/current_year_value", fTotalCurrentYearValue);
					this.getModel().setProperty("/TotalCreditSchedule/current_year_value_utilized", fTotalCurrentYearValueUtilized);
					this.getModel().setProperty("/TotalCreditSchedule/adjustments", fTotalAdjustments);
					this.getModel().setProperty("/TotalCreditSchedule/current_year_value_expired", fTotalCurrentYearValueExpired);
					this.getModel().setProperty("/TotalCreditSchedule/closing_balance", fTotalClosingBalance);
				}
			},

			_onCalcularTotalTaxasMultiplas: function () {
				if (this.getModel().getProperty("/TaxReconciliation")) {
					var oTaxReconciliation = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
						return obj.ind_ativo === true;
					});

					if (oTaxReconciliation) {
						var iTotalOtherTax = this._onCalcularTotalTaxaMultipla("/OtherTaxes");
						var iTotalIncentivosFiscais = this._onCalcularTotalTaxaMultipla("/IncentivosFiscais");
						var iTotalWHT = this._onCalcularTotalTaxaMultipla("/WHT");

						oTaxReconciliation.rf_other_taxes = iTotalOtherTax;
						oTaxReconciliation.rf_incentivos_fiscais = iTotalIncentivosFiscais;
						oTaxReconciliation.rf_wht = iTotalWHT;
					}
				}
			},

			_onCalcularTotalTaxaMultipla: function (sProperty) {
				var aTaxaMultipla = this.getModel().getProperty(sProperty),
					iTotalTaxaMultipla = 0;

				if (aTaxaMultipla) {
					for (var i = 0, length = aTaxaMultipla.length; i < length; i++) {
						iTotalTaxaMultipla += (aTaxaMultipla[i].valor ? Number(aTaxaMultipla[i].valor) : 0);
					}
				}

				return iTotalTaxaMultipla;
			},

			_onCalcularTotalAntecipacoes: function () {
				if (this.getModel().getProperty("/TaxReconciliation")) {
					var oTaxReconciliation = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
						return obj.ind_ativo === true;
					});

					if (oTaxReconciliation) {
						var aAntecipacao = this.getModel().getProperty("/PagamentosTTC"),
							aOutrasAntecipacoes = this.getModel().getProperty("/OutrasAntecipacoes"),
							fTotalAntecipacao = 0;

						if (aAntecipacao) {
							for (var i = 0, length = aAntecipacao.length; i < length; i++) {
								fTotalAntecipacao += ((aAntecipacao[i].selecionado && aAntecipacao[i].principal) ? Math.abs(Number(aAntecipacao[i].principal)) *
									-1 : 0);
							}
						}

						if (aOutrasAntecipacoes) {
							for (var i = 0, length = aOutrasAntecipacoes.length; i < length; i++) {
								fTotalAntecipacao += (aOutrasAntecipacoes[i].valor ? Number(aOutrasAntecipacoes[i].valor) : 0);
							}
						}

						oTaxReconciliation.rf_total_interim_taxes_payments_antecipacoes = Math.abs(fTotalAntecipacao) * -1;
					}
				}
			},

			onNovaDiferencaPermanente: function (oEvent) {
				this.getModel().getProperty("/DiferencasPermanentes").unshift({
					"fk_diferenca_opcao.id_diferenca_opcao": null,
					"outro": null,
					"valor1": 0,
					"valor2": 0,
					"valor3": 0,
					"valor4": 0,
					"valor5": 0,
					"valor6": 0,
					"nova": true
				});
				this.getModel().refresh();
			},

			onExcluirPermanente: function (oEvent) {
				var oExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				this._onExcluirDiferenca(oExcluir, "/DiferencasPermanentes");
			},

			onNovaDiferencaTemporaria: function (oEvent) {
				this.getModel().getProperty("/DiferencasTemporarias").unshift({
					"fk_diferenca_opcao.id_diferenca_opcao": null,
					"outro": null,
					"valor1": 0,
					"valor2": 0,
					"valor3": 0,
					"valor4": 0,
					"valor5": 0,
					"valor6": 0,
					"nova": true
				});
				this.getModel().refresh();
			},

			onExcluirTemporaria: function (oEvent) {
				var oExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				this._onExcluirDiferenca(oExcluir, "/DiferencasTemporarias");
			},

			onNovaAdicao: function (oEvent) {
				var oNewObj = {
					idItem: 0,
					primeiroValor: 0,
					segundoValor: 0,
					terceiroValor: 0,
					quartoValor: 0
				};

				this.getModel().getProperty("/taxReconciliation/adicoesExclusoes/permanentDifferences/itens").unshift(oNewObj);
				this.getModel().refresh();
			},

			onExcluirAdicao: function (oEvent) {
				var oExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				this._onExcluirDiferenca(oExcluir, "/taxReconciliation/adicoesExclusoes/permanentDifferences/itens");
			},

			onNovaExclusao: function (oEvent) {
				var oNewObj = {
					idItem: 0,
					primeiroValor: 0,
					segundoValor: 0,
					terceiroValor: 0,
					quartoValor: 0
				};

				this.getModel().getProperty("/taxReconciliation/adicoesExclusoes/temporaryDifferences/itens").unshift(oNewObj);
				this.getModel().refresh();
			},

			onExcluirExclusao: function (oEvent) {
				var oExcluir = this.getModel().getObject(oEvent.getSource().getBindingContext().getPath());
				this._onExcluirDiferenca(oExcluir, "/taxReconciliation/adicoesExclusoes/temporaryDifferences/itens");
			},

			_onExcluirDiferenca: function (oExcluir, sProperty) {
				var that = this;

				jQuery.sap.require("sap.m.MessageBox");

				sap.m.MessageBox.confirm("Você tem certeza que deseja excluir esta linha?", {
					title: "Confirmação",
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							var aData = that.getModel().getProperty(sProperty);

							for (var i = 0; i < aData.length; i++) {
								var obj = aData[i];

								if (oExcluir === obj) {
									aData.splice(i, 1);
									break;
								}
							}

							that.getModel().setProperty(sProperty, aData);
							that.onAplicarRegras();
						}
					}
				});
			},

			onSalvarFechar: function (oEvent) {
				var that = this;

				this._salvar(oEvent, function (response) {
					if (response.success) {
						that._navToResumoTrimestre();
					} else {
						sap.m.MessageToast.show("Erro ao salvar");
					}
				});
			},

			onSalvar: function (oEvent) {
				var that = this;
				this._salvar(oEvent, function (response) {
					if (response.success) {
						sap.m.MessageToast.show("Salvo com sucesso");
						that._atualizarDados();
					} else {
						sap.m.MessageToast.show("Erro ao salvar");
					}
				});
			},

			onCancelar: function (oEvent) {
				var that = this;
				this._confirmarCancelamento(function () {
					that._navToResumoTrimestre();
				});
			},

			_initItemsToReport: function (sIdRelTaxPackagePeriodo) {
				var that = this;

				this.byId("containerItemsToReport2").removeAllContent();
				this.setBusy(this.byId("containerItemsToReport2"), true);

				var oModel = [];

				NodeAPI.listarRegistros("ItemToReport", function (response) {
					if (response) {
						var oItemToReport, oHBox, oRadioButton, oMultiComboBox, oTextArea, oVBox = new sap.m.VBox();

						for (var i = 0, length = response.length; i < length; i++) {
							var obj = {},
								oVBoxInterno = new sap.m.VBox().addStyleClass("bordered sapUiLargeMarginBottom sapUiContentPadding");

							oItemToReport = response[i];
							obj.idItemToReport = oItemToReport.id_item_to_report;

							oHBox = new sap.m.HBox({
								alignItems: "Center"
							});
							oHBox.addItem(new sap.m.Text({
								text: oItemToReport.pergunta
							}).addStyleClass("negrito"));

							if (oItemToReport.flag_sim_nao) {

								oRadioButton = new sap.m.RadioButton({
									groupName: "group" + i,
									text: that.getResourceBundle().getText("viewGeralSim")
								});
								obj.idRadioButtonSim = oRadioButton.getId();
								oHBox.addItem(oRadioButton);

								oRadioButton = new sap.m.RadioButton({
									groupName: "group" + i,
									text: that.getResourceBundle().getText("viewGeralNao"),
									selected: true
								});
								obj.idRadioButtonNao = oRadioButton.getId();
								oHBox.addItem(oRadioButton);
							}

							oVBoxInterno.addItem(oHBox);

							if (oItemToReport.flag_ano) {
								oMultiComboBox = new sap.m.MultiComboBox({
										width: "50%"
									})
									.bindItems({
										templateShareable: false,
										path: "/DominioAnoFiscal",
										template: new sap.ui.core.ListItem({
											key: "{id_dominio_ano_fiscal}",
											text: "{ano_fiscal}"
										})
									});
								obj.idMultiComboBox = oMultiComboBox.getId();
								oVBoxInterno.addItem(oMultiComboBox);
							}

							var oPainelHistorico = new sap.m.Panel({
								expandable: true,
								expanded: false,
								headerText: that.getResourceBundle().getText("viewTaxPackageEdicaoTrimestreHistoricoItemToReport")
							}).addStyleClass("sapUiNoContentPadding sapUiSmallMarginBottom");
							var oList = new sap.m.List();
							oPainelHistorico.addContent(oList);
							obj.idPainelHistorico = oList.getId();
							oVBoxInterno.addItem(oPainelHistorico);

							oTextArea = new sap.m.TextArea({
								width: "100%",
								rows: 5
							});
							obj.idTextArea = oTextArea.getId();
							oVBoxInterno.addItem(oTextArea);

							oVBox.addItem(oVBoxInterno);

							oModel.push(obj);
						}

						that.byId("containerItemsToReport2").addContent(oVBox);
						that.getModel().setProperty("/ComponentesItemToReport", oModel);

						that._carregarDadosItemToReport(sIdRelTaxPackagePeriodo);
					}

					that.setBusy(that.byId("containerItemsToReport2"), false);
				});
			},

			_carregarDadosItemToReport: function (sIdRelTaxPackagePeriodo) {
				var that = this,
					aComponenteItemToReport = this.getModel().getProperty("/ComponentesItemToReport");

				NodeAPI.listarRegistros("RespostaItemToReport?relTaxPackagePeriodo=" + sIdRelTaxPackagePeriodo, function (response) {
					if (response) {
						for (var i = 0, length = response.length; i < length; i++) {
							var oRespostaItemToReport = response[i];

							var oComponenteItemToReport = aComponenteItemToReport.find(function (obj) {
								return oRespostaItemToReport["fk_item_to_report.id_item_to_report"] === obj.idItemToReport;
							});

							if (oComponenteItemToReport) {
								var sIdRadioButtonSim = oComponenteItemToReport.idRadioButtonSim,
									sIdRadioButtonNao = oComponenteItemToReport.idRadioButtonNao,
									sIdMultiComboBox = oComponenteItemToReport.idMultiComboBox,
									sIdTextArea = oComponenteItemToReport.idTextArea;

								if (sIdRadioButtonSim) {
									sap.ui.getCore().byId(sIdRadioButtonSim).setSelected(oRespostaItemToReport.ind_se_aplica ? true : false);
									sap.ui.getCore().byId(sIdRadioButtonNao).setSelected(oRespostaItemToReport.ind_se_aplica ? false : true);
								}

								if (sIdTextArea) {
									sap.ui.getCore().byId(sIdTextArea).setValue(oRespostaItemToReport.resposta);
								}

								oComponenteItemToReport.id_resposta_item_to_report = oRespostaItemToReport.id_resposta_item_to_report;

								if (sIdMultiComboBox) {
									that._carregarRelacionamentoRespostaItemToReportAnoFiscal(oRespostaItemToReport, sIdMultiComboBox);
								}
							}
						}
					}
				});

				var sIdEmpresa = this.getModel().getProperty("/Empresa").id_empresa,
					sIdAnoCalendario = this.getModel().getProperty("/AnoCalendario").idAnoCalendario,
					sNumeroOrdemPeriodo = this.getModel().getProperty("/Periodo").numero_ordem,
					sEntidade = "DeepQuery/RespostaItemToReport?historico=true&empresa=" + sIdEmpresa + "&anoCalendario=" + sIdAnoCalendario +
					"&numeroOrdem=" + sNumeroOrdemPeriodo;

				NodeAPI.pListarRegistros(sEntidade)
					.then(function (response) {
						if (response) {
							for (var i = 0, length = response.length; i < length; i++) {
								var oRespostaItemToReport = response[i];

								var oComponenteItemToReport = aComponenteItemToReport.find(function (obj) {
									return oRespostaItemToReport["fk_item_to_report.id_item_to_report"] === obj.idItemToReport;
								});

								if (oComponenteItemToReport) {
									if (oRespostaItemToReport.resposta) {
										var sIdPainelHistorico = oComponenteItemToReport.idPainelHistorico,
											sLabel;

										switch (oRespostaItemToReport.numero_ordem) {
										case 1:
											sLabel = "1º Período";
											break;
										case 2:
											sLabel = "2º Período";
											break;
										case 3:
											sLabel = "3º Período";
											break;
										case 4:
											sLabel = "4º Período";
											break;
										case 5:
											sLabel = "Anual";
											break;
										}

										var oCustomListItem = new sap.m.CustomListItem();
										var oVBox = new sap.m.VBox().addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginTopBottom");

										oVBox.addItem(new sap.m.Title({
											level: "H3",
											text: sLabel
										}));

										oVBox.addItem(new sap.m.Text({
											text: oRespostaItemToReport.resposta
										}));

										oCustomListItem.addContent(oVBox);

										sap.ui.getCore().byId(sIdPainelHistorico).addItem(oCustomListItem);
									}
								}
							}
						}
					});
			},

			_carregarRelacionamentoRespostaItemToReportAnoFiscal: function (oRespostaItemToReport, sIdMultiComboBox) {
				var sEntidade = "RelacionamentoRespostaItemToReportAnoFiscal?respostaItemToReport=" + oRespostaItemToReport.id_resposta_item_to_report,
					oMultiComboBox = sap.ui.getCore().byId(sIdMultiComboBox);

				NodeAPI.listarRegistros(sEntidade, function (response) {
					if (response) {
						var aIdAnoFiscal = [];

						for (var i = 0, length = response.length; i < length; i++) {
							aIdAnoFiscal.push(response[i]["fk_dominio_ano_fiscal.id_dominio_ano_fiscal"].toString());
						}

						oMultiComboBox.setSelectedKeys(aIdAnoFiscal);
					}
				});
			},

			_initTaxReconciliation: function () {
				var that = this;

				// Construção do resultado contabil
				var oResultadoContabil = {
					aTemplate: [{
						label: "1º Trimestre",
						isEditavel: true,
						propriedade: "primeiroValor"
					}, {
						label: "2º Trimestre",
						isEditavel: false,
						propriedade: "segundoValor"
					}, {
						label: "3º Trimestre",
						isEditavel: false,
						propriedade: "terceiroValor"
					}, {
						label: "4º Trimestre",
						isEditavel: false,
						propriedade: "quartoValor"
					}],
					aItems: [{
						campo: "Statutory GAAP Profit / (loss) before t",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Current Income Tax – Current Year",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Current Income Tax – Previous Year",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Deferred Income Tax",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Non-Recoverable WHT",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Statutory provision for income tax",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Statutory GAAP profit / (loss) after tax",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}]
				};

				this._montarTabelaTR(oResultadoContabil, "/taxReconciliation/resultadoContabil", "containerResultadoContabil2");

				// Construção das adições e exclusões
				var oAdicoes = {
					aTemplate: [{
						label: "1º Trimestre",
						isEditavel: true,
						propriedade: "primeiroValor"
					}, {
						label: "2º Trimestre",
						isEditavel: false,
						propriedade: "segundoValor"
					}, {
						label: "3º Trimestre",
						isEditavel: false,
						propriedade: "terceiroValor"
					}, {
						label: "4º Trimestre",
						isEditavel: false,
						propriedade: "quartoValor"
					}],
					aItems: [{
						idTipo: 2,
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}]
				};

				this._montarTabelaTR(oAdicoes, "/taxReconciliation/adicoesExclusoes/permanentDifferences/itens", "containerAdicoesExclusoes2", {
					titulo: "Permanent Differences",
					caminhoOpcoes: "/taxReconciliation/adicoesExclusoes/permanentDifferences/opcoes",
					onNova: that.onNovaAdicao,
					onExcluir: that.onExcluirAdicao
				});

				var oExclusoes = {
					aTemplate: [{
						label: "1º Trimestre",
						isEditavel: true,
						propriedade: "primeiroValor"
					}, {
						label: "2º Trimestre",
						isEditavel: false,
						propriedade: "segundoValor"
					}, {
						label: "3º Trimestre",
						isEditavel: false,
						propriedade: "terceiroValor"
					}, {
						label: "4º Trimestre",
						isEditavel: false,
						propriedade: "quartoValor"
					}],
					aItems: [{
						idTipo: 2,
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}]
				};

				this._montarTabelaTR(oExclusoes, "/taxReconciliation/adicoesExclusoes/temporaryDifferences/itens", "containerAdicoesExclusoes2", {
					titulo: "Temporary Differences",
					caminhoOpcoes: "/taxReconciliation/adicoesExclusoes/temporaryDifferences/opcoes",
					onNova: that.onNovaExclusao,
					onExcluir: that.onExcluirExclusao
				});

				// Construção do Resultado Fiscal
				var oResultadoFiscal = {
					aTemplate: [{
						label: "1º Trimestre",
						isEditavel: true,
						propriedade: "primeiroValor"
					}, {
						label: "2º Trimestre",
						isEditavel: false,
						propriedade: "segundoValor"
					}, {
						label: "3º Trimestre",
						isEditavel: false,
						propriedade: "terceiroValor"
					}, {
						label: "4º Trimestre",
						isEditavel: false,
						propriedade: "quartoValor"
					}],
					aItems: [{
						campo: "Taxable income / (loss) before losses and tax credits",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Total losses utilized",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Taxable income / (loss) after losses",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Income tax before other taxes and credits",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Other taxes",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Incentivos Fiscais",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Total other taxes and tax credits",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Net local tax",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "WHT",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Overpayment from prior year applied to current year",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Total interim taxes payments (antecipações)",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Tax due / (overpaid)",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}]
				};

				this._montarTabelaTR(oResultadoFiscal, "/taxReconciliation/resultadoFiscal", "containerResultadoFiscal2");

				// Construção do Income Tax
				var oIncomeTax = {
					aTemplate: [{
						label: "1º Trimestre",
						isEditavel: true,
						propriedade: "primeiroValor"
					}, {
						label: "2º Trimestre",
						isEditavel: false,
						propriedade: "segundoValor"
					}, {
						label: "3º Trimestre",
						isEditavel: false,
						propriedade: "terceiroValor"
					}, {
						label: "4º Trimestre",
						isEditavel: false,
						propriedade: "quartoValor"
					}],
					aItems: [{
						campo: "Income Tax – as per the statutory financials",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Income Tax – as per the tax return",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Jurisdiction tax rate – average",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Staturory tax rate – average",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Effective tax rate - as per the statutory financials",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}, {
						campo: "Effective tax rate - as per the tax return",
						primeiroValor: 0,
						segundoValor: 0,
						terceiroValor: 0,
						quartoValor: 0
					}]
				};

				this._montarTabelaTR(oIncomeTax, "/taxReconciliation/incomeTax", "containerIncomeTax2");

				var oVBox = new sap.m.VBox();

				oVBox.addItem(new sap.m.ObjectIdentifier({
					title: "Please provide details if Tax Return's Income differs from FS"
				}).addStyleClass("sapUiMediumMarginTop"));

				oVBox.addItem(new sap.m.TextArea({
					rows: 5,
					width: "100%"
				}));

				this.byId("containerIncomeTax2").addContent(oVBox);
			},

			_montarTabelaTR: function (oItems, sProperty, sIdContainer, oAdicaoExclusaoConfig) {
				/*var oResultadoContabil = {
					aTemplate: [
						{
							label: "1º Trimestre",
							isEditavel: true,
							propriedade: "primeiroValor"
						},
						{
							label: "2º Trimestre",
							isEditavel: false,
							propriedade: "segundoValor"
						},
						{
							label: "3º Trimestre",
							isEditavel: false,
							propriedade: "terceiroValor"
						},
						{
							label: "4º Trimestre",
							isEditavel: false,
							propriedade: "quartoValor"
						}
					],
					aItems: [
						{
							campo: "Statutory GAAP Profit / (loss) before yet",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Current Income Tax – Current Year",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Current Income Tax – Previous Year",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Deferred Income Tax",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Non-Recoverable WHT",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Statutory provision for income tax",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						},
						{
							campo: "Statutory GAAP profit / (loss) after tax",
							primeiroValor: 0,
							segundoValor: 0,
							terceiroValor: 0,
							quartoValor: 0
						}
					]
				};*/

				//this.getModel().setProperty("/taxReconciliation/resultadoContabil", oResultadoContabil.aItems);
				this.getModel().setProperty(sProperty, oItems.aItems);

				var oTable = new sap.m.Table().addStyleClass("bordered celulasSeparadas");
				var aCells = [];

				if (oAdicaoExclusaoConfig) {
					oTable.addStyleClass("sapUiSmallMarginBottom");

					var oToolbar = new sap.m.Toolbar();
					oToolbar.addContent(new sap.m.ObjectIdentifier({
						title: oAdicaoExclusaoConfig.titulo
					}));
					oToolbar.addContent(new sap.m.ToolbarSpacer());
					oToolbar.addContent(new sap.m.Button({
						text: "Nova",
						icon: "sap-icon://add",
						type: "Emphasized"
					}).attachPress(oTable, oAdicaoExclusaoConfig.onNova, this));
					// Adicionar onPress do botão
					oTable.setHeaderToolbar(oToolbar);

					// Coluna de exclusão da linha
					oTable.addColumn(new sap.m.Column({
						width: "50px"
					}));

					aCells.push(new sap.m.Button({
						icon: "sap-icon://delete",
						type: "Reject"
					}).attachPress(oTable, oAdicaoExclusaoConfig.onExcluir, this));

					// Coluna de tipo de diferença
					oTable.addColumn(new sap.m.Column({
						vAlign: "Middle"
					}).setHeader(new sap.m.Text({
						text: "Tipo"
					})));

					aCells.push(new sap.m.Select({
						selectedKey: "{idTipo}"
					}).bindItems({
						templateShareable: false,
						path: oAdicaoExclusaoConfig.caminhoOpcoes,
						template: new sap.ui.core.ListItem({
							key: "{id}",
							text: "{texto}"
						})
					}));

					// Coluna de outro caso usuário selecione "outras"
					oTable.addColumn(new sap.m.Column({
						vAlign: "Middle"
					}).setHeader(new sap.m.Text({
						text: "Outro"
					})));

					aCells.push(new sap.m.Input({
						value: ""
					}));
				} else {

					oTable.addColumn(new sap.m.Column({
						vAlign: "Middle"
					}).setHeader(new sap.m.Text({
						text: ""
					})));

					aCells.push(new sap.m.ObjectIdentifier({
						title: "{campo}"
					}));
				}

				var oTemplateColuna;

				for (var i = 0; i < oItems.aTemplate.length; i++) {
					oTemplateColuna = oItems.aTemplate[i];

					if (oTemplateColuna.isEditavel) {
						aCells.push(new sap.m.Input({
							type: "Number",
							value: "{" + oTemplateColuna.propriedade + "}"
						}));

						oTable.addColumn(new sap.m.Column().setHeader(new sap.m.Text({
							text: oTemplateColuna.label
						})));
					} else {
						aCells.push(new sap.m.Text({
							text: "{" + oTemplateColuna.propriedade + "}"
						}));

						oTable.addColumn(new sap.m.Column({
							vAlign: "Middle"
						}).setHeader(new sap.m.Text({
							text: oTemplateColuna.label
						})));
					}
				}

				var oTemplate = new sap.m.ColumnListItem({
					cells: aCells
				});

				oTable.bindItems({
					path: sProperty,
					template: oTemplate
				});

				this.byId(sIdContainer).addContent(oTable);
			},

			navToHome: function () {
				var that = this;
				this._confirmarCancelamento(function () {
					that.getRouter().navTo("selecaoModulo");
				});
			},

			navToPage2: function () {
				var that = this;
				this._confirmarCancelamento(function () {
					that.getRouter().navTo("taxPackageListagemEmpresas");
				});
			},

			navToPage3: function () {
				var that = this;
				this._confirmarCancelamento(function () {
					that._navToResumoTrimestre();
				});
			},

			_confirmarCancelamento: function (onConfirm) {
				var dialog = new sap.m.Dialog({
					title: "Confirmação",
					type: "Message",
					content: new sap.m.Text({
						text: "Você tem certeza que deseja cancelar a edição?"
					}),
					beginButton: new sap.m.Button({
						text: "Sim",
						press: function () {
							dialog.close();
							if (onConfirm) {
								onConfirm();
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
						dialog.destroy();
					}
				});

				dialog.open();
			},

			_onRouteMatched: function (oEvent) {
				this._zerarModel();

				var oParametros = JSON.parse(oEvent.getParameter("arguments").parametros);

				this.getModel().setProperty("/LabelDataInicio", Utils.stringDataDoBancoParaStringDDMMYYYY(oParametros.oEmpresa.fy_start_date));
				this.getModel().setProperty("/LabelDataFim", Utils.stringDataDoBancoParaStringDDMMYYYY(oParametros.oEmpresa.fy_end_date));
				this.getModel().setProperty("/LabelCITType", this._pegarLabelCITType(oParametros.oPeriodo.numero_ordem));
				this.getModel().setProperty("/LabelPeriodo", this._pegarLabelPeriodoTaxReconciliation(oParametros.oPeriodo.numero_ordem));
				this.getModel().setProperty("/Empresa", oParametros.oEmpresa);
				this.getModel().setProperty("/Periodo", oParametros.oPeriodo);
				this.getModel().setProperty("/AnoCalendario", oParametros.oAnoCalendario);

				this.getModel().setProperty("/TaxReconciliation/0/periodo", this._pegarLabelPeriodoTaxReconciliation(this.getModel().getProperty(
					"/Periodo") ? this.getModel().getProperty("/Periodo").numero_ordem : ""));
				this.getModel().setProperty("/TaxReconciliation/0/labelPeriodo", this._pegarLabelPeriodoTaxReconciliation(this.getModel().getProperty(
					"/Periodo") ? this.getModel().getProperty("/Periodo").numero_ordem : ""));

				var that = this;

				NodeAPI.listarRegistros("DominioMoeda", function (response) {
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/DominioMoeda", response);

						var oMoedaSelecionada = response.find(function (obj) {
							return obj.id_dominio_moeda === oParametros.oPeriodo["fk_dominio_moeda.id_dominio_moeda"];
						});

						if (oMoedaSelecionada) {
							that.getModel().setProperty("/LabelMoeda", oMoedaSelecionada.acronimo);
						}
					}
				});

				NodeAPI.listarRegistros("DiferencaOpcao?tipo=1", function (response) {
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/DiferencaOpcao/Permanente", response);
					}
				});

				NodeAPI.listarRegistros("DiferencaOpcao?tipo=2", function (response) {
					if (response) {
						response.unshift({});
						that.getModel().setProperty("/DiferencaOpcao/Temporaria", response);
					}
				});

				NodeAPI.listarRegistros("DominioAnoFiscal", function (response) {
					if (response) {
						that.getModel().setProperty("/DominioAnoFiscal", response);
					}
				});

				this._atualizarDados();
			},

			_atualizarDados: function () {
				var that = this,
					sIdRelTaxPackagePeriodo = this.getModel().getProperty("/Periodo").id_rel_tax_package_periodo;

				var oContainerTaxReconciliation = this.byId("containerTaxReconciliation");

				this.setBusy(oContainerTaxReconciliation, true);

				NodeAPI.listarRegistros("TaxPackage?idRelTaxPackagePeriodo=" + sIdRelTaxPackagePeriodo, function (response) {
					var sIdTaxReconciliation;

					if (response) {
						if (response.taxReconciliation) {
							var oTaxReconAtivo = response.taxReconciliation.find(function (obj) {
								return obj.ind_ativo;
							});
							oTaxReconAtivo.labelPeriodo = that._pegarLabelPeriodoTaxReconciliation(oTaxReconAtivo.numero_ordem);
							that.getModel().setProperty("/TaxReconciliation", response.taxReconciliation);
							that.getModel().setProperty("/IncomeTaxDetails", oTaxReconAtivo.it_details_if_tax_returns_income_differs_from_fs);
							that._carregarTaxasMultiplas(oTaxReconAtivo.id_tax_reconciliation);
							sIdTaxReconciliation = oTaxReconAtivo.id_tax_reconciliation;
						}
						that.getModel().setProperty("/DiferencasPermanentes", response.diferencaPermanente);
						that.getModel().setProperty("/DiferencasTemporarias", response.diferencaTemporaria);
						that.getModel().setProperty("/Moeda", response.moeda);

						that.onAplicarRegras();
					}

					that._carregarPagamentosTTC(sIdTaxReconciliation);
					that._carregarHistorico();
					that._carregarTaxRate();

					that.setBusy(oContainerTaxReconciliation, false);
				});

				this._carregarSchedule(1, "/LossSchedule", sIdRelTaxPackagePeriodo);
				this._carregarSchedule(2, "/CreditSchedule", sIdRelTaxPackagePeriodo);
				this._initItemsToReport(sIdRelTaxPackagePeriodo);
			},

			_pegarLabelCITType: function (iNumeroOrdem) {
				var sLabel;

				switch (true) {
				case iNumeroOrdem === 1: //sLabelBanco.includes("1"):
					sLabel = this.getResourceBundle().getText("viewEdiçãoTrimestreEstimativa");
					break;
				case iNumeroOrdem === 2: //sLabelBanco.includes("2"):
					sLabel = this.getResourceBundle().getText("viewEdiçãoTrimestreEstimativa");
					break;
				case iNumeroOrdem === 3: //sLabelBanco.includes("3"):
					sLabel = this.getResourceBundle().getText("viewEdiçãoTrimestreEstimativa");
					break;
				case iNumeroOrdem === 4: //sLabelBanco.includes("4"):
					sLabel = this.getResourceBundle().getText("viewEdiçãoTrimestreEstimativa");
					break;
				case iNumeroOrdem === 5: //sLabelBanco === "anual":
					sLabel = this.getResourceBundle().getText("viewGeralAnual");
					break;
				case iNumeroOrdem >= 6: //sLabelBanco === "retificadora":
					sLabel = this.getResourceBundle().getText("viewGeralRetificadora");
					break;
				}

				return sLabel;
			},

			_pegarLabelPeriodoTaxReconciliation: function (iNumeroOrdem) {
				var sLabelTraduzido;

				switch (true) {
				case iNumeroOrdem === 1: //sLabelBanco.includes("1"):
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo1");
					break;
				case iNumeroOrdem === 2: //sLabelBanco.includes("2"):
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo2");
					break;
				case iNumeroOrdem === 3: //sLabelBanco.includes("3"):
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo3");
					break;
				case iNumeroOrdem === 4: //sLabelBanco.includes("4"):
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo4");
					break;
				case iNumeroOrdem === 5: //sLabelBanco === "anual":
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo5");
					break;
				case iNumeroOrdem >= 6: //sLabelBanco === "retificadora":
					sLabelTraduzido = this.getResourceBundle().getText("viewGeralPeriodo6");
					break;
				}

				return sLabelTraduzido;
			},

			_carregarHistorico: function () {
				var that = this,
					sIdTaxPackage = this.getModel().getProperty("/Periodo").id_tax_package,
					sNumeroOrdem = this.getModel().getProperty("/Periodo").numero_ordem,
					sEntidade = "DeepQuery/TaxReconciliation?taxPackage=" + sIdTaxPackage + "&numeroOrdem=" + sNumeroOrdem + "&historico=true";

				NodeAPI.listarRegistros(sEntidade, function (response) {
					if (response) {
						for (var i = 0, length = response.length; i < length; i++) {
							response[i].ind_ativo = false;
							response[i].labelPeriodo = that._pegarLabelPeriodoTaxReconciliation(response[i].numero_ordem);
						}
						that.getModel().setProperty("/TaxReconciliation", that.getModel().getProperty("/TaxReconciliation").concat(response));
						that.getModel().refresh();
					}
				});
			},

			_carregarAntecipacoes: function (sIdTaxReconciliation) {
				var that = this;
				NodeAPI.listarRegistros("Antecipacao?taxReconciliation=" + sIdTaxReconciliation, function (response) {
					if (response) {
						var aPagamento = that.getModel().getProperty("/PagamentosTTC");

						for (var i = 0, length = response.length; i < length; i++) {
							var oAntecipacao = response[i];

							var oPagamento = aPagamento.find(function (obj) {
								return obj.id_pagamento === oAntecipacao["fk_pagamento.id_pagamento"];
							});

							if (oPagamento) {
								oPagamento.selecionado = true;
								oPagamento.id_antecipacao = oAntecipacao.id_antecipacao;
							}
						}

						that.onAplicarRegras();
					}
				});
			},

			_carregarPagamentosTTC: function (sIdTaxReconciliation) {
				var that = this,
					sIdEmpresa = this.getModel().getProperty("/Empresa").id_empresa;

				NodeAPI.listarRegistros("DeepQuery/Pagamento?full=true&empresa=" + sIdEmpresa, function (response) {
					if (response) {
						that.getModel().setProperty("/PagamentosTTC", response);

						if (sIdTaxReconciliation) {
							that._carregarAntecipacoes(sIdTaxReconciliation);
						}
					}
				});
			},

			_carregarTaxRate: function () {
				var that = this;

				var oTaxReconAtivo = that.getModel().getProperty("/TaxReconciliation").find(function (obj) {
					return obj.ind_ativo;
				});

				NodeAPI.listarRegistros("/DeepQuery/Pais/" + this.getModel().getProperty("/Empresa").id_pais, function (response) {
					if (response) {
						oTaxReconAtivo.it_jurisdiction_tax_rate_average = response[0].valorAliquota ? Number(response[0].valorAliquota) : 0;
						that.onAplicarRegras();
					}
				});

				NodeAPI.listarRegistros("/DeepQuery/Empresa/" + this.getModel().getProperty("/Empresa").id_empresa, function (response) {
					if (response) {
						oTaxReconAtivo.it_statutory_tax_rate_average = response[0].valor ? Number(response[0].valor) : 0;
						that.onAplicarRegras();
					}
				});
			},

			_salvar: function (oEvent, callback) {
				var that = this,
					oBtnPressionado = oEvent.getSource(),
					oBtnSalvarFechar = this.byId("btnSalvarFechar"),
					oBtnSalvar = this.byId("btnSalvar"),
					oBtnCancelar = this.byId("btnCancelar");

				oBtnSalvarFechar.setEnabled(false);
				oBtnSalvar.setEnabled(false);
				oBtnCancelar.setEnabled(false);

				this.setBusy(oBtnPressionado, true);

				this._inserir(function (response) {
					oBtnSalvarFechar.setEnabled(true);
					oBtnSalvar.setEnabled(true);
					oBtnCancelar.setEnabled(true);

					that.setBusy(oBtnPressionado, false);

					if (callback) {
						callback(JSON.parse(response));
					}
				});
			},

			_inserir: function (callback) {
				var sIdMoeda = this.getModel().getProperty("/Moeda");
				var sIncomeTaxDetails = this.getModel().getProperty("/IncomeTaxDetails");

				var oTaxReconciliation = this.getModel().getProperty("/TaxReconciliation").find(function (obj) {
					return obj.ind_ativo === true;
				});

				var aDiferencaPermanente = this.getModel().getProperty("/DiferencasPermanentes"),
					aDiferencaTemporaria = this.getModel().getProperty("/DiferencasTemporarias"),
					aRespostaItemToReport = this._formatarRespostaItemToReport(),
					aOtherTax = this.getModel().getProperty("/OtherTaxes"),
					aIncentivosFiscais = this.getModel().getProperty("/IncentivosFiscais"),
					aWHT = this.getModel().getProperty("/WHT"),
					aAntecipacao = this.getModel().getProperty("/PagamentosTTC"),
					aOutrasAntecipacoes = this.getModel().getProperty("/OutrasAntecipacoes");

				// @NOVO_SCHEDULE - comentar
				var oLossSchedule = this.getModel().getProperty("/LossSchedule").find(function (obj) {
						return obj.ind_corrente === true;
					}),
					oCreditSchedule = this.getModel().getProperty("/CreditSchedule").find(function (obj) {
						return obj.ind_corrente === true;
					});

				/*
				@NOVO_SCHEDULE - descomentar
				var aLossSchedule = this.getModel().getProperty("/LossSchedule"),
					aCreditSchedule = this.getModel().getProperty("/CreditSchedule");*/

				console.log("######## INSERIR ########");
				console.log("- Items To Report: ");
				console.table(aRespostaItemToReport);
				console.log("- Moeda TP: " + sIdMoeda);
				console.log("- Tax Reconciliation: \n");
				console.log("	-- Income Tax Details: \n" + sIncomeTaxDetails + "\n");
				console.log("   -- Detalhe Tax Reconciliation\n");
				console.table(oTaxReconciliation);
				console.log("   -- Diferenças Permanentes\n");
				console.table(aDiferencaPermanente);
				console.log("   -- Diferenças Temporárias\n");
				console.table(aDiferencaTemporaria);
				console.log("   -- Other Taxes\n");
				console.table(aOtherTax);
				console.log("   -- Incentivos Fiscais\n");
				console.table(aIncentivosFiscais);
				console.log("   -- WHT\n");
				console.table(aWHT);
				console.log("   -- Antecipações\n");
				console.table(aAntecipacao);
				console.log("   -- Outras Antecipações\n");
				console.table(aOutrasAntecipacoes);
				console.log("- Loss Schedule: ");
				console.table(oLossSchedule);
				console.log("- Credit Schedule: ");
				console.table(oCreditSchedule);

				var oTaxPackage = {
					empresa: this.getModel().getProperty("/Empresa"),
					periodo: this.getModel().getProperty("/Periodo"),
					anoCalendario: this.getModel().getProperty("/AnoCalendario"),
					moeda: this.getModel().getProperty("/Moeda"),
					taxReconciliationRcRfIt: this.getModel().getProperty("/TaxReconciliation"),
					incomeTaxDetails: this.getModel().getProperty("/IncomeTaxDetails"),
					diferencasPermanentes: aDiferencaPermanente,
					diferencasTemporarias: aDiferencaTemporaria,
					respostaItemToReport: aRespostaItemToReport,
					lossSchedule: oLossSchedule,
					creditSchedule: oCreditSchedule,
					otherTaxes: aOtherTax,
					incentivosFiscais: aIncentivosFiscais,
					wht: aWHT,
					antecipacoes: aAntecipacao,
					outrasAntecipacoes: aOutrasAntecipacoes
				};

				NodeAPI.criarRegistro("InserirTaxPackage", {
					taxPackage: JSON.stringify(oTaxPackage)
				}, function (response) {
					if (callback) {
						callback(response);
					}
				});
			},

			_formatarRespostaItemToReport: function () {
				var aComponenteItemToReport = this.getModel().getProperty("/ComponentesItemToReport");

				var aRespostaItemToReport = [];

				for (var i = 0, length = aComponenteItemToReport.length; i < length; i++) {
					var oComponenteItemToReport = aComponenteItemToReport[i],
						oRespostaItemToReport = {
							fkItemToReport: oComponenteItemToReport.idItemToReport
						};

					if (oComponenteItemToReport.idRadioButtonSim) {
						oRespostaItemToReport.ind_se_aplica = sap.ui.getCore().byId(oComponenteItemToReport.idRadioButtonSim).getSelected();
					}

					if (oComponenteItemToReport.idMultiComboBox) {
						oRespostaItemToReport.relAnoFiscal = sap.ui.getCore().byId(oComponenteItemToReport.idMultiComboBox).getSelectedKeys();
					}

					if (oComponenteItemToReport.idTextArea) {
						oRespostaItemToReport.resposta = sap.ui.getCore().byId(oComponenteItemToReport.idTextArea).getValue();
					}

					if (oComponenteItemToReport.id_resposta_item_to_report) {
						oRespostaItemToReport.id_resposta_item_to_report = oComponenteItemToReport.id_resposta_item_to_report;
					}

					aRespostaItemToReport.push(oRespostaItemToReport);
				}

				return aRespostaItemToReport;
			},

			_navToResumoTrimestre: function () {
				this._limparModel();

				var oParametros = {
					empresa: this.getModel().getProperty("/Empresa"),
					idAnoCalendario: this.getModel().getProperty("/AnoCalendario").idAnoCalendario
				};

				this.getRouter().navTo("taxPackageResumoTrimestre", {
					parametros: JSON.stringify(oParametros)
				});
			},

			_zerarModel: function () {
				this.getModel().setData({
					PagamentosTTC: [],
					OutrasAntecipacoes: [],
					OtherTaxes: [],
					IncentivosFiscais: [],
					WHT: [],
					TotalLossSchedule: {
						opening_balance: 0,
						current_year_value: 0,
						current_year_value_utilized: 0,
						adjustments: 0,
						current_year_value_expired: 0,
						closing_balance: 0,
					},
					LossSchedule: [],
					TotalCreditSchedule: {
						opening_balance: 0,
						current_year_value: 0,
						current_year_value_utilized: 0,
						adjustments: 0,
						current_year_value_expired: 0,
						closing_balance: 0,
					},
					CreditSchedule: [],
					DiferencaOpcao: {
						Permanente: [],
						Temporaria: []
					},
					DiferencasPermanentes: [],
					DiferencasTemporarias: [],
					TotalDiferencaPermanente: 0,
					TotalDiferencaTemporaria: 0,
					Moeda: null,
					TaxReconciliation: [{
						periodo: "X Trimestre",
						rc_statutory_gaap_profit_loss_before_tax: 0,
						rc_current_income_tax_current_year: 0,
						rc_current_income_tax_previous_year: 0,
						rc_deferred_income_tax: 0,
						rc_non_recoverable_wht: 0,
						rc_statutory_provision_for_income_tax: 0,
						rc_statutory_gaap_profit_loss_after_tax: 0,
						rf_taxable_income_loss_before_losses_and_tax_credits: 0,
						rf_total_losses_utilized: 0,
						rf_taxable_income_loss_after_losses: 0,
						rf_income_tax_before_other_taxes_and_credits: 0,
						rf_other_taxes: 0,
						rf_incentivos_fiscais: 0,
						rf_total_other_taxes_and_tax_credits: 0,
						rf_net_local_tax: 0,
						rf_wht: 0,
						rf_overpayment_from_prior_year_applied_to_current_year: 0,
						rf_total_interim_taxes_payments_antecipacoes: 0,
						rf_tax_due_overpaid: 0,
						it_income_tax_as_per_the_statutory_financials: 0,
						it_income_tax_as_per_the_tax_return: 0,
						it_jurisdiction_tax_rate_average: 0,
						it_statutory_tax_rate_average: 0,
						it_effective_tax_rate_as_per_the_statutory_financials: 0,
						it_effective_tax_rate_as_per_the_tax_return: 0,
						ind_ativo: true
					}],
					IncomeTaxDetails: null,
					lossSchedule: [{
						fiscalYear: 2017,
						yearOfExpiration: 2017,
						openingBalance: 0,
						currentYearLoss: 0,
						currentYearLossUtilized: 0,
						adjustments: 0,
						justificativa: "",
						currentYearLossExpired: 0,
						closingBalance: 0,
						obs: ""
					}],
					creditSchedule: [{
						fiscalYear: 2017,
						yearOfExpiration: 2017,
						openingBalance: 0,
						currentYearCredit: 0,
						currentYearCreditUtilized: 0,
						adjustments: 0,
						justificativa: "",
						currentYearCreditExpired: 0,
						closingBalance: 0,
						obs: ""
					}],
					opcoesAno: [{
						ano: 2018
					}, {
						ano: 2017
					}]
				});

				this.getModel().refresh();
			},

			_limparModel: function () {
				this.getModel().setProperty("/OtherTaxes", []);
				this.getModel().setProperty("/IncentivosFiscais", []);
				this.getModel().setProperty("/WHT", []);
				this.getModel().setProperty("/Moeda", null);
				this.getModel().setProperty("/TaxReconciliation", []);
				this.getModel().setProperty("/DiferencasPermanentes", []);
				this.getModel().setProperty("/DiferencasTemporarias", []);
				this.getModel().setProperty("/LossSchedule", []);
				this.getModel().setProperty("/CreditSchedule", []);
			},

			// @NOVO_SCHEDULE - comentar
			_carregarSchedule: function (sTipo, sProperty, sIdRelTaxPackagePeriodo) {
				var that = this;

				NodeAPI.listarRegistros("Schedule?tipo=" + sTipo + "&idRelTaxPackagePeriodo=" + sIdRelTaxPackagePeriodo, function (response) {
					if (response && response.length > 0) {
						for (var i = 0; i < response.length; i++) {
							response[i].ind_corrente = true;
						}
						
						that.getModel().setProperty(sProperty, response);
						that._carregarHistoricoSchedule(sProperty, sTipo);
						that.onAplicarRegras();
					} else {
						that._carregarScheduleInicial(sTipo, sProperty);
					}
				});
			},

			/*
			@NOVO_SCHEDULE - descomentar
			_carregarSchedule: function (sTipo, sProperty, sIdRelTaxPackagePeriodo) {
				var that = this,
					oAnoCalendario = this.getModel().getProperty("/AnoCalendario");

				NodeAPI.listarRegistros("DeepQuery/Schedule?tipo=" + sTipo + "&idRelTaxPackagePeriodo=" + sIdRelTaxPackagePeriodo, function (response) {
					if (response && response.length > 0) {
						var oScheduleCorrente = response.find(function (obj) { 
							return obj.ano_fiscal === Number(oAnoCalendario.anoCalendario);
						});
						
						if (oScheduleCorrente) oScheduleCorrente.ind_corrente = true;
						
						that.getModel().setProperty(sProperty, response);
						that.onAplicarRegras();
					} else {
						that._carregarScheduleInicial(sTipo, sProperty);
					}
				});
			},*/

			_carregarHistoricoSchedule: function (sProperty, sTipo) {
				var that = this,
					oEmpresa = this.getModel().getProperty("/Empresa"),
					oAnoCalendario = this.getModel().getProperty("/AnoCalendario");

				var oParam = {
					empresa: oEmpresa,
					anoCalendario: oAnoCalendario,
					tipo: sTipo // Loss Schedule
				};

				NodeAPI.pListarRegistros("HistoricoSchedule?parametros=" + JSON.stringify(oParam))
					.then(function (response) {
						that.getModel().setProperty(sProperty, that.getModel().getProperty(sProperty).concat(response));
						that.onAplicarRegras();
					});
			},

			// @NOVO_SCHEDULE - COMENTAR
			_carregarScheduleInicial: function (sTipo, sProperty) {
				var that = this,
					oEmpresa = this.getModel().getProperty("/Empresa"),
					oPeriodo = this.getModel().getProperty("/Periodo"),
					oAnoCalendario = this.getModel().getProperty("/AnoCalendario");

				var oParams = {
					empresa: oEmpresa,
					periodo: oPeriodo,
					anoCalendario: oAnoCalendario,
					tipo: sTipo // Loss Schedule
				};

				var sEntidade = "ScheduleParaNovoPeriodo?parametros=" + JSON.stringify(oParams);

				NodeAPI.listarRegistros(sEntidade, function (response) {
					if (response) {
						for (var i = 0; i < response.length; i++) {
							response[i].ind_corrente = true;
						}
						that.getModel().setProperty(sProperty, [response]);
						that._carregarHistoricoSchedule(sProperty, sTipo);
						that.onAplicarRegras();
					}
				});
			},

			/*
			@NOVO_SCHEDULE - descomentar
			_carregarScheduleInicial: function (sTipo, sProperty) {
				var that = this,
					oEmpresa = this.getModel().getProperty("/Empresa"),
					oPeriodo = this.getModel().getProperty("/Periodo"),
					oAnoCalendario = this.getModel().getProperty("/AnoCalendario");

				var oParams = {
					empresa: oEmpresa,
					periodo: oPeriodo,
					anoCalendario: oAnoCalendario,
					tipo: sTipo // Loss Schedule
				};

				var sEntidade = "ScheduleParaNovoPeriodo?parametros=" + JSON.stringify(oParams);

				NodeAPI.listarRegistros(sEntidade, function (response) {
					if (response) {
						that.getModel().setProperty(sProperty, response);
						that.onAplicarRegras();
					}
				});
			},*/

			_carregarTaxasMultiplas: function (sIdTaxReconciliation) {
				var that = this;

				NodeAPI.listarRegistros("/TaxaMultipla?taxReconciliation=" + sIdTaxReconciliation, function (response) {
					if (response) {

						var aOtherTax = response.filter(function (obj) {
							return obj["fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla"] === 1;
						});

						var aIncentivoFiscal = response.filter(function (obj) {
							return obj["fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla"] === 2;
						});

						var aWHT = response.filter(function (obj) {
							return obj["fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla"] === 3;
						});

						var aOutrasAntecipacoes = response.filter(function (obj) {
							return obj["fk_dominio_tipo_taxa_multipla.id_dominio_tipo_taxa_multipla"] === 4;
						});

						that.getModel().setProperty("/OtherTaxes", aOtherTax);
						that.getModel().setProperty("/IncentivosFiscais", aIncentivoFiscal);
						that.getModel().setProperty("/WHT", aWHT);
						that.getModel().setProperty("/OutrasAntecipacoes", aOutrasAntecipacoes);

						that.onAplicarRegras();
					}
				});
			}
		});
	}
);