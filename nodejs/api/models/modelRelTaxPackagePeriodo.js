"use strict";
var db = require("../db");

var oModel = db.model("VGT.REL_TAX_PACKAGE_PERIODO", {
	colunas: {
		id: {
			nome: "id_rel_tax_package_periodo",
			identity: true
		},
		fkTaxPackage: {
			nome: "fk_tax_package.id_tax_package",
			number: true
		}, 
		fkPeriodo: {
			nome: "fk_periodo.id_periodo",
			number: true
		},
		indAtivo: {
			nome: "ind_ativo"
		},
		statusEnvio: {
			nome: "status_envio"
		},
		dataEnvio: {
			nome: "data_envio"
		}
	} 	
});

oModel.isPrimeiraRetificadora = function (idEmpresa, idAnoCalendario) {
	return new Promise((resolve, reject) => {
		var sQuery =	
			'select  '
				+ '(case ' 
					+ 'when ( '
						+ 'select count(*)  '
						+ 'from "VGT.REL_TAX_PACKAGE_PERIODO"  '
						+ 'inner join "VGT.PERIODO"  '
						+ 'on "fk_periodo.id_periodo" = "id_periodo"  '
						+ 'inner join "VGT.TAX_PACKAGE"  '
						+ 'on "fk_tax_package.id_tax_package" = "id_tax_package"  '
						+ 'where "fk_empresa.id_empresa" = ? '
						+ 'and "fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
						+ 'and "numero_ordem" = 6 '
						+ 'and "data_envio" is not null '
						/*( '
						+ 'select count(*) '
						+ 'from "VGT.REL_TAX_PACKAGE_PERIODO" '
						+ 'inner join "VGT.PERIODO" '
							+ 'on "fk_periodo.id_periodo" = "id_periodo" '
						+ 'inner join "VGT.TAX_PACKAGE" '
							+ 'on "fk_tax_package.id_tax_package" = "id_tax_package" '
						+ 'where  '
						+ '"fk_empresa.id_empresa" = ? '
						+ 'and "fk_dominio_ano_calendario.id_dominio_ano_calendario" = ?) '
					+ '+  (select count(*) '
						+ 'from "VGT.REL_TAX_PACKAGE_PERIODO" '
						+ 'inner join "VGT.PERIODO" '
							+ 'on "fk_periodo.id_periodo" = "id_periodo" '
						+ 'inner join "VGT.TAX_PACKAGE" '
							+ 'on "fk_tax_package.id_tax_package" = "id_tax_package" '
						+ 'where '
						+ '"fk_empresa.id_empresa" = ? '
						+ 'and "fk_dominio_ano_calendario.id_dominio_ano_calendario" = ? '
						+ 'and "ind_ativo" = false '
						+ 'and "data_envio" = null)*/
						+ ') = 0 ' 
						+ 'then true '
					+ 'else false '
				+ 'end) "ind_primeira_retificadora" '
			+ 'from "DUMMY"	 ',
			aParam = [idEmpresa, idAnoCalendario];
		
		db.executeStatement({
			statement: sQuery,
			parameters: aParam
		}, (err, result) => {
			if (err) {
				console.log(err);
				reject(new Error('Erro no método "isPrimeiraRetificadora" do model "RelTaxPackagePeriodo".\n' + err.message));
			}
			else {
				if (result && result.length) {
					resolve(result[0].ind_primeira_retificadora);
				}
				else {
					reject(new Error('Erro no método "isPrimeiraRetificadora" do model "RelTaxPackagePeriodo".\n' + JSON.stringify(result)));
				}
			}
		});
	});
};

module.exports =  oModel;