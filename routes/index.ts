import Router = require('koa-router');
const router = new Router();

/* GET home page. */
router.get('/', (ctx, next) => {
    ctx.body = 'Hello World';
});

export default router;
