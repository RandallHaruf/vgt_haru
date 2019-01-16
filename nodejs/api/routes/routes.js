"use strict";

const fs = require('fs');
const pathModule = require('path');

const loadRoutes = (path, aRoutes) => {
    let stat = fs.lstatSync(path);
    if (stat.isDirectory()) {
        let aFile = fs.readdirSync(path);
        let f, l = aFile.length;
        for (let i = 0; i < l; i++) {
            f = pathModule.join(path, aFile[i]);
            loadRoutes(f, aRoutes);
        }
    }
    else {
    	if (!path.includes('routes.js')) {
	        require(pathModule.resolve(path))(aRoutes);
    	}
    }
};

module.exports = function (app) {
	var aRoutes = [];
	
	loadRoutes(__dirname, aRoutes);
	
	app.use("/node", aRoutes);
	
	/*var routeArquivo = require("./routeArquivo");
	var routeDeclaracao = require("./routeDeclaracao");
	var routeTTC = require("./routeTTC");
	var routePais = require("./routePais");
	var routeEmpresa = require("./routeEmpresa");
	var routeAliquota = require("./routeAliquota");
	var routeDiferencaOpcao = require("./routeDiferencaOpcao"); 
	var routeNameOfTax = require("./routeNameOfTax");
	var routeTax = require("./routeTax");
	var routeTaxCategory = require("./routeTaxCategory");
	var routeItemToReport = require("./routeItemToReport");
	var routeObrigacaoAcessoria = require("./routeObrigacaoAcessoria");
	var routePagamento = require("./routePagamento");
	var routeDomTipoTransacao = require("./routeDomTipoTransacao");
	var routeDomMoeda = require("./routeDomMoeda");
	var routeDomAnoFiscal = require("./routeDomAnoFiscal");
	var routeDomJurisdicao = require("./routeDomJurisdicao");
	var routeDomPais = require("./routeDomPais");
	var routeDomAnoCalendario = require("./routeDomAnoCalendario");
	var routeDomPaisStatus = require("./routeDomPaisStatus");
	var routeDomPaisRegiao = require("./routeDomPaisRegiao");
	var routeDomAliquotaTipo = require("./routeDomAliquotaTipo");
	var routeDomDiferencaTipo = require("./routeDomDiferencaTipo");
	var routeDomTaxClassification = require("./routeDomTaxClassification");
	var routeDomObrigacaoAcessoriaTipo = require("./routeDomObrigacaoAcessoriaTipo");
	var routeDomEmpresaStatus = require("./routeDomEmpresaStatus");
	var routeDomEmpresaTipoSocietario = require("./routeDomEmpresaTipoSocietario");
	var routeHSPaisAliquota = require("./routeHSPaisAliquota");
	var routeHSEmpresaAliquota = require("./routeHSEmpresaAliquota");
	var routeRelPaisNameOfTax = require("./routeRelPaisNameOfTax");
	var routeRelEmpresaObrigacaoAcessoria = require("./routeRelEmpresaObrigacaoAcessoria");
	var routeRelEmpresaPeriodo = require("./routeRelEmpresaPeriodo");
	var routeRelTaxPackagePeriodo = require("./routeRelTaxPackagePeriodo");
	var routeRelRespostaItemToReportAnoFiscal = require("./routeRelRespostaItemToReportAnoFiscal");
	var routeCambioTTC = require("./routeCambioTTC");
	var routeTaxPackage = require("./routeTaxPackage");
	var routeRequisicaoReabertura = require("./routeRequisicaoReabertura");
	var routeRequisicaoReaberturaStatus = require("./routeRequisicaoReaberturaStatus");
	var routeRespostaItemToReport = require("./routeRespostaItemToReport");
	var routeSchedule = require("./routeSchedule");
	var routeObrigacao = require("./routeObrigacao");
	var routeDomPeriodicidadeObrigacao = require("./routeDomPeriodicidadeObrigacao");
	var routeUsuario = require("./routeUsuario");
	var routeReportTTC = require("./routeReportTTC");
	var routeTaxReconciliation = require("./routeTaxReconciliation");
	var routeDominioStatusObrigacao = require("./routeDominioStatusObrigacao");
	var routeReportObrigacao = require("./routeReportObrigacao");
	var routeTaxaMultipla = require("./routeTaxaMultipla");
	var routeRequisicaoReaberturaTaxPackage = require("./routeRequisicaoReaberturaTaxPackage");
	var routeEmailSend = require("./routeEmailSend");
	var routeAntecipacao = require("./routeAntecipacao");
	var routeDiferenca = require("./routeDiferenca");
	var routeReportTaxPackage = require("./routeReportTaxPackage");
	var routeModeloObrigacao = require("./routeModeloObrigacao");
	var routeObrigacaoStatus = require("./routeObrigacaoStatus");
	var routeRelModeloEmpresa = require("./routeRelModeloEmpresa");
	var routeRespostaObrigacao = require("./routeRespostaObrigacao");
	var routeDocumentoObrigacao = require("./routeDocumentoObrigacao");
	var routeDocumento = require("./routeDocumento");
	var routeRequisicaoEncerramentoPeriodoTaxPackage = require("./routeRequisicaoEncerramentoPeriodoTaxPackage");
	var routeDominioAcessoUsuario = require("./routeDominioAcessoUsuario");
	var routeDominioModulo = require("./routeDominioModulo");
	var routeUsuarioModulo = require("./routeUsuarioModulo");
	
	var aRoutes = [];	
	
	routeArquivo(aRoutes);
	routeDeclaracao(aRoutes);
	routeTTC(aRoutes);
	routePais(aRoutes);
	routeEmpresa(aRoutes);
	routeAliquota(aRoutes);
	routeDiferencaOpcao(aRoutes);
	routeNameOfTax(aRoutes);
	routeTax(aRoutes);
	routeTaxCategory(aRoutes);
	routeItemToReport(aRoutes);
	routeObrigacaoAcessoria(aRoutes);
	routePagamento(aRoutes);
	routeDomTipoTransacao(aRoutes);
	routeDomMoeda(aRoutes);
	routeDomAnoFiscal(aRoutes);
	routeDomJurisdicao(aRoutes);
	routeDomPais(aRoutes);
	routeDomAnoCalendario(aRoutes);
	routeDomPaisStatus(aRoutes);
	routeDomPaisRegiao(aRoutes);
	routeDomAliquotaTipo(aRoutes);
	routeDomDiferencaTipo(aRoutes);
	routeDomTaxClassification(aRoutes);
	routeDomObrigacaoAcessoriaTipo(aRoutes);
	routeDomEmpresaStatus(aRoutes);
	routeDomEmpresaTipoSocietario(aRoutes);
	routeHSPaisAliquota(aRoutes);
	routeHSEmpresaAliquota(aRoutes);
	routeRelPaisNameOfTax(aRoutes);
	routeRelEmpresaObrigacaoAcessoria(aRoutes);
	routeRelEmpresaPeriodo(aRoutes);
	routeRelTaxPackagePeriodo(aRoutes);
	routeCambioTTC(aRoutes);
	routeTaxPackage(aRoutes);
	routeRequisicaoReabertura(aRoutes);
	routeRequisicaoReaberturaStatus(aRoutes);
	routeRespostaItemToReport(aRoutes);
	routeRelRespostaItemToReportAnoFiscal(aRoutes);
	routeSchedule(aRoutes);
	routeObrigacao(aRoutes);
	routeDomPeriodicidadeObrigacao(aRoutes);
	routeUsuario(aRoutes);
	routeReportTTC(aRoutes);
	routeTaxReconciliation(aRoutes);
	routeDominioStatusObrigacao(aRoutes);
	routeReportObrigacao(aRoutes);
	routeTaxaMultipla(aRoutes);
	routeRequisicaoReaberturaTaxPackage(aRoutes);
	routeEmailSend(aRoutes);
	routeAntecipacao(aRoutes);
	routeDiferenca(aRoutes);
	routeReportTaxPackage(aRoutes);
	routeModeloObrigacao(aRoutes);
	routeObrigacaoStatus(aRoutes);
	routeRelModeloEmpresa(aRoutes);
	routeRespostaObrigacao(aRoutes);
	routeDocumentoObrigacao(aRoutes);
	routeDocumento(aRoutes);
	routeRequisicaoEncerramentoPeriodoTaxPackage(aRoutes);
	routeDominioAcessoUsuario(aRoutes);
	routeDominioModulo(aRoutes);
	routeUsuarioModulo(aRoutes);*/
};