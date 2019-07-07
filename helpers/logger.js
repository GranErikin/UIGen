const bunyan = require('bunyan');
const fs = require('fs');

module.exports = bunyan.createLogger({
	name: 'OPTConvertionService',
	streams: [{
		stream: process.stdout,
		level: 'info'
	}, {
		stream: process.stderr,
		level: 'error'
	}]
});