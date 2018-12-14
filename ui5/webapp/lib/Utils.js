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
			bancoParaJsDate: function (dataString){
				//PASSAR DIRETO DO BANCO NO FORMATO "yyyy-MM-dd"
				var DataFinal = new Date(dataString.substring(0,4),dataString.substring(5,7)-1,dataString.substring(8,10));
				return DataFinal;
			},
			traduzPeriodo: function (stringPeriodo, that){
				/*Recebe valores
				Semanal, Quinzenal,Trimestral,Mensal,Semestral,Anual
				*/
				var periodoTraduzido = "";
				switch (stringPeriodo){
					case "Semanal":
						periodoTraduzido = that.getResourceBundle().getText("viewGeralSemanal");
						break;
					case "Quinzenal":
						periodoTraduzido = that.getResourceBundle().getText("viewGeralQuinzenal");
						break;
					case "Trimestral":
						periodoTraduzido = that.getResourceBundle().getText("viewGeralTrimestral");
						break;
					case "Mensal":
						periodoTraduzido = that.getResourceBundle().getText("viewGeralMensal");
						break;
					case "Semestral":
						periodoTraduzido = that.getResourceBundle().getText("viewGeralSemestral");
						break;
					case "Anual":
						periodoTraduzido = that.getResourceBundle().getText("viewGeralAnual");
						break;
				}
				return periodoTraduzido;
			},			
			dateNowParaArquivo: function (){
				var Data = new Date();
				var fDataNoPadrao =  Data.getDate().toString().padStart(2,"0") + "_" +(Data.getMonth() +1).toString().padStart(2,"0") + "_" + Data.getFullYear().toString();
				return fDataNoPadrao;
			}			
		};
	}
	
);