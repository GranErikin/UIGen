const bunyan = require('bunyan');
const fs = require('fs');

fs.existsSync('logs') || fs.mkdirSync('logs');

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