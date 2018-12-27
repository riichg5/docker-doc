const bunyan = require('bunyan');
global._ = require('lodash');

// global._logger = require('./initLogger');
global._utils = require(_base + 'lib/utils');
require(_base + 'const');
global._util = require('util');

console.info('start init logger ...');
let logger = bunyan.createLogger({
    name: CONST.appName,
    level: CONST.LogLevel,
    pid: process.pid,
    src: _.eq(process.env.NODE_ENV, 'production') ? false : true
    // worker : cluster && cluster.worker && cluster.worker.id || ''
});

// Redirect console logging methods to logger
console.error = logger.error.bind(logger);
console.warn = logger.warn.bind(logger);
console.info = logger.info.bind(logger);
console.log = logger.debug.bind(logger);
console.trace = logger.trace.bind(logger);
console.info('finish init logger');
