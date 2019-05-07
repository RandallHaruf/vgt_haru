const db = require('../api/db');

function isString (value) {
	return (typeof value === 'string' || myVar instanceof String);
};	

/*
// Single value
appConfig.get(appConfig.EMAIL_QUE_ENVIA)
	.then((value) => {
		console.log(value); // prints "example@example.com"
	})
	.catch((err) => {
		console.log(err);
	});
	
// Multiple values
appConfig.get([
	appConfig.EMAIL_QUE_ENVIA, 
	appConfig.SENHA_EMAIL_QUE_ENVIA
]).then((values) => {
	console.log(values[appConfig.EMAIL_QUE_ENVIA]); // prints "example@example.com"
	console.log(values[appConfig.SENHA_EMAIL_QUE_ENVIA]); // prints "mypassword"
})
.catch((err) => {
	console.log(err);
});
*/

module.exports = {
	EMAIL_QUE_ENVIA: "emailQueEnvia",
	SENHA_EMAIL_QUE_ENVIA: "senhaEmailQueEnvia",
	get: (keys) => {
		return new Promise((resolve, reject) => {
			if (keys instanceof Array) {
				let statement = 'select "chave", "valor" from "VGT.APP_CONFIG" where "chave" in (',
					params = [];
				
				for (let i = 0, length = keys.length; i < length; i++) {
					if (i !== 0) {
						statement += ',';
					}
					statement += '?';
					
					params.push(keys[i]);
				}
				
				statement += ')';
				
				db.executeStatement({
					statement: statement,
					parameters: params
				}, (err, result) => {
					if (err) {
						console.log(err);
						reject(new Error(err.message));
					}
					else {
						if (result && result.length) {
							if (result.length !== keys.length) {
								reject(new Error('Uma ou mais chave(s) não encontrada(s)'));
							}
							else {
								let retorno = {};
								
								for (let i = 0, length = result.length; i < result; i++) {
									retorno[result[i].chave] = result[i].valor;
								}
								
								resolve(retorno);	
							}
						}
						else {
							reject(new Error('Chave(s) não encontrada(s)'));
						}
					}
				});
			}
			else if (isString(keys)) {
				db.executeStatement({
					statement: 'select "valor" from "VGT.APP_CONFIG" where "chave" like ?',
					parameters: [keys]
				}, (err, result) => {
					if (err) {
						console.log(err);
						reject(new Error(err.message));
					}
					else {
						if (result && result.length) {
							resolve(result[0].valor);	
						}
						else {
							reject(new Error('Chave não encontrada'));
						}
					}
				});		
			}
			else {
				reject(new Error('Parâmetro "keys" não é de um tipo suportado'));
			}
		});
	}	
};