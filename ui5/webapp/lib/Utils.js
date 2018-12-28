sap.ui.define(
	[
		"ui5ns/ui5/lib/Validador"
		
	],
	function (Validador) {
		return {
			stringMoedaParaFloat: function (sMoeda) {
				var fConversao = 0.00;
				if (sMoeda) {
					var sTemporario = sMoeda.replace(/\./g, "").replace(/,/g, ".");
					if (Validador.isNumber(sTemporario)) {
						fConversao = parseFloat(sTemporario);
					}
				}
				return fConversao;
			},
			
			formataData: function (sData){
				var fDataNoPadrao = "";
				var lingua = sap.ui.getCore().getConfiguration().getLanguage();
				switch(lingua){
					case "pt-BR":
						if (sData){
							fDataNoPadrao = sData.getDate().toString().padStart(2,"0") + "/" +(sData.getMonth() +1).toString().padStart(2,"0") + "/" + sData.getFullYear().toString() ;
						}						
						break;
					case "en-US":
						if (sData){
							fDataNoPadrao = (sData.getMonth() +1).toString().padStart(2,"0") + "/" + sData.getDate().toString().padStart(2,"0") + "/" + sData.getFullYear().toString() ;
						}										
						break;
				}

				return fDataNoPadrao;
			},
			
			dateNowParaBanco: function (){
				var Data = new Date();
				var fDataNoPadrao =  Data.getDate().toString().padStart(2,"0") + "/" +(Data.getMonth() +1).toString().padStart(2,"0") + "/" + Data.getFullYear().toString();
				return fDataNoPadrao;
			},

			stringDataDoBancoParaStringDDMMYYYY: function (dataString){
				//PASSAR DIRETO DO BANCO NO FORMATO "yyyy-MM-dd"
				var lingua = sap.ui.getCore().getConfiguration().getLanguage();
				var DataFinal = "";
				switch(lingua){
					case "pt-BR":
						DataFinal = dataString.substring(8,10)+"/"+dataString.substring(5,7)+"/"+dataString.substring(4,0);
						break;
					case "en-US":	
						DataFinal = dataString.substring(5,7)+"/"+dataString.substring(8,10)+"/"+dataString.substring(4,0);
						break;
				}
				return DataFinal;
			},
			
			
			stringDatacomBarraParaBanco: function (dataString){
				var DataFinal = "";
				if(dataString){
					DataFinal = dataString.substring(6,10)+"-"+dataString.substring(3,5)+"-"+dataString.substring(0,2);
				}
				return DataFinal;
			},
			
			bancoParaJsDate: function (dataString){
				//PASSAR DIRETO DO BANCO NO FORMATO "yyyy-MM-dd"
				var DataFinal = null;
				if(dataString){
					DataFinal = new Date(dataString.substring(0,4),dataString.substring(5,7)-1,dataString.substring(8,10));					
				}

				return DataFinal;
			},
			
			displayFormat: function (that){
				var lingua = sap.ui.getCore().getConfiguration().getLanguage();
				var formatFull = "";
				var formatSemAno = "";
				switch (lingua){
					case "pt-BR":
						formatFull = "dd/MM/yyyy";
						formatSemAno = "dd/MM";
						break;
					case "en-US":
						formatFull = "MM/dd/yyyy";
						formatSemAno = "MM/dd";
						break;
				}
				that.getModel().setProperty("/displayFormatFull", formatFull);
				that.getModel().setProperty("/displayFormatSemAno", formatSemAno);
			},
			
			traduzStatusTiposPais: function (id,that){
				
				var traducao = "";
				switch (id){
					case 1:
						traducao = that.getResourceBundle().getText("viewPaisTipo1");
						break;
					case 2:
						traducao = that.getResourceBundle().getText("viewPaisTipo2");
						break;
					case 3:
						traducao = that.getResourceBundle().getText("viewPaisTipo3");
						break;
					case 4:
						traducao = that.getResourceBundle().getText("viewPaisTipo4");
						break;
				}
				return traducao;
			},
			traduzJurisdicao: function (id,that){
				
				var traducao = "";
				switch (id){
					case 1:
						traducao = that.getResourceBundle().getText("viewGeralFederal");
						break;
					case 2:
						traducao = that.getResourceBundle().getText("viewGeralState");
						break;
					case 3:
						traducao = that.getResourceBundle().getText("viewGeralCity");
						break;
				}
				return traducao;
			},		
			traduzTipoTransacao: function (id,that){
				
				var traducao = "";
				switch (id){
				
					case 1:
						traducao = that.getResourceBundle().getText("viewGeralCashInstallmentSettlement");
						break;
					case 2:
						traducao = that.getResourceBundle().getText("viewGeralCashRefundReimbursementNegativeValue");
						break;
					case 3:
						traducao = that.getResourceBundle().getText("viewGeralPaymentWithIncomeTaxCredits");
						break;
					case 4:
						traducao = that.getResourceBundle().getText("viewGeralPaymentWithOtherTaxCredits");
						break;
					case 5:
						traducao = that.getResourceBundle().getText("viewGeralOtherSpecify");
						break;
				}
				return traducao;
			},	
			traduzEmpresaStatusTipo: function (id,that){
				
				var traducao = "";
				switch (id){
				
					case 1:
						traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo1");
						break;
					case 2:
						traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo2");
						break;
					case 3:
						traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo3");
						break;
					case 4:
						traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo4");
						break;
					case 5:
						traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo5");
						break;
					case 6:
						traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo6");
						break;
					case 7:
						traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo7");
						break;
					case 8:
						traducao = that.getResourceBundle().getText("viewEmpresaStatusTipo8");
						break;						
				}
				return traducao;
			},	

			traduzEmpresatraducao: function (id,that){
				
				var traducao = "";
				switch (id){
					case 1:
						traducao = that.getResourceBundle().getText("viewEmpresatraducaoTipo1");
						break;
					case 2:
						traducao = that.getResourceBundle().getText("viewEmpresatraducaoTipo2");
						break;
					case 3:
						traducao = that.getResourceBundle().getText("viewEmpresatraducaoTipo3");
						break;
					case 4:
						traducao = that.getResourceBundle().getText("viewEmpresatraducaoTipo4");
						break;
				}
				return traducao;
			},	
			
			traduzEmpresaTipoSocietario: function (id,that){
				
				var traducao = "";
				switch (id){
					case 1:
						traducao = that.getResourceBundle().getText("viewEmpresaTipoSocietarioTipo1");
						break;
					case 2:
						traducao = that.getResourceBundle().getText("viewEmpresaTipoSocietarioTipo2");
						break;
					case 3:
						traducao = that.getResourceBundle().getText("viewEmpresaTipoSocietarioTipo3");
						break;
					case 4:
						traducao = that.getResourceBundle().getText("viewEmpresaTipoSocietarioTipo4");
						break;
				}
				return traducao;
			},		

			traduzObrigacaoPeriodo: function (id, that){

				var traducao = "";
				switch (id){
					case 1:
						traducao = that.getResourceBundle().getText("viewGeralSemanal");
						break;
					case 2:
						traducao = that.getResourceBundle().getText("viewGeralQuinzenal");
						break;
					case 3:
						traducao = that.getResourceBundle().getText("viewGeralMensal");
						break;
					case 4:
						traducao = that.getResourceBundle().getText("viewGeralBimestral");
						break;						
					case 5:
						traducao = that.getResourceBundle().getText("viewGeralTrimestral");
						break;
					case 6:
						traducao = that.getResourceBundle().getText("viewGeralSemestral");
						break;
					case 7:
						traducao = that.getResourceBundle().getText("viewGeralAnual");
						break;
				}
				return traducao;
			},

			traduzStatusObrigacao: function (id, that){

				var traducao = "";
				switch (id){
					case 1:
						traducao = that.getResourceBundle().getText("viewGeralPending");
						break;
					case 2:
						traducao = that.getResourceBundle().getText("viewGeralActive");
						break;
					case 3:
						traducao = that.getResourceBundle().getText("viewGeralExcluded");
						break;
					case 4:
						traducao = that.getResourceBundle().getText("viewGeralNotStarted");
						break;						
					case 5:
						traducao = that.getResourceBundle().getText("viewGeralDelayed");
						break;
					case 6:
						traducao = that.getResourceBundle().getText("viewGeralDeliveredOnTime");
						break;
					case 7:
						traducao = that.getResourceBundle().getText("viewGeralDeliveredAfterDeadline");
						break;
				}
				return traducao;
			},
			
			traduzPeriodo: function (id, that){

				var traducao = "";
				switch (id){
					case "Weekly":
						traducao = that.getResourceBundle().getText("viewGeralSemanal");
						break;
					case "Biweekly":
						traducao = that.getResourceBundle().getText("viewGeralQuinzenal");
						break;
					case "Quarterly":
						traducao = that.getResourceBundle().getText("viewGeralTrimestral");
						break;
					case "Monthly":
						traducao = that.getResourceBundle().getText("viewGeralMensal");
						break;
					case "Biannual":
						traducao = that.getResourceBundle().getText("viewGeralSemestral");
						break;
					case "Annual":
						traducao = that.getResourceBundle().getText("viewGeralAnual");
						break;
					case "Bimonthly":
						traducao = that.getResourceBundle().getText("viewGeralBimestral");
						break;						
				}
				return traducao;
			},	
			
			traduzTiposAliquota: function (id, that){

				var traducao = "";
				switch (id){
					case 1:
						traducao = that.getResourceBundle().getText("viewGeralPais");
						break;
					case 2:
						traducao = that.getResourceBundle().getText("viewGeralEmpresa");
						break;
				}
				return traducao;
			},		
			
			traduzPaisRegiao: function (id, that){

				var traducao = "";
				switch (id){
					case 1:
						traducao = that.getResourceBundle().getText("viewPaisRegiaoTipo1");
						break;
					case 2:
						traducao = that.getResourceBundle().getText("viewPaisRegiaoTipo2");
						break;
					case 3:
						traducao = that.getResourceBundle().getText("viewPaisRegiaoTipo3");
						break;
					case 4:
						traducao = that.getResourceBundle().getText("viewPaisRegiaoTipo4");
						break;
					case 5:
						traducao = that.getResourceBundle().getText("viewPaisRegiaoTipo5");
						break;
					case 6:
						traducao = that.getResourceBundle().getText("viewPaisRegiaoTipo6");
						break;
					case 7:
						traducao = that.getResourceBundle().getText("viewPaisRegiaoTipo7");
						break;						
				}
				return traducao;
			},
			
			dateNowParaArquivo: function (){
				var Data = new Date();
				var fDataNoPadrao =  Data.getDate().toString().padStart(2,"0") + "_" +(Data.getMonth() +1).toString().padStart(2,"0") + "_" + Data.getFullYear().toString();
				return fDataNoPadrao;
			}			
		};
	}
	
);