function Router (appRouter, controller) {
	appRouter.get('/*', async (ctx, next) => {
		await controller.proxy(ctx, next);
	});
}

module.exports = Router;