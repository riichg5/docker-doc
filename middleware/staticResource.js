const url = require('url');
// const path = require('path');
const fs = require('fs');
const util = require('util');

let isExistFile = util.promisify(fs.exists);

function middleware () {
	return async (ctx, next) => {
		//判断是否需要走后面的代理获取
		// let logger = ctx.logger;
		// let urlInfo = url.parse(ctx.request.url);
		// let pathInfo = path.parse(urlInfo.pathname);

		let pathName = _utils.getPathName(ctx.request.url);
		let isExist = await isExistFile(pathName);

		if(isExist) {
			ctx.logger.info(`pathName: ${pathName}, isExist: ${isExist}`);
			ctx.setData({
				key: 'isNeedProxy',
				data: false
			});
		} else {
			ctx.logger.warn(`pathName: ${pathName}, isExist: ${isExist}`);
			ctx.setData({
				key: 'isNeedProxy',
				data: true
			});
		}

		await next();
	};
}

module.exports = middleware;