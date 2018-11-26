sap.ui.define(
	[],
	function () {
		return {
			validarFormularioAdmin: function (oParametros) {
				var sMensagem = "";
				
				var campoObrigatorioVazio = false,
					periodoInvalido = false,
					emailInvalido = false;
				
				/**
				 * Valida os campos que devem ter preenchimento obrigatório
				 */ 
				if (oParametros.aInputObrigatorio) {
					jQuery.each(oParametros.aInputObrigatorio, function (index, element) {
						if (element.value.trim() === "") {
							campoObrigatorioVazio = true;
						}
					});
				}
				
				if (oParametros.aDropdownObrigatorio) {
					jQuery.each(oParametros.aDropdownObrigatorio, function (index, element) {
						if (!element.getSelectedKey()) {
							campoObrigatorioVazio = true;
						}	
					});
				}
				
				/**
				 * Valida um período de data 
				 */ 
				if (oParametros.oPeriodoObrigatorio) {
					periodoInvalido = this.periodoInvalido(oParametros.oPeriodoObrigatorio.dataInicio.getDateValue(), oParametros.oPeriodoObrigatorio.dataFim.getDateValue());
				}
				
				/**
				 * Valida campo email
				 */ 
				if (oParametros.sEmail) {
					emailInvalido = oParametros.sEmail !== "" && !this.emailValido(oParametros.sEmail);
				}
				
				/**
				 * Verifica se houve alguma falha de validação
				 */ 
				if (campoObrigatorioVazio) {
					sMensagem += "- Os campos destacados são de preenchimento obrigatório\n";
				}
				
				if (periodoInvalido) {
					sMensagem += "- A Data Início não pode ser posterior a Data Fim\n";
				}
				
				if (emailInvalido) {
					sMensagem += "- O email inserido não é válido\n";
				}
				
				// Retorna a mensagem de erro
				return {
					mensagem: sMensagem,
					formularioValido: sMensagem === ""
				};
			},
			
			periodoInvalido: function (dataInicio, dataFim) {
				return dataInicio && dataFim && dataInicio >= dataFim;
			},
			
			emailValido: function (sEmail) {
				var regex = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/;
    			return regex.test(sEmail);
			},
			
			isNumber: function (n) {
			    return !isNaN(parseFloat(n)) && isFinite(n);
			}
		};
	}
);