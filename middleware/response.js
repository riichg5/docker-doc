
function responder () {
	return async (ctx, next) => {
		let responseInfo = ctx.getData('responseInfo');

		if(responseInfo) {
			ctx.response.set('content-type', 'text/html');
			ctx.body = responseInfo.body || {};
			ctx.response.status = responseInfo.statusCode;
		}

	};
}

module.exports = responder;