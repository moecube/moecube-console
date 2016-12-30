/**
 * Created by weijian on 2016/12/29.
 */

import Router = require('koa-router');
import {NotFound} from '../koa/errors';
import {Package} from '../models/package';
const router = new Router();

router.get('/packages/:id', async(ctx, next) => {
    let p: Package|null = await Package.findOne({id: ctx.params.id});
    if (!p) {
        throw new NotFound(`Package id ${ctx.params.id} not found`);
    }
    ctx.body = p;
});
router.post('/packages/:id', async(ctx, next) => {
    let p = new Package(ctx.request.body);
    console.log(p, p.version);
});
export default router;
