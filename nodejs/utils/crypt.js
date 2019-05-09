"use strict";
var crypto = require('crypto');
var algorithm = 'aes-256-gcm';
const key = "ekfe8432FdFWEF48Ofi03228rfnoHZry";
const iv = "G02Dpoeg85Lq";
module.exports = {
	encrypt: function (text) {
		var cipher = crypto.createCipheriv(algorithm, key, iv);
		var encrypted = cipher.update(text, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		var tag = cipher.getAuthTag();
		return JSON.stringify({
		  content: encrypted,
		  tag: tag
		});
	},
	decrypt: function (encrypted) {
		encrypted = JSON.parse(encrypted);
		var decipher = crypto.createDecipheriv(algorithm, key, iv);
		decipher.setAuthTag(Buffer.from(encrypted.tag, "utf8"));
		var dec = decipher.update(encrypted.content, 'hex', 'utf8');
		dec += decipher.final('utf8');
		return dec;
	}
}