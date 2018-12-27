"use strict";

var db = require("../db");
var model = require("../models/modelRequisicaoReabertura");
var disparaEmail = require("../../jobs/sendEmails");

function inserirRequisicao(oConnection, sDataRequisicao, sIdUsuario, sNomeUsuario, sJustificativa, sResposta, sStatus, sIdEmpresa,
	sIdPeriodo, sNomeEmpresa) {
	// Inclui a requisição nova
	var aParams = [sDataRequisicao, sIdUsuario, sNomeUsuario, sJustificativa, sResposta, sStatus, sIdEmpresa, sIdPeriodo],
		sQuery = ' INSERT INTO ' + ' "VGT.REQUISICAO_REABERTURA" ' +
		' VALUES("identity_VGT.REQUISICAO_REABERTURA_id_requisicao_reabertura".nextval, ?, ?, ?, ?, ?, ?, ?, ?) ';

	model.executeSync(sQuery, aParams, {
		connection: oConnection
	});

	/*
	// EMAIL DE AVISO PARA SOLICITACAO DE REABERTURA DE TRIMESTRE TTC
	let vSubj = 'TTC - Period Reopening – ' + sNomeEmpresa + ' - Quarter';
	let vHtml =	'<!DOCTYPE html><html><body><p>Dear Administrator,<br><br>A user is requesting to reopen a closed period in the TTC module at Vale Global Tax (VGT) – inserir hyperlink– Your approval is required<br><br>Thank you in advance.<br><br>Global Tax Team</p></body></html>';

	disparaEmail.sendEmail({
		to: "fms.catarino@gmail.com",
		subject: vSubj,
		body: {
			isHtml: true,
			content: vHtml
		}
	}, function (vSuc) {
		console.log('OKK = ' + vSuc);
	}, function (vErr) {
		console.log('ERROR = ' + vErr);
	});
	*/
}

