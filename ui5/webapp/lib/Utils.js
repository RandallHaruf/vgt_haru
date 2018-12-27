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
				if (sData){
					fDataNoPadrao = sData.getDate().toString().padStart(2,"0") + "/" +(sData.getMonth() +1).toString().padStart(2,"0") + "/" + sData.getFullYear().toString() ;
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
				var DataFinal = dataString.substring(8,10)+"/"+dataString.substring(5,7)+"/"+dataString.substring(4,0);
				return DataFinal;
			},
			
			
			stringDatacomBarraParaBanco: function (dataString){
				var DataFinal = "";
				if(dataString){
					DataFinal = dataString.substring(6,10)+"-"+dataString.substring(3,5)+"-"+dataString.substring(0,2);
				}
				return DataFinal;
			},
			
			formatData: function (data,that){
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
			},
			bancoParaJsDate: function (dataString){
				//PASSAR DIRETO DO BANCO NO FORMATO "yyyy-MM-dd"
				var DataFinal = new Date(dataString.substring(0,4),dataString.substring(5,7)-1,dataString.substring(8,10));
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
			
			traduzStatusTiposPais: function (intPaisTipoStatus,that){
				var tiposPaisTraduzido = "";
				switch (intPaisTipoStatus){
					case 1:
						tiposPaisTraduzido = that.getResourceBundle().getText("viewPaisTipo1");
						break;
					case 2:
						tiposPaisTraduzido = that.getResourceBundle().getText("viewPaisTipo2");
						break;
					case 3:
						tiposPaisTraduzido = that.getResourceBundle().getText("viewPaisTipo3");
						break;
					case 4:
						tiposPaisTraduzido = that.getResourceBundle().getText("viewPaisTipo4");
						break;
				}
				return tiposPaisTraduzido;
			},
			
			traduzEmpresaStatusTipo: function (intEmpresaStatusTipo,that){
				var tipoEmpresaStatus = "";
				switch (intEmpresaStatusTipo){
				
					case 1:
						tipoEmpresaStatus = that.getResourceBundle().getText("viewEmpresaStatusTipo1");
						break;
					case 2:
						tipoEmpresaStatus = that.getResourceBundle().getText("viewEmpresaStatusTipo2");
						break;
					case 3:
						tipoEmpresaStatus = that.getResourceBundle().getText("viewEmpresaStatusTipo3");
						break;
					case 4:
						tipoEmpresaStatus = that.getResourceBundle().getText("viewEmpresaStatusTipo4");
						break;
					case 5:
						tipoEmpresaStatus = that.getResourceBundle().getText("viewEmpresaStatusTipo5");
						break;
					case 6:
						tipoEmpresaStatus = that.getResourceBundle().getText("viewEmpresaStatusTipo6");
						break;
					case 7:
						tipoEmpresaStatus = that.getResourceBundle().getText("viewEmpresaStatusTipo7");
						break;
					case 8:
						tipoEmpresaStatus = that.getResourceBundle().getText("viewEmpresaStatusTipo8");
						break;						
				}
				return tipoEmpresaStatus;
			},	
			
			traduzEmpresaTipoSocietario: function (intTipoSocietario,that){
				var tipoSocietario = "";
				switch (intTipoSocietario){
					case 1:
						tipoSocietario = that.getResourceBundle().getText("viewEmpresaTipoSocietarioTipo1");
						break;
					case 2:
						tipoSocietario = that.getResourceBundle().getText("viewEmpresaTipoSocietarioTipo2");
						break;
					case 3:
						tipoSocietario = that.getResourceBundle().getText("viewEmpresaTipoSocietarioTipo3");
						break;
					case 4:
						tipoSocietario = that.getResourceBundle().getText("viewEmpresaTipoSocietarioTipo4");
						break;
				}
				return tipoSocietario;
			},		

			traduzObrigacaoPeriodo: function (intObrigacaoPeriodo, that){
				/*Recebe valores
				Semanal, Quinzenal,Trimestral,Mensal,Semestral,Anual
				*/
				
				var periodoTraduzido = "";
				switch (intObrigacaoPeriodo){
					case 1:
						periodoTraduzido = that.getResourceBundle().getText("viewGeralSemanal");
						break;
					case 2:
						periodoTraduzido = that.getResourceBundle().getText("viewGeralQuinzenal");
						break;
					case 3:
						periodoTraduzido = that.getResourceBundle().getText("viewGeralMensal");
						break;
					case 4:
						periodoTraduzido = that.getResourceBundle().getText("viewGeralBimestral");
						break;						
					case 5:
						periodoTraduzido = that.getResourceBundle().getText("viewGeralTrimestral");
						break;
					case 6:
						periodoTraduzido = that.getResourceBundle().getText("viewGeralSemestral");
						break;
					case 7:
						periodoTraduzido = that.getResourceBundle().getText("viewGeralAnual");
						break;
				}
				return periodoTraduzido;
			},
			
			traduzPeriodo: function (stringPeriodo, that){
				/*Recebe valores
				Semanal, Quinzenal,Trimestral,Mensal,Semestral,Anual
				*/
				
				var periodoTraduzido = "";
				switch (stringPeriodo){
					case "Weekly":
						periodoTraduzido = that.getResourceBundle().getText("viewGeralSemanal");
						break;
					case "Biweekly":
						periodoTraduzido = that.getResourceBundle().getText("viewGeralQuinzenal");
						break;
					case "Quarterly":
						periodoTraduzido = that.getResourceBundle().getText("viewGeralTrimestral");
						break;
					case "Monthly":
						periodoTraduzido = that.getResourceBundle().getText("viewGeralMensal");
						break;
					case "Biannual":
						periodoTraduzido = that.getResourceBundle().getText("viewGeralSemestral");
						break;
					case "Annual":
						periodoTraduzido = that.getResourceBundle().getText("viewGeralAnual");
						break;
					case "Bimonthly":
						periodoTraduzido = that.getResourceBundle().getText("viewGeralBimestral");
						break;						
				}
				return periodoTraduzido;
			},	
			
			traduzTiposAliquota: function (intTipoAliquota, that){
				/*Recebe valores
				Semanal, Quinzenal,Trimestral,Mensal,Semestral,Anual
				*/
				var traduzTipoAliquota = "";
				switch (intTipoAliquota){
					case 1:
						traduzTipoAliquota = that.getResourceBundle().getText("viewGeralPais");
						break;
					case 2:
						traduzTipoAliquota = that.getResourceBundle().getText("viewGeralEmpresa");
						break;
				}
				return traduzTipoAliquota;
			},		
			
			traduzPaisRegiao: function (intRegiao, that){
				/*Recebe valores
				Semanal, Quinzenal,Trimestral,Mensal,Semestral,Anual
				*/
				var periodoRegiaoTraduzido = "";
				switch (intRegiao){
					case 1:
						periodoRegiaoTraduzido = that.getResourceBundle().getText("viewPaisRegiaoTipo1");
						break;
					case 2:
						periodoRegiaoTraduzido = that.getResourceBundle().getText("viewPaisRegiaoTipo2");
						break;
					case 3:
						periodoRegiaoTraduzido = that.getResourceBundle().getText("viewPaisRegiaoTipo3");
						break;
					case 4:
						periodoRegiaoTraduzido = that.getResourceBundle().getText("viewPaisRegiaoTipo4");
						break;
					case 5:
						periodoRegiaoTraduzido = that.getResourceBundle().getText("viewPaisRegiaoTipo5");
						break;
					case 6:
						periodoRegiaoTraduzido = that.getResourceBundle().getText("viewPaisRegiaoTipo6");
						break;
					case 7:
						periodoRegiaoTraduzido = that.getResourceBundle().getText("viewPaisRegiaoTipo7");
						break;						
				}
				return periodoRegiaoTraduzido;
			},
			
			dateNowParaArquivo: function (){
				var Data = new Date();
				var fDataNoPadrao =  Data.getDate().toString().padStart(2,"0") + "_" +(Data.getMonth() +1).toString().padStart(2,"0") + "_" + Data.getFullYear().toString();
				return fDataNoPadrao;
			}			
		};
	}
	
);