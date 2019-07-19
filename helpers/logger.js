const bunyan = require('bunyan');

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