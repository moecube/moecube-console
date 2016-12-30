import Router = require('koa-router');
const router = new Router();

/* GET home page. */
router.get('/users', (ctx, next) => {
    ctx.body = 'Hello World';
});

router.post('/users/:id(\\d*)', async(ctx, next) => {
});
export default router;
