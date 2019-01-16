'use strict';

const utils = {
	getAvailableFields: (model, aReceivedParam) => {
		let aKey = Object.keys(aReceivedParam),
			aField = Object.keys(model.colunas),
			aParam = [];
	
		for (let i = 0, length = aField.length; i < length; i++) {
			let sField = aField[i],
				sKey = aKey.find((key) => key.toLowerCase() === sField.toLowerCase());
	
			if (sKey) {
				aParam.push({
					coluna: model.colunas[sField],
					valor: aReceivedParam[sKey]
				});
			}
		}
	
		return aParam;
	},
	
	getIdentityFields: (model) => {
		let aField = Object.keys(model.colunas),
			aParam = [];
	
		for (let i = 0, length = aField.length; i < length; i++) {
			if (model.colunas[aField[i]].identity) {
				aParam.push({
					coluna: model.colunas[aField[i]]
				});
			}
		}
	
		return aParam;
	},
	
	getKeyFieldsInParams: (model, aReceivedParam) => {
		let aParam = [],
			iEntryKeyCounter = 0;
	
		let aField = Object.keys(model.colunas);
	
		for (let i = 0, length = aField.length; i < length; i++) {
			if (model.colunas[aField[i]].key) {
				aParam.push({
					coluna: model.colunas[aField[i]],
					valor: aReceivedParam[iEntryKeyCounter > 0 ? "idRegistro" + iEntryKeyCounter : "idRegistro"]
				});
	
				iEntryKeyCounter++;
			}
		}
	
		return aParam;
	}
};

module.exports = utils;