global._base = __dirname + "/";
require('./lib/init');
const Koa = require('koa');
const path = require('path');
// const Router = require('koa-router');
// const initRouter = require('./router');
// const controller = require('./controller');
const middleware = require('./middleware');
const serve = require('koa-static');

let app = new Koa();

app.use(async (ctx, next) => {
	const start = Date.now();

	ctx.setData = (opts) => {
		_utils.setContextData(_.merge({ctx: ctx}, opts));
	};

	ctx.getData = (key) => {
		return _utils.getContextData({ctx, key});
	};

	await next();

	const ms = Date.now() - start;
	ctx.set('X-Response-Time', `${ms}ms`);
	const rt = ctx.response.get('X-Response-Time');
	console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

app.use(middleware.logger());
app.use(middleware.staticResource());

app.use(async (ctx, next) => {
	if(ctx.getData('isNeedProxy') !== true) {
		return serve(path.join(__dirname, './public'))(ctx, next);
	} else {
		await next();
	}
});


app.use(middleware.proxy());

// let apiRouter = new Router();

// initRouter(apiRouter, controller);

// app.use(apiRouter.routes())
//    .use(apiRouter.allowedMethods());

// app.use(middleware.response());

app.listen(3000);