module.exports = {

	listarRegistros: function (req, res) {
		/*var aParametros = [];
		
		if (req.query.empresa) {
			aParametros.push({
				coluna: model.colunas.fkEmpresa,
				valor: req.body.id_empresa ? req.body.id_empresa : null
			},
			{
				coluna: model.colunas.fkEmpresa,
				valor: req.body.id_empresa ? req.body.id_empresa : null
			}
			);
		} */
		model.listar([], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	criarRegistro: function (req, res) {
		if (req.body.pagamentos) {
			var sDataRequisicao = req.body.dataRequisicao,
				sIdUsuario = req.body.idUsuario,
				sNomeUsuario = req.body.nomeUsuario,
				sJustificativa = req.body.justificativa,
				sResposta = req.body.resposta,
				sStatus = req.body.fkDominioRequisicaoReaberturaStatus,
				sIdEmpresa = req.body.fkEmpresa,
				sIdPeriodo = req.body.fkPeriodo,
				sNomeEmpresa = req.body.nomeEmpresa;

			var response = {
				success: true
			};

			var oConnection;

			try {
				oConnection = db.getConnection();
				oConnection.setAutoCommit(false);

				inserirRequisicao(oConnection, sDataRequisicao, sIdUsuario, sNomeUsuario, sJustificativa, sResposta, sStatus, sIdEmpresa, sIdPeriodo);

				oConnection.commit();
			} catch (e) {
				console.log(e);
				response.success = false;
				response.error = e;
				if (oConnection) {
					oConnection.rollback();
				}
			} finally {
				if (oConnection) {
					oConnection.setAutoCommit(true);
					oConnection.close();
				}
			}

			res.send(JSON.stringify(response));
		} else {
			var aParams = [{
				coluna: model.colunas.id
			}, {
				coluna: model.colunas.dataRequisicao,
				valor: req.body.dataRequisicao ? req.body.dataRequisicao : null
			}, {
				coluna: model.colunas.idUsuario,
				valor: req.body.idUsuario ? Number(req.session.usuario.id) : null
			}, {
				coluna: model.colunas.nomeUsuario,
				valor: req.body.nomeUsuario ? req.session.usuario.nome : null
			}, {
				coluna: model.colunas.justificativa,
				valor: req.body.justificativa ? req.body.justificativa : null
			}, {
				coluna: model.colunas.resposta,
				valor: req.body.resposta ? req.body.resposta : null
			}, {
				coluna: model.colunas.fkDominioRequisicaoReaberturaStatus,
				valor: req.body.fkDominioRequisicaoReaberturaStatus ? Number(req.body.fkDominioRequisicaoReaberturaStatus) : null
			}, {
				coluna: model.colunas.fkEmpresa,
				valor: req.body.fkEmpresa ? Number(req.body.fkEmpresa) : null
			}, {
				coluna: model.colunas.fkPeriodo,
				valor: req.body.fkPeriodo ? Number(req.body.fkPeriodo) : null
			}];

			model.inserir(aParams, function (err, result) {
				if (err) {
					res.send(JSON.stringify(err));
				} else {
					res.send(JSON.stringify(result));
				}
			});
		}
	},

	lerRegistro: function (req, res) {
		model.listar([{
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	atualizarRegistro: function (req, res) {

		var oCondition = {
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		};

		var aParams = [{
			coluna: model.colunas.dataRequisicao,
			valor: req.body.dataRequisicao ? req.body.dataRequisicao : null
		}, {
			coluna: model.colunas.idUsuario,
			valor: req.body.idUsuario ? Number(req.body.idUsuario) : null
		}, {
			coluna: model.colunas.nomeUsuario,
			valor: req.body.nomeUsuario ? req.body.nomeUsuario : null
		}, {
			coluna: model.colunas.justificativa,
			valor: req.body.justificativa ? req.body.justificativa : null
		}, {
			coluna: model.colunas.resposta,
			valor: req.body.resposta ? req.body.resposta : null
		}, {
			coluna: model.colunas.fkDominioRequisicaoReaberturaStatus,
			valor: req.body.fkDominioRequisicaoReaberturaStatus ? Number(req.body.fkDominioRequisicaoReaberturaStatus) : null
		}, {
			coluna: model.colunas.fkEmpresa,
			valor: req.body.fkEmpresa ? Number(req.body.fkEmpresa) : null
		}, {
			coluna: model.colunas.fkPeriodo,
			valor: req.body.fkPeriodo ? Number(req.body.fkPeriodo) : null
		}];

		model.atualizar(oCondition, aParams, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				
				// Atualiza o periodo caso tenha sido aprovação do admin
				if (req.body.reabrirPeriodo && req.body.fkDominioRequisicaoReaberturaStatus && Number(req.body.fkDominioRequisicaoReaberturaStatus) === 2) { 
					var sQuery = 'update "VGT.REL_EMPRESA_PERIODO" set "ind_ativo" = ?, "ind_enviado" = ? where "fk_empresa.id_empresa" = ? and "fk_periodo.id_periodo" = ? ';
					var aParam = [true, false, req.body.fkEmpresa, req.body.fkPeriodo];
					
					db.executeStatement({
						statement: sQuery,
						parameters: aParam
					}, function (err2) {
						if (err2) {
							console.log(err2);
						}
					});
				}
				
				res.send(JSON.stringify(result));
			}
		});
	},

	excluirRegistro: function (req, res) {
		model.excluir([{
			coluna: model.colunas.id,
			valor: req.params.idRegistro
		}], function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	},

	deepQuery: function (req, res) {
		var sStatement =
			' SELECT ReqReab.*, ReqStatus.*, Empresa.*, Per.*, Ano_Cal.*  ' 
			+ ' FROM "VGT.REQUISICAO_REABERTURA" ReqReab ' 
			+ ' Left Outer Join "VGT.DOMINIO_REQUISICAO_REABERTURA_STATUS" ReqStatus ' 
			+ ' On ReqReab."fk_dominio_requisicao_reabertura_status.id_dominio_requisicao_reabertura_status" = ReqStatus."id_dominio_requisicao_reabertura_status" ' 
			+ ' Left Outer Join "VGT.EMPRESA" Empresa ' 
			+ ' On ReqReab."fk_empresa.id_empresa" = empresa."id_empresa" ' 
			+ ' Left Outer Join "VGT.PERIODO" Per ' 
			+ ' On ReqReab."fk_periodo.id_periodo" = per."id_periodo" ' 
			+ ' Left Outer Join "VGT.DOMINIO_ANO_CALENDARIO" Ano_Cal ' 
			+ ' On Per."fk_dominio_ano_calendario.id_dominio_ano_calendario" = Ano_Cal."id_dominio_ano_calendario" ';

		var oWhere = [];
		var aParams = [];

		if (req.query.empresa) {
			oWhere.push(' empresa."id_empresa" = ? ');
			aParams.push(req.query.empresa);
		}

		if (req.query.status) {
			oWhere.push(' ReqStatus."id_dominio_requisicao_reabertura_status" = ? ');
			aParams.push(req.query.status);
		}

		if (oWhere.length > 0) {
			sStatement += "where ";

			for (var i = 0; i < oWhere.length; i++) {
				if (i !== 0) {
					sStatement += " and ";
				}
				sStatement += oWhere[i];
			}
		}

		//sStatement += ' Order By empresa."nome"';

		model.execute({
			statement: sStatement,
			parameters: aParams
		}, function (err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		});
	}
};