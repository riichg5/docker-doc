const bunyan = require('bunyan');
let logger = null;

function middleware () {
	return async (ctx, next) => {
		if(!logger) {
			logger = bunyan.createLogger({
			    name: CONST.appName,
			    level: CONST.LogLevel,
			    pid: process.pid,
			    src: _.eq(process.env.NODE_ENV, 'production') ? false : true
			    // worker : cluster && cluster.worker && cluster.worker.id || ''
			});
		}

		ctx.logger = logger;

		await next();
	};
}

module.exports = middleware;