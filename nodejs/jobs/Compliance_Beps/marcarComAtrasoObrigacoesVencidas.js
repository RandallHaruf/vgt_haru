'use strict';

const db = require('../../api/db.js');
const scheduler = require('node-schedule');

const marcarComAtrasoObrigacoesVencidas = () => {


};

module.exports = () => {
	/**
	 * https://crontab.guru/#0_23_*_*_*
	 * Todo dia as 23:00
	 **/
	scheduler.scheduleJob('0 23 * * *', marcarComAtrasoObrigacoesVencidas);

};