'use strict';

const CLAUSE_WHERE = 'CLAUSE_WHERE';
const CONDITIONAL_SUBJECT = 'CONDITIONAL_SUBJECT';
const CONDITIONAL_VALUE = 'CONDITIONAL_VALUE';
const OPERATOR_AND = 'OPERATOR_AND';
const OPERATOR_OR = 'OPERATOR_OR';

const QueryBuildHelper = function QueryBuildHelper ({ initialStatement = '', initialParams = [] } = {}) {
	this.statement = initialStatement;
	this.params = initialParams.slice();
	this.statementArray = [];
};

// QueryBuildHelper.prototype.select = function (aColuna) {
// 	let sColunas = '';
// 	if (aColuna && aColuna.length) {
// 		for (let i = 0, length = aColuna.length; i < length; i++) {
// 			let oColuna = aColuna[i];
// 			if (i !== 0) {
// 				sColunas += ', ';
// 			}

// 			sColunas += 
// 				oColuna.getNomeCompleto()
// 				+ ' "'
// 				+ (oColuna.getTabela()
// 					? oColuna.getTabela().getNome() !== oColuna.getAlias()
// 						? oColuna.getTabela().getAlias() + '.'
// 						: oColuna.getTabela().getNome() + '.'
// 					: '')
// 				+ (oColuna.getNome() !== oColuna.getAlias()
// 					? oColuna.getAlias()
// 					: oColuna.getNome())
// 				+ '" ';
// 		}
// 	} else {
// 		sColunas = ' * ';
// 	}
// 	this.statement += ' select ' + sColunas;
// 	return this;
// };

// QueryBuildHelper.prototype.from = function (tabela) {
// 	let sTabela = tabela instanceof Tabela ? tabela.getNomeCompleto() : tabela;
// 	this.statement += ' from ' + sTabela + ' ';
// 	return this;
// };

// QueryBuildHelper.prototype.innerJoin = function (tabela) {
// 	let sTabela = tabela instanceof Tabela ? tabela.getNomeCompleto() : tabela;
// 	this.statement += ' inner join ' + sTabela + ' ';
// 	return this;
// };

// QueryBuildHelper.prototype.on = function (coluna) {
// 	let sColuna = coluna instanceof Coluna ? coluna.getNomeCompleto() : coluna;
// 	this.statement += ' on ' + sColuna + ' ';
// 	return this;
// };

QueryBuildHelper.prototype.where = function (coluna) {
	let sColuna = coluna;
	this.statementArray.push({
		text: ' where ',
		type: CLAUSE_WHERE
	});
	this.statementArray.push({
		text: ' ' + sColuna + ' ',
		type: CONDITIONAL_SUBJECT
	});
	return this;
};

QueryBuildHelper.prototype.and = function (coluna) {
	let sColuna = coluna;
	this.statementArray.push({
		text: ' and ',
		type: OPERATOR_AND
	});
	this.statementArray.push({
		text: ' (' + sColuna + ') ',
		type: CONDITIONAL_SUBJECT
	});
	return this;
};

QueryBuildHelper.prototype.or = function (coluna) {
	let sColuna = coluna;
	this.statementArray.push({
		text: ' or ',
		type: OPERATOR_OR
	});
	this.statementArray.push({
		text: ' (' + sColuna + ') ',
		type: CONDITIONAL_SUBJECT
	});
	return this;
};

// QueryBuildHelper.prototype.equals = function (valor) {
// 	let sValor = valor;
// 	this.statement += ' = ' + sValor + ' ';
// 	return this;
// };

// QueryBuildHelper.prototype.notEquals = function (valor) {
// 	let sValor = valor;
// 	this.statement += ' != ' + sValor + ' ';
// 	return this;
// };

QueryBuildHelper.prototype.in = function (valor = []) {
	let sText = '',
		arr = (valor instanceof Array) ? valor : valor.split(',');
	
	if (arr.length) {
		 sText =  ' in (';
		for (var i = 0, length = arr.length; i < length; i++) {
			if (i !== 0) {
				sText += ' , ';	
			}
			sText += ' ? ';
			this.params.push(arr[i]);
		}
		sText += ' ) ';
	}
	
	this.statementArray.push({
		text: ' ' + sText + ' ',
		type: CONDITIONAL_VALUE
	});
	
	return this;
};

QueryBuildHelper.prototype.getStatement = function () {
	let stm = this.statement,
		stmArray = this.statementArray;
	
	var comecouWhere = false,
		sWhere = '';
	
	for (var i = 0, length = stmArray.length; i < length; i++) {
		var item = stmArray[i];
		
		if (comecouWhere) {
			let previousItem = stmArray[i - 1],
				nextItem = stmArray[i + 1];
				
			if (item.type === CONDITIONAL_SUBJECT && nextItem && nextItem.type === CONDITIONAL_VALUE && nextItem.text.trim()) {
				let operator = '';
				
				if (previousItem.type !== CLAUSE_WHERE && sWhere) {
					operator = previousItem.text;
				}
				
				sWhere += (operator + item.text + nextItem.text);
			}
		}
		
		if (item.type === CLAUSE_WHERE) {
			comecouWhere = true;
		}
	}
	
	if (sWhere) {
		stm += ' where ' + sWhere;
	}
	
	return stm;
};

QueryBuildHelper.prototype.getParameters = function () {
	return this.params.slice();
};

module.exports = QueryBuildHelper;