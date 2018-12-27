const translate = require('translate-api');
let httpProxy = require('http-proxy');
const rp = require('request-promise');
let url = require('url');
let fs = require('fs');
let mkdirp = require('mkdirp');

let pMkdirp = _util.promisify(mkdirp);
let proxyWeb = _util.promisify(new httpProxy.createProxyServer().web);
let pExists = _util.promisify(fs.exists);


async function proxyHandler (ctx, next) {
    let request = ctx.request;
    let response = ctx.response;
    let logger = ctx.logger;

    // ctx.logger.debug(`bunyan work!`);
    // ctx.body = 'I love you !';
    logger.debug(`url: ${request.url}`);

    // let htmlStr = await translate.getPage(`${CONST.ProxyDomain}/${request.url}`);

    try {
        await proxyWeb(request.socket, response.socket, {
            target: CONST.ProxyDomain
        });
    } catch (error) {
        logger.error(`proxy error ${request.url}: ${error.message}, stack: ${error.stack}`);
    }

    await next();

    return;
}

module.exports = proxyHandler